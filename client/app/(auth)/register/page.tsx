'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || fieldErrors.length > 0) && (
              <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error && <p className="font-medium">{error}</p>}
                {fieldErrors.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-destructive text-xs">
                    {fieldErrors.map((errMsg) => (
                      <li key={errMsg}>{errMsg}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                pattern="^[a-zA-Z\s]+$"
                title="Name can only include letters and spaces"
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                title="Minimum 8 characters with uppercase, lowercase, and a number"
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>
            <div className="space-y-2">
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center space-y-2">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
              <p className="text-muted-foreground">
                Want to post jobs?{' '}
                <Link href="/register-company" className="text-primary hover:underline">
                  Register as Company
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

