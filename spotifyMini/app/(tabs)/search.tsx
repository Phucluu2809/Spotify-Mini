import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { usePlayer, type Song } from "../../context/PlayerContext";
import { usePlaylist } from "../../context/PlaylistContext";
import { API } from "../../services/api";
import { getDefaultCoverUrl } from "../../services/media";

type SearchFilter = "all" | "artist" | "album" | "playlist" | "track";

type EntityResult = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  kind: SearchFilter;
  songs: Song[];
  albumId?: string;
  playlistId?: string;
};

type ResultItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  kind: SearchFilter;
  song?: Song;
  songs?: Song[];
  albumId?: string;
  playlistId?: string;
};

type PlaylistItem = {
  _id: string;
  name: string;
  cover?: string;
  songs?: Song[];
};

type AlbumItem = {
  _id: string;
  name: string;
  artist: string;
  cover?: string;
  songs?: Song[];
};

const searchCategories: Array<{
  key: Exclude<SearchFilter, "all">;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
    { key: "track", label: "Songs", icon: "musical-notes", color: "#1D4ED8" },
    { key: "artist", label: "Artists", icon: "person", color: "#9333EA" },
    { key: "album", label: "Albums", icon: "disc", color: "#0F766E" },
    { key: "playlist", label: "Playlists", icon: "list", color: "#BE123C" },
  ];

const normalize = (value?: string) => (value || "").trim().toLowerCase();

