'use client';

import { useState } from 'react';
import { Search, Trash2, Check, X } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { getCategory } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatVND, formatDateShort, groupByMonth, matchSearch } from '@/lib/utils';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const filtered = search ? transactions.filter((t) => matchSearch(t, search)) : transactions;
    return groupByMonth(filtered);
  }, [transactions, search]);

  return (
    <div className="space-y-5">
      {/* Tìm kiếm */}
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Tìm theo tên, danh mục, số tiền…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 py-2.5 pl-9 pr-4 text-sm text-stone-700 outline-none transition-colors focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
        />
      </div>

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-stone-400">
          {search ? 'Không tìm thấy giao dịch nào' : 'Chưa có giao dịch nào'}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {group.label}
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="font-medium text-emerald-600">+{formatVND(group.income)}</span>
              <span className="font-medium text-rose-500">−{formatVND(group.expense)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {group.transactions.map((t) => {
              const cat = getCategory(t.category);
              const confirming = confirmId === t.id;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                  >
                    <CategoryIcon id={t.category} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-stone-800">{cat.label}</span>
                      <span className="text-xs text-stone-400">{formatDateShort(t.date)}</span>
                    </div>
                    {t.note && (
                      <div className="truncate text-xs text-stone-400">{t.note}</div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {formatVND(t.amount)}
                    </span>

                    {confirming ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            onDelete(t.id);
                            setConfirmId(null);
                          }}
                          className="rounded-lg bg-rose-500 px-2 py-1 text-white"
                          aria-label="Xác nhận xóa"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg bg-stone-100 px-2 py-1 text-stone-500"
                          aria-label="Hủy xóa"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(t.id)}
                        className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Xóa giao dịch"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}