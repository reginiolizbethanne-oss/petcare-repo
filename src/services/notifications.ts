import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { playReminderSound } from '@/utils/sounds';
import { showToast } from '@/components/Toast';
import type { Reminder } from '@/db/types';

// Track active web timer ids to allow cancellation
const webTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Track already triggered reminders in this session to prevent duplicates
const triggeredReminderIds = new Set<string>();

// Configure native notification presentation behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch {
  // Safe ignore if in web environment
}

/**
 * Request notification permissions from the user.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        return true;
      }
      if (window.Notification.permission !== 'denied') {
        const result = await window.Notification.requestPermission();
        return result === 'granted';
      }
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Failed to get notification permissions:', err);
    return false;
  }
}

/**
 * Trigger the actual alert (Sound + System Notification + In-app Toast)
 */
export function fireReminderAlert(reminder: Reminder, petName?: string): void {
  if (triggeredReminderIds.has(reminder.id)) return;
  triggeredReminderIds.add(reminder.id);

  // Play the chosen reminder sound
  playReminderSound(reminder.sound || 'chime');

  const title = petName ? `🐾 ${petName}: ${reminder.title}` : `🐾 PetCare: ${reminder.title}`;
  const body = reminder.notes || `${reminder.category} reminder for your pet.`;

  // Web System Notification
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (window.Notification.permission === 'granted') {
      try {
        new window.Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: reminder.id,
        });
      } catch (err) {
        console.warn('Failed to display web notification:', err);
      }
    }
  }

  // Always show in-app banner toast
  showToast(body, 'info', title);
}

/**
 * Schedule a local notification for a reminder.
 * Returns the notification identifier string.
 */
export async function scheduleReminderNotification(
  reminder: Reminder,
  petName?: string
): Promise<string | null> {
  // Cancel any existing notification for this reminder first
  await cancelReminderNotification(reminder.id, reminder.notification_id);

  const now = Date.now();
  const triggerMs = reminder.due_date;

  // Do not schedule if already completed
  if (reminder.completed === 1) {
    return null;
  }

  // If due in the past or immediately (within 1 second)
  if (triggerMs <= now) {
    return null;
  }

  const delayMs = triggerMs - now;

  // Web scheduling
  if (Platform.OS === 'web') {
    // Schedule timer in memory
    const timer = setTimeout(() => {
      fireReminderAlert(reminder, petName);
      webTimers.delete(reminder.id);
    }, delayMs);

    webTimers.set(reminder.id, timer);
    return `web-notif-${reminder.id}-${triggerMs}`;
  }

  // Native scheduling with expo-notifications
  try {
    const perm = await requestNotificationPermissions();
    if (!perm) return null;

    const title = petName ? `🐾 ${petName}: ${reminder.title}` : `🐾 PetCare: ${reminder.title}`;
    const body = reminder.notes || `${reminder.category} care reminder`;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { reminderId: reminder.id, petId: reminder.pet_id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerMs,
      },
    });

    return notifId;
  } catch (err) {
    console.warn('Failed to schedule native notification:', err);
    return null;
  }
}

/**
 * Cancel a scheduled reminder notification.
 */
export async function cancelReminderNotification(
  reminderId: string,
  notificationId?: string | null
): Promise<void> {
  // Clear Web timer
  const existingTimer = webTimers.get(reminderId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    webTimers.delete(reminderId);
  }

  // Cancel Native notification
  if (Platform.OS !== 'web' && notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignore if already fired or cancelled
    }
  }
}
