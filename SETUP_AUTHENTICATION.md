# Authentication Setup Guide

This guide will help you set up real user authentication with email/password and Google OAuth, including forgot password functionality.

## 🎯 What's Been Implemented

✅ **Database Schema** with Prisma ORM (PostgreSQL)
✅ **Email/Password Authentication** with secure bcrypt password hashing
✅ **Google OAuth Integration** via NextAuth.js
✅ **Forgot Password Flow** with email verification
✅ **User Profiles** stored in database (no more localStorage demo data)
✅ **Session Management** with JWT tokens
✅ **Welcome Emails** for new users
✅ **Password Reset Emails** with secure tokens

## 📋 Prerequisites

Before you can use the authentication system, you need:

1. **PostgreSQL Database** (local or cloud)
2. **Resend API Key** (for sending emails)
3. **Google OAuth Credentials** (optional, for Google sign-in)
4. **NextAuth Secret** (random string for JWT signing)

## 🚀 Step-by-Step Setup

### Step 1: Set Up Database

You have several options for your PostgreSQL database:

#### Option A: Free Cloud Database (Recommended for Quick Start)

**Neon (Recommended):**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (it looks like: `postgresql://user:password@host/database`)

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string under "Connection string"

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL
4. Copy the DATABASE_URL from the Variables tab

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:
```bash
# Create a new database
createdb caseindexrt

# Your DATABASE_URL will be:
# postgresql://postgres:your_password@localhost:5432/caseindexrt
```

### Step 2: Get a Resend API Key

Resend is used to send password reset and welcome emails.

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Go to API Keys
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 3: Generate NextAuth Secret

Run this command to generate a secure random string:

**On Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

Or just use a random string generator online.

### Step 4: Configure Environment Variables

Update your `.env.local` file with these values:

```env
# OpenAI API Key (you already have this)
OPENAI_API_KEY=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

# Google OAuth (use your existing credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=paste-your-generated-secret-here

# Database URL (from Step 1)
DATABASE_URL=postgresql://your-connection-string-here

# Email Service (from Step 2)
RESEND_API_KEY=re_your_api_key_here
```

### Step 5: Initialize the Database

Run these commands to create the database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### Step 6: Restart the Development Server

```bash
npm run dev
```

## ✨ Features Available

### 1. Email/Password Registration
- Users can create accounts with email and password
- Passwords are hashed with bcrypt (12 rounds)
- Automatic welcome email sent on signup
- Minimum 8-character password requirement

### 2. Email/Password Login
- Users can log in with their email and password
- Sessions persist for 30 days
- Automatic tracking of last login and previous login

### 3. Google OAuth Login
- Users can sign in with their Google account
- Automatic user creation on first Google sign-in
- Same session management as email/password

### 4. Forgot Password
- Click "Forgot password?" on login page
- Enter email address
- Receive password reset email with secure token
- Token expires after 1 hour
- Reset password with new password

### 5. User Profile in Database
- All user data stored in PostgreSQL
- Saved cases, recent searches, calendar events
- Usage tracking (monthly limits)
- Plan management (free, pro, team)

## 🎨 Updated Login Page

The login page now has:
- **Toggle between Login and Sign Up**
- **Email and password fields**
- **"Forgot password?" link**
- **Google OAuth button**
- **Beautiful UI with form validation**
- **Error and success messages**

## 📧 Email Templates

Beautiful, professional email templates are sent for:
- **Welcome Email** - Sent when new users sign up
- **Password Reset Email** - Sent when users request password reset

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Secure session management with JWT
- ✅ Password reset tokens expire after 1 hour
- ✅ Email enumeration protection
- ✅ CSRF protection via NextAuth
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via React

## 🧪 Testing the System

### Test Email/Password Registration:
1. Go to login page
2. Click "Sign up"
3. Enter name, email, and password (8+ chars)
4. Click "Create Account"
5. You'll be automatically logged in and redirected

### Test Forgot Password:
1. Go to login page
2. Click "Forgot password?"
3. Enter your email
4. Check your email inbox for reset link
5. Click the link and enter new password
6. Log in with your new password

## 📊 Database Management

View and manage your database with Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all users
- See saved cases, searches, calendar events
- Manually edit data
- Delete test accounts

## 🆘 Troubleshooting

### "Error: Environment variable not found: DATABASE_URL"
- Make sure you've added `DATABASE_URL` to `.env.local`
- Restart your dev server after adding the variable

### "Error: Can't reach database server"
- Check your DATABASE_URL is correct
- Make sure your database is running (if local)
- Check firewall settings (if cloud)

### "Failed to send password reset email"
- Check your RESEND_API_KEY is correct
- Make sure you have email credits left
- Check console for detailed error messages

### Prisma Client errors
- Run `npx prisma generate` to regenerate the client
- Delete `node_modules/.prisma` and run `npm install`

## 🎯 Next Steps

Now that you have real authentication working:

1. **Migrate User Data**: Update AuthContext to use database users
2. **Remove localStorage**: Replace all localStorage user profile code
3. **Test All Features**: Make sure saved cases, calendar, etc. work with real DB
4. **Set Up Email Verification**: Add email verification for new signups (optional)
5. **Add 2FA**: Implement two-factor authentication (optional)

## 📝 API Routes Created

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with credentials (handled by NextAuth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes (session, signin, callback)

## 🎉 You're All Set!

Your Case Index RT platform now has:
- ✅ Real user accounts stored in a database
- ✅ Secure authentication with email/password and Google OAuth
- ✅ Working forgot password functionality
- ✅ Professional email notifications
- ✅ Session persistence

Users can now:
1. Create their own accounts
2. Log in and out
3. Reset their passwords
4. Have their data persisted across sessions
5. Access their saved cases, calendar, and searches from any device

