import { DebtRelation, Expense, Member, Settlement, SplitDetail } from '../types/index.ts';

export function roundCents(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
    INR: '₹',
    CHF: 'CHF ',
  };
  const sym = symbolMap[currency] || '$';
  const isNegative = amount < -0.004;
  const absVal = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${sym}${absVal}`;
}

/**
 * Calculates equal splits ensuring the sum of all individual shares exactly equals
 * totalAmount without floating point drift or lost cents.
 */
export function calculateEqualSplits(totalAmount: number, memberIds: string[]): SplitDetail[] {
  if (memberIds.length === 0 || totalAmount <= 0) return [];
  
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / memberIds.length);
  let remainderCents = totalCents % memberIds.length;

  return memberIds.map((memberId) => {
    let cents = baseCents;
    if (remainderCents > 0) {
      cents += 1;
      remainderCents -= 1;
    }
    return {
      memberId,
      amount: cents / 100,
    };
  });
}

/**
 * Calculates splits by exact percentages.
 */
export function calculatePercentageSplits(
  totalAmount: number,
  percentages: Record<string, number>
): { splits: SplitDetail[]; isValid: boolean; difference: number } {
  const memberIds = Object.keys(percentages);
  const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + (p || 0), 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.05;

  let allocatedCents = 0;
  const totalCents = Math.round(totalAmount * 100);

  const splits: SplitDetail[] = memberIds.map((id, index) => {
    const pct = percentages[id] || 0;
    // For last member, assign remaining cents to ensure exact sum if valid
    if (index === memberIds.length - 1 && isValid) {
      const remainingCents = totalCents - allocatedCents;
      return {
        memberId: id,
        percentage: pct,
        amount: Math.max(0, remainingCents / 100),
      };
    }
    const cents = Math.round((totalCents * pct) / 100);
    allocatedCents += cents;
    return {
      memberId: id,
      percentage: pct,
      amount: cents / 100,
    };
  });

  return {
    splits,
    isValid,
    difference: roundCents(100 - totalPercentage),
  };
}

/**
 * Calculates splits by shares/ratios.
 */
export function calculateSharesSplits(
  totalAmount: number,
  shares: Record<string, number>
): { splits: SplitDetail[]; totalShares: number } {
  const memberIds = Object.keys(shares);
  const totalShares = Object.values(shares).reduce((sum, s) => sum + Math.max(0, s || 0), 0);

  if (totalShares <= 0 || totalAmount <= 0) {
    return {
      splits: memberIds.map((id) => ({ memberId: id, amount: 0, shares: shares[id] || 0 })),
      totalShares: 0,
    };
  }

  const totalCents = Math.round(totalAmount * 100);
  let allocatedCents = 0;

  const splits: SplitDetail[] = memberIds.map((id, index) => {
    const share = Math.max(0, shares[id] || 0);
    if (index === memberIds.length - 1) {
      const remainingCents = totalCents - allocatedCents;
      return {
        memberId: id,
        shares: share,
        amount: Math.max(0, remainingCents / 100),
      };
    }
    const cents = Math.round((totalCents * share) / totalShares);
    allocatedCents += cents;
    return {
      memberId: id,
      shares: share,
      amount: cents / 100,
    };
  });

  return { splits, totalShares };
}

/**
 * Calculates net balances for every member in a group.
 * Positive = member is owed money (creditor).
 * Negative = member owes money (debtor).
 * Zero = completely settled.
 */
export function calculateNetBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // Initialize all members with 0.00
  for (const m of members) {
    balances[m.id] = 0;
  }

  // Factor in expenses
  for (const expense of expenses) {
    // Who paid gets credited (+)
    for (const payer of expense.paidBy) {
      balances[payer.memberId] = (balances[payer.memberId] || 0) + payer.amount;
    }
    // Who participated gets debited (-)
    for (const split of expense.splits) {
      balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
    }
  }

  // Factor in settlements
  for (const settlement of settlements) {
    // Payer sent money, so their debt decreases (their net balance increases)
    balances[settlement.payerId] = (balances[settlement.payerId] || 0) + settlement.amount;
    // Receiver got money, so what they are owed decreases (their net balance decreases)
    balances[settlement.receiverId] = (balances[settlement.receiverId] || 0) - settlement.amount;
  }

  // Clean rounding
  for (const id of Object.keys(balances)) {
    balances[id] = roundCents(balances[id]);
    if (Math.abs(balances[id]) < 0.005) {
      balances[id] = 0;
    }
  }

  return balances;
}

/**
 * Splitwise min-cash-flow algorithm (Debt Simplification).
 * Reduces the total number of transactions required to settle all debts in the group.
 * Example: If A owes B $50 and B owes C $50, debt simplification lets A pay C $50 directly.
 */
export function simplifyDebts(netBalances: Record<string, number>): DebtRelation[] {
  interface Account {
    id: string;
    balance: number;
  }

  const debtors: Account[] = [];
  const creditors: Account[] = [];

  for (const [id, balance] of Object.entries(netBalances)) {
    const rounded = roundCents(balance);
    if (rounded < -0.005) {
      debtors.push({ id, balance: rounded }); // negative
    } else if (rounded > 0.005) {
      creditors.push({ id, balance: rounded }); // positive
    }
  }

  // Sort debtors most indebted first, creditors largest credit first
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const simplified: DebtRelation[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const debtOwed = -debtor.balance;
    const creditAvailable = creditor.balance;

    const settledAmount = roundCents(Math.min(debtOwed, creditAvailable));

    if (settledAmount > 0.005) {
      simplified.push({
        from: debtor.id,
        to: creditor.id,
        amount: settledAmount,
      });
    }

    debtor.balance += settledAmount;
    creditor.balance -= settledAmount;

    if (Math.abs(debtor.balance) < 0.005) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.005) {
      cIdx++;
    }
  }

  return simplified;
}

/**
 * Calculates direct bilateral debts without simplification.
 * Useful when users want to see exact peer-to-peer debts from raw expenses.
 */
export function calculateDirectDebts(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): DebtRelation[] {
  const memberIds = members.map((m) => m.id);
  // Matrix: matrix[A][B] = how much A directly owes B
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of memberIds) {
    matrix[a] = {};
    for (const b of memberIds) {
      matrix[a][b] = 0;
    }
  }

  for (const exp of expenses) {
    const totalPaid = exp.paidBy.reduce((s, p) => s + p.amount, 0);
    if (totalPaid <= 0) continue;

    for (const split of exp.splits) {
      // Split participant owes whoever paid, in proportion to how much each payer paid
      for (const payer of exp.paidBy) {
        if (payer.memberId === split.memberId) continue;
        const payerShare = payer.amount / totalPaid;
        const owesPayer = split.amount * payerShare;
        if (matrix[split.memberId] && matrix[split.memberId][payer.memberId] !== undefined) {
          matrix[split.memberId][payer.memberId] += owesPayer;
        }
      }
    }
  }

  // Account for direct settlements
  for (const st of settlements) {
    if (matrix[st.payerId] && matrix[st.payerId][st.receiverId] !== undefined) {
      matrix[st.payerId][st.receiverId] -= st.amount;
    }
  }

  // Net out bilateral pairs (if A owes B $30 and B owes A $10, A owes B $20)
  const results: DebtRelation[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i];
      const b = memberIds[j];
      const key = `${a}:${b}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const aOwesB = matrix[a][b] || 0;
      const bOwesA = matrix[b][a] || 0;
      const diff = roundCents(aOwesB - bOwesA);

      if (diff > 0.005) {
        results.push({ from: a, to: b, amount: diff });
      } else if (diff < -0.005) {
        results.push({ from: b, to: a, amount: Math.abs(diff) });
      }
    }
  }

  return results;
}
