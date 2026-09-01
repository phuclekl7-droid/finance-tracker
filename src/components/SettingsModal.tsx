'use client';

interface Props {
  onClearAll: () => void;
  onAddSample: () => void;
  onClose: () => void;
}

export default function SettingsModal({ onClearAll, onAddSample, onClose }: Props) {
  const handleClear = () => {
    if (window.confirm('Xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      onClearAll();
      onClose();
    }
  };

  const handleSample = () => {
    onAddSample();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white px-5 pb-8 pt-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">⚙️ Cài đặt</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSample}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            📥 Thêm dữ liệu mẫu
          </button>
          <button
            onClick={handleClear}
            className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            🗑️ Xóa tất cả dữ liệu
          </button>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400">
            Dữ liệu được lưu trong trình duyệt (IndexedDB). Không đồng bộ lên server.
          </div>
        </div>
      </div>
    </div>
  );
}