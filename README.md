# Spotify Mini

Spotify Mini is a full-stack music streaming app with a React Native Expo frontend and an Express/MongoDB backend. The app supports authentication, OTP password reset by email, music browsing, playback, favorites, listening history, playlists, albums, artist pages, user profile updates, media upload through Cloudinary, and an artist dashboard for managing songs and albums.

## Project Structure

```text
Spotify-Mini/
|-- spotifyMini/        # Expo React Native app
|-- spotifyMiniBE/      # Express API server
|-- package.json        # Root helper scripts for frontend
|-- .gitignore          # Single ignore file for the whole repo
`-- README.md           # Project documentation
```

## Tech Stack

Frontend:
- Expo Router
- React Native
- TypeScript
- Expo SecureStore
- Expo AV / Expo Audio
- Axios and Fetch

Backend:
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Cloudinary upload/storage
- Nodemailer SMTP email

## Main Features

- Register and login with user or artist role
- JWT-based protected API routes
- Forgot password with 6-digit OTP sent by email
- Reset password using email + OTP
- Browse songs, albums, artists, playlists
- Music player and mini player
- Favorites, listening history, recently played
- User profile update with avatar upload
- Playlist create/update/delete and song management
- Artist dashboard for songs and albums
- Cloudinary audio/image upload

## Environment Setup

Create environment files from the examples:

```bash
copy spotifyMiniBE\.env.example spotifyMiniBE\.env
copy spotifyMini\.env.example spotifyMini\.env
```

On macOS/Linux:

```bash
cp spotifyMiniBE/.env.example spotifyMiniBE/.env
cp spotifyMini/.env.example spotifyMini/.env
```

### Backend Variables

File: `spotifyMiniBE/.env`

```env
PORT=5000
MONGO_URI=
JWT_SECRET=

CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

PASSWORD_RESET_EXPIRES_MINUTES=15

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

For Gmail SMTP, `SMTP_PASS` must be an App Password, not your normal Gmail password.

### Frontend Variables

File: `spotifyMini/.env`

```env
EXPO_PUBLIC_API_BASE_URL=
```

Leave it empty to let the app infer the backend host from Expo. If testing on a real phone and the API is not reachable, set it to your computer IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:5000
```

## Installation

Install backend dependencies:

```bash
cd spotifyMiniBE
npm install
```

Install frontend dependencies:

```bash
cd ../spotifyMini
npm install
```

Or from the repository root:

```bash
npm --prefix spotifyMiniBE install
npm --prefix spotifyMini install
```

## Running The App

Start the backend API:

```bash
cd spotifyMiniBE
node src/app.js
```

The API runs on:

```text
http://localhost:5000
```

Start the Expo app with Expo Go:

```bash
cd spotifyMini
npm start
```

Or from the repository root:

```bash
npm start
```

Run the web build only when needed:

```bash
npm run web
```

## Useful Scripts

Root:

```bash
npm start              # Start frontend in Expo Go mode
npm run start:expo-go  # Same as npm start
npm run web            # Start Expo web
```

Frontend:

```bash
npm start              # expo start --go
npm run dev            # expo start --dev-client
npm run android        # expo run:android
npm run ios            # expo run:ios
npm run web            # expo start --web
npm run lint           # expo lint
```

Backend:

```bash
node src/app.js
```

## API Overview

Base URL:

```text
http://localhost:5000
```

Main route groups:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password

GET    /songs
GET    /songs/:id

POST   /upload
POST   /upload/image

GET    /artists
GET    /artists/:id
GET    /artists/name/:name
POST   /artists/:artistId/follow
DELETE /artists/:artistId/follow

GET    /albums
GET    /albums/:id
POST   /albums
PUT    /albums/:id
DELETE /albums/:id

GET    /playlists
GET    /playlists/public
POST   /playlists
PUT    /playlists/:id
DELETE /playlists/:id

GET    /history
POST   /history
GET    /history/recommendations
GET    /history/recently-played

GET    /favorites
POST   /favorites/:songId

GET    /user/profile
PATCH  /user/profile
GET    /user/followed-artists
GET    /user/followed-playlists
GET    /user/followed-albums

GET    /artist-dashboard/me
GET    /artist-dashboard/albums
POST   /artist-dashboard/albums
POST   /artist-dashboard/songs
PUT    /artist-dashboard/songs/:songId
DELETE /artist-dashboard/songs/:songId
```

Protected routes require:

```http
Authorization: Bearer <token>
```

## Forgot Password Flow

1. User enters email in the app.
2. Frontend calls `POST /auth/forgot-password`.
3. Backend generates a 6-digit OTP.
4. Backend stores the hashed OTP and expiry time on the user record.
5. Backend sends the OTP to the user's email by SMTP.
6. User enters email, OTP, new password, and confirm password.
7. Frontend calls `POST /auth/reset-password`.
8. Backend validates OTP and updates the hashed password.
9. OTP fields are cleared after successful reset.

## Data And Uploads

- MongoDB stores users, songs, artists, albums, playlists, favorites, and history.
- Cloudinary stores uploaded audio/images.
- Local `spotifyMiniBE/uploads/` is treated as runtime data and ignored by Git.

## Development Notes

- Commit `.env.example` files, never commit `.env`.
- Restart the backend after changing `.env` or backend code.
- Restart Expo after changing `EXPO_PUBLIC_*` variables.
- Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`.
- The frontend defaults to Expo Go mode through `expo start --go`.

## Current Known Checks

The auth/OTP modules load successfully. Frontend lint/typecheck may still report existing issues outside the auth flow, especially in `artist-dashboard.tsx` and `library.tsx`; those are separate cleanup items.
