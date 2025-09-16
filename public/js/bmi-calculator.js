(function () {
  const form = document.getElementById("bmi-form");
  const resultEl = document.getElementById("bmi-result");
  const unitSelect = document.getElementById("bmi-units");
  const heightUnitEl = document.getElementById("bmi-height-unit");
  const weightUnitEl = document.getElementById("bmi-weight-unit");
  const heightInput = document.getElementById("bmi-height");
  const weightInput = document.getElementById("bmi-weight");

  if (!form || !resultEl || !unitSelect || !heightUnitEl || !weightUnitEl || !heightInput || !weightInput) {
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

  function classifyBmi(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy weight";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obesity class I";
    if (bmi < 40) return "Obesity class II";
    return "Obesity class III";
  }

  function formatWeight(kg, units) {
    if (units === "imperial") {
      return `${(kg * 2.2046226218).toFixed(1)} lb`;
    }
    return `${kg.toFixed(1)} kg`;
  }

  function renderResult({ bmi, units, heightCm, weightKg }) {
    const bmiRounded = bmi.toFixed(1);
    const category = classifyBmi(bmi);
    const heightDisplay =
      units === "imperial" ? `${(heightCm / 2.54).toFixed(1)} in` : `${heightCm.toFixed(1)} cm`;

    const healthyMinKg = 18.5 * Math.pow(heightCm / 100, 2);
    const healthyMaxKg = 24.9 * Math.pow(heightCm / 100, 2);

    const rangePrimary =
      units === "imperial"
        ? `${(healthyMinKg * 2.2046226218).toFixed(1)} – ${(healthyMaxKg * 2.2046226218).toFixed(1)} lb`
        : `${healthyMinKg.toFixed(1)} – ${healthyMaxKg.toFixed(1)} kg`;
    const rangeSecondary =
      units === "imperial"
        ? `${healthyMinKg.toFixed(1)} – ${healthyMaxKg.toFixed(1)} kg`
        : `${(healthyMinKg * 2.2046226218).toFixed(1)} – ${(healthyMaxKg * 2.2046226218).toFixed(1)} lb`;

    let changeMessage = "Already in the healthy BMI range";
    if (bmi < 18.5) {
      const gainKg = Math.max(0, healthyMinKg - weightKg);
      changeMessage = `Gain about ${formatWeight(gainKg, units)} to reach a BMI of 18.5.`;
    } else if (bmi > 24.9) {
      const loseKg = Math.max(0, weightKg - healthyMaxKg);
      changeMessage = `Lose about ${formatWeight(loseKg, units)} to reach a BMI of 24.9.`;
    }

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">BMI: ${bmiRounded}</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Category</span><span class="value">${category}</span></div>
          <div class="stat"><span class="label">Healthy weight range</span><span class="value">${rangePrimary}</span><span class="helper" style="margin-top:6px;">${rangeSecondary}</span></div>
          <div class="stat"><span class="label">Entered height</span><span class="value">${heightDisplay}</span></div>
          <div class="stat"><span class="label">Adjustment guide</span><span class="value">${changeMessage}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">BMI is a screening tool and can read high for athletes with more muscle mass. Check in with a clinician for a full assessment.</p>
      </section>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const units = unitSelect.value === "imperial" ? "imperial" : "metric";
    const heightInputValue = parseFloat(heightInput.value || "0");
    const weightInputValue = parseFloat(weightInput.value || "0");

    if (!Number.isFinite(heightInputValue) || heightInputValue <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a height greater than zero.</p></section>`;
      return;
    }

    if (!Number.isFinite(weightInputValue) || weightInputValue <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a weight greater than zero.</p></section>`;
      return;
    }

    const heightCm = units === "imperial" ? heightInputValue * 2.54 : heightInputValue;
    const weightKg = units === "imperial" ? weightInputValue * 0.45359237 : weightInputValue;
    const heightMeters = heightCm / 100;

    if (heightMeters <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Height must be greater than zero.</p></section>`;
      return;
    }

    const bmi = weightKg / Math.pow(heightMeters, 2);
    if (!Number.isFinite(bmi) || bmi <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Unable to calculate BMI. Check your entries.</p></section>`;
      return;
    }

    renderResult({ bmi, units, heightCm, weightKg });
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
