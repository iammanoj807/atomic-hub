import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 3 · Data: databases, storage and scaling data. One good answer for each practice exercise.

export const sdPhase3Answers: Record<string, SDTopicAnswers> = {
    'sd3-t1': {
        explain: {
            answer: `• Key-value (Redis, DynamoDB): a giant dictionary; give it a key, get a value back, very fast. Good for: user sessions, a cache, a shopping cart.\n• Document (MongoDB): each record is a JSON-like document, and records can have different fields. Good for: a product catalogue, where a shirt has sizes and a laptop has RAM.\n• Wide-column (Cassandra): rows grouped by a partition key and sorted inside it, built for enormous write volumes spread over many machines. Good for: chat messages by conversation, or sensor readings by device and time.\n• Graph (Neo4j): nodes and the relationships between them are stored directly, so following links is cheap. Good for: a social network ("friends of friends who like X"), or spotting fraud rings.`,
        },
        draw: {
            answer: `One user has many orders, and one order has many item lines; order_items is keyed by the pair (order_id, product_id). Two details worth saying out loud: the item keeps the price at the time of purchase (product prices change later), and orders get an index on (user_id, created_at) for "my latest orders".`,
            code: py`
                users
                  user_id       PK
                  email         UNIQUE, NOT NULL
                  name
                  created_at
                     │ 1
                     │
                     │ many
                orders
                  order_id      PK
                  user_id       FK → users.user_id
                  status
                  total_pence
                  created_at
                     │ 1
                     │
                     │ many
                order_items
                  order_id      PK (part 1), FK → orders
                  product_id    PK (part 2), FK → products
                  quantity
                  unit_price_pence   (the price when bought)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Bank ledger: relational (PostgreSQL). Money needs ACID transactions (a transfer is two changes that must both happen), constraints (no negative balance), and exact reports. Correctness matters far more than raw scale.\n• IoT sensor readings: a time-series database (TimescaleDB, InfluxDB), or wide-column (Cassandra) partitioned by (sensor, day). Huge numbers of small writes, always appended, read by sensor and time range, and old data is downsampled or deleted.\n• User sessions: key-value (Redis). Looked up by session ID on every request, must be very fast, and expire on their own (a TTL). Losing one just means logging in again.\n• Social graph: a graph database (Neo4j) for queries several hops deep. At very large scale, many companies keep each user's list of friends in a sharded key-value or wide-column store, and precompute the expensive questions.\n• Product catalogue: a document store (MongoDB), or PostgreSQL with JSONB columns, because products have different attributes. Search over it goes in a search engine (Elasticsearch), fed from the main store.`,
        },
        tradeoffs: {
            answer: `What went wrong: the database was chosen for "it scales" rather than for how the data is used. Users, orders, products and payments are relational data, connected by keys, and reports are exactly the cross-collection joins MongoDB is weakest at. So now there are slow $lookup chains, copies of the same data in several documents drifting apart, and reports run against the production database.\n\nWhat to do:\n1. Short term: don't run reports on production. Stream every change (MongoDB change streams) into a relational warehouse (PostgreSQL, BigQuery or Snowflake) and run the five-way joins there. Reports become fast and safe, and nothing in the app changes.\n2. Longer term: move the core relational data (orders, payments) into PostgreSQL, where joins and transactions are natural, one part at a time. Keep MongoDB where it fits, such as the flexible product catalogue.\n\nThe lesson: choose the store per kind of data, from its access patterns, and expect reporting to need its own copy of the data.`,
        },
    },
    'sd3-t2': {
        explain: {
            answer: `A transfer: take £100 from account A and add £100 to account B.\n\n• Atomic: both steps happen, or neither does. If the server crashes after taking the money from A, the transfer is rolled back, so the £100 never vanishes "in the air".\n• Consistent: the database's rules always hold before and after. If there is a rule "balance can't go below 0", a transfer that would break it is refused; the database never ends up in an invalid state.\n• Isolated: two transfers running at the same time don't see each other's half-finished work. Someone checking A's balance mid-transfer sees either before or after, never the middle.\n• Durable: once the bank says "done", the transfer survives a crash or power cut, because it was written to the log on disk before the reply.`,
        },
        draw: {
            answer: `Both transactions read the same starting balance, so the second write is based on an old value and wipes out the first. The fix is to stop the read and the write being separate steps: lock the row while reading it (SELECT … FOR UPDATE), do the arithmetic in the database (UPDATE … SET balance = balance − 30), or check a version number when writing.`,
            code: py`
                time   Transaction 1           Transaction 2
                 t1    read balance → £100
                 t2                            read balance → £100
                 t3    write £100 − £30 = £70
                 t4    COMMIT
                 t5                            write £100 − £50 = £50
                 t6                            COMMIT

                Result: £50.
                Correct: £100 − £30 − £50 = £20.
                Transaction 1's change was lost.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The check and the subtraction are one statement: "take the money only if there is enough" (WHERE balance >= amount). If no row changed, the sender didn't have enough, so the function rolls back. BEGIN IMMEDIATE takes SQLite's write lock at the start, so the second transfer waits for the first to finish instead of failing.\n\nTwo transfers of £80 from an account holding £100, started at the same moment: exactly one succeeds and the other is rolled back. Which one wins depends on timing, but the result never does: A ends with £20, and the total money is still £100.`,
            code: py`
                import os
                import sqlite3
                import tempfile
                import threading

                path = os.path.join(tempfile.mkdtemp(), "bank.db")
                setup = sqlite3.connect(path)
                setup.execute("CREATE TABLE accounts (id TEXT PRIMARY KEY, balance INTEGER NOT NULL CHECK (balance >= 0))")
                setup.executemany("INSERT INTO accounts VALUES (?, ?)", [("A", 100), ("B", 0), ("C", 0)])
                setup.commit()
                setup.close()


                class InsufficientFunds(Exception):
                    pass


                def transfer(sender, receiver, amount):
                    db = sqlite3.connect(path, timeout=5, isolation_level=None)   # we run the transaction ourselves
                    try:
                        db.execute("BEGIN IMMEDIATE")            # take the write lock now
                        taken = db.execute(
                            "UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?",
                            (amount, sender, amount),
                        ).rowcount
                        if taken == 0:
                            raise InsufficientFunds(f"{sender} can't send {amount}")
                        db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, receiver))
                        db.execute("COMMIT")
                        return "done"
                    except Exception as error:
                        if db.in_transaction:
                            db.execute("ROLLBACK")
                        return f"rolled back: {error}"
                    finally:
                        db.close()


                print(transfer("A", "B", 500))                   # rolled back: A can't send 500

                results = []
                threads = [threading.Thread(target=lambda to=to: results.append(transfer("A", to, 80))) for to in ("B", "C")]
                for thread in threads:
                    thread.start()
                for thread in threads:
                    thread.join()
                print(sorted(results))                           # ['done', "rolled back: A can't send 80"]

                db = sqlite3.connect(path)
                balances = dict(db.execute("SELECT id, balance FROM accounts"))
                print(balances["A"], sum(balances.values()))     # 20 100
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Serializable is the safest level: the result is as if transactions ran one at a time. But it costs a lot:\n\n• Slower, and less work done at once: the database must lock more, or track more, to prove no anomaly can happen. Under contention, throughput drops sharply.\n• Many more failed transactions: with optimistic serializable isolation (PostgreSQL's SSI), conflicting transactions are aborted with a serialisation error, and the application must retry them. Busy rows make this frequent.\n• More waiting and deadlocks with lock-based implementations.\n\nAnd most transactions don't need it: a single-row update, or a read that tolerates a tiny race, is fine at read committed.\n\nSo use the default (read committed) for most work, and protect the few dangerous cases precisely: SELECT … FOR UPDATE, atomic UPDATEs, version checks, unique constraints, or serializable only for the transactions that can suffer write skew (for example, "at least one doctor must stay on call").`,
        },
    },
    'sd3-t3': {
        explain: {
            answer: `An index is like the index at the back of a textbook. To find "eigenvalue", you don't read 900 pages; you look it up in the sorted index ("page 212") and go straight there. A database index is a sorted structure (usually a B-tree) of one column's values, each pointing to the row that has it, so finding a row takes a handful of steps instead of reading the whole table.\n\nWhy it slows writes: a book's index is written once, when it is printed. A database index has to be kept correct all the time. Every INSERT adds an entry to every index on the table, every DELETE removes one, and every UPDATE of an indexed column moves one. A table with 5 indexes does 6 writes for each new row, and the indexes take disk space and memory too.`,
        },
        draw: {
            answer: `In a B-tree (strictly, a B+ tree), the root holds dividing values and the leaves hold the sorted keys. To find 25: at the root, 25 is between 18 and 30, so take the middle branch; in that leaf, 25 is there. Two steps for 10 numbers, and only about 4 or 5 steps for 100 million, because each level divides the search space by the number of branches.`,
            code: py`
                              ┌─────────┐
                              │ 18 │ 30 │   root
                              └─────────┘
                       < 18 ╱     │ 18–29  ╲ ≥ 30
                ┌──────────┐ ┌──────────┐ ┌────────────┐
                │ 3  7  12 │ │18  21  25│ │30 34 40 45 │  leaves
                └──────────┘ └──────────┘ └────────────┘
                                     ▲
                Find 25: root → between 18 and 30 →
                middle leaf → found.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Without an index the plan says SCAN: SQLite reads all 1,000,000 rows to find the 15 belonging to user 4242. With the index it says SEARCH … USING INDEX: it walks the B-tree straight to that user's rows. The answer is identical; the time drops by a factor of thousands.\n\nExact times depend on the machine; on mine the scan took about 20 ms and the indexed lookup about 4 microseconds.`,
            code: py`
                import random
                import sqlite3
                import time

                db = sqlite3.connect(":memory:")
                db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount INTEGER)")
                random.seed(1)
                db.executemany(
                    "INSERT INTO orders (user_id, amount) VALUES (?, ?)",
                    ((random.randrange(100_000), random.randrange(1, 500)) for _ in range(1_000_000)),
                )

                query = "SELECT COUNT(*), SUM(amount) FROM orders WHERE user_id = 4242"


                def plan(sql):
                    return [row[-1] for row in db.execute("EXPLAIN QUERY PLAN " + sql)]


                def timed(sql, runs=20):
                    start = time.perf_counter()
                    for _ in range(runs):
                        result = db.execute(sql).fetchone()
                    return result, (time.perf_counter() - start) / runs * 1000


                print(plan(query))                    # ['SCAN orders']: reads every row
                result, ms = timed(query)
                print(result, f"{ms:.1f} ms")         # (15, 4418) 20.2 ms

                db.execute("CREATE INDEX idx_orders_user ON orders (user_id)")
                print(plan(query))                    # ['SEARCH orders USING INDEX idx_orders_user (user_id=?)']
                result, ms = timed(query)
                print(result, f"{ms:.3f} ms")         # (15, 4418) 0.004 ms
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Every write updates the table plus all 9 indexes: 10 structures, 50,000 times a second. That is most likely where the time goes.\n\nWhat I'd check:\n• Which indexes are actually used (in PostgreSQL, pg_stat_user_indexes: an idx_scan of 0 means never used).\n• Duplicates: an index on (a) is redundant when one on (a, b) exists.\n• Indexes on columns with few distinct values (status, a boolean), which rarely help.\n• Which queries need each index, and how often they run: a nightly report shouldn't slow every write all day.\n• Write latency, disk I/O and log volume, and whether random keys (UUID v4) are splitting index pages.\n\nWhat I'd change:\n• Drop unused and redundant indexes; merge several into one composite or covering index.\n• Use partial indexes (only the rows a query needs, such as WHERE status = 'pending').\n• Move reporting queries to a read replica or a warehouse, with their own indexes.\n• Batch writes, and use time-ordered keys.\n• If it is append-only data (events, logs), consider a store built for heavy writes (an LSM-tree database such as Cassandra).`,
        },
    },
    'sd3-t4': {
        explain: {
            answer: `A teacher writes on the main whiteboard (the leader). Assistants in other rooms copy every line onto their own boards (the followers), in the same order. All new writing happens on the main board only; students can read any board, which spreads them out (more read capacity), and if the main room floods, one assistant's board becomes the new main board (failover).\n\nReplication lag is the moment between the teacher writing a line and an assistant copying it. A student in another room may see the old version for a moment. With asynchronous copying, the teacher doesn't wait for the assistants, so the lag can grow to seconds when they're busy; with synchronous copying, the teacher waits for at least one assistant to confirm each line, which is safer but slower.`,
        },
        draw: {
            answer: `The client hears "done" only after the leader has saved the write and the synchronous follower has confirmed it, so a committed write survives losing the leader. The asynchronous follower is updated afterwards; reads sent to it may briefly miss the newest writes.`,
            code: py`
                Client ── 1. write ──► Leader
                                         │ 2. save, add to the log
                                         ├──► Follower 1 (synchronous,
                                         │      another zone)
                                         │ ◄── 3. "saved" ──┘
                                         │
                Client ◄── 4. "done" ────┤
                                         │
                                         └ ─ ─► Follower 2 (asynchronous)
                                                  5. catches up later;
                                                  may lag behind
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Why: the update went to the leader, but the next read went to a follower that hadn't copied it yet. Replication is asynchronous, so a follower can be a fraction of a second, or a few seconds, behind. The user sees their old profile and thinks the save failed.\n\nFixes:\n1. Read your own writes: for a short time after a user changes something (say 10 seconds), send that user's reads of their own data to the leader. Or always read a user's own profile from the leader; other people's views of it can come from followers.\n2. Read from a follower that has caught up: the write returns its position in the replication log, and the read is only served by a follower at or past that position (otherwise it goes to the leader).\n\nAlso helpful: the app shows the new value straight away from what it just sent (an optimistic update), and pins each user to one follower, so they never see time go backwards between refreshes.`,
        },
        tradeoffs: {
            answer: `Payment ledger: synchronous, to at least one follower in another zone. With asynchronous replication, a leader crash can lose the last few committed payments, even though customers were told "paid". That is not acceptable for money. The price is slower writes (each commit waits for a second copy), which is worth paying.\n\nSocial feed: asynchronous. Speed and availability matter more. If a rare failover loses the last second of likes or a post shows up a moment late, almost nobody notices, and the writes stay fast even under huge load.\n\nA common middle way: one synchronous follower and the rest asynchronous ("semi-synchronous"), so you get no data loss with only one extra wait per write.`,
        },
    },
    'sd3-t5': {
        explain: {
            answer: `The library has grown too big for one building, so the books are split across several buildings (shards). The shard key is the rule for which building a book goes in: by the author's first letter (A–F in building 1: range sharding), or by a code that spreads the books evenly (hash sharding).\n\nIf you know a book's key, you go straight to the right building: a query by the shard key touches one shard. But a question like "every book published in 2020" has to be asked in every building and the answers combined, which is slow. So you choose the shard key to match the questions asked most often, and you choose one that spreads books evenly, so no single building is overwhelmed.`,
        },
        draw: {
            answer: `With hash % N, the shard depends on N, so changing N from 4 to 5 changes the answer for most keys: about 80% of the data has to move (here 7 of 10 users). The fix is to decouple keys from physical machines: consistent hashing, or a fixed number of logical shards (say 1,024) that are mapped to machines in a table, so adding a machine moves a few whole logical shards and nothing else.`,
            code: py`
                shard = hash(user_id) % 4        (say the hash is the id)

                user_id:  1  2  3  4  5  6  7  8  9  10
                % 4:      1  2  3  0  1  2  3  0  1  2
                % 5:      1  2  3  4  0  1  2  3  4  0
                moves?    .  .  .  ✓  ✓  ✓  ✓  ✓  ✓  ✓

                Shard 0: 4, 8      Shard 1: 1, 5, 9
                Shard 2: 2, 6, 10  Shard 3: 3, 7

                Add a fifth shard → 7 of 10 users move.
                In general, about 4 in 5 keys move.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Chat messages: conversation_id. The main query is "the latest messages in this chat", so all of a conversation's messages should live together, sorted by time inside the shard. There are millions of conversations, so the spread is even. (One giant group chat can be a hot spot; split it by time bucket if needed.)\n• Online shop orders: customer_id. "My orders" is the most common query and stays on one shard. To look an order up by order_id alone, put the shard number inside the order ID, or keep a small lookup table from order_id to shard. Reports across all orders go to a separate analytics copy.\n• URL shortener: the short code (hashed). Every redirect is a lookup by code and nothing else, so hashing the code gives a perfectly even spread and one shard per request.`,
        },
        tradeoffs: {
            answer: `Neither on its own is ideal.\n\n• Range sharding by time alone: a time-range query reads one or two shards (good), but every new reading has the newest timestamp, so all writes land on the newest shard (a hot spot), while the old shards sit idle.\n• Hash sharding: writes spread evenly (good), but neighbouring times are scattered, so every time-range query has to ask every shard and merge the results.\n\nThe usual answer is both: shard by a hash of the sensor ID (spreading the writes across sensors), and within each shard store each sensor's readings sorted by time, often in one partition per sensor per day. "Sensor 17 between 09:00 and 10:00" then goes to one shard and reads one contiguous range. Queries across all sensors for a time range are rarer; they scatter to every shard, or run on a pre-aggregated copy (time-series databases such as TimescaleDB do this partitioning for you).`,
        },
    },
    'sd3-t6': {
        explain: {
            answer: `With hash % N, the server for a key depends on N. Going from 4 servers to 5, a key stays put only if hash % 4 = hash % 5, which is true only when hash % 20 is 0, 1, 2 or 3: 4 cases out of 20. So 20% of keys stay and about 80% move.\n\nFor a cache with 10 million keys, that means about 8 million keys are suddenly on the "wrong" server: 80% of requests miss at once, all of them fall through to the database, and the database can collapse. Removing a server is just as bad.\n\nConsistent hashing moves only the keys the new server takes over: about 1 in 5 (1/N), and only from its neighbours.`,
        },
        draw: {
            answer: `Each key belongs to the first server clockwise from it. When D joins at position 60, it takes only the keys between the server before it (B at 45) and itself: here just k4. Every other key keeps its server, which is the whole point.`,
            code: py`
                Ring positions 0–99, clockwise.
                Servers: A at 10, B at 45, C at 80

                k1 at  5 → A        k4 at 50 → C
                k2 at 20 → B        k5 at 70 → C
                k3 at 40 → B        k6 at 90 → A  (wraps past 99)

                Add D at 60:
                k4 at 50 → D   ← the only key that moves (C → D)
                k5 at 70 → C   (C is still the first after 60)
                all others: unchanged
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The ring is the lesson's code. 10,000 keys go on 4 servers; then a fifth is added and the keys are mapped again.\n\nWith plain hash % N, 7,960 of the 10,000 keys move: about 80%, as the maths predicts.\n\nWith 100 virtual nodes per server, 1,682 move (about 17%, close to the ideal 1 in 5), all of them to the new server, and the load is fairly even: 2,335 to 2,711 keys each.\n\nWith 1 virtual node per server, only 303 move. That sounds better, but it is bad news: the new server happened to land in a short arc of the ring, so it takes almost no load, while the old servers are badly uneven (1,765 to 2,953 keys). Four random points cut the ring into very unequal arcs. That is why real systems use many virtual nodes.`,
            code: py`
                import bisect
                import hashlib


                def h(s):
                    return int(hashlib.md5(s.encode()).hexdigest(), 16)


                class Ring:
                    def __init__(self, servers, vnodes=100):
                        self.points = sorted((h(f"{s}#{i}"), s) for s in servers for i in range(vnodes))
                        self.keys = [p for p, _ in self.points]

                    def server_for(self, key):
                        i = bisect.bisect(self.keys, h(key)) % len(self.points)
                        return self.points[i][1]


                keys = [f"user:{i}" for i in range(10_000)]
                servers = ["s1", "s2", "s3", "s4"]


                def moved(vnodes):
                    before, after = Ring(servers, vnodes), Ring(servers + ["s5"], vnodes)
                    return sum(before.server_for(k) != after.server_for(k) for k in keys)


                def load(vnodes):
                    ring = Ring(servers, vnodes)
                    counts = dict.fromkeys(servers, 0)
                    for k in keys:
                        counts[ring.server_for(k)] += 1
                    return counts


                print("hash % N moved:", sum(h(k) % 4 != h(k) % 5 for k in keys))
                print("ring, 100 vnodes moved:", moved(100), load(100))
                print("ring, 1 vnode moved:", moved(1), load(1))
                # hash % N moved: 7960
                # ring, 100 vnodes moved: 1682 {'s1': 2514, 's2': 2335, 's3': 2711, 's4': 2440}
                # ring, 1 vnode moved: 303 {'s1': 2953, 's2': 2680, 's3': 2602, 's4': 1765}
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `When the number of servers almost never changes, or when moving everything is cheap:\n\n• A fixed-size cluster, resized rarely and in a planned window, where a full reshuffle can be done slowly in the background.\n• Data that is cheap to rebuild, such as a small cache that can warm up again from the database without hurting it.\n• A fixed number of logical shards: hash(key) % 1,024 picks one of 1,024 logical shards that never changes, and a small table maps logical shards to machines. This is hash % N with N fixed forever, and rebalancing moves whole logical shards. Many databases do exactly this.\n\nIt is also simpler: no ring, no virtual nodes, and every client computes the same answer with one line of code.`,
        },
    },
    'sd3-t7': {
        explain: {
            answer: `Object storage works like a cloakroom. You hand in your coat (the file: a photo, a video, a backup) and get a ticket back (the key, such as users/42/avatar.jpg). You keep the ticket in your pocket (the database stores the key, not the file). Whenever you need the coat, you show the ticket and get it back.\n\nThe cloakroom is huge, cheap and very safe (S3 keeps copies in several places), and it doesn't care what is in the coat. Where the picture breaks: you can't change a button on a coat while it hangs there. Objects are written and replaced whole, not edited in the middle, so object storage is for files, not for records that change often.`,
        },
        draw: {
            answer: `The file never passes through your API servers: they only check who the user is, hand out a short-lived upload link, and record the key afterwards. Big uploads don't tie up your servers, and storage handles the bandwidth.`,
            code: py`
                Client ── 1. "I want to upload a photo" ──► API
                                                            │ 2. check the user
                                                            │ 3. ask for a pre-signed
                                                            ▼    URL (5 minutes)
                                                       Object storage (S3)
                API ◄── URL ───────────────────────────────┘
                Client ◄── 4. here is the URL ── API

                Client ── 5. PUT the file ──► Object storage
                Client ── 6. "upload finished" ──► API
                                                    │ 7. save the key
                                                    ▼
                                                 Database
                                         (photo_id, owner, key, size)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Original image: object storage, in a private bucket, under a key such as photos/{user_id}/{photo_id}/original.jpg. Uploaded directly by the client with a pre-signed URL. A lifecycle rule moves originals to a cheaper storage class after, say, 60 days, when they are rarely opened.\n• Thumbnails and resized versions (150 px, 600 px, 1080 px): made by background workers after the upload (a queue message "photo 42 uploaded"), and stored in object storage beside the original. They are served through a CDN with a long cache time, because feeds load them constantly. Location data is stripped from public versions.\n• Metadata: the database (photo_id, owner_id, object keys of each size, width, height, file size, caption, privacy setting, created_at). This is what the app queries; it never lists the bucket.\n\nPrivate photos are served with short-lived signed URLs (or signed CDN URLs), never by making the bucket public.`,
        },
        tradeoffs: {
            answer: `Object storage is for whole files, read and written as a unit, over HTTP, at some latency. Use something else when that doesn't fit:\n\n• Block storage (a disk attached to one server, such as AWS EBS) for a database's own data files, and a virtual machine's boot disk. They need fast, small, random reads and writes in the middle of files.\n• Files changed in place: appending to logs, editing parts of large files. Object storage would rewrite the whole object each time.\n• A shared file system (NFS, AWS EFS) for software that expects real files and folders, with locking and renaming, shared across several servers, such as older applications or build tools.\n• Very low-latency scratch space, such as a local SSD for intermediate files while transcoding a video. Copy the final result to object storage afterwards.`,
        },
    },
    'sd3-t8': {
        explain: {
            answer: `An inverted index is like the index at the back of a cookbook that lists, for every ingredient, the pages of every recipe that uses it: "garlic: 12, 40, 88; lemon: 40, 90".\n\nTo find a recipe with garlic and lemon, you don't read every recipe; you look up both ingredients and take the pages in both lists: page 40. A search engine does the same with words: it splits every document into words in advance, and for each word keeps the list of documents that contain it. A search for "red shoes" looks up two lists and intersects them, which is fast however many documents there are.\n\nWhere the picture breaks: a cookbook index is exact. A search engine also has to guess what you meant (running, ran, runs; typos; synonyms) and rank thousands of matches so the best come first.`,
        },
        draw: {
            answer: `The database stays the source of truth. Every change flows out through a change stream (published events, or change data capture reading the database's log), and an indexer turns each change into an update of the search index. The search API reads only from the search engine. New or edited items appear in search a second or two later: eventual consistency.`,
            code: py`
                App ── writes ──► Database (source of truth)
                                     │ change stream
                                     │ (CDC or events)
                                     ▼
                                   Queue
                                     │
                                     ▼
                                   Indexer
                                     │ add / update / delete
                                     ▼
                                 Search engine
                                 (inverted index, shards)
                                     ▲
                User ── "red shoes" ─┤
                         Search API ─┘
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `1,000 titles are generated from every combination of size, colour, material and item. Text is lowercased and split into words, and a very simple stemmer turns "shoes" into "shoe" and "running" into "run", so "Red Running Shoe" finds "red running shoes". An AND query intersects the posting lists of all its words.\n\nThe stemmer is deliberately crude: it would turn "canvas" into "canva". That is harmless here, because queries go through the same function, but real engines use proper stemmers (such as Porter's) for each language.`,
            code: py`
                import itertools
                import re
                from collections import defaultdict

                sizes = ["small", "large", "kids", "classic", "slim"]
                colours = ["red", "blue", "black", "white", "green"]
                materials = ["leather", "canvas", "running", "hiking", "wooden"]
                items = ["shoes", "boots", "bags", "hats", "jackets", "chairs", "tables", "lamps"]
                titles = [" ".join(words) for words in itertools.product(sizes, colours, materials, items)]


                def stem(word):
                    if word.endswith("ing") and len(word) > 5:
                        word = word[:-3]
                        if word[-1] == word[-2]:
                            word = word[:-1]                 # running -> runn -> run
                    elif word.endswith("s") and not word.endswith("ss") and len(word) > 3:
                        word = word[:-1]                     # shoes -> shoe
                    return word


                def terms(text):
                    return [stem(w) for w in re.findall(r"[a-z0-9]+", text.lower())]


                index = defaultdict(set)
                for doc_id, title in enumerate(titles):
                    for term in terms(title):
                        index[term].add(doc_id)


                def search(query):                           # AND: every word must match
                    words = terms(query)
                    if not words:
                        return []
                    ids = set.intersection(*(index.get(w, set()) for w in words))
                    return sorted(titles[i] for i in ids)


                print(len(titles))                                  # 1000
                print(search("Red Running Shoe"))
                # ['classic red running shoes', 'kids red running shoes', 'large red running shoes',
                #  'slim red running shoes', 'small red running shoes']
                print(len(search("boot")), len(search("black boots")))   # 125 25
                print(search("purple shoes"))                       # []
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `PostgreSQL's built-in full-text search (a tsvector column with a GIN index) is enough when:\n• the data fits comfortably in one database (up to a few million documents) and search traffic is moderate;\n• simple relevance ranking is fine;\n• you value having one system, and search results that are always exactly in step with the data (same transaction, no sync pipeline).\nFor an internal tool or a small shop, this is often the right answer.\n\nYou need Elasticsearch (or OpenSearch) when:\n• the data or the query volume outgrows one machine, and search must scale out across shards;\n• relevance really matters and needs tuning: field boosts, synonyms, business signals, typo tolerance (fuzzy matching), autocomplete;\n• you need fast facets and aggregations ("Brand: Nike (120)") over large result sets, or many languages;\n• you search logs and events at volume.\nThe cost: another system to run and keep in sync, and results that lag the database by a moment.`,
        },
    },
    'sd3-t9': {
        explain: {
            answer: `A Snowflake ID is one 64-bit number made of three parts:\n\n• Timestamp (41 bits): milliseconds since a chosen start date. It comes first, so IDs made later are bigger and sort by time, which keeps database indexes efficient (new rows go at the end).\n• Machine ID (10 bits): a number unique to each generator, up to 1,024 of them. It is what lets two machines make IDs in the same millisecond without asking each other, because their IDs differ in this part.\n• Sequence (12 bits): a counter within one millisecond on one machine, 0 to 4,095. It separates IDs made by the same machine in the same millisecond; when it runs out, the machine waits for the next millisecond.\n\nTake away any part and you get duplicates: without the machine ID, across machines; without the sequence, within one machine; without the timestamp, as soon as the sequence wraps.`,
        },
        draw: {
            answer: `41 bits of milliseconds last about 69 years from the chosen start date. 10 bits allow 1,024 machines, and 12 bits allow 4,096 IDs per machine per millisecond: about 4 million a second from each machine. The top bit stays 0, so the ID is always a positive signed 64-bit number (a BIGINT).`,
            code: py`
                │ 1 │        41 bits          │ 10 bits │ 12 bits  │
                │ 0 │ milliseconds since the  │ machine │ sequence │
                │   │ chosen start date       │ ID      │          │
                │   │ (about 69 years)        │ 0–1,023 │ 0–4,095  │
                  ▲
                  sign bit: always 0, so the ID stays positive
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The ID is built with bit shifts: (milliseconds since the start date) << 22, then machine ID << 12, then the sequence. A lock makes it safe to call from several threads. If the clock goes backwards, it refuses to make an ID rather than risk a duplicate; if 4,096 IDs are used in one millisecond, it waits for the next one.\n\n100,000 IDs come out unique and strictly increasing, and a second generator with a different machine ID never produces any of the same numbers.`,
            code: py`
                import threading
                import time


                class Snowflake:
                    EPOCH = 1_704_067_200_000                    # 2024-01-01, in milliseconds

                    def __init__(self, machine_id):
                        assert 0 <= machine_id < 1024            # 10 bits
                        self.machine_id = machine_id
                        self.last_ms = -1
                        self.sequence = 0
                        self.lock = threading.Lock()

                    @staticmethod
                    def _now():
                        return int(time.time() * 1000)

                    def next_id(self):
                        with self.lock:
                            now = self._now()
                            if now < self.last_ms:
                                raise RuntimeError("clock moved backwards; refusing to make an ID")
                            if now == self.last_ms:
                                self.sequence = (self.sequence + 1) & 4095       # 12 bits
                                if self.sequence == 0:                           # 4,096 used this millisecond
                                    while now <= self.last_ms:
                                        now = self._now()                        # wait for the next one
                            else:
                                self.sequence = 0
                            self.last_ms = now
                            return ((now - self.EPOCH) << 22) | (self.machine_id << 12) | self.sequence


                gen = Snowflake(machine_id=7)
                ids = [gen.next_id() for _ in range(100_000)]
                print(len(set(ids)) == len(ids))                     # True: all unique
                print(all(a < b for a, b in zip(ids, ids[1:])))      # True: strictly increasing
                first = ids[0]
                print((first >> 12) & 1023, first & 4095)            # 7 0: machine 7, sequence 0

                other = Snowflake(machine_id=8)
                print(len(set(ids) & {other.next_id() for _ in range(1_000)}))   # 0: no clashes
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• UUID v4: needs no coordination at all, but it is random, so each new row lands at a random place in the primary-key B-tree. On a write-heavy table that means page splits, poor cache use and slower inserts. It is also 16 bytes, which every secondary index repeats. Avoid it as the primary key of a busy table.\n• UUID v7: no coordination, and time-ordered (it starts with a millisecond timestamp, followed by random bits), so inserts go to the end of the index like a counter. Still 16 bytes. A good default when you want UUIDs.\n• Snowflake: time-ordered and only 8 bytes (a BIGINT), so indexes are the smallest and fastest. The cost: you must hand out unique machine IDs and handle clocks going backwards, and the ID reveals when (and on which machine) it was made.\n\nFor a write-heavy table: Snowflake if you can run the machine-ID setup, otherwise UUID v7. Either way, not UUID v4.`,
        },
    },
};
