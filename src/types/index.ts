export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  joinedAt: string;
}

export type GroupCategory = 'trip' | 'home' | 'couple' | 'project' | 'other';

export interface Group {
  id: string;
  name: string;
  description?: string;
  category: GroupCategory;
  currency: CurrencyCode;
  joinCode: string; // 6-character code like "TAHOE8"
  createdAt: string;
  createdBy: string;
  members: Member[];
}

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitDetail {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface PayerDetail {
  memberId: string;
  amount: number;
}

export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'lodging' 
  | 'groceries' 
  | 'entertainment' 
  | 'utilities' 
  | 'general';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paidBy: PayerDetail[];
  splitMethod: SplitMethod;
  splits: SplitDetail[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type PaymentMethod = 'cash' | 'venmo' | 'paypal' | 'zelle' | 'bank' | 'other';

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: string;
}

export interface DebtRelation {
  from: string; // debtor memberId
  to: string;   // creditor memberId
  amount: number;
}

export type ActivityType = 
  | 'expense_added' 
  | 'expense_edited' 
  | 'expense_deleted' 
  | 'settlement_added' 
  | 'member_joined' 
  | 'group_created';

export interface ActivityItem {
  id: string;
  groupId: string;
  type: ActivityType;
  actorId: string;
  description: string;
  timestamp: string;
  amount?: number;
  currency?: CurrencyCode;
}
