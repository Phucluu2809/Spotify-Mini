import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const options = [
  {
    title: 'Listening History',
    subtitle: 'Every play ordered by time',
    route: '/(tabs)/listening-history',
    icon: 'time-outline' as const,
  },
  {
    title: 'Recently Played',
    subtitle: 'Latest tracks without duplicates',
    route: '/(tabs)/recently-played',
    icon: 'albums-outline' as const,
  },
];

export default function HistoryEntryScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </Pressable>
        <Text style={styles.title}>History</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.stack}>
        {options.map((option) => (
          <Pressable
            key={option.title}
            style={styles.row}
            android_ripple={{ color: '#1f1f1f' }}
            onPress={() => router.push(option.route)}
          >
            <View style={styles.leading}>
              <View style={styles.iconWrap}>
                <Ionicons name={option.icon} size={20} color="#1fd05a" />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{option.title}</Text>
                <Text style={styles.rowSubtitle}>{option.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#707781" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090b0e',
    paddingTop: 54,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#f1f5f9',
    fontSize: 28,
    fontWeight: '800',
  },
  stack: {
    gap: 10,
  },
  row: {
    minHeight: 78,
    borderRadius: 8,
    backgroundColor: '#14171a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#22272e',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1c2220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, minWidth: 0 },
  rowTitle: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  rowSubtitle: {
    color: '#8e949b',
    fontSize: 13,
  },
});
