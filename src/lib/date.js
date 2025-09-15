import { differenceInCalendarDays, isValid, parse, isLeapYear } from "date-fns";

export function parseDate(input) {
  let d = parse(input, "yyyy-MM-dd", new Date());
  if (!isValid(d)) d = parse(input, "MM/dd/yyyy", new Date());
  return isValid(d) ? d : null;
}

export function daysBetween(a, b) {
  return differenceInCalendarDays(b, a);
}

export function nextBirthday(from, month, day) {
  const year = from.getFullYear();
  let next = new Date(year, month - 1, day);
  if (month === 2 && day === 29) {
    if (!isLeapYear(year)) next = new Date(year, 1, 28);
  }
  if (next < stripTime(from)) next = new Date(year + 1, month - 1, day);
  return next;
}

export function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const US_HOLIDAYS = [
  { key: "new-year", name: "New Year's Day", date: (y) => new Date(y, 0, 1) },
  { key: "mlk-day", name: "MLK Day", date: (y) => nthWeekdayOfMonth(y, 0, 1, 3) },
  { key: "memorial-day", name: "Memorial Day", date: (y) => lastWeekdayOfMonth(y, 0, 4) },
  { key: "independence-day", name: "Independence Day", date: (y) => new Date(y, 6, 4) },
  { key: "labor-day", name: "Labor Day", date: (y) => nthWeekdayOfMonth(y, 0, 8, 1) },
  { key: "thanksgiving", name: "Thanksgiving", date: (y) => nthWeekdayOfMonth(y, 4, 10, 4) },
  { key: "christmas", name: "Christmas Day", date: (y) => new Date(y, 11, 25) },
];

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
