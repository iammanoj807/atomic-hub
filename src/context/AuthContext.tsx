import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import { OWNER_EMAIL, isOwnerEmail } from '../utils/auth';

// Real sign-in, checked by Firebase on the server. The password never ships in
// the bundle. What actually protects the data is firestore.rules, which only
// let the owner's uid read or write; this file decides what the UI shows.

if (!OWNER_EMAIL) {
    console.error(
        '⚠️ VITE_OWNER_EMAIL is not set — nobody can sign in. ' +
        'Copy .env.example to .env and set it, then restart the dev server.'
    );
}

// 'restoring' covers the moment after a reload while Firebase reads the saved
// session, so a signed-in reload doesn't flash the login page.
export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthContextType {
    status: AuthStatus;
    user: User | null;
    signIn: (password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>('restoring');

    useEffect(() => {
        return onAuthStateChanged(auth, (nextUser) => {
            // Only the owner gets in. Anyone else holding a session for this
            // project (accounts can be created outside this UI) is signed out;
            // the rules would refuse them every read anyway.
            if (nextUser && !isOwnerEmail(nextUser.email)) {
                void firebaseSignOut(auth);
                return;
            }
            setUser(nextUser);
            setStatus(nextUser ? 'signedIn' : 'signedOut');
        });
    }, []);

    const signIn = async (password: string) => {
        if (!OWNER_EMAIL) {
            throw { code: 'auth/configuration-not-found' };
        }
        await signInWithEmailAndPassword(auth, OWNER_EMAIL, password);
    };

    const signOut = () => firebaseSignOut(auth);

    return (
        <AuthContext.Provider value={{ status, user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
