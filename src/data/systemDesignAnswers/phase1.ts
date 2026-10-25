import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 1 · Networking and APIs. One good answer for each practice exercise.

export const sdPhase1Answers: Record<string, SDTopicAnswers> = {
    'sd1-t1': {
        explain: {
            answer: `1. DNS: the browser needs an IP address for example.com. It checks its own cache, then the operating system's, then asks a resolver (usually your internet provider's), which asks the root servers, then the .com servers, then example.com's own name server. The answer is cached for its TTL.\n2. TCP: the browser opens a connection to that IP on port 443 with a three-step handshake (SYN, SYN-ACK, ACK).\n3. TLS: the server shows a certificate proving it really is example.com, and both sides agree on encryption keys.\n4. HTTP: the browser sends "GET /" with the header "Host: example.com".\n5. Server side: a load balancer passes the request to one app server, which reads a cache or the database and builds the response.\n6. Back in the browser: it reads the HTML, then fetches the CSS, scripts and images (often from a CDN), and draws the page.`,
        },
        draw: {
            answer: `The DNS lookup happens once and is then cached; the TCP and TLS handshakes happen once per connection; every request after that goes straight down the right-hand path and back.`,
            code: py`
                Browser
                  │ 1. example.com?
                  ▼
                DNS resolver ──► root → .com → example.com's
                  │                 name server
                  │ 2. "93.184.216.34" (cached for the TTL)
                  ▼
                Browser ── 3. TCP + TLS handshake ──┐
                  │ 4. GET / (Host: example.com)    │
                  ▼                                 │
                Load balancer ◄─────────────────────┘
                  │ 5. picks a healthy server
                  ▼
                App server ──► cache (miss) ──► Database
                  │ 6. builds the response
                  ▼
                Load balancer ──► Browser: HTML, then
                                  CSS, JS, images (CDN)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Why: DNS answers are cached. Browsers, operating systems and resolvers all keep the old answer (the old IP) until its TTL runs out, and some resolvers keep it even longer than they should. Until then, those users go to the old server.\n\nWhat to set in advance:\n1. A day or two before the move, lower the record's TTL, for example from 1 day to 60 seconds. Do this at least one old TTL before the switch, so the long-lived copies have expired.\n2. Switch the record to the new IP. Most users move within about a minute.\n3. Keep the old server running for a while, forwarding (proxying) its requests to the new one, so stragglers still work. Watch its traffic fall to zero before you switch it off.\n4. Raise the TTL again afterwards.\n\nBetter still, put a load balancer or a fixed (floating) IP in front, so the address users see never changes and you only swap the servers behind it.`,
        },
        tradeoffs: {
            answer: `TCP gives you a connection, delivery of every packet, in order, and slows down when the network is busy. What it gives up: speed. There is a handshake before any data, and a lost packet holds up everything behind it until it is resent. Use it when every byte must arrive: web pages, APIs, payments, file downloads. Example: a banking API.\n\nUDP just sends packets: no connection, no guarantee they arrive, no ordering. What it gives up: reliability (the program must cope with loss itself). What it gains: low, steady latency. Use it when late data is useless anyway: live video calls, online games, DNS lookups. Example: a video call, where it is better to skip a lost frame than freeze while waiting for it.\n\n(QUIC, used by HTTP/3, builds TCP-like reliability on top of UDP, to get fast setup without head-of-line blocking.)`,
        },
    },
    'sd1-t2': {
        explain: {
            answer: `An operation is idempotent if doing it twice has the same effect as doing it once. "Set my email to a@b.com" (PUT) is idempotent: the second time changes nothing. "Delete order 7" (DELETE) is too: after the first time it is already gone. GET reads, so it changes nothing at all.\n\nPOST usually means "create a new one". Send "create an order for £50" twice and you get two orders. That matters because networks fail: if the reply is lost, the client can't tell whether the order was made, and the safe-looking retry creates a duplicate.\n\nThe fix is an idempotency key: the client makes one unique key per real action and sends it with every retry. The server saves the key with the first result, and returns that same result when the key comes again, instead of creating a second order.`,
        },
        draw: {
            answer: `Resources are nouns (books, loans); borrowing creates a loan, and returning updates it, so history is kept. Status codes say exactly what went wrong, so the app can show the right message.`,
            code: py`
                GET   /v1/books?limit=20&cursor=…
                      200 OK   { books: [...], next_cursor }

                GET   /v1/books/{book_id}
                      200 OK | 404 Not Found

                POST  /v1/loans
                      body: { book_id, member_id }
                      header: Idempotency-Key
                      201 Created  { loan_id, due_on }
                      404 Not Found   (no such book)
                      403 Forbidden   (member at loan limit)
                      409 Conflict    (no copy available)

                PATCH /v1/loans/{loan_id}
                      body: { status: "returned" }
                      200 OK  (also when already returned)
                      404 Not Found
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The endpoint:\nPOST /v1/transfers\nHeaders: Authorization: Bearer <token>, Idempotency-Key: <a UUID made once per transfer by the client>\nBody: from_account, to_account, amount_minor (integer pence, never a float), currency, reference.\n\nResponses: 201 Created with transfer_id and status; 400 for bad input; 401 or 403 if the caller can't use from_account; 404 for an unknown account; 422 for not enough money; 409 if the same key comes with a different body; 429 when rate-limited. GET /v1/transfers/{id} lets the client check what happened.\n\nOn the server, in one database transaction: insert the idempotency key (a UNIQUE column), insert the transfer, then write the two ledger entries (debit and credit). Store the response with the key. Either all of it happens, or none of it.\n\nA retried request (say the reply timed out) carries the same key:\n• If the key is found and finished, return the stored response: the money moves once.\n• If the first attempt is still running, return 409 "in progress" (or wait for it).\n• Keys expire after, say, 24 hours.\n\nThe client's rule: on a timeout or a 5xx, retry with the same key and back off; never make a new key for the same transfer.`,
        },
        tradeoffs: {
            answer: `Choose gRPC for calls between your own services: it is fast (binary messages over HTTP/2), strongly typed (the .proto file is the contract, and client code is generated from it), and supports streaming in both directions. The cost: browsers can't call it directly without a proxy, and it is harder to inspect by hand than JSON.\n\nChoose GraphQL when many different clients (web, iOS, Android) need different slices of the same data, and REST would mean several round trips per screen or a lot of unused fields. The client asks for exactly the fields it needs, in one request. The costs: HTTP caching is harder (one endpoint, POST bodies), rate limiting must look at how expensive a query is, and careless resolvers cause N+1 database queries.\n\nStay with REST for public APIs, simple CRUD, and anything that benefits from plain HTTP caching and tooling. A common mix: REST or GraphQL at the edge for apps, gRPC inside between services.`,
        },
    },
    'sd1-t3': {
        explain: {
            answer: `• Short polling: the child asks "are we there yet?" every minute. Simple, but almost every answer is "no", and you can be up to a minute late hearing "yes".\n• Long polling: the child asks once, and the driver stays quiet until they arrive (or for at most 30 seconds), then answers. The child asks again straight away. Fewer wasted questions, and the answer comes the moment it is true.\n• WebSocket: an open phone line. Once the call is connected, either person can speak at any time, in both directions.\n• SSE (server-sent events): the driver's announcements over the car speaker. The driver talks whenever there is news; the child only listens. One-way, and it reconnects by itself if it drops.`,
        },
        draw: {
            answer: `Gateways hold the open connections but don't know where other users are; the registry does. The message is also saved before it is forwarded, so B can fetch it later if B was offline or the forward failed.`,
            code: py`
                User A ═══ WebSocket ═══ Gateway 1
                                            │ 1. "message for B"
                                            ▼
                                       Chat service
                                         │   │ 2. save the message
                                         │   └──────────► Database
                                         │ 3. where is B?
                                         ├──────────────► Redis
                                         │ ◄── "Gateway 2" ┘
                                         │ 4. forward
                                         ▼
                User B ═══ WebSocket ═══ Gateway 2
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `• Stock price ticker: SSE. Updates only flow from server to client, many times a second, and SSE is a simple stream over normal HTTP that reconnects by itself. (If the same screen also places trades, a WebSocket can carry both.)\n• Chat app: WebSockets. Messages go both ways, typing indicators and read receipts need low latency, and one open connection is much cheaper than polling.\n• Nightly report: none of them. It is ready once a day, so a normal request is enough: email a link or send a notification when it is done, or let the page poll the job status every 30 seconds while someone waits.\n• Delivery-tracking map: SSE (or a WebSocket). The courier's position arrives every few seconds and only flows to the customer. Polling every 5 to 10 seconds also works at small scale, and is simpler to build.\n\nThe rule: two-way and fast means WebSockets; one-way and frequent means SSE; rare updates mean ordinary requests or polling.`,
        },
        tradeoffs: {
            answer: `The costs of 10 million open connections:\n• Memory: each connection holds buffers and some session state, say about 20 KB, so roughly 200 GB of memory in total.\n• Servers: a well-tuned server holds about 100,000 to 1,000,000 connections. At 100,000 each, that is 100 gateway servers, plus spare capacity for failures.\n• Heartbeats: a ping every 30 seconds per connection is about 330,000 small messages a second, just to keep connections alive.\n• File handles, TLS work, and load balancers that must support long-lived connections.\n\nSpreading them:\n• Put a layer-4 load balancer (or DNS) in front of a fleet of stateless gateway servers, sending new connections to the least-loaded one.\n• Keep a registry (Redis) of user → gateway, updated on connect and disconnect, so any service can route a message to the right gateway.\n• Plan for failure: when a gateway dies, its 100,000 users reconnect at once. Clients must back off with random jitter, so they don't stampede the other servers.\n• On deploys, drain servers slowly (stop new connections, then close old ones gradually), rather than dropping everyone at once.`,
            code: py`
                connections = 10_000_000
                memory_gb = connections * 20e3 / 1e9          # about 20 KB each
                servers = connections / 100_000               # 100k per server
                pings_per_s = connections / 30                # one ping every 30 s
                print(memory_gb, servers, round(pings_per_s))
                # 200.0 100.0 333333
            `,
            codeLanguage: 'python',
        },
    },
    'sd1-t4': {
        explain: {
            answer: `A CDN is like a supermarket chain. Instead of everyone driving to the central warehouse (your origin server), each town has a branch (an edge server) that stocks the popular products (files). You shop at your local branch: much quicker. When the branch runs out of something, it orders it once from the warehouse (a cache miss) and then has it for everyone in town.\n\nWhere the picture breaks: a supermarket can check the warehouse for the newest version. A CDN keeps selling its copy until it expires (its TTL), even if you have changed the file at the warehouse. So after an update, users may get the old file unless the new one has a new name (app.3f9a.js) or you purge the cache. Also, a supermarket only stocks things everyone buys: anything personal to one user (their account page) should not be stored at the edge.`,
        },
        draw: {
            answer: `On a hit the user never touches your servers. On a miss the edge fetches the file once from the origin, keeps a copy until its TTL runs out, and every later nearby user gets a hit.`,
            code: py`
                Cache hit
                  User (Sydney) ──► Edge (Sydney)
                                     has the file
                  User ◄──────────── reply, ~10 ms

                Cache miss
                  User (Sydney) ──► Edge (Sydney)
                                     not there yet
                                       │ fetch once
                                       ▼
                                    Origin (London)
                                       │ file
                                       ▼
                                    Edge stores a copy
                                    (until the TTL ends)
                  User ◄──────────── reply, ~300 ms

                  Next user in Sydney: a hit.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Through the CDN (public, large, read by many people, the same for everyone):\n• Video segments: each video is cut into chunks of a few seconds, at several qualities (240p to 4K). This is almost all of the bandwidth.\n• Thumbnails, channel pictures and banners.\n• The website's static files: JavaScript, CSS, fonts, icons.\n\nNot through the CDN (personal, changing, or writes), straight to your API servers:\n• Uploads: they go to object storage, often through a signed upload URL, then to the transcoding pipeline.\n• The home feed and recommendations, which are different for every user.\n• Watch history, likes, comments, subscriptions: writes, and data about one user.\n• Search, sign-in and payments.\n• View counts and analytics events.\n\nA middle case: rarely watched "long-tail" videos may be served from the origin or a regional cache, because caching them at every edge wastes space.`,
        },
        tradeoffs: {
            answer: `Why: app.js has the same name as before, and copies are cached with a long TTL in two places: the CDN's edge servers and users' browsers. Neither knows the file has changed, so both keep serving the old one until their copy expires.\n\nRight now: purge app.js from the CDN. That fixes the edge, but browsers that already have it may still use their copy until it expires.\n\nNext time: put a fingerprint of the contents in the file name (app.3f9a.js, made by the build tool). A changed file gets a new name, so no cache has ever seen it, and you can give these files a very long TTL ("immutable"). The HTML page that names the file is cached briefly (or revalidated every time), so it picks up the new name within seconds.`,
        },
    },
    'sd1-t5': {
        explain: {
            answer: `A forward proxy works for clients: it sits in front of users and sends their requests out to the internet for them, for example a company proxy that filters and logs staff web browsing.\n\nA reverse proxy works for servers: it sits in front of your servers and receives requests from the internet for them, handling TLS, caching and load balancing, and hiding the servers behind it.`,
        },
        draw: {
            answer: `The checks run in order and stop early: a request without a valid token never costs a rate-limit lookup or reaches a service. Routing is by path, and every request is logged with how long it took.`,
            code: py`
                Client
                  │ HTTPS
                  ▼
                API gateway, in order:
                  1 TLS ends here
                  2 token valid?          no → 401
                  3 allowed this call?    no → 403
                  4 under the rate limit? no → 429
                  5 log it, route by path
                  │
                  ├─ /users/…    ──► User service
                  ├─ /orders/…   ──► Order service
                  └─ /payments/… ──► Payment service
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `For a mobile banking app, the gateway would:\n• End TLS, with modern settings only (the app also pins the certificate).\n• Check the access token on every request (signature, expiry, audience), and that its scopes allow the call: a "read balance" token can't make payments.\n• Rate-limit per user, per device and per IP, strictly on login and one-time-code endpoints, to slow down password guessing.\n• Route by path: /accounts to the accounts service, /payments to payments, /cards to cards.\n• Reject bad requests early: too large, wrong content type, missing required headers (such as an Idempotency-Key on POST /payments).\n• Add a request ID and tracing headers, and write an audit log, with card numbers and personal data masked.\n• Handle API versions, and tell very old app versions to upgrade.\n• Apply timeouts to each backend, and stop calling a failing one for a while (a circuit breaker).\n• Block known bad traffic (a web application firewall, bot detection).\n\nWhat it would not do: work out balances, check payment limits or run fraud rules. That is business logic, and it belongs in the services.`,
        },
        tradeoffs: {
            answer: `• It becomes a hidden monolith: every team needs changes in the one shared gateway, so releases queue up behind it and teams are tied together again, which is what microservices were meant to stop.\n• Rules end up split: half a rule in the gateway, half in the service, and nobody can see the whole thing or test it in one place.\n• It is hard to test and debug: gateway logic often lives in configuration or plugin scripts, without the tests, reviews and tooling of normal code.\n• A bigger blast radius: a bug in the gateway breaks every service at once, not just one.\n• Everything gets slower: heavier work in the gateway adds latency to every single request, and makes the gateway harder to scale.\n\nKeep the gateway to jobs that are the same for every service (TLS, authentication, rate limits, routing, logging), and keep decisions about the business in the services.`,
        },
    },
};
