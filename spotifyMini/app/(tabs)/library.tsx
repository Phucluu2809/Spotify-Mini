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

import MiniPlayer from "../../components/MiniPlayer";
import { API } from "../../services/api";

type LibrarySection = "home" | "Albums" | "Playlists" | "Artists";

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  accent?: string;
  featured?: boolean;
};

const tabs: Array<Exclude<LibrarySection, "home">> = ["Albums", "Playlists", "Artists"];

const fallbackItems: LibraryItem[] = [
  { id: "liked-songs", title: "Liked Songs", subtitle: "Playlist • 412 songs", accent: "#4338CA" },
  { id: "after-hours-mood", title: "After Hours Mood", subtitle: "Playlist • Made for you", accent: "#2D6A4F" },
  { id: "midnight-cinema", title: "Midnight Cinema", subtitle: "Artist", accent: "#7C3AED" },
  { id: "parachutes", title: "Parachutes", subtitle: "Album • Coldplay", accent: "#0F766E" },
  { id: "focus-flow", title: "Focus Flow", subtitle: "Playlist • 120 tracks", accent: "#2563EB" },
  { id: "deep-house-chill", title: "Deep House Chill", subtitle: "Playlist • Recently Added", accent: "#1E3A8A" },
];

const albumItems: LibraryItem[] = [
  { id: "midnight-neon", title: "Midnight Neon", subtitle: "The Synthetic Echoes", accent: "#450AF5" },
  { id: "dark-horizon", title: "Dark Horizon", subtitle: "Luna Ray", accent: "#1E3A8A" },
  { id: "velocity", title: "Velocity", subtitle: "Chrome Pulse", accent: "#0F766E" },
  { id: "static-bloom", title: "Static Bloom", subtitle: "The Quiet Ones", accent: "#7C3AED" },
  { id: "vapor-trails", title: "Vapor Trails", subtitle: "Signal Path", accent: "#2D6A4F" },
  { id: "groove-theory", title: "Groove Theory", subtitle: "Vinyl Souls", accent: "#2563EB" },
];

const playlistItems: LibraryItem[] = [
  { id: "liked-songs", title: "Liked Songs", subtitle: "1,248 songs", accent: "#450AF5", featured: true },
  { id: "midnight-echoes", title: "Midnight Echoes", subtitle: "Playlist • 48 songs", accent: "#4338CA" },
  { id: "velvet-vinyl", title: "Velvet Vinyl", subtitle: "Playlist • Collector Edition", accent: "#0F766E" },
  { id: "after-hours-live", title: "After Hours Live", subtitle: "Playlist • Curated", accent: "#7C3AED" },
  { id: "neo-soul-focus", title: "Neo Soul Focus", subtitle: "Playlist • Study Vibes", accent: "#1E3A8A" },
  { id: "techno-core", title: "Techno Core", subtitle: "Playlist • Energy", accent: "#2D6A4F" },
  { id: "ambient-nights", title: "Ambient Nights", subtitle: "Playlist • Relax", accent: "#2563EB" },
];

const artistItems: LibraryItem[] = [
  { id: "the-midnight-echo", title: "The Midnight Echo", subtitle: "Artist • 2.4M Monthly Listeners", accent: "#4338CA", featured: true },
  { id: "neon-velvet", title: "Neon Velvet", subtitle: "Artist", accent: "#0F766E" },
  { id: "pulse-theory", title: "Pulse Theory", subtitle: "Artist", accent: "#7C3AED" },
  { id: "digital-ghost", title: "Digital Ghost", subtitle: "Artist", accent: "#1E3A8A" },
  { id: "luna-trace", title: "Luna Trace", subtitle: "Artist", accent: "#2D6A4F" },
  { id: "static-dreams", title: "Static Dreams", subtitle: "Artist", accent: "#2563EB" },
];

const recentTracks = [{ id: "feel-the-love", title: "Feel The Love", artist: "VIDA Hollywood" }];

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

function HeroBlock({
  title,
  subtitle,
  badge,
  accent,
  titleStyle,
  subtitleStyle,
  playStyle,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  accent: string;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  playStyle?: StyleProp<TextStyle>;
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
      <Text style={styles.squareTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.squareSubtitle} numberOfLines={2}>
        {item.subtitle}
      </Text>
    </View>
  );
}

