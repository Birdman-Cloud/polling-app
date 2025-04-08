require('dotenv').config(); // Load .env file contents into process.env

const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000, // Default to 3000 if PORT not set
};

// Basic validation
if (!config.databaseUrl) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1); // Exit if DB URL is missing
}

module.exports = config;