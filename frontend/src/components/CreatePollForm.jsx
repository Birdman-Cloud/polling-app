import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Start with 2 empty options
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) { // Limit number of options
        setOptions([...options, '']);
    } else {
        alert("Maximum of 10 options allowed.");
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) { // Keep at least 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
        alert("A poll must have at least two options.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(null);

    // Basic validation
    if (!question.trim()) {
        setError("Poll question cannot be empty.");
        return;
    }
    const validOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');
    if (validOptions.length < 2) {
        setError("Please provide at least two non-empty options.");
        return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim(), options: validOptions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try getting JSON error msg
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const createdPoll = await response.json();
      // Redirect to the newly created poll's page
      navigate(`/poll/${createdPoll.id}`);

    } catch (err) {
      setError(`Failed to create poll: ${err.message}`);
      console.error("Poll creation failed:", err);
      setSubmitting(false); // Re-enable form on error
    }
    // No finally block needed for setSubmitting here because navigation happens on success
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="question">Poll Question:</label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index} className="option-input-group">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
              disabled={submitting}
            />
            {options.length > 2 && ( // Show remove button only if more than 2 options
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={submitting}
                className="remove-option-btn"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && ( // Limit adding options
             <button type="button" onClick={addOption} disabled={submitting} className="add-option-btn">
                 Add Option
            </button>
        )}

      </div>


      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating Poll...' : 'Create Poll'}
      </button>
    </form>
  );
}

export default CreatePollForm;