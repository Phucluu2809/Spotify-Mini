import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const router = useRouter();
  const {
    currentSong,
    togglePlayPause,
    isPlaying
  } = usePlayer();

  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.infoContainer}
        onPress={() => router.push("/player")}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: currentSong.image }}
          style={styles.image}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {currentSong.title}
          </Text>

          <Text style={styles.artist}>
            {currentSong.artist}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={togglePlayPause}
      >
        <Ionicons
          name={
            isPlaying
              ? "pause-circle"
              : "play-circle"
          }
          size={42}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    backgroundColor: "#282828",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8
  },

  image: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginRight: 10
  },

  title: {
    color: "white",
    fontWeight: "bold"
  },

  artist: {
    color: "gray",
    marginTop: 4
  }
});
