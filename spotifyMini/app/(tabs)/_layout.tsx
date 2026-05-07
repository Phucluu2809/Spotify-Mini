import { Tabs } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import MiniPlayer from "../../components/MiniPlayer";

import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#222"
          },
          tabBarActiveTintColor: "#1DB954",
          tabBarInactiveTintColor: "gray"
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="home"
                color={color}
                size={size}
              />
            )
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="search"
                color={color}
                size={size}
              />
            )
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="library"
                color={color}
                size={size}
              />
            )
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="settings"
                color={color}
                size={size}
              />
            )
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            href: null
          }}
        />

        <Tabs.Screen
          name="listening-history"
          options={{
            href: null
          }}
        />

        <Tabs.Screen
          name="recently-played"
          options={{
            href: null
          }}
        />
      </Tabs>

      <MiniPlayer />
    </View>
  );
}