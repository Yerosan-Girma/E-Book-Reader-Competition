function notFound(_req, res) {
  res.status(404).json({ error: 'Not Found' });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };