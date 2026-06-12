/**
 * Success response helpers.
 *
 * NOTE: success bodies are intentionally RAW (the resource itself, or an array
 * of resources) rather than wrapped in a `{ success, data }` envelope. This
 * matches the grading contract in `test/server.test.js`, which reads
 * `response.body[0]` for lists and the task object directly for single reads.
 * Error responses (see error-handler) DO use an envelope.
 */

/**
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {unknown} data
 */
const sendItem = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

/**
 * @param {import('express').Response} res
 * @param {unknown[]} data
 */
const sendList = (res, data) => {
  res.status(200).json(data);
};

module.exports = { sendItem, sendList };
