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

/**
 * Bump this when the answers below change. On load, any built-in question
 * stamped with an older version is rewritten from this file once (the
 * previous text is kept on the document as previousDescription /
 * previousMemoryPoints). See utils/contentSync.ts.
 */
export const CONTENT_VERSION = 2;

/**
 * Questions whose title changed, so the sync can still find the stored
 * document under its old title. id -> old titles.
 */
export const PREVIOUS_TITLES: Record<string, string[]> = {
    cd_1: ['Why did you leave Accenture after two years?'],
};

// Answer format, rendered by FullAnswer in TaskItem.tsx: paragraphs are
// separated by a blank line, and a paragraph that opens with "LABEL — "
// shows the label as a small heading (SITUATION, ACTION, IN PLAIN WORDS…).
export const defaultTasks: DefaultTask[] = [
    {
        "id": "pb_1",
        "title": "Tell me about yourself / Walk me through your CV",
        "description": "HOW TO ANSWER — Present → Past → Future. Who you are now, how you got here, what you want next. About 90 seconds.\n\nNOW — I'm Manoj. I'm an AI engineer with a software engineering background — I've just finished my MSc in Artificial Intelligence at Aston University with a Distinction. What I do best is build AI systems and then prove they actually work, with honest measurement rather than a good-looking demo.\n\nBEFORE — I started as a software engineer at Accenture, building REST APIs in Java Spring Boot in a seven-person team. My main win there was cutting p95 latency — the response time of the slowest 5% of requests — from about 850 milliseconds to 510 across 18 endpoints. The cause was N+1 queries: the code made one database call per row instead of one call for all of them. After Accenture I worked at a startup in Nepal [one line: your role and one thing you built]. I'd already co-authored a published deep learning paper during my bachelor's, and I wanted real depth in AI, so I came to the UK for the MSc.\n\nAt Aston I built four projects, each one measured properly. FruitGuard, my dissertation, detects fruit for a harvesting robot from only 207 labelled images, at 96% accuracy and 73 frames per second. Planck AI is a research agent I built without a framework, and it completed 30 out of 30 tasks even with its main AI provider switched off. In CogniGraph I caught my own test questions overstating accuracy by 35 points, and rebuilt the test so the numbers were honest. Alongside that, I mentored five MSc students every week.\n\nNEXT — I'm looking for a role where I can build AI features that people genuinely rely on, in a team that cares about measuring whether they work. Build it, then prove it — that's how I like to work.\n\nIN PLAIN WORDS — \n• p95 latency — line up every response time; p95 is the time 95% of requests beat. It shows what your slowest users feel.\n• N+1 query — fetching a list with 1 query, then 1 more query for each item. 50 rows = 51 database trips instead of 1 or 2.\n• Agent — an AI that uses tools — search, code, documents — step by step to answer a question.",
        "category": "Personal Background",
        "memoryPoints": [
            "NOW: AI engineer, MSc AI Aston — Distinction",
            "Accenture: Spring Boot APIs, p95 850 → 510 ms (N+1 fix)",
            "Startup in Nepal → published paper → wanted AI depth → UK MSc",
            "FruitGuard 207 imgs / 96% / 73 FPS · Planck 30/30 · CogniGraph honest test",
            "Mentored 5 MSc students weekly",
            "NEXT: AI people rely on — build it, then prove it"
        ]
    },
    {
        "id": "pb_2",
        "title": "Tell me about yourself — short version (phone screens)",
        "description": "HOW TO ANSWER — Present → Past → Future. Who you are now, how you got here, what you want next. About 30 seconds.\n\nNOW — I'm Manoj, an AI engineer. I've just finished an MSc in Artificial Intelligence at Aston with a Distinction.\n\nBEFORE — Before that I was a software engineer at Accenture, where I cut API response times by 40%, and then I worked at a startup in Nepal. At Aston I built AI projects that I measured properly — a fruit detector that reaches 96% accuracy from just 207 images, and a research agent that finished 30 out of 30 tasks even with its main AI provider switched off.\n\nNEXT — I'm looking for an AI engineering role building things people actually rely on. And I'm on the Graduate Route visa until 2028, so no sponsorship is needed.",
        "category": "Personal Background",
        "memoryPoints": [
            "AI engineer, MSc AI Aston — Distinction",
            "Accenture: 40% faster APIs → startup in Nepal",
            "96% from 207 images · 30/30 with provider off",
            "Want: AI people rely on",
            "Graduate Route to 2028 — no sponsorship"
        ]
    },
    {
        "id": "pb_3",
        "title": "What have you been doing since graduating?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive.\n\nSince finishing in July I've been focused on two things: landing the right role, and staying sharp while I do it.\n\nOn the projects, I've made sure everything on my CV can be checked — live demos on Hugging Face and Render, clean GitHub repos, and the evaluation numbers written down so anyone can see how I measured them. [Add one concrete thing you've improved or built since July.]\n\nOn skills, I practise system design, data structures and ML fundamentals every day. I actually built my own study app to keep myself honest about it — it tracks what I've revised and drills me on which pattern fits which problem. And I've been interviewing, which is useful in itself: every conversation shows me a gap to close.\n\nSo the honest answer is: building, studying and interviewing — and getting better every week.",
        "category": "Personal Background",
        "memoryPoints": [
            "Two goals: the right role + staying sharp",
            "Projects checkable: live demos, clean repos, numbers written down",
            "Daily system design, DSA, ML fundamentals",
            "Built my own study app to stay honest",
            "Interviewing = finding gaps to close"
        ]
    },
    {
        "id": "cd_1",
        "title": "Why did you leave Accenture, and what did you do before your MSc?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive. Never criticise Accenture.\n\nI joined Accenture straight after my degree and spent about seven months there building Spring Boot APIs. It gave me a real grounding in production engineering — two-week sprints, code that real users depend on — and my best piece of work there was cutting API latency by 40%.\n\nI left to join a startup in Nepal [your real reason, in one positive line — e.g. to be closer to family, or for more ownership in a small team]. In a startup you do a bit of everything: [one line on your role and one thing you built there].\n\nAll through that time I kept being pulled towards AI — I'd already co-authored a deep learning paper in my final year — and I wanted real depth, not surface knowledge. So I came to the UK for an MSc in AI at Aston and finished with a Distinction. Now I bring both: engineering habits from industry, and AI depth from focused study.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Accenture ~7 months: production Spring Boot, 40% latency cut",
            "Left for a startup in Nepal [real reason, positive]",
            "Startup: did a bit of everything [your role]",
            "Always pulled to AI — published paper in final year",
            "MSc AI Aston, Distinction → now engineering + AI"
        ]
    },
    {
        "id": "cd_2",
        "title": "Why did you move from software engineering into AI?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive.\n\nBecause AI was where I'd always been heading, and I could see where the hard problems were moving. My interest started in my bachelor's, when I co-authored a paper on using deep learning to recognise currency for visually impaired people.\n\nAt Accenture the work was satisfying because it was measurable — p95 latency went down or it didn't. When I looked at AI, the difficult part wasn't building the model, it was knowing whether it really works. Most AI projects look brilliant in a notebook and fall apart on real data and real users.\n\nSo I didn't swap engineering for AI — I added AI on top of engineering. Every project in my MSc has a proof step: a fair baseline, an honest test set, or code that checks what the model says. That combination is what I bring: I can build the model, and I can build the system around it that proves it's dependable.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Always heading there: published deep learning paper in bachelor's",
            "Accenture taught me to measure (p95 went down or it didn't)",
            "Hard part of AI: knowing if it really works",
            "Added AI on top of engineering, didn't swap",
            "Build the model + prove it's dependable"
        ]
    },
    {
        "id": "cd_3",
        "title": "Why this specific role?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive. Tailor the middle paragraph to the company's real AI work.\n\nThis role needs someone who can take an AI idea and turn it into something people use every day and can trust. That's exactly what I've been building towards.\n\nTo do that well you need two things. Engineering habits — Accenture gave me those: production APIs, two-week sprints, measuring before fixing. And real AI depth — my MSc gave me that: an agent with tools and provider failover, a RAG system, a computer vision model deployed in real time. [Name one thing in their product or job description and link it to one of your projects.]\n\nSo this isn't a stretch for me — it's the natural next step from what I've been doing. Build it, then prove it works.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Role = AI idea → something people use and trust",
            "Engineering habits (Accenture) + AI depth (MSc)",
            "Link one of their products to one of my projects",
            "Natural next step, not a stretch"
        ]
    },
    {
        "id": "cd_4",
        "title": "What are you looking for in your next role?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive.\n\nSomewhere I can ship real work that matters and learn from a strong engineering team. Concretely: clear goals, regular feedback, and good practice — thorough code review, automated testing, CI/CD, and monitoring once things are live.\n\nI learn best when I own something end to end: break it down, deliver a first version quickly, then improve it based on measurement. I like teams where it's normal to ask questions early and talk about trade-offs, so I understand not just what to build but how we'll know it's working.\n\nWorking on AI features is what I'm most excited about, but I'm just as happy to contribute as a solid engineer first. What I want most is to look back and see things people use every day — and know how well they work.\n\nIN PLAIN WORDS — \n• CI/CD — every code change is automatically tested and deployed, so releases are small and safe.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Ship real work, learn from a strong team",
            "Good practice: code review, testing, CI/CD, monitoring",
            "Own end to end: first version fast, improve by measuring",
            "Ask early, discuss trade-offs",
            "AI excites me most, but solid engineer first"
        ]
    },
    {
        "id": "cd_5",
        "title": "Where do you see yourself in three to five years?",
        "description": "HOW TO ANSWER — Straight answer first, then the reason, then forward. Keep it short and positive.\n\nI want to be the engineer a team trusts with its hard AI problems — not just building features, but owning how a system is evaluated, made reliable, and taken to production. I'd like real depth in agentic AI in particular, because that's where the field is going and it's what I've been building towards with Planck AI.\n\nI care less about a title than about impact. I'd like to be helping newer engineers by then — I enjoyed mentoring five MSc students — and improving how the team works: better evaluation, better testing, clearer documentation.\n\nAnd I want to keep learning from people better than me, because that's where my fastest growth has always come from.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Trusted with hard AI problems",
            "Own evaluation, reliability, production",
            "Depth in agentic AI (Planck AI)",
            "Impact over title; help newer engineers (mentoring)",
            "Keep learning from people better than me"
        ]
    },
    {
        "id": "ta_1",
        "title": "What was your most significant technical achievement at Accenture?",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — At Accenture I was in a seven-engineer team building REST APIs in Java Spring Boot for a client service, on two-week sprints. I owned the business logic and the data-access layer — the code that talks to the PostgreSQL and MySQL databases. Some endpoints were slow: p95 latency, meaning the response time of the slowest 5% of requests, was around 850 milliseconds.\n\nTASK — I owned that layer, so making it faster was mine to do — without changing what the APIs returned.\n\nACTION — I measured before I touched anything. I looked at the SQL each slow endpoint actually ran and found the same pattern again and again: N+1 queries. The code fetched a list with one query, then made one more query for every item in it — so a page of 50 records meant 51 trips to the database. I found six places doing this and rewrote the SQL so each fetched everything it needed in one go. Then I re-measured the same endpoints in the same way, so the before-and-after was a fair comparison.\n\nRESULT — p95 latency dropped from about 850 to 510 milliseconds across 18 endpoints — a 40% cut. What I took from it: measure first, because the slow part is rarely where you'd guess. I've used that habit in every AI project since.\n\nIN PLAIN WORDS — \n• p95 latency — line up every response time; p95 is the time 95% of requests beat. It shows what your slowest users feel.\n• N+1 query — fetching a list with 1 query, then 1 more query for each item. 50 rows = 51 database trips instead of 1 or 2.\n• Data-access layer — the part of the code whose only job is talking to the database.\n• Spring Boot — a popular Java framework for building web services.",
        "category": "Tech Achievements",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "7-engineer team, Spring Boot, I owned data-access layer",
            "p95 (slowest 5%) ~850 ms",
            "Measured first → 6 N+1 query sites",
            "Rewrote SQL to fetch in one go, re-measured fairly",
            "510 ms across 18 endpoints — 40% faster"
        ]
    },
    {
        "id": "ta_2",
        "title": "Tell me about a project you're particularly proud of",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — My MSc dissertation, FruitGuard. A harvesting robot needs to spot fruit in real time — at least 30 frames per second — but I had only 207 labelled images, and the fruit classes were badly imbalanced.\n\nTASK — Build a detector accurate and fast enough for a robot from very little data, and prove the gains were real, not luck.\n\nACTION — I used YOLOv8, a fast object-detection model, with two-phase transfer learning: first it trained on a larger fruit dataset of 7,108 images to learn what fruit looks like in general, then I fine-tuned it on my 207. That's 34 times less labelled data for the final task. For the imbalance I used inverse frequency weighting, so mistakes on rare fruits counted more. To prove it worked, I compared against a fair baseline — the same model starting from standard COCO weights. Finally I ran it on ONNX Runtime, a fast engine for running models, to get the speed up.\n\nRESULT — 96.3% classification accuracy — 52 of 54 — plus 6 points better mAP and 3 points better precision than the baseline, at 73 frames per second, more than double what the robot needed. I deployed it as a live demo on Hugging Face. I'm proud of it because it went from a research question to something that actually runs.\n\nIN PLAIN WORDS — \n• YOLOv8 — a fast, well-known model that finds and labels objects in an image in one pass.\n• Transfer learning — start from a model that already learned from lots of similar images, then teach it your task with a few examples.\n• Inverse frequency weighting — mistakes on rare classes count more, so the model can't ignore them.\n• Baseline — the fair 'before' you compare against — here, the same model starting from standard COCO weights.\n• mAP — the standard score for object detection: how well it finds objects and how tightly its boxes fit.\n• Precision — of everything the model called fruit, how much really was fruit.\n• ONNX Runtime — a fast engine for running a trained model in production.",
        "category": "Tech Achievements",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Harvest robot needs 30+ FPS; only 207 images, imbalanced",
            "YOLOv8 + two-phase transfer learning (7,108 → 207, 34x less)",
            "Inverse frequency weighting for rare fruits",
            "Fair COCO baseline → +6.03 pp mAP, +3.12 pp precision",
            "96.3% (52/54), ONNX → 73 FPS, live demo"
        ]
    },
    {
        "id": "ta_3",
        "title": "Tell me about the most complex project you've built",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — Planck AI, a research assistant agent. You ask it a question, and it plans and uses tools — web search, running code in seven languages, reading PDFs and web pages, and analysing images — for up to eight steps before it answers.\n\nTASK — I wanted it to be reliable, not just impressive once — and I wanted to understand every part. So I built the agent loop myself in Python, without an agent framework.\n\nACTION — Three parts. First, the loop: the model picks a tool, my code runs it, feeds the result back, and repeats until it can answer or hits the eight-step limit. Second, resilience: AI providers fail — rate limits, outages — so I put Groq, Gemini and NVIDIA behind one standard interface, and if one fails mid-task the run switches to the next and carries on. Third, honest evaluation: I wrote 30 test questions and a grading rubric, and committed the rubric to Git before the first run, so I couldn't move the goalposts after seeing results.\n\nRESULT — With the main provider deliberately switched off on every call, it still completed 30 out of 30 tasks. It chose the right tool 80% of the time, with a median response of 2.7 seconds, and of the 20 tasks the rubric could grade, it gave no wrong answers.\n\nIN PLAIN WORDS — \n• LLM agent — an AI that picks a tool (search, run code, read a file), looks at the result, and repeats until it can answer.\n• Agent framework — a library like LangGraph that runs the agent loop for you — I wrote that loop myself.\n• Failover — if one AI provider fails or hits its limit, the request moves to the next one automatically.\n• Fault injection — breaking something on purpose to prove the system survives it.\n• Golden set — a fixed list of test questions with agreed correct answers.\n• Median latency — the typical response time: half are faster, half slower.",
        "category": "Tech Achievements",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Research agent: 4 tools, up to 8 steps",
            "Built the loop myself — no framework",
            "Failover across Groq, Gemini and NVIDIA, mid-task",
            "Rubric committed to Git before first run",
            "Main provider off every call → 30/30",
            "80% right tool, 2.7 s median, 0 wrong of 20"
        ]
    },
    {
        "id": "ps_1",
        "title": "Walk me through a time you had to debug a critical production issue",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. Spotlight the method, not the number.\n\nSITUATION — The most serious production problem I owned was at Accenture: our REST APIs were too slow for their slowest users. p95 latency — the time 95% of requests beat — was around 850 milliseconds.\n\nTASK — I owned the data-access layer, so I had to find the real cause and fix it without changing what any API returned.\n\nACTION — The temptation with something live is to guess and patch. I did the opposite: I measured first. I looked at the actual SQL each slow endpoint ran, and the pattern was clear — N+1 queries. The code got a list with one query, then fired one more query per item. I found six places doing it, rewrote the SQL so each fetched its data in one go, and then measured the same endpoints the same way to compare fairly.\n\nRESULT — p95 dropped from about 850 to 510 milliseconds across 18 endpoints, 40% faster. The lesson: under pressure, measuring first feels slower but is actually faster — you fix the real cause once instead of guessing three times.\n\nIN PLAIN WORDS — \n• p95 latency — line up every response time; p95 is the time 95% of requests beat. It shows what your slowest users feel.\n• N+1 query — fetching a list with 1 query, then 1 more query for each item. 50 rows = 51 database trips instead of 1 or 2.",
        "category": "Problem Solving",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "Accenture APIs, p95 ~850 ms",
            "Didn't guess — measured the real SQL",
            "Found 6 N+1 query sites",
            "Rewrote SQL, re-measured the same way",
            "510 ms, 18 endpoints, 40% faster",
            "Measuring first is slower to start, faster to finish"
        ]
    },
    {
        "id": "ps_2",
        "title": "Tell me about a difficult technical challenge you faced",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — In FruitGuard, my dissertation, I had two problems feeding each other. Only 207 labelled images — tiny for training a detector — and badly imbalanced classes, with some fruits far more common than others.\n\nTASK — Together, those meant a normal model would learn the common fruits and quietly ignore the rare ones. I had to fix both, and prove the fixes really helped.\n\nACTION — I tackled each one directly. For the small dataset, two-phase transfer learning: train on 7,108 fruit images first so the model already understands fruit, then fine-tune on my 207. For the imbalance, inverse frequency weighting, so a mistake on a rare fruit costs more and the model can't optimise it away. And to be sure improvements were real, I compared against a fair baseline — the same model from standard COCO weights — changing one thing at a time.\n\nRESULT — 96.3% classification accuracy, 52 of 54, and 6 points better mAP than the baseline, while still running at 73 frames per second. The lesson: name each problem separately, and give each one its own fix and its own proof.\n\nIN PLAIN WORDS — \n• Transfer learning — start from a model that already learned from lots of similar images, then teach it your task with a few examples.\n• Inverse frequency weighting — mistakes on rare classes count more, so the model can't ignore them.\n• Baseline — the fair 'before' you compare against — here, the same model starting from standard COCO weights.\n• mAP — the standard score for object detection: how well it finds objects and how tightly its boxes fit.",
        "category": "Problem Solving",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "207 images + imbalanced classes",
            "Normal model ignores rare fruits",
            "Small data → transfer learning (7,108 → 207)",
            "Imbalance → inverse frequency weighting",
            "Fair baseline, one change at a time",
            "96.3%, +6 pp mAP, 73 FPS"
        ]
    },
    {
        "id": "ps_3",
        "title": "Describe a time you solved a problem with incomplete information",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — In CogniGraph, my document question-answering system, I had to choose a chunk size — how long each piece of a document is when you cut it up for search. There's no right answer in a textbook; it depends on your documents and your model.\n\nTASK — Choose a size I could actually defend, rather than one that just looked good on a chart.\n\nACTION — I ran an experiment comparing sizes, and it said 2,000 characters was best. Before trusting it, I checked the setup and found two problems. First, the comparison was unfair — the different runs had different amounts of text in the collection, so I couldn't tell whether the chunk size or the corpus size caused the difference. Second, I tested the embedding model directly and proved it silently ignores everything after roughly 1,400 characters. So a 2,000-character chunk was really being judged on its first 1,400.\n\nRESULT — I set the chunk size to 1,000 — the largest that fits safely inside what the model actually reads. The lesson: when information is incomplete, check the measurement before you trust the result.\n\nIN PLAIN WORDS — \n• Chunk size — how long each piece of a document is when you cut it up for search.\n• Embedding — a list of numbers that captures what text means, so similar meanings sit close together.\n• Confounded — the comparison wasn't fair — something else changed at the same time.",
        "category": "Problem Solving",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "CogniGraph: choose a chunk size — no textbook answer",
            "Experiment said 2,000 chars was best",
            "Checked it: unfair (different corpus sizes)",
            "Proved the embedding model ignores text after ~1,400 chars",
            "Chose 1,000 — largest that fits",
            "Check the measurement before trusting the result"
        ]
    },
    {
        "id": "ps_4",
        "title": "Tell me about a time you had to prioritise competing demands",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — In autumn 2025, during my MSc, everything landed at once: my dissertation, my modules, mentoring five students every week, and two projects I was building — Planck AI and NeuroArc.\n\nTASK — There weren't enough hours to do everything to the same depth, so I had to prioritise honestly instead of pretending I could.\n\nACTION — I ranked everything by deadline and by how much it mattered. The dissertation carried the most weight, so it got my best hours, protected before anything else. Mentoring was a commitment to other people, so it went into fixed weekly slots that never moved. And for each project I decided up front what \"done\" meant as a number — for Planck AI, the test questions and rubric were written before I built the evaluation — so I could stop when I hit it instead of polishing forever.\n\nRESULT — Everything got delivered: both projects shipped with live demos, the mentoring never slipped, and I finished the MSc with a Distinction. The lesson: decide what \"done\" means before you start, and protect your best hours for the thing that matters most.",
        "category": "Problem Solving",
        "memoryPoints": [
            "Autumn 2025: dissertation + modules + mentoring 5 + 2 projects",
            "Ranked by deadline and weight",
            "Dissertation got protected best hours",
            "Mentoring in fixed slots — others depend on it",
            "Each project had a numeric 'done' up front",
            "All delivered → Distinction"
        ]
    },
    {
        "id": "ld_1",
        "title": "Tell me about a time you took initiative without being asked",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. The three blockers are on your CV; check the result matches what really happened.\n\nSITUATION — I mentored five MSc AI students one-to-one every week. The role was simply to help them with Python and machine learning — whatever they brought along.\n\nTASK — After a few weeks I noticed I was solving the same problems again and again across different students. Nobody asked me to change the format, but answering the same question five separate times wasn't helping anyone much.\n\nACTION — I tracked what came up and found three blockers that kept recurring: setting up Python environments, training loops that wouldn't converge, and jumping to a complex model before trying a simple baseline. So I focused the sessions on those three — a reliable way to set up an environment, a checklist for a model that won't learn, and the habit of building the simplest baseline first.\n\nRESULT — Sessions moved from firefighting to building skills, and students started fixing these problems themselves before our sessions. The lesson: initiative is spotting the pattern behind the individual problems and fixing the pattern.\n\nIN PLAIN WORDS — \n• Python environment — a clean, separate set of libraries for one project, so projects don't break each other.\n• Not converging — the model trains but never gets better — usually a bug, a wrong setting, or bad data.\n• Baseline — the simplest reasonable model; if a complex one can't beat it, the complexity isn't helping.",
        "category": "Leadership",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Mentored 5 MSc students weekly",
            "Noticed the same problems repeating",
            "3 blockers: environments, non-converging training, baseline first",
            "Built sessions around those 3",
            "From firefighting to self-sufficient",
            "Fix the pattern, not just the problem"
        ]
    },
    {
        "id": "ld_2",
        "title": "Describe a time you led a project or initiative",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — I led FruitGuard, my MSc dissertation, from start to finish: fruit detection for a harvesting robot, with only 207 labelled images.\n\nTASK — Not just to train a model, but to design an experiment someone else would trust, and to deliver something a robot could actually run.\n\nACTION — I defined the target up front: accuracy and mAP for quality, and at least 30 frames per second for the robot. I set a fair control — the same model, trained the same way, but starting from standard COCO weights — so any gain was down to my approach, not luck. I designed the two-phase transfer learning, ran the experiments, tracked every metric consistently, and kept deployment in view the whole time, converting the model to ONNX Runtime for speed.\n\nRESULT — 96.3% accuracy, 6 points better mAP than the control, and 73 frames per second, deployed as a live Hugging Face demo. Leading it end to end taught me that the plan for how you'll prove it works matters as much as the build.\n\nIN PLAIN WORDS — \n• Baseline — the fair 'before' you compare against — here, the same model starting from standard COCO weights.\n• mAP — the standard score for object detection: how well it finds objects and how tightly its boxes fit.\n• ONNX Runtime — a fast engine for running a trained model in production.",
        "category": "Leadership",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Led FruitGuard end to end",
            "Target set up front: accuracy, mAP, 30+ FPS",
            "Fair control model (COCO weights)",
            "Designed method, tracked metrics, kept deployment in view",
            "96.3%, +6 pp mAP, 73 FPS, live demo"
        ]
    },
    {
        "id": "ld_3",
        "title": "Tell me about a time you took ownership of something going wrong",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — At Accenture our APIs were too slow for their slowest users — p95 latency, the time 95% of requests beat, was around 850 milliseconds.\n\nTASK — I owned the business logic and the data-access layer — the code that talks to the database — so slow data access was my problem. Nobody handed me a root cause; I was handed a symptom.\n\nACTION — I owned it end to end. I measured to find where the time really went instead of fixing the first plausible thing, and found N+1 queries — one database trip per row instead of one for the whole list. I didn't stop at the worst one: I found and fixed all six places doing it, then re-measured the same endpoints the same way so I could show the improvement was real.\n\nRESULT — p95 fell from about 850 to 510 milliseconds across 18 endpoints, 40% faster. Ownership to me means closing it properly with proof, not stopping when the symptom looks better.\n\nIN PLAIN WORDS — \n• p95 latency — line up every response time; p95 is the time 95% of requests beat. It shows what your slowest users feel.\n• N+1 query — fetching a list with 1 query, then 1 more query for each item. 50 rows = 51 database trips instead of 1 or 2.\n• Data-access layer — the part of the code whose only job is talking to the database.",
        "category": "Leadership",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "I owned the data-access layer → my problem",
            "Handed a symptom, not a cause",
            "Measured → N+1 queries",
            "Fixed all 6, not just the worst",
            "Re-measured: 850 → 510 ms, 18 endpoints",
            "Ownership = close it properly, with proof"
        ]
    },
    {
        "id": "co_1",
        "title": "Tell me about a time you disagreed with a colleague",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. Check the details match a real session before you use this.\n\nSITUATION — When I was mentoring MSc students, one of them wanted to start their project with a complex deep learning model straight away. I believed they should build a simple baseline first.\n\nTASK — It was their project, so my job wasn't to win the argument — it was to help them make a good decision themselves.\n\nACTION — I asked what was behind it first. Their real worry was that a simple model would look unambitious. So instead of arguing, I suggested a quick experiment: spend an afternoon on a simple baseline, so whatever the complex model scored, they'd have something to compare it with. A baseline also catches data bugs early, because if a simple model does strangely well or badly, something is usually wrong with the data.\n\nRESULT — They built it, and it gave them a clear bar the complex model had to beat — which made their final results far more convincing. When you disagree, a small experiment beats a long debate, and it lets the other person reach the conclusion themselves.\n\nIN PLAIN WORDS — \n• Baseline — the simplest reasonable model — the bar a complex model has to beat to justify itself.",
        "category": "Collaboration",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Mentee wanted a complex model first; I said baseline first",
            "Their project — help them decide, don't win",
            "Asked first: real worry was looking unambitious",
            "Suggested a quick experiment, not an argument",
            "Baseline gave a clear bar → stronger results",
            "Small experiment beats long debate"
        ]
    },
    {
        "id": "co_2",
        "title": "Tell me about a conflict with a teammate (backup story)",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. Backup story — only use it if it's a real situation you can talk about in detail.\n\nSITUATION — A teammate wanted to take a shortcut to hit a deadline — essentially hardcoding some logic — and I felt it would cause real problems later.\n\nTASK — Hit the deadline without creating a mess we'd have to clean up, and keep the relationship good.\n\nACTION — I kept it about the shared goal, not about who was right. I asked questions first to understand the pressure they were under, then laid out both options with their trade-offs, and suggested a middle path: build the core part properly now, and leave the nice-to-have parts for later.\n\nRESULT — We agreed on that plan, hit the deadline, and never had to go back and rebuild it. The relationship stayed strong because the conversation stayed about the outcome, not the person.\n\nIN PLAIN WORDS — \n• Hardcoding — writing fixed values straight into the code instead of making them configurable — fast now, painful to change later.",
        "category": "Collaboration",
        "memoryPoints": [
            "Teammate wanted a hardcoded shortcut for a deadline",
            "Shared goal: on time, no mess",
            "Asked questions to understand their pressure",
            "Both options + trade-offs → middle path",
            "Hit deadline, no rework, relationship intact"
        ]
    },
    {
        "id": "co_3",
        "title": "Tell me about working with someone very different from you",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. Check the details match what really happened, and adjust them before you use this.\n\nSITUATION — The five MSc students I mentored came from very different backgrounds — some had programmed for years, others came from maths or other fields and were new to Python.\n\nTASK — Help each of them get unstuck, when the same explanation clearly didn't land for everyone.\n\nACTION — Early on I explained things the way I understood them, in technical terms, and assumed that was enough. It wasn't — someone would nod, then get stuck on the same thing the next week. So I changed how I worked: I started asking them to explain a fix back to me in their own words before we moved on, and I tied explanations to what they already knew — for a maths student, a training loop is just an optimisation problem.\n\nRESULT — Problems stopped coming back the following week, and it made me much better at explaining technical trade-offs simply. I now think that's one of the most useful skills an engineer has — the best technical decision is worthless if you can't bring people with you.",
        "category": "Collaboration",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "5 mentees, very different backgrounds",
            "Same explanation didn't work for all",
            "Mistake: explained in my terms, assumed it landed",
            "Change: they explain it back; link to what they know",
            "Problems stopped repeating",
            "Explaining simply = core engineering skill"
        ]
    },
    {
        "id": "fl_1",
        "title": "Tell me about a time you failed or made a mistake",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — CogniGraph is a RAG system — it answers questions using only passages it retrieves from your documents. To test it, I wrote my own set of test questions, and it scored 90%: the right passage came back first nine times out of ten.\n\nTASK — It looked finished. But the number felt too good, and I needed to know if it was real.\n\nACTION — I realised the mistake was mine: I'd written the questions myself, already knowing what was in the documents, so they were easier than anything a real user would ask. [Say in one line what made them too easy.] So I rebuilt the evaluation set to be honest. On the new set, the right passage came back first only 55% of the time — 35 points lower than I'd believed. Then I benchmarked it properly, against a simple keyword-search baseline on exactly the same questions.\n\nRESULT — On the honest set, the right passage was in the top three 95% of the time, against 80% for keyword search — so the system really was better, just not as good as my first number claimed. The real failure would have been believing the 90%. My rule now: make sure my test can't flatter me — and that's how I approach every evaluation.\n\nIN PLAIN WORDS — \n• RAG — before answering, the AI looks up relevant passages in your documents and answers from them — an open-book exam.\n• hit@1 / hit@3 — did the right passage come back first, or in the top three?\n• Keyword baseline — plain word-matching search — the simple thing a smart system must beat.",
        "category": "Failure & Learning",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "CogniGraph: my own test questions → 90%",
            "Too easy: I wrote them knowing the documentsRebuilt the test honestly → 55% first (hit@1)",
            "35 points of false confidence",
            "Same honest set: 95% in top 3 vs 80% keyword baseline",
            "Rule: my test must not be able to flatter me"
        ]
    },
    {
        "id": "fl_2",
        "title": "Tell me about a time you kept going when something was hard",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud.\n\nSITUATION — Building Planck AI, my research agent, the hardest problem wasn't the AI — it was the providers. A run could be partway through a task, several searches and reads in, and if the AI provider hit a rate limit or went down, that work was lost.\n\nTASK — I wanted an agent people could rely on, not one that works when you're lucky.\n\nACTION — The easy option was to retry and hope. Instead I put three providers — Groq, Gemini and NVIDIA — behind one standard interface, so if one fails mid-task, the run moves to the next and keeps everything it's done so far. Then, instead of waiting for failures to happen, I caused them: I switched off the main provider on every single call to prove the switching really worked.\n\nRESULT — Even with the main provider off every time, it completed 30 out of 30 tasks. I care about seeing things through to something that actually works — not something that half-works and looks good in a demo.\n\nIN PLAIN WORDS — \n• Rate limit — a cap on how many requests a provider accepts per minute.\n• Failover — if one AI provider fails or hits its limit, the request moves to the next one automatically.\n• Fault injection — breaking something on purpose to prove the system survives it.",
        "category": "Failure & Learning",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Planck AI: providers failing mid-run, work lost",
            "Wanted reliable, not lucky",
            "Didn't retry and hope — built failover across 3 providers",
            "Keeps the work done so far",
            "Broke it on purpose: main provider off every call",
            "30/30 completed"
        ]
    },
    {
        "id": "fl_3",
        "title": "Tell me about a time you received difficult feedback",
        "description": "HOW TO ANSWER — STAR. Tell it as one story. Use the labels to remember the order, but never say them out loud. Check the details match what really happened, and adjust them before you use this.\n\nSITUATION — When I started mentoring MSc students, one of them told me honestly that our sessions weren't helping as much as they could — I was jumping straight to fixing their code, and the next week they'd be stuck on the same kind of problem.\n\nTASK — My first reaction, honestly, was a bit defensive: I was fixing their problems, wasn't that the point? But I had to admit they were right — they weren't learning to fix it themselves.\n\nACTION — So I changed my approach. Instead of fixing, I asked questions and let them drive the keyboard. I also noticed the same three problems coming up across all five students, so I built sessions around those three — environments, training that won't converge, and baseline first.\n\nRESULT — Students started solving those problems before our sessions, and the mentoring became far more useful. It taught me to ask for feedback earlier and to treat it as information, not criticism — the earlier it hurts, the cheaper it is.",
        "category": "Failure & Learning",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Mentee: you fix my code, but I don't learn",
            "First reaction defensive — then they were right",
            "Changed: ask questions, they drive",
            "Built sessions around the 3 recurring blockers",
            "They solved problems themselves",
            "Feedback is information — the earlier the cheaper"
        ]
    },
    {
        "id": "fl_4",
        "title": "What are your weaknesses, or areas you want to grow in?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. Two honest weaknesses, each with what you now do about it, then one area you want to grow in.\n\nTwo honest ones. Documentation used to linger on my list — when I'm deep in building, stopping to write it up feels like it breaks my focus. I know that about myself now, so I count it as part of \"done\" rather than an optional extra afterwards. Writing down how I evaluated each project, so anyone can check the numbers, came out of that.\n\nThe bigger one is that I can be too independent. My instinct is to keep working on something until it's good before I show anyone. I've learned that's expensive — showing rough work early almost always saves more time than fixing a big problem at the end. So I now deliberately share earlier than feels comfortable.\n\nThe area I most want to grow in is production AI at scale — evaluation and monitoring inside a real organisation with real data volumes. I've built it at project scale, and I want to learn how a mature team does it properly.",
        "category": "Failure & Learning",
        "memoryPoints": [
            "Documentation lingers → now part of 'done'",
            "Too independent → share rough work early",
            "Grow: production AI at scale",
            "Evaluation + monitoring with real data volumes"
        ]
    },
    {
        "id": "sb_1",
        "title": "What's your superpower at work?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nMaking AI trustworthy — not just impressive. Lots of people can get an AI prototype working in an afternoon. What I'm good at is the next step: finding where it quietly gets things wrong, and making it either right or honest about it.\n\nIn NeuroArc, a job application assistant I built, the AI scores how well a CV fits a job. I found it would sometimes claim a CV showed a skill it didn't — a confident, invented answer. A better prompt only asks the model to be honest. So I made it return each requirement with the exact quote from the CV as evidence, in a fixed format that code can check, and my code throws out any requirement whose quote isn't really in the CV before calculating the score.\n\nIt's the same instinct as rebuilding the CogniGraph test set when 90% looked too good. Don't take the model's word for it — check. Build it, then prove it.\n\nIN PLAIN WORDS — \n• Hallucination — when an AI states something confidently that isn't true.\n• Structured JSON — making the AI answer in a fixed format that code can check, instead of free text.",
        "category": "Strengths-Based",
        "coreStoryId": "neuroarc",
        "memoryPoints": [
            "Making AI trustworthy, not just impressive",
            "NeuroArc: model invented CV evidence",
            "Must quote the CV, in checkable JSON",
            "Code drops any quote not really in the CV",
            "Don't take the model's word — check"
        ]
    },
    {
        "id": "sb_2",
        "title": "What do you pick up faster than most?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nNew AI tools and techniques — because I learn them by building, from the bottom up.\n\nFor Planck AI, I could have used an agent framework, but I built the agent loop myself in Python — the model picks a tool, my code runs it, the result goes back, repeat. Doing it by hand meant I understood what frameworks like LangGraph actually do underneath, so picking those tools up afterwards was quick: I already knew what they were doing for me.\n\nSame with FruitGuard: I needed real-time speed, so I converted my model to ONNX Runtime and kept measuring until it hit 73 frames per second.\n\nIn a field where the tools change every few months, I think that's what matters — understand the idea underneath, and any new tool is just a new interface to it.\n\nIN PLAIN WORDS — \n• LLM agent — an AI that picks a tool (search, run code, read a file), looks at the result, and repeats until it can answer.\n• Agent framework — a library like LangGraph that runs the agent loop for you.\n• ONNX Runtime — a fast engine for running a trained model in production.",
        "category": "Strengths-Based",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "New AI tools — I learn by building from the bottom up",
            "Planck: built the agent loop myself, no framework",
            "So LangGraph etc. are quick — I know what they do underneath",
            "FruitGuard: ONNX Runtime, measured to 73 FPS",
            "Understand the idea → any tool is just an interface"
        ]
    },
    {
        "id": "sb_3",
        "title": "What fuels your drive and keeps you going?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nKnowing that something I built actually works for a real person — not just a good score on a chart.\n\nThe moment I remember most from my MSc is when FruitGuard hit 73 frames per second. Not because the number was impressive, but because a harvesting robot needs at least 30. When I crossed that line, the project stopped being a dissertation and became something a machine in a field could really use.\n\nIt goes back further, too — my first paper was about recognising currency for visually impaired people. That idea of technology working for someone is what keeps me going through the unglamorous parts, like rebuilding a test set or rerunning experiments.",
        "category": "Strengths-Based",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "My work actually working for a real person",
            "FruitGuard 73 FPS vs robot's 30 → real, not academic",
            "First paper: currency recognition for visually impaired people",
            "Gets me through the unglamorous parts"
        ]
    },
    {
        "id": "sb_4",
        "title": "Are you more of a starter or a finisher?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nHonestly, I'm a starter by nature. I get genuinely excited at the beginning — working out the approach, spotting the risks, imagining what will make it useful.\n\nBut I've learned that finishing properly is where the value is, so I've built habits around it. Before I build, I decide what \"done\" looks like as a number. In Planck AI, I wrote the test questions and grading rubric and committed them to Git before the first run — so I couldn't quietly lower the bar later. And with FruitGuard I didn't stop at a trained model; I took it through to a fast, deployed live demo.\n\nSo I'd say I'm a starter who has trained himself to finish — properly, with proof.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Starter by nature: approach, risks, usefulness",
            "Finishing is where the value is",
            "Decide 'done' as a number first",
            "Planck: rubric in Git before the first run",
            "FruitGuard: model → deployed demo",
            "A starter trained to finish, with proof"
        ]
    },
    {
        "id": "sb_5",
        "title": "How do you make time work for you?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nI protect focused time for the hardest work and keep the small stuff in fixed slots. During my MSc I had my dissertation, modules, two projects and weekly mentoring all at once — so the dissertation got my best hours first, and everything else went around it.\n\nWith AI work especially, it's easy to keep tweaking forever. So I decide up front what result means \"done\", and I change one thing at a time so every experiment actually teaches me something. If a change isn't helping, I stop and move on.\n\nAnd I measure before I act. At Accenture, measuring first is what found the real cause of slow APIs straight away, instead of guessing. It feels slower at the start and saves a lot of time overall.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Protect best hours for hardest work",
            "MSc: dissertation first, rest around it",
            "Decide 'done' up front; one change at a time",
            "Stop if a change isn't helping",
            "Measure before acting (Accenture N+1)"
        ]
    },
    {
        "id": "sb_6",
        "title": "What tends to linger on your to-do list, and why?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nDocumentation tends to stay longest. Not because I don't value it — but when I'm in the middle of building, stopping to write it up feels like it breaks my focus. I know that about myself, so I schedule it as part of finishing rather than leaving it as a vague \"later\". Writing up how I evaluated each project is exactly what makes the numbers trustworthy, so it matters.\n\nThe other thing is asking for feedback early. I can be too independent — I want something to be good before I show anyone. But mentoring taught me how much faster people improve with early, honest feedback, so I now share rough work sooner than feels comfortable.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Documentation lingers — breaks my focus",
            "Now part of finishing; it makes numbers trustworthy",
            "Early feedback lingers — too independent",
            "Mentoring showed me early feedback is faster"
        ]
    },
    {
        "id": "sb_7",
        "title": "What's a proud moment you've made happen, and how?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study.\n\nFruitGuard, my dissertation. The challenge was detecting fruit for a harvesting robot using only 207 labelled images — 34 times less than the dataset the model was first trained on — and it had to be fast enough for a real robot, not just score well on a test.\n\nI made it happen with two-phase transfer learning — learn fruit in general from a bigger dataset, then fine-tune on mine — and inverse frequency weighting so the rare fruits weren't ignored. I proved every gain against a fair baseline, so I knew it was real and not luck.\n\nIt reached 96.3% accuracy and ran at 73 frames per second when the robot needed 30, and I deployed it as a live demo. Research question to something that actually runs — that's what I'm proudest of.\n\nIN PLAIN WORDS — \n• Transfer learning — start from a model that already learned from lots of similar images, then teach it your task with a few examples.\n• Inverse frequency weighting — mistakes on rare classes count more, so the model can't ignore them.\n• Baseline — the fair 'before' you compare against — here, the same model starting from standard COCO weights.",
        "category": "Strengths-Based",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "FruitGuard: 207 images, 34x less data",
            "Transfer learning + inverse frequency weighting",
            "Every gain proved against a fair baseline",
            "96.3%, 73 FPS vs 30 needed, live demo",
            "Research question → something that runs"
        ]
    },
    {
        "id": "sb_8",
        "title": "Why does this role feel like the right fit for your strengths?",
        "description": "HOW TO ANSWER — Natural paragraphs, no STAR. This is a strengths question: it tests self-awareness, so talk like a person, not a case study. Tailor the middle to the company's real AI work.\n\nThis role needs someone who can take an AI idea and turn it into something people rely on every day. That's exactly what I'm best at.\n\nIt needs two things: engineering habits and real AI depth. Accenture gave me the engineering side — production APIs, measuring before fixing, a 40% latency cut. My MSc gave me the AI side — an agent with failover, a RAG system I tested honestly, a vision model running in real time. [Link one thing from their job description to one of your projects.]\n\nAnd my strongest instinct fits it too: I don't trust an AI system until I've proved it works. So this role isn't a stretch — it's where my strengths already point.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Role = AI idea → something people rely on",
            "Engineering habits (Accenture) + AI depth (MSc)",
            "Link their job description to one project",
            "My instinct: prove it works before trusting it"
        ]
    },
    {
        "id": "cl_1",
        "title": "Questions to ask the engineer or hiring manager",
        "description": "HOW TO ANSWER — Pick two or three. The best question is always a follow-up on something they said during the interview — it proves you were listening.\n\n• How do you evaluate your AI features today — is there a shared test set or harness, or does each feature bring its own?\n• When an LLM provider fails or slows down in production, what happens — is there a fallback?\n• What would the first six months look like for someone joining at my level — contributing to an existing system, or owning a piece end to end?\n• From your experience, what separates the people who ramp up fastest here?\n• What do you enjoy most about working on this team?\n\nCLOSE — \"Thank you — this has genuinely made me more excited about the role. What are the next steps in the process?\" Say it warmly, then stop talking.",
        "category": "Closing Strategy",
        "memoryPoints": [
            "Best question = follow-up to something they said",
            "How do you evaluate AI features? Shared harness?",
            "What happens when an LLM provider fails?",
            "First six months: contribute or own?",
            "Close: 'More excited now — what are the next steps?'"
        ]
    },
    {
        "id": "cl_2",
        "title": "Questions to ask the recruiter",
        "description": "HOW TO ANSWER — Never ask the engineer about salary. Never ask the recruiter about architecture.\n\n• What are the next steps, and how many stages are there?\n• What's the expected timeline for a decision?\n• Could you share the salary range and bonus structure?\n• Is the role hybrid or office-based, and how many days on site?\n• What's the expected start date?\n\nRIGHT TO WORK — If they ask, say it simply: \"I'm on the UK Graduate Route visa, valid until 2028, so I don't need sponsorship.\" Then move on.\n\nCLOSE — \"Thank you — this has genuinely made me more excited about the role. What are the next steps in the process?\"",
        "category": "Closing Strategy",
        "memoryPoints": [
            "No salary for engineer, no architecture for recruiter",
            "Stages, timeline, salary + bonus",
            "Hybrid/office, start date",
            "Visa: Graduate Route to 2028 — no sponsorship",
            "Close: 'What are the next steps?'"
        ]
    }
] as DefaultTask[];
