import React, { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Users, Receipt, ArrowRightLeft } from 'lucide-react';
import { Group } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';

interface DeleteGroupModalProps {
  isOpen: boolean;
  group: Group | null;
  expensesCount: number;
  totalSpent: number;
  settlementsCount: number;
  onClose: () => void;
  onConfirm: (groupId: string) => void;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  isOpen,
  group,
  expensesCount,
  totalSpent,
  settlementsCount,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open & handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Autofocus cancel button so accidental Enter does not delete
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-group-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="delete-group-modal-title"
                className="text-base font-bold text-slate-900 leading-snug"
              >
                Delete Group
              </h2>
              <p className="text-xs text-slate-500">
                Confirm deletion of this group and its records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete <strong className="text-slate-900 font-bold">"{group.name}"</strong>?
          </p>

          {/* Group details pill summary */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Group Summary to be removed
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
                  <Users className="w-3 h-3" />
                  <span>Members</span>
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {group.members.length}
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
                  <Receipt className="w-3 h-3" />
                  <span>Expenses</span>
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {expensesCount}
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Total Spent</span>
                </div>
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {formatCurrency(totalSpent, group.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This action cannot be undone. All shared expenses, split calculations, and settlement logs in this group will be permanently removed.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-delete-group-btn"
            onClick={() => onConfirm(group.id)}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};
