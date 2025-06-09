import { Segment } from '@/types/segment';
import { useEffect, useState } from 'react';
import { videoApi } from '../services/api';

export const useSegments = (videoId: string) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSegments = async () => {
    try {
      setIsLoading(true);
      const data = await videoApi.getSegments(videoId);
      setSegments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch segments'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchSegments();
    }
  }, [videoId]);

  return {
    segments,
    isLoading,
    error,
    refetch: fetchSegments,
  };
};
