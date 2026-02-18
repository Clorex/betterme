// src/components/ui/Loading.tsx
'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ fullScreen = false, size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-brand-purple border-t-transparent dark:border-brand-lavender dark:border-t-transparent',
          sizes[size]
        )}
      />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-white dark:bg-brand-dark">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
}

export default Loading;