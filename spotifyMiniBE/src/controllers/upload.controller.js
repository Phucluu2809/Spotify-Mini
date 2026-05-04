const cloudinary = require("../config/cloudinary");
const Song = require("../models/song.model");

exports.uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    const songId = req.body.songId;

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",  
    });

    const song = await Song.findByIdAndUpdate(
      songId,
      { audio: result.secure_url },
      { new: true }
    );

    res.json(song);
  } catch (err) {
    res.status(500).json(err);
  }
};