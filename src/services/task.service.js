const { Messages } = require('../constants/messages');
const { NotFoundError } = require('../utils/errors');

/**
 * Business logic for tasks. Knows nothing about HTTP — it operates purely on
 * the TaskStore and throws domain errors that the controller layer surfaces.
 */
class TaskService {
  /** @param {import('../data/task.store').TaskStore} store */
  constructor(store) {
    this.store = store;
  }

  /**
   * Returns the full collection after applying completion filtering and sorting.
   * Pagination (slicing + meta) is handled in the controller layer.
   *
   * @param {import('../types/task.types').ListTaskQuery} [query]
   * @returns {import('../types/task.types').Task[]}
   */
  list(query = {}) {
    let tasks = this.store.findAll();

    if (typeof query.completed === 'boolean') {
      tasks = tasks.filter((task) => task.completed === query.completed);
    }

    if (query.sort) {
      const desc = query.sort.startsWith('-');
      const field = desc ? query.sort.slice(1) : query.sort;
      tasks = [...tasks].sort((a, b) => {
        const av = a[field] ?? '';
        const bv = b[field] ?? '';
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
    }

    return tasks;
  }

  /**
   * @param {import('../types/task.types').Priority} level
   * @returns {import('../types/task.types').Task[]}
   */
  listByPriority(level) {
    return this.store.findAll().filter((task) => task.priority === level);
  }

  /**
   * @param {number} id
   * @returns {import('../types/task.types').Task}
   */
  getById(id) {
    const task = this.store.findById(id);
    if (!task) throw new NotFoundError(Messages.TASK_NOT_FOUND);
    return task;
  }

  /**
   * @param {import('../types/task.types').CreateTaskInput} input
   * @returns {import('../types/task.types').Task}
   */
  create(input) {
    return this.store.create(input);
  }

  /**
   * Full update (PUT).
   * @param {number} id
   * @param {import('../types/task.types').CreateTaskInput} input
   * @returns {import('../types/task.types').Task}
   */
  replace(id, input) {
    const updated = this.store.update(id, input);
    if (!updated) throw new NotFoundError(Messages.TASK_NOT_FOUND);
    return updated;
  }

  /**
   * Partial update (PATCH).
   * @param {number} id
   * @param {import('../types/task.types').PatchTaskInput} input
   * @returns {import('../types/task.types').Task}
   */
  patch(id, input) {
    const updated = this.store.update(id, input);
    if (!updated) throw new NotFoundError(Messages.TASK_NOT_FOUND);
    return updated;
  }

  /** @param {number} id */
  remove(id) {
    const deleted = this.store.delete(id);
    if (!deleted) throw new NotFoundError(Messages.TASK_NOT_FOUND);
  }
}

module.exports = { TaskService };
