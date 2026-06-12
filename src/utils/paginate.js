/**
 * Slices a list into a page and returns it alongside pagination metadata.
 *
 * @param {T[]} items   the full (already filtered/sorted) collection
 * @param {number} page 1-based page number
 * @param {number} limit page size
 * @returns {{ data: T[], meta: { total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean } }}
 * @template T
 */
const paginate = (items, page, limit) => {
  const total = items.length;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = { paginate };
