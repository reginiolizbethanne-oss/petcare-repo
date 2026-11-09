// Web database implementation for browser environments.
// Uses browser localStorage so all data persists across reloads and navigation.
import type { Pet, Meal, Reminder, HealthNote, WeightEntry, InventoryItem } from './types';
import type { Conversation } from './conversations';
import type { MessageRow } from './messages';

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface WebTables {
  pets: Pet[];
  meals: Meal[];
  reminders: Reminder[];
  health_notes: HealthNote[];
  weight_entries: WeightEntry[];
  conversations: Conversation[];
  messages: MessageRow[];
  inventory: InventoryItem[];
}

const STORAGE_KEY = 'petcare_web_db_v1';

function loadStorage(): WebTables {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pets: parsed.pets || [],
        meals: parsed.meals || [],
        reminders: parsed.reminders || [],
        health_notes: parsed.health_notes || [],
        weight_entries: parsed.weight_entries || [],
        conversations: parsed.conversations || [],
        messages: parsed.messages || [],
        inventory: parsed.inventory || [],
      };
    }
  } catch (err) {
    console.warn('Failed to load localStorage database:', err);
  }
  return {
    pets: [],
    meals: [],
    reminders: [],
    health_notes: [],
    weight_entries: [],
    conversations: [],
    messages: [],
    inventory: [],
  };
}

function saveStorage(tables: WebTables): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    }
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

let tables: WebTables = loadStorage();

function seedInitialWebData() {
  if (tables.pets.length > 0) return;

  const now = Date.now();
  const oneHour = 3600 * 1000;
  const oneDay = 24 * oneHour;

  const pet1Id = 'pet-bella-golden';
  const pet2Id = 'pet-mochi-cat';

  tables.pets = [
    {
      id: pet1Id,
      name: 'Bella',
      species: 'Dog',
      breed: 'Golden Retriever',
      gender: 'Female',
      birthdate: '2024-03-15',
      weight: 24.5,
      weight_unit: 'kg',
      photo_uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      microchip_id: 'CHIP-984210492',
      notes: 'Loves fetch, swims in the lake, allergic to chicken poultry byproduct.',
      is_active: 1,
      created_at: now - 60 * oneDay,
      updated_at: now,
    },
    {
      id: pet2Id,
      name: 'Mochi',
      species: 'Cat',
      breed: 'Scottish Fold',
      gender: 'Male',
      birthdate: '2025-01-10',
      weight: 4.2,
      weight_unit: 'kg',
      photo_uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      microchip_id: 'CHIP-110294829',
      notes: 'Calm indoor cat. Prefers salmon flavor wet food. Enjoys feather wand.',
      is_active: 0,
      created_at: now - 30 * oneDay,
      updated_at: now,
    },
  ];

  tables.meals = [
    {
      id: 'meal-1',
      pet_id: pet1Id,
      meal_type: 'Breakfast',
      food_name: 'Royal Canin Adult Maxi Dry',
      amount: 250,
      unit: 'g',
      logged_at: now - 3 * oneHour,
      appetite: 'Normal',
      notes: 'Ate eagerly with fresh water.',
      created_at: now - 3 * oneHour,
    },
    {
      id: 'meal-2',
      pet_id: pet1Id,
      meal_type: 'Snack',
      food_name: 'Carrot Sticks & Peanut Butter Treats',
      amount: 50,
      unit: 'g',
      logged_at: now - 1 * oneHour,
      appetite: 'High',
      notes: 'Training reward during park walk.',
      created_at: now - 1 * oneHour,
    },
  ];

  tables.reminders = [
    {
      id: 'rem-1',
      pet_id: pet1Id,
      title: 'NexGard Flea & Tick Chewable',
      category: 'Medication',
      due_date: now + 2 * oneHour,
      frequency: 'monthly',
      completed: 0,
      notes: 'Monthly beef-flavored chewable with food.',
      created_at: now,
    },
    {
      id: 'rem-2',
      pet_id: pet1Id,
      title: 'Evening Kibble & Joint Supplement',
      category: 'Feeding',
      due_date: now + 5 * oneHour,
      frequency: 'daily',
      completed: 0,
      notes: '200g salmon formula + 1 glucosamine tablet.',
      created_at: now,
    },
    {
      id: 'rem-3',
      pet_id: pet1Id,
      title: 'Weekly Coat De-shedding & Brush',
      category: 'Grooming',
      due_date: now + 2 * oneDay,
      frequency: 'weekly',
      completed: 0,
      notes: 'Use slicker brush and check ears.',
      created_at: now,
    },
  ];

  tables.health_notes = [
    {
      id: 'health-1',
      pet_id: pet1Id,
      title: 'Annual Routine Wellness & Rabies Vaccine',
      category: 'Vaccination',
      notes: 'Teeth are healthy, heart sounds strong, skin and coat in prime condition.',
      symptoms: 'None - healthy and happy',
      medication: 'Rabies booster & DHPP administered',
      vet_name: 'Dr. Rachel Adams, Central Paws Clinic',
      follow_up_date: now + 365 * oneDay,
      logged_at: now - 14 * oneDay,
      created_at: now - 14 * oneDay,
    },
  ];

  tables.weight_entries = [
    {
      id: 'weight-60',
      pet_id: pet1Id,
      weight: 23.2,
      unit: 'kg',
      logged_at: now - 60 * oneDay,
      notes: 'Clinic checkup scale',
      created_at: now - 60 * oneDay,
    },
    {
      id: 'weight-30',
      pet_id: pet1Id,
      weight: 24.0,
      unit: 'kg',
      logged_at: now - 30 * oneDay,
      notes: 'Home weigh-in',
      created_at: now - 30 * oneDay,
    },
    {
      id: 'weight-1',
      pet_id: pet1Id,
      weight: 24.5,
      unit: 'kg',
      logged_at: now - oneDay,
      notes: 'Recent measurement',
      created_at: now - oneDay,
    },
  ];

  saveStorage(tables);
}

