import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { API } from '../../services/api';
import { API_URL } from '../config/api';
import { ArtistCard } from '../../components/ArtistCard';
import { SectionTitle } from '../../components/SectionTitle';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';

type Song = {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  audio: string;
  duration: number;
};

type RecommendationData = {
  type: 'personalized' | 'random';
  topArtists: string[];
  songs: Song[];
};

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [recsLoading, setRecsLoading] = useState(true);
  const router = useRouter();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { token, handleUnauthorized } = useAuth();

  const fetchSongs = async () => {
    try {
      const res = await API.get('/songs');
      setSongs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    try {
      setRecsLoading(true);
      if (!token) {
        setRecommendations(null);
        return;
      }
      const res = await fetch(`${API_URL}/history/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error(`Recommendations request failed: ${res.status}`);
      }
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.log('Recommendations error:', err);
    } finally {
      setRecsLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    fetchSongs();
    void fetchRecommendations();
  }, [fetchRecommendations]);

  const trendingNow = useMemo(() => {
    return [...songs]
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 6)
      .map((song) => ({
        id: song._id,
        title: song.title,
        subtitle: song.artist,
        image:
          song.image ||
          `https://picsum.photos/seed/${encodeURIComponent(song._id || song.title)}/300/300`,
        artist: song.artist,
        raw: song,
      }));
  }, [songs]);

  const recSongs: Song[] = recommendations?.songs ?? [];
  const topArtists: string[] = recommendations?.topArtists ?? [];
  const isPersonalized = recommendations?.type === 'personalized';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Spotify Mini</Text>
        <Text style={styles.subheading}>
          Discover trending picks, personal mixes, and what is trending now.
        </Text>
      </View>

      {/* Trending Now */}
      <View style={styles.section}>
        <SectionTitle
          title="Trending now"
          actionLabel="REFRESH"
          onPressAction={fetchSongs}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRail}
        >
          {trendingNow.map((item) => (
            <View key={item.id} style={styles.recentCardWrap}>
              <ArtistCard
                title={item.title}
                subtitle={item.subtitle}
                image={item.image}
                onPress={() =>
                  router.push(`/(tabs)/artist/${encodeURIComponent(item.artist)}` as any)
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Made for You */}
      <View style={styles.section}>
        <SectionTitle
          title="Made for You"
          actionLabel="REFRESH"
          onPressAction={fetchRecommendations}
        />

        {/* Subtitle dựa trên loại gợi ý */}
        <Text style={styles.recSubtitle}>
          {recsLoading
            ? 'Đang phân tích lịch sử nghe...'
            : isPersonalized
              ? `Dựa trên ${topArtists.slice(0, 2).join(', ')}${topArtists.length > 2 ? ' và hơn thế' : ''}`
              : 'Khám phá những bài hay cho bạn'}
        </Text>

        {recsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#1DB954" size="large" />
          </View>
        ) : recSongs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Hãy nghe vài bài để chúng tôi gợi ý nhạc phù hợp với bạn 🎵
            </Text>
          </View>
        ) : (
          <View style={styles.recList}>
            {recSongs.map((song, index) => {
              const isActive = currentSong?._id === song._id;
              return (
                <TouchableOpacity
                  key={song._id}
                  style={[styles.recRow, isActive && styles.recRowActive]}
                  onPress={() => playSong(song, recSongs)}
                  activeOpacity={0.75}
                >
                  {/* Rank number */}
                  <Text style={styles.recRank}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>

                  {/* Album art */}
                  <Image
                    source={{
                      uri:
                        song.image ||
                        `https://picsum.photos/seed/${song._id}/300/300`
                    }}
                    style={styles.recImage}
                  />

                  {/* Info */}
                  <View style={styles.recInfo}>
                    <Text
                      style={[styles.recTitle, isActive && styles.recTitleActive]}
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text style={styles.recArtist} numberOfLines={1}>
                      {song.artist}
                      {song.album ? ` • ${song.album}` : ''}
                    </Text>
                  </View>

                  {/* Playing indicator hoặc play icon */}
                  {isActive && isPlaying ? (
                    <View style={styles.playingDots}>
                      <Text style={styles.playingIcon}>▮▮</Text>
                    </View>
                  ) : (
                    <View style={styles.playBtn}>
                      <Text style={styles.playBtnIcon}>▶</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  header: { marginBottom: 28 },
  heading: {
    color: '#E5E2E1',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subheading: { color: '#BCCBB9', fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 32 },
  recentRail: { gap: 16, paddingRight: 20 },
  recentCardWrap: { width: 163 },

  // Recommendations
  recSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 16,
    marginTop: -8,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  recList: {
    gap: 4,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  recRowActive: {
    backgroundColor: 'rgba(29,185,84,0.08)',
  },
  recRank: {
    width: 24,
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  recImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
  },
  recInfo: {
    flex: 1,
  },
  recTitle: {
    color: '#E5E2E1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  recTitleActive: {
    color: '#1DB954',
  },
  recArtist: {
    color: '#6B7280',
    fontSize: 12,
  },
  playingDots: {
    width: 32,
    alignItems: 'center',
  },
  playingIcon: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '700',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(29,185,84,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnIcon: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 2,
  },
});
