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

type Album = {
  _id: string;
  name: string;
  artist: string;
  artistId: string;
  cover?: string;
  year?: number;
  genre?: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
};

type AlbumContextType = {
  albums: Album[];
  followedAlbums: Album[];
  loading: boolean;
  error: string | null;
  getAlbums: () => Promise<void>;
  getFollowedAlbums: () => Promise<void>;
  getAlbumById: (id: string) => Promise<Album | null>;
  followAlbum: (albumId: string) => Promise<boolean>;
  unfollowAlbum: (albumId: string) => Promise<boolean>;
  isAlbumFollowed: (albumId: string) => boolean;
};

const AlbumContext = createContext<AlbumContextType | null>(null);

export const AlbumProvider = ({ children }: { children: ReactNode }) => {
  const { token, isReady, handleUnauthorized } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [followedAlbums, setFollowedAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/albums`);
      if (!res.ok) throw new Error(`Failed to fetch albums: ${res.status}`);
      const data = await res.json();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching albums:", err);
      setError(err.message || "Failed to fetch albums");
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowedAlbums = useCallback(async () => {
    try {
      if (!token) {
        setFollowedAlbums([]);
        return;
      }
      const res = await fetch(`${API_URL}/user/followed-albums`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error(`Failed to fetch followed albums: ${res.status}`);
      }
      const data = await res.json();
      setFollowedAlbums(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("Error fetching followed albums:", err);
      setError(err.message || "Failed to fetch followed albums");
      setFollowedAlbums([]);
    }
  }, [token, handleUnauthorized]);

  const getAlbumById = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/albums/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.log("Error fetching album:", err);
      return null;
    }
  }, []);

  const followAlbum = useCallback(async (albumId: string) => {
    try {
      if (!token) {
        setError("No authentication token");
        return false;
      }
      const res = await fetch(`${API_URL}/user/followed-albums/${albumId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to follow album: ${res.status}`);
      await getFollowedAlbums();
      return true;
    } catch (err: any) {
      console.log("Error following album:", err);
      setError(err.message || "Failed to follow album");
      return false;
    }
  }, [token, getFollowedAlbums]);

  const unfollowAlbum = useCallback(async (albumId: string) => {
    try {
      if (!token) {
        setError("No authentication token");
        return false;
      }
      const res = await fetch(`${API_URL}/user/followed-albums/${albumId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to unfollow album: ${res.status}`);
      await getFollowedAlbums();
      return true;
    } catch (err: any) {
      console.log("Error unfollowing album:", err);
      setError(err.message || "Failed to unfollow album");
      return false;
    }
  }, [token, getFollowedAlbums]);

  const isAlbumFollowed = useCallback(
    (albumId: string) => followedAlbums.some((album) => album._id === albumId),
    [followedAlbums]
  );

  useEffect(() => {
    void getAlbums();
  }, [getAlbums]);

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      setFollowedAlbums([]);
      return;
    }

    void getFollowedAlbums();
  }, [isReady, token, getFollowedAlbums]);

  return (
    <AlbumContext.Provider
      value={{
        albums,
        followedAlbums,
        loading,
        error,
        getAlbums,
        getFollowedAlbums,
        getAlbumById,
        followAlbum,
        unfollowAlbum,
        isAlbumFollowed,
      }}
    >
      {children}
    </AlbumContext.Provider>
  );
};

export const useAlbum = () => {
  const ctx = useContext(AlbumContext);
  if (!ctx) throw new Error("useAlbum must be used within AlbumProvider");
  return ctx;
};
