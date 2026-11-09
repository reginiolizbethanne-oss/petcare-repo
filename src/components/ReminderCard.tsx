import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { Reminder, ReminderCategory } from '@/db/types';
import { SmoothPressable } from './SmoothPressable';
import { playReminderSound } from '@/utils/sounds';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (id: string) => void;
  showPetName?: string;
}

export function ReminderCard({
  reminder,
  onToggle,
  onEdit,
  onDelete,
  showPetName,
}: ReminderCardProps) {
  const theme = useTheme();

  const getCategoryColor = (cat: ReminderCategory) => {
    switch (cat) {
      case 'Feeding':
        return theme.meal;
      case 'Medication':
        return theme.health;
      case 'Grooming':
        return '#0284C7';
      case 'Vaccination':
        return '#D97706';
      case 'Vet Visit':
        return theme.reminder;
      case 'Exercise':
        return theme.weight;
      default:
        return theme.textSecondary;
    }
  };

  const formatDueDate = (timestamp: number) => {
    const due = new Date(timestamp);
    const now = new Date();
    const isToday =
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear();

    const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      due.getDate() === tomorrow.getDate() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getFullYear() === tomorrow.getFullYear();
    if (isTomorrow) return `Tomorrow at ${timeStr}`;

    return `${due.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  const isCompleted = reminder.completed === 1;
  const catColor = getCategoryColor(reminder.category);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: isCompleted ? 0.72 : 1,
        },
      ]}
    >
      <SmoothPressable
        onPress={() => onToggle(reminder.id)}
        style={[
          styles.checkbox,
          {
            borderColor: isCompleted ? theme.success : theme.border,
            backgroundColor: isCompleted ? theme.success : 'transparent',
          },
        ]}
      >
        {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </SmoothPressable>

      <View style={styles.contentWrap}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {reminder.title}
          </Text>
          <View style={styles.badgesWrap}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isCompleted ? '#DCFCE7' : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: isCompleted ? '#15803D' : '#B45309',
                  },
                ]}
              >
                {isCompleted ? 'Done' : 'Pending'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${catColor}1A` }]}>
              <Text style={[styles.badgeText, { color: catColor }]}>
                {reminder.category}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {formatDueDate(reminder.due_date)}
            </Text>
          </View>

          {reminder.frequency !== 'once' && (
            <View style={[styles.freqTag, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="repeat" size={12} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary, textTransform: 'capitalize' }]}>
                {reminder.frequency}
              </Text>
            </View>
          )}

          <SmoothPressable
            onPress={() => playReminderSound(reminder.sound || 'chime')}
            style={[styles.freqTag, { backgroundColor: theme.primaryLight }]}
            accessibilityLabel="Play reminder tone"
          >
            <Ionicons name="volume-medium" size={12} color={theme.buttonPrimary} />
            <Text style={[styles.metaText, { color: theme.buttonPrimary, fontWeight: '700' }]}>
              {reminder.sound ? reminder.sound.replace(/_/g, ' ') : 'chime'}
            </Text>
          </SmoothPressable>

          {showPetName && (
            <Text style={[styles.metaText, { color: theme.tint, fontWeight: '600' }]}>
              🐾 {showPetName}
            </Text>
          )}
        </View>

        {reminder.notes ? (
          <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
            {reminder.notes}
          </Text>
        ) : null}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <SmoothPressable
              onPress={() => onEdit(reminder)}
              style={styles.iconButton}
            >
              <Ionicons name="pencil" size={16} color={theme.textSecondary} />
            </SmoothPressable>
          )}
          {onDelete && (
            <SmoothPressable
              onPress={() => onDelete(reminder.id)}
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
            </SmoothPressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 5,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freqTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },
});
