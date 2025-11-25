import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Briefcase,
  Code,
  Gauge,
  Sparkles,
  Users,
  ShieldCheck,
  BarChart3
} from 'lucide-react'

const stats = [
  { label: 'Verified roles', value: '2.4k+' },
  { label: 'Matched devs', value: '18k+' },
  { label: 'Avg. time to offer', value: '9 days' },
]

const features = [
  {
    title: 'Living portfolio hub',
    description: 'Sync GitHub, pull key repos, and render interactive sandboxes with one click.',
    icon: Code,
  },
  {
    title: 'Precision AI matching',
    description: 'Blend skills, preferences, and growth goals to surface roles that actually fit.',
    icon: Sparkles,
  },
  {
    title: 'Trust & visibility',
    description: 'Secure talent profiles with fraud detection and recruiter-grade insights.',
    icon: ShieldCheck,
  },
  {
    title: 'Career intelligence',
    description: 'Live salary bands, demand signals, and seniority benchmarks across markets.',
    icon: BarChart3,
  },
]

const testimonials = [
  {
    quote:
      'DevConnect felt like having a technical recruiter in my pocket. I went from profile to offer with two curated intros.',
    author: 'Aarav Sharma',
    title: 'Senior Frontend Engineer · Bengaluru',
  },
  {
    quote:
      'The portfolio insights and skill deltas made my interviews effortless. Recruiters already knew where I could add impact.',
    author: 'Meera Iyer',
    title: 'Staff Product Engineer · Berlin',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.25),_transparent_60%)]" />
      </div>

      <main className="relative">
        {/* Hero */}
        <section className="container mx-auto px-6 pt-28 pb-20">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium tracking-wide text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                Beta Access · Matching Engine v2.4
              </span>

              <div className="space-y-6">
                <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Where elite developers meet precision job matching.
                </h1>
                <p className="text-lg text-white/70 sm:text-xl">
                  Showcase signal-rich portfolios, quantify your skills, and let DevConnect’s AI route you to roles where you’ll have disproportionate impact.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-14 rounded-full px-8 text-base font-semibold shadow-[0_20px_60px_rgba(59,130,246,0.35)]">
                  <Link href="/register">
                    Build your profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-white/30 bg-white/10 px-8 text-base font-semibold text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Link href="/jobs">Explore live roles</Link>
                </Button>
              </div>

              <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3rem] text-white/60">Signal that matters</p>
                <div className="grid gap-6 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div key={item.label}>
                      <p className="text-3xl font-semibold text-white">{item.value}</p>
                      <p className="text-sm text-white/60">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel relative rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl">
                <div className="mb-8 flex items-center justify-between text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    Live matching session
                  </div>
                  <span>Realtime</span>
                </div>
                <div className="space-y-4">
                  {['Skill graph', 'Team match', 'Culture fit', 'Impact potential'].map((item, index) => (
                    <div key={item} className="rounded-2xl bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{item}</span>
                        <span>{80 + index * 4}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${80 + index * 4}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-5 text-sm text-white/70">
                  “Your profile resonates with high-growth AI platform teams. We’ve unlocked 4 warm intros.”
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.35rem] text-white/50">Trusted by teams shipping at scale</p>
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
                  <span className="font-semibold text-white">Nebula Labs</span>
                  <span>Pulse Health</span>
                  <span>Northwind AI</span>
                  <span>Hyperion</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-6 pb-20">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4rem] text-white/50">Why DevConnect</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              A single command center for your developer brand, data, and pipeline.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-base text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Insights & Spotlight */}
        <section className="container mx-auto grid gap-10 px-6 pb-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4rem] text-white/50">
              <Gauge className="h-4 w-4" />
              Intelligent insights
            </div>
            <h3 className="mt-4 text-3xl font-semibold text-white">Real-time market radar for your stack.</h3>
            <div className="mt-10 grid gap-8">
              {[
                {
                  label: 'Emerging demand',
                  value: '+38% YoY',
                  detail: 'AI infrastructure & WebGPU roles across EMEA',
                },
                {
                  label: 'Top leverage skills',
                  value: 'Rust · Next.js · LangChain',
                  detail: 'Interview-to-offer rate up 26% this quarter',
                },
                {
                  label: 'Signals unlocked',
                  value: '12',
                  detail: 'Live code reviews, OSS influence, build speed, and more',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.3rem] text-white/50">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-white/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 to-purple-600/20 p-8 text-white backdrop-blur">
            <p className="text-sm uppercase tracking-[0.4rem] text-white/70">Job spotlight</p>
            <h3 className="mt-4 text-3xl font-semibold">Principal Platform Engineer · Remote-first</h3>
            <p className="mt-4 text-white/80">
              Lead the developer experience org for a Series C AI tooling company. Shape infra, influence architecture, mentor senior ICs.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>Compensation</span>
                <span className="font-semibold">$320k – $380k + equity</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>Stack</span>
                <span className="font-semibold">Rust · TypeScript · GraphQL · GCP</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>Signal fit</span>
                <span className="font-semibold text-emerald-300">92% match</span>
              </div>
            </div>
            <Button asChild size="lg" className="mt-8 w-full rounded-2xl text-base font-semibold">
              <Link href="/jobs">See curated matches</Link>
            </Button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-6 pb-24">
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur">
            <div className="flex flex-col gap-10 lg:flex-row">
              <div className="lg:max-w-sm">
                <p className="text-sm uppercase tracking-[0.4rem] text-white/50">Human signal + AI</p>
                <h3 className="mt-4 text-3xl font-semibold text-white">DevConnect curates introductions that convert.</h3>
              </div>
              <div className="grid flex-1 gap-6 md:grid-cols-2">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.author} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-lg text-white/90">“{testimonial.quote}”</p>
                    <div className="mt-6 text-sm text-white/70">
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p>{testimonial.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-primary/30 via-indigo-700/30 to-purple-700/30 p-10 text-center text-white">
            <div className="absolute inset-0 opacity-30 blur-3xl">
              <div className="absolute left-1/4 top-0 h-56 w-56 rounded-full bg-primary" />
              <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-purple-500" />
            </div>
            <div className="relative space-y-6">
              <p className="text-sm uppercase tracking-[0.4rem] text-white/70">One-profile launch</p>
              <h3 className="text-4xl font-semibold leading-tight">
                Launch a polished developer brand in minutes. Let DevConnect guide the rest.
              </h3>
              <p className="text-lg text-white/80">
                Advanced analytics, recruiter-ready collateral, and AI-matched intros—bundled into a single workspace.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="h-14 rounded-full px-10 text-base font-semibold">
                  <Link href="/register">Claim your seat</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-white/40 bg-white/10 px-10 text-base font-semibold text-white hover:bg-white/20 backdrop-blur-sm">
                  <Link href="/register-company">Post Jobs</Link>
                </Button>
              </div>
              <p className="text-sm text-white/60 mt-4">
                For companies: <Link href="/register-company" className="text-white hover:underline">Register to post jobs</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

