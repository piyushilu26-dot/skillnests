import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: " - SkillNests" },
      { name: "description", content: "Privacy Policy for skillnests.in" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: June 20, 2026
        </p>

        <div className="space-y-10 text-foreground/85 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name and email address when you create an account</li>
              <li>Profile information you choose to add</li>
              <li>Payment information (processed securely by Razorpay — we do not store card details)</li>
              <li>Content you upload, post, or share on the Platform</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">2. Automatically Collected Information</h2>
            <p className="mb-3">
              When you access or use our Platform, we automatically collect:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">4. Sharing of Information</h2>
            <p>
              We do not sell your personal information. We may share information with third-party vendors and service providers who need access to such information to carry out work on our behalf, such as payment processing (Razorpay) and hosting services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">5. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is ever fully secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">6. Your Rights</h2>
            <p>
              You may update, correct, or delete your account information at any time by accessing your account settings. You may also contact us to request access to or deletion of your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">7. Children's Privacy</h2>
            <p>
              The Platform is intended for students and learners. If you are under 13, you may only use the Platform with parental consent. We do not knowingly collect personal information from children under 13 without such consent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:founders@skillnests.in" className="text-rose-gold hover:underline">founders@skillnests.in</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
