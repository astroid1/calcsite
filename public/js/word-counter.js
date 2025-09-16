(function () {
  if (typeof window === "undefined") return;

  const form = document.getElementById("word-counter-form");
  const input = document.getElementById("word-counter-input");
  const targetInput = document.getElementById("word-target");
  const readingInput = document.getElementById("word-reading-speed");
  const copyButton = document.getElementById("word-copy");
  const wordEl = document.getElementById("word-total");
  const charEl = document.getElementById("char-total");
  const charTightEl = document.getElementById("char-tight");
  const sentenceEl = document.getElementById("sentence-total");
  const paragraphEl = document.getElementById("paragraph-total");
  const readingEl = document.getElementById("reading-time");
  const progressEl = document.getElementById("word-target-progress");

  if (!form || !input) return;

  function safeNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function countParagraphs(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const parts = trimmed.split(/\n{2,}/);
    return parts.filter((part) => part.trim().length > 0).length;
  }

  function countSentences(text) {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return 0;
    const parts = cleaned.split(/[.!?]+/);
    return parts.filter((part) => part.trim().length > 0).length;
  }

  function countWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  function countCharactersWithoutWhitespace(text) {
    return text.replace(/\s+/g, "").length;
  }

  function formatReadingTime(words, wpm) {
    if (words <= 0 || wpm <= 0) return "0 min";
    const totalMinutes = words / wpm;
    let minutes = Math.floor(totalMinutes);
    let seconds = Math.round((totalMinutes - minutes) * 60);
    if (seconds === 60) {
      minutes += 1;
      seconds = 0;
    }
    const minuteLabel = minutes > 0 ? `${minutes} min` : "";
    const secondLabel = seconds > 0 ? `${seconds} sec` : "";
    return [minuteLabel, secondLabel].filter(Boolean).join(" ") || "0 min";
  }

  function updateStats() {
    const text = input.value;
    const wordCount = countWords(text);
    const characters = text.length;
    const charactersTight = countCharactersWithoutWhitespace(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readingSpeed = Math.max(safeNumber(readingInput?.value), 1);
    const readingTime = formatReadingTime(wordCount, readingSpeed);

    if (wordEl) wordEl.textContent = wordCount.toLocaleString();
    if (charEl) charEl.textContent = characters.toLocaleString();
    if (charTightEl) charTightEl.textContent = charactersTight.toLocaleString();
    if (sentenceEl) sentenceEl.textContent = sentences.toLocaleString();
    if (paragraphEl) paragraphEl.textContent = paragraphs.toLocaleString();
    if (readingEl) readingEl.textContent = readingTime;

    const target = safeNumber(targetInput?.value);
    if (target > 0 && progressEl) {
      const progress = Math.min(100, (wordCount / target) * 100);
      const remaining = Math.max(target - wordCount, 0);
      const status =
        remaining > 0
          ? `${progress.toFixed(1)}% of ${target.toLocaleString()} words · ${remaining.toLocaleString()} to go`
          : `Target met! ${wordCount.toLocaleString()} words`;
      progressEl.textContent = `Word goal progress: ${status}`;
    } else if (progressEl) {
      progressEl.textContent = "";
    }

    if (copyButton) {
      copyButton.disabled = !text;
    }
  }

  input.addEventListener("input", updateStats);
  targetInput?.addEventListener("input", updateStats);
  readingInput?.addEventListener("input", updateStats);

  copyButton?.addEventListener("click", async () => {
    if (!input.value) return;
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      if (progressEl) {
        progressEl.textContent = "Clipboard unavailable—select the text and copy manually.";
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(input.value);
      if (progressEl) {
        const previous = progressEl.textContent;
        progressEl.textContent = "Copied to clipboard.";
        window.setTimeout(() => {
          progressEl.textContent = previous || "";
        }, 1500);
      }
    } catch (error) {
      if (progressEl) {
        progressEl.textContent = "Copy failed—select the text manually.";
      }
    }
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      updateStats();
    });
  });

  updateStats();
})();
