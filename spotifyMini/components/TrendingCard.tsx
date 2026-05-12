import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type TrendingCardProps = {
  rank: string; title: string; subtitle: string;
  image: string; onPress?: () => void;
};

export function TrendingCard({ rank, title, subtitle, image, onPress }: TrendingCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.rankWrap}><Text style={styles.rank}>{rank}</Text></View>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <View style={styles.playButton}><Text style={styles.playIcon}>▶</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 8
  },
  rankWrap: { width: 28, alignItems: 'center' },
  rank: { color: '#53E076', fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  image: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#2A2A2A' },
  info: { flex: 1 },
  title: { color: '#E5E2E1', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  subtitle: { color: '#BCCBB9', fontSize: 12 },
  playButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(83,224,118,0.15)', alignItems: 'center', justifyContent: 'center'
  },
  playIcon: { color: '#53E076', fontSize: 11, fontWeight: '900', marginLeft: 2 }
});