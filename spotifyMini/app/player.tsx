import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image, Pressable, StyleSheet, Text,
  TouchableOpacity, View, Modal, Alert, ScrollView, PanResponder, type LayoutChangeEvent
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlayer } from "../context/PlayerContext";
import { useFavorite } from "../context/FavoriteContext";
import { usePlaylist } from "../context/PlaylistContext";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const TRACK_THUMB_SIZE = 16;

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreviewMillis, setSeekPreviewMillis] = useState(0);
  const seekStartXRef = useRef(0);
  const {
    currentSong, isPlaying, togglePlayPause,
    positionMillis, durationMillis, playNext,
    playPrevious, hasNext, hasPrevious, seekTo, setSeeking
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useFavorite();
  const { playlists, getPlaylists, addSongToPlaylist, loading: playlistsLoading } = usePlaylist();
  const liked = currentSong ? isFavorite(currentSong._id) : false;

  // Load playlists on component mount
  useEffect(() => {
    getPlaylists();
  }, []);

  const handleAddToPlaylist = () => {
    setMenuVisible(false);
    if (!currentSong) return;
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    if (!currentSong) return;
    try {
      await addSongToPlaylist(playlistId, currentSong._id);
      setPlaylistSelectVisible(false);
      Alert.alert("Success", "Song added to playlist.");
    } catch (error) {
      Alert.alert("Error", "Could not add song to playlist.");
    }
  };

  const handleGoToArtist = () => {
    setMenuVisible(false);
    if (!currentSong) return;
    router.push(`/(tabs)/artist/${encodeURIComponent(currentSong.artist)}` as any);
  };

  const handleAddToFavorites = () => {
    setMenuVisible(false);
    if (!currentSong) return;
    toggleFavorite(currentSong._id);
    Alert.alert("Liked Songs", liked ? "Removed from liked songs." : "Added to liked songs.");
  };

  const displayedPosition = isSeeking ? seekPreviewMillis : positionMillis;
  const progressRatio = durationMillis > 0
    ? Math.min(1, displayedPosition / durationMillis) : 0;

  const updateSeekPreviewByX = useCallback((x: number) => {
    if (!progressWidth || durationMillis <= 0) return;
    const clampedX = Math.max(0, Math.min(x, progressWidth));
    const ratio = clampedX / progressWidth;
    setSeekPreviewMillis(Math.floor(ratio * durationMillis));
  }, [progressWidth, durationMillis]);

  const commitSeekByX = useCallback(async (x: number) => {
    if (!progressWidth || durationMillis <= 0) return;
    const clampedX = Math.max(0, Math.min(x, progressWidth));
    const ratio = clampedX / progressWidth;
    await seekTo(Math.floor(ratio * durationMillis));
  }, [progressWidth, durationMillis, seekTo]);

  const onProgressLayout = (event: LayoutChangeEvent) => {
    setProgressWidth(event.nativeEvent.layout.width);
  };

  const progressResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setIsSeeking(true);
      setSeeking(true);
      const startX = Math.max(0, Math.min(event.nativeEvent.locationX, progressWidth));
      seekStartXRef.current = startX;
      updateSeekPreviewByX(startX);
    },
    onPanResponderMove: (_, gestureState) => {
      const dragX = seekStartXRef.current + gestureState.dx;
      updateSeekPreviewByX(dragX);
    },
    onPanResponderRelease: async (_, gestureState) => {
      const dragX = seekStartXRef.current + gestureState.dx;
      try {
        await commitSeekByX(dragX);
      } finally {
        setIsSeeking(false);
        setSeeking(false);
      }
    },
    onPanResponderTerminate: () => {
      setIsSeeking(false);
      setSeeking(false);
    },
  }), [progressWidth, setSeeking, updateSeekPreviewByX, commitSeekByX]);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.emptyText}>No song is playing</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>Playing from</Text>
          <Text style={styles.headerTitle}>Spotify Mini</Text>
        </View>
        <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </Pressable>
      </View>

      {/* Action Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Pressable onPress={handleAddToPlaylist} style={styles.menuItem}>
              <Ionicons name="list-outline" size={22} color="#53E076" />
              <Text style={styles.menuItemText}>Add to playlist</Text>
            </Pressable>

            <Pressable onPress={handleGoToArtist} style={styles.menuItem}>
              <Ionicons name="person-outline" size={22} color="#53E076" />
              <Text style={styles.menuItemText}>Go to artist</Text>
            </Pressable>

            <Pressable onPress={handleAddToFavorites} style={styles.menuItem}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color="#53E076" />
              <Text style={styles.menuItemText}>{liked ? "Remove from liked songs" : "Add to liked songs"}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Playlist Selection Modal */}
      <Modal visible={playlistSelectVisible} transparent animationType="slide">
        <SafeAreaView style={styles.playlistModalContainer}>
          <View style={styles.playlistModalHeader}>
            <Text style={styles.playlistModalTitle}>Choose playlist</Text>
            <Pressable onPress={() => setPlaylistSelectVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>

          {playlistsLoading ? (
            <Text style={styles.playlistLoadingText}>Loading playlists...</Text>
          ) : playlists.length === 0 ? (
            <View style={styles.playlistEmptyContainer}>
              <Text style={styles.playlistEmptyText}>You do not have any playlists yet</Text>
              <Pressable
                style={styles.playlistCreateButton}
                onPress={() => {
                  setPlaylistSelectVisible(false);
                  router.push("/add-playlist");
                }}
              >
                <Text style={styles.playlistCreateButtonText}>Create new playlist</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView style={styles.playlistList} contentContainerStyle={styles.playlistListContent}>
              {playlists.map((playlist) => (
                <Pressable
                  key={playlist._id}
                  style={styles.playlistItem}
                  onPress={() => handleSelectPlaylist(playlist._id)}
                >
                  <View style={styles.playlistItemContent}>
                    <Text style={styles.playlistItemName} numberOfLines={1}>{playlist.name}</Text>
                    <Text style={styles.playlistItemCount}>{playlist.songs?.length || 0} songs</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#53E076" />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <View style={styles.artworkWrap}>
        <Image source={{ uri: currentSong.image }} style={styles.artwork} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaText}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>

        <Pressable onPress={() => toggleFavorite(currentSong._id)} hitSlop={12}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={28}
            color={liked ? "#53E076" : "#888"}
          />
        </Pressable>
      </View>

      <View style={styles.progressBlock}>
        <View
          style={styles.progressTouchArea}
          onLayout={onProgressLayout}
          {...progressResponder.panHandlers}
        >
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <View style={[styles.progressThumb, { left: `${progressRatio * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(displayedPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={playPrevious} disabled={!hasPrevious}>
          <Ionicons name="play-skip-back" size={28} color={hasPrevious ? "white" : "#6E6E6E"} />
        </Pressable>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#050505" />
        </TouchableOpacity>
        <Pressable onPress={playNext} disabled={!hasNext}>
          <Ionicons name="play-skip-forward" size={28} color={hasNext ? "white" : "#6E6E6E"} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121414", paddingHorizontal: 24 },
  header: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLabel: { color: "#A8A8A8", fontSize: 12, textAlign: "center" },
  headerTitle: { color: "white", fontSize: 14, fontWeight: "700", textAlign: "center", marginTop: 2 },
  artworkWrap: { marginTop: 36, borderRadius: 32, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.35, shadowOffset: { width: 0, height: 22 }, shadowRadius: 26, elevation: 14 },
  artwork: { width: "100%", aspectRatio: 1, borderRadius: 32 },
  metaRow: { marginTop: 26, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaText: { flex: 1, marginRight: 12 },
  title: { color: "white", fontSize: 31, fontWeight: "800" },
  artist: { color: "#B7B7B7", marginTop: 4, fontSize: 17 },
  progressBlock: { marginTop: 26 },
  progressTouchArea: { height: 28, justifyContent: "center" },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  progressThumb: {
    position: "absolute",
    top: "50%",
    marginTop: -TRACK_THUMB_SIZE / 2,
    marginLeft: -TRACK_THUMB_SIZE / 2,
    width: TRACK_THUMB_SIZE,
    height: TRACK_THUMB_SIZE,
    borderRadius: TRACK_THUMB_SIZE / 2,
    backgroundColor: "#53E076",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#53E076" },
  timeRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  timeText: { color: "rgba(255,255,255,0.45)", fontWeight: "600", fontSize: 12 },
  controls: { marginTop: 38, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 44 },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#53E076", alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, backgroundColor: "#121414", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyText: { color: "#C8C8C8", fontSize: 16 },
  backButton: { position: "absolute", top: 64, left: 24 },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-start", paddingTop: 80 },
  menuContainer: {
    marginHorizontal: 16,
    marginRight: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: "auto",
    width: 240
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)"
  },
  menuItemText: { color: "white", fontSize: 14, fontWeight: "500" },
  playlistModalContainer: { flex: 1, backgroundColor: "#121414" },
  playlistModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  playlistModalTitle: { color: "white", fontSize: 18, fontWeight: "700" },
  playlistList: { flex: 1 },
  playlistListContent: { paddingVertical: 8, paddingHorizontal: 16 },
  playlistItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 12, marginVertical: 4, backgroundColor: "#1C1C1C", borderRadius: 8 },
  playlistItemContent: { flex: 1, marginRight: 12 },
  playlistItemName: { color: "white", fontSize: 16, fontWeight: "500" },
  playlistItemCount: { color: "#BCCBB9", fontSize: 12, marginTop: 2 },
  playlistLoadingText: { color: "#BCCBB9", fontSize: 14, textAlign: "center", marginTop: 20 },
  playlistEmptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  playlistEmptyText: { color: "#BCCBB9", fontSize: 14, textAlign: "center", marginBottom: 20 },
  playlistCreateButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#53E076", borderRadius: 25 },
  playlistCreateButtonText: { color: "#0B0F0D", fontSize: 14, fontWeight: "700" },
});
