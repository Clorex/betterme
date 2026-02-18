// src/hooks/useSteps.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

interface StepData {
  steps: number;
  goal: number;
  distance: number;
  caloriesBurned: number;
  isSupported: boolean;
  hourlyBreakdown: number[];
  addSteps: (count: number) => void;
}

export function useSteps(): StepData {
  const { user, userProfile } = useAuthStore();
  const [steps, setSteps] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = 1.2; // acceleration threshold for step detection
  const lastStepTime = useRef(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hourlyBreakdown, setHourlyBreakdown] = useState<number[]>(
    new Array(24).fill(0)
  );

  const goal = userProfile?.profile?.schedule?.stepGoal || 10000;
  const heightCm = userProfile?.profile?.height || 170;
  const weightKg = userProfile?.metrics?.currentWeight || 70;

  // Stride length estimation (cm)
  const strideLength = heightCm * 0.415;
  const distance = (steps * strideLength) / 100000; // km
  const caloriesBurned = Math.round(steps * 0.04 * (weightKg / 70));

  // Load today's steps from Firebase
  useEffect(() => {
    if (!user) return;
    const loadSteps = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const stepDoc = await getDoc(doc(db, 'users', user.uid, 'steps', today));
        if (stepDoc.exists()) {
          const data = stepDoc.data();
          setSteps(data.steps || 0);
          setHourlyBreakdown(data.hourlyBreakdown || new Array(24).fill(0));
        }
      } catch (err) {
        console.error('Error loading steps:', err);
      }
    };
    loadSteps();
  }, [user]);

  // Save steps to Firebase periodically
  const saveSteps = useCallback(
    async (currentSteps: number, breakdown: number[]) => {
      if (!user) return;
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'steps', today),
          {
            steps: currentSteps,
            goal,
            distance: (currentSteps * strideLength) / 100000,
            caloriesBurned: Math.round(currentSteps * 0.04 * (weightKg / 70)),
            hourlyBreakdown: breakdown,
            date: today,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error saving steps:', err);
      }
    },
    [user, goal, strideLength, weightKg]
  );

  // Step detection using DeviceMotion API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasMotion = 'DeviceMotionEvent' in window;
    setIsSupported(hasMotion);

    if (!hasMotion) return;

    const requestPermission = async () => {
      // iOS 13+ requires permission
      if (
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (
            DeviceMotionEvent as any
          ).requestPermission();
          if (permission !== 'granted') {
            setIsSupported(false);
            return false;
          }
        } catch {
          setIsSupported(false);
          return false;
        }
      }
      return true;
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const { x, y, z } = acc;
      const last = lastAcceleration.current;

      const delta = Math.sqrt(
        Math.pow((x || 0) - last.x, 2) +
        Math.pow((y || 0) - last.y, 2) +
        Math.pow((z || 0) - last.z, 2)
      );

      lastAcceleration.current = { x: x || 0, y: y || 0, z: z || 0 };

      const now = Date.now();
      // Minimum 250ms between steps (max ~4 steps/sec = running pace)
      if (delta > stepThreshold && now - lastStepTime.current > 250) {
        lastStepTime.current = now;
        const hour = new Date().getHours();

        setSteps((prev) => {
          const newSteps = prev + 1;
          return newSteps;
        });

        setHourlyBreakdown((prev) => {
          const updated = [...prev];
          updated[hour] = (updated[hour] || 0) + 1;
          return updated;
        });
      }
    };

    requestPermission().then((granted) => {
      if (granted) {
        window.addEventListener('devicemotion', handleMotion);
      }
    });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // Auto-save every 5 minutes
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      saveSteps(steps, hourlyBreakdown);
    }, 5 * 60 * 1000);

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [steps, hourlyBreakdown, saveSteps]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveSteps(steps, hourlyBreakdown);
    };
  }, [steps, hourlyBreakdown, saveSteps]);

  const addSteps = useCallback((count: number) => {
    const hour = new Date().getHours();
    setSteps((prev) => prev + count);
    setHourlyBreakdown((prev) => {
      const updated = [...prev];
      updated[hour] = (updated[hour] || 0) + count;
      return updated;
    });
  }, []);

  return {
    steps,
    goal,
    distance,
    caloriesBurned,
    isSupported,
    hourlyBreakdown,
    addSteps,
  };
}