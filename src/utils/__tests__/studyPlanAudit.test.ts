import { it, expect } from 'vitest';
import {
    planWeeks, planStages, projects, readingLadder, PLAN_WEEKS,
    FULL_WEEK_TARGET_HOURS, LIGHT_WEEK_TARGET_HOURS, LATEST_END_TIME, WEEKDAYS,
} from '../../data/studyPlan';
import { getWeekResources } from '../../data/studyResources';
import { getRoutineForWeek, minutesInto, routineWeeklyHours } from '../studySchedule';

const problems: string[] = [];
const flag = (s: string) => problems.push(s);

/**
 * One test that walks the whole plan and refuses to let it drift.
 *
 * The plan is generated from several tables that have to agree with each
 * other, and every inconsistency found so far was silent: resources that
 * stopped at week 26, an evening reading item about LSTMs in week 4, a build
 * block scheduled on top of the applied ML course. None of them threw. This
 * is the net.
 */
it('the plan is internally consistent', () => {
    // ---- 1. every week complete ----
    for (const w of planWeeks) {
        for (const f of ['theory', 'deepWork', 'aiEng', 'dsa', 'reading', 'part', 'stageName'] as const) {
            if (!String(w[f] ?? '').trim()) flag(`wk${w.week}: empty ${f}`);
        }
        const r = getWeekResources(w.week);
        for (const k of ['watch', 'read', 'build'] as const) {
            if (!r.some(x => x.kind === k)) flag(`wk${w.week}: no ${k} resource`);
        }
    }

    // ---- 2. gates exactly on stage-end weeks ----
    const gateWeeks = planWeeks.filter(w => w.gate).map(w => w.week);
    const expected = planStages.map(s => s.to);
    if (JSON.stringify(gateWeeks) !== JSON.stringify(expected)) {
        flag(`gate weeks ${gateWeeks} != stage ends ${expected}`);
    }

    // ---- 3. hours ----
    for (const w of planWeeks) {
        const want = w.phaseKey === 'consolidation' ? LIGHT_WEEK_TARGET_HOURS : FULL_WEEK_TARGET_HOURS;
        if (w.targetHours !== want) flag(`wk${w.week}: targetHours ${w.targetHours} != ${want}`);
    }
    if (Math.abs(routineWeeklyHours() - FULL_WEEK_TARGET_HOURS) > 0.5) {
        flag(`routine ${routineWeeklyHours().toFixed(2)}h vs target ${FULL_WEEK_TARGET_HOURS}`);
    }

    // ---- 4. nothing ends after LATEST_END_TIME; no overlaps within a day ----
    for (const dwd of WEEKDAYS) {
        const week = getRoutineForWeek(dwd);
        for (const day of WEEKDAYS) {
            const slots = week[day];
            for (const s of slots) {
                if (minutesInto(s.end) > minutesInto(LATEST_END_TIME)) {
                    flag(`dwd=${dwd} ${day}: ${s.kind} ends ${s.end} after ${LATEST_END_TIME}`);
                }
                const declared = (minutesInto(s.end) - minutesInto(s.start)) / 60;
                if (Math.abs(declared - s.hours) > 0.02) {
                    flag(`dwd=${dwd} ${day}: ${s.kind} ${s.start}-${s.end} is ${declared.toFixed(2)}h but declares ${s.hours}`);
                }
            }
            for (let i = 1; i < slots.length; i++) {
                if (minutesInto(slots[i].start) < minutesInto(slots[i - 1].end)) {
                    flag(`dwd=${dwd} ${day}: ${slots[i - 1].kind} overlaps ${slots[i].kind}`);
                }
            }
        }
    }

    // ---- 5. artifacts land on a week that mentions them ----
    for (const p of projects) {
        const wk = planWeeks[p.byWeek - 1];
        if (!wk) { flag(`artifact ${p.number}: byWeek ${p.byWeek} out of range`); continue; }
        const text = `${wk.deepWork} ${wk.milestone ?? ''}`.toUpperCase();
        if (!text.includes(`ARTIFACT ${p.number}`)) {
            flag(`artifact ${p.number} (${p.id}) due wk${p.byWeek} but that week never names it`);
        }
    }
    const dueOrder = projects.map(p => p.byWeek);
    if (JSON.stringify(dueOrder) !== JSON.stringify([...dueOrder].sort((a, b) => a - b))) {
        flag(`artifact due weeks not ascending: ${dueOrder}`);
    }

    // ---- 6. reading ladder covers 1..52 with no gap or overlap ----
    const covered = new Set<number>();
    for (const lvl of readingLadder) {
        const [from, to] = lvl.weeks.split('-').map(Number);
        for (let w = from; w <= to; w++) {
            if (covered.has(w)) flag(`reading ladder: week ${w} covered twice`);
            covered.add(w);
        }
    }
    for (let w = 1; w <= PLAN_WEEKS; w++) if (!covered.has(w)) flag(`reading ladder: week ${w} uncovered`);

    // ---- 7. ladder relevance: does the evening item match the morning? ----
    const TOPIC: Record<string, string[]> = {
        deisenroth: ['linear algebra', 'calculus', 'vector', 'matrix', 'svd', 'regression', 'deisenroth'],
        murphy: ['probability', 'bayes', 'mle', 'decision', 'murphy', 'distribution'],
        momentum: ['optimis', 'sgd', 'adam', 'momentum', 'gradient descent', 'convex'],
        olah: ['backprop', 'autodiff', 'lstm', 'rnn', 'sequence', 'computational graph', 'micrograd'],
        ruder: ['optimis', 'sgd', 'adam', 'gradient descent'],
    };
    // Consolidation weeks are revision by design, so anything is fair there.
    for (const w of planWeeks.filter(x => x.week <= 21 && x.phaseKey !== 'consolidation')) {
        const item = w.reading.toLowerCase();
        const key = Object.keys(TOPIC).find(k => item.includes(k));
        if (!key) continue;
        const hay = `${w.theory} ${w.deepWork} ${w.stageName}`.toLowerCase();
        if (!TOPIC[key].some(t => hay.includes(t))) {
            flag(`wk${w.week}: evening reads "${w.reading.slice(0, 42)}" but the week is "${w.stageName}"`);
        }
    }

    // ---- 8. stale strings ----
    for (const w of planWeeks) {
        const blob = `${w.theory} ${w.deepWork} ${w.aiEng} ${w.dsa} ${w.reading}`;
        for (const bad of ['TOEFL', '06:00', '08:30', '20:45', 'six months', '26 weeks']) {
            if (blob.includes(bad)) flag(`wk${w.week}: stale string "${bad}"`);
        }
    }

    // ---- 9. resource urls well formed ----
    for (const w of planWeeks) {
        for (const r of getWeekResources(w.week)) {
            if (r.url && !/^https:\/\/[^\s]+$/.test(r.url)) flag(`wk${w.week}: bad url ${r.url}`);
        }
    }

    expect(problems, `\n - ${problems.join('\n - ')}\n`).toEqual([]);
});
