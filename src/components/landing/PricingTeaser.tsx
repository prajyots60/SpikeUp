import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    blurb: "For trying out SpikeUp",
    features: ["Up to 50 attendees", "Basic analytics", "Email support"],
  },
  {
    name: "Growth",
    price: "$79",
    blurb: "For scaling webinars",
    features: ["Up to 1,000 attendees", "AI co-host", "CRM integrations"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "Advanced security & SSO",
    features: ["Unlimited attendees", "SLA & onboarding", "SSO/SAML"],
  },
];

export default function PricingTeaser() {
  return (
    <section id="pricing" className="py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Start free. Upgrade when you’re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "p-6 rounded-2xl border bg-background " +
                (t.highlight
                  ? "border-accent-primary/60 shadow-lg shadow-accent-primary/10"
                  : "border-border/60")
              }
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-lg">{t.name}</h3>
                <div className="text-2xl font-bold">{t.price}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.blurb}</p>

              <ul className="mt-4 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="text-muted-foreground">
                    • {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={
                  "mt-6 inline-flex w-full justify-center rounded-lg px-4 py-2 font-medium transition-colors " +
                  (t.highlight
                    ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-white"
                    : "border border-border/60 bg-card/50 hover:bg-accent/30")
                }
              >
                Choose {t.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
