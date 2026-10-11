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
 * stamped with an older version is rewritten from this file once (the very
 * first text replaced is kept on the document as previousDescription /
 * previousMemoryPoints). See utils/contentSync.ts.
 */
export const CONTENT_VERSION = 3;

/**
 * Questions whose title changed, so the sync can still find the stored
 * document under its old title. id -> old titles.
 */
export const PREVIOUS_TITLES: Record<string, string[]> = {
    cd_1: ['Why did you leave Accenture after two years?'],
};

// Answer format, rendered by FullAnswer in TaskItem.tsx: paragraphs are
// separated by a blank line. STAR answers mark each paragraph with
// "SITUATION — " / "TASK — " / "ACTION — " / "RESULT — " (shown only on hover).
// "IN SHORT — ", "IN PLAIN WORDS — " and "CHECK — " paragraphs show at the end.
export const defaultTasks: DefaultTask[] = [
    {
        "id": "pb_1",
        "title": "Tell me about yourself / Walk me through your CV",
        "description": "I'm Manoj. I'm an AI engineer with a software engineering background. I've just finished my MSc in Artificial Intelligence at Aston University, with a Distinction. What I'm good at is building AI systems and then proving they really work, with honest tests, not just a nice demo.\n\nI started my career as a software engineer at Accenture. I built REST APIs in Java Spring Boot, in a team of seven. My biggest win there was speed. Our p95 latency, which is the waiting time for the slowest 5% of requests, was about 850 milliseconds. I brought it down to 510, so 40% faster, across 18 endpoints. The code was asking the database lots of small questions instead of one big one, and I fixed that.\n\nAfter Accenture I worked at a startup in Nepal, [your role, and one thing you built there]. I had already co-written a published deep learning paper during my bachelor's, and I wanted to go much deeper into AI. So I came to the UK for my MSc.\n\nAt Aston I built four AI projects, and I tested each one properly. FruitGuard, my dissertation, spots fruit for a harvesting robot. It learned from only 207 labelled photos, reached 96% accuracy, and runs at 73 frames per second. Planck AI is a research assistant agent. It finished 30 out of 30 tasks even when I switched off its main AI provider on purpose. And in CogniGraph, I found my own test was making the system look 35 points better than it really was, so I rebuilt the test to be honest. I also mentored five MSc students every week.\n\nNow I'm looking for a role where I can build AI that people really rely on, in a team that cares about checking that it works.\n\nCHECK — Fill in the [bracket] with your real startup role before using this.\n\nIN SHORT — Who I am now (AI engineer, MSc with Distinction). How I got here (Accenture, a startup in Nepal, then four MSc projects). What I want next (AI that people can rely on). The thread: I build it, then I prove it works.\n\nIN PLAIN WORDS — \n• p95 latency — How long the slowest users wait. If p95 is 850 ms, then 95 out of every 100 requests finish within 850 ms, and only the slowest 5 take longer.\n• REST API — A way for one app to ask a server for data over the web. Like a waiter taking your order to the kitchen and bringing the food back.\n• Spring Boot — A popular Java toolkit for building APIs quickly.\n• Endpoint — One specific address an app can call, like /orders or /customers.\n• AI agent — An AI that doesn't just answer. It decides which tool to use, like web search or running code, looks at the result, and keeps going until it can answer.\n• LLM provider — A company that runs the AI model you call over the internet, like Groq, Gemini or NVIDIA.",
        "category": "Personal Background",
        "memoryPoints": [
            "Now: AI engineer, MSc AI Aston, Distinction",
            "Accenture: Spring Boot APIs, p95 850 → 510 ms (40%)",
            "Startup in Nepal → published paper → wanted AI depth → UK MSc",
            "FruitGuard 207 photos / 96% / 73 FPS",
            "Planck 30/30 · CogniGraph honest test · mentored 5 students",
            "Next: AI people rely on. Build it, then prove it"
        ]
    },
    {
        "id": "pb_2",
        "title": "Tell me about yourself — short version (phone screens)",
        "description": "I'm Manoj, an AI engineer. I've just finished an MSc in Artificial Intelligence at Aston, with a Distinction.\n\nBefore that, I was a software engineer at Accenture, where I made our APIs 40% faster, and then I worked at a startup in Nepal. At Aston I built AI projects and tested them properly. One is a fruit detector that reaches 96% accuracy from just 207 photos. Another is a research agent that finished 30 out of 30 tasks, even with its main AI provider switched off.\n\nNow I'm looking for an AI engineering role, building things people really rely on. I'm on the Graduate Route visa until 2028, so I don't need sponsorship.\n\nIN SHORT — A 30-second version: AI engineer with a Distinction, real industry experience, two projects with strong numbers, and no visa sponsorship needed.",
        "category": "Personal Background",
        "memoryPoints": [
            "AI engineer, MSc AI Aston, Distinction",
            "Accenture: 40% faster APIs → startup in Nepal",
            "96% from 207 photos · 30/30 with provider off",
            "Want: AI people rely on",
            "Graduate Route to 2028, no sponsorship"
        ]
    },
    {
        "id": "pb_3",
        "title": "What have you been doing since graduating?",
        "description": "Since I finished in July, I've focused on two things: finding the right role, and keeping my skills sharp.\n\nFirst, my projects. I've made sure everything on my CV can be checked. There are live demos, clean GitHub code, and the test results are written down so anyone can see how I measured them. [Add one real thing you've built or improved since July.]\n\nSecond, practice. I study system design, coding problems and machine learning basics every day. I even built my own study app to keep track of it. And I've been interviewing, which helps too, because every interview shows me something to improve.\n\nSo the honest answer is: building, studying and interviewing, and getting a bit better every week.\n\nCHECK — Fill in the [bracket] with something real you did since July.\n\nIN SHORT — I haven't been sitting still: I made my projects easy to check, I study every day, and I learn from every interview.",
        "category": "Personal Background",
        "memoryPoints": [
            "Two goals: right role + stay sharp",
            "Projects easy to check: demos, clean code, results written down",
            "Daily: system design, coding, ML basics",
            "Built my own study app",
            "Every interview shows something to improve"
        ]
    },
    {
        "id": "cd_1",
        "title": "Why did you leave Accenture, and what did you do before your MSc?",
        "description": "I joined Accenture straight after my degree and worked there for about seven months, building APIs in Java Spring Boot. It taught me how real production software works, with two-week sprints and code that real users depend on. My best piece of work there was making our APIs 40% faster.\n\nI left to join a startup in Nepal, [your real reason in one positive line, for example: to be closer to family, or to get more ownership in a small team]. In a startup you do a bit of everything, and [one line on your role and one thing you built].\n\nThe whole time, I kept being pulled towards AI. I had already co-written a deep learning paper in my final year, and I wanted real depth, not just surface knowledge. So I came to the UK for an MSc in AI at Aston, and I finished with a Distinction. Now I bring both: engineering habits from industry, and real AI skills from my studies.\n\nCHECK — Fill in both [brackets]. Keep it short and positive, and never criticise Accenture.\n\nIN SHORT — I left for a startup in Nepal. I'd always been drawn to AI, so I did the MSc. Now I have both engineering experience and AI depth.\n\nIN PLAIN WORDS — \n• Spring Boot — A popular Java toolkit for building APIs quickly.\n• Two-week sprint — The team plans a small batch of work, finishes it in two weeks, then plans the next batch.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Accenture ~7 months: real production work, 40% faster APIs",
            "Left for a startup in Nepal [real reason, positive]",
            "Startup: a bit of everything [your role]",
            "Always pulled to AI: published paper in final year",
            "MSc AI Aston, Distinction → engineering + AI"
        ]
    },
    {
        "id": "cd_2",
        "title": "Why did you move from software engineering into AI?",
        "description": "Because AI was always where I was heading. It started in my bachelor's, when I co-wrote a paper on using deep learning to recognise bank notes for people who are visually impaired.\n\nAt Accenture I liked that the work was easy to measure. The APIs either got faster or they didn't. With AI, I noticed the hard part isn't building the model. The hard part is knowing whether it really works. A lot of AI looks great in a demo and then falls apart with real users and messy real data.\n\nSo I didn't swap engineering for AI. I added AI on top of engineering. Every project in my MSc has a proof step: a fair comparison, an honest test, or code that checks what the AI says. That's what I bring. I can build the model, and I can build the checks around it that make it reliable.\n\nIN SHORT — AI was always my interest. Engineering taught me to measure things. Now I use that habit to make AI that really works, not just AI that looks good.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Always heading there: deep learning paper in bachelor's",
            "Accenture: work was easy to measure",
            "Hard part of AI = knowing if it really works",
            "Added AI on top of engineering, didn't swap",
            "Build the model + the checks around it"
        ]
    },
    {
        "id": "cd_3",
        "title": "Why this specific role?",
        "description": "This role needs someone who can take an AI idea and turn it into something people use every day and can trust. That's exactly what I've been working towards.\n\nTo do that well, you need two things. First, good engineering habits. Accenture gave me those: real production APIs, two-week sprints, and measuring a problem before fixing it. Second, real AI skills. My MSc gave me those: an AI agent that keeps working when a provider fails, a document search system I tested honestly, and a vision model that runs in real time. [Name one thing from their product or job advert, and link it to one of your projects.]\n\nSo this role isn't a stretch for me. It's the natural next step from what I've already been doing.\n\nCHECK — Fill in the [bracket] for each company before the interview.\n\nIN SHORT — The role needs engineering + AI, and I have both. Link one thing they do to one thing I built.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Role = AI idea → something people use and trust",
            "Engineering habits (Accenture) + AI skills (MSc)",
            "Link one of their products to one of my projects",
            "Natural next step, not a stretch"
        ]
    },
    {
        "id": "cd_4",
        "title": "What are you looking for in your next role?",
        "description": "I'm looking for a place where I can ship real work that matters, and learn from a strong engineering team. In practice that means clear goals, regular feedback, and good habits like code reviews, automated testing, CI/CD, and monitoring things once they're live.\n\nI learn best when I own something from start to finish. I break it down, get a first version out quickly, then improve it by measuring how well it works. I like teams where it's normal to ask questions early and talk openly about trade-offs.\n\nAI work is what excites me most, but I'm just as happy to start as a solid engineer on the team. What I want most is to build things people use every day, and to know how well they work.\n\nIN SHORT — A strong team, good engineering habits, ownership from start to finish, and ideally AI work.\n\nIN PLAIN WORDS — \n• CI/CD — Every code change is tested and released automatically, so releases are small and safe.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Ship real work, learn from a strong team",
            "Good habits: code review, testing, CI/CD, monitoring",
            "Own it start to finish: first version fast, then improve",
            "Ask early, talk about trade-offs",
            "AI excites me most, but happy to start as an engineer"
        ]
    },
    {
        "id": "cd_5",
        "title": "Where do you see yourself in three to five years?",
        "description": "I want to be the engineer a team trusts with its hard AI problems. Not just building features, but owning how a system is tested, made reliable, and put into production. I'd especially like to get deep into AI agents, because that's where the field is going, and it's what I've been building towards with Planck AI.\n\nI care more about impact than about a title. By then, I'd like to be helping newer engineers. I really enjoyed mentoring five MSc students. I'd also like to help the team work better, with better testing and clearer documentation.\n\nAnd I want to keep learning from people who are better than me, because that's always where I've grown the fastest.\n\nIN SHORT — Trusted with hard AI problems, deeper in AI agents, helping others grow, and still learning.\n\nIN PLAIN WORDS — \n• AI agent — An AI that doesn't just answer. It decides which tool to use, like web search or running code, looks at the result, and keeps going until it can answer.",
        "category": "Career Decisions",
        "memoryPoints": [
            "Trusted with hard AI problems",
            "Own testing, reliability, production",
            "Deeper in AI agents (Planck AI)",
            "Impact over title; help newer engineers (mentoring)",
            "Keep learning from better people"
        ]
    },
    {
        "id": "ta_1",
        "title": "What was your most significant technical achievement at Accenture?",
        "description": "SITUATION — At Accenture, I was in a team of seven engineers building REST APIs in Java Spring Boot. I was responsible for the business logic and the data-access layer, which is the code that talks to the database. Some of our APIs were too slow. Our p95 latency, meaning the waiting time for the slowest 5% of requests, was about 850 milliseconds.\n\nTASK — Because I owned the database code, it was my job to make it faster, without changing what the APIs returned.\n\nACTION — First, I measured before changing anything. I looked at the actual database queries each slow API was running, and I kept seeing the same problem. It's called an N+1 query. The code asked the database for a list, and then asked again for every single item in the list. So a list of 50 items meant 51 trips to the database. I found six places doing this, and I rewrote them so each one got all its data in one go. Then I measured the same APIs again, in the same way, so the before and after were a fair comparison.\n\nRESULT — p95 latency dropped from about 850 to 510 milliseconds across 18 APIs. That's 40% faster. What I learned is to measure first, because the slow part is rarely where you'd guess. I've used that habit in every project since.\n\nIN SHORT — Our APIs were slow. I measured, found the code was making far too many database trips, fixed six places, and made it 40% faster.\n\nIN PLAIN WORDS — \n• p95 latency — How long the slowest users wait. If p95 is 850 ms, then 95 out of every 100 requests finish within 850 ms, and only the slowest 5 take longer.\n• N+1 query — When code asks the database once for a list, then once more for every item in that list. A list of 50 items means 51 trips to the database, when 1 or 2 would do.\n• REST API — A way for one app to ask a server for data over the web. Like a waiter taking your order to the kitchen and bringing the food back.\n• Data-access layer — The part of the code whose only job is reading from and writing to the database.\n• Spring Boot — A popular Java toolkit for building APIs quickly.\n• Endpoint — One specific address an app can call, like /orders or /customers.",
        "category": "Tech Achievements",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "Team of 7, Spring Boot, I owned the database code",
            "p95 (slowest 5%) about 850 ms",
            "Measured first → 6 N+1 queries (50 items = 51 trips)",
            "Rewrote them to get data in one go, measured again",
            "510 ms across 18 APIs, 40% faster"
        ]
    },
    {
        "id": "ta_2",
        "title": "Tell me about a project you're particularly proud of",
        "description": "SITUATION — My MSc dissertation, FruitGuard. A harvesting robot needs to spot fruit in real time, at least 30 frames per second. But I only had 207 labelled photos, and some fruits appeared much more often than others.\n\nTASK — My job was to build a fruit detector that was accurate and fast enough for a robot, from very little data, and to prove the results were real and not luck.\n\nACTION — I used YOLOv8, a fast model for finding objects in pictures. I trained it in two steps. First on a bigger set of 7,108 fruit photos, so it learned what fruit looks like in general. Then on my 207 photos for the exact job. That's 34 times less labelled data. To stop it ignoring the rare fruits, I made mistakes on rare fruits count more during training. To prove it worked, I compared it fairly against the same model starting from standard settings. Finally, I ran it with ONNX Runtime, a fast engine for running models, to make it quicker.\n\nRESULT — It reached 96.3% accuracy, that's 52 out of 54 fruits right. It also beat the standard version by 6 points on the main detection score, and by 3 points on precision. And it ran at 73 frames per second, more than double what the robot needed. I put it online as a live demo. I'm proud of it because it went from a research question to something that really runs.\n\nIN SHORT — With only 207 photos, I built a fruit detector for a robot that is 96% accurate and runs at 73 FPS, and I proved it with a fair comparison.\n\nIN PLAIN WORDS — \n• YOLOv8 — A well-known, fast AI model that finds objects in a picture and draws boxes around them.\n• Transfer learning — Starting from a model that has already learned from lots of similar pictures, then teaching it my specific job with a few examples. Like an experienced cook learning one new dish.\n• Fine-tuning — The second step of transfer learning: a short extra round of training on my own small set of photos.\n• Class imbalance — Some fruits appear far more often than others in the photos, so a model can get lazy and ignore the rare ones.\n• Inverse frequency weighting — Mistakes on rare fruits cost more during training, so the model is forced to learn them properly.\n• Baseline — The fair 'before' picture I compare against. Here: the same model, trained the same way, but starting from standard general-purpose settings (called COCO).\n• mAP — The standard score for object detection. It checks two things: did the model find the object, and did it draw the box in the right place. Higher is better.\n• Precision — Out of everything the model called fruit, how much really was fruit. High precision means the robot rarely grabs a leaf by mistake.\n• ONNX Runtime — A fast engine for running a trained model in the real world, separate from the code used to train it.\n• FPS (frames per second) — How many camera pictures it can check every second. Normal video is about 30, so 73 is comfortably real-time.",
        "category": "Tech Achievements",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Robot needs 30+ FPS; only 207 photos, uneven fruit types",
            "YOLOv8, trained in 2 steps: 7,108 photos, then my 207 (34x less)",
            "Rare-fruit mistakes count more",
            "Fair comparison → +6 points mAP, +3 points precision",
            "96.3% (52/54), ONNX → 73 FPS, live demo"
        ]
    },
    {
        "id": "ta_3",
        "title": "Tell me about the most complex project you've built",
        "description": "SITUATION — Planck AI, a research assistant agent. You ask it a question, and it plans and uses tools to find the answer. It can search the web, run code in seven languages, read PDFs and web pages, and look at images. It can take up to eight steps before it answers.\n\nTASK — I wanted it to be reliable, not just impressive once. And I wanted to understand every part of it. So I built the agent myself in Python, without using a ready-made agent framework.\n\nACTION — I did three main things. First, the agent loop: the AI picks a tool, my code runs it, gives the result back, and this repeats until it can answer. Second, I made it survive failures. AI providers sometimes fail or hit their limits, so I connected three of them, Groq, Gemini and NVIDIA, through one standard interface. If one fails in the middle of a task, the work moves to the next one and carries on. Third, I tested it honestly. I wrote 30 test questions and a marking scheme, and I saved the marking scheme in Git before the first test, so I couldn't change the rules after seeing the results.\n\nRESULT — Even with the main provider switched off on every single call, it still finished 30 out of 30 tasks. It chose the right tool 80% of the time. The typical answer took 2.7 seconds. And out of the 20 tasks my marking scheme could grade, it gave no wrong answers.\n\nIN SHORT — I built an AI research agent from scratch that uses four tools, keeps working when an AI provider fails, and I tested it with rules I fixed in advance.\n\nIN PLAIN WORDS — \n• AI agent — An AI that doesn't just answer. It decides which tool to use, like web search or running code, looks at the result, and keeps going until it can answer.\n• Agent framework — A ready-made library, like LangGraph, that runs the agent's steps for you. In Planck AI I wrote those steps myself.\n• Tool calling — The AI asks for a tool by name, my code runs that tool, and gives the result back to the AI.\n• LLM provider — A company that runs the AI model you call over the internet, like Groq, Gemini or NVIDIA.\n• Failover — If one AI provider fails, the work moves to the next provider automatically and carries on.\n• OpenAI-compatible interface — One standard way of talking to all three providers, so switching between them is easy.\n• Fault injection — Breaking something on purpose to prove the system survives it. I switched off the main provider on every call.\n• Golden set — A fixed list of test questions with agreed right answers, so every test run is marked the same way.\n• Rubric — The marking scheme: what counts as a right answer. I saved it in Git before the first test, so I couldn't change it after seeing the results.\n• Median latency — The typical waiting time. Half the answers are faster than this, half are slower.",
        "category": "Tech Achievements",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Research agent: 4 tools, up to 8 steps",
            "Built it myself, no framework",
            "Switches between Groq, Gemini and NVIDIA mid-task",
            "Marking scheme saved in Git before first test",
            "Main provider off every call → 30/30",
            "80% right tool, 2.7 s typical, 0 wrong of 20"
        ]
    },
    {
        "id": "ps_1",
        "title": "Walk me through a time you had to debug a critical production issue",
        "description": "SITUATION — The most serious live problem I owned was at Accenture. Our APIs were too slow for our slowest users. The p95 latency, meaning the waiting time for the slowest 5% of requests, was about 850 milliseconds.\n\nTASK — I was responsible for the database code, so I had to find the real cause and fix it, without changing what any API returned.\n\nACTION — When something is live, it's tempting to guess and patch quickly. I did the opposite and measured first. I looked at the real database queries each slow API was running, and the pattern was clear. It was an N+1 problem: the code got a list, and then asked the database again for every item in the list. I found six places doing this, rewrote them so each got its data in one go, and then measured the same APIs again in the same way.\n\nRESULT — p95 latency fell from about 850 to 510 milliseconds across 18 APIs, 40% faster. What I learned: when you're under pressure, measuring first feels slower, but it's actually faster. You fix the real cause once, instead of guessing three times.\n\nIN SHORT — Same performance story, but the focus is the method: don't guess, measure first, fix the real cause, then measure again.\n\nIN PLAIN WORDS — \n• p95 latency — How long the slowest users wait. If p95 is 850 ms, then 95 out of every 100 requests finish within 850 ms, and only the slowest 5 take longer.\n• N+1 query — When code asks the database once for a list, then once more for every item in that list. A list of 50 items means 51 trips to the database, when 1 or 2 would do.",
        "category": "Problem Solving",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "Accenture APIs, p95 about 850 ms",
            "Didn't guess, measured the real queries",
            "Found 6 N+1 problems",
            "Rewrote them, measured again the same way",
            "510 ms, 18 APIs, 40% faster",
            "Measuring first is slower to start, faster to finish"
        ]
    },
    {
        "id": "ps_2",
        "title": "Tell me about a difficult technical challenge you faced",
        "description": "SITUATION — In FruitGuard, my dissertation, I had two problems at the same time. I only had 207 labelled photos, which is very small for this kind of model. And some fruits appeared much more often than others.\n\nTASK — Together, these meant a normal model would learn the common fruits and quietly ignore the rare ones. I had to fix both problems, and prove the fixes really helped.\n\nACTION — I fixed each problem directly. For the small amount of data, I used transfer learning. I trained the model on 7,108 fruit photos first, so it already understood fruit, then trained it again on my 207. For the uneven fruit types, I made mistakes on rare fruits count more during training, so the model couldn't ignore them. And to be sure the improvements were real, I compared against a fair baseline and changed one thing at a time.\n\nRESULT — It reached 96.3% accuracy, 52 out of 54, and scored 6 points higher than the baseline on the main detection score, while still running at 73 frames per second. What I learned: name each problem separately, and give each one its own fix and its own proof.\n\nIN SHORT — Two problems, too little data and uneven fruit types. I gave each its own fix, proved it with a fair comparison, and got 96% accuracy.\n\nIN PLAIN WORDS — \n• Transfer learning — Starting from a model that has already learned from lots of similar pictures, then teaching it my specific job with a few examples. Like an experienced cook learning one new dish.\n• Class imbalance — Some fruits appear far more often than others in the photos, so a model can get lazy and ignore the rare ones.\n• Inverse frequency weighting — Mistakes on rare fruits cost more during training, so the model is forced to learn them properly.\n• Baseline — The fair 'before' picture I compare against. Here: the same model, trained the same way, but starting from standard general-purpose settings (called COCO).\n• mAP — The standard score for object detection. It checks two things: did the model find the object, and did it draw the box in the right place. Higher is better.",
        "category": "Problem Solving",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Only 207 photos + uneven fruit types",
            "Normal model ignores rare fruits",
            "Little data → transfer learning (7,108, then 207)",
            "Uneven types → rare-fruit mistakes count more",
            "Fair baseline, one change at a time",
            "96.3%, +6 points mAP, 73 FPS"
        ]
    },
    {
        "id": "ps_3",
        "title": "Describe a time you solved a problem with incomplete information",
        "description": "SITUATION — In CogniGraph, my document question-answering system, I had to choose a chunk size. That's how long each piece of a document should be when you cut it up for searching. There's no textbook answer. It depends on your documents and your model.\n\nTASK — I needed to choose a size I could really defend, not just one that looked good on a chart.\n\nACTION — I ran a test comparing different sizes, and it said 2,000 characters was best. Before trusting it, I checked how the test was set up, and I found two problems. First, the test wasn't fair. Each run had a different amount of text in it, so I couldn't tell whether the chunk size or the amount of text caused the result. Second, I tested the embedding model directly, and proved it quietly ignores everything after about 1,400 characters. So a 2,000-character chunk was really only being judged on its first 1,400.\n\nRESULT — I set the chunk size to 1,000 characters, the largest size that safely fits inside what the model actually reads. What I learned: when you don't have full information, check the test before you trust the result.\n\nIN SHORT — A test told me to use 2,000-character chunks. I checked the test, found it was unfair and that the model only reads about 1,400 characters, and chose 1,000.\n\nIN PLAIN WORDS — \n• Chunk size — How long each piece of a document is when you cut it up for searching.\n• Embedding — Turning text into a list of numbers that captures its meaning, so similar ideas end up close together.\n• Confounded — The test wasn't fair, because something else changed at the same time, so you can't tell what really caused the result.",
        "category": "Problem Solving",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "CogniGraph: choose a chunk size, no textbook answer",
            "Test said 2,000 characters was best",
            "Checked it: unfair (different amounts of text)",
            "Model ignores text after ~1,400 characters",
            "Chose 1,000, the largest that fits",
            "Check the test before trusting the result"
        ]
    },
    {
        "id": "ps_4",
        "title": "Tell me about a time you had to prioritise competing demands",
        "description": "SITUATION — In autumn 2025, during my MSc, everything came at once. I had my dissertation, my modules, five students I mentored every week, and two projects I was building, Planck AI and NeuroArc.\n\nTASK — There weren't enough hours to do everything equally well, so I had to prioritise honestly instead of pretending I could do it all.\n\nACTION — I ranked everything by deadline and by how much it mattered. The dissertation mattered most, so it got my best hours, protected before anything else. Mentoring was a promise to other people, so it went into fixed weekly slots that never moved. And for each project, I decided at the start what 'done' looked like as a number. For Planck AI, I wrote the test questions and marking scheme first. That way I could stop when I reached the target, instead of polishing forever.\n\nRESULT — Everything got delivered. Both projects went live with demos, the mentoring never slipped, and I finished the MSc with a Distinction. What I learned: decide what 'done' means before you start, and give your best hours to the thing that matters most.\n\nIN SHORT — Too much at once. I ranked by importance, protected time for the dissertation, fixed slots for mentoring, set a clear 'done' for each project, and delivered everything.",
        "category": "Problem Solving",
        "memoryPoints": [
            "Autumn 2025: dissertation + modules + mentoring 5 + 2 projects",
            "Ranked by deadline and importance",
            "Dissertation got my best hours",
            "Mentoring in fixed slots, people depend on it",
            "Each project: clear 'done' decided first",
            "All delivered → Distinction"
        ]
    },
    {
        "id": "ld_1",
        "title": "Tell me about a time you took initiative without being asked",
        "description": "SITUATION — I mentored five MSc AI students, one-to-one, every week. My role was simply to help them with Python and machine learning, with whatever they brought along.\n\nTASK — After a few weeks, I noticed I was solving the same problems again and again for different students. Nobody asked me to change anything, but answering the same question five times wasn't helping anyone much.\n\nACTION — I kept track of what came up, and found three problems that kept coming back. Setting up Python environments. Training that wouldn't improve. And jumping to a complicated model before trying a simple one first. So I built the sessions around those three: a reliable way to set up a project, a checklist for when a model won't learn, and the habit of building a simple baseline first.\n\nRESULT — The sessions changed from fixing emergencies to building real skills, and students started solving these problems on their own. What I learned: taking initiative means spotting the pattern behind the problems, and fixing the pattern.\n\nCHECK — The three problems are on your CV. Make sure the result matches what really happened.\n\nIN SHORT — While mentoring, I noticed the same three problems kept coming up, so without being asked, I built my sessions around them.\n\nIN PLAIN WORDS — \n• Python environment — A clean, separate set of installed libraries for one project, so projects don't break each other.\n• Training not converging — The model trains but never gets better. Usually a bug, a bad setting, or bad data.\n• Simple baseline — The simplest reasonable model. If a fancy model can't beat it, the fancy part isn't helping.",
        "category": "Leadership",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Mentored 5 MSc students weekly",
            "Noticed the same problems repeating",
            "3 problems: environments, training not improving, simple model first",
            "Built sessions around those 3",
            "From fixing emergencies to building skills",
            "Fix the pattern, not just the problem"
        ]
    },
    {
        "id": "ld_2",
        "title": "Describe a time you led a project or initiative",
        "description": "SITUATION — I led FruitGuard, my MSc dissertation, from start to finish. It was fruit detection for a harvesting robot, with only 207 labelled photos.\n\nTASK — The goal wasn't just to train a model. It was to design a test other people would trust, and to deliver something a robot could actually use.\n\nACTION — I set the targets at the start: good accuracy, a good detection score, and at least 30 frames per second for the robot. I set up a fair comparison, the same model trained the same way but starting from standard settings, so any improvement was clearly down to my approach. I designed the two-step training, ran the experiments, tracked every result the same way, and kept the real use in mind throughout, which is why I converted the model to ONNX Runtime to make it fast.\n\nRESULT — It reached 96.3% accuracy, 6 points better than the comparison on the main score, and 73 frames per second. I put it online as a live demo. Leading it taught me that planning how you'll prove something works matters just as much as building it.\n\nIN SHORT — I ran the whole project: set the targets, designed a fair test, did the work, and delivered a fast, working demo.\n\nIN PLAIN WORDS — \n• Baseline — The fair 'before' picture I compare against. Here: the same model, trained the same way, but starting from standard general-purpose settings (called COCO).\n• mAP — The standard score for object detection. It checks two things: did the model find the object, and did it draw the box in the right place. Higher is better.\n• ONNX Runtime — A fast engine for running a trained model in the real world, separate from the code used to train it.\n• FPS (frames per second) — How many camera pictures it can check every second. Normal video is about 30, so 73 is comfortably real-time.",
        "category": "Leadership",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "Led FruitGuard start to finish",
            "Targets set first: accuracy, mAP, 30+ FPS",
            "Fair comparison model",
            "Designed the training, tracked results, kept real use in mind",
            "96.3%, +6 points mAP, 73 FPS, live demo"
        ]
    },
    {
        "id": "ld_3",
        "title": "Tell me about a time you took ownership of something going wrong",
        "description": "SITUATION — At Accenture, our APIs were too slow for our slowest users. The p95 latency, the waiting time for the slowest 5% of requests, was about 850 milliseconds.\n\nTASK — I was responsible for the business logic and the database code, so slow database access was my problem. Nobody told me the cause. I just had the symptom: things were slow.\n\nACTION — I took it on from start to finish. I measured to find where the time really went, instead of fixing the first thing that looked likely. I found N+1 queries, which means the code made one database trip for every item instead of one trip for the whole list. I didn't stop at the worst one. I found and fixed all six places, then measured the same APIs again in the same way, so I could show the improvement was real.\n\nRESULT — p95 latency dropped from about 850 to 510 milliseconds across 18 APIs, 40% faster. To me, ownership means finishing the job properly, with proof, not stopping as soon as things look a bit better.\n\nIN SHORT — It was my code, so it was my problem. I found the real cause, fixed all six places, and proved it was 40% faster.\n\nIN PLAIN WORDS — \n• p95 latency — How long the slowest users wait. If p95 is 850 ms, then 95 out of every 100 requests finish within 850 ms, and only the slowest 5 take longer.\n• N+1 query — When code asks the database once for a list, then once more for every item in that list. A list of 50 items means 51 trips to the database, when 1 or 2 would do.\n• Data-access layer — The part of the code whose only job is reading from and writing to the database.",
        "category": "Leadership",
        "coreStoryId": "performance-fix",
        "memoryPoints": [
            "I owned the database code → my problem",
            "Had the symptom, not the cause",
            "Measured → N+1 queries",
            "Fixed all 6, not just the worst one",
            "Measured again: 850 → 510 ms, 18 APIs",
            "Ownership = finish it properly, with proof"
        ]
    },
    {
        "id": "co_1",
        "title": "Tell me about a time you disagreed with a colleague",
        "description": "SITUATION — When I was mentoring MSc students, one of them wanted to start their project with a complicated deep learning model straight away. I thought they should build a simple baseline first.\n\nTASK — It was their project, so my job wasn't to win the argument. It was to help them make a good decision themselves.\n\nACTION — First I asked what was behind it. Their real worry was that a simple model would look unambitious. So instead of arguing, I suggested a quick experiment: spend one afternoon on a simple model, so whatever the complicated model scored, they'd have something to compare it with. I also explained that a simple model catches data problems early. If it does strangely well or strangely badly, something is usually wrong with the data.\n\nRESULT — They built it, and it gave them a clear target the complicated model had to beat, which made their final results much more convincing. What I learned: when you disagree, a small experiment works better than a long debate, and it lets the other person reach the answer themselves.\n\nCHECK — This is built from your CV's mentoring line. Change the details to match a real session before using it.\n\nIN SHORT — A student wanted a complicated model first. I didn't argue. I suggested a quick simple model to compare against, and the result convinced them.\n\nIN PLAIN WORDS — \n• Simple baseline — The simplest reasonable model. If a fancy model can't beat it, the fancy part isn't helping.",
        "category": "Collaboration",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Student wanted complicated model first; I said simple first",
            "Their project: help them decide, don't win",
            "Asked why: worried simple looks unambitious",
            "Suggested a quick experiment, not an argument",
            "Simple model gave a clear target → stronger results",
            "Small experiment beats long debate"
        ]
    },
    {
        "id": "co_2",
        "title": "Tell me about a conflict with a teammate (backup story)",
        "description": "SITUATION — A teammate wanted to take a shortcut to hit a deadline, basically hardcoding some logic, and I felt it would cause real problems later.\n\nTASK — We needed to hit the deadline without creating a mess we'd have to clean up later, and keep a good working relationship.\n\nACTION — I kept the conversation about our shared goal, not about who was right. I asked questions first, to understand the pressure they were under. Then I explained both options with their pros and cons, and suggested a middle path: build the core part properly now, and leave the nice-to-have parts for later.\n\nRESULT — We agreed on that plan, hit the deadline, and never had to go back and rebuild it. We stayed on good terms because the conversation was about the result, not about the person.\n\nCHECK — Backup story you haven't confirmed yet. Only use it if it's a real situation you can talk about in detail.\n\nIN SHORT — A teammate wanted a quick shortcut. I listened first, showed both options, and we agreed on a middle path that hit the deadline.\n\nIN PLAIN WORDS — \n• Hardcoding — Writing fixed values straight into the code. Quick now, painful to change later.",
        "category": "Collaboration",
        "memoryPoints": [
            "Teammate wanted a hardcoded shortcut for a deadline",
            "Shared goal: on time, no mess",
            "Asked questions to understand their pressure",
            "Both options + pros and cons → middle path",
            "Hit deadline, no rework, still on good terms"
        ]
    },
    {
        "id": "co_3",
        "title": "Tell me about working with someone very different from you",
        "description": "SITUATION — The five MSc students I mentored came from very different backgrounds. Some had been programming for years. Others came from maths or other subjects and were new to Python.\n\nTASK — I had to help each of them get unstuck, even though the same explanation clearly didn't work for everyone.\n\nACTION — At first, I explained things the way I understood them, in technical terms, and assumed that was enough. It wasn't. Someone would nod, and then get stuck on the same thing the next week. So I changed how I worked. Before moving on, I asked them to explain the fix back to me in their own words. And I linked new ideas to what they already knew. For example, for a maths student, training a model is really just an optimisation problem.\n\nRESULT — The same problems stopped coming back the next week. It also made me much better at explaining technical things simply, which I think is one of the most useful skills an engineer can have. The best technical idea is useless if you can't bring people with you.\n\nCHECK — Make sure these details match what really happened, and adjust them before using this.\n\nIN SHORT — My students had very different backgrounds. I learned to check they really understood, by having them explain it back, and to link ideas to what they already knew.",
        "category": "Collaboration",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "5 students, very different backgrounds",
            "Same explanation didn't work for all",
            "Mistake: explained in my terms, assumed it landed",
            "Change: they explain it back; link to what they know",
            "Problems stopped coming back",
            "Explaining simply = key engineering skill"
        ]
    },
    {
        "id": "fl_1",
        "title": "Tell me about a time you failed or made a mistake",
        "description": "SITUATION — CogniGraph is a RAG system. It answers questions using only the parts of your documents it finds. To test it, I wrote my own test questions, and it scored 90%. The right passage came back first nine times out of ten.\n\nTASK — It looked finished. But the number felt too good, and I needed to know if it was real.\n\nACTION — I realised the mistake was mine. I had written the questions myself, already knowing what was in the documents, so they were much easier than anything a real user would ask. [Say in one line what made them too easy.] So I rebuilt the test set to be honest. On the new test, the right passage came back first only 55% of the time. That's 35 points lower than I had believed. Then I compared the system properly against a simple keyword search, on exactly the same questions.\n\nRESULT — On the honest test, the right passage was in the top three 95% of the time, compared to 80% for keyword search. So the system really was better, just not as good as my first number said. The real failure would have been believing the 90%. My rule now: make sure my test can't make me look better than I am.\n\nCHECK — Fill in the [bracket] with what really made your questions too easy.\n\nIN SHORT — My own test made my system look 35 points better than it was. I rebuilt the test to be honest, and now I always make sure my tests can't flatter me.\n\nIN PLAIN WORDS — \n• RAG — Before answering, the AI looks up the relevant parts of your documents and answers only from them. Like an open-book exam.\n• hit@1 / hit@3 — Did the right passage come back first (hit@1), or somewhere in the top three (hit@3)?\n• Keyword search — Plain word-matching search. The simple option a smart system must beat to be worth it.",
        "category": "Failure & Learning",
        "coreStoryId": "cognigraph",
        "memoryPoints": [
            "CogniGraph: my own test questions → 90%",
            "Too easy: I wrote them knowing the documents",
            "Honest test → 55% first (hit@1)",
            "35 points of false confidence",
            "Same honest test: 95% in top 3 vs 80% keyword search",
            "Rule: my test must not flatter me"
        ]
    },
    {
        "id": "fl_2",
        "title": "Tell me about a time you kept going when something was hard",
        "description": "SITUATION — When I was building Planck AI, my research agent, the hardest problem wasn't the AI itself. It was the AI providers. A task could be partway through, after several searches and reads, and if the provider hit its limit or went down, that work was lost.\n\nTASK — I wanted an agent people could rely on, not one that only works when you're lucky.\n\nACTION — The easy option was to just try again and hope. Instead, I connected three providers, Groq, Gemini and NVIDIA, through one standard interface. If one fails in the middle of a task, the work moves to the next one and carries on. Then, instead of waiting for failures to happen, I caused them on purpose. I switched off the main provider on every single call, to prove the switching really worked.\n\nRESULT — Even with the main provider switched off every time, it finished 30 out of 30 tasks. I care about finishing things so they really work, not so they half-work and look good in a demo.\n\nIN SHORT — AI providers kept failing mid-task. Instead of hoping, I built automatic switching between three providers, broke it on purpose to test it, and got 30 out of 30.\n\nIN PLAIN WORDS — \n• LLM provider — A company that runs the AI model you call over the internet, like Groq, Gemini or NVIDIA.\n• Rate limit — A cap on how many requests a provider accepts per minute. Go over it and your request is refused.\n• Failover — If one AI provider fails, the work moves to the next provider automatically and carries on.\n• Fault injection — Breaking something on purpose to prove the system survives it. I switched off the main provider on every call.",
        "category": "Failure & Learning",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "Planck AI: providers failing mid-task, work lost",
            "Wanted reliable, not lucky",
            "Didn't just retry: switch between 3 providers",
            "Carries on with the work already done",
            "Broke it on purpose: main provider off every call",
            "30/30 finished"
        ]
    },
    {
        "id": "fl_3",
        "title": "Tell me about a time you received difficult feedback",
        "description": "SITUATION — When I started mentoring MSc students, one of them told me honestly that our sessions weren't helping as much as they could. I was jumping straight in to fix their code, and the next week they'd be stuck on the same kind of problem.\n\nTASK — My first reaction, honestly, was a bit defensive. I was fixing their problems, wasn't that the point? But I had to admit they were right. They weren't learning to fix things themselves.\n\nACTION — So I changed my approach. Instead of fixing things for them, I asked questions and let them do the typing. I also noticed the same three problems coming up across all five students, so I built the sessions around those three.\n\nRESULT — Students started solving those problems before our sessions, and the mentoring became much more useful. It taught me to ask for feedback earlier, and to treat it as useful information, not criticism. The earlier it hurts, the cheaper it is.\n\nCHECK — Make sure these details match what really happened, and adjust them before using this.\n\nIN SHORT — A student told me I was fixing their code instead of teaching them. I changed to asking questions and letting them do it, and they improved much faster.",
        "category": "Failure & Learning",
        "coreStoryId": "mentoring",
        "memoryPoints": [
            "Student: you fix my code, but I don't learn",
            "First reaction defensive, then I saw they were right",
            "Changed: ask questions, they do the typing",
            "Sessions built around the 3 common problems",
            "They solved problems themselves",
            "Feedback = information. The earlier, the cheaper"
        ]
    },
    {
        "id": "fl_4",
        "title": "What are your weaknesses, or areas you want to grow in?",
        "description": "I'll give you two honest ones. The first is documentation. When I'm deep in building something, stopping to write it up feels like it breaks my focus, so it used to get left until later. Now I count it as part of being 'done', not an optional extra. That's actually why I now write down how I tested each project, so anyone can check my numbers.\n\nThe second is that I can be too independent. My instinct is to keep working on something until it's good before I show anyone. I've learned that's expensive. Showing rough work early almost always saves more time than fixing a big problem at the end. So now I share my work earlier than feels comfortable.\n\nThe area I most want to grow in is running AI at a big scale, inside a real company, with real amounts of data. I've done it at project level, and I want to learn how an experienced team does it properly.\n\nIN SHORT — Two honest weaknesses, each with what I do about it now (documentation is part of 'done', and I share work early), plus one area I want to grow in.",
        "category": "Failure & Learning",
        "memoryPoints": [
            "Documentation used to wait → now part of 'done'",
            "Too independent → share rough work early",
            "Want to grow: AI at real company scale",
            "Learn how an experienced team does it"
        ]
    },
    {
        "id": "sb_1",
        "title": "What's your superpower at work?",
        "description": "Making AI trustworthy, not just impressive. A lot of people can get an AI prototype working in an afternoon. What I'm good at is the next step: finding where it quietly gets things wrong, and fixing it.\n\nHere's an example. In NeuroArc, a job application assistant I built, the AI scores how well a CV matches a job. I found it would sometimes claim a CV showed a skill that it didn't. A confident, made-up answer. Just asking the AI nicely to be honest isn't enough. So I made it give the exact quote from the CV for each requirement, in a fixed format my code can check. If the quote isn't really in the CV, my code throws that requirement out before the score is calculated.\n\nIt's the same instinct as when I rebuilt my CogniGraph test because 90% looked too good. Don't just take the AI's word for it. Check it.\n\nIN SHORT — My strength is making AI trustworthy. Example: in NeuroArc, my code checks every quote the AI gives, so it can't invent evidence.\n\nIN PLAIN WORDS — \n• Hallucination — When an AI says something confidently that isn't true.\n• Structured JSON — Making the AI answer in a fixed format, like a form with set boxes, so my code can check every part.\n• Weighted score — An overall score where the more important requirements count for more.",
        "category": "Strengths-Based",
        "coreStoryId": "neuroarc",
        "memoryPoints": [
            "Making AI trustworthy, not just impressive",
            "NeuroArc: AI made up CV evidence",
            "Must quote the CV, in a format code can check",
            "Code throws out quotes not really in the CV",
            "Don't take the AI's word for it, check it"
        ]
    },
    {
        "id": "sb_2",
        "title": "What do you pick up faster than most?",
        "description": "New AI tools and ideas. I learn them by building, starting from the basics.\n\nFor Planck AI, I could have used a ready-made agent framework. Instead, I built the agent loop myself in Python. The AI picks a tool, my code runs it, the result goes back, and it repeats. Doing it by hand meant I understood what tools like LangGraph actually do behind the scenes. So picking those up afterwards was quick, because I already knew what they were doing for me.\n\nIt was the same with FruitGuard. I needed it to run in real time, so I converted my model to ONNX Runtime and kept measuring until it reached 73 frames per second.\n\nIn a field where the tools change every few months, I think that's what matters. If you understand the idea underneath, any new tool is just a new way of using it.\n\nIN SHORT — I learn new AI tools fast because I build things from the basics first, so I understand what the tools are really doing.\n\nIN PLAIN WORDS — \n• AI agent — An AI that doesn't just answer. It decides which tool to use, like web search or running code, looks at the result, and keeps going until it can answer.\n• Agent framework — A ready-made library, like LangGraph, that runs the agent's steps for you. In Planck AI I wrote those steps myself.\n• Tool calling — The AI asks for a tool by name, my code runs that tool, and gives the result back to the AI.\n• ONNX Runtime — A fast engine for running a trained model in the real world, separate from the code used to train it.",
        "category": "Strengths-Based",
        "coreStoryId": "planck-ai",
        "memoryPoints": [
            "New AI tools: I learn by building from the basics",
            "Planck: built the agent loop myself",
            "So LangGraph etc. are quick, I know what they do",
            "FruitGuard: ONNX Runtime, measured to 73 FPS",
            "Understand the idea → any tool is easy"
        ]
    },
    {
        "id": "sb_3",
        "title": "What fuels your drive and keeps you going?",
        "description": "Knowing that something I built really works for a real person. Not just a good score on a chart.\n\nThe moment I remember most from my MSc is when FruitGuard reached 73 frames per second. Not because the number sounded impressive, but because a harvesting robot needs at least 30. When I passed that line, it stopped being just a dissertation. It became something a real machine in a field could use.\n\nIt goes back further, too. My first research paper was about recognising bank notes for people who are visually impaired. That idea, technology that really helps someone, is what keeps me going through the boring parts, like rebuilding a test or running experiments again.\n\nIN SHORT — I'm driven by building things that really work for real people, like FruitGuard passing the speed a real robot needs.",
        "category": "Strengths-Based",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "My work really working for a real person",
            "FruitGuard 73 FPS vs robot's 30 → real, not just a project",
            "First paper: bank notes for visually impaired people",
            "Keeps me going through the boring parts"
        ]
    },
    {
        "id": "sb_4",
        "title": "Are you more of a starter or a finisher?",
        "description": "Honestly, I'm a starter by nature. I get really excited at the beginning: working out the approach, spotting the risks, and imagining what will make it useful.\n\nBut I've learned that finishing properly is where the real value is, so I've built habits around it. Before I build, I decide what 'done' looks like as a number. In Planck AI, I wrote the test questions and the marking scheme, and saved them in Git before the first test, so I couldn't quietly lower the bar later. And with FruitGuard, I didn't stop at a trained model. I took it all the way to a fast, live demo.\n\nSo I'd say I'm a starter who has trained himself to finish properly.\n\nIN SHORT — I'm naturally a starter, but I make myself finish by deciding what 'done' looks like before I begin.\n\nIN PLAIN WORDS — \n• Rubric — The marking scheme: what counts as a right answer. I saved it in Git before the first test, so I couldn't change it after seeing the results.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Starter by nature: approach, risks, usefulness",
            "Finishing is where the value is",
            "Decide 'done' as a number first",
            "Planck: marking scheme saved before first test",
            "FruitGuard: model → live demo",
            "A starter trained to finish properly"
        ]
    },
    {
        "id": "sb_5",
        "title": "How do you make time work for you?",
        "description": "I protect focused time for the hardest work, and keep small tasks in fixed slots. During my MSc I had my dissertation, my modules, two projects and weekly mentoring all at once. So the dissertation got my best hours first, and everything else fitted around it.\n\nWith AI work, it's easy to keep tweaking things forever. So I decide at the start what result means 'done', and I change one thing at a time, so every experiment teaches me something. If a change isn't helping, I stop and move on.\n\nAnd I measure before I act. At Accenture, measuring first is what found the real cause of our slow APIs straight away, instead of guessing. It feels slower at the start, but it saves a lot of time overall.\n\nIN SHORT — Best hours for the hardest work, a clear 'done' so I don't tweak forever, and measuring before acting.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Best hours for the hardest work",
            "MSc: dissertation first, rest fitted around it",
            "Decide 'done' first; one change at a time",
            "Stop if a change isn't helping",
            "Measure before acting (Accenture)"
        ]
    },
    {
        "id": "sb_6",
        "title": "What tends to linger on your to-do list, and why?",
        "description": "Documentation tends to stay there the longest. Not because I don't value it. It's that when I'm in the middle of building, stopping to write things up breaks my focus. I know this about myself, so I now plan it as part of finishing, instead of leaving it for 'later'. And writing up how I tested each project is what makes my numbers believable, so it really matters.\n\nThe other one is asking for feedback early. I can be too independent. I want something to be good before I show anyone. But mentoring showed me how much faster people improve with early, honest feedback, so now I share rough work sooner than feels comfortable.\n\nIN SHORT — Documentation and asking for early feedback. For both, I now have a habit that fixes it.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Documentation waits, it breaks my focus",
            "Now part of finishing; makes my numbers believable",
            "Early feedback waits, I'm too independent",
            "Mentoring showed me early feedback is faster"
        ]
    },
    {
        "id": "sb_7",
        "title": "What's a proud moment you've made happen, and how?",
        "description": "FruitGuard, my dissertation. The challenge was spotting fruit for a harvesting robot using only 207 labelled photos. That's 34 times fewer than the photo set the model first learned from. And it had to be fast enough for a real robot, not just score well in a test.\n\nI made it happen in a few steps. I trained it in two stages: first on a bigger set of fruit photos to learn fruit in general, then on my own photos. I made sure the rare fruits weren't ignored. And I proved every improvement against a fair comparison, so I knew it was real and not luck.\n\nIt reached 96.3% accuracy and ran at 73 frames per second, when the robot needed 30. Then I put it online as a live demo. Going from a research question to something that really runs, that's what I'm proudest of.\n\nIN SHORT — FruitGuard: from 207 photos to a 96% accurate, real-time fruit detector, proved with a fair comparison and put online.\n\nIN PLAIN WORDS — \n• Transfer learning — Starting from a model that has already learned from lots of similar pictures, then teaching it my specific job with a few examples. Like an experienced cook learning one new dish.\n• Class imbalance — Some fruits appear far more often than others in the photos, so a model can get lazy and ignore the rare ones.\n• Baseline — The fair 'before' picture I compare against. Here: the same model, trained the same way, but starting from standard general-purpose settings (called COCO).\n• FPS (frames per second) — How many camera pictures it can check every second. Normal video is about 30, so 73 is comfortably real-time.",
        "category": "Strengths-Based",
        "coreStoryId": "fruit-detection",
        "memoryPoints": [
            "FruitGuard: 207 photos, 34x less data",
            "Two-stage training + rare fruits not ignored",
            "Every gain proved against a fair comparison",
            "96.3%, 73 FPS vs 30 needed, live demo",
            "Research question → something that really runs"
        ]
    },
    {
        "id": "sb_8",
        "title": "Why does this role feel like the right fit for your strengths?",
        "description": "This role needs someone who can take an AI idea and turn it into something people rely on every day. That's exactly what I'm best at.\n\nIt needs two things: good engineering habits and real AI skills. Accenture gave me the engineering side: real production APIs, measuring before fixing, and making them 40% faster. My MSc gave me the AI side: an agent that keeps working when providers fail, a document search system I tested honestly, and a vision model that runs in real time. [Link one thing from their job advert to one of your projects.]\n\nAnd my strongest habit fits this role too. I don't trust an AI system until I've proved it works. So this role isn't a stretch for me. It's where my strengths already point.\n\nCHECK — Fill in the [bracket] for each company before the interview.\n\nIN SHORT — The role needs engineering + AI + making AI reliable, and those are exactly my strengths.",
        "category": "Strengths-Based",
        "memoryPoints": [
            "Role = AI idea → something people rely on",
            "Engineering (Accenture) + AI skills (MSc)",
            "Link their job advert to one project",
            "My habit: prove it works before trusting it"
        ]
    },
    {
        "id": "cl_1",
        "title": "Questions to ask the engineer or hiring manager",
        "description": "Pick two or three. The best question is always a follow-up to something they said during the interview, because it proves you were listening.\n\n• How do you test your AI features today? Is there a shared set of tests, or does each feature have its own?\n• When an AI provider fails or slows down in production, what happens? Is there a backup?\n• What would the first six months look like for someone at my level? Joining an existing system, or owning something from start to finish?\n• In your experience, what makes people settle in fastest here?\n• What do you enjoy most about working on this team?\n\nAlways finish with: \"Thank you, this has made me even more excited about the role. What are the next steps?\" Say it warmly, then stop talking.\n\nIN SHORT — Ask 2 or 3 smart questions, ideally a follow-up to something they said, then close warmly and ask about next steps.",
        "category": "Closing Strategy",
        "memoryPoints": [
            "Best question = follow-up to something they said",
            "How do you test AI features?",
            "What happens when an AI provider fails?",
            "First six months: join or own?",
            "Close: 'More excited now. What are the next steps?'"
        ]
    },
    {
        "id": "cl_2",
        "title": "Questions to ask the recruiter",
        "description": "Never ask the engineer about salary. Never ask the recruiter about technical design.\n\n• What are the next steps, and how many stages are there?\n• When do you expect to make a decision?\n• Could you share the salary range and bonus?\n• Is the role hybrid or office-based, and how many days in the office?\n• What's the expected start date?\n\nIf they ask about right to work, keep it simple: \"I'm on the UK Graduate Route visa, valid until 2028, so I don't need sponsorship.\" Then move on.\n\nAlways finish with: \"Thank you, this has made me even more excited about the role. What are the next steps?\"\n\nIN SHORT — Ask the recruiter about process, money and practical things. Visa answer: Graduate Route until 2028, no sponsorship needed.",
        "category": "Closing Strategy",
        "memoryPoints": [
            "No salary for the engineer, no tech for the recruiter",
            "Stages, decision date, salary + bonus",
            "Hybrid/office, start date",
            "Visa: Graduate Route to 2028, no sponsorship",
            "Close: 'What are the next steps?'"
        ]
    }
] as DefaultTask[];
