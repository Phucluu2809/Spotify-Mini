import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { usePlayer } from '../../context/PlayerContext';

type HistoryEntry = {
  _id: string;
  song: {
    songId: string; title: string; artist: string;
    album: string; image: string; audio: string; duration: number;
  };
  playedAt: string;
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN');
};

export default function ListeningHistoryScreen() {
  const router = useRouter();
  const { playSong } = usePlayer();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('spotifymini.auth.token');
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const clearHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('spotifymini.auth.token');
      await fetch(`${API_URL}/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch (err) { console.log(err); }
  };

  const handlePlay = (entry: HistoryEntry) => {
    playSong({
      _id: entry.song.songId, title: entry.song.title,
      artist: entry.song.artist, album: entry.song.album,
      image: entry.song.image, audio: entry.song.audio,
      duration: entry.song.duration
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={22} color="#d8d8d8" />
          </Pressable>
          <Text style={styles.headerTitle}>History</Text>
          <Pressable style={styles.headerIcon} onPress={clearHistory}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color="#1fd05a" size="large" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="time-outline" size={42} color="#5d636b" />
            <Text style={styles.emptyTitle}>No listening history</Text>
            <Text style={styles.emptySubtitle}>Your listened tracks will appear here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {history.map((entry) => (
              <Pressable key={entry._id} style={styles.row} onPress={() => handlePlay(entry)}>
                <Image source={{ uri: entry.song.image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>{entry.song.title}</Text>
                  <Text style={styles.artist} numberOfLines={1}>{entry.song.artist}</Text>
                </View>
                <Text style={styles.time}>{formatTime(entry.playedAt)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090b0e' },
  content: { paddingTop: 52, paddingHorizontal: 22, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  headerIcon: { width: 46, height: 34, justifyContent: 'center' },
  headerTitle: { color: '#f1f1f1', fontSize: 34, fontWeight: '800' },
  clearText: { color: '#1fd05a', fontSize: 16, fontWeight: '700', textAlign: 'right' },
  emptyWrap: { marginTop: 80, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTitle: { marginTop: 14, color: '#e4e4e4', fontSize: 20, fontWeight: '700' },
  emptySubtitle: { marginTop: 6, color: '#8e949b', fontSize: 14 },
  list: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderRadius: 12, paddingHorizontal: 4 },
  image: { width: 52, height: 52, borderRadius: 10, marginRight: 14, backgroundColor: '#1c2220' },
  info: { flex: 1 },
  title: { color: '#f1f1f1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  artist: { color: '#7a7f84', fontSize: 13 },
  time: { color: '#4a4f55', fontSize: 12, marginLeft: 8, flexShrink: 0 }
});