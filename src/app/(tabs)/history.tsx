import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { SmoothPressable } from '@/components/SmoothPressable';
import { EmptyState } from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import { getCareHistory } from '@/db/history';
import { deleteMeal } from '@/db/meals';
import { deleteReminder } from '@/db/reminders';
import { cancelReminderNotification } from '@/services/notifications';
import { deleteHealthNote } from '@/db/health';
import { deleteWeightEntry } from '@/db/weights';
import type { HistoryItem, HistoryItemType } from '@/db/types';

type FilterType = 'All' | 'Meals' | 'Reminders' | 'Health' | 'Weight';

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { activePet, activePetId, refreshAll } = usePet();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getDbFilterType = (f: FilterType): HistoryItemType | undefined => {
    switch (f) {
      case 'Meals':
        return 'meal';
      case 'Reminders':
        return 'reminder';
      case 'Health':
        return 'health';
      case 'Weight':
        return 'weight';
      default:
        return undefined;
    }
  };

  const loadHistory = useCallback(async () => {
    try {
      const dbType = getDbFilterType(filter);
      const list = await getCareHistory({
        petId: activePetId || undefined,
        type: dbType,
        search: search.trim() || undefined,
      });
      setItems(list);
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  }, [activePetId, filter, search]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), loadHistory()]);
    setRefreshing(false);
  };

  const handleDeleteItem = (item: HistoryItem) => {
    confirmDelete(
      'Delete Record',
      `Delete this ${item.badge || 'care'} entry?`,
      async () => {
        try {
          if (item.type === 'meal') await deleteMeal(item.id);
          else if (item.type === 'reminder') {
            await cancelReminderNotification(item.id);
            await deleteReminder(item.id);
          }
          else if (item.type === 'health') await deleteHealthNote(item.id);
          else if (item.type === 'weight') await deleteWeightEntry(item.id);

          await loadHistory();
          await refreshAll();
          showToast(`${item.badge || 'Care'} record was deleted.`, 'info', 'Record Deleted');
        } catch (err) {
          console.warn('Failed to delete item:', err);
          showToast('Failed to delete record.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const getItemColor = (type: HistoryItemType) => {
    switch (type) {
      case 'meal':
        return theme.meal;
      case 'reminder':
        return theme.reminder;
      case 'health':
        return theme.health;
      case 'weight':
        return theme.weight;
      default:
        return theme.tint;
    }
  };

  const getItemIcon = (type: HistoryItemType): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (type) {
      case 'meal':
        return 'restaurant';
      case 'reminder':
        return 'alarm';
      case 'health':
        return 'medkit';
      case 'weight':
        return 'scale';
      default:
        return 'document-text';
    }
  };

  const filters: FilterType[] = ['All', 'Meals', 'Reminders', 'Health', 'Weight'];

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
        <Text style={[styles.title, { color: theme.text }]}>Care History</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          {activePet ? `Timeline records for ${activePet.name}` : 'All Pet History'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          placeholder="Search records, food, symptoms, notes..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadHistory}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {search.length > 0 && (
          <SmoothPressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </SmoothPressable>
        )}
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

      {/* Timeline Items */}
      {items.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No Care Records Found"
          message={
            search
              ? 'No records match your search criteria.'
              : 'Logged meals, reminders, health notes, and weight checks will show up in this history timeline.'
          }
          actionLabel={search ? 'Clear Search' : '+ Log Meal'}
          onAction={search ? () => setSearch('') : () => router.push('/log-meal' as Href)}
        />
      ) : (
        items.map((item) => {
          const itemColor = getItemColor(item.type);
          const iconName = getItemIcon(item.type);
          const dateStr = new Date(item.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View
              key={`${item.type}-${item.id}`}
              style={[
                styles.historyCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${itemColor}1A` }]}>
                <Ionicons name={iconName} size={20} color={itemColor} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: `${itemColor}15` }]}>
                    <Text style={[styles.typeBadgeText, { color: itemColor }]}>
                      {item.badge}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                  {item.subtitle}
                </Text>

                {item.details ? (
                  <Text style={[styles.itemDetails, { color: theme.textSecondary }]}>
                    {item.details}
                  </Text>
                ) : null}

                <View style={styles.footerRow}>
                  <View style={styles.timestampRow}>
                    <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
                      {dateStr} at {timeStr}
                    </Text>
                  </View>

                  <SmoothPressable
                    onPress={() => handleDeleteItem(item)}
                    style={styles.deleteAction}
                  >
                    <Ionicons name="trash-outline" size={15} color={theme.danger} />
                  </SmoothPressable>
                </View>
              </View>
            </View>
          );
        })
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
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteAction: {
    padding: 4,
  },
});
