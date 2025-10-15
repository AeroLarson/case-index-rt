# Case Index RT - California Court Case Search

A modern, responsive web application for tracking California court cases, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **AI-Powered Case Search**: Search and track family law cases across San Diego County
- **Real-time Updates**: Automated case filing and hearing notifications
- **Dashboard Analytics**: Overview of active cases, upcoming hearings, and new filings
- **Responsive Design**: Modern UI with dark theme and gradient backgrounds
- **Component Architecture**: Reusable layout components (Header, Sidebar, Footer)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Build Tool**: Turbopack

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind imports
│   ├── layout.tsx           # Root layout with Header, Sidebar, Footer
│   └── page.tsx             # Main dashboard page
└── components/
    └── layout/
        ├── Header.tsx       # Navigation header component
        ├── Sidebar.tsx      # Side navigation component
        └── Footer.tsx       # Footer component
```

## Getting Started

### Prerequisites

- Node.js 18+ (if you want to run the development server)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Components

### Header Component
- Gradient background with navigation links
- Call-to-action buttons
- Responsive design

### Sidebar Component
- Fixed navigation with case management links
- Font Awesome icons
- Active state indicators

### Footer Component
- Trusted by section with partner logos
- Copyright and legal links
- Responsive layout

### Main Dashboard
- Overview cards with statistics
- Recent case updates feed
- Upcoming hearings calendar
- Filter and search functionality

## Styling

The project uses Tailwind CSS with a custom dark theme. Key styling features:

- **Gradient Backgrounds**: Purple and indigo gradients throughout
- **Dark Theme**: Consistent dark color scheme
- **Responsive Grid**: CSS Grid and Flexbox for layouts
- **Custom Colors**: Purple and indigo color palette
- **Typography**: Clean, readable fonts with proper hierarchy

## Development Notes

- All components are client-side rendered with `'use client'` directive
- Font Awesome icons are loaded via CDN
- Tailwind CSS is imported using the modern `@import "tailwindcss"` syntax
- Components follow React best practices with TypeScript

## License

© 2025 Case Index RT. All rights reserved.

<!-- Deployment trigger: $(date) -->


