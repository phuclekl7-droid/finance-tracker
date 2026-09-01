'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
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
} from '@/lib/utils';

const TABS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' },
];

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onAnchorChange: (a: { year: number; month: number }) => void;
}

export default function SummaryCards({ transactions, anchor, onAnchorChange }: Props) {
  const [period, setPeriod] = useState<Period>('month');
  const totals = monthlyTotals(transactions, anchor.year, anchor.month);
  const balance = totals.income - totals.expense;
  const dayPoints = useMemo(
    () => buildDayPoints(transactions, period, anchor),
    [transactions, period, anchor],
  );
  const maxVal = useMemo(
    () => Math.max(...dayPoints.map((d) => Math.max(d.income, d.expense)), 0),
    [dayPoints],
  );

  const totalFlow = totals.income + totals.expense;
  const incomePct = totalFlow > 0 ? (totals.income / totalFlow) * 100 : 50;

  return (
    <div className="space-y-4">
      {/* Điều hướng tháng */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onAnchorChange(shiftMonth(anchor, -1))}
          className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200/70 hover:text-stone-700"
          aria-label="Tháng trước"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-stone-600">
          {getMonthLabel(anchor.year, anchor.month)}
        </span>
        <button
          onClick={() => onAnchorChange(shiftMonth(anchor, 1))}
          className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200/70 hover:text-stone-700"
          aria-label="Tháng sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Hero: số dư */}
      <div className="rounded-3xl bg-stone-900 p-6 text-white">
        <span className="text-xs uppercase tracking-widest text-stone-400">Số dư tháng</span>
        <div className="mt-1 font-display text-3xl font-bold tracking-tight">
          {balance < 0 ? '−' : ''}
          {formatVND(Math.abs(balance))}
        </div>

        <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-white/10">
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
      <div className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-800">Dòng tiền</h2>
          <div className="flex rounded-lg bg-stone-100 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  period === t.key
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
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
