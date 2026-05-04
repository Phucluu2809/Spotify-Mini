import {
  ImageBackground,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useEffect, useState } from 'react';

import { usePlayer } from '../../context/PlayerContext';
import { API } from '../../services/api';
import { ArtistCard } from '../../components/ArtistCard';
import { PlaylistCard } from '../../components/PlaylistCard';
import { SectionTitle } from '../../components/SectionTitle';
import { SongCard } from '../../components/SongCard';

const recentlyPlayed = [
  {
    id: 'midnight-city',
    title: 'Midnight City',
    subtitle: 'M83 • Album',
    image: 'https://picsum.photos/seed/midnightcity/400/400'
  },
  {
    id: 'kind-of-blue',
    title: 'Kind of Blue',
    subtitle: 'Miles Davis • Album',
    image: 'https://picsum.photos/seed/kindofblue/400/400'
  },
  {
    id: 'techno-beats',
    title: 'Techno Beats',
    subtitle: 'Deep Bass • Playlist',
    image: 'https://picsum.photos/seed/technobeats/400/400'
  }
];

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

const trendingNow = [
  {
    id: 'starboy',
    rank: '01',
    title: 'Starboy',
    artist: 'The Weeknd',
    duration: '3:50',
    image: 'https://picsum.photos/seed/starboy/300/300'
  },
  {
    id: 'levitating',
    rank: '02',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: '3:23',
    image: 'https://picsum.photos/seed/levitating/300/300'
  },
  {
    id: 'blinding-lights',
    rank: '03',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: '3:20',
    image: 'https://picsum.photos/seed/blindinglights/300/300'
  }
];

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  const { playSong, currentSong } =
    usePlayer();

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Spotify Mini</Text>
        <Text style={styles.subheading}>
          Discover recently played picks, personal mixes, and what is trending now.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Recently played" actionLabel="SHOW ALL" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRail}>
          {recentlyPlayed.map((item) => (
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

      <View style={styles.section}>
        <SectionTitle title="Trending now" />
        <View style={styles.trendingCard}>
          {trendingNow.map((item) => (
            <SongCard
              key={item.id}
              rank={item.rank}
              title={item.title}
              artist={item.artist}
              duration={item.duration}
              image={item.image}
            />
          ))}
        </View>
      </View>

      {songs.length > 0 && (
        <View style={styles.section}>
          <SectionTitle title="Your library" actionLabel="REFRESH" onPressAction={fetchSongs} />

          <View style={styles.libraryList}>
            {songs.map((item, index) => (
              <TouchableOpacity
                key={item._id}
                style={styles.libraryRow}
                onPress={() => playSong(item)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.libraryImage}
                />

                <View style={styles.libraryText}>
                  <Text style={styles.libraryTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.libraryArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>

                  {currentSong?._id === item._id && (
                    <Text style={styles.playing}>
                      Playing...
                    </Text>
                  )}
                </View>

                <Text style={styles.libraryIndex}>{String(index + 1).padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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