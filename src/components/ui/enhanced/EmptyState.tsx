// src/components/ui/enhanced/EmptyState.tsx
'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  emoji?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  emoji 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="w-20 h-20 rounded-full bg-brand-lavender/20 dark:bg-brand-purple/20 flex items-center justify-center mb-4"
      >
        {emoji ? (
          <span className="text-4xl">{emoji}</span>
        ) : (
          <Icon size={32} className="text-brand-purple dark:text-brand-lavender" />
        )}
      </motion.div>
      
      <h3 className="text-lg font-bold text-brand-dark dark:text-brand-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
