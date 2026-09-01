import type { Budgets, CategoryId, Transaction } from './types';
import { EXPENSE_CATEGORIES } from './categories';
import { isInMonth, monthlyTotals } from './utils';

export const BUDGETS_KEY = 'finance-tracker-budgets';

export type BudgetMonthKey = string; // YYYY-MM

export function budgetKeyFor(year: number, month: number): BudgetMonthKey {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getBudgets(year: number, month: number): Budgets {
  const key = budgetKeyFor(year, month);
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<BudgetMonthKey, Budgets>;
    return all[key] ?? {};
  } catch {
    return {};
  }
}

export function setBudgets(year: number, month: number, budgets: Budgets): void {
  const key = budgetKeyFor(year, month);
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<BudgetMonthKey, Budgets>) : {};
    all[key] = budgets;
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(all));
  } catch {
    // localStorage không khả dụng (private mode) — bỏ qua
  }
}

/** Trạng thái ngân sách tổng tháng */
export interface BudgetSummary {
  hasBudget: boolean;
  budget: number;
  spent: number;
  percent: number; // 0-100, có thể > 100
  remaining: number;
  status: 'none' | 'ok' | 'warn' | 'over';
}

export function summarizeBudget(
  transactions: Transaction[],
  year: number,
  month: number,
): BudgetSummary {
  const budgets = getBudgets(year, month);
  const { expense } = monthlyTotals(transactions, year, month);
  const budget = EXPENSE_CATEGORIES.reduce((s, c) => s + (budgets[c.id] ?? 0), 0);

  if (budget <= 0) {
    return { hasBudget: false, budget: 0, spent: expense, percent: 0, remaining: 0, status: 'none' };
  }

  const percent = (expense / budget) * 100;
  const remaining = budget - expense;
  let status: BudgetSummary['status'] = 'ok';
  if (percent >= 100) status = 'over';
  else if (percent >= 80) status = 'warn';

  return { hasBudget: true, budget, spent: expense, percent, remaining, status };
}

/** Chi tiết ngân sách từng danh mục, kèm mức chi */
export interface BudgetItem {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  budget: number;
  spent: number;
  percent: number;
  remaining: number;
}

export function budgetItems(
  transactions: Transaction[],
  year: number,
  month: number,
): BudgetItem[] {
  const budgets = getBudgets(year, month);
  const inMonth = transactions.filter(
    (t) => t.type === 'expense' && isInMonth(t.date, year, month),
  );
  const spentMap = new Map<CategoryId, number>();
  for (const t of inMonth) {
    spentMap.set(t.category, (spentMap.get(t.category) ?? 0) + t.amount);
  }

  return EXPENSE_CATEGORIES.map((c) => {
    const budget = budgets[c.id] ?? 0;
    const spent = spentMap.get(c.id) ?? 0;
    return {
      id: c.id,
      label: c.label,
      emoji: c.emoji,
      color: c.color,
      budget,
      spent,
      percent: budget > 0 ? (spent / budget) * 100 : 0,
      remaining: budget - spent,
    };
  }).filter((i) => i.budget > 0 || i.spent > 0);
}
