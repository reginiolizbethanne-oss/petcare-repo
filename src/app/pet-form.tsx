import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { Button, IconButton } from '@/components/Button';
import { SmoothPressable } from '@/components/SmoothPressable';
import { PetAvatar } from '@/components/PetAvatar';
import { createPet, getPetById, updatePet, deletePet } from '@/db/pets';
import { pickImage } from '@/attachments/files';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import type { Species, Gender, WeightUnit } from '@/db/types';

const SPECIES_OPTIONS: Species[] = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Other'];
const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Unknown'];
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80', // Golden
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', // Cat
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80', // Puppy
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80', // Beagle
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', // Dog
];

export default function PetFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);

  const { refreshAll } = usePet();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [microchip, setMicrochip] = useState('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [allergies, setAllergies] = useState('');
  const [diet, setDiet] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetClinic, setVetClinic] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      getPetById(params.id).then((pet) => {
        if (pet) {
          setName(pet.name);
          setSpecies(pet.species);
          setBreed(pet.breed || '');
          setGender(pet.gender || 'Unknown');
          setBirthdate(pet.birthdate || '');
          setWeight(pet.weight != null ? String(pet.weight) : '');
          setWeightUnit(pet.weight_unit || 'kg');
          setMicrochip(pet.microchip_id || '');
          setPhotoUri(pet.photo_uri || '');
          setAllergies(pet.allergies || '');
          setDiet(pet.diet || '');
          setVetName(pet.vet_name || '');
          setVetClinic(pet.vet_clinic || '');
          setVetPhone(pet.vet_phone || '');
          setNotes(pet.notes || '');
        }
      });
    }
  }, [params.id]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Please enter your pet’s name.', 'warning', 'Name Required');
      return;
    }

    const trimmedWeight = weight.trim();
    let numWeight: number | undefined;
    if (trimmedWeight) {
      const parsed = parseFloat(trimmedWeight);
      if (isNaN(parsed) || parsed <= 0) {
        showToast('Please enter a valid numeric weight (e.g. 14.5).', 'warning', 'Invalid Weight');
        return;
      }
      numWeight = parsed;
    }

    setSaving(true);
    try {
      if (isEditing && params.id) {
        await updatePet(params.id, {
          name: name.trim(),
          species,
          breed: breed.trim() || undefined,
          gender,
          birthdate: birthdate.trim() || undefined,
          weight: numWeight,
          weight_unit: weightUnit,
          photo_uri: photoUri.trim() || undefined,
          microchip_id: microchip.trim() || undefined,
          allergies: allergies.trim() || undefined,
          diet: diet.trim() || undefined,
          vet_name: vetName.trim() || undefined,
          vet_clinic: vetClinic.trim() || undefined,
          vet_phone: vetPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await createPet({
          name: name.trim(),
          species,
          breed: breed.trim() || undefined,
          gender,
          birthdate: birthdate.trim() || undefined,
          weight: numWeight,
          weight_unit: weightUnit,
          photo_uri: photoUri.trim() || undefined,
          microchip_id: microchip.trim() || undefined,
          allergies: allergies.trim() || undefined,
          diet: diet.trim() || undefined,
          vet_name: vetName.trim() || undefined,
          vet_clinic: vetClinic.trim() || undefined,
          vet_phone: vetPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          is_active: 1,
        });
      }

      await refreshAll();
      showToast(
        isEditing ? `${name.trim()} updated successfully!` : `${name.trim()} added successfully!`,
        'success',
        'Saved Successfully'
      );
      router.back();
    } catch (err) {
      console.warn('Save error:', err);
      showToast('Could not save pet profile. Please try again.', 'error', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;
    confirmDelete(
      'Delete Pet Profile',
      `Are you sure you want to delete ${name || 'this pet'}? All associated history, meals, reminders, and weights will be permanently deleted.`,
      async () => {
        try {
          await deletePet(params.id!);
          await refreshAll();
          showToast(`${name || 'Pet'} profile was deleted.`, 'info', 'Profile Deleted');
          router.back();
        } catch {
          showToast('Failed to delete pet profile.', 'error', 'Delete Failed');
        }
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topHeader}>
          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heading, { color: theme.text }]}>
                {isEditing ? 'Edit Pet Profile' : 'Add New Pet'}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                Keep accurate medical, feeding, and identification records
              </Text>
            </View>
            <IconButton
              icon="close"
              label="Cancel"
              onPress={() => router.back()}
            />
          </View>
        </View>

        {/* Avatar Preview & Selection */}
        <View style={styles.avatarSection}>
          <PetAvatar
            uri={photoUri}
            species={species}
            size={88}
            name={name}
            borderColor={theme.buttonPrimary}
          />
          <SmoothPressable
            onPress={async () => {
              const uri = await pickImage();
              if (uri) setPhotoUri(uri);
            }}
            style={[
              styles.uploadBtn,
              { backgroundColor: theme.primaryLight, borderColor: theme.buttonPrimary },
            ]}
          >
            <Ionicons name="camera-outline" size={17} color={theme.buttonPrimary} />
            <Text style={[styles.uploadBtnText, { color: theme.buttonPrimary }]}>
              {photoUri && !photoUri.startsWith('http') ? 'Change Device Photo' : 'Upload Pet Photo'}
            </Text>
          </SmoothPressable>
          <Text style={[styles.avatarLabel, { color: theme.textSecondary }]}>
            Or pick a preset avatar:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
            {AVATAR_PRESETS.map((url, i) => (
              <SmoothPressable
                key={i}
                onPress={() => setPhotoUri(url)}
                style={[
                  styles.presetCircle,
                  {
                    borderColor: photoUri === url ? theme.buttonPrimary : theme.border,
                    borderWidth: photoUri === url ? 3 : 1,
                  },
                ]}
              >
                <PetAvatar uri={url} species={species} size={44} />
              </SmoothPressable>
            ))}
          </ScrollView>
        </View>

        {/* Pet Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Pet Name <Text style={{ color: theme.danger }}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g. Luna, Cooper, Milo"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Species Selector */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Species</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SPECIES_OPTIONS.map((sp) => {
              const isSelected = species === sp;
              return (
                <SmoothPressable
                  key={sp}
                  onPress={() => setSpecies(sp)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                      borderColor: isSelected ? theme.buttonPrimary : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {sp}
                  </Text>
                </SmoothPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Breed & Gender */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Breed</Text>
            <TextInput
              placeholder="e.g. Labrador Retriever"
              placeholderTextColor={theme.textSecondary}
              value={breed}
              onChangeText={setBreed}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            />
          </View>

          <View style={[styles.field, { width: 120 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.slice(0, 2).map((g) => {
                const sel = gender === g;
                return (
                  <SmoothPressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.genderChip,
                      {
                        backgroundColor: sel ? theme.buttonPrimary : theme.card,
                        borderColor: sel ? theme.buttonPrimary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.genderText, { color: sel ? '#FFFFFF' : theme.text }]}>
                      {g}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Birthdate & Weight */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Birthdate (YYYY-MM-DD)</Text>
            <TextInput
              placeholder="2024-03-15"
              placeholderTextColor={theme.textSecondary}
              value={birthdate}
              onChangeText={setBirthdate}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            />
          </View>

          <View style={[styles.field, { width: 130 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Weight</Text>
            <View style={styles.weightInputRow}>
              <TextInput
                placeholder="24.5"
                placeholderTextColor={theme.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={[
                  styles.input,
                  styles.weightInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
              />
              <SmoothPressable
                onPress={() => setWeightUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
                style={[styles.unitToggle, { backgroundColor: theme.primaryLight }]}
              >
                <Text style={[styles.unitText, { color: theme.buttonPrimary }]}>{weightUnit}</Text>
              </SmoothPressable>
            </View>
          </View>
        </View>

        {/* Microchip Number */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Microchip ID (Optional)</Text>
          <TextInput
            placeholder="e.g. 985#0012781"
            placeholderTextColor={theme.textSecondary}
            value={microchip}
            onChangeText={setMicrochip}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Allergies */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Allergies (comma-separated)</Text>
          <TextInput
            placeholder="e.g. Wheat, Dairy, Chicken"
            placeholderTextColor={theme.textSecondary}
            value={allergies}
            onChangeText={setAllergies}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Diet */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Diet / Food Preference</Text>
          <TextInput
            placeholder="e.g. Dry Kibble, Wet Food, Raw"
            placeholderTextColor={theme.textSecondary}
            value={diet}
            onChangeText={setDiet}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Emergency Vet Contact */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Emergency Vet Contact</Text>
          <TextInput
            placeholder="Veterinarian Name (e.g. Dr. Sarah Chen)"
            placeholderTextColor={theme.textSecondary}
            value={vetName}
            onChangeText={setVetName}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text, marginBottom: 8 }]}
          />
          <TextInput
            placeholder="Clinic Name (e.g. Happy Paws Veterinary Clinic)"
            placeholderTextColor={theme.textSecondary}
            value={vetClinic}
            onChangeText={setVetClinic}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text, marginBottom: 8 }]}
          />
          <TextInput
            placeholder="Phone Number (e.g. (02) 8123-4567)"
            placeholderTextColor={theme.textSecondary}
            value={vetPhone}
            onChangeText={setVetPhone}
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Care Notes & Allergies</Text>
          <TextInput
            placeholder="Special dietary needs, favorite treats, temperaments..."
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
            label={saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Pet Profile'}
            disabled={saving}
            onPress={handleSave}
          />
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
          />
          {isEditing && (
            <Button
              label="Delete Pet Profile"
              variant="destructiveSecondary"
              icon="trash-outline"
              onPress={handleDelete}
            />
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
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  presetsRow: {
    gap: 10,
    paddingVertical: 6,
  },
  presetCircle: {
    borderRadius: 24,
    padding: 2,
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
    minHeight: 80,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightInput: {
    flex: 1,
  },
  unitToggle: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitRow: {
    marginTop: 10,
    gap: 10,
  },
});
