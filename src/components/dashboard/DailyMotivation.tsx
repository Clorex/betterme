// src/components/dashboard/DailyMotivation.tsx
'use client';

import { useState, useEffect } from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';

const quotes = [
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Andrew Murphy" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "Unknown" },
  { text: "It's not about having time. It's about making time.", author: "Unknown" },
  { text: "Your health is an investment, not an expense.", author: "Unknown" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
];

export default function DailyMotivation() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Use day of year for consistent daily quote
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  const handleShare = async () => {
    const shareText = `"${quote.text}" - ${quote.author}\n\n#BetterME`;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-purple-700 to-brand-purple p-5">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative z-10">
        <p className="text-base font-medium leading-relaxed text-white">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-2 text-sm text-purple-200">— {quote.author}</p>

        <button
          onClick={handleShare}
          className="mt-3 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-all active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </div>
  );
}