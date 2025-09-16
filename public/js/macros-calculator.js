(function () {
  const form = document.getElementById("macros-form");
  const resultEl = document.getElementById("macros-result");
  const unitSelect = document.getElementById("macros-units");
  const weightUnitEl = document.getElementById("macros-weight-unit");
  const weightInput = document.getElementById("macros-weight");
  const caloriesInput = document.getElementById("macros-calories");
  const goalSelect = document.getElementById("macro-goal");
  const customFields = document.getElementById("custom-macro-fields");
  const customProtein = document.getElementById("macro-protein");
  const customCarbs = document.getElementById("macro-carbs");
  const customFat = document.getElementById("macro-fat");

  if (
    !form ||
    !resultEl ||
    !unitSelect ||
    !weightUnitEl ||
    !weightInput ||
    !caloriesInput ||
    !goalSelect ||
    !customFields ||
    !customProtein ||
    !customCarbs ||
    !customFat
  ) {
    return;
  }

  const PLACEHOLDERS = { metric: "75", imperial: "165" };

  function updateUnits() {
    const unit = unitSelect.value === "imperial" ? "imperial" : "metric";
    weightUnitEl.textContent = unit === "imperial" ? "(lb)" : "(kg)";
    weightInput.placeholder = PLACEHOLDERS[unit];
  }

  function handleGoalChange() {
    if (goalSelect.value === "custom") {
      customFields.style.display = "block";
    } else {
      customFields.style.display = "none";
      customProtein.value = "";
      customCarbs.value = "";
      customFat.value = "";
    }
  }

  function formatMacro(grams, percent) {
    return `${Math.round(grams)} g (${Math.round(percent * 100)}%)`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const units = unitSelect.value === "imperial" ? "imperial" : "metric";
    const weightVal = parseFloat(weightInput.value || "0");
    const caloriesVal = parseFloat(caloriesInput.value || "0");

    if (!Number.isFinite(weightVal) || weightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a body weight above zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(caloriesVal) || caloriesVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a calorie goal above zero.</p></section>`;
      return;
    }

    let proteinPct;
    let carbPct;
    let fatPct;
    const selectedOption = goalSelect.options[goalSelect.selectedIndex];
    let splitLabel = selectedOption?.textContent || "";

    if (goalSelect.value === "custom") {
      const proteinPercent = parseFloat(customProtein.value || "0");
      const carbPercent = parseFloat(customCarbs.value || "0");
      const fatPercent = parseFloat(customFat.value || "0");
      const total = proteinPercent + carbPercent + fatPercent;

      if (
        !Number.isFinite(proteinPercent) ||
        !Number.isFinite(carbPercent) ||
        !Number.isFinite(fatPercent)
      ) {
        resultEl.innerHTML = `<section class="card"><p>Enter percentages for protein, carbs, and fat.</p></section>`;
        return;
      }

      if (proteinPercent < 0 || carbPercent < 0 || fatPercent < 0) {
        resultEl.innerHTML = `<section class="card"><p>Custom percentages cannot be negative.</p></section>`;
        return;
      }

      if (proteinPercent > 100 || carbPercent > 100 || fatPercent > 100) {
        resultEl.innerHTML = `<section class="card"><p>Each macro percentage should be 100% or less.</p></section>`;
        return;
      }

      if (total <= 0) {
        resultEl.innerHTML = `<section class="card"><p>Custom macro percentages must add up to more than zero.</p></section>`;
        return;
      }

      if (Math.abs(total - 100) > 0.5) {
        resultEl.innerHTML = `<section class="card"><p>Custom macro percentages should total 100%. You're currently at ${total.toFixed(
          1
        )}%.</p></section>`;
        return;
      }

      proteinPct = proteinPercent / 100;
      carbPct = carbPercent / 100;
      fatPct = fatPercent / 100;
      splitLabel = `Custom split (${proteinPercent.toFixed(0)} / ${carbPercent.toFixed(0)} / ${fatPercent.toFixed(0)}%)`;
    } else {
      proteinPct = parseFloat(selectedOption?.dataset.protein || "0");
      carbPct = parseFloat(selectedOption?.dataset.carbs || "0");
      fatPct = parseFloat(selectedOption?.dataset.fat || "0");
    }

    if (
      !Number.isFinite(proteinPct) ||
      !Number.isFinite(carbPct) ||
      !Number.isFinite(fatPct) ||
      proteinPct + carbPct + fatPct <= 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Unable to read the macro split. Try choosing another option.</p></section>`;
      return;
    }

    const weightKg = units === "imperial" ? weightVal * 0.45359237 : weightVal;
    const weightLb = weightKg * 2.2046226218;

    const proteinGrams = (caloriesVal * proteinPct) / 4;
    const carbGrams = (caloriesVal * carbPct) / 4;
    const fatGrams = (caloriesVal * fatPct) / 9;
    const proteinPerKg = proteinGrams / weightKg;
    const proteinPerLb = proteinGrams / weightLb;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${caloriesVal.toLocaleString()} kcal macro plan</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Protein</span><span class="value">${formatMacro(
            proteinGrams,
            proteinPct
          )}</span></div>
          <div class="stat"><span class="label">Carbohydrates</span><span class="value">${formatMacro(
            carbGrams,
            carbPct
          )}</span></div>
          <div class="stat"><span class="label">Fats</span><span class="value">${formatMacro(
            fatGrams,
            fatPct
          )}</span></div>
          <div class="stat"><span class="label">Protein density</span><span class="value">${proteinPerKg.toFixed(
            2
          )} g/kg · ${proteinPerLb.toFixed(2)} g/lb</span></div>
          <div class="stat"><span class="label">Macro split</span><span class="value">${splitLabel}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Pair these targets with whole foods, fiber, and plenty of water. Reassess every few weeks based on gym performance and recovery.</p>
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      updateUnits();
      handleGoalChange();
      resultEl.innerHTML = "";
    }, 0);
  });

  unitSelect.addEventListener("change", updateUnits);
  goalSelect.addEventListener("change", handleGoalChange);
  updateUnits();
  handleGoalChange();
})();
