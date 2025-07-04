import { create } from 'zustand';
import { photoService } from '@/services/photoService';
import type { Photo, PhotoListResponse } from '@/services/photoService';

interface PhotoState {
  // State
  photos: Photo[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
  
  // Actions
  loadPhotos: (getToken: () => Promise<string | null>, page?: number, append?: boolean) => Promise<void>;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
  updatePhoto: (photoId: string, updates: Partial<Photo>) => void;
  refreshPhotos: (getToken: () => Promise<string | null>) => Promise<void>;
  clearPhotos: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

const PHOTOS_PER_PAGE = 20;

export const usePhotoStore = create<PhotoState>((set, get) => ({
  // Initial state
  photos: [],
  isLoading: false,
  isLoadingMore: false,
  error: '',
  hasMore: true,
  currentPage: 0,
  totalCount: 0,

  // Load photos with pagination
  loadPhotos: async (getToken, page = 0, append = false) => {
    try {
      if (!append) {
        set({ isLoading: true, error: '' });
      } else {
        set({ isLoadingMore: true, error: '' });
      }

      const response: PhotoListResponse = await photoService.getPhotos(
        getToken,
        page * PHOTOS_PER_PAGE,
        PHOTOS_PER_PAGE,
        !append // Show toasts only for initial load
      );

      set((state) => ({
        photos: append ? [...state.photos, ...response.photos] : response.photos,
        hasMore: response.photos.length === PHOTOS_PER_PAGE,
        currentPage: page,
        totalCount: response.total,
        isLoading: false,
        isLoadingMore: false,
        error: ''
      }));
    } catch (error) {
      console.error('Failed to load photos:', error);
      set({
        error: 'Failed to load photos. Please try again.',
        isLoading: false,
        isLoadingMore: false
      });
    }
  },

  // Add a new photo (typically after upload)
  addPhoto: (photo) => {
    set((state) => ({
      photos: [photo, ...state.photos], // Add to beginning for newest first
      totalCount: state.totalCount + 1
    }));
  },

  // Remove a photo
  removePhoto: (photoId) => {
    set((state) => ({
      photos: state.photos.filter(photo => photo.id !== photoId),
      totalCount: Math.max(0, state.totalCount - 1)
    }));
  },

  // Update a photo
  updatePhoto: (photoId, updates) => {
    set((state) => ({
      photos: state.photos.map(photo =>
        photo.id === photoId ? { ...photo, ...updates } : photo
      )
    }));
  },

  // Refresh photos (reload from beginning)
  refreshPhotos: async (getToken) => {
    const { loadPhotos } = get();
    set({ currentPage: 0, hasMore: true });
    await loadPhotos(getToken, 0, false);
  },

  // Clear all photos
  clearPhotos: () => {
    set({
      photos: [],
      isLoading: false,
      isLoadingMore: false,
      error: '',
      hasMore: true,
      currentPage: 0,
      totalCount: 0
    });
  },

  // Set error message
  setError: (error) => {
    set({ error, isLoading: false, isLoadingMore: false });
  },

  // Clear error
  clearError: () => {
    set({ error: '' });
  }
})); 