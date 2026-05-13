import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { API_URL } from './config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Song = {
  _id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audio: string;
  duration: number;
};

type ArtistProfile = {
  _id: string;
  name: string;
  image: string;
  bio?: string;
  followers?: number;
  songs: Song[];
};

type Album = {
  _id: string;
  name: string;
  artist: string;
  year?: number;
  genre?: string;
  songs: Song[];
};

type ModalMode = 'create' | 'edit';
const NO_ALBUM_VALUE = '__no_album__';

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('spotifymini.auth.token');
}

// ─── Song Row ─────────────────────────────────────────────────────────────────

function SongRow({
  song,
  onEdit,
  onDelete,
}: {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}) {
  return (
    <View style={styles.songRow}>
      <Image
        source={{ uri: song.image || `https://picsum.photos/seed/${song._id}/100/100` }}
        style={styles.songThumb}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songAlbum} numberOfLines={1}>{song.album || 'Single'}</Text>
      </View>
      <View style={styles.songActions}>
        <Pressable onPress={() => onEdit(song)} hitSlop={8} style={styles.actionBtn}>
          <Ionicons name="pencil-outline" size={20} color="#53E076" />
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('Xóa bài hát', `Bạn muốn xóa "${song.title}"?`, [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: () => onDelete(song) },
            ])
          }
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#E24B4A" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Song Modal ───────────────────────────────────────────────────────────────

