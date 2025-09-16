(function () {
  if (typeof window === "undefined") return;

  const promptBank = {
    paragraph: [
      "Typing quickly comes from practicing proper technique and keeping a steady rhythm.",
      "Set a timer, take a deep breath, and focus on accuracy before pushing for speed.",
      "Consistency beats intensity—short bursts of deliberate practice deliver the best improvements.",
      "Writers often warm up with free-flowing paragraphs to loosen their fingers and clear their minds.",
      "Track your progress each week so you can celebrate the small gains that add up over time.",
    ],
    quotes: [
      "The secret of getting ahead is getting started.",
      "Perfection is not attainable, but if we chase perfection we can catch excellence.",
      "Success is the sum of small efforts, repeated day in and day out.",
      "Quality is not an act, it is a habit.",
      "The future depends on what you do today.",
    ],
    numbers: [
      "123 456 789 0 + - = * 321 654 987",
      "2024 / 07 / 04 – deadlines, budgets, 15% growth goals",
      "Call 555-0102 at 9:45 AM, then send 12 invoices for $175 each.",
      "Invoice #1048 totals $2,987.43 after a 6.5% state tax.",
      "9 + 10 = 19, but 9 × 10 = 90—double-check the symbols!",
    ],
  };

  const settingsForm = document.getElementById("typing-settings");
  const startButton = document.getElementById("typing-start");
  const resetButton = document.getElementById("typing-reset");
  const durationSelect = document.getElementById("typing-duration");
  const modeSelect = document.getElementById("typing-mode");
  const statusEl = document.getElementById("typing-status");
  const promptEl = document.getElementById("typing-prompt");
  const inputEl = document.getElementById("typing-input");
  const timerEl = document.getElementById("typing-timer");
  const errorsEl = document.getElementById("typing-errors");
  const wpmEl = document.getElementById("typing-wpm");
  const grossEl = document.getElementById("typing-gross");
  const accuracyEl = document.getElementById("typing-accuracy");
  const charsEl = document.getElementById("typing-chars");
  const correctEl = document.getElementById("typing-correct");
  const missedEl = document.getElementById("typing-missed");

  if (!settingsForm || !startButton || !inputEl) return;

  let timerId = null;
  let targetText = "";
  let duration = 60;
  let startTime = 0;
  let running = false;
  let elapsedSeconds = 0;

  function pickPrompt(mode) {
    const choices = promptBank[mode] || promptBank.paragraph;
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    const mm = String(Math.floor(safe / 60)).padStart(2, "0");
    const ss = String(safe % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function countWords(value) {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function updateStats() {
    const typed = inputEl.value;
    const now = running ? Date.now() : startTime + elapsedSeconds * 1000;
    elapsedSeconds = running ? Math.min((now - startTime) / 1000, duration) : elapsedSeconds;
    const minutes = elapsedSeconds / 60 || 1 / 60;

    let correct = 0;
    const compareLength = Math.min(typed.length, targetText.length);
    for (let i = 0; i < compareLength; i += 1) {
      if (typed[i] === targetText[i]) correct += 1;
    }
    const mistakes = Math.max(typed.length - correct, 0);
    const grossWPM = minutes > 0 ? (typed.length / 5) / minutes : 0;
    const errorPenalty = minutes > 0 ? mistakes / 5 / minutes : 0;
    const netWPM = Math.max(grossWPM - errorPenalty, 0);
    const accuracy = typed.length > 0 ? (correct / typed.length) * 100 : 100;

    if (wpmEl) wpmEl.textContent = netWPM.toFixed(1);
    if (grossEl) grossEl.textContent = grossWPM.toFixed(1);
    if (accuracyEl) accuracyEl.textContent = `${accuracy.toFixed(1)}%`;
    if (charsEl) charsEl.textContent = typed.length.toString();
    if (correctEl) correctEl.textContent = correct.toString();
    if (missedEl) missedEl.textContent = mistakes.toString();
    if (errorsEl) errorsEl.textContent = mistakes.toString();
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function finishTest() {
    running = false;
    stopTimer();
    elapsedSeconds = duration;
    if (timerEl) timerEl.textContent = formatClock(0);
    inputEl.disabled = true;
    updateStats();
    if (statusEl) statusEl.textContent = "Time! Review your stats, then reset to try again.";
  }

  function tick() {
    if (!running) return;
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    elapsedSeconds = Math.min(elapsed, duration);
    const remaining = Math.max(duration - elapsed, 0);
    if (timerEl) timerEl.textContent = formatClock(remaining);
    updateStats();
    if (remaining <= 0) {
      finishTest();
    }
  }

  function startTest() {
    targetText = pickPrompt(modeSelect?.value || "paragraph");
    if (promptEl) promptEl.textContent = targetText;
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();
    duration = Number(durationSelect?.value || 60) || 60;
    elapsedSeconds = 0;
    startTime = Date.now();
    running = true;
    if (timerEl) timerEl.textContent = formatClock(duration);
    if (statusEl)
      statusEl.textContent = `Timer running for ${(duration / 60).toFixed(1)} minute${
        duration === 60 ? "" : "s"
      }. Stay relaxed and focus on accuracy.`;
    stopTimer();
    timerId = window.setInterval(tick, 200);
    updateStats();
  }

  function resetTest() {
    running = false;
    stopTimer();
    elapsedSeconds = 0;
    inputEl.value = "";
    inputEl.disabled = true;
    if (promptEl) promptEl.textContent = "Prompt text will appear here.";
    if (timerEl) timerEl.textContent = "00:00";
    if (statusEl) statusEl.textContent = "Press “Start test” to load a prompt and begin the timer.";
    if (wpmEl) wpmEl.textContent = "0";
    if (grossEl) grossEl.textContent = "0";
    if (accuracyEl) accuracyEl.textContent = "100%";
    if (charsEl) charsEl.textContent = "0";
    if (correctEl) correctEl.textContent = "0";
    if (missedEl) missedEl.textContent = "0";
    if (errorsEl) errorsEl.textContent = "0";
  }

  startButton.addEventListener("click", () => {
    startTest();
  });

  resetButton?.addEventListener("click", () => {
    resetTest();
  });

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  inputEl.addEventListener("input", () => {
    if (!running) {
      return;
    }
    updateStats();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      stopTimer();
    } else if (!document.hidden && running && !timerId) {
      startTime = Date.now() - elapsedSeconds * 1000;
      timerId = window.setInterval(tick, 200);
    }
  });

  resetTest();
})();
