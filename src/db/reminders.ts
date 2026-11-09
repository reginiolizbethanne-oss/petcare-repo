import { getDb, newId } from './client';
import type { Reminder } from './types';

export async function getAllReminders(petId?: string): Promise<Reminder[]> {
  const db = await getDb();
  if (petId) {
    return db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE pet_id = ? ORDER BY completed ASC, due_date ASC',
      [petId]
    );
  }
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders ORDER BY completed ASC, due_date ASC'
  );
}

export async function getUpcomingReminders(petId?: string, limit = 5): Promise<Reminder[]> {
  const db = await getDb();
  if (petId) {
    return db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE pet_id = ? AND completed = 0 ORDER BY due_date ASC LIMIT ?',
      [petId, limit]
    );
  }
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE completed = 0 ORDER BY due_date ASC LIMIT ?',
    [limit]
  );
}

export async function getTodayReminders(petId?: string): Promise<Reminder[]> {
  const db = await getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startMs = startOfDay.getTime();
  const endMs = endOfDay.getTime();

  if (petId) {
    return db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE pet_id = ? AND due_date >= ? AND due_date <= ? ORDER BY completed ASC, due_date ASC',
      [petId, startMs, endMs]
    );
  }
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE due_date >= ? AND due_date <= ? ORDER BY completed ASC, due_date ASC',
    [startMs, endMs]
  );
}

export async function getReminderById(id: string): Promise<Reminder | null> {
  const db = await getDb();
  return db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
}

export async function toggleReminderComplete(id: string): Promise<Reminder> {
  const db = await getDb();
  const existing = await getReminderById(id);
  if (!existing) throw new Error('Reminder not found');

  const newStatus = existing.completed === 1 ? 0 : 1;
  const completedAt = newStatus === 1 ? Date.now() : null;

  await db.runAsync(
    'UPDATE reminders SET completed = ?, completed_at = ? WHERE id = ?',
    [newStatus, completedAt, id]
  );

  const updated = await getReminderById(id);
  return updated!;
}

export async function createReminder(
  data: Omit<Reminder, 'id' | 'created_at'>
): Promise<Reminder> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO reminders (id, pet_id, title, category, due_date, frequency, completed, completed_at, sound, notification_id, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.pet_id,
      data.title.trim(),
      data.category,
      data.due_date,
      data.frequency || 'once',
      data.completed ? 1 : 0,
      data.completed_at || null,
      data.sound || 'chime',
      data.notification_id || null,
      data.notes?.trim() || null,
      now,
    ]
  );

  const created = await getReminderById(id);
  if (!created) throw new Error('Failed to create reminder');
  return created;
}

export async function updateReminder(
  id: string,
  data: Partial<Omit<Reminder, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getReminderById(id);
  if (!existing) throw new Error('Reminder not found');

  await db.runAsync(
    `UPDATE reminders SET
       pet_id = ?,
       title = ?,
       category = ?,
       due_date = ?,
       frequency = ?,
       completed = ?,
       completed_at = ?,
       sound = ?,
       notification_id = ?,
       notes = ?
     WHERE id = ?`,
    [
      data.pet_id !== undefined ? data.pet_id : existing.pet_id,
      data.title !== undefined ? data.title.trim() : existing.title,
      data.category !== undefined ? data.category : existing.category,
      data.due_date !== undefined ? data.due_date : existing.due_date,
      data.frequency !== undefined ? data.frequency : existing.frequency,
      data.completed !== undefined ? (data.completed ? 1 : 0) : existing.completed,
      (data.completed_at !== undefined ? data.completed_at : existing.completed_at) ?? null,
      data.sound !== undefined ? data.sound : (existing.sound || 'chime'),
      data.notification_id !== undefined ? data.notification_id : (existing.notification_id ?? null),
      (data.notes !== undefined ? data.notes?.trim() : existing.notes) ?? null,
      id,
    ]
  );
}

export async function deleteReminder(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
}
