import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: " - SkillNests" },
      { name: "description", content: "Get in touch with the skillnests.in team" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
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
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4 text-gradient-gold">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Have questions, feedback, or need support? We&apos;d love to hear from you. Reach out to the skillnests team through any of the channels below.
        </p>

        <div className="grid gap-6 md:grid-cols-1">
          <div className="matte-glass rounded-2xl p-8 flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-gold/10 text-rose-gold">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-foreground mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For general inquiries, support, and feedback
              </p>
              <a
                href="mailto:founders@skillnests.in"
                className="text-rose-gold hover:underline font-medium"
              >
                founders@skillnests.in
              </a>
            </div>
          </div>

          <div className="matte-glass rounded-2xl p-8 flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-gold/10 text-rose-gold">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-foreground mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Available during business hours (Mon–Sat, 10 AM – 6 PM IST)
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="tel:+918210208968"
                  className="text-rose-gold hover:underline font-medium"
                >
                  +91 82102 08968
                </a>
                <a
                  href="tel:+919031456444"
                  className="text-rose-gold hover:underline font-medium"
                >
                  +91 90314 56444
                </a>
              </div>
            </div>
          </div>

          <div className="matte-glass rounded-2xl p-8 flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-gold/10 text-rose-gold">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-foreground mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">
                skillnests.in<br />
                Bihar, Patna, India
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-xl border border-border/50 bg-muted/30">
          <h3 className="font-serif text-lg text-foreground mb-2">Response Time</h3>
          <p className="text-sm text-muted-foreground">
            We typically respond to all inquiries within 24–48 hours during business days. For urgent matters related to payments or account access, please mention "Urgent" in the subject line.
          </p>
        </div>
      </div>
    </main>
  );
}
