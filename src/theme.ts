import { useSettings } from '@/settings/SettingsContext';

export interface Theme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  danger: string;
  success: string;
  warning: string;
  userBubble: string;
  userBubbleText: string;
  assistantBubble: string;
  inputBackground: string;

  // PetCare Specific Design Tokens
  primary: string;
  primaryLight: string;
  meal: string;
  mealLight: string;
  reminder: string;
  reminderLight: string;
  health: string;
  healthLight: string;
  weight: string;
  weightLight: string;
}

const light: Theme = {
  background: '#F8F9FC',
  card: '#FFFFFF',
  text: '#191C21',
  textSecondary: '#6A7282',
  border: '#E8ECF2',
  tint: '#FF6442',
  buttonPrimary: '#FF6442',
  buttonSecondary: '#F0F3F8',
  buttonDanger: '#E53E3E',
  danger: '#E53E3E',
  success: '#10B981',
  warning: '#F59E0B',
  userBubble: '#FF6442',
  userBubbleText: '#FFFFFF',
  assistantBubble: '#EEF2F6',
  inputBackground: '#F4F6F9',

  primary: '#FF6442',
  primaryLight: '#FFF1ED',
  meal: '#FF8A3D',
  mealLight: '#FFF4EB',
  reminder: '#7C4DFF',
  reminderLight: '#F3EFFF',
  health: '#FF4D6D',
  healthLight: '#FFF0F3',
  weight: '#059669',
  weightLight: '#E8FDF5',
};

const dark: Theme = {
  background: '#0F1015',
  card: '#1A1C24',
  text: '#F3F4F8',
  textSecondary: '#9CA3AF',
  border: '#2A2D3A',
  tint: '#FF7D60',
  buttonPrimary: '#FF6442',
  buttonSecondary: '#282B37',
  buttonDanger: '#F87171',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  userBubble: '#FF6442',
  userBubbleText: '#FFFFFF',
  assistantBubble: '#242733',
  inputBackground: '#20222D',

  primary: '#FF7D60',
  primaryLight: '#321D18',
  meal: '#FFA35E',
  mealLight: '#312117',
  reminder: '#9B73FF',
  reminderLight: '#261C3D',
  health: '#FF6E88',
  healthLight: '#331B21',
  weight: '#34D399',
  weightLight: '#142E25',
};

export function useTheme(): Theme {
  return useSettings().settings.theme === 'dark' ? dark : light;
}
