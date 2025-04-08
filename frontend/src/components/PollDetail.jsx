import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { API_BASE_URL } from '../services/api';

// Basic email validation (presence of @)
const isEmailLike = (email) => {
    return email && typeof email === 'string' && email.includes('@') && email.length > 3;
};

function PollDetail({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(''); // State for email input (used for voting AND deletion auth)
  const [votingOptionId, setVotingOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for deletion process
  const navigate = useNavigate(); // Hook for navigation

  const fetchPoll = useCallback(async () => {
    // setLoading(true); // Only set loading true on initial mount/pollId change
    // setError(null); // Clear error only on success
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
      setPoll(null); // Ensure poll is null if fetch fails after initial load
      console.error(`Failed to fetch poll ${pollId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    setLoading(true);
    setHasVoted(false);
    setUserEmail('');
    setIsDeleting(false); // Reset deleting state
    fetchPoll();
  }, [fetchPoll]); // Depend on the memoized fetchPoll function

  const handleVote = async (optionId) => {
    // ... (Keep existing handleVote function as is) ...
    if (votingOptionId || hasVoted) return;

    if (!isEmailLike(userEmail)) {
        setError("Please enter a valid email address to vote.");
        return;
    }

    setVotingOptionId(optionId);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/options/${optionId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_email: userEmail }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
         if (response.status === 409) {
             setHasVoted(true);
             throw new Error(responseData.message || "You have already voted on this poll.");
         }
         throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }
      setHasVoted(true);
      await fetchPoll();

    } catch (err) {
      setError(`Failed to vote: ${err.message}`);
      console.error("Vote failed:", err);
    } finally {
      setVotingOptionId(null);
    }
  };


  // --- NEW FUNCTION ---
  const handleDeletePoll = async () => {
      if (isDeleting) return; // Prevent double clicks

      // Check if email is entered for authorization
      if (!isEmailLike(userEmail)) {
          setError("Please enter the admin email address to delete.");
          return;
      }

      // Confirmation dialog
      if (!window.confirm(`Are you sure you want to delete this poll? This action cannot be undone.`)) {
          return;
      }

      setIsDeleting(true);
      setError(null);

      try {
          const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
              // Send email in body for backend authorization check
              body: JSON.stringify({ user_email: userEmail }),
          });

          if (response.status === 204) {
              // Successful deletion (204 No Content)
              alert('Poll deleted successfully!'); // Simple feedback
              navigate('/'); // Redirect to home page
          } else {
              // Handle errors (403 Forbidden, 404 Not Found, 500 etc.)
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Failed to delete poll. Status: ${response.status}`);
          }

      } catch (err) {
          setError(`Error deleting poll: ${err.message}`);
          console.error("Poll deletion failed:", err);
          setIsDeleting(false); // Re-enable button on error
      }
      // No finally block needed for setIsDeleting here because navigation happens on success
  };


  if (loading) return <p className="loading-message">Loading poll details...</p>;
  if (error && !poll) return <p className="error-message">Error loading poll: {error}</p>;
  if (!poll) return <p>Poll not found or could not be loaded.</p>; // Handle case where poll becomes null after error

  return (
    <div className="poll-detail">
      <h2>{poll.question}</h2>

      {error && <p className="error-message">{error}</p>}

      {/* Email Input - Now used for voting AND deletion */}
      {/* Consider adding separate prompts or labels if UI becomes confusing */}
      {!hasVoted && (
          <div className="form-group email-input-group">
              <label htmlFor="userEmail">Your Email (required to vote/delete):</label>
              <input
                  type="email"
                  id="userEmail"
                  placeholder="you@example.com / admin@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={votingOptionId !== null || hasVoted || isDeleting}
                  required
              />
          </div>
      )}

      {hasVoted && <p className="voted-message">Thank you for voting!</p>}

      <ul className="options-list">
        {/* ... (Keep existing options mapping as is) ... */}
        {poll.options && poll.options.map((option) => (
          <li key={option.id} className="option-item">
            <span className="option-text">{option.text}</span>
            <span className="vote-count">Votes: {option.votes}</span>
            <button
              className="vote-button"
              onClick={() => handleVote(option.id)}
              disabled={!isEmailLike(userEmail) || votingOptionId !== null || hasVoted || isDeleting}
            >
              {votingOptionId === option.id ? 'Voting...' : 'Vote'}
            </button>
          </li>
        ))}
         {!poll.options || poll.options.length === 0 && <p>No options found for this poll.</p>}
      </ul>

      <p><small>Created: {new Date(poll.created_at).toLocaleString()}</small></p>

      {/* --- NEW DELETE BUTTON SECTION --- */}
      <div className="delete-section">
          <hr />
          <p>Enter admin email above and click delete to remove this poll.</p>
          <button
              className="delete-button"
              onClick={handleDeletePoll}
              disabled={!isEmailLike(userEmail) || isDeleting || hasVoted || votingOptionId !== null} // Disable if email invalid, deleting, voting, or already voted
          >
              {isDeleting ? 'Deleting...' : 'Delete Poll (Admin)'}
          </button>
          <p><small>(Requires email: admin@example.com)</small></p>
      </div>
      {/* --- END DELETE BUTTON SECTION --- */}

    </div>
  );
}

export default PollDetail;
