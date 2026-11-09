import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Ordered migrations, applied by PRAGMA user_version. */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('done', 'pending', 'error')),
    error TEXT,
    provider TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages (conversation_id, created_at);
  `,
  `
  ALTER TABLE messages ADD COLUMN image_uri TEXT;
  `,
  `
  ALTER TABLE messages ADD COLUMN audio_uri TEXT;
  `,
  `
  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    birthdate TEXT,
    weight REAL,
    weight_unit TEXT DEFAULT 'kg',
    photo_uri TEXT,
    microchip_id TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    amount REAL NOT NULL,
    unit TEXT NOT NULL,
    logged_at INTEGER NOT NULL,
    appetite TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_meals_pet ON meals (pet_id, logged_at);

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    due_date INTEGER NOT NULL,
    frequency TEXT DEFAULT 'once',
    completed INTEGER DEFAULT 0,
    completed_at INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders (pet_id, due_date);

  CREATE TABLE IF NOT EXISTS health_notes (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT NOT NULL,
    symptoms TEXT,
    medication TEXT,
    vet_name TEXT,
    follow_up_date INTEGER,
    logged_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_health_pet ON health_notes (pet_id, logged_at);

  CREATE TABLE IF NOT EXISTS weight_entries (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    weight REAL NOT NULL,
    unit TEXT NOT NULL,
    logged_at INTEGER NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_weight_pet ON weight_entries (pet_id, logged_at);
  `,
  `
  ALTER TABLE reminders ADD COLUMN sound TEXT DEFAULT 'chime';
  ALTER TABLE reminders ADD COLUMN notification_id TEXT;
  `,
  `
  ALTER TABLE pets ADD COLUMN allergies TEXT;
  ALTER TABLE pets ADD COLUMN diet TEXT;
  ALTER TABLE pets ADD COLUMN vet_name TEXT;
  ALTER TABLE pets ADD COLUMN vet_clinic TEXT;
  ALTER TABLE pets ADD COLUMN vet_phone TEXT;
  `,
  `
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'units',
    min_stock INTEGER NOT NULL DEFAULT 1,
    icon TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory (category);
  `,
];

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function seedInitialData(database: SQLite.SQLiteDatabase): Promise<void> {
  const countRow = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pets'
  );
  if ((countRow?.count ?? 0) > 0) return;

  const now = Date.now();
  const oneHour = 3600 * 1000;
  const oneDay = 24 * oneHour;

  // Pet 1: Bella (Golden Retriever)
  const pet1Id = 'pet-bella-golden';
  await database.runAsync(
    `INSERT INTO pets (id, name, species, breed, gender, birthdate, weight, weight_unit, photo_uri, microchip_id, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pet1Id,
      'Bella',
      'Dog',
      'Golden Retriever',
      'Female',
      '2024-03-15',
      24.5,
      'kg',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      'CHIP-984210492',
      'Loves fetch, swims in the lake, allergic to chicken poultry byproduct.',
      1,
      now - 60 * oneDay,
      now,
    ]
  );

  // Pet 2: Mochi (Scottish Fold)
  const pet2Id = 'pet-mochi-cat';
  await database.runAsync(
    `INSERT INTO pets (id, name, species, breed, gender, birthdate, weight, weight_unit, photo_uri, microchip_id, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pet2Id,
      'Mochi',
      'Cat',
      'Scottish Fold',
      'Male',
      '2025-01-10',
      4.2,
      'kg',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      'CHIP-110294829',
      'Calm indoor cat. Prefers salmon flavor wet food. Enjoys feather wand.',
      0,
      now - 30 * oneDay,
      now,
    ]
  );

  // Seed Bella's meals
  await database.runAsync(
    `INSERT INTO meals (id, pet_id, meal_type, food_name, amount, unit, logged_at, appetite, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'meal-1',
      pet1Id,
      'Breakfast',
      'Royal Canin Adult Maxi Dry',
      250,
      'g',
      now - 3 * oneHour,
      'Normal',
      'Ate eagerly with fresh water.',
      now - 3 * oneHour,
    ]
  );
  await database.runAsync(
    `INSERT INTO meals (id, pet_id, meal_type, food_name, amount, unit, logged_at, appetite, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'meal-2',
      pet1Id,
      'Snack',
      'Carrot Sticks & Peanut Butter Treats',
      50,
      'g',
      now - 1 * oneHour,
      'High',
      'Training reward during park walk.',
      now - 1 * oneHour,
    ]
  );

  // Seed Bella's Reminders
  await database.runAsync(
    `INSERT INTO reminders (id, pet_id, title, category, due_date, frequency, completed, completed_at, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'rem-1',
      pet1Id,
      'Evening Kibble & Omega-3 Oil',
      'Feeding',
      now + 4 * oneHour,
      'daily',
      0,
      null,
      '250g kibble mixed with 1 pump fish oil',
      now,
    ]
  );
  await database.runAsync(
    `INSERT INTO reminders (id, pet_id, title, category, due_date, frequency, completed, completed_at, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'rem-2',
      pet1Id,
      'Heartworm Preventive Chewable',
      'Medication',
      now + 2 * oneDay,
      'monthly',
      0,
      null,
      'NexGard Spectra chew with meal',
      now,
    ]
  );
  await database.runAsync(
    `INSERT INTO reminders (id, pet_id, title, category, due_date, frequency, completed, completed_at, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'rem-3',
      pet1Id,
      'Full Coat Brushing & Nail Trim',
      'Grooming',
      now + 4 * oneDay,
      'weekly',
      0,
      null,
      'Use slicker brush and undercoat rake',
      now,
    ]
  );
  await database.runAsync(
    `INSERT INTO reminders (id, pet_id, title, category, due_date, frequency, completed, completed_at, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'rem-4',
      pet1Id,
      'Morning Walk & Fetch',
      'Exercise',
      now - 2 * oneHour,
      'daily',
      1,
      now - 2 * oneHour,
      '45 minutes in sunshine',
      now,
    ]
  );

  // Seed Bella's Health Note
  await database.runAsync(
    `INSERT INTO health_notes (id, pet_id, title, category, notes, symptoms, medication, vet_name, follow_up_date, logged_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'health-1',
      pet1Id,
      'Annual Routine Wellness & Rabies Vaccine',
      'Vaccination',
      'Teeth are healthy, heart sounds strong, skin and coat in prime condition.',
      'None - healthy and happy',
      'Rabies booster & DHPP administered',
      'Dr. Rachel Adams, Central Paws Clinic',
      now + 365 * oneDay,
      now - 14 * oneDay,
      now - 14 * oneDay,
    ]
  );

  // Seed Bella's Weight Entries (to render trend chart)
  const weightData = [
    { daysAgo: 60, weight: 23.2 },
    { daysAgo: 45, weight: 23.6 },
    { daysAgo: 30, weight: 24.0 },
    { daysAgo: 15, weight: 24.2 },
    { daysAgo: 1, weight: 24.5 },
  ];
  for (const item of weightData) {
    await database.runAsync(
      `INSERT INTO weight_entries (id, pet_id, weight, unit, logged_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `weight-${item.daysAgo}`,
        pet1Id,
        item.weight,
        'kg',
        now - item.daysAgo * oneDay,
        'Regular weigh-in during clinic checkup or home scale',
        now - item.daysAgo * oneDay,
      ]
    );
  }
}

async function ensureFigmaPet(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const buddy = await database.getFirstAsync<{ id: string }>(
      "SELECT id FROM pets WHERE name = 'Buddy' LIMIT 1"
    );
    if (!buddy) {
      const buddyId = 'pet-buddy-figma';
      const now = Date.now();
      // Make Buddy the active pet matching Figma prototype
      await database.runAsync('UPDATE pets SET is_active = 0');
      await database.runAsync(
        `INSERT INTO pets (id, name, species, breed, gender, birthdate, weight, weight_unit, photo_uri, microchip_id, notes, allergies, diet, vet_name, vet_clinic, vet_phone, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          buddyId,
          'Buddy',
          'Dog',
          'Golden Retriever',
          'Male',
          '2023-01-01',
          28.5,
          'kg',
          null,
          '985#0012781',
          'Friendly and loyal Golden Retriever.',
          'Wheat, Dairy',
          'Dry Kibble',
          'Dr. Sarah Chen',
          'Happy Paws Veterinary Clinic',
          '(02) 8123-4567',
          1,
          now,
          now,
        ]
      );
    }
  } catch (err) {
    console.warn('ensureFigmaPet error:', err);
  }
}

