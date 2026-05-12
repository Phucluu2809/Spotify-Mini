const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    cover: String,
    isPrivate: {
      type: Boolean,
      default: false
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
