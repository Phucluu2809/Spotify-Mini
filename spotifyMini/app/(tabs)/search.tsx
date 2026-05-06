import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { usePlayer } from "../../context/PlayerContext";
import { API } from "../../services/api";

type SearchFilter = "all" | "artist" | "album";

export default function SearchScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { playSong, currentSong } = usePlayer();

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

  const filteredSongs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return songs;
    }

    return songs.filter((song) => {
      const title = (song.title || "").toLowerCase();
      const artist = (song.artist || "").toLowerCase();
      const album = (song.album || "").toLowerCase();

      if (filter === "artist") {
        return artist.includes(normalizedKeyword);
      }

      if (filter === "album") {
        return album.includes(normalizedKeyword);
      }

      return (
        title.includes(normalizedKeyword) ||
        artist.includes(normalizedKeyword) ||
        album.includes(normalizedKeyword)
      );
    });
  }, [songs, keyword, filter]);

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
        <FilterChip
          label="All"
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
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
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No result found.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => playSong(item)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <View style={styles.meta}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subText}>
                {item.artist}
                {item.album ? ` • ${item.album}` : ""}
              </Text>
              {currentSong?._id === item._id && (
                <Text style={styles.playing}>Playing...</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 16
  },
  heading: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12
  },
  searchBox: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#282A2B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12
  },
  input: {
    flex: 1,
    color: "white",
    marginLeft: 8,
    fontSize: 16
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8
  },
  filterChip: {
    backgroundColor: "#333535",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  filterChipActive: {
    backgroundColor: "#1DB954"
  },
  filterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  },
  filterTextActive: {
    color: "#004118"
  },
  listContent: {
    paddingBottom: 180
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12
  },
  meta: {
    flex: 1
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  },
  subText: {
    color: "#C8C6C5",
    fontSize: 12,
    marginTop: 2
  },
  playing: {
    color: "#1DB954",
    marginTop: 4,
    fontSize: 12
  },
  emptyText: {
    color: "#A3A3A3",
    marginTop: 24,
    textAlign: "center"
  }
});
