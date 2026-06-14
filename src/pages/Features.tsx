import { Link } from "react-router-dom";
import { CheckCircle2, Mail, Brain, FileText, BarChart3, Shield, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Features — SmartBooks Year-Round Taxx Hub"
        description="Document automation, AI receipt reader, mileage tracking, return preview, preparer messaging, and audit defense. Built for freelancers and small businesses."
        path="/features"
      />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-heading font-bold text-foreground mb-4">SmartBooks Features</h1>
          <p className="text-xl text-muted-foreground">Your Year-Round Tax Companion</p>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            SmartBooks turns financial overwhelm into effortless organization. 
            Designed for freelancers, entrepreneurs, and small business owners.
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Smart Document Automation</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-muted rounded-lg">
                <Mail className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Email & Cloud Sync</h3>
                <p className="text-muted-foreground">Automatically scans your email for receipts, bills, and statements.</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <Brain className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">AI Receipt Reader</h3>
                <p className="text-muted-foreground">Upload receipts and AI instantly extracts details and assigns tax categories.</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <FileText className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Smart Naming & Sorting</h3>
                <p className="text-muted-foreground">Every document is labeled and filed automatically for instant access.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Intelligent Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border-2 border-primary rounded-lg">
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Tax Overview at a Glance</h3>
                <p className="text-muted-foreground">See income, expenses, and estimated tax totals in one clear view.</p>
              </div>
              <div className="p-6 border-2 border-primary rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Tax Health Score</h3>
                <p className="text-muted-foreground">Built-in progress indicator shows how tax-ready you are.</p>
              </div>
            </div>
          </section>

          <section className="bg-card text-foreground p-12 rounded-lg border border-border">
            <h2 className="text-3xl font-bold mb-6">Security You Can Trust</h2>
            <p className="text-lg text-muted-foreground mb-6">Your data deserves protection. SmartBooks uses enterprise-grade encryption.</p>
            <ul className="space-y-3">
              {[
                "IRS Publication 1075 standards for data protection",
                "Plaid's permissible-purpose financial access requirements",
                "SOC 2 and GDPR alignment for cloud security",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="text-center">
            <DollarSign className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Premium Subscription</h2>
            <p className="text-lg text-muted-foreground mb-8">One simple plan gives you everything</p>
            <div className="flex justify-center gap-8 mb-8">
              <div className="p-6 border-2 border-primary rounded-lg">
                <p className="text-2xl font-bold text-foreground">$24.99/month</p>
                <p className="text-muted-foreground">Monthly Plan</p>
              </div>
              <div className="p-6 border-2 border-primary rounded-lg bg-primary text-primary-foreground">
                <p className="text-2xl font-bold">$249/year</p>
                <p>Annual Plan — Save 17%</p>
              </div>
            </div>
          </section>

          <section className="text-center py-12 bg-primary text-primary-foreground rounded-lg">
            <h2 className="text-4xl font-bold mb-4">Automate. Simplify. File with Confidence.</h2>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="mt-6">
                Get Started Today
              </Button>
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
