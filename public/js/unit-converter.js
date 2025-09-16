(function () {
  const form = document.getElementById("unit-form");
  const categorySelect = document.getElementById("unit-category");
  const fromSelect = document.getElementById("unit-from");
  const toSelect = document.getElementById("unit-to");
  const amountInput = document.getElementById("unit-amount");
  const resultEl = document.getElementById("unit-result");

  if (
    !form ||
    !categorySelect ||
    !fromSelect ||
    !toSelect ||
    !amountInput ||
    !resultEl
  ) {
    return;
  }

  const linearUnit = (label, factor) => ({
    label,
    toBase: (value) => value * factor,
    fromBase: (value) => value / factor,
  });

  const unitGroups = {
    length: {
      label: "Length",
      units: {
        meter: linearUnit("Meters (m)", 1),
        kilometer: linearUnit("Kilometers (km)", 1000),
        centimeter: linearUnit("Centimeters (cm)", 0.01),
        millimeter: linearUnit("Millimeters (mm)", 0.001),
        micrometer: linearUnit("Micrometers (µm)", 0.000001),
        mile: linearUnit("Miles (mi)", 1609.344),
        yard: linearUnit("Yards (yd)", 0.9144),
        foot: linearUnit("Feet (ft)", 0.3048),
        inch: linearUnit("Inches (in)", 0.0254),
        nauticalMile: linearUnit("Nautical miles (NM)", 1852),
      },
    },
    weight: {
      label: "Weight",
      units: {
        gram: linearUnit("Grams (g)", 1),
        kilogram: linearUnit("Kilograms (kg)", 1000),
        milligram: linearUnit("Milligrams (mg)", 0.001),
        metricTon: linearUnit("Metric tons (t)", 1_000_000),
        ounce: linearUnit("Ounces (oz)", 28.349523125),
        pound: linearUnit("Pounds (lb)", 453.59237),
        stone: linearUnit("Stones (st)", 6350.29318),
      },
    },
    temperature: {
      label: "Temperature",
      units: {
        celsius: {
          label: "Celsius (°C)",
          toBase: (value) => value,
          fromBase: (value) => value,
        },
        fahrenheit: {
          label: "Fahrenheit (°F)",
          toBase: (value) => ((value - 32) * 5) / 9,
          fromBase: (value) => (value * 9) / 5 + 32,
        },
        kelvin: {
          label: "Kelvin (K)",
          toBase: (value) => value - 273.15,
          fromBase: (value) => value + 273.15,
        },
        rankine: {
          label: "Rankine (°R)",
          toBase: (value) => ((value - 491.67) * 5) / 9,
          fromBase: (value) => (value * 9) / 5 + 491.67,
        },
      },
    },
    volume: {
      label: "Volume",
      units: {
        milliliter: linearUnit("Milliliters (mL)", 1),
        liter: linearUnit("Liters (L)", 1000),
        teaspoon: linearUnit("Teaspoons (tsp)", 4.92892159375),
        tablespoon: linearUnit("Tablespoons (Tbsp)", 14.78676478125),
        fluidOunce: linearUnit("Fluid ounces (fl oz)", 29.5735295625),
        cup: linearUnit("Cups (US)", 236.5882365),
        pint: linearUnit("Pints (US)", 473.176473),
        quart: linearUnit("Quarts (US)", 946.352946),
        gallon: linearUnit("Gallons (US)", 3785.411784),
        cubicMeter: linearUnit("Cubic meters (m³)", 1_000_000),
      },
    },
  };

  function populateUnits(categoryId) {
    const category = unitGroups[categoryId];
    if (!category) {
      return;
    }

    const previousFrom = fromSelect.value;
    const previousTo = toSelect.value;

    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    Object.entries(category.units).forEach(([id, unit]) => {
      const fromOption = document.createElement("option");
      fromOption.value = id;
      fromOption.textContent = unit.label;
      fromSelect.appendChild(fromOption);

      const toOption = document.createElement("option");
      toOption.value = id;
      toOption.textContent = unit.label;
      toSelect.appendChild(toOption);
    });

    if (category.units[previousFrom]) {
      fromSelect.value = previousFrom;
    } else {
      fromSelect.selectedIndex = 0;
    }

    if (category.units[previousTo]) {
      toSelect.value = previousTo;
    } else {
      toSelect.selectedIndex = Math.min(1, toSelect.options.length - 1);
    }

    if (fromSelect.value === toSelect.value && toSelect.options.length > 1) {
      const nextIndex =
        (fromSelect.selectedIndex + 1) % toSelect.options.length;
      toSelect.selectedIndex = nextIndex;
    }
  }

  function formatValue(value, categoryId) {
    if (!Number.isFinite(value)) {
      return "-";
    }

    const abs = Math.abs(value);
    let maximumFractionDigits = 4;

    if (categoryId === "temperature") {
      maximumFractionDigits = abs < 1 ? 3 : 2;
    } else if (abs >= 10000) {
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
    const categoryId = categorySelect.value;
    const category = unitGroups[categoryId];
    if (!category) {
      resultEl.innerHTML = "";
      return;
    }

    const fromUnit = category.units[fromSelect.value];
    const toUnit = category.units[toSelect.value];

    const amount = Number.parseFloat(amountInput.value);
    if (!Number.isFinite(amount)) {
      resultEl.innerHTML = `<section class="card"><p>Enter a valid number to convert.</p></section>`;
      return;
    }

    if (!fromUnit || !toUnit) {
      resultEl.innerHTML = `<section class="card"><p>Select units to convert between.</p></section>`;
      return;
    }

    const baseValue = fromUnit.toBase(amount);
    const converted = toUnit.fromBase(baseValue);

    const rows = Object.entries(category.units)
      .map(([id, unit]) => {
        const value = unit.fromBase(baseValue);
        return `<tr><th scope="row">${unit.label}</th><td>${formatValue(value, categoryId)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatValue(amount, categoryId)} ${category.units[fromSelect.value].label} = ${formatValue(
          converted,
          categoryId,
        )} ${category.units[toSelect.value].label}</h2>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <thead>
              <tr><th scope="col">Unit</th><th scope="col">Value</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Values are rounded for readability but calculated using precise conversion factors.</p>
      </section>
    `;
  }

  categorySelect.addEventListener("change", () => {
    populateUnits(categorySelect.value);
    convert();
  });

  fromSelect.addEventListener("change", convert);
  toSelect.addEventListener("change", convert);
  amountInput.addEventListener("input", convert);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    convert();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      categorySelect.value = "length";
      populateUnits(categorySelect.value);
      amountInput.value = "1";
      resultEl.innerHTML = "";
    }, 0);
  });

  populateUnits(categorySelect.value || "length");
  convert();
})();
