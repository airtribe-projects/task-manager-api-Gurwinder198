/**
 * Logs one line per completed request: id, method, path, status, duration.
 *
 * @type {import('express').RequestHandler}
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${req.id}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
};

module.exports = { requestLogger };
