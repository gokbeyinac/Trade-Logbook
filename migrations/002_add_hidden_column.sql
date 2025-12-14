-- Add hidden column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_trades_hidden ON trades(hidden);
