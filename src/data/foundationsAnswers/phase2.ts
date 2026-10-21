import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 2 · Classical ML, built by you. One good answer for each practice exercise.
// Scikit-learn appears only to load small bundled datasets or make toy data;
// every model is written in NumPy.

export const phase2Answers: Record<string, TopicAnswers> = {
    'f2-t1': {
        derive: {
            answer: `Features (inputs): floor area in m², number of bedrooms, age of the house (others: distance to the station, postcode).\nLabel (the answer to predict): the sale price.\nLoss: mean squared error between predicted and real prices. (Many people predict log(price), so a £20,000 miss on a cheap house counts more than on a mansion.)\n\nThe split, for example 1,000 past sales:\n• Train, 70%: the model learns its weights from these.\n• Validation, 15%: used again and again to choose settings, such as which features or how much regularisation.\n• Test, 15%: used once, at the very end, for an honest final number.\n\nTwo things to check: if a house was sold twice, keep both sales in the same set; and if the model will predict future sales, split by date (train on older sales, test on the newest) instead of at random.`,
        },
        build: {
            answer: `Shuffle the row numbers once with a seeded random generator, then cut the shuffled list at the fraction boundaries. The same seed always gives the same split, which makes results reproducible.\n\nCheck two things: no row number is in two sets, and together the sets contain every row exactly once.`,
            code: py`
                import numpy as np

                def train_val_test_split(X, y, fractions=(0.7, 0.15, 0.15), seed=0):
                    assert np.isclose(sum(fractions), 1.0)
                    order = np.random.default_rng(seed).permutation(len(X))
                    cut1 = int(fractions[0] * len(X))
                    cut2 = cut1 + int(fractions[1] * len(X))
                    parts = np.split(order, [cut1, cut2])
                    return [(X[idx], y[idx], idx) for idx in parts]

                X, y = np.arange(1000).reshape(-1, 1), np.arange(1000)
                (Xtr, ytr, a), (Xva, yva, b), (Xte, yte, c) = train_val_test_split(X, y)
                assert not (set(a) & set(b) or set(a) & set(c) or set(b) & set(c))   # no overlap
                assert sorted(np.concatenate([a, b, c])) == list(range(1000))        # every row once
                again = train_val_test_split(X, y)[0][2]
                assert (again == a).all()                                            # reproducible
                print(len(a), len(b), len(c))                                        # 700 150 150
            `,
        },
        break: {
            answer: `Try 20 "models" that are secretly guessing at random on a test set of 200 examples. Each one should score about 50%, but by luck some score higher, and if you keep the best you report something like 55%. Score that same model on fresh data and it drops back to about 50%.\n\nThat drop is the cost of choosing on the test set: you didn't find a better model, you found the luckiest one on these particular 200 examples. The more often you look at the test set, the more optimistic its score becomes. This is why choices are made on the validation set, and the test set is used once.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                y_test = rng.integers(0, 2, 200)
                # 20 "models" that are really coin flips: each one's guesses on the test set
                guesses = rng.integers(0, 2, (20, 200))
                scores = (guesses == y_test).mean(axis=1)
                print(f"best of 20 on the test set: {scores.max():.0%}")

                y_fresh = rng.integers(0, 2, 2000)            # new data: the "best" model guesses again
                fresh = (rng.integers(0, 2, 2000) == y_fresh).mean()
                print(f"the same model on fresh data: {fresh:.0%}")
            `,
        },
        explain: {
            answer: `Think of studying for an exam. The training set is the textbook exercises: you learn from them. The validation set is the practice papers: you take them again and again to decide how to study and when you are ready. The test set is the real exam: you sit it once.\n\nIf you peek at the real exam while you are still studying, your final grade no longer tells anyone what you actually know. That is why the test set stays locked away until the end.`,
        },
    },
    'f2-t2': {
        derive: {
            answer: `The loss is the squared error L(w) = ‖Xw − y‖² = (Xw − y)ᵀ(Xw − y).\n\nExpand it: L = wᵀXᵀXw − 2yᵀXw + yᵀy.\n\nTake the gradient with respect to w (using ∇(wᵀAw) = 2Aw for a symmetric A, and ∇(bᵀw) = b):\n∇L = 2XᵀXw − 2Xᵀy.\n\nAt the minimum the gradient is 0: XᵀXw = Xᵀy. These are the "normal equations".\n\nIf XᵀX is invertible: w = (XᵀX)⁻¹Xᵀy.\n\nTwo notes: put a column of 1s in X so the model has a bias term; and in code use np.linalg.solve(X.T @ X, X.T @ y), or better np.linalg.lstsq, rather than computing the inverse.`,
        },
        build: {
            answer: `On the diabetes data (four features, standardised, plus a column of 1s for the bias), all three methods give the same weights to 4 decimal places: the normal equation, gradient descent after a few thousand steps, and np.linalg.lstsq.\n\nThey trade off differently. The normal equation is exact but needs XᵀX to be invertible and costs about d³ for d features. lstsq is exact and the most robust. Gradient descent is approximate, but it scales to huge datasets and is the same idea that trains neural networks.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_diabetes      # only to load the data

                d = load_diabetes(scaled=False)
                X = d.data[:, [0, 2, 3, 8]]                      # age, bmi, blood pressure, s5
                X = (X - X.mean(axis=0)) / X.std(axis=0)
                X = np.column_stack([np.ones(len(X)), X])        # bias column
                y = d.target

                w_normal = np.linalg.solve(X.T @ X, X.T @ y)
                w_lstsq = np.linalg.lstsq(X, y, rcond=None)[0]
                w_gd = np.zeros(X.shape[1])
                for _ in range(5000):
                    w_gd -= 0.05 * 2 * X.T @ (X @ w_gd - y) / len(y)

                print(w_normal.round(4))
                assert np.allclose(w_normal, w_lstsq) and np.allclose(w_normal, w_gd, atol=1e-4)
            `,
        },
        break: {
            answer: `With an exact copy of a column, XᵀX is singular: two columns carry the same information, so infinitely many weight pairs fit equally well (for example w₁ = 10, w₂ = 0, or 5 and 5, or 105 and −95). The normal equation has no unique answer. Depending on rounding, np.linalg.solve either raises "Singular matrix" or returns huge, meaningless weights.\n\nGradient descent still works. Both copies get exactly the same gradient at every step, so starting from zero they stay equal, and each ends up with half of the original weight. The predictions are the same as without the copy. np.linalg.lstsq gives that same "split it evenly" answer, because it returns the smallest weights that fit.\n\nThe practical lesson: correlated or duplicated features make the weights unstable and hard to interpret, even when predictions are fine. Remove duplicates, or add L2 regularisation, which makes XᵀX + λI invertible.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                x = rng.normal(size=100)
                y = 3 * x + rng.normal(scale=0.1, size=100)
                X = np.column_stack([x, x])                       # an exact copy
                print(np.linalg.matrix_rank(X.T @ X))             # 1, not 2: singular
                try:
                    print(np.linalg.solve(X.T @ X, X.T @ y))      # huge numbers, or an error
                except np.linalg.LinAlgError as e:
                    print("solve:", e)

                w = np.zeros(2)
                for _ in range(2000):
                    w -= 0.05 * 2 * X.T @ (X @ w - y) / len(y)
                print(w.round(3), np.linalg.lstsq(X, y, rcond=None)[0].round(3))   # both ≈ [1.5 1.5]
            `,
        },
        explain: {
            answer: `Picture dots scattered on a page, and you lay a ruler across them so it runs as close as possible to all of them. For each dot, measure the vertical gap between the dot and the ruler, square it, and add the squares up. Least squares is the position of the ruler that makes that total as small as possible.\n\nSquaring does two things: gaps above and below can't cancel out, and big misses count far more than small ones. That second part is also its weakness: one far-away dot pulls the ruler strongly towards itself.`,
        },
    },
    'f2-t3': {
        derive: {
            answer: `For one example: z = wᵀx, p = σ(z), and the loss is L = −[y·log p + (1 − y)·log(1 − p)].\n\nChain rule in three pieces:\n1. ∂L/∂p = −y/p + (1 − y)/(1 − p) = (p − y) / (p(1 − p)).\n2. ∂p/∂z = σ(z)(1 − σ(z)) = p(1 − p). (The sigmoid's famous derivative.)\n3. ∂z/∂w = x.\n\nMultiply: ∂L/∂w = (p − y)/(p(1 − p)) · p(1 − p) · x = (p − y)·x. The p(1 − p) cancels.\n\nAveraging over n examples and writing it with matrices: ∇L = Xᵀ(p − y) / n.\n\nIn words: each example pushes the weights by its error (p − y) times its features. It is the same shape as linear regression's gradient, which is why the update rule looks identical.`,
        },
        build: {
            answer: `On the breast-cancer data with two standardised features (mean radius and mean texture), gradient descent drives the loss down smoothly from 0.693 (that is ln 2, a model that says 50% for everything) to about 0.24, with about 84% validation accuracy using only those two features.\n\nThe decision boundary is the line where p = 0.5, which is where w₀ + w₁x₁ + w₂x₂ = 0, so you can solve it for x₂ and draw it.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from sklearn.datasets import load_breast_cancer     # only to load the data

                data = load_breast_cancer()
                X = data.data[:, [0, 1]]                             # mean radius, mean texture
                X = (X - X.mean(axis=0)) / X.std(axis=0)
                X = np.column_stack([np.ones(len(X)), X])
                y = data.target.astype(float)
                order = np.random.default_rng(0).permutation(len(X))
                tr, va = order[:450], order[450:]

                sigmoid = lambda z: 1 / (1 + np.exp(-z))
                w, losses = np.zeros(3), []
                for _ in range(2000):
                    p = sigmoid(X[tr] @ w)
                    losses.append(-np.mean(y[tr] * np.log(p) + (1 - y[tr]) * np.log(1 - p)))
                    w -= 0.1 * X[tr].T @ (p - y[tr]) / len(tr)
                acc = ((sigmoid(X[va] @ w) > 0.5) == y[va]).mean()
                print(round(losses[0], 3), round(losses[-1], 3), f"validation accuracy {acc:.0%}")

                fig, axes = plt.subplots(1, 2, figsize=(10, 4))
                axes[0].plot(losses); axes[0].set_xlabel("step"); axes[0].set_ylabel("loss")
                axes[1].scatter(X[:, 1], X[:, 2], c=y, s=8)
                xs = np.linspace(-2.5, 4, 50)
                axes[1].plot(xs, -(w[0] + w[1] * xs) / w[2], "k")   # where p = 0.5
                axes[1].set_xlabel("radius"); axes[1].set_ylabel("texture")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `When a straight line can separate the classes perfectly, the weights never stop growing. Any separating line can be made "more confident" by multiplying all its weights by 2: every correct p moves closer to 1 or 0, so the loss keeps shrinking towards 0, but never reaches it. Gradient descent keeps following that, and the size of w keeps rising (slowly, roughly like the log of the number of steps).\n\nThe result is a model that claims 99.99% certainty near the boundary, which is badly overconfident on new data.\n\nWhat stops it: L2 regularisation (a penalty on ‖w‖² balances the push, so the weights level off), early stopping, or simply a fixed number of steps. In the run below, without regularisation ‖w‖ keeps climbing; with a small λ it settles.`,
            code: py`
                import numpy as np

                x = np.array([-3., -2., -1., 1., 2., 3.])          # perfectly separable at 0
                y = (x > 0).astype(float)
                sigmoid = lambda z: 1 / (1 + np.exp(-z))
                for lam in [0.0, 0.01]:
                    w = 0.0
                    for step in range(1, 100_001):
                        p = sigmoid(w * x)
                        w -= 0.5 * (np.mean((p - y) * x) + lam * w)
                        if step in (100, 1_000, 10_000, 100_000):
                            print(f"lambda {lam}: step {step}, w = {w:.2f}")
            `,
        },
        explain: {
            answer: `A linear model gives a score, wᵀx, that can be any number: −50, 3, 1,000. But for a yes/no question we want a probability between 0 and 1.\n\nThe sigmoid is a dimmer switch. The score turns the dial, and the light always stays between fully off (0) and fully on (1). A score of 0 puts the light at half (0.5); big positive scores push it close to fully on, big negative scores close to off, and it never goes past either end. That makes the output usable as a probability, and it changes smoothly, so gradient descent can learn it.`,
        },
    },
    'f2-t4': {
        derive: {
            answer: `New loss: L(w) = ‖Xw − y‖² + λ‖w‖².\n\nGradient: ∇L = 2Xᵀ(Xw − y) + 2λw.\n\nSet it to 0: XᵀXw − Xᵀy + λw = 0, so (XᵀX + λI)w = Xᵀy, and\nw = (XᵀX + λI)⁻¹Xᵀy.\n\nThe only change from plain least squares is the +λI. It adds λ to every diagonal entry, which does two things: it shrinks the weights towards 0, and it makes the matrix always invertible for λ > 0, even with duplicate or highly correlated features. (Usually the bias is not penalised: centre y, or leave the bias column out of the λI.)`,
        },
        build: {
            answer: `Ridge has the closed form above. L1 (the lasso) has no closed form because |w| has a corner at 0, so use proximal gradient descent: a normal gradient step on the squared error, then "soft-thresholding", which moves each weight towards 0 by λ times the step size and sets it to exactly 0 if it would cross.\n\nOn the standardised diabetes data the two plots look very different. Ridge weights shrink smoothly and all of them are still non-zero at λ = 100. Lasso weights drop to exactly 0 one by one as λ grows, and all ten are zero once λ passes about 45 (the largest |Xᵀy| / n: no feature is worth its fee beyond that). That is L1's feature selection.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from sklearn.datasets import load_diabetes       # only to load the data

                d = load_diabetes(scaled=False)
                X = (d.data - d.data.mean(axis=0)) / d.data.std(axis=0)
                y = d.target - d.target.mean()                    # centre y: no bias to penalise
                n, p = X.shape
                lams = np.logspace(-3, 2, 30)

                def ridge(lam):                                   # minimises mean sq. error + lam·‖w‖²
                    return np.linalg.solve(X.T @ X / n + lam * np.eye(p), X.T @ y / n)

                def lasso(lam, steps=3000):                       # minimises ½·mean sq. error + lam·‖w‖₁
                    w, lr = np.zeros(p), 1 / np.linalg.eigvalsh(X.T @ X / n).max()
                    for _ in range(steps):
                        w = w - lr * X.T @ (X @ w - y) / n
                        w = np.sign(w) * np.maximum(np.abs(w) - lr * lam, 0)   # soft-threshold
                    return w

                R = np.array([ridge(l) for l in lams])
                L = np.array([lasso(l) for l in lams])
                print("non-zero weights at lambda = 100:", (np.abs(R[-1]) > 1e-8).sum(), (np.abs(L[-1]) > 1e-8).sum())

                fig, axes = plt.subplots(1, 2, figsize=(11, 4), sharey=True)
                for ax, W, name in [(axes[0], R, "ridge (L2)"), (axes[1], L, "lasso (L1)")]:
                    ax.plot(lams, W); ax.set_xscale("log"); ax.set_title(name); ax.set_xlabel("λ")
                axes[0].set_ylabel("weight")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `With a huge λ, every weight is squashed to almost 0, so the model predicts nearly the same number, the average of y, for every input. It is a flat line: massive underfitting.\n\nForgetting to scale before L2 punishes features with small units unfairly. The penalty is on the size of the weights, not the size of the effect. Say a house's size is given in metres in one column and in millimetres in another. The millimetre column needs a weight 1,000 times smaller for the same effect, so the penalty barely touches it, while the metre column, needing a big weight, gets shrunk hard. The model ends up preferring features just because of their units.\n\nIn the demo, the same feature with the same true effect keeps almost all of its effect in millimetres but loses much of it in metres. Standardise first, so every feature competes fairly.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                size_m = rng.normal(2.0, 0.5, 200)                  # one feature, two units
                other = rng.normal(0, 1, 200)
                y = 3 * size_m + 3 * other + rng.normal(0, 0.1, 200)

                def ridge(X, y, lam):
                    return np.linalg.solve(X.T @ X / len(y) + lam * np.eye(X.shape[1]), X.T @ y / len(y))

                for name, col in [("metres", size_m), ("millimetres", size_m * 1000)]:
                    X = np.column_stack([col - col.mean(), other])
                    w = ridge(X, y - y.mean(), lam=1.0)
                    print(name, "effect of 1 metre:", round(w[0] * (1 if name == "metres" else 1000), 2))
                # the true effect is 3 per metre in both cases
            `,
        },
        explain: {
            answer: `Think of the weights as a spending budget, and the penalty as the cost of spending.\n\nL2 is a tax that grows with the square of what you spend: spending a little costs almost nothing, spending a lot is very expensive. So it is best to spread the budget thinly across every item: each weight is shrunk, but small weights cost so little that there is no reason to cut them all the way to 0.\n\nL1 is a flat fee per pound, however small the amount. Even a tiny bit of spending on a weak item costs the full rate, so it often makes sense to spend nothing on it at all. That is why L1 sets weak features exactly to 0, while L2 only makes them small.`,
        },
    },
    'f2-t5': {
        derive: {
            answer: `For a point x with true value y = f(x) + noise, averaged over many possible training sets:\n\nE[(y − f̂(x))²] = (E[f̂(x)] − f(x))² + E[(f̂(x) − E[f̂(x)])²] + σ²\n                       bias²                    variance                noise\n\nBias²: how far the average model is from the truth. If you could train on many different datasets and average the models, how wrong would that average still be? This is error from assumptions that are too simple, like a straight line for a curve.\n\nVariance: how much the model jumps around between different training sets. This is error from being too sensitive to the particular sample you happened to get.\n\nNoise (σ²): randomness in y itself that no model can predict. It is the floor: no model can do better than this.`,
        },
        build: {
            answer: `Generate 30 training points from y = sin(2πx) plus noise, and 200 validation points the same way. Fit polynomials of degree 1 to 15 and record both errors.\n\nTraining error keeps falling as the degree rises, because a bigger polynomial can always bend closer to the training points. Validation error falls at first, reaches its lowest at a middle degree (3 to 5 on this data), then rises as the model starts chasing the noise. Choose the bottom of that U.\n\nnp.polynomial.Polynomial.fit rescales x internally, which keeps high degrees numerically stable.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                rng = np.random.default_rng(0)
                truth = lambda x: np.sin(2 * np.pi * x)
                x_tr, x_va = rng.random(30), rng.random(200)
                y_tr = truth(x_tr) + rng.normal(0, 0.3, 30)
                y_va = truth(x_va) + rng.normal(0, 0.3, 200)

                degrees = range(1, 16)
                train_err, val_err = [], []
                for d in degrees:
                    model = np.polynomial.Polynomial.fit(x_tr, y_tr, d)
                    train_err.append(np.mean((model(x_tr) - y_tr) ** 2))
                    val_err.append(np.mean((model(x_va) - y_va) ** 2))
                best = degrees[int(np.argmin(val_err))]
                print("best degree:", best)

                plt.plot(degrees, train_err, label="train")
                plt.plot(degrees, val_err, label="validation")
                plt.axvline(best, linestyle=":", color="grey")
                plt.yscale("log"); plt.xlabel("degree"); plt.ylabel("mean squared error")
                plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `With 3,000 points, the validation curve barely rises at high degrees, and the best degree moves up (to around 6 to 10 on this data). The extra flexibility no longer hurts much.\n\nWhy more data reduces variance: a wiggly model overfits by bending to fit the noise in the few points it saw. With 30 points there is room between them to bend wildly. With 3,000, every bit of the curve is pinned down by many nearby points whose noise averages out, so the fitted curve hardly changes from one training set to the next. Variance shrinks roughly like 1/n, while bias doesn't change, so the best balance shifts towards more complex models.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                truth = lambda x: np.sin(2 * np.pi * x)
                x_va = rng.random(2000)
                y_va = truth(x_va) + rng.normal(0, 0.3, 2000)
                for n in [30, 3000]:
                    x_tr = rng.random(n)
                    y_tr = truth(x_tr) + rng.normal(0, 0.3, n)
                    errs = [np.mean((np.polynomial.Polynomial.fit(x_tr, y_tr, d)(x_va) - y_va) ** 2) for d in range(1, 16)]
                    print(n, "points: best degree", int(np.argmin(errs)) + 1, "| error at degree 15:", round(errs[-1], 3))
            `,
        },
        explain: {
            answer: `Two students prepare for an exam. The first memorises every answer in the practice book word for word. They score 100% on those exact questions, but a new question throws them completely: that is overfitting, or high variance. The second only learns "the answer is usually C". They do equally badly on old and new questions: that is underfitting, or high bias.\n\nYou want a third student, who learns the ideas behind the answers, so they do well on questions they have never seen. In ML, a model overfits when it learns the noise and quirks of its training data instead of the real pattern, and the sign is a big gap between training and validation scores.`,
        },
    },
    'f2-t6': {
        derive: {
            answer: `TP = 40, FP = 10, FN = 20, TN = 930, so 1,000 cases in total.\n\nAccuracy = (TP + TN) / total = (40 + 930) / 1,000 = 0.97.\nPrecision = TP / (TP + FP) = 40 / 50 = 0.80. Of the 50 flagged, 40 were right.\nRecall = TP / (TP + FN) = 40 / 60 ≈ 0.667. Of the 60 real positives, 40 were found.\nF1 = 2·P·R / (P + R) = 2·0.8·0.667 / 1.467 ≈ 0.727. (Or directly: 2TP / (2TP + FP + FN) = 80 / 110.)\n\nNotice that accuracy, 97%, looks far better than the model really is: it misses a third of the positives. Accuracy is flattered by the 930 easy negatives.`,
        },
        build: {
            answer: `Precision, recall and F1 come straight from the counts. For ROC-AUC, sort by score from high to low and walk down the list, lowering the threshold one example at a time: each positive moves the curve up (true positive rate), each negative moves it right (false positive rate). The area under that curve, by the trapezoid rule, is the AUC.\n\nCheck it with its meaning: AUC is the chance that a random positive gets a higher score than a random negative, which you can count directly by comparing every pair. Both give the same number. (Ties in scores need care; this version assumes distinct scores.)`,
            code: py`
                import numpy as np

                def precision(y, pred):
                    tp, fp = np.sum((pred == 1) & (y == 1)), np.sum((pred == 1) & (y == 0))
                    return tp / (tp + fp) if tp + fp else 0.0

                def recall(y, pred):
                    tp, fn = np.sum((pred == 1) & (y == 1)), np.sum((pred == 0) & (y == 1))
                    return tp / (tp + fn) if tp + fn else 0.0

                def f1(y, pred):
                    p, r = precision(y, pred), recall(y, pred)
                    return 2 * p * r / (p + r) if p + r else 0.0

                def roc_auc(y, scores):
                    y = y[np.argsort(-scores)]                        # highest score first
                    tpr = np.concatenate([[0], np.cumsum(y) / y.sum()])
                    fpr = np.concatenate([[0], np.cumsum(1 - y) / (1 - y).sum()])
                    return np.trapezoid(tpr, fpr)

                rng = np.random.default_rng(0)
                y = rng.integers(0, 2, 500)
                scores = y + rng.normal(0, 0.8, 500)                  # noisy but useful scores
                pairs = np.mean(scores[y == 1][:, None] > scores[y == 0][None, :])
                print(round(roc_auc(y, scores), 4), round(pairs, 4))   # the same
                pred = (scores > 0.5).astype(int)
                print(round(precision(y, pred), 3), round(recall(y, pred), 3), round(f1(y, pred), 3))
            `,
        },
        break: {
            answer: `On 10,000 transactions with 100 frauds, "always not fraud" gets:\n• accuracy 99%, which looks excellent;\n• recall 0: it finds none of the 100 frauds;\n• precision undefined (0 / 0, because it flags nothing), usually reported as 0.\n\nRecall exposes it immediately, and so do F1 (0) and the confusion matrix, which shows TP = 0. Accuracy hides it because 99% of the answers are "not fraud" anyway.\n\nThe rule: on imbalanced data, never report accuracy alone. Report precision and recall for the rare class, or the precision–recall curve.`,
            code: py`
                import numpy as np

                y = np.array([1] * 100 + [0] * 9900)          # 1% fraud
                pred = np.zeros_like(y)                       # always "not fraud"
                tp = np.sum((pred == 1) & (y == 1))
                print("accuracy", (pred == y).mean())          # 0.99
                print("recall", tp / y.sum())                  # 0.0
                print("flagged", pred.sum())                   # 0: precision is 0 / 0
            `,
        },
        explain: {
            answer: `Fishing with a net. Precision asks: of everything in your net, how much is actually fish, and not old boots? Recall asks: of all the fish in the lake, how many did you catch?\n\nA huge net catches nearly every fish (high recall) but also lots of boots (low precision). A small, careful net catches only fish (high precision) but misses most of them (low recall). You choose the net by what a mistake costs: for a disease screening test, missing a sick person is worse, so you want high recall; for a spam filter, losing a real email is worse, so you want high precision.`,
        },
    },
    'f2-t7': {
        derive: {
            answer: `Split the 10 rows (after shuffling) into 5 folds of 2 rows each. In each round, one fold is the test fold and the other four train the model:\n\nFold 1: test rows 1–2, train rows 3–10\nFold 2: test rows 3–4, train rows 1–2 and 5–10\nFold 3: test rows 5–6, train rows 1–4 and 7–10\nFold 4: test rows 7–8, train rows 1–6 and 9–10\nFold 5: test rows 9–10, train rows 1–8\n\nEvery row is tested exactly once and used for training four times. You get 5 scores, and report their mean and spread.`,
            code: py`
                rows:     1  2  3  4  5  6  7  8  9  10
                fold 1:   T  T  .  .  .  .  .  .  .  .
                fold 2:   .  .  T  T  .  .  .  .  .  .
                fold 3:   .  .  .  .  T  T  .  .  .  .
                fold 4:   .  .  .  .  .  .  T  T  .  .
                fold 5:   .  .  .  .  .  .  .  .  T  T
                T = test,  . = train
            `,
            codeLanguage: 'text',
        },
        build: {
            answer: `k_fold shuffles the row numbers once and cuts them into k nearly equal folds; each fold takes a turn as the test set. Here it scores a simple nearest-centroid classifier (predict the class whose average is closest) on the breast-cancer data, with scaling fitted inside each fold on that fold's training rows only.\n\nReport the mean and the spread across folds, such as 0.93 ± 0.03. The spread tells you how much the score depends on which rows ended up in the test set.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_breast_cancer     # only to load the data

                def k_fold(n, k, seed=0):
                    folds = np.array_split(np.random.default_rng(seed).permutation(n), k)
                    for i in range(k):
                        yield np.concatenate(folds[:i] + folds[i + 1:]), folds[i]

                data = load_breast_cancer()
                X, y = data.data, data.target
                scores = []
                for train, test in k_fold(len(X), 5):
                    mean, std = X[train].mean(axis=0), X[train].std(axis=0)   # fit on training rows only
                    Xtr, Xte = (X[train] - mean) / std, (X[test] - mean) / std
                    centres = np.stack([Xtr[y[train] == c].mean(axis=0) for c in (0, 1)])
                    pred = np.argmin(((Xte[:, None, :] - centres) ** 2).sum(-1), axis=1)
                    scores.append((pred == y[test]).mean())
                print(f"{np.mean(scores):.3f} ± {np.std(scores):.3f}", np.round(scores, 3))
            `,
        },
        break: {
            answer: `Two leaks, measured with 5-fold cross-validation on data that has no real pattern at all (random features, random labels), so the honest score should be about 50%:\n\n1. A feature built from the label (a noisy copy of y): the score jumps to almost 100%. In real life this looks like "refund issued" when predicting fraud, or a date that is only filled in after the outcome.\n\n2. Choosing features using all the data: pick the 20 features, out of 10,000, most correlated with the labels on the full dataset, then cross-validate. The score rises to roughly 80% or more, on pure noise. Doing the selection inside each fold, on training rows only, brings it back to about 50%.\n\nScaling with all the data is the same kind of mistake, but its effect is usually small; it is still wrong. The general rule: anything learned from data, whether scaling, feature selection or filling in missing values, must be fitted on the training rows only, inside each fold.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n = 100
                X, y = rng.normal(size=(n, 10_000)), rng.integers(0, 2, n)     # pure noise

                def cv_accuracy(X, y, select=None, k=5):
                    folds = np.array_split(rng.permutation(n), k)
                    scores = []
                    for i in range(k):
                        test = folds[i]
                        train = np.concatenate(folds[:i] + folds[i + 1:])
                        cols = select(X[train], y[train]) if select else slice(None)
                        Xtr, Xte = X[train][:, cols], X[test][:, cols]
                        centres = np.stack([Xtr[y[train] == c].mean(axis=0) for c in (0, 1)])
                        pred = np.argmin(((Xte[:, None, :] - centres) ** 2).sum(-1), axis=1)
                        scores.append((pred == y[test]).mean())
                    return np.mean(scores)

                top20 = lambda X, y: np.argsort(-np.abs(np.corrcoef(X.T, y)[-1, :-1]))[:20]

                label_feature = np.column_stack([y + rng.normal(0, 0.1, n)])
                print("feature built from the label:", cv_accuracy(label_feature, y))
                print("features chosen on ALL data:", cv_accuracy(X[:, top20(X, y)], y))
                print("features chosen inside each fold:", cv_accuracy(X, y, select=top20))
            `,
        },
        explain: {
            answer: `Data leakage is like a student who saw the exam answers the night before. Their score is real, but it tells you nothing about what they know, and in the next exam, without the answers, they fail.\n\nA model leaks when information it won't have at prediction time sneaks into training or evaluation: the test rows' statistics used for scaling, a feature that is really a consequence of the label, or future data used to predict the past. The model then looks brilliant in testing and disappoints in real use.`,
        },
    },
    'f2-t8': {
        derive: {
            answer: `Standardise [10, 20, 30]:\nMean = 20.\nStandard deviation (dividing by n, as scalers do) = √(((10 − 20)² + 0² + (30 − 20)²) / 3) = √(200/3) ≈ 8.165.\nResult: [(10 − 20)/8.165, 0, (30 − 20)/8.165] ≈ [−1.225, 0, 1.225].\n(Dividing by n − 1 instead gives a standard deviation of 10 and the result [−1, 0, 1]. Either is fine if you are consistent.)\n\nOne-hot ['cat', 'dog', 'cat', 'bird'], with the categories in alphabetical order [bird, cat, dog]:\ncat → [0, 1, 0]\ndog → [0, 0, 1]\ncat → [0, 1, 0]\nbird → [1, 0, 0]\nEach category gets its own column, so no false order like bird < cat < dog is invented.`,
        },
        build: {
            answer: `Both have the same two-step shape: fit learns from the training data only (the means and standard deviations, or the list of categories), and transform applies what was learned to any data, including validation and test data. Fitting on all the data would leak information from the test set.\n\nThe tests check that the scaled training data has mean 0 and standard deviation 1, that test data is scaled with the training numbers, and that one-hot rows each contain a single 1.`,
            code: py`
                import numpy as np

                class StandardScaler:
                    def fit(self, X):
                        self.mean_, self.std_ = X.mean(axis=0), X.std(axis=0)
                        self.std_[self.std_ == 0] = 1.0                 # constant column: leave it
                        return self
                    def transform(self, X):
                        return (X - self.mean_) / self.std_

                class OneHotEncoder:
                    def fit(self, values):
                        self.categories_ = sorted(set(values))
                        return self
                    def transform(self, values):
                        index = {c: i for i, c in enumerate(self.categories_)}
                        out = np.zeros((len(values), len(self.categories_)))
                        for row, v in enumerate(values):
                            out[row, index[v]] = 1
                        return out

                X_train, X_test = np.array([[10.], [20.], [30.]]), np.array([[40.]])
                scaler = StandardScaler().fit(X_train)
                assert np.allclose(scaler.transform(X_train).mean(), 0)
                assert np.allclose(scaler.transform(X_train).std(), 1)
                print(scaler.transform(X_test).round(3))               # [[2.449]]: uses the training mean and std

                enc = OneHotEncoder().fit(["cat", "dog", "cat", "bird"])
                print(enc.categories_, enc.transform(["cat", "bird"]))
            `,
        },
        break: {
            answer: `k-NN without scaling: when one feature is in thousands (say, salary) and the other in decimals (say, a 0–1 score that really decides the label), the distance is almost entirely the salary difference. The useful feature is drowned out, and accuracy falls to about chance (around 50%). With both features standardised, accuracy jumps back up (above 90% here).\n\nA category the encoder never saw: the code above raises a KeyError. In production that crashes on the first new value, such as a new country or product. Decide on purpose: either map unknown values to an all-zeros row (or an "other" column) and log them so you notice, or fail loudly if an unknown value means bad data. Either way, it should be a choice, not a surprise.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n = 400
                score = rng.random(n)                                  # decides the label
                salary = rng.normal(40_000, 10_000, n)                 # big numbers, no signal
                y = (score > 0.5).astype(int)
                X = np.column_stack([salary, score])
                tr, te = np.arange(300), np.arange(300, n)

                def knn_accuracy(X, k=5):
                    d = ((X[te][:, None, :] - X[tr][None, :, :]) ** 2).sum(-1)
                    nearest = np.argsort(d, axis=1)[:, :k]
                    pred = (y[tr][nearest].mean(axis=1) > 0.5).astype(int)
                    return (pred == y[te]).mean()

                Xs = (X - X[tr].mean(axis=0)) / X[tr].std(axis=0)
                print(f"unscaled {knn_accuracy(X):.0%}, scaled {knn_accuracy(Xs):.0%}")

                index = {"bird": 0, "cat": 1, "dog": 2}
                try:
                    index["fish"]
                except KeyError as e:
                    print("unknown category:", e)
            `,
        },
        explain: {
            answer: `Describe a house by its size in square metres (100) and its number of rooms (3). A distance-based model, like k-NN, compares houses by adding up the differences. A difference of 20 m² and a difference of 2 rooms are both big for a house, but the model just sees 20 and 2.\n\nIt is as if size is shouting and rooms are whispering: the model hears only the loudest feature, whatever its units happen to be. Scaling puts every feature at the same volume, so the model listens to all of them according to what they actually tell it.`,
        },
    },
    'f2-t9': {
        derive: {
            answer: `Distances from the new point (3, 3):\nA (2, 3): √(1² + 0²) = 1.0\nA (0, 0): √(3² + 3²) ≈ 4.24\nB (5, 3): √(2² + 0²) = 2.0\nB (3, 5.5): √(0² + 2.5²) = 2.5\n\nk = 1: the single nearest is A at (2, 3), distance 1.0. Answer: A.\nk = 3: the three nearest are A (1.0), B (2.0) and B (2.5). The vote is 2 to 1 for B. Answer: B.\n\nThe choice of k changed the answer. Small k follows the closest point exactly, so it is sensitive to noise; larger k smooths things out.`,
        },
        build: {
            answer: `Vectorised distances use the same trick as the toolkit phase: ‖a − b‖² = ‖a‖² + ‖b‖² − 2a·b for all pairs at once. Then sort each row, take the k nearest labels, and vote.\n\nOn the standardised breast-cancer data, validation accuracy stays around 94 to 97% across most k, so the curve is fairly flat. When it is this flat, prefer a moderate k (say 5 to 10) over a lucky peak at k = 1: small k follows single noisy points, and very large k gets too smooth. Pick k from the validation curve, never from the test set.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from sklearn.datasets import load_breast_cancer     # only to load the data

                data = load_breast_cancer()
                order = np.random.default_rng(0).permutation(len(data.target))
                X, y = data.data[order], data.target[order]
                tr, va = slice(0, 400), slice(400, None)
                mean, std = X[tr].mean(axis=0), X[tr].std(axis=0)
                X = (X - mean) / std

                def knn_predict(X_train, y_train, X_new, k):
                    d = (X_new**2).sum(1)[:, None] + (X_train**2).sum(1)[None, :] - 2 * X_new @ X_train.T
                    nearest = np.argsort(d, axis=1)[:, :k]
                    return (y_train[nearest].mean(axis=1) > 0.5).astype(int)

                ks = range(1, 31)
                acc = [(knn_predict(X[tr], y[tr], X[va], k) == y[va]).mean() for k in ks]
                print("best k:", ks[int(np.argmax(acc))], "accuracy:", round(max(acc), 3))
                plt.plot(ks, acc, marker="o"); plt.xlabel("k"); plt.ylabel("validation accuracy"); plt.show()
            `,
        },
        break: {
            answer: `With 50 extra columns of random noise, accuracy drops clearly (on this run from about 96% to the low 90s or below). The neighbours are no longer the truly similar patients.\n\nWhy: distance adds up differences across every feature. 30 useful features and 50 noise features means most of the distance is now noise, so "nearest" mostly means "luckiest noise". That is the curse of dimensionality: in many dimensions, every point is roughly as far from every other point, so nearest neighbours stop being meaningfully near. k-NN needs a few relevant, scaled features; feature selection or a learned embedding helps.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_breast_cancer     # only to load the data

                data = load_breast_cancer()
                rng = np.random.default_rng(0)
                order = rng.permutation(len(data.target))
                X, y = data.data[order], data.target[order]
                X = (X - X[:400].mean(axis=0)) / X[:400].std(axis=0)

                def accuracy(X, k=7):
                    d = ((X[400:][:, None, :] - X[:400][None, :, :]) ** 2).sum(-1)
                    pred = (y[:400][np.argsort(d, axis=1)[:, :k]].mean(axis=1) > 0.5)
                    return (pred == y[400:]).mean()

                noisy = np.column_stack([X, rng.normal(size=(len(X), 50))])
                print(f"30 real features: {accuracy(X):.1%}, plus 50 noise features: {accuracy(noisy):.1%}")
            `,
        },
        explain: {
            answer: `You are new in town and want a good restaurant. You ask your 5 nearest neighbours where they eat, and go with the most popular answer. That is k-nearest neighbours with k = 5: to label something new, find the k most similar examples you already know, and take a vote.\n\nThere is no training at all: the model is the whole set of examples. The work happens when you ask: measure the distance to everything and find the closest. Ask just 1 neighbour and you may get one odd opinion; ask the whole town and you just get the most popular place overall.`,
        },
    },
    'f2-t10': {
        derive: {
            answer: `Gini impurity = 1 − Σ pᵢ², where pᵢ is the share of each class in the node.\n\nBefore splitting: 3 yes and 5 no out of 8.\nGini = 1 − ((3/8)² + (5/8)²) = 1 − (9 + 25)/64 = 30/64 ≈ 0.469.\n\nSplit at x < 3.5: left is x = 1, 2, 3, all yes, so Gini 0. Right is x = 4 to 8, all no, so Gini 0.\nWeighted Gini = (3/8)·0 + (5/8)·0 = 0. A perfect split.\n\nSplit at x < 5.5: left is x = 1 to 5, 3 yes and 2 no, so Gini = 1 − (0.6² + 0.4²) = 0.48. Right is x = 6, 7, 8, all no, so Gini 0.\nWeighted Gini = (5/8)·0.48 + (3/8)·0 = 0.30.\n\nx < 3.5 is better: it lowers the impurity from 0.469 to 0, while x < 5.5 only lowers it to 0.30.`,
        },
        build: {
            answer: `The tree, recursively: at each node try every feature and every threshold, keep the split with the lowest weighted Gini, and recurse on both sides. Stop when the node is pure, too small, or at the depth limit, and predict the majority class.\n\nOn Iris with a depth limit of 2 it gets about 90% on the 40 held-out flowers, and printing it as nested if-statements shows the questions it learned, mainly about petal length and width.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_iris      # only to load the data

                def gini(y):
                    _, counts = np.unique(y, return_counts=True)
                    return 1 - np.sum((counts / len(y)) ** 2)

                def best_split(X, y):
                    best = (None, None, gini(y))
                    for f in range(X.shape[1]):
                        for t in np.unique(X[:, f])[:-1]:
                            left = X[:, f] <= t
                            score = (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
                            if score < best[2]:
                                best = (f, t, score)
                    return best

                def build(X, y, depth, max_depth):
                    feature, threshold, _ = best_split(X, y)
                    if depth == max_depth or feature is None or gini(y) == 0:
                        return {"leaf": np.bincount(y).argmax()}
                    left = X[:, feature] <= threshold
                    return {"feature": feature, "threshold": threshold,
                            "left": build(X[left], y[left], depth + 1, max_depth),
                            "right": build(X[~left], y[~left], depth + 1, max_depth)}

                def predict(node, x):
                    while "leaf" not in node:
                        node = node["left"] if x[node["feature"]] <= node["threshold"] else node["right"]
                    return node["leaf"]

                def show(node, names, classes, indent=""):
                    if "leaf" in node:
                        print(indent + "return " + classes[node["leaf"]]); return
                    print(f"{indent}if {names[node['feature']]} <= {node['threshold']}:")
                    show(node["left"], names, classes, indent + "    ")
                    print(indent + "else:")
                    show(node["right"], names, classes, indent + "    ")

                iris = load_iris()
                order = np.random.default_rng(0).permutation(150)
                X, y = iris.data[order], iris.target[order]
                tree = build(X[:110], y[:110], 0, max_depth=2)
                show(tree, iris.feature_names, iris.target_names)
                print("held-out accuracy:", np.mean([predict(tree, x) == t for x, t in zip(X[110:], y[110:])]))
            `,
        },
        break: {
            answer: `With no depth limit the tree keeps splitting until every leaf is pure, so training accuracy reaches 100%, while validation accuracy is lower: it has memorised the noise, which is overfitting. A depth limit, a minimum number of examples per leaf, or pruning fixes it.\n\nRotating the data shows a different weakness. Trees can only ask "is feature ≤ threshold?", so every boundary is made of straight lines parallel to the axes. A boundary along x₁ (label = x₁ > 0) needs a single split. Rotate it 45° (label = x₁ + x₂ > 0) and the tree has to build a staircase out of many small steps to follow the diagonal, dozens of splits for the same simple rule, and it is still jagged. Linear models get this in one line; trees need tricks such as rotating the features first.`,
            code: py`
                import numpy as np

                def gini(y):
                    p = np.bincount(y, minlength=2) / len(y)
                    return 1 - np.sum(p**2)

                def count_splits(X, y):
                    if gini(y) == 0:
                        return 0
                    best = None
                    for f in range(X.shape[1]):
                        for t in np.unique(X[:, f])[:-1]:
                            left = X[:, f] <= t
                            score = left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])
                            if best is None or score < best[0]:
                                best = (score, f, t)
                    left = X[:, best[1]] <= best[2]
                    return 1 + count_splits(X[left], y[left]) + count_splits(X[~left], y[~left])

                X = np.random.default_rng(0).uniform(-1, 1, size=(300, 2))
                print("axis-aligned boundary:", count_splits(X, (X[:, 0] > 0).astype(int)), "split")
                print("diagonal boundary:", count_splits(X, (X[:, 0] + X[:, 1] > 0).astype(int)), "splits")
            `,
        },
        explain: {
            answer: `In 20 Questions you try to guess a thing by asking yes/no questions. A good first question, like "is it alive?", splits the possibilities into two useful groups; a bad one, like "is it a left-handed violinist?", tells you almost nothing.\n\nA decision tree plays the same game with data. At each step it tries every possible question of the form "is feature ≤ some value?", and picks the one that makes the groups as pure as possible, measured by Gini impurity or entropy. Then it asks the next question within each group, until the groups are pure enough to answer.`,
        },
    },
    'f2-t11': {
        derive: {
            answer: `More often, about 85% of the time.\n\nReasoning: the majority vote is right when at least 13 of the 25 trees are right. Each tree is right with probability 0.6, so on average 15 are right, and with independent trees the number right varies only a little around 15 (the standard deviation is √(25·0.6·0.4) ≈ 2.4). Falling all the way to 12 or fewer is unlikely.\n\nExactly: P(at least 13 right) = Σ from k = 13 to 25 of C(25, k)·0.6ᵏ·0.4²⁵⁻ᵏ ≈ 0.846.\n\nThe big condition is independence. Real trees trained on the same data make similar mistakes, so the gain is smaller. That is why random forests deliberately make their trees different.`,
            code: py`
                import numpy as np
                from math import comb

                exact = sum(comb(25, k) * 0.6**k * 0.4**(25 - k) for k in range(13, 26))
                votes = np.random.default_rng(0).random((100_000, 25)) < 0.6     # True = this tree is right
                print(round(exact, 3), round((votes.sum(axis=1) >= 13).mean(), 3))   # 0.846 and about the same
            `,
        },
        build: {
            answer: `Both reuse one small tree builder.\n\nRandom forest: train each tree on a bootstrap sample (rows drawn with replacement) and let each split look at only √d random features, then take a majority vote. On breast cancer, 25 trees beat one tree on held-out data (about 95% against 94% on this split; the gap is bigger when single trees are less stable).\n\nGradient boosting for regression: start by predicting the mean; then repeatedly fit a small tree to the residuals, y minus the current prediction, and add a small fraction (the learning rate) of it. On the diabetes data the validation error falls as trees are added.\n\nScikit-learn only loads the data; the trees are written here.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_breast_cancer, load_diabetes   # only to load data

                def build(X, y, depth, max_depth, n_features, rng, regression=False, min_leaf=5):
                    if regression:
                        impurity, leaf = (lambda v: v.var() * len(v)), (lambda v: v.mean())
                    else:
                        impurity = lambda v: len(v) * (1 - np.sum((np.bincount(v, minlength=2) / len(v)) ** 2))
                        leaf = lambda v: np.bincount(v).argmax()
                    if depth == max_depth or len(y) < 2 * min_leaf or impurity(y) == 0:
                        return leaf(y)
                    best = None
                    for f in rng.choice(X.shape[1], n_features, replace=False):
                        for t in np.quantile(X[:, f], np.linspace(0.05, 0.95, 19)):
                            left = X[:, f] <= t
                            if min_leaf <= left.sum() <= len(y) - min_leaf:
                                score = impurity(y[left]) + impurity(y[~left])
                                if best is None or score < best[0]:
                                    best = (score, f, t)
                    if best is None:
                        return leaf(y)
                    _, f, t = best
                    left = X[:, f] <= t
                    return (f, t, build(X[left], y[left], depth + 1, max_depth, n_features, rng, regression, min_leaf),
                                  build(X[~left], y[~left], depth + 1, max_depth, n_features, rng, regression, min_leaf))

                def predict(node, x):
                    while isinstance(node, tuple):
                        f, t, left, right = node
                        node = left if x[f] <= t else right
                    return node

                rng = np.random.default_rng(0)
                bc = load_breast_cancer()
                order = rng.permutation(len(bc.target))
                X, y = bc.data[order], bc.target[order]
                Xtr, ytr, Xva, yva = X[:400], y[:400], X[400:], y[400:]

                one = build(Xtr, ytr, 0, 8, X.shape[1], rng)
                forest = []
                for _ in range(25):
                    rows = rng.integers(0, len(ytr), len(ytr))               # bootstrap sample
                    forest.append(build(Xtr[rows], ytr[rows], 0, 8, int(np.sqrt(X.shape[1])), rng))
                votes = np.array([[predict(t, x) for t in forest] for x in Xva])
                print("one tree:", np.mean([predict(one, x) for x in Xva] == yva).round(3),
                      "forest:", np.mean((votes.mean(axis=1) > 0.5) == yva).round(3))

                db = load_diabetes()
                Xd, yd = db.data[order[:442] % 442], db.target[order[:442] % 442]
                Xtr, ytr, Xva, yva = Xd[:330], yd[:330], Xd[330:], yd[330:]
                pred_tr, pred_va = np.full(len(ytr), ytr.mean()), np.full(len(yva), ytr.mean())
                for m in range(1, 101):
                    tree = build(Xtr, ytr - pred_tr, 0, 2, Xd.shape[1], rng, regression=True)
                    pred_tr += 0.1 * np.array([predict(tree, x) for x in Xtr])
                    pred_va += 0.1 * np.array([predict(tree, x) for x in Xva])
                    if m in (1, 10, 100):
                        print(f"boosting, {m} trees: validation MSE {np.mean((pred_va - yva) ** 2):.0f}")
            `,
        },
        break: {
            answer: `Identical trees: with no bootstrap and every feature allowed at every split, all 25 trees are built from the same data in the same way, so they are the same tree. The vote is unanimous every time, and the forest scores exactly what one tree scores. Averaging only helps when the members make different mistakes: the randomness is the point, not a side effect.\n\nBoosting with learning rate 1.0 and 500 trees: validation error drops quickly for the first trees, then starts climbing as later trees fit the noise left in the residuals. With learning rate 0.1 the fall is slower and smoother and the climb comes much later. The fixes are a small learning rate and early stopping: keep the number of trees where validation error was lowest.`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_diabetes          # only to load the data

                def stump_fit(X, r):                                 # depth-1 regression tree
                    best = None
                    for f in range(X.shape[1]):
                        for t in np.quantile(X[:, f], np.linspace(0.05, 0.95, 19)):
                            left = X[:, f] <= t
                            pred = np.where(left, r[left].mean(), r[~left].mean())
                            err = np.sum((r - pred) ** 2)
                            if best is None or err < best[0]:
                                best = (err, f, t, r[left].mean(), r[~left].mean())
                    _, f, t, a, b = best
                    return lambda X: np.where(X[:, f] <= t, a, b)

                d = load_diabetes()
                order = np.random.default_rng(0).permutation(442)
                X, y = d.data[order], d.target[order]
                Xtr, ytr, Xva, yva = X[:330], y[:330], X[330:], y[330:]
                for lr in [1.0, 0.1]:
                    ptr, pva, errs = np.full(330, ytr.mean()), np.full(112, ytr.mean()), []
                    for _ in range(500):
                        stump = stump_fit(Xtr, ytr - ptr)
                        ptr, pva = ptr + lr * stump(Xtr), pva + lr * stump(Xva)
                        errs.append(np.mean((pva - yva) ** 2))
                    print(f"lr {lr}: best {min(errs):.0f} at {int(np.argmin(errs)) + 1} trees, after 500: {errs[-1]:.0f}")
            `,
        },
        explain: {
            answer: `Bagging, as in a random forest, is like asking 100 people to guess how many sweets are in a jar and averaging their guesses. Each person is wrong in their own way, some too high and some too low, and the errors largely cancel, so the average is better than almost anyone alone. It works best when the guessers are independent, which is why each tree gets different data and features.\n\nBoosting is like one student correcting their homework again and again. Each pass focuses on the questions still wrong, fixing a little more each time. Bagging mostly reduces variance (wobbly individual guesses); boosting mostly reduces bias (systematic mistakes), and needs a brake (small steps, early stopping) so it doesn't start "correcting" noise.`,
        },
    },
    'f2-t12': {
        derive: {
            answer: `Hinge loss = max(0, 1 − y·score). It is 0 only when the point is on the right side with a margin of at least 1.\n\nPoint 1: y = +1, score 2: 1 − 2 = −1, so max(0, −1) = 0. Correct and safely outside the margin.\nPoint 2: y = +1, score 0.5: 1 − 0.5 = 0.5. Correct side, but inside the margin, so a small loss.\nPoint 3: y = +1, score −0.5: 1 + 0.5 = 1.5. Wrong side: a bigger loss, growing the further it is wrong.\nPoint 4: y = −1, score −3: 1 − 3 = −2, so 0. Correct and safe.\n\nTotal 2.0, mean 0.5. Only points 2 and 3, the ones inside the margin or wrong, affect training; that is why SVMs depend only on the "support vectors".`,
        },
        build: {
            answer: `Minimise λ/2·‖w‖² + mean(hinge loss). The hinge has a corner, so use a subgradient: for points with y·score < 1 the gradient of their loss is −y·x (and −y for the bias); for the others it is 0.\n\nOn two blobs, the learned boundary sits in the gap, with the margin lines (score = +1 and −1) touching the closest points of each class. Those closest points, with y·score ≤ 1, are the support vectors: circle them. Moving any other point wouldn't change the boundary.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                rng = np.random.default_rng(0)
                X = np.vstack([rng.normal([2, 2], 0.7, (50, 2)), rng.normal([-2, -2], 0.7, (50, 2))])
                y = np.array([1] * 50 + [-1] * 50)
                w, b, lam = np.zeros(2), 0.0, 0.01
                for step in range(1, 5001):
                    lr = 1 / (lam * step + 100)
                    inside = y * (X @ w + b) < 1                     # in the margin, or wrong
                    grad_w = lam * w - (y[inside, None] * X[inside]).sum(axis=0) / len(y)
                    grad_b = -y[inside].sum() / len(y)
                    w, b = w - lr * grad_w, b - lr * grad_b

                support = y * (X @ w + b) <= 1 + 1e-3
                print("support vectors:", support.sum(), "| margin width:", round(2 / np.linalg.norm(w), 2))
                xs = np.linspace(-4, 4, 50)
                plt.scatter(X[:, 0], X[:, 1], c=y, s=15)
                for level, style in [(0, "k-"), (1, "k--"), (-1, "k--")]:
                    plt.plot(xs, (level - b - w[0] * xs) / w[1], style)
                plt.scatter(X[support, 0], X[support, 1], s=120, facecolors="none", edgecolors="r")
                plt.ylim(-5, 5); plt.show()
            `,
        },
        break: {
            answer: `C is the weight on the errors (C is like 1/λ): a large C says "mistakes are very expensive", a small C says "a wide road matters more".\n\nWith one outlier on the wrong side:\n• Very large C: the SVM bends over backwards to reduce the outlier's loss. The boundary shifts and tilts towards it, and the margin becomes narrow. One bad point has reshaped the whole model, which usually hurts on new data.\n• Small C: the SVM accepts the outlier as an error, and the boundary stays almost where it was, with a wide margin.\n\nThat is the soft-margin trade-off: C controls how much the model trusts every single training point. Choose it on the validation set.`,
            code: py`
                import numpy as np

                def train_svm(X, y, C, steps=20_000):
                    w, b = np.zeros(2), 0.0
                    for step in range(1, steps + 1):
                        lr = 0.01 / np.sqrt(step)
                        inside = y * (X @ w + b) < 1
                        w -= lr * (w - C * (y[inside, None] * X[inside]).sum(axis=0))
                        b -= lr * (-C * y[inside].sum())
                    return w, b

                rng = np.random.default_rng(0)
                X = np.vstack([rng.normal([2, 2], 0.7, (50, 2)), rng.normal([-2, -2], 0.7, (50, 2)), [[-1.5, -1.5]]])
                y = np.array([1] * 50 + [-1] * 50 + [1])            # last point: +1 deep in the -1 blob
                for C in [100.0, 0.01]:
                    w, b = train_svm(X, y, C)
                    print(f"C = {C}: margin width {2 / np.linalg.norm(w):.2f}, outlier score {X[-1] @ w + b:+.2f}")
            `,
        },
        explain: {
            answer: `Two villages sit on either side of a plain, and you must build a straight road between them that touches no house. Many roads would work, but the best is the widest one: the road whose edges are as far as possible from the nearest houses on each side.\n\nThat road is the SVM's boundary, and its width is the margin. Only the houses right at the edge of the road decide where it goes; those are the support vectors. A wide road is safer: a new house built a little off-pattern is still on the right side.`,
        },
    },
    'f2-t13': {
        derive: {
            answer: `Multiply the prior by each word's probability, for each class (the naive assumption: words are independent given the class).\n\nSpam: P(spam)·P(win | spam)·P(meeting | spam) = 0.3 × 0.2 × 0.01 = 0.0006\nHam: P(ham)·P(win | ham)·P(meeting | ham) = 0.7 × 0.01 × 0.1 = 0.0007\n\nNormalise: P(spam | both words) = 0.0006 / (0.0006 + 0.0007) ≈ 0.46.\n\nSo it is slightly more likely to be ham. The two words pull in opposite directions: "win" is 20 times more common in spam, "meeting" is 10 times more common in ham, and the prior already favours ham, 0.7 to 0.3. Overall odds: (0.3/0.7) × 20 × (1/10) ≈ 0.86, a little under even.`,
        },
        build: {
            answer: `Train: count how often each word appears in spam and in ham messages. Predict: for each class, add up log P(class) and log P(word | class) for every word in the message, and pick the bigger total. Logs turn a product of many small probabilities into a sum, so nothing underflows to 0. Add-one smoothing adds 1 to every word count, so no probability is ever exactly 0.\n\nOn the UCI SMS Spam Collection (5,574 real text messages), this simple filter gets about 98% accuracy on held-out messages, and catches most spam.`,
            code: py`
                import io, re, urllib.request, zipfile
                from collections import Counter
                import numpy as np

                url = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"
                raw = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(url).read())).read("SMSSpamCollection")
                rows = [line.split("\t", 1) for line in raw.decode("utf-8").strip().split("\n")]
                labels = np.array([r[0] == "spam" for r in rows])
                texts = [set(re.findall(r"[a-z']+", r[1].lower())) for r in rows]

                order = np.random.default_rng(0).permutation(len(rows))
                train, test = order[:4500], order[4500:]
                counts = {c: Counter() for c in (True, False)}
                for i in train:
                    counts[labels[i]].update(texts[i])
                vocab = set(counts[True]) | set(counts[False])
                n_class = {c: np.sum(labels[train] == c) for c in (True, False)}

                def log_score(words, c):
                    total = sum(counts[c].values()) + len(vocab)          # add-one smoothing
                    score = np.log(n_class[c] / len(train))
                    for w in words & vocab:
                        score += np.log((counts[c][w] + 1) / total)
                    return score

                pred = np.array([log_score(texts[i], True) > log_score(texts[i], False) for i in test])
                print(f"accuracy {np.mean(pred == labels[test]):.1%}, spam caught {pred[labels[test]].mean():.0%}")
            `,
        },
        break: {
            answer: `Without smoothing, a word that never appeared in any spam message gets P(word | spam) = 0. Because the probabilities are multiplied, one zero makes the whole spam score 0 (in logs, −infinity), whatever else the message says.\n\nSo "WIN a FREE prize, claim now" plus one harmless word the filter never saw in spam is scored as certainly not spam: probability exactly 0. That is a disaster for two reasons: one word vetoes all the other evidence, and spammers can exploit it on purpose by adding an unusual word. It also breaks for new legitimate words.\n\nAdd-one smoothing fixes it: every word gets a small non-zero probability in every class, so an unseen word only nudges the score instead of ending the argument.`,
            code: py`
                import numpy as np

                spam_counts = {"win": 30, "free": 40, "prize": 25, "claim": 20}     # words seen in spam
                total = sum(spam_counts.values())
                message = ["win", "free", "prize", "claim", "giraffe"]           # "giraffe": never seen in spam

                no_smoothing = np.prod([spam_counts.get(w, 0) / total for w in message])
                vocab = 5_000
                smoothed = np.prod([(spam_counts.get(w, 0) + 1) / (total + vocab) for w in message])
                print(no_smoothing, f"{smoothed:.2e}")    # 0.0 versus a small but non-zero number
            `,
        },
        explain: {
            answer: `A spam filter reads an email one word at a time. "Free" makes spam more likely, "meeting" makes it less likely, and it adds up the evidence from each word as if each one were a separate, independent clue. That is the naive assumption: once you know whether an email is spam, each word tells you something on its own, unrelated to the others.\n\nIt is clearly false: "free" and "prize" tend to come together. So the probabilities it outputs are overconfident. But to classify, it only needs the right class to come out on top, and adding up many weak, partly overlapping clues usually still points the right way. It is fast, needs little data, and is a strong baseline for text.`,
        },
    },
    'f2-t14': {
        derive: {
            answer: `Points 1, 2, 3, 10, 11, 12. Start: centre A = 1, centre B = 2.\n\nRound 1, assign each point to the nearer centre: 1 → A. 2 → B (distance 0). 3 → B (1 away, versus 2 from A). 10, 11, 12 → B.\nGroups: A = {1}, B = {2, 3, 10, 11, 12}.\nMove each centre to the mean of its group: A = 1, B = (2 + 3 + 10 + 11 + 12)/5 = 7.6.\n\nRound 2, assign: 1 → A. 2 → A (1 from A, 5.6 from B). 3 → A (2 versus 4.6). 10, 11, 12 → B.\nGroups: A = {1, 2, 3}, B = {10, 11, 12}. Move: A = 2, B = 11.\n\nRound 3, assign: the same groups again, so the centres don't move. Stop.\n\nFinal clusters {1, 2, 3} and {10, 11, 12}, with centres 2 and 11. Even with a bad start (both centres inside the left group), it recovered in two rounds.`,
        },
        build: {
            answer: `k-means++ picks starting centres spread out: the first at random, then each next one with probability proportional to its squared distance from the nearest centre already chosen. Then the usual loop: assign every point to its nearest centre, move each centre to the mean of its points, until nothing changes.\n\nOn three 2-D blobs it converges in a few steps; the plots show the centres jumping to the middle of each blob and the colours settling.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                def kmeans_pp_init(X, k, rng):
                    centres = [X[rng.integers(len(X))]]
                    for _ in range(k - 1):
                        d2 = np.min(((X[:, None, :] - np.array(centres)[None]) ** 2).sum(-1), axis=1)
                        centres.append(X[rng.choice(len(X), p=d2 / d2.sum())])
                    return np.array(centres)

                def kmeans(X, k, seed=0, max_steps=20):
                    rng = np.random.default_rng(seed)
                    centres, history = kmeans_pp_init(X, k, rng), []
                    for _ in range(max_steps):
                        labels = np.argmin(((X[:, None, :] - centres[None]) ** 2).sum(-1), axis=1)
                        history.append((centres.copy(), labels))
                        new = np.array([X[labels == j].mean(axis=0) for j in range(k)])
                        if np.allclose(new, centres):
                            break
                        centres = new
                    return centres, labels, history

                rng = np.random.default_rng(1)
                X = np.vstack([rng.normal(c, 0.6, (60, 2)) for c in ([0, 0], [4, 1], [2, 4])])
                centres, labels, history = kmeans(X, 3)
                print("steps:", len(history), "centres:", centres.round(2).tolist())

                fig, axes = plt.subplots(1, len(history), figsize=(4 * len(history), 3.5))
                for ax, (c, lab) in zip(np.atleast_1d(axes), history):
                    ax.scatter(X[:, 0], X[:, 1], c=lab, s=10)
                    ax.scatter(c[:, 0], c[:, 1], c="red", marker="x", s=150)
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `Random starts: across 20 runs the final loss (the total squared distance of points to their centres) is not always the same. Most runs find the right three blobs, but some get stuck with two centres sharing one blob and one centre covering two blobs, at a clearly higher loss. k-means only finds a local minimum, which is why you run it several times, or use k-means++, and keep the lowest loss.\n\nTwo moons: k-means cuts each moon in half with a straight line, even with the best start. It assumes clusters are round blobs around a centre, because every point simply joins its nearest centre, so the boundary between two clusters is always a straight line halfway between their centres. Curved or stretched clusters need other methods, such as DBSCAN or spectral clustering.`,
            code: py`
                import numpy as np
                from sklearn.datasets import make_moons        # only to make the toy data

                def kmeans(X, k, rng, steps=50):
                    centres = X[rng.choice(len(X), k, replace=False)]      # plain random start
                    for _ in range(steps):
                        labels = np.argmin(((X[:, None] - centres[None]) ** 2).sum(-1), axis=1)
                        centres = np.array([X[labels == j].mean(0) if np.any(labels == j) else centres[j] for j in range(k)])
                    return labels, ((X - centres[labels]) ** 2).sum()

                rng = np.random.default_rng(3)
                blobs = np.vstack([rng.normal(c, 0.5, (50, 2)) for c in ([0, 0], [3, 0], [0, 3], [3, 3])])
                losses = sorted(round(kmeans(blobs, 4, rng)[1]) for _ in range(20))
                print("final loss over 20 runs:", losses)

                X, moon = make_moons(300, noise=0.05, random_state=0)
                labels, _ = kmeans(X, 2, rng)
                agree = max(np.mean(labels == moon), np.mean(labels != moon))
                print(f"k-means matches the two moons on only {agree:.0%} of points")
            `,
        },
        explain: {
            answer: `Place k ice-cream vans on a beach. Each customer walks to the nearest van. Then each van drives to the middle of its own customers, to be closer to them. Now some customers find a different van is nearest, so they switch. Repeat: customers pick the nearest van, vans move to the middle of their customers, until nobody switches. The vans' final spots are the cluster centres, and each van's customers are a cluster.\n\nWhere you first park the vans matters: start two vans next to each other and they may end up splitting one crowd while another crowd shares one van. That is why k-means is run several times, or started with k-means++.`,
        },
    },
    'f2-t15': {
        derive: {
            answer: `The eigenvalues of the covariance matrix are the variances along each principal direction, so the share of variance a component keeps is its eigenvalue divided by the total.\n\nTotal: 5 + 3 + 1.5 + 0.5 = 10.\nTop two: 5 + 3 = 8.\nFraction kept: 8 / 10 = 80%.\n\nThe first component alone keeps 50%, and adding the third would bring it to 95%.`,
        },
        build: {
            answer: `Flatten each 28 × 28 image into 784 numbers, centre the data, take the SVD, keep the top k directions, and reconstruct each image as mean + (coordinates × directions).\n\nOn 10,000 MNIST training images, 10 components keep about half the variance and give blurry but recognisable shapes; 50 keep about 80% and the digits are clear; 150 keep about 95% and look almost like the originals, from 784 numbers down to 150.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from torchvision import datasets             # only to download MNIST

                mnist = datasets.MNIST("data", train=True, download=True)
                X = mnist.data[:10_000].numpy().reshape(10_000, -1) / 255.0      # (10000, 784)
                mean = X.mean(axis=0)
                U, S, Vt = np.linalg.svd(X - mean, full_matrices=False)
                ratio = np.cumsum(S**2) / np.sum(S**2)

                ks = [10, 50, 150]
                fig, axes = plt.subplots(4, len(ks) + 1, figsize=(8, 8))
                for row in range(4):
                    axes[row, 0].imshow(X[row].reshape(28, 28), cmap="gray")
                    for col, k in enumerate(ks, start=1):
                        recon = mean + (X[row] - mean) @ Vt[:k].T @ Vt[:k]
                        axes[row, col].imshow(recon.reshape(28, 28), cmap="gray")
                for col, k in enumerate(ks, start=1):
                    axes[0, col].set_title(f"{k}: {ratio[k - 1]:.0%}")
                axes[0, 0].set_title("original")
                for ax in axes.flat:
                    ax.axis("off")
                plt.show()
                print({k: round(float(ratio[k - 1]), 3) for k in ks})
            `,
        },
        break: {
            answer: `Make two features: x₁ varies a lot (standard deviation 10) but is the same for both classes, and x₂ varies little (standard deviation 0.5) but its mean is −1 for one class and +1 for the other. All the class information is in the small, quiet direction.\n\nPCA keeps the direction with the most variance, so with one component it keeps x₁ and throws x₂ away. A simple classifier on that one component does no better than a coin flip, about 50%, while the same classifier on x₂ alone gets about 98%.\n\nThe lesson: PCA is unsupervised. It looks for spread, not for what predicts the label, and "most variance" is not the same as "most useful". Check how a downstream model performs after reducing dimensions.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n = 1000
                y = rng.integers(0, 2, n)
                X = np.column_stack([rng.normal(0, 10, n),                      # big spread, no signal
                                     np.where(y == 1, 1.0, -1.0) + rng.normal(0, 0.5, n)])   # small spread, all signal
                Xc = X - X.mean(axis=0)
                first = np.linalg.svd(Xc, full_matrices=False)[2][0]
                z = Xc @ first
                print("first component:", first.round(3))                     # ≈ [±1, 0]: it kept x₁
                accuracy = lambda feature: max(np.mean((feature > 0) == y), np.mean((feature < 0) == y))
                print(f"on the PCA component: {accuracy(z):.0%}, on x₂: {accuracy(Xc[:, 1]):.0%}")
            `,
        },
        explain: {
            answer: `Photographing a 3D object: you get to keep only a 2D picture, so you choose the angle that shows the most detail. A teapot photographed from the side shows its spout and handle; from directly above, it looks like a circle. PCA chooses the camera angle that keeps the most spread in the data, so the flattened picture loses as little as possible.\n\nIt helps when most of the spread is the interesting part: compressing images, removing near-duplicate features, speeding up a model, or plotting high-dimensional data. It hurts when the important detail is small: if the one thing you care about is a tiny mark on the teapot's lid, the "best" side view hides it. PCA keeps the biggest variation, not the most useful one.`,
        },
    },
    'f2-t16': {
        derive: {
            answer: `Two components, with weights π₁, π₂, means μ₁, μ₂ and variances σ₁², σ₂². N(x | μ, σ²) is the normal density.\n\nE-step: how much does each component explain each point? The responsibility of component k for point i:\nrᵢₖ = πₖ·N(xᵢ | μₖ, σₖ²) / (π₁·N(xᵢ | μ₁, σ₁²) + π₂·N(xᵢ | μ₂, σ₂²))\nFor each point, the two responsibilities add up to 1.\n\nM-step: refit each component as a weighted average, using the responsibilities as weights. With Nₖ = Σᵢ rᵢₖ, the "effective number of points" in component k:\nμₖ = Σᵢ rᵢₖ·xᵢ / Nₖ\nσₖ² = Σᵢ rᵢₖ·(xᵢ − μₖ)² / Nₖ\nπₖ = Nₖ / n\n\nRepeat E and M until the log-likelihood stops increasing. It can never go down from one iteration to the next.`,
        },
        build: {
            answer: `The 2-D version uses full covariance matrices, so each component is an ellipse. Each iteration: E-step responsibilities from the multivariate normal density (computed in logs for safety), then the M-step weighted means, covariances and weights. A tiny amount (1e-6) is added to each covariance's diagonal to keep it invertible.\n\nThe log-likelihood rises at every iteration and flattens when it has converged, and the ellipses move from their starting guesses onto the true clusters.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                def log_gauss(X, mean, cov):
                    d = X - mean
                    inv, (_, logdet) = np.linalg.inv(cov), np.linalg.slogdet(cov)
                    return -0.5 * (np.sum(d @ inv * d, axis=1) + logdet + X.shape[1] * np.log(2 * np.pi))

                def ellipse(ax, mean, cov, colour):
                    vals, vecs = np.linalg.eigh(cov)
                    t = np.linspace(0, 2 * np.pi, 100)
                    pts = mean + (vecs @ (2 * np.sqrt(vals)[:, None] * np.array([np.cos(t), np.sin(t)]))).T
                    ax.plot(pts[:, 0], pts[:, 1], color=colour)

                rng = np.random.default_rng(0)
                X = np.vstack([rng.multivariate_normal([0, 0], [[1, 0.8], [0.8, 1]], 200),
                               rng.multivariate_normal([4, 1], [[0.5, 0], [0, 1.5]], 150)])
                k = 2
                means, covs, weights = X[rng.choice(len(X), k, replace=False)], [np.eye(2)] * k, np.full(k, 1 / k)
                logliks, snapshots = [], []
                for it in range(30):
                    logp = np.column_stack([np.log(weights[j]) + log_gauss(X, means[j], covs[j]) for j in range(k)])
                    total = np.logaddexp.reduce(logp, axis=1)
                    logliks.append(total.sum())
                    r = np.exp(logp - total[:, None])                         # E-step
                    Nk = r.sum(axis=0)                                        # M-step
                    means = (r.T @ X) / Nk[:, None]
                    covs = [((r[:, j, None] * (X - means[j])).T @ (X - means[j])) / Nk[j] + 1e-6 * np.eye(2) for j in range(k)]
                    weights = Nk / len(X)
                    if it in (0, 2, 29):
                        snapshots.append((it, means.copy(), [c.copy() for c in covs]))

                assert all(b >= a - 1e-6 for a, b in zip(logliks, logliks[1:]))   # never goes down
                print("weights:", weights.round(2), "means:", means.round(2).tolist())
                fig, axes = plt.subplots(1, 4, figsize=(16, 3.5))
                for ax, (it, m, c) in zip(axes, snapshots):
                    ax.scatter(X[:, 0], X[:, 1], s=5, c="grey")
                    for j, colour in enumerate(["C0", "C1"]):
                        ellipse(ax, m[j], c[j], colour)
                    ax.set_title(f"iteration {it + 1}")
                axes[3].plot(logliks); axes[3].set_title("log-likelihood")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `Both components starting at exactly the same place: they stay identical forever. In the E-step each one takes exactly half of every point (identical formulas give identical numbers), so the M-step computes the same new mean and variance for both. Nothing ever breaks the tie. Start them at different random points, or from k-means.\n\nA component sitting on a single point: the log-likelihood can be made as large as you like by shrinking that component's variance towards 0, because a normal density squeezed onto one point becomes infinitely tall there. EM happily follows, the variance collapses to 0, and the likelihood goes to infinity. It is a useless solution: one component "explains" one point perfectly.\n\nHow to stop it: add a small constant to every variance (the 1e-6 on the covariance diagonal in the build above), put a prior on the variances, or restart any component whose variance gets too small or that owns almost no points.`,
            code: py`
                import numpy as np

                x0 = 2.0
                for sigma in [1.0, 0.1, 0.01, 0.001]:
                    density = np.exp(-0.5 * ((x0 - x0) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))
                    print(f"sigma {sigma}: density at the point {density:,.2f}, log {np.log(density):.1f}")
                # the likelihood grows without limit as the variance shrinks to 0
            `,
        },
        explain: {
            answer: `You have a pile of socks from two families, and you want to know each family's typical sock size, but nobody has labelled which sock belongs to whom.\n\nEM goes back and forth. First guess each family's typical size. Then, for every sock, estimate how likely it is to belong to each family: a large sock is probably 80% the dad's family, 20% the other one (the E-step). Then update each family's typical size using those shares, so each sock counts partly towards both (the M-step). Repeat until the guesses settle.\n\nThe difference from k-means: k-means makes hard choices (each sock goes entirely to one family) and only learns centres. EM makes soft choices (probabilities) and also learns each family's spread and share, so clusters can be different sizes and shapes.`,
        },
    },
    'f2-t17': {
        derive: {
            answer: `Three points (not in a line), say at the corners of a triangle. There are 2³ = 8 ways to label them + or −:\n• All the same (2 labellings): put the line off to one side of all three.\n• One point different from the other two (6 labellings): any single corner of a triangle can be cut off from the other two by a straight line.\nSo a line can produce all 8 labellings: it "shatters" 3 points.\n\nFour points, say the corners of a square. Label opposite corners alike: top-left and bottom-right +, top-right and bottom-left − (the XOR pattern). A line would need both + points on one side and both − points on the other. But the segment joining the two + points crosses the segment joining the two − points, and a line can't separate two segments that cross. So at least one labelling of 4 points fails. (In fact no set of 4 points in the plane can be shattered by a line.)\n\nThat makes the VC dimension of a straight-line classifier in 2D equal to 3.`,
        },
        build: {
            answer: `Use random ReLU features: draw a fixed random projection for each feature, apply ReLU, and fit a linear model on top with np.linalg.lstsq, which returns the minimum-norm solution once there are more features than points. Here the inputs have 10 dimensions and there are 100 noisy training points.\n\nThe test error first falls (best around 25 features), then climbs to a sharp peak at exactly 100 features, the number of training points, where it is about 90 times worse, then falls again and keeps improving all the way to 2,000 features, ending close to the first dip. That second fall is double descent.\n\nAt the peak there is exactly one way to fit every noisy point, and it is a wild one. With many more features there are endless ways to fit the data, and the minimum-norm one is smooth.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                rng = np.random.default_rng(0)
                d, n = 10, 100
                beta = rng.normal(size=d) / np.sqrt(d)
                truth = lambda X: np.tanh(2 * X @ beta)
                X_tr, X_te = rng.normal(size=(n, d)), rng.normal(size=(2000, d))
                W = rng.normal(size=(d, 2000)) / np.sqrt(d)               # 2,000 random features, fixed
                features = lambda X, p: np.maximum(0, X @ W[:, :p])

                ps = [10, 25, 50, 75, 90, 100, 110, 125, 150, 200, 400, 1000, 2000]
                errors = []
                for p in ps:
                    errs = []
                    for seed in range(5):                                  # median over 5 noise draws
                        y = truth(X_tr) + np.random.default_rng(seed).normal(0, 0.2, n)
                        w = np.linalg.lstsq(features(X_tr, p), y, rcond=None)[0]   # minimum-norm fit
                        errs.append(np.mean((features(X_te, p) @ w - truth(X_te)) ** 2))
                    errors.append(np.median(errs))
                print([(p, round(float(e), 3)) for p, e in zip(ps, errors)])
                # [(10, 0.338), (25, 0.164), ... (100, 14.477), ... (2000, 0.222)]
                plt.plot(ps, errors, marker="o"); plt.axvline(n, linestyle=":", color="grey")
                plt.xscale("log"); plt.yscale("log"); plt.xlabel("number of features"); plt.ylabel("test error")
                plt.show()
            `,
        },
        break: {
            answer: `With more label noise, the peak at "number of features = number of training points" gets much taller: in the run below, about 5 with no noise, 14 with noise 0.2 and 74 with noise 0.5. Far to the right, the error still comes back down.\n\nWhy: at that point the model has just enough freedom to pass exactly through every training point, noise included, and there is only one way to do it. To hit every noisy point it must swing wildly between them, and the more noise there is, the wilder the swings. Below the peak the model can't fit the noise; far above it, the minimum-norm solution spreads the noise thinly across many features.\n\nEven with no label noise there is still a peak here, because these features can't represent the target exactly, and that mismatch acts like noise. The fix is the usual one: a little regularisation. In this setup, ridge with a small λ (0.01) instead of the exact minimum-norm fit brings the error at 100 features down from tens to about 0.2, flattening the peak.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                d, n = 10, 100
                beta = rng.normal(size=d) / np.sqrt(d)
                truth = lambda X: np.tanh(2 * X @ beta)
                X_tr, X_te = rng.normal(size=(n, d)), rng.normal(size=(2000, d))
                W = rng.normal(size=(d, 2000)) / np.sqrt(d)
                features = lambda X, p: np.maximum(0, X @ W[:, :p])
                for noise in [0.0, 0.2, 0.5]:
                    row = []
                    for p in [25, 100, 2000]:
                        errs = []
                        for seed in range(5):
                            y = truth(X_tr) + np.random.default_rng(seed).normal(0, noise, n)
                            w = np.linalg.lstsq(features(X_tr, p), y, rcond=None)[0]
                            errs.append(np.mean((features(X_te, p) @ w - truth(X_te)) ** 2))
                        row.append(round(float(np.median(errs)), 2))
                    print(f"noise {noise}: test error at 25 / 100 / 2000 features = {row}")
            `,
        },
        explain: {
            answer: `The classic picture says: a model that is too simple underfits, a model that is too big overfits, and the best is in between, so test error is a U shape. Double descent says that if you keep making the model bigger, past the point where it can fit every training example perfectly, test error can come down again, often lower than before.\n\nIt surprised people because classical theory said a model that fits every training point, noise and all, must generalise badly. But modern neural networks are exactly that: huge, fitting their training data almost perfectly, and still working well. The explanation is that when there are many ways to fit the data, training tends to find a simple, smooth one, and the worst behaviour happens only at the in-between size where there is just one way to fit.`,
        },
    },
};
