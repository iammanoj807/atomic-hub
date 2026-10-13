import { describe, it, expect } from 'vitest';
import { isOwnerEmail, signInErrorMessage } from '../auth';

describe('isOwnerEmail', () => {
    it('matches the owner regardless of case and stray spaces', () => {
        expect(isOwnerEmail('Me@Example.com ', 'me@example.com')).toBe(true);
    });

    it('rejects any other account', () => {
        expect(isOwnerEmail('someone@example.com', 'me@example.com')).toBe(false);
    });

    it('lets nobody in when the owner email is not configured', () => {
        expect(isOwnerEmail('', '')).toBe(false);
        expect(isOwnerEmail('me@example.com', '')).toBe(false);
    });

    it('rejects an account with no email', () => {
        expect(isOwnerEmail(null, 'me@example.com')).toBe(false);
        expect(isOwnerEmail(undefined, 'me@example.com')).toBe(false);
    });
});

describe('signInErrorMessage', () => {
    it('reads the same for every wrong-credentials code', () => {
        for (const code of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email']) {
            expect(signInErrorMessage({ code })).toBe('Incorrect password');
        }
    });

    it('explains rate limiting separately', () => {
        expect(signInErrorMessage({ code: 'auth/too-many-requests' })).toMatch(/Too many attempts/);
    });

    it('explains a dropped connection', () => {
        expect(signInErrorMessage({ code: 'auth/network-request-failed' })).toMatch(/No connection/);
    });

    it('falls back to a generic line for anything unexpected', () => {
        expect(signInErrorMessage(new Error('boom'))).toBe("Couldn't sign in. Try again.");
        expect(signInErrorMessage(undefined)).toBe("Couldn't sign in. Try again.");
    });
});
