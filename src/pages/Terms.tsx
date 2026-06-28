import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Terms of Service | SmartBooks"
        description="The terms governing your use of SmartBooks by ReFurrm, including account responsibilities, acceptable use, platform availability, and preparer services."
        path="/terms"
      />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-foreground mb-8">Last updated: June 2026</p>

        <section className="space-y-6 text-foreground leading-relaxed">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SmartBooks by ReFurrm, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use the service.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">2. Description of Service</h2>
            <p>
              SmartBooks provides a secure platform for uploading, organizing, and sharing tax
              documents with your assigned preparer. The service may include document storage,
              messaging, return preparation tools, review workflows, and related features.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and
              for activity on your account. You agree to provide accurate information and use the
              service in compliance with applicable laws.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">4. Preparer Services</h2>
            <p>
              Tax preparation work performed through the service may be governed by a separate
              engagement letter. SmartBooks is the platform. Your assigned preparer is responsible for
              the professional work product they provide.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">5. Filing Status and E-File Availability</h2>
            <p>
              Electronic filing is not available until live filing integration and compliance checks
              are complete. Any return preview, estimate, checklist, or draft shown in SmartBooks
              should be reviewed by a qualified tax professional before filing.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">6. Data and Security</h2>
            <p>
              We use reasonable safeguards to protect your information. You are responsible for using
              a strong password and protecting your login credentials. See our Privacy Policy for more
              information.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">7. Service Availability</h2>
            <p>
              We may update, pause, limit, or discontinue features as needed for maintenance,
              security, compliance, or business reasons. We are not responsible for delays caused by
              third-party providers or user-provided information.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">8. Limitation of Liability</h2>
            <p>
              The service is provided as is. To the maximum extent permitted by law, ReFurrm is not
              liable for indirect, incidental, special, or consequential damages arising from your use
              of the service.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">9. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the service after changes
              are posted means you accept the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">10. Contact</h2>
            <p>
              Questions about these Terms can be sent through the in-app messaging feature or through
              the support contact listed on the SmartBooks website.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
