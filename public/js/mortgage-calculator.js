(function () {
  const form = document.getElementById("mortgage-form");
  const resultEl = document.getElementById("mortgage-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const percentFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  });

  function parseNumber(value) {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  }

  function monthlyCostForPrice(
    price,
    downPercent,
    monthlyRate,
    totalMonths,
    taxRatePercent,
    insuranceMonthly,
    hoaMonthly,
  ) {
    const downPayment = price * (downPercent / 100);
    const loanAmount = Math.max(0, price - downPayment);
    let monthlyPI = 0;

    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyPI = loanAmount / totalMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        monthlyPI = (loanAmount * monthlyRate * factor) / (factor - 1);
      }
    }

    const propertyTaxMonthly =
      taxRatePercent > 0 ? (price * (taxRatePercent / 100)) / 12 : 0;
    return monthlyPI + propertyTaxMonthly + insuranceMonthly + hoaMonthly;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);

    const price = parseNumber(data.get("price"));
    const downPercent = parseNumber(data.get("down"));
    const rate = parseNumber(data.get("rate"));
    const term = parseInt(data.get("term"), 10);
    const taxRate = parseNumber(data.get("tax"));
    const insuranceAnnual = parseNumber(data.get("insurance"));
    const hoaMonthlyInput = parseNumber(data.get("hoa"));
    const income = parseNumber(data.get("income"));
    const debts = parseNumber(data.get("debts"));

    if (
      !price ||
      price <= 0 ||
      !term ||
      term <= 0 ||
      downPercent < 0 ||
      downPercent > 100 ||
      rate < 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Please enter a valid price, down payment, rate, and term.</p></section>`;
      return;
    }

    const downPaymentAmount = price * (downPercent / 100);
    const loanAmount = Math.max(0, price - downPaymentAmount);
    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const totalMonths = term * 12;

    let monthlyPI = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyPI = loanAmount / totalMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        monthlyPI = (loanAmount * monthlyRate * factor) / (factor - 1);
      }
    }

    const propertyTaxMonthly = taxRate > 0 ? (price * (taxRate / 100)) / 12 : 0;
    const insuranceMonthly = insuranceAnnual > 0 ? insuranceAnnual / 12 : 0;
    const hoaMonthly = hoaMonthlyInput > 0 ? hoaMonthlyInput : 0;

    const pitiMonthly =
      monthlyPI + propertyTaxMonthly + insuranceMonthly + hoaMonthly;

    let balance = loanAmount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let monthsElapsed = 0;
    const schedule = [];

    if (loanAmount > 0) {
      for (let month = 1; month <= totalMonths && balance > 0; month += 1) {
        const interestPayment = monthlyRate > 0 ? balance * monthlyRate : 0;
        let principalPayment = monthlyPI - interestPayment;
        let paymentPI = monthlyPI;

        if (principalPayment < 0) {
          resultEl.innerHTML = `<section class="card"><p>Your payment does not cover the monthly interest. Increase the payment or adjust your rate.</p></section>`;
          return;
        }

        if (principalPayment > balance) {
          principalPayment = balance;
          paymentPI = principalPayment + interestPayment;
        }

        balance = Math.max(0, balance - principalPayment);
        totalInterest += interestPayment;
        totalPrincipal += principalPayment;
        monthsElapsed = month;

        const yearIndex = Math.ceil(month / 12) - 1;
        if (!schedule[yearIndex]) {
          schedule[yearIndex] = {
            year: yearIndex + 1,
            principal: 0,
            interest: 0,
            balance: 0,
          };
        }

        schedule[yearIndex].principal += principalPayment;
        schedule[yearIndex].interest += interestPayment;
        schedule[yearIndex].balance = balance;

        if (balance <= 0) {
          break;
        }
      }
    }

    const totalTaxesInsurance =
      (propertyTaxMonthly + insuranceMonthly + hoaMonthly) *
      (monthsElapsed || totalMonths);
    const totalOutOfPocket =
      totalPrincipal + totalInterest + totalTaxesInsurance + downPaymentAmount;

    let dtiValue = null;
    let affordablePrice = 0;
    let affordablePayment = 0;

    if (income > 0) {
      const monthlyIncome = income / 12;
      affordablePayment = Math.max(0, monthlyIncome * 0.36 - debts);
      if (monthlyIncome > 0) {
        dtiValue = ((pitiMonthly + debts) / monthlyIncome) * 100;
      }

      if (affordablePayment > 0) {
        let low = 0;
        let high = Math.max(price * 2, 100000);

        for (let i = 0; i < 40; i += 1) {
          const mid = (low + high) / 2;
          const cost = monthlyCostForPrice(
            mid,
            downPercent,
            monthlyRate,
            totalMonths,
            taxRate,
            insuranceMonthly,
            hoaMonthly,
          );
          if (cost > affordablePayment) {
            high = mid;
          } else {
            low = mid;
          }
        }
        affordablePrice = low;
      }
    }

    const payoffTotalMonths = loanAmount > 0 ? monthsElapsed || totalMonths : 0;
    const payoffYears = Math.floor(payoffTotalMonths / 12);
    const payoffMonths = payoffTotalMonths % 12;

    const rows = schedule
      .map((entry) => {
        return `<tr><td>Year ${entry.year}</td><td>${currencyFormatter.format(entry.principal)}</td><td>${currencyFormatter.format(entry.interest)}</td><td>${currencyFormatter.format(entry.balance)}</td></tr>`;
      })
      .join("");

    const tableMarkup =
      loanAmount > 0 && rows
        ? `<div class="table-wrap"><table><thead><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Ending balance</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<p class="helper" style="margin-top:12px;">No amortization schedule—this scenario does not require a loan.</p>`;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Monthly snapshot</h2>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Loan amount</span>
            <span class="value">${currencyFormatter.format(loanAmount)}</span>
          </div>
          <div class="stat">
            <span class="label">Down payment</span>
            <span class="value">${currencyFormatter.format(downPaymentAmount)}</span>
          </div>
          <div class="stat">
            <span class="label">Principal &amp; interest</span>
            <span class="value">${currencyFormatter.format(monthlyPI)}</span>
          </div>
          <div class="stat">
            <span class="label">Taxes + insurance + HOA</span>
            <span class="value">${currencyFormatter.format(propertyTaxMonthly + insuranceMonthly + hoaMonthly)}</span>
          </div>
          <div class="stat">
            <span class="label">Total monthly payment</span>
            <span class="value">${currencyFormatter.format(pitiMonthly)}</span>
          </div>
          <div class="stat">
            <span class="label">Total interest</span>
            <span class="value">${currencyFormatter.format(totalInterest)}</span>
          </div>
          <div class="stat">
            <span class="label">Payoff timeline</span>
            <span class="value">${payoffYears} yrs ${payoffMonths} mos</span>
          </div>
          ${dtiValue !== null ? `<div class="stat"><span class="label">Debt-to-income</span><span class="value">${percentFormatter.format(dtiValue)}%</span></div>` : ""}
          ${affordablePrice > 0 ? `<div class="stat"><span class="label">36% rule home price</span><span class="value">${currencyFormatter.format(affordablePrice)}</span></div>` : ""}
        </div>
        ${affordablePayment > 0 ? `<p class="helper" style="margin-top:12px;">Max housing payment at 36% rule: ${currencyFormatter.format(affordablePayment)} (including debts).</p>` : ""}
        <p class="helper" style="margin-top:12px;">Estimated lifetime cost (including down payment &amp; extras): ${currencyFormatter.format(totalOutOfPocket)}.</p>
        ${tableMarkup}
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });
})();
