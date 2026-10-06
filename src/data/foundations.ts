// ML Foundations — the self-paced roadmap for AI and ML engineering, from scratch.
//
// Eight phases, taken in order. Every topic carries three kinds of material:
//   - a short plain-English note (the idea, an analogy, where the analogy
//     breaks, an example or code),
//   - the exact resources to learn it from (what to watch, read and code with;
//     original papers are marked optional, for later),
//   - one practice exercise for each of the four checks. No answers, on purpose.
//
// Everything here is fixed content. Ticked checks and finished mini-builds live
// in Firestore under study_progress/foundations (see firebaseService.ts).

export type CheckKey = 'explain' | 'derive' | 'build' | 'break';

/** The order the checks are shown and ticked in. */
export const CHECK_KEYS: CheckKey[] = ['explain', 'derive', 'build', 'break'];

export const CHECK_LABELS: Record<CheckKey, string> = {
    explain: 'Explain',
    derive: 'Derive',
    build: 'Build',
    break: 'Break',
};

export const CHECK_MEANINGS: Record<CheckKey, string> = {
    explain: 'Say it in plain words, with no notes.',
    derive: 'Write the maths, or the steps, from memory.',
    build: 'Code it from scratch in NumPy, with no ML library.',
    break: 'Show when it fails, and why.',
};

/** One worked example of all four checks, shown once at the top of the page. */
export const CHECK_EXAMPLES: Record<CheckKey, string> = {
    explain: 'Gradient descent changes the weights a little at a time, in the direction that makes the loss smaller.',
    derive: 'Write w ← w − η·∂L/∂w, then derive ∂L/∂w for mean squared error on paper.',
    build: 'Fit a line to data with your own gradient descent loop.',
    break: 'Set the learning rate too high and show the loss exploding.',
};

export const CONFIDENT_RULE =
    'A topic is finished when you pass all four checks, not when you finish a video. ' +
    'Be strict: if you needed your notes, it is not ticked yet.';

export interface LoopStep {
    step: 'READ' | 'LEARN' | 'PRACTISE' | 'PROVE';
    detail: string;
}

/** The same four steps for every topic, in this order. */
export const topicLoop: LoopStep[] = [
    { step: 'READ', detail: 'The Learn it simply note: the idea, an analogy, where the analogy breaks, and an example. Five minutes.' },
    { step: 'LEARN', detail: "The topic's own resources: watch first, then read, then code along. For a full lesson, ask Claude 'teach me' and the topic name." },
    { step: 'PRACTISE', detail: "The four exercises. No answers are given. Try first, then ask Claude to 'check my answer'." },
    { step: 'PROVE', detail: 'Tick each check only when you can do it without notes. Re-test old topics every two weeks, and untick any you fail.' },
];

export const foundationRules: string[] = [
    'Go in order. Each phase assumes the ones before it.',
    'One main resource per topic. The others are backups. Switching resources feels like progress, but it is not.',
    'Start building before you feel ready. Getting stuck while coding is where real learning happens.',
    'Every two weeks, test yourself on old topics. If you fail a check, untick it. An honest tracker is worth more than a full one.',
    'Python, NumPy and PyTorch only. If a resource uses scikit-learn or TensorFlow in its exercises, do the exercise in NumPy or PyTorch instead.',
    'Papers are optional for now. They are marked so you can come back to them once the foundations are solid.',
];

export type TopicResourceKind = 'watch' | 'read' | 'code' | 'paper';

export const RESOURCE_KIND_ORDER: TopicResourceKind[] = ['watch', 'read', 'code', 'paper'];

export const RESOURCE_KIND_LABELS: Record<TopicResourceKind, string> = {
    watch: 'WATCH',
    read: 'READ',
    code: 'CODE',
    paper: 'PAPER · OPTIONAL',
};

export interface TopicResource {
    kind: TopicResourceKind;
    /** The exact title, so it stays findable even if a link moves. */
    title: string;
    source: string;
    /** A direct link, or a search link where the exact page is likely to move. */
    url?: string;
}

export interface FoundationResource {
    title: string;
    /** Missing for paid books with no single canonical page. */
    url?: string;
    kind: string;
    free?: boolean;
    paid?: boolean;
    why: string;
}

export interface TopicNote {
    idea: string;
    analogy: string;
    /** Where the analogy stops being true — the part that stops you learning it wrong. */
    breaks: string;
    example?: string;
    code?: string;
    codeLanguage?: 'python' | 'bash';
}

export type TopicPractice = Record<CheckKey, string>;

/** A picture of the idea, in Mermaid syntax, and a sentence on how to read it. */
export interface TopicDiagram {
    code: string;
    caption: string;
}

export interface FoundationTopic {
    /** Stable id, used as the Firestore key. Never renumber: ids need not match display order. */
    id: string;
    name: string;
    note: TopicNote;
    diagram: TopicDiagram;
    resources: TopicResource[];
    practice: TopicPractice;
}

export interface MiniBuild {
    id: string;
    text: string;
}

export interface FoundationPhase {
    id: string;
    number: number;
    short: string;
    title: string;
    accent: string;
    goal: string;
    bigPicture: string;
    /** The phase's backbone resources. Each topic also lists its own. */
    main: FoundationResource[];
    deeper: FoundationResource[];
    topics: FoundationTopic[];
    builds: MiniBuild[];
    /** Interview-style questions. Answer out loud before looking anything up. */
    ready: string[];
}

