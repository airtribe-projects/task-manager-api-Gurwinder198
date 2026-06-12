const { Messages } = require('../constants/messages');
const { NotFoundError } = require('../utils/errors');

/**
 * Catch-all for unmatched routes. Forwards a 404 to the error handler so every
 * error response shares one shape.
 *
 * @type {import('express').RequestHandler}
 */
const notFound = (_req, _res, next) => {
  next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
};

module.exports = { notFound };
