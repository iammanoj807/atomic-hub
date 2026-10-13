import type { FirebaseError } from 'firebase/app';

// The one account that can sign in. Not a secret: only the password is, and
// Firebase checks that on the server. firestore.rules hold the matching uid.
export const OWNER_EMAIL: string = import.meta.env.VITE_OWNER_EMAIL ?? '';

// Whether a signed-in account is the owner. An empty owner email matches
// nobody, so a missing .env can never let an account through.
export const isOwnerEmail = (email: string | null | undefined, ownerEmail: string = OWNER_EMAIL): boolean =>
    !!ownerEmail && !!email && email.trim().toLowerCase() === ownerEmail.trim().toLowerCase();

// Turns a Firebase sign-in error into the line shown under the password box.
// Every "wrong credentials" code reads the same, so the page never says
// whether it was the email or the password that didn't match.
export const signInErrorMessage = (error: unknown): string => {
    switch ((error as FirebaseError | undefined)?.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
        case 'auth/missing-password':
            return 'Incorrect password';
        case 'auth/too-many-requests':
            return 'Too many attempts. Wait a few minutes and try again.';
        case 'auth/network-request-failed':
            return 'No connection. Check your internet and try again.';
        case 'auth/operation-not-allowed':
        case 'auth/configuration-not-found':
            return 'Sign-in is not enabled for this project yet.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        default:
            return "Couldn't sign in. Try again.";
    }
};
