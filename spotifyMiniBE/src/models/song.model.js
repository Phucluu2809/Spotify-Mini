const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    spotifyId: String,
    title: String,
    artist: String,
    album: String,
    image: String,
    audio: String,
    duration: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Song', songSchema);