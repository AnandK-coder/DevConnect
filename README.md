# 💼 DevConnect - Developer Portfolio & Job Matching Platform

A specialized platform for developers to showcase their work, connect with opportunities, and get matched with perfect jobs using AI.

## 🎯 Project Overview

DevConnect is like LinkedIn + GitHub + Job Board, but specifically designed for developers. It combines:
- Professional portfolio showcasing
- AI-powered job matching
- Developer community features
- Skill analytics and insights
- Code review system

## ✨ Key Features

### 1. Code Portfolio Showcase
- **GitHub Integration**: Auto-sync repositories
- **Live Demos**: Embed live project demos
- **Tech Stack Tags**: Visual representation of skills
- **Project Analytics**: Views, stars, forks tracking
- **Featured Projects**: Highlight your best work

### 2. AI Job Matching
- **Smart Matching**: AI analyzes:
  - Your skills and experience
  - Job requirements
  - Company culture fit
  - Location preferences
  - Salary expectations
- **Match Score**: Percentage compatibility
- **Recommendations**: Daily job suggestions

### 3. Skill Analytics Dashboard
- **Skill Proficiency**: Visual skill levels
- **Technology Trends**: What's hot in your area
- **Market Demand**: Which skills are in demand
- **Growth Tracking**: Skill improvement over time
- **Comparison**: Compare with other developers

### 4. Code Review System
- **Peer Reviews**: Get feedback from senior devs
- **Code Quality Score**: Automated analysis
- **Improvement Suggestions**: AI-powered tips
- **Review History**: Track your progress

### 5. Interview Preparation
- **AI-Generated Questions**: Based on your profile
- **Practice Sessions**: Mock interviews
- **Company-Specific Prep**: Questions from target companies
- **Progress Tracking**: Track your preparation

### 6. Salary Insights
- **Market Rates**: Based on skills and location
- **Negotiation Tips**: AI-powered suggestions
- **Salary Trends**: Industry-wide data
- **Comparison Tools**: Compare with peers

### 7. Developer Communities
- **Tech Stack Groups**: Join by technology
- **Location-Based**: Connect locally
- **Experience Level**: Junior/Mid/Senior groups
- **Interest Groups**: AI, Web3, Mobile, etc.

### 8. Collaboration Features
- **Find Co-founders**: Match with potential partners
- **Project Collaboration**: Find contributors
- **Mentorship**: Connect mentors and mentees
- **Study Groups**: Form learning groups

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-ui
- React Query
- Framer Motion
- Recharts
- Octokit

### Backend
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- OpenAI API
- Node Cron

### Integrations
- GitHub API
- OpenAI API (job matching)
- Stripe (premium features)
- SendGrid (emails)

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Database Setup
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 3. Environment Variables

Create `.env` files in both `client` and `server` directories:

**server/.env**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/devconnect
REDIS_URL=redis://localhost:6379
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
PORT=5000
```

**client/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```

This will start:
- Client: http://localhost:3000
- Server: http://localhost:5000

## 📁 Project Structure

```
devconnect/
├── client/                 # Next.js App
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   └── public/           # Static assets
├── server/                # Express API
│   ├── prisma/           # Database schema
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── middleware/       # Express middleware
└── package.json          # Root workspace config
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/:id` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/sync-github` - Sync GitHub repositories

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/matches` - Get job matches (AI)
- `POST /api/jobs/apply` - Apply to job

### Analytics
- `GET /api/analytics/skills` - Get skill analytics
- `GET /api/analytics/trends` - Get technology trends
- `GET /api/analytics/salary` - Get salary insights

## 📊 Database Schema

See `server/prisma/schema.prisma` for complete schema.

## 🎨 UI/UX Highlights

- **Modern Design**: Professional, developer-focused
- **Dark Mode**: Full support
- **Responsive**: Mobile-first approach
- **Fast**: Optimized with Next.js
- **Accessible**: WCAG compliant

## 🔥 Unique Selling Points

1. **Niche Focus**: Built specifically for developers
2. **AI Matching**: Intelligent job recommendations
3. **GitHub Integration**: Seamless code portfolio
4. **Community**: Build your developer network
5. **Analytics**: Deep insights into your career

## 📈 Future Enhancements

- [ ] Mobile app
- [ ] Video profile introductions
- [ ] Coding challenges integration
- [ ] Company pages
- [ ] Salary negotiation AI
- [ ] Interview scheduling
- [ ] Referral system
- [ ] Premium features

## 💼 Business Model

- **Free Tier**: Basic profile, limited matches
- **Pro Tier**: Unlimited matches, analytics, priority support
- **Company Tier**: Post jobs, access talent pool

---

**Perfect for showcasing:**
- Full-stack development
- API integrations
- AI/ML algorithms
- Database design
- Community features
- Business understanding

