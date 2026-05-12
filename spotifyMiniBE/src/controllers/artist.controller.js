const Artist = require('../models/artist.model');
const Song = require('../models/song.model');

const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().populate('songs');
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('songs');
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArtistByName = async (req, res) => {
  try {
    const { name } = req.params;
    const artist = await Artist.findOne({ name: { $regex: name, $options: 'i' } }).populate('songs');
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSongsByArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const songs = await Song.find({ artistId: id });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createArtist = async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    if (!name) return res.status(400).json({ message: 'Artist name is required' });

    const artist = new Artist({ name, image, bio });
    await artist.save();
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getArtists, 
  getArtistById, 
  getArtistByName,
  getSongsByArtist,
  createArtist 
};
