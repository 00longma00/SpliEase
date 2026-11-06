/**
 * Firestore Real-time Synchronization Service
 * Handles live sync for groups, expenses, settlements, and activities across devices.
 */
import { 
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { ActivityItem, Expense, Group, Member, Settlement } from '../types/index.ts';
import { 
  INITIAL_GROUPS, 
  INITIAL_EXPENSES, 
  INITIAL_SETTLEMENTS, 
  INITIAL_ACTIVITIES 
} from '../utils/storage.ts';

export type SyncStatus = 'connecting' | 'connected' | 'error' | 'offline';

export class FirestoreSyncService {
  private static instance: FirestoreSyncService;
  private unsubscribeGroups: (() => void) | null = null;
  private activeSubUnsubscribes: Map<string, (() => void)[]> = new Map();
  private syncStatusListeners: Set<(status: SyncStatus) => void> = new Set();
  private currentStatus: SyncStatus = 'connecting';

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.add(callback);
    callback(this.currentStatus);
    return () => this.syncStatusListeners.delete(callback);
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.syncStatusListeners.forEach((cb) => cb(status));
  }

  /**
   * Seeds demo data if Firestore collection is empty
   */
  public async seedInitialDataIfEmpty(): Promise<void> {
    const path = 'groups';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        console.log('Seeding initial groups into Firestore...');
        const batch = writeBatch(db);

        // Seed groups
        for (const g of INITIAL_GROUPS) {
          batch.set(doc(db, 'groups', g.id), {
            ...g,
            updatedAt: new Date().toISOString(),
          });
        }

        // Seed expenses
        for (const e of INITIAL_EXPENSES) {
          batch.set(doc(db, 'groups', e.groupId, 'expenses', e.id), e);
        }

        // Seed settlements
        for (const s of INITIAL_SETTLEMENTS) {
          batch.set(doc(db, 'groups', s.groupId, 'settlements', s.id), s);
        }

        // Seed activities
        for (const a of INITIAL_ACTIVITIES) {
          batch.set(doc(db, 'groups', a.groupId, 'activities', a.id), {
            id: a.id,
            groupId: a.groupId,
            type: a.type,
            actorName: a.actorId,
            description: a.description,
            timestamp: a.timestamp,
          });
        }

        await batch.commit();
        console.log('Successfully seeded initial Firestore data');
      }
    } catch (err) {
      console.warn('Initial seeding notice (using local/cached data):', err);
    }
  }

  /**
   * Listen to all groups
   */
  public subscribeToGroups(
    onGroupsUpdated: (groups: Group[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const path = 'groups';
    this.setStatus('connecting');

    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        this.setStatus('connected');
        const groups: Group[] = [];
        snapshot.forEach((docSnap) => {
          groups.push(docSnap.data() as Group);
        });
        if (groups.length > 0) {
          onGroupsUpdated(groups);
        }
      },
      (error) => {
        this.setStatus('error');
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch {
          // Logged by handler
        }
      }
    );

    this.unsubscribeGroups = unsubscribe;
    return unsubscribe;
  }

  /**
   * Listen to subcollections (expenses, settlements, activities) for a set of group IDs
   */
  public subscribeToGroupData(
    groupIds: string[],
    callbacks: {
      onExpensesUpdated: (groupId: string, expenses: Expense[]) => void;
      onSettlementsUpdated: (groupId: string, settlements: Settlement[]) => void;
      onActivitiesUpdated: (groupId: string, activities: ActivityItem[]) => void;
    }
  ): () => void {
    // Clear previous group listeners not in current list
    for (const [gid, unsubs] of this.activeSubUnsubscribes.entries()) {
      if (!groupIds.includes(gid)) {
        unsubs.forEach((unsub) => unsub());
        this.activeSubUnsubscribes.delete(gid);
      }
    }

    // Attach listeners for any new groups
    groupIds.forEach((groupId) => {
      if (this.activeSubUnsubscribes.has(groupId)) return;

      const unsubs: (() => void)[] = [];

      // 1. Expenses
      const expPath = `groups/${groupId}/expenses`;
      const unsubExp = onSnapshot(
        collection(db, expPath),
        (snap) => {
          const expenses: Expense[] = [];
          snap.forEach((d) => expenses.push(d.data() as Expense));
          callbacks.onExpensesUpdated(groupId, expenses);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, expPath);
          } catch {
            // Handled
          }
        }
      );
      unsubs.push(unsubExp);

      // 2. Settlements
      const setPath = `groups/${groupId}/settlements`;
      const unsubSet = onSnapshot(
        collection(db, setPath),
        (snap) => {
          const settlements: Settlement[] = [];
          snap.forEach((d) => settlements.push(d.data() as Settlement));
          callbacks.onSettlementsUpdated(groupId, settlements);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, setPath);
          } catch {
            // Handled
          }
        }
      );
      unsubs.push(unsubSet);

      // 3. Activities
      const actPath = `groups/${groupId}/activities`;
      const unsubAct = onSnapshot(
        collection(db, actPath),
        (snap) => {
          const activities: ActivityItem[] = [];
          snap.forEach((d) => activities.push(d.data() as ActivityItem));
          callbacks.onActivitiesUpdated(groupId, activities);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, actPath);
          } catch {
            // Handled
          }
        }
      );
      unsubs.push(unsubAct);

      this.activeSubUnsubscribes.set(groupId, unsubs);
    });

    return () => {
      this.activeSubUnsubscribes.forEach((unsubs) => unsubs.forEach((u) => u()));
      this.activeSubUnsubscribes.clear();
    };
  }

  // --- Real-time Cloud Mutations ---

  public async createGroup(group: Group): Promise<void> {
    const path = `groups/${group.id}`;
    try {
      await setDoc(doc(db, 'groups', group.id), {
        ...group,
        createdAt: group.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async deleteGroup(groupId: string): Promise<void> {
    const path = `groups/${groupId}`;
    try {
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public async updateGroupMembers(group: Group, newMembers: Member[]): Promise<void> {
    const path = `groups/${group.id}`;
    try {
      await setDoc(
        doc(db, 'groups', group.id),
        {
          ...group,
          members: newMembers,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public async addExpense(groupId: string, expense: Expense): Promise<void> {
    const path = `groups/${groupId}/expenses/${expense.id}`;
    try {
      await setDoc(doc(db, 'groups', groupId, 'expenses', expense.id), expense);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    const path = `groups/${groupId}/expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'expenses', expenseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public async addSettlement(groupId: string, settlement: Settlement): Promise<void> {
    const path = `groups/${groupId}/settlements/${settlement.id}`;
    try {
      await setDoc(doc(db, 'groups', groupId, 'settlements', settlement.id), settlement);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async deleteSettlement(groupId: string, settlementId: string): Promise<void> {
    const path = `groups/${groupId}/settlements/${settlementId}`;
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'settlements', settlementId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public async addActivity(groupId: string, activity: ActivityItem): Promise<void> {
    const path = `groups/${groupId}/activities/${activity.id}`;
    try {
      await setDoc(doc(db, 'groups', groupId, 'activities', activity.id), {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export const cloudSync = FirestoreSyncService.getInstance();
