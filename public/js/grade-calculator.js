(function () {
  if (typeof window === "undefined") return;

  const gpaForm = document.getElementById("gpa-form");
  const gpaStatus = document.getElementById("gpa-status");
  const gpaResult = document.getElementById("gpa-result");
  const finalForm = document.getElementById("final-form");
  const finalStatus = document.getElementById("final-status");
  const finalResult = document.getElementById("final-result");

  if (!gpaForm || !finalForm) return;

  const letterScale = [
    { min: 3.85, label: "A" },
    { min: 3.7, label: "A-" },
    { min: 3.3, label: "B+" },
    { min: 3.0, label: "B" },
    { min: 2.7, label: "B-" },
    { min: 2.3, label: "C+" },
    { min: 2.0, label: "C" },
    { min: 1.7, label: "C-" },
    { min: 1.3, label: "D+" },
    { min: 1.0, label: "D" },
    { min: 0, label: "F" },
  ];

  function getLetterFromGpa(value) {
    const rounded = Math.max(0, Math.min(4, value));
    const match = letterScale.find((item) => rounded >= item.min);
    return match ? match.label : "F";
  }

  function formatNumber(value, decimals = 2) {
    return Number.isFinite(value) ? value.toFixed(decimals) : "—";
  }

  function handleGpaSubmit(event) {
    event.preventDefault();
    if (!gpaStatus || !gpaResult) return;

    const current = Number(gpaForm.current.value);
    const completed = Number(gpaForm.completed.value);
    const target = Number(gpaForm.target.value);
    const upcoming = Number(gpaForm.upcoming.value);

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(completed) ||
      !Number.isFinite(target) ||
      !Number.isFinite(upcoming) ||
      completed < 0 ||
      upcoming <= 0
    ) {
      gpaStatus.textContent = "Enter valid GPA values and credit hours.";
      gpaResult.innerHTML = "";
      return;
    }

    const cappedCurrent = Math.min(Math.max(current, 0), 4);
    const cappedTarget = Math.min(Math.max(target, 0), 4);
    const totalCredits = completed + upcoming;
    const currentQuality = cappedCurrent * completed;
    const targetQuality = cappedTarget * totalCredits;
    const qualityNeeded = targetQuality - currentQuality;

    if (qualityNeeded <= 0) {
      gpaStatus.textContent = "You're already at or above the target GPA.";
      gpaResult.innerHTML = `
        <div class="card" style="margin-top:0;">
          <h2 style="margin-top:0;">Great news</h2>
          <p>Your existing GPA keeps you on track for a ${formatNumber(cappedTarget, 2)} goal.</p>
        </div>
      `;
      return;
    }

    const requiredTermGpa = qualityNeeded / upcoming;
    const achievable = requiredTermGpa <= 4.0;
    const letter = getLetterFromGpa(requiredTermGpa);

    gpaStatus.textContent = achievable
      ? `You need an average GPA of ${formatNumber(requiredTermGpa, 2)} across the remaining ${upcoming.toLocaleString()} credits.`
      : "The target GPA is out of reach with the credits remaining.";

    const margin = achievable ? 4.0 - requiredTermGpa : 0;
    const nextTarget = Math.min(requiredTermGpa + 0.25, 4.0);

    gpaResult.innerHTML = `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Required upcoming GPA</h2>
        <ul class="result-list">
          <li><strong>Needed GPA in remaining credits:</strong> ${formatNumber(requiredTermGpa, 2)} (${letter})</li>
          <li><strong>Total quality points to earn:</strong> ${formatNumber(qualityNeeded, 2)}</li>
          <li><strong>Credits remaining:</strong> ${upcoming.toLocaleString()}</li>
          <li><strong>Credits completed:</strong> ${completed.toLocaleString()}</li>
        </ul>
        <p class="helper">
          ${achievable
            ? `You have a cushion of ${formatNumber(margin, 2)} GPA point${margin === 1 ? "" : "s"} before hitting a 4.0.`
            : "Consider adding more credit hours or adjusting your target GPA."}
        </p>
        <p class="helper">Aim for ${formatNumber(nextTarget, 2)} or better each term to stay ahead of schedule.</p>
      </div>
    `;
  }

  function handleGpaReset() {
    if (gpaStatus) gpaStatus.textContent = "Fill in your current stats to begin.";
    if (gpaResult) gpaResult.innerHTML = "";
  }

  function handleFinalSubmit(event) {
    event.preventDefault();
    if (!finalStatus || !finalResult) return;

    const current = Number(finalForm.current.value);
    const weightPercent = Number(finalForm.weight.value);
    const target = Number(finalForm.target.value);
    const floor = finalForm.floor.value ? Number(finalForm.floor.value) : null;

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(weightPercent) ||
      !Number.isFinite(target) ||
      weightPercent <= 0 ||
      weightPercent > 100
    ) {
      finalStatus.textContent = "Enter valid grade percentages and exam weight.";
      finalResult.innerHTML = "";
      return;
    }

    const weight = weightPercent / 100;
    const remainingWeight = 1 - weight;
    const requiredExam = (target - current * remainingWeight) / weight;
    const cappedRequired = Math.max(Math.min(requiredExam, 150), -50);

    let outcome;
    if (requiredExam > 100) {
      outcome = `Even a 100% on the final would finish at ${formatNumber(
        current * remainingWeight + 100 * weight,
        1
      )}%. Consider adjusting your target or grading weights.`;
    } else if (requiredExam < 0) {
      outcome = "You could skip the final and still meet your target—though we don't recommend it!";
    } else {
      outcome = `You need about ${formatNumber(cappedRequired, 1)}% on the final exam to earn ${formatNumber(
        target,
        1
      )}%.`;
    }

    const floorNote =
      floor !== null && Number.isFinite(floor)
        ? requiredExam >= floor
          ? `Aiming for ${formatNumber(floor, 1)}% keeps you above your personal minimum.`
          : `Your minimum of ${formatNumber(floor, 1)}% would land at ${formatNumber(
              current * remainingWeight + floor * weight,
              1
            )}%.`
        : "";

    const finalGradeIfAverage = current * remainingWeight + Math.max(Math.min(requiredExam, 100), 0) * weight;

    finalStatus.textContent = outcome;
    finalResult.innerHTML = `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Final exam breakdown</h2>
        <ul class="result-list">
          <li><strong>Current average (weighted so far):</strong> ${formatNumber(current, 1)}%</li>
          <li><strong>Final exam weight:</strong> ${formatNumber(weightPercent, 1)}%</li>
          <li><strong>Required exam score:</strong> ${formatNumber(Math.max(requiredExam, 0), 1)}%</li>
          <li><strong>Projected overall grade (if exam hits the target):</strong> ${formatNumber(
            finalGradeIfAverage,
            1
          )}%</li>
        </ul>
        ${floorNote ? `<p class="helper">${floorNote}</p>` : ""}
        <p class="helper">Double-check with your syllabus—different schools round grades differently.</p>
      </div>
    `;
  }

  function handleFinalReset() {
    if (finalStatus) finalStatus.textContent = "Enter course details to see the required score.";
    if (finalResult) finalResult.innerHTML = "";
  }

  gpaForm.addEventListener("submit", handleGpaSubmit);
  gpaForm.addEventListener("reset", () => {
    window.requestAnimationFrame(handleGpaReset);
  });
  finalForm.addEventListener("submit", handleFinalSubmit);
  finalForm.addEventListener("reset", () => {
    window.requestAnimationFrame(handleFinalReset);
  });
})();
