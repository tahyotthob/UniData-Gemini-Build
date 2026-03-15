# UniData

AI-powered research data collection platform for Nigerian academia. UniData streamlines the entire research workflow — from survey creation to respondent matching — using Google Gemini AI to help researchers design better studies and collect higher-quality data.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend / BaaS:** Supabase (Auth + PostgreSQL)
- **AI:** Google Gemini AI
- **Deployment:** Vercel

## Features

- **AI Survey Generation** — Describe your research goals and let Gemini generate a structured survey for you
- **Respondent Matching** — Find and match respondents based on demographics and research criteria
- **Survey CRUD** — Create, edit, publish, and manage surveys from a dashboard
- **Analytics Dashboard** — View response rates, completion metrics, and survey insights
- **Dr. Unidata AI Chat** — An AI research consultant that helps refine your methodology and instruments
- **Authentication** — Email/password auth with password reset via Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-org>/UniData.git
   cd UniData
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables

See [`.env.example`](.env.example) for the required variables:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key |

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Run the migration file to set up tables:
   ```bash
   # Using the Supabase CLI
   supabase db push
   ```
   Or manually execute the SQL in [`supabase/migrations/001_create_tables.sql`](supabase/migrations/001_create_tables.sql) via the Supabase SQL Editor.
3. Copy your project URL and anon key into your `.env` file.

## Deployment

Vercel is the recommended deployment platform.

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the environment variables in the Vercel dashboard.
4. Vercel will auto-detect the Vite framework and deploy.

The included [`vercel.json`](vercel.json) configures SPA rewrites so client-side routing works correctly.

## Project Structure

```
├── components/          # React components (pages & shared UI)
│   ├── AuthContext.tsx   # Authentication context provider
│   ├── Dashboard.tsx     # Main user dashboard
│   ├── ResearchChat.tsx  # Dr. Unidata AI chat interface
│   ├── SurveyMatching.tsx
│   └── ...
├── supabase/
│   └── migrations/      # Database migration SQL files
├── styles/
│   └── globals.css      # Global styles (Tailwind)
├── App.tsx              # Root app component & routing
├── apiService.ts        # Supabase API helpers
├── geminiService.ts     # Google Gemini AI integration
├── supabaseClient.ts    # Supabase client initialization
├── types.ts             # Shared TypeScript types
├── index.html           # HTML entry point
├── index.tsx            # React entry point
├── vite.config.ts       # Vite configuration
├── vercel.json          # Vercel deployment config
└── .github/workflows/
    └── ci.yml           # GitHub Actions CI pipeline
```

## Contributing

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes and commit them.
3. Push and open a pull request against `main`.

## License

MIT
