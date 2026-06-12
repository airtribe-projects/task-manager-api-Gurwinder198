const { ZodError } = require('zod');
const { Messages } = require('../constants/messages');
const { ValidationError } = require('../utils/errors');

/**
 * Builds a middleware that validates the request against a Zod schema shaped as
 * `{ body?, query?, params? }`. On success the parsed (coerced) body replaces
 * `req.body`; on failure it forwards a ValidationError to the error handler.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body !== undefined) req.body = parsed.body;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const containers = new Set(['body', 'query', 'params']);
      const errors = err.errors.map((issue) => ({
        field: issue.path.filter((segment) => !containers.has(segment)).join('.'),
        message: issue.message,
      }));
      next(new ValidationError(Messages.VALIDATION_FAILED, errors));
      return;
    }
    next(err);
  }
};

module.exports = { validate };
