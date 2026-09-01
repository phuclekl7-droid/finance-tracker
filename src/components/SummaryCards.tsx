'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Period, Transaction } from '@/lib/types';
import {
  buildDayPoints,
  formatCompactVND,
  formatVND,
  getMonthLabel,
  monthlyTotals,
  shiftMonth,
  compareToPrevMonth,
} from '@/lib/utils';
import { summarizeBudget } from '@/lib/budget';

const TABS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' },
];

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onAnchorChange: (a: { year: number; month: number }) => void;
  onOpenBudget: () => void;
  budgetVersion?: number;
}

export default function SummaryCards({ transactions, anchor, onAnchorChange, onOpenBudget, budgetVersion = 0 }: Props) {
  const [period, setPeriod] = useState<Period>('month');
  const totals = monthlyTotals(transactions, anchor.year, anchor.month);
  const balance = totals.income - totals.expense;
  const dayPoints = useMemo(
    () => buildDayPoints(transactions, period, anchor),
    [transactions, period, anchor],
  );
  const totalFlow = totals.income + totals.expense;
  const incomePct = totalFlow > 0 ? (totals.income / totalFlow) * 100 : 50;

  const comparison = useMemo(
    () => compareToPrevMonth(transactions, anchor.year, anchor.month),
    [transactions, anchor],
  );
  const budgetSummary = useMemo(
    () => summarizeBudget(transactions, anchor.year, anchor.month),
    [transactions, anchor, budgetVersion],
  );

  return (
    <div className="space-y-4">
      {/* Điều hướng tháng */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onAnchorChange(shiftMonth(anchor, -1))}
          className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200/70 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-700/70 dark:hover:text-stone-300"
          aria-label="Tháng trước"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
          {getMonthLabel(anchor.year, anchor.month)}
        </span>
        <button
          onClick={() => onAnchorChange(shiftMonth(anchor, 1))}
          className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200/70 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-700/70 dark:hover:text-stone-300"
          aria-label="Tháng sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Hero: số dư */}
      <div className="rounded-3xl bg-stone-900 p-6 text-white dark:bg-stone-950">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-stone-400">Số dư tháng</span>
          <button
            onClick={onOpenBudget}
            className="rounded-xl bg-white/10 p-2 text-stone-400 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Ngân sách"
          >
            <Target size={15} />
          </button>
        </div>
        <div className="mt-1 font-display text-3xl font-bold tracking-tight">
          {balance < 0 ? '−' : ''}
          {formatVND(Math.abs(balance))}
        </div>

        {/* So sánh tháng trước */}
        {comparison && (
          <div className="mt-1 text-xs">
            <span
              className={
                comparison.direction === 'up'
                  ? 'text-rose-300'
                  : comparison.direction === 'down'
                    ? 'text-emerald-300'
                    : 'text-stone-400'
              }
            >
              {comparison.direction === 'up' ? '↑' : comparison.direction === 'down' ? '↓' : '→'}{' '}
              {comparison.direction === 'flat'
                ? 'Bằng tháng trước'
                : `${comparison.pct.toFixed(0)}% so với tháng trước`}
            </span>
          </div>
        )}

        {/* Cảnh báo ngân sách */}
        {budgetSummary.hasBudget && budgetSummary.status === 'over' && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-200">
            <AlertTriangle size={12} />
            Vượt ngân sách {formatCompactVND(Math.abs(budgetSummary.remaining))}
          </div>
        )}
        {budgetSummary.hasBudget && budgetSummary.status === 'warn' && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-200">
            <AlertTriangle size={12} />
            Đã dùng {budgetSummary.percent.toFixed(0)}% ngân sách
          </div>
        )}

        <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="bg-emerald-400" style={{ width: `${incomePct}%` }} />
          <div className="bg-rose-400" style={{ width: `${100 - incomePct}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <TrendingUp size={12} />
              Thu nhập
            </div>
            <div className="mt-1 text-base font-semibold text-emerald-300">
              {formatCompactVND(totals.income)}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-stone-400">
              <TrendingDown size={12} />
              Chi tiêu
            </div>
            <div className="mt-1 text-base font-semibold text-rose-300">
              {formatCompactVND(totals.expense)}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ dòng tiền */}
      <div className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Dòng tiền</h2>
          <div className="flex rounded-lg bg-stone-100 p-0.5 dark:bg-stone-700">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  period === t.key
                    ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayPoints} barGap={2}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <Tooltip
                formatter={(value: any) => formatCompactVND(Number(value))}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                }}
              />
              <Bar dataKey="expense" name="Chi" fill="#fda4af" radius={[3, 3, 0, 0]} maxBarSize={10} />
              <Bar dataKey="income" name="Thu" fill="#86efac" radius={[3, 3, 0, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}