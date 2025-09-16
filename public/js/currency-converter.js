(function () {
  const form = document.getElementById("currency-form");
  const resultEl = document.getElementById("currency-result");
  const fromSelect = document.getElementById("currency-from");
  const toSelect = document.getElementById("currency-to");
  const swapButton = document.getElementById("currency-swap");
  const statusEl = document.getElementById("currency-status");

  if (!form || !resultEl || !fromSelect || !toSelect) return;

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "INR", name: "Indian Rupee" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "SEK", name: "Swedish Krona" },
    { code: "NOK", name: "Norwegian Krone" },
    { code: "MXN", name: "Mexican Peso" },
    { code: "BRL", name: "Brazilian Real" },
    { code: "ZAR", name: "South African Rand" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "KRW", name: "South Korean Won" },
    { code: "PLN", name: "Polish Złoty" },
    { code: "DKK", name: "Danish Krone" },
    { code: "TRY", name: "Turkish Lira" },
    { code: "AED", name: "UAE Dirham" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "ILS", name: "Israeli Shekel" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "PHP", name: "Philippine Peso" },
    { code: "THB", name: "Thai Baht" },
    { code: "ARS", name: "Argentine Peso" },
    { code: "CLP", name: "Chilean Peso" },
  ];

  const fallbackRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.53,
    NZD: 1.66,
    JPY: 150.25,
    CNY: 7.18,
    INR: 83.2,
    CHF: 0.87,
    SEK: 10.5,
    NOK: 10.8,
    MXN: 17.1,
    BRL: 5.15,
    ZAR: 18.2,
    SGD: 1.35,
    HKD: 7.82,
    KRW: 1340,
    PLN: 3.99,
    DKK: 6.85,
    TRY: 30.5,
    AED: 3.67,
    SAR: 3.75,
    ILS: 3.72,
    MYR: 4.72,
    IDR: 15500,
    PHP: 55.7,
    THB: 34.5,
    ARS: 825,
    CLP: 870,
  };

  const rateState = {
    base: "USD",
    rates: { ...fallbackRates },
    updated: "Using offline fallback rates",
    source: "offline",
  };

  function formatLocalUpdateTime(utcString) {
    if (!utcString) return "recently";
    const parsedDate = new Date(utcString);
    if (Number.isNaN(parsedDate.getTime())) {
      return utcString;
    }

    try {
      const formatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZoneName: "short",
      });
      return formatter.format(parsedDate);
    } catch (error) {
      const fallbackFormatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      return fallbackFormatter.format(parsedDate);
    }
  }

  function populateSelects() {
    const options = currencies
      .map(
        (currency) =>
          `<option value="${currency.code}">${currency.code} — ${currency.name}</option>`,
      )
      .join("");
    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;
    fromSelect.value = "USD";
    toSelect.value = "EUR";
  }

  function updateStatus(message, isError = false) {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = isError ? "#ff6b6b" : "var(--muted)";
    }
  }

  function convert(amount, from, to) {
    const fromRate = rateState.rates[from];
    const toRate = rateState.rates[to];
    if (!fromRate || !toRate) return null;
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  function renderResult(amount, from, to) {
    if (!amount || amount < 0) {
      resultEl.innerHTML = "";
      return;
    }

    const converted = convert(amount, from, to);
    if (converted === null) {
      resultEl.innerHTML = `<section class="card"><p>We don't have rates for that pair right now.</p></section>`;
      return;
    }

    const rate = convert(1, from, to);
    const formatterFrom = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: from,
    });
    const formatterTo = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: to,
    });

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatterFrom.format(amount)} = ${formatterTo.format(converted)}</h2>
        <p class="helper" style="margin-top:8px;">1 ${from} = ${formatterTo.format(rate)} · Rates ${rateState.updated}</p>
      </section>
    `;
  }

  async function fetchRates() {
    updateStatus("Updating rates…");
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.result !== "success" || !data.rates) {
        throw new Error("Unexpected API response");
      }
      rateState.base = data.base_code || "USD";
      rateState.rates = { ...data.rates, [rateState.base]: 1 };
      rateState.updated = `updated ${formatLocalUpdateTime(
        data.time_last_update_utc,
      )}`;
      rateState.source = "live";
      updateStatus(`Live rates ${rateState.updated}`);
    } catch (error) {
      console.error("Currency fetch failed", error);
      rateState.base = "USD";
      rateState.rates = { ...fallbackRates };
      rateState.updated =
        "using fallback rates (check back online for live data)";
      rateState.source = "offline";
      updateStatus(
        "Using cached sample rates. Connect to the internet for fresh data.",
        true,
      );
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amount = parseFloat(form.amount.value || "0");
    const from = fromSelect.value;
    const to = toSelect.value;
    if (!Number.isFinite(amount) || amount < 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter an amount of zero or more to convert.</p></section>`;
      return;
    }
    renderResult(amount, from, to);
  }

  function handleSwap() {
    const currentFrom = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = currentFrom;
    const amount = parseFloat(form.amount.value || "0");
    if (Number.isFinite(amount)) {
      renderResult(amount, fromSelect.value, toSelect.value);
    }
  }

  populateSelects();
  fetchRates().then(() => {
    const amount = parseFloat(form.amount.value || "0");
    renderResult(
      Number.isFinite(amount) ? amount : 0,
      fromSelect.value,
      toSelect.value,
    );
  });

  form.addEventListener("submit", handleSubmit);
  fromSelect.addEventListener("change", () => {
    const amount = parseFloat(form.amount.value || "0");
    if (Number.isFinite(amount)) {
      renderResult(amount, fromSelect.value, toSelect.value);
    }
  });
  toSelect.addEventListener("change", () => {
    const amount = parseFloat(form.amount.value || "0");
    if (Number.isFinite(amount)) {
      renderResult(amount, fromSelect.value, toSelect.value);
    }
  });
  form.amount.addEventListener("input", () => {
    const amount = parseFloat(form.amount.value || "0");
    if (Number.isFinite(amount)) {
      renderResult(amount, fromSelect.value, toSelect.value);
    }
  });
  if (swapButton) {
    swapButton.addEventListener("click", handleSwap);
  }
})();
