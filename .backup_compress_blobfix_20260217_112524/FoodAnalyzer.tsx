// src/components/nutrition/FoodAnalyzer.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Check,
  Edit3,
  AlertCircle,
  ImagePlus,
} from 'lucide-react';
import Webcam from 'react-webcam';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn, compressImage, generateId } from '@/lib/utils';
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

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logFood, remainingCalories, calorieGoal } = useNutrition();

  const addPhoto = useCallback(async (file: File) => {
    if (photos.length >= 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const compressed = await compressImage(file, 800);
    const url = URL.createObjectURL(compressed);
    setPhotos((prev) => [...prev, compressed]);
    setPhotoPreviewUrls((prev) => [...prev, url]);
  }, [photos.length]);

  const captureFromCamera = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Convert base64 to File
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

  const handleAnalyze = async () => {
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
      setError(err.message || 'Failed to analyze food. Please try again.');
      setStep('describe');
      toast.error('Analysis failed. Try again or add more details.');
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

    // Reset
    setStep('capture');
    setPhotos([]);
    setPhotoPreviewUrls([]);
    setNote('');
    setResult(null);
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

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* STEP 1: CAPTURE */}
        {step === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lavender/20">
                  <Camera className="h-8 w-8 text-brand-purple dark:text-brand-lavender" />
                </div>
                <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                  Snap Your Food
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Take up to 5 photos for accurate analysis
                </p>
              </div>

              {/* Photo Preview Grid */}
              {photoPreviewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {photoPreviewUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-xl"
                    >
                      <img
                        src={url}
                        alt={`Food photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-brand-purple/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add more slot */}
                  {photos.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors active:border-brand-purple active:text-brand-purple dark:border-gray-600"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}
                </div>
              )}

              {/* Capture Buttons */}
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => setShowCamera(true)}
                  variant="primary"
                  fullWidth
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  fullWidth
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Next Button */}
              {photos.length > 0 && (
                <Button
                  onClick={() => setStep('describe')}
                  variant="primary"
                  fullWidth
                  className="mt-3"
                >
                  Next: Describe Your Food
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              <p className="mt-3 text-center text-xs text-gray-400">
                {photos.length}/5 photos · Photo 1 required
              </p>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: DESCRIBE */}
        {step === 'describe' && (
          <motion.div
            key="describe"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card>
              <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                How was it prepared?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The more details, the more accurate the analysis
              </p>

              {/* Mini preview */}
              <div className="mt-3 flex gap-2">
                {photoPreviewUrls.map((url, i) => (
                  <div key={i} className="h-16 w-16 overflow-hidden rounded-xl">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="e.g. Fried in olive oil, extra cheese, homemade sauce, white rice not brown, about 2 cups..."
                className={cn(
                  'mt-3 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm',
                  'placeholder:text-gray-400 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20',
                  'dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white',
                  'dark:focus:border-brand-lavender dark:focus:ring-brand-lavender/20'
                )}
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {note.length}/500
              </p>

              {error && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
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
                  className="flex-[2]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze My Food
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: ANALYZING */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <div className="flex flex-col items-center py-8">
                {/* Animated Plate */}
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-24 w-24 rounded-full border-4 border-dashed border-brand-lavender"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                </div>

                <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                  Analyzing Your Food...
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your AI buddy is identifying every item
                </p>

                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                      className="h-2 w-2 rounded-full bg-brand-purple dark:bg-brand-lavender"
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Summary Card */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                  Analysis Results
                </h2>
                <HealthRatingBadge rating={result.healthRating} />
              </div>

              {/* Total Nutrition */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <NutritionBubble
                  label="Calories"
                  value={result.totalCalories}
                  unit="cal"
                  color="text-brand-purple dark:text-brand-lavender"
                />
                <NutritionBubble
                  label="Protein"
                  value={result.totalProtein}
                  unit="g"
                  color="text-blue-500"
                />
                <NutritionBubble
                  label="Carbs"
                  value={result.totalCarbs}
                  unit="g"
                  color="text-orange-500"
                />
                <NutritionBubble
                  label="Fat"
                  value={result.totalFat}
                  unit="g"
                  color="text-yellow-500"
                />
              </div>

              {/* Budget comparison */}
              <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Remaining after this meal
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      remainingCalories - result.totalCalories > 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  >
                    {(remainingCalories - result.totalCalories).toLocaleString()} cal
                  </span>
                </div>
              </div>
            </Card>

            {/* Individual Foods */}
            <Card>
              <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                Foods Identified
              </h3>
              <div className="space-y-3">
                {result.foods.map((food, idx) => (
                  <FoodResultItem key={idx} food={food} />
                ))}
              </div>
            </Card>

            {/* AI Suggestions */}
            {result.suggestions && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-lavender/20">
                    <Sparkles className="h-4 w-4 text-brand-purple dark:text-brand-lavender" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                      Coach Suggestion
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {result.suggestions}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Meal Type Selection */}
            <Card>
              <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                Log to which meal?
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={cn(
                      'rounded-xl py-2.5 text-xs font-semibold capitalize transition-all',
                      selectedMealType === type
                        ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                        : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleAccept} variant="primary" fullWidth>
                <Check className="mr-2 h-4 w-4" />
                Accept & Log
              </Button>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep('describe')} variant="outline" fullWidth>
                <RotateCcw className="mr-2 h-4 w-4" />
                Re-analyze
              </Button>
              <Button onClick={resetAll} variant="ghost" fullWidth>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <Modal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        title="Take Photo"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'environment',
                width: 640,
                height: 480,
              }}
              className="w-full"
              audio={false}
            />
          </div>
          <Button onClick={captureFromCamera} variant="primary" fullWidth size="lg">
            <Camera className="mr-2 h-5 w-5" />
            Capture
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function HealthRatingBadge({ rating }: { rating: number }) {
  const getColor = () => {
    if (rating >= 8) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (rating >= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', getColor())}>
      {rating}/10 Health
    </span>
  );
}

function NutritionBubble({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-brand-surface/50">
      <p className={cn('text-lg font-bold', color)}>
        {value}
        <span className="text-xs font-normal">{unit}</span>
      </p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}

function FoodResultItem({
  food,
}: {
  food: AnalysisResult['foods'][0];
}) {
  const [expanded, setExpanded] = useState(false);

  const getConfidenceLabel = (c: number) => {
    if (c >= 0.8) return { text: 'High', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' };
    if (c >= 0.5) return { text: 'Medium', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' };
    return { text: 'Low', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
  };

  const conf = getConfidenceLabel(food.confidence);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-xl p-2 transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
      >
        <div className="text-left">
          <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
            {food.name}
          </p>
          <p className="text-xs text-gray-400">
            {food.estimatedPortion}
            {food.cookingMethod && ` · ${food.cookingMethod}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-dark dark:text-brand-white">
            {food.calories} cal
          </span>
          <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold', conf.color)}>
            {conf.text}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-2 mb-2 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center text-xs dark:bg-brand-surface/50">
              <div>
                <p className="font-bold text-blue-500">{food.protein}g</p>
                <p className="text-gray-400">Protein</p>
              </div>
              <div>
                <p className="font-bold text-orange-500">{food.carbs}g</p>
                <p className="text-gray-400">Carbs</p>
              </div>
              <div>
                <p className="font-bold text-yellow-500">{food.fat}g</p>
                <p className="text-gray-400">Fat</p>
              </div>
              <div>
                <p className="font-bold text-green-500">{food.fiber}g</p>
                <p className="text-gray-400">Fiber</p>
              </div>
              <div>
                <p className="font-bold text-pink-500">{food.sugar}g</p>
                <p className="text-gray-400">Sugar</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">{food.sodium}mg</p>
                <p className="text-gray-400">Sodium</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}