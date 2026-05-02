require('dotenv').config();

const mongoose = require('mongoose');
const path = require('path');

const Song = require('../models/song.model');
const cloudinary = require('../config/cloudinary');

const songs = [
  {
    title: 'Dreams',
    artist: 'Lofi Girl',
    album: 'Chill',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    file: 'song1.mp3'
  },
  {
    title: 'Night Walk',
    artist: 'Moon',
    album: 'Midnight',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    file: 'song2.mp3'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    await Song.deleteMany();

    const finalSongs = [];

    for (const song of songs) {
      const filePath = path.join(
        __dirname,
        '../uploads',
        song.file
      );

      const uploaded = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        folder: 'spotify-mini'
      });

      finalSongs.push({
        spotifyId: Date.now().toString(),
        title: song.title,
        artist: song.artist,
        album: song.album,
        image: song.image,
        audio: uploaded.secure_url,
        duration: 200000
      });

      console.log(`Uploaded: ${song.title}`);
    }

    await Song.insertMany(finalSongs);

    console.log('Seed success');
        process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seed();