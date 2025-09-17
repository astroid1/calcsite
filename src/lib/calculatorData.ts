export interface CalculatorInfo {
  href: string;
  name: string;
  navLabel: string;
  description: string;
  keywords: string[];
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
        description:
          "Find how many days are between any two dates—or from today.",
        keywords: [
          "days between",
          "day counter",
          "date difference",
          "countdown",
          "days until",
        ],
      },
      {
        href: "/calculators/age-calculator",
        name: "Age Calculator",
        navLabel: "Age",
        description:
          "Enter a birthdate to see your age in years, months, and days.",
        keywords: [
          "how old",
          "birth date",
          "age in days",
          "birthday",
          "age finder",
        ],
      },
      {
        href: "/calculators/days-until-birthday",
        name: "Days Until Your Birthday",
        navLabel: "Birthday",
        description: "Countdown with leap-year handling for Feb 29 birthdays.",
        keywords: [
          "birthday countdown",
          "birthday timer",
          "days until birthday",
          "next birthday",
        ],
      },
      {
        href: "/calculators/anniversary-countdown",
        name: "Anniversary Countdown",
        navLabel: "Anniversary",
        description:
          "Preview the next few anniversaries for any meaningful date.",
        keywords: [
          "days until anniversary",
          "relationship milestone",
          "marriage countdown",
          "anniversary date",
        ],
      },
      {
        href: "/calculators/holiday-countdown",
        name: "Holiday Countdown (US)",
        navLabel: "Holidays",
        description: "See days remaining until major U.S. holidays.",
        keywords: [
          "christmas countdown",
          "holiday timer",
          "days until holiday",
          "us holidays",
          "thanksgiving countdown",
        ],
      },
      {
        href: "/calculators/flight-time-calculator",
        name: "Flight Time Calculator",
        navLabel: "Flight Time",
        description:
          "Estimate nonstop duration, arrival time, and time zone shifts between major airports.",
        keywords: [
          "flight duration",
          "travel time",
          "airport finder",
          "airline route",
          "flight distance",
        ],
      },
    ],
  },
  {
    id: "money",
    label: "Money & Planning",
    calculators: [
      {
        href: "/calculators/paycheck-tax-calculator",
        name: "Paycheck Tax Calculator",
        navLabel: "Paycheck",
        description:
          "Estimate take-home pay by state with federal, payroll, and state taxes.",
        keywords: [
          "take home pay",
          "paycheck after tax",
          "net pay",
          "salary calculator",
          "pay stub",
        ],
      },
      {
        href: "/calculators/overtime-pay-calculator",
        name: "Overtime Pay Calculator",
        navLabel: "Overtime",
        description:
          "See total pay when overtime and double-time hours stack onto your shift.",
        keywords: [
          "time and a half",
          "double time",
          "overtime wages",
          "extra hours",
        ],
      },
      {
        href: "/calculators/freelancer-hourly-rate-calculator",
        name: "Freelancer Hourly Rate",
        navLabel: "Freelance",
        description:
          "Back into a sustainable freelance rate using income goals and billable hours.",
        keywords: [
          "freelance pricing",
          "contract rate",
          "billable hours",
          "hourly quote",
        ],
      },
      {
        href: "/calculators/salary-to-hourly",
        name: "Salary ↔ Hourly",
        navLabel: "Salary",
        description:
          "Convert yearly pay to hourly wages (and vice versa) with your schedule.",
        keywords: [
          "salary to hourly",
          "hourly to salary",
          "pay converter",
          "annual pay",
        ],
      },
      {
        href: "/calculators/loan-calculator",
        name: "Loan Calculator",
        navLabel: "Loan",
        description:
          "Estimate payments and see principal versus interest by year.",
        keywords: [
          "monthly payment",
          "loan payment",
          "amortization",
          "interest calculator",
        ],
      },
      {
        href: "/calculators/car-loan-affordability-calculator",
        name: "Car Loan Affordability",
        navLabel: "Car Budget",
        description:
          "Find the maximum vehicle price your income can comfortably support.",
        keywords: [
          "car budget",
          "car payment",
          "auto loan",
          "how much car",
        ],
      },
      {
        href: "/calculators/mortgage-calculator",
        name: "Mortgage Planner",
        navLabel: "Mortgage",
        description:
          "Check affordability, monthly costs, and an amortization schedule.",
        keywords: [
          "mortgage payment",
          "home loan",
          "principal and interest",
          "mortgage estimate",
        ],
      },
      {
        href: "/calculators/debt-payoff-calculator",
        name: "Debt Payoff Calculator",
        navLabel: "Debt",
        description:
          "Compare snowball and avalanche payoff timelines across all your debts.",
        keywords: [
          "debt snowball",
          "debt avalanche",
          "pay off debt",
          "debt planner",
        ],
      },
      {
        href: "/calculators/credit-card-interest-calculator",
        name: "Credit Card Interest",
        navLabel: "Card Interest",
        description:
          "Project interest charges while carrying a balance and test extra payments.",
        keywords: [
          "credit card apr",
          "interest charges",
          "carry balance",
          "credit payoff",
        ],
      },
      {
        href: "/calculators/compound-interest-calculator",
        name: "Compound Interest",
        navLabel: "Invest",
        description:
          "Model investment growth with recurring deposits and raises.",
        keywords: [
          "investment growth",
          "interest growth",
          "future value",
          "savings calculator",
        ],
      },
      {
        href: "/calculators/savings-goal-calculator",
        name: "Savings Goal",
        navLabel: "Savings",
        description:
          "See the monthly deposit needed to reach a target with growth.",
        keywords: [
          "monthly savings",
          "target savings",
          "goal planner",
          "savings plan",
        ],
      },
      {
        href: "/calculators/savings-vs-investing-comparison",
        name: "Savings vs Investing",
        navLabel: "Save vs Invest",
        description:
          "Compare bank interest against market returns using the same contributions.",
        keywords: [
          "investing vs saving",
          "bank vs market",
          "compare returns",
          "investment comparison",
        ],
      },
      {
        href: "/calculators/currency-converter",
        name: "Currency Converter",
        navLabel: "Currency",
        description:
          "Convert between 30+ currencies with live-rate fallback support.",
        keywords: [
          "exchange rate",
          "forex",
          "currency exchange",
          "convert money",
        ],
      },
      {
        href: "/calculators/inflation-calculator",
        name: "Inflation Adjuster",
        navLabel: "Inflation",
        description:
          "Compare the buying power of money across different years.",
        keywords: [
          "cpi",
          "cost of living",
          "inflation rate",
          "value of money",
        ],
      },
      {
        href: "/calculators/tip-calculator",
        name: "Tip Splitter",
        navLabel: "Tip",
        description:
          "Quickly find tip amounts and per-person totals for the table.",
        keywords: [
          "split bill",
          "restaurant tip",
          "gratuity",
          "tip amount",
        ],
      },
      {
        href: "/calculators/event-budget-calculator",
        name: "Event Budget Planner",
        navLabel: "Event Budget",
        description:
          "Forecast venue, catering, staffing, and contingency costs with per-guest totals for any event.",
        keywords: [
          "wedding budget",
          "party budget",
          "event planning",
          "cost per guest",
        ],
      },
    ],
  },
  {
    id: "conversions",
    label: "Converters & Units",
    calculators: [
      {
        href: "/calculators/unit-converter",
        name: "Unit Converter",
        navLabel: "Units",
        description:
          "Switch between length, weight, temperature, and volume measurements with precise factors.",
        keywords: [
          "measurement converter",
          "unit conversion",
          "metric to imperial",
          "length weight temperature",
        ],
      },
      {
        href: "/calculators/time-zone-converter",
        name: "Time Zone Converter",
        navLabel: "Time Zones",
        description:
          "Enter a city and instantly compare the time across world capitals—DST aware.",
        keywords: [
          "world clock",
          "time difference",
          "timezone",
          "city time",
        ],
      },
      {
        href: "/calculators/cooking-measurement-converter",
        name: "Cooking Measurement Converter",
        navLabel: "Cooking",
        description:
          "Translate cups, grams, ounces, and spoons with a water-based kitchen reference.",
        keywords: [
          "baking conversion",
          "cooking measurements",
          "cups to grams",
          "kitchen converter",
        ],
      },
      {
        href: "/calculators/fuel-economy-converter",
        name: "Fuel Economy Converter",
        navLabel: "Fuel",
        description:
          "Swap between MPG and liters per 100 km when comparing vehicle efficiency.",
        keywords: [
          "mpg to l/100km",
          "gas mileage",
          "fuel efficiency",
          "km per liter",
        ],
      },
      {
        href: "/calculators/speed-converter",
        name: "Speed Converter",
        navLabel: "Speed",
        description:
          "Convert driving speeds between miles per hour and kilometers per hour.",
        keywords: [
          "mph to kph",
          "speed conversion",
          "kilometers per hour",
          "miles per hour",
        ],
      },
      {
        href: "/calculators/shoe-size-converter",
        name: "Shoe Size Converter",
        navLabel: "Shoes",
        description:
          "Match US, UK, and EU shoe sizes for men's and women's charts side by side.",
        keywords: [
          "us to eu shoes",
          "shoe size chart",
          "uk shoe size",
          "foot size",
        ],
      },
      {
        href: "/calculators/clothing-size-converter",
        name: "Clothing Size Converter",
        navLabel: "Clothing",
        description:
          "Find approximate international equivalents for common men's and women's apparel sizes.",
        keywords: [
          "size chart",
          "us to eu clothing",
          "international sizes",
          "clothing conversion",
        ],
      },
      {
        href: "/calculators/pet-age-converter",
        name: "Pet Age Converter",
        navLabel: "Pet Age",
        description:
          "Translate cat and dog ages into human years (and back) with growth-stage context.",
        keywords: [
          "dog years",
          "cat years",
          "pet age chart",
          "human years",
        ],
      },
    ],
  },
  {
    id: "health",
    label: "Health & Fitness",
    calculators: [
      {
        href: "/calculators/bmi-calculator",
        name: "BMI Calculator",
        navLabel: "BMI",
        description: "Check your body mass index and see a healthy weight range for your height.",
        keywords: [
          "body mass index",
          "weight range",
          "bmi chart",
          "healthy weight",
        ],
      },
      {
        href: "/calculators/bmr-calorie-calculator",
        name: "BMR & Calorie Needs",
        navLabel: "Calories",
        description:
          "Estimate daily calories for maintenance, weight loss, or muscle gain using the Mifflin-St Jeor equation.",
        keywords: [
          "calorie calculator",
          "maintenance calories",
          "bmr",
          "metabolism",
        ],
      },
      {
        href: "/calculators/body-fat-estimator",
        name: "Body Fat % Estimator",
        navLabel: "Body Fat",
        description:
          "Approximate body fat percentage and lean mass from tape measurements using the U.S. Navy method.",
        keywords: [
          "body fat percentage",
          "navy method",
          "tape measurements",
          "body composition",
        ],
      },
      {
        href: "/calculators/water-intake-calculator",
        name: "Water Intake Guide",
        navLabel: "Hydration",
        description: "Find a daily water target based on body weight, activity, and climate.",
        keywords: [
          "daily water",
          "hydration calculator",
          "water per day",
          "drink water",
        ],
      },
      {
        href: "/calculators/macros-calculator",
        name: "Macros Calculator",
        navLabel: "Macros",
        description:
          "Split your calorie goal into daily protein, carb, and fat targets for different training goals.",
        keywords: [
          "macro split",
          "protein carbs fat",
          "nutrition goals",
          "macro calculator",
        ],
      },
    ],
  },
  {
    id: "tools",
    label: "Everyday Tools",
    calculators: [
      {
        href: "/calculators/password-generator",
        name: "Password Generator",
        navLabel: "Password",
        description: "Build strong random passwords with custom character sets and length.",
        keywords: [
          "random password",
          "secure password",
          "password maker",
          "strong password",
        ],
      },
      {
        href: "/calculators/text-case-converter",
        name: "Text Case Converter",
        navLabel: "Text Case",
        description: "Flip text to upper, lower, or title case without losing your formatting.",
        keywords: [
          "uppercase",
          "lowercase",
          "title case",
          "capitalize text",
        ],
      },
      {
        href: "/calculators/hex-rgb-color-converter",
        name: "Hex ↔ RGB Color Converter",
        navLabel: "Color",
        description: "Translate design colors between hexadecimal and RGB with a live swatch preview.",
        keywords: [
          "hex to rgb",
          "color picker",
          "color converter",
          "rgb to hex",
        ],
      },
      {
        href: "/calculators/qr-code-generator",
        name: "QR Code Generator",
        navLabel: "QR Code",
        description: "Turn any text or link into a downloadable QR code with adjustable size.",
        keywords: [
          "make qr code",
          "qr creator",
          "qr download",
          "generate qr",
        ],
      },
      {
        href: "/calculators/word-counter",
        name: "Word & Character Counter",
        navLabel: "Word Counter",
        description:
          "Track words, characters, sentences, and reading time while you draft or edit text.",
        keywords: [
          "word count",
          "character count",
          "writing stats",
          "reading time",
        ],
      },
      {
        href: "/calculators/pdf-to-word",
        name: "PDF to Word/Text Extractor",
        navLabel: "PDF Extractor",
        description:
          "Extract plain text from PDFs in your browser and download it as a Word or TXT file.",
        keywords: [
          "pdf text",
          "pdf to doc",
          "extract pdf",
          "pdf converter",
        ],
      },
      {
        href: "/calculators/grade-calculator",
        name: "Grade Goal Calculator",
        navLabel: "Grade Goal",
        description:
          "See the GPA needed in remaining credits or the final exam score required to reach your target.",
        keywords: [
          "final grade",
          "gpa goal",
          "exam score",
          "grade needed",
        ],
      },
      {
        href: "/calculators/meal-planner",
        name: "Meal Planner & Portion Calculator",
        navLabel: "Meal Planner",
        description:
          "Scale proteins, sides, desserts, and drinks for any gathering based on adults, kids, and leftovers.",
        keywords: [
          "meal planning",
          "portion calculator",
          "party food",
          "serving sizes",
        ],
      },
    ],
  },
];
