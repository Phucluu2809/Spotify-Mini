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
  clearListeningHistory,
  deleteHistoryEntry,
  getListeningHistory,
  historyEntryToSong,
  type HistoryEntry,
} from '../../services/historyService';

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('vi-VN');
};

const getDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function ListeningHistoryScreen() {
  const router = useRouter();
  const { playSong, currentSong } = usePlayer();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const queue = useMemo(() => history.map(historyEntryToSong), [history]);

  const fetchHistory = useCallback(async (showInitialLoading = false) => {
    try {
      if (showInitialLoading) setLoading(true);
      setError('');
      const data = await getListeningHistory(120);
      setHistory(data);
    } catch (err) {
      console.log('Fetch listening history error:', err);
      setError('Could not load listening history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void fetchHistory(true);
  }, [fetchHistory]));

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchHistory();
  };

  const handlePlay = (entry: HistoryEntry) => {
    const song = historyEntryToSong(entry);
    void playSong(song, queue.length ? queue : [song]);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteHistoryEntry(entryId);
      setHistory((items) => items.filter((item) => item._id !== entryId));
    } catch (err) {
      console.log('Delete history entry error:', err);
      Alert.alert('Could not delete', 'Please try again later.');
    }
  };

  const confirmClear = () => {
    if (history.length === 0) return;
    Alert.alert(
      'Clear Listening History',
      'All listening history for this account will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearListeningHistory();
              setHistory([]);
            } catch (err) {
              console.log('Clear history error:', err);
              Alert.alert('Could not clear', 'Please try again later.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/history')} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Listening History</Text>
          <Text style={styles.headerMeta}>{history.length} plays</Text>
        </View>
        <Pressable
          style={[styles.iconButton, history.length === 0 && styles.iconButtonDisabled]}
          onPress={confirmClear}
          disabled={history.length === 0}
        >
          <Ionicons name="trash-outline" size={20} color={history.length ? '#1fd05a' : '#555'} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#1fd05a" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={42} color="#8b949e" />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchHistory(true)}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={history.length ? styles.listContent : styles.emptyListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#1fd05a" />
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons name="time-outline" size={44} color="#5d636b" />
              <Text style={styles.emptyTitle}>No listening history</Text>
              <Text style={styles.emptySubtitle}>Tracks you play will appear here.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const previous = history[index - 1];
            const showDay = !previous || getDayLabel(previous.playedAt) !== getDayLabel(item.playedAt);
            const isActive = currentSong?._id === item.song.songId;

            return (
              <View>
                {showDay ? <Text style={styles.dayLabel}>{getDayLabel(item.playedAt)}</Text> : null}
                <Pressable style={styles.row} onPress={() => handlePlay(item)}>
                  <Image source={{ uri: item.song.image }} style={styles.image} />
                  <View style={styles.info}>
                    <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
                      {item.song.title}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                      {item.song.artist}
                    </Text>
                  </View>
                  <Text style={styles.time}>{formatRelativeTime(item.playedAt)}</Text>
                  <Pressable
                    style={styles.rowAction}
                    onPress={() => handleDeleteEntry(item._id)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color="#6f757c" />
                  </Pressable>
                </Pressable>
              </View>
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
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  iconButtonDisabled: { opacity: 0.5 },
  headerText: { alignItems: 'center', flex: 1 },
  headerTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: '800' },
  headerMeta: { color: '#7a8087', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 148 },
  emptyListContent: { flexGrow: 1 },
  dayLabel: {
    color: '#8e949b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'capitalize',
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  image: { width: 52, height: 52, borderRadius: 8, marginRight: 12, backgroundColor: '#1c2220' },
  info: { flex: 1, minWidth: 0 },
  title: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  titleActive: { color: '#1fd05a' },
  artist: { color: '#7a7f84', fontSize: 13 },
  time: { color: '#666d75', fontSize: 12, marginLeft: 8, maxWidth: 88, textAlign: 'right' },
  rowAction: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
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
