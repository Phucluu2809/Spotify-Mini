require("dotenv").config();

const mongoose = require("mongoose");
const Song = require("../models/song.model");

const clearSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Song.deleteMany();

    console.log("All songs deleted");

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

clearSongs();