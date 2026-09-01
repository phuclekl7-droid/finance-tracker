'use client';

import { useMemo, useState } from 'react';
import { Target, X, Save, Pencil } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { CategoryIcon } from './CategoryIcon';
import {
  budgetItems,
  getBudgets,
  setBudgets,
  summarizeBudget,
} from '@/lib/budget';
import { formatCompactVND, formatVND } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onClose: () => void;
  /* gọi sau khi lưu ngân sách để refresh UI */
  onSaved: () => void;
}

export default function BudgetModal({ transactions, anchor, onClose, onSaved }: Props) {
  const summary = useMemo(
    () => summarizeBudget(transactions, anchor.year, anchor.month),
    [transactions, anchor],
  );
  const items = useMemo(
    () => budgetItems(transactions, anchor.year, anchor.month),
    [transactions, anchor],
  );

  const [editing, setEditing] = useState(false);
  // Lưu budget dạng string để nhập
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(() => {
    const b = getBudgets(anchor.year, anchor.month);
    const inputs: Record<string, string> = {};
    for (const item of items) {
      inputs[item.id] = b[item.id] ? String(b[item.id]) : '';
    }
    return inputs;
  });

  const handleSave = () => {
    const budgets: Record<string, number> = {};
    for (const [id, val] of Object.entries(budgetInputs)) {
      const n = parseInt(val.replace(/[.,]/g, ''), 10);
      if (!isNaN(n) && n > 0) budgets[id] = n;
    }
    setBudgets(anchor.year, anchor.month, budgets as any);
    setEditing(false);
    onSaved();
  };

  const handleStartEdit = () => {
    const b = getBudgets(anchor.year, anchor.month);
    const inputs: Record<string, string> = {};
    for (const item of items) {
      inputs[item.id] = b[item.id] ? String(b[item.id]) : '';
    }
    setBudgetInputs(inputs);
    setEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm dark:bg-black/50 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-5 dark:bg-stone-800 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <Target size={16} />
            </div>
            <h2 className="text-base font-bold text-stone-800 dark:text-stone-100">Ngân sách</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tổng quan */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-600 dark:bg-stone-700/50">
          {!summary.hasBudget ? (
            <>
              <div className="text-sm font-medium text-stone-500 dark:text-stone-400">
                Chưa đặt ngân sách
              </div>
              <div className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                Đặt hạn mức chi tiêu cho từng danh mục để kiểm soát tài chính
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                  Tổng ngân sách
                </span>
                <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  {formatVND(summary.budget)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-stone-400">Đã chi</span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  {formatVND(summary.spent)}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
                <div
                  className={`h-2 rounded-full transition-all ${
                    summary.status === 'over'
                      ? 'bg-rose-500'
                      : summary.status === 'warn'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(summary.percent, 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span
                  className={
                    summary.status === 'over'
                      ? 'font-medium text-rose-600 dark:text-rose-400'
                      : summary.status === 'warn'
                        ? 'font-medium text-amber-600 dark:text-amber-400'
                        : 'text-stone-500 dark:text-stone-400'
                  }
                >
                  {summary.percent.toFixed(0)}% ngân sách
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  Còn {formatCompactVND(Math.max(summary.remaining, 0))}
                </span>
              </div>
              {summary.status === 'over' && (
                <div className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Đã vượt ngân sách {formatCompactVND(Math.abs(summary.remaining))}
                </div>
              )}
              {summary.status === 'warn' && (
                <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Sắp đạt ngân sách, còn {formatCompactVND(summary.remaining)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Nút chỉnh sửa / lưu */}
        <div className="mt-4 flex justify-end">
          {editing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-600 dark:hover:bg-stone-500"
            >
              <Save size={14} />
              Lưu
            </button>
          ) : (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Danh sách ngân sách */}
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${item.color}1a`, color: item.color }}
              >
                <CategoryIcon id={item.id} size={15} />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-700 dark:text-stone-300">{item.label}</span>
                  {editing ? (
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={budgetInputs[item.id] ?? ''}
                        onChange={(e) =>
                          setBudgetInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-28 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-right text-sm font-medium text-stone-800 outline-none focus:border-stone-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                        ₫
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                      {item.budget > 0 ? formatCompactVND(item.budget) : '—'}
                    </span>
                  )}
                </div>
                {item.spent > 0 && item.budget > 0 && (
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-600">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        item.percent >= 100
                          ? 'bg-rose-500'
                          : item.percent >= 80
                            ? 'bg-amber-400'
                            : ''
                      }`}
                      style={{
                        width: `${Math.min(item.percent, 100)}%`,
                        backgroundColor:
                          item.percent >= 80 ? undefined : item.color,
                      }}
                    />
                  </div>
                )}
                {item.spent > 0 && (
                  <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                    Đã chi {formatCompactVND(item.spent)}
                    {item.budget > 0 && ` (${item.percent.toFixed(0)}%)`}
                  </div>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && !editing && (
            <div className="py-4 text-center text-xs text-stone-400 dark:text-stone-500">
              Nhấn &quot;Chỉnh sửa&quot; để đặt hạn mức chi tiêu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}