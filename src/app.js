const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { TaskStore } = require('./data/task.store');
const { loadSeedTasks } = require('./data/seed');
const { TaskService } = require('./services/task.service');
const { TaskController } = require('./controllers/task.controller');
const { createTaskRouter } = require('./routes/task.routes');
const { healthRouter } = require('./routes/health.routes');
const { requestId } = require('./middlewares/request-id');
const { requestLogger } = require('./middlewares/request-logger');
const { notFound } = require('./middlewares/not-found');
const { errorHandler } = require('./middlewares/error-handler');

/**
 * Application composition root. The store is injectable so tests can supply an
 * isolated, freshly-seeded instance; production code uses the default.
 *
 * @param {import('./data/task.store').TaskStore} [store]
 * @returns {import('express').Express}
 */
const createApp = (store = new TaskStore(loadSeedTasks())) => {
  const app = express();

  app.use(requestId);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const service = new TaskService(store);
  const controller = new TaskController(service);

  app.use('/health', healthRouter);
  app.use('/tasks', createTaskRouter(controller));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
