const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  patchTaskSchema,
  listTaskSchema,
  priorityParamSchema,
} = require('../validations/task.validation');

/**
 * @param {import('../controllers/task.controller').TaskController} controller
 * @returns {import('express').Router}
 */
const createTaskRouter = (controller) => {
  const router = Router();

  router.get('/', validate(listTaskSchema), controller.list);
  router.post('/', validate(createTaskSchema), controller.create);
  // Registered before '/:id' so the literal segment takes precedence.
  router.get('/priority/:level', validate(priorityParamSchema), controller.getByPriority);
  router.get('/:id', controller.getById);
  router.put('/:id', validate(updateTaskSchema), controller.replace);
  router.patch('/:id', validate(patchTaskSchema), controller.patch);
  router.delete('/:id', controller.remove);

  return router;
};

module.exports = { createTaskRouter };
