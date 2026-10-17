export function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginated(data, total, page, limit) {
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export function dateRange(value) {
  if (!value) return null;
  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
}
