import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ArrowRightLeft, 
  Clock, 
  Users
} from 'lucide-react';
import { 
  ActivityItem, 
  Expense, 
  Group, 
  Member, 
  Settlement 
} from './types/index.ts';
import { 
  AppState, 
  loadAppState, 
  resetAppState, 
  saveAppState 
} from './utils/storage.ts';
import { 
  calculateNetBalances, 
  formatCurrency, 
  simplifyDebts 
} from './utils/splitLogic.ts';
import { cloudSync, SyncStatus } from './services/firestoreSync.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { GroupHeader } from './components/GroupHeader.tsx';
import { ExpenseList } from './components/ExpenseList.tsx';
import { BalancesView } from './components/BalancesView.tsx';
import { ActivityLogView } from './components/ActivityLogView.tsx';
import { AddExpenseModal } from './components/AddExpenseModal.tsx';
import { SettleUpModal } from './components/SettleUpModal.tsx';
import { JoinGroupModal } from './components/JoinGroupModal.tsx';
import { CreateGroupModal } from './components/CreateGroupModal.tsx';
import { GitHubModal } from './components/GitHubModal.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { MobileDrawer } from './components/MobileDrawer.tsx';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'activity'>('expenses');

  // Modals & Drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [prefilledJoinCode, setPrefilledJoinCode] = useState('');

  // Settle up initial values (when clicking "Settle this" on a debt card)
  const [settlePayerId, setSettlePayerId] = useState<string | undefined>();
  const [settleReceiverId, setSettleReceiverId] = useState<string | undefined>();
  const [settleAmount, setSettleAmount] = useState<number | undefined>();

  // Check URL params on initial mount for direct join code / link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code') || params.get('join');
      if (codeParam) {
        setPrefilledJoinCode(codeParam.toUpperCase());
        setIsJoinGroupOpen(true);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Connect Firestore real-time sync
  useEffect(() => {
    const unsubStatus = cloudSync.onStatusChange(setSyncStatus);

    // Initial seed check in background
    cloudSync.seedInitialDataIfEmpty().catch((err) => {
      console.warn('Initial seed error:', err);
    });

    // Listen to groups in real time
    const unsubGroups = cloudSync.subscribeToGroups((cloudGroups) => {
      setState((prev) => {
        // Keep active group valid
        const activeExists = cloudGroups.some((g) => g.id === prev.activeGroupId);
        const nextActiveId = activeExists ? prev.activeGroupId : (cloudGroups[0]?.id || null);
        const next = {
          ...prev,
          groups: cloudGroups,
          activeGroupId: nextActiveId,
        };
        saveAppState(next);
        return next;
      });
    });

    return () => {
      unsubStatus();
      unsubGroups();
    };
  }, []);

  // Listen to active groups' subcollections (expenses, settlements, activities)
  useEffect(() => {
    if (state.groups.length === 0) return;

    const unsubData = cloudSync.subscribeToGroupData(
      state.groups.map((g) => g.id),
      {
        onExpensesUpdated: (groupId, groupExpenses) => {
          setState((prev) => {
            const others = prev.expenses.filter((e) => e.groupId !== groupId);
            const next = {
              ...prev,
              expenses: [...groupExpenses, ...others],
            };
            saveAppState(next);
            return next;
          });
        },
        onSettlementsUpdated: (groupId, groupSettlements) => {
          setState((prev) => {
            const others = prev.settlements.filter((s) => s.groupId !== groupId);
            const next = {
              ...prev,
              settlements: [...groupSettlements, ...others],
            };
            saveAppState(next);
            return next;
          });
        },
        onActivitiesUpdated: (groupId, groupActivities) => {
          setState((prev) => {
            const others = prev.activities.filter((a) => a.groupId !== groupId);
            const merged = [...groupActivities, ...others].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            const next = {
              ...prev,
              activities: merged,
            };
            saveAppState(next);
            return next;
          });
        },
      }
    );

    return () => {
      unsubData();
    };
  }, [state.groups]);

  // Sync state changes to localStorage
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  // Active group resolution
  const activeGroup = state.groups.find((g) => g.id === state.activeGroupId) || state.groups[0] || null;

  // Group members helper map
  const memberMap = new Map<string, Member>();
  if (activeGroup) {
    for (const m of activeGroup.members) {
      memberMap.set(m.id, m);
    }
  }

  // Active group metrics
  const activeExpenses = activeGroup ? state.expenses.filter((e) => e.groupId === activeGroup.id) : [];
  const activeSettlements = activeGroup ? state.settlements.filter((s) => s.groupId === activeGroup.id) : [];

  const totalSpent = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netBalances = activeGroup
    ? calculateNetBalances(activeGroup.members, activeExpenses, activeSettlements)
    : {};
  const simplifiedDebts = simplifyDebts(netBalances);
  const totalToSettle = simplifiedDebts.reduce((sum, d) => sum + d.amount, 0);

  // Handlers
  const handleSelectGroup = (groupId: string) => {
    updateState((prev) => ({
      ...prev,
      activeGroupId: groupId,
    }));
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newExpense: Expense = {
      ...newExpenseData,
      id: expenseId,
      createdAt: new Date().toISOString(),
    };

    const firstPayer = memberMap.get(newExpense.paidBy[0]?.memberId || '');
    const payerLabel = newExpense.paidBy.length > 1
      ? `${newExpense.paidBy.length} members`
      : firstPayer?.name || 'A member';

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      groupId: newExpense.groupId,
      type: 'expense_added',
      actorId: newExpense.paidBy[0]?.memberId || 'system',
      description: `${payerLabel} added "${newExpense.description}" (${formatCurrency(newExpense.amount, newExpense.currency)})`,
      amount: newExpense.amount,
      currency: newExpense.currency,
      timestamp: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      activities: [newActivity, ...prev.activities],
    }));

    // Persist to Firebase Firestore
    cloudSync.addExpense(newExpense.groupId, newExpense).catch(console.error);
    cloudSync.addActivity(newExpense.groupId, newActivity).catch(console.error);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const target = state.expenses.find((e) => e.id === expenseId);
    if (!target) return;

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      groupId: target.groupId,
      type: 'expense_deleted',
      actorId: 'system',
      description: `Expense "${target.description}" was removed`,
      timestamp: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
      activities: [newActivity, ...prev.activities],
    }));

    // Persist to Firebase Firestore
    cloudSync.deleteExpense(target.groupId, expenseId).catch(console.error);
    cloudSync.addActivity(target.groupId, newActivity).catch(console.error);
  };

  const handleRecordSettlement = (newSettlementData: Omit<Settlement, 'id' | 'createdAt'>) => {
    const settlementId = `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSettlement: Settlement = {
      ...newSettlementData,
      id: settlementId,
      createdAt: new Date().toISOString(),
    };

    const payer = memberMap.get(newSettlement.payerId);
    const receiver = memberMap.get(newSettlement.receiverId);

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      groupId: newSettlement.groupId,
      type: 'settlement_added',
      actorId: newSettlement.payerId,
      description: `${payer?.name || 'Someone'} paid ${receiver?.name || 'Someone'} ${formatCurrency(newSettlement.amount, newSettlement.currency)} via ${newSettlement.paymentMethod}`,
      amount: newSettlement.amount,
      currency: newSettlement.currency,
      timestamp: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      settlements: [newSettlement, ...prev.settlements],
      activities: [newActivity, ...prev.activities],
    }));

    // Persist to Firebase Firestore
    cloudSync.addSettlement(newSettlement.groupId, newSettlement).catch(console.error);
    cloudSync.addActivity(newSettlement.groupId, newActivity).catch(console.error);
  };

  const handleDeleteSettlement = (settlementId: string) => {
    const target = state.settlements.find((s) => s.id === settlementId);
    updateState((prev) => ({
      ...prev,
      settlements: prev.settlements.filter((s) => s.id !== settlementId),
    }));

    if (target) {
      cloudSync.deleteSettlement(target.groupId, settlementId).catch(console.error);
    }
  };

  const handleJoinGroup = (targetGroup: Group, newMember: Member) => {
    const updatedMembers = [...targetGroup.members, newMember];
    const updatedGroup: Group = {
      ...targetGroup,
      members: updatedMembers,
    };

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      groupId: targetGroup.id,
      type: 'member_joined',
      actorId: newMember.id,
      description: `${newMember.name} joined the group`,
      timestamp: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      activeGroupId: targetGroup.id,
      groups: prev.groups.map((g) => (g.id === targetGroup.id ? updatedGroup : g)),
      activities: [newActivity, ...prev.activities],
    }));

    // Persist to Firebase Firestore
    cloudSync.updateGroupMembers(targetGroup, updatedMembers).catch(console.error);
    cloudSync.addActivity(targetGroup.id, newActivity).catch(console.error);
  };

  const handleCreateGroup = (newGroup: Group) => {
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      groupId: newGroup.id,
      type: 'group_created',
      actorId: newGroup.createdBy,
      description: `Group "${newGroup.name}" was created with ${newGroup.members.length} members`,
      timestamp: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      activeGroupId: newGroup.id,
      groups: [newGroup, ...prev.groups],
      activities: [newActivity, ...prev.activities],
    }));

    // Persist to Firebase Firestore
    cloudSync.createGroup(newGroup).catch(console.error);
    cloudSync.addActivity(newGroup.id, newActivity).catch(console.error);
  };

  const handleDeleteGroup = (groupId: string) => {
    const targetGroup = state.groups.find((g) => g.id === groupId);
    if (!targetGroup) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the group "${targetGroup.name}"?\n\nThis will remove all associated expenses and settlements.`
    );
    if (!confirmed) return;

    const remainingGroups = state.groups.filter((g) => g.id !== groupId);
    const nextActiveId = remainingGroups[0]?.id || null;

    updateState((prev) => ({
      ...prev,
      groups: remainingGroups,
      activeGroupId: nextActiveId,
      expenses: prev.expenses.filter((e) => e.groupId !== groupId),
      settlements: prev.settlements.filter((s) => s.groupId !== groupId),
      activities: prev.activities.filter((a) => a.groupId !== groupId),
    }));

    // Persist deletion to Firestore
    cloudSync.deleteGroup(groupId).catch(console.error);
  };

  const handleOpenSettleWithPair = (payerId: string, receiverId: string, amount: number) => {
    setSettlePayerId(payerId);
    setSettleReceiverId(receiverId);
    setSettleAmount(amount);
    setIsSettleUpOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default state?')) {
      const fresh = resetAppState();
      setState(fresh);
      cloudSync.seedInitialDataIfEmpty().catch(console.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar without persona assumptions */}
      <Navbar
        groups={state.groups}
        activeGroup={activeGroup}
        syncStatus={syncStatus}
        onSelectGroup={handleSelectGroup}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenJoinModal={() => {
          setPrefilledJoinCode('');
          setIsJoinGroupOpen(true);
        }}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onOpenGitHubModal={() => setIsGitHubOpen(true)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar with global ledger view */}
        <div className="hidden lg:block">
          <Sidebar
            groups={state.groups}
            activeGroup={activeGroup}
            onSelectGroup={handleSelectGroup}
            state={state}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            onOpenJoinModal={() => {
              setPrefilledJoinCode('');
              setIsJoinGroupOpen(true);
            }}
            onOpenGitHubModal={() => setIsGitHubOpen(true)}
            onResetData={handleResetData}
            onDeleteGroup={handleDeleteGroup}
          />
        </div>

        {/* Content Viewport with mobile bottom bar clearance */}
        <main className="flex-1 min-w-0 flex flex-col pb-24 lg:pb-0">
          {activeGroup ? (
            <>
              {/* Group Header Banner with global metrics */}
              <GroupHeader
                group={activeGroup}
                totalSpent={totalSpent}
                totalToSettle={totalToSettle}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenSettleUp={() => {
                  setSettlePayerId(undefined);
                  setSettleReceiverId(undefined);
                  setSettleAmount(undefined);
                  setIsSettleUpOpen(true);
                }}
                onOpenInviteModal={() => {
                  setPrefilledJoinCode(activeGroup.joinCode);
                  setIsJoinGroupOpen(true);
                }}
                onDeleteGroup={handleDeleteGroup}
              />

              {/* Navigation Tab Bar (Desktop/Tablet) */}
              <div className="hidden sm:block bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-6 min-w-max">
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'expenses'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Expenses & Timeline</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                      {activeExpenses.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('balances')}
                    className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'balances'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Everyone's Balances & Settle</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'activity'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Activity Log</span>
                  </button>
                </div>
              </div>

              {/* Tab Views */}
              <div className="p-3 sm:p-6 lg:p-8 flex-1">
                {activeTab === 'expenses' && (
                  <ExpenseList
                    group={activeGroup}
                    expenses={activeExpenses}
                    settlements={activeSettlements}
                    onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                    onOpenSettleUp={() => {
                      setSettlePayerId(undefined);
                      setSettleReceiverId(undefined);
                      setSettleAmount(undefined);
                      setIsSettleUpOpen(true);
                    }}
                    onDeleteExpense={handleDeleteExpense}
                    onDeleteSettlement={handleDeleteSettlement}
                  />
                )}

                {activeTab === 'balances' && (
                  <BalancesView
                    group={activeGroup}
                    expenses={activeExpenses}
                    settlements={activeSettlements}
                    onOpenSettleWithPair={handleOpenSettleWithPair}
                  />
                )}

                {activeTab === 'activity' && (
                  <ActivityLogView
                    group={activeGroup}
                    activities={state.activities}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center my-auto">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Groups Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Create a new group to start tracking shared expenses with friends or housemates.
              </p>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                + Create First Group
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {activeGroup && (
        <>
          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            group={activeGroup}
            onAddExpense={handleAddExpense}
          />

          <SettleUpModal
            isOpen={isSettleUpOpen}
            onClose={() => setIsSettleUpOpen(false)}
            group={activeGroup}
            initialPayerId={settlePayerId}
            initialReceiverId={settleReceiverId}
            initialAmount={settleAmount}
            onRecordSettlement={handleRecordSettlement}
          />
        </>
      )}

      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
        groups={state.groups}
        activeGroup={activeGroup}
        initialCode={prefilledJoinCode}
        onJoinGroup={handleJoinGroup}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />

      {/* Slide-out Mobile Group Switcher & Ledger Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        groups={state.groups}
        activeGroup={activeGroup}
        onSelectGroup={handleSelectGroup}
        state={state}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onOpenJoinModal={() => {
          setPrefilledJoinCode('');
          setIsJoinGroupOpen(true);
        }}
        onOpenGitHubModal={() => setIsGitHubOpen(true)}
        onResetData={handleResetData}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Fixed Bottom Navigation Bar for Mobile */}
      {activeGroup && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenGroupsDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          expenseCount={activeExpenses.length}
        />
      )}

    </div>
  );
}
