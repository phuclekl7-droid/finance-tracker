import type { CategoryId, TransactionType } from './types';

/** Quy tắc giao dịch định kỳ lặp lại theo tháng */
export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  note: string;
  /** Ngày trong tháng (1-28) sẽ sinh bản ghi */
  dayOfMonth: number;
  /** Bắt đầu áp dụng từ tháng này (YYYY-MM) */
  startMonth: string;
  active: boolean;
  createdAt: number;
}

export const RECURRING_KEY = 'finance-tracker-recurring';

export function getRecurringRules(): RecurringRule[] {
  try {
    const raw = localStorage.getItem(RECURRING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecurringRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecurringRules(rules: RecurringRule[]): void {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(rules));
  } catch {
    // localStorage không khả dụng — bỏ qua
  }
}

/**
 * Với một tháng cho trước (YYYY-MM), trả về các bản ghi định kỳ sẽ xuất hiện
 * (không đổi trạng thái, chỉ tính toán — người dùng tự nhấn "thêm" để ghi sổ).
 */
export function dueRecurringForMonth(
  rules: RecurringRule[],
  year: number,
  month: number,
): RecurringRule[] {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  return rules.filter(
    (r) => r.active && r.startMonth <= key,
  );
}
