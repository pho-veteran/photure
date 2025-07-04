import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { usePhotoStore } from '@/stores/photoStore';
import { photoService } from '@/services/photoService';
import type { Photo } from '@/services/photoService';

export function usePhoto() {
  const { getToken, isSignedIn } = useAuth();
  const {
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentPage,
    totalCount,
    loadPhotos,
    addPhoto,
    removePhoto,
    updatePhoto,
    refreshPhotos,
    clearPhotos,
    setError,
    clearError
  } = usePhotoStore();

  // Load initial photos
  const loadInitialPhotos = useCallback(async () => {
    if (!isSignedIn) {
      clearPhotos();
      return;
    }
    await loadPhotos(getToken, 0, false);
    console.log('Loaded initial photos');
  }, [isSignedIn, getToken, loadPhotos, clearPhotos]);

  // Load more photos for pagination
  const loadMorePhotos = useCallback(async () => {
    if (!isSignedIn || !hasMore || isLoadingMore) return;
    await loadPhotos(getToken, currentPage + 1, true);
  }, [isSignedIn, hasMore, isLoadingMore, getToken, loadPhotos, currentPage]);

  // Upload photo and add to store
  const uploadPhoto = useCallback(async (file: File): Promise<void> => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      const uploadedPhoto = await photoService.uploadPhoto(file, getToken);
      // Convert UploadResponse to Photo format
      const photo: Photo = {
        id: uploadedPhoto.id,
        filename: uploadedPhoto.filename,
        original_name: uploadedPhoto.original_name,
        content_type: uploadedPhoto.content_type,
        size: uploadedPhoto.size,
        user_id: uploadedPhoto.user_id,
        upload_date: uploadedPhoto.upload_date,
        url: uploadedPhoto.url
      };
      addPhoto(photo);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      throw error;
    }
  }, [isSignedIn, getToken, addPhoto]);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      await photoService.deletePhoto(photoId, getToken);
      removePhoto(photoId);
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw error;
    }
  }, [isSignedIn, getToken, removePhoto]);

  // Download photo
  const downloadPhoto = useCallback(async (photoId: string, filename?: string): Promise<void> => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      await photoService.downloadPhoto(photoId, getToken, filename);
    } catch (error) {
      console.error('Failed to download photo:', error);
      throw error;
    }
  }, [isSignedIn, getToken]);

  // Refresh photos
  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    await refreshPhotos(getToken);
  }, [isSignedIn, getToken, refreshPhotos]);

  // Clear photos when user signs out
  const clear = useCallback(() => {
    clearPhotos();
  }, [clearPhotos]);

  return {
    // State
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    isSignedIn,

    // Actions
    loadInitialPhotos,
    loadMorePhotos,
    uploadPhoto,
    deletePhoto,
    downloadPhoto,
    updatePhoto,
    refresh,
    clear,
    setError,
    clearError
  };
} 