import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePlayer } from "../context/PlayerContext";

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    positionMillis,
    durationMillis,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious
  } = usePlayer();

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-down"
            size={28}
            color="white"
          />
        </TouchableOpacity>
        <Text style={styles.emptyText}>
          Chưa có bài hát nào đang phát
        </Text>
      </SafeAreaView>
    );
  }

  const progressRatio =
    durationMillis > 0
      ? Math.min(1, positionMillis / durationMillis)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-down"
            size={28}
            color="white"
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>Đang phát từ</Text>
          <Text style={styles.headerTitle}>Spotify Mini</Text>
        </View>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color="white"
        />
      </View>

      <View style={styles.artworkWrap}>
        <Image
          source={{ uri: currentSong.image }}
          style={styles.artwork}
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaText}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {currentSong.title}
          </Text>
          <Text
            style={styles.artist}
            numberOfLines={1}
          >
            {currentSong.artist}
          </Text>
        </View>
        <Ionicons
          name="heart"
          size={24}
          color="#53E076"
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressRatio * 100}%` }
            ]}
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(positionMillis)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(durationMillis)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={playPrevious}
          disabled={!hasPrevious}
        >
          <Ionicons
            name="play-skip-back"
            size={28}
            color={hasPrevious ? "white" : "#6E6E6E"}
          />
        </Pressable>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color="#050505"
          />
        </TouchableOpacity>

        <Pressable
          onPress={playNext}
          disabled={!hasNext}
        >
          <Ionicons
            name="play-skip-forward"
            size={28}
            color={hasNext ? "white" : "#6E6E6E"}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121414",
    paddingHorizontal: 24
  },
  header: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerLabel: {
    color: "#A8A8A8",
    fontSize: 12,
    textAlign: "center"
  },
  headerTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2
  },
  artworkWrap: {
    marginTop: 36,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 22 },
    shadowRadius: 26,
    elevation: 14
  },
  artwork: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 32
  },
  metaRow: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  metaText: {
    flex: 1,
    marginRight: 12
  },
  title: {
    color: "white",
    fontSize: 31,
    fontWeight: "800"
  },
  artist: {
    color: "#B7B7B7",
    marginTop: 4,
    fontSize: 17
  },
  progressBlock: {
    marginTop: 26
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#53E076"
  },
  timeRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeText: {
    color: "rgba(255,255,255,0.45)",
    fontWeight: "600",
    fontSize: 12
  },
  controls: {
    marginTop: 38,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 44
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#53E076",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#121414",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  emptyText: {
    color: "#C8C8C8",
    fontSize: 16
  },
  backButton: {
    position: "absolute",
    top: 64,
    left: 24
  }
});
