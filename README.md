# ProbHub - Problem Discovery Platform

Discover real problems people are discussing on the internet. ProbHub aggregates and normalizes problem discussions from Hacker News, StackExchange, GitHub, and more using AI-powered extraction.

## 🚀 Features

- **Multi-Source Aggregation**: Ingests problems from Hacker News (v1), with StackExchange and GitHub coming soon
- **AI-Powered Normalization**: Uses LLM to extract and structure problem statements
- **Smart Search**: Full-text search with filtering by source, tags, and sorting options
- **Modern UI**: Bold, minimal design with Tailwind CSS
- **Automated Ingestion**: Vercel Cron jobs for scheduled data collection

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **LLM**: OpenAI-compatible API (Deepseek, OpenAI, etc.)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com))
- LLM API key (Deepseek, OpenAI, or compatible)

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ProbHub
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://app.supabase.com)
2. Go to Project Settings → API
3. Copy the following values:
   - Database URL (Connection pooling URL recommended)
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=[YOUR_DEEPSEEK_API_KEY]
LLM_MODEL=deepseek-chat
```

### 4. Set Up Database Schema

```bash
npm run db:push
```

This will create all necessary tables in your Supabase database.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The platform uses the following main tables:

- `sources` - External data sources (HN, StackExchange, etc.)
- `raw_events` - Raw API responses from sources
- `problems` - Normalized problem records with full-text search
- `tags` & `problem_tags` - Tagging system
- `problem_signals` - User interaction tracking

## 🔄 Ingestion Pipeline

### Manual Ingestion (for testing)

```bash
curl -X POST http://localhost:3000/api/ingest/hackernews
```

### Automated Ingestion (Vercel)

Once deployed to Vercel, cron jobs run automatically every 15 minutes to fetch new problems from Hacker News.

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (DB GUI)
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env`
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Run cron jobs for ingestion
- Handle serverless functions

## 📖 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── api/               # API routes
│   ├── problems/          # Problems list & detail pages
│   └── sources/           # Sources overview page
├── components/            # Reusable React components
├── lib/
│   ├── db/               # Database client & schema
│   ├── llm/              # LLM client & normalizers
│   ├── connectors/       # Source connectors (HN, etc.)
│   └── config.ts         # App configuration
└── types/                # TypeScript type definitions
```

## 🔮 Roadmap

- [x] Phase 1: Foundation & Database Setup
- [x] Phase 2: Basic UI & Landing Page
- [ ] Phase 3: API Routes & Data Fetching
- [ ] Phase 4: LLM Integration
- [ ] Phase 5: Hacker News Connector
- [ ] Phase 6: Vercel Cron Setup
- [ ] Phase 7: StackExchange Connector
- [ ] Phase 8: GitHub Issues Connector

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for problem solvers and entrepreneurs
