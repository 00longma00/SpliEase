import React, { useEffect } from 'react';
import { 
  X, 
  Plus, 
  UserPlus, 
  MapPin, 
  Home, 
  Heart, 
  Briefcase, 
  Tag, 
  RotateCcw, 
  GitBranch, 
  Trash2, 
  Check 
} from 'lucide-react';
import { Group } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';
import { AppState } from '../utils/storage.ts';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  activeGroup: Group | null;
  onSelectGroup: (groupId: string) => void;
  state: AppState;
  onOpenCreateGroup: () => void;
  onOpenJoinModal: () => void;
  onOpenGitHubModal: () => void;
  onResetData: () => void;
  onDeleteGroup?: (groupId: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  groups,
  activeGroup,
  onSelectGroup,
  state,
  onOpenCreateGroup,
  onOpenJoinModal,
  onOpenGitHubModal,
  onResetData,
  onDeleteGroup,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trip':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'home':
        return <Home className="w-4 h-4 text-amber-500" />;
      case 'couple':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      default:
        return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  const totalAllExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside 
        aria-label="Groups & Settings Drawer"
        className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              ÷
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Switch Group</h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Ledger Summary */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Tracked Spend
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                All Ledgers
              </span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-mono font-bold text-slate-900 tabular-nums block leading-tight">
                {formatCurrency(totalAllExpenses, 'USD')}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Across {groups.length} groups · {state.expenses.length} expenses
              </span>
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="flex items-center justify-between px-2 py-1 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Your Groups
            </span>
          </div>

          {groups.map((group) => {
            const isActive = activeGroup?.id === group.id;
            const groupSpend = state.expenses
              .filter((e) => e.groupId === group.id)
              .reduce((s, e) => s + e.amount, 0);

            return (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectGroup(group.id);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectGroup(group.id);
                    onClose();
                  }
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 min-h-[52px] cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getCategoryIcon(group.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="block truncate font-semibold text-xs text-slate-900">
                        {group.name}
                      </span>
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {group.members.length} members · Code: {group.joinCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-800 tabular-nums block">
                      {formatCurrency(groupSpend, group.currency)}
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      spend
                    </span>
                  </div>

                  {onDeleteGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onDeleteGroup(group.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`Delete "${group.name}"`}
                      aria-label={`Delete "${group.name}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick Create / Join Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateGroup();
              }}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/80"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Create New Group</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenJoinModal();
              }}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200/80"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Join with 6-Digit Code</span>
            </button>
          </div>
        </div>

        {/* Drawer Bottom Utilities */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-1">
          <button
            onClick={() => {
              onClose();
              onOpenGitHubModal();
            }}
            className="w-full flex items-center justify-between min-h-[44px] px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <span>GitHub Setup</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              onResetData();
            }}
            className="w-full flex items-center gap-2 min-h-[44px] px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          {activeGroup && onDeleteGroup && (
            <button
              onClick={() => {
                onClose();
                onDeleteGroup(activeGroup.id);
              }}
              className="w-full flex items-center gap-2 min-h-[44px] px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span className="truncate">Delete Group "{activeGroup.name}"</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
