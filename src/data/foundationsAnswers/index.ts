import type { TopicAnswers } from '../foundations';
import { phase0Answers } from './phase0';
import { phase1Answers } from './phase1';
import { phase2Answers } from './phase2';
import { phase3Answers } from './phase3';
import { phase4Answers } from './phase4';
import { phase5Answers } from './phase5';
import { phase6Answers } from './phase6';
import { phase7Answers } from './phase7';

// One good answer for every practice exercise in ML Foundations, keyed by
// topic id. Shown only when asked for, so each exercise is tried first.
//
// Imported with the page, not loaded later: the service worker precaches the
// FoundationsPage chunk only, so this is what keeps the answers offline.
//
// Every code answer has been run. Numbers in comments are what it printed.

export const foundationAnswers: Record<string, TopicAnswers> = {
    ...phase0Answers,
    ...phase1Answers,
    ...phase2Answers,
    ...phase3Answers,
    ...phase4Answers,
    ...phase5Answers,
    ...phase6Answers,
    ...phase7Answers,
};
