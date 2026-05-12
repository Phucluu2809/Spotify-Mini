import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PlayerProvider } from "../context/PlayerContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { PlaylistProvider } from "../context/PlaylistContext";
import { AlbumProvider } from "../context/AlbumContext";

function RootNavigator() {
  const { token, isReady } = useAuth();
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

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121212" } }} />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <FavoriteProvider>
          <PlaylistProvider>
            <AlbumProvider>
              <RootNavigator />
            </AlbumProvider>
          </PlaylistProvider>
        </FavoriteProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}