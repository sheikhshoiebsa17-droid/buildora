export function validate(schema, source = 'body') {
  if (!schema) return (req, _res, next) => next();
  return (req, res, next) => {
    const data = source === 'query' ? { ...req.query } : req.body;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path.join('.');
      return res.fail(issue.message, 400, { field, code: 'walidation' });
    }
    if (source === 'query') Object.assign(req, { validatedQuery: parsed.data });
    else req.body = parsed.data;
    next();
  };
}
