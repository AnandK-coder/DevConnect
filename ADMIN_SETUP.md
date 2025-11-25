# 🔐 Admin Setup Guide

## Admin User Creation

Admin users are created using a command-line script. Regular registration creates regular users only.

### Step 1: Run Database Migration

First, update your database schema to include the `role` field:

```bash
cd server
npx prisma migrate dev --name add_user_role
npx prisma generate
```

### Step 2: Create Admin User

Use the admin creation script:

```bash
cd server
node scripts/createAdmin.js <email> <password> <name>
```

**Example:**
```bash
node scripts/createAdmin.js admin@devconnect.com Admin123! "Admin User"
```

**Requirements:**
- Email must be valid
- Password must be at least 8 characters
- Name can be multiple words (use quotes)

### Step 3: Login as Admin

1. Go to `/login` page
2. Enter admin email and password
3. After login, you'll see "Admin" button in navbar
4. Click "Admin" or go to `/admin` to access admin dashboard

## Admin Features

Once logged in as admin, you can:

- **View Statistics**: Total users, jobs, applications, projects
- **Manage Jobs**: View, activate/deactivate, or delete jobs
- **Manage Users**: View all users and their details
- **Manage Applications**: Review and update application statuses

## Security Notes

- Admin users have `role: 'ADMIN'` in database
- Admin middleware checks for `role === 'ADMIN'` (not subscription)
- Admin users automatically get `COMPANY` subscription for full access
- Only admins can access `/api/admin/*` routes

## Creating Additional Admins

To create more admin users, run the script again with different credentials:

```bash
node scripts/createAdmin.js another@admin.com SecurePass123! "Another Admin"
```

If the email already exists as a regular user, the script will:
- Update the user's role to ADMIN
- Update the password
- Set subscription to COMPANY

## Troubleshooting

### "Admin access required" error
- Make sure you ran the migration: `npx prisma migrate dev`
- Verify your user has `role: 'ADMIN'` in database
- Logout and login again to refresh token

### Script fails with "Email already exists"
- If user exists but is not admin, script will update them to admin
- If user is already admin, script will exit (password not changed)

### Can't see Admin button in navbar
- Check browser console for errors
- Verify `user.role === 'ADMIN'` in localStorage
- Try refreshing the page

## Database Query (Manual Check)

To manually check if a user is admin:

```sql
SELECT email, name, role, subscription FROM users WHERE email = 'admin@devconnect.com';
```

To manually make a user admin:

```sql
UPDATE users SET role = 'ADMIN', subscription = 'COMPANY' WHERE email = 'user@example.com';
```

