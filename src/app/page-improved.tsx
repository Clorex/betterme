// src/app/page-improved.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Dumbbell, Brain, Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/enhanced';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  useTheme();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Camera,
      title: 'Snap & Track',
      description: 'Take a photo of your food and AI analyzes calories instantly',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Dumbbell,
      title: 'AI Trainer',
      description: 'Personalized workouts that adapt to your progress',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: '24/7 Coach',
      description: 'Your AI buddy answers questions anytime, anywhere',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: 'Smart Plans',
      description: 'AI-generated meal plans tailored to your goals',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-brand-white via-white to-brand-lavender/10 dark:from-brand-dark dark:via-brand-dark dark:to-brand-purple/20">
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-brand-lavender/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-brand-purple/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-12 pb-12 max-w-md mx-auto">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-4 overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="BetterME Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <h1 className="text-5xl font-heading font-black text-brand-purple dark:text-brand-lavender tracking-tight">
            Better<span className="text-brand-lavender dark:text-white">ME</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-heading font-bold mb-3 text-gray-800 dark:text-white leading-tight">
            Your AI-Powered Body Transformation Buddy
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">
            Lose weight, build muscle, or get fit with AI that adapts to YOU in real-time
          </p>
        </div>

        {/* Feature Carousel */}
        <div className="mb-12">
          <div className="relative h-48">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <div className="bg-white/80 dark:bg-brand-surface/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-brand-lavender/10 h-full flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    {React.createElement(features[activeFeature].icon, {
                      className: 'w-8 h-8 text-white',
                    })}
                  </div>

                  <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">
                    {features[activeFeature].title}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {features[activeFeature].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeFeature
                    ? 'w-6 h-2 bg-brand-purple'
                    : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-auto space-y-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push('/register')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Get Started Free
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => router.push('/login')}
          >
            Already have an account? Login
          </Button>
        </div>
      </div>
    </div>
  );
}