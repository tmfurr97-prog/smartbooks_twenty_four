import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WelcomeSection() {
  return (
    <section className="py-24 bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">
          A Message From Your Preparer
        </h2>
        <blockquote className="text-lg md:text-xl leading-relaxed text-primary-foreground/85 mb-10">
          "Welcome to SmartBooks by ReFurrm — your secure, year‑round tax and document hub. 
          Whether you're an individual, gig‑worker, or small business owner, you'll have a safe 
          place to store everything you need for tax season. Upload W‑2s, 1099s, receipts, IDs, 
          business expenses, and more. Message me anytime, ask questions, and get updates on your 
          return. I'm here to make taxes easier, safer, and more convenient for you — every step 
          of the way."
        </blockquote>
        <Button variant="gold" size="lg" asChild>
          <Link to="/signup">Join SmartBooks Today</Link>
        </Button>
      </div>
    </section>
  );
}
