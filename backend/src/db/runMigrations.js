// Simple script to run SQL migration files in order
const fs = require('fs');
const path = require('path');
const pool = require('./connect'); // Use the configured pool

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations() {
  console.log('Starting database migrations...');
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order (e.g., 001 before 002)

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    console.log('Found migration files:', files);

    // Acquire a client from the pool for transactional control if needed,
    // but for simple CREATE TABLE IF NOT EXISTS, running sequentially is often fine.
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Executing migration: ${file}...`);
      await pool.query(sql);
      console.log(`Finished migration: ${file}`);
    }

    console.log('Database migrations completed successfully.');

  } catch (error) {
    console.error('Error running database migrations:', error);
    process.exit(1); // Exit with error code
  } finally {
    // End the pool if this script is run standalone
    // In a real app, the pool stays open while the server runs
    await pool.end();
    console.log('Database pool closed.');
  }
}

runMigrations();