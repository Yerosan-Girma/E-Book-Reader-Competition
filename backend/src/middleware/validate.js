module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }

  // Express 5 exposes req.query through a getter, so keep validated values
  // separately instead of trying to replace req.query.
  req.validated ??= {};
  req.validated[source] = result.data;
  if (source === 'body') req.body = result.data;
  next();
};
