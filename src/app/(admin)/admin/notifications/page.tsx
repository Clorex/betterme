'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Send, Users, UserCheck, Target,
  Clock, Loader2, CheckCircle
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const audienceOptions = [
  { id: 'all', label: 'All Users', icon: Users, description: 'Send to everyone' },
  { id: 'subscribers', label: 'Subscribers', icon: UserCheck, description: 'Pro & Premium only' },
  { id: 'free', label: 'Free Users', icon: Target, description: 'Trial expired users' },
  { id: 'inactive', label: 'Inactive Users', icon: Clock, description: "Haven't logged in 7+ days" },
];

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    if (!confirm(`Send notification to ${audience} users?`)) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title: title.trim(),
        body: body.trim(),
        audience,
        status: 'sent',
        sentAt: serverTimestamp(),
        sentBy: 'admin',
      });

      // Log activity
      await addDoc(collection(db, 'adminActivity'), {
        type: 'notification',
        message: `Notification sent to ${audience}: "${title}"`,
        timestamp: serverTimestamp(),
      });

      setSent(true);
      toast.success('Notification sent! 🔔');

      setTimeout(() => {
        setSent(false);
        setTitle('');
        setBody('');
      }, 3000);
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-montserrat font-bold flex items-center gap-2">
          <Bell size={24} className="text-brand-purple" />
          Push Notifications
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Send notifications to your users
        </p>
      </div>

      {sent ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-900/20 border border-green-800 rounded-2xl p-8 text-center"
        >
          <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-400">Notification Sent!</h3>
          <p className="text-sm text-gray-400 mt-1">
            Your message has been delivered to {audience} users.
          </p>
        </motion.div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
          {/* Audience */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Audience
            </label>
            <div className="grid grid-cols-2 gap-3">
              {audienceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setAudience(option.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      audience === option.id
                        ? 'border-brand-purple bg-brand-purple/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={audience === option.id ? 'text-brand-purple' : 'text-gray-500'}
                    />
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-[10px] text-gray-500">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Don't forget your workout today! 💪"
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
            />
            <p className="text-[10px] text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your notification message..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 resize-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">{body.length}/500</p>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Preview</p>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title || 'Notification Title'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {body || 'Notification message...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim() || sending}
            className="w-full py-3 bg-brand-purple text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={16} />
                Send Notification
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}