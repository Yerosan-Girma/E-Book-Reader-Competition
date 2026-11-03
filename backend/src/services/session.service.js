const repo = require('../repositories/session.repo');

const MAX_ALLOWED_GAP_SECONDS = 15 * 60; // no heartbeats for >15 min → flag

const start = (userId, payload) => repo.start(userId, payload);
const pause = (sessionId, userId) => repo.transition(sessionId, userId, 'active', 'paused', 'pause');
const resume = (sessionId, userId) => repo.transition(sessionId, userId, 'paused', 'active', 'resume');
const heartbeat = (sessionId, userId, body) => repo.heartbeat(sessionId, userId, body?.seconds);
const finish = (sessionId, userId, body) => repo.finish(sessionId, userId, MAX_ALLOWED_GAP_SECONDS, body?.seconds);
const history = (userId) => repo.history(userId);
const saveProgress = (userId, bookId, progress) => repo.saveProgress(userId, bookId, progress);
const getProgress = (userId, bookId) => repo.getProgress(userId, bookId);

module.exports = {
  start,
  pause,
  resume,
  finish,
  history,
  heartbeat,
  saveProgress,
  getProgress,
};
