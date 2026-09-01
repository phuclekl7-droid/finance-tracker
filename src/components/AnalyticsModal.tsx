'use client';

import { useMemo } from 'react';
import { ChartPie, X } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { CategoryIcon } from './CategoryIcon';
import { categoryTotals, formatCompactVND, formatVND, summarizeMonth } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from 'recharts';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface Props {
  transactions: Transaction[];
  anchor: { year: number; month: number };
  onClose: () => void;
}

export default function AnalyticsModal({ transactions, anchor, onClose }: Props) {
  useLockBodyScroll(true);
  const summary = useMemo(() => summarizeMonth(transactions, anchor.year, anchor.month), [transactions, anchor]);
  const catTotals = useMemo(() => categoryTotals(transactions, anchor.year, anchor.month), [transactions, anchor]);

  const totalExpense = catTotals.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in sm:items-center">
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-5 animate-slide-up sm:rounded-3xl sm:animate-pop">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <ChartPie size={16} />
            </div>
            <h2 className="text-base font-bold text-stone-800">Phân tích tháng</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {!summary.hasData ? (
          <div className="py-14 text-center text-sm text-stone-400">
            Chưa có dữ liệu cho tháng này
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tổng quan */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3.5">
                <div className="text-xs font-medium text-emerald-600">Thu nhập</div>
                <div className="mt-1 font-display text-lg font-bold text-emerald-700">
                  {formatCompactVND(summary.income)}
                </div>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3.5">
                <div className="text-xs font-medium text-rose-600">Chi tiêu</div>
                <div className="mt-1 font-display text-lg font-bold text-rose-700">
                  {formatCompactVND(summary.expense)}
                </div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-3.5">
                <div className="text-xs font-medium text-stone-500">Trung bình/ngày</div>
                <div className="mt-1 font-display text-lg font-bold text-stone-700">
                  {formatCompactVND(summary.avgPerDay)}
                </div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-3.5">
                <div className="text-xs font-medium text-stone-500">Giao dịch</div>
                <div className="mt-1 font-display text-lg font-bold text-stone-700">
                  {summary.txCount}
                </div>
              </div>
            </div>

            {/* Khoản chi lớn nhất */}
            {summary.topCategory && (
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-xs font-medium text-stone-400">Khoản chi lớn nhất</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${summary.topCategory.color}1a`, color: summary.topCategory.color }}
                  >
                    <CategoryIcon id={summary.topCategory.id} size={18} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">
                      {summary.topCategory.label}
                    </div>
                    <div className="text-xs text-stone-400">
                      {formatCompactVND(summary.topCategory.amount)} ·{' '}
                      {summary.topCategoryShare.toFixed(0)}% tổng chi
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Biểu đồ tròn */}
            {catTotals.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-stone-800">Phân bố chi tiêu</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={catTotals}
                        dataKey="amount"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={2}
                        strokeWidth={0}
                        label={(props: PieLabelRenderProps) => {
                          const pct =
                            typeof props.percent === 'number' ? Math.round(props.percent * 100) : 0;
                          if (pct < 8) return '';
                          return `${pct}%`;
                        }}
                      >
                        {catTotals.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatVND(Number(value))}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 12,
                          border: '1px solid #e7e5e4',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Danh sách chi tiết */}
            <div className="space-y-3">
              {catTotals.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                  >
                    <CategoryIcon id={c.id} size={15} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-700">{c.label}</span>
                      <span className="font-semibold text-stone-800 tabular-nums">
                        {formatCompactVND(c.amount)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-stone-100">
                      <div
                        className="h-1.5 rounded-full transition-all"
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