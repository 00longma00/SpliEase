import React from 'react';
import { 
  Users, 
  Plus, 
  UserPlus, 
  MapPin, 
  Home, 
  Heart, 
  Briefcase, 
  Tag, 
  RotateCcw, 
  GitBranch, 
  Receipt,
  Layers,
  Trash2
} from 'lucide-react';
import { Group } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';
import { AppState } from '../utils/storage.ts';

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
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
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trip':
        return <MapPin className="w-3.5 h-3.5 text-blue-500" />;
      case 'home':
        return <Home className="w-3.5 h-3.5 text-amber-500" />;
      case 'couple':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'project':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const totalAllExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Global Ledger Overview Card */}
      <div className="p-4 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Global Ledger
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
              All Members
            </span>
          </div>

          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-900 tabular-nums block leading-tight">
              {formatCurrency(totalAllExpenses, 'USD')}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Tracked across {groups.length} groups · {state.expenses.length} expenses
            </span>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="flex items-center justify-between px-2 py-1 text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            All Groups ({groups.length})
          </span>
          <button
            onClick={onOpenCreateGroup}
            className="text-slate-500 hover:text-emerald-600 transition-colors"
            title="Create new group"
            aria-label="Create new group"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
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
              onClick={() => onSelectGroup(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectGroup(group.id);
                }
              }}
              className={`group/item w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 text-xs cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getCategoryIcon(group.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {group.members.length} members · {group.joinCode}
                  </span>
                </div>
              </div>

              {/* Group total spend & quick delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="text-right">
                  <span className="font-mono text-[11px] font-bold text-slate-700 tabular-nums block">
                    {formatCurrency(groupSpend, group.currency)}
                  </span>
                  <span className="text-[9px] text-slate-400 block uppercase">
                    total
                  </span>
                </div>

                {onDeleteGroup && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGroup(group.id);
                    }}
                    className="opacity-0 group-hover/item:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all ml-0.5"
                    title={`Delete "${group.name}"`}
                    aria-label={`Delete "${group.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Action Buttons in sidebar */}
        <div className="pt-3 space-y-1">
          <button
            onClick={onOpenCreateGroup}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Create New Group</span>
          </button>

          <button
            onClick={onOpenJoinModal}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Join with Code</span>
          </button>
        </div>
      </div>

      {/* Bottom utilities */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-1.5">
        <button
          onClick={onOpenGitHubModal}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            <span>GitHub Setup</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
            Ready
          </span>
        </button>

        <button
          onClick={onResetData}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset to initial demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        {activeGroup && onDeleteGroup && (
          <button
            onClick={() => onDeleteGroup(activeGroup.id)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            title={`Delete "${activeGroup.name}" and its expenses`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate">Delete Active Group</span>
          </button>
        )}
      </div>

    </aside>
  );
};
