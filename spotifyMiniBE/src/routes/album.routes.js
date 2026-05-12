const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addSongToAlbum,
  removeSongFromAlbum
} = require('../controllers/album.controller');

// Public endpoints
router.get('/', getAlbums);
router.get('/:id', getAlbumById);

// Protected endpoints
router.post('/', auth, createAlbum);
router.put('/:id', auth, updateAlbum);
router.delete('/:id', auth, deleteAlbum);
router.post('/:id/songs', auth, addSongToAlbum);
router.delete('/:id/songs/:songId', auth, removeSongFromAlbum);

module.exports = router;
