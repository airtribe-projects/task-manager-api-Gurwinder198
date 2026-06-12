const { TaskStore } = require('../src/data/task.store');
const { loadSeedTasks } = require('../src/data/seed');

describe('TaskStore', () => {
  it('seeds from provided tasks and continues the id counter', () => {
    const store = new TaskStore(loadSeedTasks());
    const first = store.findById(1);
    expect(first.title).toBe('Set up environment');

    const created = store.create({ title: 'New', completed: false });
    expect(created.id).toBeGreaterThan(15);
  });

  it('creates, updates, and deletes', () => {
    const store = new TaskStore();
    const task = store.create({ title: 'Task A', description: 'd', completed: false });
    expect(task.id).toBe(1);

    const updated = store.update(task.id, { completed: true });
    expect(updated.completed).toBe(true);
    expect(updated.createdAt).toBe(task.createdAt);

    expect(store.delete(task.id)).toBe(true);
    expect(store.findById(task.id)).toBeUndefined();
  });

  it('returns undefined when updating a missing task', () => {
    const store = new TaskStore();
    expect(store.update(999, { completed: true })).toBeUndefined();
  });
});
