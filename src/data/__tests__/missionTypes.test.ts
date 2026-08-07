import { describe, it, expect } from 'vitest';
import { getTaskRoles, getTaskRole, isPersonTask, parseRoleTags } from '../missionTypes';

describe('getTaskRoles', () => {
    it('detects a family habit', () => {
        expect(getTaskRoles('Call family')).toEqual(['SON']);
    });

    it('detects a health habit', () => {
        expect(getTaskRoles('Light workout')).toEqual(['BUILDER']);
        expect(getTaskRoles('Meditation')).toEqual(['BUILDER']);
    });

    it('detects an engineering habit', () => {
        expect(getTaskRoles('Solve 3 DSA questions')).toEqual(['ENGINEER']);
    });

    it('is case insensitive', () => {
        expect(getTaskRoles('CALL FAMILY')).toEqual(['SON']);
        expect(getTaskRoles('solve dsa')).toEqual(['ENGINEER']);
    });

    it('returns both roles for an explicit multi-role override', () => {
        expect(getTaskRoles('Learn LangChain and Springboot')).toEqual(['ENGINEER', 'SCHOLAR']);
    });

    it('prefers a multi-role override over single-keyword matching', () => {
        // "spring boot" would otherwise match ENGINEER alone.
        expect(getTaskRoles('Spring Boot practice')).toEqual(['ENGINEER', 'SCHOLAR']);
    });

    it('falls back to ENGINEER for an unrecognised habit', () => {
        expect(getTaskRoles('Water the plants')).toEqual(['ENGINEER']);
    });

    it('resolves by keyword priority when a title matches more than one role', () => {
        // SON is checked before ENGINEER, so a family-related title wins even
        // though "practice" is an ENGINEER keyword.
        expect(getTaskRoles('Practice with family')).toEqual(['SON']);
    });
});

describe('getTaskRole', () => {
    it('returns the primary role only', () => {
        expect(getTaskRole('Learn LangChain and Springboot')).toBe('ENGINEER');
    });
});

describe('isPersonTask', () => {
    it('is true for family habits and false otherwise', () => {
        expect(isPersonTask('Call family')).toBe(true);
        expect(isPersonTask('Solve 3 DSA questions')).toBe(false);
    });
});

describe('parseRoleTags', () => {
    it('keeps valid roles', () => {
        expect(parseRoleTags(['ENGINEER', 'SCHOLAR'])).toEqual(['ENGINEER', 'SCHOLAR']);
    });

    it('drops values that are not roles', () => {
        expect(parseRoleTags(['ENGINEER', 'WIZARD', 42])).toEqual(['ENGINEER']);
    });

    it('returns undefined for empty, missing or wrongly-typed input', () => {
        expect(parseRoleTags([])).toBeUndefined();
        expect(parseRoleTags(undefined)).toBeUndefined();
        expect(parseRoleTags('ENGINEER')).toBeUndefined();
        expect(parseRoleTags(['NOPE'])).toBeUndefined();
    });
});
