import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { API } from '../../services/api';
import { ArtistCard } from '../../components/ArtistCard';
import { PlaylistCard } from '../../components/PlaylistCard';
import { SectionTitle } from '../../components/SectionTitle';

const madeForYou = [
  {
    id: 'daily-mix-1',
    label: 'DAILY MIX 1',
    title: 'Hyperfocus',
    subtitle: 'Lane 8, Ben Böhmer, Marsh and more',
    image: 'https://picsum.photos/seed/hyperfocus/800/500',
    accentColor: '#164C2E',
  },
  {
    id: 'daily-mix-2',
    label: 'DAILY MIX 2',
    title: 'Groove Theory',
    subtitle: 'Kaytranada, SZA, Free Nationals and more',
    image: 'https://picsum.photos/seed/groovetheory/800/500',
    accentColor: '#2C7A46',
  },
];

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const router = useRouter();

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
      }));
  }, [songs]);

  return (
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
                  router.push(`/artist/${encodeURIComponent(item.artist)}` as any)
                }
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
            onPress={() => router.push(`/playlist/${item.id}` as any)}
          />
        ))}
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
  section: { marginBottom: 28 },
  recentRail: { gap: 16, paddingRight: 20 },
  recentCardWrap: { width: 163 },
});