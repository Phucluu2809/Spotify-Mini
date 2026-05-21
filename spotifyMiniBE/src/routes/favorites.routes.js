const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getFavorites,
  toggleFavorite,
} = require('../controllers/favorites.controller');

router.use(requireAuth);
router.get('/', getFavorites);
router.post('/:songId', toggleFavorite);

module.exports = router;