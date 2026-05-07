import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RecentlyPlayedScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={22} color="#d8d8d8" />
          </Pressable>

          <Text style={styles.headerTitle}>Recently Played</Text>

          <Pressable style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={22} color="#d8d8d8" />
          </Pressable>
        </View>

        <View style={styles.emptyWrap}>
          <Ionicons name="albums-outline" size={44} color="#5d636b" />
          <Text style={styles.emptyTitle}>No recently played tracks</Text>
          <Text style={styles.emptySubtitle}>Your latest songs will show up here.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a0b0f',
  },
  content: {
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ededed',
    fontSize: 34,
    fontWeight: '800',
  },
  emptyWrap: {
    marginTop: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 14,
    color: '#e4e4e4',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    color: '#8e949b',
    fontSize: 14,
    textAlign: 'center',
  },
});
