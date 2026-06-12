const { readFileSync } = require('fs');
const { join } = require('path');
const { Defaults } = require('../constants/defaults');

/**
 * Loads the initial tasks from the repo-root `task.json` (the grading seed).
 * Resolved relative to this file so it works regardless of the process cwd.
 *
 * @returns {import('../types/task.types').Task[]}
 */
const loadSeedTasks = () => {
  const path = join(__dirname, '..', '..', 'task.json');
  const parsed = JSON.parse(readFileSync(path, 'utf-8'));
  const now = new Date().toISOString();

  return parsed.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority ?? Defaults.DEFAULT_PRIORITY,
    createdAt: now,
    updatedAt: now,
  }));
};

module.exports = { loadSeedTasks };
