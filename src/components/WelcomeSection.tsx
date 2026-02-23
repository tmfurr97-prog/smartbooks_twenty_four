import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WelcomeSection() {
  return (
    <section className="py-24 bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">
          A Message From Your Preparer
        </h2>
        <blockquote className="text-lg md:text-xl leading-relaxed text-primary-foreground/85 mb-4">
          "Welcome to SmartBooks by ReFurrm. This is your secure and simple year round taxx and
          document hub. The app gives you an easy way to upload your taxx documents, stay organized,
          and communicate with me directly. Whether you are an individual, a gig worker, or a small
          business owner, you will have a safe place to store everything you need for taxx season."
        </blockquote>
        <blockquote className="text-lg md:text-xl leading-relaxed text-primary-foreground/85 mb-4">
          "You can upload W 2s, 1099s, receipts, IDs, business expenses, and more. You can message
          me anytime, ask questions, and get updates on your return. As new features roll out, you
          will also be able to join video appointments, store documents throughout the year, and
          receive an AI powered taxx review before filing."
        </blockquote>
        <blockquote className="text-lg md:text-xl leading-relaxed text-primary-foreground/85 mb-10">
          "I am here to make taxxes easier, safer, and more convenient for you every step of the way."
        </blockquote>
        <Button variant="gold" size="lg" asChild>
          <Link to="/signup">Join SmartBooks Today</Link>
        </Button>
      </div>
    </section>
  );
}
