(function () {
  const form = document.getElementById("fuel-form");
  const valueInput = document.getElementById("fuel-value");
  const resultEl = document.getElementById("fuel-result");

  if (!form || !valueInput || !resultEl) {
    return;
  }

  const CONVERSION = 235.214583;

  function getDirection() {
    const checked = form.querySelector('input[name="fuel-direction"]:checked');
    return checked ? checked.value : "mpg-to-l";
  }

  function formatValue(value) {
    if (!Number.isFinite(value)) {
      return "-";
    }

    const abs = Math.abs(value);
    let maximumFractionDigits = 2;

    if (abs >= 100) {
      maximumFractionDigits = 1;
    } else if (abs < 1) {
      maximumFractionDigits = 3;
    }

    return value.toLocaleString(undefined, {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    });
  }

  function convert() {
    const direction = getDirection();
    const inputValue = Number.parseFloat(valueInput.value);

    if (!Number.isFinite(inputValue) || inputValue <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a positive efficiency value to convert.</p></section>`;
      return;
    }

    const mpg = direction === "mpg-to-l" ? inputValue : CONVERSION / inputValue;
    const lPer100 =
      direction === "mpg-to-l" ? CONVERSION / inputValue : inputValue;

    const kmPerLiter = 100 / lPer100;
    const milesPerLiter = kmPerLiter / 1.609344;
    const gallonsPer100Miles = 100 / mpg;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatValue(mpg)} mpg ↔ ${formatValue(lPer100)} L/100 km</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">US miles per gallon</span><span class="value">${formatValue(mpg)}</span></div>
          <div class="stat"><span class="label">Liters per 100 km</span><span class="value">${formatValue(lPer100)}</span></div>
          <div class="stat"><span class="label">Kilometers per liter</span><span class="value">${formatValue(kmPerLiter)}</span></div>
          <div class="stat"><span class="label">Miles per liter</span><span class="value">${formatValue(milesPerLiter)}</span></div>
          <div class="stat"><span class="label">Gallons per 100 miles</span><span class="value">${formatValue(gallonsPer100Miles)}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Uses the standard 235.2146 constant for converting US MPG to metric efficiency.</p>
      </section>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    convert();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      resultEl.innerHTML = "";
      valueInput.value = "";
      const defaultRadio = form.querySelector(
        'input[name="fuel-direction"][value="mpg-to-l"]',
      );
      if (defaultRadio) {
        defaultRadio.checked = true;
      }
    }, 0);
  });

  valueInput.addEventListener("input", () => {
    if (valueInput.value !== "") {
      convert();
    } else {
      resultEl.innerHTML = "";
    }
  });

  form.querySelectorAll('input[name="fuel-direction"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (valueInput.value !== "") {
        convert();
      }
    });
  });
})();
