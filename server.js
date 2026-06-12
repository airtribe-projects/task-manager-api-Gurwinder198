require('dotenv').config();

const app = require('./app');
const { Defaults } = require('./src/constants/defaults');

const port = Number(process.env.PORT) || Defaults.PORT;

const server = app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});

/** Closes the HTTP server cleanly, then exits. */
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
