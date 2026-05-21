const Album = require('../models/album.model');
const Song = require('../models/song.model');
const { ensureSongDurations } = require('../utils/songDuration');

const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate('songs').sort({ year: -1, name: 1 });
    await Promise.all(albums.map((album) => ensureSongDurations(album.songs)));
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findById(id).populate('songs');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    await ensureSongDurations(album.songs);
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAlbum = async (req, res) => {
  try {
    const { name, artist, artistId, cover, year, genre, songIds } = req.body;

    if (!name) return res.status(400).json({ message: 'Album name is required' });
    if (!artist) return res.status(400).json({ message: 'Artist name is required' });

    const album = new Album({
      name,
      artist,
      artistId: artistId || null,
      cover: cover || null,
      year: year || new Date().getFullYear(),
      genre: genre || '',
      songs: songIds || []
    });

    await album.save();
    await album.populate('songs');
    res.status(201).json(album);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Album name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, artist, cover, year, genre, songIds } = req.body;

    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    if (name) album.name = name;
    if (artist) album.artist = artist;
    if (cover !== undefined) album.cover = cover;
    if (year) album.year = year;
    if (genre !== undefined) album.genre = genre;
    if (songIds) album.songs = songIds;

    await album.save();
    await album.populate('songs');
    res.json(album);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Album name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await Album.findByIdAndDelete(id);
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSongToAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) return res.status(400).json({ message: 'Song ID is required' });

    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (album.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in album' });
    }

    album.songs.push(songId);
    await album.save();
    await album.populate('songs');
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeSongFromAlbum = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    album.songs = album.songs.filter(s => s.toString() !== songId);
    await album.save();
    await album.populate('songs');
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addSongToAlbum,
  removeSongFromAlbum
};
