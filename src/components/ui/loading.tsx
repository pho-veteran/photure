import { cn } from "@/lib/utils";

interface LoadingProps {
  /** Diameter of the spinner in pixels */
  size?: number;
  /** Additional class names */
  className?: string;
}

/**
 * A beautiful loading spinner inspired by shadcn/ui style.
 * Usage:
 *   <Loading />
 *   <Loading size={32} />
 */
export const Loading = ({ size = 24, className }: LoadingProps) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span
        className="inline-block animate-spin rounded-full border-4 border-t-transparent border-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Loading;
