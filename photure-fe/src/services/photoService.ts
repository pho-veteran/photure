import { makeAuthenticatedRequest, createAuthenticatedApi } from './api';
import type { AxiosInstance } from 'axios';
import { toastUtils, toastMessages } from '@/lib/toastUtils';
import type { Id } from 'react-toastify';

export interface Photo {
  id: string;
  filename: string;
  original_name: string;
  content_type: string;
  size: number;
  user_id: string;
  upload_date: string;
  url: string;
}

export interface PhotoListResponse {
  photos: Photo[];
  total: number;
}

export interface UploadResponse {
  id: string;
  filename: string;
  original_name: string;
  content_type: string;
  size: number;
  user_id: string;
  upload_date: string;
  url: string;
}

// Photo service functions that work with Clerk's getToken
export const photoService = {
  /**
   * Upload a photo file
   */
  async uploadPhoto(
    file: File, 
    getToken: () => Promise<string | null>
  ): Promise<UploadResponse> {
    const uploadToast = toastUtils.loading(toastMessages.photos.uploadStart(file.name));
    
    try {
      const result = await makeAuthenticatedRequest(
        getToken,
        async (api: AxiosInstance) => {
          const formData = new FormData();
          formData.append('file', file);

          return api.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                toastUtils.updateWithProgress(
                  uploadToast,
                  toastMessages.photos.uploadProgress(file.name, progress),
                  progress
                );
              }
            },
          });
        }
      );

      // Success toast removed - upload completion is indicated by UI update
      toastUtils.dismiss(uploadToast);

      return result;
    } catch (error) {
      toastUtils.updateToError(uploadToast, toastMessages.photos.uploadError(file.name));
      throw error;
    }
  },

  /**
   * Get list of photos for the authenticated user
   */
  async getPhotos(
    getToken: () => Promise<string | null>,
    skip: number = 0, 
    limit: number = 20,
    showToasts: boolean = true
  ): Promise<PhotoListResponse> {
    let loadingToast: Id | null = null;
    
    if (showToasts) {
      loadingToast = toastUtils.loading(toastMessages.photos.loadStart);
    }

    try {
      const result = await makeAuthenticatedRequest(
        getToken,
        async (api: AxiosInstance) => {
          return api.get('/api/photos', {
            params: { skip, limit },
          });
        }
      );

      if (showToasts && loadingToast) {
        // Success toast removed - photo loading is indicated by UI update
        toastUtils.dismiss(loadingToast);
      }

      return result;
    } catch (error) {
      if (showToasts && loadingToast) {
        toastUtils.updateToError(loadingToast, toastMessages.photos.loadError);
      }
      throw error;
    }
  },

  /**
   * Get photo URL for serving (this creates a URL that will work with auth)
   */
  getPhotoUrl(photoId: string): string {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    // For serving images, we'll need to include the token in the request
    // This returns a URL that can be used with an Authorization header
    return `${baseURL}/api/serve/${photoId}`;
  },

  /**
   * Download photo file
   */
  async downloadPhoto(
    photoId: string, 
    getToken: () => Promise<string | null>,
    filename?: string
  ): Promise<Blob> {
    const downloadToast = toastUtils.loading(toastMessages.photos.downloadStart(filename || 'photo'));

    try {
      const responseData = await makeAuthenticatedRequest(
        getToken,
        async (api: AxiosInstance) => {
          return api.get(`/api/serve/${photoId}`, {
            responseType: 'blob',
          });
        }
      );

      // Create download link
      const blob = new Blob([responseData]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `photo-${photoId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toastUtils.updateToSuccess(downloadToast, toastMessages.photos.downloadSuccess(filename || 'Photo'));

      return blob;
    } catch (error) {
      toastUtils.updateToError(downloadToast, toastMessages.photos.downloadError(filename || 'photo'));
      throw error;
    }
  },

  /**
   * Delete a photo
   */
  async deletePhoto(
    photoId: string, 
    getToken: () => Promise<string | null>
  ): Promise<{ message: string }> {
    const deleteToast = toastUtils.loading(toastMessages.photos.deleteStart);

    try {
      const result = await makeAuthenticatedRequest(
        getToken,
        async (api: AxiosInstance) => {
          return api.delete(`/api/photos/${photoId}`);
        }
      );

      toastUtils.updateToSuccess(deleteToast, toastMessages.photos.deleteSuccess);

      return result;
    } catch (error) {
      toastUtils.updateToError(deleteToast, toastMessages.photos.deleteError);
      throw error;
    }
  },

  /**
   * Create an authenticated image element for displaying photos
   * This is a helper for rendering images that require authentication
   */
  async createAuthenticatedImageSrc(
    photoId: string,
    getToken: () => Promise<string | null>,
    showErrorToast: boolean = false
  ): Promise<string> {
    try {
      const token = await getToken();
      if (!token) {
        const errorMsg = 'No authentication token available';
        if (showErrorToast) {
          toastUtils.error(toastMessages.photos.imageAuthRequired);
        }
        throw new Error(errorMsg);
      }

      const api = createAuthenticatedApi(token);
      const response = await api.get(`/api/serve/${photoId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      return URL.createObjectURL(blob);
    } catch (error) {
      if (showErrorToast) {
        toastUtils.error(toastMessages.photos.imageLoadError);
      }
      console.error('Failed to create authenticated image source:', error);
      throw error;
    }
  }
};

export default photoService; 