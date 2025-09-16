(function () {
  const form = document.getElementById("overtime-form");
  const resultEl = document.getElementById("overtime-result");

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

    const rate = parseFloat(form.rate.value || "0");
    const regularHours = parseFloat(form.regularHours.value || "0");
    const overtimeHours = parseFloat(form.overtimeHours.value || "0");
    const multiplier = parseFloat(form.multiplier.value || "1.5");
    const doubleHours = parseFloat(form.doubleHours.value || "0");
    const bonus = parseFloat(form.bonus.value || "0");

    if (!Number.isFinite(rate) || rate <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Please enter a base hourly rate above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(regularHours) || regularHours < 0) {
      resultEl.innerHTML = `<section class="card"><p>Regular hours cannot be negative.</p></section>`;
      return;
    }

    const otHours = Number.isFinite(overtimeHours) && overtimeHours > 0 ? overtimeHours : 0;
    const otMultiplier = Number.isFinite(multiplier) && multiplier >= 1 ? multiplier : 1.5;
    const dblHours = Number.isFinite(doubleHours) && doubleHours > 0 ? doubleHours : 0;
    const flatBonus = Number.isFinite(bonus) && bonus > 0 ? bonus : 0;

    const totalHours = regularHours + otHours + dblHours;
    if (totalHours <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Add at least one hour of work to calculate pay.</p></section>`;
      return;
    }

    const regularPay = rate * regularHours;
    const overtimeBase = rate * otHours;
    const overtimePremium = rate * Math.max(otMultiplier - 1, 0) * otHours;
    const doubleBase = rate * dblHours;
    const doublePremium = rate * dblHours; // double time is 2× base pay

    const totalPay =
      regularPay +
      overtimeBase +
      overtimePremium +
      doubleBase +
      doublePremium +
      flatBonus;

    const baseIfNoPremiums = rate * totalHours;
    const extraFromOvertime = totalPay - baseIfNoPremiums;
    const effectiveHourly = totalPay / totalHours;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Total pay: ${currencyFormatter.format(totalPay)}</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Regular pay</span><span class="value">${currencyFormatter.format(regularPay)}</span></div>
          <div class="stat"><span class="label">Overtime pay</span><span class="value">${currencyFormatter.format(overtimeBase + overtimePremium)}</span></div>
          <div class="stat"><span class="label">Double-time pay</span><span class="value">${currencyFormatter.format(doubleBase + doublePremium)}</span></div>
          <div class="stat"><span class="label">Bonuses & stipends</span><span class="value">${currencyFormatter.format(flatBonus)}</span></div>
          <div class="stat"><span class="label">Total hours</span><span class="value">${numberFormatter.format(totalHours)} hrs</span></div>
          <div class="stat"><span class="label">Effective hourly rate</span><span class="value">${currencyFormatter.format(effectiveHourly)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:18px;">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Hours</th>
                <th>Pay</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Regular time</td><td>${numberFormatter.format(regularHours)}</td><td>${currencyFormatter.format(regularPay)}</td></tr>
              <tr><td>Overtime (${numberFormatter.format(otMultiplier)}×)</td><td>${numberFormatter.format(otHours)}</td><td>${currencyFormatter.format(overtimeBase + overtimePremium)}</td></tr>
              <tr><td>Double time (2×)</td><td>${numberFormatter.format(dblHours)}</td><td>${currencyFormatter.format(doubleBase + doublePremium)}</td></tr>
              <tr><td>Premium earned</td><td>—</td><td>${currencyFormatter.format(extraFromOvertime)}</td></tr>
              <tr><td>Bonus</td><td>—</td><td>${currencyFormatter.format(flatBonus)}</td></tr>
            </tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Base pay for all hours at the standard rate would be ${currencyFormatter.format(baseIfNoPremiums)}; overtime rules add ${currencyFormatter.format(extraFromOvertime)} in premiums.</p>
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
