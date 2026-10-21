import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 0 · Your toolkit. One good answer for each practice exercise.

export const phase0Answers: Record<string, TopicAnswers> = {
    'f0-t6': {
        derive: {
            answer: `Call the error e = ŷ − y, so the loss is L = e². Use the chain rule: first how L changes with e, then how e changes with each weight.\n\ndL/de = 2e.\nSince ŷ = w·x + b, a small change in w changes e by x, and a small change in b changes e by 1.\n\nSo:\n∂L/∂w = 2(ŷ − y) · x\n∂L/∂b = 2(ŷ − y)\n\nFor many examples, the loss is the mean, so the gradients are means too: ∂L/∂w = mean(2(ŷ − y)·x) and ∂L/∂b = mean(2(ŷ − y)). These are exactly grad_w and grad_b in the lesson's code.\n\nRead it in words: if the prediction is too high (ŷ − y > 0), both gradients are positive, so gradient descent makes w and b smaller. The x in ∂L/∂w means big houses push w harder than small ones.`,
        },
        build: {
            answer: `Keep a list, append the loss every step, print every 100 steps, then plot the list. The loss falls very fast at first and then flattens: a healthy curve.\n\nThe numbers fall from 69,900 at step 0 to almost 0 by step 100, because this data fits a straight line exactly. The loss falls so far that a log y-axis is the only way to see the end of training.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                X = np.array([50., 80., 120.])
                y = np.array([150., 240., 360.])
                w, b, lr = 0.0, 0.0, 0.0001
                losses = []

                for step in range(1000):
                    pred = w * X + b
                    loss = np.mean((pred - y) ** 2)
                    losses.append(loss)
                    if step % 100 == 0:
                        print(step, round(loss, 4))
                    grad_w = np.mean(2 * (pred - y) * X)
                    grad_b = np.mean(2 * (pred - y))
                    w, b = w - lr * grad_w, b - lr * grad_b

                plt.plot(losses)
                plt.yscale("log")          # the loss falls by many powers of 10
                plt.xlabel("step")
                plt.ylabel("loss")
                plt.title("Training loss")
                plt.show()
                # 0 69900.0
                # 100 0.0001
                # 200 0.0001  ... flat from here: w ≈ 3.0
            `,
        },
        break: {
            answer: `With lr = 0.001 the loss explodes instead of shrinking: 69,900 at step 0, about 14.8 million after one step, and it keeps growing until it becomes inf, then nan.\n\nWhy: the step size is the learning rate times the gradient. Here the step is so big that w jumps right over the best value (3.0) and lands further away on the other side: 0 → 46.6 → −630.7 → 9,214 … Each jump overshoots by more than the last, so the error grows every step.\n\nThe fix is a smaller learning rate, or scaling the feature (sizes like 120 make the gradients big). The lesson: a loss that rises or turns into nan very often means the learning rate is too high.`,
            code: py`
                import numpy as np

                X = np.array([50., 80., 120.])
                y = np.array([150., 240., 360.])
                w, b, lr = 0.0, 0.0, 0.001          # 10 times bigger

                for step in range(4):
                    pred = w * X + b
                    print(step, round(np.mean((pred - y) ** 2)), round(w, 1))
                    grad_w = np.mean(2 * (pred - y) * X)
                    grad_b = np.mean(2 * (pred - y))
                    w, b = w - lr * grad_w, b - lr * grad_b
                # 0 69900 0.0
                # 1 14767756 46.6
                # 2 3119980329 -630.7
                # 3 659157497506 9214.4
            `,
        },
        explain: {
            answer: `Training a model is like learning to throw darts. You throw (the model makes a prediction), you look at how far the dart landed from the bullseye (the loss: one number for how wrong it was), and you adjust your arm a little in the direction that would have helped (the optimiser changes the weights, using the gradient). Then you throw again. Each throw gets a bit closer, and after hundreds of throws you hit the middle.\n\nThe size of each arm adjustment is the learning rate: too small and you need forever, too big and you over-correct and miss by more each time. And you only trust your aim once you can hit a board you've never practised on: that's testing on new data.`,
        },
    },
    'f0-t1': {
        derive: {
            answer: `A = np.arange(24).reshape(2, 3, 4) is 2 blocks, each with 3 rows of 4 numbers.\n\nA.shape → (2, 3, 4)\nA[1].shape → (3, 4). One index picks block 1, and a whole 3 × 4 block is left.\nA[:, 0].shape → (2, 4). Every block, row 0 of each: 2 rows of 4.\nA[1, 2, 3] → 23. Block 1 starts at 12; row 2 adds 2 × 4 = 8; column 3 adds 3. So 12 + 8 + 3 = 23. It is the very last number, which makes sense: every index is the last one on its axis.`,
        },
        build: {
            answer: `Use a fixed seed so the numbers are the same each run. Each selection is one short expression:\n\n• last row: X[-1] (shape (4,))\n• first two columns: X[:, :2] (shape (5, 2))\n• every value above 0.5: X[X > 0.5] (a 1-D array; its length depends on the data)\n• diagonal of the top-left 4 × 4: np.diag(X[:4, :4]), or X[np.arange(4), np.arange(4)]\n\nCheck the shapes, not just the numbers: shape mistakes are the most common bug.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                X = rng.random((5, 4))            # values between 0 and 1

                last_row = X[-1]                  # (4,)
                first_two = X[:, :2]              # (5, 2)
                big = X[X > 0.5]                  # 1-D: only the values that pass
                diag = np.diag(X[:4, :4])         # (4,)

                print(last_row.shape, first_two.shape, big.shape, diag.shape)
                # (4,) (5, 2) (12,) (4,)
                assert np.allclose(diag, [X[i, i] for i in range(4)])
            `,
        },
        break: {
            answer: `The reshape fails with: "cannot reshape array of size 24 into shape (5,5)". A reshape only rearranges the numbers you already have, and 5 × 5 = 25 is not 24.\n\nThe slice B = A[0] is a view: a new window onto the same memory, not a copy. So B[0] = 99 also changes A[0, 0]. np.shares_memory(A, B) is True, and B.base is A.\n\nWhy NumPy does this: copying is slow and uses memory, so basic slices share. When you need an independent array, write B = A[0].copy(). Boolean masks and lists of indexes always make copies.`,
            code: py`
                import numpy as np

                a = np.arange(24)
                try:
                    a.reshape(5, 5)
                except ValueError as e:
                    print(e)        # cannot reshape array of size 24 into shape (5,5)

                A = np.arange(12).reshape(3, 4)
                B = A[0]
                B[0] = 99
                print(A[0, 0], np.shares_memory(A, B))   # 99 True

                C = A[1].copy()
                C[0] = -1
                print(A[1, 0])                            # 4: the copy didn't touch A
            `,
        },
        explain: {
            answer: `All three hold three numbers. The difference is how many directions (axes) they have.\n\n(3,) is a plain list: one axis, no idea of rows or columns.\n(3, 1) is a column: 3 rows, 1 column.\n(1, 3) is a row: 1 row, 3 columns.\n\nWhy it matters: in maths they behave differently. A column plus a row broadcasts to a 3 × 3 grid, and (3,) acts like a row, so (3,) + (3, 1) silently gives a (3, 3) result instead of 3 numbers.`,
            code: py`
                (3,)       [ a  b  c ]          one axis
                (3, 1)     [ a ]                3 rows, 1 column
                           [ b ]
                           [ c ]
                (1, 3)     [[ a  b  c ]]        1 row, 3 columns
            `,
            codeLanguage: 'text',
        },
    },
    'f0-t2': {
        derive: {
            answer: `Line the shapes up from the right, pad the shorter one with 1s on the left, and check each pair: equal, or one of them is 1.\n\n(3, 1) + (4,) → (3, 4). (4,) becomes (1, 4). Right pair: 1 and 4 → 4. Left pair: 3 and 1 → 3.\n(2, 3) + (3,) → (2, 3). (3,) becomes (1, 3), and it is added to every row.\n(2, 3) + (2,) → error. (2,) becomes (1, 2). Right pair: 3 and 2 are unequal and neither is 1.\n(5, 1, 4) + (3, 1) → (5, 3, 4). (3, 1) becomes (1, 3, 1). Pairs from the right: 4 and 1 → 4; 1 and 3 → 3; 5 and 1 → 5.`,
            code: py`
                import numpy as np
                for a, b in [((3, 1), (4,)), ((2, 3), (3,)), ((2, 3), (2,)), ((5, 1, 4), (3, 1))]:
                    try:
                        print(a, "+", b, "->", (np.zeros(a) + np.zeros(b)).shape)
                    except ValueError:
                        print(a, "+", b, "-> error")
            `,
        },
        build: {
            answer: `Expand the square: ‖x − y‖² = ‖x‖² + ‖y‖² − 2·x·y. Then all n × m distances come from one matrix product:\n\nD = (X²).sum(axis=1)[:, None] + (Y²).sum(axis=1)[None, :] − 2·X @ Y.T\n\nThe first term is a column (n, 1), the second a row (1, m), and X @ Y.T is (n, m), so broadcasting gives the full (n, m) table.\n\nCheck it against a slow double loop on small inputs with np.allclose. Then time both at n = m = 1,000: the vectorised version takes a few milliseconds and the loop most of a second: over 100 times faster on a laptop. Rounding can make a distance that should be 0 come out as a tiny negative number, so clip it with np.maximum(D, 0).`,
            code: py`
                import time
                import numpy as np

                def pairwise_sq(X, Y):
                    D = (X**2).sum(axis=1)[:, None] + (Y**2).sum(axis=1)[None, :] - 2 * X @ Y.T
                    return np.maximum(D, 0)          # rounding can give tiny negatives

                def pairwise_loop(X, Y):
                    D = np.zeros((len(X), len(Y)))
                    for i in range(len(X)):
                        for j in range(len(Y)):
                            D[i, j] = ((X[i] - Y[j]) ** 2).sum()
                    return D

                rng = np.random.default_rng(0)
                Xs, Ys = rng.normal(size=(5, 3)), rng.normal(size=(4, 3))
                assert np.allclose(pairwise_sq(Xs, Ys), pairwise_loop(Xs, Ys))

                X, Y = rng.normal(size=(1000, 3)), rng.normal(size=(1000, 3))
                t = time.perf_counter(); pairwise_sq(X, Y); fast = time.perf_counter() - t
                t = time.perf_counter(); pairwise_loop(X, Y); slow = time.perf_counter() - t
                print(f"vectorised {fast*1000:.1f} ms, loop {slow:.1f} s, {slow/fast:.0f}x faster")
            `,
        },
        break: {
            answer: `a has shape (3,) and b has shape (3, 1). (3,) acts like a row, b is a column, so a + b broadcasts to (3, 3): nine numbers instead of three, and no error.\n\nThe test that catches it checks the shape of the result, not just that it runs. Assert the shape you expect inside the function, and test it:\n\n• assert out.shape == a.shape in the function itself, so the bug fails loudly the moment it happens;\n• a pytest test that feeds a column by mistake and expects the error.\n\nThe fix in the caller is to make the shapes match on purpose: b.ravel() or b[:, 0] turns (3, 1) into (3,).`,
            code: py`
                import numpy as np
                import pytest

                def add_bias(x, bias):
                    out = x + bias
                    assert out.shape == x.shape, f"shape changed: {x.shape} -> {out.shape}"
                    return out

                def test_add_bias_keeps_shape():
                    x = np.array([1.0, 2.0, 3.0])
                    assert add_bias(x, np.ones(3)).shape == (3,)

                def test_column_bias_is_caught():
                    x = np.array([1.0, 2.0, 3.0])
                    with pytest.raises(AssertionError):
                        add_bias(x, np.ones((3, 1)))      # would silently be (3, 3)

                print((np.ones(3) + np.ones((3, 1))).shape)   # (3, 3): the silent bug
            `,
        },
        explain: {
            answer: `Line the two shapes up from the right: each pair of sizes must be equal, or one of them must be 1, and a size of 1 is stretched to match the other. So (3, 1) + (1, 3) works: the column of 3 is stretched across 3 columns and the row of 3 is stretched down 3 rows, giving a (3, 3) grid where every value of the first meets every value of the second, with no copying and no loop.`,
        },
    },
    'f0-t3': {
        derive: {
            answer: `Loss goes up the side, steps along the bottom. Your three sketches should show these shapes:\n\n1. Healthy: starts high, drops steeply in the first steps, then bends and flattens into a slow, almost level tail. It never climbs back up.\n\n2. Overfitting: two curves. Both fall at first. Then the training curve keeps falling, but the validation curve reaches a lowest point and turns upward, so the gap between them grows. Mark that lowest validation point: that is where you would stop (early stopping).\n\n3. Learning rate too high: jagged and jumpy, swinging up and down instead of falling smoothly. Often it creeps upward and finally shoots off the top (the loss becomes nan).\n\nThe code below draws all three, so you can hold your sketch next to it.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                t = np.arange(100)
                rng = np.random.default_rng(1)
                healthy = 0.4 + 2.0 * np.exp(-t / 12)
                train = 0.1 + 2.0 * np.exp(-t / 15)
                val = 0.6 + 1.6 * np.exp(-t / 12) + 0.0004 * np.maximum(t - 30, 0) ** 2
                too_high = 1.5 + 0.03 * t + rng.normal(0, 0.6, 100)

                fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))
                axes[0].plot(t, healthy); axes[0].set_title("healthy")
                axes[1].plot(t, train, label="train"); axes[1].plot(t, val, label="validation")
                axes[1].axvline(np.argmin(val), linestyle=":", color="grey")   # stop here
                axes[1].legend(); axes[1].set_title("overfitting")
                axes[2].plot(t, too_high); axes[2].set_title("learning rate too high")
                for ax in axes:
                    ax.set_xlabel("step"); ax.set_ylabel("loss")
                plt.tight_layout()
                plt.show()
            `,
        },
        build: {
            answer: `One figure, three things on it: the curve y = x², its derivative 2x as a dashed line, and 50 noisy dots scattered around the curve. Check that yours has:\n\n• label= on every plot call, then plt.legend(). That is what makes the key.\n• plt.xlabel, plt.ylabel and plt.title.\n• plt.savefig(...) called BEFORE plt.show(). Once the figure has been shown and closed it is gone, so saving afterwards gives a blank PNG.\n• a fixed random seed, so the noisy dots are the same on every run.\n\nWhat to notice: the derivative line crosses 0 exactly where the parabola is lowest (x = 0). It is negative on the left, where the curve slopes down, and positive on the right, where it slopes up. That is the idea gradient descent uses: the sign of the derivative says which way is downhill.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                x = np.linspace(-3, 3, 200)              # smooth x values for the two lines
                rng = np.random.default_rng(0)           # fixed seed: same noise every run
                xs = rng.uniform(-3, 3, 50)              # 50 random x positions
                ys = xs**2 + rng.normal(0, 0.8, 50)      # y = x² plus noise

                plt.figure(figsize=(7, 4))
                plt.plot(x, x**2, label="y = x²")
                plt.plot(x, 2 * x, "--", label="derivative: 2x")
                plt.scatter(xs, ys, s=15, alpha=0.7, label="50 noisy samples of y")
                plt.axhline(0, color="grey", linewidth=0.5)
                plt.xlabel("x")
                plt.ylabel("value")
                plt.title("y = x², its derivative, and noisy samples")
                plt.legend()
                plt.savefig("parabola.png", dpi=150)     # save BEFORE plt.show()
                plt.show()
            `,
        },
        break: {
            answer: `The normal y-axis hides the late progress.\n\nWhy: the axis has to reach 1,000 to fit the start, so every loss below about 10 is squashed into the bottom 1% of the chart. In the run below, the loss drops under 10 at step 80 of 200, and from then on the line looks as if it is lying flat on the floor. Yet it still falls another 1,000 times, from 10 to 0.01. You would wrongly think training had stopped.\n\nThe log y-axis gives every tenfold drop the same height: 1,000 → 100 takes as much space as 0.1 → 0.01. So late progress is as easy to see as early progress. This loss shrinks by the same percentage every step, and on a log axis that shows as a straight line.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                steps = np.arange(200)
                loss = np.geomspace(1000, 0.01, 200)     # 1,000 → 0.01, the same % each step

                fig, axes = plt.subplots(1, 2, figsize=(10, 4))
                axes[0].plot(steps, loss)
                axes[0].set_title("normal y-axis")
                axes[1].plot(steps, loss)
                axes[1].set_yscale("log")
                axes[1].set_title("log y-axis")
                for ax in axes:
                    ax.set_xlabel("step")
                    ax.set_ylabel("loss")
                plt.tight_layout()
                plt.show()

                print(np.argmax(loss < 10))              # 80: the first step below 10
            `,
        },
        explain: {
            answer: `A training loss often falls by several powers of ten, say from 1,000 to 0.01, and on a normal axis the big early values squash the small late ones flat, so it looks as if training stopped. A log scale gives each tenfold drop the same height, so late progress, plateaus and spikes stay visible, and steady exponential decay shows as a straight line.`,
        },
    },
    'f0-t4': {
        derive: {
            answer: `git init                      # start a repo in this folder\ngit add model.py              # stage the change (or git add . for everything)\ngit commit -m "Add model"     # save a snapshot with a message\ngit switch -c experiment      # create a branch and move to it (older: git checkout -b)\ngit switch main               # switch back\ngit remote add origin <url>   # once: connect the repo to GitHub\ngit push -u origin main       # upload; after the first time, just git push\n\nCheck yours has the two-step save: add, then commit. git status at any point shows what is staged and what is not.`,
        },
        build: {
            answer: `1. Make the repo on GitHub (empty, no README), then on your machine: git init, add the remote, and push.\n2. One commit per build, with a message that says what changed and why, such as "Add NumPy linear regression with gradient descent". Not "update" or "stuff".\n3. Add a .gitignore before your first data file, so nothing big or private is ever committed.\n\nA good starting .gitignore is below. Commit the .gitignore itself. If a data file was already committed, remove it from tracking with git rm --cached <file>; the .gitignore alone won't do it.`,
            code: py`
                # data and model files: too big for Git
                data/
                *.csv
                *.npy
                *.pt
                # notebook and Python clutter
                .ipynb_checkpoints/
                __pycache__/
                .venv/
                # secrets: never commit these
                .env
            `,
            codeLanguage: 'text',
        },
        break: {
            answer: `Make the conflict: on main, commit a line such as lr = 0.01. Create a branch, change it to lr = 0.1, and commit. Switch back to main, change the same line to lr = 0.001, and commit. Now git merge experiment stops with "CONFLICT (content)".\n\nGit marks the file like the block below. Everything between <<<<<<< and ======= is your side (main); between ======= and >>>>>>> is the branch.\n\nResolve it by hand: edit the file to the version you really want, delete all three marker lines, then git add the file and git commit to finish the merge. git status tells you which files still have conflicts.\n\nThe lesson: Git merges automatically unless two people changed the same lines. Then a human has to decide.`,
            code: py`
                <<<<<<< HEAD
                lr = 0.001
                =======
                lr = 0.1
                >>>>>>> experiment
            `,
            codeLanguage: 'text',
        },
        explain: {
            answer: `A commit is a saved snapshot of your project with a message, on your own machine; it is a point you can always go back to. A branch is just a name that points at a line of commits, so you can try an idea without touching your main work, and a new commit moves the name forward. A push uploads your commits to the copy on GitHub. Until you push, nobody else can see them, and they are not backed up.`,
        },
    },
    'f0-t5': {
        derive: {
            answer: `Good edge cases are the inputs most likely to break it. Five:\n\n1. Very large values, such as [1000, 1001, 1002]: exp overflows to inf, and inf / inf gives nan.\n2. Very negative values, such as [−1000, −1001]: exp underflows to 0, and 0 / 0 gives nan.\n3. All values equal, such as [5, 5, 5]: the answer must be exactly uniform, [1/3, 1/3, 1/3].\n4. A single value, [7.0]: the answer must be [1.0].\n5. A 2-D batch of shape (batch, classes): each row must sum to 1 on its own, not the whole array.\n\nAlso worth adding: a shift test (adding the same number to every input must not change the output) and integer input.`,
        },
        build: {
            answer: `Write a stable softmax that works along the last axis, then one test per property. Each test checks one thing, so a failure tells you exactly what broke. Compare decimals with np.allclose, never ==.\n\nRun with pytest test_softmax.py. All four tests pass.`,
            code: py`
                import numpy as np

                def softmax(x, axis=-1):
                    x = np.asarray(x, dtype=float)
                    z = x - x.max(axis=axis, keepdims=True)    # stable: largest becomes 0
                    e = np.exp(z)
                    return e / e.sum(axis=axis, keepdims=True)

                def softmax_loop(row):
                    exps = [np.exp(v - max(row)) for v in row]
                    return [e / sum(exps) for e in exps]

                def test_sums_to_one():
                    assert np.isclose(softmax([1.0, 2.0, 3.0]).sum(), 1.0)

                def test_keeps_order():
                    x = np.array([0.5, -1.0, 3.0])
                    assert (np.argsort(softmax(x)) == np.argsort(x)).all()

                def test_batch_rows_each_sum_to_one():
                    p = softmax(np.random.default_rng(0).normal(size=(4, 5)))
                    assert p.shape == (4, 5)
                    assert np.allclose(p.sum(axis=1), 1.0)

                def test_matches_slow_loop():
                    x = [0.2, 1.5, -0.3]
                    assert np.allclose(softmax(x), softmax_loop(x))
            `,
        },
        break: {
            answer: `The naive version, np.exp(x) / np.exp(x).sum(), gives [nan, nan, nan] with an "overflow encountered in exp" warning. exp(1000) is far bigger than the largest float64 (about 1.8 × 10³⁰⁸), so it becomes inf, and inf / inf is nan.\n\nThe fix: subtract the largest value first. Softmax doesn't change when you shift every input by the same amount, because the extra factor exp(−c) appears on the top and the bottom and cancels. After the shift, the largest exponent is exp(0) = 1, so nothing can overflow. The answer is [0.090, 0.245, 0.665].\n\nThe regression test feeds the exact input that broke it, and checks there is no nan and the right answer comes back.`,
            code: py`
                import numpy as np

                x = np.array([1000.0, 1001.0, 1002.0])
                with np.errstate(over="ignore", invalid="ignore"):
                    print(np.exp(x) / np.exp(x).sum())          # [nan nan nan]

                def softmax(x):
                    e = np.exp(x - x.max())
                    return e / e.sum()

                print(softmax(x).round(3))                       # [0.09  0.245 0.665]

                def test_large_inputs_do_not_overflow():
                    p = softmax(np.array([1000.0, 1001.0, 1002.0]))
                    assert not np.isnan(p).any()
                    assert np.allclose(p, softmax(np.array([0.0, 1.0, 2.0])))
            `,
        },
        explain: {
            answer: `Computers store decimals in binary, and most decimals, such as 0.1, can't be stored exactly, so tiny rounding errors creep in: 0.1 + 0.2 is really 0.30000000000000004, and 0.1 + 0.2 == 0.3 is False. == demands every last digit to match, so a test using it fails on correct code, or passes only by luck.\n\nnp.allclose(a, b) instead asks "are these close enough?". For every element it checks |a − b| ≤ atol + rtol·|b|, where by default rtol = 1e-5 (a relative error of 0.001%) and atol = 1e-8 (for values near zero). It returns one True only if every element passes.`,
        },
    },
};
