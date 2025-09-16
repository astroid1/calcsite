(function () {
  const form = document.getElementById("water-form");
  const resultEl = document.getElementById("water-result");
  const unitSelect = document.getElementById("water-units");
  const weightUnitEl = document.getElementById("water-weight-unit");
  const weightInput = document.getElementById("water-weight");
  const activityInput = document.getElementById("water-activity");
  const climateSelect = document.getElementById("water-climate");

  if (!form || !resultEl || !unitSelect || !weightUnitEl || !weightInput || !activityInput || !climateSelect) {
    return;
  }

  const PLACEHOLDERS = { metric: "70", imperial: "154" };
  const CLIMATE_FACTORS = {
    temperate: 1,
    warm: 1.1,
    hot: 1.2,
  };

  function updateUnits() {
    const unit = unitSelect.value === "imperial" ? "imperial" : "metric";
    weightUnitEl.textContent = unit === "imperial" ? "(lb)" : "(kg)";
    weightInput.placeholder = PLACEHOLDERS[unit];
  }

  function formatLiters(value) {
    return `${value.toFixed(2)} L`;
  }

  function formatOunces(value) {
    return `${value.toFixed(0)} oz`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const units = unitSelect.value === "imperial" ? "imperial" : "metric";
    const weightVal = parseFloat(weightInput.value || "0");
    const activityMinutes = parseFloat(activityInput.value || "0");
    const climate = climateSelect.value;

    if (!Number.isFinite(weightVal) || weightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a body weight above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(activityMinutes) || activityMinutes < 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter daily active minutes as zero or more.</p></section>`;
      return;
    }

    const weightKg = units === "imperial" ? weightVal * 0.45359237 : weightVal;
    const baseLiters = weightKg * 0.033;
    const exerciseLiters = (activityMinutes / 30) * 0.35;
    const multiplier = CLIMATE_FACTORS[climate] ?? 1;
    const totalLiters = (baseLiters + exerciseLiters) * multiplier;
    const adjustedBase = baseLiters + exerciseLiters;
    const climateBonus = Math.max(0, totalLiters - adjustedBase);
    const ounces = totalLiters * 33.8140226;
    const cups = ounces / 8;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Suggested hydration: ${formatLiters(totalLiters)}</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Base need</span><span class="value">${formatLiters(baseLiters)}</span><span class="helper" style="margin-top:6px;">≈33 ml × body weight (kg)</span></div>
          <div class="stat"><span class="label">Exercise boost</span><span class="value">${formatLiters(
            exerciseLiters
          )}</span><span class="helper" style="margin-top:6px;">${activityMinutes.toFixed(0)} min active</span></div>
          <div class="stat"><span class="label">Climate adjustment</span><span class="value">${formatLiters(
            climateBonus
          )}</span><span class="helper" style="margin-top:6px;">${multiplier.toFixed(2)}× multiplier</span></div>
          <div class="stat"><span class="label">Daily target</span><span class="value">${formatLiters(
            totalLiters
          )}</span><span class="helper" style="margin-top:6px;">≈${formatOunces(ounces)} · ${cups.toFixed(1)} cups</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Sip steadily throughout the day and adjust upward on especially hard training days. Check with your doctor if you have fluid restrictions.</p>
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      updateUnits();
      resultEl.innerHTML = "";
    }, 0);
  });

  unitSelect.addEventListener("change", updateUnits);
  updateUnits();
})();
