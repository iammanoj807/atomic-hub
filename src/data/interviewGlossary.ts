import type { GlossaryTerm } from '../utils/glossaryEngine';

// Hover-to-explain words for the Interview Hub answers. A word is underlined
// in an answer when one of its `matches` appears there (case-sensitive, whole
// words, first mention in each answer). Each definition is written so you can
// say it out loud to an interviewer as it is.

export const interviewGlossaryTerms: GlossaryTerm[] = [
    // ---- Accenture / backend
    {
        id: 'p95',
        term: 'p95 latency',
        definition: 'How long the slowest users wait. Line up every request from fastest to slowest: p95 is the time that 95% of them finish within. If p95 is 850 ms, 95 out of 100 requests are done in 850 ms or less, and only the slowest 5 take longer. We use it instead of the average because the average hides the people having a bad time.',
        matches: ['p95 latency', 'p95'],
    },
    {
        id: 'n-plus-one',
        term: 'N+1 query',
        definition: 'A common performance bug. The code asks the database once for a list, then asks again for every single item in that list. A list of 50 orders means 51 trips to the database, when one or two would do. Each trip is quick, but together they add up. The fix is to fetch everything in one go.',
        matches: ['N+1 queries', 'N+1 query', 'N+1 problem', 'N+1'],
    },
    {
        id: 'api',
        term: 'REST API',
        definition: 'A way for one program to ask another for data over the web. Like a waiter: the app gives an order ("get customer 42"), the API takes it to the kitchen (the server and database), and brings the answer back.',
        matches: ['REST APIs', 'REST API', 'APIs', 'API'],
    },
    {
        id: 'endpoint',
        term: 'Endpoint',
        definition: 'One specific address an app can call on an API, like /orders or /customers. Each one does one job. "18 endpoints" means 18 different addresses got faster.',
        matches: ['endpoints', 'endpoint'],
    },
    {
        id: 'spring-boot',
        term: 'Spring Boot',
        definition: 'A popular Java toolkit for building web services and APIs. It handles the plumbing, like receiving requests and talking to the database, so the team can focus on the business rules.',
        matches: ['Java Spring Boot', 'Spring Boot'],
    },
    {
        id: 'business-logic',
        term: 'Business logic',
        definition: 'The rules that make the application do its job, for example "a discount applies only to orders over £100". It is the part that is specific to the client, as opposed to general plumbing.',
        matches: ['business logic'],
    },
    {
        id: 'data-access-layer',
        term: 'Data-access layer',
        definition: 'The part of the code whose only job is reading from and writing to the database. Keeping it in one place means database problems, like slow queries, are found and fixed in one place.',
        matches: ['data-access layer', 'database code'],
    },
    {
        id: 'production',
        term: 'Production',
        definition: 'The live system that real users are using right now, as opposed to a test copy. A bug in production affects real people, so changes there have to be careful.',
        matches: ['production'],
    },
    {
        id: 'sprint',
        term: 'Two-week sprint',
        definition: 'A way of working in short cycles. The team picks a small batch of work, finishes it in two weeks, shows it, then plans the next batch. It keeps work small and feedback quick.',
        matches: ['two-week sprints'],
    },
    {
        id: 'code-review',
        term: 'Code review',
        definition: 'Before code goes live, another engineer reads it to catch mistakes and suggest improvements. It is one of the best ways to learn from more experienced people.',
        matches: ['code reviews'],
    },
    {
        id: 'automated-testing',
        term: 'Automated testing',
        definition: 'Small programs that check your code works, run automatically every time something changes. They catch bugs before users do.',
        matches: ['automated testing'],
    },
    {
        id: 'ci-cd',
        term: 'CI/CD',
        definition: 'Continuous Integration / Continuous Delivery. Every code change is automatically tested and then released, so releases are small, frequent and safe instead of big and scary.',
        matches: ['CI/CD'],
    },
    {
        id: 'monitoring',
        term: 'Monitoring',
        definition: 'Watching a live system with dashboards and alerts, so you find out about slowdowns or errors before users complain.',
        matches: ['monitoring'],
    },
    {
        id: 'hardcoding',
        term: 'Hardcoding',
        definition: 'Writing fixed values straight into the code instead of making them settings or rules. It is quick today, but every future change needs a code change, so it gets painful later.',
        matches: ['hardcoding'],
    },

    // ---- AI basics
    {
        id: 'machine-learning',
        term: 'Machine learning',
        definition: 'Teaching a computer to do a task by showing it lots of examples, instead of writing every rule by hand. It finds the patterns itself.',
        matches: ['machine learning'],
    },
    {
        id: 'deep-learning',
        term: 'Deep learning',
        definition: 'A type of machine learning that uses large neural networks, loosely inspired by the brain. It is what powers image recognition, speech recognition and chatbots.',
        matches: ['deep learning'],
    },
    {
        id: 'prototype',
        term: 'Prototype',
        definition: 'A quick first version built to show an idea works. It usually looks good in a demo but has not been tested on real, messy situations yet.',
        matches: ['prototype'],
    },
    {
        id: 'hallucination',
        term: 'Hallucination',
        definition: 'When an AI says something confidently that is not true. It is not lying on purpose: it produces text that sounds right without checking it. That is why I check its answers in code.',
        matches: ['made-up answer'],
    },
    {
        id: 'structured-output',
        term: 'Structured output (JSON)',
        definition: 'Making the AI answer in a fixed format, like a form with named boxes, instead of free text. Then my code can read each box and check it, for example "is this quote really in the CV?"',
        matches: ['fixed format'],
    },

    // ---- Planck AI
    {
        id: 'agent',
        term: 'AI agent',
        definition: 'An AI that does more than answer from memory. It decides which tool to use (search the web, run code, read a PDF), looks at the result, and repeats until it has enough to answer. Like a researcher who looks things up instead of guessing.',
        matches: ['research assistant agent', 'research agent', 'AI agent', 'agent'],
    },
    {
        id: 'agent-loop',
        term: 'Agent loop',
        definition: 'The cycle at the heart of an agent: the AI picks a tool, my code runs it, the result goes back to the AI, and it decides the next step. It repeats until the AI can answer, or hits a step limit (eight in Planck AI) so it cannot loop forever.',
        matches: ['agent loop'],
    },
    {
        id: 'agent-framework',
        term: 'Agent framework',
        definition: 'A ready-made library, like LangGraph, that runs the agent loop for you. In Planck AI I wrote the loop myself, so I understand exactly what these frameworks do behind the scenes.',
        matches: ['ready-made agent framework', 'agent framework'],
    },
    {
        id: 'langgraph',
        term: 'LangGraph',
        definition: 'A popular library for building AI agents. You describe the steps as a graph: boxes that do work, and arrows that decide what happens next.',
        matches: ['LangGraph'],
    },
    {
        id: 'provider',
        term: 'AI provider',
        definition: 'A company that runs a large language model on its servers and lets you call it over the internet, like Groq, Gemini or NVIDIA. Free and cheap tiers often have limits or go down, so you cannot rely on just one.',
        matches: ['main AI provider', 'main provider', 'AI providers', 'AI provider', 'providers', 'provider'],
    },
    {
        id: 'three-providers',
        term: 'Groq, Gemini and NVIDIA',
        definition: 'Three different companies that run AI models. Planck AI can use any of them, so if one fails in the middle of a task, the work moves to the next one and carries on. This is called failover.',
        matches: ['Groq, Gemini and NVIDIA'],
    },
    {
        id: 'standard-interface',
        term: 'One standard interface',
        definition: 'All three providers are called in exactly the same way (the "OpenAI-compatible" format), so switching from one to another is a one-line change, not a rewrite.',
        matches: ['one standard interface'],
    },
    {
        id: 'rate-limit',
        term: 'Rate limit',
        definition: 'A cap on how many requests a provider accepts in a minute. Go over it and your request is refused, even though nothing is broken.',
        matches: ['hit their limits', 'hit its limit'],
    },
    {
        id: 'fault-injection',
        term: 'Fault injection',
        definition: 'Breaking something on purpose to prove the system survives it. Instead of waiting for a provider to fail, I switched off the main one on every single call. Planck AI still finished 30 out of 30 tasks.',
        matches: ['caused them on purpose'],
    },
    {
        id: 'git',
        term: 'Git',
        definition: 'A tool that keeps a dated history of every change to your files. Saving the marking scheme in Git before testing proves I did not change the rules after seeing the results.',
        matches: ['Git'],
    },
    {
        id: 'rubric',
        term: 'Marking scheme (rubric)',
        definition: 'The rules for what counts as a right answer, written before the test runs. Fixing it first stops you from quietly moving the goalposts to make the results look better.',
        matches: ['marking scheme'],
    },

    // ---- FruitGuard
    {
        id: 'yolo',
        term: 'YOLOv8',
        definition: 'A well-known, fast AI model for finding objects in a picture. It looks at the whole image once ("You Only Look Once") and draws a box around each object with a label, like "apple".',
        matches: ['YOLOv8'],
    },
    {
        id: 'labelled-photos',
        term: 'Labelled photos',
        definition: 'Photos where a person has marked the answer, for example drawn a box around each fruit and named it. The model learns from these. They are slow and expensive to make, which is why needing only 207 matters.',
        matches: ['labelled photos'],
    },
    {
        id: 'transfer-learning',
        term: 'Transfer learning',
        definition: 'Starting from a model that has already learned from lots of similar pictures, then teaching it your exact job with a few examples. Like an experienced cook learning one new dish: they do not need to learn to cook from scratch. In FruitGuard: first 7,108 general fruit photos, then my 207.',
        matches: ['transfer learning', 'trained it in two steps', 'two-step training', 'two stages'],
    },
    {
        id: 'class-imbalance',
        term: 'Class imbalance',
        definition: 'When some types appear far more often than others in the data, for example lots of apples and very few pears. A model can get lazy: it learns the common ones and ignores the rare ones, and still looks accurate overall.',
        matches: ['some fruits appeared much more often than others', 'uneven fruit types'],
    },
    {
        id: 'inverse-frequency',
        term: 'Inverse frequency weighting',
        definition: 'The fix for class imbalance. During training, a mistake on a rare fruit costs more than a mistake on a common one, so the model is forced to learn the rare fruits properly instead of ignoring them.',
        matches: ['made mistakes on rare fruits count more', 'mistakes on rare fruits count more'],
    },
    {
        id: 'baseline',
        term: 'Baseline',
        definition: 'The simple, fair "before" you compare against. If your new idea cannot beat the baseline, it is not helping. In FruitGuard it was the same model trained the same way, just starting from standard settings, so any gain was clearly from my approach. With students, it meant the simplest reasonable model to try first.',
        matches: ['simple baseline', 'fair baseline', 'baseline'],
    },
    {
        id: 'standard-settings',
        term: 'Standard settings (COCO)',
        definition: 'COCO is a huge, general photo collection (people, cars, dogs and more) that most detection models start from. Starting from it is the normal approach, which makes it the fair thing to compare against.',
        matches: ['standard settings'],
    },
    {
        id: 'map',
        term: 'mAP (the main detection score)',
        definition: 'The standard score for object detection. It checks two things together: did the model find the object, and did it draw the box in the right place. Higher is better. FruitGuard improved it by 6 points (0.585 to 0.646) over the standard version.',
        matches: ['main detection score', 'main score'],
    },
    {
        id: 'precision',
        term: 'Precision',
        definition: 'Out of everything the model said was fruit, how much really was fruit. For a robot this matters a lot: high precision means it rarely reaches for a leaf by mistake.',
        matches: ['precision'],
    },
    {
        id: 'onnx',
        term: 'ONNX Runtime',
        definition: 'A fast engine for running a trained model in the real world. You train the model in one tool, convert it to the ONNX format, and ONNX Runtime runs it quickly. That is how FruitGuard reached 73 frames per second.',
        matches: ['ONNX Runtime'],
    },
    {
        id: 'fps',
        term: 'Frames per second (FPS)',
        definition: 'How many camera pictures the model can check every second. Normal video is about 30, which is why the robot needed at least 30. FruitGuard does 73, so it is comfortably real-time.',
        matches: ['frames per second', 'FPS'],
    },

    // ---- CogniGraph / NeuroArc
    {
        id: 'rag',
        term: 'RAG (Retrieval-Augmented Generation)',
        definition: 'Before the AI answers, it searches your documents for the most relevant passages and answers only from those. Like an open-book exam: the answer must come from the book, not from memory, which makes it far less likely to make things up.',
        matches: ['RAG system', 'RAG'],
    },
    {
        id: 'hit-at-k',
        term: 'hit@1 / hit@3',
        definition: 'How retrieval is scored. hit@1: did the right passage come back first? hit@3: was it anywhere in the top three? CogniGraph scored 55% hit@1 and 95% hit@3 on the honest test.',
        matches: ['came back first', 'in the top three'],
    },
    {
        id: 'keyword-search',
        term: 'Keyword search',
        definition: 'Plain word-matching search, like Ctrl+F. It only finds passages that use the same words as the question. It is the simple option a smarter system has to beat to be worth it.',
        matches: ['keyword search'],
    },
    {
        id: 'chunk-size',
        term: 'Chunk size',
        definition: 'Documents are too long to search whole, so you cut them into pieces called chunks. Chunk size is how long each piece is. Too small and pieces lose their meaning; too big and the model cannot read all of it.',
        matches: ['chunk size'],
    },
    {
        id: 'embedding-model',
        term: 'Embedding model',
        definition: 'A model that turns a piece of text into a list of numbers that captures its meaning, so texts about similar things end up close together. That is how search by meaning works. Mine quietly ignored everything after about 1,400 characters.',
        matches: ['embedding model'],
    },

    // ---- Mentoring
    {
        id: 'python-environment',
        term: 'Python environment',
        definition: 'A clean, separate set of installed libraries for one project, so installing something for one project cannot break another. Setting them up is a classic beginner headache.',
        matches: ['Python environments'],
    },
    {
        id: 'not-converging',
        term: 'Training that won\'t improve (not converging)',
        definition: 'The model trains for hours but never gets better. It is usually a bug, a wrong setting like the learning speed, or a problem with the data, not a sign you need a bigger model.',
        matches: ['Training that wouldn\'t improve', 'training that wouldn\'t improve'],
    },
    {
        id: 'optimisation',
        term: 'Optimisation problem',
        definition: 'A maths problem where you search for the best value, like the lowest point of a curve. Training a model is exactly that: adjusting numbers to make the error as small as possible.',
        matches: ['optimisation problem'],
    },

    // ---- Background
    {
        id: 'distinction',
        term: 'Distinction',
        definition: 'The highest grade for a UK master\'s degree, usually 70% or above. I got 70.37%.',
        matches: ['Distinction'],
    },
    {
        id: 'graduate-route',
        term: 'Graduate Route visa',
        definition: 'A UK visa for people who finished a UK degree. It lets me work for any employer without sponsorship, and mine is valid until 2028.',
        matches: ['Graduate Route visa'],
    },
    {
        id: 'system-design',
        term: 'System design',
        definition: 'Planning how a large software system fits together: servers, databases, caches, and how it copes with lots of users. A common interview topic for engineers.',
        matches: ['system design'],
    },
    {
        id: 'github',
        term: 'GitHub',
        definition: 'A website for storing and sharing code. Anyone can look at my project code there, which is why I keep it clean.',
        matches: ['GitHub'],
    },
];
