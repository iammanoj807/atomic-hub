import { describe, it, expect } from 'vitest';
import {
    getReadingByWeek,
    getReadingStreak,
    getReadingCountByLevel,
    getGateStatus,
    getFailedGates,
    getGateAttemptCount,
    getArtifactProgress,
    isArtifactComplete,
    getPublishedCount,
    getArtifactStepsDone,
} from '../studyProgress';
import type {
    ReadingEntry,
    GateAttempt,
    ArtifactProgressDoc,
} from '../../services/firebaseService';
import { projects } from '../../data/studyPlan';

const reading = (date: string, over: Partial<ReadingEntry> = {}): ReadingEntry => ({
    id: date,
    date,
    weekNumber: 1,
    item: 'Deisenroth, Mathematics for ML - one section daily',
    level: 'blogs',
    notes: '',
    whatWouldIDoNext: '',
    minutes: 20,
    ...over,
});

const attempt = (stage: number, passed: boolean, date = '2026-09-20'): GateAttempt => ({
    id: `stage-${stage}-${date}`,
    stage,
    date,
    passed,
    notes: '',
});

describe('getReadingByWeek', () => {
    it('keeps only the week asked for', () => {
        const entries = [
            reading('2026-08-31'),
            reading('2026-09-07', { weekNumber: 2 }),
            reading('2026-09-01'),
        ];
        expect(getReadingByWeek(entries, 1).map(e => e.date))
            .toEqual(['2026-09-01', '2026-08-31']);
    });

    it('is empty for a week with nothing logged', () => {
        expect(getReadingByWeek([reading('2026-08-31')], 9)).toEqual([]);
    });
});

describe('getReadingStreak', () => {
    it('counts consecutive days back from today', () => {
        const entries = [reading('2026-09-02'), reading('2026-09-01'), reading('2026-08-31')];
        expect(getReadingStreak(entries, '2026-09-02')).toBe(3);
    });

    it('does not break the streak just because today is not logged yet', () => {
        // The day is not over. Resetting to zero every midnight would punish
        // someone who reads in the evening, which is when the slot actually is.
        const entries = [reading('2026-09-01'), reading('2026-08-31')];
        expect(getReadingStreak(entries, '2026-09-02')).toBe(2);
    });

    it('stops at the first missed day', () => {
        const entries = [reading('2026-09-02'), reading('2026-08-31')];
        expect(getReadingStreak(entries, '2026-09-02')).toBe(1);
    });

    it('is zero when nothing has been read', () => {
        expect(getReadingStreak([], '2026-09-02')).toBe(0);
    });
});

describe('getReadingCountByLevel', () => {
    it('counts each rung and reports the empty ones as zero', () => {
        const entries = [
            reading('2026-08-31'),
            reading('2026-09-01'),
            reading('2026-11-02', { level: 'classics' }),
        ];
        expect(getReadingCountByLevel(entries)).toEqual({
            blogs: 2,
            classics: 1,
            modern: 0,
            frontier: 0,
            subfield: 0,
        });
    });

    it('ignores a level that is not on the ladder', () => {
        expect(getReadingCountByLevel([reading('2026-08-31', { level: 'nonsense' })]).blogs).toBe(0);
    });
});

describe('getGateStatus', () => {
    it('is unattempted until the gate has been sat', () => {
        expect(getGateStatus([], 0)).toBe('unattempted');
    });

    it('is failed once sat and not passed', () => {
        expect(getGateStatus([attempt(0, false)], 0)).toBe('failed');
    });

    it('is passed on a single pass', () => {
        expect(getGateStatus([attempt(0, false), attempt(0, true)], 0)).toBe('passed');
    });

    it('cannot be un-passed by a later failure', () => {
        // You sat it and you passed it. A later attempt is practice.
        const attempts = [attempt(0, true, '2026-09-20'), attempt(0, false, '2026-10-04')];
        expect(getGateStatus(attempts, 0)).toBe('passed');
    });

    it('keeps stages apart', () => {
        expect(getGateStatus([attempt(0, true)], 1)).toBe('unattempted');
    });
});

describe('getFailedGates', () => {
    it('lists the stages to repeat, lowest first', () => {
        const attempts = [attempt(4, false), attempt(0, true), attempt(1, false)];
        expect(getFailedGates(attempts)).toEqual([1, 4]);
    });

    it('drops a stage once it is passed', () => {
        const attempts = [attempt(1, false, '2026-09-20'), attempt(1, true, '2026-10-04')];
        expect(getFailedGates(attempts)).toEqual([]);
    });
});

describe('getGateAttemptCount', () => {
    it('counts every sitting, pass or fail', () => {
        const attempts = [attempt(2, false, '2026-10-04'), attempt(2, true, '2026-10-11')];
        expect(getGateAttemptCount(attempts, 2)).toBe(2);
        expect(getGateAttemptCount(attempts, 3)).toBe(0);
    });
});

describe('getArtifactProgress', () => {
    it('defaults every step to not done, so the UI never null-checks', () => {
        expect(getArtifactProgress({}, 'autograd')).toEqual({
            id: 'autograd',
            projectId: 'autograd',
            build: false,
            write: false,
            publish: false,
            post: false,
        });
    });
});

const artifact = (over: Partial<ArtifactProgressDoc> = {}): ArtifactProgressDoc => ({
    id: 'autograd',
    projectId: 'autograd',
    build: true,
    write: true,
    publish: true,
    post: true,
    ...over,
});

describe('isArtifactComplete', () => {
    it('needs all four steps', () => {
        expect(isArtifactComplete({ autograd: artifact() }, 'autograd')).toBe(true);
    });

    it('does not count a built but unpublished artifact', () => {
        // BUILD is half the work. This is the whole reason the other three exist.
        const built = artifact({ write: false, publish: false, post: false });
        expect(isArtifactComplete({ autograd: built }, 'autograd')).toBe(false);
    });

    it('is false for an artifact nobody has started', () => {
        expect(isArtifactComplete({}, 'autograd')).toBe(false);
    });
});

describe('getPublishedCount', () => {
    it('counts only artifacts that got all the way through', () => {
        const progress = {
            autograd: artifact(),
            gpt: artifact({ id: 'gpt', projectId: 'gpt', post: false }),
        };
        expect(getPublishedCount(progress)).toBe(1);
    });

    it('is zero on a fresh account', () => {
        expect(getPublishedCount({})).toBe(0);
    });

    it('never exceeds the nine artifacts in the plan', () => {
        const all = Object.fromEntries(
            projects.map(p => [p.id, artifact({ id: p.id, projectId: p.id })])
        );
        expect(getPublishedCount(all)).toBe(projects.length);
        expect(projects).toHaveLength(9);
    });
});

describe('getArtifactStepsDone', () => {
    it('counts steps across every artifact, not whole artifacts', () => {
        const progress = {
            autograd: artifact({ post: false }),
            gpt: artifact({ id: 'gpt', projectId: 'gpt', write: false, publish: false, post: false }),
        };
        expect(getArtifactStepsDone(progress)).toBe(4);
    });

    it('tops out at four times the nine artifacts', () => {
        const all = Object.fromEntries(
            projects.map(p => [p.id, artifact({ id: p.id, projectId: p.id })])
        );
        expect(getArtifactStepsDone(all)).toBe(projects.length * 4);
    });
});
