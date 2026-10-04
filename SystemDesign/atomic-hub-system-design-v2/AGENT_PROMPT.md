# Task: add a "System Design" tab to Atomic Hub

> **If you already built this page from an earlier version of these instructions**, don't start over:
> replace `src/data/systemDesign.ts` and its test with the new ones, and update the page so it shows the
> new fields described below (`problem`, `howItWorks`, `evolution`, `mistakes`) and the new Step 2 wording.

You are working in my Atomic Hub app (React 19, TypeScript, Vite, MUI v7, Firebase Firestore).
The ML Foundations page (`src/components/FoundationsPage.tsx`) already exists and works well.
Build a new **System Design** page in the same style, reusing its patterns.

## Files already provided — do not edit their content

- `src/data/systemDesign.ts` — all the content: 10 phases, 71 topics, typed (`SDPhase`, `SDTopic`,
  `SDConcept`, `SDDesign`, check keys, priorities, resources, study order). Read its types first.
  The written notes are the main learning material and are meant to be enough on their own.
  Every resource is free and optional.
- `src/utils/__tests__/systemDesign.test.ts` — content integrity tests. They must keep passing.

Topics come in two kinds:
- `kind: 'concept'` — definition, problem, idea, howItWorks (steps), analogy, breaks, example, keyPoints,
  mistakes, optional tradeOffs and code.
- `kind: 'design'` (`designType` is `'hld' | 'lld' | 'ml'`) — definition, problem, functional and non-functional
  requirements, optional estimates, api, dataModel, classes, patterns, then evolution (steps), design (steps),
  deepDives, mistakes and optional code.

Both kinds have: priority (`'must' | 'should' | 'bonus'`), interviewAnswer, followUps (`{ q, a }`),
practice (one exercise per check) and resources (all free).

The four checks are different from Foundations: **Explain, Draw, Apply, Trade-offs**
(`SD_CHECK_KEYS`, `SD_CHECK_LABELS`, `SD_CHECK_MEANINGS`).

## 1. Saving progress (Firestore)

