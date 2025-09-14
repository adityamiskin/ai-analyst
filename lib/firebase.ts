import {
	initializeApp,
	getApps,
	getApp,
	type FirebaseOptions,
} from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let _appInitialized = false;

export type FirebaseClients = {
	auth: Auth;
	db: Firestore;
	storage: FirebaseStorage;
};

export function initFirebase(options: FirebaseOptions): FirebaseClients {
	const app = getApps().length ? getApp() : initializeApp(options);
	_appInitialized = true;
	const auth = getAuth(app);
	const db = getFirestore(app);
	const storage = getStorage(app);
	return { auth, db, storage };
}

export async function ensureAnonymousAuth(auth: Auth): Promise<void> {
	try {
		if (!auth.currentUser) {
			await signInAnonymously(auth);
		}
	} catch (e) {
		// non-fatal for demo usage
		console.error('Anonymous auth failed', e);
	}
}

export function hasInitializedApp() {
	return _appInitialized || getApps().length > 0;
}

export function getFirebaseConfigFromEnv(): FirebaseOptions {
	const {
		NEXT_PUBLIC_FIREBASE_API_KEY,
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		NEXT_PUBLIC_FIREBASE_APP_ID,
	} = process.env as Record<string, string | undefined>;

	if (
		!NEXT_PUBLIC_FIREBASE_API_KEY ||
		!NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
		!NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
		!NEXT_PUBLIC_FIREBASE_APP_ID
	) {
		throw new Error(
			'Missing Firebase env config. Ensure NEXT_PUBLIC_FIREBASE_* variables are set.',
		);
	}

	return {
		apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: NEXT_PUBLIC_FIREBASE_APP_ID,
	};
}

export function getFirebaseClientsFromEnv(): FirebaseClients {
	return initFirebase(getFirebaseConfigFromEnv());
}
