'use client';

import { useState } from 'react';
import { X, Repeat, Plus, Trash2 } from 'lucide-react';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { CategoryIcon } from './CategoryIcon';
import { getCategory, EXPENSE_CATEGORIES, CATEGORIES } from '@/lib/categories';
import type { TransactionType } from '@/lib/types';
import { formatVND, todayStr } from '@/lib/utils';
import {
  RecurringRule,
  getRecurringRules,
  saveRecurringRules,
} from '@/lib/recurring';

interface Props {
  show: boolean;
  /** Gọi khi nhấn "thêm bản ghi" — thêm giao dịch thật vào sổ */
  onAddRule: (rule: RecurringRule) => void;
  onClose: () => void;
}

export default function RecurringModal({ show, onAddRule, onClose }: Props) {
  useLockBodyScroll(show);
  const { mounted, phase } = useDelayedUnmount(show);
  const entering = phase === 'entering';

  const [rules, setRules] = useState<RecurringRule[]>(() => getRecurringRules());
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecurringRule['category']>('food');
  const [note, setNote] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [startMonth, setStartMonth] = useState(todayStr().slice(0, 7));

  const categories = type === 'income' ? CATEGORIES.filter((c) => c.id === 'income') : EXPENSE_CATEGORIES;

  const persist = (next: RecurringRule[]) => {
    setRules(next);
    saveRecurringRules(next);
  };

  const handleAdd = () => {
    const amt = parseFloat(amount);
    const day = parseInt(dayOfMonth, 10);
    if (!amt || amt <= 0 || !day || day < 1 || day > 28) return;
    const rule: RecurringRule = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      type,
      amount: amt,
      category,
      note,
      dayOfMonth: day,
      startMonth,
      active: true,
      createdAt: Date.now(),
    };
    persist([...rules, rule]);
    setAmount('');
    setNote('');
    setAdding(false);
  };

  const remove = (id: string) => persist(rules.filter((r) => r.id !== id));
  const toggleActive = (id: string) =>
    persist(rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[var(--hero)]/40 backdrop-blur-sm dark:bg-[var(--hero)]/60 ${
        entering ? 'animate-fade-in' : 'animate-fade-out'
      } sm:items-center`}
    >
      <div
        className={`max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--surface)] px-6 pb-8 pt-5 ${
          entering ? 'animate-slide-up sm:animate-pop' : 'animate-slide-down sm:animate-pop-out'
        } sm:rounded-3xl`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--muted)]">
              <Repeat size={16} />
            </div>
            <h2 className="text-base font-bold text-[var(--fg)]">Giao dịch định kỳ</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)]"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
          Đặt các khoản lặp lại mỗi tháng (thuê nhà, lương, điện nước…). Khi đến ngày, bạn bấm
          &quot;Thêm bản ghi&quot; để ghi vào sổ.
        </div>

        {/* Danh sách rules */}
        <div className="space-y-2">
          {rules.map((r) => {
            const cat = getCategory(r.category);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                >
                  <CategoryIcon id={r.category} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-[var(--fg)]">{cat.label}</span>
                    <span className="text-xs text-[var(--muted)]">mùng {r.dayOfMonth}</span>
                  </div>
                  {r.note && <div className="truncate text-xs text-[var(--muted)]">{r.note}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${r.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {r.type === 'income' ? '+' : '−'}
                    {formatVND(r.amount)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onAddRule(r)}
                      className="rounded-lg bg-[var(--hero)] px-2 py-1 text-xs text-[var(--hero-fg)] transition-opacity hover:opacity-90"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => toggleActive(r.id)}
                      className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                        r.active
                          ? 'bg-[var(--surface-soft)] text-[var(--muted)]'
                          : 'bg-[var(--border)] text-[var(--muted-soft)]'
                      }`}
                    >
                      {r.active ? 'Bật' : 'Tắt'}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Xóa quy tắc"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {rules.length === 0 && !adding && (
            <div className="py-8 text-center text-sm text-[var(--muted)]">Chưa có quy tắc định kỳ</div>
          )}
        </div>

        {/* Form thêm */}
        {adding ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex gap-1.5 rounded-xl bg-[var(--surface-soft)] p-1">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory(t === 'income' ? 'income' : 'food');
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? t === 'expense'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {t === 'expense' ? 'Khoản chi' : 'Khoản thu'}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-right text-sm font-semibold text-[var(--fg)] outline-none focus:border-[var(--muted)]"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">₫</span>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Ngày"
                  value={dayOfMonth}
                  min={1}
                  max={28}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 text-[11px] transition-colors ${
                    category === c.id
                      ? 'border-[var(--hero)] bg-[var(--hero)] text-[var(--hero-fg)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
                  }`}
                >
                  <CategoryIcon id={c.id} size={14} />
                  {c.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
            />
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 rounded-xl bg-[var(--hero)] py-2 text-sm font-medium text-[var(--hero-fg)] transition-opacity hover:opacity-90"
              >
                Lưu quy tắc
              </button>
              <button
                onClick={() => setAdding(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
          >
            <Plus size={15} />
            Thêm quy tắc mới
          </button>
        )}
      </div>
    </div>
  );
}