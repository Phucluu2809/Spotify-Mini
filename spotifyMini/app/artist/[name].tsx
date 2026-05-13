import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';
import { useArtist } from '../../context/ArtistContext';
import { useAuth } from '../../context/AuthContext';

type Song = {
  _id: string; title: string; artist: string;
  album: string; image: string; audio: string; duration: number;
  artistId?: string;
};

type Artist = {
  _id: string;
  name: string;
  image: string;
  bio?: string;
  followers?: number;
  userId?: string;
};

const formatDuration = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { playSong, currentSong, isPlaying, togglePlayPause } = usePlayer();
  const { addFollowedArtist, removeFollowedArtist } = useArtist();
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    fetchArtistData();
  }, [name]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      if (!name) {
        setLoading(false);
        return;
      }

      const artistName = decodeURIComponent(name);

      // Fetch artist by name
      const artistRes = await API.get(`/artists/name/${artistName}`);
      setArtist(artistRes.data);
      setArtistId(artistRes.data._id);

      // Fetch songs for this artist
      const songsRes = await API.get(`/artists/${artistRes.data._id}/songs`);
      setSongs(songsRes.data || []);

      // Check if following
      await checkFollowStatus(artistRes.data._id);
    } catch (err) {
      console.log('Error fetching artist:', err);
      try {
        const artistName = name ? decodeURIComponent(name) : '';
        const songsRes = await API.get('/songs');
        const allSongs: Song[] = songsRes.data || [];
        const filteredSongs = allSongs.filter(
          (song) => song.artist?.toLowerCase() === artistName.toLowerCase()
        );
        setSongs(filteredSongs);
        setArtist(
          filteredSongs.length
            ? {
              _id: artistName,
              name: artistName,
              image: filteredSongs[0].image,
            }
            : null
        );
      } catch (fallbackErr) {
        console.log('Fallback artist fetch failed:', fallbackErr);
        setArtist(null);
        setSongs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (artId: string) => {
    try {
      const res = await API.get(`/artists/${artId}/is-following`);
      setIsFollowing(res.data.following);
    } catch (err) {
      console.log('Error checking follow status:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!artistId || !artist) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await API.delete(`/artists/${artistId}/follow`);
        setIsFollowing(false);
        removeFollowedArtist(artistId);
        Alert.alert('Đã bỏ theo dõi', `Bạn không còn theo dõi ${artist?.name}`);
      } else {
        await API.post(`/artists/${artistId}/follow`, {});
        setIsFollowing(true);
        addFollowedArtist(artist);
        Alert.alert('Đã theo dõi', `Bạn đang theo dõi ${artist?.name}`);
      }
    } catch (err) {
      console.log('Error toggling follow:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái theo dõi');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePlayArtist = () => {
    if (!songs.length) return;
    const isArtistActive = Boolean(currentSong && songs.some((song) => song._id === currentSong._id));

    if (isArtistActive) {
      if (!isPlaying) void togglePlayPause();
      return;
    }

    void playSong(songs[0], songs);
  };

  const artistName = artist?.name || (name ? decodeURIComponent(name) : 'Artist');
  const coverImage = artist?.image || songs[0]?.image || `https://picsum.photos/seed/${artistName}/400/400`;
  const isOwnArtistProfile = Boolean(user?.id && artist?.userId && user.id === artist.userId);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#53E076" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.hero}>
              <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFillObject as any} />
              <View style={styles.heroOverlay} />
              <View style={styles.heroText}>
                <Text style={styles.heroLabel}>ARTIST</Text>
                <Text style={styles.heroName}>{artistName}</Text>
                <Text style={styles.heroCount}>
                  {artist?.followers ? `${artist.followers.toLocaleString()} followers • ` : ''}
                  {songs.length} bài hát
                </Text>
                {artist?.bio && (
                  <Text style={styles.heroBio} numberOfLines={2}>{artist.bio}</Text>
                )}
              </View>
            </View>
            {songs.length > 0 && (
              <View style={styles.buttonRow}>
                <Pressable style={styles.playAllButton} onPress={handlePlayArtist}>
                  <Ionicons name="play" size={20} color="#0B0F0D" />
                </Pressable>
                {!isOwnArtistProfile ? (
                  <Pressable
                    style={[styles.followButton, isFollowing && styles.followButtonActive]}
                    onPress={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <ActivityIndicator size="small" color={isFollowing ? '#0B0F0D' : '#999'} />
                    ) : (
                      <>
                        <Ionicons name={isFollowing ? 'checkmark' : 'add'} size={20} color={isFollowing ? '#0B0F0D' : '#999'} />
                        <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
                          {isFollowing ? 'Đã theo' : 'Theo dõi'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                ) : null}
              </View>
            )}
            <Text style={styles.sectionLabel}>BÀI HÁT</Text>
          </>
        }
        renderItem={({ item, index }) => {
          const isActive = currentSong?._id === item._id;
          return (
            <Pressable style={[styles.row, isActive && styles.rowActive]} onPress={() => playSong(item, songs)}>
              <Text style={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Image source={{ uri: item.image }} style={styles.rowImage} />
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowAlbum} numberOfLines={1}>{item.album || 'Single'}</Text>
              </View>
              {isActive && isPlaying
                ? <Ionicons name="musical-notes" size={16} color="#53E076" />
                : <Text style={styles.rowDuration}>{formatDuration(item.duration)}</Text>
              }
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="musical-notes-outline" size={44} color="#4B5563" />
              <Text style={styles.emptyText}>Chưa có bài hát</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E1012' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 140 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center'
  },
  hero: { height: 260, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', marginBottom: 20, position: 'relative' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroText: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  heroLabel: { color: '#53E076', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  heroName: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 4 },
  heroCount: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8 },
  heroBio: { color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 16 },
  playAllButton: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#53E076',
    alignItems: 'center', justifyContent: 'center'
  },
  buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24, alignItems: 'center' },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#333',
    backgroundColor: 'transparent'
  },
  followButtonActive: {
    backgroundColor: '#53E076',
    borderColor: '#53E076'
  },
  followButtonText: { color: '#999', fontSize: 16, fontWeight: '800' },
  followButtonTextActive: { color: '#0B0F0D' },
  sectionLabel: { color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12, borderRadius: 12, marginHorizontal: 8, marginBottom: 2 },
  rowActive: { backgroundColor: 'rgba(83,224,118,0.08)' },
  rowIndex: { width: 24, color: '#4B5563', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  rowImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#1F2023' },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#E5E2E1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowTitleActive: { color: '#53E076' },
  rowAlbum: { color: '#6B7280', fontSize: 12 },
  rowDuration: { color: '#6B7280', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
});
