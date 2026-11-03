const svc = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try { res.status(201).json(await svc.register(req.body)); }
  catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try { res.json(await svc.login(req.body)); }
  catch (e) { next(e); }
};

exports.googleLogin = async (req, res, next) => {
  try {
    res.json(await svc.loginWithGoogle(req.body));
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await svc.me(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) { next(e); }
};
