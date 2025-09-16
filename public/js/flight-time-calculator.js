(function () {
  if (typeof window === "undefined") return;

  const fallbackAirports = [
    {
      code: "ATL",
      name: "Hartsfield–Jackson Atlanta International",
      city: "Atlanta, USA",
      timeZone: "America/New_York",
      lat: 33.6407,
      lon: -84.4277,
    },
    {
      code: "JFK",
      name: "John F. Kennedy International",
      city: "New York City, USA",
      timeZone: "America/New_York",
      lat: 40.6413,
      lon: -73.7781,
    },
    {
      code: "LAX",
      name: "Los Angeles International",
      city: "Los Angeles, USA",
      timeZone: "America/Los_Angeles",
      lat: 33.9416,
      lon: -118.4085,
    },
    {
      code: "ORD",
      name: "Chicago O'Hare International",
      city: "Chicago, USA",
      timeZone: "America/Chicago",
      lat: 41.9742,
      lon: -87.9073,
    },
    {
      code: "DFW",
      name: "Dallas/Fort Worth International",
      city: "Dallas, USA",
      timeZone: "America/Chicago",
      lat: 32.8998,
      lon: -97.0403,
    },
    {
      code: "DEN",
      name: "Denver International",
      city: "Denver, USA",
      timeZone: "America/Denver",
      lat: 39.8561,
      lon: -104.6737,
    },
    {
      code: "SEA",
      name: "Seattle–Tacoma International",
      city: "Seattle, USA",
      timeZone: "America/Los_Angeles",
      lat: 47.4502,
      lon: -122.3088,
    },
    {
      code: "MIA",
      name: "Miami International",
      city: "Miami, USA",
      timeZone: "America/New_York",
      lat: 25.7959,
      lon: -80.2871,
    },
    {
      code: "YYZ",
      name: "Toronto Pearson International",
      city: "Toronto, Canada",
      timeZone: "America/Toronto",
      lat: 43.6777,
      lon: -79.6248,
    },
    {
      code: "LHR",
      name: "London Heathrow",
      city: "London, United Kingdom",
      timeZone: "Europe/London",
      lat: 51.47,
      lon: -0.4543,
    },
    {
      code: "CDG",
      name: "Paris Charles de Gaulle",
      city: "Paris, France",
      timeZone: "Europe/Paris",
      lat: 49.0097,
      lon: 2.5479,
    },
    {
      code: "FRA",
      name: "Frankfurt Airport",
      city: "Frankfurt, Germany",
      timeZone: "Europe/Berlin",
      lat: 50.0379,
      lon: 8.5622,
    },
    {
      code: "DXB",
      name: "Dubai International",
      city: "Dubai, UAE",
      timeZone: "Asia/Dubai",
      lat: 25.2532,
      lon: 55.3657,
    },
    {
      code: "HND",
      name: "Tokyo Haneda",
      city: "Tokyo, Japan",
      timeZone: "Asia/Tokyo",
      lat: 35.5494,
      lon: 139.7798,
    },
    {
      code: "SYD",
      name: "Sydney Kingsford Smith",
      city: "Sydney, Australia",
      timeZone: "Australia/Sydney",
      lat: -33.9399,
      lon: 151.1753,
    },
    {
      code: "SFO",
      name: "San Francisco International",
      city: "San Francisco, USA",
      timeZone: "America/Los_Angeles",
      lat: 37.6213,
      lon: -122.379,
    },
    {
      code: "GRU",
      name: "São Paulo/Guarulhos",
      city: "São Paulo, Brazil",
      timeZone: "America/Sao_Paulo",
      lat: -23.4356,
      lon: -46.4731,
    },
    {
      code: "EZE",
      name: "Buenos Aires Ministro Pistarini",
      city: "Buenos Aires, Argentina",
      timeZone: "America/Argentina/Buenos_Aires",
      lat: -34.8222,
      lon: -58.5358,
    },
    {
      code: "SIN",
      name: "Singapore Changi",
      city: "Singapore",
      timeZone: "Asia/Singapore",
      lat: 1.3644,
      lon: 103.9915,
    },
    {
      code: "JNB",
      name: "O. R. Tambo International",
      city: "Johannesburg, South Africa",
      timeZone: "Africa/Johannesburg",
      lat: -26.1367,
      lon: 28.241,
    },
  ];

  const AIRPORT_DATA_SOURCES = [
    "/data/international-airports.json",
    "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json",
  ];

  let airportMap = new Map();
  let airportsReady = false;

  const form = document.getElementById("flight-form");
  if (!form) return;

  const fromSelect = document.getElementById("flight-from");
  const toSelect = document.getElementById("flight-to");
  const dateInput = document.getElementById("flight-date");
  const timeInput = document.getElementById("flight-time");
  const speedInput = document.getElementById("flight-speed");
  const swapButton = document.getElementById("flight-swap");
  const statusEl = document.getElementById("flight-status");
  const resultEl = document.getElementById("flight-result");
  const notesEl = document.getElementById("flight-airport-notes");

  if (statusEl) statusEl.textContent = "Loading airport directory…";
  if (notesEl) notesEl.textContent = "Loading airport directory…";

  function setLoadingState(isLoading) {
    [fromSelect, toSelect, swapButton].forEach((element) => {
      if (!element) return;
      element.disabled = isLoading;
    });
  }

  function cleanPart(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function joinLocationParts(parts) {
    return parts
      .map((part) => cleanPart(part))
      .filter(Boolean)
      .join(", ");
  }

  function normalizeAirportRecord(record) {
    if (!record || typeof record !== "object") return null;

    const codeCandidate =
      record.iata ||
      record.iata_code ||
      record.IATA ||
      record.code ||
      record.Code ||
      "";
    const code = cleanPart(codeCandidate).toUpperCase();
    if (!code || code.length !== 3) return null;

    const latCandidate =
      record.lat ??
      record.latitude ??
      record.latitude_deg ??
      record.Latitude ??
      record.lat_deg ??
      null;
    const lonCandidate =
      record.lon ??
      record.longitude ??
      record.longitude_deg ??
      record.Longitude ??
      record.lon_deg ??
      null;
    const lat =
      latCandidate == null || latCandidate === ""
        ? Number.NaN
        : Number(latCandidate);
    const lon =
      lonCandidate == null || lonCandidate === ""
        ? Number.NaN
        : Number(lonCandidate);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const timeZoneCandidate =
      record.tz ||
      record.timezone ||
      record.time_zone ||
      record.tz_database_time_zone ||
      record.Timezone ||
      record.TZ ||
      "";
    const timeZone = cleanPart(timeZoneCandidate);
    if (!timeZone) return null;

    const name =
      cleanPart(record.name) ||
      cleanPart(record.airport) ||
      cleanPart(record.airport_name) ||
      code;

    const city = joinLocationParts([
      record.city,
      record.municipality,
      record.region_city,
    ]);
    const country = joinLocationParts([
      record.country,
      record.country_name,
      record.Country,
      record.iso_country,
      record.country_code,
    ]);

    const location = joinLocationParts([city || null, country || null]) || name;

    return {
      code,
      name,
      city: location,
      timeZone,
      lat,
      lon,
    };
  }

  function normalizeAirportData(raw) {
    const seen = new Map();
    const list = [];

    const addRecord = (value) => {
      const airport = normalizeAirportRecord(value);
      if (!airport) return;
      if (seen.has(airport.code)) return;
      seen.set(airport.code, true);
      list.push(airport);
    };

    if (Array.isArray(raw)) {
      raw.forEach(addRecord);
    } else if (raw && typeof raw === "object") {
      Object.values(raw).forEach(addRecord);
    }

    return list.sort((a, b) => {
      const cityCompare = a.city.localeCompare(b.city, undefined, {
        sensitivity: "base",
      });
      if (cityCompare !== 0) return cityCompare;
      const nameCompare = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      if (nameCompare !== 0) return nameCompare;
      return a.code.localeCompare(b.code);
    });
  }

  async function loadAirportData() {
    for (const url of AIRPORT_DATA_SOURCES) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        const normalized = normalizeAirportData(data);
        if (normalized.length) {
          return { list: normalized, source: url };
        }
      } catch (error) {
        console.warn("Unable to load airport data", url, error);
      }
    }

    return { list: fallbackAirports.slice(), source: "fallback" };
  }

  function populateAirports(select, airportList) {
    if (!select) return;
    const previousValue = select.value;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select airport";
    select.appendChild(placeholder);

    const sorted = airportList
      .slice()
      .sort((a, b) => {
        const cityCompare = a.city.localeCompare(b.city, undefined, {
          sensitivity: "base",
        });
        if (cityCompare !== 0) return cityCompare;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });

    sorted.forEach((airport) => {
      const option = document.createElement("option");
      option.value = airport.code;
      const baseLabel = airport.city.includes(airport.name)
        ? airport.city
        : `${airport.city} – ${airport.name}`;
      option.textContent = `${baseLabel} (${airport.code})`;
      option.dataset.tz = airport.timeZone;
      select.appendChild(option);
    });

    if (previousValue && airportMap.has(previousValue)) {
      select.value = previousValue;
    }
  }

  function applyAirports(airportList, source) {
    airportMap = new Map(airportList.map((airport) => [airport.code, airport]));
    airportsReady = true;

    populateAirports(fromSelect, airportList);
    populateAirports(toSelect, airportList);

    const summary =
      source === "fallback"
        ? "Loaded a core set of major airports. Pick airports to begin."
        : `Loaded ${airportList.length.toLocaleString()} airports. Pick airports to begin.`;

    resetResult(summary);
    updateNotes();
  }

  async function initializeAirports() {
    setLoadingState(true);
    airportsReady = false;
    if (statusEl) statusEl.textContent = "Loading airport directory…";
    if (notesEl) notesEl.textContent = "Loading airport directory…";

    try {
      const { list, source } = await loadAirportData();
      applyAirports(list, source);
    } catch (error) {
      console.error("Falling back to built-in airport list", error);
      applyAirports(fallbackAirports.slice(), "fallback");
    } finally {
      setLoadingState(false);
    }
  }

  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0088; // kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getOffset(date, timeZone) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const map = {};
    for (const { type, value } of parts) {
      if (type !== "literal") map[type] = value;
    }
    const asUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    );
    return (asUTC - date.getTime()) / 60000; // minutes difference from UTC
  }

  function zonedDateToUtc(parts, timeZone) {
    const date = new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    );
    const offset = getOffset(date, timeZone);
    return new Date(date.getTime() - offset * 60000);
  }

  function formatLocal(date, timeZone) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function formatDuration(totalMinutes) {
    const minutes = Math.round(totalMinutes);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    parts.push(`${mins} minute${mins === 1 ? "" : "s"}`);
    return parts.join(" ");
  }

  function formatOffsetLabel(offsetMinutes) {
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, "0");
    const minutes = String(abs % 60).padStart(2, "0");
    return `UTC${sign}${hours}:${minutes}`;
  }

  function parseDateInput(value) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }
    return { year, month, day };
  }

  function parseTimeInput(value) {
    if (!value) return null;
    const [hour, minute] = value.split(":").map(Number);
    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
    return { hour, minute };
  }

  function formatAirportSummary(airport, referenceDate) {
    const offset = formatOffsetLabel(getOffset(referenceDate, airport.timeZone));
    const baseLabel = airport.city.includes(airport.name)
      ? `${airport.city} (${airport.code})`
      : `${airport.name} (${airport.code}) • ${airport.city}`;
    return `${baseLabel} • ${offset}`;
  }

  function updateNotes() {
    if (!notesEl) return;
    if (!airportsReady) {
      notesEl.textContent = "Loading airport directory…";
      return;
    }
    const from = airportMap.get(fromSelect?.value || "");
    const to = airportMap.get(toSelect?.value || "");
    const today = new Date();
    const parts = [];
    if (from) parts.push(formatAirportSummary(from, today));
    if (to) parts.push(formatAirportSummary(to, today));
    notesEl.textContent = parts.length
      ? parts.join(" · ")
      : "We'll highlight the local time zone offsets as you choose airports.";
  }

  function resetResult(message) {
    if (resultEl) resultEl.innerHTML = "";
    if (statusEl) {
      statusEl.textContent =
        message ||
        (airportsReady
          ? "Pick airports to begin."
          : "Loading airport directory…");
    }
  }

  initializeAirports();

  if (dateInput) {
    const today = new Date();
    const iso = today.toISOString().split("T")[0];
    dateInput.value = iso;
  }

  if (timeInput) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    timeInput.value = `${hh}:${mm}`;
  }

  if (swapButton) {
    swapButton.addEventListener("click", () => {
      const fromValue = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = fromValue;
      updateNotes();
      resetResult();
    });
  }

  fromSelect?.addEventListener("change", () => {
    updateNotes();
    resetResult();
  });
  toSelect?.addEventListener("change", () => {
    updateNotes();
    resetResult();
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      resetResult();
      updateNotes();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!statusEl || !resultEl) return;

    if (!airportsReady) {
      statusEl.textContent = "Please wait for the airport directory to finish loading.";
      return;
    }

    const fromAirport = airportMap.get(fromSelect.value || "");
    const toAirport = airportMap.get(toSelect.value || "");
    if (!fromAirport || !toAirport) {
      statusEl.textContent = "Choose both departure and arrival airports.";
      resultEl.innerHTML = "";
      return;
    }
    if (fromAirport.code === toAirport.code) {
      statusEl.textContent = "Departure and arrival airports must be different.";
      resultEl.innerHTML = "";
      return;
    }

    const dateParts = parseDateInput(dateInput?.value || "");
    const timeParts = parseTimeInput(timeInput?.value || "");
    if (!dateParts || !timeParts) {
      statusEl.textContent = "Enter a valid departure date and time.";
      resultEl.innerHTML = "";
      return;
    }

    const speed = Number(speedInput?.value || "0");
    if (!Number.isFinite(speed) || speed <= 0) {
      statusEl.textContent = "Enter a cruise speed in km/h.";
      resultEl.innerHTML = "";
      return;
    }

    const departureUtc = zonedDateToUtc(
      { ...dateParts, ...timeParts },
      fromAirport.timeZone
    );
    const distanceKm = haversineDistance(
      fromAirport.lat,
      fromAirport.lon,
      toAirport.lat,
      toAirport.lon
    );
    const durationMinutes = (distanceKm / speed) * 60;
    const arrivalUtc = new Date(departureUtc.getTime() + durationMinutes * 60000);

    const distanceMiles = distanceKm * 0.621371;
    const formattedDuration = formatDuration(durationMinutes);
    const departureLocal = formatLocal(departureUtc, fromAirport.timeZone);
    const arrivalLocal = formatLocal(arrivalUtc, toAirport.timeZone);
    const depOffset = getOffset(departureUtc, fromAirport.timeZone);
    const arrOffset = getOffset(arrivalUtc, toAirport.timeZone);
    const tzDiffHours = (arrOffset - depOffset) / 60;

    const tzDiffLabel =
      tzDiffHours === 0
        ? "No time zone change"
        : tzDiffHours > 0
        ? `${tzDiffHours.toFixed(1)} hour${Math.abs(tzDiffHours) === 1 ? "" : "s"} ahead`
        : `${Math.abs(tzDiffHours).toFixed(1)} hour${Math.abs(tzDiffHours) === 1 ? "" : "s"} behind`;

    const cruiseKnots = speed * 0.539957;

    resultEl.innerHTML = `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Estimated itinerary</h2>
        <p class="helper">Distance is based on the great-circle route between airport coordinates.</p>
        <ul class="result-list">
          <li><strong>Distance:</strong> ${distanceKm.toFixed(0)} km (${distanceMiles.toFixed(
      0
    )} miles)</li>
          <li><strong>Estimated duration:</strong> ${formattedDuration} at ${speed.toFixed(
      0
    )} km/h (${cruiseKnots.toFixed(0)} knots)</li>
          <li><strong>Depart:</strong> ${departureLocal} (${formatOffsetLabel(depOffset)})</li>
          <li><strong>Arrive:</strong> ${arrivalLocal} (${formatOffsetLabel(arrOffset)})</li>
          <li><strong>Time zone shift:</strong> ${tzDiffLabel}</li>
        </ul>
      </div>
    `;

    statusEl.textContent = `Nonstop estimate: ${formattedDuration}. Adjust cruise speed for winds or ground time.`;
  });
})();
