import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { API } from "../../services/api";
import { usePlaylist } from "../../context/PlaylistContext";
import { useAlbum } from "../../context/AlbumContext";
import { useArtist } from "../../context/ArtistContext";

type LibrarySection = "home" | "Albums" | "Playlists" | "Artists";

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  accent?: string;
  featured?: boolean;
  artistName?: string;
};

const getDemoImage = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;

const tabs: Array<Exclude<LibrarySection, "home">> = ["Albums", "Playlists", "Artists"];

const fallbackItems: LibraryItem[] = [
  { id: "liked-songs", title: "Liked Songs", subtitle: "Playlist • 412 songs", accent: "#4338CA", image: getDemoImage("liked-songs") },
  { id: "after-hours-mood", title: "After Hours Mood", subtitle: "Playlist • Made for you", accent: "#2D6A4F", image: getDemoImage("after-hours-mood") },
  { id: "midnight-cinema", title: "Midnight Cinema", subtitle: "Artist", accent: "#7C3AED", image: getDemoImage("midnight-cinema"), artistName: "Midnight Cinema" },
  { id: "parachutes", title: "Parachutes", subtitle: "Album • Coldplay", accent: "#0F766E", image: getDemoImage("parachutes") },
  { id: "focus-flow", title: "Focus Flow", subtitle: "Playlist • 120 tracks", accent: "#2563EB", image: getDemoImage("focus-flow") },
  { id: "deep-house-chill", title: "Deep House Chill", subtitle: "Playlist • Recently Added", accent: "#1E3A8A", image: getDemoImage("deep-house-chill") },
];

const albumItems: LibraryItem[] = [
  { id: "midnight-neon", title: "Midnight Neon", subtitle: "The Synthetic Echoes", accent: "#450AF5", image: getDemoImage("midnight-neon") },
  { id: "dark-horizon", title: "Dark Horizon", subtitle: "Luna Ray", accent: "#1E3A8A", image: getDemoImage("dark-horizon") },
  { id: "velocity", title: "Velocity", subtitle: "Chrome Pulse", accent: "#0F766E", image: getDemoImage("velocity") },
  { id: "static-bloom", title: "Static Bloom", subtitle: "The Quiet Ones", accent: "#7C3AED", image: getDemoImage("static-bloom") },
  { id: "vapor-trails", title: "Vapor Trails", subtitle: "Signal Path", accent: "#2D6A4F", image: getDemoImage("vapor-trails") },
  { id: "groove-theory", title: "Groove Theory", subtitle: "Vinyl Souls", accent: "#2563EB", image: getDemoImage("groove-theory") },
];

const playlistItems: LibraryItem[] = [
  { id: "liked-songs", title: "Liked Songs", subtitle: "1,248 songs", accent: "#450AF5", featured: true, image: getDemoImage("liked-songs-playlist") },
  { id: "midnight-echoes", title: "Midnight Echoes", subtitle: "Playlist • 48 songs", accent: "#4338CA", image: getDemoImage("midnight-echoes") },
  { id: "velvet-vinyl", title: "Velvet Vinyl", subtitle: "Playlist • Collector Edition", accent: "#0F766E", image: getDemoImage("velvet-vinyl") },
  { id: "after-hours-live", title: "After Hours Live", subtitle: "Playlist • Curated", accent: "#7C3AED", image: getDemoImage("after-hours-live") },
  { id: "neo-soul-focus", title: "Neo Soul Focus", subtitle: "Playlist • Study Vibes", accent: "#1E3A8A", image: getDemoImage("neo-soul-focus") },
  { id: "techno-core", title: "Techno Core", subtitle: "Playlist • Energy", accent: "#2D6A4F", image: getDemoImage("techno-core") },
];

const artistItems: LibraryItem[] = [];

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderIcon}>↻</Text>
        <Text style={styles.sectionHeaderText}>{label}</Text>
      </View>
      <Text style={styles.sectionHeaderSort}>☰</Text>
    </View>
  );
}

function TabChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function HeroBlock({ title, subtitle, badge, accent, titleStyle, subtitleStyle, playStyle }: {
  title: string; subtitle: string; badge?: string; accent: string;
  titleStyle?: StyleProp<TextStyle>; subtitleStyle?: StyleProp<TextStyle>; playStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.heroCard, { backgroundColor: accent }]}>
      <View style={styles.heroOverlay} />
      <View style={[styles.heroPlay, playStyle as any]}>
        <View style={styles.heroPlayInner} />
      </View>
      <View style={styles.heroText}>
        {badge ? <Text style={styles.heroBadge}>{badge}</Text> : null}
        <Text style={[styles.heroTitleBase, titleStyle]}>{title}</Text>
        <Text style={[styles.heroSubtitleBase, subtitleStyle]}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SquareCard({ item }: { item: LibraryItem }) {
  return (
    <View style={styles.squareCard}>
      <View style={[styles.squareArt, { backgroundColor: item.accent ?? "#2D6A4F" }]}>
        {item.image ? <Image source={{ uri: item.image }} style={styles.squareImage} /> : <View style={styles.squareOverlay} />}
      </View>
      <Text style={styles.squareTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.squareSubtitle} numberOfLines={2}>{item.subtitle}</Text>
    </View>
  );
}

function ListRow({ item, onPress }: { item: LibraryItem; onPress?: () => void }) {
  return (
    <Pressable style={styles.listRow} onPress={onPress}>
      <View style={[styles.listArt, !item.image && { backgroundColor: item.accent ?? "#2D6A4F" }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.listImage} />
        ) : (
          <Text style={styles.listArtText}>
            {item.title.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.listText}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
    </Pressable>
  );
}

function ArtistRow({ item, onPress }: { item: LibraryItem; onPress?: () => void }) {
  return (
    <Pressable style={styles.artistRow} onPress={onPress}>
      <View style={styles.artistAvatarWrap}>
        <View style={[styles.artistAvatar, { backgroundColor: item.accent ?? "#2D6A4F" }]}>
          {item.image ? <Image source={{ uri: item.image }} style={styles.artistAvatarImage} /> : <View style={styles.artistAvatarInner} />}
        </View>
        <View style={[styles.artistPlayBadge, item.featured && styles.artistPlayBadgeFeatured]}>
          <View style={styles.artistPlayInner} />
        </View>
      </View>
      <View style={styles.artistText}>
        {item.featured ? <Text style={styles.artistLabel}>MOST LISTENED</Text> : null}
        <Text style={[styles.artistName, item.featured && styles.artistNameFeatured]} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artistMeta} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Text style={styles.artistMore}>⋮</Text>
    </Pressable>
  );
}

function GridSection({
  label,
  hero,
  items,
  discoverLabel,
  showDiscoverPlus = true,
  onItemPress,
  heroId,
}: {
  label: string;
  hero: { title: string; subtitle: string; badge?: string; accent: string; titleStyle?: StyleProp<TextStyle>; subtitleStyle?: StyleProp<TextStyle>; playStyle?: StyleProp<TextStyle> };
  items: LibraryItem[];
  discoverLabel: string;
  showDiscoverPlus?: boolean;
  onItemPress?: (id: string) => void;
  heroId?: string;
}) {
  return (
    <>
      <SectionHeader label={label} />
      <Pressable onPress={() => heroId && onItemPress?.(heroId)}>
        <HeroBlock {...hero} />
      </Pressable>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onItemPress?.(item.id)} style={styles.gridItem}>
            <SquareCard item={item} />
          </Pressable>
        ))}
      </View>
      <View style={styles.discoverCard}>
        {showDiscoverPlus ? <Text style={styles.discoverPlus}>+</Text> : null}
        <Text style={styles.discoverText}>{discoverLabel}</Text>
      </View>
    </>
  );
}

