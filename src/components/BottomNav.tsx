import React from 'react';
import { 
  Receipt, 
  ArrowRightLeft, 
  Clock, 
  Users, 
  Plus 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'expenses' | 'balances' | 'activity';
  onSelectTab: (tab: 'expenses' | 'balances' | 'activity') => void;
  onOpenGroupsDrawer: () => void;
  onOpenAddExpense: () => void;
  expenseCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenGroupsDrawer,
  onOpenAddExpense,
  expenseCount,
}) => {
  return (
    <>
      {/* Floating Action Button (FAB) for Add Expense on Mobile */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40 pointer-events-auto">
        <button
          onClick={onOpenAddExpense}
          aria-label="Add new expense"
          className="flex items-center gap-2 h-13 px-4.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-700/25 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span className="font-semibold tracking-tight">Add Expense</span>
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-sm"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
          
          {/* Tab 1: Expenses */}
          <button
            onClick={() => onSelectTab('expenses')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors relative ${
              activeTab === 'expenses'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {expenseCount !== undefined && expenseCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-slate-200 text-slate-700 text-[9px] font-mono font-bold px-1 rounded-full leading-tight">
                  {expenseCount > 99 ? '99+' : expenseCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Expenses</span>
            {activeTab === 'expenses' && (
              <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Tab 2: Balances */}
          <button
            onClick={() => onSelectTab('balances')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors relative ${
              activeTab === 'balances'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Balances</span>
            {activeTab === 'balances' && (
              <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Tab 3: Activity */}
          <button
            onClick={() => onSelectTab('activity')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors relative ${
              activeTab === 'activity'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Activity</span>
            {activeTab === 'activity' && (
              <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Tab 4: Groups / Drawer Trigger */}
          <button
            onClick={onOpenGroupsDrawer}
            className="flex flex-col items-center justify-center min-h-[44px] py-1 text-slate-500 hover:text-slate-900 font-medium rounded-xl transition-colors"
          >
            <Users className="w-5 h-5 text-slate-600" />
            <span className="text-[10px] mt-1 tracking-tight">Groups</span>
          </button>

        </div>
      </nav>
    </>
  );
};
