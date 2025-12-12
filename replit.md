# TradeLog - Professional Trading Journal

## Overview

TradeLog is a professional trading journal application designed for traders to track, analyze, and improve their trading performance. The application allows users to manually log trades, view comprehensive statistics, and integrate with TradingView for automated trade logging via webhooks.

Key features:
- Manual trade entry with support for long/short positions
- Dashboard with performance metrics (win rate, total P&L, trade statistics)
- Trade filtering and search capabilities (by symbol, direction, strategy, tags, date range)
- Trade tagging for categorization and analysis
- Strategy categorization for performance tracking
- CSV export of filtered trades
- Analytics charts (equity curve, win/loss distribution, performance by symbol)
- TradingView webhook integration for automated trade logging
- Dark/light theme support
- Desktop-optimized design focused on data clarity

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, bundled using Vite

**Routing**: Wouter (lightweight React router)
- Routes: Dashboard (`/`), All Trades (`/trades`), Log Trade (`/trades/new`), Analytics (`/analytics`), Webhook Setup (`/webhook`)

**State Management**: TanStack React Query for server state management
- Handles data fetching, caching, and synchronization with the backend
- Custom query client configuration in `client/src/lib/queryClient.ts`

**UI Components**: Shadcn/ui component library built on Radix UI primitives
- Component configuration in `components.json`
- Tailwind CSS for styling with custom design tokens
- Design follows Material Design + Modern Fintech aesthetics (see `design_guidelines.md`)

**Key Design Decisions**:
- Data clarity prioritized for trading applications
- Monospace fonts (JetBrains Mono) for numerical data display
- Profit/loss color coding using CSS custom properties

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Structure**: RESTful API at `/api/*` endpoints
- `GET /api/trades` - Fetch all trades
- `GET /api/trades/stats` - Get trade statistics
- `GET /api/trades/:id` - Get single trade
- `POST /api/trades` - Create new trade
- `POST /api/webhook/tradingview` - TradingView webhook endpoint

**Storage Layer**: Abstracted storage interface (`IStorage`) in `server/storage.ts`
- Uses PostgreSQL via DatabaseStorage class
- Full CRUD operations for trades and users

**Build Process**: Custom build script using esbuild for server and Vite for client
- Server bundles common dependencies for faster cold starts
- Output to `dist/` directory

### Data Storage

**Schema Definition**: Zod schemas in `shared/schema.ts`
- `Trade` - Complete trade record with P&L tracking
- `InsertTrade` - Schema for creating new trades
- `TradingViewWebhook` - Schema for webhook payloads
- `TradeStatistics` - Aggregated statistics type

**Database Configuration**: Drizzle ORM configured for PostgreSQL
- Config in `drizzle.config.ts`
- Migrations output to `./migrations`
- Schema location: `./shared/schema.ts`

**Current State**: PostgreSQL database is active
- Connected via `DATABASE_URL` environment variable
- Trades table includes: id, symbol, direction, status, entryPrice, exitPrice, quantity, entryTime, exitTime, fees, notes, strategy, tags (array), source

### Authentication

Implemented using Replit Auth (OpenID Connect):
- `server/replitAuth.ts` - Auth setup with passport, session storage in PostgreSQL
- Routes: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`
- All trade API routes protected with `isAuthenticated` middleware
- Frontend uses `useAuth` hook to check authentication state
- Landing page shown for unauthenticated users

## External Dependencies

### Third-Party Services

**TradingView Integration**: Webhook endpoint for receiving trade signals
- Accepts entry/exit actions with price, quantity, and strategy data
- Automatically matches open trades for exit signals
- Webhook setup page with:
  - Copyable webhook URL
  - Test webhook button for connection verification
  - Ready-to-use Pine Script template with SMA crossover strategy
  - Step-by-step TradingView setup instructions

### Database

**PostgreSQL**: Configured via Drizzle ORM
- Connection via `DATABASE_URL` environment variable
- Session storage support via `connect-pg-simple`

### Frontend Libraries

- **Radix UI**: Accessible component primitives
- **TanStack React Query**: Server state management
- **React Hook Form + Zod**: Form handling with validation
- **date-fns**: Date formatting and manipulation
- **Embla Carousel**: Carousel functionality
- **Recharts**: Chart components (via Shadcn)

### Development Tools

- **Vite**: Frontend build and dev server with HMR
- **esbuild**: Server bundling
- **TypeScript**: Type checking across client and server
- **Tailwind CSS**: Utility-first styling
- **Drizzle Kit**: Database migrations and schema management