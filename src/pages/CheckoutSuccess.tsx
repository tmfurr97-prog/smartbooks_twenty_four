import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Payment received — SmartBooks" description="Your payment was successful." path="/checkout/success" />
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-20 w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-3">You're in.</h1>
        <p className="text-lg text-foreground mb-8">
          Your subscription is active. It may take a few seconds for everything to sync to your account.
        </p>
        <Link to="/dashboard">
          <Button variant="gold" size="lg">Go to dashboard</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
