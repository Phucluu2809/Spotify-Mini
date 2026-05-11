import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  Audio,
  type AVPlaybackStatus
} from "expo-av";

export type Song = {
  _id: string;
  title: string;
  artist: string;
  image: string;
  audio: string;
  album?: string;
  playlist?: string;
};

type PlayerContextType = {
  currentSong: Song | null;
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  hasNext: boolean;
  hasPrevious: boolean;
};

const PlayerContext =
  createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [sound, setSound] =
    useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] =
    useState<Song | null>(null);
  const [isPlaying, setIsPlaying] =
    useState(false);
  const [positionMillis, setPositionMillis] =
    useState(0);
  const [durationMillis, setDurationMillis] =
    useState(0);
  const [songQueue, setSongQueue] = useState<Song[]>(
    []
  );
  const [currentIndex, setCurrentIndex] =
    useState(-1);

  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(-1);

  useEffect(() => {
    queueRef.current = songQueue;
  }, [songQueue]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playsInSilentModeIOS: true
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = (
    status: AVPlaybackStatus
  ) => {
    if (!status.isLoaded) {
      return;
    }

    setPositionMillis(status.positionMillis ?? 0);
    setDurationMillis(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      const hasMore =
        indexRef.current <
        queueRef.current.length - 1;

      if (hasMore) {
        const nextSong =
          queueRef.current[indexRef.current + 1];

        if (nextSong) {
          void playSong(nextSong, queueRef.current);
        }
      } else {
        setIsPlaying(false);
      }
    }
  };

  const playSong = async (
    song: Song,
    queue?: Song[]
  ) => {
    try {
      const nextQueue =
        queue && queue.length > 0
          ? queue
          : songQueue.length > 0
          ? songQueue
          : [song];

      const foundIndex = nextQueue.findIndex(
        (item) => item._id === song._id
      );
      const nextIndex =
        foundIndex >= 0 ? foundIndex : 0;

      setSongQueue(nextQueue);
      setCurrentIndex(nextIndex);

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound, status } =
        await Audio.Sound.createAsync(
          {
            uri: song.audio
          },
          {
            shouldPlay: true
          }
        );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
      setPositionMillis(0);

      if (status.isLoaded) {
        setDurationMillis(status.durationMillis ?? 0);
      }

      newSound.setOnPlaybackStatusUpdate(
        onPlaybackStatusUpdate
      );
    } catch (err) {
      console.log(err);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!sound) return;

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const playNext = async () => {
    const nextSong =
      songQueue[currentIndex + 1];

    if (!nextSong) return;

    await playSong(nextSong, songQueue);
  };

  const playPrevious = async () => {
    if (!sound) return;

    if (positionMillis > 3000) {
      await sound.setPositionAsync(0);
      return;
    }

    const previousSong =
      songQueue[currentIndex - 1];

    if (!previousSong) {
      await sound.setPositionAsync(0);
      return;
    }

    await playSong(previousSong, songQueue);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        playSong,
        togglePlayPause,
        isPlaying,
        positionMillis,
        durationMillis,
        playNext,
        playPrevious,
        hasNext:
          currentIndex >= 0 &&
          currentIndex < songQueue.length - 1,
        hasPrevious: currentIndex > 0
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error(
      "usePlayer must be used within PlayerProvider"
    );
  }

  return context;
};
