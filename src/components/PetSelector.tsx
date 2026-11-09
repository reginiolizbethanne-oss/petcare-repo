import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { PetAvatar } from './PetAvatar';
import { SmoothPressable } from './SmoothPressable';

export function PetSelector() {
  const { pets, activePetId, setActivePetId } = usePet();
  const theme = useTheme();
  const router = useRouter();

  if (pets.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pets.map((pet) => {
          const isActive = pet.id === activePetId;
          return (
            <SmoothPressable
              key={pet.id}
              onPress={() => setActivePetId(pet.id)}
              style={[
                styles.petChip,
                {
                  backgroundColor: isActive ? theme.buttonPrimary : theme.card,
                  borderColor: isActive ? theme.buttonPrimary : theme.border,
                },
              ]}
            >
              <PetAvatar
                uri={pet.photo_uri}
                species={pet.species}
                size={28}
                name={pet.name}
              />
              <Text
                style={[
                  styles.petName,
                  { color: isActive ? '#FFFFFF' : theme.text },
                ]}
                numberOfLines={1}
              >
                {pet.name}
              </Text>
              {isActive && (
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
              )}
            </SmoothPressable>
          );
        })}

        <SmoothPressable
          onPress={() => router.push('/pet-form' as Href)}
          style={[
            styles.addChip,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="add" size={18} color={theme.buttonPrimary} />
          <Text style={[styles.addText, { color: theme.buttonPrimary }]}>
            Add Pet
          </Text>
        </SmoothPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 90,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
