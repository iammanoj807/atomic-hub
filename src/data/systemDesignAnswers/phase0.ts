import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 0 · How system design interviews work. One good answer for each practice exercise.

export const sdPhase0Answers: Record<string, SDTopicAnswers> = {
    'sd0-t4': {
        explain: {
            answer: `• Client: the app or browser in the user's hand; it sends the requests.\n• DNS: turns a name like api.example.com into the IP address of a server.\n• CDN: servers spread around the world that keep copies of files (photos, scripts, video) close to users.\n• Load balancer: receives every request and passes it to one healthy app server, so no single server is overloaded.\n• App servers: run your code; they keep nothing between requests (stateless), so you can add more.\n• Cache: fast memory (often Redis) holding copies of data that is read a lot, so the database is asked less often.\n• Database: the permanent, trusted record of the data: the source of truth.\n• Queue and workers: a waiting line of slow jobs, and the background programs that take jobs off it and do them.\n• Object storage: cheap, almost unlimited storage for big files such as photos and videos (Amazon S3).`,
        },
        draw: {
            answer: `Two paths leave the client: files go to the CDN, and API requests go through the load balancer to the app servers. Everything behind the app servers is reached only through them. The CDN pulls from object storage when it doesn't have a file yet.\n\nCheck yours for the three arrows people most often miss: client to DNS first, the queue feeding the workers (not the other way round), and CDN to object storage on a miss.`,
            code: py`
                Client (phone or browser)
                 │ 1. "where is api.example.com?"
                 ├──────────► DNS
                 │ photos, scripts
                 ├──────────► CDN ─── on a miss ───┐
                 │ 2. API request                  │
                 ▼                                 │
                Load balancer                      │
                 ├──► App server ──┐               │
                 └──► App server ──┤               │
                                   ├──► Cache      │
                                   ├──► Database   │
                                   ├──► Queue ──► Workers
                                   └──► Object storage
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Placing an order in a food-delivery app:\n\n1. Client: you tap "Place order". The app sends POST /orders with the basket and the delivery address.\n2. DNS: the app already looked up api.fooddelivery.com earlier and cached the address, so this costs nothing now.\n3. Load balancer: picks a healthy order-service server. If one server has crashed, your order still goes through.\n4. App server: checks who you are, checks the restaurant is open, and works out the price.\n5. Cache: the menu and prices are read from the cache: every user reads them, and they rarely change.\n6. Database: the order is written to the database, inside a transaction with the payment record. This must never be lost or half-saved, so it goes to the source of truth, not the cache.\n7. Queue and workers: the server puts "order 123 placed" on a queue and replies "order received" straight away. Workers then tell the restaurant, send you a push notification and start finding a courier. You don't wait for any of that.\n\nThe CDN and object storage did their job earlier: the restaurant photos you scrolled past came from a CDN server near you.`,
        },
        tradeoffs: {
            answer: `With 100 users, keep only the client, DNS, one app server and one database (with backups). Leave out:\n\n• Load balancer and extra app servers: one small server handles thousands of requests a second; 100 users send a handful. (A managed platform can add a second server later in minutes.)\n• Cache: the database answers 100 users easily, and a cache brings its own bugs: stale data, and invalidation.\n• Queue and workers: do the few slow jobs inline, or with a simple scheduled task.\n• CDN: serve the few static files from the app server or a static host.\n\nMaybe keep object storage if users upload files: it is cheap, simple, and better than putting files in the database.\n\nThe reason: every box costs money, adds something to run and monitor, and adds a new way to fail. Add a box when a number (traffic, latency, data size) says you need it, not before.`,
        },
    },
    'sd0-t1': {
        explain: {
            answer: `1. Requirements, about 5 minutes: the core features (functional) and the scale, speed, availability and consistency needed (non-functional). Write them down.\n2. Estimates, about 3 minutes: users, requests per second, storage, bandwidth. Only what changes a decision.\n3. API, about 3 minutes: the 2 to 4 main endpoints, with inputs and outputs.\n4. Data model, about 3 minutes: the main entities, their keys, and which kind of database fits.\n5. High-level design, about 10 minutes: the simplest design that works end to end, with one request walked through it.\n6. Deep dives, 10 to 15 minutes: fix the bottlenecks the numbers point to (caching, sharding, queues, failures), with the cost of each.\n7. Wrap-up, a few minutes: summarise, name the trade-offs and weak spots, and say what you'd monitor.`,
        },
        draw: {
            answer: `About 44 minutes of design, and a few minutes at the end for your questions. The two big blocks are the high-level design and the deep dives; the four small steps before them should feel quick.`,
            code: py`
                 0 min ┬ 1 Requirements        5 min
                       │
                 5     ┼ 2 Estimates           3
                 8     ┼ 3 API                 3
                11     ┼ 4 Data model          3
                14     ┼ 5 High-level design  10
                       │
                24     ┼ 6 Deep dives         15
                       │
                       │
                39     ┼ 7 Wrap-up             3
                42     ┼ Your questions        3
                45     ┴ end
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `A 15-minute version, about a third of each step:\n\n1. Requirements (2 min): create, edit, complete and delete tasks; group them into lists; due dates and reminders; sync across phone and laptop. Out of scope: shared lists. Non-functional: 10 million users, 1 million a day; fast; a task I just added must show on my other device (read-your-own-writes).\n2. Estimates (1 min): 1 million users × 20 reads and 5 writes a day ≈ 200 reads and 50 writes a second. Storage: 10 million users × 200 tasks × 500 bytes ≈ 1 TB. Small: one database is enough.\n3. API (2 min): GET /lists, POST /lists/{id}/tasks, PATCH /tasks/{id} (edit or tick), DELETE /tasks/{id}, and GET /tasks?since=cursor for sync.\n4. Data model (2 min): users, lists (list_id, user_id) and tasks (task_id, list_id, title, done, due_at, updated_at). Relational fits; index tasks by (user_id, updated_at) for sync and by due_at for reminders.\n5. High-level design (4 min): client → load balancer → stateless API servers → PostgreSQL with a read replica. A reminder worker runs every minute, finds tasks due now, and puts push notifications on a queue.\n6. Deep dive (3 min): offline edits on two devices. Each change carries updated_at (or a version number); the server keeps the newest per field and sends changes since the device's cursor.\n7. Wrap-up (1 min): simple, cheap design. Weak spots: one primary database (add automatic failover), and a burst of reminders at 9:00 (spread them through the queue).\n\nWhen you listen back, check: did you ask before designing, say your assumptions out loud, and keep talking?`,
        },
        tradeoffs: {
            answer: `1. Going deep too early: designing the perfect sharding scheme before the basic flow exists, then running out of time with no working design. The framework puts a simple end-to-end design (step 5) before the deep dives (step 6), and time boxes keep each step short.\n\n2. Designing before understanding: drawing boxes in minute one, then finding out the interviewer wanted something else. Step 1 forces questions first, and writing the requirements on the board lets you check them.\n\n3. Over-engineering: adding Kafka, microservices and sharding for 10 requests a second. Step 2 gives you numbers, and each deep dive must be justified by one.\n\n4. Never naming trade-offs. The wrap-up step makes you say what each choice costs, which is where the strongest marks are.`,
        },
    },
    'sd0-t2': {
        explain: {
            answer: `A day has 86,400 seconds, about 100,000. The requests are spread over the whole day, so 1,000,000 ÷ 86,400 ≈ 11.6, about 12 requests a second. (With the rounded 100,000 you get 10, which is close enough.)\n\n"A million a day" sounds big, but 12 a second is easy for one server. Even with a peak of 2 to 5 times the average (25 to 60 a second), one server copes. The lesson: always turn per-day numbers into per-second numbers before deciding anything.`,
        },
        draw: {
            answer: `Each step down is a big jump: memory to SSD is about 1,000 times slower, and a round trip across a continent is about 200 times slower than one inside a datacentre.\n\nWhat it tells you: keep hot data in memory (a cache); avoid many round trips in a row; and put data near users (CDN, regions), because nothing beats the speed of light across an ocean.`,
            code: py`
                Memory read                ~100 ns
                SSD random read            ~100 µs  (0.1 ms)
                Round trip, same DC        ~0.5 ms
                Round trip, across a
                continent and back         ~100–150 ms

                (L1 cache ~1 ns; spinning-disk seek ~10 ms)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Assumptions: 50 million daily users; each uploads one 2 MB photo and views 50 a day; a day ≈ 100,000 seconds; peak ≈ 2 to 5 times the average.\n\nQPS\n• Uploads: 50 million a day ÷ 100,000 ≈ 500 a second (578 exactly), so 1,000 to 2,500 at peak.\n• Views: 50 million × 50 = 2.5 billion a day ≈ 25,000 a second (about 29,000 exactly), so 50,000 to 125,000 at peak.\n• Reads outnumber writes 50 to 1.\n\nStorage\n• 50 million × 2 MB = 100 TB a day.\n• × 365 ≈ 36.5 PB a year; × 3 copies ≈ 110 PB a year (before thumbnails).\n\nBandwidth\n• In: 500 uploads a second × 2 MB ≈ 1 GB a second (8 Gbps).\n• Out: 25,000 views a second × 2 MB ≈ 50 GB a second (400 Gbps) if every view were full size.\n\nWhat the numbers decide: photos go in object storage, not a database (petabytes); a CDN is essential (400 Gbps can't come from your own servers); serve smaller thumbnails for feeds, which cuts the 50 GB a second hugely; and metadata reads (50:1) want a cache and read replicas.`,
            code: py`
                users = 50e6
                uploads_per_s = users / 1e5            # 500
                views_per_s = users * 50 / 1e5         # 25,000
                tb_per_day = users * 2 / 1e6           # 100 TB (2 MB each)
                pb_per_year = tb_per_day * 365 / 1e3   # 36.5 PB
                pb_with_copies = pb_per_year * 3       # 109.5 PB
                gb_in_per_s = uploads_per_s * 2 / 1e3  # 1 GB/s
                gb_out_per_s = views_per_s * 2 / 1e3   # 50 GB/s
                print(uploads_per_s, views_per_s, pb_per_year, pb_with_copies, gb_in_per_s, gb_out_per_s)
                # 500.0 25000.0 36.5 109.5 1.0 50.0
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `A waste of time when the number can't change any decision:\n• The scale is obviously small (an internal tool, 1,000 users): say "this fits on one server" and move on.\n• Exact arithmetic: 86,400 vs 100,000 never changes a design. Round to powers of ten.\n• Low-level design questions, or when the interviewer tells you to skip it.\n\nA number changes the design when it crosses a limit:\n• Requests per second vs what one machine handles (thousands): one server, or a fleet with a load balancer?\n• Data size vs one database or one machine's memory: one database, or sharding? Does the hot set fit in a cache?\n• Read-to-write ratio: 100 to 1 points to caches and read replicas; write-heavy points to queues, batching and write-friendly stores.\n• Bandwidth: hundreds of Gbps out means a CDN.\n• Storage growth: petabytes a year means object storage, and deciding how long to keep things.\n\nThe rule: estimate only what you will use, and say out loud which decision each number made.`,
        },
    },
    'sd0-t3': {
        explain: {
            answer: `1. Clarify: write 4 to 6 use cases, and agree what is out of scope.\n2. Find the entities: the nouns in the use cases become classes, and the verbs become methods.\n3. Draw the class diagram: fields, key methods, and relationships (has-a or is-a).\n4. Spot what varies (pricing, vehicle types, payment methods) and put each behind an interface: Strategy, State, Factory or Observer.\n5. Code the core flows cleanly, such as park() and leave(); skip trivial getters.\n6. Stress-test: two users at the same moment (concurrency), edge cases, and "now add a new feature". Say what changes.`,
        },
        draw: {
            answer: `The key decision is splitting Book (the title, of which the library may own several) from BookCopy (one physical copy, which is what you actually lend). A Loan joins one Member to one BookCopy, with dates; that is also where a late fee would be worked out (a FeePolicy interface, if fee rules vary).\n\nUse cases it must support: search books, lend a copy, return a copy, see a member's loans, and refuse a loan if the member is at their limit.`,
            code: py`
                Library
                 ├─ books: Book[]          (has many)
                 ├─ members: Member[]      (has many)
                 ├─ lend(member, copy) → Loan
                 └─ return_copy(copy)

                Book     1 ───── *  BookCopy
                 isbn, title,        copy_id,
                 author              is_available

                Member   1 ───── *  Loan  * ───── 1  BookCopy
                 member_id,          borrowed_on,
                 name,               due_on,
                 max_loans = 3       returned_on
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `1. Clarify: two players, X and O, take turns on a 3 × 3 board (maybe n × n later). A move must be on the board and on an empty square. The game ends with a win (a full row, column or diagonal) or a draw (board full). Out of scope: a computer player, a user interface.\n2. Entities: Game, Board, Player (a name and a symbol), Move. Verbs: make a move, check for a winner, check for a draw.\n3. Class diagram: a Game has one Board and two Players; the Board holds the cells; the Game has a status (in progress, won, draw).\n4. What varies: the board size, and later perhaps the win rule or a computer player (a Strategy for choosing moves). Not worth a pattern today.\n5. Code (below): Board checks and stores moves and knows whether a symbol has won; Game handles turns and status.\n6. Stress-test: a move after the game ended is refused; a taken square is refused. Faster win check: only check the lines through the last move (O(n)), or keep a counter per row, column and diagonal (O(1)). Concurrency: two players send a move at once; take a lock per game, and check it is that player's turn.`,
            code: py`
                from enum import Enum


                class Status(Enum):
                    IN_PROGRESS = "in progress"
                    WON = "won"
                    DRAW = "draw"


                class Board:
                    def __init__(self, size=3):
                        self.size = size
                        self.cells = [[None] * size for _ in range(size)]

                    def place(self, row, col, symbol):
                        if not (0 <= row < self.size and 0 <= col < self.size):
                            raise ValueError("off the board")
                        if self.cells[row][col] is not None:
                            raise ValueError("square taken")
                        self.cells[row][col] = symbol

                    def is_full(self):
                        return all(cell is not None for line in self.cells for cell in line)

                    def has_won(self, symbol):
                        n = self.size
                        lines = [list(row) for row in self.cells]
                        lines += [[self.cells[r][c] for r in range(n)] for c in range(n)]
                        lines.append([self.cells[i][i] for i in range(n)])
                        lines.append([self.cells[i][n - 1 - i] for i in range(n)])
                        return any(all(cell == symbol for cell in line) for line in lines)


                class Game:
                    def __init__(self, player_x, player_o, size=3):
                        self.board = Board(size)
                        self.players = [(player_x, "X"), (player_o, "O")]
                        self.turn = 0
                        self.status = Status.IN_PROGRESS
                        self.winner = None

                    def move(self, row, col):
                        if self.status is not Status.IN_PROGRESS:
                            raise ValueError("game is over")
                        name, symbol = self.players[self.turn]
                        self.board.place(row, col, symbol)
                        if self.board.has_won(symbol):
                            self.status, self.winner = Status.WON, name
                        elif self.board.is_full():
                            self.status = Status.DRAW
                        else:
                            self.turn = 1 - self.turn
                        return self.status


                game = Game("Asha", "Ben")
                for row, col in [(0, 0), (1, 1), (0, 1), (2, 2), (0, 2)]:
                    status = game.move(row, col)
                print(status, game.winner)        # Status.WON Asha

                try:
                    game.move(2, 0)
                except ValueError as error:
                    print(error)                  # game is over
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• More code, less clarity: every pattern adds classes and indirection. A tic-tac-toe game with a Factory, an Observer and a Singleton is harder to read than one without.\n• Lost time: you spend the interview wiring patterns and never finish the core flow, which is what is being marked.\n• It looks memorised: the interviewer wants to see you notice a problem and pick a tool for it, not recite a list.\n• Hard follow-up questions: "why is this a Singleton?" If the honest answer is "to mention one", you lose marks.\n• Harder to change: the wrong abstraction makes the next requirement harder, not easier.\n\nThe rule: name the problem first ("pricing rules will change"), then the pattern that solves it (Strategy). If you can't name the problem, leave the pattern out (YAGNI: you aren't gonna need it).`,
        },
    },
};
