'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { companyAPI } from '@/lib/api'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function PostJobPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  
  // Initialize form with user's company name
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const parsed = JSON.parse(userStr)
      setUser(parsed)
      setFormData(prev => ({
        ...prev,
        company: parsed.name || ''
      }))
    }
  }, [])
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    remote: false,
    salary: '',
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: '',
    companyUrl: '',
    requirements: [] as string[],
    requirementInput: ''
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (formData.requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, prev.requirementInput.trim()],
        requirementInput: ''
      }))
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.title || !formData.company || !formData.description || !formData.location) {
        setError('Please fill all required fields')
        setLoading(false)
        return
      }

      if (formData.requirements.length === 0) {
        setError('Please add at least one requirement')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        remote: formData.remote,
        requirements: formData.requirements,
        salary: formData.salary ? parseInt(formData.salary) : undefined,
        salaryCurrency: formData.salaryCurrency,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel || undefined,
        companyUrl: formData.companyUrl || undefined
      }

      await companyAPI.createJob(payload)
      setSuccess('Job posted successfully!')
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] })
      queryClient.invalidateQueries({ queryKey: ['companyStats'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] }) // Also invalidate public jobs list
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/company?tab=jobs')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <Link href="/company">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a New Job</CardTitle>
            <CardDescription>Create a job posting to attract top talent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
                  {success}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={handleChange('title')}
                      placeholder="e.g., Senior Full Stack Developer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={handleChange('company')}
                      placeholder="e.g., Tech Corp"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange('description')}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>
              </div>

              {/* Location & Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location & Type</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={handleChange('location')}
                      placeholder="e.g., San Francisco, CA"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <select
                      id="jobType"
                      value={formData.jobType}
                      onChange={handleChange('jobType')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={formData.remote}
                    onChange={handleChange('remote')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="remote" className="cursor-pointer">
                    Remote work available
                  </Label>
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation</h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleChange('salary')}
                      placeholder="e.g., 120000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <select
                      id="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleChange('salaryCurrency')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange('experienceLevel')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Mid-level</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements *</h3>
                
                <div className="flex gap-2">
                  <Input
                    value={formData.requirementInput}
                    onChange={handleChange('requirementInput')}
                    placeholder="e.g., React, Node.js, 3+ years experience"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRequirement()
                      }
                    }}
                  />
                  <Button type="button" onClick={addRequirement} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyUrl">Company Website (Optional)</Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    value={formData.companyUrl}
                    onChange={handleChange('companyUrl')}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/company')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

