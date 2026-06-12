const { randomUUID } = require('crypto');

/**
 * Assigns a unique id to each request (honouring an inbound X-Request-Id when
 * present) and echoes it back in the response header for traceability.
 *
 * @type {import('express').RequestHandler}
 */
const requestId = (req, res, next) => {
  const incoming = req.header('X-Request-Id');
  req.id = incoming && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = { requestId };
