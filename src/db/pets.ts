import { getDb, newId } from './client';
import type { Pet } from './types';

export async function getAllPets(): Promise<Pet[]> {
  const db = await getDb();
  return db.getAllAsync<Pet>('SELECT * FROM pets ORDER BY is_active DESC, name ASC');
}

export async function getPetById(id: string): Promise<Pet | null> {
  const db = await getDb();
  return db.getFirstAsync<Pet>('SELECT * FROM pets WHERE id = ?', [id]);
}

export async function getActivePet(): Promise<Pet | null> {
  const db = await getDb();
  const pet = await db.getFirstAsync<Pet>('SELECT * FROM pets WHERE is_active = 1 LIMIT 1');
  if (pet) return pet;
  // Fallback to first pet if none marked active
  const first = await db.getFirstAsync<Pet>('SELECT * FROM pets ORDER BY name ASC LIMIT 1');
  if (first) {
    await setActivePet(first.id);
    return { ...first, is_active: 1 };
  }
  return null;
}

export async function setActivePet(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE pets SET is_active = 0');
    await db.runAsync('UPDATE pets SET is_active = 1 WHERE id = ?', [id]);
  });
}

export async function createPet(
  data: Omit<Pet, 'id' | 'created_at' | 'updated_at'>
): Promise<Pet> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();

  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pets'
  );
  const isFirst = (countRow?.count ?? 0) === 0;
  const isActive = isFirst ? 1 : (data.is_active ?? 0);

  if (isActive === 1) {
    await db.runAsync('UPDATE pets SET is_active = 0');
  }

  await db.runAsync(
    `INSERT INTO pets (id, name, species, breed, gender, birthdate, weight, weight_unit, photo_uri, microchip_id, notes, allergies, diet, vet_name, vet_clinic, vet_phone, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name.trim(),
      data.species,
      data.breed?.trim() || null,
      data.gender || null,
      data.birthdate || null,
      data.weight != null ? Number(data.weight) : null,
      data.weight_unit || 'kg',
      data.photo_uri || null,
      data.microchip_id?.trim() || null,
      data.notes?.trim() || null,
      data.allergies?.trim() || null,
      data.diet?.trim() || null,
      data.vet_name?.trim() || null,
      data.vet_clinic?.trim() || null,
      data.vet_phone?.trim() || null,
      isActive,
      now,
      now,
    ]
  );

  // If initial weight was supplied, also add to weight history
  if (data.weight != null && !isNaN(Number(data.weight))) {
    await db.runAsync(
      `INSERT INTO weight_entries (id, pet_id, weight, unit, logged_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newId(),
        id,
        Number(data.weight),
        data.weight_unit || 'kg',
        now,
        'Initial profile weight',
        now,
      ]
    );
  }

  const created = await getPetById(id);
  if (!created) throw new Error('Failed to create pet');
  return created;
}

export async function updatePet(
  id: string,
  data: Partial<Omit<Pet, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const now = Date.now();

  if (data.is_active === 1) {
    await db.runAsync('UPDATE pets SET is_active = 0');
  }

  const existing = await getPetById(id);
  if (!existing) throw new Error('Pet not found');

  await db.runAsync(
    `UPDATE pets SET
       name = ?,
       species = ?,
       breed = ?,
       gender = ?,
       birthdate = ?,
       weight = ?,
       weight_unit = ?,
       photo_uri = ?,
       microchip_id = ?,
       notes = ?,
       allergies = ?,
       diet = ?,
       vet_name = ?,
       vet_clinic = ?,
       vet_phone = ?,
       is_active = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      data.name !== undefined ? data.name.trim() : existing.name,
      data.species !== undefined ? data.species : existing.species,
      (data.breed !== undefined ? data.breed?.trim() : existing.breed) ?? null,
      (data.gender !== undefined ? data.gender : existing.gender) ?? null,
      (data.birthdate !== undefined ? data.birthdate : existing.birthdate) ?? null,
      (data.weight !== undefined ? (data.weight != null ? Number(data.weight) : null) : existing.weight) ?? null,
      (data.weight_unit !== undefined ? data.weight_unit : existing.weight_unit) ?? 'kg',
      (data.photo_uri !== undefined ? data.photo_uri : existing.photo_uri) ?? null,
      (data.microchip_id !== undefined ? data.microchip_id?.trim() : existing.microchip_id) ?? null,
      (data.notes !== undefined ? data.notes?.trim() : existing.notes) ?? null,
      (data.allergies !== undefined ? data.allergies?.trim() : existing.allergies) ?? null,
      (data.diet !== undefined ? data.diet?.trim() : existing.diet) ?? null,
      (data.vet_name !== undefined ? data.vet_name?.trim() : existing.vet_name) ?? null,
      (data.vet_clinic !== undefined ? data.vet_clinic?.trim() : existing.vet_clinic) ?? null,
      (data.vet_phone !== undefined ? data.vet_phone?.trim() : existing.vet_phone) ?? null,
      (data.is_active !== undefined ? data.is_active : existing.is_active) ?? 0,
      now,
      id,
    ]
  );
}

export async function deletePet(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    // Foreign keys with cascade will remove meals, reminders, health notes, and weight entries
    await db.runAsync('DELETE FROM pets WHERE id = ?', [id]);
    // If deleted pet was active, set another pet active
    const remaining = await db.getFirstAsync<Pet>('SELECT * FROM pets ORDER BY name ASC LIMIT 1');
    if (remaining) {
      await db.runAsync('UPDATE pets SET is_active = 1 WHERE id = ?', [remaining.id]);
    }
  });
}
