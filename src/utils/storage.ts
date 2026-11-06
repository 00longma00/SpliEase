import { ActivityItem, Expense, Group, Member, Settlement } from '../types/index.ts';

export interface AppState {
  currentUserId: string;
  activeGroupId: string | null;
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  activities: ActivityItem[];
}

const STORAGE_KEY = 'splitease_app_state_v1';
const LEGACY_STORAGE_KEY = 'fairshare_app_state_v1';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    avatarColor: '#059669', // Emerald
    joinedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'user_maya',
    name: 'Maya Lin',
    avatarColor: '#2563eb', // Blue
    joinedAt: '2026-10-15T08:30:00Z',
  },
  {
    id: 'user_jordan',
    name: 'Jordan Smith',
    avatarColor: '#d97706', // Amber
    joinedAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'user_sam',
    name: 'Sam Rivera',
    avatarColor: '#7c3aed', // Purple
    joinedAt: '2026-10-15T09:15:00Z',
  },
  {
    id: 'user_chloe',
    name: 'Chloe Vance',
    avatarColor: '#db2777', // Pink
    joinedAt: '2026-10-20T11:00:00Z',
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group_tahoe',
    name: 'Lake Tahoe Ski Trip',
    description: 'Cabin rental, lift tickets, groceries, and travel expenses',
    category: 'trip',
    currency: 'USD',
    joinCode: 'TAHOE8',
    createdAt: '2026-10-25T10:00:00Z',
    createdBy: 'user_alex',
    members: [
      INITIAL_MEMBERS[0], // Alex
      INITIAL_MEMBERS[1], // Maya
      INITIAL_MEMBERS[2], // Jordan
      INITIAL_MEMBERS[3], // Sam
    ],
  },
  {
    id: 'group_pine',
    name: 'Pine St Apartment',
    description: 'Rent utilities, household supplies, and shared groceries',
    category: 'home',
    currency: 'USD',
    joinCode: 'PINES3',
    createdAt: '2026-10-10T09:00:00Z',
    createdBy: 'user_alex',
    members: [
      INITIAL_MEMBERS[0], // Alex
      INITIAL_MEMBERS[1], // Maya
      INITIAL_MEMBERS[4], // Chloe
    ],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_cabin',
    groupId: 'group_tahoe',
    description: 'Mountain Cabin Rental (3 Nights)',
    amount: 640.0,
    currency: 'USD',
    category: 'lodging',
    date: '2026-11-01',
    paidBy: [{ memberId: 'user_alex', amount: 640.0 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'user_alex', amount: 160.0 },
      { memberId: 'user_maya', amount: 160.0 },
      { memberId: 'user_jordan', amount: 160.0 },
      { memberId: 'user_sam', amount: 160.0 },
    ],
    notes: 'Cabin booked on Airbnb. Includes cleaning and parking fee.',
    createdAt: '2026-11-01T14:30:00Z',
    createdBy: 'user_alex',
  },
  {
    id: 'exp_groceries',
    groupId: 'group_tahoe',
    description: 'Safeway Groceries & BBQ Supplies',
    amount: 172.5,
    currency: 'USD',
    category: 'groceries',
    date: '2026-11-02',
    paidBy: [{ memberId: 'user_maya', amount: 172.5 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'user_alex', amount: 43.13 },
      { memberId: 'user_maya', amount: 43.13 },
      { memberId: 'user_jordan', amount: 43.12 },
      { memberId: 'user_sam', amount: 43.12 },
    ],
    notes: 'Breakfast foods, burgers, firewood, and snacks',
    createdAt: '2026-11-02T18:15:00Z',
    createdBy: 'user_maya',
  },
  {
    id: 'exp_ski_pass',
    groupId: 'group_tahoe',
    description: 'Group Lift Tickets (Pass Holders excluded)',
    amount: 420.0,
    currency: 'USD',
    category: 'entertainment',
    date: '2026-11-03',
    paidBy: [{ memberId: 'user_jordan', amount: 420.0 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'user_maya', amount: 140.0 },
      { memberId: 'user_jordan', amount: 140.0 },
      { memberId: 'user_sam', amount: 140.0 },
    ],
    notes: 'Alex already had Epic pass so did not need ticket',
    createdAt: '2026-11-03T09:40:00Z',
    createdBy: 'user_jordan',
  },
  {
    id: 'exp_gas',
    groupId: 'group_tahoe',
    description: 'SUV Gas & Bay Bridge Toll',
    amount: 68.0,
    currency: 'USD',
    category: 'transport',
    date: '2026-11-04',
    paidBy: [{ memberId: 'user_sam', amount: 68.0 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'user_alex', amount: 17.0 },
      { memberId: 'user_maya', amount: 17.0 },
      { memberId: 'user_jordan', amount: 17.0 },
      { memberId: 'user_sam', amount: 17.0 },
    ],
    notes: 'Full tank at Chevron in Truckee',
    createdAt: '2026-11-04T16:20:00Z',
    createdBy: 'user_sam',
  },
  {
    id: 'exp_wifi',
    groupId: 'group_pine',
    description: 'Sonic Fiber Internet 1Gbps',
    amount: 85.0,
    currency: 'USD',
    category: 'utilities',
    date: '2026-11-01',
    paidBy: [{ memberId: 'user_alex', amount: 85.0 }],
    splitMethod: 'equal',
    splits: [
      { memberId: 'user_alex', amount: 28.34 },
      { memberId: 'user_maya', amount: 28.33 },
      { memberId: 'user_chloe', amount: 28.33 },
    ],
    notes: 'November billing cycle',
    createdAt: '2026-11-01T10:00:00Z',
    createdBy: 'user_alex',
  },
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'set_1',
    groupId: 'group_tahoe',
    payerId: 'user_sam',
    receiverId: 'user_alex',
    amount: 100.0,
    currency: 'USD',
    date: '2026-11-03',
    paymentMethod: 'venmo',
    note: 'Partial payment for cabin rental',
    createdAt: '2026-11-03T20:10:00Z',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    groupId: 'group_tahoe',
    type: 'group_created',
    actorId: 'user_alex',
    description: 'Alex Chen created the group "Lake Tahoe Ski Trip"',
    timestamp: '2026-10-25T10:00:00Z',
  },
  {
    id: 'act_2',
    groupId: 'group_tahoe',
    type: 'expense_added',
    actorId: 'user_alex',
    description: 'Alex Chen added "Mountain Cabin Rental (3 Nights)"',
    amount: 640.0,
    currency: 'USD',
    timestamp: '2026-11-01T14:30:00Z',
  },
  {
    id: 'act_3',
    groupId: 'group_tahoe',
    type: 'expense_added',
    actorId: 'user_maya',
    description: 'Maya Lin added "Safeway Groceries & BBQ Supplies"',
    amount: 172.5,
    currency: 'USD',
    timestamp: '2026-11-02T18:15:00Z',
  },
  {
    id: 'act_4',
    groupId: 'group_tahoe',
    type: 'settlement_added',
    actorId: 'user_sam',
    description: 'Sam Rivera paid Alex Chen $100.00 via Venmo',
    amount: 100.0,
    currency: 'USD',
    timestamp: '2026-11-03T20:10:00Z',
  },
];

export function getInitialState(): AppState {
  return {
    currentUserId: 'user_alex',
    activeGroupId: 'group_tahoe',
    groups: INITIAL_GROUPS,
    expenses: INITIAL_EXPENSES,
    settlements: INITIAL_SETTLEMENTS,
    activities: INITIAL_ACTIVITIES,
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.groups || parsed.groups.length === 0) {
      return getInitialState();
    }
    return parsed;
  } catch {
    return getInitialState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function resetAppState(): AppState {
  const initial = getInitialState();
  saveAppState(initial);
  return initial;
}

export function generateJoinCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid 0/O, 1/I for clarity
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomColor(): string {
  const colors = [
    '#059669', // Emerald
    '#2563eb', // Blue
    '#7c3aed', // Violet
    '#db2777', // Pink
    '#d97706', // Amber
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#e11d48', // Rose
    '#16a34a', // Green
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
