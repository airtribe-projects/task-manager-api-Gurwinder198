const Defaults = {
  PORT: 3000,
  PAGE: 1,
  LIMIT: 20,
  SORT_FIELDS: ['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title'],
  PRIORITY_LEVELS: ['low', 'medium', 'high'],
  DEFAULT_PRIORITY: 'medium',
};

module.exports = { Defaults };
