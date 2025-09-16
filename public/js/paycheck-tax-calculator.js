(function () {
  const form = document.getElementById("paycheck-form");
  const resultEl = document.getElementById("paycheck-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  const payPeriods = {
    annual: 1,
    monthly: 12,
    "semi-monthly": 24,
    biweekly: 26,
    weekly: 52,
  };

  const payLabels = {
    annual: "year",
    monthly: "month",
    "semi-monthly": "paycheck",
    biweekly: "paycheck",
    weekly: "paycheck",
  };

  const stateRates = {
    AL: 0.05,
    AK: 0,
    AZ: 0.025,
    AR: 0.049,
    CA: 0.06,
    CO: 0.044,
    CT: 0.05,
    DE: 0.055,
    DC: 0.06,
    FL: 0,
    GA: 0.05,
    HI: 0.075,
    ID: 0.058,
    IL: 0.0495,
    IN: 0.0323,
    IA: 0.057,
    KS: 0.057,
    KY: 0.045,
    LA: 0.0425,
    ME: 0.058,
    MD: 0.0575,
    MA: 0.05,
    MI: 0.0405,
    MN: 0.068,
    MS: 0.047,
    MO: 0.0495,
    MT: 0.059,
    NE: 0.058,
    NV: 0,
    NH: 0,
    NJ: 0.0637,
    NM: 0.049,
    NY: 0.065,
    NC: 0.0475,
    ND: 0.025,
    OH: 0.035,
    OK: 0.0475,
    OR: 0.0775,
    PA: 0.0307,
    RI: 0.0599,
    SC: 0.05,
    SD: 0,
    TN: 0,
    TX: 0,
    UT: 0.0465,
    VT: 0.066,
    VA: 0.0575,
    WA: 0,
    WV: 0.051,
    WI: 0.05,
    WY: 0,
  };

  const STANDARD_DEDUCTION = {
    single: 14600,
    married: 29200,
  };

  const FEDERAL_BRACKETS = {
    single: [
      { cap: 11600, rate: 0.1 },
      { cap: 47150, rate: 0.12 },
      { cap: 100525, rate: 0.22 },
      { cap: 191950, rate: 0.24 },
      { cap: 243725, rate: 0.32 },
      { cap: 609350, rate: 0.35 },
      { cap: Infinity, rate: 0.37 },
    ],
    married: [
      { cap: 23200, rate: 0.1 },
      { cap: 94300, rate: 0.12 },
      { cap: 201050, rate: 0.22 },
      { cap: 383900, rate: 0.24 },
      { cap: 487450, rate: 0.32 },
      { cap: 731200, rate: 0.35 },
      { cap: Infinity, rate: 0.37 },
    ],
  };

  function computeFederalTax(income, status) {
    const brackets = FEDERAL_BRACKETS[status] || FEDERAL_BRACKETS.single;
    const deduction = STANDARD_DEDUCTION[status] ?? STANDARD_DEDUCTION.single;
    const taxable = Math.max(0, income - deduction);
    let tax = 0;
    let lower = 0;

    for (const bracket of brackets) {
      if (taxable <= lower) break;
      const upper = Math.min(bracket.cap, taxable);
      const amount = upper - lower;
      if (amount > 0) {
        tax += amount * bracket.rate;
      }
      lower = bracket.cap;
    }

    return tax;
  }

  function computeFica(wages, status) {
    const wageBase = 168600;
    const socialSecurity = Math.min(Math.max(wages, 0), wageBase) * 0.062;
    const medicareBase = Math.max(wages, 0);
    const medicare = medicareBase * 0.0145;
    const additionalThreshold = status === "married" ? 250000 : 200000;
    const additionalMedicare = Math.max(0, medicareBase - additionalThreshold) * 0.009;
    return {
      socialSecurity,
      medicare: medicare + additionalMedicare,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();

    const income = parseFloat(form.income.value || "0");
    const frequency = form.frequency.value;
    const status = form.status.value === "married" ? "married" : "single";
    const state = form.state.value;
    const pretax = parseFloat(form.pretax.value || "0");
    const posttax = parseFloat(form.posttax.value || "0");

    if (!Number.isFinite(income) || income <= 0 || !payPeriods[frequency]) {
      resultEl.innerHTML = `<section class="card"><p>Please enter a gross income above zero.</p></section>`;
      return;
    }

    const periods = payPeriods[frequency];
    const grossPerPeriod = income / periods;
    const pretaxPerPeriod = Number.isFinite(pretax) && pretax > 0 ? pretax : 0;
    const postTaxPerPeriod = Number.isFinite(posttax) && posttax > 0 ? posttax : 0;
    const totalPretax = pretaxPerPeriod * periods;
    const taxableAnnual = Math.max(0, income - totalPretax);

    const federalTax = computeFederalTax(taxableAnnual, status);
    const stateRate = stateRates[state] ?? 0;
    const stateTax = taxableAnnual * stateRate;
    const fica = computeFica(taxableAnnual, status);
    const payrollTax = fica.socialSecurity + fica.medicare;
    const postTaxAnnual = postTaxPerPeriod * periods;
    const totalTax = federalTax + stateTax + payrollTax;
    const netAnnual = Math.max(0, income - totalPretax - totalTax - postTaxAnnual);
    const netPerPeriod = netAnnual / periods;

    const effectiveRate = income > 0 ? totalTax / income : 0;
    const frequencyLabel = payLabels[frequency] || "pay period";
    const stateLabel = form.state.options[form.state.selectedIndex]?.text || state;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Estimated take-home: ${currencyFormatter.format(netPerPeriod)} per ${frequencyLabel}</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Gross per ${frequencyLabel}</span><span class="value">${currencyFormatter.format(grossPerPeriod)}</span></div>
          <div class="stat"><span class="label">Pre-tax deductions</span><span class="value">${currencyFormatter.format(pretaxPerPeriod)}</span></div>
          <div class="stat"><span class="label">Taxes per ${frequencyLabel}</span><span class="value">${currencyFormatter.format(totalTax / periods)}</span></div>
          <div class="stat"><span class="label">Net pay per ${frequencyLabel}</span><span class="value">${currencyFormatter.format(netPerPeriod)}</span></div>
          <div class="stat"><span class="label">Annual take-home</span><span class="value">${currencyFormatter.format(netAnnual)}</span></div>
          <div class="stat"><span class="label">Effective tax rate</span><span class="value">${percentFormatter.format(effectiveRate)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Annual</th>
                <th>Per ${frequencyLabel}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Federal income tax</td><td>${currencyFormatter.format(federalTax)}</td><td>${currencyFormatter.format(federalTax / periods)}</td></tr>
              <tr><td>${stateLabel} income tax</td><td>${currencyFormatter.format(stateTax)}</td><td>${currencyFormatter.format(stateTax / periods)}</td></tr>
              <tr><td>Social Security</td><td>${currencyFormatter.format(fica.socialSecurity)}</td><td>${currencyFormatter.format(fica.socialSecurity / periods)}</td></tr>
              <tr><td>Medicare</td><td>${currencyFormatter.format(fica.medicare)}</td><td>${currencyFormatter.format(fica.medicare / periods)}</td></tr>
              <tr><td>Post-tax deductions</td><td>${currencyFormatter.format(postTaxAnnual)}</td><td>${currencyFormatter.format(postTaxPerPeriod)}</td></tr>
            </tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Standard deduction applied: ${currencyFormatter.format(STANDARD_DEDUCTION[status])}. ${stateRate === 0 ? `${stateLabel} has no state income tax in this estimate.` : `State rate assumed: ${numberFormatter.format(stateRate * 100)}%.`}</p>
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
