import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "For individuals organizing a single year of taxxes.",
    features: [
      "Up to 25 documents",
      "AI document classification",
      "Year-end checklist",
      "Mileage tracker",
      "Email support",
    ],
    cta: "Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For freelancers and side-hustlers filing Schedule C.",
    features: [
      "Unlimited documents",
      "Live Return Preview (1040, Sched C, SE, D)",
      "Quarterly estimated taxx automation",
      "Smart recommendations",
      "Transaction and receipt matching",
      "Audit defense hub",
    ],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$49",
    cadence: "per month",
    description: "For small businesses, S-Corps, and multi-entity owners.",
    features: [
      "Everything in Pro",
      "Multiple business entities",
      "Crypto taxx tracking",
      "Preparer collaboration seats",
      "Priority e-file",
      "Engagement letter and review workflow",
    ],
    cta: "Start Business",
    href: "/signup?plan=business",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pricing — SmartBooks by ReFurrm"
        description="Simple plans for individuals, freelancers, and small businesses. Starter free, Pro $19/mo, Business $49/mo. Bank-level encryption on every plan."
        path="/pricing"
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Simple pricing. Real returns.
          </h1>
          <p className="text-lg text-foreground">
            Every plan includes bank-level encryption, secure document storage, and the AI assistant. Cancel anytime.
          </p>
        </div>

        <h2 className="sr-only">Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlight
                  ? "border-gold/60 shadow-lg relative bg-card"
                  : "border-border bg-card"
              }
            >
              {tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle asChild>
                  <h2 className="text-2xl font-heading">{tier.name}</h2>
                </CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-foreground ml-2">{tier.cadence}</span>
                </div>
                <p className="text-sm text-foreground mt-2">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={tier.href}>
                  <Button variant={tier.highlight ? "gold" : "outline"} className="w-full">
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-foreground">
          Need something custom? <Link to="/dashboard/messages" className="text-gold underline">Talk to our team</Link>.
        </div>
      </main>
      <Footer />
    </div>
  );
}
