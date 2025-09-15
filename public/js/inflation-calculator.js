(function () {
  const form = document.getElementById("inflation-form");
  const resultEl = document.getElementById("inflation-result");
  const startSelect = document.getElementById("inflation-start");
  const endSelect = document.getElementById("inflation-end");

  if (!form || !resultEl || !startSelect || !endSelect) return;

  const CPI_DATA = [
    { year: 1980, cpi: 82.4 },
    { year: 1981, cpi: 90.9 },
    { year: 1982, cpi: 96.5 },
    { year: 1983, cpi: 99.6 },
    { year: 1984, cpi: 103.9 },
    { year: 1985, cpi: 107.6 },
    { year: 1986, cpi: 109.6 },
    { year: 1987, cpi: 113.6 },
    { year: 1988, cpi: 118.3 },
    { year: 1989, cpi: 124.0 },
    { year: 1990, cpi: 130.7 },
    { year: 1991, cpi: 136.2 },
    { year: 1992, cpi: 140.3 },
    { year: 1993, cpi: 144.5 },
    { year: 1994, cpi: 148.2 },
    { year: 1995, cpi: 152.4 },
    { year: 1996, cpi: 156.9 },
    { year: 1997, cpi: 160.5 },
    { year: 1998, cpi: 163.0 },
    { year: 1999, cpi: 166.6 },
    { year: 2000, cpi: 172.2 },
    { year: 2001, cpi: 177.1 },
    { year: 2002, cpi: 179.9 },
    { year: 2003, cpi: 184.0 },
    { year: 2004, cpi: 188.9 },
    { year: 2005, cpi: 195.3 },
    { year: 2006, cpi: 201.6 },
    { year: 2007, cpi: 207.3 },
    { year: 2008, cpi: 215.3 },
    { year: 2009, cpi: 214.5 },
    { year: 2010, cpi: 218.1 },
    { year: 2011, cpi: 224.9 },
    { year: 2012, cpi: 229.6 },
    { year: 2013, cpi: 233.0 },
    { year: 2014, cpi: 236.7 },
    { year: 2015, cpi: 237.0 },
    { year: 2016, cpi: 240.0 },
    { year: 2017, cpi: 245.1 },
    { year: 2018, cpi: 251.1 },
    { year: 2019, cpi: 255.7 },
    { year: 2020, cpi: 258.8 },
    { year: 2021, cpi: 271.0 },
    { year: 2022, cpi: 292.7 },
    { year: 2023, cpi: 305.3 },
  ];

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const percentFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  function populateYears() {
    const options = CPI_DATA.map(
      (entry) => `<option value="${entry.year}">${entry.year}</option>`,
    ).join("");
    startSelect.innerHTML = options;
    endSelect.innerHTML = options;
    startSelect.value = "2000";
    endSelect.value = String(CPI_DATA[CPI_DATA.length - 1].year);
  }

  function findCpi(year) {
    return CPI_DATA.find((entry) => entry.year === year)?.cpi ?? null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amount = parseFloat(form.amount.value || "0");
    const startYear = parseInt(startSelect.value, 10);
    const endYear = parseInt(endSelect.value, 10);

    if (!Number.isFinite(amount) || amount < 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter an amount of zero or more.</p></section>`;
      return;
    }

    if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
      resultEl.innerHTML = `<section class="card"><p>Select start and end years within the dataset.</p></section>`;
      return;
    }

    if (startYear === endYear) {
      resultEl.innerHTML = `<section class="card"><h2 style="margin-top:0;">${currencyFormatter.format(amount)} in ${startYear} is still ${currencyFormatter.format(amount)} in ${endYear}</h2><p class="helper" style="margin-top:8px;">Same-year comparisons have no inflation effect.</p></section>`;
      return;
    }

    const startCpi = findCpi(startYear);
    const endCpi = findCpi(endYear);

    if (!startCpi || !endCpi) {
      resultEl.innerHTML = `<section class="card"><p>Year selection is outside our CPI data range.</p></section>`;
      return;
    }

    const ratio = endCpi / startCpi;
    const adjustedAmount = amount * ratio;
    const changePercent = (ratio - 1) * 100;
    const yearsApart = Math.abs(endYear - startYear);
    const avgAnnual = Math.pow(ratio, 1 / yearsApart) - 1;

    const [minYear, maxYear] =
      startYear < endYear ? [startYear, endYear] : [endYear, startYear];
    const tableRows = CPI_DATA.filter(
      (entry) => entry.year >= minYear && entry.year <= maxYear,
    )
      .map((entry, index, arr) => {
        const equivalent = amount * (entry.cpi / startCpi);
        let yoy = 0;
        if (index > 0) {
          const prev = arr[index - 1];
          yoy = (entry.cpi / prev.cpi - 1) * 100;
        }
        return `<tr><td>${entry.year}</td><td>${entry.cpi.toFixed(1)}</td><td>${currencyFormatter.format(equivalent)}</td><td>${index === 0 ? "—" : percentFormatter.format(yoy) + "%"}</td></tr>`;
      })
      .join("");

    const summary =
      startYear < endYear
        ? `${currencyFormatter.format(amount)} in ${startYear} has the buying power of ${currencyFormatter.format(adjustedAmount)} in ${endYear}.`
        : `${currencyFormatter.format(amount)} in ${startYear} would be worth ${currencyFormatter.format(adjustedAmount)} in ${endYear}.`;

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${summary}</h2>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Total inflation</span>
            <span class="value">${percentFormatter.format(changePercent)}%</span>
          </div>
          <div class="stat">
            <span class="label">Average annual</span>
            <span class="value">${percentFormatter.format(avgAnnual * 100)}%</span>
          </div>
          <div class="stat">
            <span class="label">Years apart</span>
            <span class="value">${yearsApart}</span>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>CPI-U</th>
                <th>Value of ${currencyFormatter.format(amount)}</th>
                <th>YoY change</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  populateYears();
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    setTimeout(() => {
      populateYears();
      resultEl.innerHTML = "";
    }, 0);
  });

  startSelect.addEventListener("change", () => {
    if (parseInt(startSelect.value, 10) > parseInt(endSelect.value, 10)) {
      endSelect.value = startSelect.value;
    }
  });

  endSelect.addEventListener("change", () => {
    if (parseInt(endSelect.value, 10) < parseInt(startSelect.value, 10)) {
      startSelect.value = endSelect.value;
    }
  });
})();
