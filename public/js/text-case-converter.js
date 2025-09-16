(function () {
  const form = document.getElementById("case-form");
  const resultEl = document.getElementById("case-result");
  const input = document.getElementById("case-input");

  if (!form || !resultEl || !input) return;

  const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

  function toTitleCase(text) {
    const lower = text.toLocaleLowerCase();
    let result = "";
    let capitalizeNext = true;

    for (const char of lower) {
      if (LETTER_OR_NUMBER.test(char)) {
        if (capitalizeNext) {
          result += char.toLocaleUpperCase();
          capitalizeNext = false;
        } else {
          result += char;
        }
      } else {
        result += char;
        const isApostrophe = char === "'" || char === "\u2019";
        capitalizeNext = !isApostrophe;
      }
    }

    return result;
  }

  function formatModeLabel(mode) {
    switch (mode) {
      case "upper":
        return "Uppercase";
      case "lower":
        return "Lowercase";
      case "title":
        return "Title Case";
      default:
        return "Converted";
    }
  }

  function renderError(message) {
    resultEl.innerHTML = `<section class="card"><p>${message}</p></section>`;
  }

  function renderResult(mode, text) {
    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${formatModeLabel(mode)}</h2>
        <textarea id="case-output" readonly rows="8"></textarea>
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn" type="button" data-action="copy">Copy</button>
          <button class="btn" type="button" data-action="replace">Replace input</button>
        </div>
        <p class="helper" id="case-meta"></p>
      </section>
    `;

    const output = document.getElementById("case-output");
    const meta = document.getElementById("case-meta");

    if (output instanceof HTMLTextAreaElement) {
      output.value = text;
      output.scrollTop = 0;
    }

    if (meta) {
      meta.textContent = `${text.length} character${text.length === 1 ? "" : "s"}.`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const mode = submitter && submitter instanceof HTMLButtonElement ? submitter.value : "upper";
    const original = input.value;

    if (!original) {
      renderError("Enter or paste some text to convert.");
      return;
    }

    let converted = original;

    switch (mode) {
      case "upper":
        converted = original.toLocaleUpperCase();
        break;
      case "lower":
        converted = original.toLocaleLowerCase();
        break;
      case "title":
        converted = toTitleCase(original);
        break;
      default:
        converted = original;
    }

    renderResult(mode, converted);
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });

  resultEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const output = document.getElementById("case-output");
    if (!(output instanceof HTMLTextAreaElement)) return;

    if (target.dataset.action === "copy") {
      output.select();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(output.value);
        } else {
          document.execCommand("copy");
        }
        const originalLabel = target.textContent;
        target.textContent = "Copied!";
        target.disabled = true;
        setTimeout(() => {
          target.textContent = originalLabel || "Copy";
          target.disabled = false;
        }, 1500);
      } catch (error) {
        target.textContent = "Copy failed";
        target.disabled = true;
        setTimeout(() => {
          target.textContent = "Copy";
          target.disabled = false;
        }, 2000);
      }
    } else if (target.dataset.action === "replace") {
      input.value = output.value;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
})();
