import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  type?: 'card' | 'table' | 'text';
}

export function LoadingSkeleton({ lines = 3, className, type = 'text' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className={cn('rounded-xl bg-card p-6 shadow-sm', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-8 w-1/2 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}
