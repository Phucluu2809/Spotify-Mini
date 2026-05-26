const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'artist'], default: 'user', required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: null },

  favorites: [{ type: String }],
  followedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  followedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  followedAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
