import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string; githubUsername?: string; role?: string; website?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Profile API
export const profileAPI = {
  getProfile: (id: string) => api.get(`/profile/${id}`),
  updateProfile: (data: any) => api.put('/profile', data),
  syncGitHub: () => api.post('/profile/sync-github'),
  syncLinkedIn: () => api.post('/profile/sync-linkedin'),
  checkLinkedInStatus: () => api.get('/profile/linkedin-status'),
  getProjects: (id: string) => api.get(`/profile/${id}/projects`),
  createProject: (data: any) => api.post('/profile/projects', data),
}

// Jobs API
export const jobsAPI = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJob: (id: string) => api.get(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
  applyToJob: (id: string, data?: { coverLetter?: string }) => 
    api.post(`/jobs/${id}/apply`, data),
}

// Matching API
export const matchingAPI = {
  getJobMatches: (limit?: number) => 
    api.get('/matching/jobs', { params: { limit } }),
  getAllJobMatches: () => api.get('/matching/jobs/all'),
  getCollaborationMatches: (type?: string) =>
    api.get('/matching/collaboration', { params: { type } }),
}

// Analytics API
export const analyticsAPI = {
  getSkillAnalytics: () => api.get('/analytics/skills'),
  getTrends: (params?: any) => api.get('/analytics/trends', { params }),
  getTrending: () => api.get('/analytics/trending'),
  getSalaryInsights: () => api.get('/analytics/salary'),
}

// GitHub API
export const githubAPI = {
  getRepositories: (username: string) => 
    api.get(`/github/repositories/${username}`),
  getProfile: (username: string) => 
    api.get(`/github/profile/${username}`),
  getLanguages: (username: string, repo: string) =>
    api.get(`/github/repositories/${username}/${repo}/languages`),
  getCommits: (username: string, limit?: number) =>
    api.get(`/github/commits/${username}`, { params: { limit } }),
  getCommitActivity: (username: string, days?: number) =>
    api.get(`/github/commits/${username}/activity`, { params: { days } }),
}

// Code Review API
export const codeReviewAPI = {
  requestReview: (data: { projectId: string; repositoryUrl: string; filePath?: string; code?: string }) =>
    api.post('/code-review/request', data),
  getMyReviews: () => api.get('/code-review/my-reviews'),
}

// Payment API
export const paymentAPI = {
  createCheckoutSession: (plan: 'PRO' | 'COMPANY') =>
    api.post('/payment/create-checkout-session', { plan }),
  getSubscription: () => api.get('/payment/subscription'),
}

// GitHub OAuth API
export const githubOAuthAPI = {
  authorize: () => api.get('/github-oauth/authorize'),
}

// LinkedIn OAuth API
export const linkedinOAuthAPI = {
  authorize: () => api.get('/linkedin/authorize'),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getJobs: (params?: any) => api.get('/admin/jobs', { params }),
  updateJobStatus: (id: string, active: boolean) => api.patch(`/admin/jobs/${id}/status`, { active }),
  deleteJob: (id: string) => api.delete(`/admin/jobs/${id}`),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getApplications: (params?: any) => api.get('/admin/applications', { params }),
  updateApplicationStatus: (id: string, status: string) => api.patch(`/admin/applications/${id}/status`, { status }),
}

// Company API
export const companyAPI = {
  getStats: () => api.get('/company/stats'),
  getJobs: (params?: any) => api.get('/company/jobs', { params }),
  createJob: (data: any) => api.post('/company/jobs', data),
  getApplications: (params?: any) => api.get('/company/applications', { params }),
  updateApplicationStatus: (id: string, status: string) => api.patch(`/company/applications/${id}/status`, { status }),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
}

export default api

