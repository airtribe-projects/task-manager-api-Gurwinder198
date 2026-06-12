const { HttpStatus } = require('../constants/http-status');
const { Messages } = require('../constants/messages');
const { AppError } = require('../utils/errors');

/**
 * Centralized error middleware. Operational AppErrors map to their status code
 * and message; anything else is logged and returned as a 500. Error bodies use
 * the `{ success: false, message, errors? }` envelope.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    const body = { success: false, message: err.message };
    if (err.errors) body.errors = err.errors;
    res.status(err.statusCode).json(body);
    return;
  }

  // Malformed JSON body (thrown by express.json()) is a client error, not a 500.
  if (err.type === 'entity.parse.failed') {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }

  console.error(`[${req.id}] Unhandled error:`, err);
  res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: Messages.INTERNAL_ERROR });
};

module.exports = { errorHandler };
