// src/components/nutrition/EatingOutGuide.tsx
'use client';

import { useState } from 'react';
import {
  MapPin,
  Search,
  Wine,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNutrition } from '@/hooks/useNutrition';
import { chatWithCoach } from '@/lib/gemini';
import toast from 'react-hot-toast';

const restaurantGuides = [
  {
    name: "McDonald's",
    emoji: '🍔',
    best: [
      { item: 'Grilled Chicken Salad', calories: 350, note: 'Skip the dressing or use half' },
      { item: 'Egg McMuffin', calories: 300, note: 'Solid protein breakfast option' },
      { item: 'Artisan Grilled Chicken Sandwich', calories: 380, note: 'Skip the mayo' },
    ],
    avoid: 'Big Mac (550 cal), Large Fries (490 cal), McFlurry (510 cal)',
  },
  {
    name: 'Subway',
    emoji: '🥪',
    best: [
      { item: '6-inch Turkey Breast', calories: 280, note: 'Load up on veggies' },
      { item: '6-inch Veggie Delite', calories: 230, note: 'Cheapest and lightest' },
      { item: '6-inch Chicken Breast', calories: 320, note: 'Best protein choice' },
    ],
    avoid: 'Footlong anything, Meatball Marinara (960 cal), cookies (200+ cal each)',
  },
  {
    name: 'KFC',
    emoji: '🍗',
    best: [
      { item: 'Grilled Chicken Breast', calories: 210, note: 'Grilled, not fried!' },
      { item: 'Corn on the Cob', calories: 70, note: 'Great low-cal side' },
      { item: 'Green Beans', calories: 25, note: 'Best side option' },
    ],
    avoid: 'Original Recipe bucket, Biscuits (180 cal), Mashed Potatoes with gravy',
  },
  {
    name: 'Chipotle',
    emoji: '🌯',
    best: [
      { item: 'Burrito Bowl (chicken)', calories: 510, note: 'Skip tortilla, add extra veggies' },
      { item: 'Salad + Chicken', calories: 390, note: 'Vinaigrette instead of sour cream' },
      { item: 'Tacos (3) with chicken', calories: 480, note: 'Corn tortillas are better' },
    ],
    avoid: 'Chips & Queso (780 cal), Flour burrito (1000+ cal with all toppings)',
  },
  {
    name: 'Pizza Place',
    emoji: '🍕',
    best: [
      { item: '2 slices thin crust veggie', calories: 420, note: 'Add a side salad' },
      { item: '1 slice + large salad', calories: 350, note: 'Best strategy' },
    ],
    avoid: 'Deep dish (400+ cal per slice), Stuffed crust, Breadsticks',
  },
];

const alcoholGuide = [
  { drink: 'Light Beer', calories: 100, serving: '12 oz' },
  { drink: 'Regular Beer', calories: 150, serving: '12 oz' },
  { drink: 'Red Wine', calories: 125, serving: '5 oz' },
  { drink: 'White Wine', calories: 120, serving: '5 oz' },
  { drink: 'Vodka Soda', calories: 97, serving: '1.5 oz vodka' },
  { drink: 'Gin & Tonic', calories: 171, serving: 'standard' },
  { drink: 'Margarita', calories: 274, serving: 'standard' },
  { drink: 'Piña Colada', calories: 490, serving: 'standard' },
  { drink: 'Long Island Iced Tea', calories: 292, serving: 'standard' },
  { drink: 'Mojito', calories: 217, serving: 'standard' },
];

