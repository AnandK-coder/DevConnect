# 🚀 DevConnect Setup Guide

Complete setup instructions for the DevConnect platform.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Redis server (optional, for caching)
- GitHub OAuth App credentials
- OpenAI API key

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

Or use the workspace command:
```bash
npm run install:all
```

## Step 2: Database Setup

### PostgreSQL Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE devconnect;
```

2. Configure Prisma:
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

This will create all the database tables based on the Prisma schema.

## Step 3: Environment Variables

### Server Environment (`server/.env`)

Create `server/.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devconnect

# Redis (optional)
REDIS_URL=redis://localhost:6379

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-token

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-here

# Server
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Client Environment (`client/.env.local`)

Create `client/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 4: GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: DevConnect
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/github/callback
4. Click "Register application"
5. Copy **Client ID** and **Client Secret** to your `.env` file

## Step 5: LinkedIn OAuth Setup

See [LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md) for detailed step-by-step instructions.

**Quick Setup:**
1. Go to [LinkedIn Developers Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Get Client ID and Client Secret from "Auth" tab
4. Add redirect URL: `http://localhost:3000/api/linkedin/callback`
5. Request "Sign In with LinkedIn using OpenID Connect" product
6. Add to `.env`:
   ```env
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   ```
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:5000/api/auth/github/callback
4. Copy Client ID and Client Secret to `.env` files

## Step 5: OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to `server/.env` as `OPENAI_API_KEY`

## Step 6: Start the Development Servers

### Option 1: Run Both Together (Recommended)
```bash
# From root directory
npm run dev
```

This starts:
- Client: http://localhost:3000
- Server: http://localhost:5000

### Option 2: Run Separately

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

## Step 7: Verify Installation

1. Open http://localhost:3000
2. Create a new account
3. Complete your profile
4. Sync GitHub repositories (if configured)
5. Browse jobs and view matches

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists

### GitHub Sync Not Working
- Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correct
- Check GitHub username is set in profile
- Ensure repository access permissions

### OpenAI API Errors
- Verify API key is valid
- Check API quota/limits
- Fallback matching algorithm works without OpenAI

### Port Already in Use
- Change PORT in server/.env
- Update NEXT_PUBLIC_API_URL in client/.env.local

## Production Deployment

### Build Client
```bash
cd client
npm run build
npm start
```

### Run Server
```bash
cd server
NODE_ENV=production npm start
```

### Environment Variables
Set all environment variables in your hosting platform (Vercel, Railway, Heroku, etc.)

### Database
Use a managed PostgreSQL service (Supabase, Railway, AWS RDS, etc.)

## Next Steps

1. Customize branding and colors
2. Add more job listings
3. Configure email service (SendGrid)
4. Set up payment processing (Stripe)
5. Deploy to production

## Need Help?

- Check the README.md for project overview
- Review API documentation in server routes
- Check Prisma schema for database structure

