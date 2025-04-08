import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/polls`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPolls(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch polls:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []); // Empty dependency array means run once on mount

  if (loading) return <p className="loading-message">Loading polls...</p>;
  if (error) return <p className="error-message">Error loading polls: {error}</p>;
  if (polls.length === 0) return <p>No polls available yet.</p>;

  return (
    <ul>
      {polls.map((poll) => (
        <li key={poll.id}>
          <Link to={`/poll/${poll.id}`}>{poll.question}</Link>
          <br />
          <small>Created: {new Date(poll.created_at).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}

export default PollList;