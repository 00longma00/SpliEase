import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Receipt, 
  Utensils, 
  Car, 
  Bed, 
  ShoppingCart, 
  Film, 
  Zap, 
  ArrowRightLeft
} from 'lucide-react';
import { Expense, ExpenseCategory, Group, Member, Settlement } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';

interface ExpenseListProps {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onDeleteSettlement: (settlementId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  group,
  expenses,
  settlements,
  onOpenAddExpense,
  onOpenSettleUp,
  onDeleteExpense,
  onDeleteSettlement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'settlements'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getMember = (id: string): Member => {
    return group.members.find((m) => m.id === id) || {
      id,
      name: 'Former member',
      email: '',
      avatarColor: '#94a3b8',
      joinedAt: '',
    };
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'transport':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'lodging':
        return <Bed className="w-4 h-4 text-purple-500" />;
      case 'groceries':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'entertainment':
        return <Film className="w-4 h-4 text-pink-500" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  // Combine expenses and settlements into unified chronological timeline
  type TimelineItem = 
    | { kind: 'expense'; data: Expense; date: string }
    | { kind: 'settlement'; data: Settlement; date: string };

  const timelineItems: TimelineItem[] = [];

  if (activeTab === 'all' || activeTab === 'expenses') {
    for (const exp of expenses) {
      timelineItems.push({ kind: 'expense', data: exp, date: exp.date });
    }
  }

  if (activeTab === 'all' || activeTab === 'settlements') {
    for (const set of settlements) {
      timelineItems.push({ kind: 'settlement', data: set, date: set.date });
    }
  }

  // Sort descending by date
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter by search & category
  const filteredItems = timelineItems.filter((item) => {
    if (item.kind === 'expense') {
      const exp = item.data;
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = exp.description.toLowerCase().includes(q);
        const payerMatch = exp.paidBy.some((p) => getMember(p.memberId).name.toLowerCase().includes(q));
        return descMatch || payerMatch;
      }
      return true;
    } else {
      if (selectedCategory !== 'all') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const payer = getMember(item.data.payerId).name.toLowerCase();
        const receiver = getMember(item.data.receiverId).name.toLowerCase();
        return payer.includes(q) || receiver.includes(q) || 'settlement payment'.includes(q);
      }
      return true;
    }
  });

  return (
    <div className="space-y-4">
      {/* Controls: Search, Tab filter & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description or person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs: All / Expenses / Settlements */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'settlements'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settlements
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="lodging">Lodging</option>
            <option value="groceries">Groceries</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="general">General</option>
          </select>
        </div>

      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No transactions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'Keep track of who paid for what. Add an expense or settle up.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              + Add First Expense
            </button>
            <button
              onClick={onOpenSettleUp}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Record Payment
            </button>
          </div>
        </div>
      )}

      {/* List of items */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          if (item.kind === 'expense') {
            const exp = item.data;
            const isExpanded = expandedId === exp.id;
            const mainPayer = getMember(exp.paidBy[0]?.memberId || '');
            const isMultiPayer = exp.paidBy.length > 1;

            return (
              <div
                key={exp.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden"
              >
                {/* Main Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Category Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(exp.category)}
                    </div>

                    {/* Description and Payer */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {exp.description}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 overflow-hidden">
                        <span className="shrink-0">{exp.date}</span>
                        <span aria-hidden="true" className="shrink-0">·</span>
                        <span className="truncate">
                          {isMultiPayer ? (
                            `${exp.paidBy.length} people paid ${formatCurrency(exp.amount, exp.currency)}`
                          ) : (
                            `${mainPayer.name} paid ${formatCurrency(exp.amount, exp.currency)}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Objective Global Amount & Split Breakdown */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-mono font-bold block leading-tight text-slate-900 tabular-nums">
                        {formatCurrency(exp.amount, exp.currency)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {exp.splits.length} members · {exp.splitMethod}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      
                      {/* Left: Who Paid */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Paid by
                        </span>
                        {exp.paidBy.map((p) => {
                          const m = getMember(p.memberId);
                          return (
                            <div key={p.memberId} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                                  style={{ backgroundColor: m.avatarColor }}
                                >
                                  {m.name.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-700">{m.name}</span>
                              </div>
                              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                                {formatCurrency(p.amount, exp.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Split Breakdown */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Split Breakdown ({exp.splitMethod})
                        </span>
                        {exp.splits.map((s) => {
                          const m = getMember(s.memberId);
                          return (
                            <div key={s.memberId} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                                  style={{ backgroundColor: m.avatarColor }}
                                >
                                  {m.name.charAt(0)}
                                </div>
                                <span className="text-slate-700">{m.name}</span>
                                {s.percentage !== undefined && (
                                  <span className="text-[10px] text-slate-400">({s.percentage}%)</span>
                                )}
                                {s.shares !== undefined && (
                                  <span className="text-[10px] text-slate-400">({s.shares} shares)</span>
                                )}
                              </div>
                              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                                {formatCurrency(s.amount, exp.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {exp.notes && (
                      <div className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700 mr-1">Note:</span>
                        {exp.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end items-center gap-2">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Expense</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            // Settlement item
            const set = item.data;
            const payer = getMember(set.payerId);
            const receiver = getMember(set.receiverId);

            return (
              <div
                key={set.id}
                className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-3.5 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-bold text-slate-900">{payer.name}</span>
                      <span className="text-slate-500">paid</span>
                      <span className="font-bold text-slate-900">{receiver.name}</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {formatCurrency(set.amount, set.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{set.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{set.paymentMethod}</span>
                      {set.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate italic">"{set.note}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeleteSettlement(set.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                    title="Delete payment"
                    aria-label="Delete settlement payment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
