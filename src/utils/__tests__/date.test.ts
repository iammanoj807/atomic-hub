import { describe, it, expect, afterEach, vi } from 'vitest';
import { getLondonDateString } from '../date';

describe('getLondonDateString', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats as YYYY-MM-DD', () => {
        expect(getLondonDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('uses the London day, not the UTC day, during British Summer Time', () => {
        // 23:30 UTC on 6 August is already 00:30 on the 7th in London.
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-06T23:30:00Z'));

        expect(getLondonDateString()).toBe('2026-08-07');
    });

    it('matches UTC in winter, when London is on GMT', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-15T23:30:00Z'));

        expect(getLondonDateString()).toBe('2026-01-15');
    });

    it('is stable either side of midnight UTC in winter', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-16T00:30:00Z'));

        expect(getLondonDateString()).toBe('2026-01-16');
    });
});
