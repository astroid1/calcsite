(function () {
  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseDate(input) {
    if (!input) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
    const us  = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
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
  function daysBetween(a, b) {
    const MS = 86400000;
    return Math.round((stripTime(b) - stripTime(a)) / MS);
  }
  function plural(n) { return Math.abs(n) === 1 ? "" : "s"; }
  function card(html) { return '<section class="card" style="margin-top:16px;">' + html + "</section>"; }

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

  const dateEl = document.getElementById("date");
  const compareEl = document.getElementById("compare");
  const calcBtn = document.getElementById("calc");
  const clearBtn = document.getElementById("clear");
  const out = document.getElementById("result");

  setupCalendarPickers();
  if (!dateEl || !calcBtn || !out) return;

  calcBtn.addEventListener("click", () => {
    const date = parseDate(dateEl.value.trim());
    const comp = compareEl.value.trim() ? parseDate(compareEl.value.trim()) : stripTime(new Date());
    if (!date || !comp) {
      out.innerHTML = card('<p>Please enter valid date(s).</p>');
      return;
    }
    const diff = daysBetween(comp, date);
    let text;
    if (diff === 0) text = "Your date is <strong>today</strong>.";
    else if (diff > 0) text = "Your date is in <strong>" + diff + "</strong> day" + plural(diff) + ".";
    else text = "Your date was <strong>" + Math.abs(diff) + "</strong> day" + plural(diff) + " ago.";
    out.innerHTML = card('<h3>Result</h3><p>' + text + " <span class=\"helper\">(Compared to " + comp.toDateString() + ".)</span></p>");
  });

  clearBtn && clearBtn.addEventListener("click", () => {
    dateEl.value = ""; compareEl.value = ""; out.innerHTML = "";
    dateEl.dispatchEvent(new Event("input", { bubbles: true }));
    compareEl.dispatchEvent(new Event("input", { bubbles: true }));
    dateEl.focus();
  });
})();
