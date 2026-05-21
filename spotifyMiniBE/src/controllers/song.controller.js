const Song = require('../models/song.model');
const { ensureSongDuration, ensureSongDurations } = require('../utils/songDuration');

const getSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    await ensureSongDurations(songs);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    await ensureSongDuration(song);
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSongs,
  getSongById
};
