# Case Index RT - California Court Case Search

A comprehensive, production-ready web application for tracking and managing California court cases. Built with modern web technologies, this platform provides legal professionals with AI-powered case search, real-time updates, calendar integration, and advanced analytics.

## 🚀 Key Features

### Core Functionality
- **AI-Powered Case Search**: Intelligent search across San Diego County family law cases with natural language processing
- **Real-time Case Tracking**: Automated monitoring of case filings, hearings, and document updates
- **Advanced Analytics Dashboard**: Comprehensive insights into active cases, upcoming hearings, and case trends
- **Document Management**: Access and organize court documents and filings

### Integrations & Automation
- **Clio CRM Integration**: Seamless synchronization with Clio practice management system
- **Calendar Sync**: Automatic hearing date synchronization with Google Calendar and Outlook
- **AI Case Analysis**: Intelligent case summaries, timeline analysis, and court rules search
- **Email Notifications**: Automated alerts for case updates and hearing reminders

### User Experience
- **Modern Responsive Design**: Beautiful dark theme UI with gradient backgrounds, optimized for all devices
- **User Authentication**: Secure login with email/password and Google OAuth integration
- **Subscription Management**: Flexible pricing tiers (Free, Professional, Team) with Stripe payment integration
- **Role-Based Access**: Admin dashboard with user management and analytics

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router (React Server Components)
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Font Awesome 6 & React Icons
- **Charts**: Recharts for data visualization
- **Build Tool**: Turbopack for fast development

### Backend & Services
- **Authentication**: NextAuth.js with multiple providers (Email/Password, Google OAuth)
- **Database**: PostgreSQL with Prisma ORM
- **Payment Processing**: Stripe integration with subscription management
- **Email Service**: Resend API for transactional emails
- **AI Services**: OpenAI API for case analysis and summaries
- **Web Scraping**: Puppeteer with Chromium for court data extraction

### Infrastructure
- **Deployment**: Vercel (optimized for Next.js)
- **Analytics**: Vercel Analytics & Speed Insights
- **Security**: bcrypt password hashing, HTTPS, secure headers

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── stripe/          # Payment processing
│   │   └── clio/            # Clio CRM integration
│   ├── account/             # User account management
│   ├── admin/               # Admin dashboard
│   ├── analytics/           # Analytics and reporting
│   ├── billing/             # Subscription management
│   └── [pages]/             # Public pages (about, pricing, etc.)
├── components/              # React components
│   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   └── [feature]/          # Feature-specific components
├── lib/                     # Core business logic
│   ├── aiService.ts        # AI/OpenAI integration
│   ├── stripe.ts           # Payment processing
│   ├── clioAPI.ts          # Clio CRM API client
│   ├── courtDataService.ts # Court data scraping
│   └── userProfile.ts      # User profile management
├── contexts/                # React contexts
│   └── AuthContext.tsx     # Authentication state
└── hooks/                   # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** database (Neon, Supabase, or Railway recommended)
- **Stripe** account (for payment processing)
- **OpenAI** API key (for AI features)
- **Resend** account (for email services)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Coder5
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file with the following variables:
```env
# Database
DATABASE_URL=postgresql://your-connection-string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_PRO_PRICE_ID=price_your_pro_price
STRIPE_TEAM_PRICE_ID=price_your_team_price
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Email
RESEND_API_KEY=re_your_resend_key

# Clio (optional)
CLIO_CLIENT_ID=your_clio_client_id
CLIO_CLIENT_SECRET=your_clio_client_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. **Set up the database**
```bash
npm run db:generate
npm run db:push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Key Components

### Layout Components
- **Header**: Navigation bar with gradient design, user menu, and call-to-action buttons
- **Sidebar**: Fixed navigation with case management links and active state indicators
- **Footer**: Trusted partners section, legal links, and responsive layout

### Feature Components
- **Dashboard**: Overview cards, case statistics, recent updates feed, and upcoming hearings calendar
- **Case Search**: Advanced search interface with filters and AI-powered suggestions
- **Analytics**: Data visualization with charts, trends, and reporting tools
- **Account Management**: User profile, subscription management, and settings
- **Admin Panel**: User management, system analytics, and configuration

## 🔐 Authentication & Security

- **Multi-provider Authentication**: Email/password and Google OAuth
- **Password Security**: bcrypt hashing with secure password reset flow
- **Session Management**: Secure session handling with NextAuth.js
- **API Security**: Protected API routes with authentication middleware
- **Data Protection**: Secure headers, CSP policies, and HTTPS enforcement

## 💳 Payment & Subscriptions

Integrated Stripe payment processing with three subscription tiers:

- **Free Plan**: 1 case per month, basic information, email notifications
- **Professional Plan** ($99/month): Unlimited searches, AI summaries, calendar integration, Clio CRM
- **Team Plan** ($299/month): Everything in Professional, up to 5 team members, custom reporting

Features include:
- Secure checkout sessions
- Subscription management portal
- Webhook handling for payment events
- Admin exemption for testing

## 🔌 Third-Party Integrations

- **Clio CRM**: OAuth integration for syncing cases and calendar events
- **Google Calendar**: Automatic hearing date synchronization
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI-powered case analysis and summaries
- **Resend**: Transactional email delivery

## 🎨 Design & Styling

The application features a modern, professional design:

- **Dark Theme**: Consistent dark color scheme with gradient accents
- **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- **Gradient Backgrounds**: Purple and indigo gradients throughout the UI
- **Custom Components**: Reusable, accessible components with proper TypeScript types
- **Smooth Animations**: Scroll animations and transitions for enhanced UX

## 📝 Development Notes

- **Client Components**: Strategic use of `'use client'` for interactive features
- **Server Components**: Leveraging Next.js 15 App Router for optimal performance
- **Type Safety**: Full TypeScript coverage for type safety and better DX
- **Code Organization**: Modular architecture with clear separation of concerns
- **Performance**: Optimized bundle sizes, code splitting, and lazy loading

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:fast     # Start with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run clear-cache  # Clear Next.js cache
npm run generate-secret # Generate NEXTAUTH_SECRET
```

## 📄 License

© 2025 Case Index RT. All rights reserved.