export default function Library() {
  const [songs, setSongs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<LibrarySection>("home");
  const navigation = useNavigation();
  const router = useRouter();
  const { playlists, loading: playlistsLoading } = usePlaylist();
  const { albums, loading: albumsLoading } = useAlbum();
  const { followedArtists, loading: artistsLoading } = useArtist();

  useFocusEffect(useCallback(() => { setActiveTab("home"); }, []));

  useEffect(() => {
    const parentNavigation = navigation.getParent?.() as any;
    const unsubscribe = parentNavigation?.addListener("tabPress", () => setActiveTab("home"));
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await API.get("/songs");
        setSongs(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSongs();
  }, []);

  const homeItems = useMemo<LibraryItem[]>(() => {
    const likedSongsItem = {
      id: "liked-songs",
      title: "Liked Songs",
      subtitle: `Playlist • ${songs.length} songs`,
      accent: "#4338CA",
      image: getDemoImage("liked-songs"),
    };
    if (!songs.length) return fallbackItems;
    return [likedSongsItem, ...songs.map((song) => ({
      id: song._id,
      title: song.title,
      subtitle: `${song.artist} • Song`,
      image: song.image,
      artistName: song.artist,
    }))];
  }, [songs]);

  const albumsDisplay = useMemo<LibraryItem[]>(() => {
    if (albums.length > 0) {
      return albums.map((album, idx) => ({
        id: album._id,
        title: album.name,
        subtitle: `Album • ${album.artist}`,
        image: album.cover || getDemoImage(album.name),
        accent: ["#4338CA", "#0F766E", "#7C3AED", "#1E3A8A", "#2D6A4F", "#2563EB"][idx % 6],
      }));
    }
    return albumItems;
  }, [albums]);

  const playlistsDisplay = useMemo<LibraryItem[]>(() => {
    if (playlists.length > 0) {
      return playlists.map((playlist, idx) => ({
        id: playlist._id,
        title: playlist.name,
        subtitle: `Playlist • ${playlist.songs?.length || 0} songs`,
        image: playlist.cover || getDemoImage(playlist.name),
        accent: ["#4338CA", "#0F766E", "#7C3AED", "#1E3A8A", "#2D6A4F", "#2563EB"][idx % 6],
      }));
    }
    return playlistItems;
  }, [playlists]);

  const artistsDisplay = useMemo<LibraryItem[]>(() => {
    return followedArtists.map((artist, idx) => ({
      id: artist._id,
      title: artist.name,
      subtitle: `Artist • ${artist.followers ? `${artist.followers.toLocaleString()} followers • ` : ""}${artist.songs?.length || 0} bài hát`,
      image: artist.image || getDemoImage(artist.name),
      accent: ["#4338CA", "#0F766E", "#7C3AED", "#1E3A8A", "#2D6A4F", "#2563EB"][idx % 6],
      featured: idx === 0,
      artistName: artist.name,
    }));
  }, [followedArtists]);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Your Library</Text>
          <View style={styles.headerAction}>
            {activeTab === "Playlists" ? (
              <Pressable onPress={() => router.push("/add-playlist")} hitSlop={8}>
                <Text style={styles.headerActionText}>+</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TabChip key={tab} label={tab} active={tab === activeTab} onPress={() => setActiveTab(tab)} />
          ))}
        </View>

        {activeTab === "Albums" ? (
          <>
            {albumsLoading ? (
              <Text style={styles.loadingText}>Loading albums...</Text>
            ) : albums.length === 0 ? (
              <Text style={styles.emptyText}>No albums found</Text>
            ) : (
              <GridSection
                label="Albums"
                hero={{
                  title: albums[0]?.name || "Albums",
                  subtitle: albums[0]?.artist || "Various Artists",
                  accent: "#450AF5",
                  titleStyle: styles.albumHeroTitle,
                  subtitleStyle: styles.albumHeroSubtitle,
                  playStyle: styles.albumHeroPlay as any,
                }}
                items={albumsDisplay.slice(1)}
                discoverLabel="Find albums to listen to"
                showDiscoverPlus={false}
                heroId={albums[0]?._id}
                onItemPress={(id) => router.push(`/album/${id}`)}
              />
            )}
          </>
        ) : activeTab === "Playlists" ? (
          <>
            {playlistsLoading ? (
              <Text style={styles.loadingText}>Loading playlists...</Text>
            ) : playlists.length === 0 ? (
              <Text style={styles.emptyText}>No playlists yet. Create one to get started!</Text>
            ) : (
              <GridSection
                label="Your Playlists"
                hero={{
                  title: playlists[0]?.name || "Playlists",
                  subtitle: `${playlists[0]?.songs?.length || 0} songs`,
                  badge: "YOUR PLAYLIST",
                  accent: "#450AF5",
                  titleStyle: styles.playlistHeroTitle,
                  subtitleStyle: styles.playlistHeroSubtitle,
                  playStyle: styles.playlistHeroPlay as any,
                }}
                items={playlistsDisplay.slice(1)}
                discoverLabel="Create or find playlists"
                heroId={playlists[0]?._id}
                onItemPress={(id) => router.push(`/playlist/${id}`)}
              />
            )}
          </>
        ) : activeTab === "Artists" ? (
          <>
            {artistsLoading ? (
              <Text style={styles.loadingText}>Loading followed artists...</Text>
            ) : artistsDisplay.length === 0 ? (
              <View style={styles.emptyArtistsContainer}>
                <Text style={styles.emptyArtistsTitle}>Chưa theo dõi artist nào</Text>
                <Text style={styles.emptyArtistsText}>Khám phá các artist yêu thích của bạn</Text>
                <Pressable 
                  style={styles.discoverButton}
                  onPress={() => {
                    // TODO: Navigate to artist discovery page
                    router.push("/(tabs)/explore" as any);
                  }}
                >
                  <Text style={styles.discoverButtonText}>Khám phá</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <SectionHeader label="Theo dõi" />
                <View style={styles.artistStack}>
                  {artistsDisplay.map((item) => (
                    <ArtistRow
                      key={item.id}
                      item={item}
                      onPress={() =>
                        item.artistName &&
                        router.push(`/artist/${encodeURIComponent(item.artistName)}` as any)
                      }
                    />
                  ))}
                </View>
              </>
            )}
          </>
        ) :(
          <>
            <SectionHeader label="Recents" />
            {homeItems.map((item) => (
              <ListRow
                key={item.id}
                item={item}
                onPress={
                  item.id === "liked-songs"
                    ? () => navigation.navigate("my-playlist" as never)
                    : item.artistName
                    ? () => router.push(`/artist/${encodeURIComponent(item.artistName!)}` as any)
                    : undefined
                }
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1 },
  content: { paddingTop: 80, paddingHorizontal: 16, paddingBottom: 150 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  header: { color: "#E5E2E1", fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  headerAction: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  headerActionText: { color: "#9CA3AF", fontSize: 20, fontWeight: "600" },
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  chip: { height: 30, minWidth: 70, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: "#E5E2E1" },
  chipText: { color: "#E5E2E1", fontSize: 12, fontWeight: "500" },
  chipTextActive: { color: "#121212", fontWeight: "700" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionHeaderIcon: { color: "#BCCBB9", fontSize: 12, lineHeight: 12 },
  sectionHeaderText: { color: "#BCCBB9", fontSize: 12, fontWeight: "500" },
  sectionHeaderSort: { color: "#BCCBB9", fontSize: 14 },
  heroCard: { marginBottom: 16, borderRadius: 12, overflow: "hidden", minHeight: 179, padding: 16, justifyContent: "flex-end", position: "relative" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.08)" },
  heroPlay: { width: 48, height: 48, borderRadius: 999, backgroundColor: "#53E076", position: "absolute", alignItems: "center", justifyContent: "center", top: 16, left: "50%", marginLeft: -24 },
  heroPlayInner: { width: 11, height: 14, backgroundColor: "#004118", borderRadius: 2 },
  heroText: { zIndex: 1 },
  heroBadge: { color: "#FFFFFF", fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 0.7 },
  heroTitleBase: { color: "#FFFFFF", marginBottom: 4 },
  heroSubtitleBase: { color: "rgba(255,255,255,0.8)" },
  albumHeroTitle: { fontSize: 14, fontWeight: "400" },
  albumHeroSubtitle: { fontSize: 16, fontWeight: "400" },
  albumHeroPlay: { left: "50%", marginLeft: -24 },
  playlistHeroTitle: { fontSize: 20, fontWeight: "900" },
  playlistHeroSubtitle: { fontSize: 12 },
  playlistHeroPlay: { top: 16, right: 16, left: "auto", marginLeft: 0, width: 27, height: 30, borderRadius: 999 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48%", marginBottom: 16 },
  squareCard: { width: "100%" },
  squareArt: { width: "100%", aspectRatio: 1, borderRadius: 8, overflow: "hidden", marginBottom: 8, backgroundColor: "#2D6A4F" },
  squareImage: { width: "100%", height: "100%" },
  squareOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  squareTitle: { color: "#E5E2E1", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  squareSubtitle: { color: "#BCCBB9", fontSize: 12, lineHeight: 16 },
  discoverCard: { marginTop: 4, minHeight: 92, borderRadius: 12, backgroundColor: "rgba(28,27,27,1)", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 10 },
  discoverPlus: { color: "#BCCBB9", fontSize: 20, fontWeight: "700" },
  discoverText: { color: "#BCCBB9", fontSize: 14, textAlign: "center" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 16, height: 80, borderRadius: 12, padding: 8, marginBottom: 12, backgroundColor: "rgba(255,255,255,0.02)" },
  listArt: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listImage: { width: "100%", height: "100%" },
  listArtText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
  listText: { flex: 1 },
  listTitle: { color: "#E5E2E1", fontSize: 16, fontWeight: "500", marginBottom: 4 },
  listSubtitle: { color: "#BCCBB9", fontSize: 12 },
  artistStack: { gap: 12, marginBottom: 14 },
  artistRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1B1B", borderRadius: 12, padding: 16, minHeight: 114 },
  artistAvatarWrap: { width: 80, height: 80, marginRight: 16, flexShrink: 0 },
  artistAvatar: { width: 80, height: 80, borderRadius: 999, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  artistAvatarImage: { width: "100%", height: "100%" },
  artistAvatarInner: { width: 80, height: 80, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 999 },
  artistPlayBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#53E076", position: "absolute", top: 29, left: 58, alignItems: "center", justifyContent: "center" },
  artistPlayBadgeFeatured: { backgroundColor: "#53E076" },
  artistPlayInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#002108" },
  artistText: { flex: 1, paddingRight: 10 },
  artistLabel: { color: "#53E076", fontSize: 10, fontWeight: "800", marginBottom: 6, letterSpacing: 0.6 },
  artistName: { color: "#E5E2E1", fontSize: 16, fontWeight: "400", marginBottom: 4 },
  artistNameFeatured: { fontSize: 18 },
  artistMeta: { color: "#BCCBB9", fontSize: 12 },
  artistMore: { width: 20, textAlign: "center", color: "#53E076", fontSize: 18, lineHeight: 18 },
  loadingText: { color: "#BCCBB9", fontSize: 14, textAlign: "center", marginTop: 20 },
  emptyText: { color: "#BCCBB9", fontSize: 14, textAlign: "center", marginTop: 20 },
  emptyArtistsContainer: { alignItems: "center", justifyContent: "center", marginTop: 60, gap: 12 },
  emptyArtistsTitle: { color: "#E5E2E1", fontSize: 18, fontWeight: "700" },
  emptyArtistsText: { color: "#BCCBB9", fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
  discoverButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#53E076", borderRadius: 25, alignItems: "center", justifyContent: "center" },
  discoverButtonText: { color: "#0B0F0D", fontSize: 14, fontWeight: "700" },
});
