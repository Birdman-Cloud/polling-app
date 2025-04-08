const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Render recommends SSL for external connections, pg defaults should handle it if DATABASE_URL includes ssl params
  // ssl: {
  //   rejectUnauthorized: false // Necessary for some cloud provider connections if not using internal URL
  // }
});

pool.on('connect', () => {
  console.log('Connected to the Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit application on pool error
});

module.exports = pool; // Export the pool instance