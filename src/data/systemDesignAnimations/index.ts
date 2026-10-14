import type { AnimationRegistry } from '../../components/learning/anim/useTopicAnimation';
import { phase01Animations } from './phase01';
import { phase2Animations } from './phase2';
import { phase34Animations } from './phase34';
import { phase56Animations } from './phase56';
import { phase7Animations } from './phase7';
import { phase89Animations } from './phase89';

// One animation per System Design topic, keyed by topic id. Each follows its
// lesson's own running example.

export const systemDesignAnimations: AnimationRegistry = {
    ...phase01Animations,
    ...phase2Animations,
    ...phase34Animations,
    ...phase56Animations,
    ...phase7Animations,
    ...phase89Animations,
};

/** Topics left without an animation on purpose, and why. */
export const systemDesignNoAnimation: Record<string, string> = {
    'sd5-t8': 'UML class diagrams: the static class diagram is the lesson, and nothing in it changes over time.',
};

/**
 * Words and numbers an animation must never show, because a practice question
 * asks the learner to work them out. A test checks every caption and label.
 */
export const systemDesignForbidden: Record<string, string[]> = {
    'sd0-t1': ['45-minute', '45 min', 'minutes each'],
    'sd0-t2': ['50 million', '2 MB'],
    'sd1-t3': ['stock price', 'nightly report', 'delivery-tracking', 'delivery tracking'],
    'sd2-t2': ['4 services', 'four services', '99.6'],
    'sd2-t3': ['100 clients'],
    'sd2-t4': ['video upload', 'cache cluster'],
    'sd2-t6': ['W = ', 'R = ', 'seat booking', 'profile picture', 'stock level'],
    'sd2-t7': ['50 requests', 'burst of 50'],
    'sd3-t1': ['IoT', 'sensor', 'ledger', 'social graph'],
    'sd3-t3': ['10 numbers'],
    'sd3-t5': ['% 4', 'fifth'],
    'sd3-t6': ['6 keys', 'fourth'],
    'sd4-t3': ['5-node', '5 nodes', 'five nodes'],
    'sd6-t8': ['StockTicker', 'stock ticker', '1%'],
    'sd6-t9': ['£450', '£20,000', 'ATM', '£180'],
    'sd6-t10': ['SoldOut', 'sold out', 'refund'],
    'sd7-t3': ['334', '333'],
    'sd7-t5': ['put(1)', 'put(2)', 'put(3)', 'get(1)'],
    'sd8-t1': ['3,500,000,000', '3.5 billion', "'z'", "'10'"],
    'sd8-t5': ['million writes'],
    'sd8-t6': ['Mbps', 'GB per video'],
    'sd8-t9': ["'tea'", "'ten'", "'tent'", "'to'"],
    'sd9-t4': ['4,000-token', '20 GB'],
};
