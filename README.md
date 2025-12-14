# TradeLog - Trading Journal

Professional trading journal built with Next.js 14, TypeScript, and PostgreSQL.

## Features

- 📊 Track trades with detailed information
- 📈 Analytics and performance metrics
- 🎯 Win rate, profit factor, and P&L tracking
- 🔐 Simple PIN-based authentication
- 🌓 Dark/Light mode support
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: TanStack Query
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gokbeyinac/Trade-Logbook.git
cd TradeLogbook
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL=postgresql://user:password@localhost:5432/tradelog
SESSION_SECRET=your-secret-key-here
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Step 1: Prepare Database

1. Create a PostgreSQL database (recommended: [Supabase](https://supabase.com) or [Neon](https://neon.tech))
2. Get your database connection string

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A random secret string (generate with `openssl rand -base64 32`)
4. Deploy!

### Step 3: Run Database Migrations

After deployment, run migrations on your production database:

```bash
DATABASE_URL=your-production-db-url npm run db:push
```

Or use Vercel's CLI:
```bash
vercel env pull
npm run db:push
```

## Project Structure

```
app/
├── api/              # API routes (Route Handlers)
│   ├── auth/        # Authentication endpoints
│   └── trades/      # Trade CRUD endpoints
├── components/       # React components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and database
├── (dashboard)/     # Protected dashboard routes
│   ├── dashboard/
│   ├── trades/
│   └── analytics/
└── layout.tsx        # Root layout

shared/
└── schema.ts        # Database schema and Zod validations
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Secret for session encryption (required in production)

## License

MIT

