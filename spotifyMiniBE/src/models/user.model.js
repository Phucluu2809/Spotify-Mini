const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     { type: String, enum: ['user', 'artist'], default: 'user', required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
   
  favorites: [{ type: String }],
  followedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);