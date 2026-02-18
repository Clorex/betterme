'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, Users, Send, MessageCircle,
  Bell, X, Loader2, Target, ArrowRight,
  Shield, Clock
} from 'lucide-react';
import { useAccountabilityPartner } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

export default function AccountabilityPartner() {
  const { user } = useAuthStore();
  const {
    partner,
    messages,
    searching,
    fetchPartner,
    findPartner,
    sendMessage,
    fetchMessages,
    nudgePartner,
    endPartnership,
  } = useAccountabilityPartner();

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPartner();
  }, []);

  useEffect(() => {
    if (partner) {
      fetchMessages();
    }
  }, [partner]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await sendMessage(newMessage.trim());
    setNewMessage('');
    await fetchMessages();
    setSending(false);
  };

  // No partner found - matching screen
  if (!partner) {
    return (
      <div className="p-4 pb-8">
        <div className="text-center py-8">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-32 h-32 bg-brand-lavender/20 dark:bg-brand-purple/20 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Users size={48} className="text-brand-purple" />
          </motion.div>

          <h2 className="text-xl font-bold text-brand-dark dark:text-brand-white mb-2">
            Find Your Accountability Partner
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
            Get matched with someone who shares your goals.
            Keep each other motivated and accountable!
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8 max-w-xs mx-auto">
            {[
              { icon: Target, text: 'Matched by similar goals' },
              { icon: MessageCircle, text: 'Direct messaging' },
              { icon: Bell, text: 'Nudge each other to stay on track' },
              { icon: Shield, text: 'Safe & private' },
            ].map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 dark:bg-brand-surface rounded-xl p-3"
              >
                <div className="w-8 h-8 bg-brand-lavender/30 dark:bg-brand-purple/30 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-brand-purple" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={findPartner}
            disabled={searching}
            className="px-8 py-3 bg-brand-purple text-white rounded-2xl font-semibold text-sm hover:bg-brand-purple/90 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {searching ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Find My Partner
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Partner found - chat view
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Partner Info */}
      <div className="px-4 py-3 bg-white dark:bg-brand-surface border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-lavender/30 dark:bg-brand-purple/30 flex items-center justify-center overflow-hidden">
              {partner.partnerPhoto ? (
                <img
                  src={partner.partnerPhoto}
                  alt={partner.partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brand-purple font-bold text-sm">
                  {partner.partnerName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                {partner.partnerName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Target size={10} />
                {partner.partnerGoal?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={nudgePartner}
              className="p-2 rounded-full bg-brand-lavender/20 dark:bg-brand-purple/20 text-brand-purple"
              title="Send nudge"
            >
              <Bell size={16} />
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500"
              title="End partnership"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {partner.matchedAt && (
          <p className="text-[10px] text-gray-400 mt-1 ml-13">
            Partners since{' '}
            {partner.matchedAt?.toDate
              ? formatDistanceToNow(partner.matchedAt.toDate(), { addSuffix: true })
              : 'recently'}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Say hi to your accountability partner!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-brand-purple text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-brand-dark dark:text-brand-white rounded-bl-md'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? 'text-white/60' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp?.toDate
                      ? formatDistanceToNow(msg.timestamp.toDate(), {
                          addSuffix: true,
                        })
                      : 'now'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick messages */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {['How are you today?', 'Did you work out?', 'Stay strong! 💪', 'Great job!'].map((msg) => (
          <button
            key={msg}
            onClick={() => setNewMessage(msg)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message your partner..."
          className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className={`p-2.5 rounded-full transition-all ${
            newMessage.trim() && !sending
              ? 'bg-brand-purple text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          }`}
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* End Partnership Confirm */}
      {showEndConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-brand-surface rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-bold text-brand-dark dark:text-brand-white mb-2">
              End Partnership?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to end this partnership?
              You can find a new partner anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  endPartnership();
                  setShowEndConfirm(false);
                }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium"
              >
                End Partnership
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}