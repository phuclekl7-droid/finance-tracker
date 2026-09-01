import type { CategoryId, DayPoint, Period, Transaction } from './types';
import { CATEGORY_MAP, EXPENSE_CATEGORIES } from './categories';

export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatCompactVND(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ`;
  }
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} tr`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k`;
  }
  return `${amount}`;
}

/** Hôm nay theo giờ máy, định dạng YYYY-MM-DD */
export function todayStr(): string {
  return toDateStr(new Date());
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Thứ tiếng Việt ngắn: T2..CN */
export function weekdayShort(d: Date): string {
  const wd = d.getDay();
  if (wd === 0) return 'CN';
  return `T${wd + 1}`;
}

/** dd/MM hoặc dd/MM/yyyy */
export function formatDateShort(s: string): string {
  const [, m, d] = s.split('-').map(Number);
  const sameYear = s.slice(0, 4) === new Date().getFullYear().toString();
  return sameYear ? `${d}/${m}` : `${d}/${m}/${s.slice(0, 4)}`;
}

export function formatDateLong(s: string): string {
  const d = parseDateStr(s);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function isInMonth(dateStr: string, year: number, month: number): boolean {
  return dateStr.startsWith(`${year}-${String(month).padStart(2, '0')}`);
}

export function getMonthLabel(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
}

export function sumByType(transactions: Transaction[]): {
  income: number;
  expense: number;
} {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense };
}

export function monthlyTotals(transactions: Transaction[], year: number, month: number) {
  const inMonth = transactions.filter((t) => isInMonth(t.date, year, month));
  const { income, expense } = sumByType(inMonth);
  return { income, expense, balance: income - expense };
}

export function categoryTotals(
  transactions: Transaction[],
  year: number,
  month: number,
): { id: CategoryId; label: string; emoji: string; color: string; amount: number }[] {
  const inMonth = transactions.filter(
    (t) => t.type === 'expense' && isInMonth(t.date, year, month),
  );
  const map = new Map<CategoryId, number>();
  for (const t of inMonth) {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return EXPENSE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
    color: c.color,
    amount: map.get(c.id) ?? 0,
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function weekDays(startDate: string): string[] {
  const start = parseDateStr(startDate);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(toDateStr(d));
  }
  return days;
}

export function startOfWeek(dateStr: string): string {
  const d = parseDateStr(dateStr);
  const dow = d.getDay(); // 0 = CN
  d.setDate(d.getDate() - dow);
  return toDateStr(d);
}

export function buildDayPoints(
  transactions: Transaction[],
  period: Period,
  anchor: { year: number; month: number },
): DayPoint[] {
  const points: DayPoint[] = [];
  const byDate = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const cur = byDate.get(t.date) ?? { income: 0, expense: 0 };
    if (t.type === 'income') cur.income += t.amount;
    else cur.expense += t.amount;
    byDate.set(t.date, cur);
  }

  if (period === 'week') {
    const today = todayStr();
    const days = weekDays(startOfWeek(today));
    for (const dateStr of days) {
      const d = parseDateStr(dateStr);
      const cur = byDate.get(dateStr) ?? { income: 0, expense: 0 };
      points.push({
        date: dateStr,
        label: weekdayShort(d),
        income: cur.income,
        expense: cur.expense,
      });
    }
  } else if (period === 'month') {
    const daysInMonth = new Date(anchor.year, anchor.month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${anchor.year}-${String(anchor.month).padStart(2, '0')}-${String(
        i,
      ).padStart(2, '0')}`;
      const cur = byDate.get(dateStr) ?? { income: 0, expense: 0 };
      points.push({ date: dateStr, label: `${i}`, income: cur.income, expense: cur.expense });
    }
  } else {
    for (let m = 1; m <= 12; m++) {
      const prefix = `${anchor.year}-${String(m).padStart(2, '0')}`;
      let income = 0;
      let expense = 0;
      for (const [dateStr, cur] of byDate) {
        if (dateStr.startsWith(prefix)) {
          income += cur.income;
          expense += cur.expense;
        }
      }
      points.push({ date: prefix, label: `T${m}`, income, expense });
    }
  }
  return points;
}

export function summarizeMonth(transactions: Transaction[], year: number, month: number) {
  const inMonth = transactions.filter((t) => isInMonth(t.date, year, month));
  const { income, expense } = sumByType(inMonth);
  const catTotals = categoryTotals(transactions, year, month);
  const totalExpense = catTotals.reduce((s, c) => s + c.amount, 0);
  const topCategory = catTotals[0] ?? null;
  const txCount = inMonth.length;
  const avgPerDay = daysInMonth(year, month) > 0 ? expense / daysInMonth(year, month) : 0;

  return {
    income,
    expense,
    balance: income - expense,
    categoryCount: catTotals.length,
    topCategory,
    topCategoryShare: totalExpense > 0 && topCategory ? (topCategory.amount / totalExpense) * 100 : 0,
    txCount,
    avgPerDay,
    hasData: inMonth.length > 0,
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function currentMonthAnchor(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(
  anchor: { year: number; month: number },
  delta: number,
): { year: number; month: number } {
  const total = anchor.year * 12 + (anchor.month - 1) + delta;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return { year, month };
}

export function matchSearch(t: Transaction, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const catLabel = CATEGORY_MAP[t.category].label.toLowerCase();
  return (
    t.note.toLowerCase().includes(q) ||
    catLabel.includes(q) ||
    t.amount.toString().includes(q) ||
    t.date.includes(q)
  );
}

/** Nhóm giao dịch theo tháng, mới nhất trước, mỗi giao dịch có key tháng */
export interface MonthGroup {
  key: string; // YYYY-MM
  label: string;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export function groupByMonth(transactions: Transaction[]): MonthGroup[] {
  const sorted = [...transactions].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)));
  const map = new Map<string, Transaction[]>();
  for (const t of sorted) {
    const key = t.date.slice(0, 7);
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  const groups: MonthGroup[] = [];
  for (const [key, list] of map) {
    const { income, expense } = sumByType(list);
    const [y, m] = key.split('-').map(Number);
    groups.push({
      key,
      label: getMonthLabel(y, m),
      income,
      expense,
      transactions: list,
    });
  }
  groups.sort((a, b) => b.key.localeCompare(a.key));
  return groups;
}
