import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';

type Song = {
  _id: string; title: string; artist: string;
  album: string; image: string; audio: string; duration: number;
};

const formatDuration = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    API.get('/songs').then((res) => {
      const all: Song[] = res.data;
      const filtered = name
        ? all.filter((s) => s.artist.toLowerCase() === decodeURIComponent(name).toLowerCase())
        : all;
      setSongs(filtered);
    }).catch(console.log);
  }, [name]);

  const artistName = name ? decodeURIComponent(name) : 'Artist';
  const coverImage = songs[0]?.image || `https://picsum.photos/seed/${artistName}/400/400`;

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
                <Text style={styles.heroCount}>{songs.length} bài hát</Text>
              </View>
            </View>
            {songs.length > 0 && (
              <Pressable style={styles.playAllButton} onPress={() => playSong(songs[0], songs)}>
                <Ionicons name="play" size={20} color="#0B0F0D" />
                <Text style={styles.playAllText}>Phát tất cả</Text>
              </Pressable>
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E1012' },
  content: { paddingBottom: 140 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center'
  },
  hero: { height: 260, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', marginBottom: 20, position: 'relative' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroText: { position: 'absolute', bottom: 20, left: 20 },
  heroLabel: { color: '#53E076', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  heroName: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 4 },
  heroCount: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  playAllButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, height: 50, borderRadius: 25, backgroundColor: '#53E076', marginBottom: 24
  },
  playAllText: { color: '#0B0F0D', fontSize: 16, fontWeight: '800' },
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
});