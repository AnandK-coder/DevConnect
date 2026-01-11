const { Octokit } = require('octokit');

/**
 * Initialize Octokit with user's token or app credentials
 */
function getOctokit(token = null) {
  if (token) {
    return new Octokit({ auth: token });
  }
  
  // Use app credentials if available
  const appToken = process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET;
  if (!appToken || appToken === 'your-github-token' || appToken === 'your_github_token') {
    throw new Error('GitHub token not configured. Please set a valid GITHUB_TOKEN in environment variables. You can generate a Personal Access Token from https://github.com/settings/tokens');
  }
  
  return new Octokit({ auth: appToken });
}

/**
 * Get user's GitHub repositories
 */
async function getUserRepositories(username, token = null) {
  try {
    // Check if we have a token before making API call
    if (!token && !process.env.GITHUB_TOKEN && !process.env.GITHUB_CLIENT_SECRET) {
      console.warn('GitHub token not configured. Cannot fetch repositories.');
      return [];
    }

    const octokit = getOctokit(token);
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
      type: 'all'
    });

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      languagesUrl: repo.languages_url,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      isPrivate: repo.private,
      homepage: repo.homepage
    }));
  } catch (error) {
    console.error('GitHub API Error:', error);
    
    // Handle authentication errors gracefully
    if (error.status === 401 || error.message?.includes('Bad credentials')) {
      console.warn('GitHub authentication failed. Token may be invalid or expired.');
      return []; // Return empty array instead of throwing
    }
    
    // For other errors, return empty array to allow app to continue
    return [];
  }
}

/**
 * Get repository languages
 */
async function getRepositoryLanguages(username, repoName, token = null) {
  try {
    const octokit = getOctokit(token);
    const { data } = await octokit.rest.repos.listLanguages({
      owner: username,
      repo: repoName
    });

    return Object.keys(data);
  } catch (error) {
    console.error('GitHub API Error:', error);
    return [];
  }
}

/**
 * Get user's GitHub profile
 */
async function getUserProfile(username, token = null) {
  try {
    const octokit = getOctokit(token);
    const { data } = await octokit.rest.users.getByUsername({
      username
    });

    return {
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatar: data.avatar_url,
      location: data.location,
      website: data.blog,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Get user's GitHub commits
 */
async function getUserCommits(username, token = null, limit = 30) {
  try {
    // Check if GitHub token is available
    const githubToken = token || process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET;
    if (!githubToken) {
      console.warn('GitHub token not configured. Cannot fetch commits.');
      return [];
    }

    const octokit = getOctokit(token);
    
    // Get user's repositories
    let repos;
    try {
      repos = await getUserRepositories(username, token);
    } catch (error) {
      // If repositories can't be fetched, return empty array
      console.warn('Could not fetch repositories for commits:', error.message);
      return [];
    }
    
    if (!repos || repos.length === 0) {
      return [];
    }
    
    // Get commits from all repositories
    const allCommits = [];
    
    for (const repo of repos.slice(0, 10)) { // Limit to 10 repos to avoid rate limits
      try {
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner: username,
          repo: repo.name,
          per_page: 10,
          sort: 'updated',
          order: 'desc'
        });

        if (commits && Array.isArray(commits)) {
          commits.forEach(commit => {
            if (commit && commit.commit) {
              allCommits.push({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name || 'Unknown',
                date: commit.commit.author?.date || new Date().toISOString(),
                url: commit.html_url,
                repository: repo.name,
                repositoryUrl: repo.url
              });
            }
          });
        }
      } catch (error) {
        // Skip repos that can't be accessed
        console.warn(`Could not fetch commits for ${repo.name}:`, error.message);
      }
    }

    // Sort by date (newest first) and limit
    allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return allCommits.slice(0, limit);
  } catch (error) {
    console.error('GitHub Commits Error:', error.message || error);
    // Return empty array instead of throwing error
    return [];
  }
}

/**
 * Get commit activity for a user
 */
async function getUserCommitActivity(username, token = null, days = 30) {
  try {
    const commits = await getUserCommits(username, token, 100);
    
    // If no commits, return empty activity
    if (!commits || commits.length === 0) {
      const activityArray = [];
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        activityArray.push({
          date: dateKey,
          commits: 0
        });
      }
      
      return {
        totalCommits: 0,
        dailyActivity: activityArray,
        recentCommits: []
      };
    }
    
    // Group commits by date
    const activity = {};
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    commits.forEach(commit => {
      if (commit && commit.date) {
        const commitDate = new Date(commit.date);
        if (commitDate >= startDate) {
          const dateKey = commitDate.toISOString().split('T')[0];
          activity[dateKey] = (activity[dateKey] || 0) + 1;
        }
      }
    });

    // Create array of daily activity
    const activityArray = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      activityArray.push({
        date: dateKey,
        commits: activity[dateKey] || 0
      });
    }

    return {
      totalCommits: commits.length,
      dailyActivity: activityArray,
      recentCommits: commits.slice(0, 20)
    };
  } catch (error) {
    console.error('Commit Activity Error:', error.message || error);
    // Return empty activity instead of throwing error
    const activityArray = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      activityArray.push({
        date: dateKey,
        commits: 0
      });
    }
    
    return {
      totalCommits: 0,
      dailyActivity: activityArray,
      recentCommits: []
    };
  }
}

