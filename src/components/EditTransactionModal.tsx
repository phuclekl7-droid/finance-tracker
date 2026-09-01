'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { CategoryId, Transaction, TransactionType } from '@/lib/types';
import { CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  transaction: Transaction;
  onSave: (t: Transaction) => void;
  onClose: () => void;
}

export default function EditTransactionModal({ transaction, onSave, onClose }: Props) {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState<CategoryId>(transaction.category);
  const [note, setNote] = useState(transaction.note);
  const [date, setDate] = useState(transaction.date);

  const categories = type === 'income' ? CATEGORIES.filter((c) => c.id === 'income') : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onSave({
      ...transaction,
      type,
      amount: val,
      category,
      note,
      date,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm dark:bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-5 dark:bg-stone-800 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-800 dark:text-stone-100">Chỉnh sửa giao dịch</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Loại */}
          <div className="flex gap-1.5 rounded-xl bg-stone-100 p-1 dark:bg-stone-700">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setCategory(t === 'income' ? 'income' : 'food');
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {t === 'expense' ? 'Khoản chi' : 'Khoản thu'}
              </button>
            ))}
          </div>

          {/* Số tiền */}
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-3.5 text-right text-2xl font-bold text-stone-800 outline-none transition-colors focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
              autoFocus
            />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">
              ₫
            </span>
          </div>

          {/* Danh mục */}
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                  category === c.id
                    ? 'border-stone-800 bg-stone-800 text-white dark:border-stone-500 dark:bg-stone-600'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300'
                }`}
              >
                <CategoryIcon
                  id={c.id}
                  size={18}
                  className={category === c.id ? 'text-white' : 'text-stone-500 dark:text-stone-400'}
                />
                {c.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Ghi chú (không bắt buộc)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-200"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-200"
          />

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 dark:bg-stone-600 dark:hover:bg-stone-500"
          >
            <Save size={14} />
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}