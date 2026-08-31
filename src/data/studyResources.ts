// Exactly what to watch, read and build — for every one of the 52 weeks.
//
// Every entry carries its exact title and source as well as a link, on purpose.
// Course pages move and playlists get re-cut; a title and an author never rot,
// so if a link ever dies the thing to search for is right there on the card.
//
// Links point at canonical homes (the course page, the author's site, the repo)
// rather than at individual video ids, for the same reason.

import { PLAN_WEEKS } from './studyPlan';

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

/** Keyed by week number, 1-52. */
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
            detail: 'Then set up the accounts you will use all year: GitHub, Colab, Overleaf, Weights & Biases.',
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
            source: 'The most important decision of the year',
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
            title: 'Convex Optimization I (EE364A) — lectures 1-5',
            source: 'Stephen Boyd · Stanford',
            url: 'https://web.stanford.edu/~boyd/cvxbook/',
            detail: 'Convexity, duality, KKT. Watch for the shape of the argument, not the algebra.',
        },
        {
            kind: 'read',
            title: 'Convex Optimization — Ch 1-5',
            source: 'Boyd & Vandenberghe · free PDF',
            url: 'https://web.stanford.edu/~boyd/cvxbook/',
            detail: 'Convex sets, convex functions, duality. Work the examples; skip the proofs you cannot follow yet.',
        },
        {
            kind: 'build',
            title: 'Gradient descent on a convex problem, then on one that is not',
            source: 'Stage 5',
            detail: 'Implement line search. Watch what a badly conditioned problem does to plain gradient descent.',
        },
    ],
    14: [
        {
            kind: 'watch',
            title: 'Why Momentum Really Works',
            source: 'distill.pub',
            url: 'https://distill.pub/2017/momentum/',
            detail: 'Interactive, not a video. Play with the sliders until the conditioning argument is obvious.',
        },
        {
            kind: 'read',
            title: 'Adam: A Method for Stochastic Optimization',
            source: 'Kingma & Ba',
            url: 'https://arxiv.org/abs/1412.6980',
            detail: 'Then the Ruder overview of gradient descent variants. Know what Adam is estimating.',
        },
        {
            kind: 'build',
            title: 'SGD, momentum, RMSProp and Adam from scratch — race them',
            source: 'GATE WEEK',
            detail: 'Same problem, four optimisers, one plot. Then find a case where Adam is worse than SGD.',
        },
    ],
    15: [
        {
            kind: 'watch',
            title: 'Nothing new. Re-watch what did not land in Stage 5.',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Your own notes from weeks 1-14',
            source: 'Your logbook',
            detail: 'Redo every problem you got wrong the first time.',
        },
        {
            kind: 'build',
            title: 'Ship anything unposted. WRITE, PUBLISH, POST.',
            source: 'Consolidation',
            detail: 'Consolidation weeks are for finishing, not starting.',
        },
    ],
    16: [
        {
            kind: 'watch',
            title: 'The spelled-out intro to neural networks and backpropagation',
            source: 'Andrej Karpathy · Zero to Hero #1',
            url: 'https://karpathy.ai/zero-to-hero.html',
            detail: 'The most important two hours in the plan. Type along, do not watch passively.',
        },
        {
            kind: 'read',
            title: 'Deep Learning: Foundations and Concepts — Ch 6',
            source: 'Christopher Bishop',
            url: 'https://www.bishopbook.com/',
            detail: 'The formal version of what Karpathy just built by hand.',
        },
        {
            kind: 'build',
            title: 'micrograd, typing every line yourself',
            source: 'Stage 6',
            detail: 'Repo: github.com/karpathy/micrograd. Do not copy-paste — the typing is the point.',
        },
    ],
    17: [
        {
            kind: 'watch',
            title: 'Zero to Hero #2 — makemore, part 1',
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Calculus on Computational Graphs: Backpropagation',
            source: 'Chris Olah',
            url: 'https://colah.github.io/posts/2015-08-Backprop/',
            detail: 'Backprop as reverse-mode autodiff. Short, and it is the mental model you keep.',
        },
        {
            kind: 'build',
            title: 'Extend micrograd: tanh, exp, and one operation of your own design',
            source: 'Stage 6',
            detail: 'Then put a real MLP on top of it and train the thing.',
        },
    ],
    18: [
        {
            kind: 'watch',
            title: 'Nothing new — the whiteboard is the work this week',
            source: 'GATE WEEK',
            detail: 'Backprop through a 2-layer MLP, no notes, until it is automatic.',
        },
        {
            kind: 'read',
            title: 'Your own micrograd source, as if someone else wrote it',
            source: 'Your repo',
            detail: 'If a line is not obvious to you now, that is the line to whiteboard.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 1: autograd engine. WRITE, PUBLISH, POST.',
            source: 'GATE WEEK',
            detail: 'BUILD is done. The other three steps are the half anyone else ever sees.',
        },
        {
            kind: 'aieng',
            title: 'Post: Building an autograd engine from scratch',
            source: 'Your blog',
            detail: 'What the chain rule looks like as code. 300 words minimum, link the repo.',
        },
    ],
    19: [
        {
            kind: 'watch',
            title: 'Zero to Hero #3 — makemore: activations, gradients, BatchNorm',
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Understanding the difficulty of training deep feedforward networks (Xavier)',
            source: 'Glorot & Bengio',
            detail: 'Then He et al. on PReLU initialisation. Know why the variance argument matters.',
        },
        {
            kind: 'build',
            title: 'makemore in pure NumPy — watch the activation histograms',
            source: 'Stage 7',
            detail: 'Break the initialisation on purpose, then fix it by hand.',
        },
    ],
    20: [
        {
            kind: 'watch',
            title: 'Zero to Hero #4-5 — makemore continued',
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Batch Normalization',
            source: 'Ioffe & Szegedy',
            url: 'https://arxiv.org/abs/1502.03167',
            detail: 'Then Layer Normalization (Ba et al.). What each one normalises, and why placement matters.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 2: the fruit detection paper. Finish it and SUBMIT it.',
            source: 'Stage 7',
            detail: 'The only artifact that comes with a recommendation letter. Saturdays have been for this.',
        },
        {
            kind: 'aieng',
            title: 'Submit, then write the plain-language version',
            source: 'Your blog',
            detail: 'What the paper found and what you would do next.',
        },
    ],
    21: [
        {
            kind: 'watch',
            title: 'Zero to Hero #6 — becoming a backprop ninja',
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Dropout: A Simple Way to Prevent Neural Networks from Overfitting',
            source: 'Srivastava et al.',
            detail: 'Activations, dead units, vanishing and exploding gradients.',
        },
        {
            kind: 'build',
            title: 'GATE: manual backprop through makemore, every single operation',
            source: 'GATE WEEK',
            detail: 'No autograd. If you cannot do it by hand you do not know it.',
        },
    ],
    22: [
        {
            kind: 'watch',
            title: 'Nothing new. Re-watch what did not land in Stage 7.',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Your own notes from weeks 16-21',
            source: 'Your logbook',
        },
        {
            kind: 'build',
            title: 'Ship anything unposted. All four steps.',
            source: 'Consolidation',
            detail: 'The fruit paper is submitted — make sure its code and write-up are public too.',
        },
    ],
    23: [
        {
            kind: 'watch',
            title: 'Machine Learning Theory — PAC learning and VC dimension',
            source: 'Shalev-Shwartz lectures / Cornell CS4780',
        },
        {
            kind: 'read',
            title: 'Understanding Machine Learning — Ch 2-6',
            source: 'Shalev-Shwartz & Ben-David · free PDF',
            url: 'https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/',
            detail: 'PAC learning, uniform convergence, the bias-complexity tradeoff.',
        },
        {
            kind: 'build',
            title: 'Implement a PAC bound and check it holds on data you generate',
            source: 'Stage 8',
        },
    ],
    24: [
        {
            kind: 'watch',
            title: 'Double descent and the generalisation puzzle',
            source: 'Yannic Kilcher / conference talks',
        },
        {
            kind: 'read',
            title: 'Understanding deep learning requires rethinking generalization',
            source: 'Zhang et al.',
            url: 'https://arxiv.org/abs/1611.03530',
            detail: 'Then Deep Double Descent (Nakkiran et al.) and The Lottery Ticket Hypothesis (Frankle & Carbin).',
        },
        {
            kind: 'build',
            title: 'GATE: reproduce a double-descent curve on your own machine',
            source: 'GATE WEEK',
            detail: 'Multiple seeds, error bars, honest axes. A single run is not a curve.',
        },
    ],
    25: [
        {
            kind: 'watch',
            title: 'Convolutional networks — convolution, pooling, receptive fields',
            source: 'Stanford CS231n',
            url: 'https://cs231n.github.io/',
        },
        {
            kind: 'read',
            title: 'Deep Residual Learning for Image Recognition (ResNet)',
            source: 'He et al.',
            url: 'https://arxiv.org/abs/1512.03385',
            detail: 'Read AlexNet first for the before, then ResNet for what changed.',
        },
        {
            kind: 'build',
            title: 'Convolution and its backward pass in NumPy, then a small ResNet in PyTorch',
            source: 'Stage 9',
        },
    ],
    26: [
        {
            kind: 'watch',
            title: 'Sequence models and where RNNs break',
            source: 'Stanford CS224N',
        },
        {
            kind: 'read',
            title: 'Understanding LSTM Networks',
            source: 'Chris Olah',
            url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/',
            detail: 'The clearest explanation of the gating idea anywhere.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 3: RAG system with a real evaluation harness',
            source: 'Stage 9',
            detail: 'Golden dataset, LLM-as-judge, numbers you would defend. The eval is the artifact.',
        },
        {
            kind: 'aieng',
            title: 'Post: why most RAG demos have no evaluation',
            source: 'Your blog',
            detail: 'Show the queries yours fails on. The failures are the credible part.',
        },
    ],
    27: [
        {
            kind: 'watch',
            title: 'Vision Transformer explained',
            source: 'Yannic Kilcher',
            url: 'https://www.youtube.com/@YannicKilcher',
        },
        {
            kind: 'read',
            title: 'An Image Is Worth 16x16 Words (ViT)',
            source: 'Dosovitskiy et al.',
            url: 'https://arxiv.org/abs/2010.11929',
            detail: 'Then Swin. Note what changes when attention gets a window.',
        },
        {
            kind: 'build',
            title: 'Attention in NumPy, from scratch',
            source: 'GATE WEEK',
            detail: 'Q, K, V, the sqrt(d) scaling, multi-head. NumPy only, no PyTorch. This is the gate - do not skip to torch.',
        },
    ],
    28: [
        {
            kind: 'watch',
            title: 'Re-watch anything from Stage 9 that did not land',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Your own notes from weeks 16-27',
            source: 'Your logbook',
        },
        {
            kind: 'build',
            title: 'Finish ARTIFACT 4 write-up: WRITE, PUBLISH, POST',
            source: 'Consolidation',
            detail: 'The GPT is due week 32 but the autograd post is overdue. Consolidation weeks are for shipping, not new material.',
        },
    ],
    29: [
        {
            kind: 'watch',
            title: "Let's build the GPT Tokenizer",
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Neural Machine Translation of Rare Words with Subword Units',
            source: 'Sennrich et al.',
            url: 'https://arxiv.org/abs/1508.07909',
        },
        {
            kind: 'build',
            title: 'BPE tokeniser from scratch, no libraries',
            source: 'Stage 10',
        },
    ],
    30: [
        {
            kind: 'watch',
            title: "Let's build GPT: from scratch, in code, spelled out",
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'The Annotated Transformer',
            source: 'Harvard NLP',
            url: 'https://nlp.seas.harvard.edu/annotated-transformer/',
        },
        {
            kind: 'build',
            title: 'nanoGPT, typed by hand',
            source: 'Stage 10',
        },
    ],
    31: [
        {
            kind: 'watch',
            title: "Let's reproduce GPT-2 (124M)",
            source: 'Andrej Karpathy',
            url: 'https://karpathy.ai/zero-to-hero.html',
        },
        {
            kind: 'read',
            title: 'Language Models are Unsupervised Multitask Learners (GPT-2)',
            source: 'Radford et al.',
        },
        {
            kind: 'build',
            title: 'Train it. Watch the loss curve. Debug what goes wrong.',
            source: 'Stage 10',
            detail: 'This is where mixed precision, gradient clipping and LR warmup stop being words.',
        },
    ],
    32: [
        {
            kind: 'watch',
            title: 'Stanford CS336 lectures 8-9',
            source: 'Stanford',
            url: 'https://stanford-cs336.github.io/',
        },
        {
            kind: 'read',
            title: 'Scaling Laws for Neural Language Models',
            source: 'Kaplan et al.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 4: GPT from nothing. BUILD/WRITE/PUBLISH/POST.',
            source: 'GATE WEEK',
        },
        {
            kind: 'aieng',
            title: 'Post: What I learned building GPT from scratch',
            source: 'Your blog',
            detail: '800 words minimum. Link the repo.',
        },
    ],
    33: [
        {
            kind: 'watch',
            title: 'CS336 - scaling and data',
            source: 'Stanford',
            url: 'https://stanford-cs336.github.io/',
        },
        {
            kind: 'read',
            title: 'Training Compute-Optimal LLMs (Chinchilla)',
            source: 'Hoffmann et al.',
            url: 'https://arxiv.org/abs/2203.15556',
        },
        {
            kind: 'build',
            title: 'Fine-tune a small model with LoRA',
            source: 'Stage 11',
        },
    ],
    34: [
        {
            kind: 'watch',
            title: 'RLHF explained',
            source: 'Hugging Face',
            url: 'https://huggingface.co/blog/rlhf',
        },
        {
            kind: 'read',
            title: 'Training language models to follow instructions (InstructGPT)',
            source: 'Ouyang et al.',
            url: 'https://arxiv.org/abs/2203.02155',
            detail: 'Then DPO. Understand why DPO removed the reward model.',
        },
        {
            kind: 'build',
            title: 'Implement DPO on a toy preference dataset',
            source: 'Stage 11',
        },
    ],
    35: [
        {
            kind: 'watch',
            title: 'Mixture of Experts explained',
            source: 'Trelis / Yannic Kilcher',
        },
        {
            kind: 'read',
            title: 'Mamba: Linear-Time Sequence Modeling',
            source: 'Gu & Dao',
            url: 'https://arxiv.org/abs/2312.00752',
        },
        {
            kind: 'build',
            title: 'GATE: fine-tune with LoRA and explain what it changes',
            source: 'GATE WEEK',
        },
    ],
    36: [
        {
            kind: 'watch',
            title: 'Nothing new. Re-read your reading log.',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Your own paper notes, weeks 22-35',
            source: 'Your logbook',
        },
        {
            kind: 'build',
            title: 'Ship anything unposted. Choose the reproduction paper now.',
            source: 'Consolidation',
            detail: 'Recent, your subfield, runs on one free GPU. Choosing it late is the commonest way week 49 slips.',
        },
    ],
    37: [
        {
            kind: 'watch',
            title: 'Variational Autoencoders',
            source: 'Arxiv Insights',
        },
        {
            kind: 'read',
            title: 'Auto-Encoding Variational Bayes',
            source: 'Kingma & Welling',
            url: 'https://arxiv.org/abs/1312.6114',
        },
        {
            kind: 'build',
            title: 'Derive the ELBO on paper BEFORE any code. GATE.',
            source: 'GATE WEEK',
        },
    ],
    38: [
        {
            kind: 'watch',
            title: 'Diffusion models explained',
            source: 'Computerphile / Outlier',
        },
        {
            kind: 'read',
            title: 'What are Diffusion Models?',
            source: 'Lilian Weng',
            url: 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/',
            detail: 'Then DDPM itself.',
        },
        {
            kind: 'build',
            title: 'Minimal diffusion model on MNIST',
            source: 'Stage 12',
        },
    ],
    39: [
        {
            kind: 'watch',
            title: 'David Silver RL Course, lectures 1-3',
            source: 'DeepMind',
        },
        {
            kind: 'read',
            title: 'Spinning Up in Deep RL - intro and PPO',
            source: 'OpenAI',
            url: 'https://spinningup.openai.com/',
            detail: 'E level only. You need PPO because RLHF uses it.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 5: VAE from scratch + LaTeX derivation',
            source: 'Stage 12',
        },
        {
            kind: 'aieng',
            title: 'Post: Deriving the ELBO by hand',
            source: 'Your blog',
            detail: 'Learn Overleaf now.',
        },
    ],
    40: [
        {
            kind: 'watch',
            title: 'GPU MODE lecture 1',
            source: 'GPU MODE',
            url: 'https://www.youtube.com/@GPUMODE',
        },
        {
            kind: 'read',
            title: 'GPU Puzzles',
            source: 'Sasha Rush',
            url: 'https://github.com/srush/GPU-Puzzles',
            detail: 'Numba, pure Python. Work them, do not read them.',
        },
        {
            kind: 'build',
            title: 'Triton tutorials 1-2: vector add, fused softmax',
            source: 'Triton',
            url: 'https://triton-lang.org/',
        },
        {
            kind: 'aieng',
            title: 'Book IELTS Academic - target speaking band 8.0',
            source: 'IELTS',
            url: 'https://www.ielts.org/',
            detail: 'Speaking 8.0 is required for TA funding at Purdue and '
                + 'Michigan State. Admission may waive the test; TA eligibility '
                + 'often does not. Ask both questions separately.',
        },
    ],
    41: [
        {
            kind: 'watch',
            title: 'GPU MODE - performance and profiling',
            source: 'GPU MODE',
            url: 'https://www.youtube.com/@GPUMODE',
        },
        {
            kind: 'read',
            title: 'Making Deep Learning Go Brrrr From First Principles',
            source: 'Horace He',
            url: 'https://horace.io/brrr_intro.html',
            detail: 'The best free explanation of compute vs memory vs overhead bound. Read it twice.',
        },
        {
            kind: 'build',
            title: 'Triton tutorial 3: matmul. Benchmark vs torch.matmul.',
            source: 'Triton',
            url: 'https://triton-lang.org/',
        },
    ],
    42: [
        {
            kind: 'watch',
            title: 'torch.compile internals',
            source: 'PyTorch dev podcast',
        },
        {
            kind: 'read',
            title: 'Triton: An Intermediate Language for Tiled Neural Network Computations',
            source: 'Tillet et al.',
        },
        {
            kind: 'build',
            title: 'GATE: fused softmax kernel in Triton, beating naive',
            source: 'GATE WEEK',
        },
    ],
    43: [
        {
            kind: 'watch',
            title: 'Nothing new.',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'Your kernel benchmarks',
            source: 'Your own numbers',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 6: Triton kernel suite, benchmarked. BUILD/WRITE/PUBLISH/POST.',
            source: 'Consolidation',
        },
        {
            kind: 'aieng',
            title: 'Post: Writing GPU kernels in Python - what the roofline told me',
            source: 'Your blog',
        },
    ],
    44: [
        {
            kind: 'watch',
            title: 'Quantization explained',
            source: 'Hugging Face',
        },
        {
            kind: 'read',
            title: 'LLM.int8()',
            source: 'Dettmers et al.',
            url: 'https://arxiv.org/abs/2208.07339',
            detail: 'Then GPTQ.',
        },
        {
            kind: 'build',
            title: 'INT8 quantisation by hand in NumPy. No library.',
            source: 'Stage 14',
        },
    ],
    45: [
        {
            kind: 'watch',
            title: 'MLSys 2024 - AWQ talk',
            source: 'MLSys',
            url: 'https://mlsys.org/',
        },
        {
            kind: 'read',
            title: 'SmoothQuant',
            source: 'Xiao et al.',
            url: 'https://arxiv.org/abs/2211.10438',
            detail: 'Then AWQ. Third pass on both - derive the maths.',
        },
        {
            kind: 'build',
            title: 'Quantise your own GPT. FP16 vs INT8 vs INT4. Plot the curve.',
            source: 'Stage 14',
        },
    ],
    46: [
        {
            kind: 'watch',
            title: 'Pruning and distillation',
            source: 'Han Lab / MIT 6.5940',
            url: 'https://hanlab.mit.edu/courses/2024-fall-65940',
        },
        {
            kind: 'read',
            title: 'The Lottery Ticket Hypothesis',
            source: 'Frankle & Carbin',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 7: quantisation study. GATE week.',
            source: 'GATE WEEK',
        },
        {
            kind: 'aieng',
            title: 'Post: INT8, INT4, and where the accuracy actually goes',
            source: 'Your blog',
        },
    ],
    47: [
        {
            kind: 'watch',
            title: 'FlashAttention explained',
            source: 'Aleksa Gordic',
        },
        {
            kind: 'read',
            title: 'Efficient Memory Management for LLM Serving with PagedAttention',
            source: 'Kwon et al.',
            url: 'https://arxiv.org/abs/2309.06180',
            detail: 'Then READ THE PYTHON SOURCE: vllm/core/scheduler.py, vllm/core/block_manager.py, vllm/engine/llm_engine.py. The design decisions are all in Python.',
        },
        {
            kind: 'build',
            title: 'Serve your GPT with vLLM, end to end',
            source: 'Stage 15',
        },
    ],
    48: [
        {
            kind: 'watch',
            title: 'GPU MODE - profiling deep dive',
            source: 'GPU MODE',
            url: 'https://www.youtube.com/@GPUMODE',
        },
        {
            kind: 'read',
            title: 'Fast Inference from Transformers via Speculative Decoding',
            source: 'Leviathan et al.',
        },
        {
            kind: 'build',
            title: 'Profile vLLM with torch.profiler. Prefill vs decode.',
            source: 'Stage 15',
        },
    ],
    49: [
        {
            kind: 'watch',
            title: 'Parallelism strategies',
            source: 'Hugging Face / Ultrascale',
        },
        {
            kind: 'read',
            title: 'ZeRO: Memory Optimizations Toward Training Trillion Parameter Models',
            source: 'Rajbhandari et al.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 8: reproduction matching published numbers. GATE.',
            source: 'GATE WEEK',
        },
        {
            kind: 'aieng',
            title: 'Post: Reproducing [paper] - what matched, what did not, and why',
            source: 'Your blog',
            detail: 'The honest gaps are the credible part. Do not hide them.',
        },
    ],
    50: [
        {
            kind: 'watch',
            title: 'Nothing new.',
            source: 'Consolidation',
        },
        {
            kind: 'read',
            title: 'MLSys proceedings, last two years',
            source: 'MLSys',
            url: 'https://mlsys.org/',
            detail: 'Sweep it. Note last authors - those are the PIs.',
        },
        {
            kind: 'build',
            title: 'Ship every unposted artifact. All four steps, all eight.',
            source: 'Consolidation',
        },
    ],
    51: [
        {
            kind: 'watch',
            title: 'How to write a great research paper',
            source: 'Simon Peyton Jones',
        },
        {
            kind: 'read',
            title: 'Two recent papers from your target venue, FOR STRUCTURE',
            source: 'Your target venue',
            detail: 'Not for content. How is the abstract built? Where does related work sit? What do the limitations admit?',
        },
        {
            kind: 'build',
            title: 'Write up your extension in the NeurIPS LaTeX template',
            source: 'Stage 16',
        },
    ],
    52: [
        {
            kind: 'watch',
            title: 'Anthropic / Distill interpretability explainers',
            source: 'Read only',
        },
        {
            kind: 'read',
            title: 'Alignment, interpretability, fairness, privacy - one each',
            source: 'AWARENESS WEEK',
            detail: 'AWARENESS WEEK. A-level only. Define it, say why it matters, name a paper. Do not go deeper.',
        },
        {
            kind: 'build',
            title: 'ARTIFACT 9: extension + preprint. Then plan Sept 2027 - Dec 2028: second research cycle, IELTS, professor list, applications.',
            source: 'Stage 16',
        },
        {
            kind: 'aieng',
            title: 'Read your hours log from week 1 forward',
            source: 'Your logbook',
            detail: 'Fifty-two weeks of evidence. That IS the statement of purpose.',
        },
    ],
};

/**
 * Guard against a week silently having no material.
 *
 * This returned [] for weeks 27-52 for a while and the mornings simply
 * rendered blank, which is exactly the kind of hole that hides until you are
 * standing in it. In dev it now says so.
 */
export const getWeekResources = (week: number): WeekResource[] => {
    const found = weekResources[week];
    if (!found && import.meta.env.DEV && week >= 1 && week <= PLAN_WEEKS) {
        console.warn(`No resources for week ${week}`);
    }
    return found ?? [];
};
