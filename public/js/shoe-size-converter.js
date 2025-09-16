(function () {
  const form = document.getElementById("shoe-form");
  const profileSelect = document.getElementById("shoe-profile");
  const sourceSelect = document.getElementById("shoe-source");
  const sizeSelect = document.getElementById("shoe-size");
  const resultEl = document.getElementById("shoe-result");

  if (!form || !profileSelect || !sourceSelect || !sizeSelect || !resultEl) {
    return;
  }

  const shoeData = {
    women: [
      { us: 5, uk: 3, eu: 35.5, cm: 21.6 },
      { us: 5.5, uk: 3.5, eu: 36, cm: 22.2 },
      { us: 6, uk: 4, eu: 36.5, cm: 22.5 },
      { us: 6.5, uk: 4.5, eu: 37, cm: 23 },
      { us: 7, uk: 5, eu: 37.5, cm: 23.5 },
      { us: 7.5, uk: 5.5, eu: 38, cm: 24 },
      { us: 8, uk: 6, eu: 38.5, cm: 24.5 },
      { us: 8.5, uk: 6.5, eu: 39, cm: 24.9 },
      { us: 9, uk: 7, eu: 40, cm: 25.4 },
      { us: 9.5, uk: 7.5, eu: 40.5, cm: 25.7 },
      { us: 10, uk: 8, eu: 41, cm: 26 },
      { us: 10.5, uk: 8.5, eu: 41.5, cm: 26.4 },
      { us: 11, uk: 9, eu: 42, cm: 26.8 },
    ],
    men: [
      { us: 6, uk: 5.5, eu: 38.5, cm: 24.1 },
      { us: 6.5, uk: 6, eu: 39, cm: 24.5 },
      { us: 7, uk: 6.5, eu: 40, cm: 24.9 },
      { us: 7.5, uk: 7, eu: 40.5, cm: 25.4 },
      { us: 8, uk: 7.5, eu: 41, cm: 25.8 },
      { us: 8.5, uk: 8, eu: 42, cm: 26.2 },
      { us: 9, uk: 8.5, eu: 42.5, cm: 26.7 },
      { us: 9.5, uk: 9, eu: 43, cm: 27.1 },
      { us: 10, uk: 9.5, eu: 44, cm: 27.5 },
      { us: 10.5, uk: 10, eu: 44.5, cm: 27.9 },
      { us: 11, uk: 10.5, eu: 45, cm: 28.3 },
      { us: 11.5, uk: 11, eu: 45.5, cm: 28.7 },
      { us: 12, uk: 11.5, eu: 46, cm: 29.1 },
      { us: 13, uk: 12.5, eu: 47.5, cm: 30 },
    ],
  };

  function formatSize(value) {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return Number.parseFloat(value.toFixed(1)).toString();
  }

  function formatLength(value) {
    return value.toFixed(1);
  }

  function populateSizeOptions() {
    const profile = profileSelect.value;
    const source = sourceSelect.value;
    const data = shoeData[profile];
    const previous = sizeSelect.value;

    sizeSelect.innerHTML = "";

    if (!data) {
      return;
    }

    data.forEach((entry, index) => {
      const sourceValue = entry[source];
      if (typeof sourceValue === "undefined") {
        return;
      }
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${source.toUpperCase()} ${formatSize(sourceValue)}`;
      sizeSelect.appendChild(option);
    });

    if (sizeSelect.options.length === 0) {
      return;
    }

    if (
      previous &&
      Array.from(sizeSelect.options).some((option) => option.value === previous)
    ) {
      sizeSelect.value = previous;
    } else {
      sizeSelect.selectedIndex = Math.floor(sizeSelect.options.length / 2);
    }
  }

  function render() {
    const profile = profileSelect.value;
    const source = sourceSelect.value;
    const index = Number.parseInt(sizeSelect.value, 10);
    const data = shoeData[profile];

    if (!data || Number.isNaN(index) || !data[index]) {
      resultEl.innerHTML = `<section class="card"><p>Select a size to see conversions.</p></section>`;
      return;
    }

    const entry = data[index];
    const profileLabel =
      profileSelect.options[profileSelect.selectedIndex]?.textContent ??
      "Shoe size";
    const sourceLabel =
      sourceSelect.options[sourceSelect.selectedIndex]?.textContent ??
      source.toUpperCase();
    const sourceValue = entry[source];
    const inches = entry.cm / 2.54;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${profileLabel}</h2>
        <p class="helper" style="margin-top:6px;">Selected ${sourceLabel}: ${formatSize(sourceValue)}</p>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <tbody>
              <tr><th scope="row">US</th><td>${formatSize(entry.us)}</td></tr>
              <tr><th scope="row">UK</th><td>${formatSize(entry.uk)}</td></tr>
              <tr><th scope="row">EU</th><td>${formatSize(entry.eu)}</td></tr>
              <tr><th scope="row">Foot length</th><td>${formatLength(entry.cm)} cm / ${formatLength(inches)} in</td></tr>
            </tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Numbers reflect common conversion charts—brands may vary slightly.</p>
      </section>
    `;
  }

  populateSizeOptions();
  render();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      profileSelect.value = "women";
      sourceSelect.value = "us";
      populateSizeOptions();
      render();
    }, 0);
  });

  profileSelect.addEventListener("change", () => {
    populateSizeOptions();
    render();
  });

  sourceSelect.addEventListener("change", () => {
    populateSizeOptions();
    render();
  });

  sizeSelect.addEventListener("change", render);
})();
