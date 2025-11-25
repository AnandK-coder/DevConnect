const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate job match score based on user profile and job requirements
 */
async function calculateJobMatchScore(user, job) {
  const prompt = `Analyze the match between a developer profile and a job posting.

Developer Profile:
- Skills: ${user.skills.join(', ')}
- Experience: ${user.experience} years
- Location: ${user.location || 'Not specified'}

Job Requirements:
- Title: ${job.title}
- Requirements: ${job.requirements.join(', ')}
- Location: ${job.location}
- Remote: ${job.remote ? 'Yes' : 'No'}
- Experience Level: ${job.experienceLevel || 'Not specified'}

Calculate a match score from 0-100 based on:
1. Skill match (40%)
2. Experience alignment (20%)
3. Location fit (15%)
4. Overall compatibility (25%)

Return only a JSON object with this structure:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "skillMatch": <number 0-100>,
  "experienceMatch": <number 0-100>,
  "locationMatch": <number 0-100>
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: result.score || 0,
      reasoning: result.reasoning || '',
      skillMatch: result.skillMatch || 0,
      experienceMatch: result.experienceMatch || 0,
      locationMatch: result.locationMatch || 0
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to basic calculation
    return calculateBasicMatchScore(user, job);
  }
}

/**
 * Fallback basic match calculation
 */
function calculateBasicMatchScore(user, job) {
  let score = 0;
  
  // Skill match (40%)
  const userSkills = new Set(user.skills.map(s => s.toLowerCase()));
  const jobSkills = job.requirements.map(r => r.toLowerCase());
  const matchedSkills = jobSkills.filter(skill => 
    Array.from(userSkills).some(userSkill => 
      userSkill.includes(skill) || skill.includes(userSkill)
    )
  ).length;
  const skillMatch = (matchedSkills / Math.max(jobSkills.length, 1)) * 100;
  score += (skillMatch * 0.4);
  
  // Experience match (20%)
  const experienceMatch = job.experienceLevel ? 
    (user.experience >= 5 && job.experienceLevel === 'SENIOR' ? 100 :
     user.experience >= 2 && job.experienceLevel === 'MID' ? 100 :
     user.experience < 2 && job.experienceLevel === 'JUNIOR' ? 100 : 50) : 50;
  score += (experienceMatch * 0.2);
  
  // Location match (15%)
  const locationMatch = job.remote ? 100 : 
    (user.location?.toLowerCase().includes(job.location.toLowerCase()) ? 100 : 50);
  score += (locationMatch * 0.15);
  
  // General compatibility (25%)
  score += 50 * 0.25;
  
  return {
    score: Math.round(score),
    reasoning: 'Basic match calculation',
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    locationMatch: Math.round(locationMatch)
  };
}

/**
 * Generate interview questions based on user profile and job
 */
async function generateInterviewQuestions(user, job) {
  const prompt = `Generate 5 relevant technical interview questions for a ${job.title} position.

Developer Profile:
- Skills: ${user.skills.join(', ')}
- Experience: ${user.experience} years

Job Requirements:
- Title: ${job.title}
- Requirements: ${job.requirements.join(', ')}

Generate questions that test:
1. Technical skills relevant to the role
2. Problem-solving abilities
3. Experience with technologies mentioned
4. Best practices
5. Real-world scenarios

Return only a JSON array of question strings:
["question1", "question2", "question3", "question4", "question5"]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.questions || [];
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback questions
    return [
      `Tell me about your experience with ${job.requirements[0] || 'the technologies mentioned'}`,
      'Describe a challenging project you worked on and how you solved it',
      'How do you approach debugging a complex issue?',
      'What best practices do you follow when writing code?',
      'Tell me about a time you had to learn a new technology quickly'
    ];
  }
}

/**
 * Analyze code quality and provide feedback
 */
async function analyzeCodeQuality(code, language) {
  const prompt = `Analyze the following ${language} code and provide feedback:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Quality score (0-100)
2. Strengths
3. Areas for improvement
4. Best practices suggestions

Return JSON:
{
  "score": <number>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      score: 70,
      strengths: ['Code structure looks reasonable'],
      improvements: ['Could use more comments', 'Consider error handling'],
      suggestions: ['Follow language conventions', 'Add type checking if applicable']
    };
  }
}

module.exports = {
  calculateJobMatchScore,
  generateInterviewQuestions,
  analyzeCodeQuality
};

