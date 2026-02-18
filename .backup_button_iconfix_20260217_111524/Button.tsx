// src/components/ui/Button.tsx
'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-brand-purple text-white hover:bg-brand-purple/90 active:bg-brand-purple/80 dark:bg-brand-lavender dark:text-brand-dark dark:hover:bg-brand-lavender/90',
      secondary:
        'bg-brand-lavender/20 text-brand-purple hover:bg-brand-lavender/30 dark:bg-brand-lavender/10 dark:text-brand-lavender',
      outline:
        'border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5 dark:border-brand-lavender dark:text-brand-lavender dark:hover:bg-brand-lavender/5',
      ghost:
        'text-brand-purple hover:bg-brand-purple/5 dark:text-brand-lavender dark:hover:bg-brand-lavender/5',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-xl',
      md: 'h-11 px-5 text-sm rounded-2xl',
      lg: 'h-[52px] px-6 text-base rounded-2xl min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all',
          'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;