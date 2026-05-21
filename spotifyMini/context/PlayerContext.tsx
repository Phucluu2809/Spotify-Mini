import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode
} from "react";
import { Audio, type AVPlaybackStatus } from "expo-av";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../app/config/api";

const AUTH_TOKEN_KEY = "spotifymini.auth.token";
const PLAYBACK_PROGRESS_INTERVAL_MS = 100;

export type Song = {
  _id: string; title: string; artist: string;
  image: string; audio: string; album?: string;
  playlist?: string; duration?: number;
};

type PlayerContextType = {
  currentSong: Song | null;
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (nextPositionMillis: number) => Promise<void>;
  setSeeking: (seeking: boolean) => void;
  clearPlayer: () => Promise<void>;
  isPlaying: boolean; positionMillis: number; durationMillis: number;
  playNext: () => Promise<void>; playPrevious: () => Promise<void>;
  hasNext: boolean; hasPrevious: boolean;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

const logHistory = async (song: Song) => {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (!token) return;
    await fetch(`${API_URL}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        song: {
          songId: song._id, title: song.title, artist: song.artist,
          album: song.album || "", image: song.image,
          audio: song.audio, duration: song.duration || 0
        }
      })
    });
  } catch { /* silent fail */ }
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isSeeking, setIsSeeking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(-1);
  const seekingRef = useRef(false);

  useEffect(() => { soundRef.current = sound; }, [sound]);
  useEffect(() => { queueRef.current = songQueue; }, [songQueue]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { seekingRef.current = isSeeking; }, [isSeeking]);
  useEffect(() => {
    Audio.setAudioModeAsync({ staysActiveInBackground: true, shouldDuckAndroid: false, playsInSilentModeIOS: true });
  }, []);
  useEffect(() => { return () => { if (sound) sound.unloadAsync(); }; }, [sound]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (!seekingRef.current) {
      setPositionMillis(status.positionMillis ?? 0);
    }
    setDurationMillis(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      const hasMore = indexRef.current < queueRef.current.length - 1;
      if (hasMore) {
        const next = queueRef.current[indexRef.current + 1];
        if (next) void playSong(next, queueRef.current);
      } else setIsPlaying(false);
    }
  };

  const isSameQueue = (a: Song[], b: Song[]) => {
    if (a.length !== b.length) return false;
    return a.every((song, index) => song._id === b[index]?._id);
  };

  const playSong = async (song: Song, queue?: Song[]) => {
    try {
      const nextQueue = queue?.length ? queue : songQueue.length ? songQueue : [song];
      const foundIndex = nextQueue.findIndex((i) => i._id === song._id);
      const nextIndex = foundIndex >= 0 ? foundIndex : 0;

      if (currentSong?._id === song._id && sound) {
        if (!isSameQueue(queueRef.current, nextQueue)) {
          setSongQueue(nextQueue);
          setCurrentIndex(nextIndex);
        }
        if (!isPlaying) {
          await sound.playAsync();
        }
        return;
      }

      setSongQueue(nextQueue);
      setCurrentIndex(nextIndex);
      if (sound) { await sound.stopAsync(); await sound.unloadAsync(); }
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: song.audio },
        { shouldPlay: true, progressUpdateIntervalMillis: PLAYBACK_PROGRESS_INTERVAL_MS }
      );
      setSound(newSound); setCurrentSong(song);
      setIsPlaying(true); setPositionMillis(0);
      if (status.isLoaded) setDurationMillis(status.durationMillis ?? 0);
      await newSound.setProgressUpdateIntervalAsync(PLAYBACK_PROGRESS_INTERVAL_MS);
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      void logHistory(song);
    } catch (err) { console.log(err); }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) await sound.pauseAsync(); else await sound.playAsync();
  };
  const seekTo = async (nextPositionMillis: number) => {
    if (!sound) return;
    const clamped = Math.max(0, Math.min(nextPositionMillis, durationMillis || nextPositionMillis));
    await sound.setPositionAsync(clamped);
    setPositionMillis(clamped);
  };
  const playNext = async () => {
    const next = songQueue[currentIndex + 1];
    if (next) await playSong(next, songQueue);
  };
  const playPrevious = async () => {
    if (!sound) return;
    if (positionMillis > 3000) { await sound.setPositionAsync(0); return; }
    const prev = songQueue[currentIndex - 1];
    if (prev) await playSong(prev, songQueue); else await sound.setPositionAsync(0);
  };

  const clearPlayer = useCallback(async () => {
    const activeSound = soundRef.current;
    if (activeSound) {
      try {
        await activeSound.stopAsync();
        await activeSound.unloadAsync();
      } catch (err) {
        console.log(err);
      }
    }

    soundRef.current = null;
    setSound((prev) => (prev === null ? prev : null));
    setCurrentSong((prev) => (prev === null ? prev : null));
    setIsPlaying((prev) => (prev ? false : prev));
    setPositionMillis((prev) => (prev === 0 ? prev : 0));
    setDurationMillis((prev) => (prev === 0 ? prev : 0));
    setSongQueue((prev) => (prev.length === 0 ? prev : []));
    setCurrentIndex((prev) => (prev === -1 ? prev : -1));
    setIsSeeking((prev) => (prev ? false : prev));
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, playSong, togglePlayPause, seekTo, setSeeking: setIsSeeking, clearPlayer, isPlaying,
      positionMillis, durationMillis, playNext, playPrevious,
      hasNext: currentIndex >= 0 && currentIndex < songQueue.length - 1,
      hasPrevious: currentIndex > 0
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
