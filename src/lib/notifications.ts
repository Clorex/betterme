// src/lib/notifications.ts
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: icon || '/images/logo.png',
    badge: '/icons/icon-192.png',
    tag: 'betterme-' + Date.now(),
  });
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

const defaultSchedule: ScheduledNotification[] = [
  { id: 'breakfast', title: 'BetterME', body: "🌅 Good morning! Don't forget to log breakfast.", hour: 8, minute: 0 },
  { id: 'water-1', title: 'BetterME', body: '💧 Time for a glass of water!', hour: 10, minute: 0 },
  { id: 'lunch', title: 'BetterME', body: '☀️ Lunchtime! Snap your meal to track it.', hour: 12, minute: 0 },
  { id: 'water-2', title: 'BetterME', body: '💧 Stay hydrated! Have another glass.', hour: 14, minute: 0 },
  { id: 'workout', title: 'BetterME', body: "🏋️ Time for today's workout! Let's crush it!", hour: 17, minute: 0 },
  { id: 'dinner', title: 'BetterME', body: '🌙 Dinner time! Remember to log your meal.', hour: 18, minute: 30 },
  { id: 'summary', title: 'BetterME', body: '📊 Check your daily summary and plan tomorrow.', hour: 20, minute: 0 },
];

let scheduledTimers: NodeJS.Timeout[] = [];

export function scheduleNotifications(enabledTypes: {
  mealReminders: boolean;
  waterReminders: boolean;
  workoutReminders: boolean;
  dailySummary: boolean;
}) {
  // Clear existing timers
  scheduledTimers.forEach((t) => clearTimeout(t));
  scheduledTimers = [];

  const now = new Date();

  defaultSchedule.forEach((notif) => {
    // Check if this type is enabled
    if (
      (notif.id.includes('water') && !enabledTypes.waterReminders) ||
      (notif.id === 'workout' && !enabledTypes.workoutReminders) ||
      (notif.id === 'summary' && !enabledTypes.dailySummary) ||
      (['breakfast', 'lunch', 'dinner'].includes(notif.id) && !enabledTypes.mealReminders)
    ) {
      return;
    }

    const target = new Date();
    target.setHours(notif.hour, notif.minute, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timer = setTimeout(() => {
      sendLocalNotification(notif.title, notif.body);
      // Re-schedule for next day
      const nextTimer = setInterval(() => {
        sendLocalNotification(notif.title, notif.body);
      }, 24 * 60 * 60 * 1000);
      scheduledTimers.push(nextTimer);
    }, delay);

    scheduledTimers.push(timer);
  });
}

export function cancelAllNotifications() {
  scheduledTimers.forEach((t) => {
    clearTimeout(t);
    clearInterval(t);
  });
  scheduledTimers = [];
}