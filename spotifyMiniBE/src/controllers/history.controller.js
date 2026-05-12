const History = require('../models/history.model');

const addHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const song = req.body.song || req.body;

    const songId = song._id || song.id || song.songId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!song || !songId) {
      return res.status(400).json({
        message: 'Song is required',
        received: song
      });
    }

    const history = await History.findOneAndUpdate(
      {
        userId,
        'song.songId': songId
      },
      {
        $set: {
          userId,
          song: {
            songId: songId,
            title: song.title,
            artist: song.artist,
            album: song.album,
            image: song.image,
            audio: song.audio,
            duration: song.duration
          },
          playedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json(history);
  } catch (err) {
    console.log('ADD HISTORY ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(200);

    const seen = new Set();
    const unique = [];
    for (const entry of history) {
      const key = entry.song.songId;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entry);
        if (unique.length >= 20) break;
      }
    }
    res.json(unique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const Song = require('../models/song.model');

    const history = await History.find({ userId })
      .sort({ playedAt: -1 })
      .limit(100);

    // ── Chưa có history → trending + random ─────────────────
    if (history.length === 0) {
      const [trending, random] = await Promise.all([
        Song.find().sort({ createdAt: -1 }).limit(6),
        Song.aggregate([{ $sample: { size: 6 } }])
      ]);

      const merged = [
        ...trending,
        ...random.filter(r => !trending.some(t => t._id.equals(r._id)))
      ].slice(0, 12);

      return res.json({
        type: 'random',
        topArtists: [],
        songs: merged,
        mix: { personal: 0, trending: trending.length, discovery: 0, surprise: random.length }
      });
    }

    // ── Phân tích history ────────────────────────────────────
    const artistCount = {};
    const listenedSongIds = new Set();
    const listenedArtists = new Set();

    for (const entry of history) {
      const artist = entry.song?.artist;
      const songId  = entry.song?.songId;
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

    // ── Slot 1 — Personal (5 bài) ────────────────────────────
    // Bài của top artists, ưu tiên chưa nghe lên trước
    const personalPool = await Song.find({ artist: { $in: topArtists } }).limit(50);
    const personalUnheard = personalPool.filter(s => !listenedSongIds.has(s._id.toString()));
    const personalHeard   = personalPool.filter(s =>  listenedSongIds.has(s._id.toString()));
    // shuffle từng nhóm nhỏ nhưng unheard luôn lên trước
    const personal = [...shuffle(personalUnheard), ...shuffle(personalHeard)].slice(0, 5);

    // ── Slot 2 — Trending (3 bài) ────────────────────────────
    const personalIds = new Set(personal.map(s => s._id.toString()));
    const trendingPool = await Song.find().sort({ createdAt: -1 }).limit(30);
    const trending = trendingPool
      .filter(s => !personalIds.has(s._id.toString()))
      .slice(0, 3);

    // ── Slot 3 — Discovery (2 bài) ───────────────────────────
    // Artists user chưa nghe bao giờ
    const usedIds = new Set([
      ...personalIds,
      ...trending.map(s => s._id.toString())
    ]);
    const discoveryPool = await Song.find({
      artist: { $nin: Array.from(listenedArtists) }
    }).limit(40);
    const discovery = pick(
      discoveryPool.filter(s => !usedIds.has(s._id.toString())),
      2
    );

    // ── Slot 4 — Surprise (2 bài) ────────────────────────────
    const allUsedIds = new Set([
      ...usedIds,
      ...discovery.map(s => s._id.toString())
    ]);
    const surprisePool = await Song.aggregate([{ $sample: { size: 10 } }]);
    const surprise = surprisePool
      .filter(s => !allUsedIds.has(s._id.toString()))
      .slice(0, 2);

    // ── Gộp — personal luôn đứng đầu ────────────────────────
    const finalList = [
      ...personal,    // 1-5:  nghệ sĩ yêu thích — đầu danh sách
      ...trending,    // 6-8:  trending
      ...discovery,   // 9-10: khám phá nghệ sĩ mới
      ...surprise     // 11-12: bất ngờ
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

module.exports = { addHistory, getHistory, getRecentlyPlayed, clearHistory, getRecommendations };