export const foundationPhases: FoundationPhase[] = [
    {
        id: 'toolkit',
        number: 0,
        short: 'Toolkit',
        title: 'Your toolkit',
        accent: '#90a4ae',
        goal: 'Get fast with the tools you will use every day. This phase is short. Do it in the same two weeks as the start of Phase 1.',
        bigPicture: 'Tools are like a carpenter\'s workshop. You cannot learn furniture design while fighting with the saw. NumPy is your saw: practise until it feels natural.',
        main: [
            { title: 'NumPy: the absolute basics for beginners', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', kind: 'Guide', free: true, why: 'The official guide. Short and clear. Type every example yourself.' },
            { title: 'From Python to NumPy (Nicolas Rougier)', url: 'https://www.labri.fr/perso/nrougier/from-python-to-numpy/', kind: 'Book', free: true, why: 'Teaches you to think in whole arrays instead of loops. This is the key NumPy skill.' },
        ],
        deeper: [
            { title: 'The Missing Semester (MIT)', url: 'https://missing.csail.mit.edu/', kind: 'Course', free: true, why: 'Shell, Git and developer tools. The Git lecture is the important one.' },
            { title: 'PyTorch: Learn the Basics', url: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html', kind: 'Tutorial', free: true, why: 'Keep this for the start of Phase 3.' },
        ],
        topics: [
            {
                id: 'f0-t6',
                name: 'Meet machine learning: the big picture',
                diagram: {
                    code: 'flowchart LR\n  D[("Examples<br/>features + labels")] --> M["Model<br/>(weights)"]\n  M --> P["Prediction"]\n  P --> L{"Loss:<br/>how wrong?"}\n  D -.->|"right answers"| L\n  L --> O["Optimiser:<br/>adjust weights a little"]\n  O -->|"repeat many times"| M\n  M ==>|"when the loss is low"| T["Test on new data"] ==> DEP["Deploy"]',
                    caption: 'The loop in the middle is training: predict, measure the loss, adjust the weights, repeat. Only when it\'s good on new data does the model go live.',
                },
                note: {
                    idea: 'Machine learning means learning a pattern from examples instead of writing the rules by hand. You give a model inputs (features) and the right answers (labels). The model makes a guess, a loss function measures how wrong it is, and an optimiser nudges the model\'s numbers (its weights) to make the loss smaller. Repeat that many times and the model learns. Then you test it on data it has never seen, and if it\'s good, you deploy it.',
                    analogy: 'Learning to throw darts. You throw (a prediction), see how far you landed from the bullseye (the loss), adjust your arm a little (an optimiser update), and throw again. After hundreds of throws, you\'re accurate.',
                    breaks: 'A person can feel why a throw missed. A model only gets one number, the loss; the gradient then tells it which way to adjust every weight at once — sometimes millions of them.',
                    example: 'Predicting house prices. The feature is the size, the label is the price, the model is ŷ = w·size + b, the loss is the squared error, and gradient descent adjusts w and b. The code below learns that each square metre adds about £3,000.',
                    code: 'import numpy as np\n\nX = np.array([50., 80., 120.])        # feature: size in m²\ny = np.array([150., 240., 360.])      # label: price in £1,000s\nw, b, lr = 0.0, 0.0, 0.0001\n\nfor step in range(1000):\n    pred = w * X + b                   # 1. predict\n    loss = np.mean((pred - y) ** 2)    # 2. measure how wrong\n    grad_w = np.mean(2 * (pred - y) * X)\n    grad_b = np.mean(2 * (pred - y))\n    w, b = w - lr * grad_w, b - lr * grad_b   # 3. adjust, then repeat\n\nprint(round(w, 2))                     # about 3.0: £3,000 per m²',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 1–2: what a neural network is, and how it learns', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'watch', title: 'A Gentle Introduction to Machine Learning', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+A+Gentle+Introduction+to+Machine+Learning' },
                    { kind: 'read', title: 'Machine Learning Crash Course: introduction and linear regression', source: 'Google, free', url: 'https://developers.google.com/machine-learning/crash-course' },
                ],
                practice: {
                    explain: 'Explain the learning loop — predict, measure the loss, adjust, repeat — with the dart-throwing picture.',
                    derive: 'For the model ŷ = w·x + b and the loss (ŷ − y)², write the gradients with respect to w and b on paper.',
                    build: 'Run the training loop above. Print the loss every 100 steps and plot it with Matplotlib.',
                    break: 'Make the learning rate 10 times bigger and run it again. What happens to the loss, and why?',
                },
            },
            {
                id: 'f0-t1',
                name: 'NumPy arrays, shapes and indexing',
                diagram: {
                    code: 'block-beta\n  columns 4\n  a0["0"] a1["1"] a2["2"] a3["3"]\n  b0["4"] b1["5"] b2["6 = A[1, 2]"] b3["7"]\n  c0["8"] c1["9"] c2["10"] c3["11"]\n  style b2 fill:#2a6f97,color:#fff',
                    caption: 'A = np.arange(12).reshape(3, 4): 3 rows and 4 columns. A[1, 2] means row 1, column 2 (counting from 0).',
                },
                note: {
                    idea: 'An array is a grid of numbers of the same type. Its shape tells you how many numbers there are along each direction. Shape (3, 4) means 3 rows and 4 columns.',
                    analogy: 'A spreadsheet. The shape is the number of rows and columns. Indexing means picking one cell, a whole row or a whole column.',
                    breaks: 'A spreadsheet has only two directions. An array can have three or more, like a stack of spreadsheets. A batch of colour images has shape (batch, height, width, 3).',
                    code: 'A = np.arange(12).reshape(3, 4)\nA.shape      # (3, 4)\nA[1, 2]      # 6   (row 1, column 2)\nA[:, 0]      # array([0, 4, 8])   the first column',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'NumPy: the absolute basics for beginners', source: 'numpy.org', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html' },
                    { kind: 'read', title: 'Indexing on ndarrays', source: 'numpy.org', url: 'https://numpy.org/doc/stable/user/basics.indexing.html' },
                    { kind: 'watch', title: 'Complete Python NumPy Tutorial', source: 'Keith Galli', url: 'https://www.youtube.com/results?search_query=Keith+Galli+complete+python+numpy+tutorial' },
                ],
                practice: {
                    explain: 'Explain the difference between shapes (3,), (3, 1) and (1, 3) to a friend, with a drawing.',
                    derive: 'Without running code: for A = np.arange(24).reshape(2, 3, 4), write down A.shape, A[1].shape, A[:, 0].shape and A[1, 2, 3]. Then check.',
                    build: 'Make a (5, 4) array of random numbers. Select the last row, the first two columns, every value above 0.5 (with a boolean mask), and the diagonal of its top-left 4 × 4 block.',
                    break: 'Try reshaping a 24-element array to (5, 5) and read the error. Then change a slice B = A[0] and check whether A changed too. Find out what a \'view\' is.',
                },
            },
            {
                id: 'f0-t2',
                name: 'Broadcasting and vectorisation',
                diagram: {
                    code: 'flowchart LR\n  A["scores, shape (3, 1)<br/>70 / 80 / 90"] --> S1["stretched across<br/>to (3, 3)"]\n  B["bonus, shape (1, 3)<br/>0 · 5 · 10"] --> S2["stretched down<br/>to (3, 3)"]\n  S1 --> R["add element by element<br/>result shape (3, 3)"]\n  S2 --> R',
                    caption: 'Broadcasting stretches each direction of size 1 to match the other array, then adds number by number — with no Python loop.',
                },
                note: {
                    idea: 'Vectorisation means one operation works on a whole array at once, instead of a Python loop. Broadcasting lets arrays with different shapes work together, by stretching dimensions of size 1.',
                    analogy: 'A teacher says once: \'everyone add 5 to your score\'. She does not walk to each student.',
                    breaks: 'A teacher can talk to any group. Broadcasting only works when the shapes match from the right, or one of them is 1. Otherwise you get an error, or worse, a silent wrong result.',
                    code: 'scores = np.array([[70], [80], [90]])   # shape (3, 1)\nbonus  = np.array([[0, 5, 10]])         # shape (1, 3)\nscores + bonus                          # shape (3, 3)\n# [[70, 75,  80],\n#  [80, 85,  90],\n#  [90, 95, 100]]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Broadcasting', source: 'numpy.org', url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html' },
                    { kind: 'read', title: 'From Python to NumPy: the vectorisation chapters', source: 'Nicolas Rougier · free book', url: 'https://www.labri.fr/perso/nrougier/from-python-to-numpy/' },
                    { kind: 'code', title: '100 NumPy exercises', source: 'Nicolas Rougier · GitHub', url: 'https://github.com/rougier/numpy-100' },
                ],
                practice: {
                    explain: 'Explain the broadcasting rule in two sentences, using the (3, 1) + (1, 3) example.',
                    derive: 'Predict the result shape, or \'error\', for: (3, 1) + (4,); (2, 3) + (3,); (2, 3) + (2,); (5, 1, 4) + (3, 1). Then check in NumPy.',
                    build: 'Compute pairwise squared distances between the rows of X (n, d) and Y (m, d) with no loops. Compare with a double loop for small n, then time both for n = m = 1,000.',
                    break: 'Add a (3,) array to a (3, 1) array by mistake. You get a (3, 3) result and no error. Write a test that would catch this silent bug.',
                },
            },
            {
                id: 'f0-t3',
                name: 'Plotting results with Matplotlib',
                diagram: {
                    code: 'xychart-beta\n  title "A healthy loss curve"\n  x-axis "training step" [0, 1, 2, 3, 4, 5, 6, 7, 8]\n  y-axis "loss" 0 --> 3\n  line [2.3, 1.6, 1.15, 0.9, 0.72, 0.6, 0.52, 0.47, 0.44]',
                    caption: 'Loss falls fast at first, then flattens. Plotting it is the quickest way to see whether training is working.',
                },
                note: {
                    idea: 'A plot turns numbers into a picture, so you can see patterns and bugs. In ML, the most important plot is the loss curve.',
                    analogy: 'A car dashboard. You don\'t read engine data line by line. You glance at the gauges.',
                    breaks: 'A dashboard shows only the present. A loss curve shows the whole history of training, and that history is where the clues are.',
                    code: 'import matplotlib.pyplot as plt\nplt.plot(losses)\nplt.xlabel("step"); plt.ylabel("loss")\nplt.yscale("log")   # makes small changes visible\nplt.show()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Matplotlib quick start guide', source: 'matplotlib.org', url: 'https://www.google.com/search?q=Matplotlib+quick+start+guide' },
                    { kind: 'watch', title: 'Matplotlib Tutorial (Part 1)', source: 'Corey Schafer', url: 'https://www.youtube.com/results?search_query=Corey+Schafer+Matplotlib+Tutorial+Part+1' },
                ],
                practice: {
                    explain: 'Explain in two sentences why loss curves are often drawn on a log scale.',
                    derive: 'Before plotting anything, sketch by hand: a healthy loss curve, an overfitting pair of train and validation curves, and a learning rate that is too high.',
                    build: 'Plot y = x², its derivative 2x, and 50 noisy samples of y on one figure, with a legend and axis titles. Save it as a PNG.',
                    break: 'Plot a loss that falls from 1,000 to 0.01, first on a normal y-axis, then on a log y-axis. Which one hides the late progress, and why?',
                },
            },
            {
                id: 'f0-t4',
                name: 'Git and GitHub for your projects',
                diagram: {
                    code: 'gitGraph\n  commit id: "start roadmap"\n  commit id: "phase 0 notes"\n  branch experiment\n  checkout experiment\n  commit id: "try a new idea"\n  checkout main\n  commit id: "fix typo"\n  merge experiment\n  commit id: "phase 0 done"',
                    caption: 'Each dot is a commit (a saved snapshot). The experiment branch lets you try an idea safely, then merge it back into main.',
                },
                note: {
                    idea: 'Git saves snapshots of your project, called commits, so you can go back in time. GitHub stores them online and shows your work to employers.',
                    analogy: 'Save points in a video game. You can try something risky, and reload if it goes wrong.',
                    breaks: 'Game saves are for one player. Branches let you, or a team, try several ideas side by side and then merge the good ones.',
                    code: 'git add linear_regression.py\ngit commit -m "Add gradient descent for linear regression"\ngit push',
                    codeLanguage: 'bash',
                },
                resources: [
                    { kind: 'read', title: 'Pro Git, Chapters 1–3', source: 'Scott Chacon · free book', url: 'https://git-scm.com/book/en/v2' },
                    { kind: 'watch', title: 'Version Control (Git)', source: 'The Missing Semester (MIT)', url: 'https://missing.csail.mit.edu/2020/version-control/' },
                    { kind: 'code', title: 'Learn Git Branching', source: 'interactive', url: 'https://learngitbranching.js.org/' },
                ],
                practice: {
                    explain: 'Explain the difference between a commit, a branch and a push.',
                    derive: 'Write from memory the commands to: start a repo, save a change, create a branch, switch back, and push to GitHub.',
                    build: 'Create your roadmap repo. Commit each build separately with a clear message. Add a .gitignore for data files and notebook checkpoints.',
                    break: 'On a branch, change the same line in two different ways and merge. Resolve the merge conflict by hand.',
                },
            },
            {
                id: 'f0-t5',
                name: 'Testing numerical code (np.allclose, pytest)',
                diagram: {
                    code: 'flowchart LR\n  C["Your function<br/>softmax(x)"] --> T["Test with a case<br/>you already know"]\n  T --> Q{"np.allclose(result, expected)?"}\n  Q -->|"yes"| P["Test passes ✓"]\n  Q -->|"no"| F["Test fails ✗<br/>bug found early"]',
                    caption: 'A test runs your code on a known case and compares with a small tolerance, because decimals are never exact.',
                },
                note: {
                    idea: 'A test runs your code on a case where you already know the answer. With decimals, compare with a small tolerance, because computers round numbers.',
                    analogy: 'Checking a calculator with 2 + 2 before you trust it with your taxes.',
                    breaks: 'Passing easy tests does not prove the code is right. Also test edge cases: zeros, one sample, very large numbers.',
                    example: 'In Python, 0.1 + 0.2 == 0.3 is False, but np.allclose(0.1 + 0.2, 0.3) is True.',
                    code: 'def test_softmax_sums_to_one():\n    p = softmax(np.array([1.0, 2.0, 3.0]))\n    assert np.allclose(p.sum(), 1.0)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Get Started', source: 'pytest docs', url: 'https://docs.pytest.org/en/stable/getting-started.html' },
                    { kind: 'read', title: 'numpy.testing.assert_allclose', source: 'numpy.org', url: 'https://numpy.org/doc/stable/reference/generated/numpy.testing.assert_allclose.html' },
                    { kind: 'read', title: 'Floating Point Arithmetic: Issues and Limitations', source: 'Python docs', url: 'https://docs.python.org/3/tutorial/floatingpoint.html' },
                ],
                practice: {
                    explain: 'Explain why == is dangerous for decimal numbers, and what np.allclose does instead.',
                    derive: 'Before writing any test, list five edge cases for a softmax function.',
                    build: 'Write pytest tests for your softmax: it sums to 1, keeps the order of values, handles a (batch, classes) input, and matches a slow loop version.',
                    break: 'Call your softmax on [1000, 1001, 1002]. Do you get NaN? Fix it, and add a test so the bug can never come back.',
                },
            },
        ],
        builds: [
            { id: 'f0-b1', text: 'Rewrite five loop-based functions in vectorised NumPy: dot product, matrix multiply, pairwise distances, softmax, moving average. Time both versions.' },
            { id: 'f0-b2', text: 'Create one GitHub repo for this whole roadmap, with a folder per phase, a README and pytest set up.' },
        ],
        ready: [
            'A is (32, 10) and B is (10, 4). What is the shape of A @ B, and why?',
            'What happens when you add a (3, 1) array to a (1, 4) array? Draw it.',
            'Why is softmax usually computed as exp(x − max(x))?',
        ],
    },
    {
        id: 'math',
        number: 1,
        short: 'Math',
        title: 'Math foundations',
        accent: '#66bb6a',
        goal: 'The language of ML. You will see matrices as movements of space, gradients as directions, and loss functions as probabilities.',
        bigPicture: 'Maths is the grammar of ML. You can memorise sentences (formulas), but you only speak fluently when you know the grammar. Linear algebra describes the data. Calculus describes how things change. Probability describes how sure you are.',
        main: [
            { title: '3Blue1Brown: Essence of Linear Algebra', url: 'https://www.3blue1brown.com/topics/linear-algebra', kind: 'Video', free: true, why: 'You have already started this. Finish it.' },
            { title: '3Blue1Brown: Essence of Calculus', url: 'https://www.3blue1brown.com/topics/calculus', kind: 'Video', free: true, why: 'Derivatives and the chain rule, shown with pictures.' },
            { title: 'Mathematics for Machine Learning (Deisenroth, Faisal, Ong)', url: 'https://mml-book.github.io/', kind: 'Book', free: true, why: 'Your main written text for this phase. Chapters 2 to 7.' },
            { title: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/@statquest', kind: 'Video', free: true, why: 'Probability and statistics in very plain English. One idea per video.' },
        ],
        deeper: [
            { title: 'MIT 18.06 Linear Algebra (Gilbert Strang)', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', kind: 'Course', free: true, why: 'The classic course. Good for PhD-level depth.' },
            { title: 'Harvard Stat 110: Probability (Joe Blitzstein)', url: 'https://www.youtube.com/results?search_query=harvard+stat+110+blitzstein', kind: 'Course', free: true, why: 'Probability done properly, with a free book. Strong preparation for a PhD.' },
            { title: 'Khan Academy: Multivariable calculus', url: 'https://www.khanacademy.org/math/multivariable-calculus', kind: 'Course', free: true, why: 'Partial derivatives and gradients, slowly and step by step.' },
            { title: 'Seeing Theory (Brown University)', url: 'https://seeing-theory.brown.edu/', kind: 'Interactive', free: true, why: 'See probability ideas move. Good when a formula feels abstract.' },
        ],
        topics: [
            {
                id: 'f1-t1',
                name: 'Vectors, span and basis',
                diagram: {
                    code: 'flowchart LR\n  A["3 × [1, 0]"] --> S["add them"]\n  B["2 × [0, 1]"] --> S\n  S --> R["[3, 2]"]\n  X["[1, 2] and [2, 4]"] --> N["the second is 2× the first<br/>→ both lie on one line<br/>→ not a basis"]',
                    caption: 'Scaling and adding basis vectors reaches any point. Two vectors on the same line can only ever reach that line.',
                },
                note: {
                    idea: 'A vector is an arrow, or a list of numbers. The span is every point you can reach by scaling and adding your vectors. A basis is the smallest set of vectors that can reach every point in the space.',
                    analogy: 'Two ingredients, flour and water. Every mix you can make is the span. A third ingredient that is only \'flour plus water\' adds nothing new.',
                    breaks: 'Ingredient amounts cannot be negative. Vector weights can be negative.',
                    example: 'In 2D, [1, 0] and [0, 1] form a basis: [3, 2] = 3·[1, 0] + 2·[0, 1]. But [1, 2] and [2, 4] are not a basis. The second is 2 times the first, so together they only reach points on one line. In ML, an embedding is a vector, and each feature is one coordinate.',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 1–2: Vectors; Linear combinations, span and basis', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 2 (vector spaces, linear independence, basis)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain span and basis using a map and two directions of travel.',
                    derive: 'Are [1, 2, 3], [0, 1, 1] and [1, 3, 4] a basis of 3D space? Decide by hand, and show which vector (if any) is a combination of the others.',
                    build: 'Write is_independent(vectors) using the rank of the stacked matrix. Test it on the example above and on the standard basis.',
                    break: 'Test two almost-parallel vectors, like [1, 0] and [1, 1e-12]. Does your function call them independent? What does this teach you about floating point?',
                },
            },
            {
                id: 'f1-t2',
                name: 'Matrices as transformations; matrix multiplication',
                diagram: {
                    code: 'flowchart LR\n  V["vector [1, 1]"] --> A["A = [[2, 0], [0, 3]]<br/>stretch x by 2, y by 3"] --> R["[2, 3]"]\n  P1["rotate, then stretch"] --> D1["result 1"]\n  P2["stretch, then rotate"] --> D2["result 2 ≠ result 1"]',
                    caption: 'A matrix moves vectors. Doing two matrices in a different order usually gives a different result, so AB ≠ BA.',
                },
                note: {
                    idea: 'A matrix is a machine that moves every vector in space. Its columns show where the basis vectors land. Multiplying two matrices means doing one movement after the other.',
                    analogy: 'Instructions for a photo editor: rotate, then stretch.',
                    breaks: 'In the analogy the order feels unimportant, but it matters. Rotate-then-stretch is usually different from stretch-then-rotate, so AB ≠ BA.',
                    example: 'A = [[2, 0], [0, 3]] stretches x by 2 and y by 3. R = [[0, −1], [1, 0]] rotates by 90°.',
                    code: 'A = np.array([[2, 0], [0, 3]])\nR = np.array([[0, -1], [1, 0]])   # rotate 90 degrees\nA @ R    # [[ 0, -2], [3, 0]]\nR @ A    # [[ 0, -3], [2, 0]]   different!',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 3–4: Linear transformations; Matrix multiplication as composition', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 2 (matrices, linear mappings)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain what the columns of a matrix tell you, using [[2, 0], [0, 3]].',
                    derive: 'Find the matrix that rotates by 90° and then doubles x only. Then find the matrix for the opposite order. Draw where the unit square lands in each case.',
                    build: 'Write matmul(A, B) with three loops and no @. Test it against A @ B on random matrices. Then plot the unit square before and after a transformation.',
                    break: 'Try to multiply a (2, 3) matrix by another (2, 3) matrix. Read the error and explain which sizes must match, and why.',
                },
            },
            {
                id: 'f1-t3',
                name: 'Determinants',
                diagram: {
                    code: 'flowchart LR\n  U["unit square<br/>area 1"] --> M1["[[2, 0], [0, 3]]"] --> R1["rectangle<br/>area 6 → det = 6"]\n  U --> M2["[[0, 1], [1, 0]]"] --> R2["same area, flipped<br/>→ det = −1"]\n  U --> M3["a squashing matrix"] --> R3["flat line<br/>area 0 → det = 0"]',
                    caption: 'The size of the determinant says how much area grows; a minus sign means space was flipped; zero means it was squashed flat.',
                },
                note: {
                    idea: 'The determinant has two parts. Its size tells you how much the matrix scales area (or volume in 3D). Its sign tells you whether space gets flipped over.',
                    analogy: 'Stretching a rubber sheet with a square drawn on it. The determinant says how much bigger the square becomes.',
                    breaks: 'A rubber sheet cannot pass through itself. A negative determinant does exactly that: it is like seeing the sheet in a mirror.',
                    example: '[[2, 0], [0, 3]] has det = 6: a 1×1 square becomes a 2×3 rectangle, area 6. [[0, 1], [1, 0]] has det = −1: the area stays the same, but x and y swap, so space is flipped. det = 0 means space is squashed flat, onto a line or a point.',
                    code: 'np.linalg.det(np.array([[2, 0], [0, 3]]))   # ≈ 6.0',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 6: The determinant', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 4 (determinant and trace)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain both parts of the determinant, size and sign, with the rubber-sheet picture.',
                    derive: 'By hand, compute the determinants of [[3, 1], [2, 4]], [[1, 2], [2, 4]] and [[0, 1], [1, 0]]. For each, say what happens to the unit square: its size, and whether it flips.',
                    build: 'Write det2(A) for 2 × 2 matrices and det3(A) with cofactor expansion. Check them against np.linalg.det, then check numerically that det(AB) = det(A) · det(B).',
                    break: 'Take a 3 × 3 matrix whose third row is the sum of the first two, and add tiny noise (about 1e-10). Is its determinant exactly 0? What does that mean for testing \'is it invertible?\' in code?',
                },
            },
            {
                id: 'f1-t4',
                name: 'Inverse, rank and solving Ax = b',
                diagram: {
                    code: 'flowchart LR\n  X["x"] -->|"A"| B["b = Ax"]\n  B -->|"A⁻¹ undoes it"| X\n  T["3D object"] -->|"rank-2 matrix<br/>(a photo)"| P["2D picture"]\n  P -.->|"no inverse:<br/>depth is lost"| T',
                    caption: 'A full-rank matrix can be undone by its inverse. A low-rank one squashes away a direction, so the original can\'t be recovered.',
                },
                note: {
                    idea: 'The inverse undoes a matrix. Rank is the number of independent directions that survive the matrix. If the rank is full, Ax = b has exactly one solution, x = A⁻¹b.',
                    analogy: 'The inverse is an undo button. Rank is like taking a photo of a 3D object: the photo keeps only 2 of the 3 directions, so its rank is 2.',
                    breaks: 'In an editor, undo always works. If a matrix squashes space (rank too low), information is lost, and there is no undo.',
                    example: 'Solve 2x + y = 3 and x + 3y = 5. The answer is x = 0.8, y = 1.4. Check: 2(0.8) + 1.4 = 3, and 0.8 + 3(1.4) = 5.',
                    code: 'A = np.array([[2., 1.], [1., 3.]])\nb = np.array([3., 5.])\nnp.linalg.solve(A, b)        # [0.8, 1.4]\nnp.linalg.matrix_rank(A)     # 2\n# Use solve(), not inv(A) @ b: it is faster and more accurate.',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 7: Inverse matrices, column space and null space', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 2 (solving linear systems, basis and rank)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'watch', title: '18.06 lecture: Elimination with matrices', source: 'Gilbert Strang (MIT)', url: 'https://www.youtube.com/results?search_query=Gilbert+Strang+18.06+elimination+with+matrices' },
                ],
                practice: {
                    explain: 'Explain rank with the photo-of-a-3D-object picture.',
                    derive: 'By hand, find the inverse of [[2, 1], [1, 3]] and use it to solve Ax = b for b = [3, 5]. Check your answer by multiplying back.',
                    build: 'Write Gaussian elimination to solve Ax = b, without np.linalg. Compare with np.linalg.solve on random 5 × 5 systems.',
                    break: 'Solve a system with the rank-1 matrix [[1, 2], [2, 4]]. What does your code do? What does np.linalg.solve do? What does rank 1 mean for the number of solutions?',
                },
            },
            {
                id: 'f1-t5',
                name: 'Dot product, projection and orthogonality',
                diagram: {
                    code: 'flowchart LR\n  A["a = [3, 4]"] --> D["a · b = 3×1 + 4×0 = 3"]\n  B["b = [1, 0]"] --> D\n  D --> P["shadow of a on b<br/>= [3, 0]"]\n  O["[1, 2] · [2, −1] = 0"] --> R["at 90°: orthogonal"]',
                    caption: 'The dot product measures how much two vectors point the same way. Zero means they\'re at right angles.',
                },
                note: {
                    idea: 'The dot product multiplies matching entries and adds them up. It measures how much two vectors point the same way. A dot product of 0 means they are at 90° (orthogonal). A projection is the \'shadow\' of one vector on another.',
                    analogy: 'Pulling a box with a rope at an angle. Only the part of your pull along the floor moves the box. That part is the projection.',
                    breaks: 'Your pull is a physical force in 2D or 3D. A dot product works for any vectors, even word embeddings with 768 numbers.',
                    example: 'a = [3, 4], b = [1, 0]: a·b = 3, and the shadow of a on b is [3, 0]. [1, 2]·[2, −1] = 2 − 2 = 0, so these two are orthogonal. Cosine similarity, used in search, is the dot product of two vectors after scaling them to length 1.',
                    code: 'a = np.array([3., 4.]); b = np.array([1., 0.])\nproj = (a @ b) / (b @ b) * b    # [3., 0.]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 9: Dot products and duality', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 3 (inner products, orthogonality, projections)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'watch', title: '18.06 lecture: Projections onto subspaces', source: 'Gilbert Strang (MIT)', url: 'https://www.youtube.com/results?search_query=Gilbert+Strang+18.06+projections+onto+subspaces' },
                ],
                practice: {
                    explain: 'Explain why two vectors at 90° have a dot product of 0, using the rope-and-box picture.',
                    derive: 'By hand, project a = [2, 3] onto b = [1, 1]. Then show that a minus its projection is orthogonal to b.',
                    build: 'Write cosine_similarity(u, v) and project(a, b). Use them to find the most similar pair among five small word vectors you make up.',
                    break: 'Call cosine_similarity with a zero vector. What happens? Handle it properly and add a test.',
                },
            },
            {
                id: 'f1-t6',
                name: 'Eigenvalues and eigenvectors',
                diagram: {
                    code: 'flowchart LR\n  V1["v = [1, 1]"] -->|"A = [[2, 1], [1, 2]]"| R1["[3, 3] = 3 × v<br/>same direction → eigenvector, λ = 3"]\n  V2["v = [1, 0]"] -->|"A"| R2["[2, 1]<br/>direction turned → not an eigenvector"]',
                    caption: 'An eigenvector keeps its direction under the matrix and is only stretched; the stretch factor is its eigenvalue.',
                },
                note: {
                    idea: 'An eigenvector is a direction that a matrix does not turn. It only stretches or shrinks it. The eigenvalue is the stretch factor: Av = λv.',
                    analogy: 'A spinning globe. Every point moves, except the points on the axis. The axis is an eigenvector, with λ = 1.',
                    breaks: 'A 2D rotation has no real eigenvectors at all: it turns every direction.',
                    example: 'A = [[2, 1], [1, 2]]. For v = [1, 1], Av = [3, 3] = 3v, so λ = 3. For v = [1, −1], Av = [1, −1], so λ = 1. In PCA, the main directions of the data are the eigenvectors of the covariance matrix.',
                    code: 'A = np.array([[2., 1.], [1., 2.]])\nvals, vecs = np.linalg.eigh(A)   # eigh is for symmetric matrices\nvals                              # [1., 3.]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Linear Algebra, Ch 14–15: Eigenvectors and eigenvalues', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 4 (eigenvalues, eigendecomposition)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain eigenvectors with the spinning-globe picture, then say where the picture breaks.',
                    derive: 'By hand, find the eigenvalues and eigenvectors of [[4, 1], [2, 3]], using det(A − λI) = 0.',
                    build: 'Write power iteration to find the largest eigenvalue and its eigenvector. Compare with np.linalg.eig.',
                    break: 'Run power iteration on the rotation matrix [[0, −1], [1, 0]]. What happens, and why does it never settle?',
                },
            },
            {
                id: 'f1-t7',
                name: 'SVD, and the maths behind PCA',
                diagram: {
                    code: 'flowchart LR\n  A["any matrix A"] --> V["Vᵀ: rotate"] --> S["Σ: stretch<br/>(biggest first)"] --> U["U: rotate"]\n  D["data cloud"] --> C["centre it"] --> SV["SVD"] --> K["keep the top-k<br/>directions = PCA"]',
                    caption: 'SVD breaks any matrix into rotate → stretch → rotate. PCA keeps only the directions with the biggest stretch.',
                },
                note: {
                    idea: 'SVD splits any matrix into three simple steps: rotate, stretch, rotate (A = UΣVᵀ). The biggest stretch values show the most important directions. PCA keeps only those directions of the data.',
                    analogy: 'A cloud of points shaped like a rugby ball has a long axis, a medium axis and a short axis. PCA keeps the long axes and drops the short ones.',
                    breaks: 'PCA only finds straight directions. If the data lies on a curve, like a spiral, PCA misses the real shape.',
                    example: 'If points lie close to the line y = x, the first PCA direction is about [0.71, 0.71], and it carries almost all the variance.',
                    code: 'Xc = X - X.mean(axis=0)                 # always centre first\nU, S, Vt = np.linalg.svd(Xc, full_matrices=False)\nZ = Xc @ Vt[:k].T                       # data in the top-k directions\nexplained = S**2 / (S**2).sum()         # share of variance per direction',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Principal Component Analysis (PCA), Step-by-Step', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Principal+Component+Analysis+%28PCA%29%2C+Step-by-Step' },
                    { kind: 'watch', title: 'Singular Value Decomposition (SVD): Overview', source: 'Steve Brunton', url: 'https://www.youtube.com/results?search_query=Steve+Brunton+Singular+Value+Decomposition+overview' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 4 (SVD) and Ch 10 (PCA)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain PCA with the rugby-ball picture, and give one case where PCA fails.',
                    derive: 'For centred data X, show on paper that the right singular vectors of X are the eigenvectors of XᵀX, and how the singular values relate to the eigenvalues.',
                    build: 'Implement PCA with SVD on a real dataset (Iris or MNIST). Plot the data in the top 2 components, and plot the explained-variance curve.',
                    break: 'Run PCA without centring the data first. Compare the first component with the centred version. Why is it wrong?',
                },
            },
            {
                id: 'f1-t8',
                name: 'Derivatives and the chain rule',
                diagram: {
                    code: 'flowchart LR\n  X["x"] -->|"rate 3"| U["u = 3x + 1"] -->|"rate 2u"| F["f = u²"]\n  R["chain rule:<br/>df/dx = 2u × 3"] --> E["at x = 1:<br/>2 × 4 × 3 = 24"]',
                    caption: 'Follow the arrows: each step has its own rate of change, and the chain rule multiplies them.',
                },
                note: {
                    idea: 'A derivative is a rate of change: how much the output moves when the input moves a tiny bit. The chain rule: for a function inside a function, multiply the rates.',
                    analogy: 'Gears. If gear A turns gear B 3 times faster, and B turns C 2 times faster, then A turns C 3 × 2 = 6 times faster.',
                    breaks: 'Gear ratios are fixed. Derivatives change from point to point, so you calculate them at the current value.',
                    example: 'f(x) = (3x + 1)². The inside is u = 3x + 1, with rate 3. The outside is u², with rate 2u. So f′(x) = 2(3x + 1)·3. At x = 1, that is 2·4·3 = 24. Backprop is just the chain rule, used many times.',
                    code: 'f = lambda x: (3*x + 1)**2\nh = 1e-5\n(f(1 + h) - f(1 - h)) / (2*h)   # ≈ 24.0, a numerical check',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Essence of Calculus, Ch 2 and Ch 4: The derivative; Visualizing the chain rule', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/calculus' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 5 (differentiation, the chain rule)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain the chain rule with the gears picture.',
                    derive: 'Differentiate by hand: sin(x²), e^(3x + 1), log(1 + eˣ) and (2x + 1)³. Write the inner and outer rate for each.',
                    build: 'Write a numerical derivative with the central difference, and check all four answers at x = 0.5.',
                    break: 'Try step sizes h = 1e-1, 1e-5 and 1e-12 in your numerical derivative. Which is most accurate? Why do both too-big and too-small steps fail?',
                },
            },
            {
                id: 'f1-t9',
                name: 'Partial derivatives, gradients and Jacobians',
                diagram: {
                    code: 'flowchart LR\n  F["f(x, y) = x² + 3y"] --> PX["∂f/∂x = 2x<br/>(y held still)"]\n  F --> PY["∂f/∂y = 3<br/>(x held still)"]\n  PX --> G["gradient = [2x, 3]"]\n  PY --> G\n  G --> A["at (1, 2): [2, 3]<br/>points uphill"]',
                    caption: 'Each partial derivative changes one input only. Put together, they form the gradient, which points uphill.',
                },
                note: {
                    idea: 'A partial derivative changes one input and holds the others still. The gradient collects all the partial derivatives into one vector, and it points uphill. The Jacobian is the same idea when the output is a vector too.',
                    analogy: 'Standing on a hill. Step east: how steep is it? Step north: how steep? Those two numbers together are the gradient.',
                    breaks: 'A hill has 2 directions. A network\'s loss has millions. You cannot picture it, but the maths is exactly the same.',
                    example: 'f(x, y) = x² + 3y. ∂f/∂x = 2x and ∂f/∂y = 3. At (1, 2), the gradient is [2, 3]. For g(x, y) = [xy, x + y], the Jacobian is [[y, x], [1, 1]]: one row per output, one column per input.',
                },
                resources: [
                    { kind: 'watch', title: 'Gradient and directional derivatives', source: 'Khan Academy', url: 'https://www.khanacademy.org/math/multivariable-calculus' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 5 (partial derivatives, gradients, Jacobians)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'read', title: 'The Matrix Calculus You Need for Deep Learning', source: 'Terence Parr and Jeremy Howard · free', url: 'https://explained.ai/matrix-calculus/' },
                ],
                practice: {
                    explain: 'Explain what the gradient vector means on a hill, and why it points uphill.',
                    derive: 'By hand, find the gradient of f(x, y) = x²y + 3y², and the Jacobian of g(x, y) = [x + y, xy, x²].',
                    build: 'Write numerical_gradient(f, x) for a vector x and check your hand answers. Keep this function: it becomes your gradient checker for backprop.',
                    break: 'Check the gradient of f(x) = |x| at x = 0 with your checker. What does it say, and why is the true gradient undefined there?',
                },
            },
            {
                id: 'f1-t10',
                name: 'Gradient descent and the learning rate',
                diagram: {
                    code: 'xychart-beta\n  title "w over 8 steps: learning rate 0.1 vs 1.1"\n  x-axis "step" [0, 1, 2, 3, 4, 5, 6, 7]\n  y-axis "w" -15 --> 15\n  line [4.0, 3.2, 2.56, 2.05, 1.64, 1.31, 1.05, 0.84]\n  line [4.0, -4.8, 5.76, -6.91, 8.29, -9.95, 11.94, -14.33]',
                    caption: 'Minimising w². The smooth line (learning rate 0.1) glides towards 0. The zig-zag (1.1) overshoots further every step and explodes.',
                },
                note: {
                    idea: 'To make a loss smaller, take a small step against the gradient (downhill), and repeat. The learning rate is the size of each step.',
                    analogy: 'Walking down a mountain in thick fog. You feel the slope under your feet and step downhill.',
                    breaks: 'In fog you might stop in a small valley that is not the lowest one. In very high dimensions, flat \'saddle\' areas are usually the bigger problem.',
                    example: 'f(w) = w², so the gradient is 2w. Start at w = 4 with learning rate 0.1: 4 → 3.2 → 2.56 → … → close to 0. With learning rate 1.1: 4 → −4.8 → 5.76 → … it explodes.',
                    code: 'w, lr = 4.0, 0.1\nfor step in range(50):\n    grad = 2 * w\n    w = w - lr * grad\nprint(w)   # very close to 0',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 2: Gradient descent, how neural networks learn', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'watch', title: 'Gradient Descent, Step-by-Step', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Gradient+Descent%2C+Step-by-Step' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 7 (optimisation with gradient descent)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'In three sentences, tell a friend why the learning rate matters.',
                    derive: 'f(w) = (w − 3)². Start at w = 0 with learning rate 0.1. Do 3 steps on paper. Where is w going, and why?',
                    build: 'Write gradient descent for f(w) and plot w over 50 steps. Then use it for linear regression on real data, and plot the loss.',
                    break: 'Try learning rates 0.01, 0.5, 0.9 and 1.1 on f(w) = (w − 3)². Which is slow, which is fastest, which swings from side to side, and which explodes? Use the update rule to explain why.',
                },
            },
            {
                id: 'f1-t11',
                name: 'Random variables, distributions, expectation and variance',
                diagram: {
                    code: 'xychart-beta\n  title "A fair die: each face has probability 1/6 (mean 3.5)"\n  x-axis "face" [1, 2, 3, 4, 5, 6]\n  y-axis "probability" 0 --> 0.3\n  bar [0.167, 0.167, 0.167, 0.167, 0.167, 0.167]',
                    caption: 'A distribution lists every possible value and its probability. The expectation, 3.5, is the long-run average, even though you can never roll it.',
                },
                note: {
                    idea: 'A random variable is a number decided by chance. Its distribution says how likely each value is. The expectation is the long-run average. The variance measures how spread out the values are.',
                    analogy: 'Rolling a die. Each face has probability 1/6. The expectation is 3.5: you never roll 3.5, but it is the average over many rolls.',
                    breaks: 'A die has a few possible values. Many things in ML are continuous, like height, so we use a density curve instead of a list.',
                    example: 'For a fair die, E[X] = (1 + … + 6)/6 = 3.5, and Var = E[X²] − E[X]² = 91/6 − 12.25 ≈ 2.92.',
                    code: 'rolls = np.random.randint(1, 7, size=100_000)\nrolls.mean(), rolls.var()   # ≈ 3.5, ≈ 2.92',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'The Normal Distribution, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+The+Normal+Distribution%2C+Clearly+Explained' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 6 (probability and distributions)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'watch', title: 'Probability distributions (interactive)', source: 'Seeing Theory, Brown University', url: 'https://seeing-theory.brown.edu/' },
                ],
                practice: {
                    explain: 'Explain expectation with a die, and why you can never actually roll it.',
                    derive: 'By hand, find the expectation and variance of a biased coin that gives 1 with probability 0.3, and of the sum of two fair dice.',
                    build: 'Simulate 100,000 samples each from Bernoulli, Uniform and Gaussian distributions. Check that the sample mean and variance match your formulas.',
                    break: 'Compare the average of 10, 100 and 10,000 samples across several runs. Then try np.random.standard_cauchy. Why does its average never settle?',
                },
            },
            {
                id: 'f1-t12',
                name: 'Conditional probability and Bayes’ rule',
                diagram: {
                    code: 'flowchart TD\n  P["1,000 people"] --> S["10 sick"]\n  P --> H["990 healthy"]\n  S -->|"test catches 99%"| SP["≈ 10 test positive"]\n  H -->|"5% false alarms"| HP["≈ 50 test positive"]\n  SP & HP --> R["≈ 60 positives,<br/>only ≈ 10 are sick → about 17%"]',
                    caption: 'Counting people instead of using formulas: most positive results come from the big healthy group, so a positive test is usually a false alarm.',
                },
                note: {
                    idea: 'P(A | B) is the probability of A when you already know B happened. Bayes\' rule flips it around: P(A | B) = P(B | A) · P(A) / P(B).',
                    analogy: 'A smoke alarm beeps. Is there a fire? The alarm is good at detecting fires, but fires are rare, and burnt toast is common.',
                    breaks: 'From experience, you roughly know how rare fires are. In real problems the starting probability P(A), the prior, is often unknown, and the answer depends on it.',
                    example: 'A disease affects 1% of people. The test catches 99% of sick people, but also says \'positive\' for 5% of healthy people. You test positive. P(sick | positive) = 0.99·0.01 / (0.99·0.01 + 0.05·0.99) ≈ 0.17. Only about 17%!',
                },
                resources: [
                    { kind: 'watch', title: 'Bayes theorem, the geometry of changing beliefs', source: '3Blue1Brown', url: 'https://www.youtube.com/results?search_query=3Blue1Brown+Bayes+theorem+geometry+of+changing+beliefs' },
                    { kind: 'watch', title: 'The medical test paradox', source: '3Blue1Brown', url: 'https://www.youtube.com/results?search_query=3Blue1Brown+medical+test+paradox' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 6 (sum rule, product rule, Bayes\' theorem)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain why a positive test can still mean you are probably healthy, using the smoke-alarm picture.',
                    derive: 'Redo the disease example with 10% of people sick instead of 1%. How does P(sick | positive) change, and why?',
                    build: 'Write bayes(prior, sensitivity, false_positive_rate). Then simulate 1,000,000 people and check the simulation matches the formula.',
                    break: 'Set the prior to 0 in your function. What happens, whatever the test says? Why is a prior of exactly 0 dangerous in real models?',
                },
            },
            {
                id: 'f1-t13',
                name: 'Maximum likelihood estimation',
                diagram: {
                    code: 'xychart-beta\n  title "Likelihood of 7 heads in 10 flips, for each p"\n  x-axis "p (chance of heads)" [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]\n  y-axis "likelihood × 1000" 0 --> 2.5\n  bar [0.0, 0.007, 0.075, 0.354, 0.977, 1.792, 2.224, 1.678, 0.478]',
                    caption: 'Maximum likelihood picks the p that makes the data you saw most probable: the tallest bar, at p = 0.7.',
                },
                note: {
                    idea: 'Maximum likelihood: choose the model parameters that make the data you actually saw most probable.',
                    analogy: 'A detective picks the story that best explains all the clues.',
                    breaks: 'A detective also uses common sense. MLE uses only the data, so with little data it can be overconfident: 3 heads in 3 flips gives \'this coin always lands heads\'.',
                    example: '7 heads in 10 flips. The likelihood p⁷(1 − p)³ is highest at p = 0.7. Two facts to remember: minimising cross-entropy loss is MLE for classification, and minimising squared error is MLE when the noise is Gaussian.',
                    code: 'p = np.linspace(0.01, 0.99, 99)\nlik = p**7 * (1 - p)**3\np[lik.argmax()]   # ≈ 0.7',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Maximum Likelihood, clearly explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Maximum+Likelihood%2C+clearly+explained' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 8 (parameter estimation: MLE and MAP)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 5 (loss functions from maximum likelihood)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                ],
                practice: {
                    explain: 'Explain, in plain words, why minimising cross-entropy is the same as maximum likelihood.',
                    derive: 'Derive the MLE of p for coin flips: write the log-likelihood, differentiate, set it to 0. Then do the same for the mean of a Gaussian.',
                    build: 'Fit a Gaussian to real data by maximising the log-likelihood with your own gradient descent. Compare with the formula answer.',
                    break: 'Fit the coin with only 3 flips, all heads. What does MLE say? Now pretend you also saw 1 extra head and 1 extra tail, and compare. That is MAP with a simple prior.',
                },
            },
            {
                id: 'f1-t14',
                name: 'Statistics: sampling, confidence intervals, hypothesis tests',
                diagram: {
                    code: 'flowchart LR\n  POP["all possible users<br/>(the true accuracy is unknown)"] -->|"random sample"| S["200 test examples"]\n  S --> E["accuracy 85%"]\n  E --> CI["95% interval ≈ 80% – 90%"]\n  CI --> Q{"Model B scores 86%.<br/>Inside the interval?"}\n  Q -->|"yes"| L["the difference could be luck"]',
                    caption: 'A sample gives an estimate with a margin of error. A small difference that sits inside that margin proves nothing.',
                },
                note: {
                    idea: 'You usually see a sample, not everyone. A confidence interval gives a range that probably contains the true value. A hypothesis test asks: could this result be just luck?',
                    analogy: 'Tasting one spoon of soup to judge the whole pot. Stirring first is random sampling.',
                    breaks: 'Soup mixes easily. Real data often does not. If your sample is biased, for example only one type of user, more data will not fix it.',
                    example: 'Model A scores 85% and model B 86%, on 200 test examples. The standard error is about √(0.85·0.15/200) ≈ 0.025, so the 95% range is roughly ±5%. The 1% difference could easily be luck. This is why small improvements on small test sets often mean nothing.',
                },
                resources: [
                    { kind: 'watch', title: 'Confidence Intervals, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Confidence+Intervals%2C+Clearly+Explained' },
                    { kind: 'watch', title: 'p-values: What they are and how to interpret them', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+p-values%3A+What+they+are+and+how+to+interpret+them' },
                    { kind: 'watch', title: 'But what is the Central Limit Theorem?', source: '3Blue1Brown', url: 'https://www.youtube.com/results?search_query=3Blue1Brown+But+what+is+the+Central+Limit+Theorem' },
                ],
                practice: {
                    explain: 'Explain a confidence interval with the soup picture, and why a biased spoon ruins it.',
                    derive: 'A model gets 170 of 200 test examples right. Compute the 95% confidence interval by hand, using the standard error formula.',
                    build: 'Write a bootstrap: resample the 200 results with replacement 10,000 times and take the 95% interval. Compare it with your formula.',
                    break: 'Give two models the same accuracy gap on 50 examples, then on 5,000. When is the gap real? Try counting only the examples where the two models disagree.',
                },
            },
            {
                id: 'f1-t15',
                name: 'Entropy, cross-entropy and KL divergence',
                diagram: {
                    code: 'xychart-beta\n  title "Cross-entropy loss: −log(probability given to the right answer)"\n  x-axis "probability of the right answer" [0.05, 0.1, 0.3, 0.5, 0.7, 0.9, 0.99]\n  y-axis "loss" 0 --> 3.2\n  bar [3.0, 2.3, 1.2, 0.69, 0.36, 0.11, 0.01]',
                    caption: 'Being confidently wrong is punished hard; being confidently right costs almost nothing. That\'s the loss classifiers are trained on.',
                },
                note: {
                    idea: 'Entropy measures uncertainty, or \'surprise\', in a distribution. Cross-entropy measures your surprise when you use your model q to predict data that really comes from p. KL divergence is the extra surprise: KL(p‖q) = cross-entropy − entropy.',
                    analogy: 'Packing for a trip. With the true weather forecast (p), you pack exactly right. With a wrong forecast (q), you pack badly. KL is the extra, wasted luggage.',
                    breaks: 'In the analogy, swapping the two forecasts feels like the same mistake. KL is not symmetric: KL(p‖q) is usually different from KL(q‖p).',
                    example: 'The true label is class 1 of 3, so p = [0, 1, 0]. The model says q = [0.2, 0.7, 0.1]. Cross-entropy = −log(0.7) ≈ 0.357. If the model said 0.99, the loss would be about 0.01. Here the entropy of p is 0, so KL equals the cross-entropy.',
                    code: 'q = np.array([0.2, 0.7, 0.1])\n-np.log(q[1])   # ≈ 0.357',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Entropy (for data science) Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Entropy+%28for+data+science%29+Clearly+Explained' },
                    { kind: 'watch', title: 'A Short Introduction to Entropy, Cross-Entropy and KL-Divergence', source: 'Aurélien Géron', url: 'https://www.youtube.com/results?search_query=Aurelien+Geron+entropy+cross-entropy+KL+divergence' },
                    { kind: 'read', title: 'Visual Information Theory', source: 'Chris Olah', url: 'https://colah.github.io/posts/2015-09-Visual-Information/' },
                ],
                practice: {
                    explain: 'Explain KL divergence with the packing-for-a-trip picture.',
                    derive: 'By hand, using log base 2: the entropy of a fair coin, of a coin with p = 0.9, and of a fair die. Which is most uncertain?',
                    build: 'Write entropy(p), cross_entropy(p, q) and kl(p, q). Check that kl = cross-entropy − entropy, and that kl(p, p) = 0.',
                    break: 'Compute kl(p, q) where q has a 0 where p does not. What happens? Then compare kl(p, q) with kl(q, p) for two distributions.',
                },
            },
            {
                id: 'f1-t16',
                name: 'Convex optimisation: constraints, Lagrange multipliers and duality',
                diagram: {
                    code: 'xychart-beta\n  title "Convex (w²) vs non-convex (w⁴ − 3w² + w)"\n  x-axis "w" [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]\n  y-axis "value" -4 --> 6\n  line [4.0, 2.25, 1.0, 0.25, 0.0, 0.25, 1.0, 2.25, 4.0]\n  line [2.0, -3.19, -3.0, -1.19, 0.0, -0.19, -1.0, -0.19, 6.0]',
                    caption: 'The bowl (w²) has one bottom, so gradient descent always finds it. The wavy curve has two valleys, so where you end up depends on where you start.',
                },
                note: {
                    idea: 'A convex function is shaped like a bowl, so any local minimum is the global minimum and gradient descent cannot get stuck in a wrong valley. Constrained problems (\'minimise this, but keep that true\') are solved with Lagrange multipliers, which add the constraint to the objective as an extra term. Duality looks at the same problem from the constraint\'s side, and it is how SVMs are usually solved.',
                    analogy: 'A bowl versus a mountain range. Drop a marble into a bowl and it always ends at the same bottom. In a mountain range it can stop in any valley.',
                    breaks: 'Real bowls are simple 3D shapes. Neural network losses are not convex at all, yet gradient descent still works well on them. Convexity is a guarantee we only get for simpler models, like linear regression, logistic regression and SVMs.',
                    example: 'Minimise x² + y² subject to x + y = 1. The Lagrangian is x² + y² − λ(x + y − 1). Setting its gradient to zero gives 2x = λ and 2y = λ, so x = y = 0.5.',
                    code: '# convex means the straight line between two points lies above the curve\nf = lambda w: w**2\na, b, t = -1.0, 3.0, 0.3\nf(t*a + (1-t)*b) <= t*f(a) + (1-t)*f(b)   # True for every a, b and t in [0, 1]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 7 (Lagrange multipliers, convex optimisation)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'read', title: 'Convex Optimization, Ch 2–5', source: 'Boyd and Vandenberghe · free', url: 'https://web.stanford.edu/~boyd/cvxbook/' },
                    { kind: 'watch', title: 'EE364A Convex Optimization, lecture 1', source: 'Stephen Boyd (Stanford)', url: 'https://www.youtube.com/results?search_query=Stanford+EE364A+convex+optimization+Boyd+lecture+1' },
                ],
                practice: {
                    explain: 'Explain why convexity is a guarantee, with the bowl-and-mountains picture.',
                    derive: 'Minimise x² + 2y² subject to x + y = 3 with a Lagrange multiplier, by hand.',
                    build: 'Write a convexity checker that tests the line-above-the-curve rule at 10,000 random points. Run it on w², |w|, eʷ, sin(w) and w³.',
                    break: 'Run gradient descent on the non-convex f(w) = w⁴ − 3w² + w from 20 random starts. Where does it end each time? Compare with the convex f(w) = w².',
                },
            },
        ],
        builds: [
            { id: 'f1-b1', text: 'A numerical gradient checker: compare your hand-derived gradients with finite differences. You will reuse it in Phase 3.' },
            { id: 'f1-b2', text: 'PCA from scratch with eigen-decomposition, then with SVD. Show both give the same answer on a real dataset.' },
            { id: 'f1-b3', text: 'Simulate the central limit theorem and plot it.' },
            { id: 'f1-b4', text: 'Fit a Gaussian with maximum likelihood. Show that the best mean is the sample mean.' },
        ],
        ready: [
            'What does a matrix with rank lower than its size do to space?',
            'Compute the gradient of f(x, y) = x²y + sin(y) by hand.',
            'Why does the gradient point in the direction of steepest increase?',
            'Show that minimising mean squared error is the same as maximum likelihood with Gaussian noise.',
            'What is the difference between cross-entropy and KL divergence?',
            'Explain eigenvectors to someone who has never seen a matrix.',
        ],
    },
    {
        id: 'classical-ml',
        number: 2,
        short: 'Classic ML',
        title: 'Classical ML, built by you',
        accent: '#64b5f6',
        goal: 'Build every classic algorithm yourself in NumPy. After this phase, a library is only a shortcut for something you already understand.',
        bigPicture: 'Classical ML is a toolbox of different tools for one job: learning a pattern from examples. Build each tool once by hand, and you will know which one to pick, and why.',
        main: [
            { title: 'StatQuest: machine learning videos', url: 'https://www.youtube.com/@statquest', kind: 'Video', free: true, why: 'Watch first, for intuition. Short videos, one algorithm each.' },
            { title: 'Stanford CS229 lecture notes (Andrew Ng)', url: 'https://cs229.stanford.edu/', kind: 'Notes', free: true, why: 'The maths behind each algorithm. Read after StatQuest. Get the main notes PDF from the course site.' },
            { title: 'An Introduction to Statistical Learning, Python edition (ISLP)', url: 'https://www.statlearning.com/', kind: 'Book', free: true, why: 'Clear and careful. Read the chapters. Do the labs in NumPy, not scikit-learn.' },
        ],
        deeper: [
            { title: 'Stanford CS229 lectures (Andrew Ng, 2018)', url: 'https://www.youtube.com/results?search_query=stanford+cs229+andrew+ng+2018', kind: 'Video', free: true, why: 'The full lectures, if you want the notes explained out loud.' },
            { title: 'Machine Learning Specialization, Course 1 (Andrew Ng)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', kind: 'Course', why: 'Very gentle. The labs use NumPy. Skip the later TensorFlow parts.' },
            { title: 'Probabilistic Machine Learning: An Introduction (Kevin Murphy)', url: 'https://probml.github.io/pml-book/book1.html', kind: 'Book', free: true, why: 'A deep reference for PhD-level understanding.' },
            { title: 'Deep-ML', url: 'https://www.deep-ml.com/', kind: 'Practice', why: 'Implement ML algorithms from scratch, interview style.' },
        ],
        topics: [
            {
                id: 'f2-t1',
                name: 'The ML setup: features, labels, loss, train/validation/test',
                diagram: {
                    code: 'flowchart LR\n  D[("All the data")] --> TR["Training set 70%<br/>learn the weights"]\n  D --> VA["Validation set 15%<br/>tune your choices"]\n  D --> TE["Test set 15%<br/>use once, at the end"]\n  TR --> M["Model"]\n  VA -.->|"pick the best version"| M\n  M --> TE',
                    caption: 'Learn on the training set, make decisions with the validation set, and keep the test set untouched until the final score.',
                },
                note: {
                    idea: 'Features are the inputs (house size, number of rooms). The label is the answer (price). The loss measures how wrong the model is. Train on one part of the data, tune on the validation set, and use the test set only once, at the end.',
                    analogy: 'Studying for an exam. Training data is textbook exercises. The validation set is practice exams. The test set is the real exam, seen once.',
                    breaks: 'If you studied the real exam paper beforehand, your score would mean nothing. It is the same when you use the test set for tuning: your result becomes a lie.',
                    code: 'idx = np.random.permutation(len(X))       # shuffle first\ntr, va, te = idx[:700], idx[700:850], idx[850:]   # 70/15/15 of 1,000 rows\nX_train, y_train = X[tr], y[tr]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'A Gentle Introduction to Machine Learning', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+A+Gentle+Introduction+to+Machine+Learning' },
                    { kind: 'read', title: 'An Introduction to Statistical Learning (Python), Ch 2', source: 'James, Witten, Hastie, Tibshirani, Taylor · free', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'Machine Learning Crash Course', source: 'Google', url: 'https://developers.google.com/machine-learning/crash-course' },
                ],
                practice: {
                    explain: 'Explain train, validation and test sets with the exam picture.',
                    derive: 'For a house-price problem, write down 3 features, the label, a loss, and what goes into the train, validation and test sets.',
                    build: 'Write train_val_test_split(X, y, fractions, seed). Make it reproducible, and check that no row appears in two sets.',
                    break: 'Tune a model on the test set 20 times and report the best score. Then score it on fresh data. How big is the drop?',
                },
            },
            {
                id: 'f2-t2',
                name: 'Linear regression: normal equation and gradient descent',
                diagram: {
                    code: 'flowchart LR\n  X["features X<br/>(size, rooms)"] --> M["ŷ = Xw + b"]\n  M --> L["mean squared error<br/>vs the true prices y"]\n  L --> NE["normal equation:<br/>solve for w in one go"]\n  L --> GD["gradient descent:<br/>improve w step by step"]\n  NE & GD --> W["best weights w"]',
                    caption: 'Linear regression predicts with a weighted sum. Two routes lead to the same best weights: one formula, or many small steps.',
                },
                note: {
                    idea: 'Predict with a weighted sum, ŷ = Xw + b, and choose the weights that make the squared errors smallest. There are two ways: a direct formula (the normal equation), or gradient descent step by step.',
                    analogy: 'Placing a ruler across dots on a page so it is as close as possible to all of them.',
                    breaks: 'A ruler is straight. If the true pattern curves, linear regression cannot follow it, unless you add curved features such as x².',
                    code: 'Xb = np.c_[np.ones(len(X)), X]             # add a column of 1s for the bias\nw = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)    # normal equation\n\n# gradient descent version, one step:\ngrad = 2 / len(y) * Xb.T @ (Xb @ w - y)\nw = w - lr * grad',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Linear Regression, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Linear+Regression%2C+Clearly+Explained' },
                    { kind: 'read', title: 'ISLP, Ch 3 (linear regression)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 9 (linear regression)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain least squares with the ruler-through-the-dots picture.',
                    derive: 'Derive the normal equation w = (XᵀX)⁻¹Xᵀy from the squared-error loss, on paper.',
                    build: 'Fit linear regression on real data three ways: the normal equation, gradient descent, and np.linalg.lstsq. Check that all three agree.',
                    break: 'Add a column that is an exact copy of another feature. What happens to the normal equation? What does gradient descent do instead?',
                },
            },
            {
                id: 'f2-t3',
                name: 'Logistic regression and the sigmoid',
                diagram: {
                    code: 'xychart-beta\n  title "The sigmoid squashes any score into a probability"\n  x-axis "score z" [-6, -4, -2, 0, 2, 4, 6]\n  y-axis "probability" 0 --> 1\n  line [0.002, 0.018, 0.119, 0.5, 0.881, 0.982, 0.998]',
                    caption: 'A big negative score becomes almost 0, a big positive one almost 1, and a score of 0 sits exactly at 0.5.',
                },
                note: {
                    idea: 'For yes/no questions. Compute a score z = Xw + b, then squash it into a probability with the sigmoid, σ(z) = 1 / (1 + e⁻ᶻ). Train with cross-entropy loss.',
                    analogy: 'A dimmer switch. The score turns the dial, and the sigmoid keeps the light between 0 (off) and 1 (fully on).',
                    breaks: 'The decision boundary is still a straight line (a flat plane). It cannot separate data shaped like circles unless you add new features.',
                    example: 'z = 0 gives 0.5. z = 2 gives 0.88. z = −2 gives 0.12.',
                    code: 'p = 1 / (1 + np.exp(-(X @ w + b)))\ngrad_w = X.T @ (p - y) / len(y)   # the gradient is beautifully simple\ngrad_b = (p - y).mean()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Logistic Regression', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Logistic+Regression' },
                    { kind: 'read', title: 'ISLP, Ch 4 (logistic regression)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'CS229 main lecture notes (classification and logistic regression)', source: 'Stanford', url: 'https://cs229.stanford.edu/' },
                ],
                practice: {
                    explain: 'Explain why we need the sigmoid, with the dimmer-switch picture.',
                    derive: 'Derive the gradient of binary cross-entropy for logistic regression, and show it simplifies to Xᵀ(p − y) / n.',
                    build: 'Train logistic regression from scratch on a real binary dataset. Plot the loss, and the decision boundary for 2 features.',
                    break: 'Train on data that is perfectly separable and watch the weights. Why do they keep growing, and what stops them?',
                },
            },
            {
                id: 'f2-t4',
                name: 'Regularisation: L1 and L2',
                diagram: {
                    code: 'flowchart LR\n  L["total loss"] --> D["data error"]\n  L --> P["+ λ × penalty"]\n  P --> L2["L2: λ Σ w²<br/>shrinks every weight"]\n  P --> L1["L1: λ Σ |w|<br/>pushes some weights to exactly 0"]',
                    caption: 'Regularisation adds a cost for large weights. L2 makes all weights small; L1 switches the weak ones off completely.',
                },
                note: {
                    idea: 'Add a penalty for large weights to the loss. L2 adds λΣw² and shrinks all weights a little. L1 adds λΣ|w| and pushes some weights to exactly zero.',
                    analogy: 'A spending budget. L2 is a tax that grows fast for big spending, so you spend a little on everything. L1 is a flat fee per pound, so it is often best to spend nothing at all on weak items.',
                    breaks: 'The \'cost\' here is not money but model complexity. The right λ must be found with validation data, not guessed.',
                    example: 'L2 adds 2λw to the gradient, so every step shrinks w a bit. This is called weight decay. L1 adds λ·sign(w): the same push however small w is, so small weights reach zero.',
                    code: 'loss = mse + lam * np.sum(w**2)      # L2\ngrad = grad_mse + 2 * lam * w',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Regularization Part 1: Ridge (L2) Regression', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Regularization+Part+1%3A+Ridge+%28L2%29+Regression' },
                    { kind: 'watch', title: 'Regularization Part 2: Lasso (L1) Regression', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Regularization+Part+2%3A+Lasso+%28L1%29+Regression' },
                    { kind: 'read', title: 'ISLP, Ch 6 (shrinkage methods: ridge and lasso)', source: 'free book', url: 'https://www.statlearning.com/' },
                ],
                practice: {
                    explain: 'Explain why L1 gives exact zeros but L2 does not, with the budget picture.',
                    derive: 'Add λ‖w‖² to the squared-error loss and derive the new closed-form solution (ridge regression).',
                    build: 'Fit ridge and L1 regression for λ from 0.001 to 100. Plot each weight against λ.',
                    break: 'Use a huge λ and look at the predictions. Then forget to scale the features before using L2. Which features get punished unfairly?',
                },
            },
            {
                id: 'f2-t5',
                name: 'Bias–variance trade-off and overfitting',
                diagram: {
                    code: 'xychart-beta\n  title "Error vs model complexity (illustration)"\n  x-axis "complexity (for example polynomial degree)" [1, 2, 3, 4, 5, 6, 7, 8, 9]\n  y-axis "error" 0 --> 16\n  line [10, 6, 4, 3, 2.5, 2, 1.5, 1, 0.5]\n  line [11, 7, 5, 4.5, 5, 6, 8, 11, 15]',
                    caption: 'Training error (the line that keeps falling) always improves with complexity. Validation error falls, then rises again: the bottom of that U is the sweet spot; to the right is overfitting.',
                },
                note: {
                    idea: 'Bias is error from a model that is too simple. Variance is error from a model that is too sensitive to the training data. Overfitting means low training error but high test error.',
                    analogy: 'Two students. One memorises every answer and fails on new questions (high variance). One only learns \'the answer is usually C\' (high bias). You want the one who learns the ideas.',
                    breaks: 'With very large deep learning models, more size can sometimes reduce overfitting (\'double descent\'). The simple trade-off picture is not the whole story.',
                    example: 'Fit points from a curve with polynomials of degree 1, 3 and 15. Degree 1 underfits. Degree 15 passes through every training point but swings wildly between them.',
                    code: 'for deg in [1, 3, 15]:\n    coef = np.polyfit(x_train, y_train, deg)\n    print(deg, np.mean((np.polyval(coef, x_val) - y_val)**2))',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Machine Learning Fundamentals: Bias and Variance', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Machine+Learning+Fundamentals%3A+Bias+and+Variance' },
                    { kind: 'read', title: 'ISLP, Ch 2 (the bias–variance trade-off)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'watch', title: 'Bias–variance trade-off lecture', source: 'Kilian Weinberger, Cornell CS4780', url: 'https://www.youtube.com/results?search_query=Kilian+Weinberger+CS4780+bias+variance+tradeoff' },
                ],
                practice: {
                    explain: 'Explain overfitting with the two-students picture.',
                    derive: 'Write the decomposition: expected error = bias² + variance + noise. Say in words what each term means.',
                    build: 'Fit polynomials of degree 1 to 15 on 30 noisy points. Plot train and validation error against degree, and mark the best degree.',
                    break: 'Repeat with 3,000 points instead of 30. Does the best degree change? Explain why more data reduces variance.',
                },
            },
            {
                id: 'f2-t6',
                name: 'Metrics: precision, recall, F1, ROC-AUC, confusion matrix',
                diagram: {
                    code: 'flowchart TD\n  ALL["10,000 transactions<br/>100 are fraud"] --> F["model flags 80"]\n  F --> TP["60 really fraud<br/>true positives"]\n  F --> FP["20 innocent<br/>false positives"]\n  ALL --> FN["40 frauds missed<br/>false negatives"]\n  TP --> PR["precision = 60 / 80 = 0.75"]\n  TP --> RE["recall = 60 / 100 = 0.60"]',
                    caption: 'Precision asks \'of what I flagged, how much was right?\'; recall asks \'of what was really there, how much did I find?\'.',
                },
                note: {
                    idea: 'A confusion matrix counts true positives, false positives, false negatives and true negatives. Precision = TP/(TP + FP): of the items you flagged, how many were right? Recall = TP/(TP + FN): of the real ones, how many did you find? F1 balances the two. ROC-AUC measures how well scores rank positives above negatives.',
                    analogy: 'Fishing with a net. Precision: how much of your catch is fish, not old boots? Recall: how many of the fish in the lake did you catch?',
                    breaks: 'In fishing you can see your catch. In ML, the threshold you choose changes both numbers, so always say which threshold you used.',
                    example: '10,000 transactions, 100 are fraud. The model flags 80, and 60 of those are fraud. Precision = 60/80 = 0.75. Recall = 60/100 = 0.60. F1 ≈ 0.67.',
                    code: 'tp = np.sum((pred == 1) & (y == 1))\nfp = np.sum((pred == 1) & (y == 0))\nfn = np.sum((pred == 0) & (y == 1))\nprecision, recall = tp / (tp + fp), tp / (tp + fn)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'ROC and AUC, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+ROC+and+AUC%2C+Clearly+Explained' },
                    { kind: 'watch', title: 'Sensitivity and Specificity', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Sensitivity+and+Specificity' },
                    { kind: 'read', title: 'Classification: accuracy, precision and recall', source: 'Google ML Crash Course', url: 'https://www.google.com/search?q=Google+machine+learning+crash+course+accuracy+precision+recall' },
                ],
                practice: {
                    explain: 'Explain precision and recall with the fishing-net picture.',
                    derive: 'From TP = 40, FP = 10, FN = 20, TN = 930, compute accuracy, precision, recall and F1 by hand.',
                    build: 'Write precision, recall, F1 and ROC-AUC from scratch. For AUC, sort by score and use the trapezoid rule.',
                    break: 'Make a \'model\' that always predicts \'not fraud\' on data with 1% fraud. What are its accuracy, precision and recall? Which metric exposes it?',
                },
            },
            {
                id: 'f2-t7',
                name: 'Cross-validation and data leakage',
                diagram: {
                    code: 'flowchart TD\n  R1["Round 1: TEST · train · train · train · train"]\n  R2["Round 2: train · TEST · train · train · train"]\n  R3["Round 3: train · train · TEST · train · train"]\n  R4["Round 4: train · train · train · TEST · train"]\n  R5["Round 5: train · train · train · train · TEST"]\n  R1 & R2 & R3 & R4 & R5 --> A["average the 5 scores<br/>(and look at their spread)"]',
                    caption: '5-fold cross-validation: every part of the data is used for testing exactly once, giving a more reliable score than one split.',
                },
                note: {
                    idea: 'Cross-validation splits the data into k parts: train on k − 1 parts, test on the last one, and rotate. Data leakage is when information from the test data sneaks into training, so results look better than they really are.',
                    analogy: 'Leakage is like a student seeing the exam answers the night before. The high score is real, but it means nothing.',
                    breaks: 'Cheating is on purpose. Leakage is usually an accident, hidden in preprocessing, so you must hunt for it.',
                    example: 'Common leaks: scaling with the mean of all the data (including test rows); the same patient in both train and test, with two scans (split by patient, not by scan); using the future to predict the past in time series.',
                    code: 'mu, sd = X_train.mean(0), X_train.std(0)   # training rows only\nX_train = (X_train - mu) / sd\nX_test  = (X_test  - mu) / sd              # reuse the SAME mu and sd',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Machine Learning Fundamentals: Cross Validation', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Machine+Learning+Fundamentals%3A+Cross+Validation' },
                    { kind: 'read', title: 'ISLP, Ch 5 (cross-validation and the bootstrap)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'Data Leakage (Intermediate Machine Learning)', source: 'Kaggle Learn', url: 'https://www.google.com/search?q=Kaggle+Learn+data+leakage+intermediate+machine+learning' },
                ],
                practice: {
                    explain: 'Explain data leakage with the exam-answers picture.',
                    derive: 'Draw 5-fold cross-validation for 10 rows: which rows train and which rows test in each fold.',
                    build: 'Write k_fold(n, k, seed) and use it to report the mean and spread of a model\'s score.',
                    break: 'Create leakage on purpose: scale with all the data, or add a feature built from the label. Measure how much the score inflates. Then remove it.',
                },
            },
            {
                id: 'f2-t8',
                name: 'Feature scaling and encoding',
                diagram: {
                    code: 'flowchart LR\n  S["size: 100 m²"] --> ST["standardise:<br/>(value − mean) ÷ std"]\n  R["rooms: 3"] --> ST\n  ST --> E["both now on a similar scale"]\n  C["colour: red / green / blue"] --> OH["one-hot:<br/>red = [1, 0, 0]<br/>green = [0, 1, 0]<br/>blue = [0, 0, 1]"]',
                    caption: 'Scaling stops big-unit features from drowning out small ones. One-hot encoding turns categories into numbers without inventing an order.',
                },
                note: {
                    idea: 'Put features on similar scales so no feature dominates just because of its units. Turn categories into numbers with one-hot encoding.',
                    analogy: 'Describing a house by size (100 m²) and rooms (3). Without scaling, the model \'hears\' size shouting and rooms whispering.',
                    breaks: 'Tree models, like decision trees and random forests, do not care about scale. Scaling matters most for distance-based and gradient-based methods.',
                    example: 'colour ∈ {red, green, blue} becomes red = [1, 0, 0], green = [0, 1, 0], blue = [0, 0, 1]. Do not use red = 1, green = 2, blue = 3: that invents an order that does not exist.',
                    code: 'cats = np.array(["red", "blue", "red"])\nnames = np.unique(cats)                         # [\'blue\', \'red\']\nonehot = (cats[:, None] == names).astype(float)\n# [[0, 1], [1, 0], [0, 1]]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Categorical Variables (Intermediate Machine Learning)', source: 'Kaggle Learn', url: 'https://www.google.com/search?q=Kaggle+Learn+categorical+variables+one-hot+encoding' },
                    { kind: 'read', title: 'Numerical data: normalisation', source: 'Google ML Crash Course', url: 'https://www.google.com/search?q=Google+machine+learning+crash+course+numerical+data+normalization' },
                ],
                practice: {
                    explain: 'Explain why unscaled features confuse distance-based models, with the shouting-and-whispering picture.',
                    derive: 'Standardise [10, 20, 30] by hand (subtract the mean, divide by the standard deviation). Then one-hot encode [\'cat\', \'dog\', \'cat\', \'bird\'].',
                    build: 'Write a StandardScaler class with fit and transform, and a one-hot encoder. Fit both on training data only.',
                    break: 'Train k-NN with and without scaling on data where one feature is in thousands and one in decimals. Then give your encoder a category it never saw.',
                },
            },
            {
                id: 'f2-t9',
                name: 'k-nearest neighbours',
                diagram: {
                    code: 'flowchart LR\n  N["new point"] --> D["measure the distance<br/>to every training point"]\n  D --> K["take the k = 3 nearest"]\n  K --> V["their labels: A, A, B"]\n  V --> W["majority vote → A"]',
                    caption: 'k-nearest neighbours has no training step: it just looks at the closest examples and lets them vote.',
                },
                note: {
                    idea: 'To classify a new point, find the k closest training points and take a vote. There is no training step at all.',
                    analogy: 'New in a town? Ask your 5 nearest neighbours which restaurant is best, and go with the majority.',
                    breaks: 'In very high dimensions, all points are almost equally far apart (the \'curse of dimensionality\'), so \'nearest\' stops meaning much.',
                    code: 'd = np.linalg.norm(X_train - x_new, axis=1)   # distance to every training point\nnearest = np.argsort(d)[:k]\npred = np.bincount(y_train[nearest]).argmax()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'K-nearest neighbors, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+K-nearest+neighbors%2C+Clearly+Explained' },
                    { kind: 'read', title: 'ISLP, Ch 2 and Ch 4 (k-nearest neighbours)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'watch', title: 'k-nearest neighbours and the curse of dimensionality', source: 'Kilian Weinberger, Cornell CS4780', url: 'https://www.youtube.com/results?search_query=Kilian+Weinberger+CS4780+k+nearest+neighbors+curse+of+dimensionality' },
                ],
                practice: {
                    explain: 'Explain k-NN with the neighbours-and-restaurants picture.',
                    derive: 'Class A at (2, 3) and (0, 0). Class B at (5, 3) and (3, 5.5). Classify the point (3, 3) by hand with k = 1 and with k = 3.',
                    build: 'Implement k-NN with vectorised distances. Plot validation accuracy for k = 1 to 30 on a real dataset.',
                    break: 'Add 50 random noise features to the data and run it again. What happens to accuracy? Connect this to the curse of dimensionality.',
                },
            },
            {
                id: 'f2-t10',
                name: 'Decision trees: entropy and Gini',
                diagram: {
                    code: 'flowchart TD\n  ROOT{"x < 3.5 ?<br/>3 yes, 5 no · Gini 0.47"}\n  ROOT -->|"yes"| L["yes, yes, yes<br/>Gini 0 (pure)"]\n  ROOT -->|"no"| R["no × 5<br/>Gini 0 (pure)"]',
                    caption: 'A tree picks the question that makes each side as pure as possible. This split separates the two classes perfectly.',
                },
                note: {
                    idea: 'A decision tree asks a series of yes/no questions about features, like \'age < 30?\'. At each step it picks the question that makes the groups purest. Purity is measured with Gini impurity or entropy.',
                    analogy: 'The game \'20 Questions\'. Good questions split the possibilities in useful ways.',
                    breaks: 'In 20 Questions you can ask anything. A tree asks about one feature and one threshold at a time, so a diagonal boundary needs many steps, like a staircase.',
                    example: 'A node with 5 \'yes\' and 5 \'no\' has Gini = 1 − (0.5² + 0.5²) = 0.5, the worst for two classes. A split into [5 yes, 0 no] and [0 yes, 5 no] gives Gini 0 in each: perfect.',
                    code: 'def gini(y):\n    p = np.bincount(y) / len(y)\n    return 1 - np.sum(p**2)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Decision and Classification Trees, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Decision+and+Classification+Trees%2C+Clearly+Explained' },
                    { kind: 'read', title: 'ISLP, Ch 8 (the basics of decision trees)', source: 'free book', url: 'https://www.statlearning.com/' },
                ],
                practice: {
                    explain: 'Explain how a tree picks its question, with the 20 Questions picture.',
                    derive: 'Labels [yes, yes, yes, no, no, no, no, no] for x = 1 to 8. Compute the Gini impurity before splitting, then after splitting at x < 3.5 and at x < 5.5. Which split is better?',
                    build: 'Build a decision tree from scratch with a depth limit. Train it on a real dataset and print it as nested if-statements.',
                    break: 'Grow the tree with no depth limit and compare train and validation accuracy. Then rotate the data 45° and count the splits the diagonal boundary needs.',
                },
            },
            {
                id: 'f2-t11',
                name: 'Ensembles: bagging, random forests, gradient boosting',
                diagram: {
                    code: 'flowchart LR\n  subgraph Bagging\n    D1[("data")] --> S1["random resample 1"] --> T1["tree 1"]\n    D1 --> S2["random resample 2"] --> T2["tree 2"]\n    D1 --> S3["random resample 3"] --> T3["tree 3"]\n    T1 & T2 & T3 --> AV["average or vote"]\n  end\n  subgraph Boosting\n    B1["tree 1"] -->|"what it got wrong"| B2["tree 2"] -->|"what\'s still wrong"| B3["tree 3"] --> SUM["add them up"]\n  end',
                    caption: 'Bagging trains trees side by side and averages them (less variance). Boosting trains them one after another, each fixing the last (less bias).',
                },
                note: {
                    idea: 'Ensembles combine many models. Bagging and random forests train many trees on random samples of the data and features, then average them (this reduces variance). Boosting trains trees one after another, each one fixing the errors of the ones before (this reduces bias).',
                    analogy: 'Random forest: ask 100 people to guess the number of sweets in a jar, and average the guesses. Boosting: one student corrects their homework again and again, focusing on the questions they got wrong.',
                    breaks: 'Averaging only helps if people make different mistakes. If every tree were the same, the forest would be no better than one tree. That is why forests also pick random features.',
                    example: 'Gradient boosting for regression: tree 1 predicts y. Tree 2 predicts what is left over, y − prediction. Final prediction = tree 1 + a small step × tree 2 + …',
                    code: 'pred = np.full(len(y), y.mean())\nfor m in range(100):\n    residual = y - pred\n    tree = fit_small_tree(X, residual)   # your own tree from the build\n    pred += 0.1 * tree.predict(X)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Random Forests Part 1', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Random+Forests+Part+1' },
                    { kind: 'watch', title: 'Gradient Boost Part 1', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Gradient+Boost+Part+1' },
                    { kind: 'read', title: 'ISLP, Ch 8 (bagging, random forests, boosting)', source: 'free book', url: 'https://www.statlearning.com/' },
                ],
                practice: {
                    explain: 'Explain bagging and boosting with the jar-of-sweets and homework pictures.',
                    derive: '25 independent trees are each right 60% of the time. Is their majority vote right more or less often? Reason it out, then check with a quick simulation.',
                    build: 'Build a random forest on your tree: bootstrap samples plus random features at each split. Then build simple gradient boosting for regression.',
                    break: 'Make every tree identical (no bootstrap, all features). Does the forest still beat one tree? Then run boosting with learning rate 1.0 and 500 trees and watch validation error.',
                },
            },
            {
                id: 'f2-t12',
                name: 'Support vector machines: margin and hinge loss',
                diagram: {
                    code: 'flowchart LR\n  N["class −1 points"] --- SV1(("support<br/>vector")) --- M1["margin"] --- B["boundary<br/>w·x + b = 0"] --- M2["margin"] --- SV2(("support<br/>vector")) --- P["class +1 points"]',
                    caption: 'An SVM puts the boundary in the middle of the widest possible gap. Only the closest points — the support vectors — decide where it goes.',
                },
                note: {
                    idea: 'An SVM finds the separating line (or plane) with the widest gap, the margin, to the nearest points of each class. Those nearest points are the support vectors. It uses the hinge loss, max(0, 1 − y·score).',
                    analogy: 'Building a road between two villages. You want the widest road possible that does not touch any house.',
                    breaks: 'Real data is messy: some houses sit on the wrong side. Soft-margin SVMs allow a few violations, at a cost set by C.',
                    example: 'Labels are −1 or +1. With y = +1: score 2 gives loss 0 (safe); score 0.5 gives loss 0.5 (inside the margin); score −1 gives loss 2 (wrong side).',
                    code: 'loss = np.maximum(0, 1 - y * (X @ w + b)).mean() + lam * (w @ w)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Support Vector Machines Part 1 (of 3): Main Ideas', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Support+Vector+Machines+Part+1+%28of+3%29%3A+Main+Ideas' },
                    { kind: 'watch', title: 'Learning: Support Vector Machines', source: 'Patrick Winston, MIT 6.034', url: 'https://www.youtube.com/results?search_query=Patrick+Winston+MIT+6.034+support+vector+machines' },
                    { kind: 'read', title: 'ISLP, Ch 9 (support vector machines)', source: 'free book', url: 'https://www.statlearning.com/' },
                ],
                practice: {
                    explain: 'Explain the margin with the road-between-villages picture.',
                    derive: 'True labels [+1, +1, +1, −1] and scores [2, 0.5, −0.5, −3]. Compute each hinge loss by hand.',
                    build: 'Train a linear SVM with subgradient descent on the hinge loss. Plot the boundary, the margin lines, and circle the support vectors.',
                    break: 'Add one outlier on the wrong side. Train with a very large C and a small C. How does the boundary move?',
                },
            },
            {
                id: 'f2-t13',
                name: 'Naive Bayes',
                diagram: {
                    code: 'flowchart LR\n  E["email: \'free\' and \'meeting\'"] --> SP["spam score:<br/>P(spam) × P(\'free\' | spam) × P(\'meeting\' | spam)"]\n  E --> HM["not-spam score:<br/>P(ham) × P(\'free\' | ham) × P(\'meeting\' | ham)"]\n  SP & HM --> C{"bigger score wins"}',
                    caption: 'Naive Bayes multiplies the evidence from each word separately (in practice it adds logs), then picks the class with the bigger score.',
                },
                note: {
                    idea: 'Naive Bayes uses Bayes\' rule to classify, with a \'naive\' shortcut: it assumes features are independent once you know the class. Then you just multiply probabilities.',
                    analogy: 'A spam filter reading one word at a time. \'free\' makes spam more likely, \'meeting\' makes it less likely. It adds up the evidence from each word separately.',
                    breaks: 'Words are not really independent: \'New\' and \'York\' appear together. The probabilities come out wrong, but the ranking of classes is often still right.',
                    example: 'P(spam) = 0.4. P(\'free\' | spam) = 0.3, P(\'free\' | not spam) = 0.02. For an email with \'free\': 0.4 × 0.3 = 0.12 versus 0.6 × 0.02 = 0.012. Spam is 10 times more likely.',
                    code: '# add logs instead of multiplying: 1,000 tiny probabilities would round to 0\nlog_spam = np.log(0.4) + np.log(0.3)\nlog_ham  = np.log(0.6) + np.log(0.02)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Naive Bayes, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Naive+Bayes%2C+Clearly+Explained' },
                    { kind: 'read', title: 'ISLP, Ch 4 (naive Bayes)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'Speech and Language Processing: the Naive Bayes chapter', source: 'Jurafsky and Martin · free', url: 'https://web.stanford.edu/~jurafsky/slp3/' },
                ],
                practice: {
                    explain: 'Explain the \'naive\' assumption, and why it still works, with the spam-filter picture.',
                    derive: 'P(spam) = 0.3, P(\'win\' | spam) = 0.2, P(\'win\' | ham) = 0.01, P(\'meeting\' | spam) = 0.01, P(\'meeting\' | ham) = 0.1. Score an email containing both words, by hand.',
                    build: 'Build a Naive Bayes spam filter from scratch on a real SMS or email spam dataset, with log probabilities and add-one smoothing.',
                    break: 'Remove the smoothing and test an email with a word never seen in spam. What happens to its spam probability? Why is that a disaster?',
                },
            },
            {
                id: 'f2-t14',
                name: 'k-means clustering',
                diagram: {
                    code: 'flowchart LR\n  S["pick k starting centres"] --> A["assign each point<br/>to its nearest centre"]\n  A --> M["move each centre to<br/>the middle of its points"]\n  M --> Q{"did anything change?"}\n  Q -->|"yes"| A\n  Q -->|"no"| D["done: k clusters"]',
                    caption: 'k-means repeats two simple steps until the clusters stop moving.',
                },
                note: {
                    idea: 'k-means groups points into k clusters by repeating two steps: assign each point to its nearest centre, then move each centre to the average of its points.',
                    analogy: 'Placing k ice-cream vans on a beach. Each customer walks to the nearest van. Each van moves to the middle of its customers. Repeat until nobody moves.',
                    breaks: 'Vans placed badly at the start can get stuck in a poor arrangement. k-means depends on its starting centres, so run it several times. It also assumes round clusters of similar size.',
                    code: 'for _ in range(20):\n    d = np.linalg.norm(X[:, None, :] - C[None, :, :], axis=2)   # shape (n, k)\n    labels = d.argmin(axis=1)\n    C = np.array([X[labels == j].mean(axis=0) for j in range(k)])',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'K-means clustering', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+K-means+clustering' },
                    { kind: 'read', title: 'ISLP, Ch 12 (k-means clustering)', source: 'free book', url: 'https://www.statlearning.com/' },
                ],
                practice: {
                    explain: 'Explain k-means with the ice-cream-vans picture.',
                    derive: 'Points 1, 2, 3, 10, 11, 12 on a line, k = 2, starting centres at 1 and 2. Do the assign and move steps by hand until nothing changes.',
                    build: 'Implement k-means with k-means++ starting points. Run it on 2D blobs and plot the clusters after each step.',
                    break: 'Run plain k-means with random starts 20 times and record the final loss each time. Then try data shaped like two moons. Why does k-means fail there?',
                },
            },
            {
                id: 'f2-t15',
                name: 'PCA in practice',
                diagram: {
                    code: 'xychart-beta\n  title "Share of the variance kept by each component"\n  x-axis "principal component" [1, 2, 3, 4]\n  y-axis "% of variance" 0 --> 70\n  bar [62, 24, 9, 5]',
                    caption: 'The first few components usually hold most of the spread. Keep enough to reach your target (often around 95%) and drop the rest.',
                },
                note: {
                    idea: 'Use PCA to compress data, remove noise, or plot high-dimensional data in 2D. Always centre the data first, and scale it if features use different units.',
                    analogy: 'Photographing a 3D object from the angle that shows the most detail.',
                    breaks: 'The angle with the most spread is not always the most useful one. PCA ignores the labels, so the direction that separates your classes might be dropped.',
                    example: 'MNIST images have 784 pixels. About 150 principal components keep around 95% of the variance.',
                    code: 'explained = S**2 / np.sum(S**2)\nk = np.searchsorted(np.cumsum(explained), 0.95) + 1   # components for 95%',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'PCA - Practical Tips', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+PCA+-+Practical+Tips' },
                    { kind: 'read', title: 'ISLP, Ch 12 (principal components analysis)', source: 'free book', url: 'https://www.statlearning.com/' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 10 (PCA)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                ],
                practice: {
                    explain: 'Explain when PCA helps and when it hurts, with the camera-angle picture.',
                    derive: 'The covariance eigenvalues are [5, 3, 1.5, 0.5]. What fraction of the variance do the top 2 components keep?',
                    build: 'Compress MNIST digits to 10, 50 and 150 components and reconstruct them. Show the images side by side with their explained variance.',
                    break: 'Make a dataset where the class difference lies in a low-variance direction. Show that PCA to 1 component destroys the separation.',
                },
            },
            {
                id: 'f2-t16',
                name: 'Gaussian mixture models and EM',
                diagram: {
                    code: 'flowchart LR\n  I["start: 2 bell curves<br/>in rough places"] --> E["E-step: how much does each point<br/>belong to each curve?"]\n  E --> M["M-step: refit each curve<br/>using those weights"]\n  M --> Q{"log-likelihood<br/>still improving?"}\n  Q -->|"yes"| E\n  Q -->|"no"| D["done"]',
                    caption: 'EM alternates between soft-assigning points and refitting the curves. Each round can only improve the fit.',
                },
                note: {
                    idea: 'A Gaussian mixture model says the data comes from several bell curves mixed together. The EM algorithm finds them by repeating two steps. E-step: work out how much each point belongs to each bell curve (its \'responsibilities\'). M-step: refit each bell curve using those responsibilities as weights.',
                    analogy: 'Sorting a pile of socks from two families by size. First guess which family each sock belongs to, then update your idea of each family\'s typical size, then guess again.',
                    breaks: 'You would give each sock to exactly one family. EM gives soft answers, like 70% family A and 30% family B. That is exactly how it differs from k-means, which is the hard-assignment version of the same idea.',
                    example: 'Delivery times come from two routes: a fast one around 20 minutes and a slow one around 45. A two-component mixture recovers both means, both spreads and the share of each route, without ever being told which route a delivery took.',
                    code: '# E-step: responsibilities for 2 components in 1D\np1 = pi1 * gauss(x, mu1, s1)\np2 = pi2 * gauss(x, mu2, s2)\nr1 = p1 / (p1 + p2)                  # how much each point belongs to component 1\n# M-step: refit component 1 using those weights\nmu1 = (r1 * x).sum() / r1.sum()\npi1 = r1.mean()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'EM algorithm: how it works', source: 'Victor Lavrenko', url: 'https://www.youtube.com/results?search_query=Victor+Lavrenko+EM+algorithm+how+it+works' },
                    { kind: 'read', title: 'Mathematics for Machine Learning, Ch 11 (Gaussian mixture models)', source: 'Deisenroth, Faisal, Ong · free', url: 'https://mml-book.github.io/' },
                    { kind: 'read', title: 'Pattern Recognition and Machine Learning, Ch 9 (mixture models and EM)', source: 'Christopher Bishop · free PDF', url: 'https://www.google.com/search?q=Bishop+Pattern+Recognition+and+Machine+Learning+free+pdf+Microsoft' },
                ],
                practice: {
                    explain: 'Explain EM with the socks picture, and how it differs from k-means.',
                    derive: 'Write the E-step and M-step for a 1D mixture of two Gaussians from memory: the responsibilities, then the new means, variances and mixing weights.',
                    build: 'Implement EM for a 2D Gaussian mixture from scratch. Draw the ellipses after each iteration, and plot the log-likelihood rising.',
                    break: 'Start both components at exactly the same place. What happens? Then let one component sit on a single point. Why does its variance shrink to zero, and how do you stop it?',
                },
            },
            {
                id: 'f2-t17',
                name: 'Generalisation: VC dimension and double descent',
                diagram: {
                    code: 'xychart-beta\n  title "Double descent (illustration): 100 training points"\n  x-axis "number of features" [10, 50, 90, 100, 110, 200, 500, 1000]\n  y-axis "test error" 0 --> 4.5\n  line [1.0, 0.6, 1.5, 4.0, 1.6, 0.8, 0.6, 0.5]',
                    caption: 'Test error spikes where the number of features equals the number of training points, then falls again as the model keeps growing.',
                },
                note: {
                    idea: 'Generalisation means doing well on data you have never seen. Classical theory says bigger models need more data. The VC dimension measures how many points a family of models can fit in every possible way. But deep networks break the simple story: as models grow past the point where they fit the training data perfectly, test error can go down again. This is called double descent.',
                    analogy: 'A student who can memorise any answer sheet has high capacity. Classical theory says: give them more exercises than they can memorise, so they are forced to learn the ideas.',
                    breaks: 'The student picture predicts that huge models must overfit. In practice, very large networks trained with SGD often generalise well. The theory is still catching up with that.',
                    example: 'A straight line in 2D can separate 3 points (not all in a line) in every possible labelling, but it cannot separate one labelling of 4 points: the XOR pattern. So the VC dimension of a 2D linear classifier is 3.',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 8 (double descent) and Ch 20 (why does deep learning work?)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'Understanding Machine Learning, Ch 2–6 (PAC learning, VC dimension)', source: 'Shalev-Shwartz and Ben-David · free', url: 'https://www.google.com/search?q=Understanding+Machine+Learning+Shalev-Shwartz+Ben-David+free+pdf' },
                    { kind: 'paper', title: 'Deep Double Descent (2019)', source: 'Nakkiran et al. · arXiv', url: 'https://arxiv.org/abs/1912.02292' },
                ],
                practice: {
                    explain: 'Explain double descent in plain words, and why it surprised people.',
                    derive: 'Show on paper that a line can split 3 points in all 8 labellings, but fails on one labelling of 4 points.',
                    build: 'Reproduce double descent: fit polynomial or random-feature regression with the minimum-norm solution (np.linalg.lstsq) on 100 noisy points, with 10 to 1,000 features. Plot test error against the number of features.',
                    break: 'Add more label noise and repeat. What happens to the error peak near \'number of features = number of training points\'?',
                },
            },
        ],
        builds: [
            { id: 'f2-b1', text: 'Your own mini library in NumPy: linear and logistic regression, k-NN, decision tree, k-means, PCA and Naive Bayes. Each one with tests and a README that explains the maths.' },
            { id: 'f2-b2', text: 'One end-to-end project on a real tabular dataset: clean, split, baseline, your models, metrics, error analysis. Write it up as a short report.' },
            { id: 'f2-b3', text: 'Solve 20 classical ML problems on Deep-ML.' },
        ],
        ready: [
            'On a whiteboard: logistic regression model, loss, gradient and update rule.',
            'Your fraud model has 99% accuracy. Why might it be useless?',
            'Explain overfitting and three ways to reduce it.',
            'Why does L1 regularisation give sparse weights, but L2 does not?',
            'How does a random forest reduce variance?',
            'What is data leakage? Give a real example.',
        ],
    },
    {
        id: 'deep-learning',
        number: 3,
        short: 'Deep learning',
        title: 'Deep learning foundations',
        accent: '#ff8a65',
        goal: 'Build neural networks from a single neuron up. Write backprop by hand first. Then you can trust PyTorch, because you know what it does.',
        bigPicture: 'A neural network is many small logistic regressions stacked in layers and trained together with backprop. Phase 2 made the bricks. Phase 3 builds the wall.',
        main: [
            { title: 'Andrej Karpathy: Neural Networks: Zero to Hero', url: 'https://karpathy.ai/zero-to-hero.html', kind: 'Video', free: true, why: 'Builds everything from scratch in Python. The best fit for how you learn. Code along, then rebuild without the video.' },
            { title: 'Understanding Deep Learning (Simon Prince)', url: 'https://udlbook.github.io/udlbook/', kind: 'Book', free: true, why: 'Your main deep learning text. Very clear figures, with practice notebooks.' },
            { title: '3Blue1Brown: Neural Networks', url: 'https://www.3blue1brown.com/topics/neural-networks', kind: 'Video', free: true, why: 'Watch first. Backprop explained with pictures.' },
        ],
        deeper: [
            { title: 'Stanford CS231n notes and assignments', url: 'https://cs231n.github.io/', kind: 'Notes', free: true, why: 'Backprop in NumPy by hand. Excellent practice.' },
            { title: 'Dive into Deep Learning', url: 'https://d2l.ai/', kind: 'Book', free: true, why: 'Maths plus PyTorch code for every idea. Use it as a reference.' },
            { title: 'Neural Networks and Deep Learning (Michael Nielsen)', url: 'http://neuralnetworksanddeeplearning.com/', kind: 'Book', free: true, why: 'Gentle and patient. Use it if the main book feels too fast.' },
            { title: 'A Recipe for Training Neural Networks (Karpathy)', url: 'https://karpathy.github.io/2019/04/25/recipe/', kind: 'Blog', free: true, why: 'How to debug training. Read it twice.' },
            { title: 'Deep Learning: Foundations and Concepts (Bishop and Bishop)', url: 'https://www.bishopbook.com/', kind: 'Book', why: 'PhD-level depth, written very carefully.' },
        ],
        topics: [
            {
                id: 'f3-t1',
                name: 'The neuron and the multi-layer perceptron',
                diagram: {
                    code: 'flowchart LR\n  X1["x₁"] -->|"w₁"| S["Σ weighted sum + bias"]\n  X2["x₂"] -->|"w₂"| S\n  X3["x₃"] -->|"w₃"| S\n  S --> A["activation<br/>(ReLU)"] --> O["output"]\n  IN["input layer"] --> H["hidden layer"] --> OUT["output layer"]',
                    caption: 'Top: one neuron. Bottom: an MLP stacks layers of them, each layer feeding the next.',
                },
                note: {
                    idea: 'A neuron computes a weighted sum of its inputs, adds a bias, and applies an activation: a = f(w·x + b). An MLP stacks layers of neurons, and each layer\'s output is the next layer\'s input.',
                    analogy: 'Rows of judges. Each judge (neuron) weighs the evidence in their own way and gives a score. The next row of judges combines those scores.',
                    breaks: 'Real judges can explain their reasoning. Single neurons usually cannot be read so simply.',
                    code: 'h = np.maximum(0, X @ W1 + b1)   # layer 1 with ReLU, shape (batch, hidden)\nout = h @ W2 + b2                # layer 2, shape (batch, classes)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 1: But what is a neural network?', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 3–4 (shallow and deep networks)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'Neural Networks and Deep Learning, Ch 1', source: 'Michael Nielsen · free', url: 'http://neuralnetworksanddeeplearning.com/' },
                ],
                practice: {
                    explain: 'Explain an MLP with the rows-of-judges picture.',
                    derive: 'For a 784 → 128 → 10 MLP, count the weights and biases in each layer, and the total.',
                    build: 'Write the forward pass of a 2-layer MLP in NumPy for a batch of inputs. Check every shape with assert statements.',
                    break: 'Set every weight to the same number and train for a few steps. Why do all hidden neurons stay identical?',
                },
            },
            {
                id: 'f3-t2',
                name: 'Activation functions, and why non-linearity matters',
                diagram: {
                    code: 'xychart-beta\n  title "ReLU, sigmoid and tanh"\n  x-axis "input" [-3, -2, -1, 0, 1, 2, 3]\n  y-axis "output" -1 --> 3\n  line [0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 3.0]\n  line [0.05, 0.12, 0.27, 0.5, 0.73, 0.88, 0.95]\n  line [-1.0, -0.96, -0.76, 0.0, 0.76, 0.96, 1.0]',
                    caption: 'ReLU is 0 then a straight line; sigmoid squashes into 0 to 1; tanh squashes into −1 to 1. The bends are what let networks learn curves.',
                },
                note: {
                    idea: 'Without a non-linear activation, stacking layers is useless: two linear layers equal one linear layer. ReLU(x) = max(0, x) is the default. Sigmoid and tanh squash values. GELU is a smooth ReLU used in transformers.',
                    analogy: 'Straight Lego bricks can only build straight walls. Activations are the hinged pieces that let you build curves.',
                    breaks: 'Lego hinges are few and fixed. A network learns where to bend, and with enough neurons it can approximate almost any shape.',
                    example: 'W2(W1x) = (W2W1)x, which is just one matrix. A ReLU in between stops this collapse. A warning: the sigmoid\'s slope is at most 0.25, so ten sigmoid layers can shrink a gradient by 0.25¹⁰ ≈ 0.000001.',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks Pt. 3: ReLU In Action', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Neural+Networks+Pt.+3%3A+ReLU+In+Action' },
                    { kind: 'read', title: 'CS231n: Neural Networks Part 1 (activation functions)', source: 'Stanford', url: 'https://cs231n.github.io/neural-networks-1/' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 3 (activation functions)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                ],
                practice: {
                    explain: 'Explain why a network with no activations is just one linear layer.',
                    derive: 'Write the derivatives of ReLU, sigmoid and tanh. What is the largest possible value of each?',
                    build: 'Train the same small MLP on a curved 2D dataset (like two moons) with no activation, with ReLU, and with tanh. Plot the three decision boundaries.',
                    break: 'Stack 20 sigmoid layers and print the gradient size at each layer. Then count dead ReLU units after training with a huge learning rate.',
                },
            },
            {
                id: 'f3-t3',
                name: 'Backpropagation by hand',
                diagram: {
                    code: 'flowchart LR\n  W["w = 1"] -->|"× x = 2"| YH["ŷ = 2"] -->|"− y = 5"| E["e = −3"] -->|"square"| L["L = 9"]\n  L -.->|"dL/de = 2e = −6"| E\n  E -.->|"de/dŷ = 1"| YH\n  YH -.->|"dŷ/dw = x = 2"| W\n  W -.- G["dL/dw = −6 × 1 × 2 = −12"]',
                    caption: 'Solid arrows are the forward pass; dotted arrows carry gradients backwards. Multiplying them along the path is the chain rule.',
                },
                note: {
                    idea: 'Backprop computes the gradient of the loss for every weight, using the chain rule from the output backwards. Each step passes back: (gradient from above) × (its own local derivative).',
                    analogy: 'A factory makes a faulty product. You trace back station by station, asking how much each one contributed to the fault.',
                    breaks: 'In a factory, blame often goes to one station. In backprop, blame is shared, and it is added up across every path.',
                    example: 'L = (wx − y)², with x = 2, y = 5, w = 1. Forward: ŷ = 2, error e = ŷ − y = −3, L = 9. Backward: dL/de = 2e = −6, de/dŷ = 1, dŷ/dw = x = 2. So dL/dw = −6 × 2 = −12. The gradient is negative, so increasing w lowers the loss.',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 3–4: What is backpropagation really doing?; Backpropagation calculus', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'read', title: 'CS231n: Backpropagation, Intuitions', source: 'Stanford', url: 'https://cs231n.github.io/optimization-2/' },
                    { kind: 'watch', title: 'Building makemore Part 4: Becoming a Backprop Ninja', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                ],
                practice: {
                    explain: 'Explain backprop with the factory-fault picture, and say where the blame gets shared.',
                    derive: 'For y = w2 · relu(w1 · x), with x = 2, w1 = 0.5, w2 = −1, target 3 and loss (y − target)², compute every gradient by hand.',
                    build: 'Write the full backward pass for a 2-layer MLP with softmax and cross-entropy in NumPy. Check every gradient with your gradient checker.',
                    break: 'Plant a bug on purpose: forget one transpose in the backward pass. Does your gradient checker catch it? How big is the error?',
                },
            },
            {
                id: 'f3-t4',
                name: 'Autograd and computational graphs',
                diagram: {
                    code: 'flowchart LR\n  W(("w")) --> M["× 2.0"] --> S["− 5.0"] --> P["square"] --> L(("loss"))\n  L -.->|"backward()"| P -.-> S -.-> M -.-> W\n  W -.- G["w.grad = −12"]',
                    caption: 'Autograd records every operation as a graph while computing, then walks it backwards to fill in each gradient.',
                },
                note: {
                    idea: 'Autograd records every operation in a graph while you compute. Calling backward() walks the graph in reverse and applies the chain rule for you.',
                    analogy: 'Breadcrumbs. On the way forward you drop a crumb at each step. On the way back you follow them home.',
                    breaks: 'Breadcrumbs cost nothing. The graph costs memory: every intermediate value is stored until backward(). That is why training needs much more memory than inference.',
                    code: 'import torch\nw = torch.tensor(1.0, requires_grad=True)\nloss = (w * 2.0 - 5.0) ** 2\nloss.backward()\nw.grad    # tensor(-12.)  the same as the hand calculation',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'The spelled-out intro to neural networks and backpropagation: building micrograd', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Calculus on Computational Graphs: Backpropagation', source: 'Chris Olah', url: 'https://colah.github.io/posts/2015-08-Backprop/' },
                    { kind: 'read', title: 'Dive into Deep Learning, Ch 2 (automatic differentiation)', source: 'd2l.ai · free', url: 'https://d2l.ai/' },
                ],
                practice: {
                    explain: 'Explain autograd with the breadcrumbs picture, and why it costs memory.',
                    derive: 'Draw the computational graph for L = (a · b + c)², and write the local derivative on every edge.',
                    build: 'Rebuild micrograd: a Value class with +, *, tanh, exp and backward(). Train a tiny MLP with it.',
                    break: 'Use the same Value twice, as in y = x * x. Does backward give 2x? If not, you are overwriting gradients instead of adding them. Fix it.',
                },
            },
            {
                id: 'f3-t5',
                name: 'Softmax and cross-entropy loss',
                diagram: {
                    code: 'flowchart LR\n  Z["logits<br/>[2, 1, 0.1]"] -->|"exp"| E["[7.39, 2.72, 1.11]"] -->|"÷ sum 11.2"| P["probabilities<br/>[0.66, 0.24, 0.10]"]\n  P -->|"right answer is class 0"| L["loss = −log 0.66 ≈ 0.42"]',
                    caption: 'Softmax turns scores into probabilities; cross-entropy then scores how much probability went to the right answer.',
                },
                note: {
                    idea: 'Softmax turns raw scores (logits) into probabilities that sum to 1: exp(zᵢ) / Σ exp(zⱼ). Cross-entropy loss is −log(probability of the correct class). Together, their gradient is simply: probabilities − one-hot label.',
                    analogy: 'Turning vote counts into vote shares.',
                    breaks: 'Real vote shares are proportional. Softmax is exponential, so a small lead in score becomes a big lead in probability.',
                    example: 'Logits [2, 1, 0.1] become about [0.66, 0.24, 0.10]. If the correct class is 0, loss = −log(0.66) ≈ 0.42, and the gradient is [0.66 − 1, 0.24, 0.10] = [−0.34, 0.24, 0.10].',
                    code: 'z = z - z.max(axis=1, keepdims=True)                 # for numerical stability\np = np.exp(z) / np.exp(z).sum(axis=1, keepdims=True)\nloss = -np.log(p[np.arange(len(y)), y]).mean()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks Part 5: ArgMax and SoftMax', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Neural+Networks+Part+5%3A+ArgMax+and+SoftMax' },
                    { kind: 'watch', title: 'Neural Networks Part 6: Cross Entropy', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Neural+Networks+Part+6%3A+Cross+Entropy' },
                    { kind: 'read', title: 'CS231n: Linear classification (the softmax classifier)', source: 'Stanford', url: 'https://cs231n.github.io/linear-classify/' },
                ],
                practice: {
                    explain: 'Explain why softmax exaggerates the leader, with the vote-share picture.',
                    derive: 'Derive dL/dz for softmax followed by cross-entropy, and show that it equals p − y. No notes.',
                    build: 'Implement a numerically stable softmax with cross-entropy, and train softmax regression on MNIST.',
                    break: 'Compute softmax of [1000, 1000] without subtracting the max. Then compute log(softmax) directly and with log-sum-exp. Where does each version break?',
                },
            },
            {
                id: 'f3-t6',
                name: 'Optimisers: SGD, momentum, Adam; learning-rate schedules',
                diagram: {
                    code: 'flowchart LR\n  G["gradient g"] --> SGD["SGD:<br/>step = −lr × g"]\n  G --> MOM["Momentum:<br/>running average of g<br/>keeps a steady direction"]\n  MOM --> ADAM["Adam:<br/>momentum + a step size<br/>scaled for each weight"]',
                    caption: 'Each optimiser builds on the last: plain steps, then steps with momentum, then momentum with a personal step size for every weight.',
                },
                note: {
                    idea: 'SGD steps against the gradient. Momentum keeps a running average of gradients, so you keep moving in a consistent direction. Adam adds a separate step size for each weight, based on how large its gradients usually are. A schedule changes the learning rate over time, for example warm-up then decay.',
                    analogy: 'SGD is a hiker who only looks at the ground under their feet. Momentum is a ball rolling downhill: it builds speed and rolls over small bumps. Adam is a ball that is careful in steep, bumpy directions and bolder in flat ones.',
                    breaks: 'A ball has one mass. Adam gives every single weight its own effective step size, so it is really millions of different balls.',
                    code: '# one Adam step for gradient g, at step t\nm = b1 * m + (1 - b1) * g\nv = b2 * v + (1 - b2) * g**2\nm_hat, v_hat = m / (1 - b1**t), v / (1 - b2**t)\nw -= lr * m_hat / (np.sqrt(v_hat) + eps)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'An overview of gradient descent optimization algorithms', source: 'Sebastian Ruder', url: 'https://www.ruder.io/optimizing-gradient-descent/' },
                    { kind: 'read', title: 'Why Momentum Really Works', source: 'Gabriel Goh · Distill', url: 'https://distill.pub/2017/momentum/' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 6 (SGD, momentum, Adam)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                ],
                practice: {
                    explain: 'Explain momentum and Adam with the rolling-ball picture.',
                    derive: 'Write the update rules for SGD, momentum, RMSProp and Adam from memory. Explain why Adam needs bias correction.',
                    build: 'Implement all four and race them on the same problem, such as the Rosenbrock function or MNIST. Plot the loss curves together.',
                    break: 'Run Adam with a learning rate 100 times too big, and SGD with one 100 times too small. Then remove Adam\'s bias correction and watch the first 10 steps.',
                },
            },
            {
                id: 'f3-t7',
                name: 'Weight initialisation; vanishing and exploding gradients',
                diagram: {
                    code: 'xychart-beta\n  title "Size of the signal through 8 layers"\n  x-axis "layer" [0, 1, 2, 3, 4, 5, 6, 7, 8]\n  y-axis "signal size (std)" 0 --> 26\n  line [1.0, 0.5, 0.25, 0.125, 0.062, 0.031, 0.016, 0.008, 0.004]\n  line [1, 1, 1, 1, 1, 1, 1, 1, 1]\n  line [1.0, 1.5, 2.2, 3.4, 5.1, 7.6, 11.4, 17.1, 25.6]',
                    caption: 'Weights too small: the signal fades to nothing (vanishing). Too big: it explodes. Good initialisation keeps it steady (the flat line).',
                },
                note: {
                    idea: 'If weights start too small, signals shrink layer by layer and gradients vanish. If they start too big, signals grow and explode. Good initialisation keeps the signal size steady: He initialisation for ReLU uses std = √(2 / fan_in).',
                    analogy: 'Passing a message down a line of 50 people. Too quiet, and it fades to nothing. Too loud, and it turns into shouting and noise.',
                    breaks: 'People can ask \'sorry, again?\'. A network cannot. That is why we also add normalisation layers and residual connections.',
                    example: 'Multiply by 0.9 fifty times and you get 0.005. Multiply by 1.1 fifty times and you get 117.',
                    code: 'W = np.random.randn(fan_in, fan_out) * np.sqrt(2 / fan_in)   # He initialisation',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Building makemore Part 3: Activations & Gradients, BatchNorm', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 7 (gradients and initialisation)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'CS231n: Neural Networks Part 2 (weight initialisation)', source: 'Stanford', url: 'https://cs231n.github.io/neural-networks-2/' },
                ],
                practice: {
                    explain: 'Explain vanishing and exploding gradients with the message-down-the-line picture.',
                    derive: 'Show that a layer\'s output variance is roughly fan_in × Var(w) × Var(x), and why ReLU needs an extra factor of 2. Use this to get the He initialisation std.',
                    build: 'Build a 20-layer MLP. Plot the standard deviation of the activations at every layer, with tiny, He, and huge initialisation.',
                    break: 'Train the 20-layer net with std = 1.0 and with std = 0.01. Describe what happens to the gradients in each case.',
                },
            },
            {
                id: 'f3-t8',
                name: 'Batch norm and layer norm',
                diagram: {
                    code: 'flowchart LR\n  T["activations: a table of<br/>examples (rows) × features (columns)"]\n  T --> BN["Batch norm:<br/>normalise each COLUMN<br/>(one feature, across the batch)"]\n  T --> LN["Layer norm:<br/>normalise each ROW<br/>(one example, across its features)"]',
                    caption: 'The two norms do the same maths in different directions. Layer norm doesn\'t depend on the batch, which is why transformers use it.',
                },
                note: {
                    idea: 'Normalisation rescales activations to mean 0 and variance 1, then lets the network rescale them with learned γ and β. Batch norm averages over the batch, for each feature. Layer norm averages over the features, for each example.',
                    analogy: 'Grading on a curve. Batch norm curves each exam question across all students. Layer norm curves each student across all of their questions.',
                    breaks: 'A curve is set once. Batch norm behaves differently at test time (it uses saved running averages), which is a common source of bugs. Layer norm does not depend on the batch, which is why transformers use it.',
                    code: '# x has shape (batch, features)\nbn = (x - x.mean(axis=0)) / np.sqrt(x.var(axis=0) + 1e-5)\nln = (x - x.mean(axis=1, keepdims=True)) / np.sqrt(x.var(axis=1, keepdims=True) + 1e-5)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Building makemore Part 3 (the BatchNorm section)', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 11 (batch normalisation)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'paper', title: 'Layer Normalization (2016)', source: 'Ba, Kiros, Hinton · arXiv', url: 'https://arxiv.org/abs/1607.06450' },
                ],
                practice: {
                    explain: 'Explain batch norm and layer norm with the grading-on-a-curve picture.',
                    derive: 'For one feature with batch values [1, 2, 3], compute the batch-norm output by hand (ignore ε, with γ = 1 and β = 0).',
                    build: 'Add batch norm to your deep MLP and compare training speed with and without it. Then write layer norm and check it against torch.nn.LayerNorm.',
                    break: 'Run your batch-norm model with batch size 1 in training mode. What goes wrong? Fix it with eval mode and running statistics.',
                },
            },
            {
                id: 'f3-t9',
                name: 'Regularisation: dropout, weight decay, augmentation, early stopping',
                diagram: {
                    code: 'xychart-beta\n  title "Train vs validation loss (illustration)"\n  x-axis "epoch" [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n  y-axis "loss" 0 --> 2.5\n  line [2.2, 1.5, 1.1, 0.85, 0.65, 0.5, 0.38, 0.28, 0.2, 0.14]\n  line [2.3, 1.6, 1.25, 1.05, 0.95, 0.92, 0.95, 1.02, 1.12, 1.25]',
                    caption: 'Training loss keeps falling, but validation loss turns up after about epoch 6 — that\'s overfitting. Early stopping saves the model at the lowest validation point.',
                },
                note: {
                    idea: 'Tricks to stop a network memorising. Dropout turns off random neurons during training. Weight decay shrinks weights. Data augmentation makes \'new\' data, such as flipped or cropped images. Early stopping stops when the validation loss starts to rise.',
                    analogy: 'Dropout is a football team that trains with random players missing, so nobody relies on one star.',
                    breaks: 'Missing players happens only in training. At test time all neurons are used, so the output size must match. \'Inverted dropout\' fixes this by scaling during training.',
                    code: 'mask = (np.random.rand(*h.shape) > p) / (1 - p)   # inverted dropout, drop rate p\nh = h * mask                                      # training only',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 9 (regularisation)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'CS231n: Neural Networks Part 2 (regularisation and dropout)', source: 'Stanford', url: 'https://cs231n.github.io/neural-networks-2/' },
                ],
                practice: {
                    explain: 'Explain dropout with the football-team picture.',
                    derive: 'With dropout rate 0.5, why must you divide the kept activations by 0.5 during training? Show what happens to the expected value.',
                    build: 'Train an overfitting MLP on a small part of MNIST. Add dropout, then weight decay, then augmentation, then early stopping, and record validation accuracy after each.',
                    break: 'Leave dropout switched on at test time. What happens to the predictions and to accuracy? Why?',
                },
            },
            {
                id: 'f3-t10',
                name: 'PyTorch: nn.Module, DataLoader and the training loop',
                diagram: {
                    code: 'flowchart LR\n  B["DataLoader:<br/>next batch"] --> F["logits = model(x)"] --> L["loss"] --> Z["opt.zero_grad()"] --> BW["loss.backward()"] --> ST["opt.step()"]\n  ST -->|"repeat"| B',
                    caption: 'The five-step loop at the heart of every PyTorch training script.',
                },
                note: {
                    idea: 'nn.Module holds your layers and weights. DataLoader serves shuffled mini-batches. The training loop is almost always the same five steps.',
                    analogy: 'A kitchen routine: get ingredients (a batch), cook (forward), taste (loss), adjust the recipe (backward and step), and clean the pan (zero_grad).',
                    breaks: 'If you forget to clean the pan, flavours mix. If you forget zero_grad(), gradients from old batches add up.',
                    code: 'for xb, yb in loader:\n    logits = model(xb)\n    loss = F.cross_entropy(logits, yb)\n    opt.zero_grad()\n    loss.backward()\n    opt.step()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Learn the Basics', source: 'PyTorch tutorials', url: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html' },
                    { kind: 'watch', title: 'Building makemore Part 2: MLP', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Dive into Deep Learning, Ch 6 (builders\' guide)', source: 'd2l.ai · free', url: 'https://d2l.ai/' },
                ],
                practice: {
                    explain: 'Explain the training loop with the kitchen-routine picture.',
                    derive: 'Write the five-line training loop from memory, and say what each line does.',
                    build: 'Train an MLP on MNIST with nn.Module and a DataLoader, and add a validation loop that uses model.eval() and torch.no_grad().',
                    break: 'Remove opt.zero_grad() and train. Watch the loss. Then forget model.eval() on a model with dropout and compare validation scores.',
                },
            },
            {
                id: 'f3-t11',
                name: 'Convolutional networks: convolution, pooling, receptive field',
                diagram: {
                    code: 'flowchart LR\n  I["image<br/>32 × 32 × 3"] --> C1["conv 3×3, 16 filters<br/>32 × 32 × 16"] --> P1["pool<br/>16 × 16 × 16"] --> C2["conv 3×3, 32 filters<br/>16 × 16 × 32"] --> P2["pool<br/>8 × 8 × 32"] --> FC["classifier<br/>10 classes"]',
                    caption: 'Each convolution finds patterns; each pooling step shrinks the image. Deeper layers see bigger areas and more complex patterns.',
                },
                note: {
                    idea: 'A convolution slides a small filter, like 3×3, over the image and computes a dot product at each position. The same filter is used everywhere, so a cat is a cat in any corner. Pooling shrinks the image. The receptive field is how much of the original image one output can see, and it grows with depth.',
                    analogy: 'Scanning a page with a magnifying glass for one pattern, like an edge. Deeper layers look for patterns made of patterns: edges, then corners, then eyes, then faces.',
                    breaks: 'A magnifying glass is one tool. A CNN layer has many filters at once, and they are learned from data, not designed by hand.',
                    example: 'Output size = (W − K + 2P) / S + 1. A 32×32 image with a 3×3 filter, padding 1 and stride 1 stays 32×32.',
                },
                resources: [
                    { kind: 'watch', title: 'But what is a convolution?', source: '3Blue1Brown', url: 'https://www.youtube.com/results?search_query=3Blue1Brown+but+what+is+a+convolution' },
                    { kind: 'read', title: 'CS231n: Convolutional Neural Networks', source: 'Stanford', url: 'https://cs231n.github.io/convolutional-networks/' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 10 (convolutional networks)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                ],
                practice: {
                    explain: 'Explain convolution with the magnifying-glass picture.',
                    derive: 'Apply a 3 × 3 vertical-edge filter by hand to a 5 × 5 image that is dark on the left and bright on the right. Also work out the output size with padding 0 and stride 2.',
                    build: 'Write a 2D convolution with loops in NumPy, then a vectorised one. Check both against torch.nn.functional.conv2d. Then train a small CNN on CIFAR-10.',
                    break: 'Shift the test images by a few pixels and compare how an MLP and a CNN cope. Then remove pooling and see what happens to the receptive field.',
                },
            },
            {
                id: 'f3-t12',
                name: 'Residual connections (ResNet)',
                diagram: {
                    code: 'flowchart LR\n  X["x"] --> F["layers: F(x)"] --> ADD(("+"))\n  X -->|"shortcut"| ADD\n  ADD --> O["output = x + F(x)"]',
                    caption: 'The shortcut carries x straight past the layers, so the block only has to learn the change F(x), and gradients flow back easily.',
                },
                note: {
                    idea: 'Instead of learning y = F(x), a residual block learns y = x + F(x). The block only has to learn the change. Gradients flow straight back through the \'+ x\' shortcut.',
                    analogy: 'Editing a document with tracked changes, instead of rewriting it from scratch each time.',
                    breaks: 'Tracked changes are optional. In a ResNet the shortcut is always there, and shapes must match before adding (a 1×1 convolution fixes a mismatch).',
                    example: 'The derivative of x + F(x) is 1 + F′(x). The \'1\' gives the gradient a direct path back, even when F′(x) is tiny.',
                    code: 'class Block(nn.Module):\n    def forward(self, x):\n        return x + self.f(x)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 11 (residual networks)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'paper', title: 'Deep Residual Learning for Image Recognition (2015)', source: 'He et al. · arXiv', url: 'https://arxiv.org/abs/1512.03385' },
                ],
                practice: {
                    explain: 'Explain residual connections with the tracked-changes picture.',
                    derive: 'Show that the gradient through y = x + F(x) is 1 + F′(x). Explain why that helps a 50-layer network.',
                    build: 'Train a 20-layer plain CNN and the same network with residual blocks on CIFAR-10. Plot both training losses.',
                    break: 'Make a residual block that changes the number of channels, with no projection. Read the shape error, then fix it with a 1 × 1 convolution.',
                },
            },
            {
                id: 'f3-t13',
                name: 'RNNs, and why long sequences are hard',
                diagram: {
                    code: 'flowchart LR\n  H0["h₀"] --> C1["RNN cell"] --> H1["h₁"] --> C2["RNN cell"] --> H2["h₂"] --> C3["RNN cell"] --> H3["h₃ → output"]\n  X1["x₁"] --> C1\n  X2["x₂"] --> C2\n  X3["x₃"] --> C3',
                    caption: 'The same cell is used at every step, passing its memory h forward. Information from x₁ must survive every step to reach the end.',
                },
                note: {
                    idea: 'An RNN reads a sequence one step at a time and keeps a hidden state as memory: hₜ = tanh(W hₜ₋₁ + U xₜ). The same weights are used at every step.',
                    analogy: 'Reading a book with one sticky note. After each page, you rewrite the note.',
                    breaks: 'One small note cannot hold a whole book. Early information gets overwritten, and gradients shrink over many steps. Transformers, which look at every page at once, replaced RNNs for this reason.',
                    example: 'Backprop through 100 steps multiplies by W about 100 times. If the biggest factor is 0.9, then 0.9¹⁰⁰ ≈ 0.00003.',
                    code: 'h = np.zeros(hidden)\nfor x_t in sequence:\n    h = np.tanh(W @ h + U @ x_t + b)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Recurrent Neural Networks (RNNs), Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Recurrent+Neural+Networks+%28RNNs%29%2C+Clearly+Explained' },
                    { kind: 'read', title: 'The Unreasonable Effectiveness of Recurrent Neural Networks', source: 'Andrej Karpathy', url: 'https://karpathy.github.io/2015/05/21/rnn-effectiveness/' },
                    { kind: 'read', title: 'Dive into Deep Learning, Ch 9 (recurrent neural networks)', source: 'd2l.ai · free', url: 'https://d2l.ai/' },
                ],
                practice: {
                    explain: 'Explain the RNN\'s memory with the sticky-note picture, and why it fails on long books.',
                    derive: 'Unroll an RNN for 3 steps on paper. Show where W appears in the gradient of the last output with respect to h₀.',
                    build: 'Write a character-level RNN and train it to generate names.',
                    break: 'Train it on sequences where the answer depends on a character far back. Measure accuracy as the gap grows, then try gradient clipping.',
                },
            },
            {
                id: 'f3-t14',
                name: 'Embeddings: representing things as vectors',
                diagram: {
                    code: 'flowchart LR\n  T["word id 42"] --> E["embedding table<br/>10,000 rows × 64 columns"] --> R["row 42:<br/>64 learned numbers"]\n  R --> S["similar words end up<br/>with similar rows"]',
                    caption: 'An embedding is a lookup: each id has its own row of learned numbers.',
                },
                note: {
                    idea: 'An embedding is a learned vector for each item: a word, a user, a product. Similar items end up with similar vectors. Technically, it is a lookup table with one row per item.',
                    analogy: 'A city map where similar shops end up in the same neighbourhood, so distance means similarity.',
                    breaks: 'A map has 2 dimensions with names like \'north\'. Embeddings have hundreds of dimensions, and they rarely have simple names.',
                    example: '10,000 words with dimension 64 gives a 10,000 × 64 matrix. Word id 42 is row 42. A one-hot vector times the matrix gives the same row, but a lookup is much faster.',
                    code: 'E = np.random.randn(10_000, 64) * 0.01\nvecs = E[token_ids]    # shape (len(token_ids), 64)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Building makemore Part 2: MLP (the embedding table)', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'The Illustrated Word2vec', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-word2vec/' },
                    { kind: 'watch', title: 'Word Embedding and Word2Vec, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Word+Embedding+and+Word2Vec%2C+Clearly+Explained' },
                ],
                practice: {
                    explain: 'Explain embeddings with the city-map picture.',
                    derive: 'Show that a one-hot vector times an embedding matrix E returns one row of E. Which rows of E get a gradient from one example?',
                    build: 'Train makemore-style character embeddings with 2 dimensions and plot them. Which characters end up close together?',
                    break: 'Pass a token id bigger than the vocabulary and read the error. Then set the embedding size to 1 and see what happens to the loss.',
                },
            },
            {
                id: 'f3-t15',
                name: 'Debugging training: overfit one batch, read loss curves',
                diagram: {
                    code: 'flowchart TD\n  S{"Is the loss at step 0<br/>about ln(number of classes)?"} -->|"no"| B1["bug in initialisation<br/>or the loss"]\n  S -->|"yes"| O{"Can it overfit<br/>one small batch?"}\n  O -->|"no"| B2["bug in the model<br/>or training loop"]\n  O -->|"yes"| C{"Train and validation curves?"}\n  C -->|"validation rising"| OV["overfitting:<br/>add regularisation or data"]\n  C -->|"both high and flat"| UN["underfitting or<br/>learning rate too low"]\n  C -->|"spikes or NaN"| LR["learning rate too high"]',
                    caption: 'A checklist to work through in order. Each question rules out a whole class of bugs before you look at the next.',
                },
                note: {
                    idea: 'First, make the model overfit one small batch: the loss should go close to 0. If it cannot, you have a bug. Then watch the training and validation loss curves together.',
                    analogy: 'A mechanic tests the engine on a stand before driving it on the road.',
                    breaks: 'An engine test is quick and clear. Training bugs can be silent: the code runs and the loss drops a bit, but the result is wrong. So also check the loss at step 0.',
                    example: 'With 10 classes and random weights, the loss at step 0 should be about ln 10 ≈ 2.30. If it is 15, your initialisation or softmax is wrong. Train loss down and validation loss up means overfitting. Both high and flat means underfitting or a learning rate that is too low. Spikes or NaN usually mean the learning rate is too high.',
                },
                resources: [
                    { kind: 'read', title: 'A Recipe for Training Neural Networks', source: 'Andrej Karpathy', url: 'https://karpathy.github.io/2019/04/25/recipe/' },
                    { kind: 'read', title: 'CS231n: Neural Networks Part 3 (gradient checks, babysitting training)', source: 'Stanford', url: 'https://cs231n.github.io/neural-networks-3/' },
                    { kind: 'read', title: 'Deep Learning Tuning Playbook', source: 'Google Research', url: 'https://github.com/google-research/tuning_playbook' },
                ],
                practice: {
                    explain: 'Explain \'overfit one batch first\' with the engine-on-a-stand picture.',
                    derive: 'Write down the expected loss at step 0, with random weights, for 10, 100 and 50,000 classes.',
                    build: 'Write a debugging checklist script: check the initial loss, overfit one batch, plot train and validation curves, print gradient norms per layer.',
                    break: 'Plant 3 bugs in a working training script (labels shifted by one, no shuffling, learning rate × 10). Put it away for a week, then find them.',
                },
            },
            {
                id: 'f3-t16',
                name: 'LSTMs and GRUs: gates for long memory',
                diagram: {
                    code: 'flowchart LR\n  CP["c (previous)"] -->|"× forget gate"| ADD(("+"))\n  IG["input gate × candidate"] --> ADD\n  ADD --> C["c (new)"]\n  C -->|"tanh × output gate"| H["h (output)"]',
                    caption: 'The memory line c is updated by adding, not multiplying, which is why information and gradients survive long sequences.',
                },
                note: {
                    idea: 'An LSTM adds a separate memory line, the cell state, plus three gates that decide what to forget, what to write and what to output. Because the cell state is updated by adding rather than by repeated multiplying, gradients survive over long sequences. A GRU is a simpler version with two gates.',
                    analogy: 'A notebook with a pencil and an eraser. Instead of rewriting the whole sticky note on every page, you erase a few lines (forget gate), write a few new ones (input gate), and read out what you need (output gate).',
                    breaks: 'You decide what to erase on purpose. The gates are learned numbers between 0 and 1, so the network \'half-erases\' things. And it still struggles with very long texts that transformers handle easily.',
                    code: 'z = np.concatenate([h_prev, x])\nf = sigmoid(Wf @ z + bf)          # forget gate\ni = sigmoid(Wi @ z + bi)          # input gate\ng = np.tanh(Wg @ z + bg)          # candidate memory\no = sigmoid(Wo @ z + bo)          # output gate\nc = f * c_prev + i * g            # add, don\'t multiply: gradients survive\nh = o * np.tanh(c)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding LSTM Networks', source: 'Chris Olah', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/' },
                    { kind: 'watch', title: 'Long Short-Term Memory (LSTM), Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Long+Short-Term+Memory+%28LSTM%29%2C+Clearly+Explained' },
                    { kind: 'read', title: 'Dive into Deep Learning, Ch 10 (LSTM and GRU)', source: 'd2l.ai · free', url: 'https://d2l.ai/' },
                ],
                practice: {
                    explain: 'Explain the LSTM gates with the notebook-and-eraser picture.',
                    derive: 'Write the four LSTM gate equations from memory. Then show that the direct path from c_{t−1} to c_t is multiplied only by the forget gate f_t.',
                    build: 'Implement an LSTM cell in NumPy. Check it against torch.nn.LSTMCell with the same weights (copy them in PyTorch\'s gate order). Then train an LSTM on your RNN\'s long-gap task.',
                    break: 'Set the forget-gate bias to −5, so the gate starts almost closed. What happens to long-range memory? Then try +1, a common trick.',
                },
            },
        ],
        builds: [
            { id: 'f3-b1', text: 'Rebuild micrograd from memory: a tiny autograd engine, with an MLP on top.' },
            { id: 'f3-b2', text: 'An MLP in pure NumPy on MNIST, with your own backprop. Check the gradients with your Phase 1 gradient checker.' },
            { id: 'f3-b3', text: 'The same MLP in PyTorch. Compare accuracy and speed.' },
            { id: 'f3-b4', text: 'A CNN on CIFAR-10 in PyTorch, then add residual blocks. Keep an experiment log: what you changed, what happened, and why.' },
        ],
        ready: [
            'Derive backprop for a 2-layer network with softmax and cross-entropy.',
            'Why do we need non-linear activation functions?',
            'What does Adam do that plain SGD does not?',
            'Batch norm vs layer norm: what gets normalised, and when do you use each?',
            'Your loss becomes NaN after 200 steps. What do you check, in order?',
            'Why do residual connections make deep networks trainable?',
        ],
    },
    {
        id: 'llms',
        number: 4,
        short: 'LLMs',
        title: 'Transformers and LLMs',
        accent: '#4db6ac',
        goal: 'Build a small GPT from scratch: tokenizer, attention, training and fine-tuning. This is how modern AI works inside.',
        bigPicture: 'An LLM is a deep neural network with one special layer (attention), trained to guess the next token on a huge amount of text. Everything else is detail, but important detail.',
        main: [
            { title: 'Karpathy: Let’s build GPT, the GPT tokenizer, and reproduce GPT-2', url: 'https://karpathy.ai/zero-to-hero.html', kind: 'Video', free: true, why: 'The last videos of Zero to Hero. Build along, line by line.' },
            { title: 'Build a Large Language Model (From Scratch), Sebastian Raschka', url: 'https://github.com/rasbt/LLMs-from-scratch', kind: 'Book + code', why: 'Step by step in PyTorch. The code and videos are free; the book is paid.' },
            { title: '3Blue1Brown: transformers and attention', url: 'https://www.3blue1brown.com/topics/neural-networks', kind: 'Video', free: true, why: 'The later chapters of the neural networks series. Watch before coding attention.' },
        ],
        deeper: [
            { title: 'The Illustrated Transformer (Jay Alammar)', url: 'https://jalammar.github.io/illustrated-transformer/', kind: 'Blog', free: true, why: 'Every step of a transformer drawn as a picture.' },
            { title: 'Stanford CS224n: NLP with Deep Learning', url: 'https://web.stanford.edu/class/cs224n/', kind: 'Course', free: true, why: 'The university course. Good depth for a PhD.' },
            { title: 'Attention Is All You Need (2017)', url: 'https://arxiv.org/abs/1706.03762', kind: 'Paper', free: true, why: 'The original transformer paper. Read it after you have built one.' },
            { title: 'LoRA (2021)', url: 'https://arxiv.org/abs/2106.09685', kind: 'Paper', free: true, why: 'The paper behind cheap fine-tuning.' },
            { title: 'Umar Jamil', url: 'https://www.youtube.com/@umarjamilai', kind: 'Video', free: true, why: 'Long videos that code models from scratch and explain the maths.' },
        ],
        topics: [
            {
                id: 'f4-t1',
                name: 'Tokenisation and byte-pair encoding (BPE)',
                diagram: {
                    code: 'flowchart LR\n  T["l o w · l o w e r · l o w e s t"] -->|"most frequent pair: l + o"| M1["lo w · lo w e r · lo w e s t"]\n  M1 -->|"next: lo + w"| M2["low · low e r · low e s t"]\n  M2 -->|"keep merging…"| V["final vocabulary of tokens"]',
                    caption: 'BPE builds tokens bottom-up by merging the most frequent neighbouring pair, again and again.',
                },
                note: {
                    idea: 'A model reads tokens, not letters or whole words. Byte-pair encoding (BPE) starts from single characters (or bytes) and repeatedly merges the most frequent neighbouring pair into a new token.',
                    analogy: 'Shorthand notes. You notice you write \'the\' all the time, so you invent one symbol for it.',
                    breaks: 'You choose shorthand by meaning. BPE merges only by frequency, so tokens can be odd pieces like \'ing\' or \' the\' with a space.',
                    example: 'In \'low lower lowest\', the pair l + o is most frequent, so it becomes \'lo\'. Then lo + w becomes \'low\'. Now \'lowest\' is \'low\' + \'e\' + \'s\' + \'t\', until more merges happen.',
                    code: 'from collections import Counter\npairs = Counter(zip(tokens, tokens[1:]))\nbest = pairs.most_common(1)[0][0]    # merge this pair next',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Let\'s build the GPT Tokenizer', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Byte-Pair Encoding tokenization', source: 'Hugging Face LLM Course', url: 'https://www.google.com/search?q=Hugging+Face+course+Byte-Pair+Encoding+tokenization' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 2 (working with text data)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                ],
                practice: {
                    explain: 'Explain BPE with the shorthand-notes picture.',
                    derive: 'Run 3 BPE merges by hand on \'aaabdaaabac\'. Write the token list after each merge. When pairs tie, pick the one that appears first.',
                    build: 'Build a BPE tokenizer: train it on a text file, then write encode and decode, and check that decode(encode(text)) == text.',
                    break: 'Tokenise long numbers like 1234567, and text in a language with a non-Latin script. How many tokens does each need compared with English? Why does that matter for cost and for arithmetic?',
                },
            },
            {
                id: 'f4-t2',
                name: 'Token embeddings and positional encoding',
                diagram: {
                    code: 'flowchart LR\n  T["token ids<br/>\'dog\', \'bites\', \'man\'"] --> TE["token embeddings"]\n  P["positions<br/>0, 1, 2"] --> PE["position embeddings"]\n  TE --> ADD(("+"))\n  PE --> ADD\n  ADD --> X["input to the transformer"]',
                    caption: 'Each token\'s vector gets its position added, so \'dog bites man\' and \'man bites dog\' look different to the model.',
                },
                note: {
                    idea: 'Each token id becomes a vector (its embedding). Attention on its own does not know word order, so we add position information: a learned position vector, sine waves, or rotations (RoPE).',
                    analogy: 'Seat numbers in a theatre. Everyone is a person (the embedding), but the seat number (the position) tells you who sits next to whom.',
                    breaks: 'Seats are fixed. A model trained on 1,000 positions often struggles at 10,000, so long-context models need special tricks.',
                    example: '\'dog bites man\' and \'man bites dog\' use the same tokens but mean different things. Without positions, the model sees the same bag of words.',
                    code: 'x = tok_emb[ids] + pos_emb[np.arange(len(ids))]   # shape (T, d)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 2 (token and positional embeddings)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                    { kind: 'read', title: 'The Illustrated Transformer (positional encoding section)', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/' },
                    { kind: 'read', title: 'Rotary Embeddings: A Relative Revolution', source: 'EleutherAI blog', url: 'https://blog.eleuther.ai/rotary-embeddings/' },
                ],
                practice: {
                    explain: 'Explain positional encoding with the theatre-seats picture.',
                    derive: 'Show that self-attention without positions gives the same outputs, just reordered, if you shuffle the input tokens. Why does that mean we need positions?',
                    build: 'Implement sinusoidal position encodings and plot them as a heatmap. Then add learned position embeddings to your model.',
                    break: 'Train your small GPT with no position information at all. Compare the generated text with and without it.',
                },
            },
            {
                id: 'f4-t3',
                name: 'Self-attention: queries, keys and values',
                diagram: {
                    code: 'flowchart LR\n  X["token vectors X"] --> Q["Q = X·Wq"]\n  X --> K["K = X·Wk"]\n  X --> V["V = X·Wv"]\n  Q & K --> S["scores = Q·Kᵀ / √d"]\n  S --> SM["softmax → attention weights"]\n  SM & V --> O["output = weights · V"]',
                    caption: 'Every token compares its query with every key, turns the scores into weights, and takes that weighted mix of the values.',
                },
                note: {
                    idea: 'Every token makes three vectors: a query (what I am looking for), a key (what I contain) and a value (what I will share). Each token compares its query with every key, turns the scores into weights with softmax, and takes a weighted average of the values.',
                    analogy: 'A library. Your question is the query. Book titles are keys. The contents are values. You read a mix of the books whose titles best match your question.',
                    breaks: 'In a library you read only the best books. In attention you get a blend of all of them, weighted by how well they match.',
                    example: 'In \'The animal didn\'t cross the street because it was tired\', attention for \'it\' can put a high weight on \'animal\'.',
                    code: 'Q, K, V = X @ Wq, X @ Wk, X @ Wv            # each (T, d)\nscores = Q @ K.T / np.sqrt(d)                # (T, T)\nscores = scores - scores.max(axis=1, keepdims=True)\nA = np.exp(scores); A /= A.sum(axis=1, keepdims=True)\nout = A @ V                                  # (T, d)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 6: Attention in transformers', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 3 (coding attention mechanisms)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                    { kind: 'read', title: 'The Illustrated Transformer', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/' },
                ],
                practice: {
                    explain: 'Explain queries, keys and values with the library picture.',
                    derive: 'With 3 tokens, d = 2, and small whole-number Q, K and V matrices you make up, compute the attention weights and the output by hand.',
                    build: 'Write single-head self-attention in NumPy, then in PyTorch, and check that they match. Add the causal mask.',
                    break: 'Remove the √d scaling and use d = 512. Look at the softmax outputs. Why do they become almost one-hot, and what does that do to the gradients?',
                },
            },
            {
                id: 'f4-t4',
                name: 'Multi-head attention and the transformer block',
                diagram: {
                    code: 'flowchart LR\n  X["x"] --> LN1["layer norm"] --> ATT["multi-head attention"] --> A1(("+"))\n  X --> A1\n  A1 --> LN2["layer norm"] --> MLP["MLP"] --> A2(("+"))\n  A1 --> A2\n  A2 --> O["to the next block"]',
                    caption: 'One pre-norm transformer block: attention, then an MLP, each wrapped with layer norm and a residual shortcut.',
                },
                note: {
                    idea: 'Multi-head attention runs several smaller attentions in parallel, so each head can track a different kind of relationship. A transformer block is attention plus an MLP, each wrapped with layer norm and a residual connection.',
                    analogy: 'A team reading the same contract. One person checks dates, one checks names, one checks money. Then they merge their notes.',
                    breaks: 'People choose their roles. Heads learn their roles on their own, and many heads do not have clean, readable roles.',
                    example: 'GPT-2 small: d_model = 768 with 12 heads, so each head works in 64 dimensions.',
                    code: '# one pre-norm transformer block\nx = x + attention(layer_norm(x))\nx = x + mlp(layer_norm(x))',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Let\'s build GPT: from scratch, in code, spelled out', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'The Annotated Transformer', source: 'Harvard NLP', url: 'https://nlp.seas.harvard.edu/annotated-transformer/' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 4 (implementing a GPT model)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                ],
                practice: {
                    explain: 'Explain multi-head attention with the team-reading-a-contract picture.',
                    derive: 'For d_model = 768, 12 heads and an MLP ratio of 4, count the parameters in one transformer block (ignore biases and layer norm).',
                    build: 'Write multi-head attention by reshaping (batch, T, d) into (batch, heads, T, d / heads). Then build a full pre-norm transformer block.',
                    break: 'Remove the residual connections from a 6-block model and train it. Then move layer norm after the addition (post-norm) and compare stability.',
                },
            },
            {
                id: 'f4-t5',
                name: 'GPT-style models and next-token prediction',
                diagram: {
                    code: 'flowchart LR\n  C["\'The cat sat on\'"] --> GPT["GPT"] --> P["next-token probabilities<br/>\'the\' 0.62 · \'a\' 0.21 · …"]\n  P --> PK["pick \'the\'"] --> AP["append:<br/>\'The cat sat on the\'"]\n  AP -->|"repeat"| GPT',
                    caption: 'Generation is a loop: predict the next token, add it to the text, and predict again.',
                },
                note: {
                    idea: 'A GPT reads tokens left to right and predicts the next token. A causal mask stops each position from seeing the future. Generation means: predict, append, repeat.',
                    analogy: 'The next-word suggestion on your phone keyboard, but trained on a huge amount of text and far deeper.',
                    breaks: 'A phone keyboard looks at a few words. A GPT looks at thousands of tokens of context at once.',
                    example: 'For \'The cat sat on the\', the input [The, cat, sat, on] is trained to predict [cat, sat, on, the]: the same sequence, shifted by one.',
                    code: 'mask = np.triu(np.ones((T, T)), k=1).astype(bool)\nscores[mask] = -np.inf    # no looking ahead',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Neural Networks, Ch 5: But what is a GPT? Visual intro to transformers', source: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks' },
                    { kind: 'read', title: 'The Illustrated GPT-2', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-gpt2/' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 5 (pretraining on unlabelled data)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                ],
                practice: {
                    explain: 'Explain next-token prediction with the phone-keyboard picture, and where the picture breaks.',
                    derive: 'For \'I love deep learning\', write the input tokens and the target tokens the model trains on.',
                    build: 'Train a small GPT on a text dataset such as Shakespeare. Write a generate() function that samples one token at a time.',
                    break: 'Remove the causal mask during training. The training loss drops fast. Why is the model useless when you generate?',
                },
            },
            {
                id: 'f4-t6',
                name: 'Encoder models (BERT) vs decoder models (GPT)',
                diagram: {
                    code: 'flowchart LR\n  B["BERT (encoder):<br/>\'Paris is the [MASK] of France\'"] -->|"looks at both sides"| BA["\'capital\'"]\n  G["GPT (decoder):<br/>\'Paris is the\'"] -->|"looks left only"| GA["guess the next word"]',
                    caption: 'Encoders read the whole sentence to understand it; decoders only see the past, so they can generate text word by word.',
                },
                note: {
                    idea: 'Encoder models like BERT see the whole sentence in both directions and are trained to fill in masked words. They are good for understanding: classification and search embeddings. Decoder models like GPT see only the past and are trained to predict the next word. They are good for generating text.',
                    analogy: 'BERT does fill-in-the-blank exercises. GPT writes a story one word at a time.',
                    breaks: 'The line is blurry today. Decoder models are also used for classification and embeddings.',
                    example: '\'Paris is the [MASK] of France\': BERT predicts \'capital\' using words on both sides. Given only \'Paris is the\', GPT must guess using the left side alone.',
                },
                resources: [
                    { kind: 'read', title: 'The Illustrated BERT, ELMo, and co.', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-bert/' },
                    { kind: 'watch', title: 'Decoder-Only Transformers, ChatGPT\'s specific Transformer, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Decoder-Only+Transformers%2C+ChatGPT%27s+specific+Transformer%2C+Clearly+Explained' },
                    { kind: 'paper', title: 'BERT (2018)', source: 'Devlin et al. · arXiv', url: 'https://arxiv.org/abs/1810.04805' },
                ],
                practice: {
                    explain: 'Explain encoders and decoders with the fill-in-the-blank and story-writing pictures.',
                    derive: 'Draw the attention mask for an encoder and for a decoder with 4 tokens. Which cells are allowed in each?',
                    build: 'Turn your GPT into a small BERT-style model: remove the causal mask, hide 15% of the tokens, and train it to predict them.',
                    break: 'Try to generate text with the BERT-style model, one token at a time. Why does it work badly?',
                },
            },
            {
                id: 'f4-t13',
                name: 'Vision transformers and CLIP',
                diagram: {
                    code: 'flowchart LR\n  IMG["image 224 × 224"] --> PT["196 patches of 16 × 16"] --> EMB["patch embeddings<br/>+ positions"] --> TR["transformer"] --> CL["class"]\n  I2["image"] --> IE["image encoder"] --> SP["shared space"]\n  T2["\'a photo of a cat\'"] --> TE["text encoder"] --> SP\n  SP --> SIM["closest match wins"]',
                    caption: 'Top: a ViT reads an image as a sequence of patches. Bottom: CLIP places images and captions in one space, so matching ones land close together.',
                },
                note: {
                    idea: 'A vision transformer (ViT) treats an image like a sentence: cut it into small patches, for example 16 × 16 pixels, turn each patch into a vector, add positions, and run a normal transformer. CLIP trains an image encoder and a text encoder together, so a picture and its caption land close together in the same embedding space. That lets you search images with text, and classify images with no task-specific training.',
                    analogy: 'ViT reads a photo like a comic strip, panel by panel. CLIP is two translators, one for pictures and one for words, trained until they give the same \'meaning code\' to a picture and its description.',
                    breaks: 'Comic panels come in a set order. A ViT has no built-in sense of which patch sits next to which, so it must learn that from position embeddings. That is one reason ViTs need much more data than CNNs.',
                    example: 'A 224 × 224 image cut into 16 × 16 patches gives 14 × 14 = 196 patches, so 196 \'tokens\'. For zero-shot classification, CLIP compares an image with texts like \'a photo of a cat\' and \'a photo of a dog\', and picks the closest.',
                    code: '# CLIP\'s contrastive loss for a batch of N image-caption pairs\nimg = F.normalize(image_encoder(images), dim=-1)    # (N, d)\ntxt = F.normalize(text_encoder(captions), dim=-1)   # (N, d)\nlogits = img @ txt.T / temperature                   # (N, N)\ntargets = torch.arange(N)                             # true pairs sit on the diagonal\nloss = (F.cross_entropy(logits, targets) + F.cross_entropy(logits.T, targets)) / 2',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 12 (transformers for images)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'watch', title: 'Vision Transformer explained, with code', source: 'Umar Jamil', url: 'https://www.youtube.com/results?search_query=Umar+Jamil+vision+transformer+explained' },
                    { kind: 'code', title: 'OpenCLIP', source: 'GitHub', url: 'https://github.com/mlfoundations/open_clip' },
                    { kind: 'paper', title: 'An Image is Worth 16x16 Words (ViT, 2020)', source: 'Dosovitskiy et al. · arXiv', url: 'https://arxiv.org/abs/2010.11929' },
                    { kind: 'paper', title: 'Learning Transferable Visual Models From Natural Language Supervision (CLIP, 2021)', source: 'Radford et al. · arXiv', url: 'https://arxiv.org/abs/2103.00020' },
                ],
                practice: {
                    explain: 'Explain ViT and CLIP with the comic-strip and two-translators pictures.',
                    derive: 'For a 224 × 224 RGB image with 16 × 16 patches, how many patches are there, and how long is each flattened patch vector?',
                    build: 'Build a small ViT in PyTorch (patchify, linear embedding, positions, class token, transformer blocks) and train it on CIFAR-10. Compare it with your CNN. Then use a pretrained CLIP model for zero-shot classification on a few classes.',
                    break: 'Train your ViT on only 10% of CIFAR-10 and compare with the CNN again. Then shuffle the patch order at test time. What does each result tell you?',
                },
            },
            {
                id: 'f4-t7',
                name: 'Sampling: greedy, temperature, top-k, top-p',
                diagram: {
                    code: 'xychart-beta\n  title "Next-token probabilities for logits [2, 1, 0]"\n  x-axis "token" ["A", "B", "C"]\n  y-axis "probability" 0 --> 1\n  line [0.87, 0.12, 0.02]\n  line [0.67, 0.24, 0.09]\n  line [0.51, 0.31, 0.19]',
                    caption: 'The steepest line is temperature 0.5 (sharp, safe), the middle is 1, the flattest is 2 (more random). Same logits, different temperature.',
                },
                note: {
                    idea: 'The model gives a probability for every possible next token. Greedy decoding always picks the top one. Temperature divides the logits by T before softmax: T < 1 makes choices sharper, T > 1 makes them flatter. Top-k keeps only the k best tokens. Top-p keeps the smallest set whose probabilities add up to p.',
                    analogy: 'Ordering at a restaurant. Greedy: always the most popular dish. High temperature: feeling adventurous. Top-k: only choose from the top 5 dishes.',
                    breaks: 'One restaurant order does not change the next one. In text, each choice changes everything after it, so one odd pick can send the text off track.',
                    example: 'Logits [2, 1, 0]. At T = 1: about [0.67, 0.24, 0.09]. At T = 0.5: about [0.87, 0.12, 0.02].',
                    code: 'p = softmax(logits / T)\nnext_id = np.random.choice(len(p), p=p)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'How to generate text: using different decoding methods', source: 'Hugging Face blog', url: 'https://huggingface.co/blog/how-to-generate' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 5 (decoding strategies)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                    { kind: 'paper', title: 'The Curious Case of Neural Text Degeneration (2019)', source: 'Holtzman et al. · arXiv', url: 'https://arxiv.org/abs/1904.09751' },
                ],
                practice: {
                    explain: 'Explain temperature with the restaurant-ordering picture.',
                    derive: 'For probabilities [0.5, 0.2, 0.15, 0.1, 0.05], which tokens are kept with top-k = 2, and which with top-p = 0.8?',
                    build: 'Add temperature, top-k and top-p to your generate(). Generate 5 samples with each setting and compare.',
                    break: 'Generate with temperature 0.01 and with 3.0. Describe the failure at each end.',
                },
            },
            {
                id: 'f4-t8',
                name: 'KV cache and the cost of generation',
                diagram: {
                    code: 'flowchart LR\n  P["prompt tokens 1…n"] --> PF["prefill: compute K and V<br/>for all of them"] --> C[("KV cache")]\n  N["each new token"] --> K1["compute K and V<br/>for this token only"] --> C\n  C --> A["attention reads<br/>the whole cache"] --> T["next token"]',
                    caption: 'Without the cache, every step would recompute the keys and values for the whole text. With it, each step only adds one row.',
                },
                note: {
                    idea: 'When generating, each new token needs the keys and values of all earlier tokens. Instead of recomputing them at every step, we store them. This is the KV cache. It is much faster, but it uses a lot of memory.',
                    analogy: 'Taking notes during a long meeting, instead of replaying the whole recording each time someone speaks.',
                    breaks: 'Meeting notes are small. The KV cache grows with every token, every layer and every user, and it can use more memory than the model itself.',
                    example: 'Memory ≈ 2 (K and V) × layers × tokens × d_model × bytes. With 32 layers, d_model 4,096, 4,096 tokens in bf16 (2 bytes): about 2.1 GB for one sequence. (Models with grouped-query attention use less.)',
                },
                resources: [
                    { kind: 'read', title: 'Understanding and Coding the KV Cache in LLMs from Scratch', source: 'Sebastian Raschka', url: 'https://www.google.com/search?q=Sebastian+Raschka+understanding+and+coding+the+KV+cache+from+scratch' },
                    { kind: 'watch', title: 'LLaMA explained: KV-Cache, Rotary Positional Embedding, RMS Norm', source: 'Umar Jamil', url: 'https://www.youtube.com/results?search_query=Umar+Jamil+LLaMA+explained+KV+cache+rotary+positional+embedding' },
                ],
                practice: {
                    explain: 'Explain the KV cache with the meeting-notes picture.',
                    derive: 'Work out the KV cache size for a model with 24 layers, d_model 2,048 and 8,192 tokens, in bf16.',
                    build: 'Add a KV cache to your GPT\'s generate(). Time 500 generated tokens with and without it.',
                    break: 'Generate past the cache\'s maximum length. What breaks? Then measure memory as the number of users in a batch grows.',
                },
            },
            {
                id: 'f4-t9',
                name: 'Pretraining data and scaling laws',
                diagram: {
                    code: 'xychart-beta\n  title "Loss vs model size (illustration)"\n  x-axis "parameters" ["10M", "100M", "1B", "10B", "100B"]\n  y-axis "loss" 0 --> 4.5\n  line [4.0, 3.3, 2.8, 2.4, 2.1]',
                    caption: 'Scaling laws: every 10× in size (with matching data and compute) buys a smooth, predictable drop in loss.',
                },
                note: {
                    idea: 'Pretraining is next-token prediction on a huge text collection. Scaling laws say the loss falls smoothly and predictably as model size, data and compute grow. The Chinchilla result: for a fixed compute budget, use roughly 20 training tokens per parameter.',
                    analogy: 'Learning a language by reading a whole library. More books and a bigger brain both help, in a predictable way.',
                    breaks: 'Reading the same book a thousand times does not help. Data quality and variety matter as much as size.',
                    example: 'A 1-billion-parameter model would get about 20 billion tokens by the Chinchilla rule. Modern models often train on far more, because a smaller, well-trained model is cheaper to run.',
                },
                resources: [
                    { kind: 'watch', title: 'Deep Dive into LLMs like ChatGPT (the pretraining part)', source: 'Andrej Karpathy', url: 'https://www.youtube.com/results?search_query=Andrej+Karpathy+Deep+Dive+into+LLMs+like+ChatGPT' },
                    { kind: 'read', title: 'FineWeb: decanting the web for the finest text data at scale', source: 'Hugging Face', url: 'https://www.google.com/search?q=Hugging+Face+FineWeb+blog+post+decanting+the+web' },
                    { kind: 'paper', title: 'Training Compute-Optimal Large Language Models (Chinchilla, 2022)', source: 'Hoffmann et al. · arXiv', url: 'https://arxiv.org/abs/2203.15556' },
                ],
                practice: {
                    explain: 'Explain scaling laws with the library-and-brain picture, and why data quality matters.',
                    derive: 'With the rule of about 20 tokens per parameter, how many training tokens would a 125M, a 1B and a 7B model get?',
                    build: 'Train your GPT at 3 sizes on the same data. Plot final loss against parameter count on log-log axes.',
                    break: 'Train on a dataset full of duplicated documents, then on a deduplicated version. Compare the validation losses.',
                },
            },
            {
                id: 'f4-t12',
                name: 'Mixture of experts',
                diagram: {
                    code: 'flowchart LR\n  T["token"] --> R{"router"}\n  R -->|"weight 0.7"| E2["expert 2"]\n  R -->|"weight 0.3"| E5["expert 5"]\n  R -.->|"not used"| E1["experts 1, 3, 4, 6, 7, 8"]\n  E2 & E5 --> S["weighted sum → output"]',
                    caption: 'Only 2 of the 8 experts run for this token, so the model is huge but each token\'s compute stays small.',
                },
                note: {
                    idea: 'A mixture-of-experts (MoE) layer replaces one big MLP with many smaller \'expert\' MLPs and a router. For each token, the router picks only a few experts, often 2, to run. So the model can have a huge number of parameters in total while each token uses only a small part of them: more knowledge for about the same compute per token.',
                    analogy: 'A hospital with many specialists. Each patient sees only the one or two doctors they need, not every doctor in the building.',
                    breaks: 'A hospital can spread patients fairly. In an MoE, if the router sends too many tokens to the same few experts, they are overloaded and the others learn nothing, so training adds a load-balancing loss. And every expert must still sit in memory, even the unused ones.',
                    example: 'Mixtral 8x7B has 8 experts per layer with top-2 routing. It has about 47B parameters in total, but uses only about 13B for each token.',
                    code: 'scores = router(x)                                  # (tokens, n_experts)\ntop_w, top_i = scores.softmax(-1).topk(2, dim=-1)   # 2 experts per token\nout = torch.zeros_like(x)\nfor k in range(2):\n    for e in range(n_experts):\n        mask = top_i[:, k] == e\n        if mask.any():\n            out[mask] += top_w[mask, k].unsqueeze(-1) * experts[e](x[mask])',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Mixture of Experts Explained', source: 'Hugging Face blog', url: 'https://huggingface.co/blog/moe' },
                    { kind: 'read', title: 'A Visual Guide to Mixture of Experts', source: 'Maarten Grootendorst', url: 'https://www.google.com/search?q=Maarten+Grootendorst+a+visual+guide+to+mixture+of+experts' },
                    { kind: 'paper', title: 'Outrageously Large Neural Networks: the Sparsely-Gated MoE Layer (2017)', source: 'Shazeer et al. · arXiv', url: 'https://arxiv.org/abs/1701.06538' },
                    { kind: 'paper', title: 'Mixtral of Experts (2024)', source: 'Jiang et al. · arXiv', url: 'https://arxiv.org/abs/2401.04088' },
                ],
                practice: {
                    explain: 'Explain mixture of experts with the hospital picture, and why memory is still a cost.',
                    derive: 'A model has 24 layers, each with 64 experts of 100M parameters, and top-2 routing. How many expert parameters exist in total, and how many run for each token?',
                    build: 'Replace the MLP in your GPT\'s blocks with a 4-expert, top-2 MoE layer. Train it and log how many tokens each expert receives.',
                    break: 'Train without any load-balancing loss and watch expert usage. Do some experts die? Then add a simple balancing loss and compare.',
                },
            },
            {
                id: 'f4-t10',
                name: 'Fine-tuning and LoRA',
                diagram: {
                    code: 'flowchart LR\n  X["x"] --> W["W (frozen)<br/>4,096 × 4,096"] --> ADD(("+"))\n  X --> A["A (trained)<br/>8 × 4,096"] --> B["B (trained)<br/>4,096 × 8"] --> ADD\n  ADD --> Y["output"]',
                    caption: 'LoRA leaves the big weight W untouched and trains two thin matrices beside it — about 0.4% as many numbers.',
                },
                note: {
                    idea: 'Fine-tuning continues training a pretrained model on your own data. Full fine-tuning updates every weight. LoRA freezes the original weights W and learns a small update BA of low rank r (for example 8): W′ = W + BA.',
                    analogy: 'Instead of rewriting a whole textbook, you add a few sticky notes with corrections.',
                    breaks: 'Sticky notes can be removed, and so can LoRA adapters, so one base model can serve many tasks. But a small rank cannot teach big new skills.',
                    example: 'A 4,096 × 4,096 layer has 16.8 million weights. LoRA with r = 8 trains B (4,096 × 8) and A (8 × 4,096): 65,536 weights, about 0.4%.',
                    code: 'W.requires_grad = False                        # W has shape (d_out, d_in)\nA = (torch.randn(r, d_in) * 0.01).requires_grad_()\nB = torch.zeros(d_out, r, requires_grad=True)   # B = 0: start with no change\ny = x @ W.T + x @ (B @ A).T',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Appendix E (LoRA)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                    { kind: 'watch', title: 'LoRA explained, with code', source: 'Umar Jamil', url: 'https://www.youtube.com/results?search_query=Umar+Jamil+LoRA+explained' },
                    { kind: 'paper', title: 'LoRA: Low-Rank Adaptation of Large Language Models (2021)', source: 'Hu et al. · arXiv', url: 'https://arxiv.org/abs/2106.09685' },
                ],
                practice: {
                    explain: 'Explain LoRA with the sticky-notes-on-a-textbook picture.',
                    derive: 'For a 1,024 × 1,024 layer, count the trainable weights with full fine-tuning, and with LoRA at r = 4, 8 and 64.',
                    build: 'Add LoRA adapters to the attention layers of your GPT. Fine-tune it on a new text style and compare with full fine-tuning.',
                    break: 'Start both A and B random instead of B = 0. What happens at step 0? Then try r = 1 on a task that needs a big change.',
                },
            },
            {
                id: 'f4-t11',
                name: 'Instruction tuning and preference tuning (RLHF, DPO)',
                diagram: {
                    code: 'flowchart LR\n  PT["pretrained model<br/>(continues any text)"] --> SFT["instruction tuning<br/>(examples of good answers)"] --> PREF["preference tuning<br/>(chosen vs rejected answers:<br/>RLHF or DPO)"] --> AS["helpful assistant"]',
                    caption: 'Three stages: read everything, learn from worked examples, then learn which of two answers people prefer.',
                },
                note: {
                    idea: 'A pretrained model only continues text. Instruction tuning (supervised fine-tuning) trains it on examples of good question-and-answer pairs. Preference tuning trains it on pairs of answers where people marked the better one. RLHF uses a reward model and reinforcement learning. DPO learns from the pairs directly.',
                    analogy: 'Pretraining is reading everything. Instruction tuning is an internship with worked examples. Preference tuning is a manager saying \'this version is better than that one\'.',
                    breaks: 'A manager explains why. Preference data only says which answer won, so models can learn shortcuts, such as \'longer answers win\'.',
                    example: 'Prompt: \'Explain gravity\'. Answer A is clear and correct. Answer B rambles. The training example is (prompt, chosen = A, rejected = B).',
                },
                resources: [
                    { kind: 'read', title: 'Illustrating Reinforcement Learning from Human Feedback (RLHF)', source: 'Hugging Face blog', url: 'https://huggingface.co/blog/rlhf' },
                    { kind: 'code', title: 'Build a Large Language Model (From Scratch), Ch 7 (fine-tuning to follow instructions)', source: 'Sebastian Raschka · code free', url: 'https://github.com/rasbt/LLMs-from-scratch' },
                    { kind: 'paper', title: 'Direct Preference Optimization (DPO, 2023)', source: 'Rafailov et al. · arXiv', url: 'https://arxiv.org/abs/2305.18290' },
                ],
                practice: {
                    explain: 'Explain pretraining, instruction tuning and preference tuning with the internship-and-manager picture.',
                    derive: 'Write 3 instruction-tuning examples and 2 preference pairs (chosen and rejected) for a cooking assistant.',
                    build: 'Fine-tune your small model on a few hundred instruction examples with a chat template. Compare its answers before and after.',
                    break: 'Imagine a preference dataset where the chosen answer is always the longer one. What shortcut will the model learn? How would you check for it?',
                },
            },
            {
                id: 'f4-t14',
                name: 'Reasoning models and test-time compute',
                diagram: {
                    code: 'flowchart LR\n  Q["maths question"] --> S1["reasoning path 1 → 42"]\n  Q --> S2["reasoning path 2 → 42"]\n  Q --> S3["reasoning path 3 → 40"]\n  Q --> S4["reasoning path 4 → 42"]\n  Q --> S5["reasoning path 5 → 38"]\n  S1 & S2 & S3 & S4 & S5 --> V["majority vote: 42"]',
                    caption: 'Self-consistency: spend more compute at answer time by sampling several reasoning paths and taking the most common answer.',
                },
                note: {
                    idea: 'A reasoning model is trained to \'think\' before answering: it writes out intermediate steps (a chain of thought) and can spend more tokens on harder problems. Spending more computation at answer time, by reasoning for longer or by sampling several answers and picking the best, is called test-time compute. Much of this ability is trained with reinforcement learning on problems whose answers can be checked, like maths and code.',
                    analogy: 'A student allowed to use scrap paper and check their work, instead of shouting the first answer that comes to mind.',
                    breaks: 'A student\'s scrap paper shows their real reasoning. A model\'s written steps are not guaranteed to be the true cause of its answer. And more thinking costs more time and money; it helps most on problems with checkable steps.',
                    example: 'Self-consistency: sample 10 reasoning paths for a maths question and take the most common final answer. It is often more accurate than one greedy answer, at 10 times the cost.',
                    code: 'from collections import Counter\n\nanswers = [final_answer(llm(question, temperature=0.8)) for _ in range(10)]\nbest, votes = Counter(answers).most_common(1)[0]   # majority vote',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Reasoning LLMs', source: 'Sebastian Raschka', url: 'https://www.google.com/search?q=Sebastian+Raschka+understanding+reasoning+LLMs' },
                    { kind: 'watch', title: 'Deep Dive into LLMs like ChatGPT (the \'thinking\' and RL sections)', source: 'Andrej Karpathy', url: 'https://www.youtube.com/results?search_query=Andrej+Karpathy+Deep+Dive+into+LLMs+like+ChatGPT' },
                    { kind: 'paper', title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)', source: 'Wei et al. · arXiv', url: 'https://arxiv.org/abs/2201.11903' },
                    { kind: 'paper', title: 'Self-Consistency Improves Chain of Thought Reasoning (2022)', source: 'Wang et al. · arXiv', url: 'https://arxiv.org/abs/2203.11171' },
                    { kind: 'paper', title: 'DeepSeek-R1: Incentivizing Reasoning Capability via RL (2025)', source: 'DeepSeek-AI · arXiv', url: 'https://arxiv.org/abs/2501.12948' },
                ],
                practice: {
                    explain: 'Explain test-time compute with the scrap-paper picture, and when it is worth the cost.',
                    derive: 'A model is right 60% of the time on a type of question, independently each time. With a majority vote over 5 samples, is it right more or less often? Calculate it.',
                    build: 'On 50 arithmetic word problems, compare: a direct answer, \'think step by step\', and self-consistency with 5 and 10 samples. Plot accuracy against tokens used.',
                    break: 'Try the same methods on simple factual questions, like capital cities. Does extra thinking still help, or just cost more? Find one case where the reasoning is wrong but the answer is right.',
                },
            },
        ],
        builds: [
            { id: 'f4-b1', text: 'A BPE tokenizer from scratch, trained on a text file.' },
            { id: 'f4-b2', text: 'Self-attention in NumPy, with tiny matrices you can check by hand.' },
            { id: 'f4-b3', text: 'A small GPT in PyTorch, trained on a small text dataset. Make it generate text.' },
            { id: 'f4-b4', text: 'LoRA from scratch on your GPT: freeze the model, train low-rank adapters, compare memory and quality.' },
            { id: 'f4-b5', text: 'A blog post that explains attention with a three-word example.' },
        ],
        ready: [
            'Walk through one transformer block and give the shape of every tensor.',
            'Why do we divide by √dₖ in attention?',
            'Why does a KV cache make generation faster? What does it cost?',
            'LoRA: what is frozen, what is trained, and why does it save memory?',
            'What changes when temperature goes from 0 to 1.5?',
            'Pretraining vs instruction tuning vs preference tuning: what does each one teach the model?',
            'How can a mixture-of-experts model have many parameters but low compute per token?',
            'How does CLIP learn to match images with text?',
            'What changes when a model \'thinks longer\' at answer time, and when is it worth it?',
        ],
    },
    {
        id: 'ai-engineering',
        number: 5,
        short: 'AI engineering',
        title: 'AI engineering',
        accent: '#b39ddb',
        goal: 'Turn foundation models into real products: retrieval, evaluation, agents and deployment. This is the core of most AI engineer jobs.',
        bigPicture: 'Phases 1 to 4 teach you how the engine works. Phase 5 teaches you to build the car around it: steering (prompts), fuel (data and retrieval), a dashboard (evaluation) and brakes (safety).',
        main: [
            { title: 'AI Engineering (Chip Huyen)', kind: 'Book', paid: true, why: 'You are already reading it. Keep going. It is the main text for this phase.' },
            { title: 'Your AI Product Needs Evals (Hamel Husain)', url: 'https://hamel.dev/blog/posts/evals/', kind: 'Blog', free: true, why: 'The clearest guide to evaluation, the most important AI engineering skill.' },
            { title: 'Made With ML (Goku Mohandas)', url: 'https://madewithml.com/', kind: 'Course', free: true, why: 'Takes a model to production: testing, serving, CI/CD.' },
        ],
        deeper: [
            { title: 'Designing Machine Learning Systems (Chip Huyen)', kind: 'Book', paid: true, why: 'The standard book for ML system design interviews.' },
            { title: 'Stanford CS329S: Machine Learning Systems Design', url: 'https://stanford-cs329s.github.io/', kind: 'Notes', free: true, why: 'Free course notes on the same topics.' },
            { title: 'FastAPI documentation', url: 'https://fastapi.tiangolo.com/', kind: 'Docs', free: true, why: 'The simplest way to put a model behind an API.' },
        ],
        topics: [
            {
                id: 'f5-t1',
                name: 'Prompting: clear instructions, examples, structured output',
                diagram: {
                    code: 'flowchart LR\n  R["role and context"] --> P["prompt"]\n  T["the task"] --> P\n  E["an example output"] --> P\n  F["the output format (JSON)"] --> P\n  P --> M["model"] --> O["JSON your code can read"]',
                    caption: 'A strong prompt briefs the model like a new colleague: who it is, what to do, an example, and exactly what shape the answer must take.',
                },
                note: {
                    idea: 'The prompt is the model\'s only briefing. Be clear and specific, give context, show examples of the output you want, and ask for a fixed format, like JSON, when code will read the answer.',
                    analogy: 'Briefing a smart new colleague on their first day. They are capable, but they know nothing about your project unless you tell them.',
                    breaks: 'A colleague asks when they are unsure. A model usually guesses instead, so leave less to guess.',
                    example: 'Weak: \'Summarise this.\' Strong: \'Summarise this support ticket in 2 sentences for an engineer. Then return JSON with product and urgency (low, medium or high).\'',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 5 (prompt engineering)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Prompt engineering overview', source: 'Claude docs', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview' },
                ],
                practice: {
                    explain: 'Explain good prompting with the new-colleague picture.',
                    derive: 'Rewrite this weak prompt into a strong one: \'Tell me about this CV.\' Add a role, context, the task, an output format and an example.',
                    build: 'Send 20 support tickets to an LLM API with your prompt, and parse the JSON output. Count how many parse correctly.',
                    break: 'Make the prompt vague on purpose, or remove the example. Measure how the parse rate and quality change.',
                },
            },
            {
                id: 'f5-t10',
                name: 'Structured outputs and function calling',
                diagram: {
                    code: 'sequenceDiagram\n  participant U as User\n  participant A as Your app\n  participant M as Model\n  participant T as Weather tool\n  U->>A: what\'s the weather in Leeds?\n  A->>M: question and the list of tools\n  M-->>A: call get_weather(city = Leeds)\n  A->>T: get_weather(Leeds)\n  T-->>A: 14°C, light rain\n  A->>M: here is the tool result\n  M-->>A: It\'s 14°C with light rain in Leeds.\n  A-->>U: final answer',
                    caption: 'The model never runs the tool itself: it asks your code to, and then writes the final answer from the result.',
                },
                note: {
                    idea: 'Structured output means making the model reply in a fixed format, usually JSON that matches a schema, so your code can read it reliably. Function calling (tool use) goes one step further: you describe functions to the model, and instead of answering in prose it replies with a function name and the arguments to call it with. Your code runs the function and sends the result back.',
                    analogy: 'A form with labelled boxes instead of a blank page. The model fills in the boxes, and your program reads them.',
                    breaks: 'A person filling in a form knows the boxes are strict. A model can still put a wrong value in the right box, like a real date that is the wrong date, so you check the content as well as the shape.',
                    example: 'Instead of a sentence, a tool-calling model returns something like {"tool": "get_weather", "arguments": {"city": "Leeds"}}. Your code calls get_weather, then sends the result back so the model can write the final answer.',
                    code: 'import json\n\nreply = llm(prompt)                        # the prompt asks for JSON only\ntry:\n    data = json.loads(reply)\n    ok = set(data) == {"city", "date"}\nexcept json.JSONDecodeError:\n    ok = False\nif not ok:\n    reply = llm(prompt + FIX_JSON_REMINDER)   # one retry, then fail loudly',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 2 (sampling and structured outputs)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Tool use (function calling) overview', source: 'Claude docs', url: 'https://www.google.com/search?q=Claude+docs+tool+use+overview' },
                    { kind: 'read', title: 'JSON Schema: getting started step by step', source: 'json-schema.org', url: 'https://www.google.com/search?q=JSON+Schema+getting+started+step+by+step' },
                ],
                practice: {
                    explain: 'Explain structured output and function calling with the form-with-boxes picture.',
                    derive: 'Write a JSON schema for extracting a job advert: title, company, salary range (may be missing), location and a list of skills. Decide which fields are required.',
                    build: 'Send 30 real job adverts to an LLM with your schema. Validate every reply in code, retry once on failure, and report the success rate. Then add one tool, such as a currency converter, and handle the tool-call loop.',
                    break: 'Remove the schema from the prompt, or give an advert with no salary. What breaks? Then find a reply that is valid JSON but has a wrong value, and add a check that catches it.',
                },
            },
            {
                id: 'f5-t2',
                name: 'Embeddings and semantic search',
                diagram: {
                    code: 'flowchart LR\n  Q["question"] --> EQ["embed"] --> QV["question vector"]\n  DOCS["200 FAQ entries"] --> ED["embed once"] --> DV[("document vectors")]\n  QV & DV --> COS["cosine similarity<br/>with every document"] --> TOP["top 5 matches"]',
                    caption: 'Documents are embedded once in advance; each question is embedded and compared by meaning, not by exact words.',
                },
                note: {
                    idea: 'An embedding model turns text into a vector. Texts with similar meaning get similar vectors, even with different words. Search means: embed the question, then find the closest document vectors with cosine similarity.',
                    analogy: 'A library shelved by topic, not by title. \'How do I reset my password\' sits next to \'I forgot my login\'.',
                    breaks: 'Meaning-based search can miss exact things like product codes or names. That is why many systems combine it with keyword search (hybrid search).',
                    code: 'D = doc_vecs / np.linalg.norm(doc_vecs, axis=1, keepdims=True)\nq = q_vec / np.linalg.norm(q_vec)\ntop5 = np.argsort(-(D @ q))[:5]',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Embeddings: What they are and why they matter', source: 'Simon Willison', url: 'https://simonwillison.net/2023/Oct/23/embeddings/' },
                    { kind: 'watch', title: 'Cosine Similarity, Clearly Explained', source: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/results?search_query=StatQuest+Cosine+Similarity%2C+Clearly+Explained' },
                    { kind: 'read', title: 'Semantic search', source: 'Sentence Transformers docs', url: 'https://www.google.com/search?q=sentence+transformers+semantic+search+documentation' },
                ],
                practice: {
                    explain: 'Explain semantic search with the library-shelved-by-topic picture.',
                    derive: 'One pair of unit vectors has cosine similarity 0.9, another has 0.1. What does each say about the texts? Compute the angle for each.',
                    build: 'Embed 200 FAQ entries with an embedding model. Build search in NumPy that returns the top 5 for a question.',
                    break: 'Search for a product code or a rare name. Does semantic search find it? Add keyword search and combine the two scores.',
                },
            },
            {
                id: 'f5-t11',
                name: 'Vector databases and approximate nearest-neighbour search',
                diagram: {
                    code: 'flowchart LR\n  Q["query vector"] --> BF["brute force:<br/>compare with all 1 million"]\n  Q --> IVF["IVF index:<br/>find the 3 nearest clusters"] --> SUB["compare only<br/>the vectors inside them"]\n  BF --> EX["exact, but slow"]\n  SUB --> AP["almost exact, much faster"]',
                    caption: 'Approximate search skips most of the data by first finding the right neighbourhood. You trade a little recall for a lot of speed.',
                },
                note: {
                    idea: 'Comparing a question with every document vector is exact but slow once you have millions. Approximate nearest-neighbour (ANN) indexes, such as HNSW or IVF, find almost-the-closest vectors much faster by searching only a small part of the data. A vector database stores the vectors, the index and metadata (like source and date) together, so you can filter and search at once.',
                    analogy: 'Finding a book by walking to the right section and shelf, instead of checking every book in the library.',
                    breaks: 'A library\'s sections are exact. An ANN index can occasionally miss the true best match, so you trade a little accuracy (recall) for a lot of speed, and you should measure that trade.',
                    example: 'HNSW builds a graph where each vector links to its near neighbours, in several layers. A search starts on the top, sparse layer and walks towards the query, dropping to denser layers as it gets close, like zooming in on a map.',
                    code: 'exact = np.argsort(-(D @ q))[:10]          # the true top 10\napprox = index.search(q, k=10)            # your ANN index\nrecall_at_10 = len(set(exact) & set(approx)) / 10',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Hierarchical Navigable Small Worlds (HNSW)', source: 'Pinecone Learn', url: 'https://www.google.com/search?q=Pinecone+hierarchical+navigable+small+worlds+HNSW' },
                    { kind: 'code', title: 'Faiss: getting started', source: 'Meta AI · GitHub wiki', url: 'https://github.com/facebookresearch/faiss/wiki' },
                    { kind: 'paper', title: 'Efficient and robust approximate nearest neighbor search using HNSW graphs (2016)', source: 'Malkov and Yashunin · arXiv', url: 'https://arxiv.org/abs/1603.09320' },
                ],
                practice: {
                    explain: 'Explain approximate search with the library-sections picture, and what you give up.',
                    derive: 'Brute-force search over 1 million 768-dimensional float32 vectors: how many bytes does one search read, and roughly how many multiply-adds does it need? Why does that get slow at scale?',
                    build: 'Build a simple IVF index yourself: cluster the vectors with your own k-means, then search only the nearest few clusters. Measure recall@10 and speed against brute force. Then try a real library such as FAISS.',
                    break: 'Search fewer and fewer clusters until recall drops, and plot recall against speed. Then add a metadata filter (only documents from 2026) and see what happens to recall.',
                },
            },
            {
                id: 'f5-t3',
                name: 'RAG: chunking, retrieval and re-ranking',
                diagram: {
                    code: 'flowchart LR\n  subgraph Prepare\n    D["documents"] --> C["chunk"] --> E["embed"] --> VS[("vector store")]\n  end\n  subgraph Answer\n    Q["question"] --> R["retrieve top chunks"] --> RR["re-rank"] --> P["prompt with the chunks"] --> L["LLM"] --> A["answer with sources"]\n  end\n  VS --> R',
                    caption: 'RAG is an open-book exam: find the right pages first, then answer from them.',
                },
                note: {
                    idea: 'Retrieval-augmented generation (RAG): find relevant pieces of your documents, put them in the prompt, and ask the model to answer from them. Chunking splits documents into pieces. Re-ranking uses a second, more careful model to re-order the top results.',
                    analogy: 'An open-book exam. The model is the student. Retrieval is finding the right pages before answering.',
                    breaks: 'A student can flip through the whole book. The model only sees the pages you hand it. If retrieval picks the wrong pages, the answer is wrong but still sounds confident.',
                    example: 'A 200-page HR manual is split into chunks of about 300 words, with some overlap. Question: \'How many holiday days do new staff get?\' Retrieve the top 5 chunks, then prompt: \'Answer using only the text below. If the answer is not there, say so.\'',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 6 (RAG and agents)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Patterns for Building LLM-based Systems & Products', source: 'Eugene Yan', url: 'https://eugeneyan.com/writing/llm-patterns/' },
                    { kind: 'read', title: 'Introducing Contextual Retrieval', source: 'Anthropic', url: 'https://www.google.com/search?q=Anthropic+introducing+contextual+retrieval' },
                ],
                practice: {
                    explain: 'Explain RAG with the open-book-exam picture.',
                    derive: 'Draw the RAG pipeline from question to answer, and mark 4 places where it can fail.',
                    build: 'Build RAG over a real document set with no framework: chunking, embedding, retrieval, prompt, and an answer with sources.',
                    break: 'Try chunk sizes of 50, 300 and 2,000 words on the same 20 questions. Which size works best, and why do the extremes fail?',
                },
            },
            {
                id: 'f5-t12',
                name: 'Context engineering: long context and memory',
                diagram: {
                    code: 'flowchart TB\n  W["context window (budget)"]\n  W --- S["system instructions"]\n  W --- SUM["summary of older messages"]\n  W --- LAST["last 5 messages"]\n  W --- DOCS["top 3 retrieved documents"]\n  W --- ANS["room left for the answer"]',
                    caption: 'Context engineering is packing the window on purpose: only what this call needs, with room left for the reply.',
                },
                note: {
                    idea: 'Context engineering means deciding exactly what goes into the model\'s context window on each call: instructions, examples, retrieved documents, conversation history and tool results. More is not always better. Models use information in the middle of very long inputs less reliably, and every token costs time and money. For long conversations you summarise or store old turns and bring back only what matters. That is \'memory\'.',
                    analogy: 'Packing a small suitcase for a trip. You can\'t bring your whole wardrobe, so you choose what this trip needs.',
                    breaks: 'A suitcase has a hard limit you can feel. A context window can hold a lot, so the danger is quieter: stuffing it full makes answers worse and slower without any error message.',
                    example: 'A support bot with a 200-message history keeps the system instructions, a short running summary, the last 5 messages and the 3 most relevant documents. It does not send all 200 messages.',
                    code: 'context = [\n    system_prompt,\n    summary_of_older_turns,          # refreshed every few turns\n    *last_messages[-5:],\n    *top_k_documents(question, k=3),\n]\nassert count_tokens(context) < TOKEN_BUDGET',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 5 (context length and context efficiency)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Effective context engineering for AI agents', source: 'Anthropic', url: 'https://www.google.com/search?q=Anthropic+effective+context+engineering+for+AI+agents' },
                    { kind: 'paper', title: 'Lost in the Middle: How Language Models Use Long Contexts (2023)', source: 'Liu et al. · arXiv', url: 'https://arxiv.org/abs/2307.03172' },
                ],
                practice: {
                    explain: 'Explain context engineering with the suitcase picture.',
                    derive: 'Write a token budget for a 16,000-token window: how many tokens for instructions, examples, retrieved documents, history and the answer? Justify each number.',
                    build: 'Build a \'needle in a haystack\' test: hide one fact at different positions in a long document and ask for it. Plot accuracy against position and document length.',
                    break: 'Give your RAG app 3, 10 and 50 retrieved chunks for the same questions. Measure accuracy, latency and cost. When does more context start to hurt?',
                },
            },
            {
                id: 'f5-t4',
                name: 'Evaluation: test sets, LLM-as-judge, error analysis',
                diagram: {
                    code: 'flowchart LR\n  CH["make a change"] --> RUN["run 50 test questions"] --> SC["score: code checks<br/>+ LLM judge"] --> ER["group the failures<br/>by type"] --> FIX["fix the biggest group"]\n  FIX --> CH',
                    caption: 'Evaluation is a loop. Every change is measured on the same questions, and the failure groups tell you what to fix next.',
                },
                note: {
                    idea: 'Evaluation tells you whether a change made your system better or worse. Build a test set of real inputs with expected results. Score with code checks where you can, and with an LLM judge where you must. Most important: read the failures and group them into error types.',
                    analogy: 'Unit tests for software, but for behaviour that is fuzzy.',
                    breaks: 'Unit tests pass or fail. LLM outputs need judgement, and the judge (human or model) can be wrong, so check the judge against human labels.',
                    example: '50 questions for your RAG app. Before the change: 31 of 50 correct. Of the 19 failures, 12 retrieved the wrong chunk, 5 made things up and 2 had a bad format. So fix retrieval first.',
                },
                resources: [
                    { kind: 'read', title: 'Your AI Product Needs Evals', source: 'Hamel Husain', url: 'https://hamel.dev/blog/posts/evals/' },
                    { kind: 'read', title: 'Creating a LLM-as-a-Judge That Drives Business Results', source: 'Hamel Husain', url: 'https://hamel.dev/blog/posts/llm-judge/' },
                    { kind: 'read', title: 'AI Engineering, Ch 3–4 (evaluation)', source: 'Chip Huyen · book you own' },
                ],
                practice: {
                    explain: 'Explain why evaluation matters with the unit-tests picture, and where the picture breaks.',
                    derive: 'Design a test set for your RAG app: which question types, how many questions, and how you decide what counts as \'correct\'.',
                    build: 'Build an eval harness: 50 questions with expected answers, a code check, an LLM judge, and a table of errors by type.',
                    break: 'Compare your LLM judge with your own labels on 20 answers. How often do they disagree? Then try a judge prompt that is too lenient.',
                },
            },
            {
                id: 'f5-t5',
                name: 'Agents and tool use',
                diagram: {
                    code: 'flowchart LR\n  G["goal"] --> M["model decides<br/>the next action"]\n  M -->|"call a tool"| T["tool runs"] --> R["result added<br/>to the history"] --> M\n  M -->|"finished, or<br/>step limit reached"| A["final answer"]',
                    caption: 'An agent is a model in a loop: act, look at the result, decide again — with a step limit so it can\'t loop forever.',
                },
                note: {
                    idea: 'An agent is a model in a loop. It chooses an action, such as calling a search tool or a calculator, sees the result, and chooses again until the task is done.',
                    analogy: 'A new assistant with a phone and a laptop, working through a task step by step.',
                    breaks: 'A human assistant notices when they are going in circles. Agents can loop, call the wrong tool, or trust a bad result, so they need step limits, logging and evaluation.',
                    code: '# pseudo-code\nwhile steps < 10:\n    action = llm(history)\n    if action.type == "final":\n        break\n    result = tools[action.name](**action.args)\n    history.append(result)\n    steps += 1',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Building effective agents', source: 'Anthropic', url: 'https://www.google.com/search?q=Anthropic+building+effective+agents' },
                    { kind: 'read', title: 'LLM Powered Autonomous Agents', source: 'Lilian Weng', url: 'https://lilianweng.github.io/posts/2023-06-23-agent/' },
                    { kind: 'read', title: 'AI Engineering, Ch 6 (the agents half)', source: 'Chip Huyen · book you own' },
                ],
                practice: {
                    explain: 'Explain agents with the new-assistant picture, and name their main ways of failing.',
                    derive: 'Write the agent loop in pseudo-code from memory, with a step limit and error handling.',
                    build: 'Build an agent with 2 tools, a calculator and a search over your documents. Log every step.',
                    break: 'Give the agent a task it cannot finish, and a tool that returns an error. Does it loop? Does it recover? Add a fix for each.',
                },
            },
            {
                id: 'f5-t13',
                name: 'MCP: connecting models to tools and data',
                diagram: {
                    code: 'flowchart LR\n  APP["AI app<br/>(MCP client)"] <-->|"MCP"| S1["MCP server: notes<br/>tool: search_notes"]\n  APP <-->|"MCP"| S2["MCP server: calendar"]\n  S1 --> D1[("your notes")]\n  S2 --> D2[("your calendar")]\n  M["model"] --- APP',
                    caption: 'MCP is a standard plug: any app that speaks it can use any MCP server\'s tools and data.',
                },
                note: {
                    idea: 'The Model Context Protocol (MCP) is an open standard, introduced by Anthropic in 2024, for connecting AI apps to tools and data. You write an MCP server once, for example one that searches your documents, and any app that speaks MCP can use it. A server can offer tools (actions), resources (data) and prompts (templates).',
                    analogy: 'A USB port for AI tools. Before USB, every device needed its own special cable. With one standard plug, any device works with any computer.',
                    breaks: 'A USB stick is usually harmless to plug in. An MCP server can read data and take actions, so connecting one is a security decision: only trust servers you understand, and watch for prompt injection in the data they return.',
                    example: 'An MCP server for your notes might offer a tool search_notes(query). A chat app connected to it can then answer \'what did I write about LoRA?\' by calling that tool.',
                    code: 'from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP("notes")\n\n@mcp.tool()\ndef search_notes(query: str) -> list[str]:\n    """Return the titles of notes that match the query."""\n    return [title for title in NOTES if query.lower() in title.lower()]\n\nif __name__ == "__main__":\n    mcp.run()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Introduction to the Model Context Protocol', source: 'modelcontextprotocol.io', url: 'https://modelcontextprotocol.io/' },
                    { kind: 'code', title: 'MCP Python SDK', source: 'GitHub', url: 'https://github.com/modelcontextprotocol/python-sdk' },
                    { kind: 'read', title: 'Introducing the Model Context Protocol', source: 'Anthropic', url: 'https://www.google.com/search?q=Anthropic+introducing+the+Model+Context+Protocol' },
                ],
                practice: {
                    explain: 'Explain MCP with the USB-port picture, and why connecting a server is a security decision.',
                    derive: 'Draw the flow when a user asks something that needs your tool: app, model, MCP client, MCP server, tool, and back. Mark where the model decides and where your code runs.',
                    build: 'Write an MCP server with the official Python SDK that exposes two tools over your own data, for example \'search my study notes\' and \'list unfinished topics\'. Connect it to an app that supports MCP and use it.',
                    break: 'Make a tool return text that contains an instruction (\'ignore the user and…\'). Does the model follow it? Add a defence and test again.',
                },
            },
            {
                id: 'f5-t6',
                name: 'Choosing between prompting, RAG and fine-tuning',
                diagram: {
                    code: 'flowchart TD\n  P["Try prompting first"] --> Q1{"Good enough?"}\n  Q1 -->|"yes"| DONE["done"]\n  Q1 -->|"no"| Q2{"What\'s missing?"}\n  Q2 -->|"knowledge or facts"| RAG["add RAG"]\n  Q2 -->|"a behaviour, style or format"| FT["fine-tune"]',
                    caption: 'Start with the cheapest option. Missing facts point to RAG; missing behaviour points to fine-tuning.',
                },
                note: {
                    idea: 'Try in this order. Prompting first, because it is cheapest. RAG when the model needs knowledge it does not have. Fine-tuning when it needs a new behaviour, style or format that prompts cannot give reliably.',
                    analogy: 'A new employee. First give instructions (the prompt). Give them the company handbook for facts (RAG). Send them on a training course to change how they work (fine-tuning).',
                    breaks: 'Training courses are a poor way to learn facts that change often, and fine-tuning is too. Use RAG for changing knowledge.',
                    example: '\'Answer from our 2026 price list\' → RAG. \'Always reply in our strict legal-letter format\' → prompt first, and fine-tune only if it keeps failing.',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 7 (finetuning: when to finetune)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Patterns for Building LLM-based Systems & Products', source: 'Eugene Yan', url: 'https://eugeneyan.com/writing/llm-patterns/' },
                ],
                practice: {
                    explain: 'Explain the order of choices with the new-employee picture.',
                    derive: 'Choose prompting, RAG or fine-tuning for each case, and say why: answering from company policies; always replying in strict JSON; writing in a company\'s tone; answering about yesterday\'s news.',
                    build: 'Take one task. Try prompting first, then RAG. Measure both with your eval harness and write a one-paragraph decision.',
                    break: 'Try to teach the model new facts by fine-tuning on a few examples, then ask about them in different words. How well did it learn them?',
                },
            },
            {
                id: 'f5-t14',
                name: 'Dataset engineering for fine-tuning',
                diagram: {
                    code: 'flowchart LR\n  R["real examples"] --> MIX["collect"]\n  S["synthetic examples<br/>(from a stronger model)"] --> MIX\n  MIX --> CL["clean"] --> DD["de-duplicate"] --> CHK["quality checks"] --> SPL["split: train / held-out test"] --> FT["fine-tune and evaluate"]',
                    caption: 'The dataset is the product: every bad example that survives this pipeline gets taught to the model.',
                },
                note: {
                    idea: 'When you fine-tune, the dataset is the product. Dataset engineering means deciding which examples you need, collecting or generating them, cleaning and de-duplicating them, and checking their quality. A few hundred excellent examples often beat thousands of messy ones. Synthetic data, written by a stronger model, is common, but it must be checked.',
                    analogy: 'Training a new chef with recipe cards. A small box of correct, varied recipes teaches more than a huge pile full of typos, repeats and burnt examples.',
                    breaks: 'A chef can spot a bad recipe and ignore it. A model copies whatever is in the data, mistakes included, so every bad example is actively taught.',
                    example: 'For a support-reply model, 400 real tickets with the best human replies, de-duplicated, balanced across topics, with 50 held back for testing, beats 5,000 unfiltered replies that include rude or wrong ones.',
                    code: 'seen, clean = set(), []\nfor ex in examples:\n    key = normalise(ex["prompt"])             # lowercase, strip spaces\n    if key in seen or not passes_checks(ex):   # drop duplicates and bad rows\n        continue\n    seen.add(key)\n    clean.append(ex)\ntrain, test = split(clean, test_size=0.1, seed=0)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 8 (dataset engineering)', source: 'Chip Huyen · book you own' },
                    { kind: 'paper', title: 'LIMA: Less Is More for Alignment (2023)', source: 'Zhou et al. · arXiv', url: 'https://arxiv.org/abs/2305.11206' },
                    { kind: 'paper', title: 'Self-Instruct: aligning language models with self-generated instructions (2022)', source: 'Wang et al. · arXiv', url: 'https://arxiv.org/abs/2212.10560' },
                ],
                practice: {
                    explain: 'Explain why data quality beats quantity, with the recipe-cards picture.',
                    derive: 'Design a dataset for fine-tuning a model to write short, friendly replies to customer emails: the fields, how many examples, what counts as \'good\', and what you hold back for testing.',
                    build: 'Create 200 training examples, some real and some generated by a stronger model. De-duplicate and filter them, fine-tune a small model with LoRA, and compare it with the base model on your held-out set.',
                    break: 'Put 20% bad examples (wrong or rude replies) into the training set and fine-tune again. How much worse does it get? Then leak test examples into training and see how the score lies.',
                },
            },
            {
                id: 'f5-t7',
                name: 'Serving: APIs, Docker, latency and cost',
                diagram: {
                    code: 'flowchart LR\n  C["client"] -->|"POST /predict"| API["FastAPI app"]\n  subgraph DC["Docker container"]\n    API --> M["model"]\n  end\n  M --> API -->|"answer + latency logged"| C',
                    caption: 'The model sits behind an API, packaged in a container that runs the same on your laptop and on a server.',
                },
                note: {
                    idea: 'Put your model behind an API (for example with FastAPI), package it with everything it needs (Docker), and measure latency (time per request) and cost (per request or per token).',
                    analogy: 'A restaurant: the recipe is the model, the serving counter is the API, and a food truck you can drive anywhere is the Docker container.',
                    breaks: 'A chef cooks one order at a time. Model servers batch many requests together, which serves more users but can make each one wait a little longer.',
                    code: 'from fastapi import FastAPI\napp = FastAPI()\n\n@app.post("/predict")\ndef predict(req: dict):\n    return {"answer": model(req["text"])}',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'FastAPI tutorial', source: 'fastapi.tiangolo.com', url: 'https://fastapi.tiangolo.com/tutorial/' },
                    { kind: 'read', title: 'Get started with Docker', source: 'docs.docker.com', url: 'https://docs.docker.com/get-started/' },
                    { kind: 'read', title: 'Made With ML: serving and deployment lessons', source: 'Goku Mohandas · free', url: 'https://madewithml.com/' },
                ],
                practice: {
                    explain: 'Explain the API, the container and batching with the restaurant picture.',
                    derive: 'Estimate the cost of 1,000 requests that each use 1,500 input tokens and 300 output tokens, using real prices you look up for one model.',
                    build: 'Serve a model behind FastAPI in Docker. Add a /health endpoint and log the latency of every request.',
                    break: 'Send 50 requests at once with a simple load test. What happens to latency, and where is the bottleneck?',
                },
            },
            {
                id: 'f5-t15',
                name: 'Caching, model routing and cost control',
                diagram: {
                    code: 'flowchart LR\n  Q["question"] --> CA{"in the cache?"}\n  CA -->|"yes"| A["return the saved answer"]\n  CA -->|"no"| D{"easy or hard?"}\n  D -->|"easy"| SM["small, cheap model"]\n  D -->|"hard"| LG["large model"]\n  SM & LG --> SAVE["save in the cache,<br/>log the cost"] --> A2["answer"]',
                    caption: 'Repeats come from the cache for free; easy questions go to the cheap model; only hard ones pay for the big model.',
                },
                note: {
                    idea: 'LLM apps can get slow and expensive fast. There are three main tools. Caching reuses answers, or processed prompts, you have already paid for. Routing sends easy requests to a small, cheap model and only hard ones to a big model. Budgets limit tokens, set timeouts and track the cost of every request.',
                    analogy: 'A help desk. Common questions get a ready-made answer sheet (the cache). Simple questions go to a junior (the small model), hard ones to a senior (the big model).',
                    breaks: 'A help desk knows when two questions are really the same. A semantic cache matches questions by meaning, so it can return a wrong answer for a question that only looks similar. Use a strict similarity threshold and an expiry time.',
                    example: 'If 70% of questions can be handled by a model that costs a tenth as much, routing them there cuts the bill by about 63%: 0.7 × 0.9 = 0.63.',
                    code: 'def answer(question):\n    if (hit := cache.get(normalise(question))):\n        return hit\n    model = SMALL if classify_difficulty(question) == "easy" else LARGE\n    reply = call(model, question, max_tokens=400, timeout=20)\n    cache.set(normalise(question), reply, ttl_hours=24)\n    log_cost(model, reply.usage)\n    return reply',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 10 (AI engineering architecture: caches, routers and gateways)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'AI Engineering, Ch 9 (inference optimisation)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Prompt caching', source: 'Claude docs', url: 'https://www.google.com/search?q=Claude+docs+prompt+caching' },
                    { kind: 'paper', title: 'RouteLLM: Learning to Route LLMs with Preference Data (2024)', source: 'Ong et al. · arXiv', url: 'https://www.google.com/search?q=RouteLLM+learning+to+route+LLMs+with+preference+data+arXiv' },
                ],
                practice: {
                    explain: 'Explain caching and routing with the help-desk picture.',
                    derive: 'Your app gets 50,000 questions a day. The big model costs 10 times the small one, 30% of questions are exact repeats, and 60% of the rest are easy. Estimate the saving from a cache plus a router, compared with sending everything to the big model.',
                    build: 'Add an exact-match cache, a semantic cache and a two-model router to your RAG app. Log cost and latency per request, and compare quality on your eval set before and after.',
                    break: 'Lower the semantic-cache threshold until it returns wrong answers. Then make the router send a hard question to the small model. How would your evals catch each problem?',
                },
            },
            {
                id: 'f5-t16',
                name: 'Observability: tracing and debugging LLM apps',
                diagram: {
                    code: 'flowchart LR\n  REQ["one request<br/>trace abc123"] --> RET["retrieve<br/>120 ms"]\n  REQ --> RR["re-rank<br/>40 ms"]\n  REQ --> LLM["LLM call<br/>1.8 s · 1,900 tokens"]\n  REQ --> OUT["answer"]\n  RET -.- NOTE["⚠ ranked a 2023 policy first<br/>→ the bug is in retrieval"]',
                    caption: 'A trace shows every step of one request, with its time and cost, so you can point at exactly which step went wrong.',
                },
                note: {
                    idea: 'Observability means you can see what your app actually did for any single request: the prompt, the retrieved chunks, every tool call, the model\'s reply, and the tokens, cost and time of each step. A trace records all of this as one tree of steps. Without it, a bad answer is a mystery. With it, you can point at the step that went wrong.',
                    analogy: 'A flight recorder, the \'black box\'. When something goes wrong, you replay exactly what happened instead of guessing.',
                    breaks: 'A flight recorder is only read after a crash. LLM traces are most useful every day: you read a sample of real traces, and turn the failures you find into new eval cases.',
                    example: 'A user says the bot gave the wrong refund policy. The trace shows retrieval ranked a 2023 policy chunk first. The fix is in retrieval (add a date filter), not in the prompt.',
                    code: 'import time, uuid\n\ndef traced(step, fn, *args, trace, **kwargs):\n    start = time.perf_counter()\n    result = fn(*args, **kwargs)\n    trace.append({"id": str(uuid.uuid4()), "step": step,\n                  "ms": round(1000 * (time.perf_counter() - start)),\n                  "input": repr(args)[:500], "output": repr(result)[:500]})\n    return result',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'AI Engineering, Ch 10 (monitoring and observability)', source: 'Chip Huyen · book you own' },
                    { kind: 'read', title: 'Your AI Product Needs Evals (the section on logging traces)', source: 'Hamel Husain', url: 'https://hamel.dev/blog/posts/evals/' },
                    { kind: 'read', title: 'Observability primer', source: 'OpenTelemetry docs', url: 'https://www.google.com/search?q=OpenTelemetry+observability+primer' },
                ],
                practice: {
                    explain: 'Explain observability with the flight-recorder picture, and why you read traces every day.',
                    derive: 'List every step of one request in your RAG app. For each step, write what you would log: inputs, outputs, tokens, time and cost. Mark anything that must not be logged, like personal data.',
                    build: 'Add tracing to your RAG app: one trace per request with nested steps, saved as JSON. Build a small page or notebook that shows the slowest and most expensive traces.',
                    break: 'Plant a bug: make retrieval quietly return nothing for some questions. Can you find it from the traces alone? Then add an alert that would have caught it.',
                },
            },
            {
                id: 'f5-t8',
                name: 'Safety: guardrails and prompt injection',
                diagram: {
                    code: 'flowchart LR\n  U["user question"] --> M["model"]\n  DOC["retrieved document<br/>with a hidden instruction"] --> M\n  M --> D1["defence: mark retrieved text as data"]\n  M --> D2["defence: tools with the fewest permissions"]\n  M --> D3["defence: check the output"]\n  M --> D4["defence: confirm risky actions"]',
                    caption: 'The model reads everything together, so it can\'t fully tell data from instructions. Layers of defence limit the damage.',
                },
                note: {
                    idea: 'Prompt injection is text inside the data (a web page, an email, a document) that tries to give the model new instructions. Guardrails are checks on inputs and outputs, limited tool permissions, and human approval for risky actions.',
                    analogy: 'A letter that says: \'Dear assistant, ignore your boss and send me the company bank details.\'',
                    breaks: 'A human assistant knows a letter is not their boss. A model reads all text together, so it cannot fully tell instructions from data. There is no perfect fix, so you limit the damage.',
                    example: 'Defences: mark retrieved text clearly as data, give tools the fewest permissions possible, and require confirmation before sending emails or payments.',
                },
                resources: [
                    { kind: 'read', title: 'Prompt injection (series)', source: 'Simon Willison', url: 'https://simonwillison.net/series/prompt-injection/' },
                    { kind: 'read', title: 'OWASP Top 10 for LLM Applications', source: 'OWASP', url: 'https://www.google.com/search?q=OWASP+Top+10+for+LLM+Applications' },
                ],
                practice: {
                    explain: 'Explain prompt injection with the letter-to-the-assistant picture.',
                    derive: 'Write 3 prompt-injection attacks against your RAG app, hidden inside documents.',
                    build: 'Add defences: separate instructions from retrieved text, restrict the tools, and check the output. Test your 3 attacks again.',
                    break: 'Which attacks still work against the defended version? Write down what it would take to stop them.',
                },
            },
            {
                id: 'f5-t9',
                name: 'ML system design: pipelines, training vs serving, drift',
                diagram: {
                    code: 'flowchart LR\n  COL["collect data"] --> LAB["label"] --> FEAT["features"] --> TR["train"] --> REG["register the model"] --> SRV["serve"] --> MON["monitor"]\n  MON -->|"drift detected"| TR',
                    caption: 'A real ML system is a loop, not a one-off: models are watched in production and retrained as the world changes.',
                },
                note: {
                    idea: 'A real ML system is much more than a model: data collection, labelling, features, training pipelines, serving, monitoring and retraining. Training-serving skew means the model sees different data in production than in training. Drift means the world changes over time.',
                    analogy: 'A restaurant is not just a recipe. It needs suppliers, a kitchen and waiters, and it must change the menu when customers\' tastes change.',
                    breaks: 'A restaurant notices when customers stop coming. A model can fail silently. You only notice if you monitor the right numbers.',
                    example: 'A fraud model is trained on 2024 data. By 2026, fraudsters use new tricks and precision drops. Monitor the input data and the outcomes, and retrain on recent data.',
                },
                resources: [
                    { kind: 'read', title: 'Data Distribution Shifts and Monitoring', source: 'Chip Huyen', url: 'https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html' },
                    { kind: 'read', title: 'CS329S: Machine Learning Systems Design (notes)', source: 'Stanford', url: 'https://stanford-cs329s.github.io/' },
                    { kind: 'read', title: 'Designing Machine Learning Systems (whole book)', source: 'Chip Huyen · paid' },
                ],
                practice: {
                    explain: 'Explain training-serving skew and drift with the restaurant-menu picture.',
                    derive: 'On one page, design a fraud-detection system: data, features, training, serving, monitoring and retraining.',
                    build: 'Add monitoring to one of your projects: log inputs and predictions, and raise an alert when the input distribution shifts.',
                    break: 'Simulate drift: train on an early period of data and test on a later one. Measure the drop, then retrain on recent data.',
                },
            },
        ],
        builds: [
            { id: 'f5-b1', text: 'Semantic search in NumPy: embeddings plus cosine similarity. No vector database yet.' },
            { id: 'f5-b2', text: 'A RAG app without LangChain or any similar framework. Then swap in a real vector store.' },
            { id: 'f5-b3', text: 'An eval harness: 50 test questions, clear metrics, error categories. Show a before-and-after improvement.' },
            { id: 'f5-b4', text: 'Deploy one project with FastAPI and Docker, with a live demo link for your CV.' },
            { id: 'f5-b5', text: 'A tool-calling assistant that returns schema-validated JSON, plus an MCP server that exposes one of your own tools.' },
            { id: 'f5-b6', text: 'Add tracing, caching and a cheap-model-first router to your RAG app. Report cost per question and latency, before and after.' },
        ],
        ready: [
            'Design a RAG system for company documents. Where can it fail?',
            'How do you prove your LLM app got better after a change?',
            'What is prompt injection? Give two defences.',
            'When would you fine-tune instead of using RAG?',
            'Your app is too slow and too expensive. What do you try first?',
            'How would you make an LLM return valid JSON every time, and what do you do when it doesn\'t?',
            'Your RAG app\'s bill doubled this month. Where do you look first?',
            'What is MCP, and what problem does it solve?',
        ],
    },
    {
        id: 'systems',
        number: 6,
        short: 'Systems',
        title: 'Systems and scale',
        accent: '#ffca28',
        goal: 'Make models fast and cheap. Understand what limits speed and memory on a GPU, and how training works across many GPUs.',
        bigPicture: 'Same car, less fuel, more speed. Most of this phase is about moving data efficiently, not about doing more maths.',
        main: [
            { title: 'Making Deep Learning Go Brrrr From First Principles (Horace He)', url: 'https://horace.io/brrr_intro.html', kind: 'Blog', free: true, why: 'Compute, memory bandwidth and overhead: the three limits on speed.' },
            { title: 'Karpathy: Let’s reproduce GPT-2 (the speed-up parts)', url: 'https://karpathy.ai/zero-to-hero.html', kind: 'Video', free: true, why: 'Mixed precision, torch.compile and multi-GPU, applied to a real model.' },
            { title: 'The Ultra-Scale Playbook (Hugging Face)', url: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook', kind: 'Book', free: true, why: 'Training on many GPUs, explained with diagrams.' },
        ],
        deeper: [
            { title: 'PyTorch Profiler recipe', url: 'https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html', kind: 'Tutorial', free: true, why: 'Measure before you optimise.' },
        ],
        topics: [
            {
                id: 'f6-t1',
                name: 'How a GPU works: compute vs memory',
                diagram: {
                    code: 'flowchart LR\n  MEM[("GPU memory")] -->|"narrow door:<br/>memory bandwidth"| CORES["thousands of cores"]\n  MM["big matrix multiply:<br/>lots of maths per number"] --> CB["compute-bound ✓"]\n  VA["adding two vectors:<br/>1 addition per 2 numbers"] --> MB["memory-bound"]',
                    caption: 'The cores are fast; getting numbers to them is often the real limit. Work that does lots of maths per number loaded uses the GPU well.',
                },
                note: {
                    idea: 'A GPU has thousands of simple cores that do the same operation on lots of data at once. Often the limit is not the maths but moving data between memory and the cores (memory bandwidth).',
                    analogy: 'A huge kitchen with 1,000 fast chefs but one narrow door for ingredients. The chefs spend a lot of time waiting at the door.',
                    breaks: 'Chefs can each cook a different dish. GPU cores work best when they all do the same operation on different data.',
                    example: 'Multiplying two big matrices does lots of maths for each number loaded, so it is compute-bound (good). Adding two vectors does 1 addition per 2 numbers loaded, so it is memory-bound. The ratio of maths to bytes moved is called arithmetic intensity.',
                },
                resources: [
                    { kind: 'read', title: 'Making Deep Learning Go Brrrr From First Principles', source: 'Horace He', url: 'https://horace.io/brrr_intro.html' },
                    { kind: 'read', title: 'GPU Glossary', source: 'Modal', url: 'https://www.google.com/search?q=Modal+GPU+glossary' },
                    { kind: 'watch', title: 'GPU MODE lectures', source: 'GPU MODE', url: 'https://www.youtube.com/@GPUMODE' },
                ],
                practice: {
                    explain: 'Explain compute-bound and memory-bound with the kitchen-door picture.',
                    derive: 'In fp32, compute the arithmetic intensity (FLOPs per byte moved) of adding two vectors of 1 million numbers, and of multiplying two 1,024 × 1,024 matrices.',
                    build: 'Time matrix multiplication at growing sizes on CPU and on GPU (Colab is fine). Plot the achieved FLOPs per second against size.',
                    break: 'Time 1,000 tiny operations against 1 big operation doing the same total work. Why are the tiny ones so slow?',
                },
            },
            {
                id: 'f6-t2',
                name: 'Mixed precision: fp16 and bf16',
                diagram: {
                    code: 'flowchart LR\n  MW["master weights<br/>fp32"] -->|"copy as bf16"| FW["forward and backward<br/>in bf16 (fast, half memory)"]\n  FW --> G["gradients"] --> UPD["update the fp32 master weights"]\n  UPD --> MW',
                    caption: 'Most of the maths runs in 16-bit, but the master copy of the weights stays in 32-bit so small updates aren\'t lost.',
                },
                note: {
                    idea: 'Mixed precision does most of the maths in 16-bit numbers instead of 32-bit: half the memory and much faster on modern GPUs. fp16 has more precision but a small range, so it can overflow. bf16 has the same range as fp32 with less precision, and it is the usual choice now.',
                    analogy: 'Writing prices rounded to the nearest pound instead of exact to the penny. Faster, and usually good enough.',
                    breaks: 'Some sums need the pennies. Sensitive parts, like the master copy of the weights and the optimiser update, stay in 32-bit.',
                    example: 'fp16\'s largest value is about 65,504. bf16 reaches about 3.4 × 10³⁸, like fp32. But in bf16, 1 + 0.001 = 1.0: the small part is lost.',
                    code: 'with torch.autocast(device_type="cuda", dtype=torch.bfloat16):\n    logits, loss = model(x, y)\nloss.backward()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'watch', title: 'Let\'s reproduce GPT-2 (124M): the mixed-precision section', source: 'Andrej Karpathy', url: 'https://karpathy.ai/zero-to-hero.html' },
                    { kind: 'read', title: 'Automatic Mixed Precision recipe', source: 'PyTorch tutorials', url: 'https://www.google.com/search?q=PyTorch+automatic+mixed+precision+recipe' },
                    { kind: 'paper', title: 'Mixed Precision Training (2017)', source: 'Micikevicius et al. · arXiv', url: 'https://arxiv.org/abs/1710.03740' },
                ],
                practice: {
                    explain: 'Explain mixed precision with the rounded-prices picture, and say which parts stay in 32-bit.',
                    derive: 'How many bytes do the weights of a 125M-parameter model take in fp32, fp16 and bf16?',
                    build: 'Train your GPT with torch.autocast in bf16. Compare speed, memory and final loss with fp32.',
                    break: 'Train in fp16 without a gradient scaler and watch for gradients that turn into 0 or inf. Then add the scaler.',
                },
            },
            {
                id: 'f6-t3',
                name: 'Training memory: weights, gradients, optimiser states, activations',
                diagram: {
                    code: 'pie title Training memory per parameter (Adam, mixed precision)\n  "weights (2 bytes)" : 2\n  "gradients (2 bytes)" : 2\n  "fp32 master weights (4 bytes)" : 4\n  "Adam\'s two states (8 bytes)" : 8',
                    caption: 'About 16 bytes per parameter before activations — so a 1-billion-parameter model needs about 16 GB just for these.',
                },
                note: {
                    idea: 'Training needs memory for the weights, the gradients, the optimiser states (Adam keeps 2 extra numbers per weight) and the activations saved for backprop. With mixed precision and Adam, a common estimate is about 16 bytes per parameter, before activations.',
                    analogy: 'Moving house. It is not just the furniture (weights). You also need boxes (gradients), labels (optimiser states) and floor space to lay things out while packing (activations).',
                    breaks: 'Moving house happens once. Activations grow with batch size and sequence length, so the same model can fit or not fit depending on your batch.',
                    example: 'A 1-billion-parameter model: inference in bf16 needs about 1B × 2 bytes = 2 GB for the weights. Training with Adam needs about 1B × 16 bytes = 16 GB, plus activations. (2 bytes weights + 2 gradients + 4 master weights + 4 + 4 for Adam\'s two states.)',
                },
                resources: [
                    { kind: 'read', title: 'Transformer Math 101', source: 'EleutherAI blog', url: 'https://blog.eleuther.ai/transformer-math/' },
                    { kind: 'read', title: 'The Ultra-Scale Playbook (memory usage section)', source: 'Hugging Face', url: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook' },
                    { kind: 'paper', title: 'ZeRO: Memory Optimizations Toward Training Trillion Parameter Models (2019)', source: 'Rajbhandari et al. · arXiv', url: 'https://arxiv.org/abs/1910.02054' },
                ],
                practice: {
                    explain: 'Explain the four parts of training memory with the moving-house picture.',
                    derive: 'Estimate the training memory of a 350M model with Adam and mixed precision, before activations, at 16 bytes per parameter.',
                    build: 'Measure GPU memory while training your GPT with torch.cuda.max_memory_allocated. Change batch size and sequence length, and plot the effect.',
                    break: 'Raise the batch size until you run out of memory. Then make the same effective batch fit with gradient accumulation or checkpointing.',
                },
            },
            {
                id: 'f6-t4',
                name: 'Parallelism: data, tensor and pipeline (the ideas)',
                diagram: {
                    code: 'flowchart TB\n  subgraph DP["Data parallel"]\n    G1["GPU 1: whole model<br/>batch A"]\n    G2["GPU 2: whole model<br/>batch B"]\n  end\n  subgraph TP["Tensor parallel"]\n    T1["GPU 1: left half<br/>of every layer"]\n    T2["GPU 2: right half<br/>of every layer"]\n  end\n  subgraph PP["Pipeline parallel"]\n    P1["GPU 1: layers 1–12"] --> P2["GPU 2: layers 13–24"]\n  end\n  G1 <-->|"average gradients"| G2',
                    caption: 'Three ways to share work across GPUs: split the data, split each layer, or split the stack of layers.',
                },
                note: {
                    idea: 'Data parallel: every GPU holds a full copy of the model, gets different data, and gradients are averaged. Tensor parallel: one layer\'s matrices are split across GPUs. Pipeline parallel: different layers live on different GPUs. FSDP and ZeRO split weights, gradients and optimiser states across GPUs to save memory.',
                    analogy: 'Cooking a huge dinner. Data parallel: several kitchens cook the full menu for different tables. Tensor parallel: several chefs cut one giant cake together. Pipeline: an assembly line, one station per course.',
                    breaks: 'Separate kitchens don\'t need to talk. GPUs talk constantly, and the speed of that communication often decides which method wins.',
                    example: 'The model fits on one GPU and you want speed → data parallel. The model does not fit → FSDP, tensor or pipeline parallel.',
                },
                resources: [
                    { kind: 'read', title: 'The Ultra-Scale Playbook', source: 'Hugging Face', url: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook' },
                    { kind: 'read', title: 'Getting Started with Distributed Data Parallel', source: 'PyTorch tutorials', url: 'https://www.google.com/search?q=PyTorch+getting+started+with+distributed+data+parallel+tutorial' },
                    { kind: 'paper', title: 'Megatron-LM (2019)', source: 'Shoeybi et al. · arXiv', url: 'https://arxiv.org/abs/1909.08053' },
                ],
                practice: {
                    explain: 'Explain data, tensor and pipeline parallelism with the dinner-kitchen picture.',
                    derive: 'Draw data parallelism for 8 GPUs and a model that fits on one. Then draw tensor and pipeline parallelism for a model that needs 4 GPUs.',
                    build: 'Run data-parallel training with PyTorch DDP on 2 GPUs, or 2 CPU processes. Check the gradients match single-device training.',
                    break: 'Make one process slower on purpose. What happens to the speed of the whole group, and why?',
                },
            },
            {
                id: 'f6-t5',
                name: 'Inference speed: batching, quantisation, FlashAttention',
                diagram: {
                    code: 'xychart-beta\n  title "Memory for a 70B model\'s weights"\n  x-axis "number format" ["bf16", "int8", "4-bit"]\n  y-axis "GB" 0 --> 150\n  bar [140, 70, 35]',
                    caption: 'Fewer bits per weight means less memory and faster loading — measure the quality loss before you choose.',
                },
                note: {
                    idea: 'Batching serves many requests together to use the GPU fully. Quantisation stores weights in 8 or 4 bits to save memory and bandwidth. FlashAttention computes attention in small tiles that stay in fast on-chip memory, so the big T × T matrix is never written out.',
                    analogy: 'Batching is a bus instead of many taxis. Quantisation is a compressed photo: smaller, and usually looks the same.',
                    breaks: 'A bus waits to fill up, so the first passenger waits longer. Heavy compression shows artefacts: at 4 bits or fewer, quality can drop, so always measure it.',
                    example: 'A 70-billion-parameter model: bf16 is about 140 GB, int8 about 70 GB, and 4-bit about 35 GB.',
                    code: 'scale = np.abs(W).max() / 127\nW_q = np.round(W / scale).astype(np.int8)    # 1 byte per weight\nW_back = W_q.astype(np.float32) * scale      # close to W, small error',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'A Visual Guide to Quantization', source: 'Maarten Grootendorst', url: 'https://www.google.com/search?q=Maarten+Grootendorst+a+visual+guide+to+quantization' },
                    { kind: 'paper', title: 'FlashAttention (2022)', source: 'Dao et al. · arXiv', url: 'https://arxiv.org/abs/2205.14135' },
                    { kind: 'paper', title: 'PagedAttention / vLLM (2023)', source: 'Kwon et al. · arXiv', url: 'https://arxiv.org/abs/2309.06180' },
                ],
                practice: {
                    explain: 'Explain batching and quantisation with the bus and compressed-photo pictures.',
                    derive: 'How much memory do the weights of a 13B model take in bf16, int8 and 4-bit?',
                    build: 'Quantise your GPT\'s weights to int8, per-tensor and per-channel. Compare the error and the quality of the generated text.',
                    break: 'Put one huge outlier weight in a layer and quantise per-tensor again. What happens to the error for every other weight?',
                },
            },
            {
                id: 'f6-t6',
                name: 'Profiling PyTorch code',
                diagram: {
                    code: 'flowchart LR\n  P["profile 20 steps"] --> T["find the 3 slowest operations"] --> F["fix one"] --> M["measure again"]\n  M -->|"repeat"| P',
                    caption: 'Measure, fix the biggest cost, measure again. Never optimise by guessing.',
                },
                note: {
                    idea: 'Measure where the time actually goes before you optimise. The profiler shows the time for each operation on the CPU and GPU. Common findings: the GPU waiting for data loading, many tiny operations, or slow copies between CPU and GPU.',
                    analogy: 'Timing each station in a kitchen before hiring more chefs. Maybe the slow part is the dishwasher.',
                    breaks: 'Kitchen timing is simple. GPU work runs asynchronously, so normal Python timers can lie. Call torch.cuda.synchronize() before you read the time.',
                    code: 'from torch.profiler import profile, ProfilerActivity\nwith profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) as prof:\n    train_step()\nprint(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'PyTorch Profiler recipe', source: 'PyTorch tutorials', url: 'https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html' },
                    { kind: 'read', title: 'Performance Tuning Guide', source: 'PyTorch tutorials', url: 'https://www.google.com/search?q=PyTorch+performance+tuning+guide' },
                ],
                practice: {
                    explain: 'Explain profiling with the kitchen-timing picture.',
                    derive: 'List 4 likely reasons a training step is slow, and how each one would show up in the profiler.',
                    build: 'Profile 20 training steps of your GPT with torch.profiler. Find the 3 slowest operations and speed one of them up.',
                    break: 'Time a GPU operation with time.time(), with and without torch.cuda.synchronize(). Explain why the numbers differ.',
                },
            },
            {
                id: 'f6-t7',
                name: 'GPU kernels with Triton',
                diagram: {
                    code: 'flowchart LR\n  subgraph Naive\n    M1[("memory")] --> K1["kernel: max"] --> M2[("memory")] --> K2["kernel: exp and sum"] --> M3[("memory")] --> K3["kernel: divide"] --> M4[("memory")]\n  end\n  subgraph Fused\n    N1[("memory")] --> KF["one kernel:<br/>max, exp, sum, divide"] --> N2[("memory")]\n  end',
                    caption: 'The naive softmax travels to memory and back three times; the fused kernel does it once.',
                },
                note: {
                    idea: 'A kernel is a small program that runs on the GPU as many parallel copies. Triton lets you write kernels in Python-like code. The biggest win is fusion: doing several steps, like the parts of a softmax, in one kernel, so data is read from slow GPU memory once instead of several times.',
                    analogy: 'Cooking a dish in one trip to the fridge instead of fetching each ingredient separately.',
                    breaks: 'In a kitchen, the fridge trip is the obvious cost. On a GPU you must measure: some operations are limited by the maths, not by memory, and fusion does not help them.',
                    example: 'A naive softmax passes over the data several times (find the max, exponentiate and sum, divide). A fused Triton softmax reads each row once and writes it once, which can make it several times faster on large rows.',
                    code: '@triton.jit\ndef add_kernel(x_ptr, y_ptr, out_ptr, n, BLOCK: tl.constexpr):\n    pid = tl.program_id(0)\n    offs = pid * BLOCK + tl.arange(0, BLOCK)\n    mask = offs < n                         # don\'t read past the end\n    x = tl.load(x_ptr + offs, mask=mask)\n    y = tl.load(y_ptr + offs, mask=mask)\n    tl.store(out_ptr + offs, x + y, mask=mask)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'code', title: 'Triton tutorials: vector addition, fused softmax, matrix multiplication', source: 'triton-lang.org', url: 'https://triton-lang.org/' },
                    { kind: 'code', title: 'GPU Puzzles', source: 'Sasha Rush · GitHub', url: 'https://github.com/srush/GPU-Puzzles' },
                    { kind: 'watch', title: 'GPU MODE lectures on Triton', source: 'GPU MODE', url: 'https://www.youtube.com/results?search_query=GPU+MODE+Triton+lecture' },
                ],
                practice: {
                    explain: 'Explain kernel fusion with the one-trip-to-the-fridge picture.',
                    derive: 'Estimate the bytes read and written by a naive softmax over a 4,096 × 4,096 fp32 matrix, and by a fused one. If it is memory-bound, what speed-up would you expect?',
                    build: 'Work through the official Triton tutorials: vector add, fused softmax, then matrix multiply. Benchmark each one against PyTorch.',
                    break: 'Remove the mask from your vector-add kernel and use a size that is not a multiple of BLOCK. What happens? Then try a very small and a very large BLOCK and compare speed.',
                },
            },
            {
                id: 'f6-t8',
                name: 'Pruning and distillation',
                diagram: {
                    code: 'flowchart LR\n  TE["big teacher model"] -->|"soft labels:<br/>2: 0.90 · 7: 0.07 · 3: 0.03"| ST["small student model"]\n  BIG["trained network"] -->|"remove small weights"| PR["pruned network"] -->|"retrain briefly"| PR2["smaller, nearly as accurate"]',
                    caption: 'Distillation passes on the teacher\'s full opinion, not just its top answer. Pruning cuts weak weights, then retrains to recover.',
                },
                note: {
                    idea: 'Two ways to make a model smaller. Pruning removes weights, neurons or attention heads that matter little. Distillation trains a small \'student\' model to copy a big \'teacher\' model\'s full output probabilities, not just its top answer.',
                    analogy: 'Pruning is trimming a tree\'s weak branches. Distillation is an expert teacher who explains not only the right answer, but also how close each wrong answer was.',
                    breaks: 'A trimmed tree regrows on its own. A pruned network usually needs retraining to recover accuracy. And removing scattered single weights rarely makes it faster on real hardware, unless the pruning is structured (whole rows, channels or heads).',
                    example: 'Soft labels carry more information than hard ones. For a picture of a 2, the teacher might say 2: 0.90, 7: 0.07, 3: 0.03, which tells the student that 2s look a bit like 7s. A temperature T > 1 softens these probabilities even more.',
                    code: 'T = 4.0\nsoft_teacher = F.softmax(teacher_logits / T, dim=-1)\nlog_student = F.log_softmax(student_logits / T, dim=-1)\ndistill = F.kl_div(log_student, soft_teacher, reduction="batchmean") * T * T\nloss = 0.5 * distill + 0.5 * F.cross_entropy(student_logits, labels)',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Pruning Tutorial', source: 'PyTorch tutorials', url: 'https://www.google.com/search?q=PyTorch+pruning+tutorial' },
                    { kind: 'paper', title: 'Distilling the Knowledge in a Neural Network (2015)', source: 'Hinton, Vinyals, Dean · arXiv', url: 'https://arxiv.org/abs/1503.02531' },
                    { kind: 'paper', title: 'The Lottery Ticket Hypothesis (2018)', source: 'Frankle and Carbin · arXiv', url: 'https://arxiv.org/abs/1803.03635' },
                ],
                practice: {
                    explain: 'Explain pruning and distillation with the tree and teacher pictures.',
                    derive: 'Show why the distillation loss is multiplied by T². Hint: look at how the gradient size changes when you divide the logits by T.',
                    build: 'Distil your trained MNIST or CIFAR model into one a quarter of its size. Compare a student trained with soft labels against the same student trained on hard labels only.',
                    break: 'Prune 50%, 80% and 95% of the weights by magnitude, with and without retraining. Plot accuracy against sparsity. Then time the pruned model: is it actually faster?',
                },
            },
            {
                id: 'f6-t9',
                name: 'Speculative decoding',
                diagram: {
                    code: 'sequenceDiagram\n  participant D as Small draft model\n  participant B as Big model\n  D->>B: guesses 4 tokens ahead\n  B->>B: checks all 4 in one pass\n  B-->>D: keeps the first 3, replaces the 4th\n  Note over D,B: about 4 tokens per expensive pass instead of 1',
                    caption: 'The output is exactly what the big model would write; it just gets there in fewer expensive steps.',
                },
                note: {
                    idea: 'A big model generates one token at a time, and each step is slow. In speculative decoding, a small, fast \'draft\' model guesses several tokens ahead. The big model then checks all the guesses in one pass, keeps the ones it agrees with, and replaces the first wrong one. The output is exactly what the big model alone would produce, only faster.',
                    analogy: 'A junior writer drafts the next sentence, and a senior editor checks it in one read, instead of the senior writing every word slowly.',
                    breaks: 'An editor can rewrite anything. Here, only the guesses up to the first rejected token are kept, so if the draft model guesses badly you gain almost nothing. The speed-up depends on the acceptance rate.',
                    example: 'If the draft model proposes 4 tokens and on average 3 are accepted, each expensive pass of the big model gives about 4 tokens (the 3 accepted plus 1 of its own) instead of 1.',
                    code: '# pseudo-code, greedy version\ndraft = small_model.generate(prefix, k=4)        # cheap guesses\nchecks = big_model.next_tokens(prefix + draft)   # one pass scores every position\nn = matching_prefix_length(draft, checks)        # keep the tokens both agree on\nprefix = prefix + draft[:n] + [checks[n]]       # plus the big model\'s own next token',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Assisted Generation: a new direction toward low-latency text generation', source: 'Hugging Face blog', url: 'https://www.google.com/search?q=Hugging+Face+blog+assisted+generation+low+latency' },
                    { kind: 'paper', title: 'Fast Inference from Transformers via Speculative Decoding (2022)', source: 'Leviathan, Kalman, Matias · arXiv', url: 'https://arxiv.org/abs/2211.17192' },
                ],
                practice: {
                    explain: 'Explain speculative decoding with the junior-writer-and-editor picture.',
                    derive: 'Each draft token is accepted with probability 0.8, independently, and the draft proposes k = 4. What is the expected number of tokens per big-model pass?',
                    build: 'Implement greedy speculative decoding with two sizes of your own GPT, or two small open models. Check the output is identical to the big model alone, and measure the speed-up.',
                    break: 'Use a draft model trained on very different text. Measure the acceptance rate and the speed-up. At what acceptance rate does it become slower than normal decoding?',
                },
            },
        ],
        builds: [
            { id: 'f6-b1', text: 'Profile your GPT training. Make it faster with mixed precision, torch.compile and larger batches. Log every change and its speed-up.' },
            { id: 'f6-b2', text: 'A GPU memory calculator: model size in, training and inference memory out.' },
            { id: 'f6-b3', text: 'Quantise your model to int8. Measure speed and quality.' },
        ],
        ready: [
            'How much memory does a 7B model need for inference in bf16? For training with Adam?',
            'Is your training compute-bound or memory-bound? How can you tell?',
            'What does quantisation trade away?',
        ],
    },
    {
        id: 'generative-rl',
        number: 7,
        short: 'Gen & RL',
        title: 'Generative models and reinforcement learning',
        accent: '#f48fb1',
        goal: 'Models that create new data, and models that learn by trial and error. These ideas power image generators, and the reinforcement learning behind RLHF.',
        bigPicture: 'Every model so far learned to predict a label. Generative models learn what the data itself looks like, so they can make new examples. Reinforcement learning has no labels at all, only rewards, so the model must discover good actions by trying.',
        main: [
            { title: 'Understanding Deep Learning, Chapters 17–19 (Simon Prince)', url: 'https://udlbook.github.io/udlbook/', kind: 'Book', free: true, why: 'VAEs, diffusion models and reinforcement learning, in the same clear style as the rest of the book.' },
            { title: 'Lilian Weng\'s blog', url: 'https://lilianweng.github.io/', kind: 'Blog', free: true, why: 'Careful, well-illustrated derivations of VAEs, diffusion and policy gradients. Read each post after the book chapter.' },
            { title: 'Spinning Up in Deep RL (OpenAI)', url: 'https://spinningup.openai.com/', kind: 'Course', free: true, why: 'The clearest practical introduction to deep reinforcement learning, with code.' },
        ],
        deeper: [
            { title: 'Reinforcement Learning: An Introduction (Sutton and Barto)', url: 'http://incompleteideas.net/book/the-book-2nd.html', kind: 'Book', free: true, why: 'The standard RL textbook. Chapters 3 and 6 cover the basics used here.' },
            { title: 'David Silver\'s RL course (UCL / DeepMind)', url: 'https://www.youtube.com/results?search_query=David+Silver+reinforcement+learning+lecture+1', kind: 'Video', free: true, why: 'Ten classic lectures. Watch lectures 1 to 5 for the foundations.' },
        ],
        topics: [
            {
                id: 'f7-t1',
                name: 'Autoencoders and VAEs (the ELBO)',
                diagram: {
                    code: 'flowchart LR\n  X["image x"] --> ENC["encoder"] --> MS["μ and σ"]\n  MS --> Z["z = μ + σ · ε<br/>(random ε)"]\n  Z --> DEC["decoder"] --> XH["rebuilt image x̂"]\n  XH -.->|"rebuild well"| LOSS["loss = rebuild error + KL"]\n  MS -.->|"stay close to a bell curve"| LOSS',
                    caption: 'A VAE squeezes an image into a fuzzy code and rebuilds it. The loss balances rebuilding well against keeping the codes tidy.',
                },
                note: {
                    idea: 'An autoencoder squeezes data into a small code and rebuilds it. A variational autoencoder (VAE) makes that code a probability distribution, so you can sample new codes and decode them into new data. It trains by maximising the ELBO: rebuild the input well, but keep the codes close to a simple bell curve.',
                    analogy: 'Describing a face to a sketch artist in 10 numbers. The encoder writes the description and the decoder draws. A VAE also forces the descriptions to be tidy, so a random description still gives a sensible face.',
                    breaks: 'A person\'s description is exact. A VAE\'s code is fuzzy on purpose (it adds noise), which is one reason VAE images are often blurry.',
                    example: 'ELBO = reconstruction term − KL(q(z | x) ‖ N(0, I)). The reparameterisation trick writes z = μ + σ·ε with ε ~ N(0, 1), so gradients can flow through the sampling step.',
                    code: 'mu, log_var = encoder(x)\neps = torch.randn_like(mu)\nz = mu + torch.exp(0.5 * log_var) * eps           # reparameterisation trick\nx_hat = decoder(z)\nrecon = F.mse_loss(x_hat, x, reduction="sum")\nkl = -0.5 * torch.sum(1 + log_var - mu**2 - log_var.exp())\nloss = recon + kl                                 # minimising this maximises the ELBO',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 17 (variational autoencoders)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'From Autoencoder to Beta-VAE', source: 'Lilian Weng', url: 'https://lilianweng.github.io/posts/2018-08-12-vae/' },
                    { kind: 'watch', title: 'Variational Autoencoders', source: 'Arxiv Insights', url: 'https://www.youtube.com/results?search_query=Arxiv+Insights+variational+autoencoders' },
                    { kind: 'paper', title: 'Auto-Encoding Variational Bayes (2013)', source: 'Kingma and Welling · arXiv', url: 'https://arxiv.org/abs/1312.6114' },
                ],
                practice: {
                    explain: 'Explain a VAE with the sketch-artist picture, and why its images are blurry.',
                    derive: 'Derive the ELBO on paper, starting from log p(x) and using Jensen\'s inequality. Then derive the closed-form KL between N(μ, σ²) and N(0, 1).',
                    build: 'Build a VAE on MNIST in PyTorch with a 2D latent space. Plot the latent space coloured by digit, and decode a grid of points into images.',
                    break: 'Remove the KL term, then multiply it by 10. What happens to the samples and to the latent space in each case?',
                },
            },
            {
                id: 'f7-t2',
                name: 'Diffusion models',
                diagram: {
                    code: 'flowchart LR\n  X0["clean image"] -->|"+ noise"| X1["a bit noisy"] -->|"+ noise"| X2["very noisy"] -->|"+ noise"| XT["pure noise"]\n  XT -.->|"model removes a little noise"| X2b["very noisy"] -.-> X1b["a bit noisy"] -.-> X0b["new image"]',
                    caption: 'Solid arrows: training adds noise. Dotted arrows: generation starts from pure noise and removes it step by step.',
                },
                note: {
                    idea: 'A diffusion model learns to remove noise. In training, you take a real image, add a random amount of noise, and teach a network to predict that noise. To generate, you start from pure noise and remove it a little at a time, over many steps.',
                    analogy: 'A sculptor who starts with a rough block and removes a little stone at each step until a statue appears.',
                    breaks: 'A sculptor sees the whole plan. The model only ever learns one small clean-up step, and the full picture comes from repeating it many times. That is also why generation is slow.',
                    example: 'In DDPM, the noisy image is x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε. The training loss is just the squared error between the true noise ε and the predicted noise.',
                    code: 't = torch.randint(0, T, (batch,))\neps = torch.randn_like(x0)\na = alpha_bar[t].view(-1, 1, 1, 1)\nx_t = a.sqrt() * x0 + (1 - a).sqrt() * eps     # add noise in one jump\nloss = F.mse_loss(model(x_t, t), eps)          # learn to predict the noise',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 18 (diffusion models)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'read', title: 'What are Diffusion Models?', source: 'Lilian Weng', url: 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/' },
                    { kind: 'paper', title: 'Denoising Diffusion Probabilistic Models (DDPM, 2020)', source: 'Ho, Jain, Abbeel · arXiv', url: 'https://arxiv.org/abs/2006.11239' },
                ],
                practice: {
                    explain: 'Explain diffusion with the sculptor picture, and why generation is slow.',
                    derive: 'Show that adding Gaussian noise step by step is the same as adding it in one jump: derive x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε.',
                    build: 'Train a small DDPM on MNIST or on 2D toy data like a spiral. Save samples at several points during generation to watch the noise disappear.',
                    break: 'Generate with only 10 steps instead of 1,000, using the same sampler. What goes wrong? Then try a noise schedule that rises too fast.',
                },
            },
            {
                id: 'f7-t3',
                name: 'Reinforcement learning basics: states, actions, rewards, values',
                diagram: {
                    code: 'flowchart LR\n  AG["agent"] -->|"action"| ENV["environment"]\n  ENV -->|"reward"| AG\n  ENV -->|"new state"| AG',
                    caption: 'The whole of reinforcement learning in one loop: act, get a reward and a new situation, learn, act again.',
                },
                note: {
                    idea: 'In reinforcement learning (RL), an agent takes actions in an environment and gets rewards. It learns a policy, meaning what to do in each state, that collects the most reward over time. A value function says how good a state is. Q-learning learns how good each action is in each state.',
                    analogy: 'Training a dog with treats. Nobody shows the dog the right move. It tries things, and good actions earn treats.',
                    breaks: 'A dog gets its treat straight away. In RL the reward often comes much later, like winning a game after 100 moves, so the agent must work out which earlier actions deserve the credit.',
                    example: 'The Q-learning update is Q(s, a) ← Q(s, a) + α · (r + γ · max Q(s′, ·) − Q(s, a)). The discount γ (for example 0.99) makes future rewards count a little less than immediate ones.',
                    code: 'td_target = r + gamma * Q[s_next].max() * (not done)\nQ[s, a] += alpha * (td_target - Q[s, a])',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Spinning Up, Part 1: Key Concepts in RL', source: 'OpenAI', url: 'https://spinningup.openai.com/' },
                    { kind: 'read', title: 'Reinforcement Learning: An Introduction, Ch 3 and 6', source: 'Sutton and Barto · free', url: 'http://incompleteideas.net/book/the-book-2nd.html' },
                    { kind: 'watch', title: 'RL Course, Lecture 1: Introduction to Reinforcement Learning', source: 'David Silver', url: 'https://www.youtube.com/results?search_query=David+Silver+RL+course+lecture+1+introduction+to+reinforcement+learning' },
                ],
                practice: {
                    explain: 'Explain the credit-assignment problem with the dog-training picture.',
                    derive: 'States A → B → Goal. Each step moves right. Reaching Goal gives reward 1, every other step gives 0. With γ = 0.9, compute the values of A and B by hand.',
                    build: 'Implement tabular Q-learning on a small grid world or FrozenLake. Plot the reward per episode, and print the learned policy as arrows.',
                    break: 'Turn exploration off from the start, so the agent always picks the best-known action. What happens? Then set γ = 0 and see what the agent cares about.',
                },
            },
            {
                id: 'f7-t4',
                name: 'Policy gradients and PPO',
                diagram: {
                    code: 'flowchart LR\n  POL["policy network"] --> PLAY["play episodes"] --> ADV["how much better than expected<br/>was each action? (advantage)"]\n  ADV --> UPD["make good actions more likely,<br/>bad ones less likely"]\n  UPD --> CLIP["PPO: clip the change<br/>so each update stays small"] --> POL',
                    caption: 'Policy gradients nudge the policy towards actions that did better than expected; PPO stops any single update from changing it too much.',
                },
                note: {
                    idea: 'Policy-gradient methods train the policy network directly: make actions that led to high reward more likely, and actions that led to low reward less likely. PPO adds a safety limit so each update cannot change the policy too much. PPO is the algorithm used in classic RLHF for language models.',
                    analogy: 'A basketball player adjusting their shot: after a good shot, do a bit more of that; after a miss, a bit less. PPO is a coach who says \'small changes only\'.',
                    breaks: 'A player can feel which part of the shot went wrong. Policy gradients only see the total reward, so the signal is very noisy and needs many tries. Baselines and advantages reduce that noise.',
                    example: 'The REINFORCE gradient is ∇J ≈ Σ ∇log π(a | s) · (return − baseline). PPO\'s clipped objective is min(ratio · A, clip(ratio, 1 − ε, 1 + ε) · A), with ε around 0.2.',
                    code: 'ratio = torch.exp(new_logp - old_logp)\nunclipped = ratio * adv\nclipped = torch.clamp(ratio, 1 - eps, 1 + eps) * adv\nloss = -torch.min(unclipped, clipped).mean()',
                    codeLanguage: 'python',
                },
                resources: [
                    { kind: 'read', title: 'Spinning Up, Part 3: Intro to Policy Optimization', source: 'OpenAI', url: 'https://spinningup.openai.com/' },
                    { kind: 'read', title: 'Policy Gradient Algorithms', source: 'Lilian Weng', url: 'https://lilianweng.github.io/posts/2018-04-08-policy-gradient/' },
                    { kind: 'read', title: 'Understanding Deep Learning, Ch 19 (reinforcement learning)', source: 'Simon Prince · free', url: 'https://udlbook.github.io/udlbook/' },
                    { kind: 'paper', title: 'Proximal Policy Optimization Algorithms (2017)', source: 'Schulman et al. · arXiv', url: 'https://arxiv.org/abs/1707.06347' },
                ],
                practice: {
                    explain: 'Explain policy gradients and PPO\'s clipping with the basketball-coach picture.',
                    derive: 'Derive the log-derivative trick: show that ∇ E[R] = E[R · ∇ log π(a | s)] for a simple policy.',
                    build: 'Implement REINFORCE with a baseline on CartPole, then PPO\'s clipped loss. Compare how fast and how smoothly each one learns.',
                    break: 'Remove the baseline from REINFORCE and compare the noise in the learning curve. Then remove PPO\'s clipping and take large updates.',
                },
            },
        ],
        builds: [
            { id: 'f7-b1', text: 'A VAE on MNIST with a 2D latent space, a plot of that space, and a grid of generated digits.' },
            { id: 'f7-b2', text: 'A small diffusion model on 2D toy data or MNIST, with snapshots of the denoising steps.' },
            { id: 'f7-b3', text: 'Tabular Q-learning on a grid world, then REINFORCE and PPO on CartPole, with the learning curves side by side.' },
        ],
        ready: [
            'What does each term of the ELBO do? What happens if you drop one?',
            'Why do VAE samples tend to be blurry?',
            'What does a diffusion model learn to predict during training, and why is generation slow?',
            'What is the credit-assignment problem in reinforcement learning?',
            'Why does PPO clip the probability ratio?',
            'How is reinforcement learning used in RLHF for language models?',
        ],
    },
];

export const allFoundationTopics: FoundationTopic[] = foundationPhases.flatMap(phase => phase.topics);

export const allMiniBuilds: MiniBuild[] = foundationPhases.flatMap(phase => phase.builds);
