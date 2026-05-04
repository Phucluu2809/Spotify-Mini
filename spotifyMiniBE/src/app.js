require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const songRoutes = require('./routes/song.routes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/songs', songRoutes);

app.get('/', (req, res) => {
  res.send('Spotify Mini API running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});