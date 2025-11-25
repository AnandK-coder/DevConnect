'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { jobsAPI, matchingAPI } from '@/lib/api'
import { formatSalary, formatDate } from '@/lib/utils'
import { MapPin, Building, DollarSign, Briefcase, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    }
  }, [])

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await jobsAPI.getJob(id)
      return res.data.job
    }
  })

  const { data: matches } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: async () => {
      const res = await matchingAPI.getAllJobMatches()
      return res.data.matches
    },
    enabled: !!user
  })

  const getMatchScore = () => {
    if (!matches || !jobData) return null
    const match = matches.find((m: any) => m.job.id === jobData.id)
    return match?.match.score
  }

  const handleApply = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setApplying(true)
    try {
      await jobsAPI.applyToJob(id, { coverLetter })
      alert('Application submitted successfully!')
      setCoverLetter('')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!jobData) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>
  }

  const matchScore = getMatchScore()

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <Link href="/jobs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{jobData.title}</CardTitle>
                <CardDescription className="mt-2 text-lg">{jobData.company}</CardDescription>
              </div>
              {matchScore !== undefined && (
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                  {matchScore.toFixed(0)}% match
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {jobData.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{jobData.location}</span>
                  {jobData.remote && <span className="text-primary">(Remote)</span>}
                </div>
              )}
              {jobData.salary && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                  <span>{formatSalary(jobData.salary, jobData.salaryCurrency)}</span>
                </div>
              )}
              {jobData.jobType && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-5 w-5" />
                  <span>{jobData.jobType.replace('_', ' ')}</span>
                </div>
              )}
              {jobData.postedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Posted {formatDate(jobData.postedAt)}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <div className="flex flex-wrap gap-2">
                {jobData.requirements?.map((req: string) => (
                  <span
                    key={req}
                    className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{jobData.description}</p>
            </div>

            {jobData.companyUrl && (
              <Button variant="outline" asChild className="mb-6">
                <Link href={jobData.companyUrl} target="_blank">
                  <Building className="h-4 w-4 mr-2" />
                  Visit Company Website
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Position</CardTitle>
              <CardDescription>Submit your application to {jobData.company}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <textarea
                    id="coverLetter"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell them why you're a great fit..."
                  />
                </div>
                <Button onClick={handleApply} disabled={applying} className="w-full">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You need to be logged in to apply</p>
              <Button asChild>
                <Link href="/login">Login to Apply</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

