import { getDb } from './client';
import type { HistoryItem, HistoryItemType, Meal, Reminder, HealthNote, WeightEntry, Pet } from './types';

export async function getCareHistory(options?: {
  petId?: string;
  type?: HistoryItemType;
  search?: string;
}): Promise<HistoryItem[]> {
  const db = await getDb();
  const pets = await db.getAllAsync<Pet>('SELECT id, name FROM pets');
  const petNameMap = new Map<string, string>();
  pets.forEach((p) => petNameMap.set(p.id, p.name));

  const items: HistoryItem[] = [];
  const petFilter = options?.petId ? 'WHERE pet_id = ?' : '';
  const petParams = options?.petId ? [options.petId] : [];

  // 1. Meals
  if (!options?.type || options.type === 'meal') {
    const meals = await db.getAllAsync<Meal>(
      `SELECT * FROM meals ${petFilter} ORDER BY logged_at DESC`,
      petParams
    );
    meals.forEach((m) => {
      items.push({
        id: m.id,
        type: 'meal',
        pet_id: m.pet_id,
        pet_name: petNameMap.get(m.pet_id) || 'Pet',
        title: `${m.meal_type}: ${m.food_name}`,
        subtitle: `${m.amount} ${m.unit} • Appetite: ${m.appetite || 'Normal'}`,
        details: m.notes || undefined,
        timestamp: m.logged_at,
        category: m.meal_type,
        badge: 'Meal',
        raw: m,
      });
    });
  }

  // 2. Reminders
  if (!options?.type || options.type === 'reminder') {
    const reminders = await db.getAllAsync<Reminder>(
      `SELECT * FROM reminders ${petFilter} ORDER BY due_date DESC`,
      petParams
    );
    reminders.forEach((r) => {
      items.push({
        id: r.id,
        type: 'reminder',
        pet_id: r.pet_id,
        pet_name: petNameMap.get(r.pet_id) || 'Pet',
        title: r.title,
        subtitle: `${r.category} • ${r.completed ? 'Completed' : 'Pending'} (${r.frequency})`,
        details: r.notes || undefined,
        timestamp: r.due_date,
        category: r.category,
        badge: r.completed ? 'Done' : 'Reminder',
        raw: r,
      });
    });
  }

  // 3. Health Notes
  if (!options?.type || options.type === 'health') {
    const health = await db.getAllAsync<HealthNote>(
      `SELECT * FROM health_notes ${petFilter} ORDER BY logged_at DESC`,
      petParams
    );
    health.forEach((h) => {
      items.push({
        id: h.id,
        type: 'health',
        pet_id: h.pet_id,
        pet_name: petNameMap.get(h.pet_id) || 'Pet',
        title: h.title,
        subtitle: `${h.category}${h.vet_name ? ` • Vet: ${h.vet_name}` : ''}`,
        details: h.notes + (h.symptoms ? `\nSymptoms: ${h.symptoms}` : '') + (h.medication ? `\nMedication: ${h.medication}` : ''),
        timestamp: h.logged_at,
        category: h.category,
        badge: 'Health',
        raw: h,
      });
    });
  }

  // 4. Weight Entries
  if (!options?.type || options.type === 'weight') {
    const weights = await db.getAllAsync<WeightEntry>(
      `SELECT * FROM weight_entries ${petFilter} ORDER BY logged_at DESC`,
      petParams
    );
    weights.forEach((w) => {
      items.push({
        id: w.id,
        type: 'weight',
        pet_id: w.pet_id,
        pet_name: petNameMap.get(w.pet_id) || 'Pet',
        title: `Weight Recorded: ${w.weight} ${w.unit}`,
        subtitle: 'Routine weigh-in',
        details: w.notes || undefined,
        timestamp: w.logged_at,
        category: 'Weight',
        badge: 'Weight',
        raw: w,
      });
    });
  }

  // Sort by timestamp descending
  items.sort((a, b) => b.timestamp - a.timestamp);

  // Search query filter
  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        item.pet_name.toLowerCase().includes(q)
    );
  }

  return items;
}
