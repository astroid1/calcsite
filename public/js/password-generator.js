(function () {
  const form = document.getElementById("password-form");
  const resultEl = document.getElementById("password-result");
  const lengthInput = document.getElementById("password-length");

  if (!form || !resultEl || !lengthInput) return;

  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const SYMBOLS = [
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "-",
    "_",
    "=",
    "+",
    "[",
    "]",
    "{",
    "}",
    ";",
    ":",
    ",",
    ".",
    "<",
    ">",
    "?",
    "/",
    "|",
    "~",
    "`",
    "'",
    '"',
    "\\",
  ].join("");
  const SIMILAR_CHARACTERS = new Set(["O", "0", "o", "1", "l", "I", "|", "\\"]);

  function clampLength(value) {
    if (!Number.isFinite(value)) return 16;
    return Math.min(64, Math.max(4, Math.round(value)));
  }

  function secureRandom(max) {
    if (max <= 0) return 0;
    const cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const array = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      let candidate = 0;
      do {
        cryptoObj.getRandomValues(array);
        candidate = array[0];
      } while (candidate >= limit);
      return candidate % max;
    }
    return Math.floor(Math.random() * max);
  }

  function pickChar(pool) {
    return pool.charAt(secureRandom(pool.length));
  }

  function filterSimilar(pool, avoidSimilar) {
    if (!avoidSimilar) return pool;
    return pool
      .split("")
      .filter((char) => !SIMILAR_CHARACTERS.has(char))
      .join("");
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = secureRandom(i + 1);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  function generatePassword(length, options) {
    const pools = [];
    const { useLower, useUpper, useNumbers, useSymbols, avoidSimilar } = options;

    if (useLower) {
      const filtered = filterSimilar(LOWER, avoidSimilar);
      if (filtered) pools.push(filtered);
    }
    if (useUpper) {
      const filtered = filterSimilar(UPPER, avoidSimilar);
      if (filtered) pools.push(filtered);
    }
    if (useNumbers) {
      const filtered = filterSimilar(NUMBERS, avoidSimilar);
      if (filtered) pools.push(filtered);
    }
    if (useSymbols) {
      const filtered = filterSimilar(SYMBOLS, avoidSimilar);
      if (filtered) pools.push(filtered);
    }

    if (!pools.length) {
      return { password: "", poolSize: 0 };
    }

    if (length < pools.length) {
      return { password: "", poolSize: pools.reduce((sum, pool) => sum + pool.length, 0) };
    }

    const passwordChars = [];

    // Ensure each selected pool contributes at least one character
    for (const pool of pools) {
      passwordChars.push(pickChar(pool));
    }

    const combinedLength = pools.reduce((sum, pool) => sum + pool.length, 0);

    for (let i = passwordChars.length; i < length; i += 1) {
      const pool = pools[secureRandom(pools.length)];
      passwordChars.push(pickChar(pool));
    }

    shuffle(passwordChars);

    return { password: passwordChars.join(""), poolSize: combinedLength };
  }

  function renderError(message) {
    resultEl.innerHTML = `<section class="card"><p>${message}</p></section>`;
  }

  function renderPassword(password, poolSize, length) {
    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Generated password</h2>
        <div class="password-display">
          <input id="password-output" type="text" readonly spellcheck="false" />
          <button class="btn" type="button" data-action="copy">Copy</button>
        </div>
        <p class="helper" id="password-meta"></p>
      </section>
    `;

    const outputField = document.getElementById("password-output");
    const meta = document.getElementById("password-meta");

    if (outputField) {
      outputField.value = password;
      outputField.focus();
      outputField.select();
    }

    if (meta) {
      const entropy = poolSize > 0 ? (Math.log2(poolSize) * length).toFixed(1) : "0";
      meta.textContent = `Character pool: ${poolSize} · Approximate entropy: ${entropy} bits.`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const useLower = form.lowercase.checked;
    const useUpper = form.uppercase.checked;
    const useNumbers = form.numbers.checked;
    const useSymbols = form.symbols.checked;
    const avoidSimilar = form.avoidSimilar.checked;
    const length = clampLength(parseInt(form.length.value || "16", 10));

    lengthInput.value = String(length);

    if (!useLower && !useUpper && !useNumbers && !useSymbols) {
      renderError("Select at least one character set before generating a password.");
      return;
    }

    const { password, poolSize } = generatePassword(length, {
      useLower,
      useUpper,
      useNumbers,
      useSymbols,
      avoidSimilar,
    });

    if (!password) {
      renderError("Increase the length or adjust options so each set can be used.");
      return;
    }

    renderPassword(password, poolSize, length);
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      lengthInput.value = "16";
      resultEl.innerHTML = "";
    }, 0);
  });

  resultEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "copy") return;

    const outputField = document.getElementById("password-output");
    if (!(outputField instanceof HTMLInputElement)) return;

    outputField.select();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(outputField.value);
      } else {
        document.execCommand("copy");
      }
      const original = target.textContent;
      target.textContent = "Copied!";
      target.disabled = true;
      setTimeout(() => {
        target.textContent = original || "Copy";
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
