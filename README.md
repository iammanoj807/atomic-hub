# Atomic Hub

A daily-improvement and interview-preparation app I built for myself and use every day.

It started as somewhere to keep my interview answers. It became the thing that actually
trains me: what to practise today, whether I'm getting better, and — on the bad days —
proof that I've been showing up.

**Stack:** React 19 · TypeScript · Vite · MUI v7 · Firebase Auth · Firebase Firestore · Firebase Hosting · PWA

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

### ML Foundations
A self-paced roadmap through machine learning and AI engineering, from scratch: eight phases
and 97 topics, taken in order. There are no dates and no weeks. The
next thing to do is simply the first topic that is not yet confident.

Every topic has a plain-English note (the idea, an analogy, where the analogy breaks, an
example), its own resources to watch, read and code with, and one practice exercise for each
of four checks: **Explain**, **Derive**, **Build**, **Break**. Every exercise has one good
answer behind a **Show answer** tap, so it can be tried first and checked after; every code
answer has been run, and the numbers it quotes are the ones it printed. A topic counts only
when all four are ticked without notes, and ticks come off again when an old topic fails its
re-test. Each phase ends with interview-style questions, also with hidden answers. Original
papers are marked optional, to come back to once the foundations are solid.

### System Design
High-level, low-level and AI/ML system design, from the building blocks to full design
questions: ten phases and 72 topics. Every topic has a diagram, a plain-English lesson,
a spoken interview answer and follow-up questions with answers. Each topic has one practice
exercise for each of four checks (**Explain**, **Draw**, **Apply**, **Trade-offs**), and every
exercise has one good answer behind **Show answer**: a sketch to compare your drawing with,
the working for every estimate, and Python for the low-level designs, all of it run.
Technical words are underlined; tap one to see what it means. **Learn** mode takes one topic
at a time; **Revise** mode lays the interview notes out flat for the night before.

### Interview questions
ML Foundations, System Design and SQL each have an **Interview questions** mode, and the DSA
hub has a page of coding-interview questions: 61 in all, beginner to advanced, many of them
"it broke, what do you do?" scenarios (a RAG system that suddenly gives wrong answers, a
database that falls over when the cache restarts, a double charge). Each answer is hidden
until asked for and comes with what the interviewer is checking, the answer to say out loud,
an analogy, a diagram, the steps to work through, traps, follow-up questions, and links back to
the lessons it is built on. The Interview Hub links to all four; `?mode=interview` opens a
study page in that mode.

### SQL
SQL from a first `SELECT` to interview problems: nine phases, 47 lessons and 14 classic
interview problems (Nth highest salary, top N per group, gaps and islands, retention…).
Everything runs on one small practice database of six tables, with the awkward cases planted
on purpose: NULLs, ties, duplicates, a customer with no orders.

Every example shows the exact rows it returns, and **Try it yourself** runs it in the
browser on a real SQLite engine (sql.js), loaded only when first used. A test runs every
example and checks its rows, so a result printed on a card can't be wrong. It also fails
any query whose row order depends on luck rather than `ORDER BY`. Interview problems keep
their solution hidden until you have tried.

Each topic's four practice exercises (**Explain**, **Write**, **Predict**, **Edge cases**) have
one good answer each, behind **Show answer**. Answers that are queries show the rows they
return and can be run, and the same test checks them like the examples.

Select part of a run box to run only that part. Every query you write (or change) and run is
saved automatically, with the topic and step it was run in (Step 3's practice box, a worked
example, the practice database…), and synced through Firestore, so clearing the browser's data
doesn't lose them. Each box lists its own past queries, and **My saved queries** at the top of
the page lists them all, grouped by topic. Tap × on one to delete it.

### Also
The home page has a **Start here** map: what each part of the app is for, an order to take
the study pages in as a beginner, and where interview practice lives. It folds away once read.

With a topic open, the study pages show a thin column of ticks down the left edge, one per
step and section, and the one you are reading lights up. Hover it (or tap it on a phone) to
see the names, and pick one to jump there.

A global Pomodoro timer that keeps running as you move between pages, daily habits with
streaks and a year of history, and a DSA hub tracking NeetCode 150, with pattern guides and
a "Which pattern?" drill.

---

## Sign-in and privacy

One account, signed in with Firebase Auth (email and password). The login page asks only
for the password; the email comes from `VITE_OWNER_EMAIL`. The password is checked by
Firebase and never appears in the code, and repeated wrong guesses are rate-limited.

The data is protected by `firestore.rules`, not by the page: every read and write needs
the owner's uid. Signed in as anyone else, or not at all, the database refuses everything.

Setup: enable **Email/Password** under Firebase console → Authentication → Sign-in method,
add the one user under **Users**, put its email in `.env` as `VITE_OWNER_EMAIL`, and put its
uid in `isOwner()` in `firestore.rules`. Deploy the app before the rules.

## On the phone

The same build installs as an app. On iPhone, open the site in Safari, then
**Share → Add to Home Screen**. It opens full screen with its own icon. Everything lives
in Firestore, so the phone and the browser always show the same data. The home-screen app
keeps its own storage, so it asks you to sign in once. Small view settings (sidebar
collapsed, timer shown, Learn or Revise mode) are per device.

