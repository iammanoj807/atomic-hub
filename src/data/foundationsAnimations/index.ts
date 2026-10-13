import type { AnimationSpec } from '../../components/learning/anim/scene';
import { phase0Animations } from './phase0';
import { phase1Animations } from './phase1';
import { phase2AnimationsA } from './phase2';
import { phase2AnimationsB } from './phase2b';
import { phase3Animations } from './phase3';
import { phase4Animations } from './phase4';
import { phase5Animations } from './phase5';
import { phase6Animations } from './phase6';
import { phase7Animations } from './phase7';

// One animation per ML Foundations topic, keyed by topic id. Each is a
// function, so its frames are only worked out when the topic is opened.

export const foundationAnimations: Record<string, () => AnimationSpec> = {
    ...phase0Animations,
    ...phase1Animations,
    ...phase2AnimationsA,
    ...phase2AnimationsB,
    ...phase3Animations,
    ...phase4Animations,
    ...phase5Animations,
    ...phase6Animations,
    ...phase7Animations,
};
