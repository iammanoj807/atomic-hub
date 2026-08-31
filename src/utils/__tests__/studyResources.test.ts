import { describe, it, expect } from 'vitest';
import { weekResources, getWeekResources } from '../../data/studyResources';
import { PLAN_WEEKS, planWeeks } from '../../data/studyPlan';
import { resolveSlotFocus } from '../studyToday';

describe('week resources cover the whole plan', () => {
    it('has an entry for every week', () => {
        // This silently returned [] for weeks 27-52 once, and the mornings
        // rendered blank for half the year without anything failing.
        const missing = planWeeks
            .map(week => week.week)
            .filter(week => getWeekResources(week).length === 0);
        expect(missing).toEqual([]);
        expect(Object.keys(weekResources)).toHaveLength(PLAN_WEEKS);
    });

    it('gives every week a watch, a read and a build', () => {
        // Monday and Tuesday mornings resolve to 'watch' and 'read'; a week
        // missing either is a blank card rather than an error.
        for (const kind of ['watch', 'read', 'build'] as const) {
            const missing = planWeeks
                .map(week => week.week)
                .filter(week => !getWeekResources(week).some(r => r.kind === kind));
            expect(missing, `weeks with no ${kind}`).toEqual([]);
        }
    });

    it('gives every resource a title and a source, so a dead link is survivable', () => {
        for (const week of planWeeks) {
            for (const resource of getWeekResources(week.week)) {
                expect(resource.title.trim(), `week ${week.week}`).not.toBe('');
                expect(resource.source.trim(), `week ${week.week}`).not.toBe('');
            }
        }
    });

    it('returns an empty list outside the plan rather than throwing', () => {
        expect(getWeekResources(0)).toEqual([]);
        expect(getWeekResources(PLAN_WEEKS + 1)).toEqual([]);
    });
});

describe('the morning slots find their material', () => {
    it('resolves a resource for theory in every week of the plan', () => {
        const blank = planWeeks.filter(
            week => resolveSlotFocus('Mon', 'theory', week).resource === undefined
        );
        expect(blank.map(w => w.week)).toEqual([]);
    });
});
