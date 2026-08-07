import type { Category } from '../context/TaskContext';
import type { CoreStoryId } from './coreStories';

export interface DefaultTask {
    id: string;
    title: string;
    description: string;
    category: Category;
    companyId?: string;
    targetCompany?: string;
    memoryPoints?: string[];
    coreStoryId?: CoreStoryId;
}

export const defaultTasks: DefaultTask[] = [
    {
        "id": "pb_1",
        "title": "Tell me about yourself / Walk me through your CV",
        "description": "Thank you — I'm Manoj. I'm a software engineer with industry experience at Accenture, where I worked on high-traffic enterprise applications using Java Spring Boot, React and Python. I shipped production features in Agile teams, wrote tests, did code reviews — and my proudest fix there was a database performance problem that cut our API response times by 40%.\n\nI graduated with my MSc in Artificial Intelligence from Aston University in July 2026, where I deliberately built the AI side on top of my engineering foundation. I built CogniGraph, a RAG document intelligence system that grounds answers in real documents to reduce hallucinations; Planck AI, an agentic system using LangGraph for multi-step reasoning; and a fruit detection system running in real time at 73 frames per second using 95% less training data than usual. Since graduating I've built a multi-agent pricing copilot with specialist agents, guardrails and an evaluation harness.\n\nWhat I'm looking for now is a role where I can take GenAI from an idea to something people rely on every day.",
        "category": "Personal Background",
        "memoryPoints": [
            "Accenture: Java, React, Python, Agile, Tests",
            "Proudest fix: DB performance, 40% faster",
            "MSc AI Aston (July 2026): built AI on engineering foundation",
            "CogniGraph, Planck AI (LangGraph), Fruit Detection (73 FPS)",
            "Now: Multi-agent pricing copilot with guardrails",
            "Looking for: Take GenAI from idea to reliable product"
        ]
    },
    {
        "id": "pb_2",
        "title": "Tell me about yourself — short version (phone screens)",
        "description": "I'm Manoj — a software engineer with industry experience at Accenture and an MSc in Artificial Intelligence from Aston, which I completed in July this year. My background combines real production engineering — shipping features, testing, performance work — with hands-on AI: I've built RAG systems, agentic AI with LangGraph, and real-time computer vision. Most recently I built a multi-agent pricing copilot with guardrails and an evaluation harness. I'm now looking for an AI engineering role where I can build GenAI tools people actually rely on.",
        "category": "Personal Background",
        "memoryPoints": [
            "Accenture SWE + MSc AI from Aston",
            "Combine prod engineering with hands-on AI",
            "Built RAG, LangGraph agents, real-time CV",
            "Current: Multi-agent pricing copilot",
            "Goal: Build GenAI tools people rely on"
        ]
    },
    {
        "id": "pb_3",
        "title": "What have you been doing since graduating?",
        "description": "Since graduating in July I've been sharpening my skills deliberately rather than waiting. I built a multi-agent pricing copilot — specialist agents for different data sources, conditional routing between them, guardrails, and an evaluation harness — and I've been publishing my projects properly on GitHub with demos so the work is visible, not just claimed.\n\nI've also been interviewing actively, which has been genuinely useful: every conversation tells me something about where the gaps are. And I work part-time alongside it, which keeps me disciplined — I treat my evenings as protected time for building and applying, and I'm consistent about it.\n\nSo the honest answer is: building, interviewing, and improving every week.",
        "category": "Personal Background",
        "memoryPoints": [
            "Building deliberately: multi-agent pricing copilot",
            "Publishing projects on GitHub with demos",
            "Interviewing actively to identify gaps",
            "Working part-time and protecting evenings for AI",
            "Result: Building, interviewing, improving every week"
        ]
    },
    {
        "id": "cd_1",
        "title": "Why did you leave Accenture after two years?",
        "description": "I left because I'd reached a point where I wanted real depth in AI, and the fastest honest route to that was focused study plus hands-on building.\n\nAt Accenture I got strong exposure to production development — shipping features, working with cross-functional teams, optimising performance, maintaining quality through testing and code reviews. I learned how to deliver in an Agile environment and how to balance speed with reliability, and I'm genuinely glad I have that foundation.\n\nBut my long-term interest was in building AI-enabled products, and I wanted more than surface familiarity with the tools. So it was a planned move rather than dissatisfaction. During the MSc I built agentic workflows, RAG systems and deployed ML applications, which gave me exactly the depth I was looking for. Now I bring both — engineering discipline from industry, and AI capability from focused study.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Wanted real depth in AI via focused study",
            "Accenture gave solid engineering foundation",
            "Learned to balance speed with reliability",
            "Planned move, not dissatisfaction",
            "MSc gave hands-on RAG/Agentic experience",
            "Now bring both: engineering discipline + AI capability"
        ]
    },
    {
        "id": "cd_2",
        "title": "Why did you move from software engineering into AI?",
        "description": "Because I could see where the hard problems were moving. At Accenture I was building solid backend systems and I enjoyed it, but I kept noticing that the difficult part of the next generation of software wasn't going to be the plumbing — it was going to be making intelligent systems reliable enough that people trust them.\n\nWhat I didn't want was to abandon the engineering side, because that's where I think most AI projects actually fail. They work beautifully in a notebook and never survive contact with real users and real messy data. So I treated the MSc as adding AI depth on top of production engineering habits, not replacing them.\n\nThat combination is what I bring — I can build the model, and I can build the system around it that makes it dependable.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Saw where hard problems were moving",
            "Next challenge: making AI systems reliable",
            "Didn't want to abandon SWE",
            "Most AI fails because it lacks engineering",
            "Added AI depth on top of prod habits",
            "I can build the model AND the reliable system"
        ]
    },
    {
        "id": "cd_3",
        "title": "Why this specific role?",
        "description": "This role needs someone who can take a GenAI idea and turn it into something real people use every day. That's exactly what I've been building toward.\n\nTo do that well you need two things. Strong engineering habits — which Accenture gave me, shipping features under real pressure, writing tests, working through code review. And real AI knowledge — which my MSc gave me, building RAG systems, agentic workflows, and deploying models that work on realistic data rather than clean demos.\n\nSince graduating I've kept building, most recently a multi-agent copilot with guardrails and an evaluation harness. So when I look at this role it isn't a stretch or a hope — it's the natural next step of what I'm already doing every week.\n\n(Tailor the middle to each company's actual AI work.)",
        "category": "Career Decisions",
        "memoryPoints": [
            "Role needs taking GenAI from idea to daily use",
            "Needs two things: Engineering + AI",
            "Accenture provided engineering habits",
            "MSc provided real AI knowledge",
            "Not a stretch: natural next step of current work"
        ]
    },
    {
        "id": "cd_4",
        "title": "What are you looking for in your next role?",
        "description": "Somewhere I can ship real work that matters and learn from a strong engineering team. Concretely that means clear goals, regular feedback, and exposure to good practice — thorough code review, automated testing, CI/CD, monitoring.\n\nI learn best when I own something end to end: break it down, deliver a first version quickly, then improve it based on review and measurement. I also value teams where it's normal to ask questions early and discuss trade-offs rather than guess — I want to understand not just what to build but why it matters and how success is measured.\n\nWork with data or AI features is a strong plus, but I'm equally happy contributing as a solid engineer first. What I want most is to leave a role having shipped things people use, with better judgement from watching experienced engineers think.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Ship real work, learn from strong team",
            "Good practice: code review, testing, CI/CD",
            "Own end-to-end: deliver fast, improve via feedback",
            "Culture of asking questions and discussing trade-offs",
            "Want to leave having shipped things people use"
        ]
    },
    {
        "id": "cd_5",
        "title": "Where do you see yourself in three to five years?",
        "description": "I want to be the engineer a team trusts with the hard problems — not just building features, but owning how a system is evaluated, made reliable, and taken to production. I'd like real depth in agentic AI specifically, because I think that's where the field is going and it's what I've been building toward deliberately.\n\nI'm less focused on a title than on impact and ownership. I want to be someone who consistently ships things people rely on and that the team can build on top of. Ideally I'd also be helping newer engineers by then, and contributing to practices that improve quality — better testing, clearer documentation, more useful code review.\n\nI'm also honest that I want to keep learning from people better than me. My fastest growth came from senior engineers reviewing my work properly.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Trusted engineer for hard problems",
            "Own evaluation, reliability, production",
            "Real depth in agentic AI",
            "Focused on impact and ownership, not title",
            "Helping newer engineers and improving practices",
            "Keep learning from people better than me"
        ]
    },
    {
        "id": "ta_1",
        "title": "What was your most significant technical achievement at Accenture?",
        "description": "At Accenture, our high-traffic client application had certain pages taking over 8 seconds to load. Users were dropping off and engagement was falling, so I was asked to find the root cause and fix it safely without breaking anything in production.\n\nI started by profiling the slow endpoints rather than guessing. I found two problems — the SQL queries had too many unnecessary joins, and there were no indexes on the columns we queried most, so the database was doing a full table scan on every single request. I rewrote the queries to remove the unnecessary joins, added compound indexes on the most-queried columns, and restructured how we fetched related data so we made far fewer database round trips. Before anything went live, I validated it all with unit tests, then load tested in staging.\n\nThe result was a 40% drop in API response time — pages that took 8 seconds were loading in under 2.",
        "category": "Tech Achievements",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "8-second pages, users dropping off",
            "Profiled first — did not guess",
            "Two causes: unnecessary joins + no indexes, so full table scans",
            "Fixed: rewrote queries, compound indexes, fewer round trips",
            "Unit tests, then staging load test — 40% faster, 8s to under 2s"
        ]
    },
    {
        "id": "ta_2",
        "title": "Tell me about a project you're particularly proud of",
        "description": "My fruit detection project. The challenge was building a model that could detect fruit accurately using only 207 training images — about 95% less data than models like this normally need — and it had to work well enough that a real robot arm could use it in a real field, not just score well on a test set.\n\nI used two-phase transfer learning: trained first on a larger similar fruit dataset so the model understood the domain, then fine-tuned on my small set. I set up a proper baseline so I could prove the improvements were real rather than luck, and I optimised for precision rather than raw accuracy — because in robotic harvesting, grabbing a leaf instead of a fruit is a costly mistake every single time it happens.\n\nThe final system ran at 73 frames per second against a 30 FPS requirement, and I deployed it as a live web demo.",
        "category": "Tech Achievements",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Two problems: only 207 images, and badly unbalanced classes",
            "Small data → transfer learning (big dataset first, then fine-tune)",
            "Imbalance → inverse frequency weighting",
            "Proof → proper baseline, one change at a time",
            "Better on the rare fruits, and 73 FPS against a 30 FPS requirement"
        ]
    },
    {
        "id": "ta_3",
        "title": "Tell me about the most complex project you've built",
        "description": "Planck AI, an agentic reasoning system that needed to handle multi-step tasks reliably rather than answering one-off questions. Early on it kept failing in subtle ways — losing track of what it was doing, or getting stuck repeating the same step.\n\nI'd never used LangGraph before, so I gave myself a week to become productive in it. I learned the core mental model first — a stateful graph where nodes do work and edges decide what happens next — then built the smallest working thing immediately and let real problems drive what I learned next: checkpointing when I needed to inspect failures, conditional edges when I needed routing.\n\nThen I redesigned the whole system around that graph, with every step an inspectable checkpoint. It took several rounds of iteration, but the result handled complex multi-step tasks predictably instead of half-working — and I could always see exactly why it made a decision.",
        "category": "Tech Achievements",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Failing subtly — losing track, repeating steps",
            "Could have settled for something simpler; did not",
            "Redesigned as a stateful graph, every step an inspectable checkpoint",
            "Never used LangGraph before — one week to productive",
            "Method: get the mental model, build the smallest thing, learn each concept by needing it"
        ]
    },
    {
        "id": "ps_1",
        "title": "Walk me through a time you had to debug a critical production issue",
        "description": "During a release at Accenture we saw performance degrade badly in a core module — page loads went from under 2 seconds to over 8, live, with real users affected and complaints coming in.\n\nThe pressure made the temptation obvious: guess and patch. I did the opposite. I checked monitoring first to understand the scope, then profiled the slow paths to see where time was actually going rather than assuming. That led me to the real causes — unnecessary joins in our queries, and missing indexes meaning the database was doing full table scans on every request.\n\nI fixed both, validated with unit tests, then load tested in staging with realistic data volumes before going anywhere near production. Response times came back under 2 seconds. Afterwards I added a performance test so the same class of problem would be caught before release rather than after.",
        "category": "Problem Solving",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "Accenture prod: page loads 2s to 8s",
            "Resisted guessing, used monitoring/profiling",
            "Found missing indexes and full table scans",
            "Load tested fix in staging before prod",
            "Added performance tests to pipeline to prevent recurrence"
        ]
    },
    {
        "id": "ps_2",
        "title": "Tell me about a difficult technical challenge you faced",
        "description": "In my fruit detection project I had two problems compounding each other. I only had 207 training images, which is tiny, and the data was badly imbalanced — some fruits appeared roughly ten times more often than others. Together, a normal model would learn the common fruits well and effectively ignore the rare ones.\n\nSo I solved each one directly. For the small dataset, transfer learning — training on a larger similar dataset first so the model already understood the domain, then fine-tuning on mine. For the imbalance, inverse frequency weighting, which forces the model to pay proper attention to the rare classes instead of optimising them away.\n\nAnd to be sure the improvements were real rather than noise, I set a proper baseline and changed only one thing at a time. The results improved measurably, especially on the rare fruits, and it still ran fast enough for real-time use.",
        "category": "Problem Solving",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Fruit detection: 207 images + imbalanced classes",
            "Normal model ignores rare fruits",
            "Transfer learning for small dataset",
            "Inverse frequency weighting for imbalance",
            "Set proper baseline, verified real improvement"
        ]
    },
    {
        "id": "ps_3",
        "title": "Describe a time you solved a problem with incomplete information",
        "description": "Building CogniGraph, my RAG system, I had to make design decisions without knowing what documents users would actually upload — clean PDFs, scanned images, inconsistent formatting, tables that don't extract cleanly.\n\nRather than waiting for clarity I didn't have, I defined what \"good\" meant in measurable terms: extract the right entities, ground every answer in the actual document, and never let the system guess when it wasn't sure. Then I identified the riskiest assumptions — would text extraction be clean enough, would retrieval surface the right chunks — and ran small experiments against genuinely messy real documents to test them early.\n\nWhere things broke, I added fallbacks so the system degraded gracefully instead of failing silently. The result handled real-world input reasonably well, because the decisions were driven by fast evidence rather than guesswork.",
        "category": "Problem Solving",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "CogniGraph RAG: Unknown messy user documents",
            "Defined measurable success: ground every answer",
            "Tested riskiest assumptions on ugly inputs early",
            "Added fallbacks for graceful degradation",
            "Decisions driven by fast evidence, not guesswork"
        ]
    },
    {
        "id": "ps_4",
        "title": "Tell me about a time you had to prioritise competing demands",
        "description": "During my MSc there was a period where everything landed at once — my dissertation, two module deadlines, and part-time work that takes full days. There genuinely weren't enough hours to do everything to the same depth, so I had to prioritise honestly rather than pretend I could.\n\nI ranked everything by deadline and by impact on my final outcome. The dissertation carried the most weight, so it got my protected time — the first fresh hours, before anything else. The module work I scoped to what would achieve a strong result without gold-plating. And I batched the small recurring tasks into fixed slots so they stopped interrupting deep work.\n\nI also looked ahead and spotted a deadline that would collide with a work shift, and dealt with it early rather than the night before. Everything was delivered, and the thing that mattered most got my best work.",
        "category": "Problem Solving",
        "memoryPoints": [
            "MSc dissertation + 2 modules + part-time work",
            "Ranked by impact and deadlines",
            "Protected fresh hours for the dissertation",
            "Scoped module work to avoid gold-plating",
            "Batched small tasks, delivered everything"
        ]
    },
    {
        "id": "ld_1",
        "title": "Tell me about a time you took initiative without being asked",
        "description": "At Accenture I noticed the team was losing real time to bugs slipping into production and then constant manual retesting. It wasn't anyone's specific job to fix, and nobody asked me to — but I could see it was slowing everyone down.\n\nRather than raising it as a proposal and waiting for permission, I started small. I picked the module that broke most often, wrote automated tests just for that, and set them running in the pipeline. It cost the team nothing and asked nothing of anyone.\n\nA while later those tests caught a real bug before it reached production — the kind that would previously have gone live and come back as an incident. That changed the conversation completely. The team could see the value themselves, and wider adoption became a shared decision rather than my campaign. Taking initiative isn't announcing an idea — it's making the value visible so people choose it.",
        "category": "Leadership",
        "coreStoryId": "automated-testing",
        "memoryPoints": [
            "Bugs slipping through, constant manual retesting, nobody owned it",
            "Started small — the module that broke most often, cost the team nothing",
            "Those tests caught a real bug before production",
            "Adoption became a shared decision, not my campaign",
            "Initiative is making the value visible, not announcing the idea"
        ]
    },
    {
        "id": "ld_2",
        "title": "Describe a time you led a project or initiative",
        "description": "I led my fruit detection project from start to finish — not just building a model, but designing a rigorous experiment and delivering something actually deployable.\n\nI defined what we were improving and how we'd measure it, then set up a fair baseline so the comparison would be credible — a control model trained with identical parameters so I was isolating the effect of the approach, not fooling myself. I designed the two-phase methodology, ran the experiments, and tracked metrics consistently throughout.\n\nI also kept deployment requirements in view the whole time — latency, usability, stability — so the output wasn't just a result on a page. I deployed a real-time demo running at 73 frames per second, well above the 30 needed for robotic harvesting.\n\nThat end-to-end ownership, from design through to something someone could actually pick up and use, is the kind of leadership I want to keep bringing.",
        "category": "Leadership",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Led fruit detection end-to-end",
            "Defined metrics and set fair baseline (control model)",
            "Tracked experiments consistently",
            "Kept deployment (latency, usability) in view",
            "Deployed live 73 FPS demo"
        ]
    },
    {
        "id": "ld_3",
        "title": "Tell me about a time you took ownership of something going wrong",
        "description": "When our application slowed badly at Accenture, what I was handed was a symptom — pages are slow, users are complaining. Nobody handed me a root cause, and nobody had scoped what fixing it involved.\n\nI took that on end to end. I profiled to find where time was genuinely going rather than fixing the first plausible thing, which turned up unnecessary joins and missing indexes causing full table scans. I fixed both, but I also owned the parts nobody asked about — writing the tests to prove behaviour hadn't changed, load testing in staging before release, and monitoring afterwards to be sure there was no regression.\n\nResponse times dropped 40%. Then I added a performance test so the same class of issue would be caught before release next time. Owning something means closing it properly, not just stopping when the symptom disappears.",
        "category": "Leadership",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "Handed a symptom (slow pages), not a root cause",
            "Owned end-to-end: profiled, found missing indexes",
            "Owned unasked parts: testing, load testing, monitoring",
            "40% drop in response time",
            "Closed properly: added performance tests to pipeline"
        ]
    },
    {
        "id": "co_1",
        "title": "Tell me about a time you disagreed with a colleague",
        "description": "At Accenture our team relied on manual testing before every release, and bugs still slipped into production. I believed we needed automated tests in the pipeline, but when I raised it some of the team disagreed — their view was that we didn't have time on top of delivery deadlines, and manual QA was covering us well enough.\n\nI didn't push back in the meeting, because their real concern was time pressure and arguing wouldn't change that. Instead I asked if I could run a small experiment: I took the module that broke most often, wrote tests just for that, and set them running. It cost the team nothing.\n\nWhen those tests caught a real bug before production, the conversation changed completely. Adoption became a shared decision rather than my argument. When you disagree with someone, evidence works far better than debate.",
        "category": "Collaboration",
        "coreStoryId": "automated-testing",
        "memoryPoints": [
            "Wanted automated tests; team said no time",
            "Didn't argue, understood their real concern (pressure)",
            "Ran small experiment silently (cost them nothing)",
            "Tests caught a bug, evidence changed their mind",
            "Evidence works far better than debate"
        ]
    },
    {
        "id": "co_2",
        "title": "Tell me about a conflict with a teammate (backup story)",
        "description": "A teammate wanted to take a shortcut to hit a deadline — essentially hardcoding some logic — and I felt it would create real problems for us later. Rather than making it personal, I focused on the shared goal: shipping on time without creating a mess we'd have to clean up.\n\nI asked questions first to understand the pressure he was under, then laid out both options with the trade-offs, and suggested a middle path — build the core part properly now, leave the nice-to-have parts for later. We talked it through and agreed on that plan.\n\nWe hit the deadline, and we never had to go back and rebuild it. The relationship stayed strong because it stayed about the outcome and the evidence, not about who was right.",
        "category": "Collaboration",
        "memoryPoints": [
            "Teammate wanted hardcoded shortcut for deadline",
            "Focused on shared goal: shipping without mess",
            "Asked questions to understand his pressure",
            "Suggested middle path: core proper, extras later",
            "Hit deadline, relationship stayed strong"
        ]
    },
    {
        "id": "co_3",
        "title": "Tell me about working with someone very different from you",
        "description": "At Accenture I worked closely with business analysts and testers who didn't come from an engineering background, and early on I made the mistake of explaining things in technical terms and assuming that was enough. It wasn't — we kept ending up with requirements that meant different things to each of us, and then rework.\n\nSo I changed how I worked. I started confirming my understanding back in plain language before building anything, and asking what a change was meant to achieve for the user rather than just what they wanted implemented.\n\nThat one habit removed most of the rework. It also made me much better at explaining technical trade-offs to non-technical people, which I now think is one of the most useful skills an engineer can have — because the best technical decision is worthless if you can't bring people with you.",
        "category": "Collaboration",
        "memoryPoints": [
            "Worked with non-technical BAs and testers",
            "Mistake: explained in technical terms, caused rework",
            "Change: confirmed understanding in plain language",
            "Focused on user goals instead of just implementation",
            "Best technical decision is worthless if you can't bring people with you"
        ]
    },
    {
        "id": "fl_1",
        "title": "Tell me about a time you failed or made a mistake",
        "description": "Building CogniGraph, I tuned the whole pipeline against clean, well-formatted test documents. The results looked excellent, so I considered it basically finished. Then I ran it against real-world PDFs — scanned pages, broken layouts, tables that didn't extract properly — and the system fell apart. Answers that were reliable on my test set came back wrong or empty.\n\nThe mistake wasn't a bug. It was my assumption. I'd tested against the data I wanted rather than the data users actually have.\n\nI fixed it properly: built a test set from genuinely messy documents, changed one thing at a time so I could measure real improvement, and added fallbacks so it degraded gracefully instead of failing silently. It cost me time I'd have saved by testing realistically from day one.\n\nNow it's a rule — the first thing I ask of any AI system is what the ugliest real input looks like.",
        "category": "Failure & Learning",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "Tuned on clean documents — looked finished",
            "Real PDFs: scans, broken layouts — it fell apart",
            "The mistake was an assumption, not a bug: I tested the data I wanted",
            "Fix: messy test set, one change at a time, graceful fallbacks",
            "Rule now: find the ugliest real input first"
        ]
    },
    {
        "id": "fl_2",
        "title": "Tell me about a time you kept going when something was hard",
        "description": "When I was building Planck AI, it kept failing in subtle ways — the agent would lose track of what it was doing, or get stuck repeating steps. Nothing crashed, which almost made it harder; it just quietly did the wrong thing.\n\nIt would have been easy to settle for something simpler that worked, and honestly I considered it. Instead I redesigned the whole thing as a stateful graph, where every step was a clear checkpoint I could inspect, so I could see exactly where it was going wrong rather than guessing.\n\nIt took several rounds of iteration before the multi-step reasoning ran smoothly and reliably. But the final system handled complex tasks predictably, and I understood every decision it made.\n\nI care about seeing things through to something that actually works, not something that half-works and looks impressive in a demo.",
        "category": "Failure & Learning",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Planck AI failing subtly without crashing",
            "Could have settled for something simpler",
            "Redesigned as stateful graph with inspectable checkpoints",
            "Iterated until it worked predictably",
            "Value systems that actually work, not half-work"
        ]
    },
    {
        "id": "fl_3",
        "title": "Tell me about a time you received difficult feedback",
        "description": "Early at Accenture, a senior engineer reviewed one of my pull requests and the feedback was blunt: the code worked, but it wasn't professional — variable names weren't clear, there was no input validation, and someone maintaining it in a year wouldn't understand my intent. My first reaction, honestly, was defensive. It passed all the tests, so why did the rest matter?\n\nBut I sat with it, and realised he was describing the difference between code that works and code that's engineered. So instead of just fixing that one pull request, I turned the feedback into a personal checklist — clear names, validation, comments explaining why, edge cases considered — and ran everything through it before review.\n\nMy review comments dropped noticeably over the following months, and later I found myself giving newer colleagues the same advice I'd once resisted. It's also why I now ask for feedback earlier — the earlier it hurts, the cheaper it is.",
        "category": "Failure & Learning",
        "memoryPoints": [
            "PR feedback: code worked but wasn't professional",
            "Initial reaction was defensive (it passed tests!)",
            "Realized difference between 'working' and 'engineered'",
            "Turned feedback into a personal checklist",
            "Now ask for feedback early: the earlier it hurts, the cheaper it is"
        ]
    },
    {
        "id": "fl_4",
        "title": "What are your weaknesses, or areas you want to grow in?",
        "description": "Two honest ones. Documentation used to linger on my list — when I'm deep in building something, stopping to write it up feels like it breaks my focus. I know that about myself now, so I schedule it as part of \"done\" rather than as an optional extra afterwards.\n\nThe bigger one is that I can be too independent. My instinct is to keep working on something until it's good before I show anyone. I've learned that's expensive — showing rough work early almost always saves more time than fixing a big problem at the end. So I now deliberately share earlier than feels comfortable.\n\nThe area I actively want to grow in is production ML at scale — evaluation and monitoring inside a real organisation with real data volumes. I've built that at project scale, and I want to learn how a mature team does it properly.",
        "category": "Failure & Learning",
        "memoryPoints": [
            "Documentation lingers; now scheduled as part of 'done'",
            "Too independent; now deliberately share rough work early",
            "Want to grow in: Production ML at scale",
            "Evaluation and monitoring with real data volumes"
        ]
    },
    {
        "id": "sb_1",
        "title": "What's your superpower at work?",
        "description": "My superpower is making AI systems that actually work in production, not just look impressive in a demo. A lot of people can build a RAG pipeline or a GenAI prototype in a notebook. What I do well is take it the next step — test it against realistic, messy data, find the edge cases where it fails, add the fallbacks, and get it to a state where someone can genuinely rely on it day to day.\n\nIn CogniGraph, the first version looked great on clean test documents and fell apart on real PDFs. I fixed it systematically — expanded the test set, iterated one change at a time, added fallbacks for noisy extraction — until it worked on realistic input. That instinct, asking \"does this actually work, not just in theory?\", is what I bring to every system I build.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Making AI systems actually work in prod, not just demos",
            "Taking the next step: testing against messy data",
            "Finding edge cases and adding fallbacks",
            "Instinct: 'Does this actually work, not just in theory?'"
        ]
    },
    {
        "id": "sb_2",
        "title": "What do you pick up faster than most?",
        "description": "New AI frameworks and tooling — I pick those up very quickly. When I started building my agentic project I'd never used LangGraph. I read just enough to understand the core mental model, then started building immediately, and within a week I had a working multi-step agent with checkpointing and state management.\n\nThe reason is that I learn by building rather than reading. I make something break, work out why, fix it, and move on. FastAPI, LangChain, ONNX Runtime — all picked up the same way. In a field where the tooling changes every few months, I think that's genuinely useful, because it means I'm not attached to any particular tool.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "New AI frameworks and tooling",
            "LangGraph in a week to working multi-step agent",
            "Learn by building rather than reading",
            "Make it break, fix it, move on",
            "Not attached to any particular tool"
        ]
    },
    {
        "id": "sb_3",
        "title": "What fuels your drive and keeps you going?",
        "description": "Knowing that something I built actually helps a real person. Not a good score on a chart — a real person whose job gets easier because of my work.\n\nThe moment that excited me most during my MSc was when my fruit detection system hit 73 frames per second on real video. Not because the number was impressive, but because 30 frames per second was the minimum a real robot arm needed to work in a field. When I crossed that, the project stopped being a university assignment and became something usable.\n\nThat feeling — taking an idea all the way through to something that genuinely works in the real world — is what keeps me going through the unglamorous parts.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Knowing my work helps a real person",
            "Not just good scores on charts",
            "Fruit detection crossing 30 FPS made it usable by robots",
            "Taking an idea all the way to the real world",
            "Keeps me going through the unglamorous parts"
        ]
    },
    {
        "id": "sb_4",
        "title": "Are you more of a starter or a finisher?",
        "description": "Honestly, I'm more of a starter naturally. I get genuinely excited at the beginning of something — figuring out the right approach, spotting the risks early, thinking about what will actually make it useful.\n\nBut I've learned that finishing properly matters just as much, so I've built habits around it. In my projects, before I write a line of code I ask what \"done\" actually looks like — what's the metric that tells me this is finished — so I have a target rather than building indefinitely. And at Accenture I introduced automated testing so that when I said something was finished, it actually meant reliable, not just working on my laptop.\n\nSo I'd say I'm a starter who has trained himself to finish properly.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Naturally a starter (excited by approach, risks, utility)",
            "Built habits around finishing properly",
            "Define 'done' mathematically before writing code",
            "Introduced automated testing to guarantee reliability",
            "A starter who trained himself to finish properly"
        ]
    },
    {
        "id": "sb_5",
        "title": "How do you make time work for you?",
        "description": "I work best when I protect focused time for hard problems and avoid constantly switching between tasks. At Accenture I learned to group code reviews and team updates at set points in the day rather than stopping every hour, so I could actually concentrate on what I was building.\n\nFor AI work especially, it's very easy to keep tweaking something forever without making real progress. So I set a clear limit — if a change isn't improving results by a certain point, I stop and move on.\n\nI also think a problem through properly before I start building. That sounds slower, but it saves a lot of time, because I spend far less of it going back to fix things I should have planned better.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Protect focused time, avoid context switching",
            "Group code reviews and updates",
            "Set limits on AI tweaking (stop if no progress)",
            "Think through properly before building",
            "Planning feels slower but saves rework time"
        ]
    },
    {
        "id": "sb_6",
        "title": "What tends to linger on your to-do list, and why?",
        "description": "Documentation tends to stay longest. Not because I don't value it — but when I'm in the middle of building, stopping to write it up feels like it breaks my focus. I know this about myself, so now I schedule documentation time separately instead of leaving it as a vague \"I'll do it later.\" I treat it as part of being finished, not an optional extra.\n\nThe other thing that sometimes lingers is asking for feedback early. I can be a bit too independent — I keep working on something and want it better before I show anyone. But I've learned that showing someone early, even something rough, almost always saves more time than fixing a big problem at the end.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Documentation lingers; breaks focus when building",
            "Now treated as part of 'done', not an optional extra",
            "Asking for feedback early lingers (too independent)",
            "Learned that rough work early saves fixing big problems later"
        ]
    },
    {
        "id": "sb_7",
        "title": "What's a proud moment you've made happen, and how?",
        "description": "My fruit detection project. The challenge was detecting fruit accurately using only 207 training images — 95% less data than models like this normally need — and it had to work well enough for a real robot arm in a real field, not just score well on a test set.\n\nI used transfer learning: trained on a larger similar dataset first, then fine-tuned on the small one. I tracked results against a proper baseline so I could prove the improvements were real rather than luck. And I focused on the right metric — precision rather than overall accuracy — because in robotic harvesting, grabbing a leaf instead of a fruit is a real cost every time.\n\nIt ran at 73 frames per second when 30 was the minimum, and I deployed it as a live demo. Research question to working system — that's what I'm proudest of.",
        "category": "Strengths-Based",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Fruit detection: 207 images to working system",
            "Transfer learning, fair baselines, focused on precision",
            "Ran at 73 FPS against a 30 FPS minimum",
            "Research question to working system"
        ]
    },
    {
        "id": "sb_8",
        "title": "Why does this role feel like the right fit for your strengths?",
        "description": "This role needs someone who can take a GenAI idea and turn it into something real people use every day and rely on. That's exactly what I've been building toward.\n\nTo do that well you need two things: strong engineering habits and real AI knowledge. Accenture gave me the engineering side — shipping features, writing tests, working under genuine pressure. My MSc, which I completed in July, gave me the AI side — RAG systems, agentic workflows, models deployed on realistic data rather than clean demos.\n\nAnd since graduating I've kept building, most recently a multi-agent copilot with specialist agents, guardrails and an evaluation harness. So when I look at this role it isn't a stretch or a hope — it's the natural next step of what I'm already doing every week.\n\n(Tailor the middle to each company's actual AI work.)",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Needs someone to take GenAI from idea to reliable product",
            "Engineering habits (Accenture) + AI knowledge (MSc)",
            "Consistently building post-grad (multi-agent copilot)",
            "Not a stretch, natural next step of what I do every week"
        ]
    },
    {
        "id": "cl_1",
        "title": "Questions to ask the engineer or hiring manager",
        "description": "Pick two or three. The best question is always a follow-up on something they said during the interview — it proves you were listening.\n\n• Where is the team on multi-agent systems today — are those in production already, or is it still mostly single-purpose solutions?\n• How does the team handle evaluation and drift for the GenAI solutions already live — is there a shared harness, or does each use case bring its own?\n• What would the first six months look like for someone joining at my level — contributing to an existing platform, or owning a use case end to end?\n• From your experience, what separates the people who ramp up fastest here?\n• What do you enjoy most about working on this team?\n\nAlways close with: \"Thank you — this has genuinely made me more excited about the role. What are the next steps in the process?\" Say it warmly, then stop talking.",
        "category": "Closing Strategy",
        "memoryPoints": [
            "Best question is a follow-up to something they said",
            "Multi-agent systems: in prod or single-purpose?",
            "Evaluation/drift: shared harness or per-use-case?",
            "First six months: contributing or owning?",
            "Close: 'This made me more excited. What are the next steps?'"
        ]
    },
    {
        "id": "cl_2",
        "title": "Questions to ask the recruiter",
        "description": "Never ask the engineer about salary. Never ask the recruiter about architecture.\n\n• What are the next steps, and how many stages are there in total?\n• What's the expected timeline for a decision?\n• Could you share the salary range and bonus structure for this role?\n• Is the role hybrid or office-based, and how many days on site?\n• What's the expected start date?\n• On right to work: \"I have the right to work in the UK on the Graduate Route visa.\" Then if relevant: \"For the longer term, does the company sponsor Skilled Worker visas for people transitioning from the Graduate Route?\"\n\nAlways close with: \"Thank you — this has genuinely made me more excited about the role. What are the next steps in the process?\"",
        "category": "Closing Strategy",
        "memoryPoints": [
            "No salary for engineer, no architecture for recruiter",
            "Next steps and timeline for decision?",
            "Salary range and bonus structure?",
            "Hybrid/office and start date?",
            "Visas (Graduate Route / Skilled Worker)",
            "Close: 'This made me more excited. What are the next steps?'"
        ]
    }
] as DefaultTask[];
