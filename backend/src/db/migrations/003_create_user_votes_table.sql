-- Migration to create the user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL,
    user_email TEXT NOT NULL, -- Store email used for voting
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint to link to the polls table
    CONSTRAINT fk_poll
        FOREIGN KEY(poll_id)
        REFERENCES polls(id)
        ON DELETE CASCADE, -- If a poll is deleted, associated votes are also deleted

    -- Ensure a user (email) can only vote once per poll
    CONSTRAINT unique_user_poll_vote UNIQUE (poll_id, user_email)
);

-- Optional: Index for faster lookups if needed later
-- CREATE INDEX IF NOT EXISTS idx_user_votes_poll_email ON user_votes(poll_id, user_email);
-- CREATE INDEX IF NOT EXISTS idx_user_votes_email ON user_votes(user_email);

