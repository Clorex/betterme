// src/components/ui/Card.tsx
'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, clickable = false, onClick, padding = 'md' }, ref) => {
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-2xl',
          paddingClasses[padding],
          // Light mode
          'bg-white shadow-sm',
          // Dark mode - glassmorphism
          'dark:bg-brand-surface/60 dark:backdrop-blur-xl dark:border dark:border-white/5',
          // Clickable
          clickable && 'cursor-pointer transition-all active:scale-[0.98] hover:shadow-md dark:hover:bg-brand-surface/80',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;