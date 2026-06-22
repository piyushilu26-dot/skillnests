import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: " - SkillNests" },
      { name: "description", content: "Refund and Cancellation Policy for skillnests.in" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
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
          Refund Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: June 20, 2026
        </p>

        <div className="space-y-10 text-foreground/85 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">1. Subscription Overview</h2>
            <p>
              skillnests.in offers premium access through a monthly subscription of ₹49. Your subscription grants you access to premium features for 30 days from the date of payment.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">2. Cancellation</h2>
            <p>
              You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of the paid period.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">3. No Refunds</h2>
            <p>
              All purchases on skillnests.in are final. We do not offer refunds under any circumstances, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Change of mind after purchase</li>
              <li>Failure to use the service during the subscription period</li>
              <li>Technical issues (our support team will assist you to resolve them)</li>
              <li>Accidental purchase</li>
              <li>Violation of Terms of Service resulting in account suspension</li>
              <li>Requests made at any time after purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">4. Duplicate Charges</h2>
            <p>
              If you were charged more than once for the same billing period due to a system error, contact us at{" "}
              <a href="mailto:founders@skillnests.in" className="text-rose-gold hover:underline">founders@skillnests.in</a>{" "}
              within 7 days. We will investigate and issue a refund for the duplicate amount only if verified as a system error.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-3">5. Contact</h2>
            <p>
              For billing-related queries, please reach out to us at{" "}
              <a href="mailto:founders@skillnests.in" className="text-rose-gold hover:underline">founders@skillnests.in</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
