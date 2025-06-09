import { Video } from '@/types/video';
import { useCallback, useEffect, useState } from 'react';
import { videoApi } from '../services/api';

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
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideo = async (videoId: string) => {
    try {
      setIsLoading(true);
      const data = await videoApi.getVideoById(videoId);
      setVideo(data);
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

  const refetch = () => {
    if (id) {
      return fetchVideo(id);
    }
    return Promise.resolve();
  };

  return { video, isLoading, error, refetch };
};
