const { z } = require('zod');
const { Defaults } = require('../constants/defaults');

const title = z.string().min(3).max(100);
const description = z.string().min(1, 'Description must not be empty').max(1000);
const completed = z.boolean();
const priority = z.enum(Defaults.PRIORITY_LEVELS);

/**
 * On create (and full PUT update), `title`, `description`, and `completed` are
 * all required — matching the assignment's "required fields" wording. `priority`
 * is optional and defaults to 'medium'. PATCH keeps every field optional.
 */
const createTaskSchema = z.object({
  body: z.object({
    title,
    description,
    completed,
    priority: priority.default(Defaults.DEFAULT_PRIORITY),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title,
    description,
    completed,
    priority: priority.default(Defaults.DEFAULT_PRIORITY),
  }),
});

const patchTaskSchema = z.object({
  body: z
    .object({
      title: title.optional(),
      description: description.optional(),
      completed: completed.optional(),
      priority: priority.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

const priorityParamSchema = z.object({
  params: z.object({
    level: priority,
  }),
});

const listTaskSchema = z.object({
  query: z.object({
    completed: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    sort: z.enum(Defaults.SORT_FIELDS).optional(),
  }),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  patchTaskSchema,
  listTaskSchema,
  priorityParamSchema,
};