export default function EatingOutGuide() {
  const { userProfile } = useAuthStore();
  const { remainingCalories } = useNutrition();
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'restaurants' | 'alcohol' | 'social'>('restaurants');

  const handleAiGuide = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const response = await chatWithCoach(
        `I'm going to eat at: ${aiQuery}. I have ${remainingCalories} calories remaining today. My dietary preference is ${userProfile?.profile?.dietaryPrefs || 'none'}. What should I order? Give me 3 specific menu item suggestions with estimated calories, and 1 thing to avoid.`,
        {
          userProfile,
          todayData: { calories: 0 },
          chatHistory: [],
        }
      );
      setAiResponse(response);
    } catch (err) {
      toast.error('Failed to get suggestions');
    }
    setAiLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* AI Restaurant Advisor */}
      <Card>
        <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
          <Sparkles className="mr-1 inline h-4 w-4 text-brand-purple dark:text-brand-lavender" />
          AI Restaurant Advisor
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Tell me where you&apos;re eating and I&apos;ll suggest the best options
        </p>
        <div className="flex gap-2">
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. Olive Garden, local sushi place..."
            onKeyDown={(e) => e.key === 'Enter' && handleAiGuide()}
            className={cn(
              'flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm',
              'focus:border-brand-purple focus:outline-none',
              'dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white'
            )}
          />
          <Button onClick={handleAiGuide} variant="primary" size="sm" loading={aiLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">
          Budget remaining: {remainingCalories} calories
        </p>

        {aiResponse && (
          <div className="mt-3 rounded-xl bg-brand-lavender/10 p-3 dark:bg-brand-lavender/5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {aiResponse}
            </p>
          </div>
        )}
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'restaurants' as const, label: 'Restaurants', icon: MapPin },
          { id: 'alcohol' as const, label: 'Drinks', icon: Wine },
          { id: 'social' as const, label: 'Social', icon: Users },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
                activeSection === s.id
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Restaurant Guides */}
      {activeSection === 'restaurants' && (
        <div className="space-y-2">
          {restaurantGuides.map((rest) => (
            <Card key={rest.name} padding="sm">
              <button
                onClick={() =>
                  setExpandedRestaurant(expandedRestaurant === rest.name ? null : rest.name)
                }
                className="flex w-full items-center justify-between px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rest.emoji}</span>
                  <span className="text-sm font-bold text-brand-dark dark:text-brand-white">
                    {rest.name}
                  </span>
                </div>
                {expandedRestaurant === rest.name ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expandedRestaurant === rest.name && (
                <div className="mt-2 space-y-2 px-2">
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">
                    ✅ Best Choices:
                  </p>
                  {rest.best.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-green-50 p-2.5 dark:bg-green-900/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.item}
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          {item.calories} cal
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500">{item.note}</p>
                    </div>
                  ))}
                  <p className="text-xs font-bold text-red-500">❌ Avoid:</p>
                  <p className="text-xs text-red-400">{rest.avoid}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Alcohol Guide */}
      {activeSection === 'alcohol' && (
        <div className="space-y-4">
          <Card>
            <h3 className="mb-1 text-sm font-bold text-brand-dark dark:text-brand-white">
              🍷 Alcohol & Fitness
            </h3>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Alcohol calories can&apos;t be stored as glycogen — your body prioritizes burning them first, pausing fat burning.
            </p>

            <div className="space-y-1">
              {alcoholGuide.map((drink, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg px-2 py-2 odd:bg-gray-50 dark:odd:bg-brand-surface/30"
                >
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{drink.drink}</span>
                    <span className="ml-2 text-[10px] text-gray-400">({drink.serving})</span>
                  </div>
                  <span className={cn(
                    'text-xs font-bold',
                    drink.calories < 150 ? 'text-green-500' :
                    drink.calories < 250 ? 'text-yellow-500' : 'text-red-500'
                  )}>
                    {drink.calories} cal
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
              💡 Smart Drinking Tips
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li>• Alternate every alcoholic drink with a glass of water</li>
              <li>• Choose spirits + zero-cal mixers (vodka soda, gin + diet tonic)</li>
              <li>• Avoid sugary cocktails — they&apos;re liquid desserts</li>
              <li>• Eat a protein-rich meal before drinking (slows absorption)</li>
              <li>• Set a limit before going out (2-3 drinks max)</li>
              <li>• Alcohol disrupts sleep — expect lower energy tomorrow</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Social Eating */}
      {activeSection === 'social' && (
        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
              <MessageSquare className="mr-1 inline h-4 w-4" />
              What to Say When Pressured
            </h3>
            <div className="space-y-2">
              <SocialScript
                situation='&ldquo;Come on, one slice won&apos;t hurt!&rdquo;'
                response='&ldquo;I already ate, but I&apos;ll definitely have some water! Thanks though.&rdquo;'
              />
              <SocialScript
                situation='&ldquo;You&apos;re not eating enough!&rdquo;'
                response='&ldquo;I ate a big lunch! I&apos;m still pretty full actually.&rdquo;'
              />
              <SocialScript
                situation='&ldquo;Why are you on a diet?&rdquo;'
                response='&ldquo;Not really a diet — just trying to eat more mindfully. I feel so much better!&rdquo;'
              />
              <SocialScript
                situation='&ldquo;Live a little!&rdquo;'
                response='&ldquo;I am! Taking care of myself IS living well. But I&apos;ll definitely join you for dessert.&rdquo;'
              />
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
              🎉 Party Mode Strategy
            </h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <p><strong>Before the event:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Eat a protein-rich snack 1 hour before (reduces hunger)</li>
                <li>Eat light during the day — save calories for the event</li>
                <li>Drink plenty of water throughout the day</li>
              </ul>
              <p className="mt-2"><strong>At the event:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Survey all food before filling your plate</li>
                <li>Use a smaller plate</li>
                <li>Stand away from the food table</li>
                <li>Focus on socializing, not eating</li>
                <li>Choose proteins and veggies first</li>
              </ul>
              <p className="mt-2"><strong>After the event:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Don&apos;t weigh yourself the next morning (water weight!)</li>
                <li>Resume normal eating — don&apos;t restrict</li>
                <li>One social meal doesn&apos;t erase weeks of progress</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SocialScript({ situation, response }: { situation: string; response: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
      <p className="text-xs font-medium text-red-500" dangerouslySetInnerHTML={{ __html: situation }} />
      <p className="mt-1 text-xs text-green-600 dark:text-green-400" dangerouslySetInnerHTML={{ __html: `You: ${response}` }} />
    </div>
  );
}