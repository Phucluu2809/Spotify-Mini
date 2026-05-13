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

type Artist = {
  _id: string;
  name: string;
  image: string;
  bio?: string;
  followers?: number;
  songs?: Song[];
};

type ArtistContextType = {
  followedArtists: Artist[];
  loading: boolean;
  error: string | null;
  getFollowedArtists: () => Promise<void>;
  addFollowedArtist: (artist: Artist) => void;
  removeFollowedArtist: (artistId: string) => void;
  refetch: () => Promise<void>;
};

const ArtistContext = createContext<ArtistContextType | null>(null);

export const ArtistProvider = ({ children }: { children: ReactNode }) => {
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFollowedArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("spotifymini.auth.token");
      if (!token) {
        setFollowedArtists([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/user/followed-artists`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch followed artists");
      }

      const data = await response.json();
      setFollowedArtists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching followed artists:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setFollowedArtists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFollowedArtist = useCallback((artist: Artist) => {
    setFollowedArtists((prev) => {
      const exists = prev.some((a) => a._id === artist._id);
      if (exists) return prev;
      return [...prev, artist];
    });
  }, []);

  const removeFollowedArtist = useCallback((artistId: string) => {
    setFollowedArtists((prev) => prev.filter((a) => a._id !== artistId));
  }, []);

  const refetch = useCallback(async () => {
    await getFollowedArtists();
  }, [getFollowedArtists]);

  useEffect(() => {
    getFollowedArtists();
  }, []);

  return (
    <ArtistContext.Provider
      value={{
        followedArtists,
        loading,
        error,
        getFollowedArtists,
        addFollowedArtist,
        removeFollowedArtist,
        refetch,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error("useArtist must be used within ArtistProvider");
  }
  return context;
};
