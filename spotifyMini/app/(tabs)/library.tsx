import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image
} from "react-native";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

import MiniPlayer from "../../components/MiniPlayer";

export default function Library() {
  const [songs, setSongs] = useState<any[]>([]);

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
          <View style={styles.card}>
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
          </View>
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
  }
});