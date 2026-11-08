import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteGroupReducer,
  createGroupReducer,
  joinGroupReducer,
  deleteExpenseReducer,
  deleteSettlementReducer,
} from './groupActions.ts';
import { AppState } from './storage.ts';
import { Group, Member, Expense, Settlement, ActivityItem } from '../types/index.ts';

const mockMember1: Member = {
  id: 'user_1',
  name: 'User One',
  avatarColor: '#10b981',
  joinedAt: '2026-01-01T00:00:00Z',
};

const mockMember2: Member = {
  id: 'user_2',
  name: 'User Two',
  avatarColor: '#3b82f6',
  joinedAt: '2026-01-01T00:00:00Z',
};

const mockGroupA: Group = {
  id: 'group_a',
  name: 'Group A',
  description: 'First group',
  category: 'trip',
  currency: 'USD',
  joinCode: 'GRPA01',
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: 'user_1',
  members: [mockMember1, mockMember2],
};

const mockGroupB: Group = {
  id: 'group_b',
  name: 'Group B',
  description: 'Second group',
  category: 'home',
  currency: 'USD',
  joinCode: 'GRPB02',
  createdAt: '2026-01-02T00:00:00Z',
  createdBy: 'user_2',
  members: [mockMember1, mockMember2],
};

const mockExpenseA: Expense = {
  id: 'exp_a1',
  groupId: 'group_a',
  description: 'Dinner A',
  amount: 60,
  currency: 'USD',
  category: 'food',
  date: '2026-01-03',
  paidBy: [{ memberId: 'user_1', amount: 60 }],
  splitMethod: 'equal',
  splits: [
    { memberId: 'user_1', amount: 30 },
    { memberId: 'user_2', amount: 30 },
  ],
  createdAt: '2026-01-03T00:00:00Z',
  createdBy: 'user_1',
};

const mockExpenseB: Expense = {
  id: 'exp_b1',
  groupId: 'group_b',
  description: 'Groceries B',
  amount: 40,
  currency: 'USD',
  category: 'groceries',
  date: '2026-01-04',
  paidBy: [{ memberId: 'user_2', amount: 40 }],
  splitMethod: 'equal',
  splits: [
    { memberId: 'user_1', amount: 20 },
    { memberId: 'user_2', amount: 20 },
  ],
  createdAt: '2026-01-04T00:00:00Z',
  createdBy: 'user_2',
};

const mockSettlementA: Settlement = {
  id: 'set_a1',
  groupId: 'group_a',
  payerId: 'user_2',
  receiverId: 'user_1',
  amount: 30,
  currency: 'USD',
  date: '2026-01-05',
  paymentMethod: 'venmo',
  createdAt: '2026-01-05T00:00:00Z',
};

const mockSettlementB: Settlement = {
  id: 'set_b1',
  groupId: 'group_b',
  payerId: 'user_1',
  receiverId: 'user_2',
  amount: 20,
  currency: 'USD',
  date: '2026-01-06',
  paymentMethod: 'cash',
  createdAt: '2026-01-06T00:00:00Z',
};

const mockActivityA: ActivityItem = {
  id: 'act_a1',
  groupId: 'group_a',
  type: 'expense_added',
  actorId: 'user_1',
  description: 'Added expense Dinner A',
  timestamp: '2026-01-03T00:00:00Z',
};

const mockActivityB: ActivityItem = {
  id: 'act_b1',
  groupId: 'group_b',
  type: 'expense_added',
  actorId: 'user_2',
  description: 'Added expense Groceries B',
  timestamp: '2026-01-04T00:00:00Z',
};

function createSampleState(): AppState {
  return {
    currentUserId: 'user_1',
    activeGroupId: 'group_a',
    groups: [mockGroupA, mockGroupB],
    expenses: [mockExpenseA, mockExpenseB],
    settlements: [mockSettlementA, mockSettlementB],
    activities: [mockActivityA, mockActivityB],
  };
}

test('deleteGroupReducer deletes active group and switches activeGroupId to remaining group', () => {
  const state = createSampleState();
  const next = deleteGroupReducer(state, 'group_a');

  assert.equal(next.groups.length, 1);
  assert.equal(next.groups[0].id, 'group_b');
  assert.equal(next.activeGroupId, 'group_b');
  // Cascading deletes
  assert.equal(next.expenses.length, 1);
  assert.equal(next.expenses[0].id, 'exp_b1');
  assert.equal(next.settlements.length, 1);
  assert.equal(next.settlements[0].id, 'set_b1');
  assert.equal(next.activities.length, 1);
  assert.equal(next.activities[0].id, 'act_b1');
});

