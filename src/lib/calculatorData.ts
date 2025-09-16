export interface CalculatorInfo {
  href: string;
  name: string;
  navLabel: string;
  description: string;
}

export interface CalculatorCategory {
  id: string;
  label: string;
  calculators: CalculatorInfo[];
}

export const calculatorCategories: CalculatorCategory[] = [
  {
    id: "time",
    label: "Time & Countdown",
    calculators: [
      {
        href: "/calculators/days-from-date",
        name: "Days From (or Until) a Date",
        navLabel: "Days From Date",
        description: "Find how many days are between any two dates—or from today.",
      },
      {
        href: "/calculators/age-calculator",
        name: "Age Calculator",
        navLabel: "Age",
        description: "Enter a birthdate to see your age in years, months, and days.",
      },
      {
        href: "/calculators/days-until-birthday",
        name: "Days Until Your Birthday",
        navLabel: "Birthday",
        description: "Countdown with leap-year handling for Feb 29 birthdays.",
      },
      {
        href: "/calculators/anniversary-countdown",
        name: "Anniversary Countdown",
        navLabel: "Anniversary",
        description: "Preview the next few anniversaries for any meaningful date.",
      },
      {
        href: "/calculators/holiday-countdown",
        name: "Holiday Countdown (US)",
        navLabel: "Holidays",
        description: "See days remaining until major U.S. holidays.",
      },
    ],
  },
  {
    id: "money",
    label: "Money & Planning",
    calculators: [
      {
        href: "/calculators/loan-calculator",
        name: "Loan Calculator",
        navLabel: "Loan",
        description: "Estimate payments and see principal versus interest by year.",
      },
      {
        href: "/calculators/mortgage-calculator",
        name: "Mortgage Planner",
        navLabel: "Mortgage",
        description: "Check affordability, monthly costs, and an amortization schedule.",
      },
      {
        href: "/calculators/compound-interest-calculator",
        name: "Compound Interest",
        navLabel: "Invest",
        description: "Model investment growth with recurring deposits and raises.",
      },
      {
        href: "/calculators/currency-converter",
        name: "Currency Converter",
        navLabel: "Currency",
        description: "Convert between 30+ currencies with live-rate fallback support.",
      },
      {
        href: "/calculators/inflation-calculator",
        name: "Inflation Adjuster",
        navLabel: "Inflation",
        description: "Compare the buying power of money across different years.",
      },
      {
        href: "/calculators/salary-to-hourly",
        name: "Salary ↔ Hourly",
        navLabel: "Salary",
        description: "Convert yearly pay to hourly wages (and vice versa) with your schedule.",
      },
      {
        href: "/calculators/tip-calculator",
        name: "Tip Splitter",
        navLabel: "Tip",
        description: "Quickly find tip amounts and per-person totals for the table.",
      },
      {
        href: "/calculators/savings-goal-calculator",
        name: "Savings Goal",
        navLabel: "Savings",
        description: "See the monthly deposit needed to reach a target with growth.",
      },
    ],
  },
];
