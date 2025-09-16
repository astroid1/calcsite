(function () {
  const form = document.getElementById("time-form");
  const dateInput = document.getElementById("tz-datetime");
  const fromSelect = document.getElementById("tz-from");
  const targetsContainer = document.getElementById("tz-targets");
  const resultEl = document.getElementById("time-result");

  if (!form || !dateInput || !fromSelect || !targetsContainer || !resultEl) {
    return;
  }

  const timeZones = [
    { id: "new_york", label: "New York, USA", timeZone: "America/New_York" },
    {
      id: "los_angeles",
      label: "Los Angeles, USA",
      timeZone: "America/Los_Angeles",
    },
    { id: "chicago", label: "Chicago, USA", timeZone: "America/Chicago" },
    {
      id: "mexico_city",
      label: "Mexico City, Mexico",
      timeZone: "America/Mexico_City",
    },
    {
      id: "sao_paulo",
      label: "São Paulo, Brazil",
      timeZone: "America/Sao_Paulo",
    },
    { id: "london", label: "London, UK", timeZone: "Europe/London" },
    { id: "paris", label: "Paris, France", timeZone: "Europe/Paris" },
    { id: "berlin", label: "Berlin, Germany", timeZone: "Europe/Berlin" },
    {
      id: "johannesburg",
      label: "Johannesburg, South Africa",
      timeZone: "Africa/Johannesburg",
    },
    { id: "dubai", label: "Dubai, UAE", timeZone: "Asia/Dubai" },
    { id: "mumbai", label: "Mumbai, India", timeZone: "Asia/Kolkata" },
    { id: "singapore", label: "Singapore", timeZone: "Asia/Singapore" },
    { id: "tokyo", label: "Tokyo, Japan", timeZone: "Asia/Tokyo" },
    { id: "sydney", label: "Sydney, Australia", timeZone: "Australia/Sydney" },
    {
      id: "auckland",
      label: "Auckland, New Zealand",
      timeZone: "Pacific/Auckland",
    },
  ];

  const defaultComparisons = new Set([
    "london",
    "los_angeles",
    "tokyo",
    "sydney",
  ]);

  function setDefaultDateTime() {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    const pad = (value) => String(value).padStart(2, "0");
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
      now.getMinutes(),
    )}`;

    dateInput.value = formatted;
    dateInput.defaultValue = formatted;
  }

  function getZoneById(id) {
    return timeZones.find((zone) => zone.id === id);
  }

  function createOption(zone) {
    const option = document.createElement("option");
    option.value = zone.id;
    option.textContent = zone.label;
    if (zone.id === "new_york") {
      option.selected = true;
      option.defaultSelected = true;
    }
    return option;
  }

  function createCheckbox(zone) {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";
    label.style.padding = "6px 8px";
    label.style.borderRadius = "10px";
    label.style.background = "rgba(78, 140, 255, 0.08)";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = zone.id;
    checkbox.checked = defaultComparisons.has(zone.id);
    checkbox.defaultChecked = checkbox.checked;

    const span = document.createElement("span");
    span.textContent = zone.label;

    label.appendChild(checkbox);
    label.appendChild(span);

    return label;
  }

  function parseDateTime(value) {
    if (!value || typeof value !== "string") {
      return null;
    }

    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) {
      return null;
    }

    const [year, month, day] = datePart
      .split("-")
      .map((part) => Number.parseInt(part, 10));
    const [hour, minute] = timePart
      .split(":")
      .map((part) => Number.parseInt(part, 10));

    if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
      return null;
    }

    return { year, month, day, hour, minute };
  }

  function getTimeZoneData(timeZone, date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const data = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        data[part.type] = part.value;
      }
    }

    const asUtc = Date.UTC(
      Number.parseInt(data.year, 10),
      Number.parseInt(data.month, 10) - 1,
      Number.parseInt(data.day, 10),
      Number.parseInt(data.hour, 10),
      Number.parseInt(data.minute, 10),
      Number.parseInt(data.second, 10),
    );

    return {
      parts: data,
      offset: asUtc - date.getTime(),
    };
  }

  function formatDifference(diffHours) {
    if (!Number.isFinite(diffHours) || Math.abs(diffHours) < 1e-9) {
      return "Same time";
    }

    const rounded = Math.round(Math.abs(diffHours) * 10) / 10;
    const display = Number.isInteger(rounded)
      ? rounded.toString()
      : rounded.toFixed(1);
    const unit = rounded === 1 ? "hour" : "hours";

    return diffHours > 0
      ? `Ahead by ${display} ${unit}`
      : `Behind by ${display} ${unit}`;
  }

  function render() {
    const parsed = parseDateTime(dateInput.value);
    const fromZone = getZoneById(fromSelect.value) ?? timeZones[0];

    if (!parsed || !fromZone) {
      resultEl.innerHTML = `<section class="card"><p>Enter a valid date and time.</p></section>`;
      return;
    }

    const candidateUtc = Date.UTC(
      parsed.year,
      parsed.month - 1,
      parsed.day,
      parsed.hour,
      parsed.minute,
    );
    const candidateDate = new Date(candidateUtc);

    const fromCandidate = getTimeZoneData(fromZone.timeZone, candidateDate);
    const utcDate = new Date(candidateDate.getTime() - fromCandidate.offset);

    const fromActual = getTimeZoneData(fromZone.timeZone, utcDate);

    const matchesInput =
      Number.parseInt(fromActual.parts.year, 10) === parsed.year &&
      Number.parseInt(fromActual.parts.month, 10) === parsed.month &&
      Number.parseInt(fromActual.parts.day, 10) === parsed.day &&
      Number.parseInt(fromActual.parts.hour, 10) === parsed.hour &&
      Number.parseInt(fromActual.parts.minute, 10) === parsed.minute;

    if (!matchesInput) {
      resultEl.innerHTML = `<section class="card"><p>The selected time does not exist in ${fromZone.label}—likely due to a daylight saving shift. Try a different time.</p></section>`;
      return;
    }

    const checkboxes = Array.from(
      targetsContainer.querySelectorAll('input[type="checkbox"]'),
    );
    const selectedZones = checkboxes
      .filter((input) => input.checked)
      .map((input) => getZoneById(input.value))
      .filter(Boolean);

    if (selectedZones.length === 0) {
      resultEl.innerHTML = `<section class="card"><p>Select at least one destination city to compare.</p></section>`;
      return;
    }

    const fromFormatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: fromZone.timeZone,
    });

    const rows = selectedZones
      .map((zone) => {
        const formatter = new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: zone.timeZone,
        });
        const zoneData = getTimeZoneData(zone.timeZone, utcDate);
        const diffHours =
          (zoneData.offset - fromActual.offset) / (1000 * 60 * 60);
        return `<tr><th scope="row">${zone.label}</th><td>${formatter.format(utcDate)}</td><td>${formatDifference(diffHours)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${fromFormatter.format(utcDate)} in ${fromZone.label}</h2>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <thead>
              <tr><th scope="col">City</th><th scope="col">Local time</th><th scope="col">Offset vs. ${fromZone.label}</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="helper" style="margin-top:12px;">All offsets account for daylight saving time when applicable.</p>
      </section>
    `;
  }

  timeZones.forEach((zone) => {
    fromSelect.appendChild(createOption(zone));
    targetsContainer.appendChild(createCheckbox(zone));
  });

  setDefaultDateTime();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      fromSelect.value = "new_york";
      setDefaultDateTime();
      resultEl.innerHTML = "";
    }, 0);
  });

  fromSelect.addEventListener("change", render);
  dateInput.addEventListener("change", render);
  dateInput.addEventListener("input", render);
  targetsContainer.addEventListener("change", render);

  render();
})();
