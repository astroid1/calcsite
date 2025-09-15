```ts
import { differenceInCalendarDays, isValid, parse, isLeapYear } from 'date-fns';


export function parseDate(input: string) {
// Accept YYYY-MM-DD or MM/DD/YYYY
let d = parse(input, 'yyyy-MM-dd', new Date());
if (!isValid(d)) d = parse(input, 'MM/dd/yyyy', new Date());
return isValid(d) ? d : null;
}


export function daysBetween(a: Date, b: Date) {
return differenceInCalendarDays(b, a);
}


export function nextBirthday(from: Date, month: number, day: number) {
const year = from.getFullYear();
let next = new Date(year, month - 1, day);
if (month === 2 && day === 29) {
// handle Feb 29 birthdays: use Feb 29 in leap years, else Feb 28 (convention)
if (!isLeapYear(year)) next = new Date(year, 1, 28);
}
if (next < stripTime(from)) next = new Date(year + 1, month - 1, day);
return next;
}


export function stripTime(d: Date) {
return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


export type Holiday = { key: string; name: string; date: (year: number) => Date };


// US federal-ish selection; expand as needed
export const US_HOLIDAYS: Holiday[] = [
{ key: 'new-year', name: "New Year's Day", date: (y) => new Date(y, 0, 1) },
// Martin Luther King Jr. Day — third Monday in Jan
{ key: 'mlk-day', name: 'MLK Day', date: (y) => nthWeekdayOfMonth(y, 0, 1, 3) },
// Memorial Day — last Monday in May
{ key: 'memorial-day', name: 'Memorial Day', date: (y) => lastWeekdayOfMonth(y, 0, 4) },
{ key: 'independence-day', name: 'Independence Day', date: (y) => new Date(y, 6, 4) },
// Labor Day — first Monday in Sep
{ key: 'labor-day', name: 'Labor Day', date: (y) => nthWeekdayOfMonth(y, 0, 8, 1) },
// Thanksgiving — fourth Thursday in Nov
{ key: 'thanksgiving', name: 'Thanksgiving', date: (y) => nthWeekdayOfMonth(y, 4, 10, 4) },
{ key: 'christmas', name: 'Christmas Day', date: (y) => new Date(y, 11, 25) }
];


function nthWeekdayOfMonth(year: number, weekday: number, month: number, n: number) {
// weekday: 0=Sun..6=Sat, month: 0=Jan..11=Dec
const first = new Date(year, month, 1);
const delta = (7 + weekday - first.getDay()) % 7;
return new Date(year, month, 1 + delta + 7 * (n - 1));
}


function lastWeekdayOfMonth(year: number, weekday: number, month: number) {
const last = new Date(year, month + 1, 0);
const delta = (7 + last.getDay() - weekday) % 7;
return new Date(year, month, last.getDate() - delta);
}
```
