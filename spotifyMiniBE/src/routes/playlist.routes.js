const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} = require('../controllers/playlist.controller');

// All playlist routes require authentication
router.post('/', auth, createPlaylist);
router.get('/', auth, getUserPlaylists);
router.get('/:id', auth, getPlaylistById);
router.put('/:id', auth, updatePlaylist);
router.delete('/:id', auth, deletePlaylist);
router.post('/:id/songs', auth, addSongToPlaylist);
router.delete('/:id/songs/:songId', auth, removeSongFromPlaylist);

module.exports = router;
