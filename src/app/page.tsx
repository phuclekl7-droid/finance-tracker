'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import AnalyticsModal from '@/components/AnalyticsModal';
import SettingsModal from '@/components/SettingsModal';
import { currentMonthAnchor } from '@/lib/utils';
import { SectionCard } from '@/components/Card';

export default function Home() {
  const { transactions, loaded, addTransaction, removeTransaction, clearAll, addSampleData } =
    useTransactions();
  const [anchor, setAnchor] = useState(currentMonthAnchor);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50 px-4 pb-24 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">💰 Finance Tracker</h1>
          <p className="text-xs text-slate-400">Quản lý chi tiêu cá nhân</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(true)}
            className="rounded-xl bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-slate-50"
          >
            📊
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-slate-50"
          >
            ⚙️
          </button>
        </div>
      </header>

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tóm tắt + biểu đồ */}
          <SummaryCards
            transactions={transactions}
            anchor={anchor}
            onAnchorChange={setAnchor}
          />

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
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}