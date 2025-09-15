(function () {
  const form = document.getElementById("compound-form");
  const resultEl = document.getElementById("compound-result");

  if (!form || !resultEl) return;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  });

  function parseNumber(value) {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);

    const principal = parseNumber(data.get("principal"));
    const contribution = parseNumber(data.get("contribution"));
    const annualRate = parseNumber(data.get("rate"));
    const years = parseInt(data.get("years"), 10);
    const frequency = String(data.get("frequency"));
    const raisePercent = parseNumber(data.get("raise"));

    if (
      principal < 0 ||
      !years ||
      years <= 0 ||
      annualRate < 0 ||
      contribution < 0 ||
      raisePercent < 0
    ) {
      resultEl.innerHTML = `<section class="card"><p>Double-check your inputs. We need non-negative values and at least one year of growth.</p></section>`;
      return;
    }

    const periodsPerYear =
      {
        annually: 1,
        quarterly: 4,
        monthly: 12,
        daily: 365,
      }[frequency] || 12;

    const effectiveAnnualRate = annualRate / 100;
    const monthlyRate =
      periodsPerYear > 0
        ? Math.pow(
            1 + effectiveAnnualRate / periodsPerYear,
            periodsPerYear / 12,
          ) - 1
        : 0;
    const months = years * 12;
    const raiseRate = raisePercent > 0 ? raisePercent / 100 : 0;

    let balance = principal;
    let currentContribution = contribution;
    let lastContribution = contribution;
    let totalContributions = principal;
    const schedule = [];

    for (let month = 1; month <= months; month += 1) {
      const growth = balance * monthlyRate;
      balance += growth;

      balance += currentContribution;
      totalContributions += currentContribution;
      lastContribution = currentContribution;

      const yearIndex = Math.ceil(month / 12) - 1;
      if (!schedule[yearIndex]) {
        schedule[yearIndex] = {
          year: yearIndex + 1,
          contributions: 0,
          growth: 0,
          balance: 0,
        };
      }

      schedule[yearIndex].contributions += currentContribution;
      schedule[yearIndex].growth += growth;
      schedule[yearIndex].balance = balance;

      if (raiseRate > 0 && month % 12 === 0) {
        currentContribution *= 1 + raiseRate;
      }
    }

    const totalGrowth = balance - totalContributions;
    const avgAnnualReturn =
      years > 0 && totalContributions > 0
        ? Math.pow(balance / totalContributions, 1 / years) - 1
        : effectiveAnnualRate;

    const rows = schedule
      .map((entry) => {
        return `<tr><td>Year ${entry.year}</td><td>${currencyFormatter.format(entry.contributions)}</td><td>${currencyFormatter.format(entry.growth)}</td><td>${currencyFormatter.format(entry.balance)}</td></tr>`;
      })
      .join("");

    resultEl.innerHTML = `
      <section class="card">
        <h2 style="margin-top:0;">Projected balance after ${years} year${years === 1 ? "" : "s"}</h2>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Future value</span>
            <span class="value">${currencyFormatter.format(balance)}</span>
          </div>
          <div class="stat">
            <span class="label">Total contributed</span>
            <span class="value">${currencyFormatter.format(totalContributions)}</span>
          </div>
          <div class="stat">
            <span class="label">Growth earned</span>
            <span class="value">${currencyFormatter.format(totalGrowth)}</span>
          </div>
          <div class="stat">
            <span class="label">Last monthly deposit</span>
            <span class="value">${currencyFormatter.format(lastContribution)}</span>
          </div>
          <div class="stat">
            <span class="label">Avg. annualized return</span>
            <span class="value">${percentFormatter.format(avgAnnualReturn)}</span>
          </div>
        </div>
        <p class="helper" style="margin-top:12px;">Returns assume smooth growth—real markets bounce around. Adjust contributions yearly to reflect expected raises.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Contributions</th>
                <th>Growth</th>
                <th>Ending balance</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      resultEl.innerHTML = "";
    }, 0);
  });
})();
