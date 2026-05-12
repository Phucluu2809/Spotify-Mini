const express = require('express');
const router = express.Router();

const {
  getArtists,
  getArtistById,
  getArtistByName,
  getSongsByArtist,
  createArtist
} = require('../controllers/artist.controller');

router.get('/', getArtists);
router.get('/:id/songs', getSongsByArtist);
router.get('/name/:name', getArtistByName);
router.get('/:id', getArtistById);
router.post('/', createArtist);

module.exports = router;
