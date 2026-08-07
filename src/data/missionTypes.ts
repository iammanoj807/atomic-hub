// ============================================================
// Mission planning — types, constants & helpers
// Role tags, daily habits, and visualization accents.
// ============================================================

// ── Roles ──────────────────────────────────────────────────

export type Role = 'ENGINEER' | 'SON' | 'SCHOLAR' | 'BUILDER' | 'CHARACTER';

/** Same hexes as role icons in `AffirmationVisualization` (Engineer / Son / Scholar / Builder / Character). */
export const ROLE_COLORS: Record<Role, string> = {
    ENGINEER: '#4a90e2',
    SON: '#ff5252',
    SCHOLAR: '#ff9800',
    BUILDER: '#00e676',
    CHARACTER: '#7c4dff',
};

/** Left overlay used in Morning Affirmation & Visualization (video + text panel). */
export const VIZ_LEFT_PANEL_GRADIENT =
    'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)';

export const ROLE_LABELS: Record<Role, string> = {
    ENGINEER: 'Engineer',
    SCHOLAR: 'Scholar',
    BUILDER: 'Builder',
    SON: 'Family',
    CHARACTER: 'Character',
};

export const ROLE_ICONS: Record<Role, string> = {
    ENGINEER: '🧑🏻‍💻',
    SCHOLAR: '🎓',
    BUILDER: '🏗️',
    SON: '❤️',
    CHARACTER: '🛡️',
};

// ── Mission Statement ──────────────────────────────────────

export const MISSION_STATEMENT =
    'My parents sacrificed everything so I could pursue my MSc in AI. Every minute I choose focus over distraction, I honor their sacrifice and build the career and a place in the USA that will support them. This moment matters.\n\nI am doing this not just for myself. I am doing this to give my family peace, pride and a better life. And I want to build that life with integrity, purpose and meaning, not just for salary.';

// ── "Why" Text (Mission → Role mapping) ────────────────────

/** Default role-based why text */
export function getTaskWhyText(role: Role): string {
    switch (role) {
        case 'ENGINEER':
            return 'Build the skills that will open the right doors and give my family peace and pride.';
        case 'SCHOLAR':
            return 'Grow every day. Solve meaningful problems and never stop learning.';
        case 'BUILDER':
            return 'Strengthen the discipline and health I need to sustain that future life.';
        case 'SON':
            return 'Show up for the people who matter. Steady presence beats perfect timing.';
        case 'CHARACTER':
            return 'Live with integrity, purpose, and meaning. Not just for salary.';
        default:
            return 'Move closer to the person in my vision.';
    }
}

/** Custom why-text overrides keyed by lowercase title substring */
const WHY_TEXT_OVERRIDES: { match: string; text: string }[] = [
    {
        match: 'evening reflection',
        text: 'Did what I did today move me closer to the person I am becoming?',
    },
    {
        match: 'light workout',
        text: 'Strengthen the discipline and health I need to sustain that future life.',
    },
    {
        match: 'meditation',
        text: 'Strengthen the discipline and health I need to sustain that future life.',
    },
    {
        match: 'solve dsa',
        text: 'Build the skills that will open the right doors and give my family peace and pride.',
    },
    {
        match: 'langchain',
        text: 'Keep growing as a learner. The man who arrives in Silicon Valley never stopped studying.',
    },
    {
        match: 'springboot',
        text: 'Keep growing as a learner. The man who arrives in Silicon Valley never stopped studying.',
    },
    {
        match: 'spring boot',
        text: 'Keep growing as a learner. The man who arrives in Silicon Valley never stopped studying.',
    },
    {
        match: 'behavioral',
        text: 'Build the skills that will open the right doors and give my family peace and pride.',
    },
    {
        match: 'job reach',
        text: 'Attract the companies that value my talent and open the Silicon Valley door.',
    },
    {
        match: 'linkedin',
        text: 'Attract the companies that value my talent and open the Silicon Valley door.',
    },
];

