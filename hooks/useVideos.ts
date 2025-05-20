import { Video } from '@/types/video';
import { useEffect, useState } from 'react';
import { videoApi } from '../services/api';

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videoApi.getVideos();
      setVideos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch videos'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const refetch = () => {
    return fetchVideos();
  };

  return { videos, isLoading, error, refetch };
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
