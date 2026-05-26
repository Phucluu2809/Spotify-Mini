import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { usePlaylist } from "../context/PlaylistContext";
import { getDefaultCoverUrl } from "../services/media";

export default function AddPlaylistScreen() {
  const router = useRouter();
  const { createPlaylist, loading } = usePlaylist();
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]) {
      setCoverUri(result.assets[0].uri);
      setCoverName(result.assets[0].fileName ?? result.assets[0].uri.split("/").pop() ?? "cover.jpg");
    }
  };

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      Alert.alert("Playlist name required", "Please enter a playlist name before creating it.");
      return;
    }

    setUploadingCover(true);
    try {
      const defaultCover = getDefaultCoverUrl(playlistName.trim());
      const newPlaylist = await createPlaylist(
        playlistName.trim(),
        description.trim(),
        isPrivate,
        defaultCover,
        coverUri ?? undefined,
        coverName ?? undefined
      );
      if (newPlaylist) {
        Alert.alert("Success", "Playlist created.");
        router.push(`/(tabs)/playlist/${newPlaylist._id}`);
      } else {
        Alert.alert("Error", "Could not create playlist. Please try again.");
      }
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["rgba(32,31,31,0.4)", "rgba(19,19,19,0.95)"]}
          style={styles.card}
        >
          <View style={styles.header}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="close" size={18} color="#BCCBB9" />
            </Pressable>
          </View>

          <View style={styles.coverWrap}>
            <View style={styles.coverCard}>
              <Image
                source={{ uri: coverUri || getDefaultCoverUrl(playlistName.trim() || "playlist") }}
                style={styles.coverImage}
              />
              <View style={styles.coverOverlay} />
              <View style={styles.choosePhoto}>
                <Ionicons name="image-outline" size={28} color="#BCCBB9" />
                <Text style={styles.choosePhotoText}>{coverUri ? "PHOTO SELECTED" : "CHOOSE PHOTO"}</Text>
              </View>
            </View>

            <Pressable style={styles.addPhotoButton} onPress={pickCover} disabled={loading || uploadingCover}>
              <Ionicons name="add" size={20} color="#003914" />
            </Pressable>
          </View>

          <View style={styles.nameBlock}>
            <TextInput
              value={playlistName}
              onChangeText={setPlaylistName}
              placeholder="Name your playlist"
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={styles.input}
              editable={!loading}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add description (optional)"
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={[styles.input, styles.descriptionInput]}
              multiline
              editable={!loading}
            />
            <Text style={styles.helperText}>
              Give your creation a title that resonates with the mood. You can
              change this later.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={loading || uploadingCover}
            >
              {loading || uploadingCover ? (
                <ActivityIndicator color="#004118" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </Pressable>
            <Pressable onPress={() => router.back()} disabled={loading}>
              <Text style={styles.skipText}>CANCEL</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.privateBar}>
          <Ionicons name="lock-closed-outline" size={14} color="#BCCBB9" />
          <Text style={styles.privateText}>Private Playlist</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: "#5D5D5D", true: "#1DB954" }}
            thumbColor={isPrivate ? "#0B0F0D" : "#E5E2E1"}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  glowTopRight: {
    position: "absolute",
    top: 90,
    right: -40,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(83,224,118,0.1)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 117,
    height: 117,
    borderRadius: 58.5,
    backgroundColor: "rgba(83,224,118,0.05)",
  },
  card: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  coverCard: {
    width: 192,
    height: 192,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  choosePhoto: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  choosePhotoText: {
    color: "#BCCBB9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: -12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#53E076",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  nameBlock: {
    alignItems: "center",
    marginBottom: 26,
  },
  input: {
    width: "100%",
    maxWidth: 292,
    minHeight: 56,
    borderRadius: 18,
    textAlign: "center",
    color: "#E5E2E1",
    fontSize: 20,
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 16,
  },
  descriptionInput: {
    minHeight: 40,
    marginTop: 12,
    fontSize: 14,
    fontWeight: "400",
  },
  helperText: {
    marginTop: 18,
    color: "#BCCBB9",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 292,
  },
  actions: {
    alignItems: "center",
    marginTop: 4,
  },
  createButton: {
    width: "100%",
    maxWidth: 292,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#004118",
    fontSize: 16,
    fontWeight: "700",
  },
  skipText: {
    marginTop: 16,
    color: "#BCCBB9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  privateBar: {
    minHeight: 73,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  privateText: {
    flex: 1,
    color: "#BCCBB9",
    fontSize: 16,
  },
});
