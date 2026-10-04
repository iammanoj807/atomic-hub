# System design: from the basics to interview-ready

High-level design (HLD), low-level design (LLD) and AI/ML system design, in 10 phases and 71 topics.

These notes are written to be enough on their own. For every topic you get: a definition, the problem it solves, how it works step by step, an analogy (and where it breaks), an example, the must-know points, common mistakes, an interview answer, follow-up questions with answers, and practice exercises. The free resources at the end of each topic are optional extras. Nothing here needs a paid course or book.

**Short on time?** Read only the topics marked **Must know**: the definition, the must-know points (or the design steps), the common mistakes, the interview answer and the follow-ups.

## How to study

1. Start with Phase 0: the step-by-step answer frameworks for high-level and low-level design.
2. HLD track: Phases 1 → 2 → 3 → 4, then practise with Phase 8.
3. LLD track: Phases 5 → 6, then practise with Phase 7. You can run it alongside the HLD track.
4. AI/ML track: Phase 9, once the core concepts feel solid.
5. Graduate and junior interviews focus on the Must know topics. Learn those first; come back for the rest.

**The four checks:** Explain (in plain words, no notes) · Draw (the diagram from memory) · Apply (in a real design question) · Trade-offs (cost, when not to use it, the alternative). A topic is finished only when you pass all four.

## Contents

