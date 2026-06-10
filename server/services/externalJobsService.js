const axios = require('axios');
const logger = require('../lib/logger');

let cache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

async function getExternalJobs() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  try {
    logger.info('Fetching external jobs from Arbeitnow API...');
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');
    
    if (response.data && response.data.data) {
      // Map Arbeitnow fields to local Job fields
      const jobs = response.data.data.map(job => ({
        id: `ext_${job.slug}`,
        title: job.title,
        company: job.company_name,
        description: job.description,
        requirements: job.tags || [],
        location: job.location,
        remote: job.remote || false,
        salary: null,
        salaryCurrency: 'EUR',
        jobType: mapJobType(job.job_types),
        experienceLevel: 'MID', // Default fallback
        companyLogo: null,
        companyUrl: job.url, // URL to view/apply externally
        postedAt: new Date(job.created_at * 1000).toISOString(),
        active: true,
        external: true
      }));

      cache.data = jobs;
      cache.timestamp = now;
      logger.info(`Successfully fetched and cached ${jobs.length} external jobs`);
      return jobs;
    }
    return [];
  } catch (error) {
    logger.error('Error fetching external jobs:', { error: error.message });
    return cache.data || []; // Fallback to cached data if request fails
  }
}

function mapJobType(types) {
  if (!types || types.length === 0) return 'FULL_TIME';
  const type = types[0].toLowerCase();
  if (type.includes('part-time') || type.includes('parttime')) return 'PART_TIME';
  if (type.includes('contract') || type.includes('freelance') || type.includes('project')) return 'CONTRACT';
  if (type.includes('intern') || type.includes('student') || type.includes('werkstudent')) return 'INTERNSHIP';
  return 'FULL_TIME';
}

module.exports = { getExternalJobs };