export default function SearchScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { playSong, currentSong } = usePlayer();
  const { playlists, followedPlaylists } = usePlaylist();
  const router = useRouter();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await API.get("/songs");
        setSongs(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await API.get("/albums");
        setAlbums(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
        setAlbums([]);
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      try {
        const res = await API.get("/playlists/public");
        setPublicPlaylists(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
        setPublicPlaylists([]);
      }
    };

    fetchPublicPlaylists();
  }, []);

  const categorizedEntities = useMemo(() => {
    const artistMap = new Map<string, EntityResult>();
    const albumMap = new Map<string, EntityResult>();
    const playlistMap = new Map<string, EntityResult>();

    songs.forEach((song) => {
      const artistKey = normalize(song.artist);
      if (artistKey) {
        if (!artistMap.has(artistKey)) {
          artistMap.set(artistKey, {
            id: `artist-${artistKey}`,
            title: song.artist,
            subtitle: "Artist",
            image: song.image,
            kind: "artist",
            songs: [],
          });
        }
        artistMap.get(artistKey)?.songs.push(song);
      }

    });

    albums.forEach((album) => {
      if (!album?._id || !album?.name) return;
      if (!albumMap.has(album._id)) {
        albumMap.set(album._id, {
          id: `album-${album._id}`,
          albumId: album._id,
          title: album.name,
          subtitle: `Album • ${album.artist || "Unknown artist"}`,
            image: album.cover || getDefaultCoverUrl(album.name),
          kind: "album",
          songs: album.songs || [],
        });
      }
    });

    const allPlaylists = [...publicPlaylists, ...playlists, ...followedPlaylists];
    allPlaylists.forEach((playlist) => {
      if (!playlist?._id || !playlist?.name) return;
      if (!playlistMap.has(playlist._id)) {
        playlistMap.set(playlist._id, {
          id: `playlist-${playlist._id}`,
          playlistId: playlist._id,
          title: playlist.name,
          subtitle: "Playlist",
          image: playlist.cover || getDefaultCoverUrl(playlist.name),
          kind: "playlist",
          songs: playlist.songs || [],
        });
      }
    });

    return {
      artists: Array.from(artistMap.values()),
      albums: Array.from(albumMap.values()),
      playlists: Array.from(playlistMap.values()),
    };
  }, [songs, albums, publicPlaylists, playlists, followedPlaylists]);

  const hasKeyword = keyword.trim().length > 0;
  const normalizedKeyword = normalize(keyword);

  const filteredTracks = useMemo(() => {
    if (!hasKeyword) return [];

    return songs.filter((song) => {
      const title = normalize(song.title);
      const artist = normalize(song.artist);
      const album = normalize(song.album);

      if (filter === "artist") return artist.includes(normalizedKeyword);
      if (filter === "album") return album.includes(normalizedKeyword);
      if (filter === "track") return title.includes(normalizedKeyword);

      return (
        title.includes(normalizedKeyword) ||
        artist.includes(normalizedKeyword) ||
        album.includes(normalizedKeyword)
      );
    });
  }, [songs, filter, hasKeyword, normalizedKeyword]);

  const filteredEntities = useMemo(() => {
    if (!hasKeyword) {
      return { artists: [], albums: [], playlists: [] } as {
        artists: EntityResult[];
        albums: EntityResult[];
        playlists: EntityResult[];
      };
    }

    const match = (value: string) => normalize(value).includes(normalizedKeyword);

    return {
      artists: categorizedEntities.artists.filter((item) => match(item.title)),
      albums: categorizedEntities.albums.filter(
        (item) => match(item.title) || match(item.subtitle)
      ),
      playlists: categorizedEntities.playlists.filter((item) => match(item.title)),
    };
  }, [categorizedEntities, hasKeyword, normalizedKeyword]);

  const searchResults = useMemo<ResultItem[]>(() => {
    if (!hasKeyword) return [];

    const fromEntities = (items: EntityResult[]) =>
      items.map<ResultItem>((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `${item.subtitle} • ${item.songs.length} bài`,
        image: item.image,
        kind: item.kind,
        songs: item.songs,
        albumId: item.kind === "album" ? item.albumId : undefined,
        playlistId: item.kind === "playlist" ? item.playlistId : undefined,
      }));

    const trackItems = filteredTracks.map<ResultItem>((song) => ({
      id: `track-${song._id}`,
      title: song.title,
      subtitle: `${song.artist}${song.album ? ` • ${song.album}` : ""}`,
      image: song.image,
      kind: "track",
      song,
    }));

    if (filter === "artist") return fromEntities(filteredEntities.artists);
    if (filter === "album") return fromEntities(filteredEntities.albums);
    if (filter === "playlist") return fromEntities(filteredEntities.playlists);
    if (filter === "track") return trackItems;

    return [
      ...fromEntities(filteredEntities.artists).slice(0, 3),
      ...fromEntities(filteredEntities.albums).slice(0, 3),
      ...fromEntities(filteredEntities.playlists).slice(0, 3),
      ...trackItems.slice(0, 12),
    ];
  }, [filteredEntities, filteredTracks, filter, hasKeyword]);

  const playResult = (item: ResultItem) => {
    if (item.kind === "track" && item.song) {
      playSong(item.song, filteredTracks);
      return;
    }

    if (item.kind === "album" && item.albumId) {
      router.push(`/(tabs)/album/${item.albumId}` as any);
      return;
    }

    if (item.kind === "artist") {
      router.push(`/(tabs)/artist/${encodeURIComponent(item.title)}` as any);
      return;
    }

    if (item.kind === "playlist" && item.playlistId) {
      router.push(`/(tabs)/playlist/${item.playlistId}` as any);
      return;
    }

    if (item.songs && item.songs.length > 0) {
      playSong(item.songs[0], item.songs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="white" />
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Search song, artist, album..."
          placeholderTextColor="#A3A3A3"
          style={styles.input}
        />
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip
          label="Artist"
          active={filter === "artist"}
          onPress={() => setFilter("artist")}
        />
        <FilterChip
          label="Album"
          active={filter === "album"}
          onPress={() => setFilter("album")}
        />
        <FilterChip
          label="Playlist"
          active={filter === "playlist"}
          onPress={() => setFilter("playlist")}
        />
        <FilterChip label="Track" active={filter === "track"} onPress={() => setFilter("track")} />
      </View>

      {!hasKeyword ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.browseContent}>
          <Text style={styles.browseTitle}>Browse by category</Text>
          <View style={styles.categoryGrid}>
            {searchCategories.map((category) => (
              <Pressable
                key={category.key}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => setFilter(category.key)}
              >
                <Ionicons name={category.icon} size={22} color="#fff" />
                <Text style={styles.categoryText}>{category.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.browseHint}>
            Nhập từ khóa để hiển thị kết quả theo từng phân loại.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No result found.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => playResult(item)}>
              <View style={styles.imageWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                  <View style={styles.imageFallback}>
                    <Ionicons name="musical-note" size={18} color="#C8C6C5" />
                  </View>
                )}
              </View>

              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subText} numberOfLines={1}>
                  {item.subtitle}
                </Text>
                {item.song && currentSong?._id === item.song._id ? (
                  <Text style={styles.playing}>Playing...</Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  heading: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchBox: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#282A2B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#333535",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterChipActive: {
    backgroundColor: "#1DB954",
  },
  filterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#004118",
  },
  browseContent: {
    paddingBottom: 180,
  },
  browseTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    borderRadius: 12,
    minHeight: 96,
    padding: 12,
    justifyContent: "space-between",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  browseHint: {
    color: "#A3A3A3",
    marginTop: 14,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 180,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#1F2023",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  subText: {
    color: "#C8C6C5",
    fontSize: 12,
    marginTop: 2,
  },
  playing: {
    color: "#1DB954",
    marginTop: 4,
    fontSize: 12,
  },
  emptyText: {
    color: "#A3A3A3",
    marginTop: 24,
    textAlign: "center",
  },
});
