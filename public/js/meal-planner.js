(function () {
  if (typeof window === "undefined") return;

  const form = document.getElementById("meal-form");
  const statusEl = document.getElementById("meal-status");
  const resultEl = document.getElementById("meal-result");

  if (!form || !statusEl || !resultEl) return;

  const STYLE_MULTIPLIERS = {
    light: 0.85,
    standard: 1,
    hearty: 1.2,
  };

  const DEFAULT_CHILD_FACTOR = 0.6;

  const COURSES = {
    protein: {
      label: "Main protein",
      portionPerAdult: 6, // ounces cooked
      format(totalUnits, servings) {
        const pounds = totalUnits / 16;
        const kilograms = pounds * 0.45359237;
        return {
          primary: `${pounds.toFixed(1)} lb cooked (${kilograms.toFixed(2)} kg)`,
          secondary: `Plan for about ${Math.ceil(servings)} plated portions at 6 oz cooked each.`,
        };
      },
    },
    grains: {
      label: "Starch / grains",
      portionPerAdult: 4.5, // ounces cooked
      format(totalUnits, servings) {
        const cups = totalUnits / 5;
        const pounds = totalUnits / 16;
        return {
          primary: `${cups.toFixed(1)} cups cooked sides (~${pounds.toFixed(1)} lb)`,
          secondary: `Enough for roughly ${Math.ceil(servings)} people at a generous scoop.`,
        };
      },
    },
    vegetables: {
      label: "Cooked vegetables",
      portionPerAdult: 1.25, // cups cooked
      format(totalUnits, servings) {
        const pounds = totalUnits * 0.24; // approximate conversion from cups to pounds fresh
        return {
          primary: `${totalUnits.toFixed(1)} cups cooked veggies (~${pounds.toFixed(1)} lb fresh)`,
          secondary: `Consider prepping ${Math.ceil(servings)} ramekins or side portions.`,
        };
      },
    },
    salad: {
      label: "Salad",
      portionPerAdult: 1.5, // cups of greens
      format(totalUnits) {
        const bowls = totalUnits / 10; // 10 cups per large salad bowl
        const bags = totalUnits / 5; // 5 cups per bag of mixed greens
        return {
          primary: `${totalUnits.toFixed(1)} cups of greens`,
          secondary: `≈${Math.ceil(bowls)} large serving bowls or ${Math.ceil(bags)} bags of salad mix.`,
        };
      },
    },
    dessert: {
      label: "Dessert servings",
      portionPerAdult: 1,
      format(totalUnits) {
        const dozens = totalUnits / 12;
        return {
          primary: `${Math.ceil(totalUnits)} individual desserts`,
          secondary: `That's about ${Math.ceil(dozens)} dozen pieces for trays or platters.`,
        };
      },
    },
    drinks: {
      label: "Drinks",
      portionPerAdult: 16, // fluid ounces
      format(totalUnits) {
        const gallons = totalUnits / 128;
        const liters = totalUnits * 0.0295735;
        const servings = totalUnits / 12; // 12 oz cups
        return {
          primary: `${gallons.toFixed(1)} gallons (${liters.toFixed(1)} L) of beverages`,
          secondary: `Covers roughly ${Math.ceil(servings)} 12-oz pours (water, punch, or soft drinks).`,
        };
      },
    },
  };

  function formatNumber(value) {
    return Number.isFinite(value) ? value.toFixed(1).replace(/\.0$/, "") : "0";
  }

  function handleSubmit(event) {
    event.preventDefault();

    const adults = Number(form.adults.value) || 0;
    const kids = Number(form.kids.value) || 0;
    const style = form.style.value || "standard";
    const leftoversPercent = Number(form.leftovers.value) || 0;
    const selectedCourses = Array.from(form.querySelectorAll('input[name="course"]:checked')).map(
      (input) => input.value
    );

    if (adults <= 0 && kids <= 0) {
      statusEl.textContent = "Add at least one adult or child to calculate portions.";
      resultEl.innerHTML = "";
      return;
    }

    if (selectedCourses.length === 0) {
      statusEl.textContent = "Select at least one course to include in the plan.";
      resultEl.innerHTML = "";
      return;
    }

    const childEquivalent = kids * DEFAULT_CHILD_FACTOR;
    const baseEquivalent = adults + childEquivalent;
    const styleMultiplier = STYLE_MULTIPLIERS[style] || 1;
    const leftoverMultiplier = 1 + Math.max(leftoversPercent, 0) / 100;
    const adjustedServings = baseEquivalent * styleMultiplier * leftoverMultiplier;

    const rows = selectedCourses.map((courseId) => {
      const course = COURSES[courseId];
      if (!course) return null;
      const totalUnits = adjustedServings * course.portionPerAdult;
      const summary = course.format(totalUnits, adjustedServings);
      return `
        <tr>
          <td>${course.label}</td>
          <td><strong>${summary.primary}</strong><br><span class="helper">${summary.secondary}</span></td>
        </tr>
      `;
    });

    const includedLabels = selectedCourses
      .map((id) => COURSES[id]?.label || id)
      .filter(Boolean)
      .join(", ");

    statusEl.textContent = `Plan for ${Math.ceil(adjustedServings)} adult-equivalent servings across ${selectedCourses.length} course${
      selectedCourses.length === 1 ? "" : "s"
    }.`;

    resultEl.innerHTML = `
      <div class="card" style="margin-top:0;">
        <h2 style="margin-top:0;">Portion overview</h2>
        <ul class="result-list">
          <li><strong>Adults:</strong> ${adults.toLocaleString()}</li>
          <li><strong>Children:</strong> ${kids.toLocaleString()} (≈${formatNumber(childEquivalent)} adult servings)</li>
          <li><strong>Meal style multiplier:</strong> ${styleMultiplier.toFixed(2)} (${style})</li>
          <li><strong>Leftover buffer:</strong> ${formatNumber(leftoverMultiplier * 100 - 100)}%</li>
          <li><strong>Total adult-equivalent servings:</strong> ${formatNumber(adjustedServings)}</li>
          <li><strong>Courses included:</strong> ${includedLabels}</li>
        </ul>
        <table class="table" style="width:100%; margin-top:16px;">
          <tbody>
            ${rows.filter(Boolean).join("")}
          </tbody>
        </table>
        <p class="helper">
          Adjust the leftover buffer down for plated meals or up for buffet-style service. For specialty diets, create a second
          run with only the dishes that apply.
        </p>
      </div>
    `;
  }

  function handleReset() {
    statusEl.textContent = "Enter your headcount to size the meal.";
    resultEl.innerHTML = "";
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => {
    window.requestAnimationFrame(handleReset);
  });
})();