/**
 * Sync user's GitHub repositories to database
 */
async function syncUserRepositories(userId, githubUsername, token = null, prisma) {
  try {
    // Check if we have a valid token before attempting sync
    const envToken = process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET;
    if (!token && (!envToken || envToken === 'your-github-token' || envToken === 'your_github_token')) {
      throw new Error('GitHub token not configured. Please set a valid GITHUB_TOKEN in environment variables. You can generate a Personal Access Token from https://github.com/settings/tokens with "repo" and "user:email" scopes.');
    }

    if (!token && !envToken) {
      throw new Error('GitHub token not configured. Please set GITHUB_TOKEN or GITHUB_CLIENT_SECRET in environment variables. For public repositories, you can still view them but syncing requires authentication.');
    }

    const repos = await getUserRepositories(githubUsername, token);
    
    // If no repos returned and it's not due to empty account, warn user
    if (repos.length === 0) {
      console.warn(`No repositories found for ${githubUsername}. This could be due to: missing token, invalid credentials, or no public repositories.`);
    }
    
    const projects = [];

    for (const repo of repos) {
      if (repo.isPrivate) continue; // Skip private repos

      const languages = await getRepositoryLanguages(githubUsername, repo.name, token);
      
      // Check if project already exists
      const existingProject = await prisma.project.findFirst({
        where: {
          userId,
          githubUrl: repo.url
        }
      });

      const projectData = {
        name: repo.name,
        description: repo.description || '',
        githubUrl: repo.url,
        liveUrl: repo.homepage || null,
        techStack: languages.length > 0 ? languages : [repo.language].filter(Boolean),
        stars: repo.stars,
        forks: repo.forks,
        userId
      };

      if (existingProject) {
        // Update existing project
        await prisma.project.update({
          where: { id: existingProject.id },
          data: projectData
        });
        projects.push(existingProject.id);
      } else {
        // Create new project
        const project = await prisma.project.create({
          data: projectData
        });
        projects.push(project.id);
      }
    }

    // Extract unique skills from all projects
    const allProjects = await prisma.project.findMany({
      where: { userId }
    });

    const allTechStack = new Set();
    allProjects.forEach(project => {
      project.techStack.forEach(tech => allTechStack.add(tech));
    });

    // Update user skills if they have GitHub integration
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const updatedSkills = Array.from(new Set([...user.skills, ...Array.from(allTechStack)]));
      await prisma.user.update({
        where: { id: userId },
        data: { skills: updatedSkills }
      });
    }

    return projects;
  } catch (error) {
    console.error('Sync Error:', error);
    throw new Error('Failed to sync repositories');
  }
}

module.exports = {
  getUserRepositories,
  getRepositoryLanguages,
  getUserProfile,
  getUserCommits,
  getUserCommitActivity,
  syncUserRepositories
};

