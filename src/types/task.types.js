/**
 * @typedef {'low' | 'medium' | 'high'} Priority
 */

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {boolean} completed
 * @property {Priority} priority
 * @property {string} createdAt  ISO 8601 timestamp
 * @property {string} updatedAt  ISO 8601 timestamp
 */

/**
 * @typedef {Object} CreateTaskInput
 * @property {string} title
 * @property {string} description
 * @property {boolean} completed
 * @property {Priority} [priority]  defaults to 'medium'
 */

/**
 * @typedef {Object} PatchTaskInput
 * @property {string} [title]
 * @property {string} [description]
 * @property {boolean} [completed]
 * @property {Priority} [priority]
 */

/**
 * @typedef {Object} ListTaskQuery
 * @property {boolean} [completed]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sort]
 */

module.exports = {};
