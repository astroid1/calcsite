(function () {
  const form = document.getElementById("loan-form");
  const resultEl = document.getElementById("loan-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const amount = parseFloat(formData.get("amount"));
    const rate = parseFloat(formData.get("rate"));
    const term = parseInt(formData.get("term"), 10);
    const extra = parseFloat(formData.get("extra")) || 0;

    if (
      !isFinite(amount) ||
      amount <= 0 ||
      !isFinite(rate) ||
      rate < 0 ||
      !isFinite(term) ||
      term <= 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Please provide a loan amount, interest rate, and term above zero.</p></section>`;
      return;
    }

    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const totalMonths = term * 12;
    let monthlyPayment;

    if (monthlyRate === 0) {
      monthlyPayment = amount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = (amount * monthlyRate * factor) / (factor - 1);
    }

    monthlyPayment = monthlyPayment + extra;
    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Something went wrong. Try adjusting your inputs.</p></section>`;
      return;
    }

    let balance = amount;
    let totalInterest = 0;
    let totalPaid = 0;
    const schedule = [];
    let monthsElapsed = 0;

    for (let month = 1; month <= totalMonths && balance > 0; month += 1) {
      const interestPayment = monthlyRate > 0 ? balance * monthlyRate : 0;
      let principalPayment = monthlyPayment - interestPayment;
      let payment = monthlyPayment;

      if (principalPayment > balance) {
        principalPayment = balance;
        payment = principalPayment + interestPayment;
      }

      balance = Math.max(0, balance - principalPayment);
      totalInterest += interestPayment;
      totalPaid += payment;

      const yearIndex = Math.ceil(month / 12) - 1;
      if (!schedule[yearIndex]) {
        schedule[yearIndex] = {
          year: yearIndex + 1,
          principal: 0,
          interest: 0,
          balance: 0,
          paid: 0,
        };
      }

      schedule[yearIndex].principal += principalPayment;
      schedule[yearIndex].interest += interestPayment;
      schedule[yearIndex].paid += payment;
      schedule[yearIndex].balance = balance;
      monthsElapsed = month;

      if (balance <= 0) {
        break;
      }
    }

    const years = Math.floor(monthsElapsed / 12);
    const months = monthsElapsed % 12;

    const timeline = schedule
      .map((item) => {
        return `<tr><td>Year ${item.year}</td><td>${currencyFormatter.format(item.principal)}</td><td>${currencyFormatter.format(
          item.interest,
        )}</td><td>${currencyFormatter.format(item.paid)}</td><td>${currencyFormatter.format(item.balance)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Monthly payment</h2>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Payment</span>
            <span class="value">${currencyFormatter.format(monthlyPayment)}</span>
          </div>
          <div class="stat">
            <span class="label">Total paid</span>
            <span class="value">${currencyFormatter.format(totalPaid)}</span>
          </div>
          <div class="stat">
            <span class="label">Total interest</span>
            <span class="value">${currencyFormatter.format(totalInterest)}</span>
          </div>
          <div class="stat">
            <span class="label">Payoff time</span>
            <span class="value">${years} yrs ${months} mos</span>
          </div>
        </div>
        <p class="helper" style="margin-top:12px;">Numbers are rounded to the nearest cent.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Principal paid</th>
                <th>Interest paid</th>
                <th>Total paid</th>
                <th>Ending balance</th>
              </tr>
            </thead>
            <tbody>${timeline}</tbody>
          </table>
        </div>
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });
})();
