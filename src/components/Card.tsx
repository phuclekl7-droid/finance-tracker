import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({
  title,
  value,
  sub,
  icon,
  tone,
  className,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  tone?: 'income' | 'expense' | 'neutral';
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div
        className={clsx(
          'mt-2 text-2xl font-bold tracking-tight',
          tone === 'income' && 'text-emerald-600',
          tone === 'expense' && 'text-rose-600',
          tone === 'neutral' && 'text-slate-900',
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
