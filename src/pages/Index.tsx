import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import WelcomeSection from "@/components/WelcomeSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="SmartBooks by ReFurrm — Secure Taxx & Document Hub"
        description="Secure year-round taxx and document management. Upload, chat with your preparer, and file remotely. Built for individuals, gig workers, and small businesses."
        path="/"
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WelcomeSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
