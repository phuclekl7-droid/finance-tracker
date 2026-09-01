'use client';

import { RotateCcw } from 'lucide-react';

interface Props {
  visible: boolean;
  onUndo: () => void;
}

export default function UndoToast({ visible, onUndo }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-stone-800 px-4 py-3 text-sm text-white shadow-xl animate-toast-in dark:bg-stone-700">
      <span>Đã xóa giao dịch</span>
      <button
        onClick={onUndo}
        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-white/20"
      >
        <RotateCcw size={12} />
        Hoàn tác
      </button>
    </div>
  );
}