test('deleteGroupReducer deletes active group when it is the sole group and sets activeGroupId to null', () => {
  const singleGroupState: AppState = {
    currentUserId: 'user_1',
    activeGroupId: 'group_a',
    groups: [mockGroupA],
    expenses: [mockExpenseA],
    settlements: [mockSettlementA],
    activities: [mockActivityA],
  };

  const next = deleteGroupReducer(singleGroupState, 'group_a');

  assert.equal(next.groups.length, 0);
  assert.equal(next.activeGroupId, null);
  assert.equal(next.expenses.length, 0);
  assert.equal(next.settlements.length, 0);
  assert.equal(next.activities.length, 0);
});

test('deleteGroupReducer deleting a non-active group preserves activeGroupId', () => {
  const state = createSampleState();
  assert.equal(state.activeGroupId, 'group_a');

  const next = deleteGroupReducer(state, 'group_b');

  assert.equal(next.groups.length, 1);
  assert.equal(next.groups[0].id, 'group_a');
  assert.equal(next.activeGroupId, 'group_a'); // Unchanged
  assert.equal(next.expenses.length, 1);
  assert.equal(next.expenses[0].groupId, 'group_a');
  assert.equal(next.settlements.length, 1);
  assert.equal(next.settlements[0].groupId, 'group_a');
});

test('deleteGroupReducer with unknown groupId is a safe no-op', () => {
  const state = createSampleState();
  const next = deleteGroupReducer(state, 'non_existent_group');

  assert.equal(next.groups.length, 2);
  assert.equal(next.activeGroupId, 'group_a');
  assert.equal(next.expenses.length, 2);
  assert.equal(next.settlements.length, 2);
});

test('createGroupReducer adds group to beginning, sets active, and logs activity', () => {
  const state = createSampleState();
  const newGroup: Group = {
    id: 'group_c',
    name: 'Road Trip',
    category: 'trip',
    currency: 'USD',
    joinCode: 'ROAD99',
    createdAt: '2026-02-01T00:00:00Z',
    createdBy: 'user_1',
    members: [mockMember1],
  };

  const next = createGroupReducer(state, newGroup);

  assert.equal(next.groups.length, 3);
  assert.equal(next.groups[0].id, 'group_c');
  assert.equal(next.activeGroupId, 'group_c');
  assert.equal(next.activities.length, 3);
  assert.equal(next.activities[0].type, 'group_created');
  assert.ok(next.activities[0].description.includes('Road Trip'));
});

test('joinGroupReducer adds member, sets activeGroupId, and prevents duplicates', () => {
  const state = createSampleState();
  const newMember: Member = {
    id: 'user_3',
    name: 'New Friend',
    avatarColor: '#ec4899',
    joinedAt: '2026-02-02T00:00:00Z',
  };

  const next = joinGroupReducer(state, 'group_a', newMember);
  const updatedGroupA = next.groups.find((g) => g.id === 'group_a');
  assert.ok(updatedGroupA);
  assert.equal(updatedGroupA.members.length, 3);
  assert.equal(updatedGroupA.members[2].id, 'user_3');
  assert.equal(next.activeGroupId, 'group_a');
  assert.equal(next.activities[0].type, 'member_joined');

  // Attempt joining again with duplicate member
  const duplicateAttempt = joinGroupReducer(next, 'group_a', newMember);
  const recheckedGroupA = duplicateAttempt.groups.find((g) => g.id === 'group_a');
  assert.ok(recheckedGroupA);
  assert.equal(recheckedGroupA.members.length, 3); // Still 3, no duplicate
});

test('deleteExpenseReducer removes expense and logs activity', () => {
  const state = createSampleState();
  const next = deleteExpenseReducer(state, 'exp_a1');

  assert.equal(next.expenses.length, 1);
  assert.equal(next.expenses[0].id, 'exp_b1');
  assert.equal(next.activities[0].type, 'expense_deleted');
  assert.ok(next.activities[0].description.includes('Dinner A'));
});

test('deleteSettlementReducer removes settlement cleanly', () => {
  const state = createSampleState();
  const next = deleteSettlementReducer(state, 'set_a1');

  assert.equal(next.settlements.length, 1);
  assert.equal(next.settlements[0].id, 'set_b1');
});
