'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminAPI } from '@/lib/api'
import { Users, Briefcase, FileText, Code, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'users' | 'applications'>('overview')
  const [userSearch, setUserSearch] = useState('')
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all')
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('all')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userStr)
    setUser(parsed)
    
    // Check if user has admin access
    if (parsed.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [router])

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await adminAPI.getStats()
      return res.data
    },
    enabled: !!user && user.role === 'ADMIN'
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['adminJobs', activeTab, jobStatusFilter],
    queryFn: async () => {
      const res = await adminAPI.getJobs({ 
        status: jobStatusFilter === 'all' ? undefined : jobStatusFilter,
        page: 1,
        limit: 20
      })
      return res.data
    },
    enabled: activeTab === 'jobs' && !!user
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', userSearch],
    queryFn: async () => {
      const res = await adminAPI.getUsers({ 
        page: 1, 
        limit: 20,
        search: userSearch || undefined
      })
      return res.data
    },
    enabled: activeTab === 'users' && !!user
  })

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['adminApplications', applicationStatusFilter],
    queryFn: async () => {
      const res = await adminAPI.getApplications({ 
        page: 1, 
        limit: 20,
        status: applicationStatusFilter === 'all' ? undefined : applicationStatusFilter
      })
      return res.data
    },
    enabled: activeTab === 'applications' && !!user
  })

  if (!user) return null

  const stats = statsData?.stats || {}
  const recentUsers = statsData?.recentUsers || []

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage jobs, users, and applications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'jobs', 'users', 'applications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs || 0}</div>
                  <p className="text-xs text-muted-foreground">of {stats.totalJobs || 0} total</p>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">Showcased projects</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <p>Loading...</p>
                ) : recentUsers.length > 0 ? (
                  <div className="space-y-4">
                    {recentUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'COMPANY' ? 'bg-blue-100 text-blue-800' :
                              'bg-secondary'
                            }`}>
                              {u.role || 'USER'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-secondary">{u.subscription}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No users yet</p>
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
                  <CardTitle>All Jobs</CardTitle>
                  <CardDescription>Manage job postings</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Jobs</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <Button asChild variant="outline">
                    <Link href="/jobs">View Public</Link>
                  </Button>
                </div>
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
                        <span>📍 {job.location}</span>
                        {job.remote && <span className="text-primary">🌐 Remote</span>}
                        <span>📄 {job._count?.applications || 0} applications</span>
                        <span>🎯 {job._count?.matches || 0} matches</span>
                        {job.jobType && <span>💼 {job.jobType.replace('_', ' ')}</span>}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await adminAPI.updateJobStatus(job.id, !job.active)
                              queryClient.invalidateQueries({ queryKey: ['adminJobs'] })
                              queryClient.invalidateQueries({ queryKey: ['adminStats'] })
                            } catch (error: any) {
                              alert(error.response?.data?.message || 'Failed to update job')
                            }
                          }}
                        >
                          {job.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/jobs/${job.id}`}>View</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                              try {
                                await adminAPI.deleteJob(job.id)
                                queryClient.invalidateQueries({ queryKey: ['adminJobs'] })
                                queryClient.invalidateQueries({ queryKey: ['adminStats'] })
                              } catch (error: any) {
                                alert(error.response?.data?.message || 'Failed to delete job')
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No jobs found</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage users</CardDescription>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <p>Loading users...</p>
              ) : usersData?.users && usersData.users.length > 0 ? (
                <div className="space-y-4">
                  {usersData.users.map((u: any) => (
                    <div key={u.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{u.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'COMPANY' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role || 'USER'}
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-secondary">{u.subscription}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          {u.location && (
                            <p className="text-xs text-muted-foreground mt-1">📍 {u.location}</p>
                          )}
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground">
                              📁 {u._count?.projects || 0} projects
                            </span>
                            <span className="text-muted-foreground">
                              📄 {u._count?.applications || 0} applications
                            </span>
                            <span className="text-muted-foreground">
                              🎯 {u._count?.jobMatches || 0} matches
                            </span>
                            {u.experience > 0 && (
                              <span className="text-muted-foreground">
                                💼 {u.experience} years exp
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            asChild
                          >
                            <Link href={`/profile/${u.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No users found</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>Review and manage job applications</CardDescription>
                </div>
                <select
                  value={applicationStatusFilter}
                  onChange={(e) => setApplicationStatusFilter(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <p>Loading applications...</p>
              ) : applicationsData?.applications && applicationsData.applications.length > 0 ? (
                <div className="space-y-4">
                  {applicationsData.applications.map((app: any) => (
                    <div key={app.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{app.user.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded ${
                              app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                              app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{app.user.email}</p>
                          <p className="text-sm font-medium mt-2">
                            Applied for: <span className="font-semibold">{app.job.title}</span> at {app.job.company}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            📅 {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {app.coverLetter && (
                        <div className="mt-3 p-3 bg-secondary/50 rounded-md">
                          <p className="text-xs font-medium mb-1">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{app.coverLetter}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {['PENDING', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((status) => (
                          <Button
                            key={status}
                            variant={app.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={async () => {
                              try {
                                await adminAPI.updateApplicationStatus(app.id, status)
                                queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
                                queryClient.invalidateQueries({ queryKey: ['adminStats'] })
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
      </div>
    </div>
  )
}

