'use client';

import { useMemo, useState } from 'react';
import type { Period, Transaction } from '@/lib/types';
import {
  buildDayPoints,
  formatCompactVND,
  getMonthLabel,
  monthlyTotals,
  shiftMonth,
} from '@/lib/utils';
import { Card } from './Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onAnchorChange: (a: { year: number; month: number }) => void;
}

export default function SummaryCards({ transactions, anchor, onAnchorChange }: Props) {
  const [period, setPeriod] = useState<Period>('month');
  const { income, expense, balance } = monthlyTotals(transactions, anchor.year, anchor.month);
  const dayPoints = useMemo(
    () => buildDayPoints(transactions, period, anchor),
    [transactions, period, anchor],
  );

  const navPrev = () => onAnchorChange(shiftMonth(anchor, -1));
  const navNext = () => onAnchorChange(shiftMonth(anchor, 1));

  return (
    <div className="space-y-4">
      {/* Điều hướng tháng */}
      <div className="flex items-center justify-between">
        <button
          onClick={navPrev}
          className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100 text-slate-600"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {getMonthLabel(anchor.year, anchor.month)}
        </span>
        <button
          onClick={navNext}
          className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100 text-slate-600"
        >
          →
        </button>
      </div>

      {/* 3 thẻ tóm tắt */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          icon="📈"
          title="Thu nhập"
          value={formatCompactVND(income)}
          tone="income"
          className="border-emerald-100"
        />
        <Card
          icon="📉"
          title="Chi tiêu"
          value={formatCompactVND(expense)}
          tone="expense"
          className="border-rose-100"
        />
        <Card
          icon="💳"
          title="Còn lại"
          value={formatCompactVND(balance)}
          tone={balance >= 0 ? 'income' : 'expense'}
          className={balance >= 0 ? 'border-emerald-100' : 'border-rose-100'}
        />
      </div>

      {/* Biểu đồ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Biểu đồ</h2>
          <div className="flex gap-1">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayPoints} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: any) => formatCompactVND(Number(value))}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Chi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}