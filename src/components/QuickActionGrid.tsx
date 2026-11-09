import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { SmoothPressable } from './SmoothPressable';
import { showToast } from './Toast';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  route: string;
  color: string;
  bgLight: string;
}

export function QuickActionGrid() {
  const theme = useTheme();
  const router = useRouter();
  const { pets } = usePet();

  const handleAction = (route: string) => {
    if (pets.length === 0) {
      showToast('Please add a pet first before recording care activities.', 'warning', 'Add Pet First');
      router.push('/pet-form' as Href);
      return;
    }
    router.push(route as Href);
  };

  const actions: ActionItem[] = [
    {
      id: 'meal',
      label: 'Log Meal',
      description: 'Portion & food',
      icon: 'restaurant',
      route: '/log-meal',
      color: theme.meal,
      bgLight: theme.mealLight,
    },
    {
      id: 'reminder',
      label: 'Add Reminder',
      description: 'Med, groom, feed',
      icon: 'alarm',
      route: '/add-reminder',
      color: theme.reminder,
      bgLight: theme.reminderLight,
    },
    {
      id: 'health',
      label: 'Health Notes',
      description: 'Symptoms & vet',
      icon: 'medkit',
      route: '/log-health',
      color: theme.health,
      bgLight: theme.healthLight,
    },
    {
      id: 'weight',
      label: 'Weight Entry',
      description: 'Track growth',
      icon: 'scale',
      route: '/weight-entry',
      color: theme.weight,
      bgLight: theme.weightLight,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Quick Actions
      </Text>
      <View style={styles.grid}>
        {actions.map((act) => (
          <SmoothPressable
            key={act.id}
            onPress={() => handleAction(act.route)}
            style={[
              styles.tile,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: act.bgLight }]}>
              <Ionicons name={act.icon} size={22} color={act.color} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.tileLabel, { color: theme.text }]}>
                {act.label}
              </Text>
              <Text style={[styles.tileDesc, { color: theme.textSecondary }]}>
                {act.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textSecondary}
              style={styles.chevron}
            />
          </SmoothPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48.5%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  chevron: {
    opacity: 0.6,
  },
});
