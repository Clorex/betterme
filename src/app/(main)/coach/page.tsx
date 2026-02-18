// src/app/(main)/coach/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ChevronDown,
  BookOpen,
  Pill,
  Target,
  Trophy,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNutrition } from '@/hooks/useNutrition';
import { chatWithCoach } from '@/lib/gemini';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import QuickActions from '@/components/coach/QuickActions';
import EducationHub from '@/components/coach/EducationHub';
import SupplementGuide from '@/components/coach/SupplementGuide';
import HabitBuilder from '@/components/coach/HabitBuilder';
import Challenges from '@/components/coach/Challenges';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

type Section = 'chat' | 'learn' | 'supplements' | 'habits' | 'challenges';

export default function CoachPage() {
  const { user, userProfile } = useAuthStore();
  const { totals, calorieGoal, dailyLog } = useNutrition();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) loadChatHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const ref = collection(db, 'users', user.uid, 'chatHistory');
      const q = query(ref, orderBy('timestamp', 'asc'), limit(50));
      const snap = await getDocs(q);
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ChatMessage[];
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading chat:', err);
    }
    setLoadingHistory(false);
  };

  const getTodayData = useCallback(() => {
    return {
      calories: totals.calories,
      protein: totals.protein,
      water: dailyLog.waterIntake?.glasses || 0,
      steps: 0,
      workoutDone: false,
    };
  }, [totals, dailyLog]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !user) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      // Save user message
      const chatRef = collection(db, 'users', user.uid, 'chatHistory');
      await addDoc(chatRef, {
        role: 'user',
        content: text,
        timestamp: serverTimestamp(),
      });

      // Get AI response
      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatWithCoach(text, {
        userProfile,
        todayData: getTodayData(),
        chatHistory,
      });

      const assistantMessage: ChatMessage = {
        id: `temp-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save AI response
      await addDoc(chatRef, {
        role: 'assistant',
        content: response,
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallback: ChatMessage = {
        id: `temp-${Date.now()}-err`,
        role: 'assistant',
        content:
          "I'm having a brief moment — let me get back to you! In the meantime, remember: consistency beats perfection. Keep going! 💪",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sectionTabs = [
    { id: 'chat' as const, label: 'Chat', icon: Bot },
    { id: 'learn' as const, label: 'Learn', icon: BookOpen },
    { id: 'supplements' as const, label: 'Supps', icon: Pill },
    { id: 'habits' as const, label: 'Habits', icon: Target },
    { id: 'challenges' as const, label: 'Challenges', icon: Trophy },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Section Tabs */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-1 overflow-x-auto px-4">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Non-chat sections */}
      {activeSection !== 'chat' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {activeSection === 'learn' && <EducationHub />}
          {activeSection === 'supplements' && <SupplementGuide />}
          {activeSection === 'habits' && <HabitBuilder />}
          {activeSection === 'challenges' && <Challenges />}
        </div>
      )}

      {/* Chat Interface */}
      {activeSection === 'chat' && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pb-2">
            {loadingHistory ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lavender/20">
                  <Bot className="h-8 w-8 text-brand-purple dark:text-brand-lavender" />
                </div>
                <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                  Hey! I&apos;m your AI Coach 👋
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ask me anything about nutrition, workouts, or your progress. I know your data and can give personalized advice.
                </p>

                {/* Quick Actions */}
                <div className="mt-6 w-full">
                  <QuickActions onSelect={(msg) => sendMessage(msg)} />
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-1">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {sending && (
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-lavender/20">
                      <Bot className="h-4 w-4 text-brand-purple dark:text-brand-lavender" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 dark:bg-brand-surface">
                      <div className="flex gap-1">
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="h-2 w-2 rounded-full bg-gray-400"
                        />
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                          className="h-2 w-2 rounded-full bg-gray-400"
                        />
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                          className="h-2 w-2 rounded-full bg-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Quick Actions (when has messages) */}
          {messages.length > 0 && (
            <div className="mb-2">
              <QuickActions onSelect={(msg) => sendMessage(msg)} compact />
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 bg-brand-white pt-2 dark:border-brand-surface dark:bg-brand-dark">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything..."
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm',
                  'placeholder:text-gray-400 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20',
                  'dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white',
                  'max-h-32'
                )}
                style={{ minHeight: 44 }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '44px';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className={cn(
                  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all active:scale-90',
                  input.trim()
                    ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                    : 'bg-gray-200 text-gray-400 dark:bg-brand-surface'
                )}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-2', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-brand-purple text-white'
            : 'bg-brand-lavender/20'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-brand-purple dark:text-brand-lavender" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-tr-md bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
            : 'rounded-tl-md bg-gray-100 text-gray-800 dark:bg-brand-surface dark:text-gray-200'
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-right text-[9px]',
            isUser ? 'text-white/60 dark:text-brand-dark/60' : 'text-gray-400'
          )}
        >
          {message.timestamp instanceof Date
            ? format(message.timestamp, 'h:mm a')
            : message.timestamp?.toDate
            ? format(message.timestamp.toDate(), 'h:mm a')
            : ''}
        </p>
      </div>
    </motion.div>
  );
}