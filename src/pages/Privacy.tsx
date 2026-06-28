import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy | SmartBooks"
        description="How SmartBooks by ReFurrm collects, stores, and protects your tax documents and personal information."
        path="/privacy"
      />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-foreground mb-8">Last updated: June 2026</p>

        <section className="space-y-6 text-foreground leading-relaxed">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your name, email, tax documents,
              uploaded files, account details, and messages with your preparer. We may also collect
              basic usage data to keep the service secure and reliable.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p>
              Your data is used to provide tax preparation support, organize uploaded documents,
              support communication with your preparer, maintain records, and improve the service.
              We do not sell your personal information.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">3. Data Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational safeguards to protect
              your information. No online service can guarantee absolute security, so you should also
              protect your account credentials and use a strong password.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">4. Data Sharing</h2>
            <p>
              Your documents and messages are intended to be visible only to you, your assigned
              preparer, authorized support personnel, and trusted infrastructure providers needed to
              operate the service. We may also disclose information when required by law.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">5. Data Retention</h2>
            <p>
              We retain tax documents and related records as needed to provide the service, comply
              with legal obligations, resolve disputes, and maintain business records. You may request
              account deletion, but certain records may be retained when legally required.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You may request access, correction, export, or deletion of your personal information.
              Some requests may be limited by legal, tax, security, or recordkeeping obligations.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">7. Cookies</h2>
            <p>
              We use essential cookies and similar technologies to keep you signed in, protect your
              account, and operate the service. We do not use advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be posted through
              the service or communicated by another reasonable method.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">9. Contact</h2>
            <p>
              Questions about this policy can be sent through the in-app messaging feature or through
              the support contact listed on the SmartBooks website.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
