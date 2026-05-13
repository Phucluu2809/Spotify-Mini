import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylist } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
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
  userId: string;
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
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong } = usePlayer();
  const {
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    followPlaylist,
    unfollowPlaylist,
    isPlaylistFollowed,
  } = usePlaylist();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [accentColor] = useState(getRandomAccentColor());
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAddSong = async (songId: string) => {
    if (!playlist?._id) return;
    try {
      const updated = await addSongToPlaylist(playlist._id, songId);
      if (updated) setPlaylist(updated);
    } catch (err) {
      console.log('Error adding song:', err);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist?._id) return;
    try {
      const updated = await removeSongFromPlaylist(playlist._id, songId);
      if (updated) setPlaylist(updated);
    } catch (err) {
      console.log('Error removing song:', err);
    }
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Xóa playlist',
      `Bạn chắc chắn muốn xóa "${playlist?.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!playlist?._id) return;
            const ok = await deletePlaylist(playlist._id);
            if (ok) router.back();
          },
        },
      ]
    );
  };

  const isSongInPlaylist = (songId: string) =>
    playlist?.songs?.some((s) => s._id === songId) ?? false;
  const isOwner = Boolean(user?.id && playlist?.userId && user.id === playlist.userId);
  const followed = Boolean(playlist?._id && isPlaylistFollowed(playlist._id));

  const handleFollowToggle = async () => {
    if (!playlist?._id || isOwner) return;
    setFollowLoading(true);
    const ok = followed
      ? await unfollowPlaylist(playlist._id)
      : await followPlaylist(playlist._id);
    if (ok) {
      Alert.alert(
        followed ? 'Đã bỏ lưu playlist' : 'Đã lưu playlist',
        followed
          ? `Playlist "${playlist.name}" đã được gỡ khỏi thư viện của bạn.`
          : `Playlist "${playlist.name}" đã được thêm vào thư viện của bạn.`
      );
    }
    setFollowLoading(false);
  };

  const ListHeader = () => (
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
          {playlist?.description ? (
            <Text style={styles.heroSubtitle}>{playlist.description}</Text>
          ) : null}
          <Text style={styles.heroCount}>{playlist?.songs?.length || 0} bài hát</Text>
        </View>
      </ImageBackground>

      <View style={styles.actionRow}>
        {(playlist?.songs?.length || 0) > 0 ? (
          <>
            <Pressable
              style={styles.playCircle}
              onPress={() =>
                playlist?.songs?.[0] && playSong(playlist.songs[0], playlist.songs)
              }
            >
              <Ionicons name="play" size={22} color="#0B0F0D" />
            </Pressable>

            {isOwner ? (
              <Pressable style={styles.addBtn} onPress={handleOpenAddModal}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Thêm bài</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.followBtn, followed && styles.followBtnActive]}
                onPress={handleFollowToggle}
                disabled={followLoading}
              >
                <Ionicons
                  name={followed ? 'checkmark' : 'add'}
                  size={18}
                  color={followed ? '#0B0F0D' : '#E5E2E1'}
                />
                <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
                  {followed ? 'Đã lưu' : 'Lưu playlist'}
                </Text>
              </Pressable>
            )}
          </>
        ) : null}

        {(playlist?.songs?.length || 0) === 0 && !loading && isOwner ? (
          <Pressable style={[styles.addBtn, styles.addBtnFull]} onPress={handleOpenAddModal}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Thêm bài hát đầu tiên</Text>
          </Pressable>
        ) : null}

        {(playlist?.songs?.length || 0) === 0 && !loading && !isOwner ? (
          <Pressable
            style={[styles.followBtn, styles.followBtnFull, followed && styles.followBtnActive]}
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            <Ionicons
              name={followed ? 'checkmark' : 'add'}
              size={18}
              color={followed ? '#0B0F0D' : '#E5E2E1'}
            />
            <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
              {followed ? 'Đã lưu playlist' : 'Lưu playlist'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#1DB954" size="large" />
        </View>
      ) : null}
    </>
  );

  const ListFooter = () =>
    !loading && playlist && isOwner ? (
      <Pressable style={styles.deletePlaylistBtn} onPress={handleDeletePlaylist}>
        <Ionicons name="trash-outline" size={16} color="#E24B4A" />
        <Text style={styles.deletePlaylistText}>Xóa playlist</Text>
      </Pressable>
    ) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={playlist?.songs || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
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

              {isOwner ? (
                <Pressable
                  style={styles.removeButton}
                  onPress={() =>
                    Alert.alert(
                      'Xóa bài hát',
                      `Bạn muốn xóa "${item.title}" khỏi playlist?`,
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Xóa', style: 'destructive', onPress: () => handleRemoveSong(item._id) },
                      ]
                    )
                  }
                >
                  <Ionicons name="close" size={18} color="#666" />
                </Pressable>
              ) : null}
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

      <Modal visible={showAddModal && isOwner} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn} hitSlop={12}>
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
              renderItem={({ item }) => {
                const inPlaylist = isSongInPlaylist(item._id);
                return (
                  <View style={styles.modalSongRow}>
                    <Pressable
                      style={styles.modalSongInfo}
                      onPress={() => playSong(item, availableSongs)}
                    >
                      <Image source={{ uri: item.image }} style={styles.modalSongImage} />
                      <View style={styles.modalSongText}>
                        <Text style={styles.modalSongTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.modalSongArtist} numberOfLines={1}>{item.artist}</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      style={[styles.modalToggleBtn, inPlaylist && styles.modalToggleBtnActive]}
                      onPress={() => inPlaylist ? handleRemoveSong(item._id) : handleAddSong(item._id)}
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
  content: { paddingBottom: 120 },

  hero: { height: 280, justifyContent: 'space-between', padding: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  heroText: { zIndex: 1 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', fontStyle: 'italic', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 },
  heroCount: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },

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
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7C3AED',
  },
  addBtnFull: { marginTop: 8 },
  followBtnFull: { marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
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

  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    marginHorizontal: 8,
    marginBottom: 2,
    borderRadius: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowActive: { backgroundColor: 'rgba(83,224,118,0.08)' },
  rowIndex: { width: 22, color: '#4B5563', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  rowImage: { width: 46, height: 46, borderRadius: 10, backgroundColor: '#1F2023' },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#E5E2E1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowTitleActive: { color: '#53E076' },
  rowArtist: { color: '#6B7280', fontSize: 12 },
  rowDuration: { color: '#6B7280', fontSize: 12, marginRight: 4 },
  removeButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { color: '#6B7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },

  deletePlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226,75,74,0.35)',
    backgroundColor: 'rgba(226,75,74,0.07)',
  },
  deletePlaylistText: { color: '#E24B4A', fontSize: 15, fontWeight: '600' },

  modalContainer: { flex: 1, backgroundColor: '#0E1012' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2023',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { color: '#E5E2E1', fontSize: 17, fontWeight: '700' },
  modalLoadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalList: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 40 },

  modalSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 2,
  },
  modalSongInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalSongImage: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#1F2023' },
  modalSongText: { flex: 1 },
  modalSongTitle: { color: '#E5E2E1', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  modalSongArtist: { color: '#6B7280', fontSize: 12 },
  modalToggleBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginLeft: 8,
  },
  modalToggleBtnActive: {
    backgroundColor: 'rgba(83,224,118,0.1)',
    borderColor: '#53E076',
  },
  modalEmpty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  modalEmptyText: { color: '#6B7280', fontSize: 16 },
});
