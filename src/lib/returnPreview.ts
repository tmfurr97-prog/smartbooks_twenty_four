import { MILEAGE_RATE, DEFAULT_EFFECTIVE_RATE } from "@/utils/taxCalculator";

export type Confidence = "verified" | "estimated" | "missing";

export interface LineItem {
  label: string;
  amount: number;
  confidence: Confidence;
  note?: string;
}

export interface ScheduleSection {
  key: "scheduleC" | "scheduleSE" | "scheduleD";
  title: string;
  subtitle: string;
  lines: LineItem[];
  total: { label: string; amount: number };
}

export interface ReturnPreviewResult {
  taxYear: number;
  topLine: {
    estimatedRefund: number;
    agi: LineItem;
    taxableIncome: LineItem;
    totalLiability: LineItem;
    withholding: LineItem;
  };
  schedules: ScheduleSection[];
  confidenceOverall: number; // 0-100
  generatedAt: string;
}

export interface ScenarioInputs {
  sepContribution?: number;
  hsaContribution?: number;
  additionalMileage?: number;
  homeOfficeOverride?: number;
}

export interface ComputeInputs {
  taxYear: number;
  income: number;
  expenses: number;
  mileage: number; // miles
  homeOfficeDeduction: number;
  withholding: number;
  estimatedPayments: number;
  cryptoGains: number; // net short+long term, simplified for v1
  filingStatus: "single" | "married_joint" | "married_separate" | "head_of_household" | "qualifying_widow";
  // Source counts drive confidence
  incomeDocCount: number;
  expenseDocCount: number;
  transactionCount: number;
  mileageTripCount: number;
  scenario?: ScenarioInputs;
  effectiveRate?: number;
}

// Federal standard deduction estimates for 2026 (simplified placeholders).
const STANDARD_DEDUCTION: Record<ComputeInputs["filingStatus"], number> = {
  single: 15000,
  married_joint: 30000,
  married_separate: 15000,
  head_of_household: 22500,
  qualifying_widow: 30000,
};

function classifyValue(value: number, supportCount: number): Confidence {
  if (value <= 0) return "missing";
  if (supportCount > 0) return "verified";
  return "estimated";
}

export function computeReturnPreview(input: ComputeInputs): ReturnPreviewResult {
  const rate = input.effectiveRate ?? DEFAULT_EFFECTIVE_RATE;
  const scenario = input.scenario ?? {};

  const extraMileage = scenario.additionalMileage ?? 0;
  const mileageMiles = input.mileage + extraMileage;
  const mileageDeduction = mileageMiles * MILEAGE_RATE;

  const homeOffice = scenario.homeOfficeOverride ?? input.homeOfficeDeduction;
  const sep = scenario.sepContribution ?? 0;
  const hsa = scenario.hsaContribution ?? 0;

  // Schedule C: P&L from self-employment.
  const grossReceipts = input.income;
  const totalExpenses = input.expenses + homeOffice + mileageDeduction;
  const netProfit = Math.max(grossReceipts - totalExpenses, 0);

  const scheduleC: ScheduleSection = {
    key: "scheduleC",
    title: "Schedule C — Profit or Loss from Business",
    subtitle: "Self-employment income and deductions",
    lines: [
      {
        label: "Gross receipts (line 1)",
        amount: grossReceipts,
        confidence: classifyValue(grossReceipts, input.incomeDocCount + input.transactionCount),
        note: `${input.incomeDocCount} income docs, ${input.transactionCount} txns`,
      },
      {
        label: "Direct expenses (line 28)",
        amount: input.expenses,
        confidence: classifyValue(input.expenses, input.expenseDocCount),
        note: `${input.expenseDocCount} receipts on file`,
      },
      {
        label: "Vehicle (line 9)",
        amount: mileageDeduction,
        confidence: classifyValue(mileageDeduction, input.mileageTripCount),
        note: `${mileageMiles.toFixed(0)} mi @ $${MILEAGE_RATE}/mi`,
      },
      {
        label: "Home office (line 30)",
        amount: homeOffice,
        confidence: homeOffice > 0 ? "estimated" : "missing",
      },
    ],
    total: { label: "Net profit (line 31)", amount: netProfit },
  };

  // Schedule SE: self-employment taxx (15.3% on 92.35% of net profit).
  const seBase = netProfit * 0.9235;
  const seTax = Math.max(seBase * 0.153, 0);
  const seDeductibleHalf = seTax / 2;

  const scheduleSE: ScheduleSection = {
    key: "scheduleSE",
    title: "Schedule SE — Self-Employment Taxx",
    subtitle: "15.3% Social Security and Medicare on net earnings",
    lines: [
      {
        label: "Net earnings (92.35% of profit)",
        amount: seBase,
        confidence: classifyValue(seBase, input.incomeDocCount),
      },
      {
        label: "SE taxx (15.3%)",
        amount: seTax,
        confidence: classifyValue(seTax, input.incomeDocCount),
      },
      {
        label: "Deductible half (adjustment to AGI)",
        amount: seDeductibleHalf,
        confidence: classifyValue(seDeductibleHalf, input.incomeDocCount),
      },
    ],
    total: { label: "Total SE taxx", amount: seTax },
  };

  // Schedule D / 8949: simplified capital gains pass-through.
  const scheduleD: ScheduleSection = {
    key: "scheduleD",
    title: "Schedule D / Form 8949 — Capital Gains",
    subtitle: "Crypto and securities, net of losses",
    lines: [
      {
        label: "Net capital gain or loss",
        amount: input.cryptoGains,
        confidence: input.cryptoGains !== 0 ? "estimated" : "missing",
        note: "Pulled from your crypto positions",
      },
    ],
    total: { label: "Total capital gain", amount: input.cryptoGains },
  };

  // Form 1040 rollup.
  const totalAdjustments = seDeductibleHalf + sep + hsa;
  const agi = Math.max(netProfit + input.cryptoGains - totalAdjustments, 0);
  const standardDed = STANDARD_DEDUCTION[input.filingStatus];
  const taxableIncome = Math.max(agi - standardDed, 0);
  const incomeTax = Math.round(taxableIncome * rate);
  const totalLiability = incomeTax + Math.round(seTax);
  const totalPaid = input.withholding + input.estimatedPayments;
  const estimatedRefund = totalPaid - totalLiability;

  // Confidence: ratio of verified lines across schedules.
  const allLines = [...scheduleC.lines, ...scheduleSE.lines, ...scheduleD.lines];
  const verifiedCount = allLines.filter((l) => l.confidence === "verified").length;
  const presentCount = allLines.filter((l) => l.confidence !== "missing").length || 1;
  const confidenceOverall = Math.round((verifiedCount / allLines.length) * 100);

  return {
    taxYear: input.taxYear,
    topLine: {
      estimatedRefund,
      agi: {
        label: "Adjusted gross income",
        amount: agi,
        confidence: classifyValue(agi, verifiedCount),
      },
      taxableIncome: {
        label: "Taxxable income",
        amount: taxableIncome,
        confidence: classifyValue(taxableIncome, verifiedCount),
      },
      totalLiability: {
        label: "Total taxx liability",
        amount: totalLiability,
        confidence: presentCount > 1 ? "estimated" : "missing",
      },
      withholding: {
        label: "Withholding + estimated payments",
        amount: totalPaid,
        confidence: classifyValue(totalPaid, input.transactionCount),
      },
    },
    schedules: [scheduleC, scheduleSE, scheduleD],
    confidenceOverall,
    generatedAt: new Date().toISOString(),
  };
}
