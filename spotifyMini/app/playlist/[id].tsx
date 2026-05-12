import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylist } from '../../context/PlaylistContext';
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

type Playlist = {
  _id: string;
  name: string;
  description?: string;
  songs: Song[];
  cover?: string;
};

const formatDuration = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

const getRandomAccentColor = () => {
  const colors = ['#164C2E', '#2C7A46', '#0F766E', '#7C3AED', '#1E3A8A'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { getPlaylistById, addSongToPlaylist, removeSongFromPlaylist } = usePlaylist();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [accentColor] = useState(getRandomAccentColor());
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getPlaylistById(id);
        setPlaylist(data);
      } catch (err) {
        console.log('Error fetching playlist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setLoadingModal(true);
    try {
      const res = await API.get('/songs');
      setAvailableSongs(res.data || []);
    } catch (err) {
      console.log('Error fetching songs:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách bài hát');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAddSong = async (songId: string) => {
    if (!playlist?._id) return;
    try {
      const updated = await addSongToPlaylist(playlist._id, songId);
      if (updated) {
        setPlaylist(updated);
        Alert.alert('Thành công', 'Bài hát đã được thêm vào playlist');
      }
    } catch (err) {
      console.log('Error adding song:', err);
      Alert.alert('Lỗi', 'Không thể thêm bài hát');
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist?._id) return;
    try {
      const updated = await removeSongFromPlaylist(playlist._id, songId);
      if (updated) {
        setPlaylist(updated);
        Alert.alert('Thành công', 'Bài hát đã được xóa khỏi playlist');
      }
    } catch (err) {
      console.log('Error removing song:', err);
      Alert.alert('Lỗi', 'Không thể xóa bài hát');
    }
  };

  const isSongInPlaylist = (songId: string) => {
    return playlist?.songs?.some(s => s._id === songId) ?? false;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={playlist?.songs || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ImageBackground
              source={{ uri: playlist?.cover || `https://picsum.photos/seed/${playlist?._id}/400/400` }}
              style={[styles.hero, { backgroundColor: accentColor }]}
            >
              <View style={styles.heroOverlay} />
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>{playlist?.name || 'Playlist'}</Text>
                {playlist?.description && <Text style={styles.heroSubtitle}>{playlist.description}</Text>}
                <Text style={styles.heroCount}>{playlist?.songs?.length || 0} bài hát</Text>
              </View>
            </ImageBackground>

            {(playlist?.songs?.length || 0) > 0 && (
              <View style={styles.buttonRow}>
                <Pressable style={styles.playAllButton} onPress={() => playlist?.songs?.[0] && playSong(playlist.songs[0], playlist.songs)}>
                  <Ionicons name="play" size={20} color="#0B0F0D" />
                  <Text style={styles.playAllText}>Phát tất cả</Text>
                </Pressable>
                <Pressable style={styles.addButton} onPress={handleOpenAddModal}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Thêm bài</Text>
                </Pressable>
              </View>
            )}

            {(playlist?.songs?.length || 0) === 0 && !loading && (
              <Pressable style={styles.addButton} onPress={handleOpenAddModal}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Thêm bài hát đầu tiên</Text>
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
            <View style={styles.rowWrapper}>
              <Pressable
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => playlist?.songs && playSong(item, playlist.songs)}
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
              <Pressable
                style={styles.removeButton}
                onPress={() => {
                  Alert.alert(
                    'Xóa bài hát',
                    `Bạn muốn xóa "${item.title}" khỏi playlist?`,
                    [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Xóa', style: 'destructive', onPress: () => handleRemoveSong(item._id) },
                    ]
                  );
                }}
              >
                <Ionicons name="close" size={20} color="#999" />
              </Pressable>
            </View>
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
      
      {/* Add Song Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#E5E2E1" />
            </Pressable>
            <Text style={styles.modalTitle}>Thêm bài hát</Text>
            <View style={{ width: 24 }} />
          </View>

          {loadingModal ? (
            <View style={styles.modalLoadingWrap}>
              <ActivityIndicator color="#1DB954" size="large" />
            </View>
          ) : (
            <FlatList
              data={availableSongs}
              keyExtractor={(item) => item._id}
              renderItem={({ item, index }) => {
                const inPlaylist = isSongInPlaylist(item._id);
                return (
                  <View style={styles.modalSongRow}>
                    <Pressable style={{ flex: 1 }} onPress={() => playSong(item, availableSongs)}>
                      <View style={styles.modalSongInfo}>
                        <Image source={{ uri: item.image }} style={styles.modalSongImage} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalSongTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.modalSongArtist} numberOfLines={1}>{item.artist}</Text>
                        </View>
                      </View>
                    </Pressable>
                    <Pressable
                      style={[styles.modalAddButton, inPlaylist && styles.modalRemoveButton]}
                      onPress={() => {
                        if (inPlaylist) {
                          handleRemoveSong(item._id);
                        } else {
                          handleAddSong(item._id);
                        }
                      }}
                    >
                      <Ionicons
                        name={inPlaylist ? 'checkmark' : 'add'}
                        size={20}
                        color={inPlaylist ? '#53E076' : '#999'}
                      />
                    </Pressable>
                  </View>
                );
              }}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Ionicons name="musical-note" size={48} color="#4B5563" />
                  <Text style={styles.modalEmptyText}>Chưa có bài hát nào</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
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
  
  // New styles for add song feature
  buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16, marginBottom: 16 },
  addButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 25, backgroundColor: '#7C3AED' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  rowWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginHorizontal: 8, marginBottom: 2, borderRadius: 12 },
  removeButton: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#0E1012' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F2023' },
  modalTitle: { color: '#E5E2E1', fontSize: 18, fontWeight: '700' },
  modalLoadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalList: { paddingHorizontal: 8, paddingTop: 8 },
  modalSongRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, borderRadius: 12, marginBottom: 4, gap: 12 },
  modalSongInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  modalSongImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#1F2023' },
  modalSongTitle: { color: '#E5E2E1', fontSize: 14, fontWeight: '600' },
  modalSongArtist: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  modalAddButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  modalRemoveButton: { backgroundColor: 'rgba(83,224,118,0.1)', borderColor: '#53E076' },
  modalEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  modalEmptyText: { color: '#6B7280', fontSize: 16 },
});