'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { companyAPI } from '@/lib/api'
import { Briefcase, FileText, Users, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function CompanyDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'post-job'>(() => {
    const tab = searchParams.get('tab')
    return (tab === 'jobs' || tab === 'applications' || tab === 'post-job') ? tab : 'overview'
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userStr)
    setUser(parsed)
    
    // Check if user has company access
    if (parsed.role !== 'COMPANY' && parsed.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [router])

  // Handle tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'jobs' || tab === 'applications' || tab === 'post-job')) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['companyStats'],
    queryFn: async () => {
      const res = await companyAPI.getStats()
      return res.data
    },
    enabled: !!user && (user.role === 'COMPANY' || user.role === 'ADMIN')
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['companyJobs'],
    queryFn: async () => {
      const res = await companyAPI.getJobs({ page: 1, limit: 100 })
      return res.data
    },
    enabled: !!user && (user.role === 'COMPANY' || user.role === 'ADMIN')
  })

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['companyApplications'],
    queryFn: async () => {
      const res = await companyAPI.getApplications({ page: 1, limit: 10 })
      return res.data
    },
    enabled: activeTab === 'applications' && !!user
  })

  if (!user) return null

  const stats = statsData?.stats || {}
  const recentApplications = statsData?.recentApplications || []

  return (
    <div className="page-shell-wide space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-white/60">Hiring cockpit</p>
        <h1 className="mt-3 text-3xl font-semibold">Company Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage job postings, applications, and market signal in one view.</p>
      </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'jobs', 'applications', 'post-job'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'post-job' ? 'Post Job' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeJobs || 0} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingApplications || 0} pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <p>Loading...</p>
                ) : recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{app.user.name}</p>
                          <p className="text-sm text-muted-foreground">{app.user.email}</p>
                          <p className="text-sm font-medium mt-1">
                            Applied for: {app.job.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No applications yet</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Job Postings</CardTitle>
                  <CardDescription>Manage your posted jobs</CardDescription>
                </div>
                <Button onClick={() => setActiveTab('post-job')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <p>Loading jobs...</p>
              ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobsData.jobs.map((job: any) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${job.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {job.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                        <span>{job.location}</span>
                        <span>{job._count?.applications || 0} applications</span>
                        <span>{job._count?.matches || 0} matches</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${job.id}`}>View Job</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                  <Button onClick={() => setActiveTab('post-job')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>Review and manage job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <p>Loading applications...</p>
              ) : applicationsData?.applications && applicationsData.applications.length > 0 ? (
                <div className="space-y-4">
                  {applicationsData.applications.map((app: any) => (
                    <div key={app.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{app.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{app.user.email}</p>
                          <p className="text-sm font-medium mt-2">
                            Applied for: <span className="font-semibold">{app.job.title}</span> at {app.job.company}
                          </p>
                          {app.user.experience && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {app.user.experience} years experience
                            </p>
                          )}
                          {app.user.location && (
                            <p className="text-xs text-muted-foreground">
                              📍 {app.user.location}
                            </p>
                          )}
                          {app.user.skills && app.user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {app.user.skills.slice(0, 6).map((skill: string) => (
                                <span key={skill} className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <span className={`px-3 py-1 text-xs font-medium rounded ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {app.coverLetter && (
                        <div className="mt-3 p-3 bg-secondary/50 rounded-md">
                          <p className="text-xs font-medium mb-1">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                        </div>
                      )}

                      {/* Status Update Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['PENDING', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((status) => (
                          <Button
                            key={status}
                            variant={app.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={async () => {
                              try {
                                await companyAPI.updateApplicationStatus(app.id, status)
                                window.location.reload()
                              } catch (error: any) {
                                alert(error.response?.data?.message || 'Failed to update status')
                              }
                            }}
                            className={app.status === status ? '' : 'hover:bg-primary/10'}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No applications found</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post-job' && (
          <Card>
            <CardHeader>
              <CardTitle>Post a New Job</CardTitle>
              <CardDescription>Create a new job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Use our comprehensive job posting form to create detailed job listings
                </p>
                <Button asChild>
                  <Link href="/company/post-job">Create Job Posting</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

