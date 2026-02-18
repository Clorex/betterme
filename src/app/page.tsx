'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Dumbbell, Brain, Camera, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui/enhanced';
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
    },
    {
      icon: Dumbbell,
      title: 'AI Trainer',
      description: 'Personalized workouts that adapt to your progress',
    },
    {
      icon: Brain,
      title: '24/7 Coach',
      description: 'Your AI buddy answers questions anytime, anywhere',
    },
    {
      icon: Sparkles,
      title: 'Smart Plans',
      description: 'AI-generated meal plans tailored to your goals',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col relative overflow-hidden bg-gradient-to-br from-brand-white via-white to-brand-lavender/10 dark:from-brand-dark dark:via-brand-dark dark:to-brand-purple/20">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-brand-lavender/20 rounded-full blur-3xl" 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-12 pb-8 max-w-md mx-auto">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-purple-mid flex items-center justify-center shadow-2xl shadow-brand-purple/30 mb-4 overflow-hidden"
          >
            <Image
              src="/images/logo.png"
              alt="BetterME Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
          
          <h1 className="text-5xl font-heading font-black text-brand-purple dark:text-brand-lavender tracking-tight">
            Better<span className="text-brand-lavender dark:text-white">ME</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-heading font-bold mb-3 text-gray-800 dark:text-white leading-tight">
            Your AI-Powered Body Transformation Buddy
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">
            Lose weight, build muscle, or get fit with AI that adapts to YOU
          </p>
        </motion.div>

        {/* Feature Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-10"
        >
          <Card className="h-48 flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {React.createElement(features[activeFeature].icon, { 
                className: "w-12 h-12 text-brand-purple mb-3" 
              })}
              <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">
                {features[activeFeature].title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {features[activeFeature].description}
              </p>
            </motion.div>
          </Card>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeFeature === idx 
                    ? 'bg-brand-purple w-6 h-2' 
                    : 'bg-gray-300 w-2 h-2'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-auto space-y-4"
        >
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
            Already have an account? 
            <span className="font-bold ml-1 text-brand-purple dark:text-brand-lavender">
              Login
            </span>
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-400">
            <span>Free Trial</span>
            <span>•</span>
            <span>Secure</span>
            <span>•</span>
            <span>4.9 Rating</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}