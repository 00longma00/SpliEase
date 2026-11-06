import React from 'react';
import { 
  Clock, 
  Receipt, 
  ArrowRightLeft, 
  UserPlus, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { ActivityItem, Group, Member } from '../types/index.ts';
import { formatCurrency } from '../utils/splitLogic.ts';

interface ActivityLogViewProps {
  group: Group;
  activities: ActivityItem[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  group,
  activities,
}) => {
  const groupActivities = activities
    .filter((a) => a.groupId === group.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense_added':
        return <Receipt className="w-4 h-4 text-emerald-600" />;
      case 'settlement_added':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'group_created':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Activity Stream for {group.name}
        </h3>
        <span className="text-xs text-slate-400">
          {groupActivities.length} recent actions
        </span>
      </div>

      {groupActivities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No activity yet</h4>
          <p className="text-xs text-slate-500 mt-1">
            New expenses and payments in this group will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {groupActivities.map((act) => {
            const actor = group.members.find((m) => m.id === act.actorId);
            return (
              <div key={act.id} className="p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 leading-snug">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{formatTime(act.timestamp)}</span>
                    {actor && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>by {actor.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {act.amount !== undefined && (
                  <span className="text-xs font-mono font-bold text-slate-900 tabular-nums shrink-0">
                    {formatCurrency(act.amount, act.currency || group.currency)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