function flattenParams(rawParams: any[]): any[] {
  if (rawParams.length === 1 && Array.isArray(rawParams[0])) {
    return rawParams[0];
  }
  return rawParams;
}

function getTableName(sql: string): keyof WebTables | null {
  const match = sql.match(/(?:FROM|INTO|UPDATE)\s+([a-zA-Z_]+)/i);
  if (!match) return null;
  const name = match[1].toLowerCase();
  if (name in tables) return name as keyof WebTables;
  return null;
}

class WebDatabase {
  async getAllAsync<T>(sql: string, ...rawParams: any[]): Promise<T[]> {
    const params = flattenParams(rawParams);
    const tbl = getTableName(sql);
    const cleanSql = sql.replace(/\s+/g, ' ').trim();

    if (!tbl) {
      if (/SELECT COUNT\(\*\)/i.test(cleanSql)) {
        const targetTbl = cleanSql.match(/FROM\s+([a-zA-Z_]+)/i)?.[1]?.toLowerCase() as keyof WebTables;
        const count = targetTbl && tables[targetTbl] ? tables[targetTbl].length : 0;
        return [{ count }] as unknown as T[];
      }
      return [];
    }

    let rows: any[] = [...(tables[tbl] as any[])];

    // Simple WHERE matching
    if (/WHERE/i.test(cleanSql)) {
      if (/WHERE\s+is_active\s*=\s*1/i.test(cleanSql)) {
        rows = rows.filter((r) => r.is_active === 1);
      } else if (/WHERE\s+pet_id\s*=\s*\?\s+AND\s+logged_at\s*>=\s*\?/i.test(cleanSql)) {
        const petId = params[0];
        const minTime = Number(params[1]);
        rows = rows.filter((r) => r.pet_id === petId && r.logged_at >= minTime);
      } else if (/WHERE\s+logged_at\s*>=\s*\?/i.test(cleanSql)) {
        const minTime = Number(params[0]);
        rows = rows.filter((r) => r.logged_at >= minTime);
      } else if (/WHERE\s+pet_id\s*=\s*\?\s+AND\s+due_date\s*>=\s*\?\s+AND\s+due_date\s*<=\s*\?/i.test(cleanSql)) {
        const petId = params[0];
        const startMs = Number(params[1]);
        const endMs = Number(params[2]);
        rows = rows.filter((r) => r.pet_id === petId && r.due_date >= startMs && r.due_date <= endMs);
      } else if (/WHERE\s+due_date\s*>=\s*\?\s+AND\s+due_date\s*<=\s*\?/i.test(cleanSql)) {
        const startMs = Number(params[0]);
        const endMs = Number(params[1]);
        rows = rows.filter((r) => r.due_date >= startMs && r.due_date <= endMs);
      } else if (/WHERE\s+pet_id\s*=\s*\?\s+AND\s+completed\s*=\s*0/i.test(cleanSql)) {
        const petId = params[0];
        rows = rows.filter((r) => r.pet_id === petId && r.completed === 0);
      } else if (/WHERE\s+completed\s*=\s*0/i.test(cleanSql)) {
        rows = rows.filter((r) => r.completed === 0);
      } else if (/WHERE\s+pet_id\s*=\s*\?/i.test(cleanSql)) {
        const petId = params[0];
        rows = rows.filter((r) => r.pet_id === petId);
      } else if (/WHERE\s+category\s*=\s*\?/i.test(cleanSql)) {
        const cat = params[0];
        rows = rows.filter((r) => r.category === cat);
      } else if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = params[0];
        rows = rows.filter((r) => r.id === id);
      } else if (/WHERE\s+conversation_id\s*=\s*\?/i.test(cleanSql)) {
        const convId = params[0];
        rows = rows.filter((r) => r.conversation_id === convId);
      }
    }

