'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { CheckCircle2, Shield, Sparkles } from 'lucide-react'

const highlights = [
  {
    label: 'Verified intros',
    value: '2 per week',
    detail: 'Average warm intros for active users',
  },
  {
    label: 'Signals tracked',
    value: '14',
    detail: 'GitHub, projects, velocity & more',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      const user = response.data.user
      if (user.role === 'ADMIN') {
        router.push('/admin')
      } else if (user.role === 'COMPANY') {
        router.push('/company')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('🔴 Login failed:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err.message
      })
      setError(err.response?.data?.message || 'Login failed - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-shell-wide grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.5em] text-white/60">
          <Sparkles className="h-4 w-4" />
          SIGNAL LOGIN
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
            Re-enter the DevConnect workspace and pick up right where your matching engine left off.
          </h1>
          <p className="text-base text-white/70">
            A single login gives you curated intros, live analytics, and an always-on profile powering every recruiter conversation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              <p className="text-sm text-white/60">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Shield className="h-5 w-5 text-emerald-400" />
          <p>Protected by device fingerprinting + adaptive MFA</p>
        </div>
      </div>

      <Card className="w-full max-w-xl shadow-[0_25px_80px_rgba(15,23,42,0.7)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription className="text-white/70 text-base">
            Enter your credentials to unlock your personal command center
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
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
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Enter workspace'}
            </Button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.4em]">New here?</p>
              </div>
              <p className="mt-2 text-sm">
                <Link href="/register" className="text-white underline underline-offset-4">
                  Create a candidate profile
                </Link>{' '}
                or{' '}
                <Link href="/register-company" className="text-white underline underline-offset-4">
                  register your company
                </Link>{' '}
                to access the hiring cockpit.
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  )
}

