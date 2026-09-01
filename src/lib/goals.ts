/** Mục tiêu tiết kiệm */
export interface SavingsGoal {
  id: string;
  name: string;
  /** Số tiền cần đạt (VND) */
  target: number;
  /** Số tiền đã để dành (VND) */
  saved: number;
  /** Ngày hết hạn (YYYY-MM-DD) hoặc rỗng nếu không có mốc */
  dueDate: string;
  createdAt: number;
}

export const GOALS_KEY = 'finance-tracker-goals';

export function getGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavingsGoal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch {
    // bỏ qua nếu localStorage không khả dụng
  }
}

/** Ước tính cần tiết kiệm mỗi tháng để kịp hạn (0 nếu không có hạn) */
export function monthlyTarget(goal: SavingsGoal, today: string): number {
  if (!goal.dueDate || goal.dueDate <= today) return 0;
  const [y1, m1] = today.split('-').map(Number);
  const [y2, m2] = goal.dueDate.split('-').map(Number);
  const months = (y2 - y1) * 12 + (m2 - m1);
  if (months <= 0) return 0;
  const remaining = Math.max(goal.target - goal.saved, 0);
  return Math.ceil(remaining / months);
}
