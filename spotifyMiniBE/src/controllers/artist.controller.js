const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const User = require('../models/user.model');
const { ensureSongDurations } = require('../utils/songDuration');

const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().populate('songs');
    await Promise.all(artists.map((artist) => ensureSongDurations(artist.songs)));
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('songs');
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    await ensureSongDurations(artist.songs);
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtistByName = async (req, res) => {
  try {
    const { name } = req.params;
    const artist = await Artist.findOne({ name: { $regex: name, $options: 'i' } }).populate('songs');
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    await ensureSongDurations(artist.songs);
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSongsByArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const songs = await Song.find({ artistId: id });
    await ensureSongDurations(songs);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createArtist = async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    if (!name) return res.status(400).json({ message: 'Artist name is required' });

    const artist = new Artist({ name, image, bio });
    await artist.save();
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const followArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const artist = await Artist.findById(artistId);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    if (artist.userId && artist.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (!user.followedArtists.some((id) => id.toString() === artistId)) {
      user.followedArtists.push(artistId);
      await user.save();
    }

    res.json({ message: 'Artist followed', followedArtists: user.followedArtists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unfollowArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.followedArtists = user.followedArtists.filter(id => id.toString() !== artistId);
    await user.save();

    res.json({ message: 'Artist unfollowed', followedArtists: user.followedArtists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const isFollowing = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const following = user.followedArtists.some((id) => id.toString() === artistId);
    res.json({ following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getArtists,
  getArtistById,
  getArtistByName,
  getSongsByArtist,
  createArtist,
  followArtist,
  unfollowArtist,
  isFollowing
};
