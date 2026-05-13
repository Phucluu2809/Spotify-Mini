import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../app/config/api";

type Song = {
  _id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audio: string;
  duration: number;
};

type Playlist = {
  _id: string;
  userId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  cover?: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
};

type PlaylistContextType = {
  playlists: Playlist[];
  followedPlaylists: Playlist[];
  loading: boolean;
  error: string | null;
  getPlaylists: () => Promise<void>;
  getFollowedPlaylists: () => Promise<void>;
  getPlaylistById: (id: string) => Promise<Playlist | null>;
  createPlaylist: (name: string, description?: string, isPrivate?: boolean) => Promise<Playlist | null>;
  updatePlaylist: (id: string, name: string, description?: string, isPrivate?: boolean) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<boolean>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<Playlist | null>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<Playlist | null>;
  followPlaylist: (playlistId: string) => Promise<boolean>;
  unfollowPlaylist: (playlistId: string) => Promise<boolean>;
  isPlaylistFollowed: (playlistId: string) => boolean;
};

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followedPlaylists, setFollowedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    return await SecureStore.getItemAsync("spotifymini.auth.token");
  };

  const getPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("No authentication token");
        return;
      }
      const res = await fetch(`${API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch playlists: ${res.status}`);
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching playlists:", err);
      setError(err.message || "Failed to fetch playlists");
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowedPlaylists = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setFollowedPlaylists([]);
        return;
      }
      const res = await fetch(`${API_URL}/user/followed-playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch followed playlists: ${res.status}`);
      const data = await res.json();
      setFollowedPlaylists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching followed playlists:", err);
      setError(err.message || "Failed to fetch followed playlists");
      setFollowedPlaylists([]);
    }
  }, []);

  const getPlaylistById = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return null;
      const res = await fetch(`${API_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.log("Error fetching playlist:", err);
      return null;
    }
  }, []);

  const createPlaylist = useCallback(
    async (name: string, description = "", isPrivate = false) => {
      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const res = await fetch(`${API_URL}/playlists`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description, isPrivate }),
        });
        if (!res.ok) throw new Error(`Failed to create playlist: ${res.status}`);
        const newPlaylist = await res.json();
        setPlaylists((prev) => [...prev, newPlaylist]);
        return newPlaylist;
      } catch (err: any) {
        console.log("Error creating playlist:", err);
        setError(err.message || "Failed to create playlist");
        return null;
      }
    },
    []
  );

  const updatePlaylist = useCallback(
    async (id: string, name: string, description = "", isPrivate = false) => {
      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const res = await fetch(`${API_URL}/playlists/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description, isPrivate }),
        });
        if (!res.ok) throw new Error(`Failed to update playlist: ${res.status}`);
        const updated = await res.json();
        setPlaylists((prev) =>
          prev.map((p) => (p._id === id ? updated : p))
        );
        return updated;
      } catch (err: any) {
        console.log("Error updating playlist:", err);
        setError(err.message || "Failed to update playlist");
        return null;
      }
    },
    []
  );

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("No authentication token");
        return false;
      }
      const res = await fetch(`${API_URL}/playlists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to delete playlist: ${res.status}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      return true;
    } catch (err: any) {
      console.log("Error deleting playlist:", err);
      setError(err.message || "Failed to delete playlist");
      return false;
    }
  }, []);

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const res = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ songId }),
        });
        if (!res.ok) throw new Error(`Failed to add song: ${res.status}`);
        const updated = await res.json();
        setPlaylists((prev) =>
          prev.map((p) => (p._id === playlistId ? updated : p))
        );
        return updated;
      } catch (err: any) {
        console.log("Error adding song to playlist:", err);
        setError(err.message || "Failed to add song to playlist");
        return null;
      }
    },
    []
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const res = await fetch(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to remove song: ${res.status}`);
        const updated = await res.json();
        setPlaylists((prev) =>
          prev.map((p) => (p._id === playlistId ? updated : p))
        );
        return updated;
      } catch (err: any) {
        console.log("Error removing song from playlist:", err);
        setError(err.message || "Failed to remove song from playlist");
        return null;
      }
    },
    []
  );

  const followPlaylist = useCallback(async (playlistId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("No authentication token");
        return false;
      }
      const res = await fetch(`${API_URL}/user/followed-playlists/${playlistId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to follow playlist: ${res.status}`);
      await getFollowedPlaylists();
      return true;
    } catch (err: any) {
      console.log("Error following playlist:", err);
      setError(err.message || "Failed to follow playlist");
      return false;
    }
  }, [getFollowedPlaylists]);

  const unfollowPlaylist = useCallback(async (playlistId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("No authentication token");
        return false;
      }
      const res = await fetch(`${API_URL}/user/followed-playlists/${playlistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to unfollow playlist: ${res.status}`);
      await getFollowedPlaylists();
      return true;
    } catch (err: any) {
      console.log("Error unfollowing playlist:", err);
      setError(err.message || "Failed to unfollow playlist");
      return false;
    }
  }, [getFollowedPlaylists]);

  const isPlaylistFollowed = useCallback(
    (playlistId: string) => followedPlaylists.some((playlist) => playlist._id === playlistId),
    [followedPlaylists]
  );

  useEffect(() => {
    getPlaylists();
    getFollowedPlaylists();
  }, []);

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        followedPlaylists,
        loading,
        error,
        getPlaylists,
        getFollowedPlaylists,
        getPlaylistById,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        followPlaylist,
        unfollowPlaylist,
        isPlaylistFollowed,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylist must be used within PlaylistProvider");
  return ctx;
};
