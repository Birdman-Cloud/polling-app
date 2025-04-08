import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';

function PollDetail({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingOptionId, setVotingOptionId] = useState(null); // Track which option is being voted on

  // Use useCallback to memoize fetchPoll to avoid re-creating it on every render
  const fetchPoll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}`);
      if (!response.ok) {
        if(response.status === 404) throw new Error("Poll not found.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPoll(data);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to fetch poll ${pollId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [pollId]); // Re-fetch only if pollId changes

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]); // Depend on the memoized fetchPoll function

  const handleVote = async (optionId) => {
    if (votingOptionId) return; // Prevent multiple votes at once

    setVotingOptionId(optionId); // Indicate voting is in progress for this option
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/options/${optionId}/vote`, {
        method: 'POST',
        // No body needed for this specific endpoint
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({})); // Try to get error details
         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Vote successful, re-fetch poll data to show updated counts
      // Alternatively, you could update the state locally for a faster UI response (optimistic update)
      // For robustness, re-fetching ensures consistency.
      await fetchPoll();

    } catch (err) {
      setError(`Failed to vote: ${err.message}`);
      console.error("Vote failed:", err);
    } finally {
      setVotingOptionId(null); // Re-enable voting buttons
    }
  };

  if (loading) return <p className="loading-message">Loading poll details...</p>;
  if (error && !poll) return <p className="error-message">Error loading poll: {error}</p>; // Show error only if poll data isn't already loaded
  if (!poll) return <p>Poll details not available.</p>; // Should ideally be covered by 404 error

  return (
    <div className="poll-detail">
      <h2>{poll.question}</h2>
      {error && <p className="error-message">Error during last action: {error}</p>} {/* Show voting errors */}
      <ul>
        {poll.options && poll.options.map((option) => (
          <li key={option.id} className="option-item">
            <span className="option-text">{option.text}</span>
            <span className="vote-count">Votes: {option.votes}</span>
            <button
              onClick={() => handleVote(option.id)}
              disabled={votingOptionId === option.id} // Disable button while voting for this option
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