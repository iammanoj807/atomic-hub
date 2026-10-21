// ML Foundations — the self-paced roadmap for AI and ML engineering, from scratch.
//
// Eight phases, taken in order. Every topic is a full lesson, written to be
// enough on its own:
//   - a one-line definition, the problem it solves, the idea, how it works step
//     by step around one running example, an analogy and where it breaks, a
//     worked example (with code that has been run), must-know points and common
//     mistakes,
//   - a Mermaid picture, plus an animation (foundationsAnimations/),
//   - quick questions WITH answers, to check you understood,
//   - one practice exercise for each of the four checks, each with one good
//     answer (foundationsAnswers/) that stays hidden until asked for,
//   - free resources, all optional. A resource marked `recommended` is the one
//     extra worth your time, and says why.
//
// Each phase lives in foundationsCourse/phaseN.ts. Everything here is fixed content. Ticked checks and finished mini-builds live
// in Firestore under study_progress/foundations (see firebaseService.ts).

import { foundationPhase0 } from './foundationsCourse/phase0';
import { foundationPhase1 } from './foundationsCourse/phase1';
import { foundationPhase2 } from './foundationsCourse/phase2';
import { foundationPhase3 } from './foundationsCourse/phase3';
import { foundationPhase4 } from './foundationsCourse/phase4';
import { foundationPhase5 } from './foundationsCourse/phase5';
import { foundationPhase6 } from './foundationsCourse/phase6';
import { foundationPhase7 } from './foundationsCourse/phase7';

export type CheckKey = 'explain' | 'derive' | 'build' | 'break';

/** The order the checks are shown and ticked in. */
export const CHECK_KEYS: CheckKey[] = ['explain', 'derive', 'build', 'break'];

export const CHECK_LABELS: Record<CheckKey, string> = {
    explain: 'Explain',
    derive: 'Derive',
    build: 'Build',
    break: 'Break',
};

export const CHECK_MEANINGS: Record<CheckKey, string> = {
    explain: 'Say it in plain words, with no notes.',
    derive: 'Write the maths, or the steps, from memory.',
    build: 'Code it from scratch in NumPy, with no ML library.',
    break: 'Show when it fails, and why.',
};

/** One worked example of all four checks, shown once at the top of the page. */
export const CHECK_EXAMPLES: Record<CheckKey, string> = {
    explain: 'Gradient descent changes the weights a little at a time, in the direction that makes the loss smaller.',
    derive: 'Write w ← w − η·∂L/∂w, then derive ∂L/∂w for mean squared error on paper.',
    build: 'Fit a line to data with your own gradient descent loop.',
    break: 'Set the learning rate too high and show the loss exploding.',
};

export const CONFIDENT_RULE =
    'A topic is finished when you pass all four checks, not when you finish reading. ' +
    'Be strict: if you needed your notes, it is not ticked yet.';

export interface LoopStep {
    step: 'UNDERSTAND' | 'GO FURTHER' | 'PRACTISE' | 'PROVE';
    detail: string;
}

/** The same four steps for every topic, in this order. */
export const topicLoop: LoopStep[] = [
    { step: 'UNDERSTAND', detail: 'The lesson: play the animation, then read the idea, the steps, the worked example and the common mistakes. It is written to be enough on its own.' },
    { step: 'GO FURTHER', detail: 'Optional. Free videos, visual explainers and readings for a second explanation. If one is marked "Worth it", that is the one to pick, and it says why.' },
    { step: 'PRACTISE', detail: 'The four exercises. Try each one yourself first, then tap "Show answer" to check yours against one good answer.' },
    { step: 'PROVE', detail: 'Tick each check only when you can do it without notes. Re-test old topics every two weeks, and untick any you fail.' },
];

export const foundationRules: string[] = [
    'Go in order. Each phase assumes the ones before it.',
    'The lesson is the main resource. Extras are optional: if you want one, pick the one marked "Worth it". Collecting resources feels like progress, but it is not.',
    'Start building before you feel ready. Getting stuck while coding is where real learning happens.',
    'Every two weeks, test yourself on old topics. If you fail a check, untick it. An honest tracker is worth more than a full one.',
    'Python, NumPy and PyTorch only. If a resource uses scikit-learn or TensorFlow in its exercises, do the exercise in NumPy or PyTorch instead.',
    'Papers are optional for now. They are marked so you can come back to them once the foundations are solid.',
];

