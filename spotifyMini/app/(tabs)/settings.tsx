import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';

const profile = {
  name: 'Alex Johnson',
  email: 'alex@sonicgallery.com',
  role: 'user' as const,
};

const settingsGroups = [
  {
    title: 'Profile',
    items: [
      {
        label: 'Personal Information',
        icon: 'person-outline' as const,
      },
    ],
  },
  {
    title: 'Activity',
    items: [
      {
        label: 'History',
        icon: 'time-outline' as const,
      },
    ],
  },
  {
    title: 'Experience',
    items: [],
  },
];

type SettingItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  onPress?: () => void;
};

function SettingRow({ label, icon, value, onPress }: SettingItem) {
  return (
    <Pressable
      style={styles.row}
      android_ripple={{ color: '#1b1b1b' }}
      onPress={onPress}
    >
      <View style={styles.rowLeading}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={18} color="#a5a5a5" />
        </View>

        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.rowTrailing}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color="#5f5f5f" />
      </View>
    </Pressable>
  );
}

function SectionCard({ title, items }: { title: string; items: SettingItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>

      <View style={styles.cardContent}>
        {items.map((item, index) => (
          <View key={item.label}>
            <SettingRow {...item} />
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { clearPlayer } = usePlayer();

  const handleLogout = async () => {
    await clearPlayer();
    await logout();
  };

  const groupsWithActions = settingsGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.label === 'Personal Information') {
        return {
          ...item,
          onPress: () => router.push('/personal-information'),
        };
      }

      if (item.label !== 'History') {
        return item;
      }

      return {
        ...item,
        onPress: () => router.push('/(tabs)/history'),
      };
    }),
  }));

  const displayName = user?.name ?? profile.name;
  const displayEmail = user?.email ?? profile.email;
  const displayRole = user?.role ?? profile.role;
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#d9d9d9" />
          </Pressable>

          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.avatarRing}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}

            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={11} color="#0b0b0b" />
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <Text style={styles.role}>{displayRole.toUpperCase()}</Text>

        </View>

        <View style={styles.groupStack}>
          {groupsWithActions
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <SectionCard key={group.title} title={group.title} items={group.items} />
            ))}

          {/* Artist Dashboard - only visible for artist accounts */}
          {(user?.role === 'artist') && (
            <SectionCard
              title="Artist"
              items={[
                {
                  label: 'Manage Music',
                  icon: 'mic-outline' as const,
                  onPress: () => router.push('/artist-dashboard' as any),
                },
              ]}
            />
          )}
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void handleLogout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerTitle: {
    color: '#f1f1f1',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 22,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  profileBlock: {
    alignItems: 'center',
    marginBottom: 34,
  },
  avatarRing: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 2,
    borderColor: '#1fd05a',
    backgroundColor: '#ffb17a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffbb87',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1c2220',
  },
  avatarInitials: {
    color: '#2a2320',
    fontSize: 30,
    fontWeight: '800',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#e9e9e9',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  email: {
    color: '#6f726f',
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  role: {
    color: '#1fd05a',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  groupStack: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1a1c1a',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  cardTitle: {
    color: '#9ea39e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  cardContent: {
    gap: 0,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  rowIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: '#ececec',
    fontSize: 17,
    fontWeight: '500',
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 12,
  },
  rowValue: {
    color: '#1fd05a',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2d2a',
  },
  logoutButton: {
    marginTop: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutText: {
    color: '#1fd05a',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
