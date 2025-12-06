'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { ArrowRight, Sparkles, Trophy } from 'lucide-react'

const benefits = [
  'Auto-sync GitHub and highlight your standout repositories',
  'Get weekly signal reports and market-calibrated salary bands',
  'Unlock curated intros to teams that match your build style',
]

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    githubUsername: ''
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const passwordPattern = useMemo(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors([])
    setLoading(true)

    try {
      if (!passwordPattern.test(formData.password)) {
        setError('Password does not meet the requirements.')
        setFieldErrors([
          'At least 8 characters',
          'Include one uppercase letter',
          'Include one lowercase letter',
          'Include one number'
        ])
        return
      }

      const response = await authAPI.register(formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      const responseErrors = err.response?.data?.errors
      if (Array.isArray(responseErrors) && responseErrors.length > 0) {
        setFieldErrors(responseErrors.map((e: any) => e.msg || e.message))
        setError(err.response?.data?.message || 'Validation failed')
      } else {
        setError(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-shell-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.6em] text-white/60">
          <Sparkles className="h-4 w-4" />
          BUILD MODE
        </span>
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
            Craft a living, breathing portfolio. Let DevConnect turn your work into warm offers.
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            Create a signal-rich profile that blends GitHub telemetry, project impact, velocity, and collaboration proof.
            We route those signals to product-first teams ready to ship with you.
          </p>
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.5em] text-white/60">Why builders choose DevConnect</p>
          <ul className="space-y-3 text-sm text-white/80">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <ArrowRight className="mt-0.5 h-4 w-4 text-emerald-300" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.5em] text-white/40">Avg. match score</p>
            <p className="text-2xl font-semibold text-white">91%</p>
            <p className="text-white/60">after 5 repos synced</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.5em] text-white/40">Interview prep</p>
            <p className="text-2xl font-semibold text-white">Auto</p>
            <p className="text-white/60">Generated from your code history</p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl">Create your profile</CardTitle>
          <CardDescription className="text-white/70 text-base">
            Only invite-only teams and top-tier builders. No spam, no blind outreach.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {(error || fieldErrors.length > 0) && (
              <div className="space-y-2 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-100">
                {error && <p className="font-medium">{error}</p>}
                {fieldErrors.length > 0 && (
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {fieldErrors.map((errMsg) => (
                      <li key={errMsg}>{errMsg}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="space-y-3">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                pattern="^[a-zA-Z\\s]+$"
                title="Name can only include letters and spaces"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Strong passwords only"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"
                title="Minimum 8 characters with uppercase, lowercase, and a number"
              />
              <p className="text-xs text-white/60">
                Use at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="githubUsername">GitHub Username (Optional)</Label>
              <Input
                id="githubUsername"
                type="text"
                placeholder="johndoe"
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-5">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Launch my profile'}
            </Button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">
              <div className="flex items-center gap-2 text-amber-300">
                <Trophy className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.4em]">Returning?</p>
              </div>
              <p className="mt-2">
                Already inside DevConnect?{' '}
                <Link href="/login" className="text-white underline underline-offset-4">
                  Log in here
                </Link>
                . Hiring manager?{' '}
                <Link href="/register-company" className="text-white underline underline-offset-4">
                  Register your company
                </Link>
                .
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  )
}

