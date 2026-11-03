-- Migration 005: Synchronize OAuth, Purchases, Progress Tracking & Performance Indexes

-- 1. Add google_id to users if not present
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 2. Add total_reading_seconds to reading_progress
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS total_reading_seconds INT DEFAULT 0;

-- 3. Create book_purchases table for Chapa payment tracking
CREATE TABLE IF NOT EXISTS book_purchases (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id         INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  currency        VARCHAR(10) NOT NULL DEFAULT 'ETB',
  payment_method  VARCHAR(50) DEFAULT 'telebirr',
  payment_status  VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  tx_ref          VARCHAR(50) UNIQUE,
  chapa_reference VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_purchases_user ON book_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_book ON book_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_tx_ref ON book_purchases(tx_ref);

-- 4. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_books_published_created ON books (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books (created_by);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_status ON reading_sessions (user_id, status);
