import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: " - SkillNests" },
      { name: "description", content: "Terms and Conditions for using skillnests.in" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="relative min-h-screen px-4 py-12 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--rose-gold)/0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-6 text-gradient-gold">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: June 20, 2026
        </p>

        <div className="space-y-10 text-foreground/85 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using skillnests.in ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all visitors, users, and others who access or use the service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">2. Description of Service</h2>
            <p>
              skillnests.in provides an educational platform offering study materials, meeting schedules, past year questions, notes, career guidance, skill-sharing, coding resources, MUN information, and olympiad resources. Some features are available for free; premium features require a paid subscription.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">3. User Accounts</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activities that occur under your account. We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">4. Subscription & Payments</h2>
            <p>
              Premium access is available via a monthly subscription of ₹49. Payments are processed securely through Razorpay. By subscribing, you authorize us to charge the applicable fees. Subscription fees are non-refundable except as described in our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">5. Acceptable Use</h2>
            <p>
              You agree not to misuse the Platform. This includes: uploading harmful content, attempting to gain unauthorized access, interfering with other users, using the service for illegal purposes, or distributing content without permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              All content on the Platform, including text, graphics, logos, and software, is the property of skillnests.in or its content suppliers and is protected by Indian and international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">7. Termination</h2>
            <p>
              We may suspend or terminate your access to the Platform at any time, with or without cause, and with or without notice. Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              skillnests.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the Platform after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:founders@skillnests.in" className="text-rose-gold hover:underline">founders@skillnests.in</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
