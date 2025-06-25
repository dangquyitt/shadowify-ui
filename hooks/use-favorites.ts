import { favoritesApi } from '@/services/api';
import { Video } from '@/types/video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from './use-debounce';

interface UseFavoritesResult {
  favorites: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  search: string;
  setSearch: (query: string) => void;
  addToFavorites: (videoId: string) => Promise<boolean>;
  removeFromFavorites: (videoId: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export default function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Apply debounce to the search term with a 500ms delay
  const debouncedSearch = useDebounce(searchTerm, 500);
  const lastFetchTime = useRef<number>(0);

  const fetchFavorites = useCallback(async (pageNum: number, force: boolean = false) => {
    // Skip refetching if the last fetch was less than 1 second ago,
    // unless force is true
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 1000 && favorites.length > 0) {
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const result = await favoritesApi.getFavorites(pageNum, 10, debouncedSearch);
      lastFetchTime.current = Date.now();
      
      if (pageNum === 1) {
        setFavorites(result.videos);
      } else {
        setFavorites(prev => [...prev, ...result.videos]);
      }
      
      setHasMore(result.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [favorites.length, debouncedSearch]);

  const refresh = useCallback(async () => {
    setPage(1);
    // Make sure loading state is set before refreshing
    setLoading(true);
    await fetchFavorites(1, true); // Use force=true to ensure refresh happens
  }, [fetchFavorites]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchFavorites(nextPage);
    }
  }, [loading, hasMore, page, fetchFavorites]);

  const addToFavorites = useCallback(async (videoId: string) => {
    try {
      const success = await favoritesApi.addToFavorites(videoId);
      if (success) {
        // Refresh favorites list to reflect changes
        await refresh();
      }
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add to favorites');
      return false;
    }
  }, [refresh]);

  const removeFromFavorites = useCallback(async (videoId: string) => {
    try {
      const success = await favoritesApi.removeFromFavorites(videoId);
      if (success) {
        // Remove from local state for immediate UI update
        setFavorites(prev => prev.filter(video => video.id !== videoId));
      }
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove from favorites');
      return false;
    }
  }, []);

  // Reset page and refresh when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setPage(1);
      fetchFavorites(1, true);
    }
  }, [debouncedSearch, fetchFavorites]);

  // Initial fetch
  useEffect(() => {
    fetchFavorites(1);
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    hasMore,
    page,
    search: searchTerm,
    setSearch: setSearchTerm,
    addToFavorites,
    removeFromFavorites,
    loadMore,
    refresh,
  };
}
