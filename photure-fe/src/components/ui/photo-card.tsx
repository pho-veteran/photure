import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MoreHorizontal, Download, Trash2, Eye } from 'lucide-react';
import { photoService } from '@/services/photoService';
import type { Photo } from '@/services/photoService';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Skeleton } from './skeleton';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  onDelete?: (photoId: string) => void;
}

export function PhotoCard({ photo, onClick, onDelete }: PhotoCardProps) {
  const { getToken } = useAuth();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const src = await photoService.createAuthenticatedImageSrc(photo.id, getToken);
        setImageSrc(src);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup object URL when component unmounts
    return () => {
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [photo.id, getToken]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await photoService.downloadPhoto(photo.id, getToken, photo.original_name);
    } catch (err) {
      console.error('Failed to download photo:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await photoService.deletePhoto(photo.id, getToken);
      onDelete?.(photo.id);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Photo Image */}
      <img
        src={imageSrc}
        alt={photo.original_name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />
      )}
      
      {/* Top Actions */}
      <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Bottom Info */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm font-medium truncate">{photo.original_name}</p>
        <div className="flex items-center justify-between text-xs opacity-80 mt-1">
          <span>{formatDate(photo.upload_date)}</span>
          <span>{formatFileSize(photo.size)}</span>
        </div>
      </div>
    </div>
  );
} 