import React from 'react';
import { 
  Users, 
  Plus, 
  GitBranch, 
  UserPlus, 
  ChevronDown 
} from 'lucide-react';
import { Group } from '../types/index.ts';

interface NavbarProps {
  groups: Group[];
  activeGroup: Group | null;
  syncStatus?: 'connecting' | 'connected' | 'error' | 'offline';
  onSelectGroup: (groupId: string) => void;
  onOpenAddExpense: () => void;
  onOpenJoinModal: () => void;
  onOpenCreateGroup: () => void;
  onOpenGitHubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  groups,
  activeGroup,
  syncStatus = 'connected',
  onSelectGroup,
  onOpenAddExpense,
  onOpenJoinModal,
  onOpenCreateGroup,
  onOpenGitHubModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <span className="text-lg tracking-tighter">÷</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                SplitEase
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-none">
                Group Expense Splitter
              </span>
            </div>
          </div>

          {/* Group Switcher dropdown */}
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <select
                aria-label="Select active group"
                value={activeGroup?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenCreateGroup();
                  } else {
                    onSelectGroup(e.target.value);
                  }
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
                <option value="__new__">+ Create New Group...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cloud Sync Status Indicator */}
          {syncStatus === 'connected' && (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-[11px] font-medium text-emerald-800"
              title="Real-time multi-device synchronization active via Firestore"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Sync Live</span>
            </div>
          )}
          {syncStatus === 'connecting' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-full text-[11px] font-medium text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Connecting...</span>
            </div>
          )}

          {/* Join Group with Code link */}
          <button
            onClick={onOpenJoinModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            title="Join group with 6-digit code or link"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Join Group</span>
          </button>
        </div>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Expense</span>
          </button>
        </div>

      </div>
    </header>
  );
};
