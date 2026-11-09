import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { ReminderCard } from '@/components/ReminderCard';
import { SmoothPressable } from '@/components/SmoothPressable';
import { EmptyState } from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import { getAllReminders, toggleReminderComplete, deleteReminder } from '@/db/reminders';
import { cancelReminderNotification, scheduleReminderNotification } from '@/services/notifications';
import type { Reminder } from '@/db/types';

type FilterType = 'All' | 'Today' | 'Upcoming' | 'Completed';

export default function RemindersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { activePet, activePetId, pets, refreshAll } = usePet();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<FilterType>('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = useCallback(async () => {
    try {
      const list = await getAllReminders(activePetId || undefined);
      setReminders(list);
    } catch (err) {
      console.warn('Failed to load reminders:', err);
    }
  }, [activePetId]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), loadReminders()]);
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    try {
      const target = reminders.find((r) => r.id === id);
      const updated = await toggleReminderComplete(id);

      if (updated.completed === 1) {
        await cancelReminderNotification(id, target?.notification_id);
      } else {
        const pet = pets.find((p) => p.id === updated.pet_id) || activePet;
        await scheduleReminderNotification(updated, pet?.name);
      }

      await loadReminders();
      await refreshAll();
      showToast(
        updated.completed === 1 ? 'Reminder marked completed!' : 'Reminder reopened.',
        'success',
        'Reminder Updated'
      );
    } catch (err) {
      console.warn('Failed to toggle reminder:', err);
      showToast('Failed to update reminder status.', 'error', 'Update Failed');
    }
  };

  const handleDelete = (id: string) => {
    const target = reminders.find((r) => r.id === id);
    confirmDelete(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      async () => {
        try {
          await cancelReminderNotification(id, target?.notification_id);
          await deleteReminder(id);
          await loadReminders();
          await refreshAll();
          showToast('Reminder deleted successfully.', 'info', 'Reminder Deleted');
        } catch (err) {
          console.warn('Failed to delete reminder:', err);
          showToast('Failed to delete reminder.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const handleEdit = (rem: Reminder) => {
    router.push(`/add-reminder?id=${rem.id}` as Href);
  };

  // Filter items
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 3600 * 1000 - 1;

  const filtered = reminders.filter((r) => {
    if (filter === 'Today') {
      return r.due_date >= startOfDay && r.due_date <= endOfDay;
    }
    if (filter === 'Upcoming') {
      return r.completed === 0 && r.due_date > endOfDay;
    }
    if (filter === 'Completed') {
      return r.completed === 1;
    }
    return true; // 'All'
  });

  const filters: FilterType[] = ['All', 'Today', 'Upcoming', 'Completed'];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.buttonPrimary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Reminders</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            {activePet ? `Tasks & schedule for ${activePet.name}` : 'All Pet Reminders'}
          </Text>
        </View>
        <SmoothPressable
          onPress={() => router.push('/add-reminder' as Href)}
          style={[styles.addBtn, { backgroundColor: theme.buttonPrimary }]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Reminder</Text>
        </SmoothPressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filters.map((f) => {
          const isSelected = filter === f;
          return (
            <SmoothPressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                  borderColor: isSelected ? theme.buttonPrimary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {f}
              </Text>
            </SmoothPressable>
          );
        })}
      </View>

      {/* Reminders List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="alarm-outline"
          title={
            filter === 'Completed'
              ? 'No Completed Reminders'
              : filter === 'Today'
              ? 'Nothing Scheduled Today'
              : 'No Reminders Found'
          }
          message={
            filter === 'Completed'
              ? 'Completed care reminders will appear here.'
              : 'Never miss feeding, medication doses, grooming, or vet visits.'
          }
          actionLabel="+ Create Reminder"
          onAction={() => router.push('/add-reminder' as Href)}
        />
      ) : (
        filtered.map((rem) => (
          <ReminderCard
            key={rem.id}
            reminder={rem}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showPetName={pets.find((p) => p.id === rem.pet_id)?.name}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
