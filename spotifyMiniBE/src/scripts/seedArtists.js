require('dotenv').config();

const mongoose = require('mongoose');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');

const artists = [
  {
    name: 'Sơn Tùng M-TP',
    bio: 'Vietnamese singer and songwriter, known for pop and rock music',
    followers: 2400000,
    image: 'https://picsum.photos/seed/son-tung-artist/400/400'
  },
  {
    name: 'MONO',
    bio: 'Vietnamese pop singer with a soulful voice',
    followers: 1800000,
    image: 'https://picsum.photos/seed/mono-artist/400/400'
  },
  {
    name: 'HIEUTHUHAI',
    bio: 'Vietnamese rapper and producer',
    followers: 1500000,
    image: 'https://picsum.photos/seed/hieuthuhai-artist/400/400'
  },
  {
    name: 'tlinh',
    bio: 'Vietnamese female rapper and singer',
    followers: 1200000,
    image: 'https://picsum.photos/seed/tlinh-artist/400/400'
  },
  {
    name: 'Đen',
    bio: 'Vietnamese rapper known for social commentary',
    followers: 1900000,
    image: 'https://picsum.photos/seed/den-artist/400/400'
  },
  {
    name: 'Vũ.',
    bio: 'Vietnamese male singer with romantic songs',
    followers: 950000,
    image: 'https://picsum.photos/seed/vu-artist/400/400'
  },
  {
    name: 'Hoàng Dũng',
    bio: 'Vietnamese singer and composer',
    followers: 1100000,
    image: 'https://picsum.photos/seed/hoang-dung-artist/400/400'
  },
  {
    name: 'Mỹ Tâm',
    bio: 'Vietnamese pop icon and legendary singer',
    followers: 3500000,
    image: 'https://picsum.photos/seed/my-tam-artist/400/400'
  },
  {
    name: 'Soobin',
    bio: 'Vietnamese male singer and actor',
    followers: 2100000,
    image: 'https://picsum.photos/seed/soobin-artist/400/400'
  },
  {
    name: 'Bích Phương',
    bio: 'Vietnamese female singer known for contemporary pop',
    followers: 1600000,
    image: 'https://picsum.photos/seed/bich-phuong-artist/400/400'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing artists
    await Artist.deleteMany();
    console.log('Cleared existing artists');

    // Create artists
    const createdArtists = await Artist.insertMany(artists);
    console.log(`Created ${createdArtists.length} artists`);

    // Update songs with artistId based on artist name and populate artist.songs
    const artistMap = {};
    createdArtists.forEach(artist => {
      artistMap[artist.name] = artist._id;
    });

    for (const [artistName, artistId] of Object.entries(artistMap)) {
      const songResult = await Song.updateMany(
        { artist: artistName },
        { $set: { artistId: artistId } }
      );
      console.log(`Updated ${songResult.modifiedCount} songs for artist: ${artistName}`);

      // Get all songs for this artist
      const artistSongs = await Song.find({ artistId: artistId });
      const songIds = artistSongs.map(s => s._id);

      // Update artist with songs array
      await Artist.findByIdAndUpdate(
        artistId,
        { $set: { songs: songIds } },
        { new: true }
      );
      console.log(`Linked ${songIds.length} songs to artist: ${artistName}`);
    }

    console.log('Seed success');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
