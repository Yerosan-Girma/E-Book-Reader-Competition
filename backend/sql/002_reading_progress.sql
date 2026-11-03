CREATE TABLE IF NOT EXISTS reading_progress (
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id        INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id     INT REFERENCES chapters(id) ON DELETE SET NULL,
  scroll_percent NUMERIC(5,2) NOT NULL DEFAULT 0
                  CHECK (scroll_percent >= 0 AND scroll_percent <= 100),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_progress_user ON reading_progress(user_id);