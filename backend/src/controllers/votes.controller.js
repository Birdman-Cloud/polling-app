const pool = require('../db/connect');

// Controller to increment the vote count for a specific option
exports.addVote = async (req, res, next) => {
  const { optionId } = req.params;

  if (isNaN(parseInt(optionId))) {
      return res.status(400).json({ message: 'Invalid Option ID provided.' });
  }

  try {
    const query = `
      UPDATE options
      SET votes = votes + 1
      WHERE id = $1
      RETURNING id, poll_id, text, votes
    `;
    const result = await pool.query(query, [optionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Option not found' });
    }

    // Optional: could fetch the full poll data here to return,
    // but returning the updated option is simpler.
    res.status(200).json(result.rows[0]); // Return the updated option

  } catch (error) {
    error.message = `Error adding vote: ${error.message}`;
    next(error);
  }
};