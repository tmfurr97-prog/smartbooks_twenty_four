import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
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
              By accessing or using SmartBooks by ReFurrm ("the Service"), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">2. Description of Service</h2>
            <p>
              SmartBooks provides a secure platform for uploading, organizing, and sharing taxx
              documents with your assigned preparer. The Service includes document storage,
              messaging, return preparation tools, and related features.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity on your account. You agree to provide accurate information and
              to use the Service in compliance with all applicable laws.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">4. Preparer Services</h2>
            <p>
              Taxx preparation work performed through the Service is governed by a separate
              engagement letter signed within your dashboard. SmartBooks is the platform; your
              assigned preparer is responsible for the professional work product.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">5. Data and Security</h2>
            <p>
              We use industry-standard encryption (AES-256 at rest, TLS 1.2+ in transit) and
              maintain audit logs of access to your data. See our Privacy Policy for details.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p>
              The Service is provided "as is." To the maximum extent permitted by law, ReFurrm is
              not liable for indirect, incidental, or consequential damages arising from your use
              of the Service.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">7. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after
              changes are posted constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">8. Contact</h2>
            <p>
              Questions about these Terms can be sent to your preparer through the in-app messaging
              feature.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
