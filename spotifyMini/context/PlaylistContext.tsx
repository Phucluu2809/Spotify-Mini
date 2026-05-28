import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "../app/config/api";
import { useAuth } from "./AuthContext";

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
  createPlaylist: (
    name: string,
    description?: string,
    isPrivate?: boolean,
    cover?: string,
    coverImageUri?: string,
    coverImageName?: string
  ) => Promise<Playlist | null>;
  updatePlaylist: (id: string, name: string, description?: string, isPrivate?: boolean, cover?: string) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<boolean>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<Playlist | null>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<Playlist | null>;
  followPlaylist: (playlistId: string) => Promise<boolean>;
  unfollowPlaylist: (playlistId: string) => Promise<boolean>;
  isPlaylistFollowed: (playlistId: string) => boolean;
};

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const { token, handleUnauthorized } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followedPlaylists, setFollowedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError("No authentication token");
        return;
      }
      const res = await fetch(`${API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error(`Failed to fetch playlists: ${res.status}`);
      }
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching playlists:", err);
      setError(err.message || "Failed to fetch playlists");
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  const getFollowedPlaylists = useCallback(async () => {
    try {
      if (!token) {
        setFollowedPlaylists([]);
        return;
      }
      const res = await fetch(`${API_URL}/user/followed-playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error(`Failed to fetch followed playlists: ${res.status}`);
      }
      const data = await res.json();
      setFollowedPlaylists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching followed playlists:", err);
      setError(err.message || "Failed to fetch followed playlists");
      setFollowedPlaylists([]);
    }
  }, [token, handleUnauthorized]);

  const getPlaylistById = useCallback(async (id: string) => {
    try {
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
  }, [token]);

  const createPlaylist = useCallback(
    async (
      name: string,
      description = "",
      isPrivate = false,
      cover = "",
      coverImageUri?: string,
      coverImageName?: string
    ) => {
      try {
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const form = new FormData();
        form.append("name", name);
        form.append("description", description);
        form.append("isPrivate", String(isPrivate));
        form.append("cover", cover);

        if (coverImageUri) {
          const ext = coverImageName?.split(".").pop()?.split("?")[0] || "jpg";
          form.append("coverImage", {
            uri: coverImageUri,
            name: coverImageName || `playlist-cover.${ext}`,
            type: `image/${ext}`,
          } as any);
        }

        const res = await fetch(`${API_URL}/playlists`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
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
    [token]
  );

  const updatePlaylist = useCallback(
    async (id: string, name: string, description = "", isPrivate = false, cover?: string) => {
      try {
        if (!token) {
          setError("No authentication token");
          return null;
        }
        const body: {
          name: string;
          description: string;
          isPrivate: boolean;
          cover?: string;
        } = { name, description, isPrivate };
        if (cover !== undefined) {
          body.cover = cover;
        }
        const res = await fetch(`${API_URL}/playlists/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
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
    [token]
  );

  const deletePlaylist = useCallback(async (id: string) => {
    try {
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
  }, [token]);

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      try {
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
    [token]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      try {
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
    [token]
  );

  const followPlaylist = useCallback(async (playlistId: string) => {
    try {
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
  }, [token, getFollowedPlaylists]);

  const unfollowPlaylist = useCallback(async (playlistId: string) => {
    try {
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
  }, [token, getFollowedPlaylists]);

  const isPlaylistFollowed = useCallback(
    (playlistId: string) => followedPlaylists.some((playlist) => playlist._id === playlistId),
    [followedPlaylists]
  );

  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      setFollowedPlaylists([]);
      setError(null);
      setLoading(false);
      return;
    }

    setPlaylists([]);
    setFollowedPlaylists([]);
    void getPlaylists();
    void getFollowedPlaylists();
  }, [token, getPlaylists, getFollowedPlaylists]);

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
