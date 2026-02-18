// src/components/ui/Modal.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                  'fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2',
                  'rounded-t-3xl bg-white p-6 shadow-xl dark:bg-brand-dark',
                  'focus:outline-none',
                  className
                )}
              >
                {/* Handle bar */}
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />

                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-brand-surface dark:hover:bg-gray-700"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </Dialog.Close>

                {title && (
                  <Dialog.Title className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                    {title}
                  </Dialog.Title>
                )}

                {description && (
                  <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </Dialog.Description>
                )}

                <div className="mt-4">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}