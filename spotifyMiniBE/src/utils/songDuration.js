const cloudinary = require('../config/cloudinary');
const Song = require('../models/song.model');

const normalizeDurationMs = (duration) => {
  const numericDuration = Number(duration);
  if (!Number.isFinite(numericDuration) || numericDuration <= 0) return 0;
  return numericDuration < 1000
    ? Math.round(numericDuration * 1000)
    : Math.round(numericDuration);
};

const extractCloudinaryPublicId = (audioUrl) => {
  if (!audioUrl || typeof audioUrl !== 'string') return null;

  const [rawUrl] = audioUrl.split('?');
  const uploadMarker = '/upload/';
  const uploadIndex = rawUrl.indexOf(uploadMarker);
  if (uploadIndex === -1) return null;

  let pathAfterUpload = rawUrl.slice(uploadIndex + uploadMarker.length);
  pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
  pathAfterUpload = pathAfterUpload.replace(/\.[^./]+$/, '');

  return pathAfterUpload || null;
};

const fetchDurationFromCloudinary = async (audioUrl) => {
  const publicId = extractCloudinaryPublicId(audioUrl);
  if (!publicId) return 0;

  const resource = await cloudinary.api.resource(publicId, { resource_type: 'video' });
  return normalizeDurationMs(resource?.duration);
};

const ensureSongDuration = async (song) => {
  if (!song) return song;

  const currentDuration = normalizeDurationMs(song.duration);
  if (currentDuration > 0) {
    song.duration = currentDuration;
    return song;
  }

  try {
    const resolvedDuration = await fetchDurationFromCloudinary(song.audio);
    if (resolvedDuration <= 0) return song;

    song.duration = resolvedDuration;
    await Song.findByIdAndUpdate(song._id, { duration: resolvedDuration });
  } catch (err) {
    console.error('Unable to backfill duration for song', song._id?.toString?.() || song._id, err.message);
  }

  return song;
};

const ensureSongDurations = async (songs) => {
  if (!Array.isArray(songs) || songs.length === 0) return songs;
  await Promise.all(songs.map((song) => ensureSongDuration(song)));
  return songs;
};

module.exports = {
  normalizeDurationMs,
  ensureSongDuration,
  ensureSongDurations
};
