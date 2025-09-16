(function () {
  if (typeof window === "undefined") return;

  const form = document.getElementById("pet-age-form");
  const resultEl = document.getElementById("pet-age-result");
  const referenceEl = document.getElementById("pet-reference");

  if (!form || !resultEl || !referenceEl) return;

  const speciesModels = {
    dog: {
      label: "Dog",
      petToHuman(age) {
        if (age <= 0) return 0;
        let years = 0;
        if (age >= 1) {
          years += 15;
          age -= 1;
        } else {
          return age * 15;
        }
        if (age >= 1) {
          years += 9;
          age -= 1;
        } else {
          return years + age * 9;
        }
        return years + age * 5;
      },
      humanToPet(age) {
        if (age <= 0) return 0;
        if (age <= 15) return age / 15;
        if (age <= 24) return 1 + (age - 15) / 9;
        return 2 + (age - 24) / 5;
      },
    },
    cat: {
      label: "Cat",
      petToHuman(age) {
        if (age <= 0) return 0;
        let years = 0;
        if (age >= 1) {
          years += 15;
          age -= 1;
        } else {
          return age * 15;
        }
        if (age >= 1) {
          years += 9;
          age -= 1;
        } else {
          return years + age * 9;
        }
        return years + age * 4;
      },
      humanToPet(age) {
        if (age <= 0) return 0;
        if (age <= 15) return age / 15;
        if (age <= 24) return 1 + (age - 15) / 9;
        return 2 + (age - 24) / 4;
      },
    },
  };

  function getLifeStage(humanAge) {
    if (humanAge < 12) return "Puppy/kitten";
    if (humanAge < 20) return "Young adolescent";
    if (humanAge < 35) return "Young adult";
    if (humanAge < 55) return "Adult";
    if (humanAge < 70) return "Mature";
    return "Senior";
  }

  function formatYears(value) {
    return value.toFixed(1).replace(/\.0$/, "");
  }

  function renderResult({ species, direction, inputAge, converted }) {
    const humanYears = direction === "pet-to-human" ? converted : inputAge;
    const stage = getLifeStage(humanYears);
    const targetLabel = direction === "pet-to-human" ? "Human years" : `${speciesModels[species].label} years`;
    const inputLabel = direction === "pet-to-human" ? `${speciesModels[species].label} years` : "Human years";
    return `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Conversion result</h2>
        <ul class="result-list">
          <li><strong>${inputLabel}:</strong> ${formatYears(inputAge)}</li>
          <li><strong>${targetLabel}:</strong> ${formatYears(converted)}</li>
          <li><strong>Life stage estimate:</strong> ${stage}</li>
        </ul>
        <p class="helper">Always factor in breed size, health, and vet guidance for more precise care recommendations.</p>
      </div>
    `;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const species = form.species.value;
    const direction = form.direction.value;
    const age = Number(form.age.value);
    if (!speciesModels[species] || !Number.isFinite(age) || age < 0) {
      resultEl.innerHTML = "<p class=\"helper\">Enter a non-negative age to see the conversion.</p>";
      return;
    }

    let converted;
    if (direction === "pet-to-human") {
      converted = speciesModels[species].petToHuman(age);
    } else {
      converted = speciesModels[species].humanToPet(age);
    }

    resultEl.innerHTML = renderResult({ species, direction, inputAge: age, converted });
  }

  function buildReference() {
    const sampleAges = [1, 2, 3, 5, 7, 10, 12, 15];
    const humanMilestones = [5, 10, 18, 30, 45, 60, 75];
    const pieces = [];

    Object.entries(speciesModels).forEach(([key, model]) => {
      const petToHumanRows = sampleAges
        .map((age) => `<li>${age} ${age === 1 ? "year" : "years"} → ${formatYears(model.petToHuman(age))} human years`)
        .join("</li><li>");
      const humanToPetRows = humanMilestones
        .map(
          (age) =>
            `${age} human years → ${formatYears(model.humanToPet(age))} ${model.label.toLowerCase()} years`
        )
        .join("</li><li>");
      pieces.push(`
        <div class="card" style="margin-top:0;">
          <h3 style="margin-top:0;">${model.label} reference</h3>
          <p class="helper">Approximate conversions using a medium-size ${model.label.toLowerCase()} growth curve.</p>
          <p class="helper"><strong>Pet → Human</strong></p>
          <ul class="result-list"><li>${petToHumanRows}</li></ul>
          <p class="helper"><strong>Human → ${model.label}</strong></p>
          <ul class="result-list"><li>${humanToPetRows}</li></ul>
        </div>
      `);
    });

    referenceEl.innerHTML = pieces.join("");
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      resultEl.innerHTML = "";
    });
  });

  buildReference();
})();
