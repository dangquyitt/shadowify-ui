import { DictionaryResponse } from '@/types/dictionary';
import { Segment } from '@/types/segment';
import { Video, VideoDetails } from '@/types/video';
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
   * Creates a new video from YouTube URL
   * @param youtubeRawInput - The YouTube video URL
   * @returns Promise with the ID of the created video or throws an error
   */
  createVideo: async (youtubeRawInput: string): Promise<string> => {
    try {
      const response = await api.post('/videos', { youtubeRawInput });
      if (response.data.code === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.errors[0]?.message || 'Unknown error');
      }
    } catch (error: any) {
      if (error.response?.data?.errors?.[0]?.message) {
        throw new Error(error.response.data.errors[0].message);
      }
      throw error;
    }
  },
  
  /**
   * Fetches categories from the server
   * @returns Promise with an array of category strings
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<{ code: string, data: string[] }>('/videos/categories');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

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
   * Fetches a list of videos from the server with pagination support
   * @param page - The page number to fetch
   * @param pageSize - Number of items per page
   * @returns Promise with an array of Video objects
   */
  getVideos: async (page: number = 1, pageSize: number = 10, q?: string, type?: string): Promise<{videos: Video[], hasMore: boolean}> => {
    try {
      // Add query param 'q' and 'type' if provided
      const query = [`page=${page}`, `page_size=${pageSize}`];
      if (q && q.length > 0) query.push(`q=${encodeURIComponent(q)}`);
      if (type && type.length > 0) query.push(`type=${encodeURIComponent(type)}`);
      const url = `/videos?${query.join("&")}`;
      const response = await api.get<{ 
        code: string,
        data: Video[], 
        pagination: { 
          page: number, 
          page_size: number, 
          total: number 
        } 
      }>(url);
      // Calculate if there are more pages based on total items and current page
      const totalPages = Math.ceil(response.data.pagination.total / response.data.pagination.page_size);
      const hasMore = response.data.pagination.page < totalPages;
      return {
        videos: response.data.data,
        hasMore
      };
    } catch (error) {
      throw error;
    }
  },

  getPopularVideos: async (): Promise<Video[]> => {
    try {
      const response = await api.get<{ 
        code: string,
        data: Video[]
      }>('/videos?page=1&page_size=5&type=popular');
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch popular videos:', error);
      throw error;
    }
  },

  /**
   * Fetches a single video by ID
   * @param id - The ID of the video to fetch
   * @returns Promise with the VideoDetails object including is_favorite status
   */
  getVideoById: async (id: string): Promise<VideoDetails> => {
    try {
      const response = await api.get<{data: VideoDetails }>(`/videos/${id}`);
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

export const dictionaryApi = {
  /**
   * Fetches word definition from Dictionary API
   * @param word - The word to look up
   * @param language - Language code (default: 'en' for English)
   * @returns Promise with dictionary data
   */
  getWordDefinition: async (word: string, language: string = 'en'): Promise<DictionaryResponse> => {
    try {
      const response = await axios.get<DictionaryResponse>(
        `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word.toLowerCase())}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`No definition found for "${word}"`);
      }
      throw new Error('Failed to fetch word definition');
    }
  },
};

export const translateApi = {
  /**
   * Translates text using the API
   * @param text - The text to translate
   * @returns Promise with the translated text
   */
  translateText: async (text: string): Promise<string> => {
    try {
      const response = await api.post<{ code: string; data: { text: string } }>(
        "/translate",
        { text }
      );

      if (response.data.code === "success") {
        return response.data.data.text;
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Translation API error:", error);
      throw error;
    }
  },
};

export const favoritesApi = {
  /**
   * Fetches user's favorite videos with pagination support
   * @param page - The page number to fetch
   * @param pageSize - Number of items per page
   * @returns Promise with an array of Video objects and pagination info
   */
  getFavorites: async (page: number = 1, pageSize: number = 10): Promise<{videos: Video[], hasMore: boolean}> => {
    try {
      const response = await api.get<{ 
        code: string,
        data: Video[], 
        pagination: { 
          page: number, 
          page_size: number, 
          total: number 
        } 
      }>(`/videos/favorites?page=${page}&page_size=${pageSize}`);
      
      // Calculate if there are more pages based on total items and current page
      const totalPages = Math.ceil(response.data.pagination.total / response.data.pagination.page_size);
      const hasMore = response.data.pagination.page < totalPages;
      return {
        videos: response.data.data,
        hasMore
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adds a video to user's favorites
   * @param videoId - The ID of the video to add to favorites
   * @returns Promise indicating success or failure
   */
  addToFavorites: async (videoId: string): Promise<boolean> => {
    try {
      const response = await api.post<{code: string}>(`/favorites/${videoId}`);
      return response.data.code === 'success';
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  },

  /**
   * Removes a video from user's favorites
   * @param videoId - The ID of the video to remove from favorites
   * @returns Promise indicating success or failure
   */
  removeFromFavorites: async (videoId: string): Promise<boolean> => {
    try {
      const response = await api.delete<{code: string}>(`/favorites/${videoId}`);
      return response.data.code === 'success';
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }
};

export default api;
