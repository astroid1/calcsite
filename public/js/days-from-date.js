(function () {
  if (typeof window === "undefined" || !window.CalcDate) return;

  const {
    MS_IN_DAY,
    parseDate,
    plural,
    setupCalendarPickers,
    stripTime,
  } = window.CalcDate;

  const form = document.getElementById("dfd-form");
  const dateInput = document.getElementById("date");
  const compareInput = document.getElementById("compare");
  const output = document.getElementById("result");
  if (!form || !dateInput || !compareInput || !output) return;

  setupCalendarPickers(form);

  const dateFormatter =
    typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" })
      : null;

  const formatFullDate = (date) =>
    dateFormatter ? dateFormatter.format(date) : date.toDateString();

  const card = (html) => `<section class="card" style="margin-top:16px;">${html}</section>`;

  const daysBetween = (start, end) => {
    return Math.round((stripTime(end) - stripTime(start)) / MS_IN_DAY);
  };

  const render = () => {
    const targetRaw = dateInput.value.trim();
    const compareRaw = compareInput.value.trim();
    const target = parseDate(targetRaw);
    const comparison = compareRaw ? parseDate(compareRaw) : stripTime(new Date());

    if (!target || !comparison) {
      output.innerHTML = card("<p>Please enter valid date(s).</p>");
      return;
    }

    const normalizedTarget = stripTime(target);
    const normalizedComparison = stripTime(comparison);
    const diff = daysBetween(normalizedComparison, normalizedTarget);

    let summary;
    if (diff === 0) {
      summary = "Your date is <strong>today</strong>.";
    } else if (diff > 0) {
      summary = `Your date is in <strong>${diff.toLocaleString()}</strong> day${plural(diff)}.`;
    } else {
      const abs = Math.abs(diff);
      summary = `Your date was <strong>${abs.toLocaleString()}</strong> day${plural(abs)} ago.`;
    }

    const html =
      `<h3>Result</h3>` +
      `<p>${summary}</p>` +
      `<p class="helper">Compared to ${formatFullDate(normalizedComparison)}.</p>`;

    output.innerHTML = card(html);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      output.innerHTML = "";
      dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      compareInput.dispatchEvent(new Event("input", { bubbles: true }));
      dateInput.focus();
    });
  });
})();
