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
import { createHealthNote } from '@/db/health';
import { showToast } from '@/components/Toast';
import type { HealthCategory } from '@/db/types';

const CATEGORIES: HealthCategory[] = [
  'General',
  'Symptom',
  'Vet Visit',
  'Medication',
  'Vaccination',
  'Allergy',
  'Surgery',
];

export default function LogHealthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pets, activePet, refreshAll } = usePet();

  const [petId, setPetId] = useState<string>(activePet?.id || (pets[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HealthCategory>('General');
  const [symptoms, setSymptoms] = useState('');
  const [medication, setMedication] = useState('');
  const [vetName, setVetName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!petId) {
      showToast('Please select or add a pet first.', 'warning', 'Pet Required');
      return;
    }
    if (!title.trim()) {
      showToast('Please provide a title or reason for this note.', 'warning', 'Title Required');
      return;
    }
    if (!notes.trim() && !symptoms.trim()) {
      showToast('Please enter some observations, symptoms, or notes.', 'warning', 'Details Required');
      return;
    }

    setSaving(true);
    try {
      await createHealthNote({
        pet_id: petId,
        title: title.trim(),
        category,
        notes: notes.trim() || 'Health observation recorded.',
        symptoms: symptoms.trim() || undefined,
        medication: medication.trim() || undefined,
        vet_name: vetName.trim() || undefined,
        logged_at: Date.now(),
      });

      await refreshAll();
      showToast('Health note recorded successfully!', 'success', 'Saved Successfully');
      router.back();
    } catch (err) {
      console.warn('Save health note error:', err);
      showToast('Failed to save health note. Please try again.', 'error', 'Save Failed');
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
              <View style={[styles.iconCircle, { backgroundColor: theme.healthLight }]}>
                <Ionicons name="medkit" size={26} color={theme.health} />
              </View>
              <View style={styles.headerTitles}>
                <Text style={[styles.heading, { color: theme.text }]}>Log Health Notes</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  Track symptoms, vet visits, and observations
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

        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <SmoothPressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.health : theme.card,
                      borderColor: isSelected ? theme.health : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {cat}
                  </Text>
                </SmoothPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Title / Reason <Text style={{ color: theme.danger }}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g. Annual Rabies Booster, Slight ear scratching"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Symptoms Observed */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Symptoms Observed (if any)</Text>
          <TextInput
            placeholder="e.g. Redness in left ear, mild lethargy after walk"
            placeholderTextColor={theme.textSecondary}
            value={symptoms}
            onChangeText={setSymptoms}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Medication Prescribed */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Medication / Treatment</Text>
          <TextInput
            placeholder="e.g. Amoxicillin 250mg 2x daily with meal"
            placeholderTextColor={theme.textSecondary}
            value={medication}
            onChangeText={setMedication}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Vet Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Vet / Clinic Name (Optional)</Text>
          <TextInput
            placeholder="e.g. Dr. Adams, Sunset Animal Hospital"
            placeholderTextColor={theme.textSecondary}
            value={vetName}
            onChangeText={setVetName}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Detailed Notes / Observations <Text style={{ color: theme.danger }}>*</Text>
          </Text>
          <TextInput
            placeholder="Add thorough observations, diet changes, recovery status..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.notesInput,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Submit */}
        <View style={styles.submitRow}>
          <Button
            label={saving ? 'Saving...' : 'Save Health Record'}
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
});
