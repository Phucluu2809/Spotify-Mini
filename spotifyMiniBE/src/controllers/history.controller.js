const History = require('../models/history.model');

const addHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { song } = req.body;

    if (!song) return res.status(400).json({ message: 'Song data required' });

    const entry = new History({ userId, song });
    await entry.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(200);

    // Deduplicate theo songId, chỉ giữ lần nghe gần nhất
    const seen = new Set();
    const unique = [];
    for (const entry of history) {
      const key = entry.song.songId;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entry);
        if (unique.length >= 20) break;
      }
    }

    res.json(unique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await History.deleteMany({ userId });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addHistory, getHistory, getRecentlyPlayed, clearHistory };