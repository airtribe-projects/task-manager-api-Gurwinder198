const { Defaults } = require('../constants/defaults');

/**
 * In-memory task storage backed by a Map. This is the single abstraction over
 * the data structure — no other module touches the underlying collection, so
 * swapping in a real database later only requires reimplementing this class.
 */
class TaskStore {
  /** @param {import('../types/task.types').Task[]} [seed] */
  constructor(seed = []) {
    /** @type {Map<number, import('../types/task.types').Task>} */
    this.tasks = new Map();
    this.counter = 0;

    for (const task of seed) {
      this.tasks.set(task.id, task);
      if (task.id > this.counter) this.counter = task.id;
    }
  }

  /** @returns {import('../types/task.types').Task[]} */
  findAll() {
    return Array.from(this.tasks.values());
  }

  /**
   * @param {number} id
   * @returns {import('../types/task.types').Task | undefined}
   */
  findById(id) {
    return this.tasks.get(id);
  }

  /**
   * @param {import('../types/task.types').CreateTaskInput} input
   * @returns {import('../types/task.types').Task}
   */
  create(input) {
    const now = new Date().toISOString();
    const task = {
      id: ++this.counter,
      title: input.title,
      description: input.description,
      completed: input.completed,
      priority: input.priority ?? Defaults.DEFAULT_PRIORITY,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Applies a partial change set, preserving id and createdAt and refreshing
   * updatedAt. Returns undefined when the task does not exist.
   *
   * @param {number} id
   * @param {import('../types/task.types').PatchTaskInput} changes
   * @returns {import('../types/task.types').Task | undefined}
   */
  update(id, changes) {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...changes,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  /**
   * @param {number} id
   * @returns {boolean} true when a task was removed
   */
  delete(id) {
    return this.tasks.delete(id);
  }
}

module.exports = { TaskStore };
