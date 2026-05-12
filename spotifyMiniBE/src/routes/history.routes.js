const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  addHistory,
  getHistory,
  getRecentlyPlayed,
  clearHistory,
  getRecommendations   // thêm dòng này
} = require('../controllers/history.controller');

router.use(requireAuth);

router.post('/', addHistory);
router.get('/', getHistory);
router.get('/recommendations', getRecommendations);   // thêm trước recently-played
router.get('/recently-played', getRecentlyPlayed);
router.delete('/', clearHistory);

module.exports = router;