'use client';

import { useEffect, useState } from 'react';
import { ChartColumn, Settings2, Sun, Moon, PiggyBank, Repeat } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useTheme } from '@/hooks/useTheme';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import AnalyticsModal from '@/components/AnalyticsModal';
import BudgetModal from '@/components/BudgetModal';
import SettingsModal from '@/components/SettingsModal';
import EditTransactionModal from '@/components/EditTransactionModal';
import GoalsModal from '@/components/GoalsModal';
import RecurringModal from '@/components/RecurringModal';
import UndoToast from '@/components/UndoToast';
import PwaRegister from '@/components/PwaRegister';
import { SectionCard } from '@/components/Card';
import { currentMonthAnchor } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import type { RecurringRule } from '@/lib/recurring';

export default function Home() {
  const {
    transactions,
    loaded,
    addTransaction,
    removeTransaction,
    undoDelete,
    lastDeleted,
    editTransaction,
    clearAll,
    exportData,
    exportCsv,
    importData,
    addSampleData,
  } = useTransactions();
  const { theme, mounted, toggleTheme } = useTheme();
  const [anchor, setAnchor] = useState(currentMonthAnchor);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [budgetKey, setBudgetKey] = useState(0);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    if (!lastDeleted) return;
    setShowUndo(true);
    const t = window.setTimeout(() => setShowUndo(false), 5000);
    return () => window.clearTimeout(t);
  }, [lastDeleted]);

  if (!mounted) return null;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-5">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Sổ chi tiêu
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500">Quản lý thu chi của bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] shadow-xs transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
            aria-label={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] shadow-xs transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
            aria-label="Phân tích"
          >
            <ChartColumn size={17} />
          </button>
          <button
            onClick={() => setShowGoals(true)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] shadow-xs transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
            aria-label="Mục tiêu"
          >
            <PiggyBank size={17} />
          </button>
          <button
            onClick={() => setShowRecurring(true)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] shadow-xs transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
            aria-label="Định kỳ"
          >
            <Repeat size={17} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] shadow-xs transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--fg)]"
            aria-label="Cài đặt"
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      {!loaded ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-700 dark:border-stone-600 dark:border-t-stone-300" />
        </div>
      ) : (
        <div className="space-y-4">
          <SummaryCards
            transactions={transactions}
            anchor={anchor}
            onAnchorChange={setAnchor}
            onOpenBudget={() => setShowBudget(true)}
            budgetVersion={budgetKey}
          />

          <SectionCard title="Thêm giao dịch">
            <TransactionForm onAdd={addTransaction} />
          </SectionCard>

          <SectionCard title="Lịch sử giao dịch">
            <TransactionList
              transactions={transactions}
              onDelete={removeTransaction}
              onEdit={setEditingTx}
            />
          </SectionCard>
        </div>
      )}

      <AnalyticsModal
        show={showAnalytics}
        transactions={transactions}
        anchor={anchor}
        onClose={() => setShowAnalytics(false)}
      />

      <BudgetModal
        key={budgetKey}
        show={showBudget}
        transactions={transactions}
        anchor={anchor}
        onClose={() => setShowBudget(false)}
        onSaved={() => setBudgetKey((k) => k + 1)}
      />

      <SettingsModal
        show={showSettings}
        onClearAll={clearAll}
        onAddSample={addSampleData}
        onExport={exportData}
        onExportCsv={exportCsv}
        onImport={importData}
        onClose={() => setShowSettings(false)}
      />

      <GoalsModal show={showGoals} onClose={() => setShowGoals(false)} />

      <RecurringModal
        show={showRecurring}
        onClose={() => setShowRecurring(false)}
        onAddRule={(rule: RecurringRule) => {
          const year = new Date().getFullYear();
          const month = new Date().getMonth() + 1;
          const day = Math.min(rule.dayOfMonth, 28);
          const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          addTransaction({
            type: rule.type,
            amount: rule.amount,
            category: rule.category,
            note: rule.note,
            date,
          });
        }}
      />

      <EditTransactionModal
        show={!!editingTx}
        transaction={editingTx ?? ({} as Transaction)}
        onSave={(t) => {
          editTransaction(t);
          setEditingTx(null);
        }}
        onClose={() => setEditingTx(null)}
      />

      <UndoToast
        visible={showUndo}
        onUndo={() => {
          undoDelete();
          setShowUndo(false);
        }}
      />

      <PwaRegister />
    </div>
  );
}