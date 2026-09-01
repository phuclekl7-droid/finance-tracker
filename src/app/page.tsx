'use client';

import { useState } from 'react';
import { ChartColumn, Settings2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import AnalyticsModal from '@/components/AnalyticsModal';
import SettingsModal from '@/components/SettingsModal';
import { SectionCard } from '@/components/Card';
import { currentMonthAnchor } from '@/lib/utils';

export default function Home() {
  const {
    transactions,
    loaded,
    addTransaction,
    removeTransaction,
    clearAll,
    exportData,
    importData,
    addSampleData,
  } = useTransactions();
  const [anchor, setAnchor] = useState(currentMonthAnchor);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-5">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-stone-900">
            Sổ chi tiêu
          </h1>
          <p className="text-xs text-stone-400">Quản lý thu chi của bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(true)}
            className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-500 shadow-xs transition-colors hover:bg-stone-50 hover:text-stone-700"
            aria-label="Phân tích"
          >
            <ChartColumn size={17} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-500 shadow-xs transition-colors hover:bg-stone-50 hover:text-stone-700"
            aria-label="Cài đặt"
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      {!loaded ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-700" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tóm tắt + biểu đồ */}
          <SummaryCards transactions={transactions} anchor={anchor} onAnchorChange={setAnchor} />

          {/* Thêm giao dịch */}
          <SectionCard title="Thêm giao dịch">
            <TransactionForm onAdd={addTransaction} />
          </SectionCard>

          {/* Danh sách */}
          <SectionCard title="Lịch sử giao dịch">
            <TransactionList transactions={transactions} onDelete={removeTransaction} />
          </SectionCard>
        </div>
      )}

      {/* Modals */}
      {showAnalytics && (
        <AnalyticsModal
          transactions={transactions}
          anchor={anchor}
          onClose={() => setShowAnalytics(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClearAll={clearAll}
          onAddSample={addSampleData}
          onExport={exportData}
          onImport={importData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
