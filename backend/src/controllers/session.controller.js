const svc = require('../services/session.service');

exports.start  = async (req, res, next) => {
  try { res.status(201).json(await svc.start(req.user.sub, req.body)); }
  catch (e) { next(e); }
};
exports.pause  = async (req, res, next) => {
  try { res.json(await svc.pause(req.validated.params.id, req.user.sub)); }
  catch (e) { next(e); }
};
exports.resume = async (req, res, next) => {
  try { res.json(await svc.resume(req.validated.params.id, req.user.sub)); }
  catch (e) { next(e); }
};
exports.heartbeat = async (req, res, next) => {
  try { res.json(await svc.heartbeat(req.validated.params.id, req.user.sub, req.body)); }
  catch (e) { next(e); }
};
exports.finish = async (req, res, next) => {
  try { res.json(await svc.finish(req.validated.params.id, req.user.sub, req.body)); }
  catch (e) { next(e); }
};
exports.history = async (req, res, next) => {
  try { res.json(await svc.history(req.user.sub)); }
  catch (e) { next(e); }
};

exports.saveProgress = async (req, res, next) => {
  try {
    const { bookId, ...progress } = req.validated.body;
    res.json(await svc.saveProgress(req.user.sub, bookId, progress));
  } catch (e) { next(e); }
};

exports.getProgress = async (req, res, next) => {
  try {
    res.json((await svc.getProgress(
      req.user.sub,
      req.validated.params.bookId,
    )) || {});
  } catch (e) { next(e); }
};
