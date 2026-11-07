import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Tag, 
  Users, 
  Percent, 
  Divide, 
  Hash, 
  AlignJustify, 
  AlertCircle 
} from 'lucide-react';
import { 
  Expense, 
  ExpenseCategory, 
  Group, 
  Member, 
  PayerDetail, 
  SplitDetail, 
  SplitMethod 
} from '../types/index.ts';
import { 
  calculateEqualSplits, 
  calculatePercentageSplits, 
  calculateSharesSplits, 
  formatCurrency, 
  roundCents 
} from '../utils/splitLogic.ts';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  group,
  onAddExpense,
}) => {
  if (!isOpen) return null;

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Payer Mode: 'single' | 'multiple'
  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  const [singlePayerId, setSinglePayerId] = useState(group.members[0]?.id || '');
  const [multiPayerAmounts, setMultiPayerAmounts] = useState<Record<string, string>>({});

  // Split Method: 'equal' | 'exact' | 'percentage' | 'shares'
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  // For Equal split: which members are checked
  const [includedMembers, setIncludedMembers] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const m of group.members) init[m.id] = true;
    return init;
  });
  // For Exact split:
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  // For Percentage split:
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  // For Shares split:
  const [shares, setShares] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const m of group.members) init[m.id] = '1';
    return init;
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amount = parseFloat(amountStr) || 0;

  // Pre-seed multi-payer and exact amounts when total changes
  useEffect(() => {
    if (payerMode === 'multiple' && Object.keys(multiPayerAmounts).length === 0) {
      const init: Record<string, string> = {};
      init[singlePayerId] = amountStr;
      setMultiPayerAmounts(init);
    }
  }, [payerMode, amountStr]);

  // Validation calculations
  const calculateTotalPaid = (): number => {
    if (payerMode === 'single') return amount;
    return Object.values(multiPayerAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim()) {
      setErrorMessage('Please enter an expense description.');
      return;
    }

    if (amount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0.');
      return;
    }

    // Validate Payers
    let paidBy: PayerDetail[] = [];
    if (payerMode === 'single') {
      paidBy = [{ memberId: singlePayerId, amount: roundCents(amount) }];
    } else {
      const totalPaid = calculateTotalPaid();
      if (Math.abs(roundCents(totalPaid) - roundCents(amount)) > 0.01) {
        setErrorMessage(
          `Total paid (${formatCurrency(totalPaid, group.currency)}) does not match expense amount (${formatCurrency(amount, group.currency)}).`
        );
        return;
      }
      paidBy = Object.entries(multiPayerAmounts)
        .filter(([_, val]) => (parseFloat(val) || 0) > 0)
        .map(([mId, val]) => ({
          memberId: mId,
          amount: roundCents(parseFloat(val) || 0),
        }));
    }

    // Validate Splits
    let splits: SplitDetail[] = [];

    if (splitMethod === 'equal') {
      const activeIds = Object.keys(includedMembers).filter((id) => includedMembers[id]);
      if (activeIds.length === 0) {
        setErrorMessage('Select at least one member to split the expense with.');
        return;
      }
      splits = calculateEqualSplits(amount, activeIds);
    } else if (splitMethod === 'exact') {
      const totalExact = Object.values(exactAmounts).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (Math.abs(roundCents(totalExact) - roundCents(amount)) > 0.01) {
        setErrorMessage(
          `Total exact shares (${formatCurrency(totalExact, group.currency)}) must equal the expense amount (${formatCurrency(amount, group.currency)}). Difference: ${formatCurrency(Math.abs(totalExact - amount), group.currency)}`
        );
        return;
      }
      splits = Object.entries(exactAmounts)
        .filter(([_, val]) => (parseFloat(val) || 0) > 0)
        .map(([mId, val]) => ({
          memberId: mId,
          amount: roundCents(parseFloat(val) || 0),
        }));
    } else if (splitMethod === 'percentage') {
      const numPcts: Record<string, number> = {};
      for (const [id, val] of Object.entries(percentages)) {
        numPcts[id] = parseFloat(val) || 0;
      }
      const pctResult = calculatePercentageSplits(amount, numPcts);
      if (!pctResult.isValid) {
        setErrorMessage(`Percentages must add up to 100%. Currently: ${roundCents(100 - pctResult.difference)}%`);
        return;
      }
      splits = pctResult.splits;
    } else if (splitMethod === 'shares') {
      const numShares: Record<string, number> = {};
      for (const [id, val] of Object.entries(shares)) {
        numShares[id] = Math.max(0, parseInt(val, 10) || 0);
      }
      const sharesResult = calculateSharesSplits(amount, numShares);
      if (sharesResult.totalShares <= 0) {
        setErrorMessage('Total shares must be at least 1.');
        return;
      }
      splits = sharesResult.splits;
    }

    onAddExpense({
      groupId: group.id,
      description: description.trim(),
      amount: roundCents(amount),
      currency: group.currency,
      category,
      date,
      paidBy,
      splitMethod,
      splits,
      notes: notes.trim() || undefined,
      createdBy: singlePayerId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col animate-in slide-in-from-bottom duration-200 sm:animate-none">
        
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add an Expense</h3>
              <p className="text-xs text-slate-500">Group: {group.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close add expense modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with vertical scrolling */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dinner, Airbnb, Groceries..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({group.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                aria-label="Expense Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="lodging">Lodging & Hotel</option>
                <option value="groceries">Groceries & Market</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities & Bills</option>
                <option value="general">General / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Paid By Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">Paid by</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPayerMode('single')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    payerMode === 'single' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  One person
                </button>
                <button
                  type="button"
                  onClick={() => setPayerMode('multiple')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    payerMode === 'multiple' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  Multiple people
                </button>
              </div>
            </div>

            {payerMode === 'single' ? (
              <select
                aria-label="Payer selection"
                value={singlePayerId}
                onChange={(e) => setSinglePayerId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700">{m.name}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-mono">{group.currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={multiPayerAmounts[m.id] || ''}
                        onChange={(e) =>
                          setMultiPayerAmounts({ ...multiPayerAmounts, [m.id]: e.target.value })
                        }
                        className="w-24 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold tabular-nums"
                      />
                    </div>
                  </div>
                ))}
                <div className="text-[11px] text-right font-medium text-slate-500 pt-1 border-t border-slate-200">
                  Total allocated: {formatCurrency(calculateTotalPaid(), group.currency)} of{' '}
                  {formatCurrency(amount, group.currency)}
                </div>
              </div>
            )}
          </div>

          {/* Split Method Segmented Control */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 block mb-2">Split options</span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold mb-3">
              <button
                type="button"
                onClick={() => setSplitMethod('equal')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  splitMethod === 'equal'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Divide className="w-3.5 h-3.5" />
                <span>Equal</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('exact')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  splitMethod === 'exact'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Exact</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('percentage')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  splitMethod === 'percentage'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percent</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('shares')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  splitMethod === 'shares'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Shares</span>
              </button>
            </div>

            {/* Split Content per method */}
            {splitMethod === 'equal' && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-1">
                  Select who was involved in this expense:
                </span>
                {group.members.map((m) => {
                  const isChecked = !!includedMembers[m.id];
                  const activeCount = Object.values(includedMembers).filter(Boolean).length;
                  const estimatedShare = activeCount > 0 ? amount / activeCount : 0;
                  return (
                    <label
                      key={m.id}
                      className="flex items-center justify-between py-1 px-1 cursor-pointer hover:bg-slate-100/60 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setIncludedMembers({ ...includedMembers, [m.id]: e.target.checked })
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-medium text-slate-800">{m.name}</span>
                      </div>
                      {isChecked && (
                        <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                          ~{formatCurrency(estimatedShare, group.currency)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {splitMethod === 'exact' && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-800">{m.name}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-mono">{group.currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={exactAmounts[m.id] || ''}
                        onChange={(e) =>
                          setExactAmounts({ ...exactAmounts, [m.id]: e.target.value })
                        }
                        className="w-24 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {splitMethod === 'percentage' && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-800">{m.name}:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        placeholder="0"
                        value={percentages[m.id] || ''}
                        onChange={(e) =>
                          setPercentages({ ...percentages, [m.id]: e.target.value })
                        }
                        className="w-16 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold tabular-nums"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {splitMethod === 'shares' && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-800">{m.name}:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="1"
                        value={shares[m.id] || ''}
                        onChange={(e) => setShares({ ...shares, [m.id]: e.target.value })}
                        className="w-16 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold tabular-nums"
                      />
                      <span className="text-slate-500 text-[11px]">shares</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt photo link, restaurant address..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center justify-center"
            >
              Save Expense
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
