(function () {
  if (typeof window === "undefined") return;

  const form = document.getElementById("pdf-form");
  const fileInput = document.getElementById("pdf-file");
  const statusEl = document.getElementById("pdf-status");
  const output = document.getElementById("pdf-output");
  const downloadWord = document.getElementById("pdf-download-word");
  const downloadText = document.getElementById("pdf-download-text");
  const copyButton = document.getElementById("pdf-copy");
  const charCountEl = document.getElementById("pdf-char-count");
  const wordCountEl = document.getElementById("pdf-word-count");
  const lineCountEl = document.getElementById("pdf-line-count");

  if (!form || !fileInput || !output) return;

  let baseFilename = "extracted-text";

  function setButtonsEnabled(enabled) {
    const state = !enabled;
    if (downloadWord) downloadWord.disabled = state;
    if (downloadText) downloadText.disabled = state;
    if (copyButton) copyButton.disabled = state;
  }

  function decodePdfString(value) {
    if (!value) return "";
    return value
      .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\r/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\f/g, "")
      .replace(/\\b/g, "")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
  }

  function extractTextFromArray(arrayContent) {
    const parts = [];
    const regex = /\(([^()]*?(?:\\.[^()]*)*)\)/g;
    let match;
    while ((match = regex.exec(arrayContent))) {
      parts.push(decodePdfString(match[1]));
    }
    return parts.join("");
  }

  function extractPdfText(buffer) {
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(bytes);
    const textChunks = [];

    const directRegex = /\(([^()]*?(?:\\.[^()]*)*)\)\s*Tj/g;
    let match;
    while ((match = directRegex.exec(raw))) {
      textChunks.push(decodePdfString(match[1]));
    }

    const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = arrayRegex.exec(raw))) {
      textChunks.push(extractTextFromArray(match[1]));
    }

    if (textChunks.length === 0) {
      // Fallback to collect any strings even if operators weren't matched.
      const looseRegex = /\(([^()]*?(?:\\.[^()]*)*)\)/g;
      while ((match = looseRegex.exec(raw))) {
        textChunks.push(decodePdfString(match[1]));
      }
    }

    let combined = textChunks.join("");
    combined = combined.replace(/\r\n?/g, "\n");
    combined = combined.replace(/\u0000/g, "");
    combined = combined.replace(/\n{3,}/g, "\n\n");
    combined = combined.replace(/([^\s])\n(?!\n)/g, "$1\n");
    return combined.trim();
  }

  function updateStats() {
    const text = output.value || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\n/).length : 0;
    if (wordCountEl) wordCountEl.textContent = words.toLocaleString();
    if (charCountEl) charCountEl.textContent = chars.toLocaleString();
    if (lineCountEl) lineCountEl.textContent = lines.toLocaleString();
    setButtonsEnabled(Boolean(text));
  }

  function downloadBlob(filename, type, data) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadAsWord() {
    const text = output.value.trim();
    if (!text) return;
    const paragraphs = text.split(/\n{2,}/).map((para) => para.trim());
    const htmlBody = paragraphs
      .map((para) => {
        const safe = para.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<p>${safe.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlBody}</body></html>`;
    downloadBlob(`${baseFilename}.doc`, "application/msword", html);
  }

  function downloadAsText() {
    const text = output.value;
    if (!text) return;
    downloadBlob(`${baseFilename}.txt`, "text/plain;charset=utf-8", text);
  }

  async function copyText() {
    if (!output.value) return;
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      if (statusEl)
        statusEl.textContent = "Clipboard unavailable—select the text and copy manually.";
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      if (statusEl) statusEl.textContent = "Copied extracted text to your clipboard.";
    } catch (error) {
      if (statusEl) statusEl.textContent = "Copy failed—select the text manually.";
    }
  }

  async function handleFileChange() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      output.value = "";
      updateStats();
      if (statusEl)
        statusEl.textContent = "Select a reasonably small text-based PDF (forms and scanned images may not extract cleanly).";
      return;
    }

    baseFilename = file.name.replace(/\.pdf$/i, "") || "extracted-text";
    if (statusEl) statusEl.textContent = "Reading PDF…";
    setButtonsEnabled(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          throw new Error("Unsupported file result");
        }
        const text = extractPdfText(buffer);
        output.value = text;
        updateStats();
        if (statusEl) {
          statusEl.textContent = text
            ? "Extraction complete. Review and edit as needed before downloading."
            : "No text blocks were found. The PDF may be image-based or heavily formatted.";
        }
      } catch (error) {
        output.value = "";
        updateStats();
        if (statusEl)
          statusEl.textContent = "Something went wrong while parsing—try another PDF or a smaller file.";
      }
    };
    reader.onerror = () => {
      output.value = "";
      updateStats();
      if (statusEl)
        statusEl.textContent = "Unable to read the PDF. Make sure the file isn't encrypted.";
    };
    reader.readAsArrayBuffer(file);
  }

  fileInput.addEventListener("change", handleFileChange);
  output.addEventListener("input", () => {
    updateStats();
    if (statusEl) statusEl.textContent = "Edited text won't affect your original PDF.";
  });
  downloadWord?.addEventListener("click", downloadAsWord);
  downloadText?.addEventListener("click", downloadAsText);
  copyButton?.addEventListener("click", copyText);

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      output.value = "";
      setButtonsEnabled(false);
      updateStats();
      if (statusEl)
        statusEl.textContent = "Select a reasonably small text-based PDF (forms and scanned images may not extract cleanly).";
    });
  });

  updateStats();
})();
