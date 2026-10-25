import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 8 · High-level design questions. One good answer for each practice exercise.

export const sdPhase8Answers: Record<string, SDTopicAnswers> = {
    'sd8-t1': {
        explain: {
            answer: `Write path (creating a short link):\n1. POST /urls with the long URL reaches a load balancer, then one of many stateless API servers.\n2. The server checks the URL (valid, not on a blocklist) and, if given, that the custom alias is free.\n3. It takes the next number from its reserved block of IDs (each server gets a block, say 1,000 at a time, from a small allocator, so servers never compete for one counter) and encodes it in Base62: a short code like "3ORDSU".\n4. It stores code → long URL (plus owner, created and expiry times) in the database, and returns the short URL.\n\nRead path (the redirect), about 100 times more frequent:\n1. GET /3ORDSU reaches the load balancer, then an API server.\n2. The server looks the code up in Redis; most popular codes are there (a hit in well under a millisecond).\n3. On a miss it reads the database by primary key, then fills the cache.\n4. It replies 302 with the long URL in the Location header (or 404, or 410 if expired).\n5. It puts a click event on a queue for analytics, without waiting for it.\n\nEverything is read by one key, the code, so the database scales easily (replicas, or sharding by code), and the cache does most of the work.`,
        },
        draw: {
            answer: `Creating a link touches the ID allocator only once per block of IDs, not per link. Redirects are served from the cache whenever possible, and click analytics happen off the request path, through the queue.`,
            code: py`
                Client
                  │
                  ▼
                Load balancer
                  │
                  ├──► API server ──┐  (stateless, many of them)
                  └──► API server ──┤
                                    │
                  create:           │ 1. take an ID from my block
                                    ├──► ID-range allocator
                                    │    ("give me IDs 5,000–5,999")
                                    │ 2. save code → long URL
                                    ├──► Database (key: code)
                                    │
                  redirect:         │ 1. look up the code
                                    ├──► Redis cache ── miss ──► Database
                                    │ 2. reply 302 to the long URL
                                    │ 3. log the click (async)
                                    └──► Queue ──► Analytics workers
                                                    └──► Analytics store
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Base62 uses the digits 0–9, then a–z, then A–Z: 62 symbols. Encoding repeatedly divides by 62 and keeps the remainders (like writing a number in base 10, but with 62 digits); decoding multiplies back.\n\n1 is "1", 61 is "Z" (the last symbol), 62 is "10" (one 62 and nothing more), and 3,500,000,000 is "3ORDSU": 6 characters. Seven characters cover every number below 62⁷, about 3.5 trillion.`,
            code: py`
                import string

                ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase   # 62 symbols


                def encode(n):
                    if n == 0:
                        return ALPHABET[0]
                    digits = []
                    while n:
                        n, remainder = divmod(n, 62)
                        digits.append(ALPHABET[remainder])
                    return "".join(reversed(digits))


                def decode(code):
                    n = 0
                    for ch in code:
                        n = n * 62 + ALPHABET.index(ch)
                    return n


                for n in (1, 61, 62, 3_500_000_000):
                    print(n, encode(n), decode(encode(n)) == n)
                # 1 1 True
                # 61 Z True
                # 62 10 True
                # 3500000000 3ORDSU True
                print(62 ** 7)                                   # 3521614606208: codes of up to 7 characters
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Counter + Base62:\n• Collisions: none. Every number is used once, so every code is unique by construction; there is no need to check the database before saving.\n• Duplicates: the same long URL shortened twice gets two codes. Fine (often wanted: different owners, different stats), or look it up first if you want one code per URL.\n• Guessability: bad by default. Codes are sequential, so anyone can count through them and scrape every link, and they reveal how many links you have. Fix: scramble the number before encoding (a reversible shuffle such as multiplying by a large prime modulo 62⁷), or add a few random characters.\n• Cost: needs coordination, though handing out ID ranges keeps that rare.\n\nHashing the URL (for example MD5, keep the first 7 Base62 characters):\n• Collisions: yes. With 3.5 trillion possible codes, collisions become likely after only about √3.5 trillion ≈ 1.9 million links (the birthday paradox). Every write must check whether the code is taken and, if so, retry with a salt.\n• Duplicates: the same URL always gives the same code, so de-duplication comes free.\n• Guessability: good: codes look random.\n• Cost: no coordination, but an extra read on every write.\n\nThe usual choice is counter-based with ID ranges, plus a scramble so codes aren't sequential.`,
        },
    },
    'sd8-t2': {
        explain: {
            answer: `The limiter sits in the API gateway, as middleware that runs before the request is passed to any service, so blocked requests never cost the services anything.\n\nOn each request:\n1. Identify who is asking: the API key, the user ID from the token, or the IP address if there is no login.\n2. Find the rule for this endpoint and client tier (for example, "search: 100 per minute"). Rules come from a config store and are cached in the gateway's memory.\n3. Check and update the client's counter in Redis in one atomic step (a Lua script, or INCR for a fixed window), so two gateways can't both think there is room.\n4. Allowed: forward the request, adding headers such as X-RateLimit-Remaining.\n5. Not allowed: reply 429 Too Many Requests with Retry-After, and don't call the service.\n\nThe whole check should add a millisecond or two. If Redis is down, fall back to a local in-memory limit per gateway (fail open, but not unlimited).`,
        },
        draw: {
            answer: `The limit is checked once, at the edge, and shared through Redis, so it holds whichever gateway a request lands on. Rules are read from the config store occasionally, never on every request.`,
            code: py`
                Clients
                  │
                  ▼
                Load balancer
                  ├──────────────┬──────────────┐
                  ▼              ▼              ▼
                Gateway 1      Gateway 2      Gateway 3
                [limiter]      [limiter]      [limiter]
                  │  ▲             │              │
                  │  │ atomic check and update    │
                  └──┴──────► Redis cluster ◄─────┘
                     │        (one counter per client per rule)
                     │
                     ├── over the limit → 429 + Retry-After
                     └── allowed ──► Services

                Config store ── rules, cached in each gateway
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The sliding-window log keeps, per client, the times of the requests it allowed in the last window. Each new request first forgets times older than the window, then is allowed only if fewer than the limit remain. Unlike a fixed window, there is no edge where a client can fire twice the limit.\n\nWith a limit of 3 per 60 seconds: requests at 0, 10 and 20 s pass; 30 and 59 s are refused; at 60.5 s the request from 0 s has dropped out, so one more passes; at 61 s the window is full again; at 75 s the 10 s request has dropped out.\n\nIn Redis, keep one sorted set per client, with timestamps as scores, and run these steps atomically in a Lua script:\n• ZREMRANGEBYSCORE rl:{client} 0 (now − 60000): drop entries older than the window.\n• ZCARD rl:{client}: count what is left.\n• If the count is below the limit: ZADD rl:{client} now {unique request id}, then PEXPIRE rl:{client} 60000, and allow; otherwise refuse.\n\nThe cost: memory for every allowed request, per client. At high limits, a sliding-window counter (two fixed-window counts, weighted) is the cheaper approximation.`,
            code: py`
                from collections import deque


                class SlidingWindowLog:
                    def __init__(self, limit, window_s, clock):
                        self.limit, self.window, self.clock = limit, window_s, clock
                        self.logs = {}                              # client -> times of allowed requests

                    def allow(self, client):
                        now = self.clock()
                        log = self.logs.setdefault(client, deque())
                        while log and log[0] <= now - self.window:  # forget requests outside the window
                            log.popleft()
                        if len(log) < self.limit:
                            log.append(now)
                            return True
                        return False


                now = [0.0]                                         # a fake clock, in seconds
                limiter = SlidingWindowLog(limit=3, window_s=60, clock=lambda: now[0])
                results = []
                for t in [0, 10, 20, 30, 59, 60.5, 61, 75]:
                    now[0] = t
                    results.append((t, limiter.allow("key-1")))
                print(results)
                # [(0, True), (10, True), (20, True), (30, False), (59, False), (60.5, True), (61, False), (75, True)]
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Token bucket.\n\nIt is built for exactly this: the bucket's size is the burst you allow, and the refill rate is the steady limit. A client that has been quiet can fire, say, 20 requests at once; a client that keeps hammering is held to 10 a second. Per client it stores just two numbers (tokens and last refill time), so it is cheap in memory and in Redis.\n\nSliding window (log or counter) is about fairness over a moving window: never more than N in any 60 seconds. It allows a burst of up to N at once too, but then the client must wait for the whole window to slide before it gets capacity back, which feels stricter than a refill. The log version is exact but stores a timestamp per request; the counter version is cheap but approximate.\n\nSo: token bucket when bursts are welcome and you care about the long-run rate (most public APIs); sliding window when the hard rule is "never more than N per window" (for example, a contract with a partner, or login attempts).`,
        },
    },
    'sd8-t3': {
        explain: {
            answer: `1. The order service marks order 105 as shipped and publishes an "OrderShipped" event (through its outbox, so the event can't be lost). The notification service consumes it, or the order service calls POST /notifications, with an idempotency key such as "order-105-shipped".\n2. The notification service checks the key against its log: if this notification was already handled, it stops (no duplicates).\n3. It checks the user's preferences: is push allowed for order updates? Is the user opted out of everything? It applies a per-user rate limit.\n4. It looks up the user's active devices and their push tokens.\n5. It fills in the template ("Your order 105 has shipped") in the user's language.\n6. It puts one message per device on the push queue for normal priority, and records "queued" in the log.\n7. A push worker takes the message and calls Apple's (APNs) or Google's (FCM) push service with the device token.\n8. The provider delivers it to the phone. The worker records "sent". If the provider says the token is no longer valid, the device is marked inactive. A temporary failure is retried with backoff; after several failures, it goes to a dead-letter queue.`,
        },
        draw: {
            answer: `Separate queues per channel and priority mean a marketing blast can't delay a passcode, and each worker pool can be scaled and rate-limited to match its provider. Every step updates the delivery log.`,
            code: py`
                Services ── events / POST /notifications ──► Notification service
                (orders, auth, marketing)                     1. de-duplicate (key)
                                                              2. preferences, opt-outs
                                                              3. per-user rate limit
                                                              4. fill in the template
                                                                 │
                       ┌──────────────┬──────────────┬───────────┼───────────┐
                       ▼              ▼              ▼           ▼           ▼
                  push: high     push: low     SMS: high    email: high  email: low
                  (passcodes)   (marketing)   (passcodes)   (receipts)  (newsletters)
                       │              │              │           │           │
                       ▼              ▼              ▼           ▼           ▼
                  Push workers                  SMS workers   Email workers
                       │                             │             │
                       ▼                             ▼             ▼
                  APNs / FCM                SMS gateway (+ backup)  Email provider

                Failures: retry with backoff ──► dead-letter queue
                Every status ──► delivery log
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• user_preferences is keyed by (user, channel, category), so a user can turn off marketing emails but keep order texts, and security messages can be treated as always on.\n• devices has its own id, because one user has several phones; the push token is unique, and tokens the provider rejects are marked inactive rather than deleted.\n• notification_log uses the notification's id as its primary key, which doubles as the idempotency key: retrying the same notification can't create a second row. It is indexed by user and time for "what did we send this person?".\n\nAt millions of rows a day, the log would be partitioned by day (and old partitions dropped after, say, 90 days), or kept in a wide-column store.`,
            code: py`
                -- PostgreSQL
                CREATE TABLE user_preferences (
                  user_id     BIGINT  NOT NULL,
                  channel     TEXT    NOT NULL CHECK (channel IN ('push', 'sms', 'email')),
                  category    TEXT    NOT NULL,          -- 'security', 'orders', 'marketing'
                  opted_in    BOOLEAN NOT NULL DEFAULT TRUE,
                  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                  PRIMARY KEY (user_id, channel, category)
                );

                CREATE TABLE devices (
                  device_id   UUID PRIMARY KEY,
                  user_id     BIGINT NOT NULL,
                  platform    TEXT   NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
                  push_token  TEXT   NOT NULL UNIQUE,
                  active      BOOLEAN NOT NULL DEFAULT TRUE,     -- false once the provider rejects the token
                  last_seen   TIMESTAMPTZ NOT NULL
                );
                CREATE INDEX devices_by_user ON devices (user_id) WHERE active;

                CREATE TABLE notification_log (
                  notification_id  TEXT PRIMARY KEY,             -- also the idempotency key
                  user_id          BIGINT NOT NULL,
                  channel          TEXT   NOT NULL,
                  template_id      TEXT   NOT NULL,
                  priority         TEXT   NOT NULL,              -- 'high' or 'low'
                  status           TEXT   NOT NULL,              -- queued, sent, delivered, failed, skipped
                  provider_msg_id  TEXT,
                  attempts         INT    NOT NULL DEFAULT 0,
                  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
                  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                CREATE INDEX log_by_user_time ON notification_log (user_id, created_at DESC);
            `,
            codeLanguage: 'sql',
        },
        tradeoffs: {
            answer: `One queue for everything:\n• Simple: one thing to run, monitor and scale.\n• But head-of-line blocking: a 10-million-email newsletter sits in front of a one-time passcode, and the passcode arrives an hour late, so the user can't log in.\n• One slow provider (an SMS gateway limiting you to 100 a second) backs up push and email too.\n• You can't scale or rate-limit one channel without the others.\n\nSeparate queues per channel and priority:\n• Isolation: passcodes have their own fast lane; a struggling SMS provider only slows SMS.\n• Each worker pool is sized and rate-limited to match its provider's limits.\n• Retries and dead-letter queues per channel, so failures are easier to see and fix.\n• The cost: more queues to set up and monitor, routing logic, and a rule so low priority isn't starved forever (for example, workers take 9 high-priority messages for every 1 low).\n\nFor notifications, separate queues are clearly worth it: different channels and priorities really do have different speeds, limits and urgency.`,
        },
    },
    'sd8-t4': {
        explain: {
            answer: `Asha (on gateway 1) sends Ben (on gateway 7) a message:\n1. Asha's app sends it over her WebSocket, with a message id it created itself (client_msg_id), so a resend can't create a duplicate.\n2. Gateway 1 passes it to the chat service, which gives it a time-ordered id and the next sequence number for the conversation, and stores it in the message store. Only then does Asha get an acknowledgement ("sent", one tick).\n3. The chat service looks Ben up in the routing store (Redis: user → gateway). He is on gateway 7, so it forwards the message there, and gateway 7 pushes it down Ben's WebSocket.\n4. Ben's app acknowledges it, and "delivered" (two ticks) travels back the same way to Asha; "read" follows when he opens the chat.\n\nIf Ben is offline: Redis has no gateway for him (his entry expired when his heartbeats stopped). The message is already safely stored, so nothing is lost. The chat service asks the push service to send a notification. When Ben reconnects, his app sends the last sequence number it has for each conversation and fetches everything after it, in order; then the delivered receipts go back to Asha.`,
        },
        draw: {
            answer: `Gateways hold the long-lived connections and nothing else; the chat service decides where each message goes, using the routing table in Redis. A message is stored before it is acknowledged, so a crash anywhere after that point loses nothing.`,
            code: py`
                Asha ══ WebSocket ══ Gateway 1        Gateway 7 ══ WebSocket ══ Ben
                                        │                 ▲
                                        │ send            │ 4. push to Ben
                                        ▼                 │
                                     Chat service ────────┘
                                      │  │  │  3. where is Ben?
                                      │  │  └──────► Redis
                                      │  │            · user → gateway
                                      │  │            · presence (heartbeat, TTL)
                                      │  │ 2. store first
                                      │  └─────────► Message store
                                      │              (partition: conversation)
                                      │ Ben offline?
                                      └────────────► Push service ──► APNs / FCM
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Partition key: the conversation (plus a time bucket); sort key: the message id, newest first.\n\nThe main query is "show the latest 50 messages in this chat", then "older ones as I scroll up". With conversation_id in the partition key, all of a chat's messages live together on the same nodes, so that query reads one partition, with no scatter across the cluster. With the time-ordered message id as the clustering (sort) key, they are already stored in order, so reading the newest 50, or the 50 before a cursor, is a single sequential read.\n\nWhy add a bucket (such as the month)? A very busy group chat that runs for years would otherwise become one enormous partition. Splitting it by month keeps partitions bounded; reading older history moves to the previous bucket.\n\nMessage ids are Snowflake-style: unique and time-ordered, so they double as the sort key and the pagination cursor.`,
            code: py`
                -- Cassandra (CQL)
                CREATE TABLE messages (
                  conversation_id  UUID,
                  bucket           INT,          -- e.g. year * 100 + month; bounds the partition size
                  message_id       BIGINT,       -- Snowflake-style: unique and time-ordered
                  sender_id        BIGINT,
                  body             BLOB,         -- end-to-end encrypted
                  PRIMARY KEY ((conversation_id, bucket), message_id)
                ) WITH CLUSTERING ORDER BY (message_id DESC);

                -- The main query: the newest page, then older pages using a cursor
                SELECT message_id, sender_id, body
                FROM messages
                WHERE conversation_id = ? AND bucket = ? AND message_id < ?
                LIMIT 50;
            `,
            codeLanguage: 'sql',
        },
        tradeoffs: {
            answer: `Fan-out on write: when a message is sent to a group, put a copy (or a pointer) into every member's inbox, and push it to each online member straight away.\n• Reads are trivial: each member reads their own inbox, and unread counts are easy.\n• Writes multiply by the group size: one message to a 256-member group is 256 writes, and a 100,000-member channel is 100,000 writes per message.\n\nFan-out on read: store the message once, in the group's timeline; each member fetches from the timeline using their own "last read" cursor.\n• Writes are a single row, whatever the group size.\n• Reads do more work, and every member's unread count and receipts need separate tracking.\n\nThe usual answer depends on group size. Small groups (WhatsApp caps them at around a thousand members) use fan-out on write: the multiplication is bounded and the experience is instant. Huge broadcast channels use fan-out on read, with online members notified that "there is something new" rather than sent a copy each.`,
        },
    },
    'sd8-t5': {
        explain: {
            answer: `• Push (fan-out on write): when someone posts, add the post's id to the feed list of every follower straight away. Reading a feed is then just reading one ready-made list: very fast. The cost is at write time: one post makes as many writes as the author has followers.\n• Pull (fan-out on read): store each post once. When someone opens their feed, fetch the recent posts of everyone they follow and merge them. Posting is cheap, but every feed load does a lot of work, and feeds are read far more often than posts are written.\n• Hybrid: push for ordinary users, who have hundreds of followers; pull for the few accounts with millions. At read time, the pre-built feed list is merged with the recent posts of the celebrities you follow.\n\nThe celebrity problem: with pure push, one post from an account with 50 million followers means 50 million feed writes. It swamps the fan-out workers and delays everyone else's posts, and most of those followers won't even open the app today. The hybrid avoids it: celebrities' posts are fetched when someone actually reads.`,
        },
        draw: {
            answer: `On write, only ordinary authors' posts are fanned out to followers' feed lists; a celebrity's post is just stored. On read, the ready-made feed list is merged with the latest posts of the few celebrities the reader follows, then hydrated (ids turned into full posts) and optionally ranked.`,
            code: py`
                WRITE
                Author ── POST /posts ──► Post service ──► Posts DB + post cache
                                             │
                                             ├─ ordinary author ──► Fan-out queue
                                             │                        │ workers
                                             │                        ▼
                                             │        each follower's feed list (Redis)
                                             │        user → [latest ~500 post ids]
                                             │
                                             └─ celebrity ──► only their own post list

                READ
                Reader ── GET /feed ──► Feed service
                                          1. read my feed list (Redis)
                                          2. + latest posts of celebrities I follow
                                          3. merge by time (or rank)
                                          4. hydrate: post cache, media via CDN
                                          ──► page of posts + cursor
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `With pure push, one post from an account with 50 million followers is 50 million feed-list writes; at 5 posts a day, 250 million writes a day from one account.\n\nTo put that in proportion: all ordinary posting (7,000 posts a second × about 200 followers each) is about 1.4 million feed writes a second. One celebrity post is 50 million ÷ 1.4 million ≈ 36 seconds of the whole system's normal fan-out capacity, arriving all at once, and delaying everyone else's posts behind it.\n\nWith the hybrid: the post is written once (to the celebrity's own post list): 1 write instead of 50 million. The cost moves to reads: each follower's feed load does one extra lookup, "latest posts of the celebrities I follow", which is a few hot keys that sit in a replicated cache.\n\n(Even with push, skipping inactive followers helps: if only 30% open the app today, that is 15 million writes, not 50; the others' feeds are built when they log in.)`,
            code: py`
                followers = 50_000_000
                posts_per_day = 5
                normal_fanout_per_s = 7_000 * 200                 # every ordinary post, ~200 followers each

                print(followers * posts_per_day)                  # 250000000 feed writes a day, pure push
                print(round(followers / normal_fanout_per_s, 1))  # 35.7 seconds of normal fan-out, per post
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Chronological feed:\n• The feed list is just post ids in time order, so fan-out stores them sorted and reading is a range read.\n• Caching is simple, and pagination is a simple cursor ("posts older than this one").\n• Behaviour is predictable and easy to explain.\n\nRanked feed: the architecture grows several new parts:\n• Candidate generation: gather a few hundred possible posts (the fan-out list, plus celebrity posts, plus recommended posts from accounts you don't follow).\n• Features: a feature store with signals per post and per user (likes so far, how often you interact with the author, the post's age), fetched at read time.\n• A ranking service that scores candidates with a model, inside the latency budget (tens of milliseconds).\n• Re-ranking for variety and rules (not five posts in a row from one author; remove what you have already seen).\n• Logging of what was shown and what was clicked, to train the next model, plus experiment infrastructure for A/B tests.\n• Pagination gets harder: the ranked list changes between requests, so you store the ranked result for the session and page through that.\n\nIn short: chronological is a data-structure problem; ranked is that, plus a machine-learning system on every read.`,
        },
    },
    'sd8-t6': {
        explain: {
            answer: `Upload: the app asks the API for a pre-signed upload URL and sends the video straight to object storage, in parts, so a dropped connection resumes instead of restarting. The API records the video as "processing".\n\nProcessing: the upload triggers an event on a queue. Transcoding workers split the video into short segments (a few seconds each) and encode every segment at several qualities (say 240p up to 4K, each at its own bitrate). This is a graph of tasks: split, encode in parallel, package. Each task is retried on its own if it fails. Thumbnails are made too.\n\nOutput: the encoded segments go into object storage, along with a manifest file (HLS or DASH) that lists, for each quality, the segment files in order. The video's status becomes "ready", with the manifest's URL.\n\nPlayback: the player fetches the manifest and the segments from a CDN close to the viewer. It measures how fast segments arrive and picks the quality for the next one: if the connection slows, it drops to a lower bitrate without stopping (adaptive bitrate streaming). Views and likes are counted asynchronously; video details come from a database behind a cache.`,
        },
        draw: {
            answer: `Uploads and playback both bypass the API servers for the heavy bytes: uploads go straight to object storage, and playback comes from the CDN. The transcoding pipeline sits between the two, driven by a queue.`,
            code: py`
                UPLOAD
                Creator app ── 1. ask for an upload URL ──► API ──► Videos DB (status: processing)
                     │ 2. upload in parts (pre-signed URL)
                     ▼
                Object storage: raw video
                     │ 3. "video uploaded" event
                     ▼
                Queue ──► Transcoding pipeline
                           split into segments
                             ├─► encode 240p ┐
                             ├─► encode 720p ├─ in parallel, retried per task
                             └─► encode 4K   ┘
                           package: HLS/DASH manifest + segments, thumbnails
                     │
                     ▼
                Object storage: encoded segments ──► Videos DB (status: ready)

                PLAYBACK
                Viewer's player ── manifest + segments ──► CDN edge
                     ▲                                       │ miss
                     │ picks the quality for                 ▼
                     │ each segment by bandwidth      Object storage (origin)
                     └─────────────────────────────────────────┘
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Storage = bitrate × duration. 10 minutes is 600 seconds; bitrates are in megabits a second, so divide by 8 for megabytes.\n\n• 0.5 Mbps: 37.5 MB\n• 1 Mbps: 75 MB\n• 3 Mbps: 225 MB\n• 6 Mbps: 450 MB\n\nTotal: 787.5 MB, about 0.8 GB for one 10-minute video, and about 2.4 GB with 3 copies for durability. Add the original upload (often kept, at a high bitrate) and thumbnails. Notice that the top quality alone is more than half the total, which is why rarely watched videos are sometimes kept only at lower qualities, or re-encoded on demand.`,
            code: py`
                seconds = 10 * 60
                bitrates_mbps = [0.5, 1, 3, 6]
                megabytes = [rate * seconds / 8 for rate in bitrates_mbps]   # megabits → megabytes
                print(megabytes)                          # [37.5, 75.0, 225.0, 450.0]
                print(sum(megabytes), sum(megabytes) * 3) # 787.5 2362.5: MB once, and with 3 copies
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Use a commercial CDN (Akamai, Cloudflare, Amazon CloudFront…), and build your own only at Netflix's scale.\n\nCommercial CDN:\n• Global reach on day one, paid per gigabyte, with nothing to build or run.\n• Proven security and DDoS protection.\n• Downsides: at enormous volume, per-gigabyte prices add up to a very large bill, and you have less control over caching, placement and hardware. Many large companies use several CDNs at once, for price and resilience.\n\nYour own CDN (Netflix's Open Connect puts its own servers inside internet providers' networks):\n• At the scale where you are a large share of all internet traffic, owning the boxes is far cheaper per gigabyte.\n• Full control: tomorrow's popular shows are copied to the boxes overnight, when networks are quiet; tuned hardware and software.\n• Downsides: huge upfront cost, agreements with thousands of internet providers, teams to run hardware around the world, and years to build.\n\nIt only pays off when traffic is huge, predictable, and mostly a known catalogue that can be placed in advance, which describes Netflix and very few others.`,
        },
    },
    'sd8-t7': {
        explain: {
            answer: `A geohash turns a latitude and longitude into a short string by repeatedly halving the map: is the point in the west or east half? Then the north or south half of that? Each answer is one bit, and the bits are written in base 32. Each extra character makes the cell smaller: 5 characters is roughly a 5 km square, 6 characters roughly 1.2 km by 0.6 km.\n\nThe useful property: points close together usually share a long prefix, so "drivers near here" becomes "drivers whose geohash starts with the same 6 characters as the rider's".\n\nFinding nearby drivers:\n1. Every few seconds, each driver's location update moves them into the right cell in an in-memory index (Redis GEO, or cell → set of driver ids).\n2. For a ride request, compute the rider's cell at a suitable precision.\n3. Look in that cell and its 8 neighbours. Neighbours matter: a rider near the edge of a cell may be closest to a driver just across the line, whose geohash looks quite different.\n4. Work out the real distance (better, the estimated arrival time by road) for those candidates, rank them, and offer the trip to the best one first.\n5. If too few drivers are found, widen the search: a shorter prefix, or more rings of neighbours.`,
        },
        draw: {
            answer: `Two independent flows meet in the geo index: drivers write their position into it every few seconds; the matching service reads from it when a ride is requested. Only the latest position is kept in memory; the history is streamed off to cheap storage.`,
            code: py`
                Driver app ── location every 4 s ──► Location service
                                                       │ keep only the latest
                                                       ▼
                                                  Geo index (in memory)
                                                  cell → drivers (Redis GEO)
                                                       ▲      │ history
                                                       │      └──► stream ──► analytics store
                Rider app ── request a ride ──► Matching service
                                                  1. rider's cell + 8 neighbours
                                                  2. rank by arrival time
                                                  3. offer to one driver, with a timeout
                                                  4. lock the driver (atomic status update)
                                                       │
                                                       ▼
                                                  Trip service ── trip state ──► Trips DB
                                                       ├──► Pricing (surge)
                                                       └──► Payments
                Rider app ◄══ WebSocket: live trip updates ══ Trip service
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `10,000 random drivers are spread over a box around London. Each goes into a grid cell of 0.01° × 0.01° (about 1.1 km by 0.7 km here): a simple stand-in for a geohash, using the same idea of a key per cell.\n\nThat makes 800 cells, about 12 drivers each. For a rider at Trafalgar Square, the search reads only the rider's cell and its 8 neighbours: 108 drivers instead of 10,000. Real distances (the haversine formula) are worked out only for those, and the nearest three are 0.15, 0.17 and 0.23 km away.`,
            code: py`
                import math
                import random

                random.seed(42)
                drivers = [(random.uniform(51.40, 51.60), random.uniform(-0.30, 0.10)) for _ in range(10_000)]

                CELL = 0.01                                          # degrees: about 1.1 km × 0.7 km in London


                def cell(lat, lon):
                    return (math.floor(lat / CELL), math.floor(lon / CELL))


                grid = {}
                for i, (lat, lon) in enumerate(drivers):
                    grid.setdefault(cell(lat, lon), []).append(i)


                def km(a, b):                                        # great-circle distance
                    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
                    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
                    return 6371 * 2 * math.asin(math.sqrt(h))


                rider = (51.5080, -0.1281)                           # Trafalgar Square
                row, col = cell(*rider)
                nearby = [i for dr in (-1, 0, 1) for dc in (-1, 0, 1) for i in grid.get((row + dr, col + dc), [])]
                nearest = sorted(nearby, key=lambda i: km(rider, drivers[i]))[:3]

                print(len(grid), len(drivers) / len(grid))           # 800 12.5: cells, drivers per cell
                print(len(nearby))                                   # 108: candidates in the 9 cells
                print([round(km(rider, drivers[i]), 2) for i in nearest])   # [0.15, 0.17, 0.23] km
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Geohash (fixed-size cells):\n• Simple and stateless: a driver's cell is a pure function of their position, so a location update is just moving one key; easy to shard by prefix across machines.\n• Copes with 250,000 updates a second, because nothing needs rebalancing.\n• Uneven density hurts: a city-centre cell may hold thousands of drivers (the search returns far too many), while a suburban cell holds none (you must widen the search ring by ring). You can compensate by choosing the search precision by area, or with a hexagonal grid like Uber's H3.\n\nQuadtree (cells split where it is busy):\n• Adaptive: a cell splits into four when it holds more than, say, 100 drivers, so dense areas get small cells and quiet areas big ones, and every search returns a sensible number of candidates.\n• But drivers move constantly, so the tree is always splitting and merging; it is harder to update concurrently, and harder to spread across machines.\n\nFor moving drivers with very uneven density, the common answer is geohash (or H3) with an adaptive search radius: you keep the cheap updates and handle density at query time. A quadtree shines for points that rarely move, such as restaurants or shops.`,
        },
    },
    'sd8-t8': {
        explain: {
            answer: `The checkout sends POST /payments for order 77, £50, with an idempotency key the client generated once for this purchase: "pay-order-77".\n\n1. The payment service inserts a PENDING payment row with that key. The key column is UNIQUE, so this can only succeed once.\n2. It calls the payment provider, passing the same key along.\n3. The provider charges the card, but the response is lost: a timeout. The service doesn't know whether the card was charged.\n4. The client (or the service itself) retries, with the same key.\n• At our end: the insert hits the unique constraint, so we find the existing payment instead of creating a second one, and return its status, or carry on from where it got to.\n• At the provider: they see a key they have already processed, and return the original result instead of charging again.\n5. If the result is still unknown, ask the provider "what happened to pay-order-77?" before anything else.\n\nWithout the key, the retry looks like a new purchase, and the customer is charged £100. With it, any number of retries charge exactly once.`,
        },
        draw: {
            answer: `Writes to the payment, the ledger and the outbox happen in one database transaction, so the order service is told exactly when, and only when, the money has really moved. Reconciliation is the safety net that compares our ledger with the provider's own records every day.`,
            code: py`
                Client ── POST /payments + Idempotency-Key ──► Payment service
                                                                 │ 1. insert PENDING (key UNIQUE)
                                                                 ▼
                                                      ┌─── Payments DB ───────────────┐
                                                      │ payments (idempotency_key UQ) │
                                                      │ ledger_entries (append-only)  │
                                                      │ outbox                        │
                                                      └───────────────────────────────┘
                                                                 │ 2. charge, same key
                                                                 ▼
                                                      Payment provider (PSP) ──► card networks
                                                                 │ 3. response or webhook
                                                                 ▼
                                        one transaction: status + ledger rows + outbox event
                                                                 │
                                        outbox relay ──► "PaymentSucceeded" ──► Order service

                Nightly: Reconciliation job ── compares ──► our ledger
                                                      vs ──► provider's settlement file
                         mismatches ──► alerts, manual review
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Double entry: every movement is written twice, a debit on one account and an equal credit on another, so each transaction balances (total debits = total credits) and the books as a whole always sum to zero. Rows are only ever added: the refund doesn't edit the purchase; it is a new transaction pointing at it.\n\nHere the money the provider will pay us sits in a "provider receivable" account, and revenue is the shop's sales account. After both transactions, provider receivable has a £30 debit balance (50 − 20) and sales revenue a £30 credit balance: the customer has paid £30 net. Amounts are in pence, with the currency on every row.`,
            code: py`
                entry  txn        account               debit   credit  currency  note
                ─────  ─────────  ────────────────────  ──────  ──────  ────────  ─────────────────────
                1      pay_P1     provider_receivable     5000             GBP    £50 purchase, order 77
                2      pay_P1     sales_revenue                   5000     GBP
                3      refund_R1  sales_revenue           2000             GBP    partial refund of P1
                4      refund_R1  provider_receivable             2000     GBP

                pay_P1:    debits 5000 = credits 5000  ✓
                refund_R1: debits 2000 = credits 2000  ✓
                Balances:  provider_receivable  5000 − 2000 = 3000 (debit)
                           sales_revenue        5000 − 2000 = 3000 (credit)
            `,
            codeLanguage: 'text',
        },
        tradeoffs: {
            answer: `Because in payments, a wrong answer is far worse than a slow one.\n\n• Correctness is the product: a double charge or a vanished payment costs real money, customer trust, and sometimes regulatory trouble. An eventually consistent store that accepts two conflicting writes during a network split and "merges later" would mean deciding after the fact which customer charge to reverse.\n• The guarantees needed are exactly what relational databases give: ACID transactions (the payment status, the ledger rows and the outbox event commit together), unique constraints (idempotency keys), foreign keys, and checks (amounts positive, every transaction balanced).\n• Auditing and reconciliation need precise, queryable history: joins and sums over the ledger.\n• The volume is modest (about 12 payments a second on average), which one relational primary with replicas handles easily, so you don't need a distributed store's scale.\n\nWhat is given up: during a failure, payments may be refused or delayed for a moment. That is recoverable: the client retries with the same idempotency key, or the order shows "payment processing". Lost or doubled money isn't recoverable so easily, so the trade is clear.`,
        },
    },
    'sd8-t9': {
        explain: {
            answer: `Serving path (every keystroke, must be fast):\n1. The user types "pyt". The app waits for a brief pause in typing (debouncing) and checks its own cache of recent prefixes.\n2. The request reaches a suggestion server (or an edge cache for very common prefixes).\n3. The server walks its in-memory trie: p → y → t. That node already stores its top 5 completions, worked out in advance, so it returns them directly, with no searching of the subtree.\n4. Results come back in milliseconds, and the app caches them for this prefix.\n\nData pipeline (in the background, every hour or day):\n1. Every search that is actually submitted is logged.\n2. A batch job counts queries over a window (say the last 7 days, with older days weighted less), and removes offensive or unsafe terms.\n3. It builds a new trie, with the top-k list at every node.\n4. The new trie is shipped to the servers and swapped in atomically; the old one keeps serving until the swap.\n\nKeeping them separate is the key idea: serving never computes anything, and the pipeline can be slow, thorough and replaced without touching serving. Trending terms can be added through a faster streaming path.`,
        },
        draw: {
            answer: `Assume search counts of to 300, tea 120, ten 90 and tent 60. Every node stores the top 2 words found anywhere below it, so answering a prefix is one walk down the tree and one read, with no searching of the subtree. Words can end at inner nodes ("ten" ends at the node that also leads on to "tent").`,
            code: py`
                Counts: to 300, tea 120, ten 90, tent 60

                (root)       top-2: to, tea
                 └─ t        top-2: to, tea
                    ├─ o     top-2: to            ← "to" ends here
                    └─ e     top-2: tea, ten
                       ├─ a  top-2: tea           ← "tea" ends here
                       └─ n  top-2: ten, tent     ← "ten" ends here
                          └─ t  top-2: tent       ← "tent" ends here

                Query "te": walk t → e, read: [tea, ten]
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Building: each word is inserted letter by letter, adding (count, word) to every node on its path; then each node keeps only its top 3, with ties broken alphabetically. A lookup walks the prefix and returns the stored list. 20,000 rare made-up words pad the trie so the timing is realistic.\n\nResults: "py" gives python, pytorch, python tutorial; "p" gives python, pandas, pytorch; an unknown prefix gives nothing. 10,000 lookups of random prefixes took about half a microsecond each on my machine (your number will differ): the work is proportional to the length of the prefix, not the number of words.`,
            code: py`
                import random
                import time


                class TrieNode:
                    def __init__(self):
                        self.children = {}
                        self.top = []                            # the best (count, word) pairs below this node


                def build(counts, k=3):
                    root = TrieNode()
                    for word, count in counts.items():
                        node = root
                        for ch in word:
                            node = node.children.setdefault(ch, TrieNode())
                            node.top.append((count, word))
                    stack = [root]
                    while stack:                                 # keep only the top k at each node
                        node = stack.pop()
                        node.top = sorted(node.top, key=lambda cw: (-cw[0], cw[1]))[:k]
                        stack.extend(node.children.values())
                    return root


                def suggest(root, prefix):
                    node = root
                    for ch in prefix:
                        node = node.children.get(ch)
                        if node is None:
                            return []
                    return [word for _, word in node.top]


                counts = {"python": 900, "pytorch": 700, "python tutorial": 500, "pycharm": 300, "pandas": 800,
                          "pip": 400, "pizza": 650, "tea": 120, "ten": 90, "tent": 60, "to": 300, "typescript": 650}
                random.seed(1)
                for _ in range(20_000):                          # pad with rare made-up terms
                    word = "".join(random.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(random.randint(3, 9)))
                    counts.setdefault(word, random.randint(1, 50))

                root = build(counts)
                print(suggest(root, "py"))       # ['python', 'pytorch', 'python tutorial']
                print(suggest(root, "p"))        # ['python', 'pandas', 'pytorch']
                print(suggest(root, "zzzz9"))    # []

                prefixes = [w[:random.randint(1, len(w))] for w in random.sample(sorted(counts), 10_000)]
                start = time.perf_counter()
                for prefix in prefixes:
                    suggest(root, prefix)
                print(f"{(time.perf_counter() - start) / len(prefixes) * 1e6:.1f} µs per lookup")   # about 0.5 on my machine
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `In-memory trie on each suggestion server:\n• Fastest: microseconds per lookup, with no network hop.\n• Every server holds a full copy, so memory per server is large, and updating means building a new trie and swapping it in on every server. If it grows too big, you must split it by prefix yourself.\n\nPrefix keys in Redis (key "sugg:pyt" → its top-k list):\n• Simple and shared: every server reads the same data, and updating one prefix is one write, so it is easy to refresh trending terms continuously.\n• A network round trip per lookup (about a millisecond), and one key per prefix (millions of keys).\n\nA search engine (Elasticsearch's completion suggester, or edge n-grams):\n• The most features: typo tolerance, filters (only products in stock, only in this country), personalisation, ranking that mixes popularity with relevance.\n• Slower (milliseconds to tens of milliseconds) and heavier to run.\n\nFor pure "popular queries by prefix" at huge volume, a trie (or Redis prefix keys) wins. When suggestions must tolerate typos or depend on filters, use the search engine, often with a cache of the most common prefixes in front.`,
        },
    },
    'sd8-t10': {
        explain: {
            answer: `A Redis sorted set keeps two structures together. A hash map gives each member's score in O(1). A skip list keeps the members ordered by score: layers of linked lists where the upper layers skip ahead, so finding a position takes about log n steps, like a balanced tree.\n\nThe trick for ranks: each forward link in the skip list also records how many elements it jumps over (its span). To find a player's rank, walk down to them and add up the spans you crossed: that is how many players are ahead of them. That is O(log n): about 23 steps for 10 million players, instead of counting them one by one.\n\nSo every leaderboard operation is fast:\n• Update a score (ZINCRBY): move one element, O(log n).\n• Top N (ZREVRANGE 0 N−1): find the end and read N elements.\n• A player's rank (ZREVRANK): O(log n).\n\nCompare with a SQL table: "what is my rank?" is SELECT COUNT(*) WHERE score > my score, which reads a large part of the table every time.`,
        },
        draw: {
            answer: `Every update is saved durably before the sorted set is changed, so Redis can always be rebuilt from the database. Reads never touch the database: they are answered from the sorted set in milliseconds.`,
            code: py`
                UPDATE
                Game client ── POST /scores {player, +40} ──► Game service
                                                                │ 1. save durably
                                                                ├──► Scores DB (source of truth)
                                                                │ 2. update the ranking
                                                                └──► Redis sorted sets
                                                                     ZINCRBY lb:all-time  40 player
                                                                     ZINCRBY lb:2024-w12  40 player
                                                                     (weekly set has an expiry)

                READ
                Client ── GET /leaderboard/top?n=10 ──► Leaderboard service
                                                          ZREVRANGE lb:all-time 0 9 WITHSCORES
                Client ── GET /leaderboard/rank/{player} ──► ZREVRANK + ZSCORE
                                                             + ZREVRANGE around that rank

                RECOVERY
                Redis lost ──► rebuild from Scores DB, then serve again
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The Python version keeps a sorted list of (−score, sequence, player): the minus sign puts the highest score first, and the sequence number breaks ties in favour of whoever reached the score earlier. An update removes the old entry and inserts the new one with bisect; rank is the entry's position + 1.\n\nAsha's two awards make her 90 points and first. Ben and Chen both have 70, but Ben got there first, so he ranks above Chen.\n\nThe bisect version is O(log n) to find an entry, but O(n) to insert into a Python list, which is fine for thousands of players, not millions. The matching Redis commands do the same in O(log n):\n• Update: ZINCRBY lb 40 asha\n• Top 3: ZREVRANGE lb 0 2 WITHSCORES\n• Rank (0-based): ZREVRANK lb chen\n• Around a player: take r = ZREVRANK lb chen, then ZREVRANGE lb (r − 1) (r + 1) WITHSCORES\n• Ties: Redis orders equal scores by name, so to favour the earliest, store score × 10¹⁰ + (a big number − the time reached), or keep the time in a second sorted set.`,
            code: py`
                import bisect
                import itertools


                class Leaderboard:
                    def __init__(self):
                        self.entries = []                        # sorted (-score, sequence, player)
                        self.current = {}                        # player -> their entry
                        self.sequence = itertools.count()        # earlier = higher on ties

                    def add_points(self, player, delta):
                        old = self.current.pop(player, None)
                        score = delta
                        if old:
                            self.entries.pop(bisect.bisect_left(self.entries, old))
                            score = -old[0] + delta
                        entry = (-score, next(self.sequence), player)
                        bisect.insort(self.entries, entry)
                        self.current[player] = entry

                    def top(self, n):
                        return [(player, -neg) for neg, _, player in self.entries[:n]]

                    def rank(self, player):                      # 1 = first
                        return bisect.bisect_left(self.entries, self.current[player]) + 1

                    def around(self, player, k=1):
                        i = self.rank(player) - 1
                        return [(p, -neg) for neg, _, p in self.entries[max(0, i - k): i + k + 1]]


                board = Leaderboard()
                for player, points in [("asha", 50), ("ben", 70), ("chen", 70), ("dara", 30), ("asha", 40), ("eli", 10)]:
                    board.add_points(player, points)

                print(board.top(3))                              # [('asha', 90), ('ben', 70), ('chen', 70)]
                print(board.rank("chen"), board.rank("dara"))    # 3 4
                print(board.around("chen"))                      # [('ben', 70), ('chen', 70), ('dara', 30)]
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Exact ranks for 100 million players:\n• One sorted set holding everyone: about 100 million × ~100 bytes ≈ 10 GB of memory, on one Redis node, which handles every update and rank query alone: a hot spot and a single point of failure.\n• It can't simply be split by player, because a rank needs the global order. Splitting by score range works (rank = the number of players in all higher ranges + your rank within your range), but the ranges must be rebalanced as scores drift, and every rank query needs those counts.\n\nApproximate percentiles:\n• Keep a histogram: for example 10,000 score buckets, each with a count. An update is two counter changes (leave the old bucket, join the new one), memory is tiny, and it is easy to split across machines and add up.\n• A player's rank becomes "about the top 3%" (the sum of the counts above their bucket, plus an estimate within it).\n• Exact positions can still be kept for the top, say 1,000 players, in a small sorted set, which is where people actually care about the exact number.\n\nWhat changes is the product: "you are #48,213,907" becomes "top 48%". Few players miss the exact number, and the system becomes far cheaper and easier to scale.`,
        },
    },
    'sd8-t11': {
        explain: {
            answer: `Finding a key's node: every client (or a proxy in front of the nodes) knows the hash ring. Each node is placed on the ring at many points (virtual nodes). To find "user:42", hash the key to a point on the ring and walk clockwise to the first node's point: that node owns the key. The client then talks to that node directly. No central lookup is needed; everyone computes the same answer from the same membership list, which comes from a configuration service (or the nodes gossip it among themselves).\n\nAdding a node: it is placed on the ring at its own virtual points. Each of those points takes over only the stretch of ring just before it, so it takes keys from its neighbours only, about 1 in N of all keys, spread evenly thanks to the virtual nodes. Every other key stays where it was.\n\nThose moved keys aren't copied over; they simply start missing on the new node and are refilled from the database as they are requested. The hit rate dips briefly and recovers as the new node warms up. With hash % N instead, almost every key would move at once, and the database would take the full load.`,
        },
        draw: {
            answer: `Each key goes to the next node clockwise on the ring, and each node has a replica on a different machine for failover. Membership (which nodes exist) comes from the configuration service, so every client builds the same ring.`,
            code: py`
                Clients (each with the ring + membership)
                  │  hash("user:42") → a point → next node clockwise
                  ▼
                      ┌──────────── hash ring ────────────┐
                      │    A#1     B#1     C#1     A#2    │   (many virtual
                      │  ●───────●───────●───────●──── … │    points per node)
                      └────┬───────┬───────┬──────────────┘
                           ▼       ▼       ▼
                        Node A   Node B   Node C
                        hash map + LRU + TTL, in memory
                           │        │        │ copies
                           ▼        ▼        ▼
                        Replica  Replica  Replica   (promoted if
                          A'       B'       C'       a node dies)

                Config service: the list of nodes ──► clients
                Add node D: D's points take ~1/N of keys
                from their neighbours; nothing else moves.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The simulation combines the earlier pieces: a consistent-hash ring with 100 virtual nodes each, and an OrderedDict LRU per node (200 keys each). The traffic is 50,000 requests over 2,000 keys, where a few keys are far more popular than the rest, as in real life. Every miss reads the "database" and fills the cache (cache-aside).\n\nWith 3 nodes, the hit rate settles around 79%, and every node fills to its 200-key capacity. Adding a fourth node moves 546 of the 2,000 keys (27%, close to the ideal 25%) to the new node; the next requests for those keys miss, so the hit rate dips to 77%. Once the new node warms up, the hit rate climbs to 83%, higher than before, because the cluster now holds 800 keys instead of 600.`,
            code: py`
                import bisect
                import hashlib
                import random
                from collections import OrderedDict


                def h(s):
                    return int(hashlib.md5(s.encode()).hexdigest(), 16)


                class Ring:
                    def __init__(self, nodes, vnodes=100):
                        self.points = sorted((h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
                        self.keys = [p for p, _ in self.points]

                    def node_for(self, key):
                        return self.points[bisect.bisect(self.keys, h(key)) % len(self.points)][1]


                class LRUNode:
                    def __init__(self, capacity):
                        self.capacity, self.data = capacity, OrderedDict()

                    def get(self, key):
                        if key not in self.data:
                            return None
                        self.data.move_to_end(key)
                        return self.data[key]

                    def set(self, key, value):
                        self.data[key] = value
                        self.data.move_to_end(key)
                        if len(self.data) > self.capacity:
                            self.data.popitem(last=False)


                class DistributedCache:
                    def __init__(self, names, capacity):
                        self.capacity = capacity
                        self.nodes = {name: LRUNode(capacity) for name in names}
                        self.ring = Ring(names)

                    def add_node(self, name):
                        self.nodes[name] = LRUNode(self.capacity)
                        self.ring = Ring(list(self.nodes))

                    def get(self, key):
                        return self.nodes[self.ring.node_for(key)].get(key)

                    def set(self, key, value):
                        self.nodes[self.ring.node_for(key)].set(key, value)


                def hit_rate(cache, requests):
                    hits = 0
                    for key in requests:
                        if cache.get(key) is not None:
                            hits += 1
                        else:
                            cache.set(key, f"value of {key}")    # cache-aside: fill from the database
                    return round(hits / len(requests), 3)


                random.seed(3)
                keys = [f"user:{i}" for i in range(2_000)]
                weights = [1 / (i + 1) for i in range(len(keys))]   # a few keys are very popular
                traffic = random.choices(keys, weights, k=50_000)

                cache = DistributedCache(["n1", "n2", "n3"], capacity=200)
                print("warm-up:", hit_rate(cache, traffic[:20_000]))          # warm-up: 0.78
                print("steady:", hit_rate(cache, traffic[20_000:30_000]))     # steady: 0.791
                print({name: len(node.data) for name, node in cache.nodes.items()})
                # {'n1': 200, 'n2': 200, 'n3': 200}

                before = {k: cache.ring.node_for(k) for k in keys}
                cache.add_node("n4")
                print("moved:", sum(before[k] != cache.ring.node_for(k) for k in keys))   # moved: 546
                print("just after:", hit_rate(cache, traffic[30_000:32_000]))  # just after: 0.769
                print("warm again:", hit_rate(cache, traffic[32_000:]))        # warm again: 0.83
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Routing in the client library:\n• No extra hop: the client talks straight to the right node, which gives the lowest latency (this matters when the whole point is sub-millisecond reads).\n• No proxy tier to run and scale.\n• But every client, in every language your company uses, needs a correct, identical implementation of the hashing and of membership changes; a bug or an old library version sends keys to the wrong node.\n• Membership changes must reach every client; and every client keeps connections to every node, which adds up with thousands of app servers.\n\nRouting through a proxy layer (for example twemproxy, mcrouter, Envoy):\n• Clients stay simple: they speak plain cache protocol to a local or nearby proxy.\n• Membership and routing rules change in one place; the proxy pools connections, and can add features such as replication, failover and shadowing traffic.\n• But every request pays an extra network hop (a fraction of a millisecond), and the proxies themselves must be scaled and kept highly available, or they become the bottleneck.\n\nA common answer: client-side routing for a few latency-critical services in one language; a proxy (often running beside each app server, to keep the hop local) when many teams and languages share the cache.`,
        },
    },
};
