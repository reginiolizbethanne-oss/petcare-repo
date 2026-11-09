import { getDb, newId } from './client';
import type { Meal } from './types';

export async function getAllMeals(petId?: string): Promise<Meal[]> {
  const db = await getDb();
  if (petId) {
    return db.getAllAsync<Meal>(
      'SELECT * FROM meals WHERE pet_id = ? ORDER BY logged_at DESC',
      [petId]
    );
  }
  return db.getAllAsync<Meal>('SELECT * FROM meals ORDER BY logged_at DESC');
}

export async function getTodayMeals(petId?: string): Promise<Meal[]> {
  const db = await getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();

  if (petId) {
    return db.getAllAsync<Meal>(
      'SELECT * FROM meals WHERE pet_id = ? AND logged_at >= ? ORDER BY logged_at DESC',
      [petId, startMs]
    );
  }
  return db.getAllAsync<Meal>(
    'SELECT * FROM meals WHERE logged_at >= ? ORDER BY logged_at DESC',
    [startMs]
  );
}

export async function getMealById(id: string): Promise<Meal | null> {
  const db = await getDb();
  return db.getFirstAsync<Meal>('SELECT * FROM meals WHERE id = ?', [id]);
}

export async function createMeal(
  data: Omit<Meal, 'id' | 'created_at'>
): Promise<Meal> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO meals (id, pet_id, meal_type, food_name, amount, unit, logged_at, appetite, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.pet_id,
      data.meal_type,
      data.food_name.trim(),
      Number(data.amount),
      data.unit.trim(),
      data.logged_at || now,
      data.appetite || 'Normal',
      data.notes?.trim() || null,
      now,
    ]
  );

  const created = await getMealById(id);
  if (!created) throw new Error('Failed to create meal log');
  return created;
}

export async function updateMeal(
  id: string,
  data: Partial<Omit<Meal, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getMealById(id);
  if (!existing) throw new Error('Meal not found');

  await db.runAsync(
    `UPDATE meals SET
       pet_id = ?,
       meal_type = ?,
       food_name = ?,
       amount = ?,
       unit = ?,
       logged_at = ?,
       appetite = ?,
       notes = ?
     WHERE id = ?`,
    [
      data.pet_id !== undefined ? data.pet_id : existing.pet_id,
      data.meal_type !== undefined ? data.meal_type : existing.meal_type,
      data.food_name !== undefined ? data.food_name.trim() : existing.food_name,
      data.amount !== undefined ? Number(data.amount) : existing.amount,
      data.unit !== undefined ? data.unit.trim() : existing.unit,
      data.logged_at !== undefined ? data.logged_at : existing.logged_at,
      (data.appetite !== undefined ? data.appetite : existing.appetite) ?? null,
      (data.notes !== undefined ? data.notes?.trim() : existing.notes) ?? null,
      id,
    ]
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meals WHERE id = ?', [id]);
}
