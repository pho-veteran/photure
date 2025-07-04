import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, ChevronLeft, ChevronRight, Download, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { photoService } from '@/services/photoService';
import type { Photo } from '@/services/photoService';
import { Button } from './button';
import { Skeleton } from './skeleton';

interface PhotoModalProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete?: (photoId: string) => void;
}

export function PhotoModal({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onDelete,
}: PhotoModalProps) {
  const { getToken } = useAuth();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentPhoto = photos[currentIndex];

  // Load current image
  useEffect(() => {
    if (!currentPhoto || !isOpen) return;

    const loadImage = async () => {
      setIsLoading(true);
      setError(false);
      setZoom(1);
      setRotation(0);

      try {
        const src = await photoService.createAuthenticatedImageSrc(currentPhoto.id, getToken);
        setImageSrc(src);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup previous image URL
    return () => {
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [currentPhoto?.id, getToken, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onPrevious();
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) onNext();
          break;
        case '=':
        case '+':
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.25, 0.25));
          break;
        case '0':
          setZoom(1);
          setRotation(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNext, onPrevious]);

  const handleDownload = async () => {
    if (!currentPhoto) return;
    try {
      await photoService.downloadPhoto(currentPhoto.id, getToken, currentPhoto.original_name);
    } catch (err) {
      console.error('Failed to download photo:', err);
    }
  };

  const handleDelete = async () => {
    if (!currentPhoto || !onDelete) return;
    
    await onDelete(currentPhoto.id);
    
    // Move to next photo or close if it was the last one
    if (photos.length === 1) {
      onClose();
    } else if (currentIndex === photos.length - 1) {
      onPrevious();
    } else {
      onNext();
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="text-lg font-medium">{currentPhoto.original_name}</h3>
              <p className="text-sm text-white/70">
                {currentIndex + 1} of {photos.length} • {formatDate(currentPhoto.upload_date)} • {formatFileSize(currentPhoto.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.25}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-sm text-white/70 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-white hover:bg-red-500/20"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
      
      {currentIndex < photos.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Image Container */}
      <div className="relative max-w-full max-h-full p-20 flex items-center justify-center">
        {isLoading && (
          <Skeleton className="w-96 h-96 bg-white/10" />
        )}
        
        {error && (
          <div className="text-center text-white">
            <p className="text-xl mb-2">Failed to load image</p>
            <p className="text-white/70">Try refreshing or check your connection</p>
          </div>
        )}
        
        {!isLoading && !error && imageSrc && (
          <img
            src={imageSrc}
            alt={currentPhoto.original_name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? 'grab' : 'default',
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
} 