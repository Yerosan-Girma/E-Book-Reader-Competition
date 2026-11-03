const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  const error = new Error('Admin access required');
  error.status = 403;
  next(error);
};

module.exports = { requireAdmin };
