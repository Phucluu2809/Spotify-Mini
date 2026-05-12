import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { usePlayer } from '../../context/PlayerContext';

type RecentEntry = {
  _id: string;
  song: {
    songId: string; title: string; artist: string;
    album: string; image: string; audio: string; duration: number;
  };
  playedAt: string;
};

export default function RecentlyPlayedScreen() {
  const router = useRouter();
  const { playSong, currentSong } = usePlayer();
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchRecent(); }, []));

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('spotifymini.auth.token');
      const res = await fetch(`${API_URL}/history/recently-played`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecent(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const handlePlay = (entry: RecentEntry) => {
    const allSongs = recent.map((e) => ({
      _id: e.song.songId, title: e.song.title, artist: e.song.artist,
      album: e.song.album, image: e.song.image, audio: e.song.audio,
      duration: e.song.duration
    }));
    const song = allSongs.find((s) => s._id === entry.song.songId)!;
    playSong(song, allSongs);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={22} color="#d8d8d8" />
        </Pressable>
        <Text style={styles.headerTitle}>Recently Played</Text>
        <Pressable style={styles.headerIcon} onPress={fetchRecent}>
          <Ionicons name="refresh" size={22} color="#d8d8d8" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.emptyWrap}><ActivityIndicator color="#1fd05a" size="large" /></View>
      ) : recent.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="albums-outline" size={44} color="#5d636b" />
          <Text style={styles.emptyTitle}>No recently played tracks</Text>
          <Text style={styles.emptySubtitle}>Your latest songs will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item) => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isPlaying = currentSong?._id === item.song.songId;
            return (
              <Pressable style={styles.card} onPress={() => handlePlay(item)}>
                <Image source={{ uri: item.song.image }} style={styles.image} />
                {isPlaying && (
                  <View style={styles.playingBadge}>
                    <Ionicons name="musical-notes" size={12} color="#0a0b0f" />
                  </View>
                )}
                <Text style={[styles.songTitle, isPlaying && styles.songTitleActive]} numberOfLines={1}>
                  {item.song.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.song.artist}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0b0f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 18, marginBottom: 20
  },
  headerIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ededed', fontSize: 28, fontWeight: '800' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTitle: { marginTop: 14, color: '#e4e4e4', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { marginTop: 6, color: '#8e949b', fontSize: 14, textAlign: 'center' },
  grid: { paddingHorizontal: 14, paddingBottom: 140 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '48%' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#1c2220', marginBottom: 8 },
  playingBadge: {
    position: 'absolute', top: 8, right: 8, width: 22, height: 22,
    borderRadius: 11, backgroundColor: '#1fd05a', alignItems: 'center', justifyContent: 'center'
  },
  songTitle: { color: '#ededed', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  songTitleActive: { color: '#1fd05a' },
  songArtist: { color: '#6f757c', fontSize: 12 }
});