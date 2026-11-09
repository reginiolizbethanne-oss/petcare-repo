import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { Button, IconButton } from '@/components/Button';
import { SmoothPressable } from '@/components/SmoothPressable';
import { WeightChart } from '@/components/WeightChart';
import {
  createWeightEntry,
  getAllWeightEntries,
  deleteWeightEntry,
} from '@/db/weights';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import type { WeightEntry, WeightUnit } from '@/db/types';

export default function WeightEntryScreen() {
  const theme = useTheme();
  const router = useRouter();
  useLocalSearchParams();
  const { pets, activePet, refreshAll } = usePet();

  const [petId, setPetId] = useState<string>(activePet?.id || (pets[0]?.id ?? ''));
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!petId) return;
    try {
      const list = await getAllWeightEntries(petId);
      setHistory(list);
    } catch (err) {
      console.warn('Failed to load weight history:', err);
    }
  }, [petId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHistory();
  }, [loadHistory]);

  const handleSave = async () => {
    if (!petId) {
      showToast('Please add or select a pet first.', 'warning', 'Pet Required');
      return;
    }
    const numWeight = parseFloat(weight.trim());
    if (isNaN(numWeight) || numWeight <= 0) {
      showToast('Please enter a valid numeric weight (e.g. 24.5).', 'warning', 'Invalid Weight');
      return;
    }

    setSaving(true);
    try {
      await createWeightEntry({
        pet_id: petId,
        weight: numWeight,
        unit,
        logged_at: Date.now(),
        notes: notes.trim() || undefined,
      });

      setWeight('');
      setNotes('');
      await loadHistory();
      await refreshAll();
      showToast(`Recorded ${numWeight} ${unit} successfully!`, 'success', 'Weight Saved');
    } catch (err) {
      console.warn('Save weight error:', err);
      showToast('Failed to save weight entry. Please try again.', 'error', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = (entry: WeightEntry) => {
    confirmDelete(
      'Delete Weight Entry',
      `Delete entry of ${entry.weight} ${entry.unit}?`,
      async () => {
        try {
          await deleteWeightEntry(entry.id);
          await loadHistory();
          await refreshAll();
          showToast(`Deleted ${entry.weight} ${entry.unit} record.`, 'info', 'Entry Deleted');
        } catch (err) {
          console.warn('Delete weight error:', err);
          showToast('Failed to delete weight entry.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const selectedPet = pets.find((p) => p.id === petId) || activePet;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.weightLight }]}>
                <Ionicons name="scale" size={26} color={theme.weight} />
              </View>
              <View style={styles.headerTitles}>
                <Text style={[styles.heading, { color: theme.text }]}>Weight Tracker</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  Monitor growth milestones & trends
                </Text>
              </View>
            </View>
            <IconButton icon="close" label="Close" onPress={() => router.back()} />
          </View>
        </View>

        {/* If no pets */}
        {pets.length === 0 && (
          <View style={[styles.emptyPetCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="paw-outline" size={26} color={theme.buttonPrimary} />
            <Text style={[styles.emptyPetText, { color: theme.text }]}>
              No pet profile found
            </Text>
            <Button
              label="+ Add Your Pet"
              onPress={() => router.push('/pet-form' as Href)}
            />
          </View>
        )}

        {/* Pet Selector */}
        {pets.length > 1 && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Select Pet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {pets.map((p) => {
                const isSelected = p.id === petId;
                return (
                  <SmoothPressable
                    key={p.id}
                    onPress={() => setPetId(p.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                        borderColor: isSelected ? theme.buttonPrimary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      🐾 {p.name}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Visual Chart */}
        <WeightChart
          entries={history}
          unit={unit}
          petName={selectedPet?.name}
        />

        {/* New Entry Form Card */}
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Log New Weight</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.text }]}>
                Weight Value <Text style={{ color: theme.danger }}>*</Text>
              </Text>
              <TextInput
                placeholder="e.g. 24.8"
                placeholderTextColor={theme.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              />
            </View>

            <View style={[styles.field, { width: 110 }]}>
              <Text style={[styles.label, { color: theme.text }]}>Unit</Text>
              <View style={styles.unitToggleRow}>
                {(['kg', 'lbs'] as WeightUnit[]).map((u) => {
                  const isSel = unit === u;
                  return (
                    <SmoothPressable
                      key={u}
                      onPress={() => setUnit(u)}
                      style={[
                        styles.unitBtn,
                        {
                          backgroundColor: isSel ? theme.weight : theme.inputBackground,
                          borderColor: isSel ? theme.weight : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.unitBtnText, { color: isSel ? '#FFFFFF' : theme.textSecondary }]}>
                        {u}
                      </Text>
                    </SmoothPressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
            <TextInput
              placeholder="e.g. Home digital scale, post-walk weigh-in..."
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              label={saving ? 'Recording...' : 'Add Weight Record'}
              disabled={saving}
              onPress={handleSave}
              style={{ flex: 1 }}
            />
            <Button
              label="Done"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </View>

        {/* Recent History Table */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recorded Measurements
          </Text>

          {history.length === 0 ? (
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              No measurements on file yet.
            </Text>
          ) : (
            [...history].reverse().map((entry) => (
              <View
                key={entry.id}
                style={[styles.historyRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.weightBadge, { backgroundColor: theme.weightLight }]}>
                  <Text style={[styles.weightBadgeText, { color: theme.weight }]}>
                    {entry.weight} {entry.unit}
                  </Text>
                </View>

                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: theme.text }]}>
                    {new Date(entry.logged_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  {entry.notes ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      {entry.notes}
                    </Text>
                  ) : null}
                </View>

                <SmoothPressable
                  onPress={() => handleDeleteEntry(entry)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </SmoothPressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  topHeader: {
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitles: {
    flex: 1,
  },
  emptyPetCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  emptyPetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  unitToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  historySection: {
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  weightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  weightBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
});
