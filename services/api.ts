import { Segment } from '@/types/segment';
import { Video } from '@/types/video';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080'; // Use host machine IP for iOS simulator

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const videoApi = {
  /**
   * Fetches video segments for a specific video
   * @param videoId - The ID of the video
   * @returns Promise with an array of Segment objects
   */
  getSegments: async (videoId: string): Promise<Segment[]> => {
    try {
      const response = await api.get<{ data: Segment[] }>(`/videos/${videoId}/segments`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
  /**
   * Fetches a list of videos from the server
   * @returns Promise with an array of Video objects
   */
  getVideos: async (): Promise<Video[]> => {
    try {
      const response = await api.get<{ data: Video[] }>('/videos');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches a single video by ID
   * @param id - The ID of the video to fetch
   * @returns Promise with the Video object
   */
  getVideoById: async (id: string): Promise<Video> => {
    try {
      const response = await api.get<{data: Video }>(`/videos/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export const speechApi = {
  /**
   * Transcribes audio and returns the text
   * @param audioBase64 - Base64 encoded audio data
   * @returns Promise with the transcribed text
   */
  transcribe: async (audioBase64: string): Promise<string> => {
    try {
      const response = await api.post<{ code: string; data: { text: string } }>('/stt/transcribe', {
        audio_base64: audioBase64,
      });

      if (response.data.code === 'success') {
        return response.data.data.text;
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw error;
    }
  },
};

export default api;
