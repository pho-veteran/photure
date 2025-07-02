import { Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
} from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { photoService } from '@/services/photoService';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarUpload() {
  const { getToken } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleUpload = async (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    }
  ) => {
    for (const file of files) {
      try {
        await photoService.uploadPhoto(file, getToken);
        options.onSuccess(file);
      } catch (error) {
        options.onError(file, error as Error);
      }
    }
  };

  if (isCollapsed) {
    // Show compact upload button when sidebar is collapsed
    return (
      <div className="p-2">
        <FileUpload
          accept="image/*"
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB
          onUpload={handleUpload}
          multiple
        >
          <FileUploadTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-full h-10 opacity-70 hover:opacity-100"
              title="Upload Photos"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </FileUploadTrigger>
        </FileUpload>
      </div>
    );
  }

  // Show full upload interface when sidebar is expanded
  return (
    <div className="p-4 opacity-75">
      <FileUpload
        accept="image/*"
        maxFiles={10}
        maxSize={10 * 1024 * 1024} // 10MB
        onUpload={handleUpload}
        multiple
      >
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Upload Photos</h3>

          <FileUploadDropzone className="min-h-[120px] cursor-pointer border-dashed border-muted-foreground/50 hover:border-muted-foreground/70">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Drop photos here</p>
                <p className="text-xs text-muted-foreground/70">
                  or click to browse
                </p>
              </div>
            </div>
          </FileUploadDropzone>

          <FileUploadList className="space-y-2" />
        </div>
      </FileUpload>
    </div>
  );
}

 