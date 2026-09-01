'use client';

import { useRef, useState } from 'react';
import { Download, Settings, Sparkles, Trash2, Upload, X } from 'lucide-react';

interface Props {
  onClearAll: () => void;
  onAddSample: () => void;
  onExport: () => Promise<string>;
  onImport: (json: string) => Promise<number>;
  onClose: () => void;
}

export default function SettingsModal({
  onClearAll,
  onAddSample,
  onExport,
  onImport,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string, isError = false) => {
    setError(isError ? msg : null);
    setMessage(isError ? null : msg);
    window.setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 2500);
  };

  const handleExport = async () => {
    try {
      const json = await onExport();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `finance-tracker-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash('Đã tải file sao lưu về máy');
    } catch {
      flash('Không thể xuất dữ liệu', true);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const count = await onImport(text);
      flash(`Đã khôi phục ${count} giao dịch`);
    } catch {
      flash('File sao lưu không hợp lệ', true);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (window.confirm('Xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      onClearAll();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-5 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Settings size={16} />
            </div>
            <h2 className="text-base font-bold text-stone-800">Cài đặt</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Download size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800">Sao lưu dữ liệu</span>
              <span className="block text-xs text-stone-400">Tải file JSON về máy</span>
            </span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Upload size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800">Khôi phục dữ liệu</span>
              <span className="block text-xs text-stone-400">Chọn file JSON đã sao lưu</span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />

          <button
            onClick={onAddSample}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Sparkles size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800">Thêm dữ liệu mẫu</span>
              <span className="block text-xs text-stone-400">Xem demo vài giao dịch</span>
            </span>
          </button>

          <button
            onClick={handleClear}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-rose-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <Trash2 size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-rose-600">Xóa tất cả dữ liệu</span>
              <span className="block text-xs text-rose-300">Không thể hoàn tác</span>
            </span>
          </button>

          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-400">
            Dữ liệu được lưu tự động trong trình duyệt (IndexedDB). Dùng &quot;Sao lưu&quot; để giữ
            bản copy trên máy hoặc chuyển sang thiết bị khác.
          </div>

          {(message || error) && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                error ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error ?? message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}