(function () {
  const form = document.getElementById("qr-form");
  const resultEl = document.getElementById("qr-result");
  const input = document.getElementById("qr-input");
  const sizeInput = document.getElementById("qr-size");
  const eccInput = document.getElementById("qr-ecc");
  const marginInput = document.getElementById("qr-margin");
  const statusEl = document.getElementById("qr-status");

  if (!form || !resultEl || !input || !sizeInput || !eccInput || !marginInput) return;

  let activeController = null;
  let objectUrl = null;
  const ALLOWED_ECC = new Set(["L", "M", "Q", "H"]);

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function clearObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function clearOutput() {
    clearObjectUrl();
    resultEl.innerHTML = "";
    delete resultEl.dataset.qrRemote;
    delete resultEl.dataset.qrText;
  }

  function showError(message) {
    clearOutput();
    resultEl.innerHTML = `<section class="card"><p>${message}</p></section>`;
    setStatus("");
  }

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function buildRemoteUrl(text, size, ecc, margin) {
    const params = new URLSearchParams({
      data: text,
      size: `${size}x${size}`,
      ecc,
      margin: String(margin),
      format: "png",
    });
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  }

  function renderQr({ displayUrl, downloadUrl, remoteUrl, text, size, fallback }) {
    resultEl.dataset.qrRemote = remoteUrl;
    resultEl.dataset.qrText = text;
    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">QR code preview</h2>
        <div class="qr-preview">
          <img id="qr-image" alt="QR code preview" loading="lazy" />
        </div>
        <div class="qr-actions">
          <a class="btn" id="qr-download" href="#">Download PNG</a>
          <button class="btn" type="button" data-action="open">Open in new tab</button>
          <button class="btn" type="button" data-action="copy-text">Copy original text</button>
        </div>
        <p class="helper" id="qr-helper"></p>
      </section>
    `;

    const imageEl = document.getElementById("qr-image");
    if (imageEl instanceof HTMLImageElement) {
      imageEl.src = displayUrl;
      imageEl.width = size;
      imageEl.height = size;
      imageEl.style.maxWidth = `${size}px`;
      imageEl.style.width = "100%";
      imageEl.style.height = "auto";
      imageEl.decoding = "async";
    }

    const downloadLink = document.getElementById("qr-download");
    if (downloadLink instanceof HTMLAnchorElement) {
      downloadLink.href = downloadUrl;
      downloadLink.textContent = fallback ? "Download / open PNG" : "Download PNG";
      if (fallback) {
        downloadLink.removeAttribute("download");
        downloadLink.setAttribute("target", "_blank");
        downloadLink.setAttribute("rel", "noopener");
      } else {
        downloadLink.setAttribute("download", "qr-code.png");
        downloadLink.removeAttribute("target");
        downloadLink.removeAttribute("rel");
      }
    }

    const helper = document.getElementById("qr-helper");
    if (helper) {
      helper.textContent = fallback
        ? "We fell back to the QR server preview—use the buttons to open or save it."
        : "Download saves a PNG you can drop into a document or share immediately.";
    }
  }

  async function fetchQr(remoteUrl, controller) {
    try {
      const response = await fetch(remoteUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const blob = await response.blob();
      if (controller.signal.aborted) return null;
      clearObjectUrl();
      objectUrl = URL.createObjectURL(blob);
      return { displayUrl: objectUrl, downloadUrl: objectUrl, remoteUrl, fallback: false };
    } catch (error) {
      if (controller.signal.aborted) {
        return null;
      }
      return { displayUrl: remoteUrl, downloadUrl: remoteUrl, remoteUrl, fallback: true };
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rawText = input.value.trim();
    if (!rawText) {
      showError("Enter some text or a link to build a QR code.");
      return;
    }

    const eccValue = (eccInput.value || "M").toUpperCase();
    const ecc = ALLOWED_ECC.has(eccValue) ? eccValue : "M";
    let size = clamp(parseInt(sizeInput.value, 10), 120, 600);
    let margin = clamp(parseInt(marginInput.value, 10), 0, 20);
    sizeInput.value = String(size);
    marginInput.value = String(margin);

    const remoteUrl = buildRemoteUrl(rawText, size, ecc, margin);

    if (activeController) {
      activeController.abort();
    }
    const controller = new AbortController();
    activeController = controller;

    clearObjectUrl();
    setStatus("Generating QR code…");
    resultEl.innerHTML = `<section class="card"><p>Preparing your QR code…</p></section>`;

    const data = await fetchQr(remoteUrl, controller);
    if (!data) {
      if (controller === activeController) {
        activeController = null;
        setStatus("");
      }
      return;
    }

    if (controller !== activeController) {
      return;
    }

    renderQr({
      ...data,
      text: rawText,
      size,
    });

    setStatus(data.fallback ? "Preview ready. Download opens in a new tab." : "QR code ready—download or share now.");
    activeController = null;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      if (activeController) {
        activeController.abort();
        activeController = null;
      }
      clearOutput();
      setStatus("");
    }, 0);
  });

  resultEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;

    if (action === "open") {
      const remote = resultEl.dataset.qrRemote;
      if (remote) {
        window.open(remote, "_blank", "noopener");
      }
    } else if (action === "copy-text") {
      const text = resultEl.dataset.qrText || "";
      if (!text) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const temp = document.createElement("textarea");
          temp.value = text;
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
    }
  });
})();
