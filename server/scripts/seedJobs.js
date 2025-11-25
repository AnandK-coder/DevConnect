const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    company: 'TechCorp',
    description: 'We are looking for an experienced full-stack developer to join our growing team. You will work on building scalable web applications using modern technologies.',
    requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    location: 'San Francisco, CA',
    remote: true,
    salary: 150000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'Frontend Engineer',
    company: 'StartupXYZ',
    description: 'Join our team to build beautiful and performant user interfaces. We value clean code, user experience, and continuous learning.',
    requirements: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    location: 'Remote',
    remote: true,
    salary: 120000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'Backend Developer',
    company: 'CloudScale Inc',
    description: 'Design and implement robust backend systems that handle millions of requests. Work with microservices architecture and cloud infrastructure.',
    requirements: ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
    location: 'New York, NY',
    remote: false,
    salary: 140000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'DevOps Engineer',
    company: 'InfraTech',
    description: 'Manage our cloud infrastructure and CI/CD pipelines. Help us scale our systems and improve deployment processes.',
    requirements: ['AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'Linux', 'Bash'],
    location: 'Austin, TX',
    remote: true,
    salary: 130000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'Mobile App Developer',
    company: 'AppWorks',
    description: 'Build native and cross-platform mobile applications. Work on both iOS and Android platforms using modern frameworks.',
    requirements: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'REST APIs'],
    location: 'Seattle, WA',
    remote: true,
    salary: 125000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AI Innovations',
    description: 'Develop and deploy machine learning models for production systems. Work with large datasets and cutting-edge AI technologies.',
    requirements: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'AWS'],
    location: 'Boston, MA',
    remote: false,
    salary: 160000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'React Developer',
    company: 'WebStudio',
    description: 'Create interactive and responsive web applications. Collaborate with designers to bring beautiful UIs to life.',
    requirements: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
    location: 'Remote',
    remote: true,
    salary: 100000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    active: true,
    postedAt: new Date()
  },
  {
    title: 'Full Stack Developer',
    company: 'Digital Solutions',
    description: 'Work on end-to-end feature development. From database design to frontend implementation, you will own the full stack.',
    requirements: ['Vue.js', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
    location: 'Chicago, IL',
    remote: true,
    salary: 115000,
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    active: true,
    postedAt: new Date()
  }
];

async function seedJobs() {
  try {
    console.log('🌱 Seeding jobs...');
    
    for (const job of sampleJobs) {
      const existing = await prisma.job.findFirst({
        where: {
          title: job.title,
          company: job.company
        }
      });

      if (!existing) {
        await prisma.job.create({ data: job });
        console.log(`✅ Created job: ${job.title} at ${job.company}`);
      } else {
        console.log(`⏭️  Skipped existing job: ${job.title} at ${job.company}`);
      }
    }

    console.log('✨ Jobs seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding jobs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedJobs();

