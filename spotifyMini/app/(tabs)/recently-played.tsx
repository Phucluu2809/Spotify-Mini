import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import {
  deleteRecentlyPlayedSong,
  getRecentlyPlayed,
  historyEntryToSong,
  type HistoryEntry,
} from '../../services/historyService';

const formatLastPlayed = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US');
};

export default function RecentlyPlayedScreen() {
  const router = useRouter();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const queue = useMemo(() => recent.map(historyEntryToSong), [recent]);

  const fetchRecent = useCallback(async (showInitialLoading = false) => {
    try {
      if (showInitialLoading) setLoading(true);
      setError('');
      const data = await getRecentlyPlayed(24);
      setRecent(data);
    } catch (err) {
      console.log('Fetch recently played error:', err);
      setError('Could not load recently played tracks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void fetchRecent(true);
  }, [fetchRecent]));

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchRecent();
  };

  const handlePlay = (entry: HistoryEntry) => {
    const song = historyEntryToSong(entry);
    void playSong(song, queue.length ? queue : [song]);
  };

  const handlePlayAll = () => {
    if (!queue.length) return;
    void playSong(queue[0], queue);
  };

  const handleRemoveSong = async (entry: HistoryEntry) => {
    try {
      await deleteRecentlyPlayedSong(entry.song.songId);
      setRecent((items) => items.filter((item) => item.song.songId !== entry.song.songId));
    } catch (err) {
      console.log('Remove recently played error:', err);
      Alert.alert('Could not remove', 'Please try again later.');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/history')} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Recently Played</Text>
          <Text style={styles.headerMeta}>{recent.length} tracks</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={21} color="#e5e7eb" />
        </Pressable>
      </View>

      {recent.length > 0 && !loading && !error ? (
        <View style={styles.actionRow}>
          <Pressable style={styles.playAllButton} onPress={handlePlayAll}>
            <Ionicons name="play" size={16} color="#071008" />
            <Text style={styles.playAllText}>Play All</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#1fd05a" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={42} color="#8b949e" />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchRecent(true)}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item) => item.song.songId}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={recent.length ? styles.grid : styles.emptyListContent}
          columnWrapperStyle={styles.gridRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#1fd05a" />
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons name="albums-outline" size={44} color="#5d636b" />
              <Text style={styles.emptyTitle}>No recently played tracks</Text>
              <Text style={styles.emptySubtitle}>Tracks you listen to will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const active = currentSong?._id === item.song.songId;
            return (
              <Pressable style={styles.card} onPress={() => handlePlay(item)}>
                <View style={styles.coverWrap}>
                  <Image source={{ uri: item.song.image }} style={styles.image} />
                  <View style={[styles.playBadge, active && isPlaying && styles.playBadgeActive]}>
                    <Ionicons name={active && isPlaying ? 'pause' : 'play'} size={15} color="#071008" />
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveSong(item)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color="#f1f5f9" />
                  </Pressable>
                </View>
                <Text style={[styles.songTitle, active && styles.songTitleActive]} numberOfLines={1}>
                  {item.song.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {item.song.artist}
                </Text>
                <Text style={styles.playedAt}>{formatLastPlayed(item.playedAt)}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090b0e' },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerText: { alignItems: 'center', flex: 1 },
  headerTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: '800' },
  headerMeta: { color: '#7a8087', fontSize: 12, marginTop: 2 },
  actionRow: { paddingHorizontal: 18, paddingBottom: 14, alignItems: 'flex-start' },
  playAllButton: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#1fd05a',
  },
  playAllText: { color: '#071008', fontSize: 14, fontWeight: '800' },
  grid: { paddingHorizontal: 16, paddingBottom: 148 },
  emptyListContent: { flexGrow: 1 },
  gridRow: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 20 },
  coverWrap: { width: '100%', aspectRatio: 1, marginBottom: 9 },
  image: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#1c2220' },
  playBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeActive: { backgroundColor: '#49e978' },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  songTitleActive: { color: '#1fd05a' },
  songArtist: { color: '#7a7f84', fontSize: 13 },
  playedAt: { color: '#5c636b', fontSize: 12, marginTop: 4 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { marginTop: 14, color: '#e4e4e4', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { marginTop: 6, color: '#8e949b', fontSize: 14, textAlign: 'center' },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1fd05a',
  },
  retryText: { color: '#061008', fontSize: 14, fontWeight: '800' },
});
