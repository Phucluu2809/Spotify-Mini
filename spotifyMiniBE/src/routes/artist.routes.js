const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getArtists,
  getArtistById,
  getArtistByName,
  getSongsByArtist,
  createArtist,
  followArtist,
  unfollowArtist,
  isFollowing
} = require('../controllers/artist.controller');

router.get('/', getArtists);
router.get('/:id/songs', getSongsByArtist);
router.get('/name/:name', getArtistByName);
router.get('/:id', getArtistById);
router.post('/', createArtist);

// Follow endpoints
router.post('/:artistId/follow', auth, followArtist);
router.delete('/:artistId/follow', auth, unfollowArtist);
router.get('/:artistId/is-following', auth, isFollowing);

module.exports = router;
