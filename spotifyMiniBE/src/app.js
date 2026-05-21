require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const songRoutes = require('./routes/song.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const historyRoutes = require('./routes/history.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const artistRoutes = require('./routes/artist.routes');
const playlistRoutes = require('./routes/playlist.routes');
const albumRoutes = require('./routes/album.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use('/songs', songRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/history', historyRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/artists', artistRoutes);
app.use('/playlists', playlistRoutes);
app.use('/albums', albumRoutes);
app.use('/user', userRoutes);
app.use('/artist-dashboard', require('./routes/artistDashboard.routes'));

app.get('/', (req, res) => res.send('Spotify Mini API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});