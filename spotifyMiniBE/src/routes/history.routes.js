const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  addHistory,
  getHistory,
  getRecentlyPlayed,
  removeHistoryEntry,
  removeRecentlyPlayedSong,
  clearRecentlyPlayed,
  clearHistory,
  getRecommendations
} = require('../controllers/history.controller');

router.use(requireAuth);

router.post('/', addHistory);
router.get('/', getHistory);
router.get('/recommendations', getRecommendations);
router.get('/recently-played', getRecentlyPlayed);
router.delete('/recently-played/:songId', removeRecentlyPlayedSong);
router.delete('/recently-played', clearRecentlyPlayed);
router.delete('/:id', removeHistoryEntry);
router.delete('/', clearHistory);

module.exports = router;
