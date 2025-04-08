const pool = require('../db/connect');

// Helper for basic email format check (not exhaustive)
const isValidEmail = (email) => {
  return email && typeof email === 'string' && email.includes('@');
};

// Controller to add a vote for a specific option, checking for prior votes by email
exports.addVote = async (req, res, next) => {
  const { optionId } = req.params;
  const { user_email } = req.body; // Get email from request body

  // --- Validation ---
  if (isNaN(parseInt(optionId))) {
    return res.status(400).json({ message: 'Invalid Option ID provided.' });
  }
  if (!isValidEmail(user_email)) {
    return res.status(400).json({ message: 'Valid user email is required to vote.' });
  }
  // Normalize email to lowercase to prevent case sensitivity issues
  const normalizedEmail = user_email.toLowerCase();

  const client = await pool.connect(); // Use a client for transaction
  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Get poll_id for the given optionId
    const optionQuery = 'SELECT poll_id FROM options WHERE id = $1';
    const optionResult = await client.query(optionQuery, [optionId]);

    if (optionResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Rollback before sending response
      return res.status(404).json({ message: 'Option not found' });
    }
    const { poll_id } = optionResult.rows[0];

    // 2. Check if this email has already voted on this poll
    const checkVoteQuery = 'SELECT id FROM user_votes WHERE poll_id = $1 AND user_email = $2';
    const checkVoteResult = await client.query(checkVoteQuery, [poll_id, normalizedEmail]);

    if (checkVoteResult.rows.length > 0) {
      // User has already voted
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'This email has already voted on this poll.' }); // 409 Conflict
    }

    // 3. Record the new vote in user_votes table
    const recordVoteQuery = 'INSERT INTO user_votes (poll_id, user_email) VALUES ($1, $2)';
    await client.query(recordVoteQuery, [poll_id, normalizedEmail]);

    // 4. Increment the vote count for the option
    const incrementVoteQuery = `
      UPDATE options
      SET votes = votes + 1
      WHERE id = $1
      RETURNING id, poll_id, text, votes
    `;
    const incrementResult = await client.query(incrementVoteQuery, [optionId]);
    const updatedOption = incrementResult.rows[0]; // Get the updated option data

    await client.query('COMMIT'); // Commit transaction

    // Return the updated option data
    res.status(200).json(updatedOption);

  } catch (error) {
    await client.query('ROLLBACK'); // Ensure rollback on any error
    error.message = `Error adding vote: ${error.message}`;
    next(error); // Pass error to the central handler
  } finally {
    client.release(); // Release client back to the pool
  }
};

