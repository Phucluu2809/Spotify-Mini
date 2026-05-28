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
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylist } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
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

type Playlist = {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  songs: Song[];
  cover?: string;
};

const formatDuration = (duration: number) => {
  const ms = duration > 0 && duration < 1000 ? duration * 1000 : duration;
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const {
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    followPlaylist,
    unfollowPlaylist,
    isPlaylistFollowed,
  } = usePlaylist();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handlePlayPlaylist = () => {
    if (!playlist?.songs?.length) return;
    const queue = playlist.songs;
    const isPlaylistPlaying = Boolean(currentSong && queue.some((song) => song._id === currentSong._id));

    if (isPlaylistPlaying) {
      void togglePlayPause();
      return;
    }

    void playSong(queue[0], queue);
  };

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

  useEffect(() => {
    if (!showAddModal) return;

    const keyword = songSearchQuery.trim();
    if (keyword.length < 2) {
      setAvailableSongs([]);
      setLoadingModal(false);
      return;
    }

    let cancelled = false;
    setLoadingModal(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await API.get('/songs', {
          params: { q: keyword, limit: 20 },
        });
        if (!cancelled) {
          setAvailableSongs(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.log('Error searching songs:', err);
        if (!cancelled) setAvailableSongs([]);
      } finally {
        if (!cancelled) setLoadingModal(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [showAddModal, songSearchQuery]);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSongSearchQuery('');
    setAvailableSongs([]);
    setLoadingModal(false);
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
      'Delete playlist',
      `Are you sure you want to delete "${playlist?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
  const isPlaylistActive = Boolean(currentSong && playlist?.songs?.some((song) => song._id === currentSong._id));
  const coverUri = useMemo(
    () => playlist?.cover || `https://picsum.photos/seed/${playlist?._id || 'playlist'}/400/400`,
    [playlist?._id, playlist?.cover]
  );
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFollowToggle = async () => {
    if (!playlist?._id || isOwner) return;
    setFollowLoading(true);
    const ok = followed
      ? await unfollowPlaylist(playlist._id)
      : await followPlaylist(playlist._id);
    if (ok) {
      Alert.alert(
        followed ? 'Playlist removed' : 'Playlist saved',
        followed
          ? `Playlist "${playlist.name}" has been removed from your library.`
          : `Playlist "${playlist.name}" has been added to your library.`
      );
    }
    setFollowLoading(false);
  };

  const openEditPlaylist = () => {
    if (!playlist) return;
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setEditIsPrivate(Boolean(playlist.isPrivate));
    setEditCoverUri(null);
    setShowEditModal(true);
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

  const handleSavePlaylist = async () => {
    if (!playlist?._id || !isOwner) return;
    if (!editName.trim()) {
      Alert.alert('Missing information', 'Please enter a playlist name.');
      return;
    }

    setEditLoading(true);
    try {
      const cover = editCoverUri
        ? await uploadImageFromUri(
            editCoverUri,
            `playlist-cover-${editName.trim().toLowerCase().replace(/\s+/g, '-')}.jpg`
          )
        : playlist.cover;

      const updated = await updatePlaylist(
        playlist._id,
        editName.trim(),
        editDescription.trim(),
        editIsPrivate,
        cover
      );

      if (updated) {
        setPlaylist(updated);
        setShowEditModal(false);
        setEditCoverUri(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not update playlist');
    } finally {
      setEditLoading(false);
    }
  };

  const listHeader = (
    <>
      <ImageBackground
        source={{ uri: coverUri }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay} />
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>PLAYLIST</Text>
          <Text style={styles.heroTitle}>{playlist?.name || 'Playlist'}</Text>
          {playlist?.description ? (
            <Text style={styles.heroSubtitle}>{playlist.description}</Text>
          ) : (
            <Text style={styles.heroSubtitle}>
              {playlist?.isPrivate ? 'Private playlist' : 'Public playlist'}
            </Text>
          )}
          <Text style={styles.heroCount}>
            {playlist?.isPrivate ? 'Private playlist' : 'Public playlist'} • {playlist?.songs?.length || 0} songs
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.actionRow}>
        {(playlist?.songs?.length || 0) > 0 ? (
          <Pressable
            style={styles.playCircle}
            onPress={handlePlayPlaylist}
          >
            <Ionicons name={isPlaylistActive && isPlaying ? 'pause' : 'play'} size={22} color="#0B0F0D" />
          </Pressable>
        ) : null}

        {isOwner ? (
          <>
            <Pressable style={styles.editPlaylistBtn} onPress={openEditPlaylist}>
              <Ionicons name="create-outline" size={18} color="#E5E2E1" />
              <Text style={styles.editPlaylistText}>Edit playlist</Text>
            </Pressable>
            <Pressable
              style={[
                styles.deletePlaylistBtn,
                (playlist?.songs?.length || 0) > 0 && styles.deletePlaylistBtnCompact,
              ]}
              onPress={handleDeletePlaylist}
            >
              <Ionicons name="trash-outline" size={18} color="#E24B4A" />
              {(playlist?.songs?.length || 0) === 0 ? (
                <Text style={styles.deletePlaylistText}>Delete</Text>
              ) : null}
            </Pressable>
          </>
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
              {followed ? 'Saved' : 'Save playlist'}
            </Text>
          </Pressable>
        )}
      </View>

      {isOwner && !loading && playlist ? (
        <View style={styles.ownerSecondaryRow}>
          <Pressable style={styles.addSongBtn} onPress={handleOpenAddModal}>
            <Ionicons name="add" size={18} color="#E5E2E1" />
            <Text style={styles.addSongText}>{(playlist?.songs?.length || 0) > 0 ? 'Add song' : 'Add first song'}</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#1DB954" size="large" />
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={playlist?.songs || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={listHeader}
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
                      'Remove song',
                      `Remove "${item.title}" from this playlist?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSong(item._id) },
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
              <Text style={styles.emptyTitle}>This playlist is empty</Text>
              <Text style={styles.emptySubtitle}>No songs have been added here yet.</Text>
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
            <Text style={styles.modalTitle}>Add songs</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalSearchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={songSearchQuery}
              onChangeText={setSongSearchQuery}
              placeholder="Search by song, artist, or album..."
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.modalSearchInput}
              returnKeyType="search"
            />
            {songSearchQuery.length > 0 ? (
              <Pressable
                onPress={() => setSongSearchQuery('')}
                style={styles.modalSearchClear}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color="#6B7280" />
              </Pressable>
            ) : null}
          </View>

          {loadingModal ? (
            <View style={styles.modalLoadingWrap}>
              <ActivityIndicator color="#1DB954" size="large" />
            </View>
          ) : songSearchQuery.trim().length < 2 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="search" size={48} color="#4B5563" />
              <Text style={styles.modalEmptyText}>Enter at least 2 characters to search songs</Text>
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
                  <Text style={styles.modalEmptyText}>No matching songs found</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={showEditModal && isOwner} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditModal(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEditModal(false)} style={styles.modalCloseBtn} hitSlop={12} disabled={editLoading}>
              <Ionicons name="close" size={24} color="#E5E2E1" />
            </Pressable>
            <Text style={styles.modalTitle}>Edit playlist</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.editBody}>
            <Text style={styles.fieldLabel}>Playlist name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter playlist name"
              placeholderTextColor="#6B7280"
              editable={!editLoading}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Add a description"
              placeholderTextColor="#6B7280"
              editable={!editLoading}
              multiline
            />

            <Text style={styles.fieldLabel}>Visibility</Text>
            <View style={styles.visibilityChoices}>
              <Pressable
                style={[styles.visibilityChoice, !editIsPrivate && styles.visibilityChoiceActive]}
                onPress={() => setEditIsPrivate(false)}
                disabled={editLoading}
              >
                <Ionicons name="earth" size={17} color={!editIsPrivate ? '#0B0F0D' : '#E5E2E1'} />
                <Text style={[styles.visibilityChoiceText, !editIsPrivate && styles.visibilityChoiceTextActive]}>Public</Text>
              </Pressable>
              <Pressable
                style={[styles.visibilityChoice, editIsPrivate && styles.visibilityChoiceActive]}
                onPress={() => setEditIsPrivate(true)}
                disabled={editLoading}
              >
                <Ionicons name="lock-closed" size={17} color={editIsPrivate ? '#0B0F0D' : '#E5E2E1'} />
                <Text style={[styles.visibilityChoiceText, editIsPrivate && styles.visibilityChoiceTextActive]}>Private</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Cover image</Text>
            <Pressable style={styles.coverPicker} onPress={pickCover} disabled={editLoading}>
              {editCoverUri || playlist?.cover ? (
                <Image source={{ uri: editCoverUri || playlist?.cover }} style={styles.coverPreview} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#53E076" />
                  <Text style={styles.coverPlaceholderText}>Choose cover image</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={[styles.saveBtn, editLoading && styles.saveBtnDisabled]}
              onPress={handleSavePlaylist}
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  heroText: { zIndex: 1 },
  heroLabel: { color: '#53E076', fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 6 },
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
  editPlaylistBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  editPlaylistText: { color: '#E5E2E1', fontSize: 15, fontWeight: '700' },
  addSongBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7C3AED',
  },
  addSongText: { color: '#fff', fontSize: 15, fontWeight: '700' },
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

  ownerSecondaryRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },

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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E24B4A',
    backgroundColor: 'rgba(226,75,74,0.08)',
  },
  deletePlaylistBtnCompact: {
    flex: 0,
    width: 46,
  },
  deletePlaylistText: { color: '#E24B4A', fontSize: 15, fontWeight: '700' },

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
  editBody: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, gap: 6 },
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
  descriptionInput: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  visibilityChoices: { flexDirection: 'row', gap: 10 },
  visibilityChoice: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  visibilityChoiceActive: {
    borderColor: '#53E076',
    backgroundColor: '#53E076',
  },
  visibilityChoiceText: { color: '#E5E2E1', fontSize: 14, fontWeight: '700' },
  visibilityChoiceTextActive: { color: '#0B0F0D' },
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
  modalSearchWrap: {
    height: 46,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#1F2023',
    borderWidth: 1,
    borderColor: '#2A2F35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modalSearchInput: {
    flex: 1,
    color: '#E5E2E1',
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0,
  },
  modalSearchClear: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
