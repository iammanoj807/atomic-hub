import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 4 · Distributed systems and security. One good answer for each practice exercise.

export const sdPhase4Answers: Record<string, SDTopicAnswers> = {
    'sd4-t1': {
        explain: {
            answer: `A monolith is a Swiss army knife: one tool with every blade built in. It is simple to carry around (one thing to build, test and deploy), and the blades share one handle (one codebase, one database). But to sharpen one blade, the whole knife goes back to the shop: every change ships everything, and as more people work on it they get in each other's way.\n\nMicroservices are a toolbox of separate tools. Each tool does one job well and can be replaced or upgraded on its own (each service is deployed and scaled independently, by its own team, with its own database). But now you need the box, labels and some organisation: a gateway, service discovery, monitoring and tracing, and a pipeline per service.\n\nWhere the picture breaks: tools in a box don't depend on each other. Services call each other over a network, so a slow or broken one can drag the others down. Fifty carelessly built services can be far less reliable than one knife.`,
        },
        draw: {
            answer: `Each service owns its database, and no service reads another's. Synchronous calls are used only when an answer is needed right now (the order service asks the catalogue for the current price and stock). Everything that can happen afterwards travels as events, so a slow notification service can never hold up checkout.`,
            code: py`
                ──►  synchronous call (REST or gRPC)
                ═══  event stream (asynchronous)
                [ ]  the service's own database

                Client ──► API gateway
                             ├──► User service ── [Users]
                             ├──► Catalogue ───── [Catalogue]
                             └──► Order service ─ [Orders]
                                    │ ──► Catalogue: price? in stock?
                                    │
                                    │ OrderPlaced
                                    ▼
                         ═══════ event stream ═══════
                            │                   │
                            ▼                   ▼
                     Payment service     Notification service
                       [Payments]          (email, push)
                            │
                            │ PaymentSucceeded / PaymentFailed
                            ▼
                         event stream ══► Order service
                                          (updates the status)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Signs it should be split:\n1. Many teams are getting in each other's way: merge conflicts, a release train where one team's bug blocks everyone else's release.\n2. Parts have very different needs: image processing needs big CPU machines and scales with uploads, while checkout needs high reliability. In one deployment you scale and risk everything together.\n3. One area has a clear, stable boundary (payments, search, notifications) and changes on its own schedule, so it can be carved out with a clean API.\n\nSigns it shouldn't be yet:\n1. A small team (one or two teams). The coordination costs of microservices will outweigh the benefits.\n2. The boundaries are still moving: the product is young, and you would split along the wrong lines and then have to change many services at once.\n3. The basics are missing: no automated deployment pipeline, no monitoring or tracing, no one to run the extra infrastructure. And the real bottleneck is often the database, which splitting the code doesn't fix.\n\nA good first step either way is a modular monolith: clear modules with clean interfaces inside one deployment, which can be split later along the lines that proved stable.`,
        },
        tradeoffs: {
            answer: `• Partial failure: a function call either works or throws. A network call can also time out, and then you don't know whether the work happened or not.\n• Latency: a function call takes nanoseconds; a network call takes milliseconds, and sometimes seconds. A chain of six calls adds up, and the slowest one sets the pace.\n• Duplicates: because of timeouts, callers retry, so the same request can arrive twice. Every operation that changes something must be idempotent.\n• Cascading failure: one slow service ties up the threads of everything that calls it, and the slowness spreads. You need timeouts, circuit breakers and bulkheads.\n• Inconsistency: each service has its own database, so there is no transaction across them. Data is eventually consistent, and multi-step work needs sagas.\n• Version mismatch: the caller and the callee are deployed separately, so they must cope with each other's old and new versions of the API.\n• Harder debugging: one user request crosses many services and many logs; without distributed tracing you can't follow it.\n• Service discovery, network partitions and serialisation errors: things a function call never had to think about.`,
        },
    },
    'sd4-t2': {
        explain: {
            answer: `Booking a holiday means three bookings with three different companies: the flight, the hotel and the car. There is no single "book all three or none" button across companies. So you book them one after another, and each booking is complete on its own (a local transaction).\n\nIf the car booking fails, you don't pretend the trip never happened. You undo what you already did, in reverse: cancel the hotel, then cancel the flight. Those cancellations are the compensating actions.\n\nThat is a saga: a business process spread over several services, done as a series of local transactions, each with a matching "undo". Where the picture breaks: while you are booking, nobody else sees your half-booked trip, but in a saga other users can see the in-between state (the stock is reserved, then released). And a cancellation might be sent twice, so every compensation must be safe to repeat.`,
        },
        draw: {
            answer: `The orchestrator holds the state of each checkout and decides the next step. Compensations run in reverse order and only for steps that already succeeded. Each step and each compensation must be idempotent, because the orchestrator retries them after timeouts.`,
            code: py`
                Normal path
                  Orchestrator ─1─► Stock:    reserve items   ✓
                               ─2─► Payment:  charge the card ✓
                               ─3─► Shipping: book delivery   ✓
                               ─4─► order = CONFIRMED

                Compensation path (the card is declined)
                  Orchestrator ─1─► Stock:    reserve items   ✓
                               ─2─► Payment:  charge the card ✗
                               ─C1► Stock:    release items   ✓
                               ───► order = FAILED, tell the user

                If shipping fails at step 3:
                  C2 refund the card, then C1 release the items
                  (undo in reverse order)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The key move is to write the event in the same database transaction as the change it describes: either both are saved or neither is. A separate relay then publishes it.\n\nThe relay's steps:\n1. Read a batch of unpublished rows in id order (FOR UPDATE SKIP LOCKED lets several relays share the work without taking the same rows).\n2. Publish each to the broker (for example Kafka), using aggregate_id as the message key so events for one order stay in order. Wait for the broker to confirm.\n3. Mark those rows as published.\n4. If it crashes between steps 2 and 3, the rows are published again on the next run. Delivery is at least once, so consumers skip events whose id they have already handled.\n5. Delete (or archive) published rows after a few days.\n\nInstead of polling, a change-data-capture tool (such as Debezium) can read new outbox rows straight from the database's log.`,
            code: py`
                -- PostgreSQL
                CREATE TABLE outbox (
                  id            BIGSERIAL PRIMARY KEY,      -- increasing: publish in this order
                  event_id      UUID NOT NULL UNIQUE,       -- consumers use it to skip duplicates
                  aggregate_id  TEXT NOT NULL,              -- e.g. the order id; the message key
                  event_type    TEXT NOT NULL,              -- e.g. 'OrderCreated'
                  payload       JSONB NOT NULL,
                  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                  published_at  TIMESTAMPTZ                 -- NULL until the relay has sent it
                );
                CREATE INDEX outbox_unpublished ON outbox (id) WHERE published_at IS NULL;

                -- In the business transaction:
                BEGIN;
                INSERT INTO orders (order_id, customer_id, total) VALUES ('o-77', 'c-42', 5000);
                INSERT INTO outbox (event_id, aggregate_id, event_type, payload)
                VALUES (gen_random_uuid(), 'o-77', 'OrderCreated', '{"order_id": "o-77", "total": 5000}');
                COMMIT;

                -- The relay, in a loop:
                BEGIN;
                SELECT id, aggregate_id, event_type, payload
                FROM outbox
                WHERE published_at IS NULL
                ORDER BY id
                LIMIT 100
                FOR UPDATE SKIP LOCKED;
                -- ...publish each row to the broker and wait for its confirmation...
                UPDATE outbox SET published_at = now() WHERE id = ANY (:published_ids);
                COMMIT;
            `,
            codeLanguage: 'sql',
        },
        tradeoffs: {
            answer: `Orchestration.\n\nA loan application is long (identity check, credit check, affordability, underwriting decision, signed offer, payout), runs for days, includes people (an underwriter reviewing a case), and has branches ("refer to a person if the score is borderline") and timeouts ("cancel if not signed in 14 days"). An orchestrator, usually a workflow engine such as Temporal or AWS Step Functions, keeps all of that in one readable state machine:\n• You can see where every application is, which customers and regulators will ask about, and get an audit trail.\n• Compensations run in a clear order.\n• Changing the order of steps happens in one place.\n\nWith choreography, six services each react to each other's events. Nobody holds the whole picture, the flow exists only in your head, and adding a step means changing several services. That suits short flows with two or three steps.\n\nThe cost of orchestration: one more component to run, and a risk that business rules creep into the orchestrator. Keep the decisions in the services; the orchestrator only decides what happens next.`,
        },
    },
    'sd4-t3': {
        explain: {
            answer: `Think of a committee that only decides by majority vote. A decision counts only if more than half of all members vote for it, and each member votes once per election.\n\nWhy that prevents two leaders: to become leader you need votes from more than half the members. Two different candidates would each need more than half, and two "more than halves" must share at least one member. That member can only vote once in an election (a term), so both can't win the same election.\n\nIt also explains what happens when the network splits a 5-node cluster into 3 and 2: the side with 3 is a majority and carries on; the side with 2 can't elect a leader or commit anything, so it waits. They can never both decide different things. Raft adds terms (numbered elections), so an old leader that wakes up after a pause sees a higher term number and steps down instead of acting on stale authority.`,
        },
        draw: {
            answer: `The entry is committed the moment a majority (3 of 5, counting the leader itself) has stored it, not when all five have. That is why the cluster keeps working with two nodes slow or down. Followers that were behind catch up from the leader's log later.`,
            code: py`
                Client ── write x = 5 ──► Leader N1
                                           │ appends it to its log  (1 of 5)
                        ┌─────────┬────────┼─────────┬─────────┐
                        ▼         ▼                  ▼         ▼
                       N2        N3                 N4        N5
                     stored ✓  stored ✓          (slow…)   (down ✗)
                        │         │
                        └─────────┴──► "stored" ──► Leader

                Leader + N2 + N3 = 3 of 5 = a majority
                  ★ COMMITTED here: apply x = 5, reply "done"

                N4 stores it a moment later; N5 catches up
                from the leader's log when it comes back.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `A typical run of the visualisation:\n\n1. All nodes start as followers, each with a random election timeout.\n2. One node's timeout runs out first. It becomes a candidate, starts term 1, votes for itself and asks the others for their votes.\n3. The others haven't voted in term 1 yet, so they vote for it. With a majority, it becomes the leader.\n4. The leader sends heartbeats regularly; each heartbeat resets the followers' timeouts, so no new election starts.\n5. A client write arrives at the leader. It appends it to its log (uncommitted) and sends it with the next heartbeat. Once a majority confirm, the leader commits it, applies it and replies to the client; the next heartbeat tells the followers to commit too.\n6. The leader is stopped. Heartbeats stop, a follower times out, becomes a candidate for term 2, wins a majority and becomes the new leader.\n7. When the old leader comes back, it sees the higher term, steps down to follower, and any entries it had that were never committed are replaced by the new leader's log.\n\nAlso worth watching: a split vote. Two candidates time out together and split the votes, so nobody wins; they wait new random timeouts and try again, and one wins the next term.`,
        },
        tradeoffs: {
            answer: `Why writes get slower:\n• Every write waits for a round trip to a majority of nodes, and each of them saves it to disk before replying. Across availability zones that adds milliseconds to every write.\n• All writes go through one leader, which caps the write rate the group can handle.\n• During an election (a few hundred milliseconds or more), no writes are accepted at all, and the minority side of a partition can't write until it heals.\n\nWhen it is worth it: for small, critical data where two machines disagreeing would be a disaster:\n• who the leader is, and locks ("only one worker processes this job");\n• cluster configuration and metadata (Kubernetes keeps all its state in etcd);\n• the agreed order of transactions in a strongly consistent database (Spanner, CockroachDB).\n\nWhen it isn't: high-volume data where a little staleness is fine (likes, view counts, logs, metrics). There, faster eventual consistency is the better trade.`,
        },
    },
    'sd4-t4': {
        explain: {
            answer: `At a hotel, reception checks your passport when you arrive. That is authentication: proving who you are. It happens once, at check-in (login).\n\nReception then gives you a key card. The card opens your room and the gym, but not other guests' rooms or the staff office. That is authorisation: what you are allowed to do. It is checked at every door you try (on every request), not just once.\n\nWhere the picture breaks: reception can switch a key card off instantly. A JWT access token keeps working until it expires, because services only check its signature, not a central list. That is why access tokens are kept short-lived and paired with a refresh token that can be revoked.`,
        },
        draw: {
            answer: `The access token is short-lived and sent with every request; the refresh token is long-lived, stored securely on the phone, and only ever sent to the login server. Rotating the refresh token on every use means a stolen one is detected the moment both copies are used.`,
            code: py`
                1. Log in
                   App ── password + one-time code ──► Auth server
                   App ◄── access token (15 min)
                           + refresh token (30 days, kept in
                             the phone's secure storage)

                2. Every request
                   App ── request + access token ──► Gateway
                          signature ok? not expired? ──► Service
                          Service: may user 42 do this?

                3. Access token expired
                   App ── request ──► Gateway ── 401 expired
                   App ── refresh token ──► Auth server
                          valid? not revoked?
                   App ◄── new access token + new refresh token
                           (the old refresh token stops working)
                   App ── retry the request ──► ✓

                4. Log out, or fraud detected
                   Auth server revokes the refresh token:
                   no new access tokens; the last one dies
                   within 15 minutes
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `scrypt is slow and needs a lot of memory on purpose, so each guess costs an attacker real time and money. hmac.compare_digest compares in constant time, so the time taken doesn't leak how many characters matched.\n\nWhy the salt matters: it is a random value, different for every password, stored next to the hash. Two users with the same password get different hashes, so:\n• an attacker can't use precomputed tables of hashes for common passwords (rainbow tables);\n• they can't see which users share a password;\n• they must attack each hash separately, which multiplies their work by the number of users.\nThe salt isn't secret; its job is to be unique.`,
            code: py`
                import hashlib
                import hmac
                import os

                N, R, P = 2**14, 8, 1            # cost: how much memory and CPU each guess takes


                def hash_password(password):
                    salt = os.urandom(16)                                   # a new random salt every time
                    key = hashlib.scrypt(password.encode(), salt=salt, n=N, r=R, p=P, dklen=32)
                    return salt.hex() + "$" + key.hex()                     # store the salt with the hash


                def check_password(password, stored):
                    salt_hex, key_hex = stored.split("$")
                    key = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=N, r=R, p=P, dklen=32)
                    return hmac.compare_digest(key.hex(), key_hex)          # constant-time comparison


                first = hash_password("correct horse")
                second = hash_password("correct horse")
                print(check_password("correct horse", first), check_password("wrong", first))   # True False
                print(first == second)           # False: same password, different salts, different hashes
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Sessions.\n\nWith server-side sessions, the browser holds only a random session ID (in a Secure, HttpOnly cookie), and the session itself lives in a store such as Redis. When fraud is detected, delete the session: the very next request fails, and the user is logged out instantly, on every server.\n\nA JWT is checked by its signature alone, so it stays valid until it expires. To kill one instantly, every request would have to check a deny-list, which is a central lookup on every request: you have rebuilt sessions, with extra complexity.\n\nIf JWTs are needed anyway (for example, for many services that check tokens themselves), the compromise is very short-lived access tokens (a few minutes), revocable refresh tokens, and a small deny-list checked at the gateway for emergencies. But for a web app with this requirement, sessions are the simpler and safer choice.`,
        },
    },
};
