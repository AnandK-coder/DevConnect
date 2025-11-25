'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jobsAPI, matchingAPI } from '@/lib/api'
import { formatSalary } from '@/lib/utils'
import { MapPin, Building, DollarSign, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState<string>('')
  const [jobType, setJobType] = useState<string>('')
  const [experienceLevel, setExperienceLevel] = useState<string>('')
  const [minSalary, setMinSalary] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', search, location, remote, jobType, experienceLevel, minSalary],
    queryFn: async () => {
      try {
        const res = await jobsAPI.getJobs({ 
          search, 
          location, 
          remote,
          jobType: jobType || undefined,
          experienceLevel: experienceLevel || undefined,
          minSalary: minSalary || undefined
        })
        return res.data
      } catch (err: any) {
        console.error('Jobs API Error:', err)
        throw err
      }
    }
  })

  const { data: matches } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: async () => {
      const res = await matchingAPI.getAllJobMatches()
      return res.data.matches
    }
  })

  const getMatchScore = (jobId: string) => {
    const match = matches?.find((m: any) => m.job.id === jobId)
    return match?.match.score
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
          <p className="text-muted-foreground">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Main Search */}
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search jobs, skills, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="md:col-span-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full"
                >
                  {showFilters ? 'Hide' : 'Show'} Advanced Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Remote</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={remote}
                      onChange={(e) => setRemote(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="true">Remote</option>
                      <option value="false">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      <option value="">Any Level</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Mid-level</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Salary</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(search || location || remote || jobType || experienceLevel || minSalary) && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setLocation('')
                      setRemote('')
                      setJobType('')
                      setExperienceLevel('')
                      setMinSalary('')
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading jobs...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-destructive">Error loading jobs</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'Please try again later'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobsData.jobs.map((job: any) => {
              const matchScore = getMatchScore(job.id)
              return (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">{job.company}</CardDescription>
                      </div>
                      {matchScore !== undefined && (
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {matchScore.toFixed(0)}% match
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                          {job.remote && <span className="text-primary">(Remote)</span>}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatSalary(job.salary, job.salaryCurrency)}</span>
                        </div>
                      )}
                      {job.jobType && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{job.jobType.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 5).map((req: string) => (
                        <span
                          key={req}
                          className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                    <Button asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No jobs found</p>
                {(!search && !location && !remote) ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No jobs available yet. Jobs will appear here once they are posted.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      To seed sample jobs, run: <code className="px-2 py-1 bg-secondary rounded">cd server && npm run seed:jobs</code>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search filters or check back later for new opportunities.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

