'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Plane,
  Receipt,
  Wallet,
  Package,
} from 'lucide-react';
import type { CategoryId } from '@/lib/types';

const ICONS: Record<CategoryId, LucideIcon> = {
  food: Utensils,
  transport: Car,
  housing: Home,
  shopping: ShoppingBag,
  entertainment: Clapperboard,
  health: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  utilities: Receipt,
  income: Wallet,
  other: Package,
};

export function CategoryIcon({
  id,
  className,
  size = 16,
}: {
  id: CategoryId;
  className?: string;
  size?: number;
}) {
  const Icon = ICONS[id];
  return <Icon className={className} size={size} strokeWidth={1.8} />;
}
