const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function buildListQuery(req, options = {}) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;
  const sortField = String(req.query.sortBy || 'createdAt');
  const sortDir = req.query.sortDir === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDir };
  const search = String(req.query.search || '').trim();
  const filter = {};
  for (const key of options.allowedFilters || []) {
    if (req.query[key] !== undefined && req.query[key] !== '') filter[key] = req.query[key];
  }
  return { filter, page, limit, skip, sort, search };
}

export function pageMeta(total, page, limit) {
  return { total, page, limit, pages: Math.ceil(total / limit) || 1 };
}
