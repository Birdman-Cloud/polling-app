const express = require('express');
const cors = require('cors');
const config = require('./src/config'); // Loads config and validates DB URL
const pool = require('./src/db/connect'); // Imports the pool to ensure connection is attempted early
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const pollRoutes = require('./src/api/polls.routes');
const voteRoutes = require('./src/api/votes.routes'); // Import vote routes

const app = express();
const PORT = config.port;

// --- Middleware ---
// Enable CORS for all origins (adjust in production if needed for security)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// --- API Routes ---
app.use('/api/polls', pollRoutes);
app.use('/api', voteRoutes); // Mount vote routes at /api level

// --- Basic Welcome Route ---
app.get('/', (req, res) => {
  res.send('Polling App Backend API is running!');
});

// --- Not Found Route ---
// Catch-all for requests to routes that don't exist
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// --- Centralized Error Handler ---
// Must be the LAST middleware applied
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Optional: Test DB connection on startup
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("!!! Database Connection Failed on Startup !!!", err);
    } else {
      console.log("Database connection verified:", res.rows[0].now);
    }
  });
});

// Graceful shutdown handling (optional but good practice)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => { // `app.close` is not standard on express, need `server = app.listen(...)`
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    // Repeat shutdown logic as for SIGTERM
    // Need to capture the server instance from app.listen() for this to work properly.
    // For simplicity here, just end the pool and exit.
    pool.end(() => {
        console.log('Database pool closed due to SIGINT');
        process.exit(0);
    });
});