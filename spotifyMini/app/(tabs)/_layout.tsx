import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import MiniPlayer from "../../components/MiniPlayer";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#222",
            paddingBottom: 4,
          },
          tabBarActiveTintColor: "#1DB954",
          tabBarInactiveTintColor: "gray",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="listening-history" options={{ href: null }} />
        <Tabs.Screen name="recently-played" options={{ href: null }} />
        <Tabs.Screen name="my-playlist" options={{ href: null }} />
        <Tabs.Screen name="playlist/[id]" options={{ href: null }} />
        <Tabs.Screen name="album/[id]" options={{ href: null }} />
        <Tabs.Screen name="artist/[name]" options={{ href: null }} />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
