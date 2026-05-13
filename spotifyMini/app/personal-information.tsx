import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/userService';

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState(user?.role ?? 'user');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [pickedAvatar, setPickedAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const displayAvatar = pickedAvatar || avatar;
  const initials = useMemo(() => getInitials(name || email), [name, email]);
  const hasChanges = name.trim() !== (user?.name ?? '') || Boolean(pickedAvatar);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name);
        setEmail(profile.email);
        setRole(profile.role);
        setAvatar(profile.avatar ?? '');
        await updateUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar,
        });
      } catch (err) {
        console.log('Load profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [updateUser]);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to choose an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPickedAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: trimmedName,
        avatarUri: pickedAvatar || undefined,
      });
      await updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
      });
      setAvatar(updated.avatar ?? '');
      setPickedAvatar('');
      Alert.alert('Profile updated', 'Your personal information has been saved.');
    } catch (err: any) {
      console.log('Update profile error:', err);
      const message = err?.response?.data?.message || 'Please try again later.';
      Alert.alert('Could not save profile', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </Pressable>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.iconButton} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#1fd05a" size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarAction}>
              <Ionicons name="camera" size={16} color="#071008" />
            </View>
          </Pressable>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#6b7280"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText} numberOfLines={1}>{email}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{role.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator color="#071008" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090b0e' },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 22 },
  avatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 34,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 66, backgroundColor: '#1c2220' },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
    backgroundColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#071008', fontSize: 36, fontWeight: '900' },
  avatarAction: {
    position: 'absolute',
    right: 2,
    bottom: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#090b0e',
  },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { color: '#9ca3af', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  input: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#15191d',
    borderWidth: 1,
    borderColor: '#252b31',
    color: '#f1f5f9',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  readOnlyField: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#101418',
    borderWidth: 1,
    borderColor: '#1f252b',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  readOnlyText: { color: '#7f8790', fontSize: 15 },
  saveButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#1fd05a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: { color: '#071008', fontSize: 15, fontWeight: '900' },
});
