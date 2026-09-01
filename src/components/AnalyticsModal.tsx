'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import { categoryTotals, formatVND, formatCompactVND, summarizeMonth } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onClose: () => void;
}

export default function AnalyticsModal({ transactions, anchor, onClose }: Props) {
  const summary = useMemo(() => summarizeMonth(transactions, anchor.year, anchor.month), [transactions, anchor]);
  const catTotals = useMemo(() => categoryTotals(transactions, anchor.year, anchor.month), [transactions, anchor]);

  const totalExpense = catTotals.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white px-5 pb-8 pt-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">📊 Phân tích</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        {!summary.hasData ? (
          <div className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu tháng này</div>
        ) : (
          <div className="space-y-5">
            {/* Tổng quan */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <div className="text-xs text-emerald-600">Thu nhập</div>
                <div className="mt-1 text-lg font-bold text-emerald-700">
                  {formatCompactVND(summary.income)}
                </div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 text-center">
                <div className="text-xs text-rose-600">Chi tiêu</div>
                <div className="mt-1 text-lg font-bold text-rose-700">
                  {formatCompactVND(summary.expense)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-600">Trung bình/ngày</div>
                <div className="mt-1 text-lg font-bold text-slate-700">
                  {formatCompactVND(summary.avgPerDay)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-600">Giao dịch</div>
                <div className="mt-1 text-lg font-bold text-slate-700">
                  {summary.txCount}
                </div>
              </div>
            </div>

            {/* Top category */}
            {summary.topCategory && (
              <div className="rounded-xl bg-blue-50 p-3 text-center">
                <div className="text-xs text-blue-600">Khoản chi lớn nhất</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-blue-700">
                  <span>{summary.topCategory.emoji}</span>
                  {summary.topCategory.label} — {formatCompactVND(summary.topCategory.amount)}
                </div>
                <div className="mt-0.5 text-xs text-blue-500">
                  ({summary.topCategoryShare.toFixed(0)}% tổng chi)
                </div>
              </div>
            )}

            {/* Biểu đồ tròn */}
            {catTotals.length > 0 && (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catTotals}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(props: PieLabelRenderProps) => {
                        const pct =
                          typeof props.percent === 'number'
                            ? Math.round(props.percent * 100)
                            : 0;
                        return `${props.name ?? ''} ${pct}%`;
                      }}
                      labelLine
                    >
                      {catTotals.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatVND(Number(value))}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Danh sách chi tiết */}
            <div className="space-y-2">
              {catTotals.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-8 text-center text-lg">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{c.label}</span>
                      <span className="font-semibold text-slate-800">
                        {formatCompactVND(c.amount)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${totalExpense > 0 ? (c.amount / totalExpense) * 100 : 0}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}