const User = require('../models/user.model');
const Artist = require('../models/artist.model');

const getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).populate({
      path: 'followedArtists',
      select: '_id name image bio followers songs',
      populate: {
        path: 'songs',
        select: '_id title artist album image audio duration'
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.followedArtists || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('_id name email role followers followedArtists createdAt');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getFollowedArtists,
  getUserProfile
};
