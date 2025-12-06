'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { profileAPI, analyticsAPI } from '@/lib/api'
import { Star, GitFork, ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

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
            {profile?.githubUsername && (
              <div className="mt-4 flex items-center gap-2">
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

        {/* Projects - Only for regular users */}
        {userRole !== 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your showcased projects</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.projects && profile.projects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.projects.map((project: any) => (
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
              ) : (
                <p className="text-muted-foreground">No projects yet. Sync your GitHub to get started!</p>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  )
}

