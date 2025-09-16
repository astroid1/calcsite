(function () {
  const form = document.getElementById("color-form");
  const resultEl = document.getElementById("color-result");
  const hexInput = document.getElementById("color-hex");
  const rgbInput = document.getElementById("color-rgb");
  const statusEl = document.getElementById("color-status");

  if (!form || !resultEl || !hexInput || !rgbInput) return;

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function renderError(message) {
    resultEl.innerHTML = `<section class="card"><p>${message}</p></section>`;
    setStatus("");
  }

  function parseHex(value) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!match) return null;
    let hex = match[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { hex: `#${hex.toUpperCase()}`, r, g, b };
  }

  function parseRgb(value) {
    if (!value) return null;
    let text = value.trim();
    if (!text) return null;
    if (/^rgba?/i.test(text)) {
      text = text.replace(/^rgba?\(/i, "").replace(/\)$/g, "");
    }
    const parts = text.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;

    const components = [];

    for (let i = 0; i < 3; i += 1) {
      const part = parts[i];
      const isPercent = /%$/.test(part);
      const numeric = parseFloat(part);
      if (!Number.isFinite(numeric)) return null;
      let value255;
      if (isPercent) {
        if (numeric < 0 || numeric > 100) return null;
        value255 = Math.round((numeric / 100) * 255);
      } else {
        if (numeric < 0 || numeric > 255) return null;
        value255 = Math.round(numeric);
      }
      components.push(value255);
    }

    return { r: components[0], g: components[1], b: components[2] };
  }

  function toHex(component) {
    return component.toString(16).padStart(2, "0").toUpperCase();
  }

  function renderColor({ hex, r, g, b }) {
    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Color preview</h2>
        <div class="color-preview">
          <div class="color-swatch" style="background:${hex};"></div>
          <div class="color-info">
            <div class="color-row">
              <span class="label">HEX</span>
              <code data-role="hex-value"></code>
              <button class="btn" type="button" data-copy="${hex}">Copy</button>
            </div>
            <div class="color-row">
              <span class="label">RGB</span>
              <code data-role="rgb-value"></code>
              <button class="btn" type="button" data-copy="${r}, ${g}, ${b}">Copy</button>
            </div>
          </div>
        </div>
      </section>
    `;

    const hexValue = resultEl.querySelector('[data-role="hex-value"]');
    const rgbValue = resultEl.querySelector('[data-role="rgb-value"]');
    if (hexValue) {
      hexValue.textContent = hex;
    }
    if (rgbValue) {
      rgbValue.textContent = `${r}, ${g}, ${b}`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("");
    const hexValue = hexInput.value.trim();
    const rgbValue = rgbInput.value.trim();

    if (!hexValue && !rgbValue) {
      renderError("Enter a hex code or RGB values to convert.");
      return;
    }

    let color;
    let message = "";

    if (hexValue) {
      color = parseHex(hexValue);
      if (!color) {
        renderError("Hex colors should be #RGB or #RRGGBB.");
        return;
      }
      hexInput.value = color.hex;
      rgbInput.value = `${color.r}, ${color.g}, ${color.b}`;
      message = "Converted HEX → RGB.";
    } else if (rgbValue) {
      color = parseRgb(rgbValue);
      if (!color) {
        renderError("RGB values need three numbers between 0 and 255.");
        return;
      }
      const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      hexInput.value = hex;
      rgbInput.value = `${color.r}, ${color.g}, ${color.b}`;
      color = { ...color, hex };
      message = "Converted RGB → HEX.";
    }

    if (!color) {
      renderError("We couldn't read that color. Try again.");
      return;
    }

    renderColor(color);
    setStatus(message);
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
      setStatus("");
    }, 0);
  });

  resultEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const value = target.dataset.copy;
    if (!value) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const temp = document.createElement("textarea");
        temp.value = value;
        temp.setAttribute("readonly", "true");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
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
  });
})();