/** `play` is an interactive visual explainer: something to drag, scrub or click. */
export type TopicResourceKind = 'watch' | 'play' | 'read' | 'code' | 'paper';

export const RESOURCE_KIND_ORDER: TopicResourceKind[] = ['watch', 'play', 'read', 'code', 'paper'];

export const RESOURCE_KIND_LABELS: Record<TopicResourceKind, string> = {
    watch: 'WATCH',
    play: 'INTERACTIVE',
    read: 'READ',
    code: 'CODE',
    paper: 'PAPER · OPTIONAL',
};

export interface TopicResource {
    kind: TopicResourceKind;
    /** The exact title, so it stays findable even if a link moves. */
    title: string;
    source: string;
    /** A direct link, or a search link where the exact page is likely to move. */
    url?: string;
    /**
     * Set only when this extra really adds something the lesson can't (usually
     * moving pictures): why it is worth the time. Every resource is optional.
     */
    recommended?: string;
}

export interface FoundationResource {
    title: string;
    /** Missing for paid books with no single canonical page. */
    url?: string;
    kind: string;
    free?: boolean;
    paid?: boolean;
    why: string;
}

export interface TopicNote {
    idea: string;
    analogy: string;
    /** Where the analogy stops being true — the part that stops you learning it wrong. */
    breaks: string;
    example?: string;
    code?: string;
    codeLanguage?: 'python' | 'bash';
}

export type TopicPractice = Record<CheckKey, string>;

/** One good answer to a practice exercise, kept hidden until you have tried it yourself. */
export interface PracticeAnswer {
    /** The answer in plain words. A blank line starts a new paragraph. */
    answer: string;
    /** Code that has been run, when the answer is a program or a picture. */
    code?: string;
    codeLanguage?: 'python' | 'bash' | 'text';
}

export type TopicAnswers = Record<CheckKey, PracticeAnswer>;

/** A picture of the idea, in Mermaid syntax, and a sentence on how to read it. */
export interface TopicDiagram {
    code: string;
    caption: string;
}

/** A question to check you understood, with a short answer to compare against. */
export interface TopicFollowUp {
    q: string;
    a: string;
}

export interface FoundationTopic {
    /** Stable id, used as the Firestore key. Never renumber: ids need not match display order. */
    id: string;
    name: string;
    /** One sentence: what it is. */
    definition: string;
    /** Why it exists: the problem it solves. */
    problem: string;
    note: TopicNote;
    /** How it works, step by step, around one running example. */
    howItWorks: string[];
    /** The must-know facts. Don't skip these. */
    keyPoints: string[];
    /** Common mistakes and misunderstandings to avoid. */
    mistakes: string[];
    /** Questions to check you understood, with answers (hidden until asked for). */
    followUps: TopicFollowUp[];
    diagram: TopicDiagram;
    resources: TopicResource[];
    practice: TopicPractice;
}

export interface MiniBuild {
    id: string;
    text: string;
}

export interface FoundationPhase {
    id: string;
    number: number;
    short: string;
    title: string;
    accent: string;
    goal: string;
    bigPicture: string;
    /** The phase's backbone resources. Each topic also lists its own. */
    main: FoundationResource[];
    deeper: FoundationResource[];
    topics: FoundationTopic[];
    builds: MiniBuild[];
    /** Interview-style questions, with short answers to compare yours against. Answer out loud first. */
    ready: TopicFollowUp[];
}

export const foundationPhases: FoundationPhase[] = [
    foundationPhase0,
    foundationPhase1,
    foundationPhase2,
    foundationPhase3,
    foundationPhase4,
    foundationPhase5,
    foundationPhase6,
    foundationPhase7,
];

export const allFoundationTopics: FoundationTopic[] = foundationPhases.flatMap(phase => phase.topics);

export const allMiniBuilds: MiniBuild[] = foundationPhases.flatMap(phase => phase.builds);
