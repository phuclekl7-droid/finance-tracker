'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import { getCategory } from '@/lib/categories';
import { formatVND, formatDateShort, parseDateStr, groupByMonth, matchSearch } from '@/lib/utils';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const groups = useMemo(() => {
    const filtered = search ? transactions.filter((t) => matchSearch(t, search)) : transactions;
    return groupByMonth(filtered);
  }, [transactions, search]);

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirm = (id: string) => {
    onDelete(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="🔍 Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">
          {search ? 'Không tìm thấy giao dịch nào' : 'Chưa có giao dịch nào'}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">{group.label}</h3>
            <div className="flex gap-2 text-xs">
              <span className="text-emerald-600">+{formatVND(group.income)}</span>
              <span className="text-rose-600">-{formatVND(group.expense)}</span>
            </div>
          </div>
          <div className="space-y-1">
            {group.transactions.map((t) => {
              const cat = getCategory(t.category);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm transition-colors"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{cat.label}</span>
                      <span className="text-xs text-slate-400">{formatDateShort(t.date)}</span>
                    </div>
                    {t.note && (
                      <div className="truncate text-xs text-slate-400">{t.note}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatVND(t.amount)}
                    </span>
                    {confirmDelete === t.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => confirm(t.id)}
                          className="rounded bg-rose-500 px-2 py-1 text-xs text-white"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-600"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-xs text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        ✕
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