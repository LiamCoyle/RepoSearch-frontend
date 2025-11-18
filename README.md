# GitHub Repository Search - Frontend

A modern Next.js application for searching and exploring GitHub repositories with detailed analytics and contributor insights.

## Features

- 🔍 **Repository Search**: Search GitHub repositories with real-time results
- 📊 **Repository Analytics**: View detailed analytics for any repository including:
  - Commit timeline visualization (last 100 commits)
  - Complete contributor list with total contributions
  - User impact analysis based on recent commits
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌓 **Dark Mode**: Full dark/light theme support with system preference detection
- 📱 **Responsive Design**: Optimized for all screen sizes
- ⚡ **Fast Performance**: Built with Next.js 15 and React Server Components

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: Recharts (via shadcn charts)
- **Animations**: Framer Motion
- **Toast Notifications**: Sonner
- **Theme Management**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main search page
│   ├── repository/         # Repository detail pages
│   │   └── [id]/          # Dynamic route for repository details
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (header)
│   └── theme-toggle.tsx   # Theme switcher
├── lib/                   # Utility functions
│   └── api.ts            # API client for backend communication
├── types/                 # TypeScript type definitions
│   └── github.ts         # GitHub API types
└── public/               # Static assets
```

## Key Features

### Repository Search

- Search GitHub repositories by name, description, or keywords


### Repository Analytics

- **Commit Timeline**: Visual graph showing commit distribution over time (last 100 commits)
- **Contributors**: List of all repository contributors sorted by total contributions
- **User Impact**: Analysis of contributor impact based on commits in the last 100 commits

### Theme Support

- Manual theme toggle

## API Integration


- GitHub Repository search
- GitHub Repository details by ID
- GitHub Repository commits (last 100)
- GitHub Repository contributors


## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```



## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |



