export type CategoryId =
  | 'food'
  | 'transport'
  | 'housing'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'travel'
  | 'utilities'
  | 'income'
  | 'other';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // luôn dương
  category: CategoryId;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface MonthlyTotals {
  income: number;
  expense: number;
  balance: number;
}

export type Period = 'week' | 'month' | 'year';

export interface DayPoint {
  date: string; // YYYY-MM-DD
  label: string;
  income: number;
  expense: number;
}

/** Ngân sách theo danh mục cho một tháng (đơn vị: VND, undefined = chưa đặt) */
export type Budgets = Partial<Record<CategoryId, number>>;
