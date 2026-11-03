-- =====================================================
-- ReadRise PostgreSQL schema
-- =====================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(50)  UNIQUE NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  display_name   VARCHAR(100),
  avatar_url     TEXT,
  role           VARCHAR(20)  NOT NULL DEFAULT 'reader'
                  CHECK (role IN ('visitor','reader','admin','competition_reviewer')),
  profile_public BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Books (only publish books you are legally allowed to distribute)
CREATE TABLE IF NOT EXISTS books (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  author         VARCHAR(255) NOT NULL,
  isbn           VARCHAR(20) UNIQUE,
  cover_url      TEXT,
  description    TEXT,
  language       VARCHAR(50)  NOT NULL DEFAULT 'en',
  total_chapters INT          NOT NULL DEFAULT 0,
  is_published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_by     INT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_title_author
  ON books USING gin (to_tsvector('simple', title || ' ' || author));

-- Book <-> Category (M:N)
CREATE TABLE IF NOT EXISTS book_categories (
  book_id     INT NOT NULL REFERENCES books(id)      ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id             SERIAL PRIMARY KEY,
  book_id        INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title          VARCHAR(255) NOT NULL,
  content        TEXT NOT NULL,
  word_count     INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, chapter_number)
);
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id);

-- User's personal (self-reported) books
CREATE TABLE IF NOT EXISTS user_books (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  total_pages     INT NOT NULL CHECK (total_pages > 0),
  pages_completed INT NOT NULL DEFAULT 0 CHECK (pages_completed >= 0),
  start_date      DATE,
  completion_date DATE,
  personal_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reading sessions (tracked on-platform; used for competition)
CREATE TABLE IF NOT EXISTS reading_sessions (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  book_id          INT NOT NULL REFERENCES books(id)  ON DELETE CASCADE,
  chapter_id       INT REFERENCES chapters(id) ON DELETE SET NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','finished','abandoned','flagged')),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INT NOT NULL DEFAULT 0,
  pages_read       INT NOT NULL DEFAULT 0,
  is_verified      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_book ON reading_sessions(book_id);

-- Reading events (immutable audit trail per session)
CREATE TABLE IF NOT EXISTS reading_events (
  id          BIGSERIAL PRIMARY KEY,
  session_id  INT NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
  event_type  VARCHAR(30) NOT NULL
               CHECK (event_type IN ('start','pause','resume','heartbeat','finish','flag')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata    JSONB
);
CREATE INDEX IF NOT EXISTS idx_events_session ON reading_events(session_id);

-- Reading goals
CREATE TABLE IF NOT EXISTS reading_goals (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period         VARCHAR(20) NOT NULL CHECK (period IN ('daily','weekly','monthly','yearly')),
  target_minutes INT NOT NULL CHECK (target_minutes > 0),
  target_books   INT NOT NULL DEFAULT 0,
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  type         VARCHAR(30) NOT NULL
                CHECK (type IN ('daily_minutes','books_in_period','streak','category_explore')),
  target_value INT NOT NULL,
  category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  badge_id     INT,
  points       INT NOT NULL DEFAULT 0,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  challenge_id INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress     INT NOT NULL DEFAULT 0,
  status       VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress','completed','failed')),
  completed_at TIMESTAMPTZ,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon        VARCHAR(50),
  criteria    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id   INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
  id                   SERIAL PRIMARY KEY,
  title                VARCHAR(255) NOT NULL,
  description          TEXT,
  scoring_rule_version VARCHAR(50) NOT NULL,
  scoring_rules        JSONB NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                        CHECK (status IN ('upcoming','active','reviewing','finalized')),
  prize_description    TEXT,
  prize_funded         BOOLEAN NOT NULL DEFAULT FALSE,
  created_by           INT REFERENCES users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competition_scores (
  id                   SERIAL PRIMARY KEY,
  competition_id       INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id              INT NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  points               INT NOT NULL DEFAULT 0,
  eligible             BOOLEAN NOT NULL DEFAULT TRUE,
  scoring_rule_version VARCHAR(50) NOT NULL,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (competition_id, user_id)
);

CREATE TABLE IF NOT EXISTS competition_awards (
  id                SERIAL PRIMARY KEY,
  competition_id    INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id           INT NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  rank              INT NOT NULL,
  prize_description TEXT,
  is_final          BOOLEAN NOT NULL DEFAULT FALSE,
  awarded_at        TIMESTAMPTZ,
  UNIQUE (competition_id, user_id)
);

-- Review flags (anti-cheat)
CREATE TABLE IF NOT EXISTS review_flags (
  id          SERIAL PRIMARY KEY,
  session_id  INT REFERENCES reading_sessions(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected')),
  reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs (admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    INT REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   INT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);