/** Get the why-text for a task, checking title-specific overrides first */
export function getWhyTextForTask(title: string, roles: Role[]): string {
    const lower = title.toLowerCase();
    for (const override of WHY_TEXT_OVERRIDES) {
        if (lower.includes(override.match)) {
            return override.text;
        }
    }
    // Fall back to the primary role's default why-text
    return getTaskWhyText(roles[0] || 'ENGINEER');
}

// ── Role Auto-Detection ────────────────────────────────────

const ROLE_KEYWORDS: { role: Role; keywords: string[] }[] = [
    {
        role: 'SON',
        keywords: [
            'call family',
            'family',
            'relationship',
            'parents',
            'thank-you',
            'thank you',
            // legacy habit titles still in Firestore
            'brother'
        ],
    },
    {
        role: 'BUILDER',
        keywords: ['workout', 'meditation', 'gym', 'health', 'exercise', 'run ', 'walk', 'push-up', 'stretch', 'light workout'],
    },
    {
        role: 'CHARACTER',
        keywords: [
            'journal', 'gratitude', 'reflection', 'character', 'integrity', 'prayer', 'stoic',
            'job reach', 'linkedin networking',
        ],
    },
    {
        role: 'SCHOLAR',
        keywords: [
            'read', 'book', 'novel', 'pages', 'designing data', 'study', 'learn',
            'behavioral', 'behavior',
        ],
    },
    {
        role: 'ENGINEER',
        keywords: [
            'dsa', 'leetcode', 'neetcode', 'interview',
            'linkedin', 'networking', 'springboot', 'spring boot', 'langchain',
            'coding', 'code', 'system design', 'api', 'backend', 'frontend',
            'react', 'project', 'deploy', 'practice',
        ],
    },
];

/** Explicit multi-role overrides keyed by lowercase title substring */
const MULTI_ROLE_OVERRIDES: { match: string; roles: Role[] }[] = [
    { match: 'langchain', roles: ['ENGINEER', 'SCHOLAR'] },
    { match: 'spring boot', roles: ['ENGINEER', 'SCHOLAR'] },
    { match: 'springboot', roles: ['ENGINEER', 'SCHOLAR'] },
];

/** Returns ALL matching roles for a task (supports multi-role) */
export function getTaskRoles(title: string): Role[] {
    const lower = title.toLowerCase();

    // Check explicit multi-role overrides first
    for (const override of MULTI_ROLE_OVERRIDES) {
        if (lower.includes(override.match)) {
            return override.roles;
        }
    }

    // Fall back to single-role keyword detection
    for (const { role, keywords } of ROLE_KEYWORDS) {
        if (keywords.some((kw) => lower.includes(kw))) {
            return [role];
        }
    }

    return ['ENGINEER'];
}

/** Returns a single primary role (backward-compatible) */
export function getTaskRole(title: string): Role {
    return getTaskRoles(title)[0];
}

/** Returns true if any of the task's roles is SON */
export function isPersonTask(title: string): boolean {
    return getTaskRoles(title).includes('SON');
}

export const ALL_MISSION_ROLES: Role[] = ['ENGINEER', 'SCHOLAR', 'BUILDER', 'SON', 'CHARACTER'];

/** Parse `roleTags` array from Firestore (strings must match `Role`). */
export function parseRoleTags(raw: unknown): Role[] | undefined {
    if (!Array.isArray(raw) || raw.length === 0) return undefined;
    const allowed = new Set<string>(ALL_MISSION_ROLES);
    const out: Role[] = [];
    for (const x of raw) {
        if (typeof x === 'string' && allowed.has(x as Role)) out.push(x as Role);
    }
    return out.length > 0 ? out : undefined;
}

/** Uses Firestore `roleTags` when set; otherwise keyword detection from title. */
export function getHabitRoles(habit: { title: string; roleTags?: Role[] }): Role[] {
    if (habit.roleTags && habit.roleTags.length > 0) return habit.roleTags;
    return getTaskRoles(habit.title);
}

export function isPersonHabit(habit: { title: string; roleTags?: Role[] }): boolean {
    return getHabitRoles(habit).includes('SON');
}


// ── Mission Habits (auto-seeded if missing) ────────────────

export const MISSION_HABITS: { title: string }[] = [];
