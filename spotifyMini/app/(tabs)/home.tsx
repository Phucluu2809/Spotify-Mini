import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useEffect, useMemo, useState } from 'react';

import { API } from '../../services/api';
import { ArtistCard } from '../../components/ArtistCard';
import MiniPlayer from '../../components/MiniPlayer';
import { PlaylistCard } from '../../components/PlaylistCard';
import { SectionTitle } from '../../components/SectionTitle';

const madeForYou = [
  {
    id: 'daily-mix-1',
    label: 'DAILY MIX 1',
    title: 'Hyperfocus',
    subtitle: 'Lane 8, Ben Böhmer, Marsh and more',
    image: 'https://picsum.photos/seed/hyperfocus/800/500',
    accentColor: '#164C2E'
  },
  {
    id: 'daily-mix-2',
    label: 'DAILY MIX 2',
    title: 'Groove Theory',
    subtitle: 'Kaytranada, SZA, Free Nationals and more',
    image: 'https://picsum.photos/seed/groovetheory/800/500',
    accentColor: '#2C7A46'
  }
];

const formatDuration = (duration?: number) => {
  if (!duration || Number.isNaN(duration)) {
    return '0:00';
  }

  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
};

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await API.get('/songs');

      setSongs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const trendingNow = useMemo(() => {
    return [...songs]
      .sort((a, b) => {
        const left = new Date(b.createdAt ?? 0).getTime();
        const right = new Date(a.createdAt ?? 0).getTime();

        return left - right;
      })
      .slice(0, 3)
      .map((song, index) => ({
        id: song._id,
        rank: String(index + 1).padStart(2, '0'),
        title: song.title,
        subtitle: song.artist,
        image: song.image || `https://picsum.photos/seed/${encodeURIComponent(song._id || song.title)}/300/300`,
      }));
  }, [songs]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Spotify Mini</Text>
          <Text style={styles.subheading}>
              Discover trending picks, personal mixes, and what is trending now.
          </Text>
        </View>

        <View style={styles.section}>
            <SectionTitle title="Trending now" actionLabel="REFRESH" onPressAction={fetchSongs} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRail}>
              {trendingNow.map((item) => (
              <View key={item.id} style={styles.recentCardWrap}>
                  <ArtistCard
                    title={item.title}
                    subtitle={item.subtitle}
                    image={item.image}
                  />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Made for You" />
          {madeForYou.map((item) => (
            <PlaylistCard
              key={item.id}
              label={item.label}
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
              accentColor={item.accentColor}
            />
          ))}
        </View>
      </ScrollView>

      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212'
  },

  container: {
    flex: 1,
    backgroundColor: '#121212'
  },

  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 160,
  },

  header: {
    marginBottom: 28,
  },

  heading: {
    color: '#E5E2E1',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },

  subheading: {
    color: '#BCCBB9',
    fontSize: 14,
    lineHeight: 20,
  },

  section: {
    marginBottom: 28,
  },

  recentRail: {
    gap: 16,
    paddingRight: 20,
  },

  recentCardWrap: {
    width: 163,
  },

  trendingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  libraryList: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },

  libraryImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#2A2A2A',
  },

  libraryText: {
    flex: 1,
  },

  libraryTitle: {
    color: '#E5E2E1',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  libraryArtist: {
    color: '#BCCBB9',
    fontSize: 12,
  },

  libraryIndex: {
    color: '#53E076',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  playing: {
    color: '#53E076',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700'
  }
});