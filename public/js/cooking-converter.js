(function () {
  const form = document.getElementById("cooking-form");
  const amountInput = document.getElementById("cooking-amount");
  const fromSelect = document.getElementById("cooking-from");
  const toSelect = document.getElementById("cooking-to");
  const resultEl = document.getElementById("cooking-result");

  if (!form || !amountInput || !fromSelect || !toSelect || !resultEl) {
    return;
  }

  const units = [
    { id: "cup", label: "Cups (US)", factor: 236.5882365 },
    { id: "metricCup", label: "Metric cups", factor: 250 },
    { id: "tablespoon", label: "Tablespoons (Tbsp)", factor: 14.78676478125 },
    { id: "teaspoon", label: "Teaspoons (tsp)", factor: 4.92892159375 },
    { id: "fluidOunce", label: "Fluid ounces (fl oz)", factor: 29.5735295625 },
    { id: "milliliter", label: "Milliliters (mL)", factor: 1 },
    { id: "liter", label: "Liters (L)", factor: 1000 },
    { id: "gram", label: "Grams (g)", factor: 1 },
    { id: "kilogram", label: "Kilograms (kg)", factor: 1000 },
    { id: "ounce", label: "Ounces (oz)", factor: 28.349523125 },
    { id: "pound", label: "Pounds (lb)", factor: 453.59237 },
  ];

  const unitLookup = units.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {});

  function populateSelect(select) {
    select.innerHTML = "";
    units.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = unit.label;
      select.appendChild(option);
    });
  }

  function formatValue(value) {
    if (!Number.isFinite(value)) {
      return "-";
    }
    const abs = Math.abs(value);
    let maximumFractionDigits = 4;
    if (abs >= 1000) {
      maximumFractionDigits = 2;
    } else if (abs < 1) {
      maximumFractionDigits = 6;
    }
    return value.toLocaleString(undefined, {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    });
  }

  function convert() {
    const amount = Number.parseFloat(amountInput.value);
    const fromUnit = unitLookup[fromSelect.value];
    const toUnit = unitLookup[toSelect.value];

    if (!Number.isFinite(amount)) {
      resultEl.innerHTML = `<section class="card"><p>Enter a valid quantity to convert.</p></section>`;
      return;
    }

    if (!fromUnit || !toUnit) {
      resultEl.innerHTML = `<section class="card"><p>Select both a source and target unit.</p></section>`;
      return;
    }

    const baseValue = amount * fromUnit.factor;
    const converted = baseValue / toUnit.factor;

    const rows = units
      .map((unit) => {
        const value = baseValue / unit.factor;
        return `<tr><th scope="row">${unit.label}</th><td>${formatValue(value)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatValue(amount)} ${fromUnit.label} = ${formatValue(converted)} ${toUnit.label}</h2>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <thead>
              <tr><th scope="col">Unit</th><th scope="col">Amount</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Assumes water density for volume ↔ weight conversions. Adjust for specific ingredients as needed.</p>
      </section>
    `;
  }

  populateSelect(fromSelect);
  populateSelect(toSelect);
  const defaultToIndex = units.findIndex((unit) => unit.id === "tablespoon");
  toSelect.selectedIndex = defaultToIndex >= 0 ? defaultToIndex : 1;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    convert();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      amountInput.value = "1";
      fromSelect.selectedIndex = 0;
      toSelect.selectedIndex = defaultToIndex >= 0 ? defaultToIndex : 1;
      resultEl.innerHTML = "";
    }, 0);
  });

  amountInput.addEventListener("input", convert);
  fromSelect.addEventListener("change", convert);
  toSelect.addEventListener("change", convert);

  convert();
})();
