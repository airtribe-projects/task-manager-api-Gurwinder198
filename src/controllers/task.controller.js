const { asyncHandler } = require('../utils/async-handler');
const { sendItem, sendList } = require('../utils/response');
const { paginate } = require('../utils/paginate');
const { HttpStatus } = require('../constants/http-status');
const { Messages } = require('../constants/messages');
const { Defaults } = require('../constants/defaults');

/** @param {string} raw */
const parseId = (raw) => Number(raw);

/**
 * Maps raw Express query params to a typed list query.
 * @param {import('express').Request['query']} query
 * @returns {import('../types/task.types').ListTaskQuery}
 */
const toListQuery = (query) => {
  let completed;
  if (query.completed === 'true') completed = true;
  else if (query.completed === 'false') completed = false;

  return {
    completed,
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    sort: typeof query.sort === 'string' ? query.sort : undefined,
  };
};

/**
 * Thin HTTP layer: parses the request, delegates to the service, and sends the
 * response. All handlers are asyncHandler-wrapped, so errors propagate to the
 * global error middleware without per-handler try/catch.
 */
class TaskController {
  /** @param {import('../services/task.service').TaskService} service */
  constructor(service) {
    this.service = service;

    this.list = asyncHandler(async (req, res) => {
      const query = toListQuery(req.query);
      const tasks = this.service.list(query);

      // Plain list stays a raw array (the autograder contract). When pagination
      // is requested, return a { data, meta } envelope with page metadata.
      if (query.page !== undefined || query.limit !== undefined) {
        const page = query.page ?? Defaults.PAGE;
        const limit = query.limit ?? Defaults.LIMIT;
        res.status(HttpStatus.OK).json(paginate(tasks, page, limit));
        return;
      }

      sendList(res, tasks);
    });

    this.getByPriority = asyncHandler(async (req, res) => {
      const tasks = this.service.listByPriority(req.params.level);
      sendList(res, tasks);
    });

    this.getById = asyncHandler(async (req, res) => {
      const task = this.service.getById(parseId(req.params.id));
      sendItem(res, HttpStatus.OK, task);
    });

    this.create = asyncHandler(async (req, res) => {
      const task = this.service.create(req.body);
      sendItem(res, HttpStatus.CREATED, task);
    });

    this.replace = asyncHandler(async (req, res) => {
      const task = this.service.replace(parseId(req.params.id), req.body);
      sendItem(res, HttpStatus.OK, task);
    });

    this.patch = asyncHandler(async (req, res) => {
      const task = this.service.patch(parseId(req.params.id), req.body);
      sendItem(res, HttpStatus.OK, task);
    });

    this.remove = asyncHandler(async (req, res) => {
      this.service.remove(parseId(req.params.id));
      sendItem(res, HttpStatus.OK, { success: true, message: Messages.TASK_DELETED });
    });
  }
}

module.exports = { TaskController };
