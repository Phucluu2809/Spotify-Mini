const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const multerUpload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');

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
    res.json(artist);
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

      const { title, album } = req.body;
      if (!title) return res.status(400).json({ message: 'Title is required' });

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
        album: album || 'Single',
        image: imageUrl,
        audio: audioResult.secure_url,
        duration: 0,
      });

      artist.songs.push(song._id);
      await artist.save();

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

      const { title, album } = req.body;
      if (title) song.title = title;
      if (album) song.album = album;

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

    res.json({ message: 'Song deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;