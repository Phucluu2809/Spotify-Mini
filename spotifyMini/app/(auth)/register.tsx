import { useState } from "react";
import { API_URL } from "../config/api";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'user' | 'artist'>('user');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return alert('Please complete all fields');
    }
    if (password !== confirm) return alert('Passwords do not match');

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        router.replace('/(auth)/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      alert('Network error');
    }
  };

  return (
    <LinearGradient
      colors={["#050605", "#0B100D", "#050605"]}
      locations={[0, 0.55, 1]}
      style={styles.background}
    >
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Ionicons name="arrow-back" size={24} color="#47E06F" />
              </Pressable>
              <Text style={styles.headerTitle}>Create account</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.hero}>
              <View style={styles.logoWrap}>
                <Ionicons name="pulse" size={30} color="#0B0F0D" />
              </View>

              <Text style={styles.brand}>Spotify Mini</Text>
              <Text style={styles.tagline}>Your high-fidelity editorial retreat.</Text>
            </View>

            <View style={styles.formBlock}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.field}>
                <TextInput
                  placeholder="Alex Rivera"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.label}>Email address</Text>
              <View style={styles.field}>
                <TextInput
                  placeholder="alex@sanctuary.com"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>Account type</Text>
              <View style={styles.roleRow}>
                <Pressable
                  onPress={() => setRole('user')}
                  style={[styles.roleChip, role === 'user' && styles.roleChipActive]}
                >
                  <Text style={[styles.roleChipText, role === 'user' && styles.roleChipTextActive]}>User</Text>
                </Pressable>

                <Pressable
                  onPress={() => setRole('artist')}
                  style={[styles.roleChip, role === 'artist' && styles.roleChipActive]}
                >
                  <Text style={[styles.roleChipText, role === 'artist' && styles.roleChipTextActive]}>Artist</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.fieldWithIcon}>
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />

                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#667067"
                  />
                </Pressable>
              </View>

              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.fieldWithIcon}>
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                />

                <Pressable
                  onPress={() => setShowConfirm((value) => !value)}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirm ? "eye" : "eye-off"}
                    size={20}
                    color="#667067"
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Create account'}</Text>
                <Ionicons name="arrow-forward" size={18} color="#0B0F0D" />
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/(auth)/login" style={styles.footerLink}>
                  Log in
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: "relative"
  },
  safeArea: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 18,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "flex-start"
  },
  glowLeft: {
    position: "absolute",
    top: 50,
    left: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "rgba(30, 185, 84, 0.10)"
  },
  glowRight: {
    position: "absolute",
    bottom: -140,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "rgba(30, 185, 84, 0.12)"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22
  },
  headerTitle: {
    color: "#47E06F",
    fontSize: 20,
    fontWeight: "800"
  },
  headerSpacer: {
    width: 24,
    height: 24
  },
  hero: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 4
  },
  logoWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#1DB954",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8
  },
  brand: {
    color: "#47E06F",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  tagline: {
    color: "#A8B1A4",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center"
  },
  formBlock: {
    gap: 12
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#1A1E1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipActive: {
    borderColor: '#47E06F',
    backgroundColor: 'rgba(71, 224, 111, 0.12)',
  },
  roleChipText: {
    color: '#AAB4A7',
    fontSize: 14,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#47E06F',
  },
  label: {
    color: "#C3CBBF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginTop: 2
  },
  field: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#1A1E1B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  fieldWithIcon: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#1A1E1B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 14
  },
  input: {
    flex: 1,
    color: "#EAF2E8",
    fontSize: 15
  },
  eyeButton: {
    paddingLeft: 12,
    paddingVertical: 8
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#47E06F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#47E06F",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6
  },
  primaryButtonText: {
    color: "#0B0F0D",
    fontSize: 16,
    fontWeight: "900"
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 18
  },
  footerText: {
    color: "#AAB4A7",
    fontSize: 14
  },
  footerLink: {
    color: "#47E06F",
    fontSize: 14,
    fontWeight: "800"
  }
});