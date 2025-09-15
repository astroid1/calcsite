(function () {
  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseDate(input) {
    if (!input) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    let y, m, da;
    if (iso.test(input)) {
      const m1 = input.match(iso); y = +m1[1]; m = +m1[2]; da = +m1[3];
    } else if (us.test(input)) {
      const m2 = input.match(us); m = +m2[1]; da = +m2[2]; y = +m2[3];
    } else return null;
    const d = new Date(y, m - 1, da);
    return d && d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === da ? d : null;
  }
  function formatISODate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  function plural(n) { return Math.abs(n) === 1 ? "" : "s"; }
  function ordinal(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return n + "st";
    if (mod10 === 2 && mod100 !== 12) return n + "nd";
    if (mod10 === 3 && mod100 !== 13) return n + "rd";
    return n + "th";
  }
  function card(html) { return '<section class="card" style="margin-top:16px;">' + html + "</section>"; }
  function anniversaryDate(base, number) {
    const year = base.getFullYear() + number;
    const month = base.getMonth();
    const day = base.getDate();
    let d = new Date(year, month, day);
    if (month === 1 && day === 29 && d.getMonth() !== month) {
      d = new Date(year, 1, 28);
    }
    return stripTime(d);
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

  const dateEl = document.getElementById("anniversary-date");
  const calcBtn = document.getElementById("anniversary-calc");
  const clearBtn = document.getElementById("anniversary-clear");
  const out = document.getElementById("anniversary-result");

  setupCalendarPickers();
  if (!dateEl || !calcBtn || !out) return;

  calcBtn.addEventListener("click", () => {
    const raw = dateEl.value.trim();
    const parsed = parseDate(raw);
    if (!parsed) {
      out.innerHTML = card("<p>Please enter a valid date.</p>");
      return;
    }

    const MS = 86400000;
    const special = stripTime(parsed);
    const today = stripTime(new Date());
    const diff = Math.round((today - special) / MS);

    const context = diff === 0
      ? "That's <strong>today</strong>."
      : diff > 0
        ? "That was <strong>" + diff + "</strong> day" + plural(diff) + " ago."
        : "That's in <strong>" + Math.abs(diff) + "</strong> day" + plural(Math.abs(diff)) + ".";

    const baseYear = special.getFullYear();
    let annNumber = Math.max(1, today.getFullYear() - baseYear);
    while (anniversaryDate(special, annNumber) < today) {
      annNumber += 1;
    }

    const items = [];
    for (let i = 0; i < 5; i += 1) {
      const annDate = anniversaryDate(special, annNumber + i);
      const daysAway = Math.round((annDate - today) / MS);
      const when = daysAway === 0
        ? "<span class=\"helper\">That's today!</span>"
        : "<span class=\"helper\">In " + daysAway + " day" + plural(daysAway) + ".</span>";
      items.push(
        "<li style=\"margin:10px 0;\">" +
          "<strong>" + ordinal(annNumber + i) + " anniversary</strong> — " +
          annDate.toDateString() + " " + when +
        "</li>"
      );
    }

    out.innerHTML = card(
      "<h3>Upcoming Anniversaries</h3>" +
        "<p class=\"helper\">Original date: <strong>" + special.toDateString() + "</strong>. " + context + "</p>" +
        "<ul style=\"list-style:none; padding:0; margin:14px 0 0;\">" + items.join("") + "</ul>"
    );
  });

  clearBtn && clearBtn.addEventListener("click", () => {
    dateEl.value = "";
    out.innerHTML = "";
    dateEl.dispatchEvent(new Event("input", { bubbles: true }));
    dateEl.focus();
  });
})();
