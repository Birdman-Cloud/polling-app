-- Migration to create the polls table
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index maybe later if needed on question, but ID is primary key.