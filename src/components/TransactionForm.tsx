'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { CategoryId, TransactionType } from '@/lib/types';
import { CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';
import { todayStr } from '@/lib/utils';

interface Props {
  onAdd: (input: {
    type: TransactionType;
    amount: number;
    category: CategoryId;
    note: string;
    date: string;
  }) => void;
}

export default function TransactionForm({ onAdd }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStr());

  const categories = type === 'income' ? CATEGORIES.filter((c) => c.id === 'income') : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onAdd({ type, amount: val, category, note, date });
    setAmount('');
    setNote('');
    setCategory('food');
  };

  return (
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
            {t === 'expense' ? <Minus size={14} /> : <Plus size={14} />}
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
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-right text-2xl font-bold text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)] focus:ring-2 focus:ring-[var(--border-soft)]"
          autoFocus
        />
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">
          ₫
        </span>
      </div>

      {/* Nút số tiền nhanh */}
      <div className="flex gap-2">
        {[50_000, 100_000, 200_000, 500_000, 1_000_000].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount(String(val))}
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
          >
            {val >= 1_000_000 ? `${val / 1_000_000}tr` : `${val / 1_000}k`}
          </button>
        ))}
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
                ? 'bg-[var(--hero)] text-[var(--hero-fg)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-soft)]'
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

      {/* Ghi chú */}
      <input
        type="text"
        placeholder="Ghi chú (không bắt buộc)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)] focus:ring-2 focus:ring-[var(--border-soft)]"
      />

      {/* Ngày */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)] focus:ring-2 focus:ring-[var(--border-soft)]"
      />

      {/* Nút thêm */}
      <button
        type="submit"
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-colors ${
          type === 'expense'
            ? 'bg-rose-500 hover:bg-rose-600'
            : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
      >
        {type === 'expense' ? <Minus size={14} /> : <Plus size={14} />}
        Thêm {type === 'expense' ? 'khoản chi' : 'khoản thu'}
      </button>
    </form>
  );
}