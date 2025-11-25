# ⚡ Quick Start Guide

Get DevConnect running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] GitHub account (for OAuth)
- [ ] OpenAI API key (optional, fallback available)

## Fast Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Set Up Database
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Configure Environment

**Create `server/.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/devconnect
JWT_SECRET=change-this-to-random-string
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Create `client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> **Note**: For full features, add GitHub and OpenAI keys. See SETUP.md for details.

### 4. Start Development
```bash
npm run dev
```

That's it! Open http://localhost:3000

## First Steps

1. **Register**: Create an account at http://localhost:3000/register
2. **Update Profile**: Add your skills and experience
3. **Sync GitHub**: Connect your GitHub username to auto-sync repositories
4. **Browse Jobs**: Check out the job listings
5. **View Matches**: See AI-powered job recommendations on your dashboard

## Testing Without External Services

The app works without GitHub or OpenAI:
- Basic matching algorithm (no AI)
- Manual project addition
- All core features functional

## Need More Help?

- See `SETUP.md` for detailed setup
- Check `PROJECT_STRUCTURE.md` for code organization
- Review `README.md` for project overview

## Common Issues

**Database connection error?**
- Ensure PostgreSQL is running
- Check DATABASE_URL format

**Port already in use?**
- Change PORT in server/.env
- Update NEXT_PUBLIC_API_URL in client/.env.local

**Module not found?**
- Run `npm run install:all` again
- Clear node_modules and reinstall

Happy coding! 🚀

