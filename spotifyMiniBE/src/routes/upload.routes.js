const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controllers/upload.controller");

router.post("/", upload.single("audio"), uploadController.uploadAudio);

module.exports = router;