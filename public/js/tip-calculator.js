(function () {
  const form = document.getElementById("tip-form");
  const resultEl = document.getElementById("tip-result");
  const tipSelect = document.getElementById("tip-percent");
  const customWrapper = document.getElementById("custom-tip-wrapper");
  const customInput = document.getElementById("custom-tip");

  if (!form || !resultEl || !tipSelect || !customWrapper) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function showCustomField() {
    const value = tipSelect.value;
    if (value === "custom") {
      customWrapper.style.display = "block";
      customInput?.focus();
    } else {
      customWrapper.style.display = "none";
    }
  }

  function renderResult({
    bill,
    tipRate,
    tipAmount,
    total,
    perPerson,
    tipPerPerson,
    people,
  }) {
    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">${currencyFormatter.format(bill)} bill · ${tipRate.toFixed(1)}% tip</h2>
        <div class="stat-grid">
          <div class="stat"><span class="label">Tip amount</span><span class="value">${currencyFormatter.format(tipAmount)}</span></div>
          <div class="stat"><span class="label">Total with tip</span><span class="value">${currencyFormatter.format(total)}</span></div>
          <div class="stat"><span class="label">Per person</span><span class="value">${currencyFormatter.format(perPerson)}</span></div>
          <div class="stat"><span class="label">Tip per person</span><span class="value">${currencyFormatter.format(tipPerPerson)}</span></div>
          <div class="stat"><span class="label">Split between</span><span class="value">${people} ${people === 1 ? "person" : "people"}</span></div>
        </div>
        <p class="helper" style="margin-top:12px;">Round up to avoid shorting the server. Adjust the custom tip for exceptional service.</p>
      </section>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const bill = parseFloat(form.bill.value || "0");
    const people = parseInt(form.people.value || "1", 10);

    if (!Number.isFinite(bill) || bill < 0) {
      resultEl.innerHTML = `<section class="card"><p>Enter a bill amount of zero or more.</p></section>`;
      return;
    }

    if (!Number.isFinite(people) || people <= 0) {
      resultEl.innerHTML = `<section class="card"><p>People splitting must be at least one.</p></section>`;
      return;
    }

    let tipRate = parseFloat(tipSelect.value);
    if (Number.isNaN(tipRate)) {
      const custom = parseFloat(customInput?.value || "0");
      if (!Number.isFinite(custom) || custom < 0) {
        resultEl.innerHTML = `<section class="card"><p>Enter a custom tip percentage of zero or more.</p></section>`;
        return;
      }
      tipRate = custom;
    }

    const tipAmount = bill * (tipRate / 100);
    const total = bill + tipAmount;
    const perPerson = total / people;
    const tipPerPerson = tipAmount / people;

    renderResult({
      bill,
      tipRate,
      tipAmount,
      total,
      perPerson,
      tipPerPerson,
      people,
    });
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
      tipSelect.value = "20";
      customWrapper.style.display = "none";
      if (customInput) {
        customInput.value = "";
      }
    }, 0);
  });

  tipSelect.addEventListener("change", showCustomField);
})();
