import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from "react-native";

import { useEffect, useState } from "react";

import { API } from "../../services/api";
import {
  usePlayer,
  type Song
} from "../../context/PlayerContext";

export default function Library() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, currentSong } = usePlayer();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const res = await API.get("/songs");

    setSongs(res.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Your Library
      </Text>

      <FlatList
        data={songs}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => playSong(item, songs)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.artist}>
              {item.artist}
            </Text>
            {currentSong?._id === item._id && (
              <Text style={styles.playing}>Playing...</Text>
            )}
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    paddingHorizontal: 15
  },

  header: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    width: "48%",
    marginBottom: 20,
    marginRight: "2%"
  },

  image: {
    width: "100%",
    height: 160,
    borderRadius: 15
  },

  title: {
    color: "white",
    marginTop: 10,
    fontWeight: "bold"
  },

  artist: {
    color: "gray"
  },
  playing: {
    color: "#1DB954",
    marginTop: 4
  }
});
