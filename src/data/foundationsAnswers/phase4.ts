import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 4 · Transformers and LLMs. One good answer for each practice exercise.
//
// Many builds share one small character-level GPT: the Build answer of
// "GPT-style models and next-token prediction" (f4-t5). Save that code as
// gpt.py; the other answers import from it. Runs are short (a minute or two
// on a laptop CPU), so the numbers are for comparing settings, not records.

export const phase4Answers: Record<string, TopicAnswers> = {
    'f4-t1': {
        derive: {
            answer: `Start with characters: a a a b d a a a b a c.\n\nMerge 1. Count adjacent pairs: aa appears 4 times (twice inside each "aaa"), ab 2, and bd, da, ba, ac once each. Merge aa. Reading left to right, "aaa" becomes aa + a:\naa a b d aa a b a c\n\nMerge 2. Now (aa, a) and (a, b) both appear twice. The tie goes to the pair that appears first, which is (aa, a), so it becomes aaa:\naaa b d aaa b a c\n\nMerge 3. (aaa, b) appears twice, everything else once. Merge it:\naaab d aaab a c\n\nEleven characters became five tokens, and the tokenizer learned three new vocabulary entries: aa, aaa and aaab. On real text the same process discovers common pieces such as "th", "ing" and " the".`,
            code: py`
                from collections import Counter

                tokens = list("aaabdaaabac")
                for merge in range(1, 4):
                    pairs = list(zip(tokens, tokens[1:]))
                    counts = Counter(pairs)
                    best = next(p for p in pairs if counts[p] == max(counts.values()))   # ties: first one seen
                    out, i = [], 0
                    while i < len(tokens):
                        if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == best:
                            out.append(tokens[i] + tokens[i + 1]); i += 2
                        else:
                            out.append(tokens[i]); i += 1
                    tokens = out
                    print(merge, "merge", best, "->", tokens)
            `,
        },
        build: {
            answer: `Byte-level BPE, the kind GPT models use: start from the 256 possible bytes, so any text in any language can be encoded. Training repeats one step: count adjacent pairs of ids, merge the most frequent pair into a new id, and remember the merge. Encoding applies the learned merges to new text in the order they were learned; decoding turns each id back into its bytes and joins them.\n\nTrained with 200 merges on the first 50,000 characters of Shakespeare, it shrinks that text to roughly half as many tokens as bytes, and decode(encode(text)) gives back the exact text, including for text it never saw, emoji and other scripts (they just use more tokens).`,
            code: py`
                import os
                import urllib.request
                from collections import Counter

                def train_bpe(text, n_merges):
                    ids, merges = list(text.encode("utf-8")), {}
                    for new_id in range(256, 256 + n_merges):
                        pair = Counter(zip(ids, ids[1:])).most_common(1)[0][0]
                        merges[pair] = new_id
                        ids = merge(ids, pair, new_id)
                    return merges

                def merge(ids, pair, new_id):
                    out, i = [], 0
                    while i < len(ids):
                        if i + 1 < len(ids) and (ids[i], ids[i + 1]) == pair:
                            out.append(new_id); i += 2
                        else:
                            out.append(ids[i]); i += 1
                    return out

                def encode(text, merges):
                    ids = list(text.encode("utf-8"))
                    for pair, new_id in merges.items():          # dicts keep the order they were learned in
                        ids = merge(ids, pair, new_id)
                    return ids

                def decode(ids, merges):
                    vocab = {i: bytes([i]) for i in range(256)}
                    for (a, b), new_id in merges.items():
                        vocab[new_id] = vocab[a] + vocab[b]
                    return b"".join(vocab[i] for i in ids).decode("utf-8", errors="replace")

                path = "data/shakespeare.txt"
                if not os.path.exists(path):
                    os.makedirs("data", exist_ok=True)
                    urllib.request.urlretrieve("https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt", path)
                text = open(path, encoding="utf-8").read()[:50_000]
                merges = train_bpe(text, 200)
                ids = encode(text, merges)
                print(f"{len(text.encode())} bytes -> {len(ids)} tokens")
                for sample in [text, "To be, or not to be: that is the question.", "नमस्ते 👋 naïve café"]:
                    assert decode(encode(sample, merges), merges) == sample
                print("round trip OK")
            `,
        },
        break: {
            answer: `With a GPT-4-style tokenizer (tiktoken's cl100k_base):\n• "1234567" becomes 3 tokens: "123", "456", "7". Long numbers are cut into chunks of up to three digits, and where the cuts fall has nothing to do with place value. The model never sees "the 4 is in the thousands column" directly, which is one reason language models are clumsy at long arithmetic.\n• "Hello, how are you today?" is 7 tokens. A Nepali greeting of similar length, "नमस्ते, आज तपाईंलाई कस्तो छ?", is 28 tokens, about one per character, because Devanagari is rare in the training data, so few merges were learned for it. "The quick brown fox jumps over the lazy dog." is 10 tokens; its Nepali translation is 41.\n\nWhy it matters: you pay, wait and fill the context window per token. The same message in Nepali costs about four times as much, is slower, and fits less into the model's context, and models often perform worse in languages that are split into many small pieces. Newer tokenizers with larger, more multilingual vocabularies reduce this gap.`,
            code: py`
                import tiktoken

                enc = tiktoken.get_encoding("cl100k_base")
                for text in ["1234567", "Hello, how are you today?", "नमस्ते, आज तपाईंलाई कस्तो छ?",
                             "The quick brown fox jumps over the lazy dog.", "छिटो खैरो स्याल अल्छी कुकुरमाथि उफ्रन्छ।"]:
                    ids = enc.encode(text)
                    print(f"{len(ids):3d} tokens  {text}")
                print([enc.decode([i]) for i in enc.encode("1234567")])     # ['123', '456', '7']
            `,
        },
        explain: {
            answer: `Taking shorthand notes in class. You notice you write "the" constantly, so you invent one squiggle for it. Then "ing", then "tion". After a while your most common words and word-pieces each have their own symbol, and you write far fewer symbols, while rare words are still spelled out letter by letter.\n\nBPE builds a model's vocabulary the same way. It starts with single characters (or bytes), finds the most frequent pair of neighbours in a huge pile of text, and makes that pair one new token. Repeat tens of thousands of times. Common words become a single token, rare words split into a few pieces, and nothing is ever impossible to write.`,
        },
    },
    'f4-t2': {
        derive: {
            answer: `Self-attention for inputs X (one token per row) is Attn(X) = softmax(Q·Kᵀ/√d)·V with Q = XW_Q, K = XW_K, V = XW_V.\n\nShuffle the tokens: X becomes P·X, where P is a permutation matrix (it reorders rows; PᵀP = I).\nThen Q, K and V become PQ, PK and PV, and the scores become (PQ)(PK)ᵀ = P·(QKᵀ)·Pᵀ: the same scores, with rows and columns reordered the same way.\nSoftmax works row by row, so softmax(P·S·Pᵀ) = P·softmax(S)·Pᵀ.\nThe output: P·softmax(S)·Pᵀ·P·V = P·softmax(S)·V = P·Attn(X).\n\nSo shuffling the input just shuffles the output in the same way: every token gets exactly the same vector as before, wherever it sits. The layer computes a function of the set of tokens, not their order, so "dog bites man" and "man bites dog" would look identical. The MLP works on each token separately, so it can't add order either. That is why positions must be added to the input, as position embeddings or rotary encodings.`,
        },
        build: {
            answer: `Sinusoidal encoding gives position p and dimension pair i the values sin(p / 10000^(2i/d)) and cos(p / 10000^(2i/d)). Low dimensions wave quickly, high ones slowly, so every position gets a unique pattern, like the hands of a clock running at different speeds, and nearby positions get similar patterns. The heatmap shows fast stripes on the left fading into slow ones on the right.\n\nLearned position embeddings are simpler: a table with one trainable vector per position, added to the token embedding. The shared gpt.py already does this: self.pos = nn.Embedding(block_size, n_embd), and the forward pass adds self.pos(torch.arange(T)) to the token embeddings. The model learns whatever position pattern helps, but can't handle positions beyond block_size.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                def sinusoidal(n_positions, d):
                    pos = np.arange(n_positions)[:, None]
                    i = np.arange(0, d, 2)[None, :]
                    angles = pos / 10000 ** (i / d)
                    pe = np.zeros((n_positions, d))
                    pe[:, 0::2], pe[:, 1::2] = np.sin(angles), np.cos(angles)
                    return pe

                pe = sinusoidal(100, 64)
                plt.imshow(pe, aspect="auto", cmap="RdBu"); plt.colorbar()
                plt.xlabel("dimension"); plt.ylabel("position"); plt.title("sinusoidal position encoding")
                plt.show()
                cos = lambda a, b: a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
                print("similarity of position 10 with 11:", round(cos(pe[10], pe[11]), 3), "| with 60:", round(cos(pe[10], pe[60]), 3))
            `,
        },
        break: {
            answer: `Training the same GPT with no position information gives a clearly worse validation loss than with learned positions, and the text gets worse: words fall apart into letter salad more often, and line structure (names followed by a colon, lines of similar length) is weaker.\n\nIt is not a total failure, and that is interesting. A model with a causal mask can partly work out position by itself: the first token can only attend to itself, the second to two tokens, and so on, so the "amount of context" leaks some order information. But it is a weak, indirect signal, and an encoder with no mask would get none at all. That is why every practical transformer adds positions.`,
            code: py`
                import torch
                from gpt import GPT, Config, train, estimate_loss, decode, encode

                for positions in [True, False]:
                    torch.manual_seed(0)
                    model = train(GPT(Config(positions=positions)), steps=1500, log_every=0)
                    torch.manual_seed(1)
                    sample = decode(model.generate(torch.tensor([encode("\n")]), 200)[0].tolist())
                    print(f"positions={positions}: val loss {estimate_loss(model):.3f}\n{sample}\n")
            `,
        },
        explain: {
            answer: `In a theatre, every seat holds a person, and each person is who they are wherever they sit: that is the token embedding. But the seat number tells you who is next to whom, who is at the front, who is at the back: that is the position.\n\nAttention on its own sees the audience as a crowd with no seat numbers, so "dog bites man" and "man bites dog" look like the same group of people. Positional encoding pins a seat number onto everyone before the show starts, by adding a position vector to each token's vector, so the model can tell the order.`,
        },
    },
    'f4-t3': {
        derive: {
            answer: `Made-up numbers, d = 2:\nQ = K = [[1, 0], [0, 1], [1, 1]] (token 3 is "both"), V = [[1, 2], [3, 4], [5, 6]].\n\nScores S = Q·Kᵀ / √2 (√2 ≈ 1.414):\nQ·Kᵀ = [[1, 0, 1], [0, 1, 1], [1, 1, 2]], so S ≈ [[0.707, 0, 0.707], [0, 0.707, 0.707], [0.707, 0.707, 1.414]].\n\nSoftmax of each row (e^0.707 ≈ 2.03, e^1.414 ≈ 4.11):\nrow 1: [2.03, 1, 2.03] / 5.06 ≈ [0.40, 0.20, 0.40]\nrow 2: [1, 2.03, 2.03] / 5.06 ≈ [0.20, 0.40, 0.40]\nrow 3: [2.03, 2.03, 4.11] / 8.17 ≈ [0.25, 0.25, 0.50]\n\nOutput = weights · V:\ntoken 1: 0.40·[1, 2] + 0.20·[3, 4] + 0.40·[5, 6] ≈ [3.0, 4.0]\ntoken 2: 0.20·[1, 2] + 0.40·[3, 4] + 0.40·[5, 6] ≈ [3.41, 4.41]\ntoken 3: 0.25·[1, 2] + 0.25·[3, 4] + 0.50·[5, 6] ≈ [3.51, 4.51]\n\nEach output is a blend of the value vectors, weighted by how well that token's query matched each key. Token 3 matches itself best, so it takes half of its own value.`,
            code: py`
                import numpy as np
                Q = K = np.array([[1, 0], [0, 1], [1, 1]])
                V = np.array([[1, 2], [3, 4], [5, 6]])
                S = Q @ K.T / np.sqrt(2)
                W = np.exp(S) / np.exp(S).sum(axis=1, keepdims=True)
                print(W.round(2)); print((W @ V).round(2))
            `,
        },
        build: {
            answer: `Single-head attention: project the inputs to Q, K and V, score every query against every key, scale by √d, apply the causal mask (set the scores for future positions to −infinity before softmax, so their weight becomes exactly 0), softmax each row, and mix the values.\n\nThe NumPy and PyTorch versions agree to about 1e-6 (and both match torch's built-in scaled_dot_product_attention). With the mask, the weight matrix is lower-triangular: token t only uses tokens 1 to t.`,
            code: py`
                import numpy as np
                import torch
                import torch.nn.functional as F

                def attention_np(X, Wq, Wk, Wv, causal=True):
                    Q, K, V = X @ Wq, X @ Wk, X @ Wv
                    S = Q @ K.T / np.sqrt(K.shape[1])
                    if causal:
                        S = np.where(np.tril(np.ones_like(S)) == 1, S, -np.inf)
                    W = np.exp(S - S.max(axis=1, keepdims=True))
                    W /= W.sum(axis=1, keepdims=True)
                    return W @ V, W

                def attention_torch(X, Wq, Wk, Wv, causal=True):
                    Q, K, V = X @ Wq, X @ Wk, X @ Wv
                    S = Q @ K.T / K.shape[1] ** 0.5
                    if causal:
                        S = S.masked_fill(torch.tril(torch.ones_like(S)) == 0, float("-inf"))
                    return F.softmax(S, dim=-1) @ V

                rng = np.random.default_rng(0)
                X, Wq, Wk, Wv = (rng.normal(size=s).astype(np.float32) for s in [(5, 8), (8, 4), (8, 4), (8, 4)])
                out_np, W = attention_np(X, Wq, Wk, Wv)
                out_t = attention_torch(*(torch.tensor(a) for a in (X, Wq, Wk, Wv)))
                ref = F.scaled_dot_product_attention(*(torch.tensor(a)[None] for a in (X @ Wq, X @ Wk, X @ Wv)), is_causal=True)[0]
                print(np.abs(out_np - out_t.numpy()).max(), np.abs(out_np - ref.numpy()).max())
                print(W.round(2))                                   # lower-triangular: no peeking ahead
            `,
        },
        break: {
            answer: `Without the √d, the scores get far too big. If the entries of q and k have variance 1, their dot product is a sum of d = 512 terms, so its standard deviation is √512 ≈ 23. Softmax of numbers that far apart puts almost all the weight on the single largest score: in the run below, more than half of the rows become essentially one-hot (their largest weight is above 0.99), against none with scaling, and the average entropy of a row drops from about 3.7 (spread over many tokens) to about 0.16.\n\nWhat that does to gradients: softmax passes gradient back as wᵢ(gᵢ − Σⱼ wⱼgⱼ). When one weight is about 1 and the rest about 0, every term is close to 0, so a saturated row sends almost nothing back to its scores. In the run below, the typical (median) row passes back about 37 times less gradient, and the most saturated rows pass back about 1e-17, nothing at all. The attention pattern for those tokens freezes: it can't learn to look anywhere else.\n\n(One subtlety: the total gradient into q isn't smaller here, because without the division each score is also 23 times more sensitive to q, and the few unsaturated rows dominate. That is the other problem: training is driven by a handful of rows and becomes unstable.) Dividing by √d brings the scores back to a standard deviation of about 1, where softmax spreads its weight and every row keeps learning.`,
            code: py`
                import torch

                torch.manual_seed(0)
                d, T = 512, 64
                q, k, g = torch.randn(T, d), torch.randn(T, d), torch.randn(T, T)   # g: some downstream gradient
                for scaled in [True, False]:
                    scores = (q @ k.T / (d ** 0.5 if scaled else 1.0)).requires_grad_()
                    weights = torch.softmax(scores, dim=-1)
                    (weights * g).sum().backward()
                    entropy = -(weights * torch.log(weights + 1e-12)).sum(-1).mean()
                    rows = scores.grad.norm(dim=-1)
                    print(f"scaled={scaled}: score std {scores.std().item():.1f}, "
                          f"rows almost one-hot {(weights.max(-1).values > 0.99).float().mean().item():.0%}, "
                          f"entropy {entropy.item():.2f}, median row gradient {rows.median().item():.1e}, smallest {rows.min().item():.0e}")
            `,
        },
        explain: {
            answer: `A library. You arrive with a question: that is your query. Every book has a title on its spine: the keys. Each book's contents are its values. You compare your question with every title, and the better a title matches, the more of that book you read. You leave with a blend of the contents, mostly from the best matches.\n\nIn self-attention, every word does this at the same time: each word asks a question (query), advertises what it is about (key), and offers what it can tell (value). "it" asks "who am I referring to?", "animal" advertises "I am a noun, a creature", and "it" ends up reading mostly from "animal".`,
        },
    },
    'f4-t4': {
        derive: {
            answer: `d_model = 768, so one d × d matrix has 768² = 589,824 weights.\n\nAttention: four projections, Q, K, V and the output, each 768 × 768: 4 × 589,824 = 2,359,296. The number of heads doesn't change this: 12 heads of 64 dimensions just split the same matrices into 12 slices.\n\nMLP with ratio 4: up from 768 to 3,072 and back down. 768 × 3,072 + 3,072 × 768 = 2 × 2,359,296 = 4,718,592.\n\nOne block: 2,359,296 + 4,718,592 = 7,077,888, about 7.1 million (the two layer norms and the biases add only about 10,000 more).\n\nThe MLP holds two-thirds of the block's weights. GPT-2 small stacks 12 of these blocks (about 85M) plus token and position embeddings (about 39M), for its 124M parameters.`,
        },
        build: {
            answer: `Multi-head attention with one projection for all heads: compute Q, K and V as (batch, T, d), reshape each to (batch, T, heads, d/heads), and swap the axes to (batch, heads, T, d/heads). Now every head attends independently in one batched operation. Afterwards, swap back and reshape to (batch, T, d), then apply the output projection.\n\nThe pre-norm block is x = x + attention(layer_norm(x)), then x = x + MLP(layer_norm(x)). To check the attention, copy the same weights into PyTorch's nn.MultiheadAttention: the outputs agree to about 1e-6.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                class MultiHeadAttention(nn.Module):
                    def __init__(self, d, heads):
                        super().__init__()
                        self.heads, self.qkv, self.out = heads, nn.Linear(d, 3 * d), nn.Linear(d, d)
                    def forward(self, x, causal=False):
                        B, T, d = x.shape
                        q, k, v = self.qkv(x).split(d, dim=2)
                        q, k, v = [t.view(B, T, self.heads, d // self.heads).transpose(1, 2) for t in (q, k, v)]
                        scores = q @ k.transpose(-2, -1) / (d // self.heads) ** 0.5       # (B, heads, T, T)
                        if causal:
                            scores = scores.masked_fill(torch.ones(T, T).tril() == 0, float("-inf"))
                        y = F.softmax(scores, dim=-1) @ v                                 # (B, heads, T, d/heads)
                        return self.out(y.transpose(1, 2).reshape(B, T, d))

                class Block(nn.Module):                                  # pre-norm transformer block
                    def __init__(self, d, heads):
                        super().__init__()
                        self.ln1, self.ln2, self.attn = nn.LayerNorm(d), nn.LayerNorm(d), MultiHeadAttention(d, heads)
                        self.mlp = nn.Sequential(nn.Linear(d, 4 * d), nn.GELU(), nn.Linear(4 * d, d))
                    def forward(self, x):
                        x = x + self.attn(self.ln1(x), causal=True)
                        return x + self.mlp(self.ln2(x))

                torch.manual_seed(0)
                mine, ref = MultiHeadAttention(64, 8), nn.MultiheadAttention(64, 8, batch_first=True)
                with torch.no_grad():
                    ref.in_proj_weight.copy_(mine.qkv.weight); ref.in_proj_bias.copy_(mine.qkv.bias)
                    ref.out_proj.weight.copy_(mine.out.weight); ref.out_proj.bias.copy_(mine.out.bias)
                x = torch.randn(2, 10, 64)
                print((mine(x) - ref(x, x, x, need_weights=False)[0]).abs().max().item())
                print(Block(64, 8)(x).shape)                              # torch.Size([2, 10, 64])
                print(sum(p.numel() for p in Block(768, 12).parameters()))   # 7,087,872 with biases and norms
            `,
        },
        break: {
            answer: `Without residual connections, a 6-block model trains much worse: in the same number of steps its loss stays far higher than the normal model's (numbers below). Every block must now transform the whole signal, and the gradient has to pass through every block's layers in turn, with no shortcut, so the early blocks learn slowly.\n\nPost-norm (LayerNorm after the addition, as in the original 2017 transformer) is fragile: at a learning rate of 5e-3, pre-norm trains fine (loss about 1.79), while post-norm fails to learn (about 3.37, barely better than guessing from letter frequencies). Without residuals the loss is equally stuck, about 3.37, against 1.86 for the normal model. With pre-norm, the residual path from input to output is an uninterrupted sum, so gradients reach every layer at a steady size. With post-norm, every addition is followed by a normalisation the gradient must pass through, which is why post-norm models needed careful learning-rate warm-up. Modern LLMs use pre-norm.`,
            code: py`
                import torch
                from gpt import GPT, Config, train, estimate_loss

                for name, cfg, lr in [("pre-norm, residual", Config(n_layer=6), 1e-3),
                                      ("no residual", Config(n_layer=6, residual=False), 1e-3),
                                      ("pre-norm, lr 5e-3", Config(n_layer=6), 5e-3),
                                      ("post-norm, lr 5e-3", Config(n_layer=6, prenorm=False), 5e-3)]:
                    torch.manual_seed(0)
                    model = train(GPT(cfg), steps=800, lr=lr, log_every=0)
                    print(f"{name:20s} val loss {estimate_loss(model):.3f}")
            `,
        },
        explain: {
            answer: `A team reads the same contract. One person looks only at dates, one at names, one at amounts of money, one at who must do what. Each focuses on their own kind of detail, then they put their notes together into one summary.\n\nMulti-head attention is that team: the model runs several attention "heads" side by side, each with its own queries, keys and values, so each can track a different kind of relationship, such as the previous word, the subject of the sentence, or a matching bracket. Their outputs are joined and mixed. The transformer block then adds a small MLP that thinks about each word on its own, with layer norm and residual connections around both, and that block is stacked many times.`,
        },
    },
    'f4-t5': {
        derive: {
            answer: `With word tokens, plus start and end markers: <s> I love deep learning </s>.\n\nInput: <s>, I, love, deep, learning\nTarget: I, love, deep, learning, </s>\n\nThe target is the input shifted by one place. At each position the model must predict the next token, using only the tokens up to that position:\n<s> → I\n<s> I → love\n<s> I love → deep\n<s> I love deep → learning\n<s> I love deep learning → </s>\n\nOne sequence gives five training examples at once, all computed in a single forward pass. The causal mask is what makes this honest: position 2 can't see "deep" while predicting it.`,
        },
        build: {
            answer: `This is gpt.py, the small GPT the other answers import. It downloads Tiny Shakespeare (about 1 MB), uses each character as a token (65 of them), and stacks 4 pre-norm transformer blocks of width 128 with 4 heads and a context of 64 characters: about 0.8 million parameters. Training samples random 64-character windows; the targets are the same windows shifted by one.\n\ngenerate() feeds the context in, takes the probabilities for the next character, samples one, appends it, and repeats, cropping the context to the last 64 characters.\n\nAfter 2,000 steps (about a minute on a laptop CPU) the validation loss falls from 4.3 to about 1.7, and the samples look like Shakespeare from a distance: character names in capitals followed by a colon, line breaks, mostly real English words, and nonsense on closer reading.`,
            code: py`
                # gpt.py: a small character-level GPT, trained on Tiny Shakespeare (about 1 MB of text).
                # Later answers import from this file, so keep it next to them.
                import os
                import urllib.request
                from dataclasses import dataclass

                import torch
                import torch.nn as nn
                import torch.nn.functional as F

                URL = "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt"
                PATH = "data/shakespeare.txt"
                if not os.path.exists(PATH):
                    os.makedirs("data", exist_ok=True)
                    urllib.request.urlretrieve(URL, PATH)
                text = open(PATH, encoding="utf-8").read()
                chars = sorted(set(text))
                vocab_size = len(chars)                                   # 65 characters
                stoi = {c: i for i, c in enumerate(chars)}
                encode = lambda s: [stoi[c] for c in s]
                decode = lambda ids: "".join(chars[i] for i in ids)
                data = torch.tensor(encode(text))
                split = int(0.9 * len(data))
                train_data, val_data = data[:split], data[split:]


                @dataclass
                class Config:
                    block_size: int = 64          # how many characters the model sees at once
                    n_embd: int = 128
                    n_head: int = 4
                    n_layer: int = 4
                    dropout: float = 0.1
                    vocab: int = vocab_size
                    positions: bool = True        # add learned position embeddings
                    causal: bool = True           # each position may only look at earlier ones
                    residual: bool = True
                    prenorm: bool = True          # LayerNorm before each sub-layer (False: after the addition)


                def get_batch(split, block_size=64, batch_size=32, source=None):
                    d = source if source is not None else (train_data if split == "train" else val_data)
                    ix = torch.randint(len(d) - block_size - 1, (batch_size,))
                    x = torch.stack([d[i:i + block_size] for i in ix])
                    y = torch.stack([d[i + 1:i + block_size + 1] for i in ix])  # the same text, shifted by one
                    return x, y


                class Attention(nn.Module):
                    def __init__(self, c):
                        super().__init__()
                        self.c = c
                        self.qkv = nn.Linear(c.n_embd, 3 * c.n_embd)
                        self.proj = nn.Linear(c.n_embd, c.n_embd)

                    def forward(self, x):
                        B, T, C = x.shape
                        q, k, v = self.qkv(x).split(C, dim=2)
                        q, k, v = [t.view(B, T, self.c.n_head, C // self.c.n_head).transpose(1, 2) for t in (q, k, v)]
                        y = F.scaled_dot_product_attention(q, k, v, is_causal=self.c.causal,
                                                           dropout_p=self.c.dropout if self.training else 0.0)
                        return self.proj(y.transpose(1, 2).reshape(B, T, C))


                class Block(nn.Module):
                    def __init__(self, c):
                        super().__init__()
                        self.c = c
                        self.ln1, self.ln2 = nn.LayerNorm(c.n_embd), nn.LayerNorm(c.n_embd)
                        self.attn = Attention(c)
                        self.mlp = nn.Sequential(nn.Linear(c.n_embd, 4 * c.n_embd), nn.GELU(),
                                                 nn.Linear(4 * c.n_embd, c.n_embd), nn.Dropout(c.dropout))

                    def forward(self, x):
                        for norm, layer in ((self.ln1, self.attn), (self.ln2, self.mlp)):
                            if self.c.prenorm:
                                x = x + layer(norm(x)) if self.c.residual else layer(norm(x))
                            else:
                                x = norm(x + layer(x)) if self.c.residual else norm(layer(x))
                        return x


                class GPT(nn.Module):
                    def __init__(self, c=Config()):
                        super().__init__()
                        self.c = c
                        self.tok = nn.Embedding(c.vocab, c.n_embd)
                        self.pos = nn.Embedding(c.block_size, c.n_embd)
                        self.blocks = nn.Sequential(*[Block(c) for _ in range(c.n_layer)])
                        self.ln = nn.LayerNorm(c.n_embd)
                        self.head = nn.Linear(c.n_embd, c.vocab)

                    def forward(self, idx, targets=None):
                        x = self.tok(idx)
                        if self.c.positions:
                            x = x + self.pos(torch.arange(idx.shape[1]))
                        logits = self.head(self.ln(self.blocks(x)))
                        loss = None if targets is None else F.cross_entropy(logits.reshape(-1, logits.size(-1)), targets.reshape(-1))
                        return logits, loss

                    @torch.no_grad()
                    def generate(self, idx, max_new_tokens, temperature=1.0):
                        self.eval()
                        for _ in range(max_new_tokens):
                            logits, _ = self(idx[:, -self.c.block_size:])              # crop to the context window
                            probs = F.softmax(logits[:, -1] / temperature, dim=-1)
                            idx = torch.cat([idx, torch.multinomial(probs, 1)], dim=1)  # sample one token, append
                        return idx


                @torch.no_grad()
                def estimate_loss(model, split="val", iters=20):
                    model.eval()
                    losses = [model(*get_batch(split, model.c.block_size))[1].item() for _ in range(iters)]
                    model.train()
                    return sum(losses) / len(losses)


                def train(model, steps=2000, lr=1e-3, log_every=500):
                    opt = torch.optim.AdamW(model.parameters(), lr=lr)
                    model.train()
                    for step in range(steps + 1):
                        if log_every and step % log_every == 0:
                            print(f"step {step}: train {estimate_loss(model, 'train'):.3f}, val {estimate_loss(model):.3f}")
                        x, y = get_batch("train", model.c.block_size)
                        _, loss = model(x, y)
                        opt.zero_grad()
                        loss.backward()
                        opt.step()
                    return model


                if __name__ == "__main__":
                    torch.manual_seed(0)
                    model = train(GPT())
                    print(sum(p.numel() for p in model.parameters()), "parameters")
                    start = torch.tensor([encode("\n")])
                    print(decode(model.generate(start, 400)[0].tolist()))
            `,
        },
        break: {
            answer: `Without the causal mask, every position can see the whole window during training, including the very character it is supposed to predict, which sits right next to it. So the model learns to copy: the training loss plunges far below the honest model's (in the run below to about 0.04, against about 1.77), which looks like a fantastic result.\n\nAt generation time there is no future to copy. The model is asked about a position whose next character doesn't exist yet, a situation it never had to handle in training, so its predictions are meaningless. In the run below it produced nothing but blank lines: 150 newline characters in a row. (Other runs give random letters instead; either way, no text.) The lesson: a too-good training loss is a warning sign. The mask is what makes next-token prediction a real task, and training must match how the model is used.`,
            code: py`
                import torch
                from gpt import GPT, Config, train, estimate_loss, decode, encode

                for causal in [True, False]:
                    torch.manual_seed(0)
                    model = train(GPT(Config(causal=causal)), steps=800, log_every=0)
                    torch.manual_seed(1)
                    sample = decode(model.generate(torch.tensor([encode("\n")]), 150)[0].tolist())
                    print(f"causal={causal}: training loss {estimate_loss(model, 'train'):.3f}\n{sample}\n")
            `,
        },
        explain: {
            answer: `Your phone keyboard suggests the next word as you type: after "see you", it offers "soon" or "tomorrow". A GPT is that idea, trained on a huge amount of text and far deeper. Given everything so far, it gives a probability to every possible next token, picks one, adds it to the text, and repeats. Long, sensible answers come out of doing that one small step thousands of times.\n\nWhere the picture breaks: your keyboard looks only at the last word or two and has learned your habits. A GPT reads the whole conversation so far, thousands of tokens, and the pressure of predicting text well over trillions of words forces it to learn grammar, facts and some reasoning along the way. Still, it has no separate fact-checking step: it predicts what text is likely, which is why it can sound sure and be wrong.`,
        },
    },
    'f4-t6': {
        derive: {
            answer: `Rows are the token that is looking (the query); columns are the tokens it may look at. ✓ = allowed.\n\nEncoder (BERT): every token sees every token, before and after it. All 16 cells allowed.\n\nDecoder (GPT): token i may only see tokens 1 to i. Only the lower triangle, diagonal included: 4 + 3 + 2 + 1 = 10 cells allowed; the 6 cells above the diagonal (the future) are blocked.\n\nThat single difference decides what each is good at: the encoder reads in both directions, so it understands a fixed text well; the decoder never sees the future, so it can write text one token at a time.`,
            code: py`
                Encoder (all allowed)         Decoder (causal)
                       t1 t2 t3 t4                   t1 t2 t3 t4
                  t1    ✓  ✓  ✓  ✓              t1    ✓  .  .  .
                  t2    ✓  ✓  ✓  ✓              t2    ✓  ✓  .  .
                  t3    ✓  ✓  ✓  ✓              t3    ✓  ✓  ✓  .
                  t4    ✓  ✓  ✓  ✓              t4    ✓  ✓  ✓  ✓
            `,
            codeLanguage: 'text',
        },
        build: {
            answer: `Three changes to the GPT turn it into a small BERT. Remove the causal mask (causal=False). Add one extra vocabulary entry for a [MASK] token. And change the task: in every training window, hide a random 15% of the characters by replacing them with [MASK], and compute the loss only at those hidden positions, where the model must recover the original character.\n\n(Real BERT also sometimes swaps in a random token or leaves the token unchanged instead of masking, so it can't rely on seeing [MASK]; skipped here for simplicity.)\n\nAfter 1,500 steps it recovers about a third of the hidden characters on validation text (35% in this run; guessing would get under 2%), using context from both sides. With 15% of characters hidden, several gaps often sit close together, which makes it harder than it sounds; longer training raises it further.`,
            code: py`
                import torch
                import torch.nn.functional as F
                from gpt import GPT, Config, get_batch, vocab_size

                MASK = vocab_size                                          # one extra token id

                def masked_batch(split):
                    x, _ = get_batch(split)
                    hidden = torch.rand(x.shape) < 0.15
                    inputs = x.masked_fill(hidden, MASK)
                    targets = x.masked_fill(~hidden, -100)                 # -100: ignored by the loss
                    return inputs, targets

                torch.manual_seed(0)
                bert = GPT(Config(causal=False, vocab=vocab_size + 1))
                opt = torch.optim.AdamW(bert.parameters(), lr=1e-3)
                for step in range(1500):
                    inputs, targets = masked_batch("train")
                    logits, _ = bert(inputs)
                    loss = F.cross_entropy(logits.reshape(-1, logits.size(-1)), targets.reshape(-1), ignore_index=-100)
                    opt.zero_grad(); loss.backward(); opt.step()

                bert.eval()
                with torch.no_grad():
                    inputs, targets = masked_batch("val")
                    pred = bert(inputs)[0].argmax(-1)
                    hidden = targets != -100
                    print(f"recovered {(pred[hidden] == targets[hidden]).float().mean().item():.0%} of hidden characters")
                torch.save(bert.state_dict(), "bert.pt")
            `,
        },
        break: {
            answer: `To generate with it, put a [MASK] at the end, predict what it is, keep that character, add a new [MASK], and repeat. The result is poor: short runs of plausible letters that soon fall into repetition or nonsense, much worse than the GPT of the same size.\n\nWhy: it was trained on a different task. It always had real text on both sides of a gap, and only 15% of positions were hidden. Here the gap is always at the very end, with nothing to its right, which it never practised, and every character it guesses becomes context for the next guess, so its mistakes pile up. It also never learned a proper probability for "what comes next given only the past", which is exactly what generation needs. Encoders are built to understand a whole text at once (classification, search, tagging); decoders are built to write.`,
            code: py`
                import torch
                from gpt import GPT, Config, vocab_size, encode, decode

                MASK = vocab_size
                bert = GPT(Config(causal=False, vocab=vocab_size + 1))
                bert.load_state_dict(torch.load("bert.pt"))       # saved by the Build answer above
                bert.eval()
                torch.manual_seed(0)
                ids = encode("ROMEO:\n")
                with torch.no_grad():
                    for _ in range(120):
                        window = (ids + [MASK])[-64:]
                        logits = bert(torch.tensor([window]))[0][0, -1, :vocab_size]
                        ids.append(torch.multinomial(torch.softmax(logits, -1), 1).item())
                print(decode(ids))
            `,
        },
        explain: {
            answer: `BERT, an encoder, does fill-in-the-blank exercises. It reads a whole sentence with some words blanked out, "Paris is the ___ of France", and uses the words on both sides to fill each gap. That makes it very good at understanding text that already exists: classifying it, searching it, finding the names in it.\n\nGPT, a decoder, writes a story one word at a time. It can only look back at what it has written so far, never ahead, and predicts the next word, again and again. That makes it a writer. Because it never sees the future during training, it can keep going at generation time, which a fill-in-the-blank model can't do well.`,
        },
    },
    'f4-t13': {
        derive: {
            answer: `224 ÷ 16 = 14 patches along each side, so 14 × 14 = 196 patches.\n\nEach patch is 16 × 16 pixels with 3 colour channels: 16 × 16 × 3 = 768 numbers when flattened.\n\nSo the image becomes a sequence of 196 "tokens", each a 768-number vector, which a linear layer then projects to the model width. (ViT-Base's width is also 768, a coincidence of these sizes.) Add one class token and the transformer sees 197 positions. Halving the patch size to 8 × 8 would give 784 patches: four times as many tokens, and about 16 times the attention cost.`,
        },
        build: {
            answer: `The small ViT: cut each 32 × 32 CIFAR image into 4 × 4 patches (64 patches of 48 numbers), project each to 128 dimensions, add a learned position embedding, put a learnable class token in front, run 4 pre-norm transformer blocks, and classify from the class token's output.\n\nTrained for the same 2 epochs as the CNN in the convolution topic, it scores noticeably lower: about 48%, against the CNN's 60%. That is the expected result: a CNN has built-in assumptions that suit images (nearby pixels matter, the same pattern can appear anywhere), while a ViT has to learn them from data. ViTs win when trained on very large datasets.\n\nZero-shot CLIP: a pretrained CLIP turns the image and each label sentence, such as "a photo of a cat", into vectors in the same space; the label whose vector is closest wins. With no CIFAR training at all, it gets 92% of 200 test images right, far better than both models trained on CIFAR itself, because it learned from hundreds of millions of image–caption pairs. (The CLIP part downloads about 600 MB.)`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from torchvision import datasets
                from transformers import CLIPModel, CLIPProcessor

                train, test = datasets.CIFAR10("data", train=True, download=True), datasets.CIFAR10("data", train=False, download=True)
                Xtr = torch.tensor(train.data).permute(0, 3, 1, 2).float() / 255.0
                Xte = torch.tensor(test.data).permute(0, 3, 1, 2).float() / 255.0
                ytr, yte = torch.tensor(train.targets), torch.tensor(test.targets)

                class ViT(nn.Module):
                    def __init__(self, patch=4, d=128, depth=4, heads=4, classes=10):
                        super().__init__()
                        self.patch, n = patch, (32 // patch) ** 2
                        self.embed = nn.Linear(3 * patch * patch, d)
                        self.cls = nn.Parameter(torch.zeros(1, 1, d))
                        self.pos = nn.Parameter(torch.randn(1, n + 1, d) * 0.02)
                        layer = nn.TransformerEncoderLayer(d, heads, 4 * d, dropout=0.0, batch_first=True, norm_first=True)
                        self.blocks = nn.TransformerEncoder(layer, depth)
                        self.head = nn.Sequential(nn.LayerNorm(d), nn.Linear(d, classes))
                    def patchify(self, x):                                   # (B, 3, 32, 32) -> (B, 64, 48)
                        p = self.patch
                        x = x.unfold(2, p, p).unfold(3, p, p)                    # (B, 3, 8, 8, p, p)
                        return x.permute(0, 2, 3, 1, 4, 5).reshape(x.shape[0], -1, 3 * p * p)
                    def forward(self, x, shuffle=False):
                        tokens = self.embed(self.patchify(x))
                        if shuffle:                      # used by the Break answer: move the patches, keep the position numbers
                            tokens = tokens[:, torch.randperm(tokens.shape[1])]
                        tokens = torch.cat([self.cls.expand(len(x), -1, -1), tokens], dim=1) + self.pos
                        return self.head(self.blocks(tokens)[:, 0])

                def fit(model, X, y, epochs=2):
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    for _ in range(epochs):
                        for idx in torch.randperm(len(X)).split(128):
                            opt.zero_grad(); F.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()
                    return model

                torch.manual_seed(0)
                vit = fit(ViT(), Xtr, ytr)
                with torch.no_grad():
                    print(f"ViT test accuracy: {(vit(Xte).argmax(1) == yte).float().mean().item():.1%}")

                clip, proc = CLIPModel.from_pretrained("openai/clip-vit-base-patch32"), CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
                prompts = [f"a photo of a {name}" for name in test.classes]
                images = [test[i][0] for i in range(200)]
                with torch.no_grad():
                    inputs = proc(text=prompts, images=images, return_tensors="pt", padding=True)
                    guess = clip(**inputs).logits_per_image.argmax(dim=1)
                print(f"CLIP zero-shot on 200 test images: {(guess == yte[:200]).float().mean().item():.0%}")
            `,
        },
        break: {
            answer: `With only 10% of the training data (5,000 images, 10 epochs), the CNN still wins, about 50% against the ViT's 41%. In this small run the gap did not grow compared with the full data (60% against 48%): at this tiny scale both models are short of data and training. The famous result needs much larger scales: the original ViT lost to ResNets when trained on ImageNet's 1.3 million images, and only won when pretrained on hundreds of millions. The reason is the trade-off worth remembering: a CNN's built-in assumptions (look at small neighbourhoods, reuse the same filter everywhere) are worth a lot when data is limited; a ViT must learn even "neighbouring pixels belong together" from examples, and wins only once there are enough of them. Small experiments don't always reproduce large-scale effects, which is itself a useful lesson.\n\nShuffling the patch order at test time (moving the patches but keeping the position numbers in place, so each patch gets the wrong position): accuracy drops from about 41% to about 30%, but not to chance (10%). The drop shows the model does use the position embeddings: once patches are moved, shapes are scrambled. That it stays well above chance shows a lot of its decision comes from the contents of the patches alone, colours and textures, a bag-of-patches view. (A subtle trap: shuffling the tokens after the position embeddings have been added changes nothing at all, because attention without positions is order-blind, as the positional-encoding topic shows.) (A CNN can't be "shuffled" like this, because position is built into how it slides its filters.)`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from torchvision import datasets

                train, test = datasets.CIFAR10("data", train=True, download=True), datasets.CIFAR10("data", train=False, download=True)
                Xtr = torch.tensor(train.data[:5000]).permute(0, 3, 1, 2).float() / 255.0      # 10% of the data
                ytr = torch.tensor(train.targets[:5000])
                Xte, yte = torch.tensor(test.data).permute(0, 3, 1, 2).float() / 255.0, torch.tensor(test.targets)

                class ViT(nn.Module):
                    def __init__(self, patch=4, d=128, depth=4, heads=4):
                        super().__init__()
                        self.patch = patch
                        self.embed = nn.Linear(3 * patch * patch, d)
                        self.cls = nn.Parameter(torch.zeros(1, 1, d))
                        self.pos = nn.Parameter(torch.randn(1, (32 // patch) ** 2 + 1, d) * 0.02)
                        layer = nn.TransformerEncoderLayer(d, heads, 4 * d, dropout=0.0, batch_first=True, norm_first=True)
                        self.blocks, self.head = nn.TransformerEncoder(layer, depth), nn.Sequential(nn.LayerNorm(d), nn.Linear(d, 10))
                    def forward(self, x, shuffle=False):
                        p = self.patch
                        x = x.unfold(2, p, p).unfold(3, p, p).permute(0, 2, 3, 1, 4, 5).reshape(len(x), -1, 3 * p * p)
                        t = self.embed(x)
                        if shuffle:                      # move the patches before positions are added
                            t = t[:, torch.randperm(t.shape[1])]
                        t = torch.cat([self.cls.expand(len(x), -1, -1), t], dim=1) + self.pos
                        return self.head(self.blocks(t)[:, 0])

                cnn = nn.Sequential(nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                                    nn.Flatten(), nn.Linear(64 * 8 * 8, 10))
                torch.manual_seed(0)
                vit = ViT()
                for model in (vit, cnn):
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    for _ in range(10):                                   # 10 epochs of the small set
                        for idx in torch.randperm(5000).split(128):
                            opt.zero_grad(); F.cross_entropy(model(Xtr[idx]), ytr[idx]).backward(); opt.step()
                acc = lambda out: (out.argmax(1) == yte).float().mean().item()
                with torch.no_grad():
                    print(f"10% data: CNN {acc(cnn(Xte)):.1%}, ViT {acc(vit(Xte)):.1%}")
                    print(f"ViT with patches shuffled: {acc(vit(Xte, shuffle=True)):.1%}")
            `,
        },
        explain: {
            answer: `ViT reads a photo like a comic strip. It cuts the picture into a grid of small square panels, turns each panel into a vector, writes a panel number on each (the position), and then lets every panel look at every other panel with attention, just as a transformer does with words in a sentence. A special extra "summary" token gathers the whole story and makes the final decision.\n\nCLIP is two translators trained side by side, one for pictures and one for sentences. Shown millions of photos with their captions, they are trained until the picture-translator and the sentence-translator give the same "meaning code" to a photo and its own caption, and different codes to mismatched pairs. After that, you can classify any image without training: write sentences like "a photo of a dog", translate them, and pick the one whose code is closest to the photo's.`,
        },
    },
    'f4-t7': {
        derive: {
            answer: `Probabilities, already sorted: [0.5, 0.2, 0.15, 0.1, 0.05].\n\nTop-k = 2: keep the 2 most likely tokens, 0.5 and 0.2. Renormalise so they add up to 1: 0.5/0.7 ≈ 0.714 and 0.2/0.7 ≈ 0.286.\n\nTop-p = 0.8: keep the smallest set of top tokens whose probabilities add up to at least 0.8. Running total: 0.5, then 0.7 (not enough), then 0.85 (enough). So keep the first three: 0.5, 0.2, 0.15. Renormalise by 0.85: about 0.588, 0.235 and 0.176.\n\nThe difference: top-k always keeps exactly k tokens; top-p keeps a number that adapts. When the model is confident, a few tokens pass 0.8; when it is unsure, many do.`,
        },
        build: {
            answer: `generate() gets three knobs. Temperature divides the logits before softmax. Top-k sets every logit outside the k largest to −infinity. Top-p sorts the probabilities, keeps the smallest prefix whose total passes p (always at least the top token), and zeroes the rest. Then renormalise and sample as before.\n\nComparing five short samples per setting from the trained Shakespeare GPT: temperature 1.0 is varied, with some made-up words; temperature 0.5 gives safer, more repetitive text with more common words; top-k = 10 and top-p = 0.9 cut off the rarest characters, so there are fewer odd letter combinations while keeping variety. For this tiny character model the differences are modest; for large models, these settings change the feel of the output a lot.`,
            code: py`
                import torch
                import torch.nn.functional as F
                from gpt import GPT, train, decode, encode

                @torch.no_grad()
                def generate(model, idx, n, temperature=1.0, top_k=None, top_p=None):
                    model.eval()
                    for _ in range(n):
                        logits = model(idx[:, -model.c.block_size:])[0][:, -1] / temperature
                        if top_k is not None:
                            kth = torch.topk(logits, top_k).values[:, -1, None]
                            logits = logits.masked_fill(logits < kth, float("-inf"))
                        probs = F.softmax(logits, dim=-1)
                        if top_p is not None:
                            sorted_p, order = probs.sort(descending=True)
                            drop = sorted_p.cumsum(-1) - sorted_p > top_p           # drop once the total before it passes p
                            sorted_p[drop] = 0
                            probs = torch.zeros_like(probs).scatter(-1, order, sorted_p)
                            probs = probs / probs.sum(-1, keepdim=True)
                        idx = torch.cat([idx, torch.multinomial(probs, 1)], dim=1)
                    return idx

                torch.manual_seed(0)
                model = train(GPT(), steps=1500, log_every=0)
                for name, kwargs in [("T=1.0", {}), ("T=0.5", {"temperature": 0.5}),
                                     ("top-k 10", {"top_k": 10}), ("top-p 0.9", {"top_p": 0.9})]:
                    torch.manual_seed(1)
                    start = torch.tensor([encode("ROMEO:")] * 5)
                    out = generate(model, start, 50, **kwargs)
                    print(f"--- {name}")
                    for row in out:
                        print(repr(decode(row.tolist())))
            `,
        },
        break: {
            answer: `Temperature 0.01 is effectively greedy: the most likely next character every time. The text quickly falls into a loop, the same few words or the same line repeated over and over ("the the the", or one speaker's line again and again), because once the most likely continuation leads back to a state it has seen, it will repeat forever. It is also bland: it never takes the slightly less likely word that makes text interesting.\n\nTemperature 3.0 flattens the probabilities so much that rare characters are almost as likely as common ones. The text becomes random-looking characters: mixed capitals, punctuation in odd places, and no words.\n\nThe useful range is in between, often 0.7 to 1.0 for creative text and close to 0 for factual or structured answers, usually combined with top-p to cut off the junk tail.`,
            code: py`
                import torch
                from gpt import GPT, train, decode, encode

                torch.manual_seed(0)
                model = train(GPT(), steps=1500, log_every=0)
                for temperature in [0.01, 3.0]:
                    torch.manual_seed(1)
                    out = model.generate(torch.tensor([encode("ROMEO:")]), 150, temperature=temperature)
                    print(f"--- temperature {temperature}\n{decode(out[0].tolist())}\n")
            `,
        },
        explain: {
            answer: `Ordering at a restaurant. Temperature 0 means you always order the most popular dish: reliable, and boring after a while. A low temperature means you usually pick from the favourites. A high temperature means you feel adventurous and might order anything on the menu, including the dish nobody ever orders. Turn it up too far and you are choosing at random.\n\nThe model's "menu" is every possible next token with a probability. Temperature reshapes those probabilities before choosing: low makes the favourite even more likely, high flattens them so long shots get picked more often. Top-k and top-p are like crossing the worst dishes off the menu first.`,
        },
    },
    'f4-t8': {
        derive: {
            answer: `For every layer and every token, the cache stores one key vector and one value vector, each of size d_model.\n\nSize = 2 (K and V) × layers × tokens × d_model × bytes per number\n= 2 × 24 × 8,192 × 2,048 × 2 (bf16)\n= 1,610,612,736 bytes ≈ 1.6 GB (1.5 GiB),\nfor a single sequence.\n\nIt grows linearly with every factor: 100 users at this length would need about 160 GB of cache, more than the model's own weights. That is why long context and large batches are limited by memory, and why grouped-query attention (several query heads sharing one key/value head), cache quantisation and paged caches exist.`,
        },
        build: {
            answer: `Without a cache, generating each new token re-runs the whole context through the model, recomputing the keys and values of every earlier token, over and over. With a cache, the first step processes the prompt and stores every layer's keys and values; each later step feeds in only the one new token, computes its query, key and value, appends the key and value to the cache, and attends over the cache.\n\nThe check that matters first: with greedy decoding, both versions produce exactly the same tokens, so the cache changes speed, not results. On a model with a 512-character context, generating 500 tokens is several times faster with the cache here, and the gap grows with the context length, because the uncached cost per step grows with the number of tokens so far while the cached cost stays nearly flat.`,
            code: py`
                import time
                import torch
                import torch.nn.functional as F
                from gpt import GPT, Config

                @torch.no_grad()
                def generate_uncached(model, idx, n):
                    for _ in range(n):
                        logits, _ = model(idx[:, -model.c.block_size:])
                        idx = torch.cat([idx, logits[:, -1].argmax(-1, keepdim=True)], dim=1)
                    return idx

                @torch.no_grad()
                def generate_cached(model, idx, n):
                    c, H = model.c, model.c.n_head
                    cache = [None] * c.n_layer
                    new, start = idx, 0
                    for _ in range(n):
                        T = new.shape[1]
                        x = model.tok(new) + model.pos(torch.arange(start, start + T))
                        for i, block in enumerate(model.blocks):
                            h = block.ln1(x)
                            q, k, v = block.attn.qkv(h).split(c.n_embd, dim=2)
                            q, k, v = [t.view(1, T, H, -1).transpose(1, 2) for t in (q, k, v)]
                            if cache[i] is not None:                       # reuse every earlier key and value
                                k, v = torch.cat([cache[i][0], k], dim=2), torch.cat([cache[i][1], v], dim=2)
                            cache[i] = (k, v)
                            y = F.scaled_dot_product_attention(q, k, v, is_causal=(T > 1))
                            x = x + block.attn.proj(y.transpose(1, 2).reshape(1, T, c.n_embd))
                            x = x + block.mlp(block.ln2(x))
                        logits = model.head(model.ln(x))
                        nxt = logits[:, -1].argmax(-1, keepdim=True)
                        idx, start, new = torch.cat([idx, nxt], dim=1), start + T, nxt
                    return idx

                torch.manual_seed(0)
                model = GPT(Config(block_size=512)).eval()        # speed doesn't depend on training
                prompt = torch.zeros((1, 1), dtype=torch.long)
                t = time.perf_counter(); a = generate_uncached(model, prompt, 500); slow = time.perf_counter() - t
                t = time.perf_counter(); b = generate_cached(model, prompt, 500); fast = time.perf_counter() - t
                assert torch.equal(a, b)                           # identical tokens
                print(f"without cache {slow:.2f} s, with cache {fast:.2f} s: {slow / fast:.1f}x faster")
            `,
        },
        break: {
            answer: `Past the maximum length, a model with learned position embeddings simply has no embedding for position 512: the lookup fails with "index out of range". Models with rotary or similar encodings can technically keep going, but quality usually collapses beyond the lengths they were trained on. Real systems either stop at the limit, slide a window (drop the oldest tokens, which with a cache means also dropping and, for learned positions, recomputing), or use long-context techniques.\n\nMemory with many users: each user in a batch has their own cache, so memory grows exactly linearly with the batch size: twice the users, twice the cache. For this tiny model in float32 that is about 2 MB per 512-token sequence, so 64 users take about 134 MB. For a real 7B-class model (32 layers, width 4,096, bf16) it is about 2 GB per user at 4,096 tokens, or about 0.5 GB with grouped-query attention, which is why the number of users a GPU can serve at once is usually limited by cache memory, not by compute.`,
            code: py`
                import torch
                from gpt import GPT, Config

                c = Config(block_size=512)
                model = GPT(c).eval()
                try:
                    model(torch.zeros((1, 513), dtype=torch.long))
                except IndexError as e:
                    print("too long:", e)

                for users in [1, 8, 64]:
                    k = torch.zeros(users, c.n_head, c.block_size, c.n_embd // c.n_head)      # one layer's keys
                    total = 2 * c.n_layer * k.numel() * k.element_size()                      # keys and values, all layers
                    print(f"{users:3d} users x 512 tokens: KV cache {total / 1e6:.0f} MB")
            `,
        },
        explain: {
            answer: `Taking notes during a long meeting. Without notes, every time someone speaks you would replay the whole recording from the start to remember what was said, which gets slower as the meeting goes on. With notes, you just add one line for each new remark and glance back at your notes.\n\nIn a transformer, every new token needs the keys and values of all the earlier tokens. The KV cache is the notes: it stores them once, so each new token only computes its own and adds them to the cache, which makes generation much faster. The cost is that the notes take up memory, a lot of it for long conversations and many users at once.`,
        },
    },
    'f4-t9': {
        derive: {
            answer: `About 20 training tokens per parameter (the Chinchilla rule of thumb for compute-optimal training):\n\n125M parameters → 125M × 20 = 2.5 billion tokens\n1B parameters → 20 billion tokens\n7B parameters → 140 billion tokens\n\nModern models often train on far more than this, for example several trillion tokens for a 7B model, because the rule is about the best model for a fixed training budget. If the model will be used by millions of people, it is cheaper overall to train a smaller model for longer, since running it costs less every day.`,
        },
        build: {
            answer: `Train three GPTs of increasing width and depth on the same Shakespeare data, with the same number of steps, and record the final validation loss. On log-log axes, loss against parameter count falls in a roughly straight line: each multiplication of the size gives a similar reduction in loss. That straight line is a scaling law.\n\nWith this tiny dataset (1 MB) and short training, the line already bends at the big end: the largest model is held back by too little data and too few steps, which is the same lesson the Chinchilla paper drew: size and data have to grow together.`,
            code: py`
                import matplotlib.pyplot as plt
                import torch
                from gpt import GPT, Config, train, estimate_loss

                sizes, losses = [], []
                for n_embd, n_layer in [(32, 2), (64, 3), (128, 4)]:
                    torch.manual_seed(0)
                    model = train(GPT(Config(n_embd=n_embd, n_layer=n_layer, n_head=4)), steps=1500, log_every=0)
                    sizes.append(sum(p.numel() for p in model.parameters()))
                    losses.append(estimate_loss(model, iters=50))
                    print(f"{sizes[-1]:>8,} parameters: val loss {losses[-1]:.3f}")
                plt.loglog(sizes, losses, marker="o")
                plt.xlabel("parameters"); plt.ylabel("validation loss"); plt.show()
            `,
        },
        break: {
            answer: `Make two training sets of the same size: one is 900,000 different characters of Shakespeare; the other is only the first 100,000 characters, copied 9 times. Train the same model for the same number of steps on each, and measure on the same held-out text.\n\nThe duplicated set gives a clearly worse validation loss. The model sees the same passages again and again and starts memorising them, which lowers its training loss but doesn't help on new text; meanwhile the unique set teaches it nine times as much real variety. Same compute, less learned.\n\nReal web data is full of near-duplicates (boilerplate, mirrored pages, copied articles), which is why deduplication is a standard step in building pretraining data: it improves the model for free, and reduces memorisation of specific documents, a privacy and copyright concern.`,
            code: py`
                import torch
                from gpt import GPT, Config, get_batch, train_data, estimate_loss

                unique = train_data[:900_000]
                duplicated = train_data[:100_000].repeat(9)           # same length, a ninth of the variety
                for name, source in [("unique", unique), ("duplicated", duplicated)]:
                    torch.manual_seed(0)
                    model = GPT(Config())
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    for _ in range(1500):
                        x, y = get_batch("train", source=source)
                        loss = model(x, y)[1]
                        opt.zero_grad(); loss.backward(); opt.step()
                    print(f"{name:10s} training data: val loss {estimate_loss(model, iters=50):.3f}")
            `,
        },
        explain: {
            answer: `Learning a language by reading a library. A bigger brain can hold more of what it reads, and a bigger library gives it more to learn from. Scaling laws are the discovery that this works in a smooth, predictable way: make the model and the data bigger together, and the loss falls along a straight line on a log-log chart, so you can predict how good a much bigger model will be before you train it.\n\nBut the library has to be good. A library of the same book photocopied a thousand times, or full of spam and broken pages, teaches far less than its size suggests: the brain memorises the copies instead of learning the language. That is why deduplication, filtering and careful mixing of data sources matter as much as raw size.`,
        },
    },
    'f4-t12': {
        derive: {
            answer: `Total expert parameters: 24 layers × 64 experts × 100M = 153,600M, about 153.6 billion.\n\nUsed for each token: with top-2 routing, each token goes through 2 experts per layer: 24 × 2 × 100M = 4.8 billion.\n\nSo each token uses only 2 of 64 experts, about 3% of the expert parameters. The compute per token is like a 4.8B model (plus the shared attention and embeddings), while the model's total knowledge capacity is like a 150B+ model. But all 153.6B parameters must still sit in memory, because different tokens need different experts.`,
        },
        build: {
            answer: `The MoE layer has 4 small expert MLPs and a router: a linear layer that gives each token a score for each expert. For each token, take the top 2 scores, softmax them into two weights, run the token through those 2 experts only, and add their outputs with those weights. Each block's MLP is swapped for this layer.\n\nLogging how many tokens each expert receives shows how the router spreads the work. This version also computes the standard load-balancing loss (used in the break exercise), which is small when the experts are used evenly.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from gpt import GPT, Config, get_batch, estimate_loss

                class MoE(nn.Module):
                    def __init__(self, d, n_experts=4, k=2):
                        super().__init__()
                        self.k, self.n = k, n_experts
                        self.router = nn.Linear(d, n_experts)
                        self.experts = nn.ModuleList(nn.Sequential(nn.Linear(d, 2 * d), nn.GELU(), nn.Linear(2 * d, d))
                                                     for _ in range(n_experts))
                    def forward(self, x):
                        B, T, d = x.shape
                        flat = x.reshape(-1, d)
                        probs = F.softmax(self.router(flat), dim=-1)                  # (tokens, experts)
                        weights, chosen = probs.topk(self.k, dim=-1)
                        weights = weights / weights.sum(-1, keepdim=True)
                        out = torch.zeros_like(flat)
                        for e, expert in enumerate(self.experts):
                            rows, slot = (chosen == e).nonzero(as_tuple=True)
                            if len(rows):
                                out[rows] += weights[rows, slot, None] * expert(flat[rows])
                        share = F.one_hot(chosen, self.n).float().sum(1).mean(0) / self.k  # fraction of tokens per expert
                        self.counts = share.detach()
                        self.balance_loss = self.n * (share * probs.mean(0)).sum()       # 1.0 when perfectly even
                        return out.reshape(B, T, d)

                def train_moe(balance_coef, steps=800, seed=0, n_experts=4, k=2):
                    torch.manual_seed(seed)
                    model = GPT(Config())
                    for block in model.blocks:
                        block.mlp = MoE(model.c.n_embd, n_experts, k)
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    for _ in range(steps):
                        x, y = get_batch("train")
                        loss = model(x, y)[1] + balance_coef * sum(b.mlp.balance_loss for b in model.blocks)
                        opt.zero_grad(); loss.backward(); opt.step()
                    return model

                if __name__ == "__main__":
                    model = train_moe(balance_coef=0.01)
                    print(f"val loss {estimate_loss(model):.3f}")
                    for i, block in enumerate(model.blocks):
                        print(f"layer {i}: share of tokens per expert {block.mlp.counts.numpy().round(2)}")
            `,
        },
        break: {
            answer: `Without a balancing loss, the router is free to send most tokens to whichever experts got slightly ahead early on. Those experts get more training, so they become better, so the router prefers them even more: a rich-get-richer loop. With 8 experts and top-1 routing (an even share would be 12.5% each), the run below shows it: without a balancing loss, the busiest expert in a layer takes about 23% of the tokens on average, and some experts get only about 3%. Those starved experts barely train, and in large models this goes all the way to "dead" experts that receive almost no tokens and waste their parameters. (With only 4 experts and top-2 routing, as in the Build answer, it stays fairly even in a short run; imbalance grows with more experts, sparser routing and longer training.)\n\nWith the balancing loss, which is smallest when the share of tokens and the router's average probability are equal across experts, every expert stays between about 10% and 15%. Real MoE models also cap how many tokens one expert may take per batch (a capacity factor), so no expert is overloaded on the hardware.`,
            code: py`
                import torch

                # MoE and train_moe come from the Build answer above: save it as moe.py
                from moe import train_moe

                for coef in [0.0, 0.01]:
                    model = train_moe(balance_coef=coef, steps=1500, n_experts=8, k=1)    # 8 experts, top-1: an even share is 12.5%
                    shares = torch.stack([b.mlp.counts for b in model.blocks])
                    print(f"balance loss x {coef}: share of tokens per expert, one row per layer\n{shares.numpy().round(2)}")
                    print(f"  busiest expert, averaged over layers: {shares.max(dim=1).values.mean():.2f}, quietest anywhere: {shares.min():.2f}\n")
            `,
        },
        explain: {
            answer: `A big hospital has many specialists. A patient doesn't see every doctor in the building, only the one or two the front desk sends them to. So the hospital as a whole knows an enormous amount, but each visit only uses a little of it, and visits stay quick.\n\nIn a mixture-of-experts model, each layer has many expert networks and a router (the front desk) that sends each token to its top one or two experts. The model has a huge number of parameters, but each token uses only a small part, so it is fast to run for its size. Memory is still a cost: every specialist must be employed and in the building even when idle, so all the experts must sit in GPU memory, ready for whichever tokens need them.`,
        },
    },
    'f4-t10': {
        derive: {
            answer: `A 1,024 × 1,024 layer has 1,048,576 weights. Full fine-tuning trains all of them.\n\nLoRA trains B (1,024 × r) and A (r × 1,024), so 2 × 1,024 × r weights:\nr = 4: 8,192 weights, 0.78% of the layer\nr = 8: 16,384 weights, 1.56%\nr = 64: 131,072 weights, 12.5%\n\nThe update B·A can only change the layer in r independent directions. Small r is very cheap but limited; larger r can express bigger changes. Most fine-tunes work well with r between 8 and 64.`,
        },
        build: {
            answer: `A LoRA layer wraps an existing nn.Linear: the original weight is frozen, and the output adds (alpha / r) · x·Aᵀ·Bᵀ, with A starting small and random and B starting at 0, so at step 0 the model is exactly the original. Wrap the attention projections (qkv and proj) of every block and train only A and B.\n\nExperiment: pretrain the Shakespeare GPT, then fine-tune it to a very different style, a list of first names, one per line. LoRA with r = 8 trains about 3% of the parameters and learns the new style: its samples already look like names. Full fine-tuning gets a clearly lower loss in the same number of steps (about 1.61 against 2.07 here), because it can change everything, including the MLPs and embeddings, which matters for a change this big, from Shakespeare's verse to bare first names. For smaller shifts in style, the gap is usually much smaller. LoRA's adapter is a tiny file, and the original model stays untouched, so you could keep one adapter per style.`,
            code: py`
                import math
                import urllib.request
                import torch
                import torch.nn as nn
                from gpt import GPT, Config, train, encode, decode

                class LoRALinear(nn.Module):
                    def __init__(self, base, r=8, alpha=16, init_b_zero=True):
                        super().__init__()
                        self.base, self.scale = base, alpha / r
                        for p in self.base.parameters():
                            p.requires_grad = False
                        self.A = nn.Parameter(torch.randn(r, base.in_features) / math.sqrt(base.in_features))
                        self.B = nn.Parameter(torch.zeros(base.out_features, r) if init_b_zero else torch.randn(base.out_features, r) * 0.1)
                    def forward(self, x):
                        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)

                def add_lora(model, r=8, init_b_zero=True):
                    for p in model.parameters():
                        p.requires_grad = False
                    for block in model.blocks:
                        block.attn.qkv = LoRALinear(block.attn.qkv, r, init_b_zero=init_b_zero)
                        block.attn.proj = LoRALinear(block.attn.proj, r, init_b_zero=init_b_zero)
                    return model

                names = urllib.request.urlopen("https://raw.githubusercontent.com/karpathy/makemore/master/names.txt").read().decode()
                names = torch.tensor(encode(names))                        # lowercase letters and newlines: all in the vocabulary
                tr, va = names[:200_000], names[200_000:]

                def batch(d):
                    ix = torch.randint(len(d) - 65, (32,))
                    return torch.stack([d[i:i + 64] for i in ix]), torch.stack([d[i + 1:i + 65] for i in ix])

                def finetune(model, steps=500):
                    opt = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=1e-3)
                    for _ in range(steps):
                        loss = model(*batch(tr))[1]
                        opt.zero_grad(); loss.backward(); opt.step()
                    model.eval()
                    with torch.no_grad():
                        return sum(model(*batch(va))[1].item() for _ in range(20)) / 20

                if __name__ == "__main__":
                    torch.manual_seed(0)
                    base = train(GPT(), steps=1500, log_every=0)
                    torch.save(base.state_dict(), "base.pt")
                    for name, make in [("LoRA r=8", lambda m: add_lora(m, 8)), ("full fine-tune", lambda m: m)]:
                        torch.manual_seed(0)
                        model = GPT(); model.load_state_dict(torch.load("base.pt")); model = make(model)
                        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
                        loss = finetune(model)
                        torch.manual_seed(1)
                        sample = decode(model.generate(torch.tensor([encode("\n")]), 60)[0].tolist()).split()
                        print(f"{name}: {trainable:,} trainable parameters, names val loss {loss:.3f}, sample {sample[:6]}")
            `,
        },
        break: {
            answer: `If both A and B start random, B·A is not zero, so the moment you attach the adapters the model is no longer the pretrained model: random changes have been added to every attention layer. At step 0 the loss jumps up (in the run below, from about 1.76 on Shakespeare to about 2.05), and the first part of fine-tuning is spent undoing damage. Starting B at zero is what makes LoRA begin exactly at the pretrained model and move away only as far as the data asks.\n\nr = 1 on a task that needs a big change (Shakespeare to a list of names): the update can only move each layer along a single direction, so it learns the new style more slowly and ends at a higher loss than r = 8. Low rank is a strong restriction: it works when the change is small, like adjusting tone, and struggles when the model must learn a lot that is new.`,
            code: py`
                import torch
                from gpt import GPT, get_batch
                # add_lora, finetune and base.pt come from the Build answer above: save it as lora.py and run it first
                from lora import add_lora, finetune

                def shakespeare_loss(model):
                    model.eval()
                    with torch.no_grad():
                        return sum(model(*get_batch("val"))[1].item() for _ in range(20)) / 20

                for init_b_zero in [True, False]:
                    torch.manual_seed(0)
                    model = GPT(); model.load_state_dict(torch.load("base.pt"))
                    add_lora(model, r=8, init_b_zero=init_b_zero)
                    print(f"B starts at zero = {init_b_zero}: Shakespeare loss at step 0 = {shakespeare_loss(model):.3f}")

                for r in [1, 8]:
                    torch.manual_seed(0)
                    model = GPT(); model.load_state_dict(torch.load("base.pt"))
                    print(f"r = {r}: names val loss after fine-tuning {finetune(add_lora(model, r)):.3f}")
            `,
        },
        explain: {
            answer: `Instead of rewriting a whole textbook for a new course, you add a few sticky notes with corrections and extra tips next to the pages that need them. The textbook stays exactly as it was, the notes are cheap to write and easy to carry around, and you can keep a different set of notes for each class.\n\nLoRA does this for a model: the huge pretrained weight matrices stay frozen (the textbook), and you train two small matrices per layer whose product is added on top (the sticky notes). Training needs far less memory, the result is a small file, and the base model can be shared by many adapters.`,
        },
    },
    'f4-t11': {
        derive: {
            answer: `Instruction-tuning examples (prompt, ideal answer), for a cooking assistant:\n\n1. User: "How long should I boil an egg for a runny yolk?" Assistant: "About 6 minutes from when you lower it into boiling water. Then move it to cold water for a minute so it stops cooking and peels easily."\n2. User: "I have chicken, rice and spinach. Suggest a quick dinner." Assistant: "Make a one-pan chicken and spinach rice: brown bite-sized chicken pieces, add rice, stock and garlic, simmer for 15 minutes, then stir in the spinach until it wilts. Season with lemon and pepper."\n3. User: "Can I swap butter for oil in a cake?" Assistant: "Yes. Use about three-quarters as much oil as butter, for example 75 g of oil for 100 g of butter. The cake will be moister but a little less rich in flavour."\n\nPreference pairs (prompt, chosen, rejected):\n\n1. Prompt: "Is it safe to eat chicken that is a bit pink?" Chosen: "Not reliably. Colour isn't a safe test; check that the thickest part reaches 74°C with a thermometer." Rejected: "Yes, a little pink is fine, just eat it."\n2. Prompt: "Give me a quick pasta sauce." Chosen: a short, clear recipe with amounts and steps. Rejected: a long story about the history of tomatoes before a vague recipe.\n\nThe instruction examples teach the format and the job; the pairs teach which of two plausible answers is better, here safer and more to the point.`,
        },
        build: {
            answer: `A character model can't learn real conversation in a few minutes, so use simple tasks it can learn, in a chat template: "Q: reverse king\\nA: gnik\\n\\n", plus "upper" (make it capitals) and "first" (the first letter). Make a few hundred examples from Shakespeare's words and fine-tune the pretrained Shakespeare GPT on them.\n\nBefore fine-tuning, given "Q: reverse king\\nA:", the model just continues with Shakespeare-like text: it has no idea that a question expects an answer. After a few hundred steps it answers in the template's format, stops at the blank line, and gets most of the held-out words right (reversing is the hardest). That is instruction tuning in miniature: same model, same knowledge, now trained to respond to a request in a fixed format.`,
            code: py`
                import random
                import re
                import torch
                from gpt import GPT, train, encode, decode, text

                words = sorted({w for w in re.findall(r"[a-z]{3,7}", text)})
                random.seed(0); random.shuffle(words)
                train_words, test_words = words[:600], words[600:650]
                tasks = {"reverse": lambda w: w[::-1], "upper": lambda w: w.upper(), "first": lambda w: w[0]}
                example = lambda task, w: f"Q: {task} {w}\nA: {tasks[task](w)}\n\n"
                corpus = torch.tensor(encode("".join(example(t, w) for w in train_words for t in tasks) * 3))

                @torch.no_grad()
                def ask(model, task, word):
                    out = decode(model.generate(torch.tensor([encode(f"Q: {task} {word}\nA:")]), 12, temperature=0.01)[0].tolist())
                    return out.split("A:")[1].split("\n")[0].strip()

                torch.manual_seed(0)
                model = train(GPT(), steps=1500, log_every=0)
                print("before:", [ask(model, t, "king") for t in tasks])
                opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                model.train()
                for _ in range(600):
                    ix = torch.randint(len(corpus) - 65, (32,))
                    x, y = torch.stack([corpus[i:i + 64] for i in ix]), torch.stack([corpus[i + 1:i + 65] for i in ix])
                    loss = model(x, y)[1]
                    opt.zero_grad(); loss.backward(); opt.step()
                print("after:", [ask(model, t, "king") for t in tasks])
                for t in tasks:
                    right = sum(ask(model, t, w) == tasks[t](w) for w in test_words)
                    print(f"{t}: {right}/{len(test_words)} held-out words right")
            `,
        },
        break: {
            answer: `The shortcut: "longer is better". If the chosen answer is always the longer one, the easiest way to win the preference is simply to write more, with more caveats, more bullet points and more repetition, whether or not the extra text helps. The model learns length, not quality. This really happens: preference-tuned models are known to drift towards verbosity, and judges (human or LLM) often favour longer answers.\n\nHow to check for it:\n• Look at the data first: compare the lengths of chosen and rejected answers. If chosen is longer in, say, 95% of pairs, the signal is mostly length.\n• Measure after training: plot answer length before and after tuning on the same prompts, and check how much of the "win rate" against the old model is explained by length (compare wins only among answers of similar length, a length-controlled win rate).\n• Add pairs where the shorter answer is better, and test on prompts where the ideal answer is very short ("What is 2 + 2?").\n\nThe general lesson: a model trained to win a comparison will find the cheapest feature that predicts winning. Every bias in the preference data becomes behaviour.`,
        },
        explain: {
            answer: `Think of training a new employee in three stages.\n\nPretraining is reading everything: years of books, websites and code. Afterwards they know a huge amount, but if you ask them a question they might just continue your sentence, because nobody taught them that a question needs an answer.\n\nInstruction tuning is an internship with worked examples: "here is a request, here is a good response", thousands of times. Now they know the job: answer questions, follow instructions, use the right format.\n\nPreference tuning is a manager reviewing their work: "this version is better than that one". Shown many such comparisons (RLHF learns a scoring model from them; DPO learns straight from the pairs), they learn the finer points: more helpful, more honest, safer, better judgement in grey areas. Each stage builds on the last; the knowledge comes almost entirely from the first.`,
        },
    },
    'f4-t14': {
        derive: {
            answer: `The majority of 5 is right when at least 3 of the 5 samples are right. With p = 0.6 per sample, independently:\n\nP(5 right) = 0.6⁵ = 0.07776\nP(4 right) = 5 × 0.6⁴ × 0.4 = 5 × 0.1296 × 0.4 = 0.2592\nP(3 right) = 10 × 0.6³ × 0.4² = 10 × 0.216 × 0.16 = 0.3456\n\nTotal: 0.07776 + 0.2592 + 0.3456 ≈ 0.683.\n\nSo the vote is right about 68% of the time, more often than one sample (60%). In practice it can be even better, because wrong answers usually disagree with each other (many different wrong numbers), so the right answer can win with fewer than 3 votes. And it can be worse when the samples aren't independent, for example when the model makes the same mistake every time.`,
            code: py`
                from math import comb
                print(sum(comb(5, k) * 0.6**k * 0.4**(5 - k) for k in range(3, 6)))   # 0.68256
            `,
        },
        build: {
            answer: `The experiment: generate 50 word problems whose answers you know, then compare four methods. A direct answer ("reply with just the number"); "think step by step, then give the answer"; and self-consistency, which samples the step-by-step answer 5 or 10 times and takes the most common final answer. For each method record accuracy and the total output tokens, which is where the time goes, and plot accuracy against tokens.\n\nIt uses llm.py, the free helper from the Prompting topic in Phase 5 (Groq, then Gemini, then NVIDIA on free tiers, then a local Ollama model). Self-consistency needs varied samples, so those calls use temperature 1.0; the others use 0.\n\nWhat to expect depends on the model. The first models in the chain (gpt-oss) are reasoning models: they think before answering anyway, so "think step by step" adds less, and self-consistency adds a few points on the hardest problems at 5 to 10 times the tokens. A small model without built-in reasoning, such as llama3.2:3b on Ollama (pass providers=[("Ollama", "http://localhost:11434/v1/chat/completions", None, "llama3.2:3b")]), shows the classic big jump from step-by-step. A 3-problem trial on qwen2.5:7b (local, no built-in reasoning) gave: direct 0 of 3, step by step 3 of 3, self-consistency 2 of 3. Sampling at temperature 1.0 made the small model sloppier, so self-consistency did worse than one careful answer; try a temperature of 0.6 to 0.8. It makes about 850 calls (50 × (1 + 1 + 5 + 10)), which will hit free-tier rate limits and fall back down the chain, so try 10 problems first.`,
            code: py`
                import random
                import re
                from collections import Counter
                from llm import ask, text_of          # llm.py from Phase 5's Prompting topic: free APIs, then a local model

                random.seed(0)
                problems = []
                for _ in range(50):
                    a, b, c = random.randint(12, 99), random.randint(3, 19), random.randint(2, 9)
                    q = f"A shop has {a} boxes with {b} apples each. It sells {c} full boxes, then gets {b} more apples. How many apples does it have now?"
                    problems.append((q, (a - c) * b + b))

                def solve(prompt, temperature):
                    reply = ask(prompt, temperature=temperature, max_tokens=1500)
                    numbers = re.findall(r"ANSWER:\s*(-?\d+)", text_of(reply))
                    return (int(numbers[-1]) if numbers else None), reply["output_tokens"]

                DIRECT = "{q}\nReply with only the final number, written as ANSWER: <number>."
                STEPS = "{q}\nThink step by step, then finish with ANSWER: <number>."

                def run(template, samples=1):
                    correct = tokens = 0
                    for q, truth in problems:
                        answers = []
                        for _ in range(samples):
                            answer, used = solve(template.format(q=q), temperature=1.0 if samples > 1 else 0.0)
                            answers.append(answer); tokens += used
                        votes = Counter(a for a in answers if a is not None)
                        correct += bool(votes) and votes.most_common(1)[0][0] == truth
                    return correct / len(problems), tokens

                for name, template, samples in [("direct", DIRECT, 1), ("step by step", STEPS, 1),
                                                ("self-consistency x5", STEPS, 5), ("self-consistency x10", STEPS, 10)]:
                    accuracy, tokens = run(template, samples)
                    print(f"{name:22s} accuracy {accuracy:.0%}, output tokens {tokens:,}")
            `,
        },
        break: {
            answer: `On simple factual questions ("What is the capital of Canada?"), extra thinking doesn't help: the model either knows the fact or it doesn't, and reasoning can't create knowledge that isn't there. Step-by-step and voting cost several times the tokens and the accuracy stays the same, already near 100% for easy facts. Occasionally overthinking even hurts, talking itself out of the right first answer. Test-time compute pays off on problems that need several steps (arithmetic, logic, code, planning), not on recall.\n\nReasoning wrong, answer right: look through the step-by-step outputs for cases like "15% of 80: 10% is 8, and 5% is 3, so 15% is 12". The answer, 12, is right, but the step "5% is 3" is wrong (it is 4), and 8 + 3 isn't even 12. The model reached the answer some other way and wrote a plausible-looking explanation. The lesson: a written chain of thought is not a guaranteed record of how the model got its answer. Check the answer, and don't treat the reasoning as proof; when the steps matter, verify them, for example with code or a calculator tool.`,
        },
        explain: {
            answer: `A student in an exam can shout out the first answer that comes to mind, or use scrap paper: write out the steps, check the work, even solve it two different ways and see if they agree. The scrap paper costs time, but on a hard maths problem it makes a right answer far more likely.\n\nTest-time compute is giving the model scrap paper: letting it generate reasoning before the answer, or sampling several answers and voting. Reasoning models are trained to do this well. It is worth the cost when the problem needs several steps and a wrong answer is expensive: maths, code, tricky analysis. It is wasted on simple lookups and chit-chat, where the first answer is already right and the extra tokens only add time and cost.`,
        },
    },
};
