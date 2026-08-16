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

### Study Plan
Twenty-six weeks, 17 August 2026 to 14 February 2027, running two tracks at once: research
depth in the mornings, engineering and DSA in the evenings. It started as a spreadsheet with
eight tabs, which meant the plan lived somewhere I never had open. Now it lives here, as four
pages instead of eight.

**This Week** is the one I open daily. It says which week I'm in, what the milestone is, and
what to learn — the exact video, the exact chapter, the exact thing to build, with links. The
26-week strip across the top fills in square by square as weeks get logged, so progress is
something you see rather than calculate.

**The days off move.** The original plan assumed Friday was always free. It isn't — some weeks
it's Thursday, some weeks two days, and it isn't known in advance. So nothing is pinned to a
named day any more. I mark the days I'm actually off and the week deals itself out: the first
day off becomes the five-hour deep work block, the week review stays at the end of the week,
AI engineering takes the second day off if there is one, and everything else is a theory
morning with DSA in the evening. However the days fall, it still comes to 24 hours.

**The Journey** is the whole six months in one place — every week grouped by phase and
expandable, the nine projects, and the 150 DSA problems. **The Logbook** is what I've actually
done: the Sunday hours entry and the papers, in one place because they're the same act. The
spreadsheet said *"if you are under 16 hrs/week for three weeks running, cut Sunday, then
Saturday"*; the app watches for that and tells me. **The Library** is every source, either by
subject when I want to master something or week by week when I just need today's two hours.

Every resource carries its exact title and author as well as a link, because a title stays
findable long after a URL has moved.

The DSA pages are the one place the spreadsheet was wrong. It had a *Done* column to tick,
while the NeetCode hub in this app has tracked those 150 problems for months. So the column is
gone: the plan reads the hub's own data, and ticking a problem there is what moves it.

### Also
A global Pomodoro timer that keeps running as you move between pages, daily habits with
streaks and a year of history, and a DSA hub tracking NeetCode 150.
