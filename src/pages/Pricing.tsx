import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { toast } from "@/hooks/use-toast";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  priceId?: string;
  highlight: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "For individuals organizing one tax year.",
    features: [
      "Up to 25 documents",
      "AI document classification",
      "Year-end checklist",
      "Mileage tracker",
      "Email support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For freelancers and side hustlers filing Schedule C.",
    features: [
      "Unlimited documents",
      "Live return preview",
      "Quarterly estimated tax support",
      "Smart recommendations",
      "Transaction and receipt matching",
      "Audit defense hub",
    ],
    cta: "Start Pro",
    priceId: "pro_monthly",
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
      "Crypto tax tracking",
      "Preparer collaboration seats",
      "Priority review workflow",
      "Engagement letter support",
    ],
    cta: "Start Business",
    priceId: "business_monthly",
    highlight: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading } = usePaddleCheckout();

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) {
      navigate("/signup");
      return;
    }

    if (!user) {
      navigate(`/signup?plan=${priceId}`);
      return;
    }

    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch (e) {
      toast({ title: "Checkout failed", description: String(e), variant: "destructive" });
    }
  };

  const handleAddon = async (priceId: string) => {
    if (!user) {
      navigate(`/signup?plan=${priceId}`);
      return;
    }

    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch (e) {
      toast({ title: "Checkout failed", description: String(e), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pricing | SmartBooks by ReFurrm"
        description="Simple plans for individuals, freelancers, and small businesses. Starter free, Pro $19 per month, Business $49 per month. Secure document storage on every plan."
        path="/pricing"
      />
      <PaymentTestModeBanner />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Simple pricing. Real support.
          </h1>
          <p className="text-lg text-foreground">
            Every plan includes secure document storage, guided organization, and access to SmartBooks tools.
            Cancel anytime.
          </p>
        </div>

        <h2 className="sr-only">Plans</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? "border-gold/60 shadow-lg relative bg-card" : "border-border bg-card"}
            >
              {tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black">
                  Most popular
                </Badge>
              )}

              <CardHeader>
                <h2 className="text-2xl font-heading font-semibold leading-none tracking-tight text-foreground">
                  {tier.name}
                </h2>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-foreground ml-2">{tier.cadence}</span>
                </div>
                <p className="text-sm text-foreground mt-2">{tier.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlight ? "gold" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(tier.priceId)}
                  disabled={loading}
                >
                  {loading ? "Loading..." : tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
              Audit Defense Shield
            </h2>
            <p className="text-foreground">
              Optional add-on support for IRS notices, correspondence drafts, and organized response memos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <h3 className="text-xl font-heading font-semibold text-foreground">Annual coverage</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">$149</span>
                  <span className="text-foreground ml-2">per year</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  Defense memo support for the tax year, plus correspondence drafts.
                </p>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => handleAddon("audit_defense_yearly")}
                  disabled={loading}
                >
                  Add annual coverage
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <h3 className="text-xl font-heading font-semibold text-foreground">Single memo</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">$29</span>
                  <span className="text-foreground ml-2">one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  One on-demand response memo for a specific notice or tax issue.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAddon("audit_defense_memo")}
                  disabled={loading}
                >
                  Buy single memo
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="text-center mt-12 text-sm text-foreground">
          Need something custom?{" "}
          <Link to="/dashboard/messages" className="text-gold underline">
            Talk to our team
          </Link>
          .
        </div>
      </main>

      <Footer />
    </div>
  );
}
