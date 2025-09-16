(function () {
  const form = document.getElementById("compare-form");
  const resultEl = document.getElementById("compare-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  function runProjection(start, monthly, months, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    let balance = start;
    let totalGrowth = 0;
    let totalContributions = start;
    let contributionsThisYear = 0;
    let growthThisYear = 0;
    const schedule = [];

    for (let month = 1; month <= months; month += 1) {
      const interest = balance * monthlyRate;
      balance += interest;
      totalGrowth += interest;
      growthThisYear += interest;

      if (monthly > 0) {
        balance += monthly;
        totalContributions += monthly;
        contributionsThisYear += monthly;
      }

      if (month % 12 === 0 || month === months) {
        schedule.push({
          year: Math.ceil(month / 12),
          partial: month % 12 !== 0,
          contributions: contributionsThisYear,
          growth: growthThisYear,
          balance,
        });
        contributionsThisYear = 0;
        growthThisYear = 0;
      }
    }

    return { balance, totalGrowth, totalContributions, schedule };
  }

  function handleSubmit(event) {
    event.preventDefault();

    const start = parseFloat(form.start.value || "0");
    const monthly = parseFloat(form.monthly.value || "0");
    const years = parseFloat(form.years.value || "0");
    const bankRate = parseFloat(form.bankRate.value || "0");
    const marketRate = parseFloat(form.marketRate.value || "0");
    const fees = parseFloat(form.fees.value || "0");

    if (!Number.isFinite(start) || start < 0) {
      resultEl.innerHTML = `<section class="card"><p>Starting balance can't be negative.</p></section>`;
      return;
    }

    if (!Number.isFinite(years) || years <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Choose a time horizon greater than zero.</p></section>`;
      return;
    }

    const months = Math.round(years * 12);
    if (months <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Your timeframe is too short—try at least one month.</p></section>`;
      return;
    }

    const monthlyContribution = Number.isFinite(monthly) && monthly > 0 ? monthly : 0;
    const safeBankRate = Number.isFinite(bankRate) ? bankRate : 0;
    const safeMarketRate = Number.isFinite(marketRate) ? marketRate : 0;
    const feeRate = Number.isFinite(fees) && fees > 0 ? fees : 0;
    const netMarketRate = safeMarketRate - feeRate;

    const savingsProjection = runProjection(start, monthlyContribution, months, safeBankRate);
    const investingProjection = runProjection(start, monthlyContribution, months, netMarketRate);

    const difference = investingProjection.balance - savingsProjection.balance;
    const totalContributions = savingsProjection.totalContributions; // same inputs for both

    const tableRows = savingsProjection.schedule.map((row, index) => {
      const investingRow = investingProjection.schedule[index];
      const yearLabel = row.partial ? `Year ${row.year}*` : `Year ${row.year}`;
      const investBalance = investingRow ? investingRow.balance : investingProjection.balance;
      return `<tr><td>${yearLabel}</td><td>${currencyFormatter.format(row.balance)}</td><td>${currencyFormatter.format(investBalance)}</td><td>${currencyFormatter.format(investBalance - row.balance)}</td></tr>`;
    });

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Projected balances after ${numberFormatter.format(years)} years</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Total contributed</span><span class="value">${currencyFormatter.format(totalContributions)}</span></div>
          <div class="stat"><span class="label">Savings account balance</span><span class="value">${currencyFormatter.format(savingsProjection.balance)}</span></div>
          <div class="stat"><span class="label">Savings growth earned</span><span class="value">${currencyFormatter.format(savingsProjection.totalGrowth)}</span></div>
          <div class="stat"><span class="label">Investing balance (net of fees)</span><span class="value">${currencyFormatter.format(investingProjection.balance)}</span></div>
          <div class="stat"><span class="label">Investing growth earned</span><span class="value">${currencyFormatter.format(investingProjection.totalGrowth)}</span></div>
          <div class="stat"><span class="label">Difference</span><span class="value">${currencyFormatter.format(difference)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Savings balance</th>
                <th>Investing balance</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>${tableRows.join("")}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Investment return uses ${numberFormatter.format(safeMarketRate)}% minus ${numberFormatter.format(feeRate)}% in annual fees. Rows with an asterisk represent a partial year at the end of the timeline.</p>
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
