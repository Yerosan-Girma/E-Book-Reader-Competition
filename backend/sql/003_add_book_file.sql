-- Add file_url and file_type columns to books table for uploaded files
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add index for file_url
CREATE INDEX IF NOT EXISTS idx_books_file_url ON books(file_url);
