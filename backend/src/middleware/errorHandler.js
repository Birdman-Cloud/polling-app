// Basic error handling middleware
function errorHandler(err, req, res, next) {
    console.error("ERROR:", err.message); // Log the error message
    // Avoid sending stack trace in production for security
    // console.error(err.stack);
  
    // Check if the error has a status code, otherwise default to 500
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
    });
  }
  
  module.exports = errorHandler;