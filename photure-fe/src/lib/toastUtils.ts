import { toast, type Id, type ToastOptions } from 'react-toastify';

// Default toast options
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast utility functions
export const toastUtils = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, autoClose: 3500, ...options });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, { ...defaultOptions, ...options });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, { ...defaultOptions, autoClose: 3000, ...options });
  },

  /**
   * Show a loading toast
   */
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultOptions, autoClose: false, ...options });
  },

  /**
   * Update an existing toast
   */
  update: (toastId: Id, options: ToastOptions & { render: string }) => {
    return toast.update(toastId, { ...defaultOptions, ...options });
  },

  /**
   * Dismiss a toast
   */
  dismiss: (toastId?: Id) => {
    return toast.dismiss(toastId);
  },

  /**
   * Update a loading toast to success
   */
  updateToSuccess: (toastId: Id, message: string, options?: ToastOptions) => {
    return toast.update(toastId, {
      render: message,
      type: 'success',
      isLoading: false,
      autoClose: 2000,
      ...options,
    });
  },

  /**
   * Update a loading toast to error
   */
  updateToError: (toastId: Id, message: string, options?: ToastOptions) => {
    return toast.update(toastId, {
      render: message,
      type: 'error',
      isLoading: false,
      autoClose: 3500,
      ...options,
    });
  },

  /**
   * Update a loading toast with progress
   */
  updateWithProgress: (toastId: Id, message: string, progress?: number, options?: ToastOptions) => {
    return toast.update(toastId, {
      render: message,
      type: 'info',
      isLoading: true,
      progress: progress ? progress / 100 : undefined,
      ...options,
    });
  },
};

// Predefined messages for common operations
export const toastMessages = {
  auth: {
    required: 'Authentication required. Please sign in.',
    accessDenied: 'Access denied. You do not have permission to perform this action.',
    expired: 'Your session has expired. Please sign in again.',
  },
  network: {
    error: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    badRequest: 'Bad request. Please check your input.',
  },
  photos: {
    uploadStart: (filename: string) => `Uploading ${filename}...`,
    uploadProgress: (filename: string, progress: number) => `Uploading ${filename}: ${progress}%`,
    uploadSuccess: (filename: string) => `✅ ${filename} uploaded successfully!`,
    uploadError: (filename: string) => `❌ Failed to upload ${filename}`,
    
    loadStart: 'Loading photos...',
    loadSuccess: (count: number) => `📸 Loaded ${count} photos`,
    loadError: 'Failed to load photos',
    
    downloadStart: (filename: string) => `Downloading ${filename}...`,
    downloadSuccess: (filename: string) => `📥 ${filename} downloaded successfully!`,
    downloadError: (filename: string) => `❌ Failed to download ${filename}`,
    
    deleteStart: 'Deleting photo...',
    deleteSuccess: '🗑️ Photo deleted successfully!',
    deleteError: 'Failed to delete photo',
    
    imageLoadError: 'Failed to load image',
    imageAuthRequired: 'Authentication required to load image',
  },
};

export default toastUtils; 