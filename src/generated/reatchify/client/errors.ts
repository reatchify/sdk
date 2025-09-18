// Custom error classes
// This file defines custom error types for API error handling

/**
 * API Error - Base class for API-related errors
 */
export class ApiError extends Error {
  /** HTTP status code */
  statusCode?: number;
  /** Response data */
  response?: any;

  constructor(
    message: string,
    statusCode?: number,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Validation Error - For input validation failures
 */
export class ValidationError extends Error {
  /** Field that failed validation */
  field?: string;
  /** Invalid value */
  value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Network Error - For network connectivity issues
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

