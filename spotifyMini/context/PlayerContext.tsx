import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { Audio } from "expo-av";

const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: any) => {
  const [sound, setSound] = useState<any>(null);

  const [currentSong, setCurrentSong] =
    useState<any>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playsInSilentModeIOS: true
    });
  }, []);

  const playSong = async (song: any) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } =
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

      newSound.setOnPlaybackStatusUpdate(
        (status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
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
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        playSong,
        togglePlayPause,
        isPlaying
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () =>
  useContext(PlayerContext);