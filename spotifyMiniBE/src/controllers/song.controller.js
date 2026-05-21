const Song = require('../models/song.model');
const { ensureSongDuration, ensureSongDurations } = require('../utils/songDuration');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSongs = async (req, res) => {
  try {
    const keyword = String(req.query.q || '').trim();
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 0;

    const filter = keyword
      ? {
          $or: [
            { title: { $regex: escapeRegex(keyword), $options: 'i' } },
            { artist: { $regex: escapeRegex(keyword), $options: 'i' } },
            { album: { $regex: escapeRegex(keyword), $options: 'i' } }
          ]
        }
      : {};

    let query = Song.find(filter).sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);

    const songs = await query;
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
