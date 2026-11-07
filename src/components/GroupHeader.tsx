import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  ArrowRightLeft, 
  MapPin, 
  Home, 
  Heart, 
  Briefcase, 
  Tag,
  Trash2
} from 'lucide-react';
import { Group } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';

interface GroupHeaderProps {
  group: Group;
  totalSpent: number;
  totalToSettle: number;
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
  onOpenInviteModal: () => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  totalSpent,
  totalToSettle,
  onOpenAddExpense,
  onOpenSettleUp,
  onOpenInviteModal,
  onDeleteGroup,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
        
        {/* Top line: Name, category, and Join code */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 capitalize">
                {getCategoryIcon(group.category)}
                <span>{group.category} Group</span>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Currency: <span className="font-semibold text-slate-700">{group.currency}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">
              {group.name}
            </h1>
            
            {group.description && (
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {group.description}
              </p>
            )}
          </div>

          {/* Quick Actions & Invite Box */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* Quick Invite Box with 6-char Join Code */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 sm:p-2 sm:px-3">
              <div className="text-left pl-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block leading-tight">
                  Join Code
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900">
                  {group.joinCode}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Copy 6-digit Join Code"
                aria-label="Copy 6-digit Join Code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <div className="w-[1px] h-5 bg-slate-200" />

              <button
                onClick={onOpenInviteModal}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors min-h-[40px]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Invite link</span>
                <span className="xs:hidden">Share</span>
              </button>
            </div>

            {/* Delete Group Action */}
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-2xs min-h-[40px]"
              title="Delete this group and its expenses"
              aria-label="Delete this group"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Group</span>
            </button>
          </div>

        </div>

        {/* Second row: Members roster & Global Group Metrics */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Members list */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              Members ({group.members.length}):
            </span>
            <div className="flex -space-x-1.5 overflow-hidden py-0.5">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-xs cursor-default shrink-0"
                  style={{ backgroundColor: member.avatarColor }}
                  title={member.name}
                >
                  {member.name.charAt(0)}
                </div>
              ))}
            </div>

            <button
              onClick={onOpenInviteModal}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 ml-1 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors min-h-[36px] flex items-center"
            >
              + Add member
            </button>
          </div>

          {/* Global Group Metrics (Responsive Grid on Mobile) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-6 w-full md:w-auto">
            
            {/* Total group spend */}
            <div className="bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0 text-left sm:text-right">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block leading-tight">
                Total group spend
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalSpent, group.currency)}
              </span>
            </div>

            {/* Total to settle in group */}
            <div className="bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0 text-left sm:text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block leading-tight">
                Unsettled balance
              </span>
              <span 
                className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                  totalToSettle > 0.005 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {totalToSettle > 0.005 ? formatCurrency(totalToSettle, group.currency) : 'All Settled'}
              </span>
            </div>

            {/* Settle Up Button */}
            <button
              onClick={onOpenSettleUp}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-800 bg-emerald-50 hover:bg-emerald-100 sm:bg-slate-100 sm:hover:bg-slate-200 rounded-xl border border-emerald-200 sm:border-slate-200 transition-colors shrink-0 min-h-[44px] sm:min-h-[36px]"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settle up</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
