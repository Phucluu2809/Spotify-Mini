import {
  createContext, useCallback, useContext,
  useEffect, useState, type ReactNode
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../app/config/api';

type Song = {
  _id: string; title: string; artist: string;
  album: string; image: string; audio: string; duration: number;
};

type FavoriteContextType = {
  favorites: Song[];
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (songId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
};

const FavoriteContext = createContext<FavoriteContextType | null>(null);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('spotifymini.auth.token');
      if (!token) return;
      const res = await fetch(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavorites(data);
        setFavoriteIds(new Set(data.map((s: Song) => s._id)));
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleFavorite = async (songId: string) => {
    try {
      const token = await SecureStore.getItemAsync('spotifymini.auth.token');
      if (!token) return;

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(songId)) {
          next.delete(songId);
        } else {
          next.add(songId);
        }
        return next;
      });

      await fetch(`${API_URL}/favorites/${songId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reload to sync state.
      await loadFavorites();
    } catch (err) {
      console.log(err);
    }
  };

  const isFavorite = (id: string) => favoriteIds.has(id);

  return (
    <FavoriteContext.Provider value={{ favorites, favoriteIds, isFavorite, toggleFavorite, loadFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  const ctx = useContext(FavoriteContext);
  if (!ctx) throw new Error('useFavorite must be used within FavoriteProvider');
  return ctx;
};
