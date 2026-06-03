export type FilingStatus = "single" | "married" | "head_of_household";

export interface TaxxProfile {
  userId: string;
  filingStatus: FilingStatus;
  income: number;
  expenses: number;
  netProfit: number;
  mileage: number;
  homeOfficeDeduction: number;
  estimatedTaxLiability: number;
  projectedRefund: number;
  missingDocuments: string[];
}

export const createEmptyTaxxProfile = (userId: string): TaxxProfile => ({
  userId,
  filingStatus: "single",
  income: 0,
  expenses: 0,
  netProfit: 0,
  mileage: 0,
  homeOfficeDeduction: 0,
  estimatedTaxLiability: 0,
  projectedRefund: 0,
  missingDocuments: ["W-2", "1099s", "Bank statements"],
});
