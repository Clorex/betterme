'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({
  children,
  className,
  hover = true,
  onClick,
  glow = false,
}: CardProps) {
  return (
    <motion.div
      className={cn(
        'relative bg-white dark:bg-brand-surface rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden',
        hover && 'hover:shadow-xl hover:shadow-brand-purple/5 dark:hover:shadow-brand-purple/10 transition-all duration-300',
        glow && 'hover:ring-2 hover:ring-brand-lavender/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('px-5 pt-5 pb-3', className)}>
      {children}
    </div>
  );
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('px-5 pb-5', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-brand-surface/50', className)}>
      {children}
    </div>
  );
}
