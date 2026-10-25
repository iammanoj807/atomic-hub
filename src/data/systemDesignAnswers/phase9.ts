import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 9 · AI and ML system design. One good answer for each practice exercise.

export const sdPhase9Answers: Record<string, SDTopicAnswers> = {
    'sd9-t1': {
        explain: {
            answer: `Ingestion pipeline (runs in the background, whenever a document changes):\n1. A change event (a wiki page edited, a PDF uploaded, a ticket closed) puts the document on a queue.\n2. Parse it into clean text (PDF layout, tables, headings), and drop boilerplate such as navigation and footers.\n3. Split it into chunks of a few hundred tokens, with a little overlap, following headings where possible, so each chunk makes sense on its own.\n4. Embed each chunk (turn it into a vector), and store it in the vector store with its metadata: document id, title, link, updated time, and who is allowed to read it.\n5. Delete or replace the chunks of the old version, so stale text can't be found.\n\nQuery pipeline (runs for every question, in a few seconds):\n1. Rewrite the question using the conversation so far ("what about part-timers?" becomes a complete question).\n2. Retrieve: vector search plus keyword search (hybrid), filtered to chunks this user may read.\n3. Re-rank the top 50 or so with a more accurate model, and keep the best 5 to 10.\n4. Build the prompt: instructions, the chunks with their sources, and the question. Tell the model to answer only from the sources, and to say "I don't know" otherwise.\n5. The LLM streams the answer with citations; output checks run; the whole trace is logged for evaluation.`,
        },
        draw: {
            answer: `Permissions are applied inside retrieval, before anything reaches the LLM, so the model never sees text the user can't read. Every step is traced, and the same golden set is replayed against any change before it ships.`,
            code: py`
                INGESTION
                Sources (wiki, PDFs, tickets) ── change events ──► Queue
                  ──► parse → clean → chunk → embed
                  ──► Vector store: text, vector, doc link, updated_at,
                                    allowed groups (permissions)

                QUERY
                User ── question ──► Chat API (auth: who is asking?)
                  1. rewrite the question with the conversation
                  2. hybrid retrieval ──► Vector store + keyword index
                       filter: chunks this user is allowed to read
                  3. re-ranker ── top 50 → best 5–10
                  4. prompt: instructions + sources + question
                  5. guardrails in: injection check on retrieved text
                  6. LLM ══ streamed answer + citations ══► User
                  7. guardrails out: grounded? safe? cites sources?

                ALONGSIDE
                  Tracing: every step, inputs, outputs, latency, cost
                  Evaluations: golden set → recall@k, faithfulness
                               (a regression test for every change)
                  Feedback: thumbs up/down → new golden questions
                  Cache: frequent answers; small model for easy questions
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `A good golden set mixes simple lookups, multi-step questions, questions that should be refused, and questions with no answer in the documents. Each "must contain" is checkable by a person or an automated judge:\n\n1. "How many days of annual leave do full-time staff get?" Must give the exact number in the current leave policy, mention whether bank holidays are on top, and cite the leave policy.\n2. "I work three days a week. How much leave do I get?" Must apply the pro-rata rule from the policy (3/5 of the full-time amount), show the result, and cite the part-time section.\n3. "Can I carry unused holiday into next year?" Must state the carry-over limit and the deadline to use it, and cite the policy.\n4. "How do I book a day off?" Must name the booking system and the approval step (line manager), plus any notice period, with a link.\n5. "What's the nightly hotel limit for a trip to London?" Must give the London cap from the travel policy (not the cap for elsewhere), with the currency, and cite the travel policy.\n6. "I've been off sick for 8 days. What do I need to do?" Must say a fit note is needed after 7 days, explain sick pay as the policy describes it, and cite the sickness policy.\n7. "How long can I work remotely from another country?" Must give the yearly limit, say prior approval is needed, mention tax or right-to-work checks if the policy does, and cite it.\n8. "Has bereavement leave changed this year?" Must cite only the latest version of the policy, give its effective date, and describe the change; it must not quote the old version as current.\n9. "How much does my colleague Ben earn?" Must refuse: salary data is confidential (and not in the documents this user can access). It must reveal no figure.\n10. "What is the parental leave policy in our Paris office?" (Only UK policies are loaded.) Must say it doesn't have that policy, and point to HR; it must not invent French rules or present the UK policy as if it applied.\n\nRun them on every change to chunking, retrieval, prompts or models, and track the pass rate over time.`,
        },
        tradeoffs: {
            answer: `Long-context model reading whole documents:\n• Cost: every question pays to read every token you send. A company's documents run to millions of pages, so you can never send them all; even 100 documents can be a million tokens per question. Prompt caching helps only when the same documents are sent again and again.\n• Freshness: as fresh as whatever you load, but you still have to choose which documents to load for each question, which is retrieval again, just coarser.\n• Accuracy: the model sees whole documents, so nothing is lost at chunk boundaries and it can connect distant sections. But accuracy drops as inputs grow very long (facts in the middle are missed), citations are vaguer, and permissions are harder to enforce.\n\nRAG with chunks:\n• Cost: retrieval is cheap, and only a few thousand tokens of relevant text are sent, so the cost per question is low and steady, whatever the size of the collection.\n• Freshness: when a document changes, re-index just its chunks; answers reflect the change within minutes.\n• Accuracy: focused context and precise citations, and permissions are enforced in the retrieval filter. But if retrieval misses the right chunk, the answer fails, so chunking, hybrid search and re-ranking need real work, and evaluation of retrieval itself.\n\nIn practice: RAG for large, changing collections, and a hybrid for the rest, where retrieval picks a few whole documents and a long-context model reads them in full.`,
        },
    },
    'sd9-t2': {
        explain: {
            answer: `There are millions of items, and only about 100–200 ms to answer. Scoring every item with an accurate model for every request would take far too long, so the work is split in two.\n\nCandidate generation: a fast, rough first pass that cuts millions of items down to roughly 500–1,000 that might interest this user. Several cheap sources are merged: items whose embeddings are close to the user's (approximate nearest-neighbour search), items often bought or watched together with what they liked, and popular or trending items. It optimises for recall: don't miss the good ones; precision doesn't matter yet.\n\nRanking: a slower, accurate model scores only those candidates, using rich features about the user, the item and the context (time of day, device, recent behaviour), and predicts what you care about (click, watch time, purchase). It optimises for precision: put the best ones at the top.\n\nThen a re-ranking step applies rules: variety, freshness, no items already seen.\n\nWhy both: the ranker is too expensive to run on everything, and the candidate generator is too rough to order the final list. Together they are both fast and good.`,
        },
        draw: {
            answer: `The offline loop turns logged behaviour into features and models; the online path uses them in milliseconds. The feature store is shared by both, so a feature means the same thing in training and in serving.`,
            code: py`
                OFFLINE (learning)
                Apps ── clicks, watches, purchases ──► Event logs
                  ──► feature pipelines ──► Feature store
                                              ├─ offline: history for training
                                              └─ online: latest values, fast
                  ──► training jobs ──► Model registry
                         ├─ embedding model ──► ANN index of item vectors
                         └─ ranking model

                ONLINE (each request, ~100–200 ms)
                GET /recommendations?user=42
                  1. candidates (~500–1,000), from several sources:
                       ANN search on the user's embedding
                       items often bought together
                       popular and trending
                  2. ranking: fetch features (online store), score each
                  3. re-ranking: variety, freshness, remove seen items
                  ──► top 20 to the app
                  └─ log what was shown ──► Event logs  (closes the loop)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Each column of the ratings matrix describes one film by who rated it and how highly. Cosine similarity between two columns is high when the same people rated both films highly. Computing it for all pairs at once is one matrix product, divided by the column lengths.\n\nAlien's nearest film is Aliens (0.96), Toy Story's is Finding Nemo (0.94), and Heat's is Ronin (0.95): the three "tastes" in the data come out clearly. For a new user who has only rated Toy Story 5, scoring every film by its similarity to what they rated recommends Finding Nemo first.`,
            code: py`
                import numpy as np

                films = ["Alien", "Aliens", "Toy Story", "Finding Nemo", "Heat", "Ronin"]
                ratings = np.array([            # rows: users, columns: films; 0 = not rated
                    [5, 4, 0, 0, 1, 0],
                    [4, 5, 1, 0, 0, 1],
                    [0, 1, 5, 4, 0, 0],
                    [1, 0, 4, 5, 0, 0],
                    [0, 0, 0, 1, 5, 4],
                    [1, 0, 0, 0, 4, 5],
                    [5, 5, 0, 1, 0, 0],
                ])

                norms = np.linalg.norm(ratings, axis=0)
                similarity = (ratings.T @ ratings) / np.outer(norms, norms)   # film × film cosine similarity
                np.fill_diagonal(similarity, 0)                               # a film isn't its own neighbour


                def similar_to(film, k=2):
                    i = films.index(film)
                    best = np.argsort(-similarity[i])[:k]
                    return [(films[j], round(float(similarity[i, j]), 2)) for j in best]


                for film in ["Alien", "Toy Story", "Heat"]:
                    print(film, "→", similar_to(film))
                # Alien → [('Aliens', 0.96), ('Finding Nemo', 0.18)]
                # Toy Story → [('Finding Nemo', 0.94), ('Aliens', 0.19)]
                # Heat → [('Ronin', 0.95), ('Alien', 0.17)]

                new_user = np.array([0, 0, 5, 0, 0, 0])                       # only rated Toy Story
                scores = (similarity @ new_user).astype(float)
                scores[new_user > 0] = -np.inf                                 # don't recommend what they've seen
                print([films[j] for j in np.argsort(-scores)[:2]])             # ['Finding Nemo', 'Aliens']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• Clicks: easy to measure and fast to learn from, but they reward whatever makes people tap: sensational titles and misleading thumbnails. Click-through rises while satisfaction falls, and users learn to distrust the recommendations.\n• Watch time: closer to real interest, and harder to fake with a thumbnail. But it favours long content over good content, and endless, compulsive viewing (autoplay rabbit holes) over what people are glad they watched; it can push towards extreme or addictive material because it holds attention.\n• Long-term retention (do people come back next month?): the closest to "this product is good for people". But the signal is slow (weeks), noisy and hard to attribute to any single recommendation, so it is hard to train on directly and needs long experiments.\n\nAll three, optimised blindly, can narrow what people see (filter bubbles) and favour what is already popular.\n\nIn practice, teams combine signals (clicks, watch time, likes, "not interested", surveys asking "was this worth your time?"), train for the short-term ones, and judge launches by long-term metrics plus guardrails (diversity, complaints, quality ratings), so a model that gains clicks but hurts retention doesn't ship.`,
        },
    },
    'sd9-t3': {
        explain: {
            answer: `Real-time scoring path (every transaction, in under about 100 ms, before it is approved):\n1. The payment arrives at the scoring service: card, amount, merchant, device, location.\n2. It fetches features from a low-latency feature store: real-time ones kept up to date by a streaming pipeline ("transactions on this card in the last 10 minutes", "amount spent today", "distance from the usual location") and historical ones ("card age", "typical spend at this merchant type").\n3. A rules engine runs (hard rules: blocked cards, sanctions lists, impossible travel), and an ML model (often gradient-boosted trees) gives a risk score.\n4. Thresholds turn the score into a decision: allow, ask for extra verification (a one-time code), send to manual review, or block. The decision comes with reasons.\n5. If the model is down or slow, the service falls back to rules alone, so payments don't stop.\n\nLearning loop (days to weeks):\n1. Every decision is logged with the exact features used.\n2. Labels arrive later: chargebacks, customer reports, analyst verdicts.\n3. They are joined to the logged features (point-in-time correct), and the model is retrained.\n4. The new model is evaluated against the old one, released carefully (shadow, then canary), and monitored for drift, because fraudsters change tactics.`,
        },
        draw: {
            answer: `The scoring service must answer within the payment's time budget, so it only reads precomputed features; the streaming pipeline keeps the windowed counts fresh. Labels arrive weeks later and flow back into training through the decision log.`,
            code: py`
                REAL TIME
                Payment ── transaction ──► Scoring service ──► decision + reasons
                                             │      ▲            (allow / verify /
                                             │      │             review / block)
                                       features│     │
                                             ▼      │
                                         Feature store (low latency)
                                             ▲
                Transaction events ──► Kafka ──► Stream processor
                                         (counts and sums per card, merchant,
                                          device over 10 min, 1 h, 24 h windows)

                Scoring service = rules engine + ML model (+ rules-only fallback)

                LEARNING LOOP
                Scoring service ── decision + features used ──► Decision log
                Chargebacks, customer reports ──┐
                Analyst verdicts (case tool) ───┴──► Labels (arrive late)
                Decision log + labels ── point-in-time join ──► Training
                  ──► evaluation ──► Model registry ──► shadow → canary → live
                Monitoring: score drift, fraud caught, false positives
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The usual public dataset is Kaggle's "Credit Card Fraud Detection": 284,807 card transactions, of which 492 (0.17%) are fraud. This answer uses a synthetic stand-in with the same kind of imbalance (0.2% fraud, 100,000 rows), so it runs anywhere; to use the real file, load creditcard.csv and use its Class column as y.\n\nLogistic regression is trained with plain gradient descent in NumPy. Fraud examples are weighted about 500 times more, otherwise the model learns that "never fraud" is 99.8% accurate. The test set has 48 frauds in 30,000 transactions:\n• threshold 0.5: flags 4,904 transactions, catches 40 of 48 frauds. Recall 0.83, but precision 0.01: 99 in 100 alerts are false.\n• threshold 0.9: flags 558, catches 22. Recall 0.46, precision 0.04.\n• threshold 0.99: flags 21, catches 7. Recall 0.15, precision 0.33.\n\nThe threshold is a business decision, not a modelling one: each missed fraud costs its amount; each false alarm costs an annoyed customer or an analyst's time. Real systems use several thresholds: auto-block only the very top, send a one-time code for the middle band, allow the rest. And accuracy is useless here: a model that never flags anything scores 99.8%.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n, fraud_rate = 100_000, 0.002                   # about as rare as in the real dataset
                y = (rng.random(n) < fraud_rate).astype(float)
                X = rng.normal(size=(n, 5)) + y[:, None] * np.array([1.5, 1.0, 0.8, 0.0, 0.5])   # overlapping classes

                split = int(0.7 * n)                             # train on the first 70%, test on the rest
                Xtr, ytr, Xte, yte = X[:split], y[:split], X[split:], y[split:]

                w, b = np.zeros(5), 0.0
                pos_weight = (1 - ytr.mean()) / ytr.mean()       # each fraud counts ~500 times
                sample_w = np.where(ytr == 1, pos_weight, 1.0)
                for _ in range(500):                             # logistic regression, gradient descent
                    p = 1 / (1 + np.exp(-(Xtr @ w + b)))
                    grad = sample_w * (p - ytr)
                    w -= 0.5 * (Xtr.T @ grad) / sample_w.sum()
                    b -= 0.5 * grad.sum() / sample_w.sum()

                scores = 1 / (1 + np.exp(-(Xte @ w + b)))
                for threshold in (0.5, 0.9, 0.99):
                    flagged = scores >= threshold
                    caught = int(np.sum(flagged & (yte == 1)))
                    precision = caught / max(int(flagged.sum()), 1)
                    recall = caught / yte.sum()
                    print(f"threshold {threshold}: flagged {int(flagged.sum())}, caught {caught} of {int(yte.sum())}, "
                          f"precision {precision:.2f}, recall {recall:.2f}")
                # threshold 0.5: flagged 4904, caught 40 of 48, precision 0.01, recall 0.83
                # threshold 0.9: flagged 558, caught 22 of 48, precision 0.04, recall 0.46
                # threshold 0.99: flagged 21, caught 7 of 48, precision 0.33, recall 0.15
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Rules only wins when:\n• you are starting out and have no labelled fraud to learn from;\n• the rule is a hard requirement: sanctions lists, blocked cards, legal limits;\n• a new attack appears today: a rule can be written and deployed in an hour, while a model needs new labels and retraining;\n• every decision must be explained in one sentence.\nBut rules are brittle, rack up false positives, and fraudsters learn them quickly.\n\nAn ML model only wins when:\n• you have plenty of labelled history and patterns too subtle for hand-written rules (combinations of amount, time, device, merchant, velocity);\n• you need a better trade-off between catching fraud and annoying customers than rules can give.\nBut a model alone is slow to react to brand-new attacks, harder to explain, and a single point of failure if the model service goes down.\n\nBoth (the usual production answer): rules as guardrails (hard blocks, known-bad lists, emergency fixes for a fresh attack), the model's score for everything nuanced, thresholds that route to allow, verify, review or block, and rules-only as the fallback when the model is unavailable. Analysts' verdicts feed both: new rules now, better models later.`,
        },
    },
    'sd9-t4': {
        explain: {
            answer: `Generating a reply has two phases.\n\nPrefill reads the prompt. All the prompt's tokens are already known, so the model processes them all at once, in parallel: big matrix multiplications that keep the GPU's compute fully busy. It produces the KV cache (the stored attention keys and values for every prompt token) and the first output token. Its cost grows with the prompt's length, and it sets the time to first token. It is limited by compute.\n\nDecode then generates the answer one token at a time, each depending on the one before. Each step does very little arithmetic per sequence (one new token), but must read all the model's weights and that sequence's whole KV cache from GPU memory. So decode is limited by memory bandwidth, not compute: one sequence alone leaves most of the GPU idle. It sets the speed of the stream (tokens per second).\n\nThat is why they are optimised differently: decode gets continuous batching (many sequences share each pass over the weights, so the memory read is shared), and memory-efficient KV caches (paged attention) so more sequences fit. Prefill gets chunking (long prompts split so they don't stall everyone's decoding), prefix caching for repeated system prompts, and sometimes its own separate GPUs.`,
        },
        draw: {
            answer: `The gateway handles everything about who may call and how much; the router chooses a pool by model and priority. Each pool's servers batch continuously, and the autoscaler watches queue length and latency, not just GPU use, because time to first token is what users feel.`,
            code: py`
                Clients ── POST /v1/chat (stream) ──► Gateway
                                                       auth, quotas per team,
                                                       rate limits, metering
                                                         │
                                                         ▼
                                                       Router
                                                       by model, version, priority
                                   ┌─────────────────────┼─────────────────────┐
                                   ▼                     ▼                     ▼
                            Pool: large model     Pool: small model     Pool: embeddings
                            ┌───────────────┐     ┌───────────────┐
                            │ model server  │     │ model server  │   each server:
                            │ (vLLM-style)  │ ... │               │   bounded queue,
                            │ continuous    │     │               │   continuous batching,
                            │ batching,     │     │               │   paged KV cache,
                            │ paged KV cache│     │               │   prefix cache
                            └───────────────┘     └───────────────┘
                                   ▲                     ▲
                Autoscaler ── adds/removes GPU replicas per pool
                              (on queue length, time to first token)
                Metrics ◄── TTFT, tokens/s, GPU use, errors, usage per team
                Tokens stream back: server ══► gateway ══► client
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Each 4,000-token request needs 4,000 × 0.5 MB = 2,000 MB = 2 GB of KV cache when full. 20 GB ÷ 2 GB = 10 requests at once.\n\nWhat that means: the GPU can only run 10 such conversations in parallel, however much compute it has to spare; the KV cache, not compute, sets the batch size. That is why the main levers are about memory: paged attention allocates the cache as tokens are actually generated (most requests never reach their maximum, so far more than 10 fit in practice); prefix caching stores a shared system prompt's cache once for everyone; quantising the KV cache to 8 bits halves it (20 at once); and models with grouped-query attention need much less cache per token in the first place.`,
            code: py`
                kv_memory_mb = 20 * 1000                         # 20 GB of KV cache
                per_request_mb = 4000 * 0.5                      # 4,000 tokens × 0.5 MB each
                print(per_request_mb, kv_memory_mb // per_request_mb)      # 2000.0 10.0: 10 requests at once
                print(kv_memory_mb // (per_request_mb / 2))                # 20.0 with an 8-bit KV cache
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `One big model for everything:\n• The best quality on every request, one model to evaluate, deploy and monitor, and consistent behaviour.\n• But it is expensive and slow for the many requests that are easy (classify this ticket, extract a date, a short factual answer): you pay large-model prices and latency for small-model work, and capacity runs out sooner.\n\nRouting between a small and a large model:\n• Much cheaper and faster on average, because most traffic is usually easy enough for the small model, and the big GPUs are saved for hard requests.\n• But you need a router: rules (by task type, by product feature) or a small classifier, and it will sometimes send a hard question to the small model, which quietly lowers quality. A cascade (try small; escalate if it is unsure) adds latency to escalated requests.\n• Two fleets to run, two models to evaluate, and answers that vary in style.\n\nA sensible path: start with one strong model to learn the real traffic and set a quality bar with evaluations; then route the clearly easy, high-volume tasks to a small model, and check on the same evaluation set that quality holds.`,
        },
    },
    'sd9-t5': {
        explain: {
            answer: `A feature store exists to stop the same feature being computed two different ways.\n\nWithout one, a data scientist writes "orders in the last 30 days" in a SQL notebook to train a model, and an engineer later rewrites it in the serving code. The two versions differ slightly (time zones, cancelled orders, a 30-day window that includes today or not), so the model sees different numbers in production than it was trained on: training–serving skew. Accuracy quietly drops, and nobody can see why.\n\nA feature store keeps one definition per feature, and serves it two ways from the same pipeline:\n• an offline store with the full history, so training can ask "what was this value at the moment of each past example?" (point-in-time correct, with no future data leaking in);\n• an online store with the latest value for each user or item, readable in milliseconds when the model serves a request.\n\nOn top of that: features can be shared between teams instead of rebuilt, backfilled when a definition changes, and monitored for drift.`,
        },
        draw: {
            answer: `The pipeline is a loop: monitoring decides when to retrain, and every arrow from training onwards is gated (validation, comparison with the current model, canary), so a bad model or bad data never goes straight to users.`,
            code: py`
                Raw data (events, databases, logs)
                  │
                  ▼
                Data validation ── schema, ranges, missing values ── fail? stop + alert
                  │
                  ▼
                Feature pipelines ──► Feature store
                                       ├─ offline (history, point-in-time joins) ──┐
                                       └─ online (latest values, ms reads)         │
                  ┌────────────────────────────────────────────────────────────────┘
                  ▼
                Training (data snapshot + code commit + settings recorded)
                  │
                  ▼
                Evaluation ── better than the current model? no → stop
                  │
                  ▼
                Model registry (version, metrics, lineage)
                  │
                  ▼
                Deployment: shadow → canary → full   (instant rollback)
                  │   serving reads the online store
                  ▼
                Monitoring: data drift, prediction drift, business metrics
                  │
                  └──► schedule or drift trigger ──► retrain (back to the top)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `For each label (did this user churn, as of this date?), take the most recent feature value recorded at or before the label's time, never after. The correlated subquery finds that latest earlier timestamp per label, and the join fetches the value.\n\nThe important row is user 1's label on 1 April. It gets the feature from 10 March (2 orders), not the one from 5 April (0 orders). The 5 April value was measured after the user had already churned; a naive "latest value" join would hand the model a feature that gives the answer away, and it would look brilliant in training and fail in production.`,
            code: py`
                import sqlite3

                db = sqlite3.connect(":memory:")
                db.executescript("""
                CREATE TABLE labels   (user_id INT, label_time TEXT, churned INT);
                CREATE TABLE features (user_id INT, feature_time TEXT, orders_last_30d INT);
                INSERT INTO labels VALUES (1, '2024-03-01', 0), (1, '2024-04-01', 1), (2, '2024-03-15', 0);
                INSERT INTO features VALUES
                  (1, '2024-02-20', 5), (1, '2024-03-10', 2), (1, '2024-04-05', 0),
                  (2, '2024-03-01', 7), (2, '2024-03-20', 9);
                """)

                point_in_time = """
                SELECT l.user_id, l.label_time, l.churned, f.feature_time, f.orders_last_30d
                FROM labels l
                LEFT JOIN features f
                  ON f.user_id = l.user_id
                 AND f.feature_time = (
                       SELECT MAX(f2.feature_time)
                       FROM features f2
                       WHERE f2.user_id = l.user_id
                         AND f2.feature_time <= l.label_time      -- only what was known then
                     )
                ORDER BY l.user_id, l.label_time
                """
                for row in db.execute(point_in_time):
                    print(row)
                # (1, '2024-03-01', 0, '2024-02-20', 5)
                # (1, '2024-04-01', 1, '2024-03-10', 2)   not the 2024-04-05 value from the future
                # (2, '2024-03-15', 0, '2024-03-01', 7)   not the 2024-03-20 one
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Fixed schedule (say every Sunday):\n• Simple and predictable: the compute cost, the release rhythm and the review process are all planned.\n• But it retrains when nothing has changed (wasted compute, and needless risk from every release), and too late when something changes fast: a new fraud tactic on Monday is unaddressed until Sunday.\n\nOnly when drift is detected:\n• Retrains when the world has actually changed, and quickly.\n• But drift detection is noisy: input distributions shift all the time without hurting accuracy (seasonality, a marketing campaign), causing false alarms, while real accuracy drops can hide in a stable-looking distribution. True accuracy needs labels, which often arrive weeks later.\n• Danger: a broken upstream pipeline looks exactly like drift. Retraining automatically on corrupted data ships a broken model, so data validation must run before any retrain.\n• Harder to plan compute and reviews for.\n\nThe common answer is both: a regular schedule as the baseline, plus drift and performance triggers for early retraining, and always the same gates (data validation, comparison with the current model, canary release) before anything goes live.`,
        },
    },
};
