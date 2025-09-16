(function () {
  if (typeof window === "undefined") return;

  const form = document.getElementById("event-budget-form");
  const statusEl = document.getElementById("event-status");
  const resultEl = document.getElementById("event-result");

  if (!form || !statusEl || !resultEl) return;

  function parseMoney(value) {
    if (!value) return 0;
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function formatCurrency(amount) {
    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function buildBreakdownRows(entries) {
    return entries
      .filter((entry) => entry.amount > 0)
      .map(
        (entry) =>
          `<tr><td>${entry.label}</td><td style="text-align:right;">${formatCurrency(entry.amount)}</td></tr>`
      )
      .join("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const guests = Number(form.guests.value);
    if (!Number.isFinite(guests) || guests <= 0) {
      statusEl.textContent = "Enter the guest count to build a budget.";
      resultEl.innerHTML = "";
      return;
    }

    const hours = Number(form.hours.value) > 0 ? Number(form.hours.value) : null;
    const name = form.name.value ? form.name.value.trim() : "Your event";

    const venue = parseMoney(form.venue.value);
    const decor = parseMoney(form.decor.value);
    const entertainment = parseMoney(form.entertainment.value);
    const staff = parseMoney(form.staff.value);
    const foodPerGuest = parseMoney(form.food.value);
    const drinkPerGuest = parseMoney(form.drink.value);
    const extrasPerGuest = parseMoney(form.extras.value);
    const servicePercent = Number(form.service.value) || 0;
    const contingencyPercent = Number(form.contingency.value) || 0;

    const perGuestTotal = foodPerGuest + drinkPerGuest + extrasPerGuest;
    const variableTotal = perGuestTotal * guests;
    const fixedTotal = venue + decor + entertainment + staff;
    const subtotal = fixedTotal + variableTotal;
    const serviceFee = (servicePercent / 100) * subtotal;
    const preContingency = subtotal + serviceFee;
    const contingency = (contingencyPercent / 100) * preContingency;
    const grandTotal = preContingency + contingency;
    const perGuestCost = grandTotal / guests;
    const perHour = hours ? grandTotal / hours : null;

    const breakdown = [
      { label: "Venue & rentals", amount: venue },
      { label: "Decor & design", amount: decor },
      { label: "Entertainment", amount: entertainment },
      { label: "Staffing & labor", amount: staff },
      { label: "Food (variable)", amount: foodPerGuest * guests },
      { label: "Beverage (variable)", amount: drinkPerGuest * guests },
      { label: "Extras (variable)", amount: extrasPerGuest * guests },
      { label: `Service charge (${servicePercent.toFixed(1)}%)`, amount: serviceFee },
      { label: `Contingency (${contingencyPercent.toFixed(1)}%)`, amount: contingency },
    ];

    statusEl.textContent = `Estimated total budget: ${formatCurrency(grandTotal)} (${formatCurrency(
      perGuestCost
    )} per guest).`;

    resultEl.innerHTML = `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">${name} budget summary</h2>
        <ul class="result-list">
          <li><strong>Guests:</strong> ${guests.toLocaleString()}</li>
          <li><strong>Per-guest spend:</strong> ${formatCurrency(perGuestCost)}</li>
          <li><strong>Subtotal before fees:</strong> ${formatCurrency(subtotal)}</li>
          <li><strong>Service & contingency:</strong> ${formatCurrency(serviceFee + contingency)}</li>
          <li><strong>Total event cost:</strong> ${formatCurrency(grandTotal)}</li>
          ${
            perHour
              ? `<li><strong>Cost per hour (approx.):</strong> ${formatCurrency(perHour)}</li>`
              : ""
          }
        </ul>
        <h3>Line-item breakdown</h3>
        <table class="table" style="width:100%;">
          <tbody>
            ${buildBreakdownRows(breakdown)}
          </tbody>
        </table>
        <p class="helper">
          Variable costs scale directly with guest count. Try adjusting service or contingency percentages to build in a safety
          buffer for tips, overtime, or last-minute add-ons.
        </p>
      </div>
    `;
  }

  function handleReset() {
    statusEl.textContent = "Enter at least a guest count to see the budget.";
    resultEl.innerHTML = "";
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    window.requestAnimationFrame(handleReset);
  });
})();
