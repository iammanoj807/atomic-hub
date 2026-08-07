// Daily interview tips.
//
// The old card told you to answer everything in Situation / Task / Action /
// Result. That is actively wrong for strengths-based interviews — which is
// what Aviva and a lot of UK employers use — so the first tip corrects it.

export interface InterviewTip {
    heading: string;
    body: string;
}

export const INTERVIEW_TIPS: InterviewTip[] = [
    {
        heading: 'STRENGTHS QUESTIONS ARE NOT STAR',
        body: 'Strengths-based questions — "what energises you", "what do you pick up fastest" — are about self-awareness, not evidence. Answer them as natural paragraphs, the way a person talks. A case-study structure makes a strengths answer sound rehearsed and evasive.',
    },
    {
        heading: 'NEVER SAY THE WORDS OUT LOUD',
        body: 'Even in a competency answer, never say "situation", "task", "action", "result". Use the structure to organise your thinking beforehand, then tell it as a story. Narrating the framework tells the interviewer you are reciting rather than remembering.',
    },
    {
        heading: 'NUMBERS MAKE YOU MEMORABLE',
        body: '40%. 73 FPS. 207 images. 8 seconds to under 2. Three days. Numbers are what survive the interviewer\'s afternoon and get repeated in the debrief. Say them out loud, and say them precisely — approximations sound like you were not close to the work.',
    },
    {
        heading: 'ANSWER THE QUESTION FIRST',
        body: 'Put the actual answer in your first sentence, then expand. Do not warm up for twenty seconds of context first. If they asked what you are proudest of, the first words should name the thing — the story goes after it, not before.',
    },
    {
        heading: 'STOP WHEN YOU ARE DONE',
        body: 'Trailing off — "so yeah, that\'s about it" — undoes a good answer. End on the lesson, then be quiet. Silence feels much longer to you than it does to them, and letting it sit reads as confidence.',
    },
    {
        heading: 'PICK THE CLOSEST STORY, THEN BEND IT',
        body: 'An unexpected question is not a request for a new story. Pick whichever of your six core stories is closest, change the opening line to match what they asked, and change the closing lesson to answer their question rather than the one you rehearsed.',
    },
    {
        heading: 'NEVER THE SAME STORY TWICE',
        body: 'Once a story has been used in an interview, it is spent. If Automated Testing came out for collaboration, disagreement gets the hardcode-shortcut backup. Decide in the moment, based on which question arrives first.',
    },
    {
        heading: 'YOU DO NOT HAVE TO KNOW',
        body: '"I have not worked with that directly, but here is how I would approach it" beats bluffing every time. Interviewers are far better at spotting invention than you expect, and reasoning out loud is often the thing they were actually testing.',
    },
    {
        heading: 'A PAUSE COSTS YOU NOTHING',
        body: '"That is a good question — let me think for a second." Five seconds feels like an hour to you and like nothing to them. A considered answer after a pause is worth more than a fast answer that wanders.',
    },
    {
        heading: 'NERVES ARE A REPS PROBLEM',
        body: 'Blanking happens when remembering what to say and managing being watched compete for the same working memory. The fix is not confidence, it is reps — say the answers out loud until recalling them costs nothing, which frees your whole brain to talk to the person.',
    },
];

/**
 * One tip per day, rotating. Derived from the date so it is stable all day
 * rather than changing on every render.
 */
export const getTipForDate = (date: string): InterviewTip => {
    const seed = date.split('-').reduce((total, part) => total + Number(part), 0);
    return INTERVIEW_TIPS[seed % INTERVIEW_TIPS.length];
};
