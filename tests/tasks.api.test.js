const request = require('supertest');
const { createApp } = require('../src/app');
const { TaskStore } = require('../src/data/task.store');
const { loadSeedTasks } = require('../src/data/seed');

/** Fresh, isolated, seeded app per call. */
const makeApp = () => createApp(new TaskStore(loadSeedTasks()));

describe('Task API', () => {
  it('creates a task (201) and returns a raw object', async () => {
    const res = await request(makeApp())
      .post('/tasks')
      .send({ title: 'New Task', description: 'New Task Description', completed: false });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Task');
    expect(typeof res.body.id).toBe('number');
  });

  it('rejects create with only a title (400) using the error envelope', async () => {
    const res = await request(makeApp()).post('/tasks').send({ title: 'New Task' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('lists tasks as a raw array', async () => {
    const res = await request(makeApp()).get('/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(typeof res.body[0].id).toBe('number');
  });

  it('filters by completed', async () => {
    const res = await request(makeApp()).get('/tasks?completed=false');

    expect(res.status).toBe(200);
    expect(res.body.every((task) => task.completed === false)).toBe(true);
  });

  it('gets a task by id', async () => {
    const res = await request(makeApp()).get('/tasks/1');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Set up environment');
  });

  it('returns 404 for a missing task', async () => {
    const res = await request(makeApp()).get('/tasks/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });

  it('replaces a task via PUT (200)', async () => {
    const res = await request(makeApp())
      .put('/tasks/1')
      .send({ title: 'Updated Task', description: 'Updated', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('rejects PUT with a non-boolean completed (400)', async () => {
    const res = await request(makeApp())
      .put('/tasks/1')
      .send({ title: 'Updated Task', description: 'Updated', completed: 'true' });

    expect(res.status).toBe(400);
  });

  it('patches a task (200)', async () => {
    const res = await request(makeApp()).patch('/tasks/1').send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('deletes a task (200) and returns 404 on a missing task', async () => {
    const app = makeApp();

    const deleted = await request(app).delete('/tasks/1');
    expect(deleted.status).toBe(200);

    const missing = await request(app).delete('/tasks/999');
    expect(missing.status).toBe(404);
  });

  it('defaults priority to "medium" when omitted on create', async () => {
    const res = await request(makeApp())
      .post('/tasks')
      .send({ title: 'No priority', description: 'd', completed: false });

    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('medium');
  });

  it('accepts an explicit priority on create', async () => {
    const res = await request(makeApp())
      .post('/tasks')
      .send({ title: 'High one', description: 'd', completed: false, priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('high');
  });

  it('rejects an invalid priority (400)', async () => {
    const res = await request(makeApp())
      .post('/tasks')
      .send({ title: 'Bad one', description: 'd', completed: false, priority: 'urgent' });

    expect(res.status).toBe(400);
  });

  it('retrieves tasks by priority level', async () => {
    const app = makeApp();
    await request(app)
      .post('/tasks')
      .send({ title: 'High task', description: 'd', completed: false, priority: 'high' });

    const res = await request(app).get('/tasks/priority/high');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((task) => task.priority === 'high')).toBe(true);
    expect(res.body.some((task) => task.title === 'High task')).toBe(true);
  });

  it('rejects an invalid priority level on the priority route (400)', async () => {
    const res = await request(makeApp()).get('/tasks/priority/urgent');
    expect(res.status).toBe(400);
  });

  it('returns a { data, meta } envelope when paginating', async () => {
    const res = await request(makeApp()).get('/tasks?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta).toEqual({
      total: 15,
      page: 1,
      limit: 5,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('keeps GET /tasks a raw array when no pagination params are given', async () => {
    const res = await request(makeApp()).get('/tasks');

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.meta).toBeUndefined();
  });

  it('returns 400 (not 500) for a malformed JSON body', async () => {
    const res = await request(makeApp())
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title":"broken", ');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('responds to GET /health', async () => {
    const res = await request(makeApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
