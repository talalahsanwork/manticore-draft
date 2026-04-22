import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/maticore/Logo";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CalendarClock,
  Building2,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: ClipboardList, title: "Work Order Lifecycle", desc: "Create, assign, and track work from request to completion with full visibility." },
  { icon: CalendarClock, title: "Preventative Maintenance", desc: "Recurring schedules auto-generate work orders so nothing slips through." },
  { icon: Building2, title: "Multi-Tenant Ready", desc: "Each business runs in its own isolated environment with role-based access." },
  { icon: Smartphone, title: "Mobile for Technicians", desc: "Field-friendly views to update status, add notes and photos on the go." },
  { icon: ShieldCheck, title: "Tenant Portal", desc: "Renters submit and track requests in a clean, branded portal." },
  { icon: Sparkles, title: "Built for Modern Teams", desc: "Fast, beautiful, and a fraction of the cost of legacy enterprise tools." },
];

const plans = [
  { name: "Starter", price: 29, features: ["Up to 5 users", "100 work orders/mo", "Email notifications", "Tenant portal"] },
  { name: "Pro", price: 89, popular: true, features: ["Up to 25 users", "Unlimited work orders", "Preventative maintenance", "Asset tracking", "Priority support"] },
  { name: "Business", price: 249, features: ["Unlimited users", "Multi-property", "Advanced reporting", "API access", "Dedicated CSM"] },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#portals" className="hover:text-foreground">Portals</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/app">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/app">Start free trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> The modern OS for property maintenance
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Run maintenance like a{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">world-class team</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Maticore is the multi-tenant SaaS for property managers, technicians, and tenants.
              Work orders, preventative maintenance, and a tenant portal — without the enterprise price tag.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 shadow-elegant">
                <Link to="/app">Try the demo <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/client">Tenant portal</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · Demo data preloaded</p>
          </div>

          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border bg-card/60 p-2 shadow-elegant">
            <div className="rounded-xl bg-gradient-surface p-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="Open work orders" value="124" />
                <Stat label="Avg resolution" value="2.1d" />
                <Stat label="On-time PMs" value="98%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">Purpose-built for smaller property management and facilities teams.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Three portals, one platform</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PortalCard to="/admin" title="Super Admin" desc="Manage all tenant organizations, plans, and platform usage." />
          <PortalCard to="/app" title="Manager & Technician" desc="Run work orders, schedule maintenance, manage assets." featured />
          <PortalCard to="/client" title="Tenant / Client" desc="Submit and track maintenance requests from your unit." />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Simple, scalable pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free for 14 days. Upgrade when you're ready.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-xl border bg-card p-6 ${p.popular ? "border-primary shadow-elegant" : "border-border"}`}>
              {p.popular && <div className="absolute -top-3 left-6 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">Most popular</div>}
              <div className="font-semibold">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={p.popular ? "default" : "outline"}>
                <Link to="/app">Start free trial</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Maticore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function PortalCard({ to, title, desc, featured }: { to: string; title: string; desc: string; featured?: boolean }) {
  return (
    <Link to={to} className={`group rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant ${featured ? "border-primary/50" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
