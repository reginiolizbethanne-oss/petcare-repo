import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Linking,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { SmoothPressable } from '@/components/SmoothPressable';
import { EmptyState } from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { updatePet } from '@/db/pets';
import type { Pet } from '@/db/types';

export default function PetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pets, activePet, activePetId, setActivePetId, refreshAll } = usePet();
  const [refreshing, setRefreshing] = useState(false);

  // Edit / Add Emergency Contact Modal state
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [vetName, setVetName] = useState('');
  const [vetClinic, setVetClinic] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Currently displayed pet (active pet or first pet)
  const currentPet: Pet | null =
    pets.find((p) => p.id === activePetId) || activePet || (pets.length > 0 ? pets[0] : null);

  const formatAge = (birthdate?: string): string => {
    if (!birthdate) return '3 years';
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return '3 years';
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    if (diffMonths < 1) return 'Newborn';
    if (diffMonths < 12) return `${diffMonths} mo`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
  };

  const handleMakeCall = (phone: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned || '0281234567'}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          showToast(`Calling ${phone}...`, 'info', 'Phone Dial');
        }
      })
      .catch(() => {
        showToast(`Calling ${phone}...`, 'info', 'Phone Dial');
      });
  };

  const openContactModal = () => {
    setVetName(currentPet?.vet_name || 'Dr. Sarah Chen');
    setVetClinic(currentPet?.vet_clinic || 'Happy Paws Veterinary Clinic');
    setVetPhone(currentPet?.vet_phone || '(02) 8123-4567');
    setContactModalVisible(true);
  };

  const saveContact = async () => {
    if (!currentPet) return;
    setSavingContact(true);
    try {
      await updatePet(currentPet.id, {
        vet_name: vetName.trim() || undefined,
        vet_clinic: vetClinic.trim() || undefined,
        vet_phone: vetPhone.trim() || undefined,
      });
      await refreshAll();
      showToast('Emergency contact updated successfully!', 'success', 'Contact Saved');
      setContactModalVisible(false);
    } catch {
      showToast('Failed to save contact information.', 'error', 'Error');
    } finally {
      setSavingContact(false);
    }
  };

  // Allergies list helper
  const getAllergiesList = (): string[] => {
    if (!currentPet?.allergies) {
      if (currentPet?.name === 'Buddy' || !currentPet) {
        return ['Wheat', 'Dairy'];
      }
      return [];
    }
    return currentPet.allergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (pets.length === 0) {
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
        <EmptyState
          icon="paw-outline"
          title="No Pets Registered"
          message="Add your companion profile to track their stats, vaccines, feeding, and emergency vet contacts."
          actionLabel="+ Add Pet Profile"
          onAction={() => router.push('/pet-form' as Href)}
        />
      </ScrollView>
    );
  }

  const allergies = getAllergiesList();
  const contactName = currentPet?.vet_name || 'Dr. Sarah Chen';
  const contactClinic = currentPet?.vet_clinic || 'Happy Paws Veterinary Clinic';
  const contactPhone = currentPet?.vet_phone || '(02) 8123-4567';

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
      {/* Pet Selector Bar (if multiple pets or adding new pet) */}
      <View style={styles.topSelectorRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petTabsScroll}>
          {pets.map((p) => {
            const isSelected = p.id === currentPet?.id;
            return (
              <SmoothPressable
                key={p.id}
                onPress={() => setActivePetId(p.id)}
                style={[
                  styles.petTabPill,
                  {
                    backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                    borderColor: isSelected ? theme.buttonPrimary : theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 13 }}>{p.species === 'Cat' ? '🐱' : '🐶'}</Text>
                <Text
                  style={[
                    styles.petTabPillText,
                    { color: isSelected ? '#FFFFFF' : theme.text, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {p.name}
                </Text>
              </SmoothPressable>
            );
          })}
          <SmoothPressable
            onPress={() => router.push('/pet-form' as Href)}
            style={[styles.petTabAdd, { borderColor: theme.border, backgroundColor: theme.card }]}
          >
            <Ionicons name="add" size={16} color={theme.buttonPrimary} />
            <Text style={[styles.petTabAddText, { color: theme.buttonPrimary }]}>Add Pet</Text>
          </SmoothPressable>
        </ScrollView>
      </View>

      {/* Main Pet Header Card */}
      <View style={styles.profileHeader}>
        {/* Avatar with Edit Badge */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: '#FFEFEA' }]}>
            {currentPet?.photo_uri ? (
              <Image source={{ uri: currentPet.photo_uri }} style={styles.avatarImg} resizeMode="cover" />
            ) : (
              <View style={styles.avatarGraphic}>
                <Text style={{ fontSize: 58 }}>{currentPet?.species === 'Cat' ? '🐱' : '🐕'}</Text>
              </View>
            )}
          </View>
          <SmoothPressable
            onPress={() => router.push(`/pet-form?id=${currentPet?.id}` as Href)}
            style={[styles.editBadge, { backgroundColor: theme.buttonPrimary }]}
          >
            <Ionicons name="pencil" size={15} color="#FFFFFF" />
          </SmoothPressable>
        </View>

        {/* Pet Name & Breed */}
        <Text style={[styles.petName, { color: theme.text }]}>
          {currentPet?.name || 'Buddy'}
        </Text>
        <Text style={[styles.petBreed, { color: theme.textSecondary }]}>
          {currentPet?.breed || 'Golden Retriever'}
        </Text>

        {/* Allergies Row */}
        <View style={styles.allergiesRow}>
          <Text style={[styles.allergiesLabel, { color: theme.textSecondary }]}>Allergies:</Text>
          {allergies.length > 0 ? (
            allergies.map((allergy, idx) => (
              <View key={idx} style={styles.allergyTag}>
                <Text style={styles.allergyTagText}>{allergy}</Text>
              </View>
            ))
          ) : (
            <SmoothPressable onPress={() => router.push(`/pet-form?id=${currentPet?.id}` as Href)}>
              <Text style={{ color: theme.buttonPrimary, fontSize: 13, fontWeight: '600' }}>
                + Add Allergies
              </Text>
            </SmoothPressable>
          )}
        </View>
      </View>

      {/* CORE STATS Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>CORE STATS</Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Breed */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>🐕</Text>
            <Text style={styles.statLabel}>BREED</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
            {currentPet?.breed || 'Golden Retriever'}
          </Text>
        </View>

        {/* Age */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>🎂</Text>
            <Text style={styles.statLabel}>AGE</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatAge(currentPet?.birthdate)}
          </Text>
        </View>

        {/* Weight */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>⚖️</Text>
            <Text style={styles.statLabel}>WEIGHT</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {currentPet?.weight ? `${currentPet.weight} ${currentPet.weight_unit || 'kg'}` : '28.5 kg'}
          </Text>
        </View>

        {/* Gender */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>♂️</Text>
            <Text style={styles.statLabel}>GENDER</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {currentPet?.gender || 'Male'}
          </Text>
        </View>

        {/* Microchip */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>🏷️</Text>
            <Text style={styles.statLabel}>MICROCHIP</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
            {currentPet?.microchip_id || '985#0012781'}
          </Text>
        </View>

        {/* Diet */}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statEmoji}>🍽️</Text>
            <Text style={styles.statLabel}>DIET</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
            {currentPet?.diet || 'Dry Kibble'}
          </Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionsRow}>
        {/* Vaccines */}
        <SmoothPressable
          onPress={() => router.push('/log-health' as Href)}
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={{ fontSize: 24 }}>💉</Text>
          <Text style={[styles.actionCardText, { color: theme.text }]}>Vaccines</Text>
        </SmoothPressable>

        {/* Health Log */}
        <SmoothPressable
          onPress={() => router.push('/(tabs)/history' as Href)}
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={{ fontSize: 24 }}>📋</Text>
          <Text style={[styles.actionCardText, { color: theme.text }]}>Health Log</Text>
        </SmoothPressable>

        {/* Feeding */}
        <SmoothPressable
          onPress={() => router.push('/log-meal' as Href)}
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={{ fontSize: 24 }}>🍽️</Text>
          <Text style={[styles.actionCardText, { color: theme.text }]}>Feeding</Text>
        </SmoothPressable>
      </View>

      {/* EMERGENCY CONTACTS Section */}
      <View style={styles.emergencyHeaderRow}>
        <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
        <SmoothPressable onPress={openContactModal} style={styles.addContactBtn}>
          <Text style={styles.addContactText}>+ Add Contact</Text>
        </SmoothPressable>
      </View>

      {/* Vet Clinic Card */}
      <View style={styles.vetCard}>
        <View style={styles.clinicIconBox}>
          <Text style={{ fontSize: 24 }}>🏥</Text>
        </View>

        <View style={styles.vetInfo}>
          <Text style={[styles.vetDoctor, { color: theme.text }]}>{contactName}</Text>
          <Text style={[styles.vetClinic, { color: theme.textSecondary }]}>{contactClinic}</Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call" size={13} color={theme.textSecondary} />
            <Text style={[styles.vetPhone, { color: theme.textSecondary }]}>{contactPhone}</Text>
          </View>
        </View>

        <View style={styles.vetActions}>
          <SmoothPressable onPress={openContactModal} style={styles.vetEditBtn}>
            <Ionicons name="create-outline" size={17} color={theme.textSecondary} />
          </SmoothPressable>
          <SmoothPressable onPress={() => handleMakeCall(contactPhone)} style={styles.callBtn}>
            <Text style={styles.callBtnText}>Call</Text>
          </SmoothPressable>
        </View>
      </View>

      {/* Edit / Add Contact Modal */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Emergency Contact</Text>
              <SmoothPressable onPress={() => setContactModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </SmoothPressable>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>Veterinarian Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={vetName}
                onChangeText={setVetName}
                placeholder="Dr. Sarah Chen"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>Clinic Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={vetClinic}
                onChangeText={setVetClinic}
                placeholder="Happy Paws Veterinary Clinic"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>Emergency Phone Number</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={vetPhone}
                onChangeText={setVetPhone}
                placeholder="(02) 8123-4567"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <SmoothPressable
                onPress={() => setContactModalVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </SmoothPressable>
              <SmoothPressable
                onPress={saveContact}
                disabled={savingContact}
                style={[styles.modalSaveBtn, { backgroundColor: theme.buttonPrimary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {savingContact ? 'Saving...' : 'Save Contact'}
                </Text>
              </SmoothPressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topSelectorRow: {
    marginBottom: 12,
  },
  petTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  petTabPillText: {
    fontSize: 13,
  },
  petTabAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  petTabAddText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  petName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  petBreed: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  allergiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  allergiesLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  allergyTag: {
    backgroundColor: '#FFEFEA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  allergyTagText: {
    color: '#E05838',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    minHeight: 74,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statEmoji: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionCardText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addContactBtn: {
    backgroundColor: '#FFEFEA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  addContactText: {
    color: '#FF6B4A',
    fontSize: 12,
    fontWeight: '700',
  },
  vetCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE4D8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vetDoctor: {
    fontSize: 15,
    fontWeight: '700',
  },
  vetClinic: {
    fontSize: 12,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  vetPhone: {
    fontSize: 12,
    fontWeight: '500',
  },
  vetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vetEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  callBtn: {
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
