'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

interface ButtonProps extends MotionButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean; // ✅ using loading (not isLoading)
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] overflow-hidden';

    const variants = {
      primary:
        'bg-gradient-to-r from-brand-purple to-brand-purple-mid text-white hover:shadow-lg hover:shadow-brand-purple/30 focus:ring-brand-purple',
      secondary:
        'bg-brand-lavender text-brand-purple hover:bg-brand-lavender-dark focus:ring-brand-lavender',
      outline:
        'border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white focus:ring-brand-purple dark:border-brand-lavender dark:text-brand-lavender dark:hover:bg-brand-lavender dark:hover:text-brand-dark',
      ghost:
        'text-brand-purple hover:bg-brand-lavender/20 focus:ring-brand-lavender dark:text-brand-lavender',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs gap-1.5 h-9',
      md: 'px-4 py-2.5 text-sm gap-2 h-11',
      lg: 'px-6 py-3 text-base gap-2.5 h-14',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />

        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon}
        <span className="relative z-10">{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;