In `src/services/firebaseService.ts`, add functions that mirror the Foundations ones:
- Document `study_progress/system_design` (the `study_progress` rules already allow it; don't change `firestore.rules`).
- Type `SystemDesignProgress { checks: Record<string, Partial<Record<SDCheckKey, boolean>>> }`.
- `subscribeToSystemDesign(callback)` and `saveSystemDesignCheck(topicId, check, done)`,
  writing with `setDoc(..., { merge: true })` and a nested object, exactly like `saveFoundationCheck`.

Add `src/hooks/useSystemDesign.ts` (like `useFoundations`) and `src/utils/systemDesignProgress.ts` with
`checksPassed`, `isTopicConfident`, `confidentCount`, `nextTopic` (first topic in order that isn't confident)
and `topicsInProgress`. Add unit tests for these, like the Foundations progress tests.

## 2. Share the building blocks — without changing ML Foundations

Move the reusable pieces out of `FoundationsPage.tsx` into a shared module (for example `src/components/learning/`):
the text-size context, control and page theme, `SectionLabel`, `Tag`, `CheckDots`, `StepBar`, `ReferencePanel`
and the resource row. Make them generic where needed (check keys, labels, step names passed in as props).

- ML Foundations must look and behave exactly as before. Its tests must still pass.
- Use one shared text-size preference for both pages. On first load, fall back to the existing
  `foundations-text-size` value so my current choice is kept.

## 3. The page

New file `src/components/SystemDesignPage.tsx`, route `/system-design` in `App.tsx`, and a top-level sidebar
item **System Design** directly under **ML Foundations** (use `ArchitectureRoundedIcon`, styled like the
ML Foundations item).

### Top of the page (in this order)
1. Header like Foundations: eyebrow `SYSTEM DESIGN`, line `Self-paced · 10 phases · 71 topics`,
   title **Design it, explain it, defend it**, subtitle
   "High-level design, low-level design and AI/ML system design — from the basics to interview-ready."
   Text-size control in the header.
2. A mode switch: **Learn** | **Revise**. Remember the choice in localStorage (try/catch).
3. Stats: topics confident / 71, checks passed / 284, and **must-know confident / (number of must topics)**.
4. Learn mode only: the "Next up" box, exactly like Foundations, with
   "Open the topic and follow Steps 1 → 4."
5. An Accordion **How to study system design (read once)**, closed by default, showing `sdHowToStudy`
   as a numbered list, `SD_CONFIDENT_RULE`, and the four checks with their meanings.
6. A filter row: priority chips **All · Must know · Should know · Bonus**, and a search box that filters
   topics by name and definition. Both work in both modes.
7. Phase tabs (scrollable), each labelled `number short · confident/total`.
   In Revise mode, add an extra first tab **All phases**.

### Learn mode: one Accordion card per topic (use `unmountOnExit`)
Summary row: number, name, a priority tag (Must know / Should know / Bonus — give "Must know" a clear
colour), a type tag for designs (**HLD**, **LLD** or **AI/ML**), and the check dots or a CONFIDENT tag.

Inside, the same 4-step stepper as Foundations:

**STEP 1 · UNDERSTAND IT** (the main lesson — give it room to breathe)
- Always start with the definition in a highlighted box.
- Concept, in this order: **The problem it solves** (`problem`) → **The idea** → **How it works, step by step**
  (numbered `howItWorks`) → **Analogy** → **Where the analogy breaks** (muted) → **Example** →
  **Must-know points** (bulleted `keyPoints`) → **Common mistakes** (`mistakes`, with a warning-coloured marker)
  → **Trade-offs** (if any) → code.
- Design, in this order: **Why interviewers ask this** (`problem`) → **Requirements** (two short lists:
  Functional, Non-functional) → **Estimates** → **API** (monospace) → **Data model** → **Classes** (LLD) →
  **Patterns used** → **Start simple, then scale** (numbered `evolution`) → **The design, step by step**
  (numbered `design`) → **Deep dives** → **Common mistakes** → code.
- Code uses the same syntax highlighter as Foundations; `codeLanguage` can be `python`, `sql` or `text`.

**STEP 2 · GO FURTHER (FREE, OPTIONAL)** — one line above the list: "The notes above are enough on their own.
Use these for a second explanation or extra practice." Resources sorted watch → read → code → paper, numbered,
papers greyed out and labelled "Optional — skip for now". All resources are free, so no "Paid" labels.

**STEP 3 · PRACTISE, IN THIS ORDER** — 1 Explain, 2 Draw (on paper, from memory), 3 Apply,
4 Trade-offs. End with: No answers here, on purpose. Try first, then send Claude: "check my answer: <topic name>".

**STEP 4 · INTERVIEW-READY, THEN PROVE IT**
- **Your interview answer** — `interviewAnswer` in a quote-style box, with the hint "Say this out loud."
- **Follow-up questions** — each question visible, its answer hidden behind a "Show answer" button
  (`aria-expanded`), so I can test myself first.
- Then the four check buttons, with: "Do this the next day with your notes closed. Tick only what you can do from memory."

### Revise mode: fast reading before an interview
No accordions and no stepper. A compact card per topic (respecting the filters and the tab):
- name, priority tag, type tag;
- the definition;
- concepts: the must-know points; designs: the numbered design steps, then the deep dives;
- the common mistakes;
- the interview answer;
- follow-up questions **with answers shown**;
- a small "Open in Learn mode" link that switches mode, opens that topic's tab and expands its card.

## Requirements
- Keep the existing dark style, colours and components. No new npm packages.
- Works on a 375px-wide phone: nothing scrolls sideways; every button is at least 44px tall.
- Do not change `src/data/systemDesign.ts` or anything about ML Foundations' behaviour or content.

## When you're done
Run `npx tsc -b`, `npx vitest run`, `npx eslint` on every file you changed, and `npm run build`.
Fix anything that fails. Then tell me in plain English what you changed and where to find it.
