'use client';

import { useState } from 'react';
import { Search, Trash2, Check, X, Pencil } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { getCategory } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatVND, formatDateShort, groupByMonth, matchSearch } from '@/lib/utils';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onEdit }: Props) {
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
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
        />
        <input
          type="text"
          placeholder="Tìm theo tên, danh mục, số tiền…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-9 pr-4 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--border-soft)]"
        />
      </div>

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-stone-400 dark:text-stone-500">
          {search ? 'Không tìm thấy giao dịch nào' : 'Chưa có giao dịch nào'}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
              {group.label}
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">+{formatVND(group.income)}</span>
              <span className="font-medium text-rose-500 dark:text-rose-400">−{formatVND(group.expense)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {group.transactions.map((t) => {
              const cat = getCategory(t.category);
              const confirming = confirmId === t.id;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] px-3.5 py-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                  >
                    <CategoryIcon id={t.category} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{cat.label}</span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">{formatDateShort(t.date)}</span>
                    </div>
                    {t.note && (
                      <div className="truncate text-xs text-stone-400 dark:text-stone-500">{t.note}</div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
                          className="rounded-lg bg-stone-100 px-2 py-1 text-stone-500 dark:bg-stone-600 dark:text-stone-300"
                          aria-label="Hủy xóa"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                          aria-label="Sửa giao dịch"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-stone-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                          aria-label="Xóa giao dịch"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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