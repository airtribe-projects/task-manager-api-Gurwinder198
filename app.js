/**
 * Entry module for the Express application.
 *
 * Exports a ready-to-use, seeded app instance (without calling `listen`) so it
 * can be driven directly by Supertest — this is what `test/server.test.js`
 * requires via `require('../app')`. Network listening lives in `server.js`.
 */
const { createApp } = require('./src/app');

module.exports = createApp();
