const Song = require('../models/song.model');

const getSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSongs,
  getSongById
};