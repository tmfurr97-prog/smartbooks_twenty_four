import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy | SmartBooks"
        description="How SmartBooks by ReFurrm collects, stores, and protects your taxx documents and personal information. Bank-level encryption, never sold."
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
              We collect information you provide directly, including your name, email, taxx
              documents, and messages with your preparer. We also collect basic usage data to
              keep the Service secure and reliable.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p>
              Your data is used to deliver taxx preparation services, organize uploaded documents,
              support communication with your preparer, and maintain audit and compliance records.
              We never sell your personal information.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">3. Data Security</h2>
            <p>
              All documents are encrypted at rest using AES-256 and in transit using TLS 1.2 or
              higher. Access is governed by role-based permissions and protected by mandatory
              audit logging.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">4. Data Sharing</h2>
            <p>
              Your documents and messages are visible only to you and the preparer assigned to
              your account. We do not share your information with third parties except as required
              by law or with trusted infrastructure providers under strict confidentiality.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">5. Data Retention</h2>
            <p>
              We retain taxx documents and related records for the period required by IRS guidance
              and applicable law. You may request deletion of your account; certain records may be
              retained to satisfy legal obligations.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You can access, update, or export your data from within your dashboard. Contact your
              preparer through in-app messaging for assistance with any privacy-related request.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">7. Cookies</h2>
            <p>
              We use essential cookies to keep you signed in and to secure the Service. We do not
              use advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated
              through the Service.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
