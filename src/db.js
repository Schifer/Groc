import { openDB } from 'idb';

const DB_NAME = 'groc-db';
const DB_VERSION = 1;
const STORE = 'items';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('status', 'status');
      }
    }
  });
}

// --- CRUD ---

export async function getAllItems() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function getItemsByStatus(status) {
  const db = await getDB();
  return db.getAllFromIndex(STORE, 'status', status);
}

export async function getItem(id) {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function putItem(item) {
  const db = await getDB();
  return db.put(STORE, item);
}

export async function deleteItem(id) {
  const db = await getDB();
  return db.delete(STORE, id);
}

// --- Seed Data ---

const SEED_ITEMS = [
  { name: 'Oats', quantity: 1, unit: 'kg' },
  { name: 'Peanuts', quantity: 1, unit: 'kg' },
  { name: 'Water Can', quantity: 2, unit: 'can' },
  { name: 'Seeds', quantity: 1, unit: 'pack' }
];

export async function seedIfEmpty() {
  const all = await getAllItems();
  if (all.length > 0) return;
  
  for (const seed of SEED_ITEMS) {
    const item = {
      id: crypto.randomUUID(),
      name: seed.name,
      quantity: seed.quantity,
      unit: seed.unit,
      status: 'pantry',
      restockHistory: [],
      avgRestockDays: 0
    };
    await putItem(item);
  }
}