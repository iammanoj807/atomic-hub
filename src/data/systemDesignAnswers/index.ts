import type { SDTopicAnswers } from '../systemDesign';
import { sdPhase0Answers } from './phase0';
import { sdPhase1Answers } from './phase1';
import { sdPhase2Answers } from './phase2';
import { sdPhase3Answers } from './phase3';
import { sdPhase4Answers } from './phase4';
import { sdPhase5Answers } from './phase5';
import { sdPhase6Answers } from './phase6';
import { sdPhase7Answers } from './phase7';
import { sdPhase8Answers } from './phase8';
import { sdPhase9Answers } from './phase9';

// One good answer for every practice exercise in System Design, keyed by
// topic id. Shown only when asked for, so each exercise is tried first.
//
// Loaded as its own chunk the first time a topic is opened (SystemDesignPage
// is in the main bundle). Every Python answer has been run, and the numbers in
// its comments are what it printed. The SQL answers are PostgreSQL and
// Cassandra schema sketches, so they aren't run here.

export const systemDesignAnswers: Record<string, SDTopicAnswers> = {
    ...sdPhase0Answers,
    ...sdPhase1Answers,
    ...sdPhase2Answers,
    ...sdPhase3Answers,
    ...sdPhase4Answers,
    ...sdPhase5Answers,
    ...sdPhase6Answers,
    ...sdPhase7Answers,
    ...sdPhase8Answers,
    ...sdPhase9Answers,
};
