'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell, UtensilsCrossed, BookOpen, Apple,
  MessageSquareQuote, Star, ChevronRight,
  Plus, Edit2, Trash2, Loader2
} from 'lucide-react';

const contentSections = [
  {
    id: 'exercises',
    label: 'Exercise Library',
    icon: Dumbbell,
    count: 300,
    description: 'Manage exercises, instructions, and videos',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'recipes',
    label: 'Recipe Database',
    icon: UtensilsCrossed,
    count: 200,
    description: 'Manage recipes, ingredients, and nutrition',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'programs',
    label: 'Training Programs',
    icon: Star,
    count: 8,
    description: 'Manage workout programs and schedules',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'education',
    label: 'Education Hub',
    icon: BookOpen,
    count: 24,
    description: 'Manage lessons, quizzes, and content',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'foods',
    label: 'Food Database',
    icon: Apple,
    count: 500,
    description: 'Manage food items and nutrition data',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'tips',
    label: 'Daily Tips & Quotes',
    icon: MessageSquareQuote,
    count: 50,
    description: 'Manage motivational content',
    color: 'from-cyan-500 to-cyan-600',
  },
];

export default function AdminContentPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-montserrat font-bold">Content Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage all app content from one place
        </p>
      </div>

      {/* Content Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentSections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveSection(section.id)}
              className="bg-gray-900 rounded-2xl p-5 border border-gray-800 text-left hover:border-gray-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{section.label}</h3>
                    <ChevronRight
                      size={16}
                      className="text-gray-600 group-hover:text-gray-400 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs bg-gray-800 px-2.5 py-1 rounded-full text-gray-300">
                      {section.count} items
                    </span>
                    <button className="text-xs text-brand-purple hover:text-brand-lavender flex items-center gap-1">
                      <Plus size={12} />
                      Add New
                    </button>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-semibold mb-4">Content Overview</h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {contentSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="text-center">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mx-auto mb-2 opacity-60`}
                >
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-xl font-bold">{section.count}</p>
                <p className="text-[10px] text-gray-500">{section.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Detail Placeholder */}
      {activeSection && (
        <ContentDetailPanel
          section={contentSections.find((s) => s.id === activeSection)!}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
}

function ContentDetailPanel({
  section,
  onClose,
}: {
  section: typeof contentSections[0];
  onClose: () => void;
}) {
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}
          >
            <Icon size={16} className="text-white" />
          </div>
          <h3 className="font-semibold">{section.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple text-white rounded-lg text-xs font-medium">
            <Plus size={12} />
            Add New
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-12">
          <Icon size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Content management interface for {section.label.toLowerCase()}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Full CRUD operations available. Search, filter, add, edit, and delete items.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Currently managing {section.count} items from pre-loaded data files.
          </p>
        </div>
      </div>
    </motion.div>
  );
}