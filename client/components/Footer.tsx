'use client'

import Link from 'next/link'
import { Mail, Github, Linkedin, Twitter, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Job Matching', href: '/jobs' },
      { label: 'Talent Network', href: '/register' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Support', href: '/profile' },
      { label: 'Contact', href: '/register-company' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Community', href: '/dashboard' },
      { label: 'API', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
]

const socialIcons = [Github, Linkedin, Twitter]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20" />
      <div className="relative page-shell-wide flex flex-col gap-12">
        <div className="grid gap-10 rounded-[32px] border border-white/5 bg-white/[0.03] p-10 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-white/60">DevConnect</p>
            <h2 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
              Precision hiring infrastructure for engineering-first teams.
            </h2>
            <p className="max-w-xl text-base text-white/70">
              Build a talent graph from live GitHub data, benchmark skills instantly, and spin up curated pipelines in hours—not weeks.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-[999px] px-8">
                  Join the talent network
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register-company">
                <Button variant="secondary" size="lg" className="rounded-[999px] px-8">
                  Start hiring
                </Button>
              </Link>
            </div>
          </div>
          <div className=" rounded-[28px] border border-white/5 bg-black/50 p-8">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Signal Snapshot</p>
            <div className="mt-6 grid gap-6">
              {[
                { label: 'Verified teams', value: '380+', detail: 'B2B SaaS · Fintech · AI' },
                { label: 'Avg. time to offer', value: '9 days', detail: 'From intro to signed offer' },
                { label: 'Developer community', value: '18k+', detail: 'Engineers in our private network' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  <p className="text-sm uppercase tracking-[0.4em] text-white/50">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                  <p className="text-sm text-white/60">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 text-white shadow-[0_10px_40px_rgba(99,102,241,0.45)]">
                DC
              </div>
              <div>
                <p className="text-lg font-semibold text-white">DevConnect</p>
                <p className="text-xs uppercase tracking-[0.5em] text-white/60">Signal first</p>
              </div>
            </div>
            <p className="max-w-md text-sm text-white/70">
              Trusted by engineering leaders shipping global products. DevConnect blends verified source data, human context, and workflow automation to shorten every hiring loop.
            </p>
            <div className="flex gap-3">
              {socialIcons.map((Icon, index) => (
                <a key={index} href="#" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:text-white">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.6em] text-white/60">{group.title}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <a href="mailto:hello@devconnect.io" className="flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4" />
              hello@devconnect.io
            </a>
            <a href="tel:+910987654321" className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4" />
              +91 09876 54321
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Bengaluru · Remote-first
            </span>
          </div>
          <p className="text-xs text-white/50">&copy; {currentYear} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
