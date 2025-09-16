(function () {
  const form = document.getElementById("credit-form");
  const resultEl = document.getElementById("credit-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  function formatMonths(months) {
    if (!Number.isFinite(months) || months <= 0) {
      return "Already paid";
    }
    const years = Math.floor(months / 12);
    const leftover = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (leftover > 0) parts.push(`${leftover} mo${leftover > 1 ? "s" : ""}`);
    return parts.join(" ") || "<1 mo";
  }

  function simulate(balance, rate, paymentAmount, charges, minFloor) {
    let currentBalance = balance;
    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const maxMonths = 600;
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    let stalled = false;
    let noProgress = 0;
    let firstMonthInterest = 0;

    while (months < maxMonths) {
      if (currentBalance <= 0.01) break;
      months += 1;
      const startingBalance = currentBalance;
      currentBalance += charges;
      const interest = currentBalance * monthlyRate;
      currentBalance += interest;
      if (months === 1) firstMonthInterest = interest;
      totalInterest += interest;

      let payment = Math.max(paymentAmount, minFloor);
      if (payment > currentBalance) payment = currentBalance;
      currentBalance -= payment;
      totalPaid += payment;

      if (currentBalance >= startingBalance - 0.01 && interest + charges >= payment - 0.01) {
        noProgress += 1;
      } else {
        noProgress = 0;
      }

      if (noProgress >= 6) {
        stalled = true;
        break;
      }
    }

    if (currentBalance > 0.01 && months >= maxMonths) {
      stalled = true;
    }

    return {
      months,
      totalInterest,
      totalPaid,
      stalled,
      endingBalance: currentBalance,
      firstMonthInterest,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();

    const balance = parseFloat(form.balance.value || "0");
    const rate = parseFloat(form.rate.value || "0");
    const payment = parseFloat(form.payment.value || "0");
    const extra = parseFloat(form.extra.value || "0");
    const charges = parseFloat(form.charges.value || "0");
    const minimum = parseFloat(form.minimum.value || "0");

    if (!Number.isFinite(balance) || balance <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a credit card balance above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      resultEl.innerHTML = `<section class="card"><p>APR must be zero or higher.</p></section>`;
      return;
    }

    if (!Number.isFinite(payment) || payment <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Monthly payment must be greater than zero.</p></section>`;
      return;
    }

    const basePayment = payment;
    const withExtraPayment = payment + (Number.isFinite(extra) && extra > 0 ? extra : 0);
    const monthlyCharges = Number.isFinite(charges) && charges > 0 ? charges : 0;
    const floor = Number.isFinite(minimum) && minimum > 0 ? minimum : 0;

    const currentPlan = simulate(balance, rate, basePayment, monthlyCharges, floor);
    const extraPlan = simulate(balance, rate, withExtraPayment, monthlyCharges, floor);

    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const firstMonthInterest = (balance + monthlyCharges) * monthlyRate;

    const tableRows = [
      {
        label: "Current payment",
        plan: currentPlan,
        amount: basePayment,
      },
      {
        label: withExtraPayment === basePayment ? "With current payment" : "With extra payment",
        plan: extraPlan,
        amount: withExtraPayment,
      },
    ];

    const summaryRows = tableRows
      .map((row) => {
        const payoff = row.plan.stalled ? "Not paid off" : formatMonths(row.plan.months);
        const interest = currencyFormatter.format(row.plan.totalInterest);
        const totalPaid = currencyFormatter.format(row.plan.totalPaid);
        return `<tr><td>${row.label}</td><td>${currencyFormatter.format(row.amount)}</td><td>${payoff}</td><td>${interest}</td><td>${totalPaid}</td></tr>`;
      })
      .join("");

    let comparison = "Paying extra each month doesn't change the payoff because no additional payment was entered.";
    if (withExtraPayment !== basePayment) {
      if (extraPlan.stalled) {
        comparison = "Even with the extra payment, the balance doesn't shrink—raise the payment or stop new charges.";
      } else if (currentPlan.stalled) {
        comparison = "Adding the extra payment is enough to reverse the balance and pay the card off.";
      } else {
        const monthsSaved = currentPlan.months - extraPlan.months;
        const interestSaved = currentPlan.totalInterest - extraPlan.totalInterest;
        comparison = `Extra payments save ${currencyFormatter.format(interestSaved)} in interest and cut ${
          monthsSaved > 0 ? `${monthsSaved} months from the payoff timeline` : "no time from the payoff timeline"
        }.`;
      }
    }

    const balanceTrend = currentPlan.stalled
      ? `With your current payment, the balance grows to ${currencyFormatter.format(currentPlan.endingBalance)} after about ${
          currentPlan.months
        } months.`
      : "";

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Credit card payoff outlook</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Starting balance</span><span class="value">${currencyFormatter.format(balance)}</span></div>
          <div class="stat"><span class="label">APR</span><span class="value">${numberFormatter.format(rate)}%</span></div>
          <div class="stat"><span class="label">First month interest</span><span class="value">${currencyFormatter.format(firstMonthInterest)}</span></div>
          <div class="stat"><span class="label">Monthly charges added</span><span class="value">${currencyFormatter.format(monthlyCharges)}</span></div>
          <div class="stat"><span class="label">Payment floor</span><span class="value">${currencyFormatter.format(floor)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Monthly payment</th>
                <th>Payoff timeline</th>
                <th>Total interest</th>
                <th>Total paid</th>
              </tr>
            </thead>
            <tbody>${summaryRows}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">${comparison} ${balanceTrend}</p>
      </section>
    `;
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });
})();
