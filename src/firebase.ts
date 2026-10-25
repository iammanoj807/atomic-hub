// Firebase configuration
// Uses environment variables for secure deployment

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth. initializeAuth rather than getAuth: sign-in is email and
// password only, so the popup/redirect machinery (and the hidden iframe it
// loads) isn't needed. The session survives restarts, including in the
// iPhone home-screen app, which keeps its own storage separate from Safari.
export const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

