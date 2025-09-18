(function () {
  if (typeof window === "undefined") return;

  const MS_IN_DAY = 86400000;
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const usPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseDate(input) {
    if (!input) return null;
    const value = input.trim();
    let year;
    let month;
    let day;

    if (isoPattern.test(value)) {
      const match = value.match(isoPattern);
      if (!match) return null;
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    } else if (usPattern.test(value)) {
      const match = value.match(usPattern);
      if (!match) return null;
      month = Number(match[1]);
      day = Number(match[2]);
      year = Number(match[3]);
    } else {
      return null;
    }

    const result = new Date(year, month - 1, day);
    if (
      !result ||
      result.getFullYear() !== year ||
      result.getMonth() !== month - 1 ||
      result.getDate() !== day
    ) {
      return null;
    }
    return result;
  }

  function formatISODate(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mm}-${dd}`;
  }

  function plural(value) {
    return Math.abs(Number(value)) === 1 ? "" : "s";
  }

  function setupCalendarPickers(root = document) {
    const scope =
      root && typeof root.querySelectorAll === "function" ? root : document;
    const fields = scope.querySelectorAll(".date-input");
    fields.forEach((field) => {
      if (field.dataset.datePickerReady === "true") return;
      field.dataset.datePickerReady = "true";

      const textInput = field.querySelector('[data-role="date-text"]');
      const pickerInput = field.querySelector('[data-role="date-picker"]');
      const trigger = field.querySelector(".date-trigger");
      if (!textInput) return;

      const syncPicker = () => {
        if (!pickerInput) return;
        const parsed = parseDate(textInput.value.trim());
        pickerInput.value = parsed ? formatISODate(parsed) : "";
      };

      const supportsNativeShow =
        pickerInput && typeof pickerInput.showPicker === "function";

      if (pickerInput && !supportsNativeShow) {
        field.classList.add("native-picker-fallback");
      }

      if (pickerInput) {
        syncPicker();
        pickerInput.addEventListener("change", () => {
          textInput.value = pickerInput.value ? pickerInput.value : "";
          textInput.dispatchEvent(new Event("input", { bubbles: true }));
        });
      }

      if (trigger && pickerInput) {
        trigger.addEventListener("click", () => {
          syncPicker();
          if (supportsNativeShow) {
            pickerInput.showPicker();
          } else {
            pickerInput.focus();
            pickerInput.click();
          }
        });
      }

      textInput.addEventListener("input", syncPicker);

      const form = field.closest("form");
      if (form) {
        form.addEventListener("reset", () => {
          window.requestAnimationFrame(syncPicker);
        });
      }
    });
  }

  window.CalcDate = Object.assign(window.CalcDate || {}, {
    MS_IN_DAY,
    formatISODate,
    parseDate,
    plural,
    setupCalendarPickers,
    stripTime,
  });
})();
