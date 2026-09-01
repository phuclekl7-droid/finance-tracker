import type { Transaction } from './types';

const DB_NAME = 'finance-tracker';
const STORE = 'transactions';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);
  return requestToPromise(store.getAll() as IDBRequest<Transaction[]>);
}

export async function putTransaction(t: Transaction): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(t);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllTransactions(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export interface BackupFile {
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
}

/** Lấy toàn bộ dữ liệu để xuất ra file JSON */
export async function exportTransactions(): Promise<BackupFile> {
  const transactions = await getAllTransactions();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
  };
}

/** Ghi đè dữ liệu từ file JSON khôi phục; trả về số giao dịch đã nạp */
export async function importTransactions(json: string): Promise<number> {
  const parsed = JSON.parse(json) as BackupFile;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.transactions)) {
    throw new Error('File sao lưu không hợp lệ');
  }
  const list: Transaction[] = parsed.transactions.filter(
    (t) =>
      t &&
      typeof t.id === 'string' &&
      (t.type === 'expense' || t.type === 'income') &&
      typeof t.amount === 'number' &&
      t.amount > 0 &&
      typeof t.date === 'string' &&
      typeof t.note === 'string' &&
      typeof t.createdAt === 'number',
  );
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  for (const t of list) store.put(t);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return list.length;
}
