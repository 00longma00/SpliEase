/**
 * Firebase initialization and error handling configuration.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

// Merged configuration: prioritize VITE_FIREBASE_* environment variables,
// falling back to local firebase-applet-config.json for AI Studio dev environment.
const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};
const configData = (rawConfig as Record<string, string>) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || configData.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || configData.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || configData.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || configData.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || configData.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || configData.appId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configData.firestoreDatabaseId || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  !firebaseConfig.apiKey.includes('DemoDefault') &&
  !firebaseConfig.projectId.includes('your-firebase') &&
  !firebaseConfig.projectId.includes('demo')
);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named database ID if provisioned (CRITICAL: Required for named multi-tenant databases)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Auto sign-in anonymously if enabled in Firebase console (silent fallback if disabled)
if (isFirebaseConfigured) {
  signInAnonymously(auth).catch(() => {
    // Anonymous auth provider is optional; Firestore rules permit group operations directly
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Firebase integration skill
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Offline cache enabled.');
    }
    return false;
  }
}
if (isFirebaseConfigured) {
  testFirestoreConnection().catch(() => {});
}
