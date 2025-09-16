(function () {
  if (typeof window === "undefined") return;

  const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;
  const DEFAULT_BIRTH_MESSAGE =
    "Select the birth month to auto-fill human years using today's date.";

  const form = document.getElementById("pet-age-form");
  const resultEl = document.getElementById("pet-age-result");
  const referenceEl = document.getElementById("pet-reference");
  const birthFeedbackEl = document.getElementById("pet-birth-feedback");

  if (!form || !resultEl || !referenceEl) return;

  const humanYearsInput = document.getElementById("pet-human-years");
  const birthMonthInput = document.getElementById("pet-birth-month");

  if (!humanYearsInput) return;

  const speciesModels = {
    dog: {
      label: "Dog",
      humanToPet(age) {
        if (age <= 0) return 0;
        if (age <= 1) return age * 15;
        if (age <= 2) return 15 + (age - 1) * 9;
        return 24 + (age - 2) * 5;
      },
    },
    cat: {
      label: "Cat",
      humanToPet(age) {
        if (age <= 0) return 0;
        if (age <= 1) return age * 15;
        if (age <= 2) return 15 + (age - 1) * 9;
        return 24 + (age - 2) * 4;
      },
    },
  };

  if (birthMonthInput) {
    const now = new Date();
    const maxMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    birthMonthInput.max = maxMonth;
  }

  let birthInfoState = null;

  function formatYears(value) {
    return Number(value).toFixed(1).replace(/\.0$/, "");
  }

  function describeElapsedMonths(totalMonths) {
    if (!Number.isFinite(totalMonths) || totalMonths <= 0) return "less than a month";
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
    if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
    return parts.join(" ");
  }

  function setBirthFeedback(message) {
    if (birthFeedbackEl) birthFeedbackEl.textContent = message;
  }

  setBirthFeedback(DEFAULT_BIRTH_MESSAGE);

  function computeBirthInfo(value) {
    if (!value || typeof value !== "string") return null;
    const [yearStr, monthStr] = value.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;

    const birthDate = new Date(year, month - 1, 1);
    const now = new Date();
    if (birthDate > now) return null;

    const diffMs = now.getTime() - birthDate.getTime();
    const years = diffMs / MS_PER_YEAR;

    const totalMonths =
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    const label = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(birthDate);

    return {
      iso: value,
      birthDate,
      label,
      years,
      totalMonths: Math.max(0, totalMonths),
      enteredHumanYears: Number(humanYearsInput.value),
      inSync: false,
    };
  }

  function refreshBirthFeedback(info, manual = false) {
    if (!birthFeedbackEl) return;
    if (!info) {
      setBirthFeedback(DEFAULT_BIRTH_MESSAGE);
      return;
    }
    if (manual && !info.inSync) {
      setBirthFeedback("Human years adjusted manually. We'll use your entry for the conversion.");
      return;
    }
    const summary = describeElapsedMonths(info.totalMonths);
    setBirthFeedback(
      `Birth month selected: ${info.label}. That equals about ${formatYears(info.years)} human years${
        summary ? ` (${summary})` : ""
      }.`
    );
  }

  birthMonthInput?.addEventListener("change", () => {
    if (!birthMonthInput.value) {
      birthInfoState = null;
      setBirthFeedback(DEFAULT_BIRTH_MESSAGE);
      return;
    }
    const info = computeBirthInfo(birthMonthInput.value);
    if (!info) {
      birthInfoState = null;
      setBirthFeedback("Choose a birth month that is not in the future.");
      humanYearsInput.value = "";
      return;
    }
    const formattedYears = formatYears(info.years);
    humanYearsInput.value = formattedYears;
    info.enteredHumanYears = Number(humanYearsInput.value);
    info.inSync = true;
    birthInfoState = info;
    refreshBirthFeedback(birthInfoState);
  });

  humanYearsInput.addEventListener("input", () => {
    if (!birthInfoState) {
      if (!birthMonthInput?.value) setBirthFeedback(DEFAULT_BIRTH_MESSAGE);
      return;
    }
    const entered = Number(humanYearsInput.value);
    if (!Number.isFinite(entered)) {
      birthInfoState.enteredHumanYears = Number.NaN;
      birthInfoState.inSync = false;
      refreshBirthFeedback(birthInfoState, true);
      return;
    }
    const wasSynced = birthInfoState.inSync;
    birthInfoState.enteredHumanYears = entered;
    birthInfoState.inSync = Math.abs(entered - birthInfoState.years) <= 0.05;
    if (birthInfoState.inSync) {
      refreshBirthFeedback(birthInfoState);
    } else if (wasSynced) {
      refreshBirthFeedback(birthInfoState, true);
    }
  });

  function getPetLifeStage(species, petYears) {
    if (petYears < 1) return species === "cat" ? "Kitten" : "Puppy";
    if (petYears < 3) return "Young adult";
    if (petYears < 7) return "Prime adult";
    if (petYears < 11) return "Mature adult";
    return "Senior";
  }

  function renderResult({ species, humanYears, petYears, birthInfo }) {
    const model = speciesModels[species];
    const items = [
      `<li><strong>Species:</strong> ${model.label}</li>`,
      `<li><strong>Human years lived:</strong> ${formatYears(humanYears)}</li>`,
      `<li><strong>Equivalent ${model.label.toLowerCase()} years:</strong> ${formatYears(petYears)}</li>`,
      `<li><strong>Life stage estimate:</strong> ${getPetLifeStage(species, petYears)}</li>`,
    ];
    if (birthInfo) {
      const elapsed = describeElapsedMonths(birthInfo.totalMonths);
      const syncNote = birthInfo.inSync ? "" : " (adjusted after auto-fill)";
      items.push(
        `<li><strong>Birth month:</strong> ${birthInfo.label}${
          elapsed ? ` • ${elapsed} ago` : ""
        }${syncNote}</li>`
      );
    }
    return `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Conversion result</h2>
        <ul class="result-list">
          ${items.join("")}
        </ul>
        <p class="helper">Always factor in breed size, health, and vet guidance for more precise care recommendations.</p>
      </div>
    `;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const species = form.species.value;
    const model = speciesModels[species];
    const humanYears = Number(humanYearsInput.value);
    if (!model || !Number.isFinite(humanYears) || humanYears < 0) {
      resultEl.innerHTML =
        '<p class="helper">Enter a non-negative number of human years to see the conversion.</p>';
      return;
    }

    const petYears = model.humanToPet(humanYears);

    let birthInfo = null;
    if (birthMonthInput?.value) {
      if (birthInfoState && birthInfoState.iso === birthMonthInput.value) {
        birthInfo = birthInfoState;
      } else {
        const computed = computeBirthInfo(birthMonthInput.value);
        if (computed) {
          computed.enteredHumanYears = humanYears;
          computed.inSync = Math.abs(humanYears - computed.years) <= 0.05;
          birthInfo = computed;
        }
      }
    }

    resultEl.innerHTML = renderResult({
      species,
      humanYears,
      petYears,
      birthInfo,
    });
  }

  function buildReference() {
    const humanMilestones = [0.5, 1, 2, 3, 5, 8, 12, 16];
    const cards = Object.values(speciesModels)
      .map((model) => {
        const rows = humanMilestones
          .map((age) => {
            const petYears = model.humanToPet(age);
            return `<li>${formatYears(age)} human years → ${formatYears(
              petYears
            )} ${model.label.toLowerCase()} years</li>`;
          })
          .join("");
        return `
          <div class="card" style="margin-top:0;">
            <h3 style="margin-top:0;">${model.label} reference</h3>
            <p class="helper">Approximate conversions from human years to ${model.label.toLowerCase()} years.</p>
            <ul class="result-list">${rows}</ul>
          </div>
        `;
      })
      .join("");
    referenceEl.innerHTML = cards;
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    birthInfoState = null;
    window.requestAnimationFrame(() => {
      resultEl.innerHTML = "";
      if (birthMonthInput) birthMonthInput.value = "";
      setBirthFeedback(DEFAULT_BIRTH_MESSAGE);
    });
  });

  buildReference();
})();