    // ORDER BY
    if (/ORDER BY\s+is_active\s+DESC,\s*name\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (b.is_active || 0) - (a.is_active || 0) || (a.name || '').localeCompare(b.name || ''));
    } else if (/ORDER BY\s+name\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (/ORDER BY\s+completed\s+ASC,\s*due_date\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (a.completed || 0) - (b.completed || 0) || (a.due_date || 0) - (b.due_date || 0));
    } else if (/ORDER BY\s+logged_at\s+DESC/i.test(cleanSql)) {
      rows.sort((a, b) => (b.logged_at || 0) - (a.logged_at || 0));
    } else if (/ORDER BY\s+logged_at\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (a.logged_at || 0) - (b.logged_at || 0));
    } else if (/ORDER BY\s+due_date\s+DESC/i.test(cleanSql)) {
      rows.sort((a, b) => (b.due_date || 0) - (a.due_date || 0));
    } else if (/ORDER BY\s+due_date\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (a.due_date || 0) - (b.due_date || 0));
    } else if (/ORDER BY\s+created_at\s+ASC/i.test(cleanSql)) {
      rows.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    }

    // LIMIT
    const limitMatch = cleanSql.match(/LIMIT\s+(\d+|\?)/i);
    if (limitMatch) {
      const limitVal = limitMatch[1] === '?' ? Number(params[params.length - 1]) : parseInt(limitMatch[1], 10);
      if (!isNaN(limitVal) && limitVal > 0) {
        rows = rows.slice(0, limitVal);
      }
    }

    return rows as T[];
  }

  async getFirstAsync<T>(sql: string, ...rawParams: any[]): Promise<T | null> {
    const list = await this.getAllAsync<T>(sql, ...rawParams);
    return list.length > 0 ? list[0] : null;
  }

  async runAsync(sql: string, ...rawParams: any[]): Promise<{ changes: number; lastInsertRowId: number }> {
    const params = flattenParams(rawParams);
    const tbl = getTableName(sql);
    const cleanSql = sql.replace(/\s+/g, ' ').trim();

    if (!tbl) return { changes: 0, lastInsertRowId: 0 };

    let changes = 0;

    if (/^INSERT/i.test(cleanSql)) {
      const colMatch = cleanSql.match(/\(([^)]+)\)\s*VALUES/i);
      if (colMatch) {
        const cols = colMatch[1].split(',').map((c) => c.trim());
        const row: any = {};
        cols.forEach((col, idx) => {
          row[col] = params[idx] !== undefined ? params[idx] : null;
        });

        // Insert or ignore / replace
        const list = tables[tbl] as any[];
        const existingIdx = row.id ? list.findIndex((r) => r.id === row.id) : -1;
        if (existingIdx >= 0) {
          if (!/OR IGNORE/i.test(cleanSql)) {
            list[existingIdx] = { ...list[existingIdx], ...row };
            changes = 1;
          }
        } else {
          list.push(row);
          changes = 1;
        }
      }
    } else if (/^UPDATE/i.test(cleanSql)) {
      const list = tables[tbl] as any[];

      if (/SET is_active = 0$/i.test(cleanSql)) {
        list.forEach((r) => {
          r.is_active = 0;
          changes++;
        });
      } else if (/SET is_active = 1 WHERE id = \?/i.test(cleanSql)) {
        const id = params[0];
        const target = list.find((r) => r.id === id);
        if (target) {
          target.is_active = 1;
          changes = 1;
        }
      } else if (/WHERE id = \?/i.test(cleanSql)) {
        const id = params[params.length - 1];
        const target = list.find((r) => r.id === id);
        if (target) {
          const setClause = cleanSql.match(/SET (.*?) WHERE/i)?.[1] || '';
          const assignments = setClause.split(',').map((s) => s.trim());
          assignments.forEach((assignment, i) => {
            const col = assignment.split('=')[0]?.trim();
            if (col) {
              target[col] = params[i];
            }
          });
          changes = 1;
        }
      } else if (/SET updated_at = \? WHERE id = \?/i.test(cleanSql)) {
        const [updatedAt, id] = params;
        const target = list.find((r) => r.id === id);
        if (target) {
          target.updated_at = updatedAt;
          changes = 1;
        }
      }
    } else if (/^DELETE/i.test(cleanSql)) {
      let list = tables[tbl] as any[];
      const beforeCount = list.length;

      if (/WHERE id = \?/i.test(cleanSql)) {
        const id = params[0];
        list = list.filter((r) => r.id !== id);
      } else if (/WHERE pet_id = \?/i.test(cleanSql)) {
        const petId = params[0];
        list = list.filter((r) => r.pet_id !== petId);
      } else if (!/WHERE/i.test(cleanSql)) {
        list = [];
      }

      (tables as any)[tbl] = list;
      changes = beforeCount - list.length;
    }

    saveStorage(tables);
    return { changes, lastInsertRowId: 1 };
  }

  async execAsync(sql: string): Promise<void> {
    // Schema creation or PRAGMAs are no-ops on web mock
    return Promise.resolve();
  }

  async withTransactionAsync<T>(callback: () => Promise<T>): Promise<T> {
    return callback();
  }
}

