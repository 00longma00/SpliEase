import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  SendHorizontal 
} from 'lucide-react';
import { DebtRelation, Expense, Group, Member, Settlement } from '../types/index.ts';
import { 
  calculateDirectDebts, 
  calculateNetBalances, 
  formatCurrency, 
  simplifyDebts 
} from '../utils/splitLogic.ts';

interface BalancesViewProps {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  onOpenSettleWithPair: (payerId: string, receiverId: string, amount: number) => void;
}

export const BalancesView: React.FC<BalancesViewProps> = ({
  group,
  expenses,
  settlements,
  onOpenSettleWithPair,
}) => {
  const [useSimplified, setUseSimplified] = useState(true);

  const getMember = (id: string): Member => {
    return group.members.find((m) => m.id === id) || {
      id,
      name: 'Former member',
      email: '',
      avatarColor: '#94a3b8',
      joinedAt: '',
    };
  };

  const netBalances = calculateNetBalances(group.members, expenses, settlements);
  const simplifiedDebts = simplifyDebts(netBalances);
  const directDebts = calculateDirectDebts(group.members, expenses, settlements);

  const activeDebts: DebtRelation[] = useSimplified ? simplifiedDebts : directDebts;

  const totalOutstandingDebt = activeDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Debt Simplification Mode Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Debt Settlement Plan
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {useSimplified ? 'Splitwise Min-Cash-Flow' : 'Direct Raw Balances'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {useSimplified
              ? 'Transitive debts are automatically simplified to minimize the total number of payments across all members.'
              : 'Showing raw pairwise debts exactly as logged per expense.'}
          </p>
        </div>

        {/* Toggle Pill */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold shrink-0">
          <button
            onClick={() => setUseSimplified(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              useSimplified
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simplified</span>
          </button>
          <button
            onClick={() => setUseSimplified(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              !useSimplified
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Direct</span>
          </button>
        </div>
      </div>

      {/* Suggested Payments Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Suggested Transactions ({activeDebts.length})
          </h4>
          <span className="text-xs font-semibold text-slate-700">
            Total to settle: <span className="font-mono tabular-nums">{formatCurrency(totalOutstandingDebt, group.currency)}</span>
          </span>
        </div>

        {activeDebts.length === 0 ? (
          <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-950">Everyone is all settled up!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              There are no outstanding debts in {group.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDebts.map((debt, idx) => {
              const debtor = getMember(debt.from);
              const creditor = getMember(debt.to);

              return (
                <div
                  key={`${debt.from}-${debt.to}-${idx}`}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    
                    {/* Debtor */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: debtor.avatarColor }}
                      >
                        {debtor.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {debtor.name}
                        </span>
                        <span className="text-[10px] text-amber-600 font-medium block">
                          owes
                        </span>
                      </div>
                    </div>

                    {/* Arrow with Amount */}
                    <div className="flex flex-col items-center px-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(debt.amount, group.currency)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Creditor */}
                    <div className="flex items-center gap-2 min-w-0 text-right">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {creditor.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium block">
                          to receive
                        </span>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: creditor.avatarColor }}
                      >
                        {creditor.name.charAt(0)}
                      </div>
                    </div>

                  </div>

                  {/* Settle Action Shortcut */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Record balance settlement
                    </span>
                    <button
                      onClick={() => onOpenSettleWithPair(debt.from, debt.to, debt.amount)}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>Settle {formatCurrency(debt.amount, group.currency)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Net Balances Roster for Everyone */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Everyone's Net Balance ({group.members.length} Members)
          </h4>
          <span className="text-xs text-slate-400">
            Global balance across {group.name}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {group.members.map((member) => {
            const net = netBalances[member.id] || 0;
            const isCreditor = net > 0.005;
            const isDebtor = net < -0.005;

            return (
              <div
                key={member.id}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {member.name}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-mono font-bold tabular-nums ${
                      isCreditor
                        ? 'text-emerald-600'
                        : isDebtor
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {isCreditor && `+${formatCurrency(net, group.currency)}`}
                    {isDebtor && formatCurrency(net, group.currency)}
                    {!isCreditor && !isDebtor && 'Settled ($0.00)'}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {isCreditor
                      ? 'gets back'
                      : isDebtor
                      ? 'owes in total'
                      : 'no active debt'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
