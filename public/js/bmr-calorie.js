(function () {
  const form = document.getElementById("bmr-form");
  const resultEl = document.getElementById("bmr-result");
  const unitSelect = document.getElementById("bmr-units");
  const heightUnitEl = document.getElementById("bmr-height-unit");
  const weightUnitEl = document.getElementById("bmr-weight-unit");
  const heightInput = document.getElementById("bmr-height");
  const weightInput = document.getElementById("bmr-weight");
  const activitySelect = document.getElementById("bmr-activity");

  if (
    !form ||
    !resultEl ||
    !unitSelect ||
    !heightUnitEl ||
    !weightUnitEl ||
    !heightInput ||
    !weightInput ||
    !activitySelect
  ) {
    return;
  }

  const PLACEHOLDERS = {
    metric: { height: "170", weight: "70" },
    imperial: { height: "67", weight: "154" },
  };

  function updateUnits() {
    const unit = unitSelect.value === "imperial" ? "imperial" : "metric";
    if (unit === "imperial") {
      heightUnitEl.textContent = "(in)";
      weightUnitEl.textContent = "(lb)";
    } else {
      heightUnitEl.textContent = "(cm)";
      weightUnitEl.textContent = "(kg)";
    }
    heightInput.placeholder = PLACEHOLDERS[unit].height;
    weightInput.placeholder = PLACEHOLDERS[unit].weight;
  }

  function roundToTen(value) {
    return Math.round(value / 10) * 10;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const gender = form.gender?.value || "female";
    const age = parseFloat(form.age?.value || "0");
    const units = unitSelect.value === "imperial" ? "imperial" : "metric";
    const heightVal = parseFloat(heightInput.value || "0");
    const weightVal = parseFloat(weightInput.value || "0");
    const activityFactor = parseFloat(activitySelect.value || "1");
    const activityLabel = activitySelect.options[activitySelect.selectedIndex]?.textContent || "";

    if (!Number.isFinite(age) || age <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter an age above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(heightVal) || heightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a height above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(weightVal) || weightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a weight above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(activityFactor) || activityFactor <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Select an activity level.</p></section>`;
      return;
    }

    const heightCm = units === "imperial" ? heightVal * 2.54 : heightVal;
    const weightKg = units === "imperial" ? weightVal * 0.45359237 : weightVal;

    const bmr =
      10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);

    const maintenance = bmr * activityFactor;
    const mildDeficit = Math.max(maintenance - 250, bmr * 0.95);
    const moderateDeficit = Math.max(maintenance - 500, bmr * 0.9);
    const surplus = maintenance + 250;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Daily energy targets</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Basal metabolic rate</span><span class="value">${roundToTen(
            bmr
          ).toLocaleString()} kcal</span></div>
          <div class="stat"><span class="label">Maintenance calories</span><span class="value">${roundToTen(
            maintenance
          ).toLocaleString()} kcal</span><span class="helper" style="margin-top:6px;">${activityLabel}</span></div>
          <div class="stat"><span class="label">Gentle deficit</span><span class="value">${roundToTen(
            mildDeficit
          ).toLocaleString()} kcal</span><span class="helper" style="margin-top:6px;">≈250 kcal below maintenance</span></div>
          <div class="stat"><span class="label">Moderate deficit</span><span class="value">${roundToTen(
            moderateDeficit
          ).toLocaleString()} kcal</span><span class="helper" style="margin-top:6px;">≈500 kcal below maintenance</span></div>
          <div class="stat"><span class="label">Lean bulk</span><span class="value">${roundToTen(
            surplus
          ).toLocaleString()} kcal</span><span class="helper" style="margin-top:6px;">≈250 kcal above maintenance</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Calorie ranges are estimates—monitor energy, recovery, and progress, and adjust weekly if needed.</p>
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
