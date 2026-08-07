# Atomic Hub

A daily-improvement and interview-preparation app I built for myself and use every day.

It started as somewhere to keep my interview answers. It became the thing that actually
trains me: what to practise today, whether I'm getting better, and — on the bad days —
proof that I've been showing up.

**Stack:** React 19 · TypeScript · Vite · MUI v7 · Firebase Firestore · Firebase Hosting

---

## What it does

### Interview Hub
Nine categories of questions and answers, each with **memory points** — four to six short
bullets. Opening a question shows the bullets, not the paragraph, because reading builds
recognition and interviews need recall. The full answer is one tap further.

**Practice mode** goes further still: question only, then "reveal memory points", then
"reveal full answer". Three stages, matching how practice actually works.

**Cold shot** picks one question you didn't prepare, full screen, answer
hidden behind a deliberate tap — recall under surprise is the exact skill nerves attack.

### Three honest numbers
The readiness metric used to be `completed / total`, a permanent checkbox. It could only
go up, and it measured content ticked off rather than practice done. It's now three
numbers that can all fall:

- **Coverage** — % of questions said out loud at least twice
- **Freshness** — % practised in the last 14 days
- **Confidence** — mean of how each practised question actually felt

### Core Stories
Six stories, not thirty. Each card carries its hook, its memory points, the questions it
covers, and **flex notes** — how to re-angle it when an unexpected question arrives. The
Performance Fix is a technical story if they ask about achievement and an ownership story
if you open with *"nobody handed me a root cause — I was handed a symptom."*

One rule sits at the top of the page: never use the same story twice in one interview.

### Evidence Log
One line every night about what the day actually contained. Rejection erases your memory
of progress; a log makes it un-erasable. **"Read your receipts"** shows the last 30 entries
full screen, large text, no interface — that's what you open on a bad day.

There is no streak here, and no warning state. A missed day shows as nothing at all,
because the app's job is to make coming back easy, not to punish a gap.

### Also
A global Pomodoro timer that keeps running as you move between pages, daily habits with
streaks and a year of history, and a DSA hub tracking NeetCode 150.
