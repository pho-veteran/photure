import { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { usePhoto } from '@/hooks/usePhoto';
import type { Photo } from '@/services/photoService';
import type { SortOption } from './sort-button';
import type { CategoryType } from './category-button';
import { PhotoModal } from './photo-modal';
import { PhotoGroup } from './photo-group';
import { Button } from './button';
import { Skeleton } from './skeleton';

interface PhotoGalleryProps {
  sortOption?: SortOption;
  categoryType?: CategoryType;
}

export function PhotoGallery({ sortOption, categoryType = 'date' }: PhotoGalleryProps) {
  const {
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isSignedIn,
    loadInitialPhotos,
    loadMorePhotos,
    deletePhoto: deletePhotoFromStore,
    refresh
  } = usePhoto();

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Group photos by category type
  const groupedPhotos = useMemo(() => {
    if (photos.length === 0) return {};

    const sortedPhotos = [...photos];

    // Apply sorting if provided
    if (sortOption) {
      sortedPhotos.sort((a, b) => {
        let comparison = 0;

        switch (sortOption.field) {
          case 'date':
            comparison = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime();
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          default:
            return 0;
        }

        return sortOption.order === 'desc' ? -comparison : comparison;
      });
    }

    const groups: Record<string, Photo[]> = {};

    sortedPhotos.forEach(photo => {
      const date = new Date(photo.upload_date);
      let groupKey: string;

      switch (categoryType) {
        case 'date':
          groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          break;
        case 'year':
          groupKey = `${date.getFullYear()}-01-01`;
          break;
        default:
          groupKey = date.toISOString().split('T')[0];
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(photo);
    });

    // Sort groups by date (newest first) unless we have a specific sort order
    const sortedGroups: Record<string, Photo[]> = {};
    const groupKeys = Object.keys(groups);
    
    if (sortOption?.field === 'date' && sortOption.order === 'asc') {
      // Sort groups oldest first
      groupKeys.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else {
      // Default: newest first
      groupKeys.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }

    groupKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [photos, categoryType, sortOption]);

  // Load photos only once when user first signs in
  useEffect(() => {
    if (isSignedIn && !hasInitiallyLoaded) {
      loadInitialPhotos();
      setHasInitiallyLoaded(true);
    } else if (!isSignedIn) {
      setHasInitiallyLoaded(false);
    }
  }, [isSignedIn, hasInitiallyLoaded, loadInitialPhotos]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMorePhotos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePhotos]);

  // Handle photo click for modal
  const handlePhotoClick = useCallback((_photo: Photo, globalIndex: number) => {
    setSelectedPhotoIndex(globalIndex);
  }, []);

  // Handle photo deletion
  const handlePhotoDelete = useCallback(async (photoId: string) => {
    try {
      await deletePhotoFromStore(photoId);
      
      // Close modal if the deleted photo was being viewed
      if (selectedPhotoIndex >= 0) {
        const allPhotos = Object.values(groupedPhotos).flat();
        const deletedPhoto = allPhotos[selectedPhotoIndex];
        if (deletedPhoto?.id === photoId) {
          setSelectedPhotoIndex(-1);
        }
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  }, [selectedPhotoIndex, groupedPhotos, deletePhotoFromStore]);

  // Modal navigation handlers
  const handleModalNext = useCallback(() => {
    const allPhotos = Object.values(groupedPhotos).flat();
    if (selectedPhotoIndex < allPhotos.length - 1) {
      setSelectedPhotoIndex(prev => prev + 1);
    }
  }, [selectedPhotoIndex, groupedPhotos]);

  const handleModalPrevious = useCallback(() => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(prev => prev - 1);
    }
  }, [selectedPhotoIndex]);

  // Get all photos as flat array for modal
  const allPhotos = useMemo(() => {
    return Object.values(groupedPhotos).flat();
  }, [groupedPhotos]);

  // Show sign-in message if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Camera className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Photure</h2>
        <p className="text-muted-foreground mb-6">
          Sign in to start uploading and managing your photos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading skeleton for initial load */}
      {isLoading && photos.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && photos.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Camera className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first photo to get started
          </p>
          <Button onClick={refresh} variant="outline">
            Refresh
          </Button>
        </div>
      )}

      {/* Grouped Photos */}
      {photos.length > 0 && (
        <>
          <div className="space-y-12">
            {Object.entries(groupedPhotos).map(([groupKey, groupPhotos], groupIndex) => {
              // Calculate the starting index for this group
              const startIndex = Object.entries(groupedPhotos)
                .slice(0, groupIndex)
                .reduce((acc, [, photos]) => acc + photos.length, 0);

              return (
                <PhotoGroup
                  key={groupKey}
                  groupKey={groupKey}
                  photos={groupPhotos}
                  categoryType={categoryType}
                  onPhotoClick={handlePhotoClick}
                  onPhotoDelete={handlePhotoDelete}
                  startIndex={startIndex}
                />
              );
            })}
          </div>

          {/* Load more button/indicator */}
          {hasMore && (
            <div className="flex justify-center py-8">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading more photos...
                </div>
              ) : (
                <Button onClick={loadMorePhotos} variant="outline">
                  Load more photos
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Photo Modal */}
      <PhotoModal
        photos={allPhotos}
        currentIndex={selectedPhotoIndex}
        isOpen={selectedPhotoIndex >= 0}
        onClose={() => setSelectedPhotoIndex(-1)}
        onNext={handleModalNext}
        onPrevious={handleModalPrevious}
        onDelete={handlePhotoDelete}
      />
    </div>
  );
} 