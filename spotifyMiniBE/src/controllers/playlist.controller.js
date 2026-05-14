const Playlist = require('../models/playlist.model');
const Song = require('../models/song.model');
const { ensureSongDurations } = require('../utils/songDuration');

const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Playlist name is required' });

    const playlist = new Playlist({
      userId,
      name,
      description: description || '',
      isPrivate: isPrivate || false,
      songs: []
    });

    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await Playlist.find({ userId }).populate('songs').sort({ createdAt: -1 });
    await Promise.all(playlists.map((playlist) => ensureSongDurations(playlist.songs)));
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPublicPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPrivate: false }).populate('songs').sort({ updatedAt: -1, createdAt: -1 });
    await Promise.all(playlists.map((playlist) => ensureSongDurations(playlist.songs)));
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const playlist = await Playlist.findById(id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    const isOwner = Boolean(userId && playlist.userId.toString() === userId.toString());
    if (playlist.isPrivate && !isOwner) {
      return res.status(403).json({ message: 'This playlist is private' });
    }
    await ensureSongDurations(playlist.songs);
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cover, isPrivate } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check ownership
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own playlists' });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (cover) playlist.cover = cover;
    if (isPrivate !== undefined) playlist.isPrivate = isPrivate;

    await playlist.save();
    await playlist.populate('songs');
    await ensureSongDurations(playlist.songs);
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check ownership
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own playlists' });
    }

    await Playlist.findByIdAndDelete(id);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const userId = req.user.id;

    if (!songId) return res.status(400).json({ message: 'Song ID is required' });

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check ownership
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own playlists' });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();
    await playlist.populate('songs');
    await ensureSongDurations(playlist.songs);

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check ownership
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own playlists' });
    }

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    await playlist.save();
    await playlist.populate('songs');
    await ensureSongDurations(playlist.songs);

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
};
