'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Transaction } from '@/lib/types';
import {
  clearAllTransactions,
  deleteTransaction,
  exportTransactions,
  getAllTransactions,
  importTransactions,
  putTransaction,
} from '@/lib/db';
import { nanoid } from 'nanoid';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllTransactions()
      .then((data) => {
        setTransactions(data);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Không đọc được dữ liệu:', err);
        setLoaded(true);
      });
  }, []);

  const addTransaction = useCallback(async (input: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = { ...input, id: nanoid(), createdAt: Date.now() };
    await putTransaction(tx);
    setTransactions((prev) => [...prev, tx]);
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllTransactions();
    setTransactions([]);
  }, []);

  const exportData = useCallback(async (): Promise<string> => {
    const backup = await exportTransactions();
    return JSON.stringify(backup, null, 2);
  }, []);

  const importData = useCallback(async (json: string): Promise<number> => {
    const count = await importTransactions(json);
    const reloaded = await getAllTransactions();
    setTransactions(reloaded);
    return count;
  }, []);

  const addSampleData = useCallback(async () => {
    const now = new Date();
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;
    const d = (offset: number) => {
      const dt = new Date(now);
      dt.setDate(now.getDate() + offset);
      return iso(dt);
    };
    const sample: Omit<Transaction, 'id' | 'createdAt'>[] = [
      { type: 'income', amount: 12_000_000, category: 'income', note: 'Lương tháng', date: d(0) },
      { type: 'expense', amount: 3_500_000, category: 'housing', note: 'Tiền thuê nhà', date: d(0) },
      { type: 'expense', amount: 750_000, category: 'food', note: 'Ăn uống tuần này', date: d(-1) },
      { type: 'expense', amount: 350_000, category: 'transport', note: 'Xăng xe', date: d(-2) },
      { type: 'expense', amount: 1_200_000, category: 'shopping', note: 'Mua giày', date: d(-3) },
      { type: 'expense', amount: 500_000, category: 'entertainment', note: 'Xem phim + cà phê', date: d(-4) },
      { type: 'expense', amount: 2_000_000, category: 'health', note: 'Khám răng', date: d(-8) },
      { type: 'expense', amount: 900_000, category: 'utilities', note: 'Tiền điện nước', date: d(-12) },
      { type: 'income', amount: 3_000_000, category: 'income', note: 'Thu nhập thêm', date: d(-15) },
      { type: 'expense', amount: 1_500_000, category: 'travel', note: 'Du lịch cuối tuần', date: d(-20) },
    ];
    const full: Transaction[] = sample.map((t) => ({
      ...t,
      id: nanoid(),
      createdAt: Date.now(),
    }));
    for (const t of full) {
      await putTransaction(t);
    }
    setTransactions((prev) => [...prev, ...full]);
  }, []);

  return {
    transactions,
    loaded,
    addTransaction,
    removeTransaction,
    clearAll,
    exportData,
    importData,
    addSampleData,
  };
}
