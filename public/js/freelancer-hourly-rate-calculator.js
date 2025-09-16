(function () {
  const form = document.getElementById("freelance-form");
  const resultEl = document.getElementById("freelance-result");

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
    const expenses = parseFloat(form.expenses.value || "0");
    const hours = parseFloat(form.hours.value || "0");
    const weeksOff = parseFloat(form.weeksOff.value || "0");
    const marginPercent = parseFloat(form.margin.value || "0");
    const reservePercent = parseFloat(form.reserve.value || "0");
    const projectHours = parseFloat(form.projectHours.value || "0");
    const projectExpenses = parseFloat(form.projectExpenses.value || "0");

    if (!Number.isFinite(income) || income <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter the annual take-home pay you want from freelancing.</p></section>`;
      return;
    }

    if (!Number.isFinite(hours) || hours <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Billable hours per week must be greater than zero.</p></section>`;
      return;
    }

    const safeWeeksOff = Number.isFinite(weeksOff) && weeksOff > 0 ? weeksOff : 0;
    const workingWeeks = 52 - safeWeeksOff;

    if (workingWeeks <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Leave at least one working week in the year.</p></section>`;
      return;
    }

    const annualBillableHours = hours * workingWeeks;
    if (annualBillableHours <= 0) {
      resultEl.innerHTML = `<section class="card"><p>We need some billable hours to calculate a rate.</p></section>`;
      return;
    }

    const expensesAnnual = Number.isFinite(expenses) && expenses > 0 ? expenses : 0;
    const marginRate = Number.isFinite(marginPercent) && marginPercent > 0 ? marginPercent / 100 : 0;
    const reserveRate = Number.isFinite(reservePercent) && reservePercent > 0 ? reservePercent / 100 : 0;

    if (reserveRate >= 1) {
      resultEl.innerHTML = `<section class="card"><p>The reserve percentage must be below 100%.</p></section>`;
      return;
    }

    const baseCost = income + expensesAnnual;
    const revenueToCoverReserve = reserveRate > 0 ? baseCost / (1 - reserveRate) : baseCost;
    const recommendedRevenue = revenueToCoverReserve * (1 + marginRate);

    const breakevenHourly = revenueToCoverReserve / annualBillableHours;
    const recommendedHourly = recommendedRevenue / annualBillableHours;
    const dayRate = recommendedHourly * 8;
    const monthRate = recommendedHourly * hours * 4.33;

    const reserveDollars = recommendedRevenue * reserveRate;
    const estimatedTakeHome = recommendedRevenue - reserveDollars - expensesAnnual;

    let projectMarkup = "";
    if (Number.isFinite(projectHours) && projectHours > 0) {
      const projectCost = recommendedHourly * projectHours;
      const projectExpense = Number.isFinite(projectExpenses) && projectExpenses > 0 ? projectExpenses : 0;
      const projectTotal = projectCost + projectExpense;
      const baseProjectTotal = breakevenHourly * projectHours + projectExpense;
      projectMarkup = `
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Project estimate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Hours @ recommended rate (${currencyFormatter.format(recommendedHourly)})</td><td>${currencyFormatter.format(projectCost)}</td></tr>
              <tr><td>Expenses</td><td>${currencyFormatter.format(projectExpense)}</td></tr>
              <tr><td><strong>Suggested quote</strong></td><td><strong>${currencyFormatter.format(projectTotal)}</strong></td></tr>
              <tr><td>Quote to just break even</td><td>${currencyFormatter.format(baseProjectTotal)}</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Charge about ${currencyFormatter.format(recommendedHourly)} per billable hour</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Annual billable hours</span><span class="value">${numberFormatter.format(annualBillableHours)}</span></div>
          <div class="stat"><span class="label">Base hourly (covers goals)</span><span class="value">${currencyFormatter.format(breakevenHourly)}</span></div>
          <div class="stat"><span class="label">Recommended hourly</span><span class="value">${currencyFormatter.format(recommendedHourly)}</span></div>
          <div class="stat"><span class="label">Day rate (8 hrs)</span><span class="value">${currencyFormatter.format(dayRate)}</span></div>
          <div class="stat"><span class="label">Monthly retainer*</span><span class="value">${currencyFormatter.format(monthRate)}</span></div>
          <div class="stat"><span class="label">Reserve set aside</span><span class="value">${currencyFormatter.format(reserveDollars)}</span></div>
          <div class="stat"><span class="label">Target revenue</span><span class="value">${currencyFormatter.format(recommendedRevenue)}</span></div>
          <div class="stat"><span class="label">Est. take-home after reserve</span><span class="value">${currencyFormatter.format(estimatedTakeHome)}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">*Monthly retainer assumes ${numberFormatter.format(hours)} billable hours each week (${numberFormatter.format(hours * 4.33)} hours per month).</p>
        ${projectMarkup}
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
