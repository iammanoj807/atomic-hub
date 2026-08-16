// Exactly what to watch, read and build — for every one of the 26 weeks.
//
// Every entry carries its exact title and source as well as a link, on purpose.
// Course pages move and playlists get re-cut; a title and an author never rot,
// so if a link ever dies the thing to search for is right there on the card.
//
// Links point at canonical homes (the course page, the author's site, the repo)
// rather than at individual video ids, for the same reason.

export type ResourceKind = 'watch' | 'read' | 'build' | 'aieng';

export interface WeekResource {
    kind: ResourceKind;
    /** The exact title, so it is searchable even without the link. */
    title: string;
    source: string;
    url?: string;
    /** What to actually do with it this week. */
    detail?: string;
}

export const RESOURCE_KIND_LABELS: Record<ResourceKind, string> = {
    watch: 'WATCH',
    read: 'READ',
    build: 'BUILD',
    aieng: 'AI ENGINEERING',
};

export const RESOURCE_KIND_COLORS: Record<ResourceKind, string> = {
    watch: '#00e5ff',
    read: '#b39ddb',
    build: '#ff8a65',
    aieng: '#ffd54f',
};

/** Keyed by week number, 1-26. */
export const weekResources: Record<number, WeekResource[]> = {
    1: [
        {
            kind: 'watch',
            title: 'Essence of Linear Algebra',
            source: '3Blue1Brown',
            url: 'https://www.3blue1brown.com/topics/linear-algebra',
            detail: '16 short videos, about 3 hours total. Watch the whole series before you read anything. No notes — you are buying the mental picture of what a matrix does.',
        },
        {
            kind: 'read',
            title: 'Mathematics for Machine Learning — Ch 2 (Linear Algebra)',
            source: 'Deisenroth, Faisal & Ong · free PDF',
            url: 'https://mml-book.github.io/',
            detail: 'Now the formal version lands, because you already have the picture. Work the exercises at the end of the chapter.',
        },
        {
            kind: 'build',
            title: 'micrograd — the spelled-out intro to backpropagation',
            source: 'Andrej Karpathy · Neural Networks: Zero to Hero #1',
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'Type every line yourself, do not copy-paste. Repo: github.com/karpathy/micrograd. Also write matrix ops in NumPy by hand this week.',
        },
        {
            kind: 'aieng',
            title: 'Intro to Large Language Models (1 hour)',
            source: 'Andrej Karpathy · YouTube',
            url: 'https://www.youtube.com/@AndrejKarpathy',
            detail: 'Then set up the accounts you will use all six months: GitHub, Colab, Overleaf, Weights & Biases.',
        },
    ],
    2: [
        {
            kind: 'watch',
            title: 'Essence of Calculus',
            source: '3Blue1Brown',
            url: 'https://www.3blue1brown.com/topics/calculus',
            detail: 'Chain rule is the one that matters. Everything in backprop is that rule applied over and over.',
        },
        {
            kind: 'read',
            title: 'Mathematics for Machine Learning — Ch 3-4 (Geometry, Matrix Decompositions)',
            source: 'Deisenroth, Faisal & Ong',
            url: 'https://mml-book.github.io/',
            detail: 'Ch 4 gives you SVD, which is the single most useful decomposition in ML.',
        },
        {
            kind: 'build',
            title: 'Finish micrograd, then extend it',
            source: 'Your own repo',
            url: 'https://github.com/karpathy/micrograd',
            detail: 'Add tanh, exp, and one operation of your own design. Implement SVD-based PCA yourself in NumPy — no sklearn.',
        },
        {
            kind: 'aieng',
            title: 'Hugging Face LLM Course — Ch 1-2',
            source: 'Hugging Face · free',
            url: 'https://huggingface.co/learn/llm-course',
            detail: 'Run your first local model by the end of the session.',
        },
    ],
    3: [
        {
            kind: 'watch',
            title: 'Neural Networks (series)',
            source: '3Blue1Brown',
            url: 'https://www.3blue1brown.com/topics/neural-networks',
            detail: 'The backpropagation-calculus episode is the one to rewatch until it is obvious.',
        },
        {
            kind: 'read',
            title: 'Mathematics for Machine Learning — Ch 5 (Vector Calculus)',
            source: 'Deisenroth, Faisal & Ong',
            url: 'https://mml-book.github.io/',
            detail: 'Jacobians and the multivariate chain rule. This is the maths under every autograd engine.',
        },
        {
            kind: 'build',
            title: 'makemore part 1 — bigrams',
            source: 'Andrej Karpathy · Zero to Hero #2',
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'Then rewrite it in pure NumPy without torch. Before that: derive backprop for a 2-layer MLP on paper, by hand.',
        },
        {
            kind: 'aieng',
            title: 'Hugging Face LLM Course — Ch 3 (Fine-tuning)',
            source: 'Hugging Face',
            url: 'https://huggingface.co/learn/llm-course',
            detail: 'Fine-tune a small model on Colab. Free tier is enough.',
        },
    ],
    4: [
        {
            kind: 'watch',
            title: 'No new material this week',
            source: 'Consolidation',
            detail: 'Review weeks 1-3. Redo the problems you got wrong the first time — those are the only ones worth your hours.',
        },
        {
            kind: 'read',
            title: 'Re-read your own notes and code',
            source: 'Your repo',
            detail: 'If you cannot explain your micrograd line by line, that is the gap. Fix it before moving on.',
        },
        {
            kind: 'build',
            title: 'Write and publish: "Building an autograd engine from scratch"',
            source: 'Your blog / GitHub',
            detail: 'Publishing is the asymmetry. Most people learn privately and have nothing to show. A clean README and a real post put you ahead permanently.',
        },
        {
            kind: 'aieng',
            title: 'Make your repos look professional',
            source: 'GitHub',
            detail: 'Proper READMEs, a screenshot or a plot in each, pinned repos on your profile. This is the page a supervisor will actually open.',
        },
    ],
    5: [
        {
            kind: 'watch',
            title: 'Statistics 110: Probability — Lectures 1-8',
            source: 'Joe Blitzstein · Harvard (free)',
            url: 'https://projects.iq.harvard.edu/stat110',
            detail: 'The best probability course that exists, and it is free. Do not skip the counting lectures — they are the foundation.',
        },
        {
            kind: 'read',
            title: 'Probabilistic Machine Learning: An Introduction — Ch 2',
            source: 'Kevin Murphy · free PDF',
            url: 'https://probml.github.io/pml-book/',
            detail: 'The standard reference for the rest of your career. Ch 2 is probability done for ML people.',
        },
        {
            kind: 'build',
            title: 'makemore parts 2-3 — MLP, activations, BatchNorm internals',
            source: 'Andrej Karpathy · Zero to Hero #3-4',
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'Also simulate every distribution you meet this week in NumPy. Seeing a distribution beats memorising its formula.',
        },
        {
            kind: 'aieng',
            title: 'Build a RAG system over your own documents',
            source: 'LangChain docs + any vector DB',
            url: 'https://python.langchain.com/docs/introduction/',
            detail: 'Your documents, not a tutorial dataset. Retrieval, chunking, a real question you actually want answered.',
        },
    ],
    6: [
        {
            kind: 'watch',
            title: 'Statistics 110 — Lectures 9-16',
            source: 'Joe Blitzstein · Harvard',
            url: 'https://projects.iq.harvard.edu/stat110',
            detail: 'Expectation, variance, the big named distributions and why each one shows up.',
        },
        {
            kind: 'read',
            title: 'Probabilistic Machine Learning — Ch 3-4',
            source: 'Kevin Murphy',
            url: 'https://probml.github.io/pml-book/',
            detail: 'Then implement MLE and Bayesian inference by hand on a toy problem.',
        },
        {
            kind: 'build',
            title: 'makemore part 4 — manual backprop through everything',
            source: 'Andrej Karpathy · Zero to Hero #5',
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'The hardest video in the series and the most valuable. When you can do this, autograd holds no mystery.',
        },
        {
            kind: 'aieng',
            title: 'Add real evaluation to your RAG',
            source: "Hamel Husain's blog + Ragas",
            url: 'https://hamel.dev/',
            detail: 'Golden dataset, retrieval metrics, LLM-as-judge. Almost nobody does this, which is exactly why it is the most hireable thing on this list.',
        },
    ],
    7: [
        {
            kind: 'watch',
            title: 'Information Theory, Pattern Recognition and Neural Networks',
            source: 'David MacKay · Cambridge lectures (free)',
            url: 'https://www.inference.org.uk/mackay/itila/',
            detail: 'Lectures by one of the great explainers. Entropy and KL divergence become intuitive rather than formulas.',
        },
        {
            kind: 'read',
            title: 'Information Theory, Inference and Learning Algorithms — Ch 1-4',
            source: 'David MacKay · free PDF',
            url: 'https://www.inference.org.uk/mackay/itila/',
            detail: 'Implement entropy, KL and cross-entropy yourself as you read.',
        },
        {
            kind: 'build',
            title: 'VAE from scratch on MNIST',
            source: 'Your own implementation',
            detail: 'Derive the ELBO on paper FIRST, then code it. This is the week that proves you can go from maths to working model. Also: makemore 5 (WaveNet).',
        },
        {
            kind: 'aieng',
            title: 'Deploy the RAG: FastAPI + Docker + a cloud host',
            source: 'FastAPI docs',
            url: 'https://fastapi.tiangolo.com/',
            detail: 'Make it public with a real URL. A deployed thing is worth ten notebooks on an application.',
        },
    ],
    8: [
        {
            kind: 'watch',
            title: 'No new material — review phases 1 and 2',
            source: 'Consolidation',
            detail: 'Four months of this plan is where most people quit. You are resting on purpose so that you do not.',
        },
        {
            kind: 'read',
            title: "Lil'Log — pick two surveys in the areas you might choose",
            source: 'Lilian Weng',
            url: 'https://lilianweng.github.io/',
            detail: 'The best survey writing anywhere. Read to choose, not to finish.',
        },
        {
            kind: 'build',
            title: 'Publish the VAE with its LaTeX derivation',
            source: 'Overleaf + GitHub',
            url: 'https://www.overleaf.com/learn',
            detail: 'Learn Overleaf now, while the stakes are low. Every write-up from here is in LaTeX.',
        },
        {
            kind: 'aieng',
            title: 'DECIDE YOUR SUBFIELD and commit',
            source: 'The most important decision of the six months',
            detail: 'Interpretability / efficient inference / RLHF / reasoning / multimodal / diffusion. From week 9 every paper you read is in it.',
        },
    ],
    9: [
        {
            kind: 'watch',
            title: 'CS336: Language Modeling from Scratch — Lectures 1-3',
            source: 'Stanford (free on YouTube)',
            url: 'https://stanford-cs336.github.io/',
            detail: 'The only course that builds a modern LLM end to end. This is the centre of gravity for your next three weeks.',
        },
        {
            kind: 'read',
            title: 'The Annotated Transformer',
            source: 'Harvard NLP',
            url: 'https://nlp.seas.harvard.edu/annotated-transformer/',
            detail: 'The paper with running code beside every equation. Read it with the original paper open: arxiv.org/abs/1706.03762',
        },
        {
            kind: 'build',
            title: 'A BPE tokeniser from scratch',
            source: 'Karpathy · minbpe + "Let\'s build the GPT Tokenizer"',
            url: 'https://github.com/karpathy/minbpe',
            detail: 'Tokenisation is where most people wave their hands. Writing one puts you ahead of most practitioners.',
        },
        {
            kind: 'aieng',
            title: 'Hugging Face Agents Course',
            source: 'Hugging Face · free, hands-on',
            url: 'https://huggingface.co/learn/agents-course',
            detail: 'Build an agent with real tool use, not a demo chain.',
        },
    ],
    10: [
        {
            kind: 'watch',
            title: 'CS336 — Lectures 4-6',
            source: 'Stanford',
            url: 'https://stanford-cs336.github.io/',
            detail: 'Architecture and training decisions, with the reasons behind them.',
        },
        {
            kind: 'read',
            title: 'Understanding Machine Learning — Ch 2-6 (PAC learning, VC dimension)',
            source: 'Shalev-Shwartz & Ben-David · free PDF',
            url: 'https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/',
            detail: 'Learning theory is what separates a PhD applicant from a bootcamp graduate. Implement a PAC bound empirically.',
        },
        {
            kind: 'build',
            title: 'Train your GPT on a real dataset',
            source: "Karpathy · \"Let's build GPT from scratch\"",
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'Get it genuinely working — sampling text that is recognisably your dataset.',
        },
        {
            kind: 'aieng',
            title: 'Evals + failure-mode analysis for your agent',
            source: "Hamel Husain's blog",
            url: 'https://hamel.dev/',
            detail: 'Document what breaks and why. The failure analysis is the interesting half.',
        },
    ],
    11: [
        {
            kind: 'watch',
            title: 'CS336 — Lectures 7-9',
            source: 'Stanford',
            url: 'https://stanford-cs336.github.io/',
        },
        {
            kind: 'read',
            title: 'Understanding Machine Learning — Ch 7-13 (generalisation bounds)',
            source: 'Shalev-Shwartz & Ben-David',
            url: 'https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/',
            detail: 'Then reproduce a double-descent curve yourself. Seeing it beats reading about it.',
        },
        {
            kind: 'build',
            title: "Let's reproduce GPT-2 (124M)",
            source: 'Andrej Karpathy · nanoGPT',
            url: 'https://github.com/karpathy/nanoGPT',
            detail: 'The full pipeline at real scale. This one repo answers most interview questions about transformers.',
        },
        {
            kind: 'aieng',
            title: 'CS336 systems lectures — Flash Attention, KV cache, quantisation',
            source: 'Stanford',
            url: 'https://stanford-cs336.github.io/',
            detail: 'The systems half is what makes you employable as an AI engineer rather than a notebook user.',
        },
    ],
    12: [
        {
            kind: 'watch',
            title: 'No new material — review phase 3',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Start your literature review document',
            source: 'Connected Papers + Papers With Code',
            url: 'https://www.connectedpapers.com/',
            detail: 'Every paper from here goes in with YOUR notes, not the abstract.',
        },
        {
            kind: 'build',
            title: 'EMAIL YOUR MSc SUPERVISOR',
            source: 'The most important week in the plan',
            detail: 'Your plan, your GitHub links, and a specific ask: guidance and possible collaboration. Short, concrete, no apology.',
        },
        {
            kind: 'aieng',
            title: 'Tidy everything that email points at',
            source: 'GitHub',
            detail: 'Assume they open exactly one repo. Make sure any of them would do.',
        },
    ],
    13: [
        {
            kind: 'watch',
            title: 'TOEFL preparation — writing and speaking',
            source: 'TST Prep + official ETS videos',
            url: 'https://www.ets.org/toefl.html',
            detail: 'Two hours a day now. Writing and speaking are your weakest sections and the most fixable.',
        },
        {
            kind: 'read',
            title: 'The Official Guide to the TOEFL iBT Test',
            source: 'ETS',
            url: 'https://www.ets.org/toefl.html',
            detail: 'Use the official material for scoring rubrics. Everything else guesses at them.',
        },
        {
            kind: 'build',
            title: 'CHOOSE your reproduction paper',
            source: 'Papers With Code',
            url: 'https://paperswithcode.com/',
            detail: 'Recent, in your subfield, and it must run on a free GPU. Then read it five times and write every equation by hand.',
        },
        {
            kind: 'aieng',
            title: 'Set up Weights & Biases properly',
            source: 'W&B',
            url: 'https://wandb.ai/',
            detail: 'From here every experiment is logged. Untracked experiments are lost experiments.',
        },
    ],
    14: [
        {
            kind: 'watch',
            title: 'TOEFL — daily writing practice',
            source: 'TST Prep',
            detail: 'One timed essay per session. Writing daily fixes the exam and your papers at the same time.',
        },
        {
            kind: 'read',
            title: 'Your reproduction paper, again',
            source: 'Pass 3 — re-derive every equation',
            detail: 'This is the one paper this year you take all the way to the bottom.',
        },
        {
            kind: 'build',
            title: 'Build the reproduction end to end',
            source: 'Your repo',
            detail: 'Get it running badly first. A bad end-to-end run beats a perfect half.',
        },
        {
            kind: 'aieng',
            title: 'Log every run in W&B',
            source: 'W&B',
            url: 'https://wandb.ai/',
            detail: 'Config, seed, metrics. You will need these numbers in your write-up.',
        },
    ],
    15: [
        {
            kind: 'watch',
            title: 'TOEFL — full practice test',
            source: 'ETS official',
            url: 'https://www.ets.org/toefl.html',
            detail: 'BOOK YOUR EXAM for mid-January this week. Booking is what makes it real.',
        },
        {
            kind: 'read',
            title: 'The paper you are reproducing, plus its two closest predecessors',
            source: 'arXiv',
            detail: 'Where your numbers disagree, one of these three usually explains it.',
        },
        {
            kind: 'build',
            title: 'Debug until your numbers match',
            source: 'Your repo',
            detail: 'This is where the real learning is. Every mismatch you chase down is a thing you now understand properly.',
        },
        {
            kind: 'aieng',
            title: 'Serve a model efficiently with vLLM + quantisation',
            source: 'vLLM docs',
            url: 'https://docs.vllm.ai/',
            detail: 'Measure latency and cost per 1k tokens. Numbers like these are what a hiring manager wants.',
        },
    ],
    16: [
        {
            kind: 'watch',
            title: 'Light TOEFL only — rest',
            source: 'Consolidation',
            detail: 'Four months in. Protect yourself; the plan needs you in February.',
        },
        {
            kind: 'read',
            title: 'Read your own reproduction like a reviewer',
            source: 'Your repo',
        },
        {
            kind: 'build',
            title: 'Write the README properly',
            source: 'Your repo',
            detail: 'What matched, what did not, and WHY. The honest version is more impressive than a clean one.',
        },
        {
            kind: 'aieng',
            title: 'Rest',
            source: 'Genuinely',
            detail: 'No new project this week.',
        },
    ],
    17: [
        {
            kind: 'watch',
            title: 'Newest arXiv in your subfield (1h) + TOEFL (1h)',
            source: 'arXiv + Yannic Kilcher paper reviews',
            url: 'https://www.youtube.com/@YannicKilcher',
            detail: 'Skim daily listings; watch a review when you want a second opinion on a paper you have already read.',
        },
        {
            kind: 'read',
            title: 'The three papers closest to your extension idea',
            source: 'Papers With Code / Connected Papers',
            url: 'https://www.connectedpapers.com/',
        },
        {
            kind: 'build',
            title: 'FIND YOUR EXTENSION',
            source: 'Your reproduction',
            detail: 'An ablation nobody ran, a failure mode, a simpler method, or a clean negative result. Negative results count — say so plainly and they are publishable.',
        },
        {
            kind: 'aieng',
            title: 'Build a reusable evaluation pipeline',
            source: 'Ragas + your own harness',
            url: 'https://docs.ragas.io/',
            detail: 'The single most in-demand AI engineering skill right now, and the one almost nobody has.',
        },
    ],
    18: [
        {
            kind: 'watch',
            title: 'TOEFL maintenance only',
            source: 'TST Prep',
        },
        {
            kind: 'read',
            title: 'Whatever your experiments raise',
            source: 'arXiv',
            detail: 'Reading is now driven by your own results, which is what research actually feels like.',
        },
        {
            kind: 'build',
            title: 'RUN EXPERIMENTS. Log everything. Track every seed.',
            source: 'W&B',
            url: 'https://wandb.ai/',
            detail: 'Three seeds minimum for anything you will claim. One seed is an anecdote.',
        },
        {
            kind: 'aieng',
            title: 'Continue the eval pipeline',
            source: 'Your repo',
        },
    ],
    19: [
        {
            kind: 'watch',
            title: 'TOEFL only — and call your family properly',
            source: 'Christmas week',
            detail: 'A lighter week is in the plan on purpose. Take it.',
        },
        {
            kind: 'read',
            title: 'Something you want to read, not something you have to',
            source: 'Your choice',
        },
        {
            kind: 'build',
            title: 'Write up results AS YOU GO',
            source: 'Overleaf',
            url: 'https://www.overleaf.com/learn',
            detail: 'Never leave the writing until the end. The paper is easier when it grows beside the experiments.',
        },
        {
            kind: 'aieng',
            title: 'Light work or rest',
            source: 'Your call',
        },
    ],
    20: [
        {
            kind: 'watch',
            title: 'Review the whole five months',
            source: 'Consolidation',
            detail: 'Read your own hours log from week 1. That is the proof you kept going.',
        },
        {
            kind: 'read',
            title: 'Two recent papers from your target conference',
            source: 'NeurIPS / ICML proceedings',
            detail: 'Read them for structure, not content — you are about to write one.',
        },
        {
            kind: 'build',
            title: 'Finish experiments; draft in the NeurIPS/ICML LaTeX template',
            source: 'Overleaf',
            url: 'https://www.overleaf.com/learn',
        },
        {
            kind: 'aieng',
            title: 'Update CV and LinkedIn with all three projects',
            source: 'Your profile',
            detail: 'Lead with the deployed URL and the reproduction. Those two do the work.',
        },
    ],
    21: [
        {
            kind: 'watch',
            title: 'FINAL TOEFL PREP',
            source: 'ETS official',
            url: 'https://www.ets.org/toefl.html',
        },
        {
            kind: 'read',
            title: 'Statement of Purpose examples from your target departments',
            source: 'Department websites',
        },
        {
            kind: 'build',
            title: 'Polish the write-up; send it to your MSc supervisor',
            source: 'Your paper',
            detail: 'Ask for specific feedback, not general approval.',
        },
        {
            kind: 'aieng',
            title: 'START APPLYING FOR AI ENGINEER JOBS IN THE UK',
            source: 'You now have three real projects',
            detail: 'Apply while the work is fresh in your head. You are more interesting than you feel.',
        },
    ],
    22: [
        {
            kind: 'watch',
            title: 'TOEFL EXAM week',
            source: 'ETS',
            url: 'https://www.ets.org/toefl.html',
            detail: 'Sleep matters more than one more practice test.',
        },
        {
            kind: 'read',
            title: 'arXiv submission guidelines',
            source: 'arXiv',
            detail: 'Endorsement, licence, categories — read this before you need it.',
        },
        {
            kind: 'build',
            title: 'PUBLISH: arXiv preprint or a detailed technical write-up',
            source: 'arXiv / your blog + GitHub',
            detail: 'A preprint with your supervisor endorsing it is the strongest version. A thorough technical post plus code is a genuine second-best.',
        },
        {
            kind: 'aieng',
            title: 'Job applications + mock interviews',
            source: 'Tech Interview Handbook',
            url: 'https://www.techinterviewhandbook.org/',
            detail: 'Your DSA is 22 weeks strong by now. Trust it.',
        },
    ],
    23: [
        {
            kind: 'watch',
            title: 'Talks by the professors on your list',
            source: 'Conference talks on YouTube',
            detail: 'Hearing someone talk for 20 minutes tells you more about supervision fit than a publication list.',
        },
        {
            kind: 'read',
            title: 'Three recent papers from each of your top 10 professors',
            source: 'Their group pages',
            detail: 'Build the list first: 25-30 names, recent papers, funding, whether they are taking students.',
        },
        {
            kind: 'build',
            title: 'The professor list itself, with notes',
            source: 'Your own document',
            detail: 'One line per professor on why you specifically. That line becomes the email.',
        },
        {
            kind: 'aieng',
            title: 'Job applications continue',
            source: 'Keep the pipeline moving',
        },
    ],
    24: [
        {
            kind: 'watch',
            title: 'System design practice',
            source: 'Interview prep',
            detail: 'Your Interview Hub in this app has the behavioural half covered. This is the other half.',
        },
        {
            kind: 'read',
            title: 'The papers of the five professors you are emailing this week',
            source: 'Their recent work',
            detail: 'Never generic. A personalised email is the only kind worth sending.',
        },
        {
            kind: 'build',
            title: 'Draft your Statement of Purpose',
            source: 'Your own words',
            detail: 'The six months you just did IS the statement. Reproduction, extension, published work, and a job doing it.',
        },
        {
            kind: 'aieng',
            title: 'Interviews',
            source: 'Real ones',
        },
    ],
    25: [
        {
            kind: 'watch',
            title: 'Light — the work is writing now',
            source: 'Phase 6',
        },
        {
            kind: 'read',
            title: 'The Elements of Style',
            source: 'Strunk & White · public domain',
            detail: 'Short. Fixes more academic writing than any longer book.',
        },
        {
            kind: 'build',
            title: 'Refine the SoP; get it edited by a native speaker',
            source: 'Your SoP',
            detail: 'Then five more professor emails.',
        },
        {
            kind: 'aieng',
            title: 'REQUEST RECOMMENDATION LETTERS',
            source: 'Three months notice, minimum',
            detail: 'Send each referee your CV, your SoP and the specific deadlines. Make saying yes easy.',
        },
    ],
    26: [
        {
            kind: 'watch',
            title: 'Nothing. Look back instead.',
            source: 'Review week',
            detail: 'Open your hours log at week 1 and read forward. Twenty-six weeks of evidence.',
        },
        {
            kind: 'read',
            title: 'Your own write-ups, start to finish',
            source: 'Your GitHub',
            detail: 'An honest review: what worked, what did not, what you would cut.',
        },
        {
            kind: 'build',
            title: 'Plan the next six months',
            source: 'A fresh page',
            detail: 'GRE if needed, a second project, December 2027 applications.',
        },
        {
            kind: 'aieng',
            title: 'Rest. You have earned it.',
            source: 'Genuinely',
        },
    ],
};

/** Guard against a week silently having no material. */
export const getWeekResources = (week: number): WeekResource[] => weekResources[week] ?? [];
