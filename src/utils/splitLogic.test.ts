import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEqualSplits,
  calculatePercentageSplits,
  calculateSharesSplits,
  calculateNetBalances,
  simplifyDebts,
  roundCents,
  formatCurrency,
} from './splitLogic.ts';
import { Expense, Member, Settlement } from '../types/index.ts';

test('roundCents rounds numbers to two decimal places without floating precision issues', () => {
  assert.equal(roundCents(10.123), 10.12);
  assert.equal(roundCents(10.128), 10.13);
  assert.equal(roundCents(0.004), 0);
  assert.equal(roundCents(0.005), 0.01);
});

test('formatCurrency formats amounts with proper symbol and negative signs', () => {
  assert.equal(formatCurrency(1250.5, 'USD'), '$1,250.50');
  assert.equal(formatCurrency(-42.75, 'USD'), '-$42.75');
  assert.equal(formatCurrency(0, 'USD'), '$0.00');
  assert.equal(formatCurrency(99.99, 'EUR'), '€99.99');
  assert.equal(formatCurrency(500, 'GBP'), '£500.00');
  assert.equal(formatCurrency(1000, 'JPY'), '¥1,000.00');
});

test('calculateEqualSplits distributes cents evenly without drift', () => {
  const members = ['m1', 'm2', 'm3'];
  const splits = calculateEqualSplits(100, members);

  assert.equal(splits.length, 3);
  assert.equal(splits[0].amount, 33.34);
  assert.equal(splits[1].amount, 33.33);
  assert.equal(splits[2].amount, 33.33);

  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  assert.equal(roundCents(total), 100.00);
});

test('calculateEqualSplits handles single member and zero/negative amounts', () => {
  const single = calculateEqualSplits(50, ['only_me']);
  assert.equal(single.length, 1);
  assert.equal(single[0].amount, 50);

  const emptyMembers = calculateEqualSplits(100, []);
  assert.equal(emptyMembers.length, 0);

  const zeroAmount = calculateEqualSplits(0, ['m1', 'm2']);
  assert.equal(zeroAmount.length, 0);

  const negAmount = calculateEqualSplits(-20, ['m1', 'm2']);
  assert.equal(negAmount.length, 0);
});

test('calculatePercentageSplits calculates and validates correctly', () => {
  const pcts = { m1: 50, m2: 25, m3: 25 };
  const res = calculatePercentageSplits(200, pcts);

  assert.equal(res.isValid, true);
  assert.equal(res.splits.find((s) => s.memberId === 'm1')?.amount, 100);
  assert.equal(res.splits.find((s) => s.memberId === 'm2')?.amount, 50);
  assert.equal(res.splits.find((s) => s.memberId === 'm3')?.amount, 50);

  const invalid = calculatePercentageSplits(200, { m1: 50, m2: 40 });
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.difference, 10);
});

test('calculateSharesSplits divides according to ratio', () => {
  const shares = { m1: 2, m2: 1, m3: 1 };
  const res = calculateSharesSplits(120, shares);

  assert.equal(res.totalShares, 4);
  assert.equal(res.splits.find((s) => s.memberId === 'm1')?.amount, 60);
  assert.equal(res.splits.find((s) => s.memberId === 'm2')?.amount, 30);
  assert.equal(res.splits.find((s) => s.memberId === 'm3')?.amount, 30);
});

test('calculateSharesSplits handles zero total shares safely', () => {
  const res = calculateSharesSplits(100, { m1: 0, m2: 0 });
  assert.equal(res.totalShares, 0);
  assert.equal(res.splits[0].amount, 0);
  assert.equal(res.splits[1].amount, 0);
});

test('calculateNetBalances calculates correct balances for expenses and settlements', () => {
  const members: Member[] = [
    { id: 'alice', name: 'Alice', email: 'alice@test.com', avatarColor: '#10b981', joinedAt: '' },
    { id: 'bob', name: 'Bob', email: 'bob@test.com', avatarColor: '#3b82f6', joinedAt: '' },
    { id: 'charlie', name: 'Charlie', email: 'charlie@test.com', avatarColor: '#f59e0b', joinedAt: '' },
  ];

  // Alice pays $90 dinner split equally ($30 each)
  const expense1: Expense = {
    id: 'e1',
    groupId: 'g1',
    description: 'Dinner',
    amount: 90,
    currency: 'USD',
    category: 'food',
    date: '2026-11-01',
    paidBy: [{ memberId: 'alice', amount: 90 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'alice', amount: 30 },
      { memberId: 'bob', amount: 30 },
      { memberId: 'charlie', amount: 30 },
    ],
    createdAt: '',
    createdBy: 'alice',
  };

  // Charlie settles $20 to Alice
  const settlement1: Settlement = {
    id: 's1',
    groupId: 'g1',
    payerId: 'charlie',
    receiverId: 'alice',
    amount: 20,
    currency: 'USD',
    date: '2026-11-02',
    paymentMethod: 'venmo',
    createdAt: '',
  };

  const balances = calculateNetBalances(members, [expense1], [settlement1]);

  // Alice: +90 - 30 - 20 (received) = +40
  // Bob: 0 - 30 = -30
  // Charlie: 0 - 30 + 20 (paid) = -10
  assert.equal(balances['alice'], 40);
  assert.equal(balances['bob'], -30);
  assert.equal(balances['charlie'], -10);

  // Group sum must equal 0
  const sum = Object.values(balances).reduce((a, b) => a + b, 0);
  assert.equal(roundCents(sum), 0);
});

test('simplifyDebts simplifies multi-hop transitive debts', () => {
  // Alice owes Bob $50, Bob owes Charlie $50.
  // Net balances: Alice = -50, Bob = 0, Charlie = +50.
  // Simplified debt should be: Alice pays Charlie $50 directly (1 payment instead of 2).
  const netBalances = {
    alice: -50,
    bob: 0,
    charlie: 50,
  };

  const simplified = simplifyDebts(netBalances);

  assert.equal(simplified.length, 1);
  assert.equal(simplified[0].from, 'alice');
  assert.equal(simplified[0].to, 'charlie');
  assert.equal(simplified[0].amount, 50);
});

test('simplifyDebts resolves circular debts to zero transactions', () => {
  // Circular debt: Alice owes Bob $30, Bob owes Charlie $30, Charlie owes Alice $30.
  // Net balances for all three are 0.
  const netBalances = {
    alice: 0,
    bob: 0,
    charlie: 0,
  };

  const simplified = simplifyDebts(netBalances);
  assert.equal(simplified.length, 0);
});

test('simplifyDebts handles complex 4-person debt with minimal payments', () => {
  // Balances:
  // personA: -60 (owes 60)
  // personB: -40 (owes 40)
  // personC: +70 (is owed 70)
  // personD: +30 (is owed 30)
  const netBalances = {
    personA: -60,
    personB: -40,
    personC: 70,
    personD: 30,
  };

  const simplified = simplifyDebts(netBalances);

  // Total amount transferred must equal total debt (100)
  const totalTransferred = simplified.reduce((sum, d) => sum + d.amount, 0);
  assert.equal(roundCents(totalTransferred), 100);

  // Maximum transactions should be at most 3 (N - 1)
  assert.ok(simplified.length <= 3);
});
