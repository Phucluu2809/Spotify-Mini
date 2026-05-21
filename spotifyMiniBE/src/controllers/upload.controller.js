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

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "spotify-mini/covers",
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json(err);
  }
};