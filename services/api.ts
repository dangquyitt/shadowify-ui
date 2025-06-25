import { DictionaryResponse } from '@/types/dictionary';
import { Segment } from '@/types/segment';
import { Video, VideoDetails } from '@/types/video';
import { getDeviceId } from '@/utils/device-id';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080'; // Use host machine IP for iOS simulator

// Create axios instance with initial configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach device ID to each request
api.interceptors.request.use(
  async (config) => {
    // Get the device ID and add it to the request headers
    const deviceId = await getDeviceId();
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

  /**
   * Fetches a segment by its ID
   * @param segmentId - The ID of the segment to fetch
   * @returns Promise with segment data
   */
  getSegmentById: async (segmentId: string): Promise<{ 
    id: string; 
    created_at: string;
    updated_at: string;
    video_id: string;
    start_sec: number; 
    end_sec: number; 
    content: string;
    cefr: string;
  }> => {
    try {
      const response = await api.get<{
        code: string,
        data: { 
          id: string; 
          created_at: string;
          updated_at: string;
          video_id: string;
          start_sec: number; 
          end_sec: number; 
          content: string;
          cefr: string;
        }
      }>(`/segments/${segmentId}`);
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches a list of words from the server with pagination and search support
   * @param page - The page number to fetch
   * @param pageSize - Number of items per page
   * @param q - Search query
   * @returns Promise with an array of word objects and hasMore flag
   */
  getWords: async (page: number = 1, pageSize: number = 10, q?: string): Promise<{
    words: { 
      id: string; 
      created_at: string;
      updated_at: string;
      meaning_vi: string;
      meaning_en: string;
      user_id: string;
      segment_id: string;
    }[], 
    hasMore: boolean
  }> => {
    try {
      const query = [`page=${page}`, `page_size=${pageSize}`];
      if (q && q.length > 0) query.push(`q=${encodeURIComponent(q)}`);
      const url = `/words?${query.join("&")}`;
      const response = await api.get<{
        code: string,
        data: { 
          id: string; 
          created_at: string;
          updated_at: string;
          meaning_vi: string;
          meaning_en: string;
          user_id: string;
          segment_id: string;
        }[],
        pagination: {
          page: number,
          page_size: number,
          total: number
        }
      }>(url);
      const totalPages = Math.ceil(response.data.pagination.total / response.data.pagination.page_size);
      const hasMore = response.data.pagination.page < totalPages;
      return {
        words: response.data.data,
        hasMore
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Checks if a word exists in the user's personal dictionary
   * @param word - The English word to check
   * @returns Promise with the word details if it exists
   */
  getWordDetails: async (word: string): Promise<{
    id: string; 
    created_at: string;
    updated_at: string;
    meaning_vi: string;
    meaning_en: string;
    user_id: string;
    segment_id: string;
  } | null> => {
    try {
      const response = await api.get<{
        code: string,
        data: { 
          id: string; 
          created_at: string;
          updated_at: string;
          meaning_vi: string;
          meaning_en: string;
          user_id: string;
          segment_id: string;
        }
      }>(`/words/${encodeURIComponent(word)}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
        return null; // Word not found or not in database
      }
      throw error;
    }
  },

  /**
   * Creates a new word 
   * @param meaningEn - The English meaning of the word
   * @param meaningVi - Optional Vietnamese meaning of the word
   * @returns Promise with the created word's ID
   */
  createWord: async (meaningEn: string, meaningVi?: string): Promise<string> => {
    try {
      const payload: { meaning_en: string; meaning_vi?: string } = { 
        meaning_en: meaningEn 
      };
      
      if (meaningVi) {
        payload.meaning_vi = meaningVi;
      }
      
      const response = await api.post<{
        code: string,
        data: string
      }>('/words', payload);
      
      if (response.data.code === 'success') {
        return response.data.data;
      } else {
        throw new Error('Failed to create word');
      }
    } catch (error) {
      console.error('Failed to create word:', error);
      throw error;
    }
  },

  /**
   * Deletes a word from the user's personal dictionary
   * @param word - The English word to delete
   * @returns Promise indicating success or failure
   */
  deleteWord: async (word: string): Promise<boolean> => {
    try {
      const response = await api.delete<{code: string}>(`/words/${encodeURIComponent(word)}`);
      return response.data.code === 'success';
    } catch (error) {
      console.error('Failed to delete word:', error);
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

export const sentencesApi = {
  /**
   * Creates a new sentence associated with a segment
   * @param segmentId - The ID of the segment the sentence is related to
   * @param meaningEn - The English meaning of the sentence
   * @param meaningVi - Optional Vietnamese meaning of the sentence
   * @returns Promise with the created sentence's ID
   */
  createSentence: async (segmentId: string, meaningEn: string, meaningVi?: string): Promise<string> => {
    try {
      const payload: { 
        segment_id: string; 
        meaning_en: string; 
        meaning_vi?: string 
      } = {
        segment_id: segmentId,
        meaning_en: meaningEn
      };
      
      if (meaningVi) {
        payload.meaning_vi = meaningVi;
      }
      
      const response = await api.post<{
        code: string,
        data: string
      }>('/sentences', payload);
      
      if (response.data.code === 'success') {
        return response.data.data;
      } else {
        throw new Error('Failed to create sentence');
      }
    } catch (error) {
      console.error('Failed to create sentence:', error);
      throw error;
    }
  },

  /**
   * Fetches a list of sentences from the server with pagination and search support
   * @param page - The page number to fetch
   * @param pageSize - Number of items per page
   * @param q - Search query
   * @returns Promise with an array of sentence objects and hasMore flag
   */
  getSentences: async (page: number = 1, pageSize: number = 10, q?: string): Promise<{
    sentences: { 
      id: string; 
      created_at: string;
      updated_at: string;
      meaning_en: string;
      meaning_vi: string;
      user_id: string;
      segment_id: string;
    }[], 
    hasMore: boolean
  }> => {
    try {
      const query = [`page=${page}`, `page_size=${pageSize}`];
      if (q && q.length > 0) query.push(`q=${encodeURIComponent(q)}`);
      const url = `/sentences?${query.join("&")}`;
      const response = await api.get<{
        code: string,
        data: { 
          id: string; 
          created_at: string;
          updated_at: string;
          meaning_en: string;
          meaning_vi: string;
          user_id: string;
          segment_id: string;
        }[],
        pagination: {
          page: number,
          page_size: number,
          total: number
        }
      }>(url);
      const totalPages = Math.ceil(response.data.pagination.total / response.data.pagination.page_size);
      const hasMore = response.data.pagination.page < totalPages;
      return {
        sentences: response.data.data,
        hasMore
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches sentence by segment ID
   * @param segmentId - The ID of the segment to get sentence for
   * @returns Promise with a sentence object or null if not found
   */
  getSentencesBySegmentId: async (segmentId: string): Promise<{
    id: string; 
    created_at: string;
    updated_at: string;
    meaning_en: string;
    meaning_vi: string;
    user_id: string;
    segment_id: string;
  } | null> => {
    try {
      const response = await api.get<{
        code: string,
        data: { 
          id: string; 
          created_at: string;
          updated_at: string;
          meaning_en: string;
          meaning_vi: string;
          user_id: string;
          segment_id: string;
        }
      }>(`/sentences/segments/${segmentId}`);
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
        return null; // Sentence not found or not in database
      }
      console.error('Failed to fetch sentence by segment ID:', error);
      throw error;
    }
  },

  /**
   * Deletes sentences by segment ID
   * @param segmentId - The ID of the segment to delete sentences for
   * @returns Promise indicating success or failure
   */
  deleteSentencesBySegmentId: async (segmentId: string): Promise<boolean> => {
    try {
      const response = await api.delete<{code: string}>(`/sentences/segments/${segmentId}`);
      return response.data.code === 'success';
    } catch (error) {
      console.error('Failed to delete sentences by segment ID:', error);
      throw error;
    }
  },

  /**
   * Deletes a sentence by its ID
   * @param id - The ID of the sentence to delete
   * @returns Promise with success boolean
   */
  deleteSentence: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/sentences/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting sentence:', error);
      return false;
    }
  },
};

export default api;
