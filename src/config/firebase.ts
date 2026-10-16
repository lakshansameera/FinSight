import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from '@firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// EXPO_PUBLIC_* variables are read from the .env file at build time (see .env.example).
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

/** False when .env is empty: the app then runs fully offline and hides cloud features. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured');
  app ??= getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const a = ensureApp();
  try {
    // Keeps the user signed in between launches
    auth = initializeAuth(a, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(a); // already initialised (e.g. after a fast refresh)
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  db ??= getFirestore(ensureApp());
  return db;
}