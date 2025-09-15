(function () {
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }
  function nextBirthday(from, month, day) {
    const y = from.getFullYear();
    let target = new Date(y, month - 1, day);
    if (month === 2 && day === 29 && !isLeapYear(y))
      target = new Date(y, 1, 28);
    if (stripTime(target) < stripTime(from)) {
      const ny = y + 1;
      target = new Date(ny, month - 1, day);
      if (month === 2 && day === 29 && !isLeapYear(ny))
        target = new Date(ny, 1, 28);
    }
    return stripTime(target);
  }
  function card(html) {
    return (
      '<section class="card" style="margin-top:16px;">' + html + "</section>"
    );
  }

  const mEl = document.getElementById("month");
  const dEl = document.getElementById("day");
  const btn = document.getElementById("bday-calc");
  const clear = document.getElementById("bday-clear");
  const out = document.getElementById("bday-result");
  if (!mEl || !dEl || !btn || !out) return;

  btn.addEventListener("click", () => {
    const m = parseInt(mEl.value, 10);
    const d = parseInt(dEl.value, 10);
    if (!m || !d || d < 1 || d > 31) {
      out.innerHTML = card("<p>Enter a valid month and day.</p>");
      return;
    }
    const today = stripTime(new Date());
    const nb = nextBirthday(today, m, d);
    const diff = Math.round((nb - today) / 86400000);
    out.innerHTML = card(
      "<h3>Result</h3><p>Your next birthday is <strong>" +
        nb.toDateString() +
        "</strong> — in <strong>" +
        diff +
        "</strong> day" +
        (diff === 1 ? "" : "s") +
        ".</p>",
    );
  });

  clear &&
    clear.addEventListener("click", () => {
      dEl.value = "";
      out.innerHTML = "";
      dEl.focus();
    });
})();
