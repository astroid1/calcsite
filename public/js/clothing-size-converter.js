(function () {
  const form = document.getElementById("clothing-form");
  const profileSelect = document.getElementById("clothing-profile");
  const sourceSelect = document.getElementById("clothing-source");
  const sizeSelect = document.getElementById("clothing-size");
  const resultEl = document.getElementById("clothing-result");

  if (!form || !profileSelect || !sourceSelect || !sizeSelect || !resultEl) {
    return;
  }

  const clothingData = {
    women: [
      {
        intl: "XS",
        us: "0-2",
        uk: "4-6",
        eu: "32-34",
        bust: "31-33 in / 79-84 cm",
        waist: "24-26 in / 61-66 cm",
      },
      {
        intl: "S",
        us: "4-6",
        uk: "8-10",
        eu: "36-38",
        bust: "33-35 in / 84-89 cm",
        waist: "26-28 in / 66-71 cm",
      },
      {
        intl: "M",
        us: "8-10",
        uk: "12-14",
        eu: "40-42",
        bust: "36-38 in / 91-97 cm",
        waist: "29-31 in / 74-79 cm",
      },
      {
        intl: "L",
        us: "12-14",
        uk: "16-18",
        eu: "44-46",
        bust: "39-41 in / 99-104 cm",
        waist: "32-34 in / 81-86 cm",
      },
      {
        intl: "XL",
        us: "16-18",
        uk: "20-22",
        eu: "48-50",
        bust: "42-44 in / 107-112 cm",
        waist: "35-38 in / 89-97 cm",
      },
      {
        intl: "XXL",
        us: "20-22",
        uk: "24-26",
        eu: "52-54",
        bust: "45-47 in / 114-119 cm",
        waist: "39-42 in / 99-107 cm",
      },
    ],
    men: [
      {
        intl: "XS",
        us: "34",
        uk: "34",
        eu: "44",
        chest: "34-36 in / 86-91 cm",
        waist: "28-30 in / 71-76 cm",
      },
      {
        intl: "S",
        us: "36",
        uk: "36",
        eu: "46",
        chest: "36-38 in / 91-97 cm",
        waist: "30-32 in / 76-81 cm",
      },
      {
        intl: "M",
        us: "38-40",
        uk: "38-40",
        eu: "48-50",
        chest: "38-40 in / 97-102 cm",
        waist: "32-34 in / 81-86 cm",
      },
      {
        intl: "L",
        us: "42-44",
        uk: "42-44",
        eu: "52-54",
        chest: "42-44 in / 107-112 cm",
        waist: "36-38 in / 91-97 cm",
      },
      {
        intl: "XL",
        us: "46-48",
        uk: "46-48",
        eu: "56-58",
        chest: "46-48 in / 117-122 cm",
        waist: "40-42 in / 102-107 cm",
      },
      {
        intl: "XXL",
        us: "50-52",
        uk: "50-52",
        eu: "60-62",
        chest: "50-52 in / 127-132 cm",
        waist: "44-46 in / 112-117 cm",
      },
    ],
  };

  function populateSizeOptions() {
    const profile = profileSelect.value;
    const source = sourceSelect.value;
    const data = clothingData[profile];
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
      option.textContent = `${source.toUpperCase()} ${sourceValue}`;
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
    const data = clothingData[profile];

    if (!data || Number.isNaN(index) || !data[index]) {
      resultEl.innerHTML = `<section class="card"><p>Select a size to see international matches.</p></section>`;
      return;
    }

    const entry = data[index];
    const profileLabel =
      profileSelect.options[profileSelect.selectedIndex]?.textContent ??
      "Clothing size";
    const sourceLabel =
      sourceSelect.options[sourceSelect.selectedIndex]?.textContent ??
      source.toUpperCase();
    const sourceValue = entry[source];

    const rows = [
      `<tr><th scope="row">International</th><td>${entry.intl}</td></tr>`,
      `<tr><th scope="row">US</th><td>${entry.us}</td></tr>`,
      `<tr><th scope="row">UK</th><td>${entry.uk}</td></tr>`,
      `<tr><th scope="row">EU</th><td>${entry.eu}</td></tr>`,
    ];

    if (entry.bust) {
      rows.push(`<tr><th scope="row">Bust</th><td>${entry.bust}</td></tr>`);
    }

    if (entry.chest) {
      rows.push(`<tr><th scope="row">Chest</th><td>${entry.chest}</td></tr>`);
    }

    if (entry.waist) {
      rows.push(`<tr><th scope="row">Waist</th><td>${entry.waist}</td></tr>`);
    }

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${profileLabel}</h2>
        <p class="helper" style="margin-top:6px;">Selected ${sourceLabel}: ${sourceValue}</p>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <tbody>${rows.join("")}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">Sizing varies by brand—use this chart as a starting point and confirm with retailer measurements when possible.</p>
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
      sourceSelect.value = "intl";
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
