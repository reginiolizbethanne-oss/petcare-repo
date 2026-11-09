import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { Button, IconButton } from '@/components/Button';
import { SmoothPressable } from '@/components/SmoothPressable';
import { createMeal } from '@/db/meals';
import { showToast } from '@/components/Toast';
import type { MealType, Appetite } from '@/db/types';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Treat'];
const UNITS = ['g', 'cups', 'oz', 'cans', 'scoops'];
const APPETITE_OPTIONS: Appetite[] = ['Normal', 'High', 'Low', 'Pick'];

export default function LogMealScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pets, activePet, refreshAll } = usePet();

  const [petId, setPetId] = useState<string>(activePet?.id || (pets[0]?.id ?? ''));
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [appetite, setAppetite] = useState<Appetite>('Normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!petId) {
      showToast('Please select or add a pet first.', 'warning', 'Pet Required');
      return;
    }
    if (!foodName.trim()) {
      showToast('Please enter the food name or brand.', 'warning', 'Food Required');
      return;
    }
    const numAmount = parseFloat(amount.trim());
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid numeric portion (e.g. 200).', 'warning', 'Invalid Portion');
      return;
    }

    const currentPet = pets.find((p) => p.id === petId) || activePet;

    setSaving(true);
    try {
      await createMeal({
        pet_id: petId,
        meal_type: mealType,
        food_name: foodName.trim(),
        amount: numAmount,
        unit,
        logged_at: Date.now(),
        appetite,
        notes: notes.trim() || undefined,
      });

      await refreshAll();
      showToast(
        `${mealType} for ${currentPet?.name || 'pet'} saved successfully!`,
        'success',
        'Meal Saved'
      );
      router.back();
    } catch (err) {
      console.warn('Save meal error:', err);
      showToast('Failed to save meal record. Please try again.', 'error', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.mealLight }]}>
                <Ionicons name="restaurant" size={26} color={theme.meal} />
              </View>
              <View style={styles.headerTitles}>
                <Text style={[styles.heading, { color: theme.text }]}>Log Pet Meal</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  Track diet, food brand, and portions
                </Text>
              </View>
            </View>
            <IconButton icon="close" label="Cancel" onPress={() => router.back()} />
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

        {/* Meal Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Meal Type</Text>
          <View style={styles.typeGrid}>
            {MEAL_TYPES.map((t) => {
              const isSelected = mealType === t;
              return (
                <SmoothPressable
                  key={t}
                  onPress={() => setMealType(t)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isSelected ? theme.meal : theme.card,
                      borderColor: isSelected ? theme.meal : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.typeText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {t}
                  </Text>
                </SmoothPressable>
              );
            })}
          </View>
        </View>

        {/* Food Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Food Name / Brand <Text style={{ color: theme.danger }}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g. Royal Canin Adult Dry Kibble, Salmon Pate"
            placeholderTextColor={theme.textSecondary}
            value={foodName}
            onChangeText={setFoodName}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Amount & Unit */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Portion / Amount <Text style={{ color: theme.danger }}>*</Text>
            </Text>
            <TextInput
              placeholder="e.g. 200"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            />
          </View>

          <View style={[styles.field, { width: 130 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
              {UNITS.map((u) => {
                const isSel = unit === u;
                return (
                  <SmoothPressable
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[
                      styles.unitChip,
                      {
                        backgroundColor: isSel ? theme.meal : theme.card,
                        borderColor: isSel ? theme.meal : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.unitText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                      {u}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Appetite Level */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Appetite Level</Text>
          <View style={styles.appetiteRow}>
            {APPETITE_OPTIONS.map((app) => {
              const isSelected = appetite === app;
              return (
                <SmoothPressable
                  key={app}
                  onPress={() => setAppetite(app)}
                  style={[
                    styles.appetiteChip,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.card,
                      borderColor: isSelected ? theme.buttonPrimary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.appetiteText,
                      { color: isSelected ? theme.buttonPrimary : theme.textSecondary },
                    ]}
                  >
                    {app}
                  </Text>
                </SmoothPressable>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Observations / Notes</Text>
          <TextInput
            placeholder="Drank water, added vitamin topper, ate fast..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            style={[
              styles.input,
              styles.notesInput,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Save Button */}
        <View style={styles.submitRow}>
          <Button
            label={saving ? 'Saving...' : 'Save Meal Entry'}
            disabled={saving}
            onPress={handleSave}
          />
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
          />
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
  submitRow: {
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
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  unitRow: {
    gap: 6,
    alignItems: 'center',
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
  },
  appetiteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  appetiteChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  appetiteText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
