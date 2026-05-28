const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const multerUpload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const Album = require('../models/album.model');
const { ensureSongDurations, normalizeDurationMs } = require('../utils/songDuration');

async function getArtistForUser(userId, res) {
  const artist = await Artist.findOne({ userId });
  if (!artist) {
    res.status(403).json({ message: 'Artist profile not found for this user' });
    return null;
  }
  return artist;
}

// GET /artist-dashboard/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user.id }).populate('songs');
    if (!artist) {
      return res.status(403).json({ message: 'Artist profile not found for this user' });
    }
    await ensureSongDurations(artist.songs);
    res.json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /artist-dashboard/albums
router.get('/albums', requireAuth, async (req, res) => {
  try {
    const artist = await getArtistForUser(req.user.id, res);
    if (!artist) return;

    const albums = await Album.find({ artistId: artist._id }).populate('songs').sort({ createdAt: -1 });
    await Promise.all(albums.map((album) => ensureSongDurations(album.songs)));
    res.json(albums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /artist-dashboard/albums
router.post('/albums', requireAuth, async (req, res) => {
  try {
    const artist = await getArtistForUser(req.user.id, res);
    if (!artist) return;

    const { name, year, genre, cover } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Album name is required' });
    }

    const existing = await Album.findOne({
      artistId: artist._id,
      name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(400).json({ message: 'Album already exists for this artist' });
    }

    const album = await Album.create({
      name: name.trim(),
      artist: artist.name,
      artistId: artist._id,
      year: year || new Date().getFullYear(),
      genre: genre || '',
      cover: cover || '',
      songs: [],
    });

    res.status(201).json(album);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /artist-dashboard/albums/:albumId
router.put('/albums/:albumId', requireAuth, async (req, res) => {
  try {
    const artist = await getArtistForUser(req.user.id, res);
    if (!artist) return;

    const { albumId } = req.params;
    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    if (album.artistId?.toString() !== artist._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own albums' });
    }

    const { name, cover } = req.body;
    const nextName = typeof name === 'string' ? name.trim() : '';
    const previousName = album.name;

    if (!nextName) {
      return res.status(400).json({ message: 'Album name is required' });
    }

    const existing = await Album.findOne({
      _id: { $ne: album._id },
      artistId: artist._id,
      name: { $regex: `^${nextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(400).json({ message: 'Album already exists for this artist' });
    }

    album.name = nextName;
    if (cover !== undefined) album.cover = cover || '';
    await album.save();

    if (previousName !== nextName) {
      await Song.updateMany(
        { _id: { $in: album.songs }, artistId: artist._id },
        { $set: { album: nextName } }
      );
    }

    await album.populate('songs');
    res.json(album);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /artist-dashboard/albums/:albumId
router.delete('/albums/:albumId', requireAuth, async (req, res) => {
  try {
    const artist = await getArtistForUser(req.user.id, res);
    if (!artist) return;

    const { albumId } = req.params;
    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    if (album.artistId?.toString() !== artist._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own albums' });
    }

    await Song.updateMany(
      { _id: { $in: album.songs }, artistId: artist._id },
      { $set: { album: '' } }
    );
    await Album.findByIdAndDelete(albumId);

    res.json({ message: 'Album deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /artist-dashboard/songs
router.post(
  '/songs',
  requireAuth,
  multerUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const artist = await getArtistForUser(req.user.id, res);
      if (!artist) return;

      const { title, albumId } = req.body;
      if (!title) return res.status(400).json({ message: 'Title is required' });

      let targetAlbum = null;
      if (albumId) {
        targetAlbum = await Album.findById(albumId);
        if (!targetAlbum) return res.status(404).json({ message: 'Album not found' });
        if (targetAlbum.artistId?.toString() !== artist._id.toString()) {
          return res.status(403).json({ message: 'You can only add songs to your own albums' });
        }
      }

      const audioFile = req.files?.audio?.[0];
      if (!audioFile) return res.status(400).json({ message: 'Audio file is required' });

      const audioResult = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: 'video',
        folder: 'spotify-mini/audio',
      });

      let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/500/500`;
      const imageFile = req.files?.image?.[0];
      if (imageFile) {
        const imageResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          folder: 'spotify-mini/covers',
        });
        imageUrl = imageResult.secure_url;
      }

      const song = await Song.create({
        title,
        artist: artist.name,
        artistId: artist._id,
        album: targetAlbum?.name || '',
        image: imageUrl,
        audio: audioResult.secure_url,
        duration: normalizeDurationMs(audioResult.duration),
      });

      artist.songs.push(song._id);
      await artist.save();
      if (targetAlbum) {
        targetAlbum.songs.push(song._id);
        await targetAlbum.save();
      }

      res.status(201).json(song);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /artist-dashboard/songs/:songId
router.put(
  '/songs/:songId',
  requireAuth,
  multerUpload.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const artist = await getArtistForUser(req.user.id, res);
      if (!artist) return;

      const { songId } = req.params;
      const song = await Song.findById(songId);
      if (!song) return res.status(404).json({ message: 'Song not found' });

      if (song.artistId?.toString() !== artist._id.toString()) {
        return res.status(403).json({ message: 'You do not own this song' });
      }

      const { title, albumId } = req.body;
      if (title) song.title = title;
      if (albumId !== undefined) {
        await Album.updateMany(
          { artistId: artist._id, songs: song._id },
          { $pull: { songs: song._id } }
        );

        if (albumId) {
          const nextAlbum = await Album.findById(albumId);
          if (!nextAlbum) return res.status(404).json({ message: 'Album not found' });
          if (nextAlbum.artistId?.toString() !== artist._id.toString()) {
            return res.status(403).json({ message: 'You can only move songs to your own albums' });
          }
          if (!nextAlbum.songs.some((id) => id.toString() === song._id.toString())) {
            nextAlbum.songs.push(song._id);
            await nextAlbum.save();
          }
          song.album = nextAlbum.name;
        } else {
          song.album = '';
        }
      }

      const imageFile = req.files?.image?.[0];
      if (imageFile) {
        const imageResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          folder: 'spotify-mini/covers',
        });
        song.image = imageResult.secure_url;
      }

      await song.save();
      res.json(song);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE /artist-dashboard/songs/:songId
router.delete('/songs/:songId', requireAuth, async (req, res) => {
  try {
    const artist = await getArtistForUser(req.user.id, res);
    if (!artist) return;

    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.artistId?.toString() !== artist._id.toString()) {
      return res.status(403).json({ message: 'You do not own this song' });
    }

    await Song.findByIdAndDelete(songId);
    artist.songs = artist.songs.filter((s) => s.toString() !== songId);
    await artist.save();
    await Album.updateMany({ artistId: artist._id }, { $pull: { songs: song._id } });

    res.json({ message: 'Song deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
