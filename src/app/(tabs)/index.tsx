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
import { useSettings } from '@/settings/SettingsContext';
import { useTheme } from '@/theme';
import { PetAvatar } from '@/components/PetAvatar';
import { PetSelector } from '@/components/PetSelector';
import { QuickActionGrid } from '@/components/QuickActionGrid';
import { ReminderCard } from '@/components/ReminderCard';
import { SmoothPressable } from '@/components/SmoothPressable';
import { IconButton } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import { getTodayReminders, toggleReminderComplete, deleteReminder } from '@/db/reminders';
import { cancelReminderNotification } from '@/services/notifications';
import { getTodayMeals, deleteMeal } from '@/db/meals';
import { getAllWeightEntries } from '@/db/weights';
import { getAllHealthNotes } from '@/db/health';
import type { Reminder, Meal, HealthNote, WeightEntry } from '@/db/types';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings } = useSettings();
  const { activePet, activePetId, pets, refreshAll } = usePet();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [recentHealth, setRecentHealth] = useState<HealthNote[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!activePetId) {
      setReminders([]);
      setTodayMeals([]);
      setRecentHealth([]);
      setWeightHistory([]);
      return;
    }
    try {
      const [rems, meals, health, weights] = await Promise.all([
        getTodayReminders(activePetId),
        getTodayMeals(activePetId),
        getAllHealthNotes(activePetId),
        getAllWeightEntries(activePetId),
      ]);
      setReminders(rems);
      setTodayMeals(meals);
      setRecentHealth(health.slice(0, 2));
      setWeightHistory(weights);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    }
  }, [activePetId]);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
      void loadDashboardData();
    }, [refreshAll, loadDashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), loadDashboardData()]);
    setRefreshing(false);
  };

  const handleToggleReminder = async (id: string) => {
    try {
      const rem = reminders.find((r) => r.id === id);
      const updated = await toggleReminderComplete(id);
      if (updated.completed === 1) {
        await cancelReminderNotification(id, rem?.notification_id);
      }
      await loadDashboardData();
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

  const handleDeleteReminder = (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    confirmDelete(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      async () => {
        try {
          await cancelReminderNotification(id, rem?.notification_id);
          await deleteReminder(id);
          await loadDashboardData();
          await refreshAll();
          showToast('Reminder deleted successfully.', 'info', 'Reminder Deleted');
        } catch (err) {
          console.warn('Failed to delete reminder:', err);
          showToast('Failed to delete reminder.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const handleDeleteMeal = (id: string) => {
    confirmDelete(
      'Delete Meal Record',
      'Are you sure you want to delete this meal record?',
      async () => {
        try {
          await deleteMeal(id);
          await loadDashboardData();
          await refreshAll();
          showToast('Meal record deleted successfully.', 'info', 'Meal Deleted');
        } catch (err) {
          console.warn('Failed to delete meal:', err);
          showToast('Failed to delete meal record.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const formatAge = (birthdate?: string): string => {
    if (!birthdate) return 'Age not set';
    const birth = new Date(birthdate);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    if (diffMonths < 1) return 'Newborn';
    if (diffMonths < 12) return `${diffMonths} mo`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} yrs`;
  };

  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight
      : activePet?.weight;

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
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={[styles.appName, { color: theme.buttonPrimary }]}>
            🐾 PetCare
          </Text>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {settings.nickname ? `Hello, ${settings.nickname}!` : 'Hello, Pet Parent!'}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {activePet ? `${activePet.name}'s Dashboard` : 'My Pets'}
          </Text>
        </View>
        <IconButton
          icon="settings-outline"
          label="Settings"
          onPress={() => router.push('/settings' as Href)}
        />
      </View>

      {/* Pet Selector Chips */}
      <PetSelector />

      {/* If no pets exist */}
      {pets.length === 0 && (
        <EmptyState
          icon="paw-outline"
          title="No Pets Added Yet"
          message="Create your pet's profile to track feeding, health notes, weight, and reminders."
          actionLabel="+ Add Your Pet"
          onAction={() => router.push('/pet-form' as Href)}
        />
      )}

      {/* Active Pet Card */}
      {activePet && (
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.heroTop}>
            <PetAvatar
              uri={activePet.photo_uri}
              species={activePet.species}
              size={68}
              name={activePet.name}
              borderColor={theme.buttonPrimary}
            />
            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.petName, { color: theme.text }]}>
                  {activePet.name}
                </Text>
                <View
                  style={[
                    styles.speciesBadge,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Text
                    style={[styles.speciesText, { color: theme.buttonPrimary }]}
                  >
                    {activePet.species}
                  </Text>
                </View>
              </View>

              <Text style={[styles.breedText, { color: theme.textSecondary }]}>
                {activePet.breed || 'Breed unspecified'} •{' '}
                {activePet.gender || 'Unknown'}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
                  <Text style={[styles.statItemText, { color: theme.text }]}>
                    {formatAge(activePet.birthdate)}
                  </Text>
                </View>
                <View style={styles.statDot} />
                <View style={styles.statItem}>
                  <Ionicons name="scale-outline" size={13} color={theme.textSecondary} />
                  <Text style={[styles.statItemText, { color: theme.text }]}>
                    {currentWeight != null
                      ? `${currentWeight} ${activePet.weight_unit || 'kg'}`
                      : 'Weight unset'}
                  </Text>
                </View>
              </View>
            </View>

            <SmoothPressable
              onPress={() => router.push(`/pet-form?id=${activePet.id}` as Href)}
              style={[
                styles.editButton,
                { backgroundColor: theme.inputBackground },
              ]}
              accessibilityLabel="Edit Pet Profile"
            >
              <Ionicons name="pencil" size={16} color={theme.textSecondary} />
            </SmoothPressable>
          </View>

          {/* Quick Metrics Bar */}
          <View style={[styles.metricsBar, { borderTopColor: theme.border }]}>
            <SmoothPressable
              style={styles.metricColumn}
              onPress={() => router.push('/log-meal' as Href)}
              accessibilityLabel="View or log meals"
            >
              <Text style={[styles.metricNumber, { color: theme.meal }]}>
                {todayMeals.length}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Meals Today
              </Text>
            </SmoothPressable>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SmoothPressable
              style={styles.metricColumn}
              onPress={() => router.push('/reminders' as Href)}
              accessibilityLabel="View today's reminders"
            >
              <Text style={[styles.metricNumber, { color: theme.reminder }]}>
                {reminders.filter((r) => r.completed === 0).length}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Pending Today
              </Text>
            </SmoothPressable>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SmoothPressable
              style={styles.metricColumn}
              onPress={() => router.push('/log-health' as Href)}
              accessibilityLabel="View or log health notes"
            >
              <Text style={[styles.metricNumber, { color: theme.health }]}>
                {recentHealth.length}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Health Notes
              </Text>
            </SmoothPressable>
          </View>
        </View>
      )}

      {/* 4 Core Quick Actions */}
      <QuickActionGrid />

      {/* Today's Care Reminders Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="alarm-outline" size={20} color={theme.reminder} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {"Today's Schedule & Reminders"}
          </Text>
        </View>
        <SmoothPressable onPress={() => router.push('/reminders' as Href)}>
          <Text style={[styles.seeAllText, { color: theme.buttonPrimary }]}>
            View All
          </Text>
        </SmoothPressable>
      </View>

      {reminders.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="checkmark-done-circle-outline" size={32} color={theme.success} />
          <Text style={[styles.emptyCardTitle, { color: theme.text }]}>
            All caught up for today!
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>
            No pending reminders for today.
          </Text>
        </View>
      ) : (
        reminders.map((rem) => (
          <ReminderCard
            key={rem.id}
            reminder={rem}
            onToggle={handleToggleReminder}
            onEdit={(r) => router.push(`/add-reminder?id=${r.id}` as Href)}
            onDelete={handleDeleteReminder}
          />
        ))
      )}

      {/* Today's Meals Summary */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="restaurant-outline" size={20} color={theme.meal} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {"Today's Feeding"}
          </Text>
        </View>
        <SmoothPressable onPress={() => router.push('/log-meal' as Href)}>
          <Text style={[styles.seeAllText, { color: theme.buttonPrimary }]}>
            + Log Meal
          </Text>
        </SmoothPressable>
      </View>

      {todayMeals.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="fast-food-outline" size={28} color={theme.meal} />
          <Text style={[styles.emptyCardTitle, { color: theme.text }]}>
            No meals logged yet today
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>
            {"Tap \"+ Log Meal\" to record your pet's breakfast, dinner, or snacks."}
          </Text>
        </View>
      ) : (
        todayMeals.map((meal) => (
          <View
            key={meal.id}
            style={[
              styles.mealItem,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.mealIconCircle, { backgroundColor: theme.mealLight }]}>
              <Ionicons name="restaurant" size={16} color={theme.meal} />
            </View>
            <View style={styles.mealDetails}>
              <View style={styles.mealTop}>
                <Text style={[styles.mealType, { color: theme.text }]}>
                  {meal.meal_type}: {meal.food_name}
                </Text>
                <Text style={[styles.mealTime, { color: theme.textSecondary }]}>
                  {new Date(meal.logged_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {meal.amount} {meal.unit} • Appetite: {meal.appetite || 'Normal'}
              </Text>
            </View>
            <SmoothPressable
              onPress={() => handleDeleteMeal(meal.id)}
              style={styles.mealDeleteBtn}
              accessibilityLabel="Delete meal record"
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
            </SmoothPressable>
          </View>
        ))
      )}

      {/* AI Pet Care Assistant Banner */}
      <SmoothPressable
        onPress={() => router.push('/chat' as Href)}
        style={[
          styles.aiBanner,
          {
            backgroundColor: theme.primaryLight,
            borderColor: theme.buttonPrimary,
          },
        ]}
      >
        <View style={[styles.aiIcon, { backgroundColor: theme.buttonPrimary }]}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.aiTextWrap}>
          <Text style={[styles.aiTitle, { color: theme.text }]}>
            AI Pet Care Assistant
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            Ask questions about nutrition, grooming, symptoms, or behavior.
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={theme.buttonPrimary} />
      </SmoothPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerTitles: {
    flex: 1,
  },
  appName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  subGreeting: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 20,
    fontWeight: '800',
  },
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  speciesText: {
    fontSize: 11,
    fontWeight: '700',
  },
  breedText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#888',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    paddingTop: 12,
  },
  metricColumn: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginVertical: 4,
  },
  mealIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDetails: {
    flex: 1,
  },
  mealDeleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  mealTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '700',
  },
  mealTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextWrap: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
});
