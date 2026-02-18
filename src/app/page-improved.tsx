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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-12 pb-8 max-w-md mx-auto">

        {/* Logo */}
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

          <h1 className="text-5xl font-heading font-black text-brand-purple tracking-tight">
            Better<span className="text-brand-lavender">ME</span>
          </h1>
        </div>

        {/* Feature Carousel */}
        <div className="mb-10">
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
                <div className="bg-white rounded-3xl p-6 shadow-xl h-full flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    {React.createElement(features[activeFeature].icon, {
                      className: 'w-8 h-8 text-white',
                    })}
                  </div>

                  <h3 className="text-lg font-bold mb-2">
                    {features[activeFeature].title}
                  </h3>

                  <p className="text-sm text-gray-500">
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

        {/* CTA */}
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