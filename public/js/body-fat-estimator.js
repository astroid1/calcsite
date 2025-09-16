(function () {
  const form = document.getElementById("body-fat-form");
  const resultEl = document.getElementById("body-fat-result");
  const unitSelect = document.getElementById("body-fat-units");
  const sexSelect = document.getElementById("body-fat-sex");
  const hipGroup = document.getElementById("body-fat-hip-group");
  const weightUnitEl = document.getElementById("body-fat-weight-unit");
  const heightUnitEl = document.getElementById("body-fat-height-unit");
  const neckUnitEl = document.getElementById("body-fat-neck-unit");
  const waistUnitEl = document.getElementById("body-fat-waist-unit");
  const hipUnitEl = document.getElementById("body-fat-hip-unit");
  const weightInput = document.getElementById("body-fat-weight");
  const heightInput = document.getElementById("body-fat-height");
  const neckInput = document.getElementById("body-fat-neck");
  const waistInput = document.getElementById("body-fat-waist");
  const hipInput = document.getElementById("body-fat-hip");

  if (
    !form ||
    !resultEl ||
    !unitSelect ||
    !sexSelect ||
    !hipGroup ||
    !weightUnitEl ||
    !heightUnitEl ||
    !neckUnitEl ||
    !waistUnitEl ||
    !hipUnitEl ||
    !weightInput ||
    !heightInput ||
    !neckInput ||
    !waistInput ||
    !hipInput
  ) {
    return;
  }

  const PLACEHOLDERS = {
    metric: { weight: "75", height: "175", neck: "38", waist: "85", hip: "95" },
    imperial: { weight: "165", height: "69", neck: "15", waist: "34", hip: "37" },
  };

  function updateUnits() {
    const unit = unitSelect.value === "imperial" ? "imperial" : "metric";
    if (unit === "imperial") {
      weightUnitEl.textContent = "(lb)";
      heightUnitEl.textContent = "(in)";
      neckUnitEl.textContent = "(in)";
      waistUnitEl.textContent = "(in)";
      hipUnitEl.textContent = "(in)";
    } else {
      weightUnitEl.textContent = "(kg)";
      heightUnitEl.textContent = "(cm)";
      neckUnitEl.textContent = "(cm)";
      waistUnitEl.textContent = "(cm)";
      hipUnitEl.textContent = "(cm)";
    }
    weightInput.placeholder = PLACEHOLDERS[unit].weight;
    heightInput.placeholder = PLACEHOLDERS[unit].height;
    neckInput.placeholder = PLACEHOLDERS[unit].neck;
    waistInput.placeholder = PLACEHOLDERS[unit].waist;
    hipInput.placeholder = PLACEHOLDERS[unit].hip;
  }

  function updateHipVisibility() {
    const isFemale = sexSelect.value === "female";
    hipGroup.style.display = isFemale ? "block" : "none";
    if (!isFemale) {
      hipInput.value = "";
    }
  }

  function log10(value) {
    return Math.log(value) / Math.log(10);
  }

  function categoryFor(sex, bodyFat) {
    if (sex === "female") {
      if (bodyFat < 14) return "Essential";
      if (bodyFat < 21) return "Athlete";
      if (bodyFat < 25) return "Fitness";
      if (bodyFat < 32) return "Average";
      return "Above average";
    }
    if (bodyFat < 6) return "Essential";
    if (bodyFat < 14) return "Athlete";
    if (bodyFat < 18) return "Fitness";
    if (bodyFat < 25) return "Average";
    return "Above average";
  }

  function formatMass(kg, units) {
    const pounds = kg * 2.2046226218;
    if (units === "imperial") {
      return `${pounds.toFixed(1)} lb (${kg.toFixed(1)} kg)`;
    }
    return `${kg.toFixed(1)} kg (${pounds.toFixed(1)} lb)`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const sex = sexSelect.value === "female" ? "female" : "male";
    const units = unitSelect.value === "imperial" ? "imperial" : "metric";

    const weightVal = parseFloat(weightInput.value || "0");
    const heightVal = parseFloat(heightInput.value || "0");
    const neckVal = parseFloat(neckInput.value || "0");
    const waistVal = parseFloat(waistInput.value || "0");
    const hipVal = parseFloat(hipInput.value || "0");

    if (!Number.isFinite(weightVal) || weightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a body weight above zero.</p></section>`;
      return;
    }
    if (!Number.isFinite(heightVal) || heightVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a height above zero.</p></section>`;
      return;
    }
    if (!Number.isFinite(neckVal) || neckVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a neck measurement above zero.</p></section>`;
      return;
    }
    if (!Number.isFinite(waistVal) || waistVal <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a waist measurement above zero.</p></section>`;
      return;
    }
    if (sex === "female" && (!Number.isFinite(hipVal) || hipVal <= 0)) {
      resultEl.innerHTML = `<section class="card"><p>Enter a hip measurement above zero for the female formula.</p></section>`;
      return;
    }

    const heightIn = units === "imperial" ? heightVal : heightVal / 2.54;
    const neckIn = units === "imperial" ? neckVal : neckVal / 2.54;
    const waistIn = units === "imperial" ? waistVal : waistVal / 2.54;
    const hipIn = units === "imperial" ? hipVal : hipVal / 2.54;

    if (sex === "male" && waistIn - neckIn <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Waist must be larger than neck for the male formula.</p></section>`;
      return;
    }
    if (sex === "female" && waistIn + hipIn - neckIn <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Waist plus hip must be larger than neck for the female formula.</p></section>`;
      return;
    }

    let bodyFat;
    if (sex === "male") {
      bodyFat = 495 / (1.0324 - 0.19077 * log10(waistIn - neckIn) + 0.15456 * log10(heightIn)) - 450;
    } else {
      bodyFat = 495 /
        (1.29579 - 0.35004 * log10(waistIn + hipIn - neckIn) + 0.221 * log10(heightIn)) -
        450;
    }

    if (!Number.isFinite(bodyFat) || bodyFat <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Unable to calculate body fat with these numbers. Double-check your measurements.</p></section>`;
      return;
    }

    const weightKg = units === "imperial" ? weightVal * 0.45359237 : weightVal;
    const fatMassKg = weightKg * (bodyFat / 100);
    const leanMassKg = weightKg - fatMassKg;

    const category = categoryFor(sex, bodyFat);
    const leanDisplay = formatMass(leanMassKg, units);
    const fatDisplay = formatMass(fatMassKg, units);

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Estimated body fat: ${bodyFat.toFixed(1)}%</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Category</span><span class="value">${category}</span></div>
          <div class="stat"><span class="label">Lean body mass</span><span class="value">${leanDisplay}</span></div>
          <div class="stat"><span class="label">Fat mass</span><span class="value">${fatDisplay}</span></div>
          <div class="stat"><span class="label">Tape inputs</span><span class="value">${sex === "female" ? "Waist + hip − neck" : "Waist − neck"}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">This method provides an estimate. For a medical evaluation, use a DEXA scan or consult a qualified professional.</p>
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      updateUnits();
      updateHipVisibility();
      resultEl.innerHTML = "";
    }, 0);
  });

  unitSelect.addEventListener("change", updateUnits);
  sexSelect.addEventListener("change", updateHipVisibility);
  updateUnits();
  updateHipVisibility();
})();
