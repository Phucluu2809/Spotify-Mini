const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  createPlaylist,
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} = require('../controllers/playlist.controller');

// Public endpoint
router.get('/public', getPublicPlaylists);

// Protected endpoints
router.post('/', auth, upload.single('coverImage'), createPlaylist);
router.get('/', auth, getUserPlaylists);
router.get('/:id', auth, getPlaylistById);
router.put('/:id', auth, upload.single('coverImage'), updatePlaylist);
router.delete('/:id', auth, deletePlaylist);
router.post('/:id/songs', auth, addSongToPlaylist);
router.delete('/:id/songs/:songId', auth, removeSongFromPlaylist);

module.exports = router;
