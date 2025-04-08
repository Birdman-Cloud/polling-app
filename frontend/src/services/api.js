// Centralized API Base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'; // Fallback if env var is not set

// You could add wrapper functions here for fetch if needed,
// e.g., to automatically handle JSON parsing or add headers.
// For simplicity, we'll use fetch directly in components for now.

// Example wrapper (optional):
/*
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json', // Assume JSON unless specified otherwise
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Attempt to parse error details from backend JSON response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Ignore if response is not JSON
    }
    const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  // Assume JSON response if Content-Type indicates it, handle cases without content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
     return await response.json();
  } else if (response.status === 204 || response.status === 201 && !contentType) { // Handle No Content or potential empty 201
     return null; // Or return { success: true } or similar
  } else {
    return await response.text(); // Fallback for non-JSON responses
  }
}
*/