import { getDb, newId } from './client';
import type { HealthNote } from './types';

export async function getAllHealthNotes(petId?: string): Promise<HealthNote[]> {
  const db = await getDb();
  if (petId) {
    return db.getAllAsync<HealthNote>(
      'SELECT * FROM health_notes WHERE pet_id = ? ORDER BY logged_at DESC',
      [petId]
    );
  }
  return db.getAllAsync<HealthNote>(
    'SELECT * FROM health_notes ORDER BY logged_at DESC'
  );
}

export async function getHealthNoteById(id: string): Promise<HealthNote | null> {
  const db = await getDb();
  return db.getFirstAsync<HealthNote>('SELECT * FROM health_notes WHERE id = ?', [id]);
}

export async function createHealthNote(
  data: Omit<HealthNote, 'id' | 'created_at'>
): Promise<HealthNote> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO health_notes (id, pet_id, title, category, notes, symptoms, medication, vet_name, follow_up_date, logged_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.pet_id,
      data.title.trim(),
      data.category,
      data.notes.trim(),
      data.symptoms?.trim() || null,
      data.medication?.trim() || null,
      data.vet_name?.trim() || null,
      data.follow_up_date || null,
      data.logged_at || now,
      now,
    ]
  );

  const created = await getHealthNoteById(id);
  if (!created) throw new Error('Failed to create health note');
  return created;
}

export async function updateHealthNote(
  id: string,
  data: Partial<Omit<HealthNote, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getHealthNoteById(id);
  if (!existing) throw new Error('Health note not found');

  await db.runAsync(
    `UPDATE health_notes SET
       pet_id = ?,
       title = ?,
       category = ?,
       notes = ?,
       symptoms = ?,
       medication = ?,
       vet_name = ?,
       follow_up_date = ?,
       logged_at = ?
     WHERE id = ?`,
    [
      data.pet_id !== undefined ? data.pet_id : existing.pet_id,
      data.title !== undefined ? data.title.trim() : existing.title,
      data.category !== undefined ? data.category : existing.category,
      data.notes !== undefined ? data.notes.trim() : existing.notes,
      (data.symptoms !== undefined ? data.symptoms?.trim() : existing.symptoms) ?? null,
      (data.medication !== undefined ? data.medication?.trim() : existing.medication) ?? null,
      (data.vet_name !== undefined ? data.vet_name?.trim() : existing.vet_name) ?? null,
      (data.follow_up_date !== undefined ? data.follow_up_date : existing.follow_up_date) ?? null,
      data.logged_at !== undefined ? data.logged_at : existing.logged_at,
      id,
    ]
  );
}

export async function deleteHealthNote(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM health_notes WHERE id = ?', [id]);
}
