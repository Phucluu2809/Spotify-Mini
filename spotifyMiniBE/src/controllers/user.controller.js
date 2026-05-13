const User = require('../models/user.model');
const Artist = require('../models/artist.model');
const Playlist = require('../models/playlist.model');
const Album = require('../models/album.model');

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

    const user = await User.findById(userId).select('_id name email role followers followedArtists followedPlaylists followedAlbums createdAt');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFollowedPlaylists = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).populate({
      path: 'followedPlaylists',
      populate: { path: 'songs', select: '_id title artist album image audio duration' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.followedPlaylists || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const followPlaylist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playlistId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!Array.isArray(user.followedPlaylists)) user.followedPlaylists = [];

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (playlist.userId?.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot follow your own playlist' });
    }

    const alreadyFollowed = user.followedPlaylists.some((id) => id.toString() === playlistId);
    if (!alreadyFollowed) {
      user.followedPlaylists.push(playlistId);
      await user.save();
    }

    res.json({ message: 'Playlist followed', followedPlaylists: user.followedPlaylists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unfollowPlaylist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playlistId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!Array.isArray(user.followedPlaylists)) user.followedPlaylists = [];

    user.followedPlaylists = user.followedPlaylists.filter((id) => id.toString() !== playlistId);
    await user.save();

    res.json({ message: 'Playlist unfollowed', followedPlaylists: user.followedPlaylists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFollowedAlbums = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).populate({
      path: 'followedAlbums',
      populate: { path: 'songs', select: '_id title artist album image audio duration' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.followedAlbums || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const followAlbum = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { albumId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!Array.isArray(user.followedAlbums)) user.followedAlbums = [];

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const alreadyFollowed = user.followedAlbums.some((id) => id.toString() === albumId);
    if (!alreadyFollowed) {
      user.followedAlbums.push(albumId);
      await user.save();
    }

    res.json({ message: 'Album followed', followedAlbums: user.followedAlbums });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unfollowAlbum = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { albumId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!Array.isArray(user.followedAlbums)) user.followedAlbums = [];

    user.followedAlbums = user.followedAlbums.filter((id) => id.toString() !== albumId);
    await user.save();

    res.json({ message: 'Album unfollowed', followedAlbums: user.followedAlbums });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getFollowedArtists,
  getUserProfile,
  getFollowedPlaylists,
  followPlaylist,
  unfollowPlaylist,
  getFollowedAlbums,
  followAlbum,
  unfollowAlbum
};
