const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getFollowedArtists,
  getUserProfile
} = require('../controllers/user.controller');

// Get user profile
router.get('/profile', auth, getUserProfile);

// Get user's followed artists
router.get('/followed-artists', auth, getFollowedArtists);

module.exports = router;
