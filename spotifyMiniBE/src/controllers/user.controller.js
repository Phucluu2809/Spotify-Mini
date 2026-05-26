const User = require('../models/user.model');
const Artist = require('../models/artist.model');
const Playlist = require('../models/playlist.model');
const Album = require('../models/album.model');
const Song = require('../models/song.model');
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const { ensureSongDurations } = require('../utils/songDuration');

const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
  followedArtists: user.followedArtists,
  followedPlaylists: user.followedPlaylists,
  followedAlbums: user.followedAlbums,
  createdAt: user.createdAt,
});

const removeLocalFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to remove temporary upload file:', err.message || err);
    }
  }
};

const assertCloudinaryConfigured = () => {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    const err = new Error('Cloudinary is not configured');
    err.statusCode = 500;
    throw err;
  }
};

const uploadAvatarToCloudinary = async (file) => {
  try {
    assertCloudinaryConfigured();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'image',
      folder: 'spotify-mini/avatars',
    });
    return result.secure_url;
  } finally {
    await removeLocalFile(file.path);
  }
};

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
    await Promise.all((user.followedArtists || []).map((artist) => ensureSongDurations(artist.songs)));

    res.json(user.followedArtists || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('_id name email role avatar followedArtists followedPlaylists followedAlbums createdAt');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      await removeLocalFile(req.file?.path);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      await removeLocalFile(req.file?.path);
      return res.status(404).json({ message: 'User not found' });
    }

    const nextName = req.body.name?.trim();
    if (!nextName) {
      await removeLocalFile(req.file?.path);
      return res.status(400).json({ message: 'Name is required' });
    }

    const previousName = user.name;
    if (user.role === 'artist' && previousName !== nextName) {
      const existingArtist = await Artist.findOne({
        name: nextName,
        userId: { $ne: user._id },
      });
      if (existingArtist) {
        await removeLocalFile(req.file?.path);
        return res.status(409).json({ message: 'Name is already in use' });
      }
    }

    let nextAvatar = user.avatar || '';
    if (req.file) {
      nextAvatar = await uploadAvatarToCloudinary(req.file);
    }

    user.name = nextName;
    user.avatar = nextAvatar;
    await user.save();

    if (user.role === 'artist') {
      const artist = await Artist.findOne({ userId: user._id });
      if (artist) {
        artist.name = nextName;
        if (nextAvatar) artist.image = nextAvatar;
        await artist.save();
        await Promise.all([
          Song.updateMany({ artistId: artist._id }, { artist: nextName }),
          Album.updateMany({ artistId: artist._id }, { artist: nextName }),
        ]);
      } else if (previousName !== nextName) {
        await Artist.updateOne({ name: previousName }, { name: nextName, image: nextAvatar });
      }
    }

    res.json(serializeUser(user));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Name is already in use' });
    }
    console.error('Update profile error:', err.message || err);
    res.status(err.statusCode || 500).json({ message: err.message });
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
    await Promise.all((user.followedPlaylists || []).map((playlist) => ensureSongDurations(playlist.songs)));

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
    await Promise.all((user.followedAlbums || []).map((album) => ensureSongDurations(album.songs)));

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
  updateUserProfile,
  getFollowedPlaylists,
  followPlaylist,
  unfollowPlaylist,
  getFollowedAlbums,
  followAlbum,
  unfollowAlbum
};
