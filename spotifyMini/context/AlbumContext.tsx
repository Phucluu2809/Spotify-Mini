import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
  loading: boolean;
  error: string | null;
  getAlbums: () => Promise<void>;
  getAlbumById: (id: string) => Promise<Album | null>;
};

const AlbumContext = createContext<AlbumContextType | null>(null);

export const AlbumProvider = ({ children }: { children: ReactNode }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
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

  useEffect(() => {
    getAlbums();
  }, []);

  return (
    <AlbumContext.Provider
      value={{
        albums,
        loading,
        error,
        getAlbums,
        getAlbumById,
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
