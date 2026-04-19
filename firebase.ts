import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfigBlueprint from './firebase-applet-config.json';

const firebaseConfig = {
  ...firebaseConfigBlueprint,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigBlueprint.apiKey,
};

// Validate that the API key is provided
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY') {
  if (import.meta.env.DEV) {
    console.error("FIREBASE ERROR: API Key is missing or set to placeholder. Please check your .env file or firebase-applet-config.json");
    console.warn("Vite environment variables prefixed with VITE_ are required for client-side access.");
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { ref, uploadBytes, getDownloadURL };

export const uploadFileToStorage = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const logout = () => signOut(auth);

export const adminEmails = [
    'donakadriolli@gmail.com',
    'vizioniRinoriShales@gmail.com',
    'leotrimpajaziti17@gmail.com',
    'admin@vizionirinorishales.org'
  ];

export const isAdmin = (user: any) => {
  return user && adminEmails.includes(user.email);
};

// Test connection - Exported but not run automatically to avoid side effects
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isQuotaExceeded = errorMessage.includes('quota-exhausted') || errorMessage.includes('resource-exhausted') || errorMessage.includes('Quota exceeded');

  const errInfo: FirestoreErrorInfo = {
    error: isQuotaExceeded ? 'Firebase Quota Exceeded. Please try again tomorrow or upgrade your plan.' : errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  if (isQuotaExceeded) {
    console.warn('Firestore Quota Exceeded: ', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  
  throw new Error(JSON.stringify(errInfo));
}
