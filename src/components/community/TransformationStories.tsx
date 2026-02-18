'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clock, TrendingDown, Target,
  ChevronLeft, ChevronRight, Star, Loader2, Plus
} from 'lucide-react';
import { useTransformationStories, TransformationStory } from '@/hooks/useCommunity';
import SubmitStoryModal from './SubmitStoryModal';

export default function TransformationStories() {
  const { stories, loading, fetchStories } = useTransformationStories();
  const [selectedStory, setSelectedStory] = useState<TransformationStory | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [filterGoal, setFilterGoal] = useState<string>('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const filteredStories = filterGoal === 'all'
    ? stories
    : stories.filter((s) => s.goal === filterGoal);

  const goals = ['all', 'lose_fat', 'build_muscle', 'get_lean', 'body_recomp'];
  const goalLabels: Record<string, string> = {
    all: '🌟 All',
    lose_fat: '🔥 Fat Loss',
    build_muscle: '💪 Muscle',
    get_lean: '🏃 Lean',
    body_recomp: '⚖️ Recomp',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-brand-dark dark:text-brand-white">
            Real Transformations
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Inspiring journeys from our community
          </p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="flex items-center gap-1 px-3 py-2 bg-brand-purple text-white rounded-full text-xs font-medium"
        >
          <Plus size={14} />
          Share Yours
        </button>
      </div>

      {/* Goal filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => setFilterGoal(goal)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterGoal === goal
                ? 'bg-brand-purple text-white'
                : 'bg-gray-100 dark:bg-brand-surface text-gray-600 dark:text-gray-400'
            }`}
          >
            {goalLabels[goal] || goal}
          </button>
        ))}
      </div>

      {/* Featured Story */}
      {filteredStories.length > 0 && filteredStories[0].featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-br from-brand-purple to-purple-700 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">Featured Story</span>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="w-20 h-24 rounded-xl bg-white/20 overflow-hidden flex-shrink-0">
              {filteredStories[0].beforePhoto && (
                <img
                  src={filteredStories[0].beforePhoto}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              )}
              <p className="text-[8px] text-center mt-0.5 opacity-75">Before</p>
            </div>
            <div className="text-center self-center">
              <ArrowRight size={20} className="mx-auto opacity-50" />
            </div>
            <div className="w-20 h-24 rounded-xl bg-white/20 overflow-hidden flex-shrink-0">
              {filteredStories[0].afterPhoto && (
                <img
                  src={filteredStories[0].afterPhoto}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              )}
              <p className="text-[8px] text-center mt-0.5 opacity-75">After</p>
            </div>
          </div>
          <h3 className="font-bold text-sm">{filteredStories[0].userName}</h3>
          <p className="text-xs opacity-80 mt-1 line-clamp-2">
            {filteredStories[0].story}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs opacity-80">
            <span>
              <TrendingDown size={12} className="inline mr-1" />
              {filteredStories[0].startWeight}→{filteredStories[0].endWeight} lbs
            </span>
            <span>
              <Clock size={12} className="inline mr-1" />
              {filteredStories[0].duration}
            </span>
          </div>
          <button
            onClick={() => setSelectedStory(filteredStories[0])}
            className="mt-3 w-full py-2 bg-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm"
          >
            Read Full Story →
          </button>
        </motion.div>
      )}

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="font-semibold text-brand-dark dark:text-brand-white mb-1">
            No stories yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Be the first to share your transformation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.slice(filteredStories[0]?.featured ? 1 : 0).map((story, index) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedStory(story)}
              className="w-full bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 text-left"
            >
              <div className="flex gap-3">
                {/* Photos */}
                <div className="flex gap-1 flex-shrink-0">
                  <div className="w-16 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {story.beforePhoto ? (
                      <img
                        src={story.beforePhoto}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                        Before
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {story.afterPhoto ? (
                      <img
                        src={story.afterPhoto}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                        After
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                    {story.userName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {story.age}yo • {story.gender}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      -{Math.abs(story.startWeight - story.endWeight)} lbs
                    </span>
                    <span className="text-xs text-gray-400">
                      {story.duration}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-2">
                    {story.story}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="text-gray-300 dark:text-gray-600 self-center flex-shrink-0"
                />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {/* Submit Story Modal */}
      <SubmitStoryModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
      />
    </div>
  );
}

function StoryDetailModal({
  story,
  onClose,
}: {
  story: TransformationStory;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-surface rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="p-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-brand-purple mb-4"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <h2 className="text-xl font-bold text-brand-dark dark:text-brand-white mb-2">
            {story.userName}&apos;s Journey
          </h2>

          {/* Before/After */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <div className="aspect-[3/4] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1">
                {story.beforePhoto ? (
                  <img src={story.beforePhoto} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Before</div>
                )}
              </div>
              <p className="text-center text-xs text-gray-500 font-medium">
                Before ({story.startWeight} lbs)
              </p>
            </div>
            <div className="flex-1">
              <div className="aspect-[3/4] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1">
                {story.afterPhoto ? (
                  <img src={story.afterPhoto} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">After</div>
                )}
              </div>
              <p className="text-center text-xs text-gray-500 font-medium">
                After ({story.endWeight} lbs)
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-600">
                -{Math.abs(story.startWeight - story.endWeight)}
              </p>
              <p className="text-[10px] text-green-600/70">lbs lost</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-brand-purple">{story.duration}</p>
              <p className="text-[10px] text-brand-purple/70">duration</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{story.age}</p>
              <p className="text-[10px] text-blue-600/70">years old</p>
            </div>
          </div>

          {/* Story */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-brand-dark dark:text-brand-white mb-2">
              My Story
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {story.story}
            </p>
          </div>

          {/* Routine */}
          {story.routine && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-brand-dark dark:text-brand-white mb-2">
                🏋️ My Routine
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {story.routine}
              </p>
            </div>
          )}

          {/* Diet */}
          {story.diet && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-brand-dark dark:text-brand-white mb-2">
                🍽️ My Diet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {story.diet}
              </p>
            </div>
          )}

          {/* Motivation */}
          <div className="bg-brand-lavender/20 dark:bg-brand-purple/20 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-2">💪</p>
            <p className="text-sm font-semibold text-brand-purple">
              This could be you!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stay consistent and trust the process
            </p>
          </div>
        </div>

        <div className="h-8" />
      </motion.div>
    </motion.div>
  );
}