import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const tracks = [
  {
    title: 'After Hours',
    artist: 'The Weeknd',
    duration: '6:02',
    image: require('@/assets/images/figma2/v1_48.png'),
    active: true,
  },
  {
    title: 'Midnight City',
    artist: 'M83',
    duration: '4:03',
    image: require('@/assets/images/figma2/v1_69.png'),
  },
  {
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: '3:23',
    image: require('@/assets/images/figma2/v1_87.png'),
  },
  {
    title: 'The Less I Know Better',
    artist: 'Tame Impala',
    duration: '3:38',
    image: require('@/assets/images/figma2/v1_105.png'),
  },
];

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Good evening, Alex</Text>
          <View style={styles.topIcons}>
            <View style={styles.topIcon} />
            <View style={styles.topIcon} />
          </View>
        </View>

        <View style={styles.switcherRow}>
          <Text style={styles.switcherActive}>Playlists</Text>
          <Text style={styles.switcherText}>Artists</Text>
          <Text style={styles.switcherText}>Albums</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Image source={require('@/assets/images/figma2/v1_16.png')} style={styles.heroImage} />
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>YOUR SANCTUARY</Text>
            <Text style={styles.heroTitle}>Liked Songs</Text>
            <Text style={styles.heroMeta}>842 tracks • Updated 2 hours ago</Text>
          </View>
          <Pressable style={styles.shuffleButton}>
            <Text style={styles.shuffleIcon}>▶</Text>
            <Text style={styles.shuffleText}>SHUFFLE PLAY</Text>
          </Pressable>
        </View>

        <View style={styles.sortBar}>
          <Text style={styles.sortText}>SORT BY: RECENTLY ADDED</Text>
          <View style={styles.sortBox} />
        </View>

        <View style={styles.trackList}>
          {tracks.map((item) => (
            <View key={item.title} style={[styles.trackCard, item.active && styles.trackCardActive]}>
              <View style={styles.trackLeft}>
                <Image source={item.image} style={styles.trackImage} />
                <View>
                  <Text style={styles.trackTitle}>{item.title}</Text>
                  <Text style={styles.trackArtist}>{item.artist}</Text>
                </View>
              </View>
              <View style={styles.trackRight}>
                <Text style={[styles.favorite, item.active && styles.favoriteActive]}>♥</Text>
                <Text style={styles.trackDuration}>{item.duration}</Text>
                <Text style={styles.more}>⋮</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.recommendWrap}>
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTitle}>Recommended for you</Text>
          </View>

          <View style={styles.mainRecommendCard}>
            <Image source={require('@/assets/images/figma2/v1_126.png')} style={styles.mainRecommendImage} />
            <View style={styles.mainOverlay} />
            <View style={styles.mainTextBox}>
              <Text style={styles.mainTag}>NEW CURATION</Text>
              <Text style={styles.mainTitle}>Sonic Void</Text>
            </View>
          </View>

          <View style={styles.smallCardsRow}>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Hyper Mix</Text>
              <Text style={styles.smallCardMeta}>120 tracks</Text>
            </View>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Chill Focus</Text>
              <Text style={styles.smallCardMeta}>45 tracks</Text>
            </View>
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Year in Review</Text>
            <Text style={styles.reviewMeta}>Relive your most played moments of 2023</Text>
          </View>
        </View>

        <View style={styles.miniPlayer}>
          <Image source={require('@/assets/images/figma2/v1_163.png')} style={styles.miniCover} />
          <View style={styles.miniTextWrap}>
            <Text style={styles.miniTitle}>After Hours</Text>
            <Text style={styles.miniArtist}>The Weeknd</Text>
          </View>
          <View style={styles.miniActions}>
            <Text style={styles.miniActionText}>▶</Text>
            <Text style={styles.miniActionText}>♫</Text>
          </View>
        </View>

        <View style={styles.mockBottomNav}>
          <Text style={styles.navItem}>HOME</Text>
          <Text style={styles.navItem}>SEARCH</Text>
          <Text style={styles.navItemActive}>LIBRARY</Text>
          <Text style={styles.navItem}>PREMIUM</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#131313',
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 42,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 19, 19, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E2E1',
  },
  topIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  topIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E2E1',
    opacity: 0.8,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  switcherActive: {
    color: '#E5E2E1',
    fontSize: 30,
    fontWeight: '800',
  },
  switcherText: {
    color: '#BCCBB9',
    fontSize: 24,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 12,
    backgroundColor: '#202020',
    overflow: 'hidden',
    padding: 22,
    alignItems: 'center',
  },
  heroGlow: {
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(83, 224, 118, 0.15)',
    position: 'absolute',
    top: 45,
    right: -40,
  },
  heroImage: {
    width: 190,
    height: 190,
    borderRadius: 12,
    marginBottom: 14,
  },
  heroInfo: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  heroLabel: {
    color: '#99D59D',
    fontSize: 10,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#E5E2E1',
    fontSize: 46,
    fontWeight: '800',
    lineHeight: 52,
  },
  heroMeta: {
    color: '#BCCBB9',
    fontSize: 15,
    fontWeight: '500',
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#3ED56B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  shuffleIcon: {
    color: '#002108',
    fontSize: 13,
    fontWeight: '700',
  },
  shuffleText: {
    color: '#002108',
    fontSize: 16,
    fontWeight: '700',
  },
  sortBar: {
    borderRadius: 12,
    backgroundColor: '#1C1B1B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortText: {
    color: '#BCCBB9',
    fontSize: 12,
    fontWeight: '600',
  },
  sortBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#353534',
  },
  trackList: {
    gap: 12,
  },
  trackCard: {
    borderRadius: 12,
    backgroundColor: '#1C1B1B',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackCardActive: {
    backgroundColor: '#2A1615',
  },
  trackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  trackTitle: {
    color: '#E5E2E1',
    fontSize: 16,
    fontWeight: '700',
    maxWidth: 150,
  },
  trackArtist: {
    color: '#BCCBB9',
    fontSize: 14,
    marginTop: 2,
  },
  trackRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  favorite: {
    color: '#BCCBB9',
    fontSize: 14,
  },
  favoriteActive: {
    color: '#53E076',
  },
  trackDuration: {
    color: '#BCCBB9',
    fontSize: 14,
    minWidth: 35,
    textAlign: 'right',
  },
  more: {
    color: '#BCCBB9',
    fontSize: 18,
    lineHeight: 18,
  },
  recommendWrap: {
    gap: 12,
    paddingTop: 8,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendTitle: {
    color: '#E5E2E1',
    fontSize: 20,
    fontWeight: '700',
  },
  mainRecommendCard: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mainRecommendImage: {
    width: '100%',
    height: '100%',
  },
  mainOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 14, 14, 0.22)',
  },
  mainTextBox: {
    position: 'absolute',
    left: 20,
    bottom: 24,
  },
  mainTag: {
    color: '#53E076',
    fontSize: 10,
    fontWeight: '600',
  },
  mainTitle: {
    color: '#E5E2E1',
    fontSize: 30,
    fontWeight: '800',
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#202020',
    padding: 16,
  },
  smallCardTitle: {
    color: '#E5E2E1',
    fontSize: 16,
    fontWeight: '700',
  },
  smallCardMeta: {
    marginTop: 4,
    color: '#BCCBB9',
    fontSize: 12,
  },
  reviewCard: {
    borderRadius: 12,
    backgroundColor: '#242424',
    padding: 18,
  },
  reviewTitle: {
    color: '#E5E2E1',
    fontSize: 18,
    fontWeight: '700',
  },
  reviewMeta: {
    marginTop: 4,
    color: '#BCCBB9',
    fontSize: 14,
    maxWidth: 230,
  },
  miniPlayer: {
    backgroundColor: 'rgba(53, 53, 52, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  miniCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  miniTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  miniTitle: {
    color: '#E5E2E1',
    fontSize: 14,
    fontWeight: '700',
  },
  miniArtist: {
    color: '#BCCBB9',
    fontSize: 10,
    marginTop: 2,
  },
  miniActions: {
    flexDirection: 'row',
    gap: 12,
  },
  miniActionText: {
    color: '#E5E2E1',
    fontSize: 14,
  },
  mockBottomNav: {
    marginTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(19, 19, 19, 0.85)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navItem: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  navItemActive: {
    color: '#1DB954',
    fontSize: 10,
    fontWeight: '700',
  },
});
