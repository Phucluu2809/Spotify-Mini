import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SuggestedSong = {
  id: string;
  title: string;
  artist: string;
  image: string;
};

const suggestedSongs: SuggestedSong[] = [
  {
    id: "1",
    title: "Neon Nights",
    artist: "Synthwave Collective",
    image: "https://picsum.photos/seed/neon-nights/400/400",
  },
  {
    id: "2",
    title: "After Hours",
    artist: "Velvet Echo",
    image: "https://picsum.photos/seed/after-hours/400/400",
  },
  {
    id: "3",
    title: "Digital Pulse",
    artist: "Binary Beat",
    image: "https://picsum.photos/seed/digital-pulse/400/400",
  },
  {
    id: "4",
    title: "Urban Groove",
    artist: "Metro Flow",
    image: "https://picsum.photos/seed/urban-groove/400/400",
  },
  {
    id: "5",
    title: "Feel The Love",
    artist: "VIDA Hollywood",
    image: "https://picsum.photos/seed/feel-the-love/400/400",
  },
];

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [playlistTitle] = useState(name ? decodeURIComponent(name) : "My Playlist");

  const renderSongRow = ({ item }: { item: SuggestedSong }) => (
    <Pressable style={styles.songRow}>
      <Image source={{ uri: item.image }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Pressable style={styles.addIcon}>
        <Ionicons name="add-circle-outline" size={24} color="#53E076" />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={suggestedSongs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerSpacer} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color="#555" />
            <Text style={styles.emptyText}>Không có gợi ý nào</Text>
          </View>
        }
        renderItem={renderSongRow}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={styles.footer}>
        <Pressable style={styles.footerItem} onPress={() => router.push("/(tabs)/home")}>
          <Ionicons name="home" size={24} color="#666" />
          <Text style={styles.footerText}>Home</Text>
        </Pressable>
        <Pressable style={styles.footerItem} onPress={() => router.push("/(tabs)/search")}>
          <Ionicons name="search" size={24} color="#666" />
          <Text style={styles.footerText}>Search</Text>
        </Pressable>
        <Pressable style={styles.footerItem} onPress={() => router.push("/(tabs)/library")}>
          <Ionicons name="library" size={24} color="#666" />
          <Text style={styles.footerText}>Library</Text>
        </Pressable>
        <Pressable style={styles.footerItem} onPress={() => router.push("/(tabs)/settings")}>
          <Ionicons name="settings" size={24} color="#666" />
          <Text style={styles.footerText}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0E0E0E" },
  listContent: { paddingBottom: 120 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: { flex: 1 },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
  },
  songInfo: { flex: 1 },
  songTitle: { color: "#E5E2E1", fontSize: 15, fontWeight: "600", marginBottom: 4 },
  songArtist: { color: "#888", fontSize: 12 },
  addIcon: { padding: 8 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#666", fontSize: 16 },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#121212",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#282828",
  },
  footerItem: { alignItems: "center", gap: 6 },
  footerText: { color: "#888", fontSize: 10, fontWeight: "600" },
});
