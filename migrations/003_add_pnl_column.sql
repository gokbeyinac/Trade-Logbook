-- Add pnl column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl REAL;
