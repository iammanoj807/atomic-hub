import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 3 · Deep learning foundations. One good answer for each practice exercise.
// Training runs use small subsets so they finish in a few minutes on a laptop CPU;
// on a GPU, or with all the data, the numbers get better.

export const phase3Answers: Record<string, TopicAnswers> = {
    'f3-t1': {
        derive: {
            answer: `A layer from a inputs to b outputs has an a × b weight matrix plus b biases.\n\nLayer 1, 784 → 128: 784 × 128 = 100,352 weights + 128 biases = 100,480 parameters.\nLayer 2, 128 → 10: 128 × 10 = 1,280 weights + 10 biases = 1,290 parameters.\n\nTotal: 100,480 + 1,290 = 101,770 parameters.\n\nNotice that almost all of them are in the first layer: wide inputs are expensive. That is one reason CNNs, which share a small filter across the whole image, need far fewer parameters for images.`,
            code: py`
                import torch.nn as nn
                model = nn.Sequential(nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10))
                print(sum(p.numel() for p in model.parameters()))     # 101770
            `,
        },
        build: {
            answer: `For a batch X of shape (batch, 784): h = relu(X @ W1 + b1) has shape (batch, 128), and the scores are h @ W2 + b2 with shape (batch, 10). The biases broadcast across the batch. Assert every shape: shape bugs are the most common bugs in deep learning code, and they are silent when broadcasting hides them.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                W1, b1 = rng.normal(0, np.sqrt(2 / 784), (784, 128)), np.zeros(128)
                W2, b2 = rng.normal(0, np.sqrt(2 / 128), (128, 10)), np.zeros(10)

                def forward(X):
                    assert X.ndim == 2 and X.shape[1] == 784, X.shape
                    h = np.maximum(0, X @ W1 + b1)
                    assert h.shape == (X.shape[0], 128), h.shape
                    scores = h @ W2 + b2
                    assert scores.shape == (X.shape[0], 10), scores.shape
                    return scores

                print(forward(rng.random((32, 784))).shape)        # (32, 10)
            `,
        },
        break: {
            answer: `If every weight starts at the same number, every hidden neuron computes exactly the same thing. They get the same input, do the same sum, and give the same output. In the backward pass they receive the same gradient, so the update changes them all by the same amount, and they are still identical afterwards. Forever.\n\nSo a layer of 128 neurons behaves like one neuron copied 128 times: the network can't learn different features. This is "symmetry", and random initialisation is what breaks it. (Biases can start at 0; the weights must not all be equal.)`,
            code: py`
                import torch
                import torch.nn as nn

                torch.manual_seed(0)
                model = nn.Sequential(nn.Linear(4, 5), nn.Tanh(), nn.Linear(5, 1))
                for p in model.parameters():
                    nn.init.constant_(p, 0.3)                      # every weight the same
                opt = torch.optim.SGD(model.parameters(), lr=0.1)
                X, y = torch.randn(64, 4), torch.randn(64, 1)
                for _ in range(50):
                    opt.zero_grad()
                    nn.functional.mse_loss(model(X), y).backward()
                    opt.step()
                W = model[0].weight
                print(torch.allclose(W, W[0].expand_as(W)))         # True: all 5 neurons still identical
            `,
        },
        explain: {
            answer: `Think of rows of judges. In the first row, each judge looks at all the evidence (the input numbers), weighs each piece in their own way, adds it up, and gives a score; if the score is below zero they say nothing (that is the ReLU). The next row of judges doesn't see the evidence at all, only the first row's scores, and combines those in their own way. The last row gives the final verdict, such as one score per digit.\n\nTraining adjusts how much every judge trusts every piece of what they hear. Because each row builds on the one before, later rows can recognise complicated patterns made out of simpler ones.`,
        },
    },
    'f3-t2': {
        derive: {
            answer: `ReLU: relu(x) = max(0, x). Derivative: 1 if x > 0, 0 if x < 0 (undefined at exactly 0; frameworks use 0). Largest value: 1.\n\nSigmoid: σ(x) = 1/(1 + e⁻ˣ). Derivative: σ(x)(1 − σ(x)). It is largest at x = 0, where σ = 0.5, giving 0.5 × 0.5 = 0.25.\n\nTanh: derivative 1 − tanh²(x). Largest at x = 0, where tanh = 0, giving 1.\n\nWhy it matters: in backprop the gradient is multiplied by these at every layer. With sigmoid, each layer multiplies by at most 0.25, so ten layers shrink it by at least 0.25¹⁰ ≈ 0.000001. ReLU passes 1 for active units, which is why deep networks use ReLU-like activations.`,
        },
        build: {
            answer: `Same MLP (2 → 32 → 32 → 1), same training, three activations, on the two-moons data.\n\nWith no activation, the whole network is one linear function, so its boundary is a straight line, and it gets about 88% because a line can't follow the curve. With ReLU and with tanh, the boundary bends around the moons and accuracy reaches 100%. ReLU's boundary is made of straight pieces with corners; tanh's is smoother.`,
            code: py`
                import numpy as np
                import torch
                import torch.nn as nn
                import matplotlib.pyplot as plt
                from sklearn.datasets import make_moons           # only to make the toy data

                X, y = make_moons(500, noise=0.1, random_state=0)
                X, y = torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)
                grid = torch.tensor(np.stack(np.meshgrid(np.linspace(-1.5, 2.5, 200), np.linspace(-1, 1.5, 200)), -1).reshape(-1, 2), dtype=torch.float32)

                fig, axes = plt.subplots(1, 3, figsize=(13, 4))
                for ax, (name, act) in zip(axes, [("none", nn.Identity()), ("ReLU", nn.ReLU()), ("tanh", nn.Tanh())]):
                    torch.manual_seed(0)
                    model = nn.Sequential(nn.Linear(2, 32), act, nn.Linear(32, 32), act, nn.Linear(32, 1))
                    opt = torch.optim.Adam(model.parameters(), lr=0.01)
                    for _ in range(1000):
                        opt.zero_grad()
                        nn.functional.binary_cross_entropy_with_logits(model(X).squeeze(1), y).backward()
                        opt.step()
                    with torch.no_grad():
                        acc = ((model(X).squeeze(1) > 0) == y.bool()).float().mean().item()
                        ax.contourf(grid[:, 0].reshape(200, 200), grid[:, 1].reshape(200, 200),
                                    (model(grid) > 0).reshape(200, 200), alpha=0.3)
                    ax.scatter(X[:, 0], X[:, 1], c=y, s=6); ax.set_title(f"{name}: {acc:.0%}")
                    print(name, f"{acc:.0%}")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `20 sigmoid layers: the gradient that reaches the first layer is tiny, about 10¹⁷ times smaller than at the last layer in the run below, shrinking by a factor of about 8 per layer, because every layer multiplies it by σ′ ≤ 0.25 (and by weights smaller than 1). The early layers effectively stop learning: vanishing gradients.\n\nDead ReLUs: train with a huge learning rate and one big update can push a unit's bias so negative that its input is below 0 for every example. Then it always outputs 0, its gradient is always 0, and it never recovers. In the run below, about a quarter of the hidden units are dead after 50 steps with a learning rate of 10, against none with 0.1. Fixes: a sensible learning rate, good initialisation, or Leaky ReLU / GELU, which keep a small slope below 0.`,
            code: py`
                import torch
                import torch.nn as nn

                torch.manual_seed(0)
                layers = []
                for _ in range(20):
                    layers += [nn.Linear(64, 64), nn.Sigmoid()]
                deep = nn.Sequential(*layers, nn.Linear(64, 1))
                deep(torch.randn(128, 64)).pow(2).mean().backward()
                norms = [deep[i].weight.grad.norm().item() for i in range(0, 40, 2)]
                print(f"gradient at layer 20: {norms[-1]:.1e}, at layer 1: {norms[0]:.1e}")

                X = torch.randn(512, 10)
                y = (X[:, 0] > 0).long()
                for lr in [0.1, 10.0]:
                    torch.manual_seed(0)
                    net = nn.Sequential(nn.Linear(10, 100), nn.ReLU(), nn.Linear(100, 2))
                    opt = torch.optim.SGD(net.parameters(), lr=lr)
                    for _ in range(50):
                        opt.zero_grad(); nn.functional.cross_entropy(net(X), y).backward(); opt.step()
                    with torch.no_grad():
                        dead = (net[1](net[0](X)).max(dim=0).values == 0).float().mean().item()
                    print(f"lr {lr}: {dead:.0%} of hidden units dead")
            `,
        },
        explain: {
            answer: `A layer with no activation computes W·x + b, a linear function. Feed that into another linear layer and you get W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂). That is again just one matrix times x plus one bias: a single linear layer.\n\nHowever many linear layers you stack, they collapse into one, so the network can only ever draw straight lines (or flat planes) between classes. A non-linear activation between the layers, like ReLU, stops the collapse: each layer can now bend the space, and stacking them builds complicated curved shapes.`,
        },
    },
    'f3-t3': {
        derive: {
            answer: `Forward pass, keeping every value:\na = w1·x = 0.5 × 2 = 1\nh = relu(a) = 1 (a > 0, so ReLU passes it)\ny = w2·h = −1 × 1 = −1\nL = (y − target)² = (−1 − 3)² = 16\n\nBackward pass, from the loss back:\n∂L/∂y = 2(y − target) = 2 × (−4) = −8\n∂L/∂w2 = ∂L/∂y × h = −8 × 1 = −8\n∂L/∂h = ∂L/∂y × w2 = −8 × (−1) = 8\n∂L/∂a = ∂L/∂h × relu′(a) = 8 × 1 = 8\n∂L/∂w1 = ∂L/∂a × x = 8 × 2 = 16\n(and ∂L/∂x = ∂L/∂a × w1 = 4, if you need it)\n\nSanity check: y = −1 is far below the target 3, so we want y bigger. ∂L/∂w2 < 0 says "increase w2", which raises y. ∂L/∂w1 > 0 says "decrease w1": since w2 is negative, a smaller h makes y less negative. Both make sense.`,
            code: py`
                import torch
                w1 = torch.tensor(0.5, requires_grad=True)
                w2 = torch.tensor(-1.0, requires_grad=True)
                L = (w2 * torch.relu(w1 * 2.0) - 3.0) ** 2
                L.backward()
                print(L.item(), w1.grad.item(), w2.grad.item())     # 16.0 16.0 -8.0
            `,
        },
        build: {
            answer: `Forward: z1 = X·W1 + b1, h = relu(z1), z2 = h·W2 + b2, p = softmax(z2), loss = mean of −log p[correct class].\n\nBackward, in reverse:\ndz2 = (p − Y) / n (softmax and cross-entropy together, Y one-hot)\ndW2 = hᵀ·dz2, db2 = sum of dz2 over the batch\ndh = dz2·W2ᵀ\ndz1 = dh × (z1 > 0)\ndW1 = Xᵀ·dz1, db1 = sum of dz1\n\nThe gradient checker nudges every parameter by ±h and compares with these formulas. The relative error is around 1e-7 or smaller for all four parameter arrays, so the backward pass is right.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n, d, hidden, k = 8, 5, 6, 3
                X, labels = rng.normal(size=(n, d)), rng.integers(0, k, n)
                Y = np.eye(k)[labels]
                params = {"W1": rng.normal(0, 0.5, (d, hidden)), "b1": np.zeros(hidden),
                          "W2": rng.normal(0, 0.5, (hidden, k)), "b2": np.zeros(k)}

                def loss_and_grads(P):
                    z1 = X @ P["W1"] + P["b1"]; h = np.maximum(0, z1)
                    z2 = h @ P["W2"] + P["b2"]
                    z2 = z2 - z2.max(axis=1, keepdims=True)
                    p = np.exp(z2) / np.exp(z2).sum(axis=1, keepdims=True)
                    loss = -np.mean(np.log(p[np.arange(n), labels]))
                    dz2 = (p - Y) / n
                    dh = dz2 @ P["W2"].T
                    dz1 = dh * (z1 > 0)
                    return loss, {"W1": X.T @ dz1, "b1": dz1.sum(0), "W2": h.T @ dz2, "b2": dz2.sum(0)}

                _, grads = loss_and_grads(params)
                for name in params:
                    numeric = np.zeros_like(params[name])
                    for i in np.ndindex(params[name].shape):
                        old = params[name][i]
                        params[name][i] = old + 1e-5; up = loss_and_grads(params)[0]
                        params[name][i] = old - 1e-5; down = loss_and_grads(params)[0]
                        params[name][i] = old
                        numeric[i] = (up - down) / 2e-5
                    rel = np.abs(numeric - grads[name]).max() / (np.abs(numeric).max() + 1e-12)
                    print(name, f"relative error {rel:.1e}")
            `,
        },
        break: {
            answer: `Yes, the checker catches it, and loudly. With dW2 = dz2ᵀ·h instead of hᵀ·dz2, the shape is wrong, (3, 6) instead of (6, 3), so the comparison crashes at once. With square matrices a missing transpose doesn't crash, and that is the dangerous case: the gradient has the right shape but the wrong values. The relative error is then large, around 1 (100%), compared with about 1e-7 for correct code.\n\nThat gap is what makes gradient checking so useful: correct backprop agrees to about 7 digits; a bug disagrees in the first digit. A relative error above about 1e-4 almost always means a bug.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                X, W = rng.normal(size=(4, 4)), rng.normal(size=(4, 4))   # square: no shape error to save you
                loss = lambda W: np.sum((X @ W) ** 2) / 2
                right = X.T @ (X @ W)                                     # dL/dW
                wrong = (X @ W).T @ X                                     # the forgotten transpose: same shape!
                numeric = np.zeros_like(W)
                for i in np.ndindex(W.shape):
                    E = np.zeros_like(W); E[i] = 1e-5
                    numeric[i] = (loss(W + E) - loss(W - E)) / 2e-5
                rel = lambda g: np.abs(g - numeric).max() / np.abs(numeric).max()
                print(f"correct: {rel(right):.1e}, missing transpose: {rel(wrong):.1e}")
            `,
        },
        explain: {
            answer: `A factory turns out a faulty product. You don't blame everyone equally: you trace back station by station. The last station asks "how much of the fault came from my step?", keeps that share of the blame, and passes the rest back to the station that fed it, scaled by how strongly that station's work affects its own. Every station does the same, all the way to the start.\n\nThat is backprop: the loss is the fault, each layer is a station, and the "how much did this step affect the next?" is the local derivative. The blame gets shared at every point where one output fed several things, or several inputs fed one thing: a weight's gradient is its input times the blame arriving from above, and a neuron that feeds several later neurons adds up the blame from all of them.`,
        },
    },
    'f3-t4': {
        derive: {
            answer: `Break L = (a·b + c)² into simple steps, each one a node:\nm = a·b\ns = m + c\nL = s²\n\nLocal derivative on each edge:\nL ← s: ∂L/∂s = 2s\ns ← m: ∂s/∂m = 1\ns ← c: ∂s/∂c = 1\nm ← a: ∂m/∂a = b\nm ← b: ∂m/∂b = a\n\nMultiply along each path from L back to an input:\n∂L/∂a = 2s · 1 · b, ∂L/∂b = 2s · 1 · a, ∂L/∂c = 2s · 1.\n\nWith a = 2, b = −3, c = 10: m = −6, s = 4, L = 16, so ∂L/∂a = 8 × (−3) = −24, ∂L/∂b = 8 × 2 = 16 and ∂L/∂c = 8.`,
            code: py`
                a ──┐
                    (×) ── m ──┐            each edge carries its local derivative:
                b ──┘          (+) ── s ── (²) ── L      L←s: 2s,  s←m: 1,  s←c: 1
                c ─────────────┘                         m←a: b,   m←b: a
            `,
            codeLanguage: 'text',
        },
        build: {
            answer: `A Value holds a number, its gradient, the Values it was made from, and a small function that knows how to pass gradient back to them. backward() sorts the graph so every node comes after the nodes that use it, sets the output's gradient to 1, and calls each node's function in reverse order.\n\nThe gradients use += so that a Value used in several places adds up all of its contributions (see the break exercise). A tiny MLP built from Values learns four points; its loss drops close to 0.`,
            code: py`
                import math
                import random

                class Value:
                    def __init__(self, data, parents=()):
                        self.data, self.grad, self._parents, self._back = data, 0.0, parents, lambda: None
                    def __add__(self, other):
                        other = other if isinstance(other, Value) else Value(other)
                        out = Value(self.data + other.data, (self, other))
                        def back():
                            self.grad += out.grad
                            other.grad += out.grad
                        out._back = back
                        return out
                    def __mul__(self, other):
                        other = other if isinstance(other, Value) else Value(other)
                        out = Value(self.data * other.data, (self, other))
                        def back():
                            self.grad += other.data * out.grad
                            other.grad += self.data * out.grad
                        out._back = back
                        return out
                    def tanh(self):
                        t = math.tanh(self.data)
                        out = Value(t, (self,))
                        def back():
                            self.grad += (1 - t * t) * out.grad
                        out._back = back
                        return out
                    def exp(self):
                        out = Value(math.exp(self.data), (self,))
                        def back():
                            self.grad += out.data * out.grad
                        out._back = back
                        return out
                    __radd__, __rmul__ = __add__, __mul__
                    def __neg__(self): return self * -1
                    def __sub__(self, other): return self + (-other)
                    def backward(self):
                        order, seen = [], set()
                        def visit(v):
                            if v not in seen:
                                seen.add(v)
                                for p in v._parents:
                                    visit(p)
                                order.append(v)
                        visit(self)
                        self.grad = 1.0
                        for v in reversed(order):
                            v._back()

                random.seed(0)
                neuron = lambda n: [Value(random.uniform(-1, 1)) for _ in range(n + 1)]
                hidden = [neuron(3) for _ in range(4)]
                out_neuron = neuron(4)
                params = [p for n in hidden + [out_neuron] for p in n]
                def mlp(x):
                    h = [sum((w * xi for w, xi in zip(n[:-1], x)), n[-1]).tanh() for n in hidden]
                    return sum((w * hi for w, hi in zip(out_neuron[:-1], h)), out_neuron[-1]).tanh()

                xs = [[2, 3, -1], [3, -1, 0.5], [0.5, 1, 1], [1, 1, -1]]
                ys = [1, -1, -1, 1]
                for step in range(100):
                    loss = sum(((mlp(x) - y) * (mlp(x) - y) for x, y in zip(xs, ys)), Value(0))
                    for p in params:
                        p.grad = 0.0
                    loss.backward()
                    for p in params:
                        p.data -= 0.05 * p.grad
                print(round(loss.data, 4), [round(mlp(x).data, 2) for x in xs])
            `,
        },
        break: {
            answer: `For y = x · x the gradient should be 2x: at x = 3, 6. If the backward function assigns (self.grad = ...) instead of adding (self.grad += ...), it gives 3.\n\nWhy: x appears twice, as both inputs of the multiplication. The backward step writes "other.data × out.grad" into x.grad for the first input (3), then writes it again for the second input (3) and overwrites the first. The true gradient is the sum of both paths: 3 + 3 = 6.\n\nThe rule: when a value is used in several places, its gradient is the sum of the gradients from every use. Always accumulate with +=, and reset gradients to 0 before each backward pass. That is exactly why PyTorch makes you call zero_grad().`,
            code: py`
                class Broken:
                    def __init__(self, data): self.data, self.grad = data, 0.0
                    def __mul__(self, other):
                        out = Broken(self.data * other.data)
                        def back():
                            self.grad = other.data * out.grad       # BUG: = overwrites
                            other.grad = self.data * out.grad
                        out.back = back
                        return out

                x = Broken(3.0); y = x * x; y.grad = 1.0; y.back()
                print(x.grad)       # 3.0, wrong

                import torch
                xt = torch.tensor(3.0, requires_grad=True); (xt * xt).backward()
                print(xt.grad.item())   # 6.0, right: both uses add up
            `,
        },
        explain: {
            answer: `On the way forward, autograd drops a breadcrumb at every step: "here I multiplied a by b, and these were the numbers". That trail is the computational graph. When you call backward(), it follows the breadcrumbs home in reverse order, and at each crumb applies the chain rule using the numbers it saved, so every input ends up knowing its gradient, without you writing a single derivative.\n\nIt costs memory because the breadcrumbs have to be kept until the backward pass: every intermediate result of the forward pass, for every example in the batch. That is why training uses far more memory than running the model, and why torch.no_grad() during evaluation saves memory: it tells autograd not to drop crumbs.`,
        },
    },
    'f3-t5': {
        derive: {
            answer: `Softmax: pᵢ = e^(zᵢ) / Σₖ e^(zₖ). Cross-entropy with a one-hot y: L = −Σᵢ yᵢ log pᵢ.\n\nStep 1, the softmax derivative: ∂pᵢ/∂zⱼ = pᵢ(δᵢⱼ − pⱼ), where δᵢⱼ is 1 if i = j and 0 otherwise. (Raising zⱼ raises pⱼ and lowers every other share.)\n\nStep 2, the chain rule:\n∂L/∂zⱼ = Σᵢ (∂L/∂pᵢ)(∂pᵢ/∂zⱼ) = Σᵢ (−yᵢ/pᵢ) · pᵢ(δᵢⱼ − pⱼ) = −Σᵢ yᵢ(δᵢⱼ − pⱼ) = −yⱼ + pⱼ·Σᵢ yᵢ.\n\nStep 3: the labels add up to 1, so Σᵢ yᵢ = 1, and ∂L/∂zⱼ = pⱼ − yⱼ.\n\nSo the gradient is just "predicted probabilities minus the truth". For logits [2, 1, 0.1] and correct class 0: p ≈ [0.66, 0.24, 0.10], gradient ≈ [−0.34, 0.24, 0.10].`,
        },
        build: {
            answer: `Stable softmax subtracts each row's maximum before exp. For the loss, compute log-probabilities directly with log-sum-exp: log pᵢ = zᵢ − log Σ e^(zₖ), which never takes log of 0.\n\nSoftmax regression is just one linear layer, 784 → 10, trained with gradient (p − Y) / n. On MNIST, five passes over the training set with mini-batches of 128 reach about 92% test accuracy, which is the classic number for a linear model. An MLP gets about 98%.`,
            code: py`
                import numpy as np
                from torchvision import datasets              # only to download MNIST

                train, test = datasets.MNIST("data", train=True, download=True), datasets.MNIST("data", train=False, download=True)
                Xtr, ytr = train.data.numpy().reshape(-1, 784) / 255.0, train.targets.numpy()
                Xte, yte = test.data.numpy().reshape(-1, 784) / 255.0, test.targets.numpy()

                def log_softmax(z):
                    z = z - z.max(axis=1, keepdims=True)
                    return z - np.log(np.exp(z).sum(axis=1, keepdims=True))

                rng = np.random.default_rng(0)
                W, b = np.zeros((784, 10)), np.zeros(10)
                for epoch in range(5):
                    for idx in np.array_split(rng.permutation(len(Xtr)), len(Xtr) // 128):
                        logp = log_softmax(Xtr[idx] @ W + b)
                        loss = -logp[np.arange(len(idx)), ytr[idx]].mean()
                        g = np.exp(logp); g[np.arange(len(idx)), ytr[idx]] -= 1; g /= len(idx)   # p − y
                        W -= 0.5 * Xtr[idx].T @ g
                        b -= 0.5 * g.sum(axis=0)
                    acc = (np.argmax(Xte @ W + b, axis=1) == yte).mean()
                    print(f"epoch {epoch + 1}: last batch loss {loss:.3f}, test accuracy {acc:.1%}")
            `,
        },
        break: {
            answer: `Softmax of [1000, 1000] without subtracting the max: exp(1000) overflows to inf, and inf / (inf + inf) = nan. The right answer is obviously [0.5, 0.5]. Subtracting the max turns it into softmax of [0, 0], which is exactly [0.5, 0.5].\n\nlog(softmax) computed directly breaks the other way. For logits [0, −1000], softmax gives [1, 0] (e⁻¹⁰⁰⁰ underflows to 0), and log(0) = −inf. If the correct class is the second one, the loss becomes inf and the gradients nan. Log-sum-exp computes log p = z − logsumexp(z) = [0, −1000] exactly, with no inf anywhere.\n\nThat is why frameworks fuse them: PyTorch's CrossEntropyLoss takes raw logits and does the stable log-softmax inside. Never apply softmax yourself before it.`,
            code: py`
                import numpy as np

                z = np.array([1000.0, 1000.0])
                with np.errstate(over="ignore", invalid="ignore"):
                    print(np.exp(z) / np.exp(z).sum())                    # [nan nan]
                print(np.exp(z - z.max()) / np.exp(z - z.max()).sum())     # [0.5 0.5]

                z = np.array([0.0, -1000.0])
                p = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
                with np.errstate(divide="ignore"):
                    print(np.log(p))                                       # [  0. -inf]
                print(z - (z.max() + np.log(np.exp(z - z.max()).sum())))   # [    0. -1000.]
            `,
        },
        explain: {
            answer: `Softmax turns raw scores into shares that add up to 100%, like turning vote counts into vote shares. But it first raises e to the power of each score, and exponentials grow fast. So a small lead in scores becomes a big lead in shares: scores [2, 1, 0.1] give shares of about [66%, 24%, 10%], and scores [4, 2, 0.2] give about [87%, 12%, 1%].\n\nSo softmax exaggerates the leader: a candidate ahead by a couple of points of score walks away with most of the vote. That makes the model's top choice clear and gives useful gradients, but it also means models can sound very confident even when the underlying scores are only slightly apart.`,
        },
    },
    'f3-t6': {
        derive: {
            answer: `g is the gradient, η the learning rate.\n\nSGD: w ← w − η·g\n\nMomentum: v ← β·v + g, then w ← w − η·v (β ≈ 0.9). v is a running sum of recent gradients: speed that builds up.\n\nRMSProp: s ← ρ·s + (1 − ρ)·g², then w ← w − η·g / (√s + ε). Each weight's step is divided by its typical gradient size.\n\nAdam: both ideas together.\nm ← β₁·m + (1 − β₁)·g (β₁ = 0.9)\nv ← β₂·v + (1 − β₂)·g² (β₂ = 0.999)\nm̂ = m / (1 − β₁ᵗ), v̂ = v / (1 − β₂ᵗ)\nw ← w − η·m̂ / (√v̂ + ε)\n\nWhy bias correction: m and v start at 0, so early on they are averages of a few gradients and a lot of that starting 0. After step 1, m = 0.1·g and v = 0.001·g², far too small. Dividing by (1 − βᵗ) scales them back up to proper averages. Without it, m/√v would be 0.1/√0.001 ≈ 3.2 times too big at step 1, so the first few hundred steps would be wrongly sized. As t grows, βᵗ → 0 and the correction fades away.`,
        },
        build: {
            answer: `Race all four on the Rosenbrock function, f(x, y) = (1 − x)² + 100(y − x²)², a long, curved, narrow valley with its minimum at (1, 1). Start at (−1.5, 2) and take 3,000 steps, each optimiser with a learning rate that suits it.\n\nPlain SGD has to use a tiny learning rate (any larger and it bounces off the steep walls and blows up), so after 3,000 steps it has barely moved: loss about 5. Momentum, with the same learning rate, builds up speed along the valley floor and gets to a loss of about 0.05. RMSProp scales each direction by its typical gradient, so it copes with the steep walls, and gets to about 0.2. Adam combines both ideas and lands on the minimum (1, 1) almost exactly. Plot all four loss curves on one log-scale axis to compare.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                f = lambda p: (1 - p[0]) ** 2 + 100 * (p[1] - p[0] ** 2) ** 2
                grad = lambda p: np.array([-2 * (1 - p[0]) - 400 * p[0] * (p[1] - p[0] ** 2), 200 * (p[1] - p[0] ** 2)])

                def run(kind, lr, steps=3000):
                    p, m, v, losses = np.array([-1.5, 2.0]), np.zeros(2), np.zeros(2), []
                    for t in range(1, steps + 1):
                        g = grad(p)
                        if kind == "SGD":
                            p = p - lr * g
                        elif kind == "momentum":
                            m = 0.9 * m + g; p = p - lr * m
                        elif kind == "RMSProp":
                            v = 0.99 * v + 0.01 * g**2; p = p - lr * g / (np.sqrt(v) + 1e-8)
                        else:
                            m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g**2
                            p = p - lr * (m / (1 - 0.9**t)) / (np.sqrt(v / (1 - 0.999**t)) + 1e-8)
                        losses.append(f(p))
                    return p, losses

                for kind, lr in [("SGD", 1e-4), ("momentum", 1e-4), ("RMSProp", 1e-3), ("Adam", 2e-2)]:
                    p, losses = run(kind, lr)
                    print(f"{kind:9s} ends at {p.round(3)}, loss {losses[-1]:.2e}")
                    plt.plot(losses, label=kind)
                plt.yscale("log"); plt.xlabel("step"); plt.ylabel("f"); plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `Adam with a learning rate 100 times too big (2.0 instead of 0.02 here): Adam's step size per weight is roughly the learning rate, whatever the gradient, so every step can jump by up to about 2 units. The minimum sits at the bottom of a very narrow valley, and steps that size can't settle into it: after 3,000 steps it is still at about (0.7, 0.49), a loss of about 0.09, while a learning rate of 0.02 lands on (1, 1) almost exactly.\n\nSGD with a learning rate 100 times too small (1e-6): every step is tiny, so after 3,000 steps it has barely moved from the start. The loss curve is almost flat: no explosion, just no progress. Both are learning-rate failures, but they look completely different on a loss curve.\n\nNo bias correction: the first steps come out several times too large. On this problem the corrected first step moves each coordinate by exactly the learning rate (0.02), while the uncorrected one moves it by about 0.063, 3.2 times as far, and most of the next few steps are also 2 to 4 times too big. That can be enough to throw a sensitive model off at the start, which is one reason warm-up schedules exist.`,
            code: py`
                import numpy as np

                f = lambda p: (1 - p[0]) ** 2 + 100 * (p[1] - p[0] ** 2) ** 2
                grad = lambda p: np.array([-2 * (1 - p[0]) - 400 * p[0] * (p[1] - p[0] ** 2), 200 * (p[1] - p[0] ** 2)])

                def adam(lr, correct=True, steps=3000):
                    p, m, v, sizes = np.array([-1.5, 2.0]), np.zeros(2), np.zeros(2), []
                    for t in range(1, steps + 1):
                        g = grad(p)
                        m, v = 0.9 * m + 0.1 * g, 0.999 * v + 0.001 * g**2
                        mh, vh = (m / (1 - 0.9**t), v / (1 - 0.999**t)) if correct else (m, v)
                        step = lr * mh / (np.sqrt(vh) + 1e-8)
                        sizes.append(np.abs(step).max()); p = p - step
                    return p, sizes

                print("Adam lr 2.0 ends at", adam(2.0)[0].round(2))
                p = np.array([-1.5, 2.0])
                for _ in range(3000):
                    p = p - 1e-6 * grad(p)
                print("SGD lr 1e-6 ends at", p.round(3), "(started at [-1.5, 2.0])")
                print("first steps, corrected:  ", np.round(adam(0.02)[1][:5], 3))
                print("first steps, uncorrected:", np.round(adam(0.02, correct=False)[1][:5], 3))
            `,
        },
        explain: {
            answer: `Plain SGD is a hiker who only looks at the ground under their feet: every step goes straight downhill from where they stand, so in a narrow valley they zig-zag from wall to wall.\n\nMomentum is a ball rolling downhill. It keeps its speed from step to step, so the zig-zags cancel out and it rolls fast along the valley floor, even over small bumps.\n\nAdam is a careful ball: it also keeps momentum, but it watches how rough each direction is. Where the ground is steep and bumpy, it takes small steps; where it is flat and smooth, it takes bigger ones. So one learning rate works well for every direction at once.`,
        },
    },
    'f3-t7': {
        derive: {
            answer: `One output of a layer is y = Σᵢ wᵢxᵢ, summed over fan_in inputs. Assume the w's and x's are independent and the w's have mean 0.\n\nVar(y) = Σᵢ Var(wᵢxᵢ) = fan_in × Var(w) × E[x²].\n(For independent w and x with E[w] = 0, Var(wx) = Var(w)·E[x²]. If x also has mean 0, E[x²] = Var(x).)\n\nSo Var(y) ≈ fan_in × Var(w) × Var(x). To keep the variance the same from layer to layer, we need fan_in × Var(w) = 1.\n\nThe ReLU factor of 2: after ReLU, half of the values become 0. For a symmetric pre-activation z, E[relu(z)²] = Var(z)/2. So each ReLU layer halves the signal, and to make up for it we need fan_in × Var(w) / 2 = 1.\n\nHe initialisation: Var(w) = 2 / fan_in, so the standard deviation is √(2 / fan_in). For fan_in = 512, std ≈ 0.0625.`,
        },
        build: {
            answer: `Push a batch of random inputs through 20 layers of width 512 with ReLU, and record the standard deviation of the activations after each layer.\n\nWith tiny weights (std 0.01) the signal shrinks by about 6 times per layer (0.01 × √(512/2) = 0.16) and is essentially 0 after a few layers. With huge weights (std 1.0) it grows by about 16 times per layer (1.0 × √256) until it is astronomically large, around 10²⁴ by layer 20. With He initialisation (√(2/512) ≈ 0.0625) it stays at the same level all the way through: a flat line.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                rng = np.random.default_rng(0)
                width = 512
                for name, std in [("tiny 0.01", 0.01), ("He", np.sqrt(2 / width)), ("huge 1.0", 1.0)]:
                    x, stds = rng.normal(size=(256, width)), []
                    for _ in range(20):
                        x = np.maximum(0, x @ rng.normal(0, std, (width, width)))
                        stds.append(x.std())
                    print(f"{name:10s} layer 1: {stds[0]:.2e}, layer 20: {stds[-1]:.2e}")
                    plt.plot(range(1, 21), stds, marker="o", label=name)
                plt.yscale("log"); plt.xlabel("layer"); plt.ylabel("std of activations"); plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `std = 1.0: activations grow by about 16 times per layer, so by layer 20 they are enormous, and so are the gradients on the way back. The first update multiplies weights by numbers in the billions, and the loss becomes inf or nan almost at once: exploding gradients.\n\nstd = 0.01: activations shrink to almost 0, and the gradient reaching the first layer is so tiny it rounds to exactly 0. The loss stays at ln 2 ≈ 0.69, guessing, because the network's output is basically 0 whatever the input: vanishing gradients.\n\nWith He initialisation, the same 20-layer network trains normally. The fix for both failures is the same: choose the weight scale so the signal keeps its size, and add normalisation layers or residual connections for very deep networks.`,
            code: py`
                import torch
                import torch.nn as nn

                X, y = torch.randn(256, 64), torch.randint(0, 2, (256,))
                for name, std in [("std 1.0", 1.0), ("std 0.01", 0.01), ("He", (2 / 64) ** 0.5)]:
                    torch.manual_seed(0)
                    layers = []
                    for _ in range(20):
                        lin = nn.Linear(64, 64); nn.init.normal_(lin.weight, 0, std); nn.init.zeros_(lin.bias)
                        layers += [lin, nn.ReLU()]
                    model = nn.Sequential(*layers, nn.Linear(64, 2))
                    opt = torch.optim.SGD(model.parameters(), lr=0.01)
                    first = None
                    for step in range(100):
                        opt.zero_grad()
                        loss = nn.functional.cross_entropy(model(X), y)
                        loss.backward()
                        if first is None:
                            first = model[0].weight.grad.norm().item()
                        opt.step()
                    print(f"{name:8s}: first-layer gradient {first:.1e}, loss after 100 steps {loss.item():.3g}")
            `,
        },
        explain: {
            answer: `Passing a message down a line of 50 people. If everyone whispers a bit more quietly than they heard it, the message fades to nothing by the end of the line. If everyone says it a bit louder, it turns into shouting and noise.\n\nGradients travel back through a deep network the same way, multiplied at every layer. If each layer multiplies by a bit less than 1 (0.9 fifty times is 0.005), the gradient vanishes and the early layers stop learning. If each multiplies by a bit more than 1 (1.1 fifty times is 117), it explodes. Good initialisation, normalisation and residual connections make every person pass the message on at the same volume.`,
        },
    },
    'f3-t8': {
        derive: {
            answer: `Batch values [1, 2, 3].\n\nMean: (1 + 2 + 3) / 3 = 2.\nVariance (batch norm divides by n): ((1 − 2)² + 0² + (3 − 2)²) / 3 = 2/3. Standard deviation √(2/3) ≈ 0.816.\n\nNormalise: (x − 2) / 0.816 gives [−1.225, 0, 1.225].\n\nWith γ = 1 and β = 0 that is also the output. The result has mean 0 and variance 1 across the batch. During training, γ and β are learned, so the layer can rescale and shift the output if that helps.`,
        },
        build: {
            answer: `A 10-layer MLP on 10,000 MNIST images, trained with plain SGD for two epochs, with and without a BatchNorm1d after each linear layer.\n\nWithout batch norm, this 10-layer network barely learns at all in two epochs: the loss is still about 2.30, the value for pure guessing. With batch norm, at the same learning rate, it is down to about 0.14. Each layer's inputs keep a steady scale, so a bigger learning rate is safe and the deep stack trains like a shallow one.\n\nLayer norm normalises each example across its own features: subtract that row's mean, divide by its standard deviation, then scale and shift. With the same γ, β and ε it matches torch.nn.LayerNorm to within about 1e-6.`,
            code: py`
                import torch
                import torch.nn as nn
                from torchvision import datasets

                mnist = datasets.MNIST("data", train=True, download=True)
                X = mnist.data[:10_000].reshape(-1, 784).float() / 255.0
                y = mnist.targets[:10_000]

                def deep_mlp(batch_norm):
                    layers, width = [], 784
                    for _ in range(10):
                        layers += [nn.Linear(width, 128)] + ([nn.BatchNorm1d(128)] if batch_norm else []) + [nn.ReLU()]
                        width = 128
                    return nn.Sequential(*layers, nn.Linear(128, 10))

                for bn in [False, True]:
                    torch.manual_seed(0)
                    model = deep_mlp(bn)
                    opt = torch.optim.SGD(model.parameters(), lr=0.05)
                    for epoch in range(2):
                        for idx in torch.randperm(10_000).split(64):
                            opt.zero_grad()
                            loss = nn.functional.cross_entropy(model(X[idx]), y[idx])
                            loss.backward(); opt.step()
                    model.eval()
                    with torch.no_grad():
                        print(f"batch norm {bn}: loss {nn.functional.cross_entropy(model(X), y).item():.3f}")

                def layer_norm(x, gamma, beta, eps=1e-5):
                    mean = x.mean(dim=-1, keepdim=True)
                    var = x.var(dim=-1, unbiased=False, keepdim=True)
                    return gamma * (x - mean) / torch.sqrt(var + eps) + beta

                x = torch.randn(4, 16)
                ln = nn.LayerNorm(16)
                print(torch.allclose(layer_norm(x, ln.weight, ln.bias), ln(x), atol=1e-6))   # True
            `,
        },
        break: {
            answer: `With batch size 1 in training mode, batch norm computes the mean and variance of a single value. The mean is that value and the variance is 0, so the output is (x − x) / √ε = 0 for every input. Every example looks the same to the rest of the network. PyTorch refuses outright for fully connected batch norm: "Expected more than 1 value per channel when training".\n\nThe fix for prediction is model.eval(). In eval mode, batch norm uses the running mean and variance it averaged during training instead of the batch's own statistics, so a single example is fine, and the output no longer depends on what else is in the batch.\n\nIf you must train with tiny batches, use layer norm or group norm instead, which don't depend on the batch at all.`,
            code: py`
                import torch
                import torch.nn as nn

                bn = nn.BatchNorm1d(4)
                for _ in range(100):                          # learn running statistics from real batches
                    bn(torch.randn(32, 4) * 3 + 5)
                one = torch.randn(1, 4) * 3 + 5
                try:
                    bn.train(); bn(one)
                except ValueError as e:
                    print(e)
                bn.eval()
                print(bn(one))                                 # fine: uses the running mean and variance
                print(bn.running_mean.round(decimals=1))       # close to 5
            `,
        },
        explain: {
            answer: `Grading on a curve: instead of using raw marks, you rescale them so the average becomes 0 and the spread becomes 1.\n\nBatch norm curves each exam question across all the students who sat it today: for one feature, it uses the mean and spread of that feature across the batch. That works well with a big class, but it is odd with only one or two students, and it needs a remembered average for later exams (eval mode).\n\nLayer norm curves each student across all of their own questions: for one example, it uses the mean and spread of that example's features. It doesn't care who else is in the room, which is why it suits transformers, small batches and text of any length.`,
        },
    },
    'f3-t9': {
        derive: {
            answer: `Dropout with rate 0.5 keeps each activation with probability 0.5 and sets it to 0 otherwise.\n\nWithout rescaling, the expected value of a kept-or-dropped activation a is 0.5·a + 0.5·0 = 0.5a. So during training, the next layer sees inputs that are half as big on average as at test time, when nothing is dropped. The network would be trained for one scale and used at another.\n\nDividing the kept values by 0.5 (the keep probability) fixes this: E = 0.5·(a / 0.5) + 0.5·0 = a. The expected value during training now matches test time, so at test time you can simply switch dropout off with no other change. This is "inverted dropout", what PyTorch does.`,
        },
        build: {
            answer: `Train a large MLP (784 → 512 → 512 → 10) on only 1,000 MNIST images, so it overfits: training accuracy hits 100% while validation accuracy stalls. Then add one regulariser at a time and keep the ones before it.\n\nTypical results on this run: the plain model is a little under 90% on validation; dropout and weight decay each add under a point; augmentation (small random shifts of each image, so the model never sees the exact same image twice) helps most; early stopping keeps the best epoch instead of the last. Exact numbers vary from run to run by a point, so the trend matters more than any single value.`,
            code: py`
                import torch
                import torch.nn as nn
                from torchvision import datasets

                mnist = datasets.MNIST("data", train=True, download=True)
                X = mnist.data.float().unsqueeze(1) / 255.0
                y = mnist.targets
                Xtr, ytr, Xva, yva = X[:1000], y[:1000], X[50_000:55_000], y[50_000:55_000]

                def shift(images):                                  # augmentation: random shifts of up to 2 pixels
                    dx, dy = torch.randint(-2, 3, (2,)).tolist()
                    return torch.roll(images, shifts=(dy, dx), dims=(2, 3))

                def run(dropout=0.0, weight_decay=0.0, augment=False, early_stop=False, epochs=60):
                    torch.manual_seed(0)
                    model = nn.Sequential(nn.Flatten(), nn.Linear(784, 512), nn.ReLU(), nn.Dropout(dropout),
                                          nn.Linear(512, 512), nn.ReLU(), nn.Dropout(dropout), nn.Linear(512, 10))
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=weight_decay)
                    history = []
                    for _ in range(epochs):
                        model.train()
                        for idx in torch.randperm(1000).split(64):
                            xb = shift(Xtr[idx]) if augment else Xtr[idx]
                            opt.zero_grad(); nn.functional.cross_entropy(model(xb), ytr[idx]).backward(); opt.step()
                        model.eval()
                        with torch.no_grad():
                            history.append((model(Xva).argmax(1) == yva).float().mean().item())
                    return max(history) if early_stop else history[-1]

                print(f"plain:          {run():.1%}")
                print(f"+ dropout:      {run(dropout=0.5):.1%}")
                print(f"+ weight decay: {run(dropout=0.5, weight_decay=0.1):.1%}")
                print(f"+ augmentation: {run(dropout=0.5, weight_decay=0.1, augment=True):.1%}")
                print(f"+ early stop:   {run(dropout=0.5, weight_decay=0.1, augment=True, early_stop=True):.1%}")
            `,
        },
        break: {
            answer: `With dropout left on at test time, every prediction drops a random half of the units. Run the same image twice and you can get two different answers, and accuracy falls, because each prediction comes from a crippled, random sub-network instead of the full one. In the run below, the same trained model scores about 1.5 points lower with dropout on (about 90.6% against 92.3%), and the score changes every time you evaluate.\n\nThe fix: call model.eval() before evaluating or serving, and model.train() before training again. (Turning dropout on deliberately at test time and averaging many predictions, "Monte Carlo dropout", is a real technique for estimating uncertainty, but it is a choice, not an accident.)`,
            code: py`
                import torch
                import torch.nn as nn
                from torchvision import datasets

                mnist = datasets.MNIST("data", train=True, download=True)
                X, y = mnist.data.reshape(-1, 784).float() / 255.0, mnist.targets
                torch.manual_seed(0)
                model = nn.Sequential(nn.Linear(784, 256), nn.ReLU(), nn.Dropout(0.5), nn.Linear(256, 10))
                opt = torch.optim.Adam(model.parameters(), lr=1e-3)
                for idx in torch.randperm(20_000).split(64):
                    opt.zero_grad(); nn.functional.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()

                Xva, yva = X[50_000:], y[50_000:]
                with torch.no_grad():
                    model.eval()
                    print("eval mode:", round((model(Xva).argmax(1) == yva).float().mean().item(), 4))
                    model.train()                                   # the mistake
                    for _ in range(3):
                        print("dropout on:", round((model(Xva).argmax(1) == yva).float().mean().item(), 4))
            `,
        },
        explain: {
            answer: `A football team that trains with random players missing in every session. Nobody can rely on one star striker to score every goal, because the striker might not be there. So every player learns to be useful, and the team learns several ways to win. On match day, the whole team plays, and it is stronger and more flexible for it.\n\nDropout does the same to a network: during training it switches off a random set of neurons at each step, so no single neuron can carry the answer on its own, and the network can't memorise the training set through a few fragile pathways. At test time every neuron is switched on.`,
        },
    },
    'f3-t10': {
        derive: {
            answer: `for xb, yb in loader:                 # 1. take the next batch\n    opt.zero_grad()                   # 2. clear the old gradients\n    loss = loss_fn(model(xb), yb)     # 3. forward pass and loss\n    loss.backward()                   # 4. compute new gradients\n    opt.step()                        # 5. update the weights\n\nWhy each line:\n1. The DataLoader hands out shuffled mini-batches.\n2. PyTorch adds gradients into .grad, so without clearing them each step's gradient would include every previous step's.\n3. Run the model and measure how wrong it is.\n4. Autograd fills .grad for every parameter.\n5. The optimiser uses those gradients to change the weights.\n\nAround it: model.train() before the loop, and for validation model.eval() with torch.no_grad().`,
        },
        build: {
            answer: `nn.Module defines the model's layers in __init__ and the computation in forward. The DataLoader shuffles and batches the training set. After each epoch, the validation loop switches to model.eval() (so dropout and batch norm behave as at test time) and wraps everything in torch.no_grad() (no gradients needed, so it is faster and uses less memory), then switches back with model.train().\n\nThree epochs reach about 97% validation accuracy.`,
            code: py`
                import torch
                import torch.nn as nn
                from torch.utils.data import DataLoader, TensorDataset
                from torchvision import datasets

                class MLP(nn.Module):
                    def __init__(self):
                        super().__init__()
                        self.net = nn.Sequential(nn.Linear(784, 256), nn.ReLU(), nn.Dropout(0.2), nn.Linear(256, 10))
                    def forward(self, x):
                        return self.net(x.flatten(1))

                mnist = datasets.MNIST("data", train=True, download=True)
                X, y = mnist.data.float() / 255.0, mnist.targets
                train = DataLoader(TensorDataset(X[:50_000], y[:50_000]), batch_size=128, shuffle=True)
                val = DataLoader(TensorDataset(X[50_000:], y[50_000:]), batch_size=1000)

                torch.manual_seed(0)
                model, loss_fn = MLP(), nn.CrossEntropyLoss()
                opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                for epoch in range(3):
                    model.train()
                    for xb, yb in train:
                        opt.zero_grad()
                        loss = loss_fn(model(xb), yb)
                        loss.backward()
                        opt.step()
                    model.eval()
                    correct = 0
                    with torch.no_grad():
                        for xb, yb in val:
                            correct += (model(xb).argmax(1) == yb).sum().item()
                    print(f"epoch {epoch + 1}: validation accuracy {correct / 10_000:.1%}")
            `,
        },
        break: {
            answer: `No opt.zero_grad(): gradients pile up. Step 500's gradient is really the sum of all 500 gradients so far, so the steps keep getting bigger and point in stale directions. At first it can even look fine, because the pile acts like a big push downhill. But soon the steps are far too big: in the run below the loss climbs back to about 2.3 (pure guessing) with spikes above 10, while the correct loop keeps falling to about 0.4. (Adam partly hides it because it divides by the gradient size, but the updates are still wrong.)\n\nNo model.eval() with dropout: validation runs with half the units randomly switched off (here dropout is 0.5), so the score is lower than the model really deserves and changes each time you evaluate. You might pick the wrong checkpoint, or think a good model is bad.`,
            code: py`
                import torch
                import torch.nn as nn
                from torchvision import datasets

                mnist = datasets.MNIST("data", train=True, download=True)
                X, y = mnist.data.reshape(-1, 784).float() / 255.0, mnist.targets
                for zero_grad in [True, False]:
                    torch.manual_seed(0)
                    model = nn.Sequential(nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10))
                    opt = torch.optim.SGD(model.parameters(), lr=0.05)
                    losses = []
                    for idx in torch.randperm(60_000).split(64)[:900]:
                        if zero_grad:
                            opt.zero_grad()
                        loss = nn.functional.cross_entropy(model(X[idx]), y[idx])
                        loss.backward(); opt.step(); losses.append(loss.item())
                    print(f"zero_grad {zero_grad}: loss at steps 10, 200, 500, 900 = "
                          f"{[round(losses[i], 2) for i in (9, 199, 499, 899)]}, worst after step 100: {max(losses[100:]):.1f}")

                torch.manual_seed(0)
                model = nn.Sequential(nn.Linear(784, 256), nn.ReLU(), nn.Dropout(0.5), nn.Linear(256, 10))
                opt = torch.optim.Adam(model.parameters(), lr=1e-3)
                for idx in torch.randperm(20_000).split(64):
                    opt.zero_grad(); nn.functional.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()
                with torch.no_grad():
                    model.eval(); right = (model(X[50_000:]).argmax(1) == y[50_000:]).float().mean().item()
                    model.train(); wrong = (model(X[50_000:]).argmax(1) == y[50_000:]).float().mean().item()
                print(f"validation with eval(): {right:.2%}, forgetting eval(): {wrong:.2%}")
            `,
        },
        explain: {
            answer: `It is a kitchen routine, repeated for every batch. Get the ingredients: the DataLoader hands you the next batch. Clean the pan: zero_grad clears the last round's gradients so they don't mix in. Cook: the forward pass runs the model. Taste: the loss says how far off the dish is. Work out what to change: backward computes the gradients. Adjust the recipe: the optimiser's step changes the weights.\n\nThen do it again with the next batch. Once you have been through every batch, that is one epoch. And when you serve the food (validation), you switch to "serving mode", model.eval(), and stop taking notes, torch.no_grad().`,
        },
    },
    'f3-t11': {
        derive: {
            answer: `Take a 5 × 5 image where columns 1 and 2 are dark (0) and columns 3 to 5 are bright (1). Every row is [0, 0, 1, 1, 1].\n\nUse the vertical-edge filter\n[−1, 0, 1]\n[−1, 0, 1]\n[−1, 0, 1]\nwhich computes (right column − left column) of each 3 × 3 patch, summed over its 3 rows.\n\nWith no padding and stride 1 the output is 3 × 3. For the patch starting at column j, the answer is 3 × (pixel in column j + 2 − pixel in column j):\nj = 1 (columns 1–3): 3 × (1 − 0) = 3\nj = 2 (columns 2–4): 3 × (1 − 0) = 3\nj = 3 (columns 3–5): 3 × (1 − 1) = 0\nEvery row of the output is [3, 3, 0]: strong responses exactly where the patch covers the dark-to-bright edge, and 0 in the flat bright area.\n\nWith padding 0 and stride 2: output size = (5 − 3 + 2·0) / 2 + 1 = 2, so 2 × 2, keeping the patches at columns 1 and 3: each row is [3, 0].`,
            code: py`
                import numpy as np
                import torch
                import torch.nn.functional as F

                image = np.tile([0, 0, 1, 1, 1], (5, 1)).astype(np.float32)
                kernel = np.array([[-1, 0, 1]] * 3, dtype=np.float32)
                t = lambda a: torch.tensor(a)[None, None]
                print(F.conv2d(t(image), t(kernel))[0, 0])               # every row [3, 3, 0]
                print(F.conv2d(t(image), t(kernel), stride=2)[0, 0])     # 2 x 2, every row [3, 0]
            `,
        },
        build: {
            answer: `The loop version slides the filter over every position and sums the elementwise products. The vectorised version cuts out every patch at once (NumPy's sliding_window_view), then uses one einsum. Both match torch.nn.functional.conv2d exactly (deep learning "convolution" doesn't flip the filter, unlike the maths definition).\n\nThe small CNN (two conv-ReLU-pool blocks, then a linear layer) on CIFAR-10 reaches about 60% test accuracy after two epochs on the CPU (54% after one). Random guessing is 10%. More epochs, more channels and augmentation push a CNN past 80%.`,
            code: py`
                import numpy as np
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from numpy.lib.stride_tricks import sliding_window_view
                from torchvision import datasets

                def conv2d_loops(x, w):                              # x: (C, H, W), w: (O, C, k, k)
                    O, C, k, _ = w.shape
                    H, W = x.shape[1] - k + 1, x.shape[2] - k + 1
                    out = np.zeros((O, H, W), dtype=np.float32)
                    for o in range(O):
                        for i in range(H):
                            for j in range(W):
                                out[o, i, j] = np.sum(x[:, i:i + k, j:j + k] * w[o])
                    return out

                def conv2d_fast(x, w):
                    patches = sliding_window_view(x, w.shape[2:], axis=(1, 2))   # (C, H, W, k, k)
                    return np.einsum("chwij,ocij->ohw", patches, w)

                rng = np.random.default_rng(0)
                x, w = rng.normal(size=(3, 8, 8)).astype(np.float32), rng.normal(size=(4, 3, 3, 3)).astype(np.float32)
                ref = F.conv2d(torch.tensor(x)[None], torch.tensor(w))[0].numpy()
                assert np.allclose(conv2d_loops(x, w), ref, atol=1e-4) and np.allclose(conv2d_fast(x, w), ref, atol=1e-4)

                train, test = datasets.CIFAR10("data", train=True, download=True), datasets.CIFAR10("data", train=False, download=True)
                Xtr = torch.tensor(train.data).permute(0, 3, 1, 2).float() / 255.0
                Xte = torch.tensor(test.data).permute(0, 3, 1, 2).float() / 255.0
                ytr, yte = torch.tensor(train.targets), torch.tensor(test.targets)
                torch.manual_seed(0)
                cnn = nn.Sequential(nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                    nn.Flatten(), nn.Linear(64 * 8 * 8, 10))
                opt = torch.optim.Adam(cnn.parameters(), lr=1e-3)
                for epoch in range(2):
                    for idx in torch.randperm(50_000).split(128):
                        opt.zero_grad(); F.cross_entropy(cnn(Xtr[idx]), ytr[idx]).backward(); opt.step()
                    with torch.no_grad():
                        acc = (cnn(Xte).argmax(1) == yte).float().mean().item()
                    print(f"epoch {epoch + 1}: CIFAR-10 test accuracy {acc:.1%}")
            `,
        },
        break: {
            answer: `Shifting the test digits by 3 pixels: the MLP's accuracy falls sharply (from about 94% to about 49% here), because each of its weights is tied to one exact pixel position, so a shifted "7" lands on weights that never saw a "7" there. The CNN falls much less (from about 97% to about 72%), because the same filter is applied at every position, so a shifted edge is still detected, just shifted; pooling then adds a little tolerance to small shifts. It still drops, because the final linear layer is tied to positions; global average pooling or training with shifted images closes most of the gap.\n\nRemoving pooling shrinks the receptive field. Each 3 × 3 convolution only adds 2 pixels to what a unit can see; each 2 × 2 pooling doubles the step size for every later layer. With four 3 × 3 convolutions, a unit at the top sees a 9 × 9 patch without pooling, but a 38 × 38 patch with pooling after the first three. Without pooling, the top layer can't relate parts of the image that are far apart, unless you add many more layers, or use stride or dilation.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from torchvision import datasets

                mnist, test = datasets.MNIST("data", train=True, download=True), datasets.MNIST("data", train=False, download=True)
                X, y = mnist.data[:20_000].float().unsqueeze(1) / 255.0, mnist.targets[:20_000]
                Xte, yte = test.data.float().unsqueeze(1) / 255.0, test.targets
                models = {
                    "MLP": nn.Sequential(nn.Flatten(), nn.Linear(784, 256), nn.ReLU(), nn.Linear(256, 10)),
                    "CNN": nn.Sequential(nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                         nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                         nn.Flatten(), nn.Linear(32 * 7 * 7, 10)),
                }
                for name, model in models.items():
                    torch.manual_seed(0)
                    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
                    for _ in range(2):
                        for idx in torch.randperm(20_000).split(64):
                            opt.zero_grad(); F.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()
                    with torch.no_grad():
                        normal = (model(Xte).argmax(1) == yte).float().mean().item()
                        shifted = (model(torch.roll(Xte, shifts=3, dims=3)).argmax(1) == yte).float().mean().item()
                    print(f"{name}: {normal:.1%} normally, {shifted:.1%} shifted 3 pixels right")

                def receptive_field(layers):                        # each layer: (kernel, stride)
                    field, jump = 1, 1
                    for k, s in layers:
                        field, jump = field + (k - 1) * jump, jump * s
                    return field
                print(receptive_field([(3, 1)] * 4), receptive_field([(3, 1), (2, 2)] * 3 + [(3, 1)]))   # 9 38
            `,
        },
        explain: {
            answer: `Scan a page with a magnifying glass, looking for one particular pattern, say a vertical edge. At each spot you note how strongly the pattern appears there, and the notes form a new, smaller "page" that shows where the pattern is. That magnifying glass is a filter, and sliding it everywhere is convolution: the same small set of weights is reused at every position, so it finds the pattern wherever it is.\n\nA layer has many glasses, each looking for a different pattern. The next layer scans the notes from the first, so it finds patterns made of patterns: edges, then corners and textures, then eyes and wheels, then faces and cars.`,
        },
    },
    'f3-t12': {
        derive: {
            answer: `For y = x + F(x), the chain rule gives dy/dx = 1 + F′(x): the 1 comes from the shortcut, F′(x) from the block.\n\nThrough a stack of blocks, the gradient is a product. In a plain network it is F′₁ · F′₂ · … · F′₅₀. If each factor is about 0.1, that is 0.1⁵⁰: the gradient vanishes, and the early layers can't learn.\n\nWith residual blocks it is (1 + F′₁)(1 + F′₂)…(1 + F′₅₀). Even if every F′ is small, each factor is close to 1, so the product stays close to 1. Expanding the product also shows a term that is exactly 1: a direct path from the loss to the input, with no multiplication at all.\n\nSo the gradient always has a highway through the network. Each block only has to learn a small correction to the identity, and a block that isn't helping can simply learn F ≈ 0.`,
        },
        build: {
            answer: `Two 20-layer CNNs with 16 channels, identical except that one adds each pair of conv layers' input back to its output (a residual block). Train both with the same settings on 10,000 CIFAR-10 images for 3 epochs and record the training loss.\n\nIn this short run the residual network ends with the lower training loss (about 1.63 against 1.72 for the plain one, averaged over the last 20 steps), and its curve falls faster from the start. The gap is modest here, because both networks use batch norm, which already helps a lot at 20 layers. The ResNet paper showed the gap growing with depth: a plain 56-layer network trained worse than a plain 20-layer one, the "degradation" problem, while residual networks kept improving with depth. Plot both curves on one chart, then try more blocks and watch the plain network fall further behind.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                import matplotlib.pyplot as plt
                from torchvision import datasets

                class Block(nn.Module):
                    def __init__(self, residual):
                        super().__init__()
                        self.residual = residual
                        self.c1, self.c2 = nn.Conv2d(16, 16, 3, padding=1), nn.Conv2d(16, 16, 3, padding=1)
                        self.b1, self.b2 = nn.BatchNorm2d(16), nn.BatchNorm2d(16)
                    def forward(self, x):
                        out = self.b2(self.c2(F.relu(self.b1(self.c1(x)))))
                        return F.relu(out + x if self.residual else out)

                def network(residual):                               # 1 + 9 blocks × 2 + 1 = 20 layers
                    return nn.Sequential(nn.Conv2d(3, 16, 3, padding=1), nn.ReLU(),
                                         *[Block(residual) for _ in range(9)],
                                         nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(16, 10))

                cifar = datasets.CIFAR10("data", train=True, download=True)
                X = torch.tensor(cifar.data[:10_000]).permute(0, 3, 1, 2).float() / 255.0
                y = torch.tensor(cifar.targets[:10_000])
                for residual in [False, True]:
                    torch.manual_seed(0)
                    model = network(residual)
                    opt = torch.optim.SGD(model.parameters(), lr=0.05, momentum=0.9)
                    losses = []
                    for epoch in range(3):
                        for idx in torch.randperm(10_000).split(128):
                            opt.zero_grad()
                            loss = F.cross_entropy(model(X[idx]), y[idx]); loss.backward(); opt.step()
                            losses.append(loss.item())
                    name = "residual" if residual else "plain"
                    print(f"{name}: average loss over the last 20 steps {sum(losses[-20:]) / 20:.3f}")
                    plt.plot(losses, label=name)
                plt.xlabel("step"); plt.ylabel("training loss"); plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `If the block's convolutions change 16 channels into 32, then x has shape (batch, 16, H, W) and F(x) has (batch, 32, H, W), and you can't add them: "The size of tensor a (32) must match the size of tensor b (16) at non-singleton dimension 1".\n\nThe fix is a projection shortcut: pass x through a 1 × 1 convolution from 16 to 32 channels (often with batch norm) before adding. A 1 × 1 convolution mixes channels at each pixel without looking at neighbours, so it changes the channel count while keeping the shortcut cheap. If the block also halves the height and width with stride 2, give the 1 × 1 convolution stride 2 as well.`,
            code: py`
                import torch
                import torch.nn as nn

                x = torch.randn(8, 16, 32, 32)
                F_x = nn.Conv2d(16, 32, 3, padding=1)(x)
                try:
                    F_x + x
                except RuntimeError as e:
                    print(e)
                shortcut = nn.Conv2d(16, 32, kernel_size=1)          # the projection
                print((F_x + shortcut(x)).shape)                       # torch.Size([8, 32, 32, 32])
            `,
        },
        explain: {
            answer: `Editing a document with tracked changes, instead of rewriting it from scratch each time. Each editor receives the document and only marks small changes; everything they leave alone passes straight through unchanged. Even after 50 editors, the original text is still there underneath, and an editor with nothing useful to add can simply change nothing.\n\nA residual block works the same way: its output is its input plus a learned change, y = x + F(x). Without the shortcut, every layer must rewrite the whole document, and after many layers both the content and the feedback from the end get lost. With it, information and gradients flow straight through, which is what lets networks with 50 or 100+ layers train.`,
        },
    },
    'f3-t13': {
        derive: {
            answer: `An RNN updates its hidden state with the same weights at every step: hₜ = tanh(W·hₜ₋₁ + U·xₜ).\n\nUnrolled for 3 steps:\nh₁ = tanh(W·h₀ + U·x₁)\nh₂ = tanh(W·h₁ + U·x₂)\nh₃ = tanh(W·h₂ + U·x₃), and the output is y = V·h₃.\n\nGradient of the last output with respect to h₀, by the chain rule through every step:\n∂h₃/∂h₀ = (∂h₃/∂h₂)(∂h₂/∂h₁)(∂h₁/∂h₀) = D₃W · D₂W · D₁W,\nwhere each Dₜ = diag(1 − hₜ²) is the tanh derivative at that step.\n\nW appears once per step: three times here, T times for a sequence of length T. Repeated multiplication by the same matrix shrinks or grows like a power: if W's largest stretching factor is below 1 (and tanh′ ≤ 1 makes it smaller still), the gradient from far back vanishes, like 0.9¹⁰⁰ ≈ 0.00003; if it is above 1, it can explode.`,
        },
        build: {
            answer: `Download the list of 32,000 names used in Andrej Karpathy's makemore. Each name becomes a training sequence with "." marking the start and end. The RNN reads one character at a time (an embedding, then nn.RNN), and is trained to predict the next character at every position.\n\nAfter a few thousand steps the loss falls from ln 27 ≈ 3.3 (random guessing among 26 letters plus ".") to about 2.1, and sampling one character at a time from its predictions produces new, name-like words: mostly pronounceable, a few real names, some odd ones.`,
            code: py`
                import urllib.request
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                url = "https://raw.githubusercontent.com/karpathy/makemore/master/names.txt"
                names = urllib.request.urlopen(url).read().decode().split()
                chars = ["."] + sorted(set("".join(names)))
                stoi = {c: i for i, c in enumerate(chars)}

                class CharRNN(nn.Module):
                    def __init__(self, vocab, hidden=128):
                        super().__init__()
                        self.embed, self.rnn, self.out = nn.Embedding(vocab, 32), nn.RNN(32, hidden, batch_first=True), nn.Linear(hidden, vocab)
                    def forward(self, x, h=None):
                        y, h = self.rnn(self.embed(x), h)
                        return self.out(y), h

                torch.manual_seed(0)
                model = CharRNN(len(chars))
                opt = torch.optim.Adam(model.parameters(), lr=3e-3)
                for step in range(3000):
                    batch = [names[i] for i in torch.randint(len(names), (64,))]
                    seqs = [[0] + [stoi[c] for c in n] + [0] for n in batch]
                    L = max(map(len, seqs))
                    x = torch.tensor([s[:-1] + [0] * (L - len(s)) for s in seqs])
                    y = torch.tensor([s[1:] + [-1] * (L - len(s)) for s in seqs])   # -1: padding, ignored
                    logits, _ = model(x)
                    loss = F.cross_entropy(logits.reshape(-1, len(chars)), y.reshape(-1), ignore_index=-1)
                    opt.zero_grad(); loss.backward(); opt.step()
                print("loss:", round(loss.item(), 2))

                for _ in range(8):
                    x, h, out = torch.tensor([[0]]), None, ""
                    while True:
                        logits, h = model(x, h)
                        nxt = torch.multinomial(F.softmax(logits[0, -1], -1), 1).item()
                        if nxt == 0 or len(out) > 15:
                            break
                        out += chars[nxt]; x = torch.tensor([[nxt]])
                    print(out)
            `,
        },
        break: {
            answer: `Task: the first symbol of each sequence is A or B, followed by a gap of random filler symbols, and at the end the model must say which one came first. Train a fresh RNN for each gap length, with three different random seeds.\n\nIn the run below, a gap of 20 is solved by every seed, but at 50 and at 100 none of the three seeds solve it: they sit at 50%, a coin flip. (With other seeds or settings a gap of 50 is sometimes solved by luck; 100 almost never.) The cause shows up before any training: measure how much gradient reaches the first symbol. It is about 3e-5 for a gap of 10, about 3e-15 for 50, and exactly 0 (it underflows) for 100. The signal from the first symbol has to survive being multiplied by W and the tanh slope at every step on the way back, and it vanishes, so the model gets no hint that the first symbol matters.\n\nGradient clipping (torch.nn.utils.clip_grad_norm_) caps the size of the gradient. It stops the opposite problem, an occasional exploding gradient that wrecks training, but it can't make a vanished gradient bigger, so it doesn't rescue the long gaps. The real fix is a better memory path: an LSTM or GRU, or attention.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                def batch(gap, n=64):
                    first = torch.randint(0, 2, (n,))                       # A = 0 or B = 1
                    filler = torch.randint(2, 6, (n, gap))                   # symbols 2–5: noise
                    return torch.cat([first[:, None], filler], dim=1), first

                class Net(nn.Module):
                    def __init__(self):
                        super().__init__()
                        self.embed, self.rnn, self.out = nn.Embedding(6, 16), nn.RNN(16, 64, batch_first=True), nn.Linear(64, 2)
                    def forward(self, x):
                        return self.out(self.rnn(self.embed(x))[0][:, -1])

                for gap in [10, 50, 100]:                                    # gradient reaching the first symbol
                    torch.manual_seed(0)
                    model, (x, y) = Net(), batch(gap)
                    e = model.embed(x); e.retain_grad()
                    F.cross_entropy(model.out(model.rnn(e)[0][:, -1]), y).backward()
                    print(f"gap {gap}: gradient at the first symbol {e.grad[:, 0].norm().item():.1e}")

                for clip in [False, True]:
                    for gap in [20, 50, 100]:
                        accs = []
                        for seed in range(3):
                            torch.manual_seed(seed)
                            model = Net(); opt = torch.optim.Adam(model.parameters(), lr=3e-3)
                            for _ in range(1000):
                                x, y = batch(gap)
                                opt.zero_grad(); F.cross_entropy(model(x), y).backward()
                                if clip:
                                    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                                opt.step()
                            x, y = batch(gap, 1000)
                            with torch.no_grad():
                                accs.append(round((model(x).argmax(1) == y).float().mean().item(), 2))
                        print(f"clip {clip}, gap {gap}: accuracy for 3 seeds {accs}")
            `,
        },
        explain: {
            answer: `Reading a book with only one sticky note for your memory. After each page, you rewrite the note to sum up everything so far, using the old note and the new page. That note is the RNN's hidden state, and rewriting it with the same rule every page is the shared weights.\n\nIt works for short stories. But in a long book, every rewrite squeezes the old content a bit more to make room, so a detail from chapter 1 is smudged out long before the last chapter, which is exactly when you need it. And when the model learns, the "feedback" about chapter 1 has to travel back through every rewrite, fading each time. That is why plain RNNs fail on long sequences.`,
        },
    },
    'f3-t14': {
        derive: {
            answer: `A one-hot vector for token i has a 1 in position i and 0 everywhere else. Multiplying it by E (a V × d matrix):\n(one-hot · E)ⱼ = Σₖ onehotₖ · Eₖⱼ = Eᵢⱼ\nbecause every term is 0 except k = i. So the result is exactly row i of E. That is why frameworks skip the multiplication and just look the row up.\n\nGradient: the output is row i, so the loss depends only on row i of E (for this token). ∂L/∂E is a matrix that is 0 everywhere except row i, which gets ∂L/∂(output). In matrix form, ∂L/∂E = onehotᵀ · ∂L/∂(output), which puts the gradient into row i only.\n\nFrom one example, only the rows of the tokens that appear in it get a gradient. Rare tokens therefore get few updates, which is why their embeddings are learned less well.`,
            code: py`
                import torch
                E = torch.randn(5, 3, requires_grad=True)
                one_hot = torch.tensor([0., 0., 1., 0., 0.])
                out = one_hot @ E
                print(torch.equal(out, E[2]))           # True: row 2
                out.sum().backward()
                print(E.grad)                           # only row 2 is non-zero
            `,
        },
        build: {
            answer: `The makemore MLP: take the previous 3 characters, look up a 2-number embedding for each, join them into 6 numbers, pass them through a hidden layer of 100 units, and predict the next character. Train on the 32,000 names, then plot each character at its 2-D embedding.\n\nThe vowels a, e, i, o, u (and often y) usually end up close together, because they play similar roles: they appear in similar positions and are followed by similar letters. "." (start or end of a name) sits apart, and rare letters such as q, x and z drift towards the edges. Nobody told the model what a vowel is; it found the similarity because similar characters help predict the next one in similar ways.`,
            code: py`
                import urllib.request
                import torch
                import torch.nn.functional as F
                import matplotlib.pyplot as plt

                names = urllib.request.urlopen("https://raw.githubusercontent.com/karpathy/makemore/master/names.txt").read().decode().split()
                chars = ["."] + sorted(set("".join(names)))
                stoi = {c: i for i, c in enumerate(chars)}
                X, Y = [], []
                for n in names:
                    context = [0, 0, 0]
                    for c in n + ".":
                        X.append(context); Y.append(stoi[c]); context = context[1:] + [stoi[c]]
                X, Y = torch.tensor(X), torch.tensor(Y)

                g = torch.Generator().manual_seed(0)
                C = torch.randn(27, 2, generator=g, requires_grad=True)            # 2-D embeddings
                W1, b1 = (torch.randn(6, 100, generator=g) * 0.4).requires_grad_(), torch.zeros(100, requires_grad=True)
                W2, b2 = (torch.randn(100, 27, generator=g) * 0.1).requires_grad_(), torch.zeros(27, requires_grad=True)
                params = [C, W1, b1, W2, b2]
                for step in range(20_000):
                    idx = torch.randint(0, len(X), (64,), generator=g)
                    h = torch.tanh(C[X[idx]].view(-1, 6) @ W1 + b1)
                    loss = F.cross_entropy(h @ W2 + b2, Y[idx])
                    for p in params:
                        p.grad = None
                    loss.backward()
                    for p in params:
                        p.data -= (0.1 if step < 15_000 else 0.01) * p.grad
                print("loss:", round(loss.item(), 2))

                emb = C.detach()
                plt.scatter(emb[:, 0], emb[:, 1], s=200, c="lightblue")
                for i, ch in enumerate(chars):
                    plt.text(emb[i, 0], emb[i, 1], ch, ha="center", va="center")
                plt.show()
                vowels = [stoi[v] for v in "aeiou"]
                print("mean distance between vowels:", round(torch.pdist(emb[vowels]).mean().item(), 2),
                      "| between all letters:", round(torch.pdist(emb[1:]).mean().item(), 2))
            `,
        },
        break: {
            answer: `A token id of 27 or more in a 27-row table: PyTorch raises "IndexError: index out of range in self". On a GPU the error is often a vague "device-side assert triggered" instead, which is much harder to trace. It usually means the tokeniser and the model disagree about the vocabulary size, for example after adding new special tokens without resizing the embedding.\n\nEmbedding size 1: every character must sit on a single line, so characters that should be similar in some ways and different in others can't be placed well. The loss ends noticeably higher than with 2 or 10 dimensions (in the run below, the 1-D model plateaus higher than the 10-D one). Too few dimensions underfit; very many waste memory and can overfit. Real models use hundreds or thousands.`,
            code: py`
                import urllib.request
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                table = nn.Embedding(27, 2)
                try:
                    table(torch.tensor([27]))
                except IndexError as e:
                    print(e)

                names = urllib.request.urlopen("https://raw.githubusercontent.com/karpathy/makemore/master/names.txt").read().decode().split()
                chars = ["."] + sorted(set("".join(names)))
                stoi = {c: i for i, c in enumerate(chars)}
                X, Y = [], []
                for n in names:
                    ctx = [0, 0, 0]
                    for c in n + ".":
                        X.append(ctx); Y.append(stoi[c]); ctx = ctx[1:] + [stoi[c]]
                X, Y = torch.tensor(X), torch.tensor(Y)
                for dim in [1, 10]:
                    torch.manual_seed(0)
                    model = nn.Sequential(nn.Embedding(27, dim), nn.Flatten(), nn.Linear(3 * dim, 100), nn.Tanh(), nn.Linear(100, 27))
                    opt = torch.optim.Adam(model.parameters(), lr=3e-3)
                    for _ in range(5000):
                        idx = torch.randint(0, len(X), (128,))
                        opt.zero_grad(); F.cross_entropy(model(X[idx]), Y[idx]).backward(); opt.step()
                    with torch.no_grad():
                        print(f"embedding size {dim}: loss {F.cross_entropy(model(X), Y).item():.3f}")
            `,
        },
        explain: {
            answer: `Picture a city map where every shop has a location, and similar shops end up in the same neighbourhood: bakeries near bakeries, phone shops near phone shops. On that map, distance means similarity, and even directions can mean something, like "the cheaper end of town".\n\nAn embedding gives every word, character, product or user a location on such a map, a list of numbers, learned during training. Things that behave alike end up close together, so the model can treat "cat" and "kitten" similarly without being told. Real maps have two coordinates; embeddings use hundreds, which leaves room for many kinds of similarity at once.`,
        },
    },
    'f3-t15': {
        derive: {
            answer: `With random weights, a classifier's predictions are close to uniform: each of C classes gets probability about 1/C. Cross-entropy is −log(probability of the correct class) = −log(1/C) = ln C.\n\n10 classes: ln 10 ≈ 2.30\n100 classes: ln 100 ≈ 4.61\n50,000 classes (a language model's vocabulary): ln 50,000 ≈ 10.82\n\nIf your first loss is far above this, something is wrong: weights initialised too large (very confident wrong guesses), softmax applied twice, or a bug in the labels. Checking it takes seconds and catches a whole family of bugs.`,
        },
        build: {
            answer: `The checklist runs four checks in order, cheapest first, and stops at the first failure:\n1. The first loss is close to ln(number of classes).\n2. A copy of the model can overfit one small batch: the loss on 32 examples falls almost to 0 within a few hundred steps. If not, the bug is in the code, not the data.\n3. The gradient norm of every layer printed once, to spot layers with zero or huge gradients.\n4. Train and validation losses, both recorded and plotted per epoch.\n\nKeep it as a script and run it on every new model before any long training run.`,
            code: py`
                import copy
                import math
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                import matplotlib.pyplot as plt
                from torchvision import datasets

                def check_training(model, X, y, Xva, yva, n_classes, lr=1e-3):
                    first = F.cross_entropy(model(X[:256]), y[:256]).item()
                    print(f"1. first loss {first:.2f}, expected about {math.log(n_classes):.2f}")
                    assert abs(first - math.log(n_classes)) < 1.0, "first loss is off: check init, softmax, labels"

                    probe = copy.deepcopy(model)                     # a throwaway copy for the one-batch test
                    opt = torch.optim.Adam(probe.parameters(), lr=lr)
                    for _ in range(300):
                        opt.zero_grad(); loss = F.cross_entropy(probe(X[:32]), y[:32]); loss.backward(); opt.step()
                    print(f"2. loss on one batch of 32 after 300 steps: {loss.item():.4f}")
                    assert loss.item() < 0.05, "cannot overfit one batch: there is a bug in the model or loop"

                    F.cross_entropy(model(X[:256]), y[:256]).backward()
                    for name, p in model.named_parameters():
                        print(f"3. gradient norm {name:10s} {p.grad.norm().item():.2e}")

                    opt = torch.optim.Adam(model.parameters(), lr=lr)
                    train_curve, val_curve = [], []
                    for epoch in range(3):
                        for idx in torch.randperm(len(X)).split(128):
                            opt.zero_grad(); F.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()
                        with torch.no_grad():
                            train_curve.append(F.cross_entropy(model(X), y).item())
                            val_curve.append(F.cross_entropy(model(Xva), yva).item())
                    print("4. train", [round(v, 3) for v in train_curve], "validation", [round(v, 3) for v in val_curve])
                    plt.plot(train_curve, label="train"); plt.plot(val_curve, label="validation"); plt.legend(); plt.show()

                mnist = datasets.MNIST("data", train=True, download=True)
                X, y = mnist.data.reshape(-1, 784).float() / 255.0, mnist.targets
                torch.manual_seed(0)
                model = nn.Sequential(nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10))
                check_training(model, X[:10_000], y[:10_000], X[50_000:], y[50_000:], n_classes=10)
            `,
        },
        break: {
            answer: `What each planted bug looks like, and which check finds it.\n\n1. Labels shifted by one (each image paired with the next image's label). The labels are now effectively random. The first-loss check passes, and the model can still overfit one batch (it can memorise anything), so those checks don't catch it. The giveaway is the curves: the training loss falls only slowly, by memorising, and validation accuracy stays near 10%, chance. The fastest check of all: plot a few images with their labels and look.\n\n2. No shuffling. If the data is sorted by class (all 0s, then all 1s…), each stretch of batches teaches the model "everything is a 3", then "everything is a 4". The loss curve is a sawtooth, jumping every time the class changes, and the final model is biased towards the last classes it saw. Plot the loss per step, not just per epoch, and check that one batch contains a mix of labels.\n\n3. Learning rate × 10. The loss is spiky, may rise, or turns into nan within a few hundred steps; gradient norms are large. A short learning-rate sweep (try a few values across powers of 10) shows it at once.\n\nThe point of waiting a week is that you can't remember where you put them, which is what real bugs are like. The habit to build: look at the data, check the first loss, overfit one batch, and always plot both curves.`,
        },
        explain: {
            answer: `A mechanic who has rebuilt an engine tests it on a stand before putting it back in the car. On the stand there is no road, no weather and no traffic, so if it won't run there, the problem is the engine itself, and you have learned that cheaply.\n\nOverfitting one batch is the engine stand for a training script. Take 32 examples and train only on them. A working model and training loop must be able to memorise them, so the loss should drop almost to 0. If it can't, the bug is in your code: the model, the loss, the labels or the update. You find that in a minute, instead of after a ten-hour run on the full dataset.`,
        },
    },
    'f3-t16': {
        derive: {
            answer: `With [h, x] meaning hₜ₋₁ and xₜ joined into one vector, σ the sigmoid and ⊙ elementwise multiplication:\n\nForget gate: fₜ = σ(W_f·[h, x] + b_f): how much of the old memory to keep.\nInput gate: iₜ = σ(W_i·[h, x] + b_i): how much new information to write.\nCandidate: gₜ = tanh(W_g·[h, x] + b_g): the new information itself.\nOutput gate: oₜ = σ(W_o·[h, x] + b_o): how much of the memory to show.\n\nThen:\ncₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ gₜ\nhₜ = oₜ ⊙ tanh(cₜ)\n\nThe direct path: in the first update, cₜ₋₁ appears only in fₜ ⊙ cₜ₋₁. So ∂cₜ/∂cₜ₋₁ along that path is just fₜ, elementwise: no weight matrix and no squashing function. If the network keeps fₜ close to 1, the memory and its gradient pass from step to step almost unchanged, over hundreds of steps. That is the difference from a plain RNN, where every step multiplies by W and a tanh derivative.`,
        },
        build: {
            answer: `The NumPy cell computes all four gates from one matrix product, splits the result into four parts, and applies the equations above. PyTorch's LSTMCell stores its weights as weight_ih (input) and weight_hh (hidden), with the four gates stacked in the order input, forget, candidate, output, and two bias vectors. Copy those into the NumPy cell and the outputs match to about 1e-7.\n\nOn the long-gap task, the repeatable measurement is how much gradient reaches the first symbol at the start of training. For the plain RNN it is about 2e-16 at a gap of 50 and exactly 0 at 100. For an LSTM whose forget gate starts open (forget-gate bias +3, so f ≈ 0.95), it doesn't shrink at all: from about 3e-3 at a gap of 10 to about 1e-1 at a gap of 200. That is the memory highway from the derive step, working.\n\nIn the training run below (seed 0, gap 50), that LSTM solves the task and the RNN stays at 50%. Be aware that on a toy task this small, whether a model happens to find the solution in 1,500 steps also depends on luck, so try several seeds before drawing conclusions from accuracy alone.`,
            code: py`
                import numpy as np
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                sigmoid = lambda z: 1 / (1 + np.exp(-z))

                def lstm_cell(x, h, c, W_ih, W_hh, b_ih, b_hh):
                    z = x @ W_ih.T + h @ W_hh.T + b_ih + b_hh
                    i, f, g, o = np.split(z, 4, axis=1)                 # PyTorch's gate order
                    c = sigmoid(f) * c + sigmoid(i) * np.tanh(g)
                    h = sigmoid(o) * np.tanh(c)
                    return h, c

                torch.manual_seed(0)
                cell = nn.LSTMCell(5, 8)
                x, h, c = torch.randn(3, 5), torch.randn(3, 8), torch.randn(3, 8)
                h_t, c_t = cell(x, (h, c))
                w = [p.detach().numpy() for p in (cell.weight_ih, cell.weight_hh, cell.bias_ih, cell.bias_hh)]
                h_np, c_np = lstm_cell(x.numpy(), h.numpy(), c.numpy(), *w)
                print(np.abs(h_np - h_t.detach().numpy()).max(), np.abs(c_np - c_t.detach().numpy()).max())

                def batch(gap, n=64):
                    first = torch.randint(0, 2, (n,))
                    return torch.cat([first[:, None], torch.randint(2, 6, (n, gap))], dim=1), first

                class Net(nn.Module):
                    def __init__(self, kind, forget_bias=None):
                        super().__init__()
                        self.embed, self.out = nn.Embedding(6, 16), nn.Linear(64, 2)
                        self.rnn = (nn.LSTM if kind == "LSTM" else nn.RNN)(16, 64, batch_first=True)
                        if forget_bias is not None:
                            with torch.no_grad():
                                for name, b in self.rnn.named_parameters():
                                    if "bias" in name:
                                        b.zero_(); b[64:128] = forget_bias / 2     # forget gate; two biases add up
                    def forward(self, x):
                        return self.out(self.rnn(self.embed(x))[0][:, -1])

                for kind, fb in [("RNN", None), ("LSTM", 3.0)]:
                    row = []
                    for gap in [10, 50, 100, 200]:
                        torch.manual_seed(0)
                        model, (xb, yb) = Net(kind, fb), batch(gap)
                        e = model.embed(xb); e.retain_grad()
                        F.cross_entropy(model.out(model.rnn(e)[0][:, -1]), yb).backward()
                        row.append(f"{e.grad[:, 0].norm().item():.0e}")
                    print(f"{kind}: gradient at the first symbol, gaps 10/50/100/200: {row}")

                for kind, fb in [("RNN", None), ("LSTM", 3.0)]:
                    torch.manual_seed(0)
                    model = Net(kind, fb); opt = torch.optim.Adam(model.parameters(), lr=1e-2)
                    for _ in range(1500):
                        xb, yb = batch(50)
                        opt.zero_grad(); F.cross_entropy(model(xb), yb).backward()
                        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0); opt.step()
                    xb, yb = batch(50, 1000)
                    with torch.no_grad():
                        print(f"{kind}, gap 50: accuracy {(model(xb).argmax(1) == yb).float().mean().item():.0%}")
            `,
        },
        break: {
            answer: `Forget-gate bias −5: at the start, fₜ = σ(−5) ≈ 0.007, so each step keeps less than 1% of the old memory. The cell wipes itself clean at every step, so the first symbol is forgotten almost immediately, and its gradient is multiplied by about 0.007 per step on the way back. In the run below, the gradient reaching the first symbol is about 1e-11 even for a gap of 10, and exactly 0 from a gap of 50: worse than a plain RNN. The LSTM behaves like a network with no memory at all.\n\nForget-gate bias +1: fₜ starts around σ(1) ≈ 0.73. Now the gradient at a gap of 10 is about 3e-4, tens of millions of times more than with −5, and it still reaches a gap of 50 (about 4e-7). Memory survives from the very start, and the network can learn to open the gate further. That is why initialising the forget-gate bias to 1 is a common trick; some libraries do it by default. Pushing it to +3 (f ≈ 0.95) keeps the gradient strong, about 1e-3, even over 100 steps.\n\nThe lesson: initialisation decides whether the gradient highway is open at the start of training.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                def batch(gap, n=64):
                    first = torch.randint(0, 2, (n,))
                    return torch.cat([first[:, None], torch.randint(2, 6, (n, gap))], dim=1), first

                for forget_bias in [-5.0, 1.0, 3.0]:
                    row = []
                    for gap in [10, 50, 100]:
                        torch.manual_seed(0)
                        embed, lstm, out = nn.Embedding(6, 16), nn.LSTM(16, 64, batch_first=True), nn.Linear(64, 2)
                        with torch.no_grad():
                            for name, b in lstm.named_parameters():
                                if "bias" in name:
                                    b.zero_(); b[64:128] = forget_bias / 2       # forget gate: 2nd quarter, two biases
                        xb, yb = batch(gap)
                        e = embed(xb); e.retain_grad()
                        F.cross_entropy(out(lstm(e)[0][:, -1]), yb).backward()
                        row.append(f"{e.grad[:, 0].norm().item():.0e}")
                    print(f"forget bias {forget_bias:+}: gradient at the first symbol, gaps 10/50/100: {row}")
            `,
        },
        explain: {
            answer: `The plain RNN rewrites its whole sticky note on every page. The LSTM keeps a notebook instead, with a pencil and an eraser. On each page it decides three things: which lines to erase (the forget gate), which new lines to write in (the input gate), and which lines to read out right now (the output gate).\n\nBecause most lines are simply left alone, something written on page 1 can still be there on page 200, unchanged, until the model decides to erase it. And because "leaving a line alone" is just multiplying by a forget gate close to 1, the learning signal can travel back along the same path just as easily. That is why LSTMs remember much longer than plain RNNs.`,
        },
    },
};
