import { parseDate, daysBetween, stripTime } from "/src/lib/date.js";

(function () {
  const form = document.getElementById("dfd-form");
  const out = document.getElementById("result");
  if (!form || !out) return;

  function plural(n) { return n === 1 || n === -1 ? "" : "s"; }

  form.addEventListener("submit", () => {
    const dateVal = document.getElementById("date").value.trim();
    const compVal = document.getElementById("compare").value.trim();

    const date = parseDate(dateVal);
    const compare = compVal ? parseDate(compVal) : stripTime(new Date());

    if (!date || !compare) {
      out.innerHTML = '<div class="card">Please enter valid date(s).</div>';
      return;
    }

    const diff = daysBetween(compare, date);
    let verb;
    if (diff === 0) {
      verb = "is today";
    } else if (diff > 0) {
      verb = "is in <strong>" + diff + "</strong> day" + plural(diff);
    } else {
      verb = "was <strong>" + Math.abs(diff) + "</strong> day" + plural(diff) + " ago";
    }

    const html =
      '<div class="card"><h3>Result</h3><p>Your date ' +
      verb +
      " (compared to " +
      compare.toDateString() +
      ").</p></div>";

    out.innerHTML = html;
  });
})();
