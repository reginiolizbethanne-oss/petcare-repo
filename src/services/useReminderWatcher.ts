import { useEffect, useRef } from 'react';
import { getAllReminders } from '@/db/reminders';
import { getAllPets } from '@/db/pets';
import {
  scheduleReminderNotification,
  fireReminderAlert,
  requestNotificationPermissions,
} from './notifications';
import type { Pet } from '@/db/types';

/**
 * Background hook that keeps reminder notifications active and in-sync:
 * 1. Automatically requests notification permissions on web/native.
 * 2. Schedules all upcoming uncompleted reminders.
 * 3. Periodically checks every 20 seconds for due reminders to ensure nothing is missed.
 */
export function useReminderWatcher() {
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Request permission early
    void requestNotificationPermissions();

    const syncReminders = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      try {
        const [reminders, pets] = await Promise.all([getAllReminders(), getAllPets()]);
        const petMap = new Map<string, Pet>();
        pets.forEach((p) => petMap.set(p.id, p));

        const now = Date.now();

        for (const rem of reminders) {
          if (rem.completed === 1) continue;

          const pet = petMap.get(rem.pet_id);
          const petName = pet?.name;

          // If due within the last 5 minutes and hasn't been fired
          if (rem.due_date <= now && rem.due_date >= now - 5 * 60 * 1000) {
            fireReminderAlert(rem, petName);
          } else if (rem.due_date > now && rem.due_date <= now + 24 * 3600 * 1000) {
            // Schedule if within the next 24 hours
            void scheduleReminderNotification(rem, petName);
          }
        }
      } catch (err) {
        console.warn('Reminder watcher sync error:', err);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Run immediately on mount
    void syncReminders();

    // Check periodically every 20 seconds
    const interval = setInterval(() => {
      void syncReminders();
    }, 20000);

    return () => clearInterval(interval);
  }, []);
}
