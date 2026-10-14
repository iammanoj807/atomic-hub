import type { AnimationRegistry } from '../../components/learning/anim/useTopicAnimation';
import type { ResultRows } from './kit';
import { phase01Animations, phase01Checks } from './phase01';
import { phase23Animations, phase23Checks } from './phase23';
import { phase45Animations, phase45Checks } from './phase45';
import { phase678Animations, phase678Checks } from './phase678';

// One animation per SQL lesson, keyed by topic id. Every one is drawn from the
// practice database, and `sqlAnimationChecks` lets a test compare the rows each
// animation ends on with its lesson's worked example.

export const sqlAnimations: AnimationRegistry = {
    ...phase01Animations,
    ...phase23Animations,
    ...phase45Animations,
    ...phase678Animations,
};

export const sqlAnimationChecks: Record<string, () => { example: number; rows: ResultRows }[]> = {
    ...phase01Checks,
    ...phase23Checks,
    ...phase45Checks,
    ...phase678Checks,
};

/** Topics left without an animation on purpose, and why. */
export const sqlNoAnimation: Record<string, string> = {
    'sql8-t2': 'Quick-fire theory: short spoken answers, with nothing that moves.',
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`sql8-p${i + 1}`, 'Interview problem: an animation would give away the hidden solution.'])),
};
