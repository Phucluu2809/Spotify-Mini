import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAlbum } from '../../context/AlbumContext';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../config/api';
import { uploadImageFromUri } from '../../services/media';

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
  artistId?: string;
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
  const { token, user } = useAuth();
  const { getAlbumById, getAlbums, followAlbum, unfollowAlbum, isAlbumFollowed } = useAlbum();
  const [album, setAlbum] = useState<Album | null>(null);
  const [ownArtistId, setOwnArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const loadAlbum = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await getAlbumById(id);
    setAlbum(data as Album | null);
    setLoading(false);
  }, [id, getAlbumById]);

  useEffect(() => {
    void loadAlbum();
  }, [loadAlbum]);

  useEffect(() => {
    const fetchOwnArtist = async () => {
      if (!token || user?.role !== 'artist') {
        setOwnArtistId(null);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/artist-dashboard/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setOwnArtistId(null);
          return;
        }
        const artist = await res.json();
        setOwnArtistId(typeof artist?._id === 'string' ? artist._id : null);
      } catch (err) {
        console.log(err);
        setOwnArtistId(null);
      }
    };

    void fetchOwnArtist();
  }, [token, user?.role]);

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
  const isOwner = Boolean(album?.artistId && ownArtistId && album.artistId === ownArtistId);

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

  const handleDeleteAlbum = () => {
    if (!album?._id || !token || !isOwner) return;

    Alert.alert(
      'Delete album',
      `Are you sure you want to delete "${album.name}"? Songs in this album will remain in your catalog.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleteLoading(true);
              const res = await fetch(`${API_URL}/artist-dashboard/albums/${album._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message ?? 'Could not delete album');
              }
              await getAlbums();
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Could not delete album');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const openEditAlbum = () => {
    if (!album) return;
    setEditName(album.name);
    setEditCoverUri(null);
    setEditVisible(true);
  };

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]) {
      setEditCoverUri(result.assets[0].uri);
    }
  };

  const handleSaveAlbum = async () => {
    if (!album?._id || !token || !isOwner) return;
    if (!editName.trim()) {
      Alert.alert('Missing information', 'Please enter an album name.');
      return;
    }

    setEditLoading(true);
    try {
      const cover = editCoverUri
        ? await uploadImageFromUri(
            editCoverUri,
            `album-cover-${editName.trim().toLowerCase().replace(/\s+/g, '-')}.jpg`
          )
        : album.cover || '';

      const res = await fetch(`${API_URL}/artist-dashboard/albums/${album._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          cover,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Could not update album');
      }

      const updated = await res.json();
      setAlbum(updated);
      setEditVisible(false);
      setEditCoverUri(null);
      await getAlbums();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not update album');
    } finally {
      setEditLoading(false);
    }
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
              {isOwner ? (
                <>
                  <Pressable
                    style={styles.editAlbumBtn}
                    onPress={openEditAlbum}
                    disabled={editLoading}
                  >
                    <Ionicons name="create-outline" size={18} color="#E5E2E1" />
                    <Text style={styles.editAlbumText}>Edit album</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteAlbumBtn}
                    onPress={handleDeleteAlbum}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color="#E24B4A" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                        <Text style={styles.deleteAlbumText}>Delete album</Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
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
              )}
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

      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditVisible(false)} hitSlop={8} disabled={editLoading}>
              <Ionicons name="close" size={24} color="#E5E2E1" />
            </Pressable>
            <Text style={styles.modalTitle}>Edit album</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Album name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter album name"
              placeholderTextColor="#6B7280"
              editable={!editLoading}
            />

            <Text style={styles.fieldLabel}>Cover image</Text>
            <Pressable style={styles.coverPicker} onPress={pickCover} disabled={editLoading}>
              {editCoverUri || album?.cover ? (
                <Image source={{ uri: editCoverUri || album?.cover }} style={styles.coverPreview} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#53E076" />
                  <Text style={styles.coverPlaceholderText}>Choose cover image</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={[styles.saveBtn, editLoading && styles.saveBtnDisabled]}
              onPress={handleSaveAlbum}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator size="small" color="#0B0F0D" />
              ) : (
                <Text style={styles.saveBtnText}>Save changes</Text>
              )}
            </Pressable>
          </View>
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
  editAlbumBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  editAlbumText: { color: '#E5E2E1', fontSize: 15, fontWeight: '700' },
  deleteAlbumBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E24B4A',
    backgroundColor: 'rgba(226,75,74,0.08)',
  },
  deleteAlbumText: { color: '#E24B4A', fontSize: 15, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#121212' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  modalTitle: { color: '#E5E2E1', fontSize: 17, fontWeight: '700' },
  modalBody: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, gap: 6 },
  fieldLabel: {
    color: '#C3CBBF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 6,
  },
  textInput: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#1A1E1B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: '#E5E2E1',
    fontSize: 15,
  },
  coverPicker: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1E1B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 2,
    marginBottom: 8,
  },
  coverPreview: { width: '100%', height: '100%' },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(83,224,118,0.3)',
    borderRadius: 14,
    margin: 12,
  },
  coverPlaceholderText: { color: '#BCCBB9', fontSize: 12, fontWeight: '700' },
  saveBtn: {
    marginTop: 28,
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: '#53E076',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText: { color: '#0B0F0D', fontSize: 16, fontWeight: '900' },
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
