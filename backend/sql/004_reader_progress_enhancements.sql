-- Migration 004: Reader progress enhancements for multi-format reader
-- Stores format, position (page/CFI/scroll), total units, completion, and bookmarks

ALTER TABLE books ALTER COLUMN file_type TYPE VARCHAR(150);

ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'chapter';
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS total_units NUMERIC;
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS bookmarks JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Also record format in reading sessions for audit & stats
ALTER TABLE reading_sessions ADD COLUMN IF NOT EXISTS format VARCHAR(50);
