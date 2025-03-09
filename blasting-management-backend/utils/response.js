/* exports.successResponse = (res, data, message = 'Success') => {
    res.status(200).json({ message, data });
  };
  
  exports.errorResponse = (res, error, status = 500) => {
    res.status(status).json({ message: error.message || 'An error occurred' });
  }; */

  
    //exports.success = (res, data, message = 'Success') => res.status(200).json({ message, data }),
    //.error = (res, message = 'Error', status = 500) => res.status(status).json({ message }),
  

  // utils/response.js

/*exports.successResponse = (res, data, message = 'Operation successful') => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (res, message = 'Operation failed', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

class ResponseUtil {
  static successResponse(res, statusCode = 200, message = "Success", data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static errorResponse(res, statusCode = 500, message = "Error occurred", error = null) {
    // Log error for server-side tracking if needed
    if (error) {
      console.error('Error details:', error);
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }

  // Specific response methods for common scenarios
  static notFoundResponse(res, message = "Resource not found") {
    return this.errorResponse(res, 404, message);
  }

  static badRequestResponse(res, message = "Invalid request", errors = null) {
    return this.errorResponse(res, 400, message, errors);
  }

  static unauthorizedResponse(res, message = "Unauthorized access") {
    return this.errorResponse(res, 401, message);
  }

  static forbiddenResponse(res, message = "Access forbidden") {
    return this.errorResponse(res, 403, message);
  }

  static validationErrorResponse(res, errors) {
    return this.errorResponse(res, 422, "Validation failed", errors);
  }
}

const formatResponse = (res, statusCode, message, data = null) => {
  const response = {
      success: statusCode >= 200 && statusCode < 300,
      message: message
  };

  if (data !== null) {
      response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Error occurred', errors = null) => {
  const response = {
      success: false,
      message: message
  };

  if (errors !== null) {
      response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { ResponseUtil, formatResponse , errorResponse}; */

// Standalone functions
const successResponse = (res, data, message = 'Operation successful') => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'Operation failed') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// ResponseUtil class
class ResponseUtil {
  static successResponse(res, statusCode = 200, message = "Success", data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static errorResponse(res, statusCode = 500, message = "Error occurred", error = null) {
    if (error) {
      console.error("Error details:", error);
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }

  // Additional specific responses
  static notFoundResponse(res, message = "Resource not found") {
    return this.errorResponse(res, 404, message);
  }

  static badRequestResponse(res, message = "Invalid request", errors = null) {
    return this.errorResponse(res, 400, message, errors);
  }

  static unauthorizedResponse(res, message = "Unauthorized access") {
    return this.errorResponse(res, 401, message);
  }

  static forbiddenResponse(res, message = "Access forbidden") {
    return this.errorResponse(res, 403, message);
  }

  static validationErrorResponse(res, errors) {
    return this.errorResponse(res, 422, "Validation failed", errors);
  }
}

// Generic formatting functions
const formatResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Ensure error formatting is consistent
const detailedErrorResponse = (res, statusCode = 500, message = "Error occurred", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Export everything properly
module.exports = {
  ResponseUtil,
  errorResponse,
  formatResponse,
  detailedErrorResponse,
};


  
  