'use client';

import { useState } from 'react';
import type { CategoryId, TransactionType } from '@/lib/types';
import { CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Loại */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCategory(t === 'income' ? 'income' : 'food');
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              type === t
                ? t === 'expense'
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
                : 'text-slate-500'
            }`}
          >
            {t === 'expense' ? '📤 Chi' : '📥 Thu'}
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
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-xl font-bold text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          autoFocus
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
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
            className={`flex flex-col items-center rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
              category === c.id
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="mb-0.5 text-lg">{c.emoji}</span>
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {/* Ngày */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {/* Nút thêm */}
      <button
        type="submit"
        className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors ${
          type === 'expense'
            ? 'bg-rose-500 hover:bg-rose-600'
            : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
      >
        + Thêm {type === 'expense' ? 'khoản chi' : 'khoản thu'}
      </button>
    </form>
  );
}