const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getFollowedArtists,
  getUserProfile,
  updateUserProfile,
  getFollowedPlaylists,
  followPlaylist,
  unfollowPlaylist,
  getFollowedAlbums,
  followAlbum,
  unfollowAlbum
} = require('../controllers/user.controller');

// Get user profile
router.get('/profile', auth, getUserProfile);
router.patch('/profile', auth, upload.single('avatar'), updateUserProfile);

// Get user's followed artists
router.get('/followed-artists', auth, getFollowedArtists);
router.get('/followed-playlists', auth, getFollowedPlaylists);
router.post('/followed-playlists/:playlistId', auth, followPlaylist);
router.delete('/followed-playlists/:playlistId', auth, unfollowPlaylist);
router.get('/followed-albums', auth, getFollowedAlbums);
router.post('/followed-albums/:albumId', auth, followAlbum);
router.delete('/followed-albums/:albumId', auth, unfollowAlbum);

module.exports = router;
