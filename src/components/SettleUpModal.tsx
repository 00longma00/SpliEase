import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { Group, Member, PaymentMethod, Settlement } from '../types/index.ts';
import { roundCents } from '../utils/splitLogic.ts';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  initialPayerId?: string;
  initialReceiverId?: string;
  initialAmount?: number;
  onRecordSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  group,
  initialPayerId,
  initialReceiverId,
  initialAmount,
  onRecordSettlement,
}) => {
  if (!isOpen) return null;

  const defaultPayer = initialPayerId || group.members[0]?.id || '';
  const otherMembers = group.members.filter((m) => m.id !== defaultPayer);
  const defaultReceiver = initialReceiverId || (otherMembers[0]?.id ?? '');

  const [payerId, setPayerId] = useState(defaultPayer);
  const [receiverId, setReceiverId] = useState(defaultReceiver);
  const [amountStr, setAmountStr] = useState(
    initialAmount ? initialAmount.toFixed(2) : ''
  );
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('venmo');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync props if modal re-opens with new pair
  useEffect(() => {
    if (initialPayerId) setPayerId(initialPayerId);
    if (initialReceiverId) setReceiverId(initialReceiverId);
    if (initialAmount) setAmountStr(initialAmount.toFixed(2));
  }, [initialPayerId, initialReceiverId, initialAmount]);

  const payer = group.members.find((m) => m.id === payerId) || group.members[0];
  const receiver = group.members.find((m) => m.id === receiverId) || group.members[1] || group.members[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amount = parseFloat(amountStr) || 0;
    if (amount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (payerId === receiverId) {
      setErrorMessage('Payer and receiver cannot be the same person.');
      return;
    }

    onRecordSettlement({
      groupId: group.id,
      payerId,
      receiverId,
      amount: roundCents(amount),
      currency: group.currency,
      date,
      paymentMethod,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col animate-in slide-in-from-bottom duration-200 sm:animate-none">
        
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settle Up</h3>
              <p className="text-xs text-slate-500">Record a balance payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close settle up modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Visual Pair representation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-2">
            {/* Payer */}
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center mx-auto mb-1.5 shadow-xs"
                style={{ backgroundColor: payer.avatarColor }}
              >
                {payer.name.charAt(0)}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">Payer</span>
              <span className="text-xs font-bold text-slate-900 truncate block">
                {payer.name}
              </span>
            </div>

            {/* Arrow */}
            <div className="shrink-0 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">pays</span>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Receiver */}
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center mx-auto mb-1.5 shadow-xs"
                style={{ backgroundColor: receiver.avatarColor }}
              >
                {receiver.name.charAt(0)}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">Receiver</span>
              <span className="text-xs font-bold text-slate-900 truncate block">
                {receiver.name}
              </span>
            </div>
          </div>

          {/* Selectors for Payer & Receiver */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Who paid?
              </label>
              <select
                aria-label="Payer Member"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Who received?
              </label>
              <select
                aria-label="Receiver Member"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount settled ({group.currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full text-base font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
            />
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Method
              </label>
              <select
                aria-label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="venmo">Venmo</option>
                <option value="cash">Cash in hand</option>
                <option value="paypal">PayPal</option>
                <option value="zelle">Zelle</option>
                <option value="bank">Bank Transfer</option>
                <option value="other">Other</option>
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
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Venmo confirmation #1234..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
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
              Record Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
