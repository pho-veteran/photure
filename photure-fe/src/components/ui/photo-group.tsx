import type { Photo } from '@/services/photoService';
import type { CategoryType } from './category-button';
import { PhotoCard } from './photo-card';

interface PhotoGroupProps {
  groupKey: string;
  photos: Photo[];
  categoryType: CategoryType;
  onPhotoClick: (photo: Photo, globalIndex: number) => void;
  onPhotoDelete: (photoId: string) => void;
  startIndex: number; // For global photo indexing in modal
}

export function PhotoGroup({ 
  groupKey, 
  photos, 
  categoryType, 
  onPhotoClick, 
  onPhotoDelete,
  startIndex 
}: PhotoGroupProps) {
  const formatGroupHeader = (key: string, type: CategoryType) => {
    const date = new Date(key);
    
    switch (type) {
      case 'date':
        return {
          main: date.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          sub: `${photos.length} photo${photos.length !== 1 ? 's' : ''}`
        };
      case 'month':
        return {
          main: date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long' 
          }),
          sub: `${photos.length} photo${photos.length !== 1 ? 's' : ''}`
        };
      case 'year':
        return {
          main: date.getFullYear().toString(),
          sub: `${photos.length} photo${photos.length !== 1 ? 's' : ''}`
        };
      default:
        return {
          main: key,
          sub: `${photos.length} photo${photos.length !== 1 ? 's' : ''}`
        };
    }
  };

  const header = formatGroupHeader(groupKey, categoryType);

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b pb-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {header.main}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {header.sub}
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {photos.length}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo, startIndex + index)}
            onDelete={onPhotoDelete}
          />
        ))}
      </div>
    </div>
  );
} 