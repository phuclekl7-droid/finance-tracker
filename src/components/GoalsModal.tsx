'use client';

import { useMemo, useState } from 'react';
import { X, PiggyBank, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { formatCompactVND, formatVND, todayStr } from '@/lib/utils';
import {
  SavingsGoal,
  getGoals,
  saveGoals,
  monthlyTarget,
} from '@/lib/goals';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function GoalsModal({ show, onClose }: Props) {
  useLockBodyScroll(show);
  const { mounted, phase } = useDelayedUnmount(show);
  const entering = phase === 'entering';

  const [goals, setGoals] = useState<SavingsGoal[]>(() => getGoals());
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [dueDate, setDueDate] = useState('');

  const today = todayStr();

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
    return { totalTarget, totalSaved, pct: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0 };
  }, [goals]);

  const persist = (next: SavingsGoal[]) => {
    setGoals(next);
    saveGoals(next);
  };

  const handleAdd = () => {
    const t = parseInt(target, 10);
    if (!name.trim() || !t || t <= 0) return;
    persist([
      ...goals,
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        name: name.trim(),
        target: t,
        saved: parseInt(saved, 10) || 0,
        dueDate,
        createdAt: Date.now(),
      },
    ]);
    setName('');
    setTarget('');
    setSaved('');
    setDueDate('');
    setAdding(false);
  };

  const remove = (id: string) => {
    persist(goals.filter((g) => g.id !== id));
  };

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
              <PiggyBank size={16} />
            </div>
            <h2 className="text-base font-bold text-[var(--fg)]">Mục tiêu tiết kiệm</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)]"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tổng quan */}
        {goals.length > 0 && (
          <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Đã để dành</span>
              <span className="font-semibold text-[var(--fg)]">
                {formatVND(stats.totalSaved)} / {formatVND(stats.totalTarget)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-2 rounded-full bg-[var(--green)] transition-all duration-500"
                style={{ width: `${Math.min(stats.pct, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-[var(--muted)]">
              {stats.pct.toFixed(0)}% hoàn thành
            </div>
          </div>
        )}

        {/* Danh sách mục tiêu */}
        <div className="space-y-3">
          {goals.map((g) => {
            const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            const done = pct >= 100;
            const mt = monthlyTarget(g, today);
            return (
              <div key={g.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fg)]">
                      {g.name}
                      {done && <CheckCircle2 size={14} className="text-[var(--green)]" />}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      {formatCompactVND(g.saved)} / {formatCompactVND(g.target)}
                      {g.dueDate && ` · hạn ${g.dueDate}`}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(g.id)}
                    className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Xóa mục tiêu"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${done ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {!done && (
                  <div className="mt-1.5 text-xs text-[var(--muted)]">
                    {mt > 0
                      ? `Cần để dành ${formatCompactVND(mt)}/tháng để kịp hạn`
                      : `Còn ${formatCompactVND(Math.max(g.target - g.saved, 0))} nữa`}
                  </div>
                )}
                {done && (
                  <div className="mt-1.5 text-xs font-medium text-[var(--green)]">Hoàn thành mục tiêu! 🎉</div>
                )}
              </div>
            );
          })}
          {goals.length === 0 && !adding && (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              Chưa có mục tiêu nào
            </div>
          )}
        </div>

        {/* Form thêm */}
        {adding ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <input
              type="text"
              placeholder="Tên mục tiêu (vd: Mua laptop)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Số tiền cần"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Đã có (0)"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
              />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--muted)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 rounded-xl bg-[var(--hero)] py-2 text-sm font-medium text-[var(--hero-fg)] transition-opacity hover:opacity-90"
              >
                Thêm mục tiêu
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
            Thêm mục tiêu mới
          </button>
        )}
      </div>
    </div>
  );
}