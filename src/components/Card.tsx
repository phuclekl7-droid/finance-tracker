import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

export function Card({
  title,
  value,
  sub,
  icon: Icon,
  tone,
  className,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: 'income' | 'expense' | 'neutral';
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-md dark:bg-stone-800',
        tone === 'income' && 'border-emerald-100 dark:border-emerald-800',
        tone === 'expense' && 'border-rose-100 dark:border-rose-800',
        tone === 'neutral' && 'border-slate-200 dark:border-stone-600',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-stone-400">
          {title}
        </span>
        <div
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-xl',
            tone === 'income' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
            tone === 'expense' && 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
            tone === 'neutral' && 'bg-slate-100 text-slate-500 dark:bg-stone-700 dark:text-stone-300',
          )}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div
        className={clsx(
          'mt-2 text-xl font-bold tracking-tight',
          tone === 'income' && 'text-emerald-700 dark:text-emerald-300',
          tone === 'expense' && 'text-rose-700 dark:text-rose-300',
          tone === 'neutral' && 'text-slate-800 dark:text-stone-100',
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400 dark:text-stone-400">{sub}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-stone-700 dark:bg-stone-800',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-stone-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400 dark:text-stone-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
