import { Stack } from "expo-router";

import { PlayerProvider } from "../context/PlayerContext";

export default function RootLayout() {
  return (
    <PlayerProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </PlayerProvider>
  );
}