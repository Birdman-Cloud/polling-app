import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';

// Basic email validation (presence of @)
const isEmailLike = (email) => {
    return email && typeof email === 'string' && email.includes('@') && email.length > 3;
};

function PollDetail({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(''); // State for email input
  const [votingOptionId, setVotingOptionId] = useState(null); // Track which option is being voted on
  const [hasVoted, setHasVoted] = useState(false); // Track if user has successfully voted in this session/load

  // Use useCallback to memoize fetchPoll to avoid re-creating it on every render
  const fetchPoll = useCallback(async () => {
    // Don't reset loading if only re-fetching after vote
    // setLoading(true);
    // Keep previous error message until successful fetch or new error
    // setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Poll not found.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPoll(data);
      setError(null); // Clear error on successful fetch
    } catch (err) {
      setError(err.message);
      console.error(`Failed to fetch poll ${pollId}:`, err);
    } finally {
      setLoading(false); // Always set loading false after attempt
    }
  }, [pollId]); // Re-fetch only if pollId changes

  useEffect(() => {
    setLoading(true); // Set loading true on initial load or pollId change
    setHasVoted(false); // Reset voted status when poll changes
    setUserEmail(''); // Clear email when poll changes
    fetchPoll();
  }, [fetchPoll]); // Depend on the memoized fetchPoll function

  const handleVote = async (optionId) => {
    if (votingOptionId || hasVoted) return; // Prevent multiple votes at once or if already voted

    // Validate email before sending
    if (!isEmailLike(userEmail)) {
        setError("Please enter a valid email address to vote.");
        return;
    }

    setVotingOptionId(optionId); // Indicate voting is in progress for this option
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/options/${optionId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_email: userEmail }), // Send email in body
      });

      const responseData = await response.json().catch(() => ({})); // Try getting JSON response

      if (!response.ok) {
         // Handle specific "already voted" error
         if (response.status === 409) {
             setHasVoted(true); // Mark as voted even if backend caught it
             throw new Error(responseData.message || "You have already voted on this poll.");
         }
         throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      // Vote successful
      setHasVoted(true); // Mark as voted successfully for this session
      // Re-fetch poll data to show updated counts
      await fetchPoll();
      // Optionally clear email field after successful vote
      // setUserEmail('');

    } catch (err) {
      setError(`Failed to vote: ${err.message}`);
      console.error("Vote failed:", err);
    } finally {
      setVotingOptionId(null); // Re-enable voting buttons
    }
  };

  if (loading) return <p className="loading-message">Loading poll details...</p>;
  // Display error prominently if the poll couldn't load at all
  if (error && !poll) return <p className="error-message">Error loading poll: {error}</p>;
  if (!poll) return <p>Poll details not available.</p>;

  return (
    <div className="poll-detail">
      <h2>{poll.question}</h2>

      {/* Display general errors or voting errors */}
      {error && <p className="error-message">{error}</p>}

      {/* Email Input - Show only if user hasn't successfully voted yet */}
      {!hasVoted && (
          <div className="form-group email-input-group">
              <label htmlFor="userEmail">Your Email (to vote):</label>
              <input
                  type="email"
                  id="userEmail"
                  placeholder="you@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={votingOptionId !== null || hasVoted} // Disable if voting or already voted
                  required
              />
          </div>
      )}

      {/* Display message if user has voted */}
      {hasVoted && <p className="voted-message">Thank you for voting!</p>}

      <ul className="options-list">
        {poll.options && poll.options.map((option) => (
          <li key={option.id} className="option-item">
            <span className="option-text">{option.text}</span>
            <span className="vote-count">Votes: {option.votes}</span>
            <button
              className="vote-button"
              onClick={() => handleVote(option.id)}
              // Disable if email is invalid, voting is in progress, or already voted
              disabled={!isEmailLike(userEmail) || votingOptionId !== null || hasVoted}
            >
              {votingOptionId === option.id ? 'Voting...' : 'Vote'}
            </button>
          </li>
        ))}
         {!poll.options || poll.options.length === 0 && <p>No options found for this poll.</p>}
      </ul>
       <p><small>Created: {new Date(poll.created_at).toLocaleString()}</small></p>
    </div>
  );
}

export default PollDetail;