- [Phase 0: How system design interviews work](#phase-0-how-system-design-interviews-work)
- [Phase 1: Networking and APIs](#phase-1-networking-and-apis)
- [Phase 2: Core concepts: scale, reliability and speed](#phase-2-core-concepts-scale-reliability-and-speed)
- [Phase 3: Data: databases, storage and scaling data](#phase-3-data-databases-storage-and-scaling-data)
- [Phase 4: Distributed systems and security](#phase-4-distributed-systems-and-security)
- [Phase 5: Low-level design: OOP and SOLID](#phase-5-low-level-design-oop-and-solid)
- [Phase 6: Design patterns](#phase-6-design-patterns)
- [Phase 7: Low-level design questions](#phase-7-low-level-design-questions)
- [Phase 8: High-level design questions](#phase-8-high-level-design-questions)
- [Phase 9: AI and ML system design](#phase-9-ai-and-ml-system-design)

---

## Phase 0: How system design interviews work

Learn the step-by-step way to answer any design question before you learn the parts. Without a method, even good knowledge comes out messy under pressure.

> **The big picture.** Interviewers grade how you think: do you ask the right questions, size the problem, start simple and then improve the weak spots? A clear method shows all of that, even when you don't know every technology.

### 0.1 The high-level design interview: a step-by-step answer framework

*Must know*

**Definition.** A repeatable order of steps for answering any 'Design X' question in about 45 minutes.

**The problem it solves.** Under pressure, most people either freeze or start drawing boxes before they understand the question. Both lose marks. A fixed method gives you something to do in every minute, and shows the interviewer how you think.

**The idea.** Interviewers judge how you think, not whether you reach one 'right' design. A framework stops you jumping straight to boxes and arrows. The usual order: clarify requirements, estimate the scale, define the API, sketch the data model, draw a simple design that works, then go deep on the hardest parts and discuss trade-offs.

**How it works, step by step**

1. Requirements: ask who uses the system and what the 3–4 core features are. For a URL shortener: 'Do we need custom aliases? Expiry? Click analytics?' Then the non-functional side: 'How many users? Is a slightly stale read acceptable?' Write the answers in a corner of the board.
2. Estimates: turn the numbers into requests per second and storage. Say each assumption out loud, for example 'I'll assume 100 reads for every write'.
3. API: write 2–4 endpoints with their inputs and outputs. This fixes exactly what the system must do.
4. Data model: list the main tables or objects and their keys. Ask yourself: what is the main query, and which key does it use?
5. High-level design: draw client → load balancer → service → database, and walk one request through it. Make it work before you make it big.
6. Deep dives: find the bottleneck from your estimates (reads, writes or storage) and fix it with caching, replicas, sharding or queues. Explain each choice and what it costs.
7. Wrap-up: summarise the design in three sentences, name its weak spots, and say what you would monitor.

**Analogy.** An architect meeting a client. They ask how many people will live in the house and what it is for before they draw anything.

**Where the analogy breaks.** A client answers once. In an interview you keep checking in ('does this match what you had in mind?'), and the interviewer may change the requirements halfway on purpose to see how you adapt.

**Example.** For 'Design a URL shortener': 3 minutes on requirements (shorten, redirect, custom alias? expiry?), 3 on estimates (100 million new links a month), 3 on the API (POST /urls, GET /{code}), then the simple design, then a deep dive on generating unique short codes.

**Must-know points**

- 1. Requirements (about 5 min): functional (what it does) and non-functional (scale, latency, availability, consistency). Write them down.
- 2. Estimates (about 3 min): users, requests per second, storage, bandwidth. Only as much as changes a decision.
- 3. API (about 3 min): the main endpoints with inputs and outputs.
- 4. Data model (about 3 min): the main entities, and which kind of database fits.
- 5. High-level design (about 10 min): the simplest design that works end to end.
- 6. Deep dives (10–15 min): fix the bottlenecks — caching, sharding, queues, failure handling.
- 7. Wrap-up: the trade-offs you made, what you'd do with more time, how you'd monitor it.

**Common mistakes**

- Designing before asking a single question.
- Adding Kafka, microservices and sharding to a system that gets 10 requests a second.
- Long silences. The interviewer can only give credit for what you say.
- Never stating trade-offs. Every choice has a cost, and naming it is what earns the strongest marks.

**Trade-offs**

- Don't over-design early: start simple, then scale only the parts the numbers say need it.
- Think out loud. If you are silent, the interviewer can't give you credit for good reasoning.

**Your interview answer** (say it out loud)

> Before I design anything, I'd like to clarify the requirements and the scale. Then I'll propose a simple design that works end to end, and we can go deep on the parts you care about most, discussing the trade-offs as we go.

**Follow-up questions**

- **Q: What if they mention a technology you don't know?** Say so honestly, then reason from first principles: describe what the component must do (for example, 'a durable queue that keeps order per user') and the properties you need.
- **Q: How detailed should the estimates be?** Rough powers of ten are enough. The point is to decide things like 'one database is enough' or 'we need sharding', not to get exact numbers.

**Practise** (no answers here, on purpose)

1. **Explain:** Say the 7 steps from memory, with the rough minutes for each.
2. **Draw:** Draw the framework as a timeline for a 45-minute interview.
3. **Apply:** Run the framework out loud for 'Design a to-do list app' in 15 minutes. Record yourself and listen back.
4. **Trade-offs:** Name two common mistakes candidates make (for example, going deep too early) and how the framework prevents each one.

**Free resources (optional)**

- *Watch:* [ByteByteGo: system design interview step by step](https://www.youtube.com/results?search_query=ByteByteGo+system+design+interview+step+by+step) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: system design delivery framework](https://www.google.com/search?q=Hello+Interview+system+design+delivery+framework) (hellointerview.com · free guides)
- *Read:* [Hello Interview: a framework for system design interviews](https://www.google.com/search?q=Hello+Interview+a+framework+for+system+design+interviews) (hellointerview.com · free guides)

[Back to contents](#contents)

### 0.2 Back-of-the-envelope estimation

*Must know*

**Definition.** Quick, rough maths to estimate traffic, storage and bandwidth, so your design decisions are based on scale.

**The problem it solves.** Without numbers you can't tell whether one server is enough or you need a hundred. Estimation turns a vague 'big app' into numbers that decide the design.

**The idea.** You turn the number of users into requests per second (QPS), storage per day and per year, and bandwidth. Rough is fine. A day has 86,400 seconds, about 100,000, so 1 million requests a day is about 12 per second. Peak traffic is often 2–5 times the average.

**How it works, step by step**

1. Start from users: daily active users × actions per user per day = actions per day.
2. Divide by about 100,000 (the seconds in a day, rounded) to get the average per second, then multiply by 2–5 for the peak.
3. Split reads and writes. Example: 10 million users each read 20 pages and post 1 item a day → 200 million reads (about 2,000 a second) and 10 million writes (about 100 a second).
4. Storage: writes per day × size of each item × days kept. 10 million posts × 1 KB = 10 GB a day, about 3.6 TB a year, or about 11 TB with 3 copies.
5. Bandwidth: requests per second × response size. 2,000 reads a second × 100 KB = 200 MB a second going out.
6. Then decide: is that one database or many? Does the hot data fit in a cache's memory? Do we need a CDN?

**Analogy.** Working out how much food to buy for a party: number of guests × how much each person eats, plus extra for the hungry ones (the peak).

**Where the analogy breaks.** Party guests are a fixed number. Real traffic has spikes, like a viral post or a sale, that can be 10 times normal or more, so you design for the peak, not the average.

**Example.** A Twitter-like app: 300 million daily users, each posting 2 tweets a day, gives 600 million tweets a day, about 7,000 writes per second on average and maybe 15,000–20,000 at peak. At about 300 bytes each, that's 180 GB of text a day, or about 65 TB a year before media and replication.

**Must-know points**

- Use powers of ten for speed: KB ≈ 10³ bytes, MB ≈ 10⁶, GB ≈ 10⁹, TB ≈ 10¹², PB ≈ 10¹⁵.
- Seconds per day ≈ 10⁵. Requests per day ÷ 10⁵ ≈ requests per second.
- Read-to-write ratio matters: many apps read 10–100 times more than they write, which points to caching and read replicas.
- Latency ladder: memory read ≈ 100 ns; SSD read ≈ 100 µs; round trip inside a datacentre ≈ 0.5 ms; across a continent and back ≈ 100–150 ms.
- Storage = items per day × size × days kept × copies (often 3 for replication).
- Rough capacity: one app server handles thousands of simple requests per second; one SQL database handles thousands to tens of thousands of simple queries per second.

**Common mistakes**

- Spending 10 minutes on exact arithmetic. Round hard: 86,400 ≈ 100,000.
- Using the average and forgetting the peak.
- Mixing up bits and bytes: network speeds are in bits, so 1 Gbps ≈ 125 MB a second.
- Working out numbers and then never using them to make a decision.

**Your interview answer** (say it out loud)

> I'll estimate the scale first, because it decides the design. For example, 100 million requests a day is only about 1,200 per second on average, maybe 5,000 at peak. A few load-balanced app servers and one database with read replicas can handle that. If it were 100 times more, I'd plan for sharding and heavy caching.

**Follow-up questions**

- **Q: Why multiply by a replication factor?** Data is usually stored about 3 times for durability and availability, so real disk use is roughly 3 times the raw data.
- **Q: What if your estimate is wrong?** That's fine. State your assumptions clearly; the interviewer cares that the design changes sensibly when the numbers change.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain why 1 million requests a day is only about 12 requests per second.
2. **Draw:** Write the latency ladder (memory, SSD, datacentre round trip, cross-continent round trip) from memory, with rough numbers.
3. **Apply:** Estimate QPS, storage per year and bandwidth for a photo app with 50 million daily users, each uploading one 2 MB photo a day and viewing 50.
4. **Trade-offs:** When is detailed estimation a waste of interview time, and when does a number change your design?

**Free resources (optional)**

- *Read:* [Hello Interview: back-of-the-envelope estimation](https://www.google.com/search?q=Hello+Interview+back-of-the-envelope+estimation) (hellointerview.com · free guides)
- *Read:* [Latency numbers every programmer should know](https://www.google.com/search?q=latency+numbers+every+programmer+should+know) (Jeff Dean / Peter Norvig)
- *Read:* [Hello Interview: numbers to know](https://www.google.com/search?q=Hello+Interview+numbers+to+know) (hellointerview.com · free guides)

[Back to contents](#contents)

### 0.3 The low-level design interview: a step-by-step approach

*Must know*

**Definition.** A repeatable way to answer 'Design the classes for X' (a parking lot, an elevator, Splitwise) and write the key code.

**The problem it solves.** LLD questions are open-ended: 'design a parking lot' could mean almost anything. Without a method you write random classes, or code that breaks the moment the interviewer adds a requirement.

**The idea.** Low-level design (LLD) tests object-oriented design: clear classes, good relationships, sensible patterns, and code that is easy to extend. Clarify the scope, list the entities, draw a class diagram, pick patterns where things vary, code the main flows, then discuss concurrency and how you'd add new features.

**How it works, step by step**

1. Clarify: write 4–6 use cases as short sentences ('a car enters', 'the system assigns a spot', 'the driver pays on exit'). Agree what's out of scope.
2. Find the entities: underline the nouns in the use cases (car, spot, ticket, payment). They're your candidate classes. The verbs (assign, pay) become methods.
3. Draw the class diagram: fields, key methods and relationships. For each relationship ask: is it 'is-a' (inheritance) or 'has-a' (composition)?
4. Spot what varies: pricing rules, vehicle types, payment methods. Put each behind an interface (Strategy, Factory or State).
5. Code the main flow, such as park() and leave(), with clear names, and show how the classes call each other.
6. Stress-test it: two cars at two gates at the same moment (concurrency), a lost ticket (an edge case), and 'now add electric charging' (an extension). Say what changes.

**Analogy.** Planning a kitchen before building it: decide which stations you need (classes), who passes what to whom (relationships), and only then build the cupboards (code).

**Where the analogy breaks.** A kitchen is built once. A software design keeps changing, so interviewers will add a new requirement ('now add electric-car charging') to see if your design bends instead of breaks.

**Example.** Parking lot: clarify (floors? vehicle types? payment?), list entities (ParkingLot, Floor, Spot, Vehicle, Ticket, Payment), draw relationships, use Strategy for pricing and spot assignment, code park() and leave(), then explain how two gates avoid giving out the same spot.

**Must-know points**

- 1. Clarify requirements and scope: the main use cases, what's out of scope.
- 2. Identify entities (nouns) and actions (verbs) from the use cases.
- 3. Draw a class diagram: fields, methods, relationships (composition, inheritance, interfaces).
- 4. Apply patterns where behaviour varies: Strategy, State, Factory, Observer.
- 5. Code the core flows with clean names; skip trivial getters.
- 6. Discuss concurrency (two users at once), edge cases and extensibility.
- Use SOLID to justify your choices out loud.

**Common mistakes**

- One giant class (a 'god class') that does everything.
- Deep inheritance trees where composition would be simpler.
- Using patterns that don't fit, just to mention them.
- Ignoring concurrency when two users can act on the same thing.

**Your interview answer** (say it out loud)

> I'll confirm the use cases first, then pull the main entities out of them and sketch a class diagram. Where behaviour is likely to change, like pricing, I'll put it behind an interface. Then I'll code the core flow and finish with concurrency and how the design extends.

**Follow-up questions**

- **Q: Which language should I use?** The one you're strongest in. Python and Java are both fine; clean structure matters more than syntax.
- **Q: How much code is expected?** The main classes and the one or two core flows, written cleanly. Not every getter, setter or menu.

**Practise** (no answers here, on purpose)

1. **Explain:** Say the 6 steps from memory.
2. **Draw:** Draw the class diagram for a simple library system (books, members, loans) in 10 minutes.
3. **Apply:** Run the full approach out loud for 'Design a tic-tac-toe game' in 20 minutes, including code for making a move and checking for a winner.
4. **Trade-offs:** What are the risks of using many design patterns just to impress the interviewer?

**Free resources (optional)**

- *Read:* [Design patterns catalogue](https://refactoring.guru/design-patterns/catalog) (Refactoring.Guru, free)
- *Code:* [Awesome Low-Level Design (questions and solutions)](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

---

## Phase 1: Networking and APIs

Understand how a request travels from a phone or browser to your servers and back, and how to design the API it calls.

> **The big picture.** Every design starts at the edge: DNS finds your servers, a connection carries the request, a proxy or gateway receives it, and an API defines what can be asked. Getting these basics clear makes every later diagram easier to explain.

### 1.1 Client–server, DNS, and what happens when you type a URL

*Must know*

**Definition.** Clients (browsers, apps) send requests; servers process them and send responses. DNS turns a name like example.com into an IP address the client can connect to.

**The problem it solves.** Computers find each other by IP address, but people remember names. Between typing a name and seeing a page there are several steps, and each can be slow or fail. Knowing them lets you explain latency, failover and where caching helps.

**The idea.** When you type a URL, the browser asks DNS for the server's IP address (often from a cache), opens a TCP connection, does a TLS handshake for HTTPS, and sends an HTTP request. The request usually reaches a load balancer, which passes it to an application server. That server may read a cache or database, then sends the response back.

**How it works, step by step**

1. You type example.com. The browser checks its own DNS cache, then the operating system's.
2. On a miss, it asks a resolver, often run by your internet provider. The resolver asks a root server ('who handles .com?'), then a .com server ('who handles example.com?'), then example.com's own name server, which returns the IP address, say 203.0.113.10. Every answer is cached for its TTL.
3. The browser opens a TCP connection to that IP on port 443, with a three-step handshake (SYN, SYN-ACK, ACK).
4. TLS handshake: the server shows a certificate proving it really is example.com, and both sides agree on encryption keys.
5. The browser sends the request: 'GET /', with the header 'Host: example.com'. A load balancer receives it and passes it to one of many app servers.
6. The app server reads from a cache or database, builds the page and sends it back. The browser then requests the images, CSS and scripts, often from a CDN.

**Analogy.** Calling a shop. You look up the number in a phone book (DNS), dial (TCP connection), check you're really talking to that shop (TLS), then ask your question (HTTP request).

**Where the analogy breaks.** A phone book rarely changes. DNS answers are cached for a set time (the TTL), so when a server's IP changes, some users keep reaching the old address for minutes or hours. That matters when you fail over to a new server.

**Example.** Big sites use DNS to send users to their nearest datacentre (geo-DNS), and to move traffic away from a datacentre that is down.

**Must-know points**

- DNS lookup order: browser cache → operating system cache → resolver (for example your ISP) → root server → top-level domain (.com) → the domain's authoritative server.
- TCP gives reliable, ordered delivery. UDP is faster but packets can be lost; it suits video calls, games and DNS itself.
- TLS (the S in HTTPS) encrypts the connection and proves the server's identity with a certificate.
- Every new connection costs round trips, so clients reuse connections (keep-alive, HTTP/2).
- IP address = which machine; port = which program on it (443 for HTTPS).

**Common mistakes**

- Forgetting DNS caching when you plan a failover by changing DNS records.
- Mixing up TCP (the reliable connection) with HTTP (the request format that travels over it).
- Thinking HTTPS only encrypts. It also proves the server's identity.

**Trade-offs**

- Low DNS TTL: faster failover, but more DNS lookups. High TTL: fewer lookups, but slow to change.

**Your interview answer** (say it out loud)

> The browser resolves the domain through DNS, usually from a cache, to get an IP address. It opens a TCP connection and does a TLS handshake, then sends the HTTP request. The request typically hits a load balancer, which forwards it to an app server; the server reads from a cache or database and sends back the response.

**Follow-up questions**

- **Q: TCP or UDP for a live video call?** Usually UDP-based protocols. A late video packet is useless, so it's better to skip it than to wait for it to be resent.
- **Q: Why does HTTPS add latency?** The TLS handshake adds round trips before the first request. Reusing connections and TLS 1.3 reduce the cost.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain what happens when you type a URL and press Enter, in under a minute.
2. **Draw:** Draw the full path: browser, DNS resolver, load balancer, app server, database, and back.
3. **Apply:** Your site moves to a new IP address. Explain why some users still reach the old server for a while, and what you would set in advance.
4. **Trade-offs:** Compare TCP and UDP: what each gives up, and one system that should use each.

**Free resources (optional)**

- *Watch:* [ByteByteGo: what happens when you type a URL into your browser](https://www.youtube.com/results?search_query=ByteByteGo+what+happens+when+you+type+a+URL+into+your+browser) (ByteByteGo · YouTube)
- *Read:* [What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/) (Cloudflare Learning Center, free)
- *Read:* [An overview of HTTP](https://www.google.com/search?q=MDN+an+overview+of+HTTP) (MDN Web Docs, free)

[Back to contents](#contents)

### 1.2 HTTP and REST API design

*Must know*

**Definition.** HTTP is the request–response protocol of the web. REST is a style of API design built around resources (nouns) and standard methods (GET, POST, PUT, PATCH, DELETE).

**The problem it solves.** Clients and servers are often built by different teams, or even different companies. They need a clear, stable contract for asking and answering; otherwise every change breaks somebody.

**The idea.** A good API is predictable. Resources have clear URLs like /users/42/orders, methods mean what they say, and status codes tell the client what happened. Lists are paginated, the API is versioned, and requests that may be retried are made idempotent so a retry can't do the work twice.

**How it works, step by step**

1. Name resources as nouns: /users, /users/42, /users/42/orders. Avoid verbs in URLs, like /getUserOrders.
2. Choose the method by intent: GET to read, POST to create, PUT to replace, PATCH to change part, DELETE to remove.
3. Return a status code that tells the truth: 201 after creating, 400 for bad input, 404 when something is missing, 409 for a conflict, 429 when rate-limited, 500 when the server broke.
4. Paginate lists: return 20 items plus a cursor; the client sends the cursor back to get the next 20.
5. Make retries safe: the client sends an Idempotency-Key header with POST; the server stores the key with the result and returns the same result if the key comes again.
6. Version from day one: /v1/. When you must break something, add /v2/ and keep /v1/ running for old clients.

**Analogy.** A restaurant menu with clear sections. You ask for a dish by name (the resource), say what you want done (the method), and the waiter replies 'served', 'out of stock' or 'not on the menu' (the status code).

**Where the analogy breaks.** A waiter can improvise. An API is a contract: once apps depend on it, you can't change it freely, which is why versioning matters.

**Example.** GET /v1/orders?limit=20&cursor=abc returns 200 OK with 20 orders and a cursor for the next page. POST /v1/orders with an Idempotency-Key header returns 201 Created; retrying with the same key returns the same order instead of creating a second one.

**Must-know points**

- Methods: GET reads (safe), POST creates, PUT replaces, PATCH changes part, DELETE removes. GET, PUT and DELETE should be idempotent.
- Status codes: 2xx success (200, 201), 3xx redirect (301, 302), 4xx client error (400, 401, 403, 404, 409, 429), 5xx server error (500, 503).
- Pagination: offset (simple, but slow and unstable on big, changing lists) or cursor (fast and stable; preferred at scale).
- Idempotency key: the client sends a unique key so a retried request isn't processed twice. Essential for payments.
- Versioning: /v1/ in the path or a header, so old clients keep working.
- Alternatives: GraphQL (the client chooses the fields it wants) and gRPC (fast, typed calls between services).

**Common mistakes**

- Returning 200 OK with an error message hidden in the body.
- Using GET for actions that change data (crawlers and browser prefetching may call it).
- No pagination, so one request can return a million rows.
- Breaking changes without a new version.

**Trade-offs**

- REST: simple and cacheable, but may need several calls per screen.
- GraphQL: flexible queries, but harder caching and rate limiting.
- gRPC: fast and strongly typed, but less browser-friendly.

**Your interview answer** (say it out loud)

> I'd design the API around resources with standard methods and status codes, paginate lists with cursors, version it, and require an idempotency key on any create or payment endpoint so client retries are safe.

**Follow-up questions**

- **Q: 401 or 403?** 401 means not authenticated (we don't know who you are). 403 means authenticated but not allowed to do this.
- **Q: Why is cursor pagination better than offset?** Offset has to skip rows, which is slow for page 10,000, and pages shift when new rows arrive. A cursor continues from the last item seen, so it's fast and stable.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain idempotency, and why POST isn't idempotent by default.
2. **Draw:** Write the API for a small library app (list books, borrow a book, return a book) with methods, URLs and status codes.
3. **Apply:** Design the API for sending money between two bank accounts, including how a retried request is handled.
4. **Trade-offs:** When would you choose gRPC or GraphQL instead of REST?

**Free resources (optional)**

- *Read:* [Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency) (Stripe blog)
- *Read:* [HTTP response status codes](https://www.google.com/search?q=MDN+HTTP+response+status+codes) (MDN Web Docs, free)
- *Read:* [Hello Interview: API design](https://www.google.com/search?q=Hello+Interview+API+design) (hellointerview.com · free guides)

[Back to contents](#contents)

### 1.3 Real-time communication: polling, long polling, WebSockets, SSE

*Should know*

**Definition.** Ways for a server to get new data to a client quickly: the client keeps asking (polling), waits on an open request (long polling), keeps a two-way connection open (WebSockets), or receives a one-way stream (server-sent events, SSE).

**The problem it solves.** Normal HTTP lets the client ask but not the server tell. Chat, notifications, live prices and multiplayer games need updates pushed to the user within a fraction of a second.

**The idea.** Normal HTTP is 'the client asks, the server answers'. Chat, live scores and notifications need the server to push. Polling is simple but wasteful. Long polling holds a request open until there's news. WebSockets keep one connection open for messages in both directions. SSE is a simpler one-way stream from server to client.

**How it works, step by step**

1. Short polling: the client asks 'anything new?' every few seconds. Simple, but most answers are 'no'.
2. Long polling: the client asks, and the server holds the request open until there's news (or a timeout of about 30 seconds). The client immediately asks again.
3. WebSocket: starts as an HTTP request with an 'Upgrade' header. After that, the same connection stays open and either side can send a message at any time.
4. SSE: the client opens one HTTP request and the server keeps sending events down it; the browser reconnects automatically if it drops.
5. At scale: users connect to many gateway servers. When user A messages user B, the system looks up B's gateway in a registry (such as Redis) and forwards the message there.

**Analogy.** Polling is a child asking 'are we there yet?' every minute. Long polling is asking once, and the driver only answers when you arrive. A WebSocket is an open phone line both people can talk on.

**Where the analogy breaks.** An open phone line costs nothing to keep open. Each WebSocket holds memory and a connection on a server, so millions of users need many connection servers, and a way to find which server each user is connected to.

**Example.** WhatsApp-style chat: each user keeps a connection to a gateway server, and a lookup store records which gateway holds each user, so a message can be routed to the right one.

**Must-know points**

- Short polling: simple, but most responses are empty; high load, and a delay of up to one polling interval.
- Long polling: fewer empty responses; works everywhere; one request per message.
- WebSockets: two-way and low latency, but connections are stateful, which makes load balancing and scaling harder.
- SSE: one-way, server to client, over normal HTTP; reconnects automatically; good for feeds and notifications.
- Stateful connections need a 'who is connected where' registry, often in Redis.

**Common mistakes**

- Choosing WebSockets for one-way updates, where SSE is simpler.
- Forgetting that open connections make servers stateful: you need a connection registry and reconnect logic.
- No plan for messages missed while a client was disconnected.

**Your interview answer** (say it out loud)

> For chat I'd use WebSockets, because messages flow both ways with low latency. Users connect to a fleet of gateway servers, and Redis maps each user to their gateway so a message can be pushed to the right connection. For one-way updates like live scores, SSE is simpler.

**Follow-up questions**

- **Q: What happens when a WebSocket server crashes?** Clients reconnect (with backoff) to another server, re-register where they are, and fetch any missed messages using the last message ID they saw.
- **Q: Why not just poll every second?** With millions of users, that's millions of mostly empty requests every second: huge cost for little benefit.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain polling, long polling, WebSockets and SSE with the 'are we there yet?' picture.
2. **Draw:** Draw how a message travels from user A to user B when they are connected to different WebSocket servers.
3. **Apply:** Choose a method for: a stock price ticker, a chat app, a nightly report, and a delivery-tracking map. Justify each.
4. **Trade-offs:** What does it cost to hold 10 million open WebSocket connections, and how would you spread them across servers?

**Free resources (optional)**

- *Watch:* [ByteByteGo: polling vs long polling vs websockets vs SSE](https://www.youtube.com/results?search_query=ByteByteGo+polling+vs+long+polling+vs+websockets+vs+SSE) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a chat system](https://www.google.com/search?q=Hello+Interview+design+a+chat+system) (hellointerview.com · free guides)
- *Read:* [The WebSocket API](https://www.google.com/search?q=MDN+WebSocket+API) (MDN Web Docs, free)

[Back to contents](#contents)

### 1.4 CDN (content delivery network)

*Must know*

**Definition.** A network of servers around the world that caches static content (images, video, scripts) close to users.

**The problem it solves.** Distance costs time: a user in Sydney fetching from London waits around a quarter of a second for each round trip, and every byte you send costs bandwidth. Big files and users all over the world make this much worse.

**The idea.** Instead of every user fetching a video from your one datacentre, copies are served from a nearby 'edge' server. This cuts latency, takes load off your servers and absorbs traffic spikes. Content is pulled into the CDN on the first request (pull CDN) or uploaded in advance (push CDN).

**How it works, step by step**

1. You point a hostname, like cdn.example.com, at the CDN provider.
2. A user's request goes to the nearest edge server (found through DNS or 'anycast' routing).
3. Cache hit: the edge already has the file and returns it in a few milliseconds.
4. Cache miss: the edge fetches the file from your origin server once, stores it, and returns it. Every later user in that region gets the fast copy.
5. The file stays until its TTL expires. To update it straight away, publish a new file name (app.3f9a.js → app.7c2b.js) or purge the old one.

**Analogy.** Local supermarket branches stocking popular products, so you don't have to drive to the central warehouse.

**Where the analogy breaks.** A supermarket can check the warehouse for the newest stock. A CDN serves its cached copy until it expires, so after you change a file, users may get the old one unless you put a version in the file name or purge the cache.

**Example.** Netflix places its own CDN boxes inside internet providers' networks, so most video traffic never crosses the wider internet.

**Must-know points**

- Best for static, popular, cacheable content: images, video segments, JavaScript and CSS files.
- Pull CDN: fetches from your origin server on a cache miss. Push CDN: you upload content ahead of time.
- Control freshness with TTL headers; put a version or hash in file names (app.3f9a.js) so updates appear immediately.
- Also helps with DDoS protection, and can handle TLS close to the user.

**Common mistakes**

- Caching personalised pages at the edge, and showing one user's data to another.
- Long TTLs on files that change, without versioned names.
- Forgetting that the first request in each region is still slow (a 'cold' cache).

**Your interview answer** (say it out loud)

> I'd serve static assets and media through a CDN, so users download them from a nearby edge server. That lowers latency and takes most of the bandwidth off our origin. I'd use versioned file names so updates show up immediately.

**Follow-up questions**

- **Q: Can a CDN cache API responses?** Sometimes, for short TTLs on public data like a product page. Personalised responses usually can't be cached at the edge.
- **Q: Pull or push?** Pull for most sites (simple and automatic). Push when content is large and known in advance, like a video library.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain a CDN with the supermarket picture, and where the picture breaks.
2. **Draw:** Draw a user, a CDN edge server and your origin, showing a cache hit and a cache miss.
3. **Apply:** In a YouTube-like design, which data goes through the CDN and which does not?
4. **Trade-offs:** You fixed a bug in app.js but users still get the old file. Why, and how do you prevent it next time?

**Free resources (optional)**

- *Watch:* [ByteByteGo: what is a CDN](https://www.youtube.com/results?search_query=ByteByteGo+what+is+a+CDN) (ByteByteGo · YouTube)
- *Read:* [What is a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) (Cloudflare Learning Center, free)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 1.5 Proxies, reverse proxies and API gateways

*Should know*

**Definition.** A reverse proxy sits in front of your servers and receives requests on their behalf. An API gateway is a reverse proxy with API features: authentication, rate limiting and routing to the right service.

**The problem it solves.** With many services, every client would need to know every service's address, and every service would repeat the same login checks, rate limits and logging. That's duplicated, inconsistent work.

**The idea.** Clients talk to one entry point instead of many servers. That entry point can handle TLS, compress responses, cache, check tokens, apply rate limits, and send /orders to the order service and /users to the user service.

**How it works, step by step**

1. The client sends every request to one address, for example api.example.com.
2. The gateway handles TLS, then checks the token (who is this?) and the rate limit (are they allowed this many requests?).
3. It looks at the path: /orders/… goes to the order service, /users/… to the user service.
4. It forwards the request, waits for the answer and sends it back, logging the request and how long it took.
5. Behind it, each service may run several copies, so a load balancer (often built into the gateway) picks one.

**Analogy.** A hotel reception. Guests don't walk into the kitchen or the laundry; reception checks who they are and passes each request to the right department.

**Where the analogy breaks.** A reception desk with one person is a bottleneck and a single point of failure. A gateway must itself be replicated and kept fast, or every request suffers.

**Example.** Nginx or Envoy as a reverse proxy; a managed API gateway that checks tokens and allows 100 requests per minute per API key before anything reaches the services.

**Must-know points**

- Forward proxy: acts for clients (for example, a company's web proxy). Reverse proxy: acts for servers.
- Gateway jobs: routing, authentication, rate limiting, TLS, request logging, API versioning.
- A load balancer spreads traffic across copies of a service; a gateway decides what's allowed and which service it goes to. Many products do both.
- Keep business logic out of the gateway.

**Common mistakes**

- Putting business rules in the gateway, so it slowly becomes a hidden monolith.
- Running a single gateway instance: a single point of failure.
- Doing heavy work in the gateway that slows down every request.

**Your interview answer** (say it out loud)

> I'd put an API gateway at the edge to authenticate requests, apply rate limits and route each path to the right microservice, so services don't each re-implement those concerns. It's replicated, so it isn't a single point of failure.

**Follow-up questions**

- **Q: Gateway or load balancer?** A load balancer spreads requests across copies of one service. A gateway handles API concerns like auth, limits and routing between different services. Often you use both.
- **Q: What's the downside of a gateway?** An extra network hop, and a central component that must scale and stay up.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain reverse proxy versus forward proxy in two sentences.
2. **Draw:** Draw client → gateway → three services, and label what the gateway checks.
3. **Apply:** List what your gateway would do for a mobile banking app.
4. **Trade-offs:** What goes wrong if business logic slowly creeps into the gateway?

**Free resources (optional)**

- *Watch:* [ByteByteGo: API gateway explained](https://www.youtube.com/results?search_query=ByteByteGo+API+gateway+explained) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

---

## Phase 2: Core concepts: scale, reliability and speed

The ten ideas every high-level design uses: scalability, availability, fault tolerance, load balancing, caching, consistency and CAP, rate limiting, asynchronous processing, and observability.

> **The big picture.** Almost every design answer is a combination of these ideas: copy things for availability, spread load for scale, cache for speed, queue slow work, and watch everything. Learn each one well enough to say when to use it and what it costs.

### 2.1 Scalability: vertical vs horizontal

*Must know*

**Definition.** Scalability is a system's ability to handle more load by adding resources.

**The problem it solves.** A system that works for 100 users can fall over at 100,000. You need a way to add capacity without rewriting everything.

**The idea.** Vertical scaling means a bigger machine (more CPU and memory). It's simple, but there's a ceiling, and that one machine can fail. Horizontal scaling means more machines behind a load balancer. It has no hard ceiling and survives failures, but needs stateless app servers and shared storage. The key trick: keep app servers stateless, and keep sessions and data in shared stores.

**How it works, step by step**

1. Find the bottleneck first: is the CPU at 100%, the database slow, memory full, or the network saturated?
2. Make app servers stateless: no sessions or files kept on the server; put them in Redis and object storage instead.
3. Put a load balancer in front and add servers. With auto-scaling, servers are added automatically when CPU use or latency rises.
4. Take reads off the database: cache hot data and add read replicas.
5. When writes become the bottleneck, shard the database by a key.
6. Move slow work off the request path with queues.

**Analogy.** A busy restaurant can buy a bigger oven (vertical) or open more kitchens (horizontal).

**Where the analogy breaks.** More kitchens only help if any kitchen can cook any order. If half of a customer's order is in kitchen 2, it has to go back there. That's 'state', and it's why app servers should be stateless.

**Example.** Moving login sessions from server memory into Redis lets any server handle any user, so you can add servers freely.

**Must-know points**

- Stateless app servers plus a shared session store = easy horizontal scaling.
- Databases are the hard part: read replicas for more reads, sharding for more writes.
- Scale the real bottleneck: measure first (CPU, memory, database, network).
- Auto-scaling adds and removes servers based on load.
- Scalability is not speed: a system fast for one user can still collapse under many.

**Common mistakes**

- Adding app servers when the database is the real bottleneck.
- Keeping sessions in server memory, then adding more servers.
- Sharding far too early: it adds a lot of complexity.

**Trade-offs**

- Vertical: simple, no code changes, but a ceiling and a single point of failure.
- Horizontal: almost unlimited and fault tolerant, but needs statelessness, load balancing and distributed data.

**Your interview answer** (say it out loud)

> I'd keep the application tier stateless so it scales horizontally behind a load balancer with auto-scaling. State goes into shared stores: sessions in Redis, data in the database. For the database, I'd add read replicas first and shard only when write volume needs it.

**Follow-up questions**

- **Q: When is vertical scaling the right answer?** Early on, or for a database that's hard to split. It's simple and modern machines are very large. Just plan the horizontal path for later.
- **Q: What makes a server 'stateful'?** It keeps data that later requests depend on, like a session in memory or an uploaded file on its local disk.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain vertical and horizontal scaling with the restaurant picture.
2. **Draw:** Draw a stateless app tier behind a load balancer, with a shared session store and a database with replicas.
3. **Apply:** An app saves uploaded files on each server's local disk. Explain what breaks when you add a second server, and fix it.
4. **Trade-offs:** Give one case where you'd scale vertically first, and why.

**Free resources (optional)**

- *Watch:* [ByteByteGo: vertical vs horizontal scaling](https://www.youtube.com/results?search_query=ByteByteGo+vertical+vs+horizontal+scaling) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: scale from zero to millions of users](https://www.google.com/search?q=Hello+Interview+scale+from+zero+to+millions+of+users) (hellointerview.com · free guides)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 2.2 Availability: nines, SLAs and redundancy

*Must know*

**Definition.** Availability is the share of time a system works and responds correctly, usually written in 'nines', like 99.9%.

**The problem it solves.** Machines, disks, networks and whole datacentres fail. If your system has only one copy of anything important, that one failure takes everything down.

**The idea.** 99.9% ('three nines') allows about 8.8 hours of downtime a year; 99.99% about 53 minutes. You raise availability by removing single points of failure: run several copies across machines and zones, with health checks and automatic failover. An SLO is your internal target; an SLA is the promise to customers, often with refunds if you miss it.

**How it works, step by step**

1. Agree the target. 99.9% means about 43 minutes of downtime a month.
2. List every component a request touches and ask: if this dies, what happens?
3. Add redundancy: at least two copies of each component, in different availability zones.
4. Add detection: health checks that notice a failure within seconds.
5. Add automatic failover: the load balancer stops sending traffic to dead servers, and a database replica is promoted when the leader dies.
6. Practise it: test failover regularly, because untested backups often don't work when you need them.

**Analogy.** A hospital with backup generators. When the mains power fails, a generator starts and the lights stay on.

**Where the analogy breaks.** A generator is one independent backup. Real systems also fail in shared ways — a bad deployment, a whole region going down, a shared database — so backups only help if they fail independently.

**Example.** Two parts in series, each 99.9% available, give about 99.8% overall (0.999 × 0.999). Two redundant copies in parallel, each 99%, give 99.99% (1 − 0.01²), as long as they fail independently.

**Must-know points**

- Downtime per year: 99% ≈ 3.65 days; 99.9% ≈ 8.8 hours; 99.99% ≈ 53 minutes; 99.999% ≈ 5 minutes.
- Dependencies in series multiply availability down; parallel copies multiply the chance of failure down.
- Remove single points of failure: load balancers, databases, DNS, the gateway itself.
- Spread across availability zones (separate datacentres in one region); for more safety, across regions.
- Active–passive: a standby takes over. Active–active: all copies serve traffic all the time.
- SLI = what you measure; SLO = your target; SLA = your contract.

**Common mistakes**

- Two copies that share one point of failure (the same rack, the same power supply, the same bad deployment).
- Forgetting the database, DNS or load balancer when removing single points of failure.
- Promising 99.99% when one of your dependencies only offers 99.9%.

**Trade-offs**

- Each extra nine costs much more: extra regions, more complex failover, more testing.

**Your interview answer** (say it out loud)

> I'd first agree a target, say 99.9%. Then I'd remove single points of failure: several app servers across availability zones, a replicated database with automatic failover, redundant load balancers and health checks. I'd also remember that every dependency in series lowers the overall availability.

**Follow-up questions**

- **Q: Availability or reliability?** Availability: is it up and responding? Reliability: does it do the right thing over time, without errors or data loss? A system can be up but returning wrong answers.
- **Q: Active–active or active–passive?** Active–active uses all capacity and fails over faster, but must handle conflicting writes. Active–passive is simpler, but the standby sits idle and failover takes longer.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain what 'three nines' means in hours of downtime per year.
2. **Draw:** Draw a system with no single point of failure across two availability zones.
3. **Apply:** Your app depends on 4 services in series, each 99.9% available. Calculate the best-case overall availability, and suggest one fix.
4. **Trade-offs:** Why does going from 99.99% to 99.999% cost so much more?

**Free resources (optional)**

- *Watch:* [ByteByteGo: availability and the nines explained](https://www.youtube.com/results?search_query=ByteByteGo+availability+and+the+nines+explained) (ByteByteGo · YouTube)
- *Read:* [Site Reliability Engineering, Ch 4 (service level objectives)](https://sre.google/sre-book/table-of-contents/) (Google · free online book)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 2.3 Fault tolerance: timeouts, retries, circuit breakers

*Must know*

**Definition.** Fault tolerance means the system keeps working, perhaps in a reduced way, when parts of it fail.

**The problem it solves.** In a system of many services, something is always slow or broken. Without protection, one slow dependency makes its callers wait, they run out of threads, and the failure spreads until everything is down.

**The idea.** In distributed systems something is always failing: a server, a network link, a slow dependency. The defences: timeouts (never wait forever), retries with exponential backoff and jitter (try again, gently), circuit breakers (stop calling a broken service for a while), fallbacks (return cached or default data), and bulkheads (separate resources so one failure can't sink everything).

**How it works, step by step**

1. Timeout: decide how long a call may take, say 300 ms. After that, give up instead of waiting forever.
2. Retry: if the failure looks temporary and the call is safe to repeat, try again after 100 ms, then 200 ms, then 400 ms (exponential backoff), each with a little randomness (jitter).
3. Circuit breaker: count failures. If, say, half the calls fail within 10 seconds, 'open' the breaker and fail instantly for the next 30 seconds without calling the service at all.
4. Half-open: after the wait, let a few test calls through. If they succeed, close the breaker; if not, open it again.
5. Fallback: while the breaker is open, return something useful: cached data, a default, or the page without that feature.

**Analogy.** A fuse box. When one circuit overloads, its fuse trips, so the whole house doesn't catch fire.

**Where the analogy breaks.** A fuse stays off until someone resets it. A circuit breaker tests the service again on its own after a cool-down (the 'half-open' state) and closes again when calls succeed.

**Example.** Checkout calls a recommendations service. If it's slow, a 200 ms timeout plus a circuit breaker lets checkout still load, just without recommendations.

**Must-know points**

- Always set timeouts on network calls.
- Only retry safe (idempotent) operations; use exponential backoff plus random jitter to avoid retry storms.
- Circuit breaker states: closed (normal) → open (fail fast) → half-open (test) → closed.
- Graceful degradation: lose a feature, not the whole product.
- Cascading failure: a slow service ties up threads in the services calling it, which then slow down too.
- Test it: chaos engineering breaks things on purpose, in a controlled way.

**Common mistakes**

- No timeouts, or a timeout longer than the caller's own timeout.
- Retrying operations that aren't safe to repeat, like charging a card.
- Retrying instantly without backoff, which turns a small outage into a big one.

```python
import random, time

def call_with_retry(fn, attempts=4, base=0.1):
    for i in range(attempts):
        try:
            return fn()                     # fn must be safe to repeat
        except TimeoutError:
            if i == attempts - 1:
                raise
            time.sleep(base * 2**i * random.uniform(0.5, 1.5))   # backoff + jitter
```

**Your interview answer** (say it out loud)

> Every network call gets a timeout. Idempotent calls are retried with exponential backoff and jitter. Calls to non-critical dependencies sit behind a circuit breaker with a fallback, so the core feature keeps working when they fail. That stops one slow service from causing a cascading failure.

**Follow-up questions**

- **Q: Why add jitter to retries?** Without it, all clients retry at the same moments and hit the recovering service in synchronised waves.
- **Q: What's a bulkhead?** Separate pools of threads or connections for each dependency, so one slow dependency can't use them all up.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the three circuit-breaker states with the fuse-box picture.
2. **Draw:** Draw service A calling service B through a circuit breaker, and show what A returns when the breaker is open.
3. **Apply:** Write the retry function below, then simulate 100 clients retrying against a service that recovers after 2 seconds, with and without jitter.
4. **Trade-offs:** When are retries dangerous? Give an example of an operation you must not blindly retry.

**Free resources (optional)**

- *Read:* [Timeouts, retries, and backoff with jitter](https://www.google.com/search?q=Amazon+Builders+Library+timeouts+retries+backoff+with+jitter) (Amazon Builders' Library, free)
- *Read:* [CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html) (Martin Fowler)
- *Read:* [Site Reliability Engineering, Ch 22 (addressing cascading failures)](https://sre.google/sre-book/table-of-contents/) (Google · free online book)

[Back to contents](#contents)

### 2.4 Load balancing

*Must know*

**Definition.** A load balancer spreads incoming requests across several servers and stops sending traffic to unhealthy ones.

**The problem it solves.** One server can only handle so much, and if it dies, everyone using it is affected. You need to spread requests across many servers and route around the broken ones.

**The idea.** It makes many servers look like one, enables horizontal scaling and hides failures. Layer 4 balancers route by IP address and port (fast). Layer 7 balancers read the HTTP request, so they can route by path, header or cookie. Common algorithms: round robin, least connections, and hashing (the same user always goes to the same server).

**How it works, step by step**

1. Clients connect to the load balancer's address, never directly to a server.
2. For each request or connection, it picks a healthy server using an algorithm: the next in turn (round robin), or the one with the fewest active connections.
3. Every few seconds it calls each server's health endpoint. After a few failures in a row it stops sending traffic there, and adds the server back when it recovers.
4. A layer 7 balancer can read the URL and send /api to API servers and /images to image servers.
5. So the balancer itself isn't a single point of failure, run two of them (one active, one standby, sharing an address) or use a managed service.

**Analogy.** A supermarket worker sending shoppers to the shortest checkout queue, and closing a till when it breaks.

**Where the analogy breaks.** Shoppers are fairly similar. Requests aren't: one may take 5 ms and another 5 seconds, so 'the same number of requests' isn't 'the same amount of work'. Least connections helps.

**Example.** An AWS Application Load Balancer (layer 7) sends /api/* to API servers and /images/* to a media service, and checks each server's /health endpoint every few seconds.

**Must-know points**

- Algorithms: round robin, weighted round robin, least connections, IP or consistent hashing.
- Health checks remove failed servers automatically.
- Layer 4: fast and protocol-agnostic. Layer 7: smarter routing and TLS handling, but more work per request.
- Sticky sessions tie a user to one server; avoid them by keeping servers stateless.
- The load balancer itself must be redundant (a pair, or a managed service).
- Load balancers are also used between internal services, not only at the edge.

**Common mistakes**

- Sticky sessions that tie one user to a server forever, which breaks when that server dies.
- Health checks that only test 'is the process running?', not 'can it reach its database?'.
- Forgetting that the load balancer needs redundancy too.

**Your interview answer** (say it out loud)

> I'd put a layer 7 load balancer in front of the stateless app servers, with health checks and least-connections routing. It runs as a redundant pair or a managed service, so it isn't a single point of failure.

**Follow-up questions**

- **Q: How does a load balancer know a server is down?** Health checks: it calls an endpoint regularly and removes the server after several failures in a row.
- **Q: When would you route by hashing?** When requests for the same key should reach the same server, for example a cache shard, so the data already in its memory gets reused.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain layer 4 and layer 7 load balancing in two sentences each.
2. **Draw:** Draw a load balancer with three servers, one of them failing its health check.
3. **Apply:** Pick an algorithm for: identical short API calls; long video uploads; a cache cluster. Justify each.
4. **Trade-offs:** Why are sticky sessions a problem when you scale out or a server dies?

**Free resources (optional)**

- *Watch:* [ByteByteGo: load balancing algorithms](https://www.youtube.com/results?search_query=ByteByteGo+load+balancing+algorithms) (ByteByteGo · YouTube)
- *Read:* [What is load balancing?](https://www.cloudflare.com/learning/performance/what-is-load-balancing/) (Cloudflare Learning Center, free)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 2.5 Caching

*Must know*

**Definition.** A cache keeps a copy of frequently used data in fast storage, usually memory, so it can be served without repeating slow work.

**The problem it solves.** Reading from a database on disk, or recalculating a result, is slow and expensive compared with reading memory. When the same data is read again and again, repeating the work is waste.

**The idea.** Caches exist at many layers: the browser, the CDN, the application (Redis or Memcached) and the database. The usual pattern is cache-aside: read from the cache; on a miss, read the database and store the result with a TTL. The hard parts are keeping the cache in step with the database (invalidation) and choosing what to remove when it's full (eviction, often LRU).

**How it works, step by step**

1. A request needs product 42. The app asks Redis for the key 'product:42'.
2. Hit: Redis has it and returns it in under a millisecond.
3. Miss: the app reads the database (perhaps 5–20 ms), returns the result, and stores it in Redis with a TTL of, say, 5 minutes.
4. When product 42 changes, the app deletes 'product:42' from Redis, so the next read loads the fresh value.
5. When Redis is full, it evicts keys, usually the least recently used ones.
6. Measure the hit rate: 95% means only 1 read in 20 reaches the database.

**Analogy.** Keeping the books you use every day on your desk instead of walking to the library each time.

**Where the analogy breaks.** Books on your desk don't change by themselves. Data does: when the database changes, your cached copy is stale until it's updated or expires. That's the hardest problem in caching.

**Example.** A product page is read 1,000 times for every update. Cache-aside in Redis with a 5-minute TTL serves almost every read from memory, and the database sees a tiny share of the traffic.

**Must-know points**

- Cache-aside (lazy loading): check the cache → on a miss, load from the database and fill the cache. The most common pattern.
- Write-through: write the cache and database together (fresh, but slower writes). Write-back: write the cache, save to the database later (fast, but data can be lost).
- Eviction: LRU (least recently used), LFU (least frequently used), TTL expiry.
- Invalidation: delete or update the cache entry when the data changes; the TTL is your safety net.
- Problems to know: stale data, cache stampede (many misses at once), hot keys, cold start.
- Cache only data that is read often and can be slightly out of date.

**Common mistakes**

- Caching data that changes constantly, or is hardly ever read.
- No TTL, so stale data lives forever if one invalidation is missed.
- No plan for a stampede when a very popular key expires.
- Treating the cache as the source of truth. It can be emptied at any moment.

```python
def get_product(product_id):
    key = f"product:{product_id}"
    cached = redis.get(key)
    if cached:
        return cached                          # hit: fast path
    product = db.query_product(product_id)    # miss: slow path
    redis.set(key, product, ex=300)           # keep for 5 minutes
    return product
```

**Your interview answer** (say it out loud)

> Reads far outnumber writes here, so I'd add a Redis cache using cache-aside with a TTL. On writes I'd delete the cache key so the next read loads fresh data. I'd watch the hit rate, and protect hot keys from stampedes by letting one request rebuild while others wait.

**Follow-up questions**

- **Q: What is a cache stampede?** A popular key expires and thousands of requests miss at the same moment and all hit the database. Fixes: let one request rebuild while the others wait, add random jitter to TTLs, or refresh early.
- **Q: Update or delete the cache on a write?** Usually delete. It's simpler and avoids races where two writers leave an old value behind.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain cache-aside step by step, then explain invalidation with the books-on-your-desk picture.
2. **Draw:** Draw the read path for a cache hit and a cache miss, and the write path that invalidates the cache.
3. **Apply:** Implement an LRU cache class with get and put in O(1), using a dict and a doubly linked list.
4. **Trade-offs:** Compare write-through and write-back: what does each risk, and where would you use each?

**Free resources (optional)**

- *Watch:* [ByteByteGo: caching strategies](https://www.youtube.com/results?search_query=ByteByteGo+caching+strategies) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)
- *Read:* [Caching best practices](https://www.google.com/search?q=AWS+caching+best+practices) (Amazon Web Services)

[Back to contents](#contents)

### 2.6 Consistency, CAP and PACELC

*Must know*

**Definition.** Consistency (in distributed systems) means every read sees the latest write. The CAP theorem says that during a network partition, a system must choose between consistency and availability.

**The problem it solves.** To survive failures and be fast for users everywhere, you keep copies of data on several machines. But copies can't all change at exactly the same instant, and the network between them can break. You must decide what users see in that gap.

**The idea.** When data is copied across machines, the copies can briefly disagree. Strong consistency makes every read return the latest value, but may have to refuse requests when machines can't talk to each other. Eventual consistency always answers, but a read can be briefly out of date. Network partitions will happen, so the real choice is C or A during a partition. PACELC adds: else (normally), you trade latency against consistency.

**How it works, step by step**

1. Picture two replicas, in London and Paris, each holding a balance of £100.
2. The network between them breaks: a partition. A user in London withdraws £80.
3. CP choice: London refuses, or only accepts if it can confirm with Paris. Always correct, but some requests fail until the network heals.
4. AP choice: London accepts and records £20, while Paris still says £100. Both keep answering, but a second £80 withdrawal in Paris would overdraw the account. When the network heals, the system must reconcile the two.
5. With no partition (normal running), waiting for both copies before confirming is consistent but slower. That's the latency-versus-consistency trade-off in PACELC.

**Analogy.** Two bank branches whose phone line is cut. Either they stop withdrawals until the line is back (consistency), or they keep serving customers and reconcile later, risking an overdrawn account (availability).

**Where the analogy breaks.** A bank makes this choice once, as a policy. Real systems choose per operation: a social feed can be eventually consistent while the payment inside the same app must be strongly consistent.

**Example.** Bank balance: strong consistency (CP). Likes on a post: eventual consistency (AP); nobody minds seeing 1,203 instead of 1,205 for a second.

**Must-know points**

- C = every read sees the latest write; A = every request gets a non-error response; P = the system keeps working when messages between machines are lost.
- Partitions are unavoidable in distributed systems, so it's CP or AP during a partition.
- Consistency levels: strong, read-your-own-writes, monotonic reads, eventual.
- Quorums: with N copies, writing to W and reading from R where W + R > N means every read overlaps the latest write.
- PACELC: even without partitions, stronger consistency costs latency.
- CAP's C is not ACID's C (which is about the database's rules and constraints).

**Common mistakes**

- Calling a system 'CA'. With replicas, partitions can't be wished away.
- Treating CAP as one choice for the whole system, instead of a choice per type of data.
- Confusing CAP's consistency with ACID's consistency.

**Trade-offs**

- CP: correct, but may reject requests during a partition (bank ledger).
- AP: always answers, but may return stale data and needs conflict handling (shopping cart, likes).

**Your interview answer** (say it out loud)

> It depends on the data. For money or stock levels I'd choose strong consistency, accepting that some requests fail during a partition. For feeds, likes or view counts I'd choose availability with eventual consistency, because a slightly stale number is harmless and the system stays up.

**Follow-up questions**

- **Q: Is a single-server SQL database CP or AP?** CAP is about distributed systems with replicas. One server has no partition between copies; with replicas, it depends on how replication and failover are set up.
- **Q: Explain W + R > N.** If every write reaches W copies and every read checks R copies, and W + R > N, at least one copy you read must have the latest write.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain CAP with the two-bank-branches picture, and why 'CA' isn't a real choice for distributed systems.
2. **Draw:** Draw two replicas separated by a partition, and show what a CP system and an AP system each do with a write.
3. **Apply:** Label each as needing strong or eventual consistency: bank balance, Instagram likes, cinema seat booking, profile picture, stock level at checkout.
4. **Trade-offs:** With N = 3 copies, compare W = 3, R = 1 with W = 2, R = 2. What does each favour?

**Free resources (optional)**

- *Watch:* [Distributed Systems lecture series: consistency and consensus](https://www.youtube.com/results?search_query=Martin+Kleppmann+distributed+systems+lecture+consistency+and+consensus) (Martin Kleppmann, University of Cambridge · free on YouTube)
- *Watch:* [ByteByteGo: CAP theorem](https://www.youtube.com/results?search_query=ByteByteGo+CAP+theorem) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 2.7 Rate limiting and backpressure

*Must know*

**Definition.** Rate limiting caps how many requests a client can make in a time window. Backpressure is a system telling the senders upstream to slow down when it's overloaded.

**The problem it solves.** Without limits, one buggy script, scraper or attacker can send so many requests that everyone else gets errors. And a system that accepts more work than it can do eventually collapses for everyone.

**The idea.** Rate limits protect services from abuse, bugs and traffic spikes, and enforce fair use, like 100 requests per minute per user. Requests over the limit get HTTP 429. Common algorithms: token bucket, leaky bucket, fixed window and sliding window. Backpressure goes further: queues have size limits, and when they fill, senders are told to wait or requests are dropped on purpose, instead of the whole system falling over.

**How it works, step by step**

1. Choose the rule: for example, 10 requests per second per API key, with bursts of up to 20.
2. Token bucket: each key has a bucket that holds up to 20 tokens and gains 10 tokens every second.
3. Each request takes one token. If a token is there, the request goes through.
4. If the bucket is empty, reply 429 Too Many Requests, with 'Retry-After: 1'.
5. With many gateway servers, keep each bucket in Redis and update it atomically, so every server shares the same count.
6. Inside the system, backpressure: when a work queue reaches its limit, stop accepting new work (or drop the least important) instead of letting the queue grow forever.

**Analogy.** A nightclub bouncer lets in a few people per minute (rate limiting). When the club is full, the queue outside stops moving (backpressure).

**Where the analogy breaks.** A bouncer is one person at one door. A real service runs on many servers, so the limit must be shared between them, usually with counters in Redis, and that shared store must be fast and always available.

**Example.** Token bucket: each user's bucket holds up to 10 tokens and refills at 1 token per second. Each request takes a token; an empty bucket means 429 Too Many Requests. Short bursts are allowed; sustained abuse isn't.

**Must-know points**

- Token bucket: allows bursts up to the bucket size, with a steady refill rate. The most common.
- Leaky bucket: processes requests at a fixed rate; smooths out bursts.
- Fixed window: a simple counter per minute, but allows double bursts at the window edges.
- Sliding window (log or counter): smoother and fairer, slightly more work.
- Limit by user, API key or IP address; return 429 with a Retry-After header.
- Backpressure: bounded queues, load shedding, and signalling clients to slow down.

**Common mistakes**

- Limiting per server instead of across all servers.
- One global limit, so a single heavy user blocks everyone else.
- Unbounded queues that hide overload until memory runs out.

```python
import time

class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.capacity, self.rate = capacity, refill_per_sec
        self.tokens, self.last = capacity, time.monotonic()

    def allow(self):
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False                    # the caller returns HTTP 429
```

**Your interview answer** (say it out loud)

> I'd rate-limit at the API gateway with a token bucket per user or API key, keeping the counters in Redis so every gateway node shares them, and return 429 with Retry-After. Internally I'd use bounded queues and load shedding, so overload slows the system down gracefully instead of crashing it.

**Follow-up questions**

- **Q: Why is the fixed window unfair?** A client can send the full limit at 12:00:59 and again at 12:01:00, doubling the real rate across the boundary.
- **Q: What if Redis is down?** Decide to fail open (allow requests and risk abuse) or fail closed (block and risk an outage), per API. Many systems fail open with a local backup limit.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the token bucket with the nightclub picture.
2. **Draw:** Draw where rate limiting happens in a system with a gateway, several servers and Redis.
3. **Apply:** Implement a fixed-window limiter and the token bucket below. Send a burst of 50 requests to each and compare which get through.
4. **Trade-offs:** Fail open or fail closed when the limiter's store is down? Decide for a login endpoint and for a public search API.

**Free resources (optional)**

- *Read:* [Hello Interview: design a rate limiter](https://www.google.com/search?q=Hello+Interview+design+a+rate+limiter) (hellointerview.com · free guides)
- *Read:* [What is rate limiting?](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/) (Cloudflare Learning Center, free)
- *Read:* [Using load shedding to avoid overload](https://www.google.com/search?q=Amazon+Builders+Library+using+load+shedding+to+avoid+overload) (Amazon Builders' Library, free)

[Back to contents](#contents)

### 2.8 Asynchronous processing and message queues (Kafka, SQS)

*Must know*

**Definition.** Asynchronous processing means doing slow work later, outside the user's request. A message queue holds the work, or events, between the service that produces them and the services that consume them.

**The problem it solves.** Some work is slow (encoding video, sending emails) or comes in bursts (a sale doubles traffic). Doing it inside the user's request makes them wait, and a burst can overwhelm the services behind it.

**The idea.** Instead of making a user wait while you send emails, resize images and update analytics, you put a message on a queue and reply straight away. Workers process messages at their own pace. Queues absorb spikes, decouple services and let you retry failures. SQS-style queues give each message to one worker; Kafka keeps an ordered log that many groups of consumers can read, and re-read.

**How it works, step by step**

1. A user uploads a video. The API stores the file and puts a message {video_id: 42} on a queue.
2. The API replies straight away: '202 Accepted, processing'.
3. Worker processes pull messages from the queue. One worker takes message 42 and converts the video.
4. When it's done, the worker acknowledges the message, and only then is it removed. If the worker crashes first, the message becomes visible again and another worker retries it.
5. If it fails too many times, it moves to a dead-letter queue for a person to inspect.
6. If 10,000 uploads arrive at once, they simply wait in the queue; you add workers to clear it faster.

**Analogy.** A restaurant's order rail. The waiter clips the order on the rail and goes back to the customers; the cooks take orders when they're ready.

**Where the analogy breaks.** A paper order is taken by exactly one cook and then it's gone. Most queues only promise 'at least once' delivery, so a message can arrive twice and consumers must be idempotent. And Kafka keeps messages after they're read, so others can read them again.

**Example.** Upload a video: the API saves the file, puts a 'video uploaded' message on a queue, and replies 202 Accepted. Workers convert it into several resolutions, and the user is notified when it's ready.

**Must-know points**

- Queue (SQS, RabbitMQ): spreads work; each message is consumed once, then deleted.
- Log or stream (Kafka): ordered, durable, replayable; partitions give order per key and parallel processing.
- Delivery guarantees: at most once, at least once (the most common), exactly once (hard; usually 'effectively once' with idempotent consumers).
- Dead-letter queue: where messages go after failing too many times.
- Pub/sub: one event fans out to many subscribers.
- Async means eventual: the user sees 'processing', not the final result straight away.

**Common mistakes**

- Assuming each message arrives exactly once. It can arrive twice, so make processing idempotent.
- Expecting order across a whole Kafka topic. Order is only kept within one partition.
- Using a queue where the user needs an immediate answer.

**Trade-offs**

- Pros: absorbs spikes, decouples services, makes retries easy.
- Cons: more moving parts, harder debugging, eventual consistency, and you must handle ordering and duplicates.

**Your interview answer** (say it out loud)

> Slow or non-critical work goes on a queue so the request stays fast. For simple task distribution I'd use a queue like SQS with a dead-letter queue. For event streams that many services need, or that I may want to replay, I'd use Kafka, partitioned by a key like user ID to keep each user's events in order. Consumers are idempotent, because delivery is at least once.

**Follow-up questions**

- **Q: Kafka or SQS?** SQS: a simple managed queue, each message handled once, no replay. Kafka: a high-throughput ordered log with many independent consumers, replay, and ordering within a partition.
- **Q: How do you keep messages in order?** Send all messages with the same key (like an order ID) to the same partition. Order is only guaranteed within a partition.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain why asynchronous processing makes an API faster, with the order-rail picture.
2. **Draw:** Draw producer → queue → worker pool → database, plus a dead-letter queue.
3. **Apply:** Build a tiny producer and consumer with Python's queue module and threads. Make a consumer crash halfway, and show how a message could be processed twice.
4. **Trade-offs:** When should something NOT be asynchronous? Give an example where the user must wait for the result.

**Free resources (optional)**

- *Watch:* [ByteByteGo: Kafka vs RabbitMQ](https://www.youtube.com/results?search_query=ByteByteGo+Kafka+vs+RabbitMQ) (ByteByteGo · YouTube)
- *Read:* [Introduction to Apache Kafka](https://kafka.apache.org/intro) (kafka.apache.org)
- *Read:* [Apache Kafka 101](https://www.google.com/search?q=Confluent+Developer+Apache+Kafka+101+course) (Confluent Developer · free course)

[Back to contents](#contents)

### 2.9 Observability: logs, metrics and traces

*Must know*

**Definition.** Observability is how well you can understand what a system is doing from the outside, using logs, metrics and traces.

**The problem it solves.** When something goes wrong in a system of many services, you can't attach a debugger to production. Without data coming out of the system, you're guessing.

**The idea.** Metrics are numbers over time (requests per second, error rate, latency percentiles), used for dashboards and alerts. Logs are detailed records of events, used for investigating. Traces follow one request across many services and show where the time went. Alert on symptoms users feel (errors, latency against your SLO), not on every CPU blip.

**How it works, step by step**

1. Metrics: every service counts requests, errors and latency, and exports them every few seconds. Dashboards show trends; an alert fires when, say, the error rate stays above 1% for 5 minutes.
2. Logs: each important event is written as structured JSON, including the request's trace ID, the user ID and timings.
3. Traces: the first service creates a trace ID and passes it in a header to every service it calls. Each service records how long its part took.
4. Investigating: the alert tells you something is wrong, the dashboard shows when it started, a trace shows which service is slow, and that service's logs show why.

**Analogy.** A car: the dashboard is metrics, the service history is logs, and a GPS replay of one journey is a trace.

**Where the analogy breaks.** A car is one machine. A request may cross 20 services, so without a shared trace ID to join the logs together, you can't follow it.

**Example.** The p99 checkout latency jumps from 300 ms to 2 s. The dashboard shows when; a trace shows 1.6 s spent in the payment service's database call; that service's logs show a lock timeout.

**Must-know points**

- The four golden signals: latency, traffic, errors, saturation.
- Use percentiles (p50, p95, p99), not averages; averages hide the slow users.
- Structured logs (JSON), with a request or trace ID on every line.
- Distributed tracing (OpenTelemetry) shows the time spent in each service.
- Alert on SLO burn (user impact), and give every alert a runbook.
- Health checks and a dashboard per service.

**Common mistakes**

- Alerting on causes (CPU at 80%) instead of symptoms users feel (errors, slow responses).
- Logs without a request or trace ID, so you can't connect them.
- Watching averages instead of percentiles.

**Your interview answer** (say it out loud)

> I'd emit the four golden signals as metrics for each service, write structured logs with a trace ID, and use distributed tracing to follow requests across services. Alerts fire on user-facing symptoms, like p99 latency or error rate breaking the SLO, so on-call engineers are paged only for real problems.

**Follow-up questions**

- **Q: Why p99 instead of the average?** The average can look fine while 1% of users wait seconds. At scale, that 1% is a lot of people, and often your heaviest users.
- **Q: Monitoring or observability?** Monitoring checks for known failures with dashboards and alerts. Observability lets you ask new questions about failures you didn't predict.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain logs, metrics and traces with the car picture.
2. **Draw:** Draw one request crossing 3 services, and show where the trace ID is passed along.
3. **Apply:** Choose 4 metrics and 2 alerts, with thresholds, for a payment API.
4. **Trade-offs:** Logging everything at debug level in production: what does it cost, and what would you do instead?

**Free resources (optional)**

- *Watch:* [ByteByteGo: logging tracing metrics](https://www.youtube.com/results?search_query=ByteByteGo+logging+tracing+metrics) (ByteByteGo · YouTube)
- *Read:* [Site Reliability Engineering, Ch 6 (monitoring distributed systems)](https://sre.google/sre-book/table-of-contents/) (Google · free online book)
- *Read:* [Observability primer](https://www.google.com/search?q=OpenTelemetry+observability+primer) (OpenTelemetry docs)

[Back to contents](#contents)

---

## Phase 3: Data: databases, storage and scaling data

Choose the right database, keep data correct with transactions, make queries fast with indexes, and scale data with replication and sharding.

> **The big picture.** App servers are easy to scale; data is not. Most deep dives in interviews end up here: which store, which key, how many copies, how to split it, and what consistency you promise.

### 3.1 SQL vs NoSQL: choosing a database

*Must know*

**Definition.** SQL (relational) databases store data in tables with a fixed schema and support joins and transactions. NoSQL is a family of other models: key-value, document, wide-column and graph.

**The problem it solves.** Different data and different access patterns need different storage. A wrong choice hurts later: slow queries, joins you can't do, or a database that can't keep up with the writes.

**The idea.** Start from your data and how it's accessed. Relational databases (PostgreSQL, MySQL) suit structured data with relationships and strong consistency. Key-value stores (Redis, DynamoDB) give fast lookups by key. Document stores (MongoDB) hold flexible JSON-like records. Wide-column stores (Cassandra) handle huge write volumes. Graph databases (Neo4j) suit highly connected data like social networks.

**How it works, step by step**

1. List the main queries: 'get a user's last 20 orders', 'find all messages in a chat by time', 'count the likes on a post'.
2. If you need joins, transactions and flexible queries over structured data, start with SQL.
3. If one simple lookup by key dominates, and must be extremely fast or enormous, consider a key-value store.
4. If each record is a self-contained document with varying fields, consider a document store.
5. If writes are massive and reads always follow one key (like chat messages by conversation), consider a wide-column store.
6. If the questions are about relationships ('friends of friends who like X'), consider a graph database.

**Analogy.** SQL is a well-organised filing cabinet with labelled folders and cross-references. NoSQL is a set of specialised containers: a key rack, a box of folders, a giant ledger, a map of connections.

**Where the analogy breaks.** A filing cabinet can't grow past the office. Relational databases actually scale a long way with replicas and sharding, and many NoSQL stores now support transactions. The line is blurrier than the slogan.

**Example.** An online shop: orders and payments in PostgreSQL (transactions matter); shopping carts and sessions in a key-value store (fast and simple); product search in Elasticsearch; 'people also bought' in a precomputed table or a graph.

**Must-know points**

- Choose by access pattern: what are the main reads and writes, and by which key?
- SQL: joins, ACID transactions, a strict schema; scales with replicas and, with more effort, sharding.
- Key-value: very fast by key, no complex queries. Document: flexible schema, nested data.
- Wide-column (Cassandra): massive write volume; queries designed around the partition key.
- Graph: relationships first (friends of friends).
- Default in most interviews: start with SQL unless there's a clear reason not to.

**Common mistakes**

- Choosing NoSQL because it 'scales', without checking the queries you need.
- Designing a NoSQL schema like SQL tables, then needing joins.
- Forgetting that different parts of one system can use different databases.

**Trade-offs**

- SQL: flexible queries and strong guarantees, but harder to scale writes horizontally.
- NoSQL: easy scale-out for specific patterns, but limited queries, and you must design around access patterns up front.

**Your interview answer** (say it out loud)

> I'd choose based on the access patterns. For orders and payments with relationships and transactions, PostgreSQL. For very high write volume with simple key-based reads, like chat messages, a wide-column store like Cassandra. For sessions and hot data, Redis. Using different stores for different jobs is normal.

**Follow-up questions**

- **Q: Why might chat messages go in Cassandra?** Huge write volume, always read by conversation and time: a natural partition key and sort order, with easy horizontal scaling.
- **Q: Is NoSQL always faster?** No. It's fast for the access pattern it was designed for. Unplanned queries and joins can be slow or impossible.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the four NoSQL types with one good use for each.
2. **Draw:** Draw the tables for users, orders and order items, with keys and relationships.
3. **Apply:** Pick a database for: a bank ledger, IoT sensor readings, user sessions, a social graph, a product catalogue. Justify each.
4. **Trade-offs:** A startup used MongoDB for everything and now needs reports that join 5 collections. What went wrong, and what would you do?

**Free resources (optional)**

- *Watch:* [CMU 15-445 Intro to Database Systems: data models and query languages](https://www.youtube.com/results?search_query=CMU+15-445+database+systems+data+models+and+query+languages) (Andy Pavlo, Carnegie Mellon · free on YouTube)
- *Watch:* [ByteByteGo: SQL vs NoSQL](https://www.youtube.com/results?search_query=ByteByteGo+SQL+vs+NoSQL) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 3.2 ACID transactions and isolation levels

*Must know*

**Definition.** A transaction groups several operations so they succeed or fail together. ACID stands for Atomic, Consistent, Isolated, Durable.

**The problem it solves.** Real operations change several things at once: take money from A, give it to B. If the system crashes halfway, or two users act at the same moment, money can be created or destroyed.

**The idea.** Atomic: all or nothing. Consistent: the database moves from one valid state to another, so its rules always hold. Isolated: transactions running at the same time don't see each other's half-finished work. Durable: once committed, the change survives a crash. Isolation comes in levels — read committed, repeatable read, serializable — trading safety for speed.

**How it works, step by step**

1. BEGIN starts a transaction. Changes are made, but other users can't see them yet (isolation).
2. The database writes each change to a write-ahead log on disk.
3. COMMIT: the log is saved to disk, and only then is success reported. After a crash, the database replays the log, so committed changes survive (durability).
4. ROLLBACK, or a crash before COMMIT: every change in the transaction is undone (atomicity).
5. Rules such as 'balance must not go below 0' are checked, so an invalid state is never committed (consistency).
6. When two transactions touch the same row, locks or version numbers decide who goes first, according to the isolation level.

**Analogy.** A bank transfer: the money leaves account A and arrives in account B, or neither happens. You never see the money 'in the air'.

**Where the analogy breaks.** The picture is one bank. Across two databases or two services you usually can't use one ACID transaction, so you need patterns like sagas instead.

**Example.** Transfer £100: begin, take £100 from A (only if A has it), add £100 to B, commit. If anything fails, roll back and both balances are unchanged.

**Must-know points**

- Anomalies: dirty reads, non-repeatable reads, phantom reads, lost updates, write skew.
- Read committed (a common default) stops dirty reads; repeatable read or snapshot stops non-repeatable reads; serializable stops all of them but is slowest.
- Lost-update fixes: SELECT … FOR UPDATE (pessimistic lock) or a version column (optimistic locking).
- Durability comes from a write-ahead log saved to disk before the commit is confirmed.
- Distributed transactions (two-phase commit) exist but are slow and fragile; prefer sagas across services.

**Common mistakes**

- Checking a balance in one query and updating it in another without a lock: a lost update.
- Assuming the default isolation level prevents every anomaly.
- Keeping a transaction open for a long time (for example, while calling another service), which holds locks and blocks others.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100
 WHERE id = 'A' AND balance >= 100;   -- if 0 rows changed: ROLLBACK
UPDATE accounts SET balance = balance + 100
 WHERE id = 'B';
COMMIT;
```

**Your interview answer** (say it out loud)

> For anything involving money or stock I'd use ACID transactions in a relational database. To stop two users buying the last item, I'd use a row lock with SELECT FOR UPDATE or optimistic locking with a version number, and pick the isolation level that blocks the anomalies that matter.

**Follow-up questions**

- **Q: Optimistic or pessimistic locking?** Pessimistic locks the row before changing it: safe under heavy contention, but others wait. Optimistic reads a version and only updates if the version hasn't changed: fast when conflicts are rare, with a retry when they happen.
- **Q: What is write skew?** Two transactions read the same data, each makes a decision, and each writes a different row, together breaking a rule — like two doctors both going off call at once. Serializable isolation prevents it.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain each letter of ACID with the bank-transfer picture.
2. **Draw:** Draw a timeline of two transactions running at the same time and causing a lost update.
3. **Apply:** Using SQLite in Python, write a transfer function that rolls back if the sender doesn't have enough money. Then run two transfers at once.
4. **Trade-offs:** Why not run everything at serializable isolation?

**Free resources (optional)**

- *Watch:* [CMU 15-445 Intro to Database Systems: transactions](https://www.youtube.com/results?search_query=CMU+15-445+database+systems+transactions) (Andy Pavlo, Carnegie Mellon · free on YouTube)
- *Watch:* [ByteByteGo: ACID properties](https://www.youtube.com/results?search_query=ByteByteGo+ACID+properties) (ByteByteGo · YouTube)
- *Read:* [Transaction isolation](https://www.google.com/search?q=PostgreSQL+documentation+transaction+isolation) (PostgreSQL documentation)

[Back to contents](#contents)

### 3.3 Database indexing

*Must know*

**Definition.** An index is an extra data structure that lets the database find rows without scanning the whole table.

**The problem it solves.** Finding one row among 100 million by checking every row takes seconds. Users and other services can't wait that long, and the database burns CPU doing it.

**The idea.** Most databases use B-tree indexes: sorted, balanced trees that find a value in a few steps and also support ranges and sorting. Indexes make reads fast but writes slower, because every index must be updated, and they use extra storage. Composite indexes cover several columns, and the column order matters.

**How it works, step by step**

1. Without an index, WHERE email = 'a@b.com' reads every row: a full table scan.
2. CREATE INDEX on email builds a B-tree: a sorted tree where each step down cuts the search space enormously.
3. With 100 million rows the tree is only about 4–5 levels deep, so finding the row takes a handful of reads instead of millions.
4. The index stores the email plus a pointer to the row, and the database follows that pointer.
5. Every INSERT, or UPDATE of the email, must also update the tree, which costs time.
6. EXPLAIN shows the plan: 'Index Scan' is good; 'Seq Scan' on a big table means no useful index was found.

**Analogy.** The index at the back of a textbook: you look up 'eigenvalue — page 212' instead of reading every page.

**Where the analogy breaks.** A book's index is written once. A database index is updated on every insert and update, which is why adding indexes to a write-heavy table has a real cost.

**Example.** SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20 is fast with an index on (user_id, created_at). Without it, the database scans millions of rows.

**Must-know points**

- B-tree: equality and range queries, and ORDER BY. Hash index: equality only.
- A composite index on (a, b) helps queries on a, or on a and b, but not on b alone (the leftmost-prefix rule).
- Covering index: contains every column the query needs, so the table itself isn't read.
- Every index slows writes and uses storage; index for your real queries only.
- Use EXPLAIN to check whether a query uses an index.
- LSM trees (Cassandra, RocksDB): very fast writes, merged in the background.

**Common mistakes**

- Indexing every column 'just in case'.
- A composite index with the columns in the wrong order.
- Wrapping the column in a function (WHERE LOWER(email) = …) so the index can't be used.

```sql
CREATE INDEX idx_orders_user_time ON orders (user_id, created_at);

EXPLAIN SELECT * FROM orders
WHERE user_id = 42
ORDER BY created_at DESC LIMIT 20;
```

**Your interview answer** (say it out loud)

> I'd add indexes that match the main queries: for 'latest orders for a user', a composite index on user_id and created_at. I'd check with EXPLAIN, and avoid indexing everything, since every index slows writes.

**Follow-up questions**

- **Q: Why doesn't an index on (a, b) help a query on b alone?** The index is sorted by a first, so values of b are scattered all through it — like a phone book sorted by surname being no help for finding a first name.
- **Q: B-tree or LSM tree?** B-trees update in place and are great for reads. LSM trees append writes and merge later, so writes are faster, but a read may check several files.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain an index with the textbook picture, and why it slows writes.
2. **Draw:** Draw a small B-tree for 10 numbers, and the path to find one of them.
3. **Apply:** In SQLite, make a table with 1 million rows, time a query, add an index and time it again. Use EXPLAIN QUERY PLAN to see the difference.
4. **Trade-offs:** A table receives 50,000 writes a second and has 9 indexes. What would you check and change?

**Free resources (optional)**

- *Watch:* [CMU 15-445 Intro to Database Systems: storage and retrieval](https://www.youtube.com/results?search_query=CMU+15-445+database+systems+storage+and+retrieval) (Andy Pavlo, Carnegie Mellon · free on YouTube)
- *Watch:* [ByteByteGo: database indexing explained](https://www.youtube.com/results?search_query=ByteByteGo+database+indexing+explained) (ByteByteGo · YouTube)
- *Read:* [Use The Index, Luke](https://use-the-index-luke.com/) (Markus Winand, free)

[Back to contents](#contents)

### 3.4 Replication

*Must know*

**Definition.** Replication keeps copies of the same data on several machines.

**The problem it solves.** One copy of your data is a single point of failure, and one machine can only answer so many reads. You need copies — and then you have to keep them in agreement.

**The idea.** Copies give you availability (another copy takes over when one fails), durability, and more read capacity. In leader–follower replication, all writes go to the leader and the followers copy them; reads can go to followers. Copying can be synchronous (safe but slower) or asynchronous (fast, but followers can lag behind). Multi-leader and leaderless designs allow writes in several places but must resolve conflicts.

**How it works, step by step**

1. A write arrives at the leader. The leader saves it and adds it to its replication log.
2. Followers read that log and apply the same changes in the same order.
3. Synchronous: the leader waits until a follower confirms before telling the client 'done'. Asynchronous: it replies immediately and the followers catch up.
4. Reads can go to followers to spread the load, but they may be slightly behind.
5. If the leader dies: notice it (missed heartbeats), pick the most up-to-date follower, promote it, and send writes to it.

**Analogy.** A teacher writes on the main whiteboard and assistants copy it onto boards in other rooms. Students in those rooms may see each update a moment later.

**Where the analogy breaks.** Assistants copy perfectly and in order. Real followers can lag seconds behind or miss updates during failures, and if the main board breaks, safely choosing a new 'main board' (failover) is tricky.

**Example.** A user changes their profile name and refreshes, but the read goes to a lagging replica and shows the old name. Fix: 'read your own writes' — send that user's reads to the leader for a short time after a write.

**Must-know points**

- Leader–follower: simple and common; all writes go through one leader.
- Synchronous: no data loss on failover, but slower writes. Asynchronous: fast, but recent writes can be lost.
- Replication lag causes stale reads; fixes include read-your-own-writes and monotonic reads.
- Failover: detect that the leader is dead, promote a follower, redirect writes. Risk: split brain.
- Multi-leader: writes in several regions; conflicts need rules (last write wins, merging).
- Leaderless (Dynamo-style): quorums with W + R > N.

**Common mistakes**

- Reading from a replica straight after a write, and being surprised by old data.
- Fully asynchronous replication for data you can't afford to lose.
- Automatic failover with no protection against two leaders (split brain).

**Your interview answer** (say it out loud)

> I'd use leader–follower replication: writes to the leader, reads spread across replicas, with at least one synchronous replica in another zone for safe failover. Screens where users must see their own change straight away read from the leader.

**Follow-up questions**

- **Q: What is split brain?** Two nodes both believe they're the leader and both accept writes, creating conflicting data. Prevented with consensus, quorums or fencing tokens.
- **Q: Replication or sharding?** Replication copies the same data to many machines (availability, read capacity). Sharding splits different data across machines (write capacity, storage). Big systems do both.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain leader–follower replication and replication lag with the whiteboard picture.
2. **Draw:** Draw a leader with two followers, one synchronous and one asynchronous, and the path of a write.
3. **Apply:** Users see their old profile right after updating it. Explain why, and give two fixes.
4. **Trade-offs:** Synchronous or asynchronous replication for a payment ledger? For a social feed?

**Free resources (optional)**

- *Watch:* [Distributed Systems lecture series: replication](https://www.youtube.com/results?search_query=Martin+Kleppmann+distributed+systems+lecture+replication) (Martin Kleppmann, University of Cambridge · free on YouTube)
- *Watch:* [ByteByteGo: database replication explained](https://www.youtube.com/results?search_query=ByteByteGo+database+replication+explained) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 3.5 Partitioning and sharding

*Must know*

**Definition.** Sharding splits a large dataset across several databases (shards), each holding part of the data.

**The problem it solves.** Even the biggest single database has limits on storage and write speed. When your data or writes outgrow it, you have to split the data across machines.

**The idea.** When one database can't handle the writes or the data size, you split it by a shard key. Range sharding (A–M, N–Z) keeps neighbouring keys together but can create hot spots. Hash sharding spreads data evenly but makes range queries harder. The shard key is the biggest decision: it decides balance, which queries stay on one shard, and how hard it is to add shards later.

**How it works, step by step**

1. Choose a shard key that matches your main query, such as user_id.
2. A routing rule maps each key to a shard: for example, shard = hash(user_id) % 16.
3. The application, or a proxy, uses that rule to send each query to the right shard.
4. Queries by user_id hit one shard and are fast. Queries across all users must ask every shard and merge the results, which is slow.
5. To add capacity, split shards or move some keys. Consistent hashing, or many small logical shards, makes this much easier.

**Analogy.** A library too big for one building, split across several buildings: by the author's first letter, or by a code that spreads the books evenly.

**Where the analogy breaks.** Library visitors can walk between buildings. Queries that need data from many shards (joins, global counts) are slow and complicated, so you choose the shard key around the main queries.

**Example.** An Instagram-like app shards user data by a hash of user_id, so one user's posts all live on the same shard and 'show my profile' touches one database.

**Must-know points**

- A good shard key: many distinct values, an even spread, and it matches the main access pattern.
- Hash sharding: even load, poor for ranges. Range sharding: good for ranges, risk of hot spots.
- Hot keys (a celebrity) can overload one shard: split them further, or cache them.
- Cross-shard joins and transactions are hard: design so you don't need them.
- Resharding is painful; consistent hashing or many small logical shards make it easier.
- Shard only when needed: try caching, read replicas and a bigger machine first.

**Common mistakes**

- A shard key with few values (like country), which creates huge, uneven shards.
- A time-based key that sends every new write to the same shard.
- Designs whose common requests need joins or transactions across shards.

**Your interview answer** (say it out loud)

> Once writes or data outgrow one database, I'd shard by a key that matches the main query — here user_id, hashed for an even spread — so a user's data lives on one shard. I'd use consistent hashing or many logical shards to make adding machines easier, and handle very hot users with caching.

**Follow-up questions**

- **Q: Why not shard by created_at?** All new writes would land on the newest shard, a hot spot, while the old shards sit idle.
- **Q: How do you query across shards?** Scatter-gather (ask every shard, merge the results), or keep a separate index or a precomputed view built for that query.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain sharding and the shard key with the library-buildings picture.
2. **Draw:** Draw 4 shards with hash(user_id) % 4 routing, and show what happens when you add a fifth.
3. **Apply:** Choose a shard key for: a chat app's messages, an online shop's orders, a URL shortener. Justify each.
4. **Trade-offs:** Range or hash sharding for sensor readings that are always queried by time range?

**Free resources (optional)**

- *Watch:* [Distributed Systems lecture series: partitioning](https://www.youtube.com/results?search_query=Martin+Kleppmann+distributed+systems+lecture+partitioning) (Martin Kleppmann, University of Cambridge · free on YouTube)
- *Watch:* [ByteByteGo: database sharding](https://www.youtube.com/results?search_query=ByteByteGo+database+sharding) (ByteByteGo · YouTube)
- *Read:* [The System Design Primer](https://github.com/donnemartin/system-design-primer) (Donne Martin · GitHub, free)

[Back to contents](#contents)

### 3.6 Consistent hashing

*Should know*

**Definition.** Consistent hashing assigns keys to servers so that adding or removing a server moves only a small share of the keys.

**The problem it solves.** If you place keys with hash(key) % N, adding or removing one server changes N and almost every key moves. For a cache, that means almost every request suddenly misses at once.

**The idea.** With simple hash(key) % N, changing N from 4 to 5 moves almost every key, which is a disaster for a cache. Consistent hashing places both servers and keys on a ring; each key belongs to the next server clockwise. Adding a server only takes keys from its neighbour. Virtual nodes, where each server appears many times on the ring, keep the load even.

**How it works, step by step**

1. Picture a ring of numbers from 0 up to a huge maximum.
2. Hash each server's name to a position on the ring. With virtual nodes, each server gets many positions.
3. Hash each key to a position, then walk clockwise to the first server you meet: that server owns the key.
4. Add a server: it only takes the keys between itself and the server before it. Everything else stays where it is.
5. Remove a server: its keys move to the next server clockwise — spread across many servers if you use virtual nodes.

**Analogy.** A round table where each guest serves the dishes between themselves and the guest before them. A new guest sitting down only takes dishes from one neighbour.

**Where the analogy breaks.** At a table, guests sit evenly spaced. Random positions on the ring are uneven, so one server can end up with far more keys. Virtual nodes fix this by giving each server many seats.

**Example.** Going from 4 to 5 servers with hash % N moves about 80% of the keys. With consistent hashing, only about 20% (roughly 1 in 5) move.

**Must-know points**

- hash % N moves most keys whenever N changes.
- The ring: a key belongs to the first server clockwise from it.
- Adding or removing a server moves about 1/N of the keys.
- Virtual nodes even out the load and spread a dead server's keys across many others.
- Used in: Cassandra, DynamoDB, distributed caches, some load balancers.

**Common mistakes**

- Too few virtual nodes, so the load is uneven.
- Assuming it fixes hot keys. It doesn't.
- Forgetting replication: each key usually lives on the next 2–3 servers on the ring, not just one.

```python
import bisect, hashlib

def h(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)

class Ring:
    def __init__(self, servers, vnodes=100):
        self.points = sorted((h(f"{s}#{i}"), s) for s in servers for i in range(vnodes))
        self.keys = [p for p, _ in self.points]

    def server_for(self, key):
        i = bisect.bisect(self.keys, h(key)) % len(self.points)
        return self.points[i][1]
```

**Your interview answer** (say it out loud)

> For a distributed cache or a sharded store I'd use consistent hashing with virtual nodes, so adding or removing a node moves only about 1/N of the keys instead of nearly all of them, and load stays balanced.

**Follow-up questions**

- **Q: Why virtual nodes?** With few servers, random ring positions are uneven. Many points per server average this out, and a failed server's keys spread over many servers instead of overloading one neighbour.
- **Q: What doesn't consistent hashing solve?** Hot keys. One extremely popular key still lands on one server; you need replication or caching for that.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain, with numbers, why hash % N is bad when the number of servers changes.
2. **Draw:** Draw a ring with 3 servers and 6 keys, then add a fourth server and show which keys move.
3. **Apply:** Implement the ring below, map 10,000 keys to 4 servers, add a fifth, and count how many keys moved. Then try again with vnodes=1.
4. **Trade-offs:** When would plain hash % N still be acceptable?

**Free resources (optional)**

- *Watch:* [ByteByteGo: consistent hashing](https://www.youtube.com/results?search_query=ByteByteGo+consistent+hashing) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design consistent hashing](https://www.google.com/search?q=Hello+Interview+design+consistent+hashing) (hellointerview.com · free guides)
- *Read:* [Consistent hashing](https://www.google.com/search?q=Tom+White+consistent+hashing+blog) (Tom White's blog)

[Back to contents](#contents)

### 3.7 Object storage (S3) for files and media

*Must know*

**Definition.** Object storage keeps files ('objects') such as images, videos and backups as a key pointing to bytes plus metadata, in a cheap, very durable, almost unlimited store like Amazon S3.

**The problem it solves.** Photos, videos, backups and documents are big and numerous. Storing them in a database bloats it, slows backups and costs a lot; storing them on one server's disk breaks scaling.

**The idea.** Databases are bad at holding big files. Instead, store the file in object storage and keep only its key or URL in the database. Clients can upload straight to storage with a pre-signed URL, so big files never pass through your servers. Put a CDN in front for fast downloads.

**How it works, step by step**

1. The client asks your API: 'I want to upload a photo'.
2. The API checks the user, then asks the storage service for a pre-signed URL: a link that allows one upload, to one key, for a few minutes.
3. The client uploads the file straight to that URL. Your servers never touch the bytes.
4. The API saves a row: photo ID, owner, object key, size and created time.
5. To show the photo, the app uses a CDN URL for that key, or a short-lived signed download link for private files.

**Analogy.** A cloakroom: you hand in your coat (the file) and get a ticket (the key). The ticket goes in your pocket (the database).

**Where the analogy breaks.** In a cloakroom you could swap a coat's buttons in place. Objects are usually replaced whole, not edited in the middle, so object storage is for files, not for records that change often.

**Example.** Profile photo upload: the app asks the API for a pre-signed URL, uploads straight to S3, then the API saves 'users/42/avatar.jpg' in the users table.

**Must-know points**

- Big binary data goes in object storage; the metadata and key go in the database.
- Pre-signed URLs let clients upload or download directly and securely, for a limited time.
- Very durable (S3 is designed for 99.999999999%, 'eleven nines') and cheap per GB.
- Storage classes: hot (frequent access) and cold or archive (cheap, slow to get back).
- Large uploads use multipart upload: in chunks, retryable and resumable.

**Common mistakes**

- Putting files in database BLOB columns.
- Making a storage bucket public by accident.
- Sending big uploads through your own app servers.

**Your interview answer** (say it out loud)

> Files go in object storage like S3, never in the database. The database keeps the object key and metadata. Clients upload directly using pre-signed URLs, and downloads go through a CDN.

**Follow-up questions**

- **Q: Why not store images in the database?** It bloats the database, slows backups and replication, and wastes expensive database capacity on cheap bytes.
- **Q: How do you upload 2 GB over a bad connection?** Multipart upload: send it in chunks, retry the failed ones, and resume instead of starting again.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain object storage with the cloakroom picture.
2. **Draw:** Draw the upload flow with a pre-signed URL: client, API, S3 and database.
3. **Apply:** Design storage for a photo app: where do the original image, the thumbnails and the metadata go?
4. **Trade-offs:** When would you use a normal file system or block storage instead?

**Free resources (optional)**

- *Watch:* [ByteByteGo: how S3 works](https://www.youtube.com/results?search_query=ByteByteGo+how+S3+works) (ByteByteGo · YouTube)
- *Read:* [What is Amazon S3?](https://www.google.com/search?q=What+is+Amazon+S3+AWS+documentation) (AWS documentation)
- *Read:* [Hello Interview: S3-like object storage](https://www.google.com/search?q=Hello+Interview+S3-like+object+storage) (hellointerview.com · free guides)

[Back to contents](#contents)

### 3.8 Search: inverted indexes and Elasticsearch

*Should know*

**Definition.** Full-text search finds the documents that contain some words and ranks them by relevance. It's built on an inverted index: a map from each word to the documents containing it.

**The problem it solves.** Users type words, not IDs, and they expect the best matches first, even with typos. Normal database indexes can't do that efficiently.

**The idea.** A SQL query like LIKE '%shoe%' scans every row. A search engine builds an inverted index in advance ('shoe' → documents 3, 17, 42), so lookups are fast. It also handles word forms (running → run), typos, and ranking (for example BM25). Search engines like Elasticsearch are usually a second store, filled from the main database.

**How it works, step by step**

1. Indexing: each document's text is split into words, lowercased, and reduced to stems ('Running Shoes' → 'run', 'shoe').
2. For each word, the engine adds the document's ID to that word's posting list.
3. A search for 'red shoes' looks up the lists for 'red' and 'shoe' and intersects them, giving the documents that contain both.
4. Each match gets a score: words that are rare overall but frequent in this document score higher (TF-IDF or BM25), and business signals like popularity can be added.
5. The top results are returned. The index is split across many shards, which are searched in parallel.

**Analogy.** The index at the back of a cookbook that lists, for each ingredient, every recipe page that uses it.

**Where the analogy breaks.** A cookbook index is exact. Search must also guess what the user meant — misspellings, synonyms, word forms — and rank thousands of matches, which is a whole field of its own.

**Example.** An online shop writes products to PostgreSQL, streams every change to Elasticsearch, and serves the search box from Elasticsearch.

**Must-know points**

- Inverted index: each term → a list of document IDs (a posting list).
- Text analysis: lowercase, split into words, drop stop words, reduce words to their stem.
- Ranking: TF-IDF or BM25 relevance, plus business signals like popularity.
- The database stays the source of truth; keep the search index in sync with change events.
- Search results are eventually consistent with the database.

**Common mistakes**

- Making the search engine the source of truth.
- Forgetting that new or changed items take a moment to become searchable.
- Using LIKE '%word%' on large tables.

```python
from collections import defaultdict

docs = {1: "red running shoes", 2: "blue shoes", 3: "red hat"}
index = defaultdict(set)
for doc_id, text in docs.items():
    for word in text.lower().split():
        index[word].add(doc_id)

index["red"] & index["shoes"]    # {1}: documents with both words
```

**Your interview answer** (say it out loud)

> For text search I'd use a search engine like Elasticsearch, built on inverted indexes and fed from the main database through change events. The database stays the source of truth; search can lag by a second or two.

**Follow-up questions**

- **Q: Why not just use SQL LIKE?** A LIKE with a leading wildcard can't use a normal index, so it scans every row, and it can't rank results or handle typos.
- **Q: How do you keep search in sync?** Publish changes, or read them from the database's log (change data capture), onto a queue, and let an indexer update the search engine.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain an inverted index with the cookbook picture.
2. **Draw:** Draw database → change stream → indexer → search engine → search API.
3. **Apply:** Extend the code below to 1,000 product titles, with lowercasing and simple stemming, and support AND queries.
4. **Trade-offs:** When is PostgreSQL's built-in full-text search enough, and when do you need Elasticsearch?

**Free resources (optional)**

- *Watch:* [ByteByteGo: how Elasticsearch works](https://www.youtube.com/results?search_query=ByteByteGo+how+Elasticsearch+works) (ByteByteGo · YouTube)
- *Read:* [Introduction to Information Retrieval, Ch 1 (Boolean retrieval)](https://nlp.stanford.edu/IR-book/) (Manning, Raghavan, Schütze · free)
- *Read:* [Hello Interview: Elasticsearch deep dive](https://www.google.com/search?q=Hello+Interview+Elasticsearch+deep+dive) (hellointerview.com · free guides)

[Back to contents](#contents)

### 3.9 Unique ID generation

*Should know*

**Definition.** Generating IDs that are unique across many servers, without one shared database counter.

**The problem it solves.** Every order, message and user needs an ID that never repeats. With many servers creating records at the same moment, one shared counter becomes a bottleneck and a single point of failure.

**The idea.** A single auto-increment counter becomes a bottleneck at scale. Options: UUIDs (random, no coordination, 128-bit, but version 4 isn't ordered by time), a ticket server that hands out ranges of numbers, or Snowflake-style IDs: 64-bit numbers made from a timestamp, a machine ID and a sequence number. They're unique, roughly ordered by time, and generated locally.

**How it works, step by step**

1. A Snowflake ID is built as: timestamp (41 bits), then machine ID (10 bits), then sequence (12 bits).
2. Each machine gets a unique machine ID when it starts, from configuration or a coordinator.
3. For each new ID within the same millisecond, the machine adds one to its sequence (0 up to 4,095).
4. If the sequence runs out, the machine waits for the next millisecond.
5. Because the timestamp comes first, IDs made later are bigger, so they sort roughly by time.

**Analogy.** Ticket numbers at a deli with several ticket machines. Each machine prints its own machine code plus the time, so tickets never clash.

**Where the analogy breaks.** Deli machines share one wall clock. Servers' clocks drift, and a clock that jumps backwards could create duplicate Snowflake IDs, so the generator must notice and wait.

**Example.** Snowflake: 41 bits of milliseconds since a chosen start date, 10 bits of machine ID, and 12 bits of sequence, so each machine can make 4,096 IDs per millisecond.

**Must-know points**

- Auto-increment: simple, but a single point of failure and a bottleneck, and it reveals your counts.
- UUID v4: no coordination, 128 bits, random order (bad for inserts into a B-tree index).
- UUID v7 and ULID: ordered by time and still need no coordination.
- Snowflake: 64 bits, sortable by time; needs unique machine IDs and sane clocks.
- Range allocation: each server reserves a block of, say, 1,000 IDs at a time.

**Common mistakes**

- Two machines accidentally sharing a machine ID.
- Ignoring clock problems.
- Exposing sequential IDs that let outsiders count your orders or guess other users' links.

**Your interview answer** (say it out loud)

> I'd use Snowflake-style 64-bit IDs: timestamp, machine ID and a per-millisecond sequence. They're generated locally without coordination, they're unique, and they sort roughly by time, which keeps database indexes efficient.

**Follow-up questions**

- **Q: Why not UUID v4 everywhere?** 128 bits is bigger, and random order scatters inserts across a B-tree index, which hurts write speed. Time-ordered UUID v7 avoids that.
- **Q: What if the clock goes backwards?** Detect it, and wait until the clock catches up (or refuse to generate), so an ID is never repeated.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the three parts of a Snowflake ID and why each one is needed.
2. **Draw:** Draw the 64 bits of a Snowflake ID, with the size of each part.
3. **Apply:** Implement a Snowflake generator in Python, create 100,000 IDs in a loop, and check they're unique and increasing.
4. **Trade-offs:** Compare UUID v4, UUID v7 and Snowflake as the primary key of a write-heavy table.

**Free resources (optional)**

- *Watch:* [ByteByteGo: unique ID generator](https://www.youtube.com/results?search_query=ByteByteGo+unique+ID+generator) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a unique ID generator in distributed systems](https://www.google.com/search?q=Hello+Interview+design+a+unique+ID+generator+in+distributed+systems) (hellointerview.com · free guides)
- *Read:* [Announcing Snowflake](https://www.google.com/search?q=Twitter+engineering+blog+announcing+Snowflake) (Twitter engineering blog)

[Back to contents](#contents)

---

## Phase 4: Distributed systems and security

How services split up and stay correct across a network, how machines agree, and how to keep users and data secure.

> **The big picture.** Once a system is many services on many machines, function calls become network calls that can fail halfway. These topics are about staying correct anyway, and about making sure only the right people can do the right things.

### 4.1 Monolith vs microservices

*Must know*

**Definition.** A monolith is one deployable application. Microservices split the system into small services, each owning one business capability and its own data, talking over the network.

**The problem it solves.** As a product and team grow, one big codebase becomes slow to build, risky to deploy and hard for many teams to work on at once. But splitting it creates network and data problems.

**The idea.** A monolith is simpler to build, test and deploy at first. Microservices let teams deploy independently and scale parts separately, but add network calls, partial failures, distributed data and running costs. A good path: start with a well-structured (modular) monolith, and split off services when there's a clear reason.

**How it works, step by step**

1. Find boundaries around business capabilities: users, catalogue, orders, payments.
2. Give each service its own database. Other services get its data only through its API or its events.
3. Use synchronous calls (REST or gRPC) when an answer is needed now, and events for things that can happen later.
4. Put a gateway at the edge, add tracing across services, and give each service its own deployment pipeline.
5. Split gradually: carve one service out of the monolith at a time (the 'strangler fig' approach).

**Analogy.** A monolith is a Swiss army knife: one tool, many blades. Microservices are a toolbox of separate tools: each is better and replaceable, but you need a box, labels and more organisation.

**Where the analogy breaks.** Tools in a box don't depend on each other. Services call each other over a network that can be slow or fail, so 50 carelessly built services can be far less reliable than one knife.

**Example.** An online shop splits into user, catalogue, order, payment and notification services, each with its own database. The order service publishes 'order placed' events that the payment and notification services react to.

**Must-know points**

- Each service owns its data; services don't share a database.
- They communicate through APIs (synchronous) or events (asynchronous).
- You'll need: service discovery, an API gateway, distributed tracing, and a deployment pipeline per service.
- Data consistency across services is eventual; use sagas for multi-step workflows.
- Conway's law: a system's structure tends to mirror the teams that build it.

**Common mistakes**

- Splitting by technical layer (a 'database service') instead of by business capability.
- Chains of synchronous calls six services deep.
- A small team starting a new product as 30 microservices.

**Trade-offs**

- Monolith: simple, fast to change early, one deployment; can become tangled and hard for many teams.
- Microservices: independent deployments and scaling; network failures, complexity and data consistency costs.

**Your interview answer** (say it out loud)

> I'd start with a modular monolith unless there's a clear need for independent scaling or many separate teams. If we split, each service owns its data, services talk through APIs and events, and we invest in a gateway, tracing and automated deployments from day one.

**Follow-up questions**

- **Q: What's a 'distributed monolith'?** Services that are split up but so tightly coupled they must be deployed together: all the costs of microservices and none of the benefits.
- **Q: Why not share one database between services?** It couples them: a schema change for one breaks the others, and no service truly owns its data.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain monolith versus microservices with the knife-and-toolbox picture.
2. **Draw:** Draw an online shop as 5 microservices with their databases, marking synchronous calls and asynchronous events.
3. **Apply:** List 3 signs that a monolith should be split, and 3 signs that it shouldn't be yet.
4. **Trade-offs:** What new kinds of failure appear when a function call becomes a network call?

**Free resources (optional)**

- *Watch:* [ByteByteGo: monolith vs microservices](https://www.youtube.com/results?search_query=ByteByteGo+monolith+vs+microservices) (ByteByteGo · YouTube)
- *Read:* [Microservices](https://martinfowler.com/articles/microservices.html) (Martin Fowler and James Lewis)
- *Read:* [Microservice architecture patterns](https://microservices.io/patterns/) (microservices.io, free)

[Back to contents](#contents)

### 4.2 Distributed transactions: sagas and the outbox pattern

*Should know*

**Definition.** A saga runs a business process across several services as a series of local transactions, with a compensating action to undo each step if a later step fails.

**The problem it solves.** An order needs stock reserved, a card charged and a shipment booked, in three different services with three databases. No single transaction can cover all three, but you still can't leave an order half done.

**The idea.** Across services you can't wrap everything in one ACID transaction. A saga runs steps one by one — reserve stock, charge the card, create the shipment — and if charging fails, it runs compensations, like releasing the stock. Steps are coordinated by choreography (services react to each other's events) or orchestration (a central coordinator tells each step what to do). The outbox pattern makes 'update my database and publish an event' reliable: write the event into an outbox table in the same transaction, then publish it.

**How it works, step by step**

1. The orchestrator starts the saga: 'reserve stock'. The stock service reserves it and replies OK.
2. Next, 'charge the card'. The payment service tries, and the card is declined.
3. The orchestrator runs the compensations in reverse order: 'release the stock'.
4. The order is marked FAILED and the user is told.
5. Outbox: each service, in the same local transaction as its change, writes an event row into an outbox table. A relay reads new rows and publishes them, retrying until it succeeds.

**Analogy.** Booking a holiday: flight, hotel, car. If the car booking fails, you cancel the hotel and the flight. You don't pretend the trip never happened; you undo each step.

**Where the analogy breaks.** When you cancel a holiday, nobody else sees the half-booked state. In a saga, other users can see the in-between state (stock reserved, then released), so every step and compensation must allow for that, and be idempotent.

**Example.** The order service writes the order and an 'OrderCreated' outbox row in one transaction; a relay publishes it to Kafka; the payment service charges the card, or emits 'PaymentFailed' if it's declined; the order service then cancels the order.

**Must-know points**

- Two-phase commit (2PC) gives an atomic commit across databases, but blocks on failures and couples services.
- Saga = local transactions + compensating actions.
- Choreography: decentralised, event-driven, but hard to follow as it grows. Orchestration: a central workflow, clearer, one more component.
- Outbox pattern: avoids the dual-write problem (the database update succeeds but publishing the event fails).
- Every step and compensation must be idempotent, because messages can arrive twice.

**Common mistakes**

- Forgetting compensations, or making them unsafe to repeat.
- Publishing events outside the database transaction (the dual-write problem).
- Using two-phase commit across services and creating fragile coupling.

**Your interview answer** (say it out loud)

> For checkout across services I'd use an orchestrated saga: reserve stock, take payment, confirm the order, with a compensating step for each. Each service writes its state change and its outgoing event atomically using the outbox pattern, and every handler is idempotent.

**Follow-up questions**

- **Q: What is the dual-write problem?** Writing to the database and publishing to a queue as two separate steps. If one succeeds and the other fails, the systems disagree. The outbox pattern makes it one transaction.
- **Q: Why not use two-phase commit?** It holds locks until every participant agrees, and if the coordinator fails, participants can be stuck. It also works poorly across different technologies.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain a saga with the holiday-booking picture.
2. **Draw:** Draw an orchestrated checkout saga, with its normal path and its compensation path.
3. **Apply:** Write the outbox table schema, and the steps a relay process follows to publish events safely.
4. **Trade-offs:** Choreography or orchestration for a 6-step loan application? Justify your choice.

**Free resources (optional)**

- *Watch:* [ByteByteGo: saga pattern](https://www.youtube.com/results?search_query=ByteByteGo+saga+pattern) (ByteByteGo · YouTube)
- *Read:* [Pattern: Saga](https://microservices.io/patterns/data/saga.html) (microservices.io, free)
- *Read:* [Pattern: Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) (microservices.io, free)

[Back to contents](#contents)

### 4.3 Consensus and leader election (Raft)

*Bonus*

**Definition.** Consensus is getting several machines to agree on a value — such as who the leader is, or the order of operations — even when some of them fail.

**The problem it solves.** Several machines need to agree, even when some crash or messages are delayed. If two of them both believe they're in charge, data gets corrupted.

**The idea.** Many systems need exactly one leader, or one agreed order of changes. Raft does this: nodes elect a leader by majority vote; the leader adds commands to its log and copies them to the others; an entry is committed once a majority has it. With 5 nodes, the cluster survives 2 failures. Tools like etcd and ZooKeeper give you this, so you don't build it yourself.

**How it works, step by step**

1. Every node starts as a follower. If a follower hears nothing from a leader for a random timeout (say 150–300 ms), it becomes a candidate.
2. The candidate increases the term number and asks the others for their votes. Each node votes once per term.
3. With votes from a majority, it becomes the leader and sends regular heartbeats.
4. Clients send writes to the leader, which adds each one to its log and sends it to the followers.
5. Once a majority have stored an entry, it's committed and applied, and the leader tells the followers.
6. If the leader fails, the heartbeats stop, a new election begins, and the new leader's log becomes the reference.

**Analogy.** A committee that decides by majority vote. As long as most members are present, decisions stand, and two separate groups can never both be the majority.

**Where the analogy breaks.** A committee meets in one room. Machines talk over unreliable networks with delays, so Raft needs terms (numbered elections) and timeouts to stop two leaders acting at once.

**Example.** Kubernetes stores its cluster state in etcd, which uses Raft. A 3-node etcd cluster keeps working if 1 node fails.

**Must-know points**

- Majority (quorum) = more than half; a cluster of N tolerates (N − 1) ÷ 2 failures, so use odd sizes like 3 or 5.
- Raft roles: follower, candidate, leader. Terms stop an old leader from acting.
- Randomised election timeouts avoid split votes.
- Used for: leader election, distributed locks, configuration and metadata.
- Don't build your own: use etcd, ZooKeeper or a managed service.

**Common mistakes**

- Running an even number of nodes.
- Thinking the smaller side of a partition can still accept writes.
- Building your own consensus instead of using a tested system.

**Your interview answer** (say it out loud)

> Where we need a single leader or a distributed lock, I'd rely on a consensus system like etcd or ZooKeeper. It uses Raft or a similar protocol, so a majority must agree and the cluster survives the failure of a minority of nodes.

**Follow-up questions**

- **Q: Why odd numbers of nodes?** A 4-node cluster needs 3 for a majority and still only survives 1 failure — the same as 3 nodes, at higher cost.
- **Q: What is a fencing token?** An increasing number handed out with a lock. Storage rejects writes carrying an older number, so a paused old leader can't corrupt data when it wakes up.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain majority voting, and why it prevents two leaders, with the committee picture.
2. **Draw:** Draw a 5-node Raft cluster copying one log entry, and mark the moment it's committed.
3. **Apply:** Use the Raft visualisation to watch an election and a leader failure, and write down the sequence of events.
4. **Trade-offs:** Why does consensus make writes slower, and when is that worth it?

**Free resources (optional)**

- *Watch:* [Distributed Systems lecture series: consistency and consensus](https://www.youtube.com/results?search_query=Martin+Kleppmann+distributed+systems+lecture+consistency+and+consensus) (Martin Kleppmann, University of Cambridge · free on YouTube)
- *Read:* [Raft, visualised](https://thesecretlivesofdata.com/raft/) (The Secret Lives of Data, free)
- *Read:* [The Raft consensus algorithm](https://raft.github.io/) (raft.github.io)

[Back to contents](#contents)

### 4.4 Security basics: authentication, authorisation, OAuth and JWT

*Must know*

**Definition.** Authentication checks who you are. Authorisation checks what you're allowed to do.

**The problem it solves.** Every system must know who is calling and what they may do, and must keep data safe even if something leaks. Mistakes here are the most expensive kind.

**The idea.** A user logs in once and gets a session ID or a token that proves who they are on later requests. A JWT is a signed token that services can check without a database lookup. OAuth 2.0 lets one app act on another service for a user without seeing their password; 'Sign in with Google' adds OpenID Connect on top. Also essential: HTTPS everywhere, passwords stored with a slow salted hash, least privilege, encryption at rest, and no secrets in code.

**How it works, step by step**

1. Login: the user sends their password over HTTPS. The server hashes it with the stored salt and compares the result with the stored hash.
2. If it matches (and the second factor is valid), the server issues a short-lived access token and a longer-lived refresh token.
3. Each request carries the access token. The gateway checks its signature and expiry without a database call.
4. The service checks authorisation: does this user own account 123? This check happens on the server, every time.
5. When the access token expires, the app swaps the refresh token for a new one. Logging out revokes the refresh token.

**Analogy.** A hotel: reception checks your passport (authentication) and gives you a key card that opens only your room and the gym (authorisation).

**Where the analogy breaks.** A key card can be switched off at reception instantly. A JWT stays valid until it expires, because services only check its signature, not a central list. So keep JWTs short-lived and use refresh tokens.

**Example.** A banking app: log in with a password plus a one-time code (multi-factor), get a 15-minute access token and a refresh token; the gateway checks the token's signature; the payments service checks the user owns the account before moving any money.

**Must-know points**

- Never store plain passwords: use a slow, salted hash (bcrypt, scrypt, Argon2).
- Session cookies (state kept on the server, easy to revoke) or JWTs (stateless, hard to revoke).
- OAuth 2.0 = delegated authorisation; OpenID Connect = login and identity on top of it.
- Authorisation models: role-based (RBAC) or attribute-based (ABAC). Check on every request, on the server.
- Defence in depth: TLS, input validation, rate limiting, least privilege, audit logs.
- Common attacks: SQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), credential stuffing.

**Common mistakes**

- Checking permissions only in the user interface.
- Long-lived JWTs that can't be revoked.
- Storing passwords with a fast hash (MD5, SHA-256) or without a salt.
- Secrets committed to Git.

**Your interview answer** (say it out loud)

> Authentication goes through an identity provider with multi-factor login, issuing short-lived access tokens and refresh tokens. The gateway verifies tokens, and each service enforces authorisation on every request — for example, that the user owns the account. Passwords are stored with a slow hash, everything runs over TLS, and sensitive data is encrypted at rest.

**Follow-up questions**

- **Q: How do you revoke a JWT?** Keep them short-lived, revoke the refresh token, and for urgent cases keep a small deny-list that the gateway checks.
- **Q: Why hash passwords with a slow algorithm?** If the database leaks, attackers have to try guesses one at a time, and a slow hash makes every guess expensive.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain authentication versus authorisation with the hotel picture.
2. **Draw:** Draw the login and token-refresh flow for a mobile app.
3. **Apply:** Write Python functions that hash and check a password with hashlib.scrypt and a random salt, and explain why the salt matters.
4. **Trade-offs:** Sessions or JWTs for a web app that must log a user out instantly when fraud is detected?

**Free resources (optional)**

- *Watch:* [ByteByteGo: OAuth 2.0 explained](https://www.youtube.com/results?search_query=ByteByteGo+OAuth+2.0+explained) (ByteByteGo · YouTube)
- *Read:* [OWASP Top Ten](https://owasp.org/www-project-top-ten/) (OWASP, free)
- *Read:* [Introduction to JSON Web Tokens](https://jwt.io/introduction) (jwt.io)

[Back to contents](#contents)

---

## Phase 5: Low-level design: OOP and SOLID

The building blocks of good class design: the four pillars of OOP, composition over inheritance, the five SOLID principles, class diagrams, and the concurrency basics LLD questions expect.

> **The big picture.** Low-level design is about code that's easy to change. SOLID is a set of reasons to split or join classes; patterns (next phase) are proven shapes that follow those reasons. Learn the 'why' here, and the patterns will make sense.

### 5.1 OOP: the four pillars

*Must know*

**Definition.** Object-oriented programming organises code into objects that bundle data and behaviour. Its four pillars are encapsulation, abstraction, inheritance and polymorphism.

**The problem it solves.** Large programs written as one long list of functions and shared variables become impossible to change safely. OOP groups data with the code that's allowed to change it.

**The idea.** Encapsulation hides an object's internal data behind methods, so it can't be put into an invalid state. Abstraction shows callers only what they need. Inheritance lets one class reuse and extend another. Polymorphism lets different classes be used through the same interface, each behaving in its own way.

**How it works, step by step**

1. Group related data and behaviour into a class: a BankAccount holds a balance and has deposit() and withdraw().
2. Make the balance private, and have withdraw() check there's enough money first. That's encapsulation.
3. Callers only see deposit(), withdraw() and the balance. That's abstraction.
4. A SavingsAccount is a kind of BankAccount that also adds interest. That's inheritance.
5. Code that loops over all accounts and calls monthly_update() gets the right behaviour for each type. That's polymorphism.

**Analogy.** A car. You use the steering wheel and pedals (abstraction) without touching the engine (encapsulation). An electric car is a kind of car (inheritance), and 'press the accelerator' works differently in each (polymorphism).

**Where the analogy breaks.** Cars are physical and their family tree is shallow. In code, inheritance is easy to overuse: deep class trees become fragile, which is why composition is often the better choice.

**Example.** A payment system: an abstract PaymentMethod with pay(amount); CardPayment and PayPalPayment each implement it differently; checkout simply calls method.pay(amount) without caring which one it has.

**Must-know points**

- Encapsulation: private state, with public methods that keep it valid.
- Abstraction: interfaces and abstract classes describe what, not how.
- Inheritance: an 'is-a' relationship; reuses code but creates tight coupling.
- Polymorphism: one interface, many implementations; replaces long if/else chains on type.

**Common mistakes**

- Public fields that anyone can set to invalid values.
- Using inheritance just to reuse a few lines of code.
- Type checks (if isinstance …) where polymorphism would do.

```python
from abc import ABC, abstractmethod

class PaymentMethod(ABC):                  # abstraction
    @abstractmethod
    def pay(self, amount: float) -> str: ...

class CardPayment(PaymentMethod):
    def __init__(self, card_number: str):
        self._card = card_number            # encapsulation: kept internal
    def pay(self, amount):
        return f"Charged £{amount} to card ending {self._card[-4:]}"

class PayPalPayment(PaymentMethod):
    def __init__(self, email: str):
        self._email = email
    def pay(self, amount):
        return f"Charged £{amount} via PayPal ({self._email})"

for method in [CardPayment("4111111111111111"), PayPalPayment("a@b.com")]:
    print(method.pay(20))                   # polymorphism
```

**Your interview answer** (say it out loud)

> Encapsulation protects an object's state, abstraction exposes only what callers need, inheritance models an 'is-a' relationship to reuse behaviour, and polymorphism lets code work with an interface while each class supplies its own behaviour — like checkout calling pay() on any payment method.

**Follow-up questions**

- **Q: Abstract class or interface?** An interface only declares methods. An abstract class can also hold shared code and state. In Python both are usually written with ABC.
- **Q: Overloading or overriding?** Overloading: the same method name with different parameters, chosen at compile time (for example in Java). Overriding: a subclass replaces a parent's method, chosen at runtime — that's polymorphism.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the four pillars with the car picture.
2. **Draw:** Draw a class diagram for Shape with Circle and Rectangle subclasses and an area() method.
3. **Apply:** Code the Shape example in Python, then add a Triangle without changing any code that uses shapes.
4. **Trade-offs:** Give one example where inheritance makes a design worse.

**Free resources (optional)**

- *Watch:* [Python OOP tutorials](https://www.youtube.com/results?search_query=Corey+Schafer+Python+OOP+tutorial+classes+and+instances) (Corey Schafer · free on YouTube)
- *Read:* [Object-Oriented Programming (OOP) in Python](https://www.google.com/search?q=Real+Python+object-oriented+programming+in+Python) (Real Python)

[Back to contents](#contents)

### 5.2 Composition over inheritance, and interfaces

*Must know*

**Definition.** Composition means building a class out of other objects it has ('has-a'), instead of inheriting from a parent ('is-a').

**The problem it solves.** Inheritance looks like free reuse, but every subclass is tied to its parent's details. With several independent features, the number of subclasses explodes.

**The idea.** Inheritance ties a child class closely to its parent's internals, so changes ripple down and deep trees get rigid. Composition plugs behaviour in through small objects behind interfaces, so you can swap them at runtime and test each alone. Rule of thumb: inherit for a true 'is-a' with shared behaviour; otherwise, compose.

**How it works, step by step**

1. With inheritance, 3 kinds of flying × 3 kinds of sound = 9 subclasses, and every new kind multiplies them again.
2. With composition, a Duck simply holds a flyer object and a quacker object.
3. Each behaviour is a small class implementing a tiny interface: fly() or quack().
4. You build a duck by choosing its parts: Duck(Wings(), Quack()) or Duck(NoFly(), Squeak()).
5. You can even swap a part while the program runs, and test each part on its own.

**Analogy.** A phone with a replaceable camera module, compared with a phone whose camera is moulded into the case. Upgrading the module is easy; re-moulding the case isn't.

**Where the analogy breaks.** Phone modules have sockets designed in advance. In code you still have to choose good interfaces, and composing everything everywhere can create a maze of tiny objects.

**Example.** Instead of Duck → FlyingDuck → QuackingFlyingDuck classes, a Duck has a flying behaviour and a quacking behaviour. A rubber duck gets NoFly and Squeak.

**Must-know points**

- 'Is-a' → maybe inheritance. 'Has-a' → composition.
- Composition lets you change behaviour at runtime and test with fakes.
- Program to an interface, not to an implementation.
- Dependency injection: pass collaborators in; don't create them inside the class.

**Common mistakes**

- Using inheritance for 'has-a' relationships (a Car extends Engine).
- Creating collaborators inside the class instead of passing them in.

```python
class Duck:
    def __init__(self, flyer, quacker):
        self.flyer, self.quacker = flyer, quacker   # has-a, not is-a
    def perform(self):
        return f"{self.flyer.fly()} / {self.quacker.quack()}"

class Wings:
    def fly(self): return "flaps its wings"

class NoFly:
    def fly(self): return "can't fly"

class Squeak:
    def quack(self): return "squeak"

rubber_duck = Duck(NoFly(), Squeak())
rubber_duck.perform()        # "can't fly / squeak"
```

**Your interview answer** (say it out loud)

> I prefer composition: a class holds small collaborator objects behind interfaces, and they're injected. It's more flexible than inheritance, easier to test, and avoids fragile class trees. I use inheritance only for a genuine 'is-a' with shared behaviour.

**Follow-up questions**

- **Q: What is dependency injection?** Giving an object its dependencies from outside, usually through the constructor, instead of creating them inside — so you can swap them, for example a fake payment gateway in tests.
- **Q: What is the 'fragile base class' problem?** A change to a parent class unexpectedly breaks subclasses that relied on its internal behaviour.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain composition over inheritance with the phone-camera picture.
2. **Draw:** Draw the Duck design with its behaviour objects as a class diagram.
3. **Apply:** Refactor a Notifier hierarchy (EmailNotifier, SmsNotifier, EmailAndSmsNotifier) into one Notifier that holds a list of channels.
4. **Trade-offs:** When is inheritance still the better choice?

**Free resources (optional)**

- *Read:* [Inheritance and Composition: A Python OOP Guide](https://www.google.com/search?q=Real+Python+inheritance+and+composition+a+Python+OOP+guide) (Real Python)
- *Read:* [Strategy pattern](https://refactoring.guru/design-patterns/strategy) (Refactoring.Guru, free)

[Back to contents](#contents)

### 5.3 SOLID: S — Single Responsibility Principle

*Must know*

**Definition.** A class should have one reason to change: one job.

**The problem it solves.** When one class does several jobs, unrelated changes collide: a change to the email wording risks breaking the tax calculation, and every change means retesting everything.

**The idea.** If one class holds the business rules, the database saving and the email sending, a change to any one of them risks breaking the others. Split it so each class does one thing well and changes for one reason.

**How it works, step by step**

1. List what the class does, and who asks for changes to each part (finance, the database team, marketing).
2. Each different 'who' is a separate responsibility.
3. Move each responsibility into its own class with a clear name.
4. Connect them in a small coordinating function or service.

**Analogy.** A restaurant where the chef cooks, the cashier takes payments and the cleaner cleans. If the chef also did the accounts, every new tax rule would interrupt the cooking.

**Where the analogy breaks.** In a tiny café one person does everything, and that's fine. Splitting too early into very small classes adds complexity; apply this when responsibilities really do change separately.

**Example.** Invoice calculates the totals, InvoiceRepository saves it, InvoiceEmailer sends it.

**Must-know points**

- 'A reason to change' usually means a different person or team asking for changes.
- Warning signs: huge classes, many unrelated imports, methods that never use each other's data.
- The result: smaller classes that are easier to test.

**Common mistakes**

- Splitting by the number of methods instead of by reason to change.
- Creating dozens of tiny classes that are always changed together.

```python
# Before: one class, three reasons to change
class Invoice:
    def total(self): ...
    def save_to_db(self): ...
    def email_to_customer(self): ...

# After: one job each
class Invoice:
    def total(self): ...

class InvoiceRepository:
    def save(self, invoice): ...

class InvoiceEmailer:
    def send(self, invoice): ...
```

**Your interview answer** (say it out loud)

> Single responsibility means each class has one reason to change. For example, I'd separate invoice calculation, saving and emailing, so a change to the email template can't break the tax logic.

**Follow-up questions**

- **Q: Isn't that just 'make classes small'?** No, it's about cohesion: things that change together stay together, and things that change for different reasons are separated.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain SRP with the restaurant picture.
2. **Draw:** Draw the before and after class diagrams for the Invoice example.
3. **Apply:** A UserService validates input, hashes passwords, saves users and sends welcome emails. Split it, and write the new class names and methods.
4. **Trade-offs:** When does splitting classes make code worse?

**Free resources (optional)**

- *Watch:* [SOLID principles explained with examples](https://www.youtube.com/results?search_query=SOLID+principles+explained+with+examples) (YouTube)
- *Read:* [SOLID: the first 5 principles of object-oriented design](https://www.google.com/search?q=DigitalOcean+SOLID+the+first+5+principles+of+object+oriented+design) (DigitalOcean, free)

[Back to contents](#contents)

### 5.4 SOLID: O — Open/Closed Principle

*Must know*

**Definition.** Code should be open for extension but closed for modification: add new behaviour by adding code, not by editing code that already works.

**The problem it solves.** Every time a new type of thing appears (a new payment method, a new discount), developers edit the same big if/else, and each edit risks breaking cases that already worked.

**The idea.** A long if/elif chain on type ('if card … elif paypal …') must be edited every time a new case appears, which risks breaking the old cases. Instead, depend on an interface and add one new class for each new case.

**How it works, step by step**

1. Find the code that switches on a type: if kind == 'sale' … elif kind == 'student' …
2. Define an interface for the behaviour that varies: apply(price).
3. Move each branch into its own class that implements the interface.
4. The main code just calls rule.apply(price) for every rule it's given.
5. A new discount is a new class. The main code never changes.

**Analogy.** A power strip: you add a new device by plugging it in, without rewiring the house.

**Where the analogy breaks.** A power strip has a fixed number of sockets, designed in advance. You can't predict every future change, so apply this where variation is likely, not everywhere.

**Example.** A price calculator takes a list of discount rules. Adding a 'student discount' means adding one new rule class, with no change to the calculator.

**Must-know points**

- Replace 'switch on type' with polymorphism.
- Strategy, Decorator and plug-in designs all follow this principle.
- Protects tested code from new changes.

**Common mistakes**

- Adding abstractions for variations that will never happen.
- Still having to edit one central if/else to create the new class. Use a registry or configuration instead.

```python
class DiscountRule:
    def apply(self, price): return price

class SaleDiscount(DiscountRule):
    def apply(self, price): return price * 0.9

class StudentDiscount(DiscountRule):        # a new rule: no edits elsewhere
    def apply(self, price): return price - 5

def final_price(price, rules):
    for rule in rules:
        price = rule.apply(price)
    return price
```

**Your interview answer** (say it out loud)

> Open/closed means I can add behaviour without editing existing code — for example, new discount types as new classes behind a DiscountRule interface, instead of a growing if/else chain.

**Follow-up questions**

- **Q: Does it mean you never edit code?** No. You still fix bugs and refactor. It means designing so that the variations you expect don't require changing working code.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the open/closed principle with the power-strip picture.
2. **Draw:** Draw the DiscountRule design as a class diagram.
3. **Apply:** Rewrite a shipping-cost function that uses if/elif for 'standard', 'express' and 'international', so that adding 'drone' needs no edits to existing code.
4. **Trade-offs:** Where would applying this principle be over-engineering?

**Free resources (optional)**

- *Watch:* [SOLID principles explained with examples](https://www.youtube.com/results?search_query=SOLID+principles+explained+with+examples) (YouTube)
- *Read:* [SOLID: the first 5 principles of object-oriented design](https://www.google.com/search?q=DigitalOcean+SOLID+the+first+5+principles+of+object+oriented+design) (DigitalOcean, free)

[Back to contents](#contents)

### 5.5 SOLID: L — Liskov Substitution Principle

*Must know*

**Definition.** Objects of a subclass must work anywhere the parent class is expected, without breaking the program.

**The problem it solves.** Polymorphism only works if every subtype really behaves like its parent. One misbehaving subclass forces callers to add special cases, and bugs appear far away from their cause.

**The idea.** A subclass must keep its parent's promises. It can't demand more (stricter inputs) or deliver less (weaker results), and it shouldn't throw surprises. If calling code has to check 'is this the special subclass?', the principle is broken.

**How it works, step by step**

1. Write down what callers rely on: 'after set_width(5), the width is 5 and the height hasn't changed'.
2. Check that every subclass keeps that promise. Square breaks it: setting the width also changes the height.
3. If a subclass can't keep a promise, it isn't a true subtype for that behaviour.
4. Fix it with a different hierarchy: Rectangle and Square both implement a Shape interface with area(), and there are no setters that conflict.

**Analogy.** A substitute teacher: lessons should run normally. If the substitute refuses to teach maths, the school timetable breaks.

**Where the analogy breaks.** A human substitute can explain what's different. Code can't, so the contract — what methods accept and guarantee — must be clear.

**Example.** The classic case: Square inheriting from Rectangle. Code that sets width = 5 and height = 4 expects an area of 20, but a Square keeps its sides equal and gives 16. So Square shouldn't extend a changeable Rectangle.

**Must-know points**

- Subclasses keep the parent's contract: the same or looser inputs, the same or stronger outputs.
- Warning signs: overridden methods that throw 'not supported', or isinstance checks in calling code.
- Fix: a better abstraction, such as a Shape interface with area().

**Common mistakes**

- Overriding a method just to throw 'not supported'.
- A subclass that needs more specific input than its parent accepts.

```python
class Rectangle:
    def __init__(self, w, h): self.w, self.h = w, h
    def set_width(self, w): self.w = w
    def set_height(self, h): self.h = h
    def area(self): return self.w * self.h

class Square(Rectangle):
    def set_width(self, w): self.w = self.h = w
    def set_height(self, h): self.w = self.h = h

def resize(r: Rectangle):
    r.set_width(5)
    r.set_height(4)
    assert r.area() == 20        # fails for a Square: its area is 16
```

**Your interview answer** (say it out loud)

> Liskov means a subclass must work anywhere its parent does. The classic counter-example is Square extending Rectangle: setting width and height separately breaks for a square, so they shouldn't share that inheritance.

**Follow-up questions**

- **Q: Penguin extends Bird, and Bird has fly()?** A penguin can't fly, so fly() would throw — a Liskov violation. Fix it with a separate FlyingBird type, or give flying as an ability through composition.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Liskov with the substitute-teacher picture.
2. **Draw:** Draw a better design for Rectangle and Square using a Shape interface.
3. **Apply:** Run the code below and watch the assertion fail, then redesign it so the check passes for every shape.
4. **Trade-offs:** Why do Liskov violations so often show up as isinstance checks?

**Free resources (optional)**

- *Watch:* [SOLID principles explained with examples](https://www.youtube.com/results?search_query=SOLID+principles+explained+with+examples) (YouTube)
- *Read:* [SOLID: the first 5 principles of object-oriented design](https://www.google.com/search?q=DigitalOcean+SOLID+the+first+5+principles+of+object+oriented+design) (DigitalOcean, free)

[Back to contents](#contents)

### 5.6 SOLID: I — Interface Segregation Principle

*Must know*

**Definition.** Clients shouldn't be forced to depend on methods they don't use. Prefer several small, focused interfaces over one big one.

**The problem it solves.** Big 'do-everything' interfaces force classes to implement methods that make no sense for them, and every change to the big interface touches classes that don't care.

**The idea.** A giant interface forces every class that implements it to write methods it doesn't need (often empty, or throwing errors), and changes ripple into classes that don't care. Split interfaces by what their users actually need.

**How it works, step by step**

1. Look for implementations full of empty methods or 'not supported' errors.
2. Group the interface's methods by which clients actually call them.
3. Make one small interface per group: Printer, Scanner, Fax.
4. Classes implement only what they really do, and each client depends only on the small interface it uses.

**Analogy.** A TV remote with 80 buttons when you only need power, volume and channel. Give most people a simple remote, and an advanced one to those who need it.

**Where the analogy breaks.** A remote is one physical object. In code, too many tiny interfaces can be confusing too, so group methods that are always used together.

**Example.** A Machine interface with print(), scan() and fax() forces a basic printer to implement fax(). Split it into Printer, Scanner and Fax; an office machine implements all three.

**Must-know points**

- Warning sign: methods that raise NotImplementedError or do nothing.
- Split interfaces by what each client needs (role interfaces).
- Works hand in hand with single responsibility.

**Common mistakes**

- One interface per method everywhere, which fragments the design.
- Keeping the fat interface 'for convenience'.

```python
from abc import ABC, abstractmethod

class Printer(ABC):
    @abstractmethod
    def print(self, doc): ...

class Scanner(ABC):
    @abstractmethod
    def scan(self): ...

class BasicPrinter(Printer):                 # no fake scan() needed
    def print(self, doc): return f"printing {doc}"

class OfficeMachine(Printer, Scanner):
    def print(self, doc): return f"printing {doc}"
    def scan(self): return "scanned page"
```

**Your interview answer** (say it out loud)

> Interface segregation means small, client-specific interfaces, so classes don't implement methods they don't need — for example separate Printer and Scanner interfaces instead of one big Machine interface.

**Follow-up questions**

- **Q: Interface segregation or single responsibility?** Single responsibility is about why a class changes. Interface segregation is about what clients are forced to depend on. Both lead to smaller, focused pieces.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain interface segregation with the TV-remote picture.
2. **Draw:** Draw the before (Machine) and after (Printer, Scanner, Fax) designs.
3. **Apply:** Split a Worker interface with work(), eat() and sleep() so that a RobotWorker isn't forced to implement eat().
4. **Trade-offs:** How can you tell when an interface has become too small?

**Free resources (optional)**

- *Watch:* [SOLID principles explained with examples](https://www.youtube.com/results?search_query=SOLID+principles+explained+with+examples) (YouTube)
- *Read:* [SOLID: the first 5 principles of object-oriented design](https://www.google.com/search?q=DigitalOcean+SOLID+the+first+5+principles+of+object+oriented+design) (DigitalOcean, free)

[Back to contents](#contents)

### 5.7 SOLID: D — Dependency Inversion Principle

*Must know*

**Definition.** High-level code should depend on abstractions, not on concrete low-level details.

**The problem it solves.** When business logic creates its own database connection or email client, it's welded to them. You can't test it without a real database, and switching providers means rewriting business code.

**The idea.** If OrderService creates a MySQLDatabase directly, you can't swap the database or test without one. Instead, OrderService depends on an OrderRepository interface, and the concrete repository — MySQL in production, an in-memory one in tests — is passed in.

**How it works, step by step**

1. Find a high-level class that creates a low-level one: OrderService creates PostgresRepository() inside itself.
2. Define the interface the high-level code actually needs: OrderRepository with save(order).
3. Make the low-level class implement that interface.
4. Pass the implementation into the high-level class through its constructor.
5. At start-up, connect the real pieces together. In tests, pass in fakes.

**Analogy.** A standard wall socket. Your lamp depends on 'a standard socket', not on one particular power station, so you can switch energy supplier without rewiring the lamp.

**Where the analogy breaks.** Socket standards are agreed by whole countries. In code you design the abstraction yourself, and a bad one (leaking database details) gives you none of the benefits.

**Example.** OrderService(repository) uses PostgresOrderRepository in production and InMemoryOrderRepository in tests.

**Must-know points**

- Depend on interfaces; inject the implementations (dependency injection).
- Makes testing easy with fakes and mocks.
- Lets you swap infrastructure, like the database or email provider, with no change to business logic.
- Dependency inversion is the principle; dependency injection is a technique for achieving it.

**Common mistakes**

- An interface that copies one vendor's API exactly, so the abstraction leaks.
- Creating dependencies inside methods 'just this once'.

```python
from abc import ABC, abstractmethod

class OrderRepository(ABC):                 # the abstraction
    @abstractmethod
    def save(self, order): ...

class PostgresOrderRepository(OrderRepository):
    def save(self, order): ...             # real database code

class InMemoryOrderRepository(OrderRepository):
    def __init__(self): self.orders = []
    def save(self, order): self.orders.append(order)

class OrderService:
    def __init__(self, repo: OrderRepository):   # injected, not created inside
        self.repo = repo
    def place(self, order):
        self.repo.save(order)

service = OrderService(InMemoryOrderRepository())   # easy to test
```

**Your interview answer** (say it out loud)

> Dependency inversion means business logic depends on interfaces, and concrete implementations are injected. My OrderService depends on an OrderRepository interface, so I can use Postgres in production and an in-memory fake in tests.

**Follow-up questions**

- **Q: Dependency inversion or dependency injection?** Inversion is the design rule: depend on abstractions. Injection is the technique: pass dependencies in, often done for you by a framework like Spring.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain dependency inversion with the wall-socket picture.
2. **Draw:** Draw OrderService, the OrderRepository interface and two implementations, with arrows showing what depends on what.
3. **Apply:** Write a NotificationService that depends on a MessageSender interface; implement EmailSender and FakeSender, and test with the fake.
4. **Trade-offs:** When is adding an interface for a single implementation unnecessary?

**Free resources (optional)**

- *Watch:* [SOLID principles explained with examples](https://www.youtube.com/results?search_query=SOLID+principles+explained+with+examples) (YouTube)
- *Read:* [SOLID: the first 5 principles of object-oriented design](https://www.google.com/search?q=DigitalOcean+SOLID+the+first+5+principles+of+object+oriented+design) (DigitalOcean, free)
- *Read:* [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) (Martin Fowler)

[Back to contents](#contents)

### 5.8 UML class diagrams and relationships

*Should know*

**Definition.** A class diagram shows the classes, their fields and methods, and how they relate to each other.

**The problem it solves.** In an interview, you need to show the structure of your design quickly, before coding. A clear diagram lets the interviewer follow you and correct you early.

**The idea.** In LLD interviews you sketch the main classes and relationships before coding. The relationships: association (uses or knows about), aggregation (has, but the part can exist alone), composition (owns; the part dies with the whole), inheritance (is-a) and realisation (implements an interface). Multiplicity (1, 0..1, *) says how many.

**How it works, step by step**

1. Draw a box for each class: its name at the top, key fields in the middle, key methods at the bottom.
2. Connect the boxes with the right line: a filled diamond for 'owns', an empty diamond for 'has', a triangle arrow for 'is a', and a dashed triangle arrow for 'implements'.
3. Add numbers at the line ends: 1, 0..1 or * (many).
4. Talk through one use case on the diagram before you write code.

**Analogy.** A family tree combined with an organisation chart: who is a kind of what, and who belongs to whom.

**Where the analogy breaks.** A family tree records what already happened. A class diagram is a draft: keep it simple, and change it as your design improves.

**Example.** Parking lot: ParkingLot owns Floors (composition), a Floor owns Spots (composition), a Spot holds 0 or 1 Vehicle (association), and Car, Truck and Bike are kinds of Vehicle (inheritance).

**Must-know points**

- Composition (filled diamond): the owner controls the part's lifetime.
- Aggregation (empty diamond): shared parts that can exist alone.
- Inheritance: a line with an empty triangle. Realisation: a dashed line with an empty triangle.
- In an interview, show only the important classes and methods.

**Common mistakes**

- Drawing every getter and setter.
- Spending 20 minutes on the diagram and leaving no time to code.

```
ParkingLot 1 ◆──── * Floor        (composition)
Floor      1 ◆──── * Spot         (composition)
Spot       1 ────── 0..1 Vehicle  (association)
Car, Truck, Bike ───▷ Vehicle     (inheritance)
CardPayment ┄┄┄▷ PaymentMethod    (implements an interface)
```

**Your interview answer** (say it out loud)

> I start an LLD answer by listing the main entities, then draw a class diagram with the key fields, methods and relationships: composition for owned parts, inheritance only for a true 'is-a', and interfaces for anything likely to vary.

**Follow-up questions**

- **Q: Aggregation or composition?** Composition: the part dies with the whole, like a room in a house. Aggregation: the part can exist on its own, like a player in a team.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the five relationship types with an everyday example of each.
2. **Draw:** Draw a class diagram for a library: Library, Book, BookCopy, Member and Loan.
3. **Apply:** Turn your diagram into Python class skeletons with the right attributes.
4. **Trade-offs:** How much detail should a class diagram have in a 45-minute interview?

**Free resources (optional)**

- *Read:* [UML class diagram tutorial](https://www.google.com/search?q=Visual+Paradigm+UML+class+diagram+tutorial) (Visual Paradigm, free)
- *Code:* [Awesome Low-Level Design](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

### 5.9 Concurrency basics: threads, locks and race conditions

*Should know*

**Definition.** Concurrency is several tasks making progress at the same time. A race condition is a bug where the result depends on the exact timing between them.

**The problem it solves.** Real systems serve many users at once. When two of them change the same data at the same moment, results can be silently wrong, like one seat sold twice.

**The idea.** LLD questions like seat booking or elevators often ask: what if two users act at once? If two threads read a counter, add one and write it back at the same moment, one update is lost. Locks (mutexes) make a critical section run one thread at a time; atomic operations and thread-safe queues avoid manual locks. Watch out for deadlock: two threads each waiting for a lock the other one holds.

**How it works, step by step**

1. Thread A reads seats_left = 1. Thread B also reads seats_left = 1.
2. A sells the seat and writes 0. B also sells the seat and writes 0. Two tickets have been sold for one seat.
3. Fix: wrap 'read, check, write' in a lock. Now B waits until A has finished, then reads 0 and refuses.
4. Across many servers, do it in the database with a conditional update — UPDATE seats SET sold = true WHERE id = 7 AND sold = false — and check that exactly one row changed.

**Analogy.** Two people filling in the same paper form at once: both read '3 seats left', both write '2 seats left', and one booking disappears. A lock is a rule that only one person may hold the form at a time.

**Where the analogy breaks.** People can see each other. Threads can't, and the bug may appear once in a million runs, so you have to reason about it, not just test for it.

**Example.** Seat booking: 'check the seat is free, then mark it booked' must happen as one step — inside a lock within one program, or inside a database transaction with a row lock across many servers.

**Must-know points**

- Critical section: code that touches shared data; protect it with a lock.
- Race condition: read–modify–write without protection.
- Deadlock needs four conditions; break 'circular wait' by always taking locks in the same order, or use timeouts.
- Across several servers, an in-program lock isn't enough: use database transactions or a distributed lock.
- Prefer thread-safe queues and data that never changes, where you can.

**Common mistakes**

- Locking only the write, instead of the whole read-check-write.
- Holding a lock while doing slow work, like a network call.
- Taking locks in different orders in different places, which causes deadlock.

```python
import threading

count = 0
lock = threading.Lock()

def add_many():
    global count
    for _ in range(100_000):
        with lock:          # without the lock, updates can be lost
            count += 1

threads = [threading.Thread(target=add_many) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(count)                # 400000
```

**Your interview answer** (say it out loud)

> Anywhere two users can change the same thing — like booking the last seat — I'd make 'check and update' a single atomic step: a lock within one process, or a database transaction with a row lock or optimistic versioning across servers. I'd take locks in a fixed order to avoid deadlock.

**Follow-up questions**

- **Q: Process or thread?** A process has its own memory. Threads share their process's memory, which makes communication easy but needs synchronisation.
- **Q: How do you prevent deadlock?** Take locks in one agreed global order, hold them briefly, or use try-lock with a timeout.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain a race condition with the paper-form picture.
2. **Draw:** Draw a timeline of two threads causing a lost update, then the same timeline with a lock.
3. **Apply:** Run the counter code below with and without the lock using several threads. Then write a tiny deadlock with two locks and fix it by ordering them.
4. **Trade-offs:** Why is a Python threading.Lock useless for a seat-booking system running on 10 servers?

**Free resources (optional)**

- *Read:* [An Intro to Threading in Python](https://www.google.com/search?q=Real+Python+an+intro+to+threading+in+Python) (Real Python)
- *Read:* [threading — Thread-based parallelism](https://docs.python.org/3/library/threading.html) (Python docs)
- *Read:* [The Little Book of Semaphores](https://www.google.com/search?q=The+Little+Book+of+Semaphores+Allen+Downey) (Allen Downey · free)

[Back to contents](#contents)

---

## Phase 6: Design patterns

Ten patterns that come up again and again in LLD interviews and real code: three for creating objects, three for structuring them, and four for behaviour.

> **The big picture.** A pattern is a proven shape for a common problem, with a name everyone recognises. In an interview, naming the right pattern — and saying why it fits — shows you design for change, not just for today.

### 6.1 Singleton

*Must know*

**Definition.** Makes sure a class has only one instance, and gives one global way to reach it.

**The problem it solves.** Some things should exist exactly once per program, like one configuration or one connection pool. Creating several wastes resources or causes conflicting settings.

**The idea.** Used for a shared resource like a configuration object or a connection pool. The class controls its own creation. Downsides: it's global state, hides dependencies, makes testing harder, and needs care with threads.

**How it works, step by step**

1. The class keeps a hidden class-level variable for its single instance.
2. When asked for an instance, it checks that variable. If it's empty, it creates the instance and stores it.
3. With threads, two could check at the same moment, so creation is wrapped in a lock (and the variable is checked again inside the lock).
4. Every later request returns the stored instance.

**Analogy.** A country has one official government, and everyone refers to the same one.

**Where the analogy breaks.** You can't replace a country's government in a test, but code should be replaceable. Many teams prefer creating one instance at start-up and injecting it, which gives 'only one' without the global.

**Example.** A logging configuration, or a database connection pool created once per process.

**Must-know points**

- Use it for a truly single, shared resource.
- Make creation thread-safe (double-checked locking), or create the instance eagerly.
- In Python, a module is already a natural singleton.
- Often criticised as global state; prefer injecting one shared instance.

**Common mistakes**

- Using Singleton for things that aren't truly single, like 'the current user'.
- Hidden dependencies: code reaches for the global instead of receiving what it needs.

```python
import threading

class Config:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:                 # thread-safe creation
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.settings = {}
        return cls._instance

Config() is Config()        # True: always the same object
```

**Your interview answer** (say it out loud)

> Singleton guarantees one instance with one access point, for things like configuration or a connection pool. I'd make creation thread-safe, but I usually prefer creating one instance at start-up and injecting it, because a global singleton hides dependencies and makes testing harder.

**Follow-up questions**

- **Q: Why is Singleton sometimes called an anti-pattern?** It's global, changeable state: hidden dependencies, hard to replace in tests, and tricky lifetimes.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Singleton and its main criticism.
2. **Draw:** Draw its class diagram: the stored instance and the method that returns it.
3. **Apply:** Implement the thread-safe Singleton below and prove with 10 threads that only one instance is ever created.
4. **Trade-offs:** Singleton or injecting one shared instance: compare testing and flexibility.

**Free resources (optional)**

- *Watch:* [Singleton pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Singleton+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Singleton pattern](https://refactoring.guru/design-patterns/singleton) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.2 Factory: Factory Method and Abstract Factory

*Must know*

**Definition.** A factory creates objects for you, so the calling code asks for 'a notifier' without knowing which concrete class gets built.

**The problem it solves.** If the code that uses an object also decides which concrete class to create, every new type means editing that code in many places.

**The idea.** Factory Method: one method decides which class to create. Abstract Factory: creates whole families of related objects that must match, such as all dark-theme or all light-theme UI parts. Both keep 'new ConcreteClass()' in one place.

**How it works, step by step**

1. Define a common interface: Notifier with send(message).
2. Implement it in EmailNotifier, SmsNotifier and PushNotifier.
3. Put the 'which class?' decision in one factory, using a dictionary from name to class.
4. Callers ask the factory for 'sms' and use the result only through the interface.
5. Adding a WhatsAppNotifier means one new class and one new dictionary entry.

**Analogy.** Ordering from a car factory: you ask for 'a family car', and the factory decides the exact model and parts.

**Where the analogy breaks.** A car factory has a fixed catalogue. If every new type means editing one big if/else inside the factory, you've just moved the problem. A registry of creators keeps it open for extension.

**Example.** NotifierFactory.create('sms') returns an SmsNotifier, and the order service just calls notifier.send().

**Must-know points**

- Use it when the exact class depends on input or configuration.
- Factory Method: one product, a method decides. Abstract Factory: families of related products.
- A registry dictionary avoids long if/else chains.
- The 'simple factory' (one create function) is the usual interview version.

**Common mistakes**

- A factory that's just a giant if/else edited for every new type.
- Factories for objects that only ever have one type.

```python
class EmailNotifier:
    def send(self, msg): return f"email: {msg}"

class SmsNotifier:
    def send(self, msg): return f"sms: {msg}"

class NotifierFactory:
    _registry = {"email": EmailNotifier, "sms": SmsNotifier}

    @classmethod
    def create(cls, channel):
        return cls._registry[channel]()    # callers never name a concrete class

NotifierFactory.create("sms").send("Your order has shipped")
```

**Your interview answer** (say it out loud)

> A factory centralises object creation: callers ask for a type by name or configuration and get an object behind a common interface, so adding a new type doesn't change the calling code. Abstract Factory extends this to whole families of matching objects.

**Follow-up questions**

- **Q: Factory or Builder?** A factory picks which class to create, in one step. A builder assembles one complex object step by step.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Factory Method and Abstract Factory with one example each.
2. **Draw:** Draw NotifierFactory, the Notifier interface and three notifiers.
3. **Apply:** Add a 'push' notifier without changing the logic inside create().
4. **Trade-offs:** When is a factory just unnecessary indirection?

**Free resources (optional)**

- *Read:* [Factory pattern](https://refactoring.guru/design-patterns/factory-method) (Refactoring.Guru, free)
- *Read:* [Abstract Factory pattern](https://refactoring.guru/design-patterns/abstract-factory) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.3 Builder

*Must know*

**Definition.** Builds a complex object step by step, instead of using a constructor with a dozen parameters.

**The problem it solves.** Objects with many optional settings lead to long, confusing constructors, where it's easy to pass arguments in the wrong order.

**The idea.** When an object has many optional parts, a constructor like Pizza(size, cheese, olives, ham, …) is unreadable and easy to get wrong. A builder sets each part with a clearly named method, then build() checks everything and returns the finished object.

**How it works, step by step**

1. Create a builder with sensible defaults for every setting.
2. Each method sets one thing and returns the builder, so calls can be chained.
3. build() checks the combination is valid: required fields set, values in range.
4. build() returns the finished object, which can then be read-only.

**Analogy.** Ordering a custom sandwich at a counter: choose the bread, then the fillings, then the sauce, then say 'done'.

**Where the analogy breaks.** At the counter you can choose in any order. Some objects need steps in a valid order, or have required parts, so build() must check before returning anything.

**Example.** Building an HTTP request: Request.builder().url(...).method('POST').header(...).body(...).timeout(5).build().

**Must-know points**

- Use it for objects with many optional settings, or multi-step construction.
- Fluent style: each step returns the builder, so calls can be chained.
- Validate in build(); the finished object can then be unchangeable.
- In Python, keyword arguments with defaults often solve the same problem; in Java, Builder is very common.

**Common mistakes**

- Letting the half-built object escape before build() is called.
- Using a builder for objects with only two or three fields.

```python
class Pizza:
    def __init__(self, size, toppings, extra_cheese):
        self.size, self.toppings, self.extra_cheese = size, toppings, extra_cheese

class PizzaBuilder:
    def __init__(self, size):
        self.size, self.toppings, self.extra_cheese = size, [], False

    def add(self, topping):
        self.toppings.append(topping)
        return self                     # return self to chain calls

    def with_extra_cheese(self):
        self.extra_cheese = True
        return self

    def build(self):
        if not self.toppings:
            raise ValueError("a pizza needs at least one topping")
        return Pizza(self.size, list(self.toppings), self.extra_cheese)

pizza = PizzaBuilder("large").add("mushroom").add("olive").with_extra_cheese().build()
```

**Your interview answer** (say it out loud)

> Builder constructs a complex object step by step through readable, named methods, then validates it and returns it, instead of a constructor with many parameters. I'd use it for things like requests or reports with lots of optional settings.

**Follow-up questions**

- **Q: Why is Builder less needed in Python?** Keyword arguments with defaults already make optional settings readable. Builder still helps when construction has several steps or needs validation.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Builder with the sandwich-counter picture.
2. **Draw:** Draw PizzaBuilder and Pizza as a class diagram.
3. **Apply:** Write an EmailBuilder (to, cc, subject, body, attachments) whose build() fails if there's no recipient.
4. **Trade-offs:** Builder or keyword arguments: when is each the better choice?

**Free resources (optional)**

- *Watch:* [Builder pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Builder+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Builder pattern](https://refactoring.guru/design-patterns/builder) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.4 Adapter

*Must know*

**Definition.** Lets two incompatible interfaces work together, by wrapping one so it looks like the other.

**The problem it solves.** You often need a library or old system whose interface doesn't match the one your code expects, and you can't (or shouldn't) change either side.

**The idea.** Your code expects pay(amount_in_pounds), but a third-party SDK offers make_payment(pence, currency). An adapter wraps the SDK and translates the calls, so your code doesn't change.

**How it works, step by step**

1. Write down the interface your code expects: pay(pounds) returning True or False.
2. Write down what the other system offers: make_payment(pence, currency) returning 'OK' or an error code.
3. Create an adapter class that implements your interface and holds the other system.
4. In each method, convert the inputs (pounds → pence), call the other system, and convert the outputs (codes → True/False, or proper exceptions).

**Analogy.** A UK-to-EU travel plug adapter.

**Where the analogy breaks.** A plug adapter only changes the shape. Software adapters often also convert data (units, formats, errors), and a careless conversion can hide real problems.

**Example.** Wrapping an old XML-based bank service so it fits your new PaymentGateway interface.

**Must-know points**

- Use it to plug in third-party or legacy code without changing your own interface.
- Prefer wrapping an object (object adapter) over inheriting from it (class adapter).
- Keeps vendor-specific code in one place, so switching vendors is easy.

**Common mistakes**

- Letting the third-party's types leak through the adapter into business code.
- Losing error details during the conversion.

```python
class PaymentGateway:                      # what our code expects
    def pay(self, pounds: float) -> bool: ...

class LegacyBankSDK:                        # what we were given
    def make_payment(self, pence: int, currency: str) -> str:
        return "OK"

class LegacyBankAdapter(PaymentGateway):
    def __init__(self, sdk: LegacyBankSDK):
        self.sdk = sdk
    def pay(self, pounds):
        return self.sdk.make_payment(round(pounds * 100), "GBP") == "OK"
```

**Your interview answer** (say it out loud)

> Adapter wraps an incompatible class so it matches the interface my code expects — for example making an old bank SDK fit our PaymentGateway interface — so business code doesn't change and vendors can be swapped.

**Follow-up questions**

- **Q: Adapter or Facade?** An adapter makes one interface match another that's expected. A facade gives a simpler interface over a complicated set of classes.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Adapter with the travel-plug picture.
2. **Draw:** Draw PaymentGateway, LegacyBankAdapter and LegacyBankSDK, with arrows.
3. **Apply:** Write an adapter so that a weather API returning Fahrenheit fits an interface that returns Celsius.
4. **Trade-offs:** What can go wrong if an adapter silently converts or swallows errors?

**Free resources (optional)**

- *Watch:* [Adapter pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Adapter+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Adapter pattern](https://refactoring.guru/design-patterns/adapter) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.5 Decorator

*Must know*

**Definition.** Adds behaviour to an object by wrapping it in another object with the same interface, without changing the original class.

**The problem it solves.** You want to add extras like logging, caching or retries to some objects, in different combinations, without writing a subclass for every combination.

**The idea.** Instead of a subclass for every combination (LoggedCachedRetryingClient and so on), you stack small wrappers: a retry wrapper around a cache wrapper around the real client. Each wrapper adds one feature and passes the call along.

**How it works, step by step**

1. Start with an object that implements an interface: read().
2. Write a wrapper class that implements the same interface and holds another object of that interface.
3. In its read(), do the extra work (write a log line, check a cache), then call the inner object's read().
4. Wrap again for more features: Logging(Caching(Real())).
5. Callers can't tell they're talking to a wrapper; they just call read().

**Analogy.** Wrapping a present in layers: paper, then ribbon, then a card. It's still the same present underneath, and you can add or skip any layer.

**Where the analogy breaks.** Gift layers don't affect each other. Code wrappers do, so the order matters: caching outside retries behaves differently from retries outside caching.

**Example.** Java's file streams (a BufferedInputStream around a FileInputStream), and Python's @decorators for logging or timing functions.

**Must-know points**

- Same interface as the wrapped object, so wrappers can stack.
- Avoids an explosion of subclasses for every feature combination.
- Follows open/closed: add features without editing classes.
- Python's @ syntax is a related idea for functions.

**Common mistakes**

- Wrappers that change what the method means, rather than just adding to it.
- Wrapping in the wrong order (for example, caching errors).

```python
class DataSource:
    def read(self): return "data"

class LoggingSource:
    def __init__(self, inner): self.inner = inner
    def read(self):
        print("reading…")
        return self.inner.read()

class UpperCaseSource:
    def __init__(self, inner): self.inner = inner
    def read(self):
        return self.inner.read().upper()

source = LoggingSource(UpperCaseSource(DataSource()))   # stack the features
source.read()       # prints "reading…", returns "DATA"
```

**Your interview answer** (say it out loud)

> Decorator wraps an object with another that has the same interface and adds one behaviour, like logging, caching or retries. Wrappers can be stacked in any combination, which avoids an explosion of subclasses.

**Follow-up questions**

- **Q: Decorator or inheritance?** Inheritance fixes behaviour for a whole class when you write the code. Decorators add it to individual objects at runtime, and combine freely.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Decorator with the present-wrapping picture.
2. **Draw:** Draw the stack of wrappers around DataSource.
3. **Apply:** Write a TimingDecorator and a RetryDecorator for an HTTP client class, and stack them in both orders. What changes?
4. **Trade-offs:** When do many layers of decorators make debugging hard?

**Free resources (optional)**

- *Read:* [Decorator pattern](https://refactoring.guru/design-patterns/decorator) (Refactoring.Guru, free)
- *Read:* [Primer on Python Decorators](https://www.google.com/search?q=Real+Python+primer+on+Python+decorators) (Real Python)

[Back to contents](#contents)

### 6.6 Facade

*Should know*

**Definition.** Gives one simple interface to a complicated set of classes.

**The problem it solves.** Using a complex subsystem directly means every caller must know many classes and the right order to call them, and that knowledge gets copied everywhere.

**The idea.** Placing an order may involve inventory, payment, shipping and notification classes. A CheckoutFacade with one place_order() method hides those steps, so callers use one method.

**How it works, step by step**

1. Identify the task callers keep repeating: placing an order.
2. Create a facade class that holds the subsystem objects.
3. Give it one method per common task, which calls the subsystem pieces in the right order.
4. Callers use the facade; advanced callers can still use the subsystem directly.

**Analogy.** A hotel concierge: you ask for 'dinner and a taxi at 8', and they deal with the restaurant and the taxi company.

**Where the analogy breaks.** A concierge knows everything. A facade that keeps growing becomes a 'god class' that does too much, so keep it thin and let it delegate to the subsystems.

**Example.** A video-conversion library: convert(file, 'mp4') hides the codecs, buffers and audio mixing.

**Must-know points**

- Simplifies a subsystem; the subsystem stays available for advanced use.
- Reduces coupling between callers and many classes.
- Keep it thin: coordination, not business logic.

**Common mistakes**

- Putting business rules into the facade.
- Forcing every caller through the facade even when they need fine control.

```python
class CheckoutFacade:
    def __init__(self, inventory, payments, shipping, notifier):
        self.inventory, self.payments = inventory, payments
        self.shipping, self.notifier = shipping, notifier

    def place_order(self, order):
        self.inventory.reserve(order.items)
        self.payments.charge(order.customer, order.total)
        self.shipping.schedule(order)
        self.notifier.send(order.customer, "Order confirmed")
```

**Your interview answer** (say it out loud)

> Facade gives callers one simple method, like place_order(), over a complex subsystem of inventory, payment and shipping classes, which reduces coupling. I keep it thin so it doesn't become a god class.

**Follow-up questions**

- **Q: Facade or API gateway?** The same idea at different levels: a facade simplifies classes inside one program; an API gateway simplifies many services for outside clients.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Facade with the concierge picture.
2. **Draw:** Draw the facade and the four subsystems it calls.
3. **Apply:** Write a HomeTheaterFacade with watch_movie() that switches on the projector, amplifier and player in the right order.
4. **Trade-offs:** How do you stop a facade from turning into a god class?

**Free resources (optional)**

- *Watch:* [Facade pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Facade+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Facade pattern](https://refactoring.guru/design-patterns/facade) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.7 Strategy

*Must know*

**Definition.** Puts a family of interchangeable algorithms behind one interface, so you can choose one at runtime.

**The problem it solves.** When an algorithm can vary (pricing, sorting, routing), putting every variant in one method with if/else makes it long, hard to test and risky to extend.

**The idea.** Instead of an if/elif on pricing type inside checkout, each pricing rule is its own class (or function) with the same method. Checkout holds one strategy and can swap it.

**How it works, step by step**

1. Define the interface: price(distance_km).
2. Write one class per algorithm: NormalPricing, SurgePricing, NightPricing.
3. The context (Ride) holds one strategy object and calls it.
4. Choose the strategy at runtime: from configuration, a factory, or the time of day.

**Analogy.** Choosing a route in a maps app: fastest, shortest or avoiding tolls. Same journey, different strategy.

**Where the analogy breaks.** The maps app chooses for you when you tap a button. In code, something still has to decide which strategy to use, often a factory or configuration.

**Example.** Payment fees, sorting, compression formats, and ride pricing (normal or surge).

**Must-know points**

- Replaces 'which algorithm?' conditionals with polymorphism.
- Strategies can be swapped at runtime.
- In Python, plain functions can be strategies.
- Very common in LLD answers: pricing, payment, parking fees.

**Common mistakes**

- Strategies that need lots of the context's private data (a sign the interface is wrong).
- Creating strategy classes for one fixed algorithm.

```python
class NormalPricing:
    def price(self, distance_km): return 2 + 1.2 * distance_km

class SurgePricing:
    def __init__(self, multiplier): self.multiplier = multiplier
    def price(self, distance_km): return (2 + 1.2 * distance_km) * self.multiplier

class Ride:
    def __init__(self, pricing): self.pricing = pricing    # a swappable strategy
    def fare(self, km): return round(self.pricing.price(km), 2)

Ride(NormalPricing()).fare(10)        # 14.0
Ride(SurgePricing(1.5)).fare(10)      # 21.0
```

**Your interview answer** (say it out loud)

> Strategy puts each interchangeable algorithm, like normal or surge pricing, behind one interface, so the class using it can switch algorithms at runtime, and new ones are added without editing it.

**Follow-up questions**

- **Q: Strategy or State?** Both swap behaviour objects. With Strategy, the caller chooses the algorithm. With State, the object changes its own state as events happen.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Strategy with the route-choice picture.
2. **Draw:** Draw Ride with a PricingStrategy interface and two implementations.
3. **Apply:** Add a 'night pricing' strategy without changing Ride, and write tests for all three.
4. **Trade-offs:** When is a simple if/else better than Strategy?

**Free resources (optional)**

- *Watch:* [Strategy pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Strategy+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Strategy pattern](https://refactoring.guru/design-patterns/strategy) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.8 Observer

*Must know*

**Definition.** Lets objects subscribe to another object's events, and get notified automatically when something happens.

**The problem it solves.** When one event must trigger several reactions, the code that raises the event ends up calling every reacting component directly, so adding a new reaction means editing it.

**The idea.** When an order is placed, email, analytics and stock might all need to react. Instead of the order code calling each one, they subscribe; the order publishes 'order placed', and every subscriber is notified. It's the in-program version of publish/subscribe.

**How it works, step by step**

1. The subject keeps a list of subscribers.
2. Components that care call subscribe(callback).
3. When the event happens, the subject loops through the list and calls each callback with the event's details.
4. New reactions subscribe themselves; the subject never changes.
5. Subscribers can unsubscribe when they no longer care.

**Analogy.** Subscribing to a YouTube channel: when a new video is published, every subscriber is told, and the channel doesn't need to know who they are.

**Where the analogy breaks.** YouTube handles millions of subscribers reliably. A simple in-memory list of observers is lost if the program crashes, and one slow subscriber can slow the publisher. Across services, you'd use a message broker instead.

**Example.** Button click listeners in user interfaces, stock-price updates, event systems.

**Must-know points**

- Decouples the publisher from its listeners.
- Subscribers can be added and removed at runtime.
- Watch for memory leaks (forgotten subscribers) and slow or failing subscribers.
- At system level, the same idea becomes pub/sub with a message broker.

**Common mistakes**

- Never unsubscribing, which leaks memory.
- Letting one subscriber's error stop the others from being notified.
- Relying on subscribers being called in a particular order.

```python
class OrderEvents:
    def __init__(self):
        self._subscribers = []
    def subscribe(self, callback):
        self._subscribers.append(callback)
    def publish(self, order_id):
        for notify in self._subscribers:
            notify(order_id)

events = OrderEvents()
events.subscribe(lambda oid: print(f"email the receipt for {oid}"))
events.subscribe(lambda oid: print(f"update stock for {oid}"))
events.publish("A123")
```

**Your interview answer** (say it out loud)

> Observer lets listeners subscribe to an object's events, so the publisher notifies all of them without knowing who they are — like 'order placed' triggering an email and a stock update. Across services I'd use the same idea with a message broker, for durability.

**Follow-up questions**

- **Q: Observer or pub/sub?** With Observer, subscribers register directly with the subject, usually inside one program. With pub/sub, a broker sits in between, so publishers and subscribers don't know each other, often across services.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain Observer with the YouTube-subscription picture.
2. **Draw:** Draw the subject, its list of subscribers, and three observers.
3. **Apply:** Build a StockTicker that notifies subscribers only when a price changes by more than 1%.
4. **Trade-offs:** What happens if one subscriber throws an error or is very slow? How would you protect the publisher?

**Free resources (optional)**

- *Watch:* [Observer pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Observer+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Observer pattern](https://refactoring.guru/design-patterns/observer) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.9 Chain of Responsibility

*Should know*

**Definition.** Passes a request along a chain of handlers; each one either deals with it or passes it on to the next.

**The problem it solves.** A request may need to pass several checks, or be handled by one of several handlers depending on its details. Hard-coding that sequence in one function makes it long and rigid.

**The idea.** Good for pipelines of checks or approvals: authentication → rate limit → validation → handler; or expense approval: a team lead up to £100, a manager up to £1,000, a director above that. Each handler is independent, and the chain can be reordered.

**How it works, step by step**

1. Define a handler interface: handle(request).
2. Each handler decides: deal with the request, or pass it to the next handler it holds.
3. Link the handlers into a chain, in the order you want.
4. Send the request to the first handler; it travels along until someone deals with it.
5. End the chain with a default handler that rejects or logs anything unhandled.

**Analogy.** A customer-support line: first-line support, then a specialist, then a manager, each stepping in only if the one before can't solve it.

**Where the analogy breaks.** A support line always ends with someone. In code, a request can fall off the end with nobody handling it, so add a final default handler.

**Example.** Web framework middleware, logging levels, and an ATM paying out £50 notes, then £20s, then £10s.

**Must-know points**

- Decouples whoever sends the request from whichever handler deals with it.
- Handlers can be added, removed or reordered.
- Make sure something handles the end of the chain.
- Middleware pipelines are the everyday example.

**Common mistakes**

- No default at the end, so requests disappear silently.
- Very long chains that are hard to trace.

```python
class Approver:
    def __init__(self, name, limit, next_approver=None):
        self.name, self.limit, self.next = name, limit, next_approver

    def approve(self, amount):
        if amount <= self.limit:
            return f"{self.name} approved £{amount}"
        if self.next:
            return self.next.approve(amount)
        return "Rejected: over every limit"

chain = Approver("Team lead", 100, Approver("Manager", 1_000, Approver("Director", 10_000)))
chain.approve(450)        # 'Manager approved £450'
```

**Your interview answer** (say it out loud)

> Chain of Responsibility passes a request through a sequence of handlers until one deals with it — like expense approvals by amount, or middleware for auth, rate limiting and validation. It keeps each handler small and lets me reorder the chain.

**Follow-up questions**

- **Q: Where have you seen it?** Middleware in web frameworks (Express, Django, Spring filters), and events bubbling up through a web page.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the pattern with the support-line picture.
2. **Draw:** Draw the approval chain and trace a £450 request and a £20,000 request through it.
3. **Apply:** Write an ATM dispenser chain for £50, £20 and £10 notes that pays out £180.
4. **Trade-offs:** What makes a long chain hard to debug?

**Free resources (optional)**

- *Watch:* [Chain of Responsibility pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+Chain+of+Responsibility+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [Chain of Responsibility pattern](https://refactoring.guru/design-patterns/chain-of-responsibility) (Refactoring.Guru, free)

[Back to contents](#contents)

### 6.10 State

*Should know*

**Definition.** Lets an object change its behaviour when its internal state changes, by putting each state's behaviour in its own class.

**The problem it solves.** Objects with modes (an order that's paid or shipped, a machine that's idle or dispensing) often end up with if/else on a status field in every method, and invalid actions slip through.

**The idea.** A vending machine reacts differently to 'insert coin' when it's idle, when it already has money, or when it's sold out. Instead of an if/elif on a status variable inside every method, each state is a class that handles the events and decides the next state.

**How it works, step by step**

1. Draw the state diagram: states as circles, events as arrows between them.
2. Create one class per state, with one method per event.
3. Each method does what's valid in that state, and may move the object to a new state.
4. The main object holds its current state and forwards every event to it.
5. An event that isn't valid in a state returns a clear 'not allowed' instead of doing something wrong.

**Analogy.** A traffic light: what happens on the next tick depends on whether it's red, amber or green, and each colour knows which comes next.

**Where the analogy breaks.** A traffic light has three simple states. Real systems can have many states and transitions, so draw the state diagram first, or the classes become hard to follow.

**Example.** An order's life (created → paid → shipped → delivered, or cancelled), vending machines, elevators, network connections.

**Must-know points**

- Each state class handles the events that are valid in that state.
- Transitions are explicit; invalid actions get a clear response.
- Start by drawing a state diagram.
- A cousin of Strategy, but here the object changes its own behaviour.

**Common mistakes**

- States that know too much about each other.
- Forgetting some events in some states (like cancel while dispensing).

```python
class Idle:
    def insert_coin(self, machine):
        machine.state = HasCoin()
        return "coin accepted"
    def press(self, machine):
        return "insert a coin first"

class HasCoin:
    def insert_coin(self, machine):
        return "already has a coin"
    def press(self, machine):
        machine.state = Idle()
        return "here is your snack"

class VendingMachine:
    def __init__(self): self.state = Idle()
    def insert_coin(self): return self.state.insert_coin(self)
    def press(self): return self.state.press(self)
```

**Your interview answer** (say it out loud)

> State moves each state's behaviour into its own class, so a vending machine or an order behaves correctly for its current state and the transitions are explicit, instead of an if/else on a status field in every method.

**Follow-up questions**

- **Q: When is an enum and a switch enough?** When there are only a few states and events. The State pattern pays off as the states and rules grow.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain State with the traffic-light picture.
2. **Draw:** Draw the state diagram for an order: created, paid, shipped, delivered, cancelled, with the allowed transitions.
3. **Apply:** Extend the vending machine below with a SoldOut state and a refund action.
4. **Trade-offs:** State classes or a transition table (a dictionary of state → event → next state)?

**Free resources (optional)**

- *Watch:* [State pattern explained](https://www.youtube.com/results?search_query=Christopher+Okhravi+State+pattern) (Christopher Okhravi · free on YouTube)
- *Read:* [State pattern](https://refactoring.guru/design-patterns/state) (Refactoring.Guru, free)

[Back to contents](#contents)

---

## Phase 7: Low-level design questions

Practise the classic LLD questions end to end: requirements, classes, patterns, the key code and concurrency.

> **The big picture.** Every LLD question tests the same skills: turning requirements into clean classes, using a pattern where something varies, and handling two users acting at once. Do each question yourself first, then compare with the notes.

### 7.1 Design a parking lot

*Must know · LLD*

**Definition.** Design the classes for a multi-floor car park that assigns spots, issues tickets and charges fees.

**Why interviewers ask this.** It's the classic first LLD question: the entities are clear, there are natural places for patterns (pricing, spot assignment), and there's a real concurrency problem.

**Requirements**

*Functional:*

- Several floors, with spots of different sizes (small, compact, large).
- Vehicles (bike, car, truck) park in a suitable free spot.
- Issue a ticket on entry; calculate the fee on exit; take payment.
- Show free spots per floor on display boards.

*Non-functional:*

- Two vehicles must never get the same spot, even at different gates.
- Easy to add new vehicle types or pricing rules.

**Classes**

- ParkingLot: floors and gates; finds and assigns spots.
- Floor: its spots, and free counts by size.
- Spot: id, size, current vehicle (or none).
- Vehicle (abstract) → Bike, Car, Truck: each says which spot size it needs.
- Ticket: id, vehicle, spot, entry time.
- SpotAssignmentStrategy: for example, nearest free spot first.
- PricingStrategy: hourly, weekend, and so on.
- Payment: amount, method, status.

**Patterns used**

- Strategy (spot assignment, pricing)
- Factory (creating vehicles and spots)
- Observer (display boards)
- Singleton or one injected ParkingLot

**Start simple, then scale**

1. Version 1: one floor, one gate, one spot size, a flat fee. Classes: ParkingLot, Spot, Vehicle, Ticket.
2. Version 2: several spot sizes and vehicle types, a rule for which vehicle fits which spot, and pricing as a strategy.
3. Version 3: several floors and gates, with display boards observing the free counts.
4. Version 4: concurrency — claiming a spot atomically — and storing state in a database so gates on different servers agree.

**The design, step by step**

1. Entry: a vehicle arrives → the assignment strategy finds a free spot that fits → the spot is marked taken in one atomic step → a ticket is issued.
2. Exit: scan the ticket → the pricing strategy works out the fee from the time parked → payment → the spot is freed.
3. Display boards subscribe to spot changes (Observer) and update their counts.

**Deep dives**

- Concurrency: two gates assigning the same spot. Use a lock (per floor, or for the whole lot), or an atomic compare-and-set on the spot.
- Fit rules: can a bike use a car spot when bike spots are full? Decide, and say it out loud.
- Lost ticket: charge the maximum daily fee.
- Extensibility: electric-car charging spots become a new spot type with their own pricing strategy.

**Common mistakes**

- Putting pricing logic inside Ticket or Vehicle.
- Ignoring two gates acting at the same moment.
- Vehicle subclasses that override lots of behaviour instead of just declaring their size.

```python
from enum import Enum
from datetime import datetime
import threading, uuid

class Size(Enum):
    SMALL = 1
    COMPACT = 2
    LARGE = 3

class Vehicle:
    size = Size.COMPACT

class Car(Vehicle):
    size = Size.COMPACT

class Truck(Vehicle):
    size = Size.LARGE

class Spot:
    def __init__(self, spot_id, size):
        self.id, self.size, self.vehicle = spot_id, size, None

class Ticket:
    def __init__(self, vehicle, spot):
        self.id, self.vehicle, self.spot = uuid.uuid4().hex, vehicle, spot
        self.entry = datetime.now()

class ParkingLot:
    def __init__(self, spots, pricing):
        self.spots, self.pricing = spots, pricing
        self._lock = threading.Lock()

    def park(self, vehicle):
        with self._lock:                      # no two vehicles get the same spot
            spot = next((s for s in self.spots
                         if s.vehicle is None and s.size.value >= vehicle.size.value), None)
            if spot is None:
                raise RuntimeError("car park full")
            spot.vehicle = vehicle
        return Ticket(vehicle, spot)

    def leave(self, ticket):
        hours = (datetime.now() - ticket.entry).total_seconds() / 3600
        fee = self.pricing.fee(hours)
        ticket.spot.vehicle = None
        return fee
```

**Your interview answer** (say it out loud)

> Core classes: ParkingLot, Floor, Spot, the Vehicle types, Ticket and Payment. Spot assignment and pricing are strategies, so the rules can change without touching the rest. Parking is one atomic step — a lock or a compare-and-set — so two gates can't take the same spot. Display boards observe spot changes.

**Follow-up questions**

- **Q: How would this work with gates on different servers?** Keep spot state in a database and claim a spot with a conditional update (UPDATE … WHERE spot_id = ? AND vehicle_id IS NULL), trying another spot if no row changed.
- **Q: How would you add electric-car charging?** A new spot type with a charger, plus a pricing strategy that adds the energy cost. No existing classes change.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain your class design in 2 minutes, naming the patterns you used.
2. **Draw:** Draw the class diagram with relationships and multiplicities.
3. **Apply:** Complete the code with a PricingStrategy (first hour £2, then £1.50 per hour) and test parking 3 vehicles.
4. **Trade-offs:** One lock for the whole car park, one per floor, or a compare-and-set per spot: compare them.

**Free resources (optional)**

- *Watch:* [Parking lot low-level design](https://www.youtube.com/results?search_query=parking+lot+low+level+design+interview) (YouTube)
- *Code:* [Awesome Low-Level Design (questions and solutions)](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

### 7.2 Design an elevator system

*Should know · LLD*

**Definition.** Design the classes and scheduling logic for a building's lifts.

**Why interviewers ask this.** It tests state machines, scheduling and concurrency, and there's no single right answer, so your reasoning is what gets marked.

**Requirements**

*Functional:*

- Hall calls (up and down buttons on each floor) and car calls (floor buttons inside the lift).
- Several lifts; each hall call is assigned to one lift.
- Doors open and close; show the current floor and direction.
- Emergency stop and maintenance mode.

*Non-functional:*

- Short waiting times; far floors must not be starved.
- Safety: never move with the doors open.

**Classes**

- ElevatorController: receives calls and dispatches them.
- Elevator: id, current floor, direction, state, and its up and down stops.
- Request: floor, direction, type (hall call or car call).
- DispatchStrategy: chooses a lift for each hall call.
- Door, Display, Button: simple parts.

**Patterns used**

- State (Idle, MovingUp, MovingDown, DoorsOpen, Maintenance)
- Strategy (the dispatch algorithm)
- Observer (displays and buttons)

**Start simple, then scale**

1. Version 1: one lift with a list of requested floors, visited in order of arrival.
2. Version 2: one lift using LOOK scheduling: sweep up, then down.
3. Version 3: several lifts and a controller that gives each hall call to the lowest-cost lift.
4. Version 4: safety states (doors, overload, maintenance) and strategies for busy times.

**The design, step by step**

1. Each lift serves its stops with the LOOK algorithm: keep going in one direction, serving stops on the way, then turn around — like a lift operator sweeping up and down.
2. A controller assigns each hall call to the best lift: idle and near, or already moving towards that floor in the same direction.
3. Each lift has a state machine that enforces safety: doors must be closed before moving.

**Deep dives**

- Dispatch cost = distance + stops on the way + a penalty for the wrong direction.
- Peak times: in the morning rush, send idle lifts back to the ground floor.
- Concurrency: requests arrive from many buttons at once, so use a thread-safe queue into the controller.
- Overload sensor: the doors stay open.

**Common mistakes**

- First-come, first-served scheduling.
- No state machine, so 'moving with the doors open' is possible.
- Over-complicating the dispatch algorithm before the basics work.

```python
import heapq

class Elevator:
    def __init__(self, eid):
        self.id, self.floor, self.direction = eid, 0, 0     # -1 down, 0 idle, 1 up
        self.up_stops, self.down_stops = [], []             # simplified: two heaps

    def add_stop(self, floor):
        if floor >= self.floor:
            heapq.heappush(self.up_stops, floor)
        else:
            heapq.heappush(self.down_stops, -floor)

    def next_stop(self):
        if self.direction >= 0 and self.up_stops:
            self.direction = 1
            return heapq.heappop(self.up_stops)
        if self.down_stops:
            self.direction = -1
            return -heapq.heappop(self.down_stops)
        if self.up_stops:
            self.direction = 1
            return heapq.heappop(self.up_stops)
        self.direction = 0
        return None

def pick_elevator(elevators, floor, direction):
    def cost(e):
        heading_there = e.direction == direction and (floor - e.floor) * direction >= 0
        return abs(e.floor - floor) + (0 if e.direction == 0 or heading_there else 10)
    return min(elevators, key=cost)
```

**Your interview answer** (say it out loud)

> A controller receives hall calls and gives each one to the lift with the lowest cost: near, idle, or already heading that way. Each lift serves its stops with the LOOK algorithm — continue in one direction, then reverse. A state machine per lift guarantees the doors are closed before it moves.

**Follow-up questions**

- **Q: Why not first come, first served?** The lift would zig-zag between floors. Sweeping in one direction serves more people per trip and avoids starving any floor.
- **Q: How would you test it?** Simulate time in steps with scripted requests, check the safety rules (never moving with the doors open) and measure the average wait.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how LOOK scheduling works, using the lift-operator picture.
2. **Draw:** Draw the lift's state diagram and the class diagram.
3. **Apply:** Write a small simulation with 3 lifts and 20 random requests; print each lift's path and the average wait.
4. **Trade-offs:** Nearest-lift dispatch or zone-based dispatch (each lift serves certain floors): pros and cons.

**Free resources (optional)**

- *Watch:* [Elevator system low-level design](https://www.youtube.com/results?search_query=elevator+system+low+level+design+interview) (YouTube)
- *Code:* [Awesome Low-Level Design (questions and solutions)](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

### 7.3 Design Splitwise (expense sharing)

*Must know · LLD*

**Definition.** Design an expense-sharing app where friends split bills and can see who owes whom.

**Why interviewers ask this.** It tests clean modelling of money, validation, and a small algorithm (debt simplification), and it catches people who use floats for money.

**Requirements**

*Functional:*

- Users and groups.
- Add an expense paid by one person, split equally, by exact amounts, or by percentage.
- Show balances: who owes whom, and how much.
- Settle up, and simplify the debts in a group.

*Non-functional:*

- Money must be exact: no floating-point errors.
- Splits must always add up to the total.

**Classes**

- User; Group (members, expenses).
- Expense: payer, amount, splits, description.
- Split (abstract) → EqualSplit, ExactSplit, PercentSplit.
- SplitFactory: creates and validates splits.
- BalanceSheet: the net balance per user.
- DebtSimplifier: reduces the number of payments.

**Patterns used**

- Strategy or Factory (split types)
- Observer (tell members about new expenses)

**Start simple, then scale**

1. Version 1: equal splits only, stored as pairwise 'A owes B' records.
2. Version 2: exact and percentage splits, behind a split strategy that validates them.
3. Version 3: one net balance per user, plus debt simplification.
4. Version 4: groups, several currencies, history and notifications.

**The design, step by step**

1. Add an expense: validate the split (it sums to the total) → each participant now owes the payer their share.
2. Keep one net balance per user: positive means they're owed money, negative means they owe.
3. Simplify debts: repeatedly match the biggest debtor with the biggest creditor until everyone is at zero.

**Deep dives**

- Store money as whole pence (or Decimal), never as float.
- Rounding: £10 split three ways is 334 + 333 + 333 pence; give the extra penny to someone in a fixed, fair way.
- The greedy simplification settles n people in at most n − 1 payments.

**Common mistakes**

- Floats for money.
- Splits that don't add up to the total.
- Losing the leftover pence when rounding.

```python
from collections import defaultdict
import heapq

net = defaultdict(int)       # in pence: + is owed money, - owes money

def add_equal_expense(payer, amount_pence, people):
    share, remainder = divmod(amount_pence, len(people))
    for i, person in enumerate(people):
        owed = share + (1 if i < remainder else 0)    # spread the leftover pence
        net[person] -= owed
        net[payer] += owed

def simplify():
    creditors = [(-v, p) for p, v in net.items() if v > 0]
    debtors = [(v, p) for p, v in net.items() if v < 0]
    heapq.heapify(creditors)
    heapq.heapify(debtors)
    payments = []
    while creditors and debtors:
        c_amt, c = heapq.heappop(creditors)
        d_amt, d = heapq.heappop(debtors)
        pay = min(-c_amt, -d_amt)
        payments.append((d, c, pay))           # d pays c this many pence
        if -c_amt > pay:
            heapq.heappush(creditors, (c_amt + pay, c))
        if -d_amt > pay:
            heapq.heappush(debtors, (d_amt + pay, d))
    return payments
```

**Your interview answer** (say it out loud)

> Expenses have a payer and a list of splits, created by a split strategy that checks they add up to the total. Each expense updates a net balance per user, stored in whole pence. To settle a group, I greedily match the largest debtor with the largest creditor, which needs at most n − 1 payments.

**Follow-up questions**

- **Q: Why not use floats for money?** 0.1 + 0.2 isn't exactly 0.3 in binary floating point. Money needs whole minor units (pence) or Decimal.
- **Q: Is the greedy method optimal?** It always finishes in at most n − 1 payments, which is good. Finding the true minimum is NP-hard in general, so greedy is the practical choice.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how balances and debt simplification work, with an example of 3 friends.
2. **Draw:** Draw the class diagram, including the Split subclasses.
3. **Apply:** Add percentage and exact splits with validation, and test that £10 split three ways gives 334, 333 and 333 pence.
4. **Trade-offs:** Store every pairwise balance, or just one net balance per user? What does each make easy or hard?

**Free resources (optional)**

- *Watch:* [Splitwise low-level design](https://www.youtube.com/results?search_query=Splitwise+low+level+design+interview) (YouTube)
- *Code:* [Awesome Low-Level Design (questions and solutions)](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

### 7.4 Design a vending machine

*Should know · LLD*

**Definition.** Design a vending machine that sells items, accepts coins and gives change.

**Why interviewers ask this.** It's the clearest test of the State pattern: every action means something different depending on the machine's state.

**Requirements**

*Functional:*

- Select an item, insert money, get the item and any change.
- Cancel and get a refund.
- Restock items and coins (admin).

*Non-functional:*

- Never hand out an item without enough money, and never lose money.
- Clear behaviour in every state.

**Classes**

- VendingMachine: current state, inventory, coin box.
- State (interface) → Idle, ItemSelected, HasMoney, Dispensing, SoldOut.
- Inventory: slot → item and count.
- Item: name, price.
- ChangeCalculator: the coins to give back.

**Patterns used**

- State (the core of the design)
- Strategy (payment method: coins or card)

**Start simple, then scale**

1. Version 1: one item, exact coins only.
2. Version 2: several items, an inventory, and change-making.
3. Version 3: a State class for each mode, plus cancel and refund.
4. Version 4: card payments as a strategy, admin restocking, and recovery after a power cut.

**The design, step by step**

1. Idle → select an item → ItemSelected → insert money → HasMoney (once paid ≥ price) → Dispensing → give change → Idle.
2. Cancel while in ItemSelected or HasMoney → refund → Idle.
3. An item with no stock left → SoldOut for that item.

**Deep dives**

- Change-making: the greedy method works for UK coins when you have plenty of each, but with limited coins it can fail even when exact change is possible (60p with one 50p and three 20p coins). Use dynamic programming, or refuse the sale.
- Keep money in whole pence.
- Power cut mid-sale: record the transaction before dispensing, so it can be recovered.

**Common mistakes**

- An if/else on a status string in every method.
- Taking money for an item that's sold out.
- Assuming change can always be made.

```python
COINS = [200, 100, 50, 20, 10, 5, 2, 1]          # pence

def make_change(amount, available):
    """available: coin -> count. Returns the coins to give, or None."""
    given = {}
    for coin in COINS:
        use = min(amount // coin, available.get(coin, 0))
        if use:
            given[coin] = use
            amount -= coin * use
    return given if amount == 0 else None     # None: can't make exact change
```

**Your interview answer** (say it out loud)

> I'd model the machine with the State pattern — Idle, ItemSelected, HasMoney, Dispensing, SoldOut — so every action is only valid in the right state. Money is in pence; change is worked out from the coins actually available, and the sale is refused if exact change isn't possible.

**Follow-up questions**

- **Q: Why the State pattern here?** Every action (insert, select, cancel) behaves differently in each state; state classes avoid an if/else on a status field in every method.
- **Q: Is greedy change-making always right?** Yes for UK coins with an unlimited supply, but not with limited coin counts. Then use dynamic programming.

**Practise** (no answers here, on purpose)

1. **Explain:** Walk through one purchase, naming each state change.
2. **Draw:** Draw the state diagram, including cancel and sold-out.
3. **Apply:** Implement make_change, find a case where greedy fails with limited coins, and fix it with dynamic programming.
4. **Trade-offs:** State classes or a transition table for this machine?

**Free resources (optional)**

- *Read:* [State pattern](https://refactoring.guru/design-patterns/state) (Refactoring.Guru, free)
- *Code:* [Awesome Low-Level Design (questions and solutions)](https://github.com/ashishps1/awesome-low-level-design) (GitHub, free)

[Back to contents](#contents)

### 7.5 Design an LRU cache

*Must know · LLD*

**Definition.** Design a fixed-size cache that removes the least recently used item when full, with get and put in O(1).

**Why interviewers ask this.** It tests data-structure design under a strict time limit (O(1) operations), and it's asked both as a coding question and as a design question.

**Requirements**

*Functional:*

- get(key): return the value, or nothing if missing; it counts as a use.
- put(key, value): insert or update; if the cache is full, remove the least recently used item.

*Non-functional:*

- Both operations in O(1) time.
- Optionally thread-safe.

**Classes**

- LRUCache: capacity, a hash map from key to node, and a doubly linked list.
- Node: key, value, previous, next.

**Patterns used**

- Composition (map plus list)
- Strategy, if the eviction policy should be swappable

**Start simple, then scale**

1. Naive: a list kept in order of use. get is O(n), because you must find and move the item.
2. Better: a dictionary for lookups, but keeping the order still costs O(n).
3. Final: a dictionary plus a doubly linked list, so both operations are O(1).
4. Extensions: a TTL per entry, thread safety, or LFU instead of LRU.

**The design, step by step**

1. A hash map finds a key's node in O(1).
2. A doubly linked list keeps items in order of use: most recent at the front, least recent at the back.
3. get: move the node to the front. put: update and move to the front, or insert at the front and remove the back node if over capacity.

**Deep dives**

- Dummy head and tail nodes remove the edge cases.
- Thread safety: one lock around get and put (or several locks for parts of the cache).
- In Python, OrderedDict with move_to_end does the same in a few lines; know both versions.

**Common mistakes**

- A singly linked list, which can't remove a node in O(1).
- Forgetting to update the order on get.
- Forgetting to delete the evicted key from the dictionary.

```python
class Node:
    def __init__(self, key=None, val=None):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()        # dummy ends
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return None
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, val):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, val)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]
```

**Your interview answer** (say it out loud)

> A hash map from key to node gives O(1) lookup, and a doubly linked list keeps items in order of use. get moves the node to the front; put inserts at the front and removes the back node when over capacity. Dummy head and tail nodes keep the code simple.

**Follow-up questions**

- **Q: Why doubly linked?** To remove a node from the middle in O(1), you need to reach the node before it.
- **Q: LRU or LFU?** LRU removes the item used longest ago; LFU removes the item used least often. LFU protects popular items better but is more complex.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain why you need both a hash map and a doubly linked list.
2. **Draw:** Draw the list after put(1), put(2), get(1), put(3), with capacity 2.
3. **Apply:** Implement it from memory, then again with OrderedDict, and test both with the same sequence of calls.
4. **Trade-offs:** How would you make it thread-safe, and what does that cost?

**Free resources (optional)**

- *Watch:* [LRU Cache solution](https://www.youtube.com/results?search_query=NeetCode+LRU+cache) (NeetCode)
- *Code:* [146. LRU Cache](https://leetcode.com/problems/lru-cache/) (LeetCode)

[Back to contents](#contents)

### 7.6 Design an order-matching engine (stock exchange)

*Bonus · LLD*

**Definition.** Design the core of a stock exchange: an order book that matches buy and sell orders.

**Why interviewers ask this.** It tests data structures (heaps and queues), fairness rules, and why a single-threaded design can be both the fastest and the safest.

**Requirements**

*Functional:*

- Place limit orders (buy or sell at a price or better).
- Match orders by price, then time; allow partial fills.
- Cancel orders; publish trades.

*Non-functional:*

- Very low latency; fair and deterministic ordering.
- Never lose an order or fill it twice.

**Classes**

- Order: id, side, price, quantity, time.
- OrderBook (one per stock): bids and asks, first in first out at each price.
- MatchingEngine: processes incoming orders against the book.
- Trade: buyer, seller, price, quantity.

**Patterns used**

- Command (orders as objects in a sequenced log)
- Observer (the market-data feed)
- Strategy (order types)

**Start simple, then scale**

1. Version 1: one list of orders, scanned for a match every time (slow).
2. Version 2: buy and sell heaps ordered by price, first in first out at each price.
3. Version 3: partial fills, cancels and market orders.
4. Version 4: one single-threaded engine per stock, fed by a queue, with an event log for replay.

**The design, step by step**

1. An incoming buy order fills against the cheapest sell orders while their price is at or below the buy price, oldest first at each price.
2. Any quantity left over rests in the book.
3. Each stock's book is processed by one thread, in sequence, fed by a queue, so no locks are needed inside the book.

**Deep dives**

- Price-time priority: better price first; at the same price, the earliest order first.
- One thread per stock gives determinism and avoids locks; parallelism comes from different stocks.
- Log every order before processing it, so the book can be rebuilt by replay after a crash.

**Common mistakes**

- Ignoring time priority at the same price.
- Using locks inside the matching loop instead of processing in sequence.
- Floats for prices.

```python
import heapq, itertools

class OrderBook:
    def __init__(self):
        self.bids, self.asks = [], []        # heaps of (price key, time, qty, id)
        self.clock = itertools.count()

    def buy(self, order_id, price, qty):
        trades = []
        while qty and self.asks and self.asks[0][0] <= price:
            ask_price, t, ask_qty, ask_id = heapq.heappop(self.asks)
            fill = min(qty, ask_qty)
            trades.append((order_id, ask_id, ask_price, fill))
            qty -= fill
            if ask_qty > fill:
                heapq.heappush(self.asks, (ask_price, t, ask_qty - fill, ask_id))
        if qty:
            heapq.heappush(self.bids, (-price, next(self.clock), qty, order_id))
        return trades
```

**Your interview answer** (say it out loud)

> Each stock has an order book with bids in a max-heap and asks in a min-heap, first in first out within a price. A matching engine processes one stock's orders in sequence on a single thread: an incoming order fills against the best opposite prices while they cross, and any remainder rests in the book. Every order is logged first, so the book can be rebuilt.

**Follow-up questions**

- **Q: Why single-threaded?** Matching must be strictly ordered and repeatable. One thread per stock avoids locks and is very fast.
- **Q: What is price-time priority?** Better prices match first; at the same price, the order that arrived first matches first.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain price-time priority with a small example of 3 sell orders.
2. **Draw:** Draw the order book (bids and asks by price level) before and after a large buy order.
3. **Apply:** Add sell() and cancel() to the order book below, and test partial fills.
4. **Trade-offs:** Heaps or a sorted map of price levels: which makes cancel fast?

**Free resources (optional)**

- *Read:* [Hello Interview: stock exchange](https://www.google.com/search?q=Hello+Interview+stock+exchange) (hellointerview.com · free guides)
- *Read:* [How to build a fast limit order book](https://www.google.com/search?q=how+to+build+a+fast+limit+order+book) (blog post)

[Back to contents](#contents)

---

## Phase 8: High-level design questions

Practise the classic HLD questions with the full framework: requirements, estimates, API, data model, design, deep dives and trade-offs.

> **The big picture.** Each question reuses the core concepts. URL shortener is caching and IDs; chat is real-time connections and partitioning; news feed is fan-out; payments are transactions and idempotency. Try each one yourself for 30 minutes before reading the notes.

### 8.1 Design a URL shortener (like bit.ly)

*Must know · HLD*

**Definition.** Turn long URLs into short links, like bit.ly/x7Kp2a, that redirect to the original.

**Why interviewers ask this.** It's the classic first HLD question: small enough to finish, and it covers APIs, unique IDs, caching, database choice and read-heavy scaling.

**Requirements**

*Functional:*

- Create a short URL for a long URL (optional custom alias and expiry).
- Redirect from the short URL to the long URL.
- Optional: click analytics.

*Non-functional:*

- Very read-heavy: about 100 redirects per new link.
- Redirects in under about 50 ms; highly available.
- Codes must be unique and, ideally, hard to guess.

**Estimates**

- 100 million new links a month ≈ 40 writes per second; × 100 reads ≈ 4,000 redirects per second on average (peak maybe 10,000–20,000).
- Over 5 years: 6 billion links × about 500 bytes ≈ 3 TB.
- Base62 with 7 characters gives 62⁷ ≈ 3.5 trillion codes, which is plenty.

**API**

- `POST /urls {long_url, custom_alias?, expires_at?} → 201 {short_url}`
- `GET /{code} → 302 redirect to long_url`

**Data model**

- urls: code (primary key), long_url, user_id, created_at, expires_at
- Either SQL or a key-value store works, because all reads are by code.

**Start simple, then scale**

1. Version 1: one server and one database table mapping code → URL, with a counter in the database for IDs.
2. Version 2: a Redis cache for redirects, so most requests never touch the database.
3. Version 3: many stateless app servers behind a load balancer, with ID ranges reserved per server so there's no single counter.
4. Version 4: shard the table by code when it outgrows one database, and send click analytics through a queue.

**The design, step by step**

1. Write: the API generates a unique code and stores code → long URL.
2. Read: GET /{code} → check the Redis cache → on a miss, read the database → redirect.
3. Code generation: a distributed counter (ID ranges per server) encoded in Base62, or a hash of the URL cut to 7 characters, with collision checks.
4. Very popular links can also be cached at the edge.

**Deep dives**

- Counter + Base62: no collisions. Each server reserves a block of IDs from a coordinator, so servers don't fight over one counter.
- Hashing: the same URL always gets the same code (no duplicates), but collisions need check-and-retry.
- 301 (permanent; browsers cache it, so less load but no analytics) or 302 (temporary; every click reaches you, so analytics work).
- Analytics: log each click to a queue and aggregate in the background.

**Common mistakes**

- Hashing the URL without handling collisions.
- No caching, for a workload that's 100 times more reads than writes.
- Using 301 redirects, then wondering why the analytics are empty.

**Your interview answer** (say it out loud)

> It's a read-heavy key-value lookup. Writes generate a unique 7-character Base62 code from a distributed counter, with ID ranges reserved per server, and store code → URL. Reads go through a Redis cache in front of the database and return a 302, so we can count clicks; click events go onto a queue for background analytics.

**Follow-up questions**

- **Q: How do you stop people guessing other people's links?** Use random codes, or scramble the counter with a reversible shuffle, instead of handing out sequential codes.
- **Q: 301 or 302?** 302 if you want analytics or may change the target later; 301 if you want browsers to cache the redirect and reduce load.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the full read path and write path in 2 minutes.
2. **Draw:** Draw the architecture: load balancer, API servers, ID-range allocator, cache, database and analytics queue.
3. **Apply:** Write Base62 encode and decode functions in Python, and encode the numbers 1, 61, 62 and 3,500,000,000.
4. **Trade-offs:** Counter-based codes or hashing the URL: compare collisions, duplicates and guessability.

**Free resources (optional)**

- *Watch:* [ByteByteGo: design a URL shortener](https://www.youtube.com/results?search_query=ByteByteGo+design+a+URL+shortener) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a URL shortener](https://www.google.com/search?q=Hello+Interview+design+a+URL+shortener) (hellointerview.com · free guides)
- *Read:* [Hello Interview: design Bitly](https://www.google.com/search?q=Hello+Interview+design+Bitly) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.2 Design a distributed rate limiter

*Must know · HLD*

**Definition.** A service that limits how many requests each client can make, enforced consistently across many API servers.

**Why interviewers ask this.** It tests algorithms (token bucket and windows), shared state across servers, atomic updates and failure handling, all in one small system.

**Requirements**

*Functional:*

- Limit requests per user, API key or IP address per time window (for example 100 per minute).
- Different rules for different endpoints.
- Reject with 429 and tell the client when to retry.

*Non-functional:*

- Adds very little latency (1–2 ms at most).
- Highly available, and accurate enough across servers.
- Handles millions of clients.

**Estimates**

- 10 million active clients × one counter each × about 100 bytes ≈ 1 GB in Redis: it easily fits in memory.

**API**

- `Internal: allow(client_id, rule) → {allowed, remaining, retry_after}`
- `Response headers: X-RateLimit-Remaining, Retry-After`

**Data model**

- One Redis key per client per rule: tokens and last refill time (token bucket), or a counter with a TTL (fixed window).

**Start simple, then scale**

1. Version 1: an in-memory counter per user on one server.
2. Version 2: many servers, so the counters move to Redis.
3. Version 3: atomic updates with a Lua script, a token bucket for bursts, and rules from configuration.
4. Version 4: several regions, a fail-open fallback, and monitoring of rejected requests.

**The design, step by step**

1. The limiter runs as middleware in the API gateway.
2. Rules are loaded from a config store and cached locally.
3. Counters live in a Redis cluster and are checked and updated atomically with a Lua script (or INCR plus EXPIRE for fixed windows).
4. Over the limit → 429 with Retry-After.

**Deep dives**

- Race conditions: two servers reading and writing the same counter at once → use atomic Redis operations or a Lua script.
- Multiple regions: a limit per region (slightly inaccurate) or a global store (slower).
- Redis failure: fail open, with a local in-memory limit as a backup.
- Hot clients: spread counters across Redis nodes by client ID.

**Common mistakes**

- Read-then-write counters with no atomicity.
- Limiting per server instead of across all servers.
- No answer to 'what if Redis is down?'.

**Your interview answer** (say it out loud)

> I'd enforce limits in the API gateway using a token bucket per client and rule, with state in a Redis cluster updated atomically by a Lua script, adding about a millisecond. Rules come from configuration. Requests over the limit get 429 with Retry-After. If Redis is unavailable, the gateway fails open with a local backup limit.

**Follow-up questions**

- **Q: Why a Lua script?** It runs the read, the refill and the decrement as one atomic step inside Redis, so two requests can't both take the last token.
- **Q: How accurate is it across regions?** Per-region limits are fast but can let a client go slightly over the global limit; a global store is accurate but adds cross-region latency.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain where the limiter sits and what happens on each request.
2. **Draw:** Draw clients → gateway (with the limiter) → services, with Redis beside the gateway.
3. **Apply:** Implement a sliding-window-log limiter in Python, then sketch the Redis commands you would use for it.
4. **Trade-offs:** Token bucket or sliding window for an API that should allow short bursts?

**Free resources (optional)**

- *Watch:* [ByteByteGo: rate limiter system design](https://www.youtube.com/results?search_query=ByteByteGo+rate+limiter+system+design) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a rate limiter](https://www.google.com/search?q=Hello+Interview+design+a+rate+limiter) (hellointerview.com · free guides)
- *Read:* [Scaling your API with rate limiters](https://www.google.com/search?q=Stripe+blog+scaling+your+API+with+rate+limiters) (Stripe blog)

[Back to contents](#contents)

### 8.3 Design a notification system

*Must know · HLD*

**Definition.** Send notifications (mobile push, SMS, email) to users reliably, at large scale.

**Why interviewers ask this.** It tests queues, priorities, third-party integrations, retries and avoiding duplicates — everyday problems in real products.

**Requirements**

*Functional:*

- Services trigger notifications (order shipped, one-time passcodes, marketing).
- Channels: push, SMS, email; respect each user's preferences and opt-outs.
- Templates, scheduling, and retries on failure.

*Non-functional:*

- Millions a day, with big spikes during campaigns.
- Passcodes must arrive in seconds; marketing can be slower.
- Delivered at least once, without spamming duplicates.

**Estimates**

- 10 million push + 1 million SMS + 5 million emails a day ≈ 200 per second on average; campaigns can be 10–100 times higher.

**API**

- `POST /notifications {user_id, type, template_id, data, channels?, send_at?}`

**Data model**

- user_preferences (user_id, channel, opted_in)
- devices (user_id, push_token)
- notification_log (id, user_id, channel, status, created_at)

**Start simple, then scale**

1. Version 1: the order service calls the email provider directly.
2. Version 2: a notification service with templates and user preferences.
3. Version 3: a queue per channel, workers, retries and a dead-letter queue.
4. Version 4: priority lanes, idempotency keys, provider failover and per-user rate limits.

**The design, step by step**

1. A notification service checks preferences and rate limits, and fills in the template.
2. It puts messages onto separate queues per channel (push, SMS, email) and per priority (passcodes ahead of marketing).
3. Channel workers call the providers (Apple and Google push services, an SMS gateway, an email service).
4. Retries with backoff; repeated failures go to a dead-letter queue; every status is recorded in a log.

**Deep dives**

- De-duplication: an idempotency key per notification, so retries don't send twice.
- Separate priority queues, so a marketing blast never delays a passcode.
- Provider failover: a second SMS provider.
- A per-user rate limit, so nobody gets spammed.

**Common mistakes**

- Sending inside the user's request.
- One queue where marketing messages block passcodes.
- Retries without idempotency, so users get duplicates.

**Your interview answer** (say it out loud)

> Producers call a notification service that checks preferences, fills in templates and puts messages on queues per channel and priority. Workers deliver through providers like Apple and Google push services and SMS gateways, with retries, dead-letter queues and idempotency keys to avoid duplicates. Passcodes get a high-priority lane, so campaigns never delay them.

**Follow-up questions**

- **Q: How do you avoid sending the same notification twice?** An idempotency key per notification, checked in a store before sending; the worker records 'sent' only after success.
- **Q: What if a provider goes down?** Retry with backoff, then fail over to a backup provider, and circuit-break the failing one.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the flow from 'order shipped' to a phone notification.
2. **Draw:** Draw the service, the queues per channel and priority, the workers and the providers.
3. **Apply:** Design the data model for preferences, devices and the delivery log, with keys.
4. **Trade-offs:** One queue for everything, or separate queues per channel and priority?

**Free resources (optional)**

- *Watch:* [ByteByteGo: notification system design](https://www.youtube.com/results?search_query=ByteByteGo+notification+system+design) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a notification system](https://www.google.com/search?q=Hello+Interview+design+a+notification+system) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.4 Design a chat app (like WhatsApp)

*Must know · HLD*

**Definition.** One-to-one and group messaging, with delivery receipts and online status.

**Why interviewers ask this.** It tests real-time connections, routing between servers, storage for enormous write volumes, ordering and offline delivery.

**Requirements**

*Functional:*

- Send and receive messages in real time, one-to-one and in groups.
- Message history across devices; delivery to users who were offline.
- Sent, delivered and read receipts; online and last-seen status.

*Non-functional:*

- Low latency (under about 200 ms).
- Messages are never lost, and stay in order within a conversation.
- Billions of messages a day.

**Estimates**

- 500 million daily users × 40 messages ≈ 20 billion messages a day ≈ 230,000 per second on average.
- 20 billion × about 100 bytes ≈ 2 TB of text a day.

**API**

- `WebSocket events: send_message {conversation_id, client_msg_id, text}, ack, receipt`
- `REST: GET /conversations/{id}/messages?before=cursor`

**Data model**

- messages: partition key conversation_id, sort key message_id (time-ordered), in a Cassandra-style store
- conversations and members; user → connected gateway (Redis)

**Start simple, then scale**

1. Version 1: one server; clients poll a database for new messages.
2. Version 2: WebSockets to that server, pushing instead of polling.
3. Version 3: many gateway servers plus a registry of who is connected where, with messages routed between gateways.
4. Version 4: a partitioned message store, push notifications for offline users, receipts, presence and groups.

**The design, step by step**

1. Each client keeps a WebSocket connection to a chat gateway server.
2. Sending: gateway → chat service gives the message a time-ordered ID and stores it, then routes it.
3. Routing: look up the recipient's gateway in Redis and push to it; if they're offline, keep it stored and send a push notification.
4. Groups: send a copy to each member (small groups), or have members fetch it (very large groups).
5. Receipts and presence are small events that travel the same path.

**Deep dives**

- Ordering: a sequence number per conversation; clients sort by it.
- Retries without duplicates: the client creates a message ID, so resending is idempotent.
- Presence: heartbeats with a TTL in Redis; don't broadcast every status change to everyone.
- End-to-end encryption: the server only ever stores ciphertext.

**Common mistakes**

- Polling at scale.
- Forgetting offline users.
- No plan for ordering or duplicates.

**Your interview answer** (say it out loud)

> Clients hold WebSocket connections to gateway servers, and Redis maps each user to their gateway. The chat service stores every message in a Cassandra-style store partitioned by conversation, with a time-ordered ID, then routes it to the recipient's gateway — or keeps it and sends a push notification if they're offline. Client-generated message IDs make retries safe.

**Follow-up questions**

- **Q: How do you handle a group with 100,000 members?** Don't write a copy for every member. Store the message once and let members fetch it, or deliver lazily as they come online.
- **Q: How does a new phone get old messages?** History is stored on the server by conversation; the device syncs from the last message ID it has.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how a message reaches a user on a different gateway, and what happens if they're offline.
2. **Draw:** Draw the clients, gateways, Redis routing and presence, chat service, message store and push service.
3. **Apply:** Choose the partition key and sort key for messages, and explain the main query they serve.
4. **Trade-offs:** Fan-out on write or on read for group messages?

**Free resources (optional)**

- *Watch:* [ByteByteGo: design WhatsApp](https://www.youtube.com/results?search_query=ByteByteGo+design+WhatsApp) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a chat system](https://www.google.com/search?q=Hello+Interview+design+a+chat+system) (hellointerview.com · free guides)
- *Read:* [Hello Interview: design WhatsApp](https://www.google.com/search?q=Hello+Interview+design+WhatsApp) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.5 Design a news feed (like Twitter or Instagram)

*Must know · HLD*

**Definition.** Show each user a feed of recent posts from the people they follow.

**Why interviewers ask this.** It tests the fan-out trade-off — do the work when posting or when reading — plus caching and the celebrity problem.

**Requirements**

*Functional:*

- Create posts; follow and unfollow users.
- View a personalised feed (newest first, or ranked), with pagination.

*Non-functional:*

- The feed loads fast (under about 200 ms); very read-heavy.
- Eventual consistency is fine: a post can appear a few seconds later.

**Estimates**

- 300 million daily users × 10 feed views ≈ 35,000 reads per second; 2 posts each a day ≈ 7,000 writes per second.

**API**

- `POST /posts`
- `GET /feed?cursor=…`

**Data model**

- posts (post_id, author_id, content, created_at)
- follows (follower_id, followee_id)
- feed cache: user_id → recent post IDs (Redis)

**Start simple, then scale**

1. Version 1: fan-out on read: query the posts of everyone you follow, sorted by time.
2. Version 2: fan-out on write into per-user feed lists in Redis.
3. Version 3: a hybrid that handles celebrities differently.
4. Version 4: ranking, media through a CDN, and skipping inactive users.

**The design, step by step**

1. Fan-out on write (push): when someone posts, add the post ID to each follower's feed list. Reads are fast.
2. Fan-out on read (pull): build the feed at request time from the followed users' recent posts. Writes are cheap; reads are slow.
3. Hybrid: push for normal users; for celebrities with millions of followers, pull their posts at read time and merge.
4. Post content comes from a cache and media from a CDN; a ranking service can reorder the feed.

**Deep dives**

- The celebrity problem: pushing to 50 million followers for every post is far too expensive → use the hybrid.
- Each user's feed list keeps only the latest few hundred post IDs.
- Skip pushing to inactive users; build their feed when they log in.
- Ranking: gather candidates → score them with a model → re-rank for variety.

**Common mistakes**

- Push-only fan-out that ignores celebrities.
- Storing whole posts in every feed instead of post IDs.
- Offset pagination on a feed that keeps changing.

**Your interview answer** (say it out loud)

> I'd use a hybrid fan-out. When a normal user posts, workers push the post ID into each follower's feed list in Redis, so reading is a fast cache lookup. Celebrity posts aren't fanned out; their recent posts are fetched at read time and merged in. Post bodies come from a cache and media from a CDN.

**Follow-up questions**

- **Q: Why not fan out on write for everyone?** A celebrity with 50 million followers would cause 50 million writes per post: slow and wasteful.
- **Q: How do you paginate a feed that keeps changing?** With a cursor: continue from the last post ID the user saw, so new posts don't shift the pages.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain push, pull and hybrid fan-out, and the celebrity problem.
2. **Draw:** Draw the write path and the read path for the hybrid design.
3. **Apply:** Estimate how many writes one celebrity post causes with push fan-out, and compare with the hybrid.
4. **Trade-offs:** A chronological feed or a ranked feed: what changes in the architecture?

**Free resources (optional)**

- *Watch:* [ByteByteGo: design Twitter](https://www.youtube.com/results?search_query=ByteByteGo+design+Twitter) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a news feed system](https://www.google.com/search?q=Hello+Interview+design+a+news+feed+system) (hellointerview.com · free guides)
- *Read:* [Hello Interview: design a news feed](https://www.google.com/search?q=Hello+Interview+design+a+news+feed) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.6 Design a video streaming platform (like YouTube or Netflix)

*Must know · HLD*

**Definition.** Upload, process and stream videos to millions of viewers.

**Why interviewers ask this.** It tests large-file handling, background processing pipelines, CDNs and adaptive streaming — dealing with petabytes, not just requests.

**Requirements**

*Functional:*

- Upload videos and process them into several resolutions.
- Stream with quality that adapts to the viewer's connection; search and view details.
- View counts and likes.

*Non-functional:*

- Smooth playback worldwide; enormous bandwidth.
- Uploads are never lost; processing may take minutes.
- Reads are highly available.

**Estimates**

- 5 million daily viewers × 5 videos × about 300 MB ≈ 7.5 PB of video sent a day — which is why CDNs are essential.

**API**

- `POST /videos → pre-signed upload URL`
- `GET /videos/{id} → details and manifest URL`

**Data model**

- videos (id, owner_id, title, status, manifest_url)
- Raw and encoded files in object storage.

**Start simple, then scale**

1. Version 1: upload a file to a server and serve it as it is.
2. Version 2: files in object storage, details in a database.
3. Version 3: a transcoding pipeline driven by a queue, producing several qualities.
4. Version 4: segments with HLS or DASH, adaptive bitrate, CDN delivery, and view counts in the background.

**The design, step by step**

1. Upload: the client gets a pre-signed URL and uploads in parts straight to object storage.
2. An event on a queue triggers transcoding workers, which cut the video into short segments and encode several resolutions and bitrates (a graph of tasks).
3. The outputs go to object storage, with a manifest (HLS or DASH) listing the segments for each quality.
4. Playback: the player fetches the manifest and segments from a CDN and switches quality as bandwidth changes (adaptive bitrate).
5. Video details live in a database with a cache; view counts are aggregated in the background.

**Deep dives**

- Adaptive bitrate: small segments (2–10 seconds) at several qualities.
- Transcoding runs in parallel per segment, with retries per task.
- Popular videos sit on the CDN; rarely watched ones are served from origin.
- Resumable uploads for big files.

**Common mistakes**

- Streaming from your own servers instead of a CDN.
- Transcoding inside the upload request.
- One quality for every device and connection.

**Your interview answer** (say it out loud)

> Uploads go straight to object storage with pre-signed URLs. A queue triggers transcoding workers that encode short segments at several bitrates and write HLS or DASH manifests. Viewers stream the segments from a CDN with adaptive bitrate. Video details live in a database behind a cache, and view counts are aggregated in the background.

**Follow-up questions**

- **Q: Why split videos into segments?** Segments can be transcoded in parallel, cached by the CDN, and let the player switch quality in the middle of a video.
- **Q: How do you count views at this scale?** Send view events to a stream, aggregate them in batches, and update the stored total periodically.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the pipeline from upload to playback in 2 minutes.
2. **Draw:** Draw the upload, the transcoding pipeline, storage, the CDN and the player.
3. **Apply:** Estimate the storage for one 10-minute video encoded at 4 qualities: 0.5, 1, 3 and 6 Mbps.
4. **Trade-offs:** Build your own CDN (like Netflix) or use a commercial one?

**Free resources (optional)**

- *Watch:* [ByteByteGo: design YouTube](https://www.youtube.com/results?search_query=ByteByteGo+design+YouTube) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design YouTube](https://www.google.com/search?q=Hello+Interview+design+YouTube) (hellointerview.com · free guides)
- *Read:* [Netflix Technology Blog](https://www.google.com/search?q=Netflix+technology+blog) (Netflix)

[Back to contents](#contents)

### 8.7 Design a ride-hailing app (like Uber)

*Should know · HLD*

**Definition.** Match riders with nearby drivers in real time, track trips and charge fares.

**Why interviewers ask this.** It tests geospatial search, very high-volume updates, real-time matching and preventing double-booking.

**Requirements**

*Functional:*

- Drivers send their location every few seconds.
- A rider requests a ride; the system finds nearby drivers and offers the trip.
- Track the trip live; work out the fare and take payment.

*Non-functional:*

- Matching within seconds; a very high volume of location updates.
- A driver must never be given two trips at once.

**Estimates**

- 1 million active drivers × one update every 4 seconds ≈ 250,000 location writes per second.

**API**

- `POST /rides {pickup, dropoff}`
- `PUT /drivers/{id}/location`
- `WebSocket for live trip updates`

**Data model**

- Live driver locations in memory, indexed by geohash cell.
- trips (id, rider_id, driver_id, status, fare) in a relational database.

**Start simple, then scale**

1. Version 1: driver locations in a database; for each request, compute the distance to every driver.
2. Version 2: a grid or geohash cells, searching only the nearby cells.
3. Version 3: an in-memory geo index, a matching service and atomic driver locking.
4. Version 4: a trip state machine, surge pricing, payments, and analytics on location history.

**The design, step by step**

1. A location service takes driver updates and keeps only the latest position in an in-memory geospatial index (geohash cells, for example Redis GEO).
2. A matching service searches nearby cells, ranks drivers by arrival time, and offers the trip to one driver at a time with a timeout.
3. The offered driver is locked with an atomic status update, so they can't be double-booked.
4. A trip service tracks the trip's state; pricing (including surge) and payment services handle the money.

**Deep dives**

- Geohash: nearby places share a prefix; search the rider's cell and its neighbours.
- Location updates are short-lived: keep only the latest in memory, and stream the history to cheap storage for analytics.
- Surge pricing from supply and demand in each area.
- Driver assignment uses an atomic compare-and-set.

**Common mistakes**

- Scanning every driver for every request.
- Saving every location update permanently in the main database.
- Offering one ride to several drivers without locking.

**Your interview answer** (say it out loud)

> Drivers stream their location to a location service that keeps only the latest position in an in-memory geospatial index. A ride request searches nearby cells, ranks drivers by arrival time and offers the trip to one driver at a time, locking that driver atomically to prevent double-booking. Trips and payments live in a transactional database.

**Follow-up questions**

- **Q: What is a geohash?** A short string that encodes latitude and longitude as nested grid cells. Nearby places share a prefix, so 'nearby' becomes a prefix lookup plus the neighbouring cells.
- **Q: Why not save every location update in a database?** That's 250,000 writes a second of data that's out of date within seconds. Keep the latest in memory and stream the history to cheap storage.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how 'find nearby drivers' works with geohashes.
2. **Draw:** Draw driver app → location service → geo index, and rider → matching → trip service.
3. **Apply:** Bucket 10,000 random points into a simple grid (or with a geohash library), then find the neighbours of one point.
4. **Trade-offs:** Geohash or quadtree for a city where driver density is very uneven?

**Free resources (optional)**

- *Watch:* [ByteByteGo: design Uber](https://www.youtube.com/results?search_query=ByteByteGo+design+Uber) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: proximity service, and nearby friends](https://www.google.com/search?q=Hello+Interview+proximity+service%2C+and+nearby+friends) (hellointerview.com · free guides)
- *Read:* [Hello Interview: design Uber](https://www.google.com/search?q=Hello+Interview+design+Uber) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.8 Design a payment system

*Must know · HLD*

**Definition.** Process payments reliably: charge customers, record every money movement, and never lose money or charge twice.

**Why interviewers ask this.** It tests correctness under failure — retries, timeouts, idempotency, transactions and audit trails — where a small bug means real money.

**Requirements**

*Functional:*

- Accept a payment for an order through a payment provider (PSP) that talks to the card networks.
- Record every money movement in a ledger.
- Refunds; reconciliation with the provider's reports.

*Non-functional:*

- Correctness over speed: no double charges, no lost money.
- Strong consistency and a full audit trail.
- Secure (PCI DSS rules for card data) and highly available.

**Estimates**

- 1 million payments a day ≈ 12 per second on average: the volume is modest; correctness is the hard part.

**API**

- `POST /payments {order_id, amount, currency, idempotency_key} → payment status`
- `Webhook from the provider: payment succeeded or failed`

**Data model**

- payments (id, order_id, amount, currency, status, idempotency_key UNIQUE)
- ledger_entries (id, account_id, payment_id, debit, credit, created_at), append-only and double-entry

**Start simple, then scale**

1. Version 1: call the payment provider and mark the order 'paid'.
2. Version 2: a payments table with statuses and idempotency keys.
3. Version 3: a double-entry ledger, written in the same transaction as the status change.
4. Version 4: webhooks, an outbox, reconciliation, and handling results that are unknown.

**The design, step by step**

1. The payment service receives the request with an idempotency key; a unique constraint in the database blocks duplicates.
2. It creates a PENDING payment record, then calls the payment provider. The provider handles the card details, so you never store raw card numbers.
3. The provider's result (response or webhook) updates the status, and balanced double-entry ledger rows are written in the same transaction.
4. The order service is told through an outbox event.
5. A nightly reconciliation job compares the ledger with the provider's settlement files.

**Deep dives**

- Idempotency keys plus unique constraints make every retry safe.
- Double-entry ledger: every movement is a debit and an equal credit; balances are sums; entries are never edited, only added (corrections are new entries).
- Provider timeout: the result is unknown, so retry with the same idempotency key or ask the provider for the status before doing anything else.
- Store money as whole minor units (pence) together with the currency.

**Common mistakes**

- Retrying a timed-out charge with a brand-new request.
- Floats for money.
- Updating balances in place, with no ledger history.

**Your interview answer** (say it out loud)

> Correctness first. Every payment request carries an idempotency key enforced by a unique constraint. The payment service records a pending payment, calls the payment provider — which holds the card data, so we never store card numbers — and on the result writes balanced double-entry ledger rows in one ACID transaction. Events go out through an outbox, and daily reconciliation against the provider catches any mismatch.

**Follow-up questions**

- **Q: The call to the provider timed out. Did the customer pay?** We don't know. Never retry with a new request: retry with the same idempotency key, or ask the provider for the payment's status first.
- **Q: Why double-entry?** Every debit has a matching credit, so the books always balance, mistakes show up as imbalances, and the history is a complete audit trail.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how idempotency keys prevent a double charge, using a timeout example.
2. **Draw:** Draw client → payment service → provider, with the ledger database, outbox and reconciliation job.
3. **Apply:** Write the ledger rows (debits and credits) for a £50 purchase followed by a £20 partial refund.
4. **Trade-offs:** Why choose strong consistency and a relational database here, even if it costs some availability?

**Free resources (optional)**

- *Watch:* [ByteByteGo: payment system design](https://www.youtube.com/results?search_query=ByteByteGo+payment+system+design) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: payment system](https://www.google.com/search?q=Hello+Interview+payment+system) (hellointerview.com · free guides)
- *Read:* [Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency) (Stripe blog)

[Back to contents](#contents)

### 8.9 Design search autocomplete

*Should know · HLD*

**Definition.** Suggest the top completions as the user types into a search box.

**Why interviewers ask this.** It tests data structures at scale (tries), precomputing results, caching, and separating serving from data processing.

**Requirements**

*Functional:*

- Return the top 5–10 suggestions for a prefix.
- Rank by popularity, and by freshness.

*Non-functional:*

- Very fast: under about 100 ms per keystroke.
- Highly available; suggestions can be slightly out of date.

**Estimates**

- 10 million daily users × 10 searches × about 10 keystrokes ≈ 1 billion requests a day ≈ 12,000 per second.

**API**

- `GET /suggest?q=pyt → ['python', 'python tutorial', …]`

**Data model**

- Trie: each node stores its top-k completions, precomputed.
- Search logs → counts, aggregated in the background.

**Start simple, then scale**

1. Version 1: an SQL query: LIKE 'prefix%' ORDER BY count LIMIT 5.
2. Version 2: an in-memory trie, searching the subtree on each request.
3. Version 3: top-k precomputed at every node, rebuilt by a background job.
4. Version 4: tries split across servers, edge caching, trending updates and filtering.

**The design, step by step**

1. Serving: an in-memory trie (or a prefix → top-k map in Redis); a lookup just walks the prefix.
2. Data pipeline: log searches → count them every hour or day → rebuild the trie → swap the new one in.
3. Client: wait for a short pause in typing before asking, and cache recent prefixes; cache common prefixes at the edge.
4. Split the trie across servers by prefix when it gets too big.

**Deep dives**

- Store the top-k completions at every node, so a query never has to search a whole subtree.
- Freshness: trending terms through a streaming pipeline, with older counts decaying over time.
- Filter out offensive suggestions.
- Personalisation: blend global suggestions with the user's own history.

**Common mistakes**

- Searching the whole subtree on every keystroke.
- Rebuilding the trie inside the serving path.
- Sending a request on every keystroke, with no pause.

**Your interview answer** (say it out loud)

> Suggestions are served from an in-memory trie where each node already stores its top-k completions, so a lookup is just walking the prefix. Search logs feed a background job that rebuilds the trie regularly. Clients wait for a pause in typing and cache results, and popular prefixes are cached at the edge.

**Follow-up questions**

- **Q: Why store the top-k at every node?** Otherwise each request would have to search the whole subtree under the prefix, which is far too slow.
- **Q: How do you handle a sudden trending term?** A streaming job updates counts with time decay and patches hot prefixes between full rebuilds.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the serving path and the data pipeline separately.
2. **Draw:** Draw a small trie for 'tea', 'ten', 'tent' and 'to', with the top-2 completions stored at each node.
3. **Apply:** Build a trie in Python that stores the top-3 completions at each node from a word-frequency list, and time 10,000 lookups.
4. **Trade-offs:** A trie in memory, prefix keys in Redis, or a search engine: compare.

**Free resources (optional)**

- *Watch:* [ByteByteGo: design search autocomplete](https://www.youtube.com/results?search_query=ByteByteGo+design+search+autocomplete) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a search autocomplete system](https://www.google.com/search?q=Hello+Interview+design+a+search+autocomplete+system) (hellointerview.com · free guides)

[Back to contents](#contents)

### 8.10 Design a real-time leaderboard

*Should know · HLD*

**Definition.** Show live rankings of players by score, including each player's own rank.

**Why interviewers ask this.** It tests choosing the right data structure (a sorted set), and keeping a fast in-memory view in step with durable storage.

**Requirements**

*Functional:*

- Update a player's score.
- Get the top N players; get one player's rank and the players around them.

*Non-functional:*

- Updates and reads in milliseconds.
- Millions of players.

**Estimates**

- 10 million players; 5 million score updates a day ≈ 60 writes per second, with far more reads.

**API**

- `POST /scores {player_id, delta}`
- `GET /leaderboard/top?n=10`
- `GET /leaderboard/rank/{player_id}`

**Data model**

- Redis sorted set: member = player_id, score = points.
- A durable copy of every score in a database.

**Start simple, then scale**

1. Version 1: an SQL table with ORDER BY score LIMIT 10.
2. Version 2: a Redis sorted set for the top N and for ranks.
3. Version 3: a separate set per period, tie-breaking, and a durable copy for recovery.
4. Version 4: splitting the set, or approximate ranks, for very large numbers of players.

**The design, step by step**

1. Score updates go to the game service, which saves them durably and updates a Redis sorted set.
2. Top N: ZREVRANGE 0 N−1. A player's rank: ZREVRANK. Both run in logarithmic time.
3. A separate sorted set per period (daily, weekly), with expiry.
4. At very large scale: split by score range, or give approximate ranks.

**Deep dives**

- Sorted sets are skip lists: logarithmic updates and rank lookups.
- Ties: fold a timestamp into the score, so whoever reached it first ranks higher.
- Rebuild Redis from the database after a failure.

**Common mistakes**

- Recalculating ranks with SQL on every request.
- No durable copy, so a Redis restart loses the scores.
- Ignoring ties.

**Your interview answer** (say it out loud)

> I'd use a Redis sorted set with the player ID as the member and the score as the sort value: ZINCRBY to update, ZREVRANGE for the top N, and ZREVRANK for a player's rank — all logarithmic. Scores are also saved durably, so the set can be rebuilt. Each time period gets its own set.

**Follow-up questions**

- **Q: Why not SQL with ORDER BY score?** Sorting 10 million rows on every request is slow; a sorted set stays in order as scores change.
- **Q: How do you break ties?** Fold a tie-breaker into the score, for example score × 10¹⁰ minus the timestamp in seconds, so earlier players rank higher.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain why a sorted set makes rank lookups fast.
2. **Draw:** Draw the update path and the read path, including the durable database.
3. **Apply:** Implement a leaderboard in Python with the bisect module supporting update, top N and rank, then write the matching Redis commands.
4. **Trade-offs:** Exact ranks for 100 million players, or approximate percentiles: what changes?

**Free resources (optional)**

- *Read:* [Hello Interview: real-time gaming leaderboard](https://www.google.com/search?q=Hello+Interview+real-time+gaming+leaderboard) (hellointerview.com · free guides)
- *Read:* [Redis sorted sets](https://www.google.com/search?q=Redis+docs+sorted+sets) (Redis documentation)

[Back to contents](#contents)

### 8.11 Design a distributed cache

*Should know · HLD*

**Definition.** A shared in-memory key-value cache, like Redis or Memcached, spread across many machines.

**Why interviewers ask this.** It tests partitioning, consistent hashing, eviction, replication and failure handling — the building blocks of most large systems.

**Requirements**

*Functional:*

- get, set and delete, with TTLs.
- Grow capacity by adding nodes.

*Non-functional:*

- Reads in under a millisecond; very high throughput.
- Survive node failures with limited data loss.

**Estimates**

- 1 TB of hot data ÷ 64 GB per node ≈ 16 nodes, plus replicas.

**API**

- `get(key), set(key, value, ttl), delete(key)`

**Data model**

- Per node: a hash map plus an LRU list for eviction.

**Start simple, then scale**

1. Version 1: one cache server with a hash map and LRU eviction.
2. Version 2: several servers using hash % N routing.
3. Version 3: consistent hashing with virtual nodes.
4. Version 4: replicas, failover, hot-key handling and stampede protection.

**The design, step by step**

1. Clients, or a proxy, route each key to a node with consistent hashing and virtual nodes.
2. Each node: an in-memory hash table with LRU eviction and TTL expiry.
3. Each shard has a replica for failover.
4. Cluster membership comes from a configuration service, or nodes gossip with each other.

**Deep dives**

- Hot keys: replicate them, or add a small local cache inside the app.
- Cache stampede: let one request rebuild a key while the others wait.
- Node failure: promote the replica; the misses fall on the database, so warm the cache gradually.
- Optional persistence (snapshots or an append-only file in Redis).

**Common mistakes**

- hash % N routing, which causes mass misses whenever servers change.
- No plan for hot keys.
- No warm-up after a failure.

**Your interview answer** (say it out loud)

> Keys are spread across nodes with consistent hashing and virtual nodes, so adding a node moves only a small share of the keys. Each node is an in-memory hash map with LRU eviction and TTLs, replicated for failover. Hot keys get extra replicas or a local cache, and stampedes are prevented by letting one request rebuild a key.

**Follow-up questions**

- **Q: Redis or Memcached?** Memcached: simple, multi-threaded, strings only. Redis: rich data structures, persistence options, replication and clustering.
- **Q: What happens when a node dies?** Its replica is promoted. Without replicas, its keys become misses that hit the database until the cache warms up again.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain how a key finds its node, and what happens when a node is added.
2. **Draw:** Draw clients, the consistent-hash ring, and cache nodes with replicas.
3. **Apply:** Combine your LRU cache and consistent-hash ring into a small multi-node cache simulation in Python.
4. **Trade-offs:** Routing in the client library or through a proxy layer: compare.

**Free resources (optional)**

- *Watch:* [ByteByteGo: how Redis works](https://www.youtube.com/results?search_query=ByteByteGo+how+Redis+works) (ByteByteGo · YouTube)
- *Read:* [Hello Interview: design a key-value store](https://www.google.com/search?q=Hello+Interview+design+a+key-value+store) (hellointerview.com · free guides)
- *Read:* [Scale with Redis Cluster](https://www.google.com/search?q=Redis+docs+scale+with+Redis+Cluster) (Redis documentation)

[Back to contents](#contents)

---

## Phase 9: AI and ML system design

The design questions AI and ML engineer interviews ask: RAG assistants, recommendations, fraud detection, LLM serving, and the pipeline that trains and ships models.

> **The big picture.** ML system design is normal system design plus three extra worries: where the data and features come from, how you know the model is good (evaluation), and what happens when the world changes (drift). Use the same framework, and give those three their own deep dives.

### 9.1 Design a RAG assistant over company documents

*Must know · AI/ML*

**Definition.** A chat assistant that answers employees' questions from the company's own documents, with sources.

**Why interviewers ask this.** It's the most common AI-engineering design question: it tests retrieval, prompting, permissions, evaluation and cost control together.

**Requirements**

*Functional:*

- Ingest documents (PDFs, wiki pages, tickets) and keep them up to date.
- Answer questions with citations, and say 'I don't know' when the answer isn't there.
- Respect document permissions.

*Non-functional:*

- Answers in a few seconds, streamed.
- Accurate and grounded, with measurable quality.
- Cost per question under control; secure.

**Estimates**

- 1 million documents × 20 chunks × 1,536-dimension float32 embeddings ≈ 120 GB of vectors before compression.

**API**

- `POST /chat {conversation_id, message} → streamed answer with sources`
- `Ingestion: document-change events → pipeline`

**Data model**

- chunks (id, doc_id, text, embedding, permissions, updated_at) in a vector store with metadata filters
- conversations, and traces for evaluation

**Start simple, then scale**

1. Version 1: embed all the chunks, search them in memory with cosine similarity, and put the top 5 into a prompt.
2. Version 2: a vector store, an ingestion pipeline and citations.
3. Version 3: hybrid search, re-ranking, permission filters and question rewriting.
4. Version 4: evaluation sets, tracing, caching, model routing and guardrails.

**The design, step by step**

1. Ingestion: parse → clean → split into chunks with some overlap → embed → store in a vector store with permission metadata, triggered whenever a document changes.
2. Query: rewrite the question using the conversation → hybrid retrieval (vectors plus keywords), filtered by the user's permissions → re-rank → build a prompt with the top chunks → the LLM streams an answer with citations.
3. Guardrails: check retrieved text for prompt injection, and check the output.
4. Observability: trace every step; run evaluations on a golden set; collect user feedback.

**Deep dives**

- Permissions are enforced in the retrieval filter; never rely on the LLM to hide data.
- Chunking and re-ranking usually bring the biggest quality gains.
- Evaluation: retrieval recall@k plus answer faithfulness on a golden set, run as regression tests for every change.
- Cost and latency: cache frequent answers; send easy questions to a smaller model.

**Common mistakes**

- No evaluation, so changes are judged by feel.
- Handling permissions by asking the LLM not to reveal things.
- Never updating the index when documents change.

**Your interview answer** (say it out loud)

> Two pipelines. Ingestion parses, chunks and embeds documents into a vector store with permission metadata, updated whenever a document changes. At query time we rewrite the question, run hybrid retrieval filtered by the user's permissions, re-rank, and give the top chunks to the LLM, which streams a cited answer. Every request is traced, and quality is tracked against a golden evaluation set.

**Follow-up questions**

- **Q: How do you stop it leaking documents a user shouldn't see?** Enforce permissions in the retrieval filter, so forbidden chunks are never put into the prompt at all.
- **Q: Answers got worse after a change. How do you find out why?** Run the evaluation set to see whether retrieval recall or answer faithfulness dropped, then read the traces of the failing questions.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the ingestion pipeline and the query pipeline separately.
2. **Draw:** Draw the full architecture, including permissions, the re-ranker, the LLM, tracing and evaluations.
3. **Apply:** Write 10 golden questions for an HR-policy assistant, and what a correct answer to each must contain.
4. **Trade-offs:** A long-context model reading whole documents, or RAG with chunks: compare cost, freshness and accuracy.

**Free resources (optional)**

- *Read:* [Building A Generative AI Platform](https://huyenchip.com/2024/07/25/genai-platform.html) (Chip Huyen's blog · free)
- *Read:* [Patterns for Building LLM-based Systems & Products](https://eugeneyan.com/writing/llm-patterns/) (Eugene Yan)
- *Read:* [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/) (Hamel Husain)

[Back to contents](#contents)

### 9.2 Design a recommendation system

*Must know · AI/ML*

**Definition.** Recommend items (videos, products, posts) that each user is likely to engage with.

**Why interviewers ask this.** It tests the two-stage pattern (retrieve, then rank), feature consistency, feedback loops, and how to measure success.

**Requirements**

*Functional:*

- Personalised home-page recommendations.
- 'Similar items' on each item's page.
- Learn from clicks, watches and purchases.

*Non-functional:*

- Results in about 100–200 ms.
- Fresh: reacts quickly to new behaviour.
- Millions of users and items.

**Estimates**

- 10 million users × 1 home-page load a day × 500 candidates scored ≈ 5 billion scores a day, which is why a cheap first stage must cut the candidates down.

**API**

- `GET /recommendations?user_id=…&surface=home`

**Data model**

- Interaction logs (user, item, event, time) → feature store (user and item features) → embedding index.

**Start simple, then scale**

1. Version 1: show everyone the most popular items.
2. Version 2: item-to-item similarity ('people who watched X also watched Y').
3. Version 3: embeddings to gather candidates, plus a ranking model.
4. Version 4: a feature store, re-ranking rules, exploration and A/B testing.

**The design, step by step**

1. Two stages. Candidate generation retrieves about 500–1,000 items quickly (embedding similarity with approximate nearest-neighbour search, items often bought together, popular items). Ranking then scores those candidates with a richer model using user, item and context features.
2. Re-ranking applies business rules: variety, freshness, removing items already seen.
3. Models train offline on logged interactions; features come from a feature store, defined the same way for training and serving.
4. Online A/B tests measure the real impact of every change.

**Deep dives**

- Cold start: new users get popular and contextual items; new items use content features.
- Feedback loops and popularity bias: add some exploration.
- Training-serving skew: one feature definition used both offline and online.
- Metrics: offline (recall@k, NDCG) and online (click-through, watch time, retention).

**Common mistakes**

- Scoring every item with a heavy model on every request.
- Judging success only by offline metrics.
- Ignoring the cold-start problem.

**Your interview answer** (say it out loud)

> A two-stage system: candidate generation pulls about a thousand items cheaply using embedding similarity and simple sources, then a ranking model scores them with user, item and context features from a feature store. A final re-ranking step applies variety and business rules. Models train offline on interaction logs, and every change is checked with an online A/B test.

**Follow-up questions**

- **Q: Why two stages?** Scoring millions of items with a heavy model on every request is too slow. A cheap retrieval step narrows the pool, so the expensive model only scores hundreds.
- **Q: How do you handle a brand-new user?** Popular and trending items, context such as country and device, then adapt quickly from their first clicks.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain candidate generation and ranking, and why both exist.
2. **Draw:** Draw logs → features → training → models, and request → candidates → ranking → re-ranking.
3. **Apply:** Build item-to-item recommendations from a small ratings dataset using cosine similarity in NumPy.
4. **Trade-offs:** Optimising for clicks, for watch time, or for long-term retention: what can go wrong with each?

**Free resources (optional)**

- *Read:* [Recommendation systems course](https://developers.google.com/machine-learning/recommendation) (Google for Developers, free)
- *Read:* [System Design for Recommendations and Search](https://eugeneyan.com/writing/system-design-for-discovery/) (Eugene Yan)
- *Read:* [CS329S: Machine Learning Systems Design (lecture notes)](https://stanford-cs329s.github.io/) (Chip Huyen, Stanford · free)

[Back to contents](#contents)

### 9.3 Design a real-time fraud detection system

*Must know · AI/ML*

**Definition.** Score every card transaction for fraud within milliseconds, and block or flag the risky ones.

**Why interviewers ask this.** It tests real-time ML: low-latency features, imbalanced data, thresholds based on costs, labels that arrive late, and drift.

**Requirements**

*Functional:*

- Score every transaction before it's approved.
- Allow, block, or ask for extra verification (such as a one-time code), or send to manual review.
- Learn from confirmed fraud.

*Non-functional:*

- A decision in under about 100 ms, with very high availability (fail safely).
- Very imbalanced data: fraud is far below 1%.
- Explainable decisions for regulators and customers.

**Estimates**

- About 2,000 transactions per second at peak, each needing features such as 'number of transactions on this card in the last 10 minutes'.

**API**

- `POST /score {transaction} → {risk_score, decision, reasons}`

**Data model**

- Streaming aggregates per card, merchant and device (counts and sums over time windows) in a low-latency feature store.
- Labels arrive later, from chargebacks and analyst reviews.

**Start simple, then scale**

1. Version 1: hand-written rules (for example, block payments over £5,000 made abroad).
2. Version 2: a model trained offline and scored in a service.
3. Version 3: streaming features (like transaction counts in the last 10 minutes) in a feature store.
4. Version 4: rules plus model plus a review queue, thresholds tuned by cost, drift monitoring and regular retraining.

**The design, step by step**

1. Transaction → scoring service: fetch real-time features (how many transactions in the last 10 minutes, distance from usual location, device) and historical features → rules engine plus an ML model (often gradient-boosted trees) → decision using thresholds.
2. A streaming pipeline (Kafka plus a stream processor) keeps the windowed counts and sums up to date.
3. Every decision and its features are logged; fraud labels arrive later (chargebacks) and are joined for retraining.
4. A case-management tool for fraud analysts.

**Deep dives**

- Class imbalance: choose the precision–recall trade-off from the cost of fraud versus the cost of blocking good customers.
- Delayed, noisy labels, and fraudsters changing tactics (drift): monitor and retrain often.
- If the model service is down or slow, fall back to rules only.
- Point-in-time correct features, so no future information leaks into training.

**Common mistakes**

- Using accuracy as the metric.
- Features calculated with information from the future.
- No fallback when the model service fails.

**Your interview answer** (say it out loud)

> Each transaction hits a low-latency scoring service that pulls real-time features from a feature store kept fresh by a streaming pipeline, runs rules plus a gradient-boosted model, and returns allow, verify or block within about 100 milliseconds. Thresholds come from the business cost of fraud versus false declines. Decisions are logged, chargeback labels are joined later, and the model is monitored for drift and retrained regularly.

**Follow-up questions**

- **Q: Why not just maximise accuracy?** With 0.1% fraud, a model that always says 'not fraud' is 99.9% accurate and useless. Use precision, recall and cost-weighted metrics.
- **Q: What if the model service is slow?** Time out and fall back to rules, with a safe default for each risk level, so payments never stall.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain the real-time scoring path and the learning loop.
2. **Draw:** Draw transaction → scoring service ↔ feature store, the streaming aggregates, and the label feedback loop.
3. **Apply:** On a public credit-card fraud dataset, train logistic regression and report precision and recall at three different thresholds.
4. **Trade-offs:** Rules only, ML model only, or both: when does each win?

**Free resources (optional)**

- *Read:* [A primer on machine learning for fraud detection (Stripe Radar)](https://www.google.com/search?q=Stripe+Radar+machine+learning+fraud+detection+primer) (Stripe)
- *Read:* [CS329S: Machine Learning Systems Design (lecture notes)](https://stanford-cs329s.github.io/) (Chip Huyen, Stanford · free)
- *Code:* [Credit card fraud detection dataset](https://www.google.com/search?q=Kaggle+credit+card+fraud+detection+dataset) (Kaggle)

[Back to contents](#contents)

### 9.4 Design an LLM serving platform

*Should know · AI/ML*

**Definition.** Serve large language models to many applications with low latency and cost.

**Why interviewers ask this.** It tests modern AI infrastructure: GPU cost, batching, memory limits, streaming, and fairness between teams.

**Requirements**

*Functional:*

- A chat API with streaming responses.
- Several models and versions; quotas per team.
- Usage metering.

*Non-functional:*

- Time to first token under about 1 second, then a steady stream of tokens.
- High GPU utilisation; graceful behaviour under overload.
- Isolation between teams.

**Estimates**

- A 70B-parameter model in bf16 needs about 140 GB just for weights, so each replica spans several GPUs; KV-cache memory then limits how many requests run at once.

**API**

- `POST /v1/chat {model, messages, max_tokens, stream} → a stream of tokens`

**Data model**

- Model registry (versions and hardware needs); a usage record for every request.

**Start simple, then scale**

1. Version 1: one model on one GPU server behind an API, handling one request at a time.
2. Version 2: static batching, then continuous batching with a paged KV cache.
3. Version 3: a gateway with quotas and routing, and autoscaled GPU pools per model.
4. Version 4: quantised tiers, prefix caching, speculative decoding and priority queues.

**The design, step by step**

1. A gateway handles authentication, quotas, rate limits and routing to a pool of servers per model.
2. Model servers (vLLM-style) use continuous batching and a paged KV cache to keep the GPUs busy.
3. GPU pools scale automatically on queue length and latency.
4. Responses stream back through the gateway; prefix caching reuses work for repeated system prompts.
5. Metrics: time to first token, tokens per second, GPU utilisation, errors, and usage per team.

**Deep dives**

- Prefill (reading the prompt) and decode (generating one token at a time) have different bottlenecks.
- Continuous batching adds new requests between decode steps instead of waiting for a whole batch to finish.
- Quantised, smaller or distilled models for cheaper tiers; speculative decoding for speed.
- Overload: a bounded queue, and dropping low-priority traffic first.

**Common mistakes**

- Handling one request at a time on an expensive GPU.
- Ignoring KV-cache memory when planning capacity.
- No per-team quotas, so one team can starve the others.

**Your interview answer** (say it out loud)

> A gateway handles auth, quotas and routing to a GPU pool per model. Each replica runs an inference server with continuous batching and a paged KV cache to keep the GPUs busy, and streams tokens back. Pools scale on queue length and latency, and we track time to first token, tokens per second and cost per team. Quantisation, prefix caching and speculative decoding cut cost and latency.

**Follow-up questions**

- **Q: Why is batching hard for LLMs?** Requests have different lengths and finish at different times. Continuous batching swaps finished sequences out and new ones in at every step, instead of waiting for the whole batch.
- **Q: What limits how many requests one GPU can serve at once?** Mostly KV-cache memory, which grows with sequence length and with the number of requests in flight.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain prefill and decode, and why they behave differently.
2. **Draw:** Draw gateway → router → GPU pools with batching servers, the autoscaler and metrics.
3. **Apply:** Estimate how many 4,000-token requests fit in 20 GB of KV-cache memory, if the model needs about 0.5 MB of cache per token.
4. **Trade-offs:** One big model for everything, or routing between a small and a large model?

**Free resources (optional)**

- *Read:* [Building A Generative AI Platform](https://huyenchip.com/2024/07/25/genai-platform.html) (Chip Huyen's blog · free)
- *Read:* [How continuous batching enables 23x throughput in LLM inference](https://www.google.com/search?q=Anyscale+continuous+batching+23x+throughput+LLM+inference) (Anyscale blog)
- *Paper (optional):* [Efficient Memory Management for LLM Serving with PagedAttention (2023)](https://arxiv.org/abs/2309.06180) (Kwon et al. · arXiv)

[Back to contents](#contents)

### 9.5 Design an ML training and feature pipeline

*Should know · AI/ML*

**Definition.** The platform that turns raw data into trained, deployed and monitored models, again and again.

**Why interviewers ask this.** It tests whether you see a model as a product with a lifecycle — data, features, training, deployment and monitoring — repeated forever.

**Requirements**

*Functional:*

- Collect and label data; compute features.
- Train, evaluate and register models; deploy them.
- Monitor them and retrain.

*Non-functional:*

- Reproducible: every model can be traced back to its data and code.
- The same features in training and serving.
- Safe rollouts.

**API**

- `Feature store: get_online_features(entity_id), get_historical_features(entities, timestamps)`
- `Model registry: register, promote, roll back`

**Data model**

- Raw data lake → cleaned tables → feature tables (offline) and an online store (low latency)
- Model registry entries: version, metrics, data snapshot, code commit

**Start simple, then scale**

1. Version 1: a notebook trains a model, and someone copies the file to a server.
2. Version 2: scripts in a scheduled pipeline, and a model registry.
3. Version 3: data validation, a feature store and evaluation gates.
4. Version 4: canary releases, drift monitoring, automatic retraining and full lineage.

**The design, step by step**

1. An orchestrated pipeline (for example Airflow): ingest → validate the data → build features → train → compare with the current model → register.
2. A feature store: one definition per feature, an offline store for training (with point-in-time correct joins) and an online store for fast serving.
3. Deploy with shadow or canary releases; monitor data drift, prediction drift and business metrics.
4. Retrain on a schedule, or when drift is detected.

**Deep dives**

- Training-serving skew: compute each feature once and use it in both places.
- Point-in-time joins stop future data leaking into training.
- Data validation catches broken upstream data before it trains a bad model.
- Lineage: every model links to its data version, code commit and settings.

**Common mistakes**

- Different feature code in training and in serving.
- No data validation.
- No way to roll back a bad model.

**Your interview answer** (say it out loud)

> An orchestrated pipeline validates data, builds features, trains, compares against the production model and registers the winner with full lineage. A feature store keeps one definition per feature for both training (point-in-time correct) and serving (low latency). New models roll out through shadow or canary releases, are monitored for drift, and are retrained on a schedule or on a trigger.

**Follow-up questions**

- **Q: What is training-serving skew?** Features computed differently in training and in production, so the live model sees different inputs from the ones it learned on.
- **Q: Shadow or canary deployment?** Shadow runs the new model on live traffic without using its answers. Canary lets it make a small share of real decisions, and expands if the metrics hold.

**Practise** (no answers here, on purpose)

1. **Explain:** Explain why a feature store exists.
2. **Draw:** Draw data → validation → features → training → registry → deployment → monitoring → retraining.
3. **Apply:** Write a point-in-time join in SQL or Python that gets each user's features as they were at the time of each label.
4. **Trade-offs:** Retrain on a fixed schedule, or only when drift is detected?

**Free resources (optional)**

- *Read:* [Made With ML](https://madewithml.com/) (Goku Mohandas, free)
- *Read:* [CS329S: Machine Learning Systems Design (lecture notes)](https://stanford-cs329s.github.io/) (Chip Huyen, Stanford · free)
- *Read:* [Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml) (Google for Developers, free)

[Back to contents](#contents)
