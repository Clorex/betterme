// src/components/nutrition/FoodAnalyzer.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  ImagePlus,
} from 'lucide-react';
import Webcam from 'react-webcam';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn, compressImageToFile, generateId } from '@/lib/utils';
import { analyzeFood } from '@/lib/gemini';
import { useNutrition } from '@/hooks/useNutrition';
import { FoodItem } from '@/store/nutritionStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Step = 'capture' | 'describe' | 'analyzing' | 'results';

interface AnalysisResult {
  foods: {
    name: string;
    estimatedPortion: string;
    cookingMethod: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    confidence: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  healthRating: number;
  suggestions: string;
  mealType: string;
}

export default function FoodAnalyzer() {
  const [step, setStep] = useState<Step>('capture');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState<number | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logFood, remainingCalories } = useNutrition();

  /* ===========================
     ✅ Gemini Cooldown Timer
  ============================ */
  useEffect(() => {
    if (cooldown === null) return;

    if (cooldown <= 0) {
      setCooldown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((prev) => (prev ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const addPhoto = useCallback(async (file: File) => {
    if (photos.length >= 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const compressed = await compressImageToFile(file, 800);
    const url = URL.createObjectURL(compressed);
    setPhotos((prev) => [...prev, compressed]);
    setPhotoPreviewUrls((prev) => [...prev, url]);
  }, [photos.length]);

  const captureFromCamera = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `food-${Date.now()}.jpg`, { type: 'image/jpeg' });
        addPhoto(file);
        setShowCamera(false);
      });
  }, [addPhoto]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => addPhoto(file));
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===========================
     ✅ Handle Analyze (Gemini)
  ============================ */
  const handleAnalyze = async () => {
    if (cooldown !== null) return;

    if (photos.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }

    setStep('analyzing');
    setError('');

    try {
      const analysisResult = await analyzeFood(photos, note);
      setResult(analysisResult);
      setStep('results');
    } catch (err: any) {
      console.error('Analysis error:', err);

      if (err.message?.includes('GEMINI_RATE_LIMIT')) {
        setCooldown(180);
        toast.error('Gemini quota exhausted. Try again in 3 minutes.');
        setStep('describe');
        return;
      }

      setError(err.message || 'Failed to analyze food.');
      setStep('describe');
      toast.error('Analysis failed.');
    }
  };

  const handleAccept = async () => {
    if (!result) return;

    const foodItems: FoodItem[] = result.foods.map((food) => ({
      id: generateId(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      quantity: 1,
      unit: 'serving',
      servingSize: food.estimatedPortion,
      aiAnalysis: true,
      confidence: food.confidence,
    }));

    for (const food of foodItems) {
      await logFood(selectedMealType, food);
    }

    toast.success(
      `Meal logged! You have ${remainingCalories - result.totalCalories} cal remaining`
    );

    resetAll();
  };

  const resetAll = () => {
    photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setStep('capture');
    setPhotos([]);
    setPhotoPreviewUrls([]);
    setNote('');
    setResult(null);
    setError('');
  };

  /* ===========================
     ✅ UI
  ============================ */

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* STEP 2: DESCRIBE */}
        {step === 'describe' && (
          <motion.div
            key="describe"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card>
              <h2 className="font-heading text-lg font-bold">
                How was it prepared?
              </h2>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="mt-3 w-full rounded-2xl border p-4 text-sm"
              />

              {error && (
                <div className="mt-2 text-xs text-red-500">{error}</div>
              )}

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => setStep('capture')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>

                <Button
                  onClick={handleAnalyze}
                  variant="primary"
                  className={cn(
                    'flex-[2] transition-all duration-300',
                    cooldown !== null && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={cooldown !== null}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {cooldown !== null
                    ? `Cooling down (${cooldown}s)`
                    : 'Analyze My Food'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}