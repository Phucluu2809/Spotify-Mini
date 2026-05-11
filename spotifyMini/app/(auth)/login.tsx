import { useState } from "react";
import { API_URL } from "../config/api";

import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        await login({ token: data.token, user: data.user });
        router.replace('/(tabs)/home');
      } else {
        alert(data.message || 'Login failed');
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
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Ionicons name="pulse" size={30} color="#0B0F0D" />
            </View>

            <Text style={styles.brand}>Spotify Mini</Text>
            <Text style={styles.tagline}>The editorial soundscape</Text>
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.field}>
              <TextInput
                placeholder="alex@sonicgallery.com"
                placeholderTextColor="#5E665F"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.passwordRow}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.forgot}>Forgot?</Text>
            </View>

            <View style={styles.fieldWithIcon}>
              <TextInput
                placeholder="••••••••"
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

            <Pressable
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Login to Collection'}</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to the gallery?</Text>
              <Link href="/(auth)/register" style={styles.footerLink}>
                Join now
              </Link>
            </View>
          </View>
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "center"
  },
  glowTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: "rgba(30, 185, 84, 0.12)"
  },
  glowBottom: {
    position: "absolute",
    right: -90,
    bottom: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(30, 185, 84, 0.08)"
  },
  hero: {
    alignItems: "center",
    marginBottom: 36
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
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  tagline: {
    color: "#889488",
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  formBlock: {
    gap: 14
  },
  label: {
    color: "#C3CBBF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4
  },
  forgot: {
    color: "#47E06F",
    fontSize: 12,
    fontWeight: "700"
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
    backgroundColor: "#3F423F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  primaryButtonText: {
    color: "#F4F6F3",
    fontSize: 16,
    fontWeight: "800"
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20
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