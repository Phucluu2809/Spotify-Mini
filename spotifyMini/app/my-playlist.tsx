import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  Image, Pressable, SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../context/PlayerContext";
import { useFavorite } from "../context/FavoriteContext"; // ✅

export default function MyPlaylistScreen() {
  const navigation = useNavigation();
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const { favorites, toggleFavorite, isFavorite } = useFavorite(); // ✅

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSongPress = (song: any) => {
    if (currentSong?._id === song._id) {
      togglePlayPause();
    } else {
      playSong(song, favorites);
    }
  };

  const handlePlayAll = () => {
    if (!favorites.length) return;
    const isCollectionActive = Boolean(
      currentSong && favorites.some((song: any) => song._id === currentSong._id)
    );

    if (isCollectionActive) {
      if (!isPlaying) togglePlayPause();
      return;
    }

    playSong(favorites[0], favorites);
  };

  const renderSong = ({ item }: { item: any }) => {
    const isCurrentSong = currentSong?._id === item._id;
    const liked = isFavorite(item._id);

    return (
      <Pressable
        style={[styles.songRow, isCurrentSong && styles.songRowActive]}
        onPress={() => handleSongPress(item)}
      >
        <View style={styles.songArt}>
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
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
        </View>

        <View style={styles.songRight}>
          {/* ✅ Nút bỏ thích ngay trong danh sách */}
          <Pressable onPress={() => toggleFavorite(item._id)} hitSlop={10}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={liked ? "#1DB954" : "#555"}
            />
          </Pressable>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          {isCurrentSong && (
            <Text style={styles.playingText}>{isPlaying ? "▮▮" : "▶"}</Text>
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
        <View style={styles.heroArt}>
          <Ionicons name="heart" size={48} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Liked Songs</Text>
        <Text style={styles.heroSubtitle}>{favorites.length} bài hát</Text>
      </View>

      {/* ✅ Nút phát tất cả */}
      {favorites.length > 0 && (
        <Pressable style={styles.playAllButton} onPress={handlePlayAll}>
          <Ionicons name="play" size={20} color="#0B0F0D" />
          <Text style={styles.playAllText}>Phát tất cả</Text>
        </Pressable>
      )}

      <FlatList
        data={favorites}
        renderItem={renderSong}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#555" />
            <Text style={styles.emptyText}>Chưa có bài hát yêu thích</Text>
            <Text style={styles.emptySubText}>Bấm ♡ trên bài hát để thêm vào đây</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#282828" },
  backButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  backText: { color: "#FFFFFF", fontSize: 32, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", flex: 1, textAlign: "center" },
  headerSpacer: { width: 32 },
  heroSection: { paddingHorizontal: 16, paddingVertical: 32, alignItems: "center" },
  heroArt: { width: 120, height: 120, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 16, backgroundColor: "#450AF5" },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: "#B3B3B3" },
  playAllButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, height: 50, borderRadius: 25, backgroundColor: "#1DB954", marginBottom: 8 },
  playAllText: { color: "#0B0F0D", fontSize: 16, fontWeight: "800" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 160 },
  songRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#282828" },
  songRowActive: { backgroundColor: "#1DB95425" },
  songArt: { width: 48, height: 48, borderRadius: 4, marginRight: 12, overflow: "hidden", backgroundColor: "#282828" },
  songImage: { width: 48, height: 48 },
  songPlaceholder: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  placeholderText: { fontSize: 20, color: "#B3B3B3" },
  songContent: { flex: 1 },
  songTitle: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", marginBottom: 4 },
  songTitleActive: { color: "#1DB954" },
  songArtist: { fontSize: 12, color: "#B3B3B3" },
  songRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  durationText: { fontSize: 12, color: "#B3B3B3" },
  playingText: { fontSize: 12, color: "#1DB954", fontWeight: "600" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 18, color: "#B3B3B3", fontWeight: "700" },
  emptySubText: { fontSize: 13, color: "#666" },
});
