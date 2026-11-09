export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Hamster' | 'Fish' | 'Other';
export type Gender = 'Male' | 'Female' | 'Unknown';
export type WeightUnit = 'kg' | 'lbs';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  gender?: Gender;
  birthdate?: string; // YYYY-MM-DD
  weight?: number;
  weight_unit: WeightUnit;
  photo_uri?: string;
  microchip_id?: string;
  notes?: string;
  allergies?: string; // e.g. "Wheat, Dairy"
  diet?: string; // e.g. "Dry Kibble"
  vet_name?: string; // e.g. "Dr. Sarah Chen"
  vet_clinic?: string; // e.g. "Happy Paws Veterinary Clinic"
  vet_phone?: string; // e.g. "(02) 8123-4567"
  is_active: number; // 1 = active pet, 0 = not
  created_at: number;
  updated_at: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Treat';
export type Appetite = 'Normal' | 'High' | 'Low' | 'Pick';

export interface Meal {
  id: string;
  pet_id: string;
  meal_type: MealType;
  food_name: string;
  amount: number;
  unit: string;
  logged_at: number;
  appetite?: Appetite;
  notes?: string;
  created_at: number;
}

export type ReminderCategory =
  | 'Feeding'
  | 'Medication'
  | 'Grooming'
  | 'Vaccination'
  | 'Vet Visit'
  | 'Exercise'
  | 'Other';

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderSound =
  | 'chime'
  | 'cat_meow'
  | 'dog_bark'
  | 'cat_purr'
  | 'puppy_whine'
  | 'marimba';

export interface Reminder {
  id: string;
  pet_id: string;
  title: string;
  category: ReminderCategory;
  due_date: number; // timestamp ms
  frequency: ReminderFrequency;
  completed: number; // 0 or 1
  completed_at?: number;
  sound?: ReminderSound;
  notification_id?: string;
  notes?: string;
  created_at: number;
}

export type HealthCategory =
  | 'General'
  | 'Symptom'
  | 'Vet Visit'
  | 'Medication'
  | 'Vaccination'
  | 'Allergy'
  | 'Surgery';

export interface HealthNote {
  id: string;
  pet_id: string;
  title: string;
  category: HealthCategory;
  notes: string;
  symptoms?: string;
  medication?: string;
  vet_name?: string;
  follow_up_date?: number;
  logged_at: number;
  created_at: number;
}

export interface WeightEntry {
  id: string;
  pet_id: string;
  weight: number;
  unit: WeightUnit;
  logged_at: number;
  notes?: string;
  created_at: number;
}

export type HistoryItemType = 'meal' | 'reminder' | 'health' | 'weight';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  pet_id: string;
  pet_name: string;
  title: string;
  subtitle: string;
  details?: string;
  timestamp: number;
  category?: string;
  badge?: string;
  raw: Meal | Reminder | HealthNote | WeightEntry;
}

export type InventoryCategory = 'Food' | 'Health' | 'Care';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  min_stock: number;
  icon?: string;
  created_at: number;
  updated_at: number;
}
