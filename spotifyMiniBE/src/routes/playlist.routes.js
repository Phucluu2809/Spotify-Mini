const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

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
router.post('/', auth, createPlaylist);
router.get('/', auth, getUserPlaylists);
router.get('/:id', auth, getPlaylistById);
router.put('/:id', auth, updatePlaylist);
router.delete('/:id', auth, deletePlaylist);
router.post('/:id/songs', auth, addSongToPlaylist);
router.delete('/:id/songs/:songId', auth, removeSongFromPlaylist);

module.exports = router;
