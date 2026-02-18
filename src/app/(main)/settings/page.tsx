// src/app/(main)/settings/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Moon,
  Sun,
  Bell,
  Target,
  CreditCard,
  Key,
  Download,
  Trash2,
  LogOut,
  Info,
  ChevronRight,
  Shield,
  Palette,
  HelpCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { auth, db } from '@/lib/firebase';
import {
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState({
    workoutReminders: userProfile?.profile?.notificationPrefs?.workoutReminders ?? true,
    mealReminders: userProfile?.profile?.notificationPrefs?.mealReminders ?? true,
    waterReminders: userProfile?.profile?.notificationPrefs?.waterReminders ?? true,
    dailySummary: userProfile?.profile?.notificationPrefs?.dailySummary ?? true,
    motivational: userProfile?.profile?.notificationPrefs?.motivational ?? true,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAuth();
      router.replace('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!auth.currentUser || !auth.currentUser.email) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', auth.currentUser.uid));
      // Delete Firebase auth account
      await deleteUser(auth.currentUser);
      clearAuth();
      router.replace('/');
      toast.success('Account deleted. Sorry to see you go!');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please logout and login again before deleting');
      } else {
        toast.error('Failed to delete account');
      }
    }
    setLoading(false);
  };

  const handleToggleNotification = async (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`profile.notificationPrefs.${key}`]: value,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating notification pref:', err);
    }
  };

  const subscription = userProfile?.subscription;
  const planLabel =
    subscription?.plan === 'premium'
      ? 'Premium'
      : subscription?.plan === 'pro'
      ? 'Pro'
      : subscription?.plan === 'trial'
      ? 'Free Trial'
      : 'Free';

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-brand-dark dark:text-brand-white">
        Settings
      </h1>

      {/* Profile Section */}
      <Card>
        <button
          onClick={() => {/* TODO: edit profile */}}
          className="flex w-full items-center gap-3"
        >
          <div className="h-14 w-14 overflow-hidden rounded-full bg-brand-lavender/30">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-purple text-lg font-bold text-white">
                {(userProfile?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-heading font-bold text-brand-dark dark:text-brand-white">
              {userProfile?.displayName || user?.displayName || 'User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-brand-lavender" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-brand-dark dark:text-brand-white">
              Dark Mode
            </span>
          </div>
          <Toggle checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Notifications
        </h3>
        <div className="space-y-4">
          <SettingsToggle
            icon={<Bell className="h-5 w-5 text-blue-500" />}
            label="Workout Reminders"
            checked={notifications.workoutReminders}
            onChange={(v) => handleToggleNotification('workoutReminders', v)}
          />
          <SettingsToggle
            icon={<Bell className="h-5 w-5 text-orange-500" />}
            label="Meal Reminders"
            checked={notifications.mealReminders}
            onChange={(v) => handleToggleNotification('mealReminders', v)}
          />
          <SettingsToggle
            icon={<Bell className="h-5 w-5 text-cyan-500" />}
            label="Water Reminders"
            checked={notifications.waterReminders}
            onChange={(v) => handleToggleNotification('waterReminders', v)}
          />
          <SettingsToggle
            icon={<Bell className="h-5 w-5 text-purple-500" />}
            label="Daily Summary"
            checked={notifications.dailySummary}
            onChange={(v) => handleToggleNotification('dailySummary', v)}
          />
          <SettingsToggle
            icon={<Bell className="h-5 w-5 text-green-500" />}
            label="Motivational Messages"
            checked={notifications.motivational}
            onChange={(v) => handleToggleNotification('motivational', v)}
          />
        </div>
      </Card>

      {/* Goals */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Goals
        </h3>
        <SettingsLink
          icon={<Target className="h-5 w-5 text-brand-purple dark:text-brand-lavender" />}
          label="Update Goals & Profile"
          onClick={() => router.push('/onboarding')}
        />
      </Card>

      {/* Subscription */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Subscription
        </h3>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-brand-purple dark:text-brand-lavender" />
            <span className="text-sm font-medium text-brand-dark dark:text-brand-white">
              Current Plan
            </span>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              subscription?.plan === 'premium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : subscription?.plan === 'pro'
                ? 'bg-brand-lavender/20 text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {planLabel}
          </span>
        </div>

        {(!subscription || subscription.plan === 'trial' || subscription.plan === 'free') && (
          <Button
            onClick={() => {/* TODO: open payment */}}
            variant="primary"
            fullWidth
            size="sm"
          >
            Upgrade Plan
          </Button>
        )}
      </Card>

      {/* Account */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Account
        </h3>
        <div className="space-y-1">
          <SettingsLink
            icon={<Key className="h-5 w-5 text-gray-500" />}
            label="Change Password"
            onClick={() => setShowPasswordModal(true)}
          />
          <SettingsLink
            icon={<Download className="h-5 w-5 text-gray-500" />}
            label="Export My Data"
            onClick={() => toast('Coming soon!')}
          />
          <SettingsLink
            icon={<Trash2 className="h-5 w-5 text-red-500" />}
            label="Delete Account"
            onClick={() => setShowDeleteModal(true)}
            danger
          />
        </div>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        fullWidth
        className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>

      {/* About */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          About
        </h3>
        <div className="space-y-1">
          <SettingsLink
            icon={<Info className="h-5 w-5 text-gray-500" />}
            label="App Version 1.0.0"
            onClick={() => {}}
          />
          <SettingsLink
            icon={<Shield className="h-5 w-5 text-gray-500" />}
            label="Privacy Policy"
            onClick={() => {}}
          />
          <SettingsLink
            icon={<HelpCircle className="h-5 w-5 text-gray-500" />}
            label="Contact Support"
            onClick={() => {}}
          />
        </div>
      </Card>

      <div className="pb-8" />

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            onClick={handleChangePassword}
            variant="primary"
            fullWidth
            loading={loading}
          >
            Update Password
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This action is irreversible. All your data will be permanently deleted.
            Type <strong>DELETE</strong> to confirm.
          </p>
          <Input
            label=""
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
          />
          <Button
            onClick={handleDeleteAccount}
            variant="danger"
            fullWidth
            loading={loading}
            disabled={deleteConfirmText !== 'DELETE'}
          >
            Permanently Delete Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function SettingsToggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-brand-dark dark:text-brand-white">
          {label}
        </span>
      </div>
      <Toggle checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsLink({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-1 py-3 transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span
          className={cn(
            'text-sm font-medium',
            danger
              ? 'text-red-500'
              : 'text-brand-dark dark:text-brand-white'
          )}
        >
          {label}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </button>
  );
}