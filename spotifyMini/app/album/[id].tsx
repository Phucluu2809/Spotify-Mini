import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useAlbum } from '../../context/AlbumContext';
import { usePlayer } from '../../context/PlayerContext';

type Song = {
  _id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audio: string;
  duration: number;
};

type Album = {
  _id: string;
  name: string;
  artist: string;
  cover?: string;
  songs: Song[];
};

const formatDuration = (duration: number) => {
  const ms = duration > 0 && duration < 1000 ? duration * 1000 : duration;
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const { getAlbumById, followAlbum, unfollowAlbum, isAlbumFollowed } = useAlbum();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getAlbumById(id);
      setAlbum(data as Album | null);
      setLoading(false);
    };
    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (!album?.songs?.length) return;
    const queue = album.songs;
    const isAlbumPlaying = Boolean(currentSong && queue.some((song) => song._id === currentSong._id));

    if (isAlbumPlaying) {
      void togglePlayPause();
      return;
    }

    void playSong(queue[0], queue);
  };

  const followed = Boolean(album?._id && isAlbumFollowed(album._id));
  const isAlbumActive = Boolean(currentSong && album?.songs?.some((song) => song._id === currentSong._id));

  const handleFollowToggle = async () => {
    if (!album?._id) return;
    setFollowLoading(true);
    const ok = followed ? await unfollowAlbum(album._id) : await followAlbum(album._id);
    if (ok) {
      Alert.alert(
        followed ? 'Album removed' : 'Album saved',
        followed
          ? `Album "${album.name}" has been removed from your library.`
          : `Album "${album.name}" has been added to your library.`
      );
    }
    setFollowLoading(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={album?.songs || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ImageBackground
              source={{ uri: album?.cover || `https://picsum.photos/seed/${album?._id || 'album'}/400/400` }}
              style={styles.hero}
            >
              <View style={styles.heroOverlay} />
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
              <View style={styles.heroText}>
                <Text style={styles.heroLabel}>ALBUM</Text>
                <Text style={styles.heroTitle}>{album?.name || 'Album'}</Text>
                <Text style={styles.heroSubtitle}>{album?.artist || 'Unknown artist'}</Text>
              </View>
            </ImageBackground>

            <View style={styles.actionRow}>
              {(album?.songs?.length || 0) > 0 ? (
                <Pressable
                  style={styles.playCircle}
                  onPress={handlePlayAlbum}
                >
                  <Ionicons name={isAlbumActive && isPlaying ? "pause" : "play"} size={22} color="#0B0F0D" />
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.followBtn, followed && styles.followBtnActive]}
                onPress={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={followed ? '#0B0F0D' : '#E5E2E1'} />
                ) : (
                  <>
                    <Ionicons name={followed ? 'checkmark' : 'add'} size={18} color={followed ? '#0B0F0D' : '#E5E2E1'} />
                    <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
                      {followed ? 'Saved' : 'Save album'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#53E076" size="large" />
              </View>
            ) : null}
          </>
        }
        renderItem={({ item, index }) => {
          const isActive = currentSong?._id === item._id;
          return (
            <Pressable style={[styles.row, isActive && styles.rowActive]} onPress={() => album?.songs && playSong(item, album.songs)}>
              <Text style={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Image source={{ uri: item.image }} style={styles.rowImage} />
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]} numberOfLines={1}>{item.title}</Text>
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
              <Ionicons name="albums-outline" size={44} color="#4B5563" />
              <Text style={styles.emptyTitle}>This album has no songs yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E1012' },
  content: { paddingBottom: 120 },
  hero: { height: 280, justifyContent: 'space-between', padding: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroText: { zIndex: 1 },
  heroLabel: { color: '#53E076', fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#53E076',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#53E076',
    backgroundColor: 'rgba(83,224,118,0.08)',
  },
  followBtnActive: {
    borderColor: '#53E076',
    backgroundColor: '#53E076',
  },
  followBtnText: { color: '#E5E2E1', fontSize: 15, fontWeight: '700' },
  followBtnTextActive: { color: '#0B0F0D' },
  loadingWrap: { paddingTop: 40, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 2,
  },
  rowActive: { backgroundColor: 'rgba(83,224,118,0.08)' },
  rowIndex: { width: 22, color: '#4B5563', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  rowImage: { width: 46, height: 46, borderRadius: 10, backgroundColor: '#1F2023' },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#E5E2E1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowTitleActive: { color: '#53E076' },
  rowArtist: { color: '#6B7280', fontSize: 12 },
  rowDuration: { color: '#6B7280', fontSize: 12, marginRight: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '700', marginTop: 8 },
});
