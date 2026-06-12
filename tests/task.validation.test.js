const { createTaskSchema, updateTaskSchema } = require('../src/validations/task.validation');

describe('task validation', () => {
  it('accepts a valid create payload', () => {
    const result = createTaskSchema.safeParse({
      body: { title: 'Valid title', description: 'x', completed: false },
    });
    expect(result.success).toBe(true);
  });

  it('rejects create with only a title (missing description and completed)', () => {
    const result = createTaskSchema.safeParse({ body: { title: 'New Task' } });
    expect(result.success).toBe(false);
  });

  it('rejects create without a description', () => {
    const result = createTaskSchema.safeParse({
      body: { title: 'New Task', completed: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty description', () => {
    const result = createTaskSchema.safeParse({
      body: { title: 'New Task', description: '', completed: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a title shorter than 3 chars', () => {
    const result = createTaskSchema.safeParse({ body: { title: 'ab', completed: false } });
    expect(result.success).toBe(false);
  });

  it('rejects a non-boolean completed on update', () => {
    const result = updateTaskSchema.safeParse({
      body: { title: 'Updated Task', description: 'd', completed: 'true' },
    });
    expect(result.success).toBe(false);
  });
});
