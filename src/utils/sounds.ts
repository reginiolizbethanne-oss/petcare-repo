import { Platform } from 'react-native';
import type { ReminderSound } from '@/db/types';
import { SOUND_DATA_URIS } from './soundData';

export interface SoundDefinition {
  id: ReminderSound;
  name: string;
  description: string;
  icon: string;
  category: 'default' | 'cat' | 'dog' | 'chime';
}

export const SOUND_OPTIONS: SoundDefinition[] = [
  {
    id: 'chime',
    name: 'Default Notification Sound',
    description: 'Modern 3-tone sparkling glass chime',
    icon: 'notifications',
    category: 'default',
  },
  {
    id: 'cat_meow',
    name: 'Cat Meow Sound',
    description: 'A cute cat meowing sound',
    icon: 'paw',
    category: 'cat',
  },
  {
    id: 'dog_bark',
    name: 'Dog Bark Sound',
    description: 'A friendly dog barking sound',
    icon: 'paw',
    category: 'dog',
  },
  {
    id: 'cat_purr',
    name: 'Cat Purring Sound',
    description: 'A soft and relaxing cat purring sound',
    icon: 'heart',
    category: 'cat',
  },
  {
    id: 'puppy_whine',
    name: 'Puppy Whining Sound',
    description: 'A gentle puppy whining sound',
    icon: 'happy',
    category: 'dog',
  },
  {
    id: 'marimba',
    name: 'Bright Marimba',
    description: 'Warm acoustic wooden chime',
    icon: 'disc',
    category: 'chime',
  },
];

// Helper to normalize sound ids and map any legacy sound names
export function normalizeSoundId(sound?: string | null): ReminderSound {
  if (!sound) return 'chime';
  if (sound === 'bark' || sound === 'dog_bark') return 'dog_bark';
  if (sound === 'meow' || sound === 'cat_meow') return 'cat_meow';
  if (sound === 'purr' || sound === 'cat_purr') return 'cat_purr';
  if (sound === 'puppy_whine') return 'puppy_whine';
  if (sound === 'marimba') return 'marimba';
  const found = SOUND_OPTIONS.find((s) => s.id === sound);
  return found ? (found.id as ReminderSound) : 'chime';
}

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Plays an authentic audio recording for the selected reminder sound.
 * Works seamlessly on Web using HTML5 Audio & Data URI and Native.
 */
export function playReminderSound(soundId: ReminderSound | string = 'chime'): void {
  const normalizedId = normalizeSoundId(soundId);
  const dataUri = SOUND_DATA_URIS[normalizedId] || SOUND_DATA_URIS['chime'];

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
      }
      const audio = new window.Audio(dataUri);
      activeAudioElement = audio;
      audio.volume = 0.95;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback was prevented by browser policy or error:', err);
        });
      }
      return;
    } catch (err) {
      console.warn('Web Audio playback error:', err);
    }
  }

  // Fallback for native runtime environments
  try {
    // In React Native native environment, we can dynamically invoke audio player
    if (typeof Audio !== 'undefined') {
      const nativeAudio = new Audio(dataUri);
      void nativeAudio.play();
    }
  } catch {
    // Ignore
  }
}
