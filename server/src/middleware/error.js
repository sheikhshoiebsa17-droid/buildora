export function notFound(req, res) {
  res.fail(`Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, _next) {
  const status = typeof err.status === 'number' && err.status >= 400 ? err.status : 500;
  if (status >= 500) {
    console.error('[error]', err);
  }
  res.fail(err.userMessage || err.message || 'Internal server error', status);
}
