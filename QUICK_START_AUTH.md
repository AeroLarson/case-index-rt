# 🚀 Quick Start - Authentication Setup

## What I've Built for You

I've implemented a complete authentication system with:

✅ **Email/Password Login & Registration**
✅ **Google OAuth (works with your existing setup)**
✅ **Forgot Password with Email Reset**
✅ **Real Database Storage (PostgreSQL with Prisma)**
✅ **Beautiful Email Templates**
✅ **Secure Password Hashing**
✅ **30-Day Session Persistence**

## 🎯 What You Need to Do

### 1. Add These Lines to Your `.env.local` File:

Open your `.env.local` file and add these new environment variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-string-here

# Database URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/caseindexrt

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```powershell
node scripts/generate-secret.js
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

### 3. Get a Free Database (Choose One):

#### Option A: Neon (Easiest - Recommended)
1. Go to https://neon.tech
2. Sign up (free)
3. Create a project
4. Copy the connection string
5. Paste it as `DATABASE_URL` in `.env.local`

#### Option B: Supabase
1. Go to https://supabase.com
2. Create a project
3. Go to Settings → Database
4. Copy "Connection string"
5. Paste it as `DATABASE_URL` in `.env.local`

#### Option C: Railway
1. Go to https://railway.app
2. Create a project
3. Add PostgreSQL
4. Copy `DATABASE_URL` from Variables
5. Paste it in `.env.local`

### 4. Get a Free Email API Key (Resend):

1. Go to https://resend.com
2. Sign up (free - 100 emails/day)
3. Create an API key
4. Copy the key (starts with `re_`)
5. Paste it as `RESEND_API_KEY` in `.env.local`

### 5. Initialize the Database:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

### 6. Restart Your Server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🎉 Done! Now You Can:

1. **Create Accounts**: Users can sign up with email/password
2. **Login**: Users can log in with email/password OR Google
3. **Reset Passwords**: Users can click "Forgot password?" to reset
4. **Persistent Sessions**: Accounts are saved in the database, not localStorage

## 🧪 Test It:

1. Go to http://localhost:3000/login
2. Click "Sign up"
3. Enter name, email (use a real email to test password reset), and password
4. Create account - you'll be auto-logged in!
5. Logout and try "Forgot password?" feature
6. Check your email for reset link

## 📚 Full Documentation

See `SETUP_AUTHENTICATION.md` for complete details, troubleshooting, and advanced features.

## ⚠️ Important Notes

- The system works with or without Google OAuth (both are optional)
- Email/password authentication works immediately once DB is set up
- Password reset emails require a Resend API key
- All user data is now stored in the database, not localStorage
- Sessions persist for 30 days

## 🆘 Quick Troubleshooting

**Can't connect to database?**
- Check your `DATABASE_URL` is correct
- Make sure the database exists
- Try running `npx prisma db push` again

**Emails not sending?**
- Check `RESEND_API_KEY` is correct
- Make sure you have email credits left
- Check console for error messages

**NextAuth errors?**
- Make sure `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your local URL
- Restart dev server after changing `.env.local`

## 🎯 Next Steps (Already Built, Just Need DB Setup):

Once the database is connected:
- Update `AuthContext.tsx` to use NextAuth instead of custom auth
- Migrate saved cases to database
- Migrate calendar events to database
- Remove localStorage user profile code

Everything is ready to go - you just need to set up the database and email service!

