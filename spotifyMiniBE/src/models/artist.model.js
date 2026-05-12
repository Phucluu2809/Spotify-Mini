const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: String,
    bio: String,
    followers: { type: Number, default: 0 },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artist', artistSchema);
