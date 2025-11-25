'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'

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
      // Validate password
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

      // Validate company name
      if (formData.name.trim().length < 2) {
        setError('Company name must be at least 2 characters long')
        setLoading(false)
        return
      }

      // Register as company
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'COMPANY',
        website: formData.companyWebsite.trim() || undefined
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Redirect to company dashboard
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
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
    setFieldErrors([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Company Registration</CardTitle>
          <CardDescription className="text-center">
            Create an account to post jobs and find talent
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
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Tech Corp"
                value={formData.name}
                onChange={handleChange('name')}
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register as Company'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/register" className="text-primary hover:underline">
                Register as Job Seeker instead
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

