import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API } from "../services/api";
import { usePlayer } from "../context/PlayerContext";

interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audio: string;
  duration: number;
  createdAt: string;
}

export default function MyPlaylistScreen() {
  const navigation = useNavigation();
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await API.get("/songs");
      setSongs(response.data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSongPress = (song: Song) => {
    if (currentSong?._id === song._id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const renderSong = ({ item }: { item: Song }) => {
    const isCurrentSong = currentSong?._id === item._id;
    return (
      <Pressable style={[styles.songRow, isCurrentSong && styles.songRowActive]} onPress={() => handleSongPress(item)}>
        <View style={[styles.songArt, { backgroundColor: "#282828" }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.songImage} />
          ) : (
            <View style={styles.songPlaceholder}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
        </View>
        <View style={styles.songContent}>
          <Text style={[styles.songTitle, isCurrentSong && styles.songTitleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <View style={styles.songDuration}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          {isCurrentSong && (
            <View style={styles.playingIndicator}>
              <Text style={styles.playingText}>{isPlaying ? "▮▮" : "▶"}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Liked Songs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroSection}>
        <View style={[styles.heroArt, { backgroundColor: "#450AF5" }]}>
          <Text style={styles.heroIcon}>♪</Text>
        </View>
        <Text style={styles.heroTitle}>Liked Songs</Text>
        <Text style={styles.heroSubtitle}>{songs.length} songs</Text>
      </View>

      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={(item) => item._id}
        scrollEnabled={true}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No songs found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: "center",
  },
  heroArt: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 48,
    color: "#FFFFFF",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#B3B3B3",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  songRowActive: {
    backgroundColor: "#1DB95425",
  },
  songArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  songImage: {
    width: 48,
    height: 48,
  },
  songPlaceholder: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 20,
    color: "#B3B3B3",
  },
  songContent: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  songTitleActive: {
    color: "#1DB954",
  },
  songArtist: {
    fontSize: 12,
    color: "#B3B3B3",
  },
  songDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  durationText: {
    fontSize: 12,
    color: "#B3B3B3",
  },
  playingIndicator: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  playingText: {
    fontSize: 12,
    color: "#1DB954",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#B3B3B3",
  },
});