function SongModal({
  visible,
  mode,
  editingSong,
  albums,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  mode: ModalMode;
  editingSong: Song | null;
  albums: Album[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editingSong) {
      setTitle(editingSong.title);
      const matchedAlbum = albums.find((item) => item.name === editingSong.album);
      setSelectedAlbumId(matchedAlbum?._id || NO_ALBUM_VALUE);
      setAudioUri(null);
      setAudioName(null);
      setImageUri(null);
    } else if (mode === 'create') {
      setTitle('');
      setSelectedAlbumId(NO_ALBUM_VALUE);
      setAudioUri(null);
      setAudioName(null);
      setImageUri(null);
    }
  }, [visible, mode, editingSong, albums]);

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAudioUri(result.assets[0].uri);
      setAudioName(result.assets[0].name);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên bài hát.');
      return;
    }
    if (mode === 'create' && !audioUri) {
      Alert.alert('Thiếu file nhạc', 'Vui lòng chọn file audio.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Chưa đăng nhập');

      const form = new FormData();
      form.append('title', title.trim());
      form.append('albumId', selectedAlbumId === NO_ALBUM_VALUE ? '' : selectedAlbumId);

      if (mode === 'create' && audioUri) {
        const ext = audioName?.split('.').pop() ?? 'mp3';
        form.append('audio', {
          uri: audioUri,
          name: audioName ?? `audio.${ext}`,
          type: `audio/${ext}`,
        } as any);
      }

      if (imageUri) {
        const ext = imageUri.split('.').pop()?.split('?')[0] ?? 'jpg';
        form.append('image', {
          uri: imageUri,
          name: `cover.${ext}`,
          type: `image/${ext}`,
        } as any);
      }

      const url =
        mode === 'create'
          ? `${API_URL}/artist-dashboard/songs`
          : `${API_URL}/artist-dashboard/songs/${editingSong!._id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Có lỗi xảy ra');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể lưu bài hát');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#E5E2E1" />
          </Pressable>
          <Text style={styles.modalTitle}>
            {mode === 'create' ? 'Thêm bài hát' : 'Sửa bài hát'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldLabel}>Tên bài hát *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tên bài hát"
            placeholderTextColor="#5E665F"
            editable={!submitting}
          />

          <Text style={styles.fieldLabel}>Album (tuỳ chọn)</Text>
          <View style={styles.albumOptionsWrap}>
            <Pressable
              style={[
                styles.albumOption,
                selectedAlbumId === NO_ALBUM_VALUE && styles.albumOptionActive,
              ]}
              onPress={() => setSelectedAlbumId(NO_ALBUM_VALUE)}
              disabled={submitting}
            >
              <Text
                style={[
                  styles.albumOptionText,
                  selectedAlbumId === NO_ALBUM_VALUE && styles.albumOptionTextActive,
                ]}
              >
                Không thuộc album
              </Text>
            </Pressable>
            {albums.map((item) => (
              <Pressable
                key={item._id}
                style={[
                  styles.albumOption,
                  selectedAlbumId === item._id && styles.albumOptionActive,
                ]}
                onPress={() => setSelectedAlbumId(item._id)}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.albumOptionText,
                    selectedAlbumId === item._id && styles.albumOptionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === 'create' && (
            <>
              <Text style={styles.fieldLabel}>File nhạc * (MP3, AAC…)</Text>
              <Pressable style={styles.pickerBtn} onPress={pickAudio} disabled={submitting}>
                <Ionicons name="musical-note" size={20} color={audioUri ? '#53E076' : '#667067'} />
                <Text style={[styles.pickerText, audioUri && styles.pickerTextSelected]}>
                  {audioName ?? 'Chọn file âm thanh'}
                </Text>
              </Pressable>
            </>
          )}

          <Text style={styles.fieldLabel}>Ảnh bìa (tuỳ chọn)</Text>
          <Pressable style={styles.pickerBtn} onPress={pickImage} disabled={submitting}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewThumb} />
            ) : (
              <Ionicons name="image-outline" size={20} color="#667067" />
            )}
            <Text style={[styles.pickerText, imageUri && styles.pickerTextSelected]}>
              {imageUri ? 'Đã chọn ảnh' : 'Chọn ảnh bìa'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#0B0F0D" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'create' ? 'Tải lên' : 'Lưu thay đổi'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ArtistDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumYear, setAlbumYear] = useState(String(new Date().getFullYear()));
  const [albumGenre, setAlbumGenre] = useState('');

  if (user?.role !== 'artist') {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Ionicons name="lock-closed-outline" size={48} color="#E24B4A" />
        <Text style={styles.noAccessTitle}>Không có quyền truy cập</Text>
        <Text style={styles.noAccessSub}>Tính năng này chỉ dành cho Artist.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/artist-dashboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Không thể tải dữ liệu');
      }
      setProfile(await res.json());
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể tải trang artist');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbums = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/artist-dashboard/albums`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Không thể tải album');
      }
      setAlbums(await res.json());
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể tải album');
    }
  }, []);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { fetchAlbums(); }, []);

  const handleDelete = async (song: Song) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/artist-dashboard/songs/${song._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Xóa thất bại');
      }
      await Promise.all([fetchProfile(), fetchAlbums()]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể xóa bài hát');
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingSong(null);
    setModalVisible(true);
  };
  const openEdit = (song: Song) => { setModalMode('edit'); setEditingSong(song); setModalVisible(true); };

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên album.');
      return;
    }
    setCreatingAlbum(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/artist-dashboard/albums`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: albumName.trim(),
          year: Number(albumYear) || new Date().getFullYear(),
          genre: albumGenre.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Không thể tạo album');
      }
      setAlbumName('');
      setAlbumGenre('');
      setAlbumYear(String(new Date().getFullYear()));
      setAlbumModalVisible(false);
      await fetchAlbums();
      Alert.alert('Thành công', 'Đã tạo album. Giờ bạn có thể thêm bài hát vào album này.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể tạo album');
    } finally {
      setCreatingAlbum(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color="#53E076" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#E5E2E1" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Music</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Artist strip */}
      <View style={styles.artistStrip}>
        <View style={styles.artistTopRow}>
          {profile?.image ? (
            <Image source={{ uri: profile.image }} style={styles.artistAvatar} />
          ) : (
            <View style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
              <Ionicons name="person" size={24} color="#53E076" />
            </View>
          )}
          <View style={styles.artistMeta}>
            <Text style={styles.artistName} numberOfLines={1}>{profile?.name ?? '—'}</Text>
            <Text style={styles.artistStats}>
              {profile?.songs?.length ?? 0} bài hát
              {profile?.followers ? `  •  ${profile.followers.toLocaleString()} followers` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.artistActions}>
          <Pressable style={styles.secondaryBtn} onPress={() => setAlbumModalVisible(true)}>
            <Ionicons name="disc-outline" size={17} color="#E5E2E1" />
            <Text style={styles.secondaryBtnText}>Tạo album</Text>
          </Pressable>
          <Pressable style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add" size={20} color="#0B0F0D" />
            <Text style={styles.addBtnText}>Thêm bài</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.albumsWrap}>
        <Text style={styles.albumsTitle}>Album của bạn</Text>
        {albums.length === 0 ? (
          <Text style={styles.albumsEmpty}>Chưa có album nào. Hãy tạo album trước khi thêm bài hát.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumChips}>
            {albums.map((album) => (
              <View key={album._id} style={styles.albumChip}>
                <Text style={styles.albumChipTitle} numberOfLines={1}>{album.name}</Text>
                <Text style={styles.albumChipMeta}>{album.songs?.length || 0} bài hát</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* List */}
      <FlatList
        data={profile?.songs ?? []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SongRow song={item} onEdit={openEdit} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="musical-notes-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyTitle}>Chưa có bài hát nào</Text>
            <Text style={styles.emptySub}>Nhấn "+ Thêm bài" để tải lên bài đầu tiên.</Text>
          </View>
        }
      />

      <SongModal
        visible={modalVisible}
        mode={modalMode}
        editingSong={editingSong}
        albums={albums}
        onClose={() => setModalVisible(false)}
        onSuccess={async () => {
          await Promise.all([fetchProfile(), fetchAlbums()]);
        }}
      />

      <Modal visible={albumModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAlbumModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setAlbumModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color="#E5E2E1" />
            </Pressable>
            <Text style={styles.modalTitle}>Tạo album</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Tên album *</Text>
            <TextInput
              style={styles.textInput}
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="Nhập tên album"
              placeholderTextColor="#5E665F"
              editable={!creatingAlbum}
            />

            <Text style={styles.fieldLabel}>Năm phát hành</Text>
            <TextInput
              style={styles.textInput}
              value={albumYear}
              onChangeText={setAlbumYear}
              keyboardType="number-pad"
              placeholder="2026"
              placeholderTextColor="#5E665F"
              editable={!creatingAlbum}
            />

            <Text style={styles.fieldLabel}>Thể loại (tuỳ chọn)</Text>
            <TextInput
              style={styles.textInput}
              value={albumGenre}
              onChangeText={setAlbumGenre}
              placeholder="Pop, Rock..."
              placeholderTextColor="#5E665F"
              editable={!creatingAlbum}
            />

            <Pressable style={[styles.submitBtn, creatingAlbum && styles.submitBtnDisabled]} onPress={handleCreateAlbum} disabled={creatingAlbum}>
              {creatingAlbum ? <ActivityIndicator color="#0B0F0D" size="small" /> : <Text style={styles.submitBtnText}>Tạo album</Text>}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14 },

  noAccessTitle: { color: '#E5E2E1', fontSize: 22, fontWeight: '800', marginTop: 8 },
  noAccessSub: { color: '#BCCBB9', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  backBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 25, borderWidth: 1, borderColor: '#53E076',
  },
  backBtnText: { color: '#53E076', fontSize: 15, fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#E5E2E1', fontSize: 18, fontWeight: '800' },

  artistStrip: {
    gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  artistTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%' },
  artistAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1C1B1B' },
  artistAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  artistMeta: { flex: 1, minWidth: 0 },
  artistName: { color: '#E5E2E1', fontSize: 17, fontWeight: '800', marginBottom: 3 },
  artistStats: { color: '#BCCBB9', fontSize: 13 },
  artistActions: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryBtnText: { color: '#E5E2E1', fontSize: 13, fontWeight: '700' },
  addBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 25, backgroundColor: '#53E076',
  },
  addBtnText: { color: '#0B0F0D', fontSize: 14, fontWeight: '800' },
  albumsWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  albumsTitle: { color: '#A7B0A3', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  albumsEmpty: { color: '#6B7280', fontSize: 13, lineHeight: 20 },
  albumChips: { gap: 10, paddingRight: 8 },
  albumChip: {
    minWidth: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1E1B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  albumChipTitle: { color: '#E5E2E1', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  albumChipMeta: { color: '#BCCBB9', fontSize: 12 },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
  songRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  songThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#1C1B1B' },
  songInfo: { flex: 1 },
  songTitle: { color: '#E5E2E1', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  songAlbum: { color: '#BCCBB9', fontSize: 12 },
  songActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#6B7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },

  modalContainer: { flex: 1, backgroundColor: '#121212' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  modalTitle: { color: '#E5E2E1', fontSize: 17, fontWeight: '700' },
  modalBody: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, gap: 6 },

  fieldLabel: {
    color: '#C3CBBF', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 14, marginBottom: 6,
  },
  textInput: {
    minHeight: 52, borderRadius: 14, backgroundColor: '#1A1E1B',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16, color: '#E5E2E1', fontSize: 15,
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 52, borderRadius: 14, backgroundColor: '#1A1E1B',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16,
  },
  pickerText: { color: '#667067', fontSize: 15, flex: 1 },
  pickerTextSelected: { color: '#E5E2E1' },
  previewThumb: { width: 36, height: 36, borderRadius: 6 },
  albumOptionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  albumOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#1A1E1B',
  },
  albumOptionActive: {
    borderColor: '#53E076',
    backgroundColor: 'rgba(83,224,118,0.12)',
  },
  albumOptionText: { color: '#AAB4A7', fontSize: 13, fontWeight: '600' },
  albumOptionTextActive: { color: '#53E076' },
  noAlbumText: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },

  submitBtn: {
    marginTop: 28, minHeight: 56, borderRadius: 20,
    backgroundColor: '#53E076', alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnText: { color: '#0B0F0D', fontSize: 16, fontWeight: '900' },
});
