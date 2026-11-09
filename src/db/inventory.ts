import { getDb, newId } from './client';
import type { InventoryCategory, InventoryItem } from './types';

export async function getAllInventory(): Promise<InventoryItem[]> {
  const db = await getDb();
  return db.getAllAsync<InventoryItem>('SELECT * FROM inventory ORDER BY name ASC');
}

export async function getInventoryByCategory(category?: InventoryCategory | 'All'): Promise<InventoryItem[]> {
  const db = await getDb();
  if (!category || category === 'All') {
    return db.getAllAsync<InventoryItem>('SELECT * FROM inventory ORDER BY name ASC');
  }
  return db.getAllAsync<InventoryItem>('SELECT * FROM inventory WHERE category = ? ORDER BY name ASC', [category]);
}

export async function getInventoryById(id: string): Promise<InventoryItem | null> {
  const db = await getDb();
  return db.getFirstAsync<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [id]);
}

export async function createInventoryItem(
  data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItem> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO inventory (id, name, description, category, quantity, unit, min_stock, icon, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name.trim(),
      data.description.trim(),
      data.category,
      Number(data.quantity) || 0,
      data.unit.trim() || 'units',
      Number(data.min_stock) || 1,
      data.icon || 'box',
      now,
      now,
    ]
  );

  const created = await getInventoryById(id);
  if (!created) throw new Error('Failed to create inventory item');
  return created;
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getInventoryById(id);
  if (!existing) throw new Error('Inventory item not found');

  const now = Date.now();
  await db.runAsync(
    `UPDATE inventory SET
       name = ?,
       description = ?,
       category = ?,
       quantity = ?,
       unit = ?,
       min_stock = ?,
       icon = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updates.name !== undefined ? updates.name.trim() : existing.name,
      updates.description !== undefined ? updates.description.trim() : existing.description,
      updates.category !== undefined ? updates.category : existing.category,
      updates.quantity !== undefined ? Number(updates.quantity) : existing.quantity,
      updates.unit !== undefined ? updates.unit.trim() : existing.unit,
      updates.min_stock !== undefined ? Number(updates.min_stock) : existing.min_stock,
      (updates.icon !== undefined ? updates.icon : existing.icon) ?? null,
      now,
      id,
    ]
  );
}

export async function updateInventoryQuantity(id: string, delta: number): Promise<InventoryItem> {
  const item = await getInventoryById(id);
  if (!item) throw new Error('Inventory item not found');

  const newQty = Math.max(0, item.quantity + delta);
  await updateInventoryItem(id, { quantity: newQty });

  const updated = await getInventoryById(id);
  if (!updated) throw new Error('Failed to update inventory quantity');
  return updated;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM inventory WHERE id = ?', [id]);
}
