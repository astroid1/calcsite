(function () {
  const form = document.getElementById("savings-form");
  const resultEl = document.getElementById("savings-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  function handleSubmit(event) {
    event.preventDefault();
    const goal = parseFloat(form.goal.value || "0");
    const current = parseFloat(form.current.value || "0");
    const years = parseFloat(form.years.value || "0");
    const rate = parseFloat(form.rate.value || "0");

    if (!Number.isFinite(goal) || goal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Please enter a savings goal above zero.</p></section>`;
      return;
    }

    if (
      !Number.isFinite(current) ||
      current < 0 ||
      !Number.isFinite(years) ||
      years <= 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Current savings can't be negative and timeframe must be above zero.</p></section>`;
      return;
    }

    const months = Math.round(years * 12);
    if (months <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Your timeframe is too short—choose at least one month.</p></section>`;
      return;
    }

    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const growthFactor = Math.pow(1 + monthlyRate, months);
    const futureCurrent = current * growthFactor;

    let monthlyContribution = 0;
    if (goal > futureCurrent) {
      if (monthlyRate === 0) {
        monthlyContribution = (goal - current) / months;
      } else {
        monthlyContribution =
          ((goal - futureCurrent) * monthlyRate) / (growthFactor - 1);
      }
    }

    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      resultEl.innerHTML = `<section class="card"><p>We couldn't compute a plan—adjust the goal or timeline.</p></section>`;
      return;
    }

    let balance = current;
    let newContributionTotal = 0;
    const schedule = [];

    for (let month = 1; month <= months; month += 1) {
      const interest = balance * monthlyRate;
      balance += interest;

      balance += monthlyContribution;
      newContributionTotal += monthlyContribution;

      const yearIndex = Math.ceil(month / 12) - 1;
      if (!schedule[yearIndex]) {
        schedule[yearIndex] = {
          year: yearIndex + 1,
          contributions: 0,
          growth: 0,
          balance: 0,
        };
      }

      schedule[yearIndex].contributions += monthlyContribution;
      schedule[yearIndex].growth += interest;
      schedule[yearIndex].balance = balance;
    }

    if (balance < goal) {
      balance = goal;
      if (schedule.length > 0) {
        schedule[schedule.length - 1].balance = balance;
      }
    }

    const totalContributions = current + newContributionTotal;
    const totalGrowth = balance - totalContributions;

    const rows = schedule
      .map((entry) => {
        return `<tr><td>Year ${entry.year}</td><td>${currencyFormatter.format(entry.contributions)}</td><td>${currencyFormatter.format(entry.growth)}</td><td>${currencyFormatter.format(entry.balance)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${monthlyContribution > 0 ? `Save ${currencyFormatter.format(monthlyContribution)} per month` : "No new monthly savings required"}</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Monthly deposit</span><span class="value">${currencyFormatter.format(monthlyContribution)}</span></div>
          <div class="stat"><span class="label">Existing savings</span><span class="value">${currencyFormatter.format(current)}</span></div>
          <div class="stat"><span class="label">New contributions</span><span class="value">${currencyFormatter.format(newContributionTotal)}</span></div>
          <div class="stat"><span class="label">Total contributions</span><span class="value">${currencyFormatter.format(totalContributions)}</span></div>
          <div class="stat"><span class="label">Growth earned</span><span class="value">${currencyFormatter.format(totalGrowth)}</span></div>
          <div class="stat"><span class="label">Projected balance</span><span class="value">${currencyFormatter.format(balance)}</span></div>
          <div class="stat"><span class="label">Timeline</span><span class="value">${numberFormatter.format(years)} years (${months} months)</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Deposits are assumed at month end. ${monthlyContribution > 0 ? "Consider rounding contributions up to keep a buffer." : "Your existing savings already reach the goal given the assumed growth."}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Deposits</th>
                <th>Growth</th>
                <th>Ending balance</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
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
