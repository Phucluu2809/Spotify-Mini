const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    songId: String,
    title: String,
    artist: String,
    album: String,
    image: String,
    audio: String,
    duration: Number
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', historySchema);