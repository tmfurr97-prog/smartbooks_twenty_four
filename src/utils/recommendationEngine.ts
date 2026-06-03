import type { TaxxProfile } from "@/types/taxProfile";
import { MILEAGE_RATE } from "@/utils/taxCalculator";

export type RecommendationPriority = "low" | "medium" | "high";
export type RecommendationTier = "free" | "pro" | "premium";

export interface TaxxRecommendation {
  id: string;
  title: string;
  message: string;
  priority: RecommendationPriority;
  tier: RecommendationTier;
  action?: string;
}

export function generateRecommendations(profile: TaxxProfile): TaxxRecommendation[] {
  const recs: TaxxRecommendation[] = [];
  const { income, expenses, netProfit, mileage, homeOfficeDeduction, filingStatus } = profile;

  if (income > 10_000 && expenses < income * 0.1) {
    recs.push({
      id: "low-expenses",
      title: "Your expenses look light for your income",
      message:
        "Most self employed filers in your income range deduct more than ten percent of revenue. Walk through last quarter's card statements, subscriptions, and vendor invoices to confirm nothing business related is sitting in personal accounts.",
      priority: "medium",
      tier: "free",
      action: "Review transactions",
    });
  }

  if (netProfit > 30_000) {
    recs.push({
      id: "retirement",
      title: "Shelter income with a retirement contribution",
      message:
        "At your projected profit, a SEP IRA or Solo 401(k) contribution could meaningfully lower your taxxable income while building long term savings. Most plans must be opened before the filing deadline.",
      priority: "high",
      tier: "pro",
      action: "Talk to your preparer",
    });
  }

  if (mileage === 0 && income > 10_000) {
    recs.push({
      id: "missing-mileage",
      title: "No business mileage on file",
      message: `You have reported income but zero miles. At the current IRS rate of $${MILEAGE_RATE.toFixed(
        2
      )} per mile, even modest driving for client meetings, supply runs, or job sites can add up quickly.`,
      priority: "medium",
      tier: "free",
      action: "Log mileage",
    });
  }

  if (homeOfficeDeduction === 0 && netProfit > 5_000) {
    recs.push({
      id: "home-office",
      title: "Consider the home office deduction",
      message:
        "If you use a dedicated space at home regularly and exclusively for work, you may qualify. The simplified method gives you five dollars per square foot, up to three hundred square feet, with no extra paperwork.",
      priority: "low",
      tier: "free",
      action: "Estimate deduction",
    });
  }

  if (netProfit > 1_000) {
    recs.push({
      id: "quarterly",
      title: "Stay ahead of quarterly estimated taxxes",
      message:
        "Filers who owe more than one thousand dollars at year end are generally required to pay quarterly. Set aside your estimate now so April does not catch you short, and avoid underpayment penalties.",
      priority: "high",
      tier: "free",
      action: "Open Quarterly Taxxes",
    });
  }

  if (filingStatus === "single" && netProfit > 200_000) {
    recs.push({
      id: "amt-watch",
      title: "Watch for Additional Medicare and NIIT exposure",
      message:
        "Single filers above two hundred thousand in net earnings start owing the 0.9 percent Additional Medicare Tax and may trigger the 3.8 percent Net Investment Income Tax on passive income. Plan withholding accordingly.",
      priority: "medium",
      tier: "premium",
      action: "Review with preparer",
    });
  }

  if (income > 0 && expenses > income) {
    recs.push({
      id: "loss-year",
      title: "Your year is currently showing a loss",
      message:
        "A net operating loss is not automatically bad, it can offset other income or carry forward. Make sure every expense is substantiated with receipts in case of a review.",
      priority: "low",
      tier: "pro",
      action: "Upload receipts",
    });
  }

  return recs;
}
