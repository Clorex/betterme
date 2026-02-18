'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Trophy, UserPlus, 
  MessageCircle, Heart, Share2, Filter,
  Plus, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';
import Feed from '@/components/community/Feed';
import TransformationStories from '@/components/community/TransformationStories';
import ChallengeBoard from '@/components/community/ChallengeBoard';
import AccountabilityPartner from '@/components/community/AccountabilityPartner';
import Leaderboards from '@/components/community/Leaderboards';
import CreatePostModal from '@/components/community/CreatePostModal';

const tabs = [
  { id: 'feed', label: 'Feed', icon: MessageCircle },
  { id: 'stories', label: 'Stories', icon: TrendingUp },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'partner', label: 'Partner', icon: UserPlus },
  { id: 'leaderboard', label: 'Rankings', icon: Users },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-brand-white/80 dark:bg-brand-dark/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-montserrat font-bold text-brand-dark dark:text-brand-white">
              Community
            </h1>
            {activeTab === 'feed' && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-purple text-white rounded-full text-sm font-medium hover:bg-brand-purple/90 transition-colors"
              >
                <Plus size={16} />
                Post
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'bg-gray-100 dark:bg-brand-surface text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'feed' && <Feed />}
          {activeTab === 'stories' && <TransformationStories />}
          {activeTab === 'challenges' && <ChallengeBoard />}
          {activeTab === 'partner' && <AccountabilityPartner />}
          {activeTab === 'leaderboard' && <Leaderboards />}
        </motion.div>
      </AnimatePresence>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  );
}