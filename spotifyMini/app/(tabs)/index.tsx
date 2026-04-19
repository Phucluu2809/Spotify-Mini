import { useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function HomeScreen() {
  const panelWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return Math.min(390, Math.max(320, screenWidth));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { width: panelWidth }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <View style={styles.logoBar} />
              <View style={styles.logoBar} />
              <View style={styles.logoBar} />
            </View>
            <Text style={styles.brandTitle}>SONIC GALLERY</Text>
            <Text style={styles.brandSubtitle}>THE EDITORIAL SOUNDSCAPE</Text>
          </View>

          <Pressable style={styles.spotifyButton}>
            <Text style={styles.spotifyButtonText}>Continue with Spotify</Text>
          </Pressable>

          <View style={styles.separatorWrap}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.formWrap}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              defaultValue="alex@sonicgallery.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#3D4A3D"
            />

            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>PASSWORD</Text>
              <Text style={styles.forgotText}>FORGOT?</Text>
            </View>
            <TextInput
              defaultValue="••••••••"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#3D4A3D"
            />

            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login to Collection</Text>
            </Pressable>
          </View>

          <Text style={styles.joinText}>
            New to the gallery? <Text style={styles.joinLink}>Join now</Text>
          </Text>

          <Text style={styles.footerText}>BUILT FOR CONNOISSEURS OF THE SONIC ARTS</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F0C',
  },
  background: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0B0F0C',
    position: 'relative',
  },
  glowTop: {
    width: 210,
    height: 460,
    backgroundColor: 'rgba(83, 224, 118, 0.08)',
    borderRadius: 999,
    position: 'absolute',
    top: 70,
    left: -18,
  },
  glowBottom: {
    width: 190,
    height: 390,
    backgroundColor: 'rgba(83, 224, 118, 0.12)',
    borderRadius: 999,
    position: 'absolute',
    right: -74,
    bottom: -40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 34,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#1DB954',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    marginBottom: 16,
  },
  logoBar: {
    width: 26,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#004118',
  },
  brandTitle: {
    color: '#53E076',
    fontSize: 30,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.6,
  },
  brandSubtitle: {
    marginTop: 6,
    color: 'rgba(188, 203, 185, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  spotifyButton: {
    height: 56,
    borderRadius: 24,
    backgroundColor: '#3ED56B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  spotifyButtonText: {
    color: '#002108',
    fontSize: 15,
    fontWeight: '700',
  },
  separatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 26,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#353534',
  },
  separatorText: {
    color: '#BCCBB9',
    fontSize: 10,
    fontWeight: '700',
  },
  formWrap: {
    gap: 10,
  },
  label: {
    color: '#BCCBB9',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1B1B',
    paddingHorizontal: 16,
    color: '#BCCBB9',
    fontSize: 16,
    marginBottom: 14,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    color: '#53E076',
    fontSize: 11,
    fontWeight: '700',
  },
  loginButton: {
    marginTop: 6,
    height: 56,
    borderRadius: 24,
    backgroundColor: '#353534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#E5E2E1',
    fontSize: 16,
    fontWeight: '600',
  },
  joinText: {
    marginTop: 32,
    textAlign: 'center',
    color: '#BCCBB9',
    fontSize: 14,
    fontWeight: '500',
  },
  joinLink: {
    color: '#53E076',
    fontWeight: '700',
  },
  footerText: {
    marginTop: 44,
    textAlign: 'center',
    color: 'rgba(229, 226, 225, 0.4)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
