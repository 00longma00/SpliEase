import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateJoinCode,
  getRandomColor,
  getInitialState,
  loadAppState,
  saveAppState,
  resetAppState,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  AppState,
} from './storage.ts';

// Mock localStorage for node test environment
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Ensure globalThis.localStorage is available in node environment
const originalLocalStorage = (globalThis as any).localStorage;
(globalThis as any).localStorage = new MockLocalStorage();

test('generateJoinCode generates uppercase alphanumeric codes of specified length', () => {
  const code6 = generateJoinCode(6);
  assert.equal(code6.length, 6);
  assert.match(code6, /^[A-Z2-9]{6}$/);

  const code8 = generateJoinCode(8);
  assert.equal(code8.length, 8);
  assert.match(code8, /^[A-Z2-9]{8}$/);

  // Excludes ambiguous characters (0, O, 1, I)
  for (let i = 0; i < 50; i++) {
    const code = generateJoinCode();
    assert.ok(!code.includes('0'), 'Should not contain 0');
    assert.ok(!code.includes('O'), 'Should not contain O');
    assert.ok(!code.includes('1'), 'Should not contain 1');
    assert.ok(!code.includes('I'), 'Should not contain I');
  }
});

test('getRandomColor returns valid hex color strings', () => {
  for (let i = 0; i < 20; i++) {
    const color = getRandomColor();
    assert.match(color, /^#[0-9a-fA-F]{6}$/);
  }
});

test('getInitialState returns valid default demo data with groups and activeGroupId', () => {
  const initial = getInitialState();
  assert.ok(initial.groups.length >= 2);
  assert.ok(initial.expenses.length >= 3);
  assert.ok(initial.settlements.length >= 1);
  assert.equal(initial.activeGroupId, INITIAL_GROUPS[0].id);
  assert.equal(initial.currentUserId, 'user_alex');
});

test('saveAppState and loadAppState correctly persist and restore state', () => {
  (globalThis as any).localStorage.clear();

  const customState: AppState = {
    currentUserId: 'user_custom',
    activeGroupId: 'group_custom_1',
    groups: [
      {
        id: 'group_custom_1',
        name: 'Custom Cabin',
        category: 'trip',
        currency: 'EUR',
        joinCode: 'EURCAB',
        createdAt: '2026-05-01T00:00:00Z',
        createdBy: 'user_custom',
        members: [{ id: 'user_custom', name: 'Custom User', avatarColor: '#10b981', joinedAt: '' }],
      },
    ],
    expenses: [],
    settlements: [],
    activities: [],
  };

  saveAppState(customState);
  const loaded = loadAppState();

  assert.equal(loaded.currentUserId, 'user_custom');
  assert.equal(loaded.activeGroupId, 'group_custom_1');
  assert.equal(loaded.groups.length, 1);
  assert.equal(loaded.groups[0].name, 'Custom Cabin');
  assert.equal(loaded.groups[0].currency, 'EUR');
});

test('loadAppState falls back to getInitialState if storage is empty or invalid JSON', () => {
  (globalThis as any).localStorage.clear();
  const loadedEmpty = loadAppState();
  assert.equal(loadedEmpty.activeGroupId, INITIAL_GROUPS[0].id);

  (globalThis as any).localStorage.setItem('splitease_app_state_v1', 'INVALID_JSON{');
  const loadedCorrupt = loadAppState();
  assert.equal(loadedCorrupt.activeGroupId, INITIAL_GROUPS[0].id);
});

test('resetAppState clears custom data and writes initial state', () => {
  const fresh = resetAppState();
  assert.equal(fresh.groups.length, INITIAL_GROUPS.length);
  assert.equal(fresh.expenses.length, INITIAL_EXPENSES.length);
  assert.equal(fresh.settlements.length, INITIAL_SETTLEMENTS.length);
});
