import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { PlayerProvider } from "../context/PlayerContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { PlaylistProvider } from "../context/PlaylistContext";
import { AlbumProvider } from "../context/AlbumContext";
import { ArtistProvider } from "../context/ArtistContext";
import { usePlayer } from "../context/PlayerContext";

function RootNavigator() {
  const { token, isReady } = useAuth();
  const { clearPlayer } = usePlayer();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [token, isReady, segments]);

  useEffect(() => {
    if (!isReady || token) return;
    void clearPlayer();
  }, [isReady, token, clearPlayer]);

  if (!isReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121212" } }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <FavoriteProvider>
          <PlaylistProvider>
            <AlbumProvider>
              <ArtistProvider>
                <RootNavigator />
              </ArtistProvider>
            </AlbumProvider>
          </PlaylistProvider>
        </FavoriteProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}
