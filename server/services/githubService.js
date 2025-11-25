const { Octokit } = require('octokit');

/**
 * Initialize Octokit with user's token or app credentials
 */
function getOctokit(token = null) {
  if (token) {
    return new Octokit({ auth: token });
  }
  
  // Use app credentials if available
  return new Octokit({
    auth: process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET
  });
}

/**
 * Get user's GitHub repositories
 */
async function getUserRepositories(username, token = null) {
  try {
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
    throw new Error('Failed to fetch repositories');
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
 * Sync user's GitHub repositories to database
 */
async function syncUserRepositories(userId, githubUsername, token = null, prisma) {
  try {
    const repos = await getUserRepositories(githubUsername, token);
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
  syncUserRepositories
};

