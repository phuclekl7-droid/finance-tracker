'use client';

import { useState, useMemo } from 'react';
import { Search, Trash2, Check, X, Pencil, Filter } from 'lucide-react';
import type { Transaction, TransactionType } from '@/lib/types';
import { getCategory } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatVND, formatDateShort, groupByMonth, matchSearch, todayStr } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

type TypeFilter = 'all' | TransactionType;

export default function TransactionList({ transactions, onDelete, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TypeFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const groups = useMemo(() => {
    let filtered = transactions;
    if (search) filtered = filtered.filter((t) => matchSearch(t, search));
    if (filterType !== 'all') filtered = filtered.filter((t) => t.type === filterType);
    if (dateFrom) filtered = filtered.filter((t) => t.date >= dateFrom);
    if (dateTo) filtered = filtered.filter((t) => t.date <= dateTo);
    return groupByMonth(filtered);
  }, [transactions, search, filterType, dateFrom, dateTo]);

  const hasActiveFilters = !!(search || filterType !== 'all' || dateFrom || dateTo);

  return (
    <div className="space-y-4">
      {/* Tìm kiếm + nút lọc */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="text"
            placeholder="Tìm kiếm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-9 pr-4 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--border-soft)]"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`rounded-xl border p-2.5 transition-colors ${
            hasActiveFilters
              ? 'border-[var(--hero)] bg-[var(--hero)] text-[var(--hero-fg)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-soft)]'
          }`}
          aria-label="Bộ lọc"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Panel bộ lọc */}
      {showFilters && (
        <div className="animate-pop rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                max={todayStr()}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                max={todayStr()}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition-colors focus:border-[var(--muted)]"
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterType === t
                    ? t === 'all'
                      ? 'bg-[var(--hero)] text-[var(--hero-fg)]'
                      : t === 'expense'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                    : 'bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {t === 'all' ? 'Tất cả' : t === 'expense' ? 'Chi' : 'Thu'}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="mt-3 text-xs text-[var(--red)] hover:underline"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
      )}

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-[var(--muted)]">
          {hasActiveFilters ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch nào'}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
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
                      <span className="text-sm font-medium text-[var(--fg)]">{cat.label}</span>
                      <span className="text-xs text-[var(--muted)]">{formatDateShort(t.date)}</span>
                    </div>
                    {t.note && (
                      <div className="truncate text-xs text-[var(--muted)]">{t.note}</div>
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