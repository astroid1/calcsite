(function () {
  const form = document.getElementById("car-form");
  const resultEl = document.getElementById("car-result");

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

    const income = parseFloat(form.income.value || "0");
    const debts = parseFloat(form.debts.value || "0");
    const term = parseInt(form.term.value, 10);
    const rate = parseFloat(form.rate.value || "0");
    const down = parseFloat(form.down.value || "0");
    const trade = parseFloat(form.trade.value || "0");
    const share = parseFloat(form.share.value || "0");
    const tax = parseFloat(form.tax.value || "0");

    if (!Number.isFinite(income) || income <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter your gross annual income above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(term) || term <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Select a valid loan term.</p></section>`;
      return;
    }

    const monthlyIncome = income / 12;
    const monthlyDebts = Number.isFinite(debts) && debts > 0 ? debts : 0;
    const shareRate = Number.isFinite(share) && share > 0 ? share / 100 : 0.15;

    let maxPayment = monthlyIncome * shareRate - monthlyDebts;
    maxPayment = Math.max(0, maxPayment);

    if (maxPayment <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Your existing monthly debt already uses the entire ${numberFormatter.format(shareRate * 100)}% target. Increase the target percentage or pay down other loans.</p></section>`;
      return;
    }

    const monthlyRate = Number.isFinite(rate) && rate > 0 ? rate / 100 / 12 : 0;
    let maxLoan = 0;
    if (monthlyRate === 0) {
      maxLoan = maxPayment * term;
    } else {
      const factor = 1 - Math.pow(1 + monthlyRate, -term);
      if (factor <= 0) {
        resultEl.innerHTML = `<section class="card"><p>Loan term is too short for the selected rate. Try a longer term.</p></section>`;
        return;
      }
      maxLoan = (maxPayment * factor) / monthlyRate;
    }

    const upfrontCash = (Number.isFinite(down) && down > 0 ? down : 0) + (Number.isFinite(trade) && trade > 0 ? trade : 0);
    const taxRate = Number.isFinite(tax) && tax > 0 ? tax / 100 : 0;
    const priceBeforeTax = (maxLoan + upfrontCash) / (1 + taxRate);
    const price = Math.max(0, priceBeforeTax);
    const outTheDoor = price * (1 + taxRate);
    const conservativePrice = price * 0.9;
    const carShare = maxPayment / monthlyIncome;
    const totalDebtRatio = (maxPayment + monthlyDebts) / monthlyIncome;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">You can afford about ${currencyFormatter.format(price)} before tax</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Monthly income</span><span class="value">${currencyFormatter.format(monthlyIncome)}</span></div>
          <div class="stat"><span class="label">Target car payment</span><span class="value">${currencyFormatter.format(maxPayment)}</span></div>
          <div class="stat"><span class="label">Loan amount</span><span class="value">${currencyFormatter.format(maxLoan)}</span></div>
          <div class="stat"><span class="label">Out-the-door budget</span><span class="value">${currencyFormatter.format(outTheDoor)}</span></div>
          <div class="stat"><span class="label">Upfront cash (down + trade)</span><span class="value">${currencyFormatter.format(upfrontCash)}</span></div>
          <div class="stat"><span class="label">Car payment share of income</span><span class="value">${numberFormatter.format(carShare * 100)}%</span></div>
          <div class="stat"><span class="label">Total debt-to-income</span><span class="value">${numberFormatter.format(totalDebtRatio * 100)}%</span></div>
          <div class="stat"><span class="label">Cushioned car price (-10%)</span><span class="value">${currencyFormatter.format(conservativePrice)}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Assumes a ${term}-month loan at ${numberFormatter.format(rate)}% APR. Adjust the target percentage to model more aggressive or conservative budgets.</p>
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
