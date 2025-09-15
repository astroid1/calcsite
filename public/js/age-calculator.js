(function () {
  if (typeof window === "undefined" || !window.CalcDate) return;

  const { MS_IN_DAY, parseDate, plural, setupCalendarPickers, stripTime } =
    window.CalcDate;

  const form = document.getElementById("age-form");
  const birthInput = document.getElementById("birthdate");
  const output = document.getElementById("age-result");
  if (!form || !birthInput || !output) return;

  setupCalendarPickers(form);

  const dateFormatter =
    typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" })
      : null;

  const formatFullDate = (date) =>
    dateFormatter ? dateFormatter.format(date) : date.toDateString();

  const card = (html) =>
    `<section class="card" style="margin-top:16px;">${html}</section>`;
  const renderError = (message) => {
    output.innerHTML = card(`<p>${message}</p>`);
  };

  const daysInMonth = (year, monthIndex) =>
    new Date(year, monthIndex + 1, 0).getDate();

  const addMonthsClamped = (date, count, anchorDay) => {
    const anchor = anchorDay ?? date.getDate();
    const monthOffset = date.getMonth() + count;
    const year = date.getFullYear() + Math.floor(monthOffset / 12);
    const monthIndex = ((monthOffset % 12) + 12) % 12;
    const dim = daysInMonth(year, monthIndex);
    return new Date(year, monthIndex, Math.min(anchor, dim));
  };

  const diffParts = (start, end) => {
    const from = stripTime(start);
    const to = stripTime(end);
    if (from > to) return null;

    let years = to.getFullYear() - from.getFullYear();
    let cursor = addMonthsClamped(from, years * 12, from.getDate());
    if (cursor > to) {
      years -= 1;
      cursor = addMonthsClamped(from, years * 12, from.getDate());
    }

    let months = 0;
    while (true) {
      const next = addMonthsClamped(cursor, 1, from.getDate());
      if (next > to) break;
      cursor = next;
      months += 1;
    }

    const days = Math.round((to - cursor) / MS_IN_DAY);
    return { years, months, days };
  };

  const nextBirthday = (birth, from) => {
    const normalizedFrom = stripTime(from);
    const anchor = birth.getDate();
    const baseYear = normalizedFrom.getFullYear();
    let candidate = new Date(baseYear, birth.getMonth(), anchor);

    if (candidate.getMonth() !== birth.getMonth()) {
      const dim = daysInMonth(baseYear, birth.getMonth());
      candidate = new Date(baseYear, birth.getMonth(), dim);
    }

    if (candidate < normalizedFrom) {
      const year = baseYear + 1;
      const dimNext = daysInMonth(year, birth.getMonth());
      candidate = new Date(year, birth.getMonth(), Math.min(anchor, dimNext));
    }

    return candidate;
  };

  const render = () => {
    const birth = parseDate(birthInput.value.trim());
    if (!birth) {
      renderError("Please enter a valid birthdate.");
      return;
    }

    const today = stripTime(new Date());
    if (birth > today) {
      renderError("Birthdate can't be in the future.");
      return;
    }

    const parts = diffParts(birth, today);
    if (!parts) {
      renderError("Please enter a valid birthdate.");
      return;
    }

    const normalizedBirth = stripTime(birth);
    const totalDays = Math.round((today - normalizedBirth) / MS_IN_DAY);
    const next = stripTime(nextBirthday(birth, today));
    const untilNext = Math.round((next - today) / MS_IN_DAY);

    const countdown =
      untilNext === 0
        ? "Today is your birthday! 🎉"
        : `Next birthday: ${formatFullDate(next)} (in ${untilNext.toLocaleString()} day${plural(untilNext)}).`;

    const html =
      `<h3>Result</h3>` +
      `<p>As of ${formatFullDate(today)}, you are <strong>${parts.years}</strong> year${plural(parts.years)}, <strong>${parts.months}</strong> month${plural(parts.months)}, and <strong>${parts.days}</strong> day${plural(parts.days)} old.</p>` +
      `<p class="helper">That's roughly ${totalDays.toLocaleString()} total day${plural(totalDays)}.</p>` +
      `<p class="helper">${countdown}</p>`;

    output.innerHTML = card(html);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      output.innerHTML = "";
      birthInput.dispatchEvent(new Event("input", { bubbles: true }));
      birthInput.focus();
    });
  });
})();
