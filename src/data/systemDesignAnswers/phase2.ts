import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 2 · Core concepts: scale, reliability and speed. One good answer for each practice exercise.

export const sdPhase2Answers: Record<string, SDTopicAnswers> = {
    'sd2-t1': {
        explain: {
            answer: `A busy restaurant has two ways to cook more meals.\n\nVertical scaling is buying a bigger oven: one machine with more CPU and memory. It is simple (nothing about how the kitchen works changes), but there is a biggest oven you can buy, and if that one oven breaks, nobody eats.\n\nHorizontal scaling is opening more kitchens: more machines behind a load balancer. There is no hard limit, and if one kitchen closes the others keep cooking. But it only works if any kitchen can cook any order. If half of a customer's order is sitting in kitchen 2 (state, like a session kept in one server's memory), their next request has to go back there. That is why app servers are made stateless, with sessions and files kept in shared stores.`,
        },
        draw: {
            answer: `The app servers are identical and keep nothing between requests, so the load balancer can send any user to any of them, and auto-scaling can add or remove one at any time. All state lives below them: sessions in Redis, data in the database, where the leader takes writes and the replicas serve reads.`,
            code: py`
                        Clients
                           │
                     Load balancer
                  ┌────────┼────────┐
                  ▼        ▼        ▼
                 App      App      App   ← stateless,
                server   server   server   auto-scaled
                  │        │        │
                  ├────────┴────────┤
                  ▼                 ▼
             Redis (sessions)   Database leader ── writes
                                    │ copies changes
                              ┌─────┴─────┐
                              ▼           ▼
                          Replica      Replica ── reads
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `What breaks: a user uploads a photo and the load balancer sends that request to server 1, which saves it on its own disk. Their next request, "show my photo", goes to server 2, which has never seen the file: a broken image or a 404. It looks random, because it depends on which server you happen to hit. And if server 1 dies or is replaced, its files are gone for good.\n\nThe fix: keep no files on the app servers. Store uploads in shared object storage (such as Amazon S3), and save only the file's key in the database. Better still, have the server hand the client a short-lived signed upload URL, so the file goes straight to object storage and never passes through the app server at all. Serve files to users through a CDN in front of the storage.\n\nNow every server sees the same files, any server can handle any request, and you can add or remove servers freely.`,
        },
        tradeoffs: {
            answer: `The main database of a growing product, early on.\n\nSay the PostgreSQL primary is running out of CPU at 5,000 queries a second. Moving it to a machine twice as big takes an hour and needs no code changes. Sharding it means choosing a shard key, rewriting the queries that join across shards, moving the data and running many databases: weeks of work and a permanent increase in complexity.\n\nModern machines are huge (hundreds of cores, terabytes of memory), so vertical scaling can carry a database a long way. Do it first, together with the cheap horizontal steps around it (a cache, read replicas), and plan the sharding path for when the biggest machine is no longer enough. Also: keep a standby replica, because one big machine is still a single point of failure.`,
        },
    },
    'sd2-t2': {
        explain: {
            answer: `99.9% available means it may be down 0.1% of the time.\n\nA year has 365 × 24 = 8,760 hours, and 0.1% of 8,760 is 8.76 hours. So three nines allows about 8 hours and 45 minutes of downtime a year, which is about 43 minutes a month, or about 10 minutes a week.\n\nEach extra nine divides that by 10: four nines (99.99%) allows about 53 minutes a year; five nines, about 5 minutes.`,
        },
        draw: {
            answer: `Every box has a twin in the other zone, and nothing is shared between the zones except the network. If zone A goes dark, the load balancers stop sending traffic there (health checks fail) and the standby database is promoted to leader. DNS points at both load balancers, so even the front door has a copy.`,
            code: py`
                              DNS (two records)
                              ┌──────┴──────┐
                              ▼             ▼
                   ┌──── Zone A ────┐ ┌──── Zone B ────┐
                   │ Load balancer  │ │ Load balancer  │
                   │   │       │    │ │   │       │    │
                   │  App     App   │ │  App     App   │
                   │   │            │ │   │            │
                   │ DB leader ─────┼─┼─► DB standby   │
                   │                │ │  (promoted if  │
                   │                │ │   A fails)     │
                   └────────────────┘ └────────────────┘
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `In series, every service must be up for a request to work, so you multiply:\n0.999 × 0.999 × 0.999 × 0.999 = 0.996 (99.6%).\n\nThat is about 35 hours of downtime a year, four times the 8.8 hours each service allows on its own. And this is the best case: it assumes your own code never fails.\n\nOne fix: take a service off the critical path. If one of them is not needed to answer the user (say, recommendations or analytics), call it asynchronously or with a timeout and a fallback, so it failing no longer fails the request. Three in series gives 0.999³ ≈ 99.7%.\n\nAnother: give the weakest service a redundant copy in parallel. Two copies at 99.9% each give 1 − 0.001² = 99.9999%, so that link almost stops counting.`,
            code: py`
                series = 0.999 ** 4
                print(round(series, 4), round((1 - series) * 8760, 1))   # 0.996 35.0 hours a year
                print(round(0.999 ** 3, 4))                               # 0.997
                print(round(1 - 0.001 ** 2, 6))                           # 0.999999
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `99.99% allows about 53 minutes of downtime a year; 99.999% allows about 5. That changes how you have to work:\n\n• No time for people: 5 minutes a year is less than it takes to page an engineer and open a laptop. Every failure must be detected and fixed automatically, in seconds.\n• More regions: a whole region going down for an hour would use up ten years of budget, so you need several regions serving traffic at once (active–active), with data copied between them and a way to resolve conflicting writes.\n• Every dependency must be better than five nines, including DNS, the cloud provider, and the database. Anything that isn't must be made redundant or removed from the critical path.\n• Changes are the biggest cause of outages, so every deploy and configuration change needs canary releases and automatic rollback.\n• Constant testing: failover drills and chaos experiments, or the failover won't work when you need it.\n\nEach nine roughly multiplies the cost in money, complexity and people, while the benefit (48 fewer minutes a year) gets smaller. So pick the target from what downtime really costs the business.`,
        },
    },
    'sd2-t3': {
        explain: {
            answer: `A circuit breaker is like the fuse box in a house.\n\n• Closed (the normal state): the fuse is in, electricity flows. Calls to the other service go through, and the breaker counts the failures.\n• Open: too many failures, so the fuse trips. Now calls aren't even attempted: they fail at once and the caller uses a fallback. That protects both sides: the caller doesn't tie up threads waiting, and the struggling service gets room to recover.\n• Half-open: this is where the fuse picture breaks. A fuse stays off until a person resets it. A circuit breaker tries again by itself after a cool-down: it lets a few test calls through. If they succeed it closes again; if they fail it opens again for another cool-down.`,
        },
        draw: {
            answer: `The breaker sits inside service A, in front of every call to B. While it is open, B receives nothing at all, and A answers its own caller straight away from the fallback, so a slow or broken B no longer makes A slow.`,
            code: py`
                Service A
                  │ wants data from B
                  ▼
                Circuit breaker (inside A)
                  │
                  ├─ CLOSED:    call B normally,
                  │             count the failures
                  │
                  ├─ OPEN:      don't call B at all.
                  │             Return the fallback at once:
                  │             · cached data
                  │             · a default value
                  │             · the page without that part
                  │
                  └─ HALF-OPEN: let a few test calls
                                through to B
                  │
                  ▼
                Service B
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The retry function is the lesson's: exponential backoff (0.1 s, 0.2 s, 0.4 s…), each wait multiplied by a random factor between 0.5 and 1.5 (jitter).\n\nThe simulation fakes the clock, so it runs instantly and gives the same numbers every time. 100 clients fail at the same moment; the service is down for 2 seconds; every client keeps retrying with the same backoff.\n\nWithout jitter, all 100 clients wait exactly the same time, so every retry wave hits the service with all 100 calls in the same instant, including the wave that arrives just after it recovers (a "thundering herd"): 100 calls in one 50 ms slice. With jitter, the same 600 calls are spread out, and the busiest 50 ms after recovery sees only 7, so a recovering service isn't knocked straight back over.\n\nThe cost is visible too: with jitter, the unluckiest client gets through at 5.8 s instead of 3.1 s. Jitter trades a little extra waiting for some clients for a much smoother load on the service.`,
            code: py`
                import random
                import time


                def call_with_retry(fn, attempts=4, base=0.1):
                    for i in range(attempts):
                        try:
                            return fn()                     # fn must be safe to repeat
                        except TimeoutError:
                            if i == attempts - 1:
                                raise
                            time.sleep(base * 2**i * random.uniform(0.5, 1.5))   # backoff + jitter


                failures_left = [2]

                def flaky():
                    if failures_left[0] > 0:
                        failures_left[0] -= 1
                        raise TimeoutError
                    return "ok"

                print(call_with_retry(flaky))                       # ok (on the third try)


                # 100 clients fail at t = 0 and retry; the service is down until t = 2 s.
                # Time is simulated, so this runs instantly and is repeatable.
                def simulate(jitter, clients=100, recover_at=2.0, base=0.1, attempts=8):
                    random.seed(7)
                    calls = []                                      # when each call reached the service
                    for _ in range(clients):
                        t = 0.0
                        for i in range(attempts):
                            calls.append(t)
                            if t >= recover_at:
                                break                               # this call succeeds
                            wait = base * 2**i
                            t += wait * random.uniform(0.5, 1.5) if jitter else wait
                    after = [c for c in calls if c >= recover_at]   # the calls that meet the recovered service
                    busiest = max(sum(1 for c in after if s <= c < s + 0.05) for s in after)
                    return len(calls), busiest, round(max(calls), 2)


                for jitter in (False, True):
                    total, busiest, last = simulate(jitter)
                    print(f"jitter={jitter}: {total} calls, busiest 50 ms after recovery: {busiest}, last client in at {last} s")
                # jitter=False: 600 calls, busiest 50 ms after recovery: 100, last client in at 3.1 s
                # jitter=True: 600 calls, busiest 50 ms after recovery: 7, last client in at 5.82 s
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Retries are dangerous when:\n• The operation is not safe to repeat. A timeout doesn't mean it failed; it may have worked and only the reply was lost. Retrying "charge this card £50" can charge twice.\n• The service is overloaded. Each retry is more load on a service that is already drowning, so retries turn a slowdown into an outage. Retries also multiply through layers: if three layers each try 4 times, one user click can become 4 × 4 × 4 = 64 calls at the bottom.\n• The error is permanent. Retrying a 400 Bad Request or a 403 just fails again, more slowly.\n• The retries outlast the caller's own timeout, so the work continues after nobody is waiting for it.\n\nExample: POST /payments/charge. Never retry it blindly. Send an idempotency key so the provider can recognise the repeat, or first ask "did charge X go through?" before trying again. Elsewhere: retry only at one layer, cap the attempts, back off with jitter, and use a retry budget (for example, retries may add at most 10% to the traffic).`,
        },
    },
    'sd2-t4': {
        explain: {
            answer: `Layer 4: the load balancer looks only at the network level, the IP addresses and ports, and forwards whole connections without reading what is inside them. It is very fast and works for any protocol, but it can't route by URL or user.\n\nLayer 7: the load balancer reads the HTTP request itself, its path, headers and cookies, so it can send /api to API servers and /images to an image service, and handle TLS. It is smarter, but does more work per request, and it must decrypt the traffic to read it.`,
        },
        draw: {
            answer: `The load balancer calls each server's /health endpoint every few seconds. Server 3 failed several checks in a row, so it gets no traffic until it passes again; requests are shared between servers 1 and 2. A good health check also tests what the server needs (can it reach its database?), not just that the process is running.`,
            code: py`
                            Clients
                               │
                         Load balancer
                  ┌────────────┼ ─ ─ ─ ─ ─ ─ ┐
                  │            │             ╎ no traffic
                  ▼            ▼             ▼
              Server 1     Server 2      Server 3
              /health ✓    /health ✓     /health ✗ ✗ ✗
              requests     requests      (back in when
              1, 3, 5…     2, 4, 6…       it passes again)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Identical short API calls: round robin. Every request costs about the same, so taking turns spreads the work evenly, and it is the simplest algorithm. (Least connections works too.)\n• Long video uploads: least connections. An upload can last seconds or an hour, so "the same number of requests" is not "the same amount of work". Round robin could stack several long uploads on one server while another sits idle; least connections sends each new upload to the server with the fewest open ones.\n• A cache cluster: consistent hashing on the cache key. The same key must always reach the same node, or every request misses (the data is in another node's memory). Consistent hashing also means that adding or removing a node only moves about 1 in n keys, instead of reshuffling almost all of them.`,
        },
        tradeoffs: {
            answer: `Sticky sessions pin each user to the server that served them first. That causes problems:\n\n• Scaling out doesn't help straight away: new servers only get new users, while the existing users stay on the overloaded old servers.\n• Uneven load: a few heavy users stuck on one server can overload it while others idle, and the balancer isn't allowed to move them.\n• A server dies: everything stored in its memory for its users is lost. They are logged out, lose their basket or their half-filled form.\n• Deploys and scaling in are slow: you have to wait for sessions to drain before you can remove a server.\n\nThe fix is to make servers stateless: keep sessions in a shared store like Redis (or in a signed token on the client), so any server can serve any request and the balancer is free to spread the load.`,
        },
    },
    'sd2-t5': {
        explain: {
            answer: `Cache-aside, for "get product 42":\n1. Ask the cache for the key product:42.\n2. Hit: it is there; return it (under a millisecond).\n3. Miss: read the database (5 to 20 ms), return the result, and save a copy in the cache with a TTL, say 5 minutes.\n4. When product 42 changes, write the database, then delete product:42 from the cache, so the next read fetches the fresh value.\n\nInvalidation, with books on your desk: you keep the books you use every day on your desk instead of walking to the library. But if the library gets a new edition, the copy on your desk is now out of date, and it won't update itself. Invalidation is the rule for when you take the old copy off your desk: when you hear the library changed it (delete on write), or after a set time anyway (the TTL), in case you missed the news.`,
        },
        draw: {
            answer: `Reads go to the cache first and only reach the database on a miss. Writes go to the database (the source of truth) and then delete the cache key, rather than updating it: that avoids two writers racing and leaving an old value behind. The TTL is the safety net if a delete is ever missed.`,
            code: py`
                READ, cache hit
                  App ──get product:42──► Cache ── found ──► App   (<1 ms)

                READ, cache miss
                  App ──get product:42──► Cache ── nothing
                  App ──SELECT … id = 42──► Database ──► App  (5–20 ms)
                  App ──set product:42, TTL 300 s──► Cache

                WRITE
                  App ──UPDATE products … id = 42──► Database
                  App ──delete product:42──► Cache
                  (the next read misses and loads the new value)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The dict finds a key's node in O(1). The doubly linked list keeps the nodes in order of use, most recent at the front; with links in both directions, a node can be unlinked from the middle in O(1). Two dummy "sentinel" nodes at the ends mean there is never an empty-list special case.\n\nget moves the node to the front. put either updates and moves an existing node, or adds a new one at the front, first removing the node at the back (the least recently used) if the cache is full.`,
            code: py`
                class Node:
                    def __init__(self, key=None, value=None):
                        self.key, self.value = key, value
                        self.prev = self.next = None


                class LRUCache:
                    def __init__(self, capacity):
                        self.capacity = capacity
                        self.nodes = {}                          # key -> node
                        self.head, self.tail = Node(), Node()    # sentinels: head.next is the most recent
                        self.head.next, self.tail.prev = self.tail, self.head

                    def _unlink(self, node):
                        node.prev.next, node.next.prev = node.next, node.prev

                    def _push_front(self, node):
                        node.prev, node.next = self.head, self.head.next
                        self.head.next.prev = node
                        self.head.next = node

                    def get(self, key):
                        node = self.nodes.get(key)
                        if node is None:
                            return None
                        self._unlink(node)
                        self._push_front(node)                   # now the most recently used
                        return node.value

                    def put(self, key, value):
                        if key in self.nodes:
                            node = self.nodes[key]
                            node.value = value
                            self._unlink(node)
                            self._push_front(node)
                            return
                        if len(self.nodes) == self.capacity:
                            oldest = self.tail.prev              # least recently used
                            self._unlink(oldest)
                            del self.nodes[oldest.key]
                        node = Node(key, value)
                        self.nodes[key] = node
                        self._push_front(node)


                cache = LRUCache(2)
                cache.put("a", 1)
                cache.put("b", 2)
                print(cache.get("a"))      # 1     a is now the most recent
                cache.put("c", 3)          # full: evicts b, the least recently used
                print(cache.get("b"))      # None
                print(cache.get("c"))      # 3
                cache.put("a", 10)         # update: a moves to the front
                cache.put("d", 4)          # evicts c
                print(cache.get("c"), cache.get("a"), cache.get("d"))   # None 10 4
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Write-through: every write goes to the cache and the database together, and is confirmed only when both have it.\n• Risks: slower writes (two stores per write), and filling the cache with data nobody reads. If the two writes aren't atomic, a failure between them can leave them disagreeing.\n• Use it when reads must be fresh straight after a write and writes are fairly rare: user profiles, product details, settings.\n\nWrite-back (write-behind): writes go to the cache only, and are saved to the database later, in batches.\n• Risks: losing data. If the cache crashes before it flushes, those writes are gone. The database is also behind, so anything reading it directly sees old data.\n• Use it when writes are very frequent and losing a few is acceptable: view counters, likes, game scores, metrics. You trade some durability for very fast writes and far fewer database writes.\n\nMoney, orders and anything you can't lose should never be write-back.`,
        },
    },
    'sd2-t6': {
        explain: {
            answer: `Two branches of a bank share every account, and the phone line between them is cut (a network partition). A customer asks the London branch to withdraw £80 from an account holding £100. London can't check with Paris. It has two choices:\n\n• Consistency (CP): refuse, or wait, until the line is back. Every answer it gives is correct, but some customers are turned away.\n• Availability (AP): pay out and note it down, and sort things out with Paris later. Everyone is served, but Paris still thinks the balance is £100, so the account could be overdrawn twice over.\n\nWhy "CA" isn't a real choice: CA would mean "consistent and available, as long as there are no partitions". But once data lives on more than one machine, the network between them will fail sometimes; you can't choose to have no partitions. So the real question is only what you do when one happens: refuse (C) or answer (A). A single machine is "CA" only because it has nothing to be partitioned from.`,
        },
        draw: {
            answer: `The partition is the same in both pictures; the only difference is whether the replica that can't reach the other one keeps accepting writes.`,
            code: py`
                Replica A  ══ ✗ partition ✗ ══  Replica B
                (London)                        (Paris)
                balance £100                    balance £100

                Write: "withdraw £80" arrives at A

                CP system
                  A can't confirm with B
                  → refuses (or waits): error to the user
                  → both still say £100: correct, not available

                AP system
                  A accepts → A says £20, B still says £100
                  → the user gets an answer: available
                  → copies disagree until the partition heals,
                    then they must be reconciled
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Bank balance: strong. A stale balance lets someone spend the same money twice.\n• Instagram likes: eventual. Seeing 1,203 instead of 1,205 for a second harms nobody, and the counter must stay up under huge load.\n• Cinema seat booking: strong. Two people must never both get seat F12; the booking must be checked against the latest state (a transaction, or a conditional write).\n• Profile picture: eventual, with one exception: the person who changed it should see their own change straight away (read-your-own-writes). Everyone else can catch up in a few seconds.\n• Stock level at checkout: strong at the moment of buying (decrement only if stock > 0, atomically), so you never sell the last item twice. The "only 3 left" shown while browsing can be eventual.`,
        },
        tradeoffs: {
            answer: `With N = 3 copies, both settings satisfy W + R > N (3 + 1 = 4, 2 + 2 = 4), so every read overlaps the latest write. What differs is speed and what survives a failure.\n\nW = 3, R = 1:\n• Reads are as fast as possible: any one copy will do.\n• Writes are slow (they wait for the slowest copy) and fail if any one of the three copies is down.\n• It favours read-heavy data that is rarely written, where losing write availability briefly is acceptable.\n\nW = 2, R = 2:\n• Both reads and writes wait for two copies: balanced latency.\n• Both keep working with one copy down.\n• It favours availability, and workloads with a fair mix of reads and writes. This is the common default (a "quorum" of 2 out of 3).\n\n(Going further, W = 1, R = 1 is fastest of all, but 1 + 1 is not more than 3, so reads can be stale: eventual consistency.)`,
        },
    },
    'sd2-t7': {
        explain: {
            answer: `The nightclub bouncer has a bowl of wristbands, and you need one to get in. The bowl holds at most 20, and a helper drops in 10 new ones every second.\n\n• A group of 15 arrives at once: there are wristbands in the bowl, so they all go in. Short bursts are fine, up to the size of the bowl.\n• A crowd keeps arriving faster than 10 a second: the bowl empties, and people are turned away until new wristbands drop in (HTTP 429, "come back in a second").\n• Over time, nobody gets in faster than 10 a second on average: the refill rate.\n\nThat is the token bucket: capacity = the most you allow in a burst; refill rate = the steady limit. Each request spends one token.`,
        },
        draw: {
            answer: `The limit is checked once, at the gateway, before any work is done. The counters live in Redis, not in each gateway's memory, so the limit holds no matter which gateway a request lands on. Inside, a bounded queue in front of each service gives backpressure: when it is full, new work is refused instead of piling up.`,
            code: py`
                Clients
                  │
                  ▼
                Load balancer
                  ├────────────┬────────────┐
                  ▼            ▼            ▼
                Gateway 1   Gateway 2   Gateway 3
                  │  1. take a token for this
                  │     API key (atomic, shared)
                  ├───────────────────────► Redis
                  │  ◄── allowed / empty ──┘ (one bucket
                  │                           per key)
                  ├─ empty   → 429, Retry-After: 1
                  └─ allowed → service (via a bounded queue)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Both limiters allow 10 requests a second, and both use a fake clock so the result is the same every run.\n\nA burst of 50 requests in half a second: the fixed window lets the first 10 through and blocks the rest of that second. The token bucket lets 14 through: its 10 stored tokens at once, then about one more every 100 ms as tokens refill.\n\nThe real difference is at a window edge. 20 requests between 0.9 s and 1.1 s: the fixed window allows all 20 (10 at the end of the first second, 10 at the start of the next), double the limit in 0.2 seconds. The token bucket allows only 11, because tokens don't reset at a boundary; they only refill at the steady rate.`,
            code: py`
                class FixedWindow:
                    def __init__(self, limit, window, clock):
                        self.limit, self.window, self.clock = limit, window, clock
                        self.current, self.count = None, 0

                    def allow(self):
                        window = int(self.clock() // self.window)
                        if window != self.current:                  # a new window: reset
                            self.current, self.count = window, 0
                        if self.count < self.limit:
                            self.count += 1
                            return True
                        return False


                class TokenBucket:
                    def __init__(self, capacity, refill_per_sec, clock):
                        self.capacity, self.rate, self.clock = capacity, refill_per_sec, clock
                        self.tokens, self.last = capacity, clock()

                    def allow(self):
                        now = self.clock()
                        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
                        self.last = now
                        if self.tokens >= 1:
                            self.tokens -= 1
                            return True
                        return False


                def run(times):
                    now = [0.0]
                    clock = lambda: now[0]
                    fixed = FixedWindow(limit=10, window=1.0, clock=clock)
                    bucket = TokenBucket(capacity=10, refill_per_sec=10, clock=clock)
                    fixed_ok = bucket_ok = 0
                    for t in times:
                        now[0] = t
                        fixed_ok += fixed.allow()
                        bucket_ok += bucket.allow()
                    return fixed_ok, bucket_ok


                burst = [i * 0.01 for i in range(50)]              # 50 requests in 0.5 s
                edge = [0.9 + i * 0.01 for i in range(20)]         # 20 requests from 0.9 s to 1.1 s
                print("burst of 50:", run(burst))                  # (10, 14): fixed window, token bucket
                print("20 across the 1 s edge:", run(edge))       # (20, 11)
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Login endpoint: don't fail fully open. The limit there is a security control: it is what slows down password guessing and credential stuffing, and attackers look for exactly this kind of gap. Fall back to a strict limit kept in each gateway's own memory (for example, 5 attempts a minute per IP and per account, per server). That is weaker than the shared limit, but far from no limit. If even that isn't possible, fail closed: a short login outage is visible and recoverable; a successful mass account takeover is not.\n\nPublic search API: fail open, with a generous local limit as a backup. Here the limit protects capacity, not secrets. The worst case of failing open is extra load, which autoscaling and load shedding can absorb, while failing closed would turn a Redis problem into an outage for every user.\n\nThe principle: decide per endpoint, by asking which is worse, abuse getting through or real users being blocked.`,
        },
    },
    'sd2-t8': {
        explain: {
            answer: `Picture a restaurant's order rail. The waiter writes the order, clips it on the rail and goes straight back to the customers: the waiter doesn't stand in the kitchen while the food cooks. The cooks take orders off the rail when they are ready.\n\nAn API works the same way. Without a queue, the request does everything before replying (save the video, encode it, email the user), and the user waits the whole time. With a queue, the API does only the essential part (save the file, put "encode video 42" on the queue) and replies at once: "202 Accepted, processing". Workers do the slow part in the background.\n\nThe API is faster because the user waits only for the fast part. It is also steadier: a rush of orders just makes the rail longer, instead of overwhelming the kitchen.`,
        },
        draw: {
            answer: `The producer only writes to the queue and replies; it never waits for the workers. A worker deletes a message only after the work is safely in the database (it acknowledges it). A message that keeps failing is moved aside to the dead-letter queue, so it can't block or crash the workers forever.`,
            code: py`
                Producer (API)
                  │ 1. put message
                  ▼
                Queue ═══════════════════════════
                  │ 2. each worker pulls one job
                  ├──────────┬──────────┐
                  ▼          ▼          ▼
                Worker     Worker     Worker
                  │ 3. do the work, save the result
                  ▼
                Database
                  4. acknowledge → message deleted

                failed 5 times? ──► Dead-letter queue
                                    (a person looks at it)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Python's queue.Queue forgets a message as soon as get() returns, so the code wraps it in a queue that, like SQS, only deletes a message when the worker acknowledges it. Unacknowledged messages come back (what a visibility timeout does).\n\nThe first worker sends emails 1, 2 and 3, but crashes after sending email 3 and before acknowledging it. The queue can't tell "crashed before doing the work" from "crashed after", so it delivers message 3 again, and the second worker sends user 3 a second email. That is at-least-once delivery.\n\nThe fix is an idempotent consumer: remember which message IDs have been handled, and skip repeats. In a real system that record must be saved in the same transaction as the work's effect (or passed to the email provider as an idempotency key); otherwise a crash between "send" and "remember" still sends twice.`,
            code: py`
                import queue
                import threading


                class AtLeastOnceQueue:
                    """A message is deleted only when a worker acknowledges it."""

                    def __init__(self):
                        self.ready = queue.Queue()
                        self.in_flight = {}                      # message id -> message
                        self.lock = threading.Lock()

                    def put(self, message):
                        self.ready.put(message)

                    def get(self):
                        message = self.ready.get_nowait()        # raises queue.Empty when done
                        with self.lock:
                            self.in_flight[message["id"]] = message
                        return message

                    def ack(self, message_id):
                        with self.lock:
                            del self.in_flight[message_id]

                    def redeliver_unacked(self):                 # what a visibility timeout does
                        with self.lock:
                            for message in self.in_flight.values():
                                self.ready.put(message)
                            self.in_flight.clear()


                def worker(q, handle, crash_on=None):
                    while True:
                        try:
                            message = q.get()
                        except queue.Empty:
                            return
                        handle(message)                          # the work is done...
                        if message["id"] == crash_on:
                            return                               # ...but the worker dies before it acks
                        q.ack(message["id"])


                def run(handle):
                    q = AtLeastOnceQueue()
                    for i in range(1, 6):
                        q.put({"id": i, "to": f"user{i}@mail.com"})
                    first = threading.Thread(target=worker, args=(q, handle), kwargs={"crash_on": 3})
                    first.start(); first.join()                  # handles 1, 2, 3, then crashes
                    q.redeliver_unacked()                        # 3 was never acked, so it comes back
                    second = threading.Thread(target=worker, args=(q, handle))
                    second.start(); second.join()


                sent = []
                run(lambda message: sent.append(message["id"]))
                print(sent)                                      # [1, 2, 3, 4, 5, 3]: user 3 got two emails

                sent, handled = [], set()

                def send_once(message):                          # idempotent consumer
                    if message["id"] in handled:
                        return
                    sent.append(message["id"])
                    handled.add(message["id"])

                run(send_once)
                print(sent)                                      # [1, 2, 3, 4, 5]
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Keep something synchronous when the user can't continue without the result, or when the next step depends on it:\n\n• Payment authorisation at checkout: the user must know "approved" or "declined" before seeing the confirmation page. You can't say "order placed!" and decline the card later.\n• Logging in: you can't show the account until the password has been checked.\n• Booking a seat: "is F12 still free?" must be answered before you take the money.\n• Validating input: tell the user their form is wrong now, not by email in five minutes.\n• Reading data: "show my order history" is a read; there is nothing to defer.\n\nAsync also costs something: more moving parts, harder debugging, and the user sees "processing" instead of a result. So use a queue for slow or non-essential work after the critical step (sending the receipt, updating analytics, encoding the video), not for the critical step itself.`,
        },
    },
    'sd2-t9': {
        explain: {
            answer: `• Metrics are the car's dashboard: a few numbers, updated all the time (speed, fuel, engine temperature). For a service: requests per second, error rate, latency percentiles. You glance at them to see if anything is wrong, and warning lights (alerts) go on when a number crosses a line.\n• Logs are the car's service history: a detailed record of individual events ("12:03: brake pads replaced"). For a service: "order 77 failed: card declined". You read them when you investigate a particular problem.\n• A trace is a GPS replay of one journey: exactly where you went and how long each part took. For a request: it entered the gateway, spent 40 ms in orders, then 1.6 s in payments. It shows where the time went.\n\nWhere the picture breaks: a car is one machine. One request can cross twenty services, so each one must pass on a shared trace ID, or you can't join the pieces together.`,
        },
        draw: {
            answer: `The first service that sees the request creates the trace ID and passes it on in a header (traceparent, in OpenTelemetry) on every call it makes. Every service records its own span (start, duration) under that ID and adds the ID to every log line, so one search finds the whole journey.`,
            code: py`
                Client
                  │ GET /checkout
                  ▼
                Gateway ── creates trace ID abc123
                  │ header traceparent: abc123
                  ▼                           span: gateway, 12 ms
                Order service
                  │ header traceparent: abc123
                  ▼                           span: orders, 40 ms
                Payment service               span: payments, 1,600 ms ⚠

                Every log line: {"trace_id": "abc123", ...}
                All spans → tracing backend → one timeline
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Four metrics (per endpoint, every few seconds):\n1. Traffic: requests per second, split by endpoint and status code.\n2. Errors: the share of requests ending in a 5xx (the payment service's fault), kept separate from card declines (normal business results, not errors).\n3. Latency: p50, p95 and p99 of request time, plus the latency of calls to the card network or payment provider.\n4. Saturation: how full the database connection pool and the worker queue are.\n\nTwo alerts (each pages someone, and links to a runbook):\n1. Error rate: 5xx above 1% of requests for 5 minutes in a row. Payments failing is the most important symptom.\n2. Latency: p99 above 2 seconds for 10 minutes. Users abandon slow checkouts, and slow payments often mean a provider problem.\n\nA useful third, as a warning rather than a page: the authorisation success rate falls more than 10% below its normal level for this time of day, which can mean a provider or fraud-rule problem even when nothing is erroring.`,
        },
        tradeoffs: {
            answer: `What it costs:\n• Money and storage: debug logging can easily write 20 lines per request. At 10,000 requests a second and 500 bytes a line, that is 100 MB a second, about 8.6 TB a day, all paid for in ingestion, indexing and storage.\n• Speed: writing and shipping all that uses CPU, disk and network on every server, and adds latency.\n• Noise: the important lines are buried, so investigations get slower, not faster.\n• Risk: debug logs tend to include request bodies, so tokens, card numbers and personal data end up in a system with weaker controls.\n\nInstead:\n• Log at INFO by default, as structured JSON with the trace ID, and only for meaningful events.\n• Log every error, but sample the successes (say 1%).\n• Make the log level changeable at runtime, for one service or even one user, so you can turn on debug only while investigating.\n• Use metrics for counting and traces (with sampling that keeps the slow and failed ones) for timing, instead of logging both.\n• Mask sensitive fields before they are written.`,
            code: py`
                requests_per_s, lines, bytes_per_line = 10_000, 20, 500
                mb_per_s = requests_per_s * lines * bytes_per_line / 1e6
                tb_per_day = mb_per_s * 86_400 / 1e6
                print(mb_per_s, round(tb_per_day, 2))          # 100.0 8.64
            `,
            codeLanguage: 'python',
        },
    },
};
