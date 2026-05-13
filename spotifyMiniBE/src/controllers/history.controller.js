const mongoose = require('mongoose');
const History = require('../models/history.model');
const Song = require('../models/song.model');

const getUserId = (req) => req.user?.id || req.user?._id;

const parseLimit = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return value;
};

const buildSongSnapshot = async (payload) => {
  const songId = payload?._id || payload?.id || payload?.songId;
  if (!songId) return null;

  let source = payload;
  if ((!source.title || !source.audio || !source.image) && mongoose.Types.ObjectId.isValid(songId)) {
    const song = await Song.findById(songId).lean();
    if (song) source = { ...song, ...payload };
  }

  return {
    songId: String(songId),
    title: source.title || '',
    artist: source.artist || '',
    album: source.album || '',
    image: source.image || '',
    audio: source.audio || '',
    duration: Number(source.duration) || 0
  };
};

const addHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const song = req.body.song || req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const songSnapshot = await buildSongSnapshot(song);
    if (!songSnapshot) {
      return res.status(400).json({
        message: 'Song is required',
        received: song
      });
    }

    const history = await History.create({
      userId,
      song: songSnapshot,
      playedAt: new Date()
    });

    res.status(201).json(history);
  } catch (err) {
    console.log('ADD HISTORY ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const limit = parseLimit(req.query.limit, 100, 200);
    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(limit)
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = getUserId(req);
    const limit = parseLimit(req.query.limit, 20, 50);

    const recent = await History.aggregate([
      { $match: { userId: toObjectId(userId), 'song.songId': { $exists: true, $ne: '' } } },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: '$song.songId',
          entry: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$entry' } },
      { $sort: { playedAt: -1 } },
      { $limit: limit }
    ]);

    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeHistoryEntry = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const deleted = await History.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    res.json({ message: 'History entry removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeRecentlyPlayedSong = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { songId } = req.params;
    const result = await History.deleteMany({
      userId,
      'song.songId': songId
    });

    res.json({
      message: 'Recently played song removed',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearRecentlyPlayed = async (req, res) => {
  try {
    const userId = getUserId(req);
    const latestBySong = await History.aggregate([
      { $match: { userId: toObjectId(userId), 'song.songId': { $exists: true, $ne: '' } } },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: '$song.songId',
          songId: { $first: '$song.songId' }
        }
      }
    ]);

    const songIds = latestBySong.map((entry) => entry.songId);
    await History.deleteMany({ userId, 'song.songId': { $in: songIds } });

    res.json({ message: 'Recently played cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    await History.deleteMany({ userId });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

const getRecommendations = async (req, res) => {
  try {
    const userId = getUserId(req);

    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(100);

    if (history.length === 0) {
      const [trending, random] = await Promise.all([
        Song.find().sort({ createdAt: -1 }).limit(6),
        Song.aggregate([{ $sample: { size: 6 } }])
      ]);

      const merged = [
        ...trending,
        ...random.filter((r) => !trending.some((t) => t._id.equals(r._id)))
      ].slice(0, 12);

      return res.json({
        type: 'random',
        topArtists: [],
        songs: merged,
        mix: { personal: 0, trending: trending.length, discovery: 0, surprise: random.length }
      });
    }

    const artistCount = {};
    const listenedSongIds = new Set();
    const listenedArtists = new Set();

    for (const entry of history) {
      const artist = entry.song?.artist;
      const songId = entry.song?.songId;
      if (artist) {
        artistCount[artist] = (artistCount[artist] || 0) + 1;
        listenedArtists.add(artist);
      }
      if (songId) listenedSongIds.add(songId);
    }

    const topArtists = Object.entries(artistCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([artist]) => artist);

    const personalPool = await Song.find({ artist: { $in: topArtists } }).limit(50);
    const personalUnheard = personalPool.filter((s) => !listenedSongIds.has(s._id.toString()));
    const personalHeard = personalPool.filter((s) => listenedSongIds.has(s._id.toString()));
    const personal = [...shuffle(personalUnheard), ...shuffle(personalHeard)].slice(0, 5);

    const personalIds = new Set(personal.map((s) => s._id.toString()));
    const trendingPool = await Song.find().sort({ createdAt: -1 }).limit(30);
    const trending = trendingPool
      .filter((s) => !personalIds.has(s._id.toString()))
      .slice(0, 3);

    const usedIds = new Set([
      ...personalIds,
      ...trending.map((s) => s._id.toString())
    ]);

    const discoveryPool = await Song.find({
      artist: { $nin: Array.from(listenedArtists) }
    }).limit(40);
    const discovery = pick(
      discoveryPool.filter((s) => !usedIds.has(s._id.toString())),
      2
    );

    const allUsedIds = new Set([
      ...usedIds,
      ...discovery.map((s) => s._id.toString())
    ]);
    const surprisePool = await Song.aggregate([{ $sample: { size: 10 } }]);
    const surprise = surprisePool
      .filter((s) => !allUsedIds.has(s._id.toString()))
      .slice(0, 2);

    const finalList = [
      ...personal,
      ...trending,
      ...discovery,
      ...surprise
    ];

    res.json({
      type: 'personalized',
      topArtists,
      songs: finalList,
      mix: {
        personal: personal.length,
        trending: trending.length,
        discovery: discovery.length,
        surprise: surprise.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addHistory,
  getHistory,
  getRecentlyPlayed,
  removeHistoryEntry,
  removeRecentlyPlayedSong,
  clearRecentlyPlayed,
  clearHistory,
  getRecommendations
};
