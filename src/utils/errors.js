const { HttpStatus } = require('../constants/http-status');

/**
 * Base application error. Operational errors are expected failures
 * (bad input, missing resource) that the global handler maps to a response.
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {{ field: string, message: string }[]} [errors]
   */
  constructor(message, statusCode, errors) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  /** @param {string} message */
  constructor(message) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

class ValidationError extends AppError {
  /**
   * @param {string} message
   * @param {{ field: string, message: string }[]} errors
   */
  constructor(message, errors) {
    super(message, HttpStatus.BAD_REQUEST, errors);
  }
}

module.exports = { AppError, NotFoundError, ValidationError };
