# 📁 Project Structure

Complete overview of the DevConnect project structure.

```
devconnect/
│
├── client/                          # Next.js Frontend
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login page
│   │   │   └── register/
│   │   │       └── page.tsx        # Registration page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # User dashboard
│   │   ├── jobs/
│   │   │   ├── page.tsx            # Jobs listing
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Job details
│   │   ├── profile/
│   │   │   └── page.tsx            # User profile
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Global styles
│   │   └── providers.tsx           # React Query provider
│   │
│   ├── components/                  # React components
│   │   ├── ui/                     # UI components (shadcn-ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── badge.tsx
│   │   └── Navbar.tsx              # Navigation component
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   └── utils.ts                # Helper functions
│   │
│   ├── public/                     # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                          # Express Backend
│   ├── routes/                     # API routes
│   │   ├── auth.js                 # Authentication routes
│   │   ├── profile.js              # Profile routes
│   │   ├── jobs.js                 # Job routes
│   │   ├── matching.js             # Matching routes
│   │   ├── analytics.js            # Analytics routes
│   │   └── github.js               # GitHub routes
│   │
│   ├── services/                   # Business logic
│   │   ├── aiService.js            # OpenAI integration
│   │   ├── githubService.js        # GitHub API integration
│   │   └── matchingService.js      # Job matching logic
│   │
│   ├── middleware/                 # Express middleware
│   │   └── auth.js                 # JWT authentication
│   │
│   ├── lib/                        # Utilities
│   │   ├── prisma.js               # Prisma client
│   │   └── redis.js                # Redis client
│   │
│   ├── prisma/                     # Database schema
│   │   └── schema.prisma           # Prisma schema
│   │
│   ├── index.js                    # Server entry point
│   └── package.json
│
├── package.json                    # Root workspace config
├── README.md                       # Main documentation
├── SETUP.md                        # Setup instructions
└── .gitignore
```

## Key Files Explained

### Frontend (`client/`)

- **`app/page.tsx`**: Landing page with hero section and features
- **`app/dashboard/page.tsx`**: User dashboard with stats and matches
- **`app/jobs/page.tsx`**: Job listings with filters
- **`app/profile/page.tsx`**: User profile with projects and analytics
- **`lib/api.ts`**: Centralized API client using Axios
- **`components/ui/`**: Reusable UI components (shadcn-ui style)

### Backend (`server/`)

- **`index.js`**: Express server setup and route mounting
- **`routes/`**: API endpoints organized by feature
- **`services/`**: Business logic separated from routes
- **`prisma/schema.prisma`**: Database schema definitions
- **`middleware/auth.js`**: JWT authentication middleware

## API Routes

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user

### Profile (`/api/profile`)
- `GET /:id` - Get user profile
- `PUT /` - Update profile
- `POST /sync-github` - Sync GitHub repos
- `GET /:id/projects` - Get user projects
- `POST /projects` - Create project

### Jobs (`/api/jobs`)
- `GET /` - List all jobs (with filters)
- `GET /:id` - Get job details
- `POST /` - Create job (companies only)
- `POST /:id/apply` - Apply to job

### Matching (`/api/matching`)
- `GET /jobs` - Get job matches for user
- `GET /jobs/all` - Get all matches with scores
- `GET /collaboration` - Get collaboration matches

### Analytics (`/api/analytics`)
- `GET /skills` - Get skill analytics
- `GET /trends` - Get technology trends
- `GET /salary` - Get salary insights

### GitHub (`/api/github`)
- `GET /repositories/:username` - Get user repos
- `GET /profile/:username` - Get GitHub profile
- `GET /repositories/:username/:repo/languages` - Get repo languages

## Database Models

See `server/prisma/schema.prisma` for complete schema.

Main models:
- **User**: User accounts and profiles
- **Project**: GitHub projects/synced repos
- **Job**: Job postings
- **JobMatch**: AI-generated job matches
- **Application**: Job applications
- **CodeReview**: Code review requests
- **Interview**: Interview preparation
- **Community**: Developer communities
- **SkillAnalytics**: Skill tracking data

## Environment Variables

### Server (`server/.env`)
- Database, Redis, GitHub, OpenAI, JWT secrets

### Client (`client/.env.local`)
- API URL, GitHub client ID, NextAuth config

See `SETUP.md` for detailed environment setup.

