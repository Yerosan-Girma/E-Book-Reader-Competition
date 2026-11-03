const svc = require('../services/dashboard.service');

exports.get = async (req, res, next) => {
  try {
    res.json(await svc.getDashboard(req.user.sub));
  } catch (error) {
    next(error);
  }
};
