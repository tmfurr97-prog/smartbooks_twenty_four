import type { TaxxProfile } from "@/types/taxProfile";

// IRS standard mileage rate (business) for 2026 estimate
export const MILEAGE_RATE = 0.67;

// Blended self-employment + federal estimate
export const DEFAULT_EFFECTIVE_RATE = 0.253;

export function calculateTaxxProfile(
  profile: TaxxProfile,
  effectiveRate = DEFAULT_EFFECTIVE_RATE
): TaxxProfile {
  const mileageDeduction = profile.mileage * MILEAGE_RATE;
  const netProfit = Math.max(
    profile.income -
      profile.expenses -
      profile.homeOfficeDeduction -
      mileageDeduction,
    0
  );
  const estimatedTaxLiability = Math.round(netProfit * effectiveRate);

  return {
    ...profile,
    netProfit,
    estimatedTaxLiability,
    projectedRefund: 0,
  };
}
