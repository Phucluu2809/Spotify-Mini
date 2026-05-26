import { useState } from "react";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { API_URL } from "../config/api";
import { AuthNotice } from "../../components/AuthNotice";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "error" | "success" | "info" } | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      return setNotice({ message: "Please enter your email address", variant: "error" });
    }

    try {
      setNotice(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email: email.trim(), sent: "1" }
        });
      } else {
        setNotice({ message: data.message || "Could not send reset OTP", variant: "error" });
      }
    } catch {
      setNotice({ message: "Network error. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#050605", "#0B100D", "#050605"]}
      locations={[0, 0.55, 1]}
      style={styles.background}
    >
      <View style={styles.glowTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color="#47E06F" />
            </Pressable>
            <Text style={styles.headerTitle}>Reset password</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Ionicons name="mail" size={28} color="#0B0F0D" />
            </View>
            <Text style={styles.brand}>Forgot password?</Text>
            <Text style={styles.tagline}>Enter your email and we will send a reset OTP.</Text>
          </View>

          <View style={styles.formBlock}>
            {notice ? <AuthNotice message={notice.message} variant={notice.variant} /> : null}

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

            <Pressable
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Sending..." : "Send reset OTP"}
              </Text>
            </Pressable>

            {sent ? (
              <View style={styles.sentBlock}>
                <AuthNotice message="If this email exists, a reset OTP has been sent." variant="success" />
                <Link href="/(auth)/reset-password" style={styles.otpLink}>
                  Enter OTP
                </Link>
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remembered it?</Text>
              <Link href="/(auth)/login" style={styles.footerLink}>
                Log in
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
  header: {
    position: "absolute",
    top: 18,
    left: 22,
    right: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
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
    marginBottom: 36
  },
  logoWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  brand: {
    color: "#47E06F",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  tagline: {
    color: "#A8B1A4",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center"
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
  field: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#1A1E1B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  input: {
    color: "#EAF2E8",
    fontSize: 15
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: "#47E06F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  primaryButtonText: {
    color: "#0B0F0D",
    fontSize: 16,
    fontWeight: "900"
  },
  statusText: {
    color: "#AAB4A7",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  sentBlock: {
    alignItems: "center",
    gap: 10
  },
  otpLink: {
    color: "#47E06F",
    fontSize: 14,
    fontWeight: "800"
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
