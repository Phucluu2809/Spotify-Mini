const User = require('../models/user.model');
const Song = require('../models/song.model');

// GET /favorites — trả về danh sách song objects
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const songs = await Song.find({ _id: { $in: user.favorites } });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /favorites/:songId — toggle thêm/xóa khỏi danh sách yêu thích
const toggleFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.favorites.indexOf(songId);
    if (index === -1) {
      user.favorites.push(songId);   // thêm vào
    } else {
      user.favorites.splice(index, 1); // xóa khỏi
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFavorites, toggleFavorite };