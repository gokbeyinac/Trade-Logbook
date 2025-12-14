-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL,
  quantity REAL NOT NULL,
  entry_time TEXT NOT NULL,
  exit_time TEXT,
  fees REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  strategy TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source TEXT NOT NULL DEFAULT 'manual'
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades(entry_time DESC);
