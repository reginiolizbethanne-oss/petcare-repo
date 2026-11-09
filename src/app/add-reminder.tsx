import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { Button, IconButton } from '@/components/Button';
import { SmoothPressable } from '@/components/SmoothPressable';
import { createReminder, getReminderById, updateReminder, deleteReminder } from '@/db/reminders';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import { SOUND_OPTIONS, playReminderSound, normalizeSoundId } from '@/utils/sounds';
import {
  scheduleReminderNotification,
  cancelReminderNotification,
} from '@/services/notifications';
import type { ReminderCategory, ReminderFrequency, ReminderSound } from '@/db/types';

const CATEGORIES: ReminderCategory[] = [
  'Feeding',
  'Medication',
  'Grooming',
  'Vaccination',
  'Vet Visit',
  'Exercise',
  'Other',
];

const FREQUENCY_OPTIONS: { id: ReminderFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'once', label: 'Once' },
];

export default function AddReminderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);

  const { pets, activePet, refreshAll } = usePet();

  const [petId, setPetId] = useState<string>(activePet?.id || (pets[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('Feeding');
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [selectedSound, setSelectedSound] = useState<ReminderSound>('chime');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingNotificationId, setExistingNotificationId] = useState<string | null>(null);

  // Exact date & time state
  const [targetDate, setTargetDate] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  });

  const [hour12, setHour12] = useState<number>(() => {
    const h = targetDate.getHours() % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState<number>(() => targetDate.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(() =>
    targetDate.getHours() >= 12 ? 'PM' : 'AM'
  );

  // Mobile Picker Modals
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
  const [showMobileTimePicker, setShowMobileTimePicker] = useState(false);

  useEffect(() => {
    if (params.id) {
      getReminderById(params.id).then((rem) => {
        if (rem) {
          setPetId(rem.pet_id);
          setTitle(rem.title);
          setCategory(rem.category);
          setFrequency(rem.frequency);
          setSelectedSound(normalizeSoundId(rem.sound));
          setNotes(rem.notes || '');
          setExistingNotificationId(rem.notification_id || null);

          if (rem.due_date) {
            const due = new Date(rem.due_date);
            setTargetDate(due);
            const h = due.getHours() % 12;
            setHour12(h === 0 ? 12 : h);
            setMinute(due.getMinutes());
            setPeriod(due.getHours() >= 12 ? 'PM' : 'AM');
          }
        }
      });
    }
  }, [params.id]);

  // Synchronize targetDate whenever hour12, minute, or period changes
  const computedDueDate = useMemo(() => {
    let hours24 = hour12 % 12;
    if (period === 'PM') hours24 += 12;
    const d = new Date(targetDate);
    d.setHours(hours24, minute, 0, 0);
    return d;
  }, [targetDate, hour12, minute, period]);

  // Format: MM/DD/YYYY (e.g. 09/14/2026)
  const formattedDateStr = useMemo(() => {
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const y = targetDate.getFullYear();
    return `${m}/${d}/${y}`;
  }, [targetDate]);

  // Format: hh:mm AM/PM (e.g. 07:00 AM)
  const formattedTimeStr = useMemo(() => {
    const hStr = String(hour12).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    return `${hStr}:${mStr} ${period}`;
  }, [hour12, minute, period]);

  // ISO string for HTML date input (YYYY-MM-DD)
  const dateInputVal = useMemo(() => {
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [targetDate]);

  // ISO string for HTML time input (HH:mm)
  const timeInputVal = useMemo(() => {
    let h = hour12 % 12;
    if (period === 'PM') h += 12;
    const hStr = String(h).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }, [hour12, minute, period]);

  const handleWebDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      const d = new Date(year, month - 1, day);
      setTargetDate(d);
    }
  };

  const handleWebTimeChange = (timeStr: string) => {
    if (!timeStr) return;
    const [h, m] = timeStr.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      setHour12(h % 12 === 0 ? 12 : h % 12);
      setMinute(m);
      setPeriod(h >= 12 ? 'PM' : 'AM');
    }
  };

  const handlePreviewSound = (soundId: ReminderSound) => {
    playReminderSound(soundId);
  };

  const handleSave = async () => {
    if (!petId) {
      showToast('Please select or add a pet first.', 'warning', 'Pet Required');
      return;
    }
    if (!title.trim()) {
      showToast('Please enter a reminder title.', 'warning', 'Title Required');
      return;
    }

    const triggerMs = computedDueDate.getTime();
    if (frequency === 'once' && triggerMs <= Date.now() - 60000) {
      showToast(
        'The reminder time is set in the past. Please select an upcoming date and time.',
        'warning',
        'Check Time'
      );
      return;
    }

    setSaving(true);
    try {
      const chosenPet = pets.find((p) => p.id === petId) || activePet;
      let scheduledNotifId: string | null = null;

      if (isEditing && params.id) {
        const tempRem = {
          id: params.id,
          pet_id: petId,
          title: title.trim(),
          category,
          frequency,
          due_date: triggerMs,
          completed: 0,
          sound: selectedSound,
          notes: notes.trim() || undefined,
          created_at: Date.now(),
        };

        scheduledNotifId = await scheduleReminderNotification(tempRem, chosenPet?.name);

        await updateReminder(params.id, {
          pet_id: petId,
          title: title.trim(),
          category,
          frequency,
          due_date: triggerMs,
          sound: selectedSound,
          notification_id: scheduledNotifId || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        const created = await createReminder({
          pet_id: petId,
          title: title.trim(),
          category,
          frequency,
          due_date: triggerMs,
          completed: 0,
          sound: selectedSound,
          notes: notes.trim() || undefined,
        });

        scheduledNotifId = await scheduleReminderNotification(created, chosenPet?.name);

        if (scheduledNotifId) {
          await updateReminder(created.id, {
            notification_id: scheduledNotifId,
          });
        }
      }

      await refreshAll();
      showToast(
        isEditing
          ? 'Reminder & notification schedule updated!'
          : 'Care reminder & sound notification set successfully!',
        'success',
        'Reminder Saved'
      );
      router.back();
    } catch (err) {
      console.warn('Save reminder error:', err);
      showToast('Failed to save reminder. Please try again.', 'error', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;
    confirmDelete(
      'Delete Reminder',
      'Are you sure you want to delete this reminder and cancel its scheduled notification?',
      async () => {
        try {
          await cancelReminderNotification(params.id!, existingNotificationId);
          await deleteReminder(params.id!);
          await refreshAll();
          showToast('Reminder deleted and notification cancelled.', 'info', 'Reminder Deleted');
          router.back();
        } catch (err) {
          console.warn('Failed to delete reminder:', err);
          showToast('Failed to delete reminder.', 'error', 'Delete Failed');
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
        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.reminderLight }]}>
                <Ionicons name="alarm" size={26} color={theme.reminder} />
              </View>
              <View style={styles.headerTitles}>
                <Text style={[styles.heading, { color: theme.text }]}>
                  {isEditing ? 'Edit Care Reminder' : 'Add Care Reminder'}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  Custom date, time & sound notification
                </Text>
              </View>
            </View>
            <IconButton icon="close" label="Cancel" onPress={() => router.back()} />
          </View>
        </View>

        {/* Pet Selector (if multiple pets) */}
        {pets.length > 1 && (
          <View style={styles.field}>
            <Text style={styles.fieldSectionLabel}>SELECT PET</Text>
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

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldSectionLabel}>REMINDER TITLE *</Text>
          <TextInput
            placeholder="e.g. Heartworm Chewable, Kibble Dinner, Vet Checkup"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.field}>
          <Text style={styles.fieldSectionLabel}>CATEGORY</Text>
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
                      backgroundColor: isSelected ? theme.reminder : theme.card,
                      borderColor: isSelected ? theme.reminder : theme.border,
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

        {/* DATE & TIME (2-Column Side-by-Side Row matching Figma screenshot) */}
        <View style={styles.dateTimeRow}>
          {/* DATE COLUMN */}
          <View style={styles.dateTimeCol}>
            <Text style={styles.fieldSectionLabel}>DATE</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={dateInputVal}
                onChange={(e) => handleWebDateChange(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // Ignore if showPicker is not supported
                  }
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '18px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.card,
                  color: theme.text,
                  fontSize: '15px',
                  fontWeight: '700',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <SmoothPressable
                onPress={() => setShowMobileDatePicker(true)}
                style={[styles.pickerBox, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.pickerBoxText, { color: theme.text }]}>
                  {formattedDateStr}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={theme.text} />
              </SmoothPressable>
            )}
          </View>

          {/* TIME COLUMN */}
          <View style={styles.dateTimeCol}>
            <Text style={styles.fieldSectionLabel}>TIME</Text>
            {Platform.OS === 'web' ? (
              <input
                type="time"
                value={timeInputVal}
                onChange={(e) => handleWebTimeChange(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // Ignore if showPicker is not supported
                  }
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '18px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.card,
                  color: theme.text,
                  fontSize: '15px',
                  fontWeight: '700',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <SmoothPressable
                onPress={() => setShowMobileTimePicker(true)}
                style={[styles.pickerBox, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.pickerBoxText, { color: theme.text }]}>
                  {formattedTimeStr}
                </Text>
                <Ionicons name="time-outline" size={18} color={theme.text} />
              </SmoothPressable>
            )}
          </View>
        </View>

        {/* REPEAT SECTION (matching Figma screenshot) */}
        <View style={styles.field}>
          <Text style={styles.fieldSectionLabel}>REPEAT</Text>
          <View style={styles.repeatChipsGrid}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const isSelected = frequency === opt.id;
              return (
                <SmoothPressable
                  key={opt.id}
                  onPress={() => setFrequency(opt.id)}
                  style={[
                    styles.repeatChip,
                    {
                      backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                      borderColor: isSelected ? theme.buttonPrimary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.repeatChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '600' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </SmoothPressable>
              );
            })}
          </View>
        </View>

        {/* ALARM SOUND SECTION (matching Figma screenshot) */}
        <View style={styles.field}>
          <Text style={styles.fieldSectionLabel}>ALARM SOUND</Text>
          <View style={styles.soundsList}>
            {SOUND_OPTIONS.map((snd) => {
              const isSelected = selectedSound === snd.id;
              return (
                <View
                  key={snd.id}
                  style={[
                    styles.soundCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: isSelected ? theme.buttonPrimary : theme.border,
                    },
                  ]}
                >
                  <SmoothPressable
                    onPress={() => {
                      setSelectedSound(snd.id);
                      handlePreviewSound(snd.id);
                    }}
                    style={styles.soundCardMain}
                  >
                    <View
                      style={[
                        styles.soundIconWrap,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={snd.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={isSelected ? theme.buttonPrimary : theme.textSecondary}
                      />
                    </View>

                    <View style={styles.soundTextWrap}>
                      <Text
                        style={[
                          styles.soundName,
                          {
                            color: isSelected ? theme.buttonPrimary : theme.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {snd.name}
                      </Text>
                      <Text style={[styles.soundDesc, { color: theme.textSecondary }]}>
                        {snd.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? theme.buttonPrimary : theme.border,
                          backgroundColor: isSelected ? theme.buttonPrimary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </SmoothPressable>

                  {/* Dedicated Preview Sound Button */}
                  <SmoothPressable
                    onPress={() => handlePreviewSound(snd.id)}
                    style={[
                      styles.previewButton,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    accessibilityLabel={`Preview ${snd.name}`}
                  >
                    <Ionicons name="volume-high" size={16} color={theme.buttonPrimary} />
                    <Text style={[styles.previewButtonText, { color: theme.buttonPrimary }]}>
                      Play
                    </Text>
                  </SmoothPressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Instructions / Notes */}
        <View style={styles.field}>
          <Text style={styles.fieldSectionLabel}>INSTRUCTIONS / NOTES</Text>
          <TextInput
            placeholder="Specific dosage, brand, grooming instructions..."
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

        {/* Submit Buttons */}
        <View style={styles.submitRow}>
          <Button
            label={saving ? 'Saving...' : isEditing ? 'Update Reminder' : 'Set Reminder'}
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
              label="Delete Reminder"
              variant="destructiveSecondary"
              icon="trash-outline"
              onPress={handleDelete}
            />
          )}
        </View>
      </ScrollView>

      {/* Mobile Date Picker Dialog */}
      <Modal
        visible={showMobileDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMobileDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Reminder Date</Text>
              <SmoothPressable onPress={() => setShowMobileDatePicker(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </SmoothPressable>
            </View>

            <View style={styles.mobileStepperRow}>
              {/* Day -1 */}
              <SmoothPressable
                onPress={() => {
                  const d = new Date(targetDate);
                  d.setDate(d.getDate() - 1);
                  setTargetDate(d);
                }}
                style={[styles.stepperBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={20} color={theme.text} />
              </SmoothPressable>

              <View style={styles.modalDateDisplay}>
                <Ionicons name="calendar" size={22} color={theme.buttonPrimary} />
                <Text style={[styles.modalDateDisplayText, { color: theme.text }]}>
                  {formattedDateStr}
                </Text>
              </View>

              {/* Day +1 */}
              <SmoothPressable
                onPress={() => {
                  const d = new Date(targetDate);
                  d.setDate(d.getDate() + 1);
                  setTargetDate(d);
                }}
                style={[styles.stepperBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <Ionicons name="add" size={20} color={theme.text} />
              </SmoothPressable>
            </View>

            {/* Quick Days */}
            <View style={styles.modalQuickRow}>
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: '+1 Week', days: 7 },
              ].map((q) => (
                <SmoothPressable
                  key={q.label}
                  onPress={() => {
                    const now = new Date();
                    setTargetDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + q.days));
                  }}
                  style={[styles.modalQuickChip, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <Text style={[styles.modalQuickText, { color: theme.text }]}>{q.label}</Text>
                </SmoothPressable>
              ))}
            </View>

            <Button
              label="Done"
              onPress={() => setShowMobileDatePicker(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Mobile Time Picker Dialog */}
      <Modal
        visible={showMobileTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMobileTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Reminder Time</Text>
              <SmoothPressable onPress={() => setShowMobileTimePicker(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </SmoothPressable>
            </View>

            <View style={styles.modalTimeDisplay}>
              <Text style={[styles.modalTimeBigText, { color: theme.buttonPrimary }]}>
                {formattedTimeStr}
              </Text>
            </View>

            {/* Hours */}
            <Text style={[styles.modalSubLabel, { color: theme.textSecondary }]}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeChipsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                const isSel = hour12 === h;
                return (
                  <SmoothPressable
                    key={h}
                    onPress={() => setHour12(h)}
                    style={[
                      styles.numChip,
                      {
                        backgroundColor: isSel ? theme.buttonPrimary : theme.background,
                        borderColor: isSel ? theme.buttonPrimary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.numChipText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                      {h}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </ScrollView>

            {/* Minutes */}
            <Text style={[styles.modalSubLabel, { color: theme.textSecondary }]}>Minute</Text>
            <View style={styles.minRow}>
              {[0, 15, 30, 45].map((m) => {
                const isSel = minute === m;
                const label = m < 10 ? `0${m}` : `${m}`;
                return (
                  <SmoothPressable
                    key={m}
                    onPress={() => setMinute(m)}
                    style={[
                      styles.minChip,
                      {
                        backgroundColor: isSel ? theme.reminder : theme.background,
                        borderColor: isSel ? theme.reminder : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.numChipText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                      :{label}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>

            {/* AM / PM */}
            <View style={styles.periodRow}>
              {(['AM', 'PM'] as const).map((p) => {
                const isSel = period === p;
                return (
                  <SmoothPressable
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={[
                      styles.periodChip,
                      {
                        backgroundColor: isSel ? theme.buttonPrimary : theme.background,
                        borderColor: isSel ? theme.buttonPrimary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.periodChipText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                      {p}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>

            <Button
              label="Done"
              onPress={() => setShowMobileTimePicker(false)}
            />
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    gap: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  field: {
    gap: 8,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCol: {
    flex: 1,
    gap: 6,
  },
  pickerBox: {
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  pickerBoxText: {
    fontSize: 15,
    fontWeight: '700',
  },
  repeatChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  repeatChip: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  repeatChipText: {
    fontSize: 14,
  },
  soundsList: {
    gap: 10,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    gap: 10,
  },
  soundCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTextWrap: {
    flex: 1,
  },
  soundName: {
    fontSize: 15,
  },
  soundDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitRow: {
    gap: 10,
    marginTop: 10,
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
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mobileStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDateDisplayText: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalQuickRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  modalQuickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  modalQuickText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalTimeDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalTimeBigText: {
    fontSize: 32,
    fontWeight: '800',
  },
  modalSubLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  minRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  minChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