async function ensureInitialInventory(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const countRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM inventory'
    );
    if ((countRow?.count ?? 0) === 0) {
      const now = Date.now();
      const initialItems = [
        { id: 'inv-1', name: 'Dry Kibble', description: 'Royal Canin Adult', category: 'Food', quantity: 2, unit: 'bags', min_stock: 1, icon: 'bone' },
        { id: 'inv-2', name: 'Wet Food', description: 'Chicken variety', category: 'Food', quantity: 6, unit: 'cans', min_stock: 4, icon: 'can' },
        { id: 'inv-3', name: 'Flea Medicine', description: 'NexGard Spectra', category: 'Health', quantity: 1, unit: 'doses', min_stock: 2, icon: 'pill' },
        { id: 'inv-4', name: 'Pet Shampoo', description: 'Oatmeal formula', category: 'Care', quantity: 1, unit: 'bottle', min_stock: 1, icon: 'bath' },
        { id: 'inv-5', name: 'Waste Bags', description: 'Biodegradable rolls', category: 'Care', quantity: 2, unit: 'rolls', min_stock: 3, icon: 'roll' },
      ];
      for (const item of initialItems) {
        await database.runAsync(
          `INSERT INTO inventory (id, name, description, category, quantity, unit, min_stock, icon, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.name, item.description, item.category, item.quantity, item.unit, item.min_stock, item.icon, now, now]
        );
      }
    }
  } catch (err) {
    console.warn('ensureInitialInventory error:', err);
  }
}

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const version = row?.user_version ?? 0;
  for (let i = version; i < MIGRATIONS.length; i++) {
    await database.execAsync(MIGRATIONS[i]);
    await database.execAsync(`PRAGMA user_version = ${i + 1}`);
  }
  await seedInitialData(database);
  await ensureFigmaPet(database);
  await ensureInitialInventory(database);
}

/** Open (and migrate) the database. Safe to call from anywhere; runs once. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return Promise.resolve(db);
  if (!initPromise) {
    initPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('petcare.db');
      await database.execAsync('PRAGMA foreign_keys = ON');
      await migrate(database);
      db = database;
      return database;
    })();
  }
  return initPromise;
}