const dbInstance = new WebDatabase();

export async function getDb(): Promise<WebDatabase> {
  function ensureFigmaPetWeb() {
  const hasBuddy = tables.pets.some((p) => p.name === 'Buddy');
  if (!hasBuddy) {
    const now = Date.now();
    tables.pets.forEach((p) => {
      p.is_active = 0;
    });
    tables.pets.unshift({
      id: 'pet-buddy-figma',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      gender: 'Male',
      birthdate: '2023-01-01',
      weight: 28.5,
      weight_unit: 'kg',
      photo_uri: undefined,
      microchip_id: '985#0012781',
      notes: 'Friendly and loyal Golden Retriever.',
      allergies: 'Wheat, Dairy',
      diet: 'Dry Kibble',
      vet_name: 'Dr. Sarah Chen',
      vet_clinic: 'Happy Paws Veterinary Clinic',
      vet_phone: '(02) 8123-4567',
      is_active: 1,
      created_at: now,
      updated_at: now,
    });
    saveStorage(tables);
  }
}

function ensureInventoryWeb() {
  if (!tables.inventory || tables.inventory.length === 0) {
    const now = Date.now();
    tables.inventory = [
      { id: 'inv-1', name: 'Dry Kibble', description: 'Royal Canin Adult', category: 'Food', quantity: 2, unit: 'bags', min_stock: 1, icon: 'bone', created_at: now, updated_at: now },
      { id: 'inv-2', name: 'Wet Food', description: 'Chicken variety', category: 'Food', quantity: 6, unit: 'cans', min_stock: 4, icon: 'can', created_at: now, updated_at: now },
      { id: 'inv-3', name: 'Flea Medicine', description: 'NexGard Spectra', category: 'Health', quantity: 1, unit: 'doses', min_stock: 2, icon: 'pill', created_at: now, updated_at: now },
      { id: 'inv-4', name: 'Pet Shampoo', description: 'Oatmeal formula', category: 'Care', quantity: 1, unit: 'bottle', min_stock: 1, icon: 'bath', created_at: now, updated_at: now },
      { id: 'inv-5', name: 'Waste Bags', description: 'Biodegradable rolls', category: 'Care', quantity: 2, unit: 'rolls', min_stock: 3, icon: 'roll', created_at: now, updated_at: now },
    ];
    saveStorage(tables);
  }
}

seedInitialWebData();
ensureFigmaPetWeb();
ensureInventoryWeb();
  return dbInstance;
}

