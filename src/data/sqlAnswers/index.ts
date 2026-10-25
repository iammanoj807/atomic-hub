import type { SqlTopicAnswers } from '../sql';
import { sqlPhase0Answers } from './phase0';
import { sqlPhase1Answers } from './phase1';
import { sqlPhase2Answers } from './phase2';
import { sqlPhase3Answers } from './phase3';
import { sqlPhase4Answers } from './phase4';
import { sqlPhase5Answers } from './phase5';
import { sqlPhase6Answers } from './phase6';
import { sqlPhase7Answers } from './phase7';
import { sqlPhase8Answers } from './phase8';

// One good answer for every practice exercise in the SQL course, keyed by
// topic id. Shown only when asked for, so each exercise is tried first.
//
// Loaded as its own chunk the first time a topic is opened (SqlPage is in the
// main bundle). Every query here is run by a test (sql.test.ts), which checks
// it returns exactly the rows shown.

export const sqlAnswers: Record<string, SqlTopicAnswers> = {
    ...sqlPhase0Answers,
    ...sqlPhase1Answers,
    ...sqlPhase2Answers,
    ...sqlPhase3Answers,
    ...sqlPhase4Answers,
    ...sqlPhase5Answers,
    ...sqlPhase6Answers,
    ...sqlPhase7Answers,
    ...sqlPhase8Answers,
};
