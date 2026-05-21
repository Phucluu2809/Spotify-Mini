const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist'
    },
    cover: String,
    year: Number,
    genre: String,
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Album', albumSchema);
