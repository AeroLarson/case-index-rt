import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

const providers: any[] = [
  CredentialsProvider({
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Incorrect password')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            previousLogin: user.lastLogin,
            lastLogin: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
]

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleProvider = require('next-auth/providers/google').default
  providers.unshift(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Update last login for OAuth users
      if (account?.provider === 'google' && user.id) {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        
        if (existingUser) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              previousLogin: existingUser.lastLogin,
              lastLogin: new Date(),
            },
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - extending session user type
        session.user.id = token.sub || ''
        
        // Fetch full user profile from database
        const dbUser = await prisma.user.findUnique({
          // @ts-ignore
          where: { id: session.user.id },
          include: {
            savedCases: true,
            recentSearches: {
              orderBy: { searchedAt: 'desc' },
              take: 10,
            },
            starredCases: true,
            calendarEvents: {
              orderBy: { startDate: 'asc' },
            },
          },
        })

        if (dbUser) {
          session.user.name = dbUser.name || session.user.name
          session.user.email = dbUser.email || session.user.email
          session.user.image = dbUser.image || dbUser.avatar || session.user.image
          // @ts-ignore - extending session type
          session.user.plan = dbUser.plan
          // @ts-ignore
          session.user.monthlyUsage = dbUser.monthlyUsage
          // @ts-ignore
          session.user.maxMonthlyUsage = dbUser.maxMonthlyUsage
          // @ts-ignore
          session.user.previousLogin = dbUser.previousLogin
          // @ts-ignore
          session.user.lastLogin = dbUser.lastLogin
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


