import { Stack } from "expo-router";

import { PlayerProvider } from "../context/PlayerContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Stack
          screenOptions={{
            headerShown: false
          }}
        />
      </PlayerProvider>
    </AuthProvider>
  );
}