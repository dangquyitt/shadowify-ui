import { Video, VideoDetails } from '@/types/video';
import { EVENTS, eventEmitter } from '@/utils/event-emitter';
import { useCallback, useEffect, useState } from 'react';
import { favoritesApi, videoApi } from '../services/api';

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const pageSize = 10;

  const fetchVideos = async (currentPage: number = 1, replace: boolean = true) => {
    try {
      if (currentPage === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const result = await videoApi.getVideos(currentPage, pageSize);
      
      if (replace) {
        setVideos(result.videos);
      } else {
        setVideos(prev => [...prev, ...result.videos]);
      }
      
      setHasMore(result.hasMore);
      setPage(currentPage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch videos'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchVideos(page + 1, false);
    }
  }, [isLoadingMore, hasMore, page]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const refetch = () => {
    return fetchVideos(1, true);
  };

  return { 
    videos, 
    isLoading, 
    error, 
    refetch, 
    loadMore, 
    hasMore, 
    isLoadingMore 
  };
};

export const useVideo = (id: string) => {
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const fetchVideo = async (videoId: string) => {
    try {
      setIsLoading(true);
      const data = await videoApi.getVideoById(videoId) as VideoDetails;
      setVideo(data);
      setIsFavorite(data.is_favorite || false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch video'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideo(id);
    }
  }, [id]);

  const toggleFavorite = async () => {
    if (!video) return;
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await favoritesApi.removeFromFavorites(video.id);
      } else {
        // Add to favorites
        await favoritesApi.addToFavorites(video.id);
      }
      
      // Update state
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      setVideo(prev => prev ? {...prev, is_favorite: newFavoriteState} : null);
      
      // Emit event so other components can react to this change
      eventEmitter.emit(EVENTS.FAVORITE_CHANGED, {
        videoId: video.id,
        isFavorite: newFavoriteState
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const refetch = () => {
    if (id) {
      return fetchVideo(id);
    }
    return Promise.resolve();
  };

  return { video, isLoading, error, refetch, isFavorite, toggleFavorite };
};
