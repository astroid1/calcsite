(function () {
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDate(input) {
    if (!input) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    let y, m, da;
    if (iso.test(input)) {
      const m1 = input.match(iso);
      y = +m1[1];
      m = +m1[2];
      da = +m1[3];
    } else if (us.test(input)) {
      const m2 = input.match(us);
      m = +m2[1];
      da = +m2[2];
      y = +m2[3];
    } else return null;
    const d = new Date(y, m - 1, da);
    return d &&
      d.getFullYear() === y &&
      d.getMonth() === m - 1 &&
      d.getDate() === da
      ? d
      : null;
  }
  function formatISODate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  function plural(n) {
    return Math.abs(n) === 1 ? "" : "s";
  }
  function card(html) {
    return (
      '<section class="card" style="margin-top:16px;">' + html + "</section>"
    );
  }
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function addMonthsClamped(date, count, anchorDay) {
    const y = date.getFullYear();
    const m = date.getMonth() + count;
    const targetYear = y + Math.floor(m / 12);
    const targetMonth = ((m % 12) + 12) % 12;
    const day = anchorDay !== undefined ? anchorDay : date.getDate();
    const dim = daysInMonth(targetYear, targetMonth);
    return new Date(targetYear, targetMonth, Math.min(day, dim));
  }
  function diffParts(start, end) {
    start = stripTime(start);
    end = stripTime(end);
    if (start > end) return null;
    let years = end.getFullYear() - start.getFullYear();
    let anniversary = addMonthsClamped(start, years * 12, start.getDate());
    if (anniversary > end) {
      years -= 1;
      anniversary = addMonthsClamped(start, years * 12, start.getDate());
    }
    let months = 0;
    let cursor = anniversary;
    while (true) {
      const next = addMonthsClamped(cursor, 1, start.getDate());
      if (next > end) break;
      cursor = next;
      months += 1;
    }
    const days = Math.round((end - cursor) / 86400000);
    return { years, months, days };
  }
  function nextBirthday(birth, from) {
    const anchorDay = birth.getDate();
    let candidate = new Date(from.getFullYear(), birth.getMonth(), 1);
    const dim = daysInMonth(candidate.getFullYear(), candidate.getMonth());
    candidate.setDate(Math.min(anchorDay, dim));
    if (candidate <= from) {
      const year = from.getFullYear() + 1;
      const dimNext = daysInMonth(year, birth.getMonth());
      candidate = new Date(
        year,
        birth.getMonth(),
        Math.min(anchorDay, dimNext),
      );
    }
    return candidate;
  }
  function setupCalendarPickers() {
    const fields = document.querySelectorAll(".date-input");
    fields.forEach((field) => {
      const textInput = field.querySelector('[data-role="date-text"]');
      const pickerInput = field.querySelector('[data-role="date-picker"]');
      const trigger = field.querySelector(".date-trigger");
      if (!textInput || !pickerInput || !trigger) return;

      const syncPicker = () => {
        const parsed = parseDate(textInput.value.trim());
        pickerInput.value = parsed ? formatISODate(parsed) : "";
      };

      syncPicker();

      trigger.addEventListener("click", () => {
        syncPicker();
        if (typeof pickerInput.showPicker === "function") {
          pickerInput.showPicker();
        } else {
          pickerInput.focus();
          pickerInput.click();
        }
      });

      pickerInput.addEventListener("change", () => {
        if (pickerInput.value) {
          textInput.value = pickerInput.value;
          textInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      textInput.addEventListener("input", syncPicker);
    });
  }

  const birthInput = document.getElementById("birthdate");
  const calcBtn = document.getElementById("age-calc");
  const clearBtn = document.getElementById("age-clear");
  const out = document.getElementById("age-result");

  setupCalendarPickers();
  if (!birthInput || !calcBtn || !out) return;

  function render() {
    const birth = parseDate(birthInput.value.trim());
    const today = stripTime(new Date());
    if (!birth) {
      out.innerHTML = card("<p>Please enter a valid birthdate.</p>");
      return;
    }
    if (birth > today) {
      out.innerHTML = card("<p>Birthdate can't be in the future.</p>");
      return;
    }
    const parts = diffParts(birth, today);
    if (!parts) {
      out.innerHTML = card("<p>Please enter a valid birthdate.</p>");
      return;
    }
    const totalDays = Math.round((today - stripTime(birth)) / 86400000);
    const next = nextBirthday(birth, today);
    const untilNext = Math.round((stripTime(next) - today) / 86400000);
    const html =
      "<h3>Result</h3>" +
      "<p>You are <strong>" +
      parts.years +
      "</strong> year" +
      plural(parts.years) +
      ", <strong>" +
      parts.months +
      "</strong> month" +
      plural(parts.months) +
      ", and <strong>" +
      parts.days +
      "</strong> day" +
      plural(parts.days) +
      " old.</p>" +
      '<p class="helper">That is about ' +
      totalDays.toLocaleString() +
      " day" +
      plural(totalDays) +
      " alive.</p>" +
      '<p class="helper">Next birthday: ' +
      next.toDateString() +
      " (in " +
      untilNext +
      " day" +
      plural(untilNext) +
      ").</p>";
    out.innerHTML = card(html);
  }

  calcBtn.addEventListener("click", render);
  birthInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      render();
    }
  });

  clearBtn &&
    clearBtn.addEventListener("click", () => {
      birthInput.value = "";
      out.innerHTML = "";
      birthInput.dispatchEvent(new Event("input", { bubbles: true }));
      birthInput.focus();
    });
})();
