import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const options = [
  {
    title: 'Listening History',
    subtitle: 'Xem các bài đã nghe theo mốc thời gian',
    route: '/(tabs)/listening-history',
    icon: 'time-outline' as const,
  },
  {
    title: 'Recently Played',
    subtitle: 'Danh sách phát gần đây kèm mục nổi bật',
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
          <Ionicons name="arrow-back" size={22} color="#d8d8d8" />
        </Pressable>

        <Text style={styles.title}>History</Text>

        <View style={styles.iconButton} />
      </View>

      <Text style={styles.description}>Chọn màn bạn muốn mở</Text>

      <View style={styles.stack}>
        {options.map((option) => (
          <Pressable
            key={option.title}
            style={styles.card}
            android_ripple={{ color: '#1f1f1f' }}
            onPress={() => router.push(option.route)}
          >
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <Ionicons name={option.icon} size={20} color="#1fd05a" />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#7a7a7a" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a0b0d',
    paddingTop: 60,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#f2f2f2',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  description: {
    color: '#9fa3a8',
    fontSize: 14,
    marginBottom: 24,
  },
  stack: {
    gap: 14,
  },
  card: {
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: '#15171a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#25282d',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1c2220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flexShrink: 1,
  },
  cardTitle: {
    color: '#f2f2f2',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSubtitle: {
    color: '#91969c',
    fontSize: 13,
  },
});
