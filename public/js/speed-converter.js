(function () {
  const form = document.getElementById("speed-form");
  const valueInput = document.getElementById("speed-value");
  const resultEl = document.getElementById("speed-result");

  if (!form || !valueInput || !resultEl) {
    return;
  }

  const MPH_TO_KMH = 1.609344;
  const MPH_TO_FTPS = 1.46666667;

  function getDirection() {
    const checked = form.querySelector('input[name="speed-direction"]:checked');
    return checked ? checked.value : "mph-to-kmh";
  }

  function formatValue(value) {
    if (!Number.isFinite(value)) {
      return "-";
    }

    const abs = Math.abs(value);
    let maximumFractionDigits = 2;
    if (abs >= 200) {
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

    if (!Number.isFinite(inputValue) || inputValue < 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a non-negative speed to convert.</p></section>`;
      return;
    }

    const mph =
      direction === "mph-to-kmh" ? inputValue : inputValue / MPH_TO_KMH;
    const kmh =
      direction === "mph-to-kmh" ? inputValue * MPH_TO_KMH : inputValue;
    const metersPerSecond = kmh / 3.6;
    const feetPerSecond = mph * MPH_TO_FTPS;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatValue(mph)} mph ↔ ${formatValue(kmh)} km/h</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Miles per hour</span><span class="value">${formatValue(mph)}</span></div>
          <div class="stat"><span class="label">Kilometers per hour</span><span class="value">${formatValue(kmh)}</span></div>
          <div class="stat"><span class="label">Meters per second</span><span class="value">${formatValue(metersPerSecond)}</span></div>
          <div class="stat"><span class="label">Feet per second</span><span class="value">${formatValue(feetPerSecond)}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Uses the exact 1 mile = 1.609344 km conversion.</p>
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
        'input[name="speed-direction"][value="mph-to-kmh"]',
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

  form.querySelectorAll('input[name="speed-direction"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (valueInput.value !== "") {
        convert();
      }
    });
  });
})();
