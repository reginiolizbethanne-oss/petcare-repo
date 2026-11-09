import { getDb, newId } from './client';
import type { WeightEntry } from './types';

export async function getAllWeightEntries(petId?: string): Promise<WeightEntry[]> {
  const db = await getDb();
  if (petId) {
    return db.getAllAsync<WeightEntry>(
      'SELECT * FROM weight_entries WHERE pet_id = ? ORDER BY logged_at ASC',
      [petId]
    );
  }
  return db.getAllAsync<WeightEntry>(
    'SELECT * FROM weight_entries ORDER BY logged_at ASC'
  );
}

export async function getWeightEntryById(id: string): Promise<WeightEntry | null> {
  const db = await getDb();
  return db.getFirstAsync<WeightEntry>('SELECT * FROM weight_entries WHERE id = ?', [id]);
}

export async function createWeightEntry(
  data: Omit<WeightEntry, 'id' | 'created_at'>
): Promise<WeightEntry> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();
  const loggedAt = data.logged_at || now;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO weight_entries (id, pet_id, weight, unit, logged_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.pet_id,
        Number(data.weight),
        data.unit || 'kg',
        loggedAt,
        data.notes?.trim() || null,
        now,
      ]
    );

    // Update the pet's latest weight if this entry is the most recent
    const latest = await db.getFirstAsync<{ weight: number; unit: string }>(
      'SELECT weight, unit FROM weight_entries WHERE pet_id = ? ORDER BY logged_at DESC LIMIT 1',
      [data.pet_id]
    );
    if (latest) {
      await db.runAsync(
        'UPDATE pets SET weight = ?, weight_unit = ?, updated_at = ? WHERE id = ?',
        [latest.weight, latest.unit, now, data.pet_id]
      );
    }
  });

  const created = await getWeightEntryById(id);
  if (!created) throw new Error('Failed to create weight entry');
  return created;
}

export async function updateWeightEntry(
  id: string,
  data: Partial<Omit<WeightEntry, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getWeightEntryById(id);
  if (!existing) throw new Error('Weight entry not found');

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE weight_entries SET
         pet_id = ?,
         weight = ?,
         unit = ?,
         logged_at = ?,
         notes = ?
       WHERE id = ?`,
      [
        data.pet_id !== undefined ? data.pet_id : existing.pet_id,
        data.weight !== undefined ? Number(data.weight) : existing.weight,
        data.unit !== undefined ? data.unit : existing.unit,
        data.logged_at !== undefined ? data.logged_at : existing.logged_at,
        (data.notes !== undefined ? data.notes?.trim() : existing.notes) ?? null,
        id,
      ]
    );

    const targetPetId = data.pet_id || existing.pet_id;
    const latest = await db.getFirstAsync<{ weight: number; unit: string }>(
      'SELECT weight, unit FROM weight_entries WHERE pet_id = ? ORDER BY logged_at DESC LIMIT 1',
      [targetPetId]
    );
    if (latest) {
      await db.runAsync(
        'UPDATE pets SET weight = ?, weight_unit = ?, updated_at = ? WHERE id = ?',
        [latest.weight, latest.unit, Date.now(), targetPetId]
      );
    }
  });
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const db = await getDb();
  const existing = await getWeightEntryById(id);
  if (!existing) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM weight_entries WHERE id = ?', [id]);
    const latest = await db.getFirstAsync<{ weight: number; unit: string }>(
      'SELECT weight, unit FROM weight_entries WHERE pet_id = ? ORDER BY logged_at DESC LIMIT 1',
      [existing.pet_id]
    );
    if (latest) {
      await db.runAsync(
        'UPDATE pets SET weight = ?, weight_unit = ?, updated_at = ? WHERE id = ?',
        [latest.weight, latest.unit, Date.now(), existing.pet_id]
      );
    }
  });
}
