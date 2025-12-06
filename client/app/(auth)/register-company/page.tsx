'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { Building2, Star, Target, Users } from 'lucide-react'

const metrics = [
  { label: 'Average time-to-hire', value: '12 days', detail: 'From qualified intro to signed offer' },
  { label: 'Signal coverage', value: '40+', detail: 'Data points tracked per candidate' },
]

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyWebsite: ''
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
        setLoading(false)
        return
      }

      if (formData.name.trim().length < 2) {
        setError('Company name must be at least 2 characters long')
        setLoading(false)
        return
      }

      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'COMPANY',
        website: formData.companyWebsite.trim() || undefined
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/company')
    } catch (err: any) {
      const responseErrors = err.response?.data?.errors
      if (Array.isArray(responseErrors) && responseErrors.length > 0) {
        setFieldErrors(responseErrors.map((e: any) => e.msg || e.message || String(e)))
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
    setFieldErrors([])
  }

  return (
    <section className="page-shell-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.6em] text-white/60">
          <Building2 className="h-4 w-4" />
          HIRING HQ
        </span>
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
            Spin up a precision hiring pod. Reach verified developers without cold outreach.
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            DevConnect pairs your role with builders who already match your stack velocity, product stage, and collaboration rituals. Recruiters get full signal dossiers—not resumes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              <p className="text-sm text-white/60">{metric.detail}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Users className="h-4 w-4 text-sky-300" />
            <span>18k vetted builders</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Target className="h-4 w-4 text-amber-300" />
            <span>Role calibration in 24h</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Star className="h-4 w-4 text-pink-300" />
            <span>Zero spam guarantee</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl text-center">Company Registration</CardTitle>
          <CardDescription className="text-center text-white/70 text-base">
            Create a control tower for your hiring pod. Post roles, review signals, ship offers faster.
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
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., HyperScale Labs"
                value={formData.name}
                onChange={handleChange('name')}
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email">Company Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                minLength={8}
              />
              <p className="text-xs text-white/60">
                Must include uppercase, lowercase, number, and be 8+ characters.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="companyWebsite">Company Website (Optional)</Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://example.com"
                value={formData.companyWebsite}
                onChange={handleChange('companyWebsite')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-5">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register as Company'}
            </Button>
            <div className="text-center text-sm text-white/70">
              Already have an account?{' '}
              <Link href="/login" className="text-white underline underline-offset-4">
                Login
              </Link>
            </div>
            <div className="text-center text-sm text-white/70">
              Hiring for yourself?{' '}
              <Link href="/register" className="text-white underline underline-offset-4">
                Register as a job seeker instead
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  )
}

