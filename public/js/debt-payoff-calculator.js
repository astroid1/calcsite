(function () {
  const form = document.getElementById("debt-form");
  const resultEl = document.getElementById("debt-result");
  const rowsContainer = document.getElementById("debt-rows");
  const addDebtButton = document.getElementById("add-debt");

  if (!form || !resultEl || !rowsContainer || !addDebtButton) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  function createDebtRow(initial = {}) {
    const index = rowsContainer.children.length + 1;
    const wrapper = document.createElement("div");
    wrapper.dataset.debtRow = "true";
    wrapper.style.border = "1px solid var(--border)";
    wrapper.style.borderRadius = "12px";
    wrapper.style.padding = "12px";
    wrapper.style.background = "var(--panel-2)";

    const grid = document.createElement("div");
    grid.className = "form-grid";

    const nameField = document.createElement("div");
    nameField.innerHTML = `
      <label>Debt name</label>
      <input type="text" data-field="name" placeholder="Debt ${index}" value="${initial.name || ""}" />
    `;

    const balanceField = document.createElement("div");
    balanceField.innerHTML = `
      <label>Balance</label>
      <input type="number" data-field="balance" min="0" step="1" placeholder="4500" value="${
        initial.balance !== undefined ? initial.balance : ""
      }" />
    `;

    const rateField = document.createElement("div");
    rateField.innerHTML = `
      <label>APR (%)</label>
      <input type="number" data-field="rate" min="0" step="0.01" placeholder="18.5" value="${
        initial.rate !== undefined ? initial.rate : ""
      }" />
    `;

    const paymentField = document.createElement("div");
    paymentField.innerHTML = `
      <label>Minimum payment</label>
      <input type="number" data-field="payment" min="0" step="1" placeholder="150" value="${
        initial.payment !== undefined ? initial.payment : ""
      }" />
    `;

    grid.appendChild(nameField);
    grid.appendChild(balanceField);
    grid.appendChild(rateField);
    grid.appendChild(paymentField);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.className = "btn";
    removeButton.style.marginTop = "12px";
    removeButton.addEventListener("click", () => {
      if (rowsContainer.children.length > 1) {
        wrapper.remove();
      } else {
        Array.from(wrapper.querySelectorAll("input")).forEach((input) => {
          input.value = "";
        });
      }
    });

    wrapper.appendChild(grid);
    wrapper.appendChild(removeButton);
    return wrapper;
  }

  function ensureRows() {
    if (rowsContainer.children.length === 0) {
      rowsContainer.appendChild(
        createDebtRow({ name: "Credit Card", balance: 6500, rate: 19.99, payment: 175 })
      );
      rowsContainer.appendChild(
        createDebtRow({ name: "Auto Loan", balance: 13000, rate: 6.5, payment: 325 })
      );
    }
  }

  ensureRows();

  addDebtButton.addEventListener("click", () => {
    rowsContainer.appendChild(createDebtRow());
  });

  function parseDebts() {
    const rows = Array.from(rowsContainer.querySelectorAll("[data-debt-row]"));
    const debts = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const nameInput = row.querySelector('[data-field="name"]');
      const balanceInput = row.querySelector('[data-field="balance"]');
      const rateInput = row.querySelector('[data-field="rate"]');
      const paymentInput = row.querySelector('[data-field="payment"]');

      const balance = parseFloat(balanceInput?.value || "0");
      const rate = parseFloat(rateInput?.value || "0");
      const payment = parseFloat(paymentInput?.value || "0");

      if (!Number.isFinite(balance) || balance <= 0) {
        continue;
      }

      if (!Number.isFinite(rate) || rate < 0) {
        throw new Error("Interest rates must be zero or positive.");
      }

      if (!Number.isFinite(payment) || payment <= 0) {
        throw new Error("Minimum payments must be above zero.");
      }

      debts.push({
        name: nameInput?.value?.trim() || `Debt ${i + 1}`,
        balance,
        rate,
        minPayment: payment,
      });
    }

    if (debts.length === 0) {
      throw new Error("Please enter at least one debt with a positive balance.");
    }

    return debts;
  }

  function orderDebts(debts, method) {
    const active = debts.filter((debt) => debt.balance > 0.01);
    if (method === "avalanche") {
      active.sort((a, b) => {
        if (b.rate !== a.rate) return b.rate - a.rate;
        return a.balance - b.balance;
      });
    } else {
      active.sort((a, b) => {
        if (Math.abs(a.balance - b.balance) > 0.01) return a.balance - b.balance;
        return b.rate - a.rate;
      });
    }
    return active;
  }

  function simulatePayoff(debts, method, extraPayment) {
    const clones = debts.map((debt) => ({
      name: debt.name,
      balance: debt.balance,
      rate: debt.rate,
      minPayment: debt.minPayment,
      totalPaid: 0,
      interestPaid: 0,
    }));

    const history = [];
    let months = 0;
    const maxMonths = 600; // 50 years cap
    let stalled = false;
    let noProgressMonths = 0;

    while (months < maxMonths) {
      const remainingBalance = clones.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
      if (remainingBalance <= 0.01) break;

      months += 1;
      let monthInterest = 0;

      for (const debt of clones) {
        if (debt.balance <= 0) continue;
        const interest = (debt.balance * debt.rate) / 100 / 12;
        debt.balance += interest;
        debt.interestPaid += interest;
        monthInterest += interest;
      }

      let available = extraPayment;
      let monthPayment = 0;

      for (const debt of clones) {
        if (debt.balance <= 0) continue;
        const minPay = Math.min(debt.minPayment, debt.balance);
        if (minPay > 0) {
          debt.balance -= minPay;
          debt.totalPaid += minPay;
          monthPayment += minPay;
          if (debt.balance < 0) {
            available += -debt.balance;
            debt.balance = 0;
          }
        }
      }

      available = Math.max(available, 0);

      while (available > 0.01) {
        const targets = orderDebts(clones, method);
        if (targets.length === 0) break;
        const target = targets[0];
        const pay = Math.min(available, target.balance);
        target.balance -= pay;
        target.totalPaid += pay;
        monthPayment += pay;
        available -= pay;
        if (target.balance < 0) {
          available += -target.balance;
          target.balance = 0;
        }
      }

      const newBalance = clones.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
      history.push({ month: months, balance: newBalance, payment: monthPayment, interest: monthInterest });

      if (newBalance >= remainingBalance - 0.01 && monthInterest >= monthPayment - 0.01) {
        noProgressMonths += 1;
      } else {
        noProgressMonths = 0;
      }

      if (noProgressMonths >= 6) {
        stalled = true;
        break;
      }
    }

    const remaining = clones.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
    if (remaining > 0.01) {
      stalled = true;
    }

    const totalPaid = clones.reduce((sum, debt) => sum + debt.totalPaid, 0);
    const totalInterest = clones.reduce((sum, debt) => sum + debt.interestPaid, 0);

    return { months, totalPaid, totalInterest, history, debts: clones, stalled, remaining };
  }

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

  function payoffDate(startValue, months) {
    if (!startValue) return "—";
    const [year, month] = startValue.split("-").map((part) => parseInt(part, 10));
    if (!Number.isFinite(year) || !Number.isFinite(month)) return "—";
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function buildDebtTable(methodResult) {
    const rows = methodResult.debts
      .map((debt) => {
        return `<tr><td>${debt.name}</td><td>${currencyFormatter.format(debt.totalPaid)}</td><td>${currencyFormatter.format(debt.interestPaid)}</td></tr>`;
      })
      .join("");

    return `
      <div class="table-wrap" style="margin-top:18px;">
        <table>
          <thead>
            <tr>
              <th>Debt</th>
              <th>Total paid</th>
              <th>Interest paid</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function handleSubmit(event) {
    event.preventDefault();

    let debts;
    try {
      debts = parseDebts();
    } catch (error) {
      resultEl.innerHTML = `<section class="card"><p>${error.message}</p></section>`;
      return;
    }

    const extra = parseFloat(form.extra.value || "0");
    const extraPayment = Number.isFinite(extra) && extra > 0 ? extra : 0;
    const startMonth = form.start.value;

    const snowball = simulatePayoff(debts, "snowball", extraPayment);
    const avalanche = simulatePayoff(debts, "avalanche", extraPayment);

    const minimums = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    const budget = minimums + extraPayment;

    const snowballTimeline = snowball.stalled ? "Not paid off" : formatMonths(snowball.months);
    const avalancheTimeline = avalanche.stalled ? "Not paid off" : formatMonths(avalanche.months);

    const snowballDate = snowball.stalled ? "—" : payoffDate(startMonth, snowball.months);
    const avalancheDate = avalanche.stalled ? "—" : payoffDate(startMonth, avalanche.months);

    const interestDifference = snowball.totalInterest - avalanche.totalInterest;
    const recommendation = snowball.stalled
      ? "Minimum payments and extra cash aren't enough to pay off the debts. Increase the budget or negotiate lower rates."
      : avalanche.stalled
      ? "Avalanche results couldn't pay off the debts with the current budget."
      : interestDifference > 0
      ? `Avalanche saves ${currencyFormatter.format(interestDifference)} in interest versus snowball.`
      : interestDifference < 0
      ? `Snowball costs ${currencyFormatter.format(Math.abs(interestDifference))} less interest than avalanche.`
      : "Both methods cost the same in interest with this debt mix.";

    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Debt-free game plan</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Starting balance</span><span class="value">${currencyFormatter.format(totalBalance)}</span></div>
          <div class="stat"><span class="label">Minimum payments</span><span class="value">${currencyFormatter.format(minimums)}</span></div>
          <div class="stat"><span class="label">Extra payment</span><span class="value">${currencyFormatter.format(extraPayment)}</span></div>
          <div class="stat"><span class="label">Monthly budget</span><span class="value">${currencyFormatter.format(budget)}</span></div>
          <div class="stat"><span class="label">Snowball timeline</span><span class="value">${snowballTimeline}</span></div>
          <div class="stat"><span class="label">Avalanche timeline</span><span class="value">${avalancheTimeline}</span></div>
          <div class="stat"><span class="label">Snowball interest</span><span class="value">${currencyFormatter.format(snowball.totalInterest)}</span></div>
          <div class="stat"><span class="label">Avalanche interest</span><span class="value">${currencyFormatter.format(avalanche.totalInterest)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Months</th>
                <th>Interest paid</th>
                <th>Total paid</th>
                <th>Payoff date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Snowball</td>
                <td>${snowball.stalled ? "—" : snowball.months}</td>
                <td>${currencyFormatter.format(snowball.totalInterest)}</td>
                <td>${currencyFormatter.format(snowball.totalPaid)}</td>
                <td>${snowballDate}</td>
              </tr>
              <tr>
                <td>Avalanche</td>
                <td>${avalanche.stalled ? "—" : avalanche.months}</td>
                <td>${currencyFormatter.format(avalanche.totalInterest)}</td>
                <td>${currencyFormatter.format(avalanche.totalPaid)}</td>
                <td>${avalancheDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">${recommendation}</p>
        <h3 style="margin-top:18px;">Snowball payoff by account</h3>
        ${buildDebtTable(snowball)}
        <h3 style="margin-top:18px;">Avalanche payoff by account</h3>
        ${buildDebtTable(avalanche)}
      </section>
    `;
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
      ensureRows();
    }, 0);
  });
})();
