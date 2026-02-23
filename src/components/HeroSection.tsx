import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-gold font-semibold text-sm tracking-widest uppercase mb-4 animate-fade-in">
            SmartBooks by ReFurrm
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up">
            Secure Storage. Real Support.{" "}
            <span className="text-gradient-gold">Stress Free Filing.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            Your secure, year‑round tax and document hub. Upload documents, chat with your
            preparer, and get your taxes filed remotely — with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