function ListRow({ item }: { item: LibraryItem }) {
  return (
    <View style={styles.listRow}>
      <View style={[styles.listArt, !item.image && { backgroundColor: item.accent ?? "#2D6A4F" }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.listImage} />
        ) : (
          <Text style={styles.listArtText}>
            {item.title
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.listText}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

function ArtistRow({ item }: { item: LibraryItem }) {
  return (
    <View style={styles.artistRow}>
      <View style={styles.artistAvatarWrap}>
        <View style={[styles.artistAvatar, { backgroundColor: item.accent ?? "#2D6A4F" }]}>
          <View style={styles.artistAvatarInner} />
        </View>
        <View style={[styles.artistPlayBadge, item.featured && styles.artistPlayBadgeFeatured]}>
          <View style={styles.artistPlayInner} />
        </View>
      </View>

      <View style={styles.artistText}>
        {item.featured ? <Text style={styles.artistLabel}>MOST LISTENED</Text> : null}
        <Text style={[styles.artistName, item.featured && styles.artistNameFeatured]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artistMeta} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>

      <Text style={styles.artistMore}>⋮</Text>
    </View>
  );
}

function GridSection({
  label,
  hero,
  items,
  discoverLabel,
}: {
  label: string;
  hero: {
    title: string;
    subtitle: string;
    badge?: string;
    accent: string;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    playStyle?: StyleProp<TextStyle>;
  };
  items: LibraryItem[];
  discoverLabel: string;
}) {
  return (
    <>
      <SectionHeader label={label} />
      <HeroBlock {...hero} />
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <SquareCard item={item} />
          </View>
        ))}
      </View>
      <View style={styles.discoverCard}>
        <Text style={styles.discoverPlus}>+</Text>
        <Text style={styles.discoverText}>{discoverLabel}</Text>
      </View>
    </>
  );
}

export default function Library() {
  const [songs, setSongs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<LibrarySection>("home");
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setActiveTab("home");
    }, [])
  );

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
    if (!songs.length) {
      return fallbackItems;
    }

    return songs.map((song) => ({
      id: song._id,
      title: song.title,
      subtitle: `${song.artist} • Song`,
      image: song.image,
    }));
  }, [songs]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Your Library</Text>
          <View style={styles.headerAction}>
            <Text style={styles.headerActionText}>+</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TabChip
              key={tab}
              label={tab}
              active={tab === activeTab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>

        {activeTab === "Albums" ? (
          <GridSection
            label="Recents"
            hero={{
              title: "Midnight Neon",
              subtitle: "The Synthetic Echoes",
              accent: "#450AF5",
              titleStyle: styles.albumHeroTitle,
              subtitleStyle: styles.albumHeroSubtitle,
              playStyle: styles.albumHeroPlay as any,
            }}
            items={albumItems.slice(1)}
            discoverLabel="Find albums to listen to"
          />
        ) : activeTab === "Playlists" ? (
          <GridSection
            label="Recently Played"
            hero={{
              title: "Liked Songs",
              subtitle: "1,248 songs",
              badge: "MOST LISTENED",
              accent: "#450AF5",
              titleStyle: styles.playlistHeroTitle,
              subtitleStyle: styles.playlistHeroSubtitle,
              playStyle: styles.playlistHeroPlay as any,
            }}
            items={playlistItems.slice(1)}
            discoverLabel="Find playlists to follow"
          />
        ) : activeTab === "Artists" ? (
          <>
            <SectionHeader label="Recently added" />
            <View style={styles.artistStack}>
              {artistItems.map((item) => (
                <ArtistRow key={item.id} item={item} />
              ))}
            </View>
            <View style={styles.discoverCard}>
              <Text style={styles.discoverPlus}>+</Text>
              <Text style={styles.discoverText}>Find more artists to follow</Text>
            </View>
          </>
        ) : (
          <>
            <SectionHeader label="Recents" />
            {homeItems.map((item) => (
              <ListRow key={item.id} item={item} />
            ))}

            <View style={styles.trackCardSection}>
              {recentTracks.map((track) => (
                <View key={track.id} style={styles.trackRow}>
                  <View style={styles.trackArt}>
                    <View style={styles.trackDisc} />
                  </View>
                  <View style={styles.trackText}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <View style={styles.trackPlay}>
                    <Text style={styles.trackPlayText}>▶</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <MiniPlayer />
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
  playlistHeroPlay: { top: 16, right: 16, left: "auto", marginLeft: 0, width: 27, height: 30, borderRadius: 999 },  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
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
  trackCardSection: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 8 },
  trackRow: { flexDirection: "row", alignItems: "center", height: 80, paddingHorizontal: 16, gap: 16, borderRadius: 12 },
  trackArt: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#4338CA" },
  trackDisc: { width: 25, height: 22, borderRadius: 999, backgroundColor: "#FFFFFF", opacity: 0.95 },
  trackText: { flex: 1 },
  trackTitle: { color: "#E5E2E1", fontSize: 16, fontWeight: "500", marginBottom: 4 },
  trackArtist: { color: "#BCCBB9", fontSize: 12 },
  trackPlay: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#53E076", alignItems: "center", justifyContent: "center" },
  trackPlayText: { color: "#002108", fontSize: 14, fontWeight: "900", marginLeft: 2 },
  artistStack: { gap: 12, marginBottom: 14 },
  artistRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1B1B", borderRadius: 12, padding: 16, minHeight: 114 },
  artistAvatarWrap: { width: 80, height: 80, marginRight: 16, flexShrink: 0 },
  artistAvatar: { width: 80, height: 80, borderRadius: 999, overflow: "hidden", alignItems: "center", justifyContent: "center" },
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
});
