import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentSong, togglePlayPause, isPlaying } = usePlayer();
  const insets = useSafeAreaInsets();

  // Hide while the full player screen is open.
  if (!currentSong || pathname === "/player") return null;

  const bottomOffset = 49 + insets.bottom + 8;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <TouchableOpacity
        style={styles.infoContainer}
        onPress={() => router.push("/player")}
        activeOpacity={0.85}
      >
        <Image source={{ uri: currentSong.image }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={togglePlayPause}>
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
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
    left: 10,
    right: 10,
    backgroundColor: "#282828",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  image: { width: 55, height: 55, borderRadius: 10, marginRight: 10 },
  title: { color: "white", fontWeight: "bold" },
  artist: { color: "gray", marginTop: 4 },
});
