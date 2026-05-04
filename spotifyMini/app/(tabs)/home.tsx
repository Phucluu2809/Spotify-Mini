import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { useEffect, useState } from 'react';

import axios from 'axios';

import { usePlayer } from '../../context/PlayerContext';

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  const { playSong, currentSong } =
    usePlayer();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await axios.get(
        'http://192.168.1.20:5000/songs'
      );

      setSongs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Spotify Mini
      </Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => playSong(item)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.artist}>
                {item.artist}
              </Text>

              {currentSong?._id === item._id && (
                <Text style={styles.playing}>
                  Playing...
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20
  },

  heading: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15
  },

  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },

  artist: {
    color: 'gray',
    marginTop: 4
  },

  playing: {
    color: '#1DB954',
    marginTop: 5
  }
});