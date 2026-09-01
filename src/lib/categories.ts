import type { Category, CategoryId } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Ăn uống', emoji: '🍜', color: '#f97316' },
  { id: 'transport', label: 'Di chuyển', emoji: '🚗', color: '#3b82f6' },
  { id: 'housing', label: 'Nhà ở', emoji: '🏠', color: '#8b5cf6' },
  { id: 'shopping', label: 'Mua sắm', emoji: '🛍️', color: '#ec4899' },
  { id: 'entertainment', label: 'Giải trí', emoji: '🎬', color: '#f43f5e' },
  { id: 'health', label: 'Sức khỏe', emoji: '💊', color: '#14b8a6' },
  { id: 'education', label: 'Học tập', emoji: '📚', color: '#6366f1' },
  { id: 'travel', label: 'Du lịch', emoji: '✈️', color: '#06b6d4' },
  { id: 'utilities', label: 'Hóa đơn', emoji: '🧾', color: '#a16207' },
  { id: 'income', label: 'Thu nhập', emoji: '💰', color: '#22c55e' },
  { id: 'other', label: 'Khác', emoji: '📦', color: '#78716c' },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'income');

export function getCategory(id: CategoryId): Category {
  return CATEGORY_MAP[id];
}
