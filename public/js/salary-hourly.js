(function () {
  const form = document.getElementById("salary-form");
  const resultEl = document.getElementById("salary-result");

  if (!form || !resultEl) return;

  const annualInput = form.querySelector("#annual-salary");
  const hourlyInput = form.querySelector("#hourly-rate");
  const hoursInput = form.querySelector("#hours-week");
  const weeksInput = form.querySelector("#weeks-year");

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      value,
    );
  }

  function getSchedule() {
    const hours = parseFloat(hoursInput.value || "0");
    const weeks = parseFloat(weeksInput.value || "0");
    if (
      !Number.isFinite(hours) ||
      hours <= 0 ||
      !Number.isFinite(weeks) ||
      weeks <= 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Please provide working hours per week and paid weeks per year above zero.</p></section>`;
      return null;
    }
    return { hours, weeks };
  }

  function renderResult(title, stats) {
    const statMarkup = stats
      .map((stat) => {
        return `<div class="stat"><span class="label">${stat.label}</span><span class="value">${stat.value}</span></div>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${title}</h2>
        <div class="stat-grid">${statMarkup}</div>
        <p class="helper" style="margin-top:12px;">Rounded to the nearest cent. Adjust weeks for unpaid leave or overtime expectations.</p>
      </section>
    `;
  }

  function convertAnnualToHourly() {
    const schedule = getSchedule();
    if (!schedule) return;
    const annual = parseFloat(annualInput.value || "0");
    if (!Number.isFinite(annual) || annual <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Type an annual salary to convert.</p></section>`;
      return;
    }

    const hourly = annual / (schedule.weeks * schedule.hours);
    const weekly = annual / schedule.weeks;
    const monthly = annual / 12;

    hourlyInput.value = hourly.toFixed(2);

    renderResult(
      `${currencyFormatter.format(annual)} per year ≈ ${currencyFormatter.format(hourly)} per hour`,
      [
        { label: "Hourly", value: currencyFormatter.format(hourly) },
        { label: "Weekly", value: currencyFormatter.format(weekly) },
        { label: "Monthly", value: currencyFormatter.format(monthly) },
        { label: "Weeks counted", value: formatNumber(schedule.weeks) },
      ],
    );
  }

  function convertHourlyToAnnual() {
    const schedule = getSchedule();
    if (!schedule) return;
    const hourly = parseFloat(hourlyInput.value || "0");
    if (!Number.isFinite(hourly) || hourly <= 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter an hourly rate to convert.</p></section>`;
      return;
    }

    const weekly = hourly * schedule.hours;
    const annual = weekly * schedule.weeks;
    const monthly = annual / 12;

    annualInput.value = annual.toFixed(0);

    renderResult(
      `${currencyFormatter.format(hourly)} per hour ≈ ${currencyFormatter.format(annual)} per year`,
      [
        { label: "Annual", value: currencyFormatter.format(annual) },
        { label: "Weekly", value: currencyFormatter.format(weekly) },
        { label: "Monthly", value: currencyFormatter.format(monthly) },
        { label: "Hours weekly", value: formatNumber(schedule.hours) },
      ],
    );
  }

  form.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    if (!action) return;

    event.preventDefault();
    if (action === "annual-to-hourly") {
      convertAnnualToHourly();
    } else if (action === "hourly-to-annual") {
      convertHourlyToAnnual();
    }
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });
})();
