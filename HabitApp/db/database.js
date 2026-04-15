import * as SQLite from 'expo-sqlite';

let db;

// Abre (o crea) la base de datos
export const openDatabase = async () => {
  db = await SQLite.openDatabaseAsync('habits.db');
  return db;
};

// Crea las tablas si no existen
export const initDB = async () => {
  if (!db) await openDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT    NOT NULL,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      theme      TEXT    DEFAULT 'light',
      showAlerts INTEGER DEFAULT 1,
      sortBy     TEXT    DEFAULT 'id'
    );
  `);

  // Inserta preferencias por defecto si la tabla está vacía
  const prefs = await db.getFirstAsync('SELECT * FROM preferences');
  if (!prefs) {
    await db.runAsync(
      "INSERT INTO preferences (theme, showAlerts, sortBy) VALUES ('light', 1, 'id')"
    );
  }
};

// ─── HÁBITOS ─────────────────────────────────────────────────────────────────

export const getHabits = async (sortBy = 'id') => {
  const validColumns = ['id', 'name', 'completed'];
  const col = validColumns.includes(sortBy) ? sortBy : 'id';
  return await db.getAllAsync(`SELECT * FROM habits ORDER BY ${col}`);
};

export const addHabit = async (name) => {
  const result = await db.runAsync(
    'INSERT INTO habits (name, completed) VALUES (?, ?)',
    name,
    0
  );
  return result.lastInsertRowId;
};

export const toggleHabit = async (id, completed) => {
  await db.runAsync(
    'UPDATE habits SET completed = ? WHERE id = ?',
    completed ? 1 : 0,
    id
  );
};

export const deleteHabit = async (id) => {
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
};

// ─── PREFERENCIAS ─────────────────────────────────────────────────────────────

export const getPreferences = async () => {
  return await db.getFirstAsync('SELECT * FROM preferences');
};

export const updatePreference = async (key, value) => {
  await db.runAsync(
    `UPDATE preferences SET ${key} = ? WHERE id = 1`,
    value
  );
};