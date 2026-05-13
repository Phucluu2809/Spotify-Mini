import { API } from "./api";
import type { Song } from "../context/PlayerContext";

export type HistorySong = {
  songId: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  audio: string;
  duration: number;
};

export type HistoryEntry = {
  _id: string;
  song: HistorySong;
  playedAt: string;
};

export const historyEntryToSong = (entry: HistoryEntry): Song => ({
  _id: entry.song.songId,
  title: entry.song.title,
  artist: entry.song.artist,
  album: entry.song.album,
  image: entry.song.image,
  audio: entry.song.audio,
  duration: entry.song.duration,
});

export const getListeningHistory = async (limit = 100) => {
  const res = await API.get<HistoryEntry[]>("/history", { params: { limit } });
  return Array.isArray(res.data) ? res.data : [];
};

export const getRecentlyPlayed = async (limit = 24) => {
  const res = await API.get<HistoryEntry[]>("/history/recently-played", {
    params: { limit },
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const deleteHistoryEntry = async (id: string) => {
  await API.delete(`/history/${id}`);
};

export const deleteRecentlyPlayedSong = async (songId: string) => {
  await API.delete(`/history/recently-played/${encodeURIComponent(songId)}`);
};

export const clearListeningHistory = async () => {
  await API.delete("/history");
};

export const clearRecentlyPlayed = async () => {
  await API.delete("/history/recently-played");
};
