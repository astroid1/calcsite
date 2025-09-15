(function () {
  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }

  function nextBirthday(from, month, day) {
    const y = from.getFullYear();
    let target = new Date(y, month - 1, day);

    // Handle Feb 29 birthdays: use Feb 29 on leap years, Feb 28 otherwise
    if (month === 2 && day === 29 && !isLeapYear(y)) {
      target = new Date(y, 1, 28);
    }
    if (stripTime(target) < stripTime(from)) {
      const ny = y + 1;
      target = new Date(ny, month - 1, day);
      if (month === 2 && day === 29 && !isLeapYear(ny)) target = new Date(ny, 1, 28);
    }
    return stripTime(target);
  }

  const btn = document.getElementById("bday-calc");
  const out = document.getElementById("bday-result");
  const monthEl = document.getElementById("month");
  const dayEl = document.getElementById("day");
  if (!btn || !out || !monthEl || !dayEl) return;

  btn.addEventListener("click", () => {
    const m = parseInt(monthEl.value, 10);
    const d = parseInt(dayEl.value, 10);
    if (!m || !d || d < 1 || d > 31) {
      out.innerHTML = '<div class="card">Enter a valid month and day.</div>';
      return;
    }
    const today = stripTime(new Date());
    const nb = nextBirthday(today, m, d);
    const MS = 24 * 60 * 60 * 1000;
    const diff = Math.round((nb.getTime() - today.getTime()) / MS);

    out.innerHTML =
      '<div class="card"><h3>Result</h3><p>Your next birthday is <strong>' +
      nb.toDateString() +
      "</strong> — in <strong>" +
      diff +
      "</strong> day" +
      (diff === 1 ? "" : "s") +
      ".</p></div>";
  });
})();
