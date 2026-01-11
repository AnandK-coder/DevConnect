'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { profileAPI, analyticsAPI, githubAPI, linkedinOAuthAPI } from '@/lib/api'
import { Star, GitFork, ExternalLink, Github, GitCommit, Calendar, Clock, Linkedin, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import CommitActivityChart from '@/components/CommitActivityChart'

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [expandedCommits, setExpandedCommits] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState(false)
  const [linkedinStatus, setLinkedinStatus] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setUserId(user.id)
    setUserRole(user.role || 'USER')
  }, [router])

  // Check LinkedIn status
  useEffect(() => {
    async function checkStatus() {
      if (!userId) return
      try {
        const response = await profileAPI.checkLinkedInStatus()
        setLinkedinStatus(response.data)
      } catch (error) {
        console.error('Error checking LinkedIn status:', error)
      }
    }
    checkStatus()
  }, [userId])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const res = await profileAPI.getProfile(userId)
      return res.data.user
    },
    enabled: !!userId
  })

  const { data: skillAnalytics } = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: async () => {
      const res = await analyticsAPI.getSkillAnalytics()
      return res.data.analytics
    },
    enabled: userRole !== 'ADMIN' // Don't fetch analytics for admins
  })

  const { data: commits, isLoading: commitsLoading } = useQuery({
    queryKey: ['commits', profile?.githubUsername],
    queryFn: async () => {
      if (!profile?.githubUsername) return null
      const res = await githubAPI.getCommits(profile.githubUsername, 20)
      return res.data.commits
    },
    enabled: !!profile?.githubUsername && userRole !== 'ADMIN'
  })

  const { data: commitActivity } = useQuery({
    queryKey: ['commitActivity', profile?.githubUsername],
    queryFn: async () => {
      if (!profile?.githubUsername) return null
      const res = await githubAPI.getCommitActivity(profile.githubUsername, 30)
      return res.data.activity
    },
    enabled: !!profile?.githubUsername && userRole !== 'ADMIN'
  })

  if (!userId || profileLoading) return null

  return (
    <div className="page-shell-wide space-y-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{profile?.name}</CardTitle>
                <CardDescription className="mt-2">
                  {profile?.location && <span>{profile.location} • </span>}
                  {profile?.experience || 0} years of experience
                </CardDescription>
                {profile?.bio && (
                  <p className="mt-4 text-muted-foreground">{profile.bio}</p>
                )}
              </div>
              <Button onClick={() => router.push('/profile/edit')}>
                Edit Profile
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {profile?.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <Link
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    @{profile.githubUsername}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await profileAPI.syncGitHub()
                        alert(`Successfully synced ${response.data.syncedProjects} repositories!`)
                        window.location.reload()
                      } catch (error: any) {
                        alert(error.response?.data?.message || 'Failed to sync GitHub repositories')
                      }
                    }}
                  >
                    Sync GitHub
                  </Button>
                </div>
              )}
              
              {/* LinkedIn Connection */}
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5" />
                {profile?.linkedin ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`https://www.linkedin.com/in/${profile.linkedin}`}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        LinkedIn Connected
                      </Link>
                      {linkedinStatus?.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          linkedinStatus.status.tokenExpired ? 'bg-yellow-100 text-yellow-800' :
                          linkedinStatus.status.hasSyncedProfile ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {linkedinStatus.status.tokenExpired ? '⏰ Token Expired' :
                           linkedinStatus.status.hasSyncedProfile ? '✅ Synced' :
                           '⏳ Pending Sync'}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await profileAPI.syncLinkedIn()
                          alert(response.data.message || 'LinkedIn profile synced successfully!')
                          window.location.reload()
                        } catch (error: any) {
                          const errorMessage = error.response?.data?.message || 'Failed to sync LinkedIn profile.'
                          if (error.response?.data?.requiresReauth) {
                            // Token expired, redirect to OAuth
                            try {
                              const authResponse = await linkedinOAuthAPI.authorize()
                              window.location.href = authResponse.data.authUrl
                            } catch (authError: any) {
                              alert('Please reconnect your LinkedIn account using the "Connect LinkedIn" button.')
                            }
                          } else {
                            alert(errorMessage)
                          }
                        }
                      }}
                    >
                      {linkedinStatus?.status?.tokenExpired ? 'Reconnect LinkedIn' : 'Sync LinkedIn'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await linkedinOAuthAPI.authorize()
                        window.location.href = response.data.authUrl
                      } catch (error: any) {
                        alert(error.response?.data?.message || 'Failed to initiate LinkedIn connection')
                      }
                    }}
                  >
                    Connect LinkedIn
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Message */}
        {userRole === 'ADMIN' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>You are logged in as an administrator</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This profile page is designed for regular users. As an admin, you can manage the platform from the Admin Dashboard.
              </p>
              <Button asChild>
                <Link href="/admin">Go to Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Skill Analytics - Only for regular users */}
        {userRole !== 'ADMIN' && skillAnalytics && skillAnalytics.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Skill Analytics</CardTitle>
              <CardDescription>Your proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillAnalytics.slice(0, 10).map((skill: any) => (
                  <div key={skill.skill}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-sm text-muted-foreground">
                        {skill.proficiency.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commit Activity Chart */}
        {userRole !== 'ADMIN' && profile?.githubUsername && commitActivity && (
          <CommitActivityChart activity={commitActivity} />
        )}

        {/* GitHub Commits - Only for regular users */}
        {userRole !== 'ADMIN' && profile?.githubUsername && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Recent GitHub Commits</CardTitle>
                  <CardDescription>
                    Your latest code contributions
                    {commitActivity && (
                      <span className="ml-2 text-primary">
                        • {commitActivity.totalCommits} commits in last 30 days
                      </span>
                    )}
                  </CardDescription>
                </div>
                {commits && commits.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedCommits(!expandedCommits)}
                    className="flex items-center gap-2"
                  >
                    {expandedCommits ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>View All ({commits.length})</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {commitsLoading ? (
                <p className="text-muted-foreground">Loading commits...</p>
              ) : commits && commits.length > 0 ? (
                <div className="space-y-3">
                  {(expandedCommits ? commits : commits.slice(0, 5)).map((commit: any) => (
                    <div
                      key={commit.sha}
                      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <GitCommit className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm font-medium truncate">{commit.message}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Github className="h-3 w-3" />
                              <span className="truncate">{commit.repository}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(commit.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{commit.author}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {commits.length > 5 && !expandedCommits && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      +{commits.length - 5} more commits
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No commits found. Make sure your repositories are public.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects - Only for regular users */}
        {userRole !== 'ADMIN' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Your showcased projects
                    {profile?.projects && profile.projects.length > 0 && (
                      <span className="ml-2 text-primary">
                        • {profile.projects.length} total
                      </span>
                    )}
                  </CardDescription>
                </div>
                {profile?.projects && profile.projects.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedProjects(!expandedProjects)}
                    className="flex items-center gap-2"
                  >
                    {expandedProjects ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>View All ({profile.projects.length})</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profile?.projects && profile.projects.length > 0 ? (
                <div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedProjects ? profile.projects : profile.projects.slice(0, 6)).map((project: any) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.techStack?.slice(0, 3).map((tech: string) => (
                              <span
                                key={tech}
                                className="px-2 py-1 text-xs rounded-md bg-secondary"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              <span>{project.stars}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="h-4 w-4" />
                              <span>{project.forks}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={project.githubUrl} target="_blank">
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                              </Link>
                            </Button>
                            {project.liveUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={project.liveUrl} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Live Demo
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {profile.projects.length > 6 && !expandedProjects && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      +{profile.projects.length - 6} more projects
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No projects yet. Sync your GitHub to get started!</p>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  )
}

