import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ListeningHistoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={22} color="#d8d8d8" />
          </Pressable>

          <Text style={styles.headerTitle}>History</Text>

          <Pressable style={styles.headerIcon}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.emptyWrap}>
          <Ionicons name="time-outline" size={42} color="#5d636b" />
          <Text style={styles.emptyTitle}>No listening history</Text>
          <Text style={styles.emptySubtitle}>Your listened tracks will appear here.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090b0e',
  },
  content: {
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerIcon: {
    width: 46,
    height: 34,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#f1f1f1',
    fontSize: 34,
    fontWeight: '800',
  },
  clearText: {
    color: '#1fd05a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  emptyWrap: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 14,
    color: '#e4e4e4',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 6,
    color: '#8e949b',
    fontSize: 14,
  },
});
