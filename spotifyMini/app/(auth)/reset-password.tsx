import { useMemo, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { API_URL } from "../config/api";
import { AuthNotice } from "../../components/AuthNotice";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; otp?: string; sent?: string }>();
  const initialEmail = useMemo(() => {
    return typeof params.email === "string" ? params.email : "";
  }, [params.email]);
  const initialOtp = useMemo(() => {
    return typeof params.otp === "string" ? params.otp : "";
  }, [params.otp]);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "error" | "success" | "info" } | null>(
    params.sent === "1"
      ? { message: "OTP has been sent to your email. Enter it below to reset your password.", variant: "success" }
      : null
  );

  const handleReset = async () => {
    const normalizedOtp = otp.trim();
    if (!email.trim() || !normalizedOtp) return setNotice({ message: "Email and OTP are required", variant: "error" });
    if (!/^\d{6}$/.test(normalizedOtp)) return setNotice({ message: "OTP must be 6 digits", variant: "error" });
    if (!password) return setNotice({ message: "Please enter a new password", variant: "error" });
    if (password.length < 6) return setNotice({ message: "Password must be at least 6 characters", variant: "error" });
    if (password !== confirm) return setNotice({ message: "Passwords do not match", variant: "error" });

    try {
      setNotice(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: normalizedOtp, password })
      });
      const data = await res.json();
      if (res.ok) {
        setNotice({ message: "Password reset successfully. Redirecting to login...", variant: "success" });
        setTimeout(() => router.replace("/(auth)/login"), 900);
      } else {
        setNotice({ message: data.message || "Could not reset password", variant: "error" });
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
              <Text style={styles.headerTitle}>New password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.hero}>
              <View style={styles.logoWrap}>
                <Ionicons name="key" size={28} color="#0B0F0D" />
              </View>
              <Text style={styles.brand}>Create new password</Text>
              <Text style={styles.tagline}>Use at least 6 characters.</Text>
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

              <Text style={styles.label}>OTP</Text>
              <View style={styles.field}>
                <TextInput
                  placeholder="6-digit OTP"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                  value={otp}
                  onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
                />
              </View>

              <Text style={styles.label}>New password</Text>
              <View style={styles.fieldWithIcon}>
                <TextInput
                  placeholder="New password"
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
              <View style={styles.field}>
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#5E665F"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Saving..." : "Reset password"}
                </Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Back to</Text>
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
    paddingVertical: 18
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
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center"
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
