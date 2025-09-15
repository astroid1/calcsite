(function () {
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function nthWeekdayOfMonth(year, weekday, month, n) {
    const first = new Date(year, month, 1);
    const delta = (7 + weekday - first.getDay()) % 7;
    return new Date(year, month, 1 + delta + 7 * (n - 1));
  }
  function lastWeekdayOfMonth(year, weekday, month) {
    const last = new Date(year, month + 1, 0);
    const delta = (7 + last.getDay() - weekday) % 7;
    return new Date(year, month, last.getDate() - delta);
  }
  const HOLIDAYS = [
    { key: "new-year", name: "New Year's Day", date: (y) => new Date(y, 0, 1) },
    {
      key: "mlk-day",
      name: "MLK Day",
      date: (y) => nthWeekdayOfMonth(y, 1, 0, 3),
    }, // Monday in Jan (weekday=1)
    {
      key: "memorial-day",
      name: "Memorial Day",
      date: (y) => lastWeekdayOfMonth(y, 1, 4),
    }, // Monday in May
    {
      key: "independence-day",
      name: "Independence Day",
      date: (y) => new Date(y, 6, 4),
    },
    {
      key: "labor-day",
      name: "Labor Day",
      date: (y) => nthWeekdayOfMonth(y, 1, 8, 1),
    }, // first Monday in Sep
    {
      key: "thanksgiving",
      name: "Thanksgiving",
      date: (y) => nthWeekdayOfMonth(y, 4, 10, 4),
    }, // fourth Thursday in Nov
    {
      key: "christmas",
      name: "Christmas Day",
      date: (y) => new Date(y, 11, 25),
    },
  ];
  function card(html) {
    return (
      '<section class="card" style="margin-top:16px;">' + html + "</section>"
    );
  }

  const select = document.getElementById("holiday");
  const btn = document.getElementById("holiday-calc");
  const out = document.getElementById("holiday-result");
  if (!select || !btn || !out) return;

  // Populate dropdown
  HOLIDAYS.forEach((h) => {
    const opt = document.createElement("option");
    opt.value = h.key;
    opt.textContent = h.name;
    select.appendChild(opt);
  });

  btn.addEventListener("click", () => {
    const key = select.value;
    const h = HOLIDAYS.find((x) => x.key === key);
    if (!h) {
      out.innerHTML = card("<p>Invalid holiday.</p>");
      return;
    }

    const today = stripTime(new Date());
    let target = stripTime(h.date(today.getFullYear()));
    if (target < today) target = stripTime(h.date(today.getFullYear() + 1));

    const diff = Math.round((target - today) / 86400000);
    out.innerHTML = card(
      "<h3>" +
        h.name +
        "</h3><p>" +
        target.toDateString() +
        " — <strong>" +
        diff +
        "</strong> day" +
        (diff === 1 ? "" : "s") +
        " remaining.</p>",
    );
  });
})();
