-- Migration to create the options table
CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_poll
        FOREIGN KEY(poll_id)
        REFERENCES polls(id)
        ON DELETE CASCADE -- If a poll is deleted, its options are also deleted
);

-- Add an index on poll_id for faster lookups of options for a specific poll
CREATE INDEX IF NOT EXISTS idx_options_poll_id ON options(poll_id);