'use client';

import { useRef, useState } from 'react';
import { Download, Settings, Sparkles, Trash2, Upload, X, FileSpreadsheet } from 'lucide-react';

interface Props {
  onClearAll: () => void;
  onAddSample: () => void;
  onExport: () => Promise<string>;
  onImport: (json: string) => Promise<number>;
  onExportCsv: () => string;
  onClose: () => void;
}

export default function SettingsModal({
  onClearAll,
  onAddSample,
  onExport,
  onImport,
  onExportCsv,
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
      a.download = `so-chi-tieu-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash('Đã tải file sao lưu JSON');
    } catch {
      flash('Không thể xuất dữ liệu', true);
    }
  };

  const handleExportCsv = () => {
    try {
      const csv = onExportCsv();
      const bom = '\uFEFF'; // BOM để Excel nhận diện tiếng Việt
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `so-chi-tieu-${stamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      flash('Đã tải file CSV');
    } catch {
      flash('Không thể xuất CSV', true);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm dark:bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-5 dark:bg-stone-800 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <Settings size={16} />
            </div>
            <h2 className="text-base font-bold text-stone-800 dark:text-stone-100">Cài đặt</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-600 dark:text-stone-300">
              <Download size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">Sao lưu dữ liệu (JSON)</span>
              <span className="block text-xs text-stone-400 dark:text-stone-500">Tải file sao lưu về máy</span>
            </span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-600 dark:text-stone-300">
              <FileSpreadsheet size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">Xuất Excel (CSV)</span>
              <span className="block text-xs text-stone-400 dark:text-stone-500">Mở bằng Excel/Google Sheets</span>
            </span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-600 dark:text-stone-300">
              <Upload size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">Khôi phục dữ liệu</span>
              <span className="block text-xs text-stone-400 dark:text-stone-500">Chọn file JSON đã sao lưu</span>
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
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-600 dark:text-stone-300">
              <Sparkles size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">Thêm dữ liệu mẫu</span>
              <span className="block text-xs text-stone-400 dark:text-stone-500">Xem demo vài giao dịch</span>
            </span>
          </button>

          <button
            onClick={handleClear}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-rose-50 dark:border-rose-800 dark:bg-stone-700 dark:hover:bg-rose-900/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400">
              <Trash2 size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-rose-600 dark:text-rose-400">Xóa tất cả dữ liệu</span>
              <span className="block text-xs text-rose-300 dark:text-rose-500">Không thể hoàn tác</span>
            </span>
          </button>

          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-400 dark:bg-stone-700/50 dark:text-stone-500">
            Dữ liệu được lưu tự động trong trình duyệt (IndexedDB). Dùng &quot;Sao lưu&quot; để giữ
            bản copy trên máy hoặc chuyển sang thiết bị khác.
          </div>

          {(message || error) && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                error ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
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