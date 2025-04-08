const pool = require('../db/connect');

// Controller to create a new poll
exports.createPoll = async (req, res, next) => {
  const { question, options } = req.body;

  // Basic Validation
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'Poll question and at least two options (as an array) are required.' });
  }
  if (options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
      return res.status(400).json({ message: 'All options must be non-empty strings.' });
  }

  const client = await pool.connect(); // Get client for transaction
  try {
    await client.query('BEGIN'); // Start transaction

    // Insert the poll question
    const pollInsertQuery = 'INSERT INTO polls (question) VALUES ($1) RETURNING id, question, created_at';
    const pollResult = await client.query(pollInsertQuery, [question]);
    const newPoll = pollResult.rows[0];

    // Insert options for the poll
    const optionInsertQuery = 'INSERT INTO options (poll_id, text) VALUES ($1, $2) RETURNING id, text, votes';
    const optionsPromises = options.map(optionText =>
      client.query(optionInsertQuery, [newPoll.id, optionText])
    );
    const optionsResults = await Promise.all(optionsPromises);
    const newOptions = optionsResults.map(result => result.rows[0]);

    await client.query('COMMIT'); // Commit transaction

    res.status(201).json({ ...newPoll, options: newOptions });

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    error.message = `Error creating poll: ${error.message}`;
    next(error); // Pass error to the error handler middleware
  } finally {
    client.release(); // Release client back to the pool
  }
};

// Controller to get all polls (simplified: ID and question only)
exports.getAllPolls = async (req, res, next) => {
  try {
    const query = 'SELECT id, question, created_at FROM polls ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    error.message = `Error fetching polls: ${error.message}`;
    next(error);
  }
};

// Controller to get a single poll with its options and votes
exports.getPollById = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid Poll ID provided.' });
  }

  try {
    // Fetch poll details
    const pollQuery = 'SELECT id, question, created_at FROM polls WHERE id = $1';
    const pollResult = await pool.query(pollQuery, [id]);

    if (pollResult.rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    const poll = pollResult.rows[0];

    // Fetch options for the poll
    const optionsQuery = 'SELECT id, text, votes FROM options WHERE poll_id = $1 ORDER BY id';
    const optionsResult = await pool.query(optionsQuery, [id]);
    poll.options = optionsResult.rows; // Add options to the poll object

    res.status(200).json(poll);

  } catch (error) {
    error.message = `Error fetching poll details: ${error.message}`;
    next(error);
  }
};