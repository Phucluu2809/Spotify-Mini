import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { API } from '../../services/api';

type Song = {
  _id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audio: string;
  duration: number;
};

const PLAYLISTS: Record<string, { title: string; subtitle: string; image: string; accentColor: string }> = {
  'daily-mix-1': {
    title: 'Hyperfocus',
    subtitle: 'Lane 8, Ben Böhmer, Marsh and more',
    image: 'https://picsum.photos/seed/hyperfocus/800/500',
    accentColor: '#164C2E',
  },
  'daily-mix-2': {
    title: 'Groove Theory',
    subtitle: 'Kaytranada, SZA, Free Nationals and more',
    image: 'https://picsum.photos/seed/groovetheory/800/500',
    accentColor: '#2C7A46',
  },
};

const formatDuration = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentSong, isPlaying, playSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const playlist = id ? PLAYLISTS[id] : null;
  const title = playlist?.title || 'Playlist';
  const image = playlist?.image || `https://picsum.photos/seed/${id}/400/400`;

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await API.get('/songs');
        setSongs(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [id]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ImageBackground
              source={{ uri: image }}
              style={[styles.hero, { backgroundColor: playlist?.accentColor || '#164C2E' }]}
            >
              <View style={styles.heroOverlay} />
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>{title}</Text>
                {playlist?.subtitle && <Text style={styles.heroSubtitle}>{playlist.subtitle}</Text>}
                <Text style={styles.heroCount}>{songs.length} bài hát</Text>
              </View>
            </ImageBackground>

            {songs.length > 0 && (
              <Pressable style={styles.playAllButton} onPress={() => playSong(songs[0], songs)}>
                <Ionicons name="play" size={20} color="#0B0F0D" />
                <Text style={styles.playAllText}>Phát tất cả</Text>
              </Pressable>
            )}

            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#1DB954" size="large" />
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const isActive = currentSong?._id === item._id;
          return (
            <Pressable
              style={[styles.row, isActive && styles.rowActive]}
              onPress={() => playSong(item, songs)}
            >
              <Text style={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Image source={{ uri: item.image }} style={styles.rowImage} />
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              {isActive && isPlaying ? (
                <Ionicons name="musical-notes" size={16} color="#53E076" />
              ) : (
                <Text style={styles.rowDuration}>{formatDuration(item.duration)}</Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="musical-notes-outline" size={44} color="#4B5563" />
              <Text style={styles.emptyTitle}>Playlist đang trống</Text>
              <Text style={styles.emptySubtitle}>Chưa có bài hát nào được thêm vào đây.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E1012' },
  content: { paddingBottom: 140 },
  hero: { height: 300, justifyContent: 'space-between', padding: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  heroText: { zIndex: 1 },
  heroTitle: { color: '#fff', fontSize: 34, fontWeight: '900', fontStyle: 'italic', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 },
  heroCount: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  playAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 16, height: 50, borderRadius: 25, backgroundColor: '#53E076', marginBottom: 16 },
  playAllText: { color: '#0B0F0D', fontSize: 16, fontWeight: '800' },
  loadingWrap: { paddingTop: 40, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12, borderRadius: 12, marginHorizontal: 8, marginBottom: 2 },
  rowActive: { backgroundColor: 'rgba(83,224,118,0.08)' },
  rowIndex: { width: 24, color: '#4B5563', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  rowImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#1F2023' },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#E5E2E1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowTitleActive: { color: '#53E076' },
  rowArtist: { color: '#6B7280', fontSize: 12 },
  rowDuration: { color: '#6B7280', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { color: '#6B7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
});