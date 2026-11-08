import { AppState } from './storage.ts';
import { Group, Member, ActivityItem } from '../types/index.ts';

/**
 * Pure reducer function to delete a group and cascade-delete its expenses,
 * settlements, and activities from the AppState.
 */
export function deleteGroupReducer(state: AppState, groupId: string): AppState {
  const targetGroup = state.groups.find((g) => g.id === groupId);
  if (!targetGroup) {
    return state; // No-op if group not found
  }

  const remainingGroups = state.groups.filter((g) => g.id !== groupId);

  // If active group was the one deleted, switch to the first remaining group (or null if none)
  let nextActiveId = state.activeGroupId;
  if (state.activeGroupId === groupId) {
    nextActiveId = remainingGroups.length > 0 ? remainingGroups[0].id : null;
  }

  return {
    ...state,
    groups: remainingGroups,
    activeGroupId: nextActiveId,
    expenses: state.expenses.filter((e) => e.groupId !== groupId),
    settlements: state.settlements.filter((s) => s.groupId !== groupId),
    activities: state.activities.filter((a) => a.groupId !== groupId),
  };
}

/**
 * Pure reducer function to create a new group.
 */
export function createGroupReducer(state: AppState, newGroup: Group): AppState {
  const newActivity: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    groupId: newGroup.id,
    type: 'group_created',
    actorId: newGroup.createdBy,
    description: `Group "${newGroup.name}" was created with ${newGroup.members.length} members`,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    activeGroupId: newGroup.id,
    groups: [newGroup, ...state.groups],
    activities: [newActivity, ...state.activities],
  };
}

/**
 * Pure reducer function to join a member to an existing group.
 */
export function joinGroupReducer(state: AppState, groupId: string, newMember: Member): AppState {
  const targetGroup = state.groups.find((g) => g.id === groupId);
  if (!targetGroup) return state;

  // Avoid duplicate member
  if (targetGroup.members.some((m) => m.id === newMember.id)) {
    return { ...state, activeGroupId: targetGroup.id };
  }

  const updatedMembers = [...targetGroup.members, newMember];
  const updatedGroup: Group = {
    ...targetGroup,
    members: updatedMembers,
  };

  const newActivity: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    groupId: targetGroup.id,
    type: 'member_joined',
    actorId: newMember.id,
    description: `${newMember.name} joined the group via code "${targetGroup.joinCode}"`,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    activeGroupId: targetGroup.id,
    groups: state.groups.map((g) => (g.id === targetGroup.id ? updatedGroup : g)),
    activities: [newActivity, ...state.activities],
  };
}

/**
 * Pure reducer function to delete an expense from AppState.
 */
export function deleteExpenseReducer(state: AppState, expenseId: string): AppState {
  const target = state.expenses.find((e) => e.id === expenseId);
  if (!target) return state;

  const newActivity: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    groupId: target.groupId,
    type: 'expense_deleted',
    actorId: target.createdBy,
    description: `Deleted expense "${target.description}"`,
    amount: target.amount,
    currency: target.currency,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    expenses: state.expenses.filter((e) => e.id !== expenseId),
    activities: [newActivity, ...state.activities],
  };
}

/**
 * Pure reducer function to delete a settlement from AppState.
 */
export function deleteSettlementReducer(state: AppState, settlementId: string): AppState {
  const target = state.settlements.find((s) => s.id === settlementId);
  if (!target) return state;

  return {
    ...state,
    settlements: state.settlements.filter((s) => s.id !== settlementId),
  };
}
