(function () {
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Parses YYYY-MM-DD or MM/DD/YYYY into a Date, or returns null if invalid
  function parseDate(input) {
    if (!input) return null;
    let d = null;

    // Try YYYY-MM-DD
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
    const m1 = input.match(iso);
    if (m1) {
      const y = parseInt(m1[1], 10);
      const mo = parseInt(m1[2], 10);
      const da = parseInt(m1[3], 10);
      d = new Date(y, mo - 1, da);
      if (d && d.getFullYear() === y && d.getMonth() === mo - 1 && d.getDate() === da) {
        return d;
      }
      d = null;
    }

    // Try MM/DD/YYYY
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m2 = input.match(us);
    if (m2) {
      const mo = parseInt(m2[1], 10);
      const da = parseInt(m2[2], 10);
      const y = parseInt(m2[3], 10);
      d = new Date(y, mo - 1, da);
      if (d && d.getFullYear() === y && d.getMonth() === mo - 1 && d.getDate() === da) {
        return d;
      }
      d = null;
    }

    return d;
  }

  function daysBetween(a, b) {
    const A = stripTime(a).getTime();
    const B = stripTime(b).getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.round((B - A) / MS_PER_DAY);
  }

  function plural(n) {
    return Math.abs(n) === 1 ? "" : "s";
  }

  const form = document.getElementById("dfd-form");
  const out = document.getElementById("result");
  const btn = document.getElementById("calc");
  if (!form || !out || !btn) return;

  btn.addEventListener("click", () => {
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
