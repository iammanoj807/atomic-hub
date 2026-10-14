import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, frame, line, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { flow, label, type FEdge, type FNode } from './flow';

// System Design Phase 0 (how the interviews work) and Phase 1 (the web's
// basics). Each animation follows its lesson's own running example.

// ============ sd0-t4 · Meet the building blocks ============

const buildingBlocks = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 112, w: 64, h: 32, label: 'Client', kind: 'client', color: C.cyan },
        { id: 'dns', x: 6, y: 26, w: 64, label: 'DNS', color: C.violet },
        { id: 'cdn', x: 96, y: 26, w: 70, label: 'CDN', color: C.teal },
        { id: 'lb', x: 96, y: 108, w: 76, h: 40, label: 'Load\nbalancer', color: C.blue },
        { id: 'app1', x: 200, y: 84, w: 70, h: 36, label: 'App\nserver', color: C.blue },
        { id: 'app2', x: 200, y: 140, w: 70, h: 36, label: 'App\nserver', color: C.blue },
        { id: 'cache', x: 306, y: 26, w: 88, label: 'Cache', kind: 'store', color: C.pink },
        { id: 'db', x: 306, y: 90, w: 88, label: 'Database', kind: 'store', color: C.green },
        { id: 'queue', x: 306, y: 154, w: 88, label: 'Queue', kind: 'queue', color: C.amber },
        { id: 'worker', x: 306, y: 214, w: 88, label: 'Worker', color: C.amber },
        { id: 'obj', x: 196, y: 22, w: 92, h: 38, label: 'Object\nstorage', kind: 'store', color: C.teal },
    ];
    const edges: FEdge[] = [
        { from: 'client', to: 'dns' }, { from: 'client', to: 'cdn' }, { from: 'client', to: 'lb' },
        { from: 'lb', to: 'app1' }, { from: 'lb', to: 'app2' },
        { from: 'app1', to: 'cache' }, { from: 'app1', to: 'db' }, { from: 'app1', to: 'queue' }, { from: 'app1', to: 'obj' },
        { from: 'queue', to: 'worker' }, { from: 'cdn', to: 'obj', dashed: true },
    ];
    const frames = flow(nodes, edges, [
        { caption: 'Most web systems are built from the same dozen parts. Follow one photo upload through them — each box is a later topic, close up.' },
        { caption: 'DNS: the app asks for the address of api.example.com and gets back an IP address — like looking up a phone number.', lit: ['dns'], hot: ['client>dns'], packets: [{ id: 'q', label: 'IP?', at: ['client', 'dns', 0.6] }] },
        { caption: 'The request reaches the load balancer, which picks one of many identical app servers that is healthy and not too busy.', lit: ['lb', 'app1'], hot: ['client>lb', 'lb>app1'], packets: [{ id: 'q', label: 'upload photo', at: ['lb', 'app1', 0.5] }] },
        { caption: 'The app server runs your code: it checks who the user is, gets an upload link from object storage, and saves the caption and photo details in the database — the source of truth.', lit: ['app1'], ok: ['db', 'obj'], hot: ['app1>db', 'app1>obj'], packets: [{ id: 'q', label: 'save', at: ['app1', 'db', 0.6] }] },
        { caption: 'Slow work goes on a queue: "make thumbnails for photo 42". The app server replies straight away; a background worker does the job later.', lit: ['queue', 'worker'], hot: ['app1>queue', 'queue>worker'], packets: [{ id: 'q', label: 'thumbs 42', at: ['queue', 'worker', 0.5] }] },
        { caption: 'When friends open the post, the app server checks the cache (fast memory) first, and only reads the database on a miss.', lit: ['cache'], hot: ['app1>cache'], packets: [{ id: 'q', label: 'post 42?', at: ['app1', 'cache', 0.6] }], badges: { cache: 'hit' } },
        { caption: 'The photo itself comes from a CDN server near each friend — not from your servers. On a miss, the CDN fetches it once from object storage.', lit: ['cdn'], hot: ['client>cdn', 'cdn>obj'], packets: [{ id: 'q', label: 'photo', at: ['client', 'cdn', 0.4] }] },
        { caption: 'Netflix, Instagram and a small startup all share this shape. What changes is the size of each box, and which boxes matter most.', ok: ['client', 'dns', 'cdn', 'lb', 'app1', 'app2', 'cache', 'db', 'queue', 'worker', 'obj'] },
    ], { height: 260 });
    return { title: 'The building blocks of a web system, and one request through them', height: 260, variants: [{ label: 'A photo upload', frames }] };
};

// ============ sd0-t1 · The high-level design interview ============

const hldFramework = (): AnimationSpec => {
    const steps = ['Requirements', 'Estimates', 'API', 'Data model', 'Design', 'Deep dive', 'Wrap-up'];
    // 100 million new links a month, and 100 reads for every write.
    const writesPerSec = 100e6 / (30 * 86400);
    const readsPerSec = writesPerSec * 100;
    const ladder = (on: number) => steps.map((s, i) => rect(`s${i}`, 8, 30 + i * 29, 100, 24, {
        rx: 6, fill: tint(i === on ? C.amber : i < on ? C.green : C.grey, i === on ? 0.5 : i < on ? 0.22 : 0.08), stroke: i === on ? C.amber : C.faint, sw: 1.5,
        text: `${i + 1} ${s}`, size: 10, weight: 700, mono: true,
    }));
    const board = (lines: [string, string][]) => [
        rect('board', 120, 30, 272, 200, { rx: 10, fill: tint(C.blue, 0.05), stroke: C.faint, sw: 1.5 }),
        text('board-t', 130, 44, '"Design a URL shortener"', { size: 11, fill: C.grey, weight: 700, anchor: 'start' }),
        ...lines.map(([value, color], i) => text(`b${i}`, 132, 68 + i * 20, value, { size: 11, fill: color, weight: 700, mono: true, anchor: 'start' })),
    ];
    const mini = (on: string | null): Part => {
        const box = (id: string, x: number, label_: string) => rect(id, x, 168, 56, 26, { rx: 6, fill: tint(on === id ? C.amber : C.blue, on === id ? 0.5 : 0.2), stroke: on === id ? C.amber : C.blue, sw: 1.5, text: label_, size: 9, weight: 700, mono: true });
        return [
            box('m-c', 132, 'client'), arrow('m-a1', 190, 181, 196, 181, { stroke: C.grey, sw: 1.5 }),
            box('m-lb', 198, 'LB'), arrow('m-a2', 256, 181, 262, 181, { stroke: C.grey, sw: 1.5 }),
            box('m-s', 264, 'service'), arrow('m-a3', 322, 181, 328, 181, { stroke: C.grey, sw: 1.5 }),
            box('m-db', 330, 'DB'),
        ];
    };
    const frames: Frame[] = [
        frame('Interviewers grade how you think. A fixed order of steps stops you jumping straight to boxes and arrows. Here is the order, run on "Design a URL shortener".', [ladder(-1), board([])]),
        frame('1 Requirements: ask what it must do and how well. Write the answers in a corner of the board.', [ladder(0), board([['must: shorten a URL, redirect', C.ink], ['ask: custom alias? expiry? clicks?', C.amber], ['reads far outnumber writes', C.grey], ['redirects must be fast', C.grey]])]),
        frame(`2 Estimates: turn the numbers into load. 100 million new links a month is about ${Math.round(writesPerSec)} writes a second; at 100 reads per write, about ${Math.round(readsPerSec / 1000) * 1000} reads a second. Say each assumption out loud.`, [ladder(1), board([['100 M links / month', C.ink], [`≈ ${Math.round(writesPerSec)} writes / s`, C.amber], ['× 100 reads per write', C.grey], [`≈ ${Math.round(readsPerSec / 1000) * 1000} reads / s`, C.amber]])]),
        frame('3 API: two or three endpoints fix exactly what the system must do.', [ladder(2), board([['POST /urls  {long_url}', C.ink], ['  → 201 {code}', C.green], ['GET /{code}', C.ink], ['  → 301 redirect', C.green]])]),
        frame('4 Data model: the main tables and their keys. The main query is "code → long URL", so code is the key.', [ladder(3), board([['links', C.ink], ['  code      PK', C.amber], ['  long_url', C.grey], ['  created_at', C.grey]])]),
        frame('5 Design: draw the simplest thing that works, and walk one request through it. Make it work before you make it big.', [ladder(4), board([['GET /{code}:', C.ink]]), mini('m-s')]),
        frame('6 Deep dive: go where your estimates point. Reads dominate, so cache hot codes; and the hard part is making short codes unique — a counter turned into Base62.', [ladder(5), board([['reads dominate → cache', C.ink], ['unique codes → counter', C.ink], ['  + Base62 (short letters)', C.grey]]), mini('m-db')]),
        frame('7 Wrap-up: the design in three sentences, its weak spots, and what you would monitor. Then stop — let them ask.', [ladder(6), board([['summary · weak spots', C.ink], ['monitor: latency, cache hit', C.grey], ['rate, error rate', C.grey]]), mini(null)]),
    ];
    return { title: 'A step-by-step answer to any design question', variants: [{ label: 'URL shortener', frames }] };
};

// ============ sd0-t2 · Back-of-the-envelope estimation ============

/** 2,000 or 200 M: digits for small numbers, M for millions. */
const fmt = (n: number) => (n >= 1e6 ? `${Math.round(n / 1e6)} M` : Math.round(n).toLocaleString('en-GB'));

const estimation = (): AnimationSpec => {
    const users = 10e6;
    const reads = users * 20;
    const writes = users * 1;
    const secs = 100_000;
    const readQps = reads / secs;
    const writeQps = writes / secs;
    const perDay = writes * 1000;
    const perYear = perDay * 365;
    const bandwidth = readQps * 100e3;
    const chip = (id: string, x: number, y: number, value: string, color: string) => rect(id, x, y, 112, 30, { rx: 8, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: value, size: 10, weight: 700, mono: true });
    const op = (id: string, x: number, y: number, value: string) => text(id, x, y, value, { size: 12, fill: C.grey, weight: 700, mono: true });
    const row = (y: number, id: string, a: string, opA: string, b: string, opB: string, c: string, color: string): Shape[] => [
        chip(`${id}a`, 6, y, a, C.blue), op(`${id}o1`, 129, y + 15, opA), chip(`${id}b`, 144, y, b, color), op(`${id}o2`, 267, y + 15, opB), chip(`${id}c`, 282, y, c, color),
    ];
    const frames: Frame[] = [
        frame('Rough numbers decide the design. Start from users: 10 million a day, each reading 20 pages and posting 1 item.', [row(40, 'r0', `${fmt(users)} users`, '×', '20 reads', '=', `${fmt(reads)} / day`, C.cyan)]),
        frame(`A day has 86,400 seconds — call it 100,000. So ${fmt(reads)} reads a day is about ${fmt(readQps)} a second; ${fmt(writes)} writes a day is about ${fmt(writeQps)} a second.`, [
            row(40, 'r0', `${fmt(users)} users`, '×', '20 reads', '=', `${fmt(reads)} / day`, C.cyan),
            row(84, 'r1', `${fmt(reads)} / day`, '÷', '100,000 s', '=', `${fmt(readQps)} reads/s`, C.amber),
            row(128, 'r2', `${fmt(writes)} / day`, '÷', '100,000 s', '=', `${fmt(writeQps)} writes/s`, C.amber),
        ]),
        frame('Traffic is not flat: the peak is often 2–5 times the average. Design for the peak.', [
            row(40, 'r1', `${fmt(reads)} / day`, '÷', '100,000 s', '=', `${fmt(readQps)} reads/s`, C.amber),
            row(84, 'r3', `${fmt(readQps)} reads/s`, '×', '2–5 at peak', '=', `${fmt(readQps * 2)}–${fmt(readQps * 5)}/s`, C.red),
        ]),
        frame(`Storage: ${fmt(writes)} posts a day × 1 KB = ${perDay / 1e9} GB a day, about ${+(perYear / 1e12).toFixed(1)} TB a year — about ${Math.round((perYear * 3) / 1e12)} TB with 3 copies.`, [
            row(40, 's0', `${fmt(writes)} posts`, '×', '1 KB each', '=', `${perDay / 1e9} GB / day`, C.violet),
            row(84, 's1', `${perDay / 1e9} GB / day`, '×', '365 days', '=', `${+(perYear / 1e12).toFixed(1)} TB / yr`, C.violet),
            row(128, 's2', `${+(perYear / 1e12).toFixed(1)} TB / yr`, '×', '3 copies', '=', `≈ ${Math.round((perYear * 3) / 1e12)} TB`, C.violet),
        ]),
        frame(`Bandwidth: ${fmt(readQps)} reads a second × 100 KB = ${bandwidth / 1e6} MB a second going out. Now decide: one database or many? Does the hot data fit in a cache? Is a CDN needed?`, [
            row(40, 'b0', `${fmt(readQps)} reads/s`, '×', '100 KB each', '=', `${bandwidth / 1e6} MB / s`, C.green),
            label('d', 8, 110, 'one DB or many?  cache?  CDN?', C.ink, { size: 12, mono: false }),
        ]),
    ];
    return { title: 'Turn users into requests per second, storage and bandwidth', variants: [{ label: '10 million users', frames }] };
};

// ============ sd0-t3 · The low-level design interview ============

const lldApproach = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'lot', x: 10, y: 36, w: 92, label: 'ParkingLot', color: C.cyan, size: 10 },
        { id: 'floor', x: 10, y: 100, w: 92, label: 'Floor', color: C.cyan, size: 10 },
        { id: 'spot', x: 10, y: 164, w: 92, label: 'Spot', color: C.cyan, size: 10 },
        { id: 'vehicle', x: 150, y: 164, w: 92, label: 'Vehicle', color: C.violet, size: 10 },
        { id: 'ticket', x: 150, y: 100, w: 92, label: 'Ticket', color: C.violet, size: 10 },
        { id: 'payment', x: 150, y: 36, w: 92, label: 'Payment', color: C.violet, size: 10 },
        { id: 'pricing', x: 290, y: 33, w: 104, h: 40, label: 'PricingStrategy\n(interface)', color: C.amber, size: 9 },
        { id: 'assign', x: 290, y: 97, w: 104, h: 40, label: 'SpotAssigner\n(interface)', color: C.amber, size: 9 },
    ];
    const edges: FEdge[] = [
        { from: 'lot', to: 'floor', label: 'has' }, { from: 'floor', to: 'spot', label: 'has' }, { from: 'spot', to: 'vehicle', label: '0..1' },
        { from: 'ticket', to: 'spot' }, { from: 'payment', to: 'ticket' }, { from: 'payment', to: 'pricing' }, { from: 'lot', to: 'assign', dashed: true },
    ];
    const classes = ['lot', 'floor', 'spot', 'vehicle', 'ticket', 'payment'];
    const caseList = (pick: boolean): Part => [
        ['a car enters', 'the system assigns a spot', 'a ticket is issued', 'the driver pays on exit'].map((u, i) => text(`u${i}`, 10, 36 + i * 18, `· ${u}`, { size: 11, fill: pick ? C.grey : C.ink, weight: 600, anchor: 'start' })),
        pick && ['car', 'spot', 'ticket', 'payment'].map((w, i) => rect(`nn${i}`, 10 + i * 74, 130, 66, 24, { rx: 12, fill: tint(C.cyan, 0.3), stroke: C.cyan, sw: 1.5, text: w, size: 11, weight: 700, mono: true })),
        pick && ['assign()', 'pay()'].map((w, i) => rect(`vv${i}`, 10 + i * 84, 186, 76, 24, { rx: 12, fill: tint(C.amber, 0.3), stroke: C.amber, sw: 1.5, text: w, size: 11, weight: 700, mono: true })),
    ];
    const frames: Frame[] = [
        frame('1 Clarify: write the use cases as short sentences, and agree what is out of scope.', [caseList(false)]),
        frame('2 Find the entities: the nouns become candidate classes; the verbs (assign, pay) become methods.', [caseList(true), label('n', 10, 116, 'nouns → classes', C.cyan, { size: 11, mono: false }), label('v', 10, 172, 'verbs → methods', C.amber, { size: 11, mono: false })]),
        ...flow(nodes, edges, [
            { caption: '3 Draw the class diagram: fields, key methods and relationships. For each line ask: is it "is-a" or "has-a"?', show: classes },
            { caption: '4 Spot what varies — pricing rules, how a spot is chosen — and put each behind an interface (Strategy).', lit: ['pricing', 'assign'] },
            { caption: '5 Code the main flow, park(): the lot asks its SpotAssigner for a free spot, marks it taken and issues a ticket.', hot: ['lot>assign', 'lot>floor', 'floor>spot', 'ticket>spot'], packets: [{ id: 'car', label: 'park()', at: ['floor', 'spot', 0.5] }], lit: ['spot', 'ticket'] },
            { caption: '6 Stress-test it: two cars at two gates want the same spot at the same moment. Claiming a spot must be one atomic step, so only one gate wins.', bad: ['spot'], packets: [{ id: 'car', label: 'gate 1', at: ['floor', 'spot', 0.4] }, { id: 'car2', label: 'gate 2', at: 'spot' }], notes: [['claim the spot atomically: one gate wins', C.amber]] },
        ]),
    ];
    return { title: 'A low-level design answer, step by step', variants: [{ label: 'Parking lot', frames }] };
};

// ============ sd1-t1 · What happens when you type a URL ============

const typeUrl = (): AnimationSpec => {
    const dnsNodes: FNode[] = [
        { id: 'browser', x: 6, y: 100, w: 70, label: 'Browser', kind: 'client', color: C.cyan },
        { id: 'resolver', x: 176, y: 100, w: 96, label: 'Resolver\n(your ISP)', h: 40, color: C.violet },
        { id: 'root', x: 304, y: 30, w: 90, label: 'Root', color: C.grey },
        { id: 'tld', x: 304, y: 100, w: 90, label: '.com server', color: C.grey },
        { id: 'ns', x: 304, y: 170, w: 90, label: 'example.com\nname server', h: 40, color: C.grey, size: 10 },
    ];
    const dnsEdges: FEdge[] = [{ from: 'browser', to: 'resolver' }, { from: 'resolver', to: 'root' }, { from: 'resolver', to: 'tld' }, { from: 'resolver', to: 'ns' }];
    const dns = flow(dnsNodes, dnsEdges, [
        { caption: 'You type example.com. The browser checks its own DNS cache, then the operating system\'s. Both miss.', lit: ['browser'], badges: { browser: 'cache miss' } },
        { caption: 'It asks a resolver, usually run by your internet provider.', hot: ['browser>resolver'], packets: [{ id: 'q', label: 'example.com?', at: ['browser', 'resolver', 0.5] }], lit: ['resolver'] },
        { caption: 'The resolver asks a root server: "who handles .com?" The root points it at the .com servers.', hot: ['resolver>root'], packets: [{ id: 'q', label: '.com?', at: ['resolver', 'root', 0.6] }], lit: ['root'] },
        { caption: 'It asks a .com server: "who handles example.com?" It is pointed at example.com\'s own name server.', hot: ['resolver>tld'], packets: [{ id: 'q', label: 'example.com?', at: ['resolver', 'tld', 0.6] }], lit: ['tld'] },
        { caption: 'The name server returns the IP address: 203.0.113.10. Every answer along the way is cached for its TTL, so next time is much quicker.', hot: ['resolver>ns', 'browser>resolver'], packets: [{ id: 'q', label: '203.0.113.10', at: ['browser', 'resolver', 0.5] }], ok: ['ns', 'resolver'], badges: { resolver: 'cached (TTL)' } },
    ]);
    const netNodes: FNode[] = [
        { id: 'browser', x: 6, y: 100, w: 70, label: 'Browser', kind: 'client', color: C.cyan },
        { id: 'lb', x: 150, y: 100, w: 80, h: 40, label: 'Load\nbalancer', color: C.blue },
        { id: 'app', x: 262, y: 100, w: 60, label: 'App', color: C.blue },
        { id: 'db', x: 340, y: 40, w: 54, label: 'DB', kind: 'store', color: C.green },
        { id: 'cache', x: 340, y: 160, w: 54, label: 'Cache', kind: 'store', color: C.pink },
        { id: 'cdn', x: 150, y: 196, w: 80, label: 'CDN', color: C.teal },
    ];
    const netEdges: FEdge[] = [{ from: 'browser', to: 'lb' }, { from: 'lb', to: 'app' }, { from: 'app', to: 'db' }, { from: 'app', to: 'cache' }, { from: 'browser', to: 'cdn' }];
    const connect = flow(netNodes, netEdges, [
        { caption: 'With the IP address, the browser opens a TCP connection on port 443: a three-step handshake — SYN, SYN-ACK, ACK.', hot: ['browser>lb'], packets: [{ id: 'm', label: 'SYN', at: ['browser', 'lb', 0.5] }], lit: ['lb'] },
        { caption: 'TLS handshake: the server shows a certificate proving it really is example.com, and both sides agree on encryption keys.', hot: ['browser>lb'], packets: [{ id: 'm', label: 'cert', at: ['browser', 'lb', 0.5] }], badges: { lb: 'TLS' } },
        { caption: 'Now the request: "GET /", with "Host: example.com". The load balancer passes it to one of many app servers.', hot: ['browser>lb', 'lb>app'], packets: [{ id: 'm', label: 'GET /', at: ['lb', 'app', 0.5] }], lit: ['app'] },
        { caption: 'The app server reads the cache or database, builds the page and sends it back.', hot: ['app>cache', 'app>db'], packets: [{ id: 'm', label: '200 OK', at: ['browser', 'lb', 0.5] }], ok: ['app'] },
        { caption: 'The browser then requests the images, CSS and scripts — often from a CDN close to you.', hot: ['browser>cdn'], packets: [{ id: 'm', label: 'logo.png', at: ['browser', 'cdn', 0.5] }], lit: ['cdn'] },
    ]);
    return { title: 'Typing a URL: find the server, connect, ask, answer', variants: [{ label: 'DNS lookup', frames: dns }, { label: 'Connect and request', frames: connect }] };
};

// ============ sd1-t2 · HTTP and REST API design ============

const restApi = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 8, y: 96, w: 80, label: 'App', kind: 'client', color: C.cyan },
        { id: 'api', x: 160, y: 96, w: 90, label: 'Orders API', color: C.blue },
        { id: 'keys', x: 300, y: 40, w: 94, h: 40, label: 'idempotency\nkeys', kind: 'store', color: C.violet, size: 10 },
        { id: 'orders', x: 300, y: 150, w: 94, label: 'orders', kind: 'store', color: C.green },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'api' }, { from: 'api', to: 'keys' }, { from: 'api', to: 'orders' }];
    const retry = flow(nodes, edges, [
        { caption: 'The app creates an order: POST /v1/orders, with an Idempotency-Key header — a random id for this one attempt.', hot: ['client>api'], packets: [{ id: 'r', label: 'POST  key=k7', at: ['client', 'api', 0.5] }] },
        { caption: 'The server creates order 981 and stores the key with the result. It replies 201 Created…', hot: ['api>orders', 'api>keys'], ok: ['orders'], badges: { keys: 'k7 → 981', orders: '981' }, packets: [{ id: 'r', label: 'create', at: ['api', 'orders', 0.5] }] },
        { caption: '…but the reply is lost on a bad network. The app cannot tell whether the order was made, so it retries with the SAME key.', bad: ['client'], badges: { keys: 'k7 → 981', orders: '981' }, packets: [{ id: 'r', label: 'POST  key=k7', at: ['client', 'api', 0.5] }] },
        { caption: 'The server finds k7 already stored and returns the same result: order 981. No second order. POST isn\'t idempotent by itself — the key makes the retry safe.', hot: ['api>keys'], ok: ['keys'], badges: { keys: 'k7 → 981', orders: '981' }, packets: [{ id: 'r', label: '201  order 981', at: ['client', 'api', 0.4] }] },
    ]);
    const pageNodes: FNode[] = [{ id: 'client', x: 8, y: 96, w: 70, label: 'App', kind: 'client', color: C.cyan }, { id: 'api', x: 294, y: 96, w: 100, label: 'Orders API', color: C.blue }];
    const pageEdges: FEdge[] = [{ from: 'client', to: 'api' }];
    const pages = flow(pageNodes, pageEdges, [
        { caption: 'Lists are paginated. GET /v1/orders?limit=20 returns 20 orders and a cursor pointing at where the page ended.', hot: ['client>api'], packets: [{ id: 'r', label: 'GET ?limit=20', at: ['client', 'api', 0.5] }] },
        { caption: '200 OK: 20 orders plus cursor=abc.', packets: [{ id: 'r', label: '20 orders · cursor=abc', at: ['client', 'api', 0.5] }], ok: ['api'] },
        { caption: 'The app sends the cursor back for the next 20. Methods mean what they say (GET reads), and the URL names a resource (/orders), not a verb.', hot: ['client>api'], packets: [{ id: 'r', label: 'GET ?cursor=abc', at: ['client', 'api', 0.5] }] },
    ]);
    return { title: 'A predictable API: clear resources, honest status codes, safe retries', variants: [{ label: 'Safe retry', frames: retry }, { label: 'Pagination', frames: pages }] };
};

// ============ sd1-t3 · Real-time communication ============

const realTime = (): AnimationSpec => {
    const cy = 70;
    const sy = 170;
    const lanes: Part = [
        line('lc', 70, cy, 392, cy, { stroke: C.cyan, sw: 2 }), text('lct', 8, cy, 'client', { size: 12, fill: C.cyan, weight: 700, anchor: 'start' }),
        line('ls', 70, sy, 392, sy, { stroke: C.violet, sw: 2 }), text('lst', 8, sy, 'server', { size: 12, fill: C.violet, weight: 700, anchor: 'start' }),
        text('time', 392, 212, 'time →', { size: 10, fill: C.dim, anchor: 'end' }),
    ];
    const msg = (id: string, x1: number, x2: number, up: boolean, color: string, label_?: string): Shape[] => [
        arrow(id, x1, up ? sy - 4 : cy + 4, x2, up ? cy + 4 : sy - 4, { stroke: color, sw: 2 }),
        ...(label_ ? [text(`${id}-t`, (x1 + x2) / 2 + 6, (cy + sy) / 2, label_, { size: 9, fill: color, weight: 700, mono: true, anchor: 'start' })] : []),
    ];
    const news = (x: number) => [rect('news', x - 22, sy + 10, 44, 18, { rx: 9, fill: tint(C.amber, 0.5), stroke: C.amber, sw: 1, text: 'news!', size: 9, weight: 700, mono: true })];
    const short: Part = [80, 150, 220, 290].map((x, i) => [msg(`q${i}`, x, x + 10, false, C.grey), msg(`a${i}`, x + 14, x + 24, true, i === 3 ? C.green : C.red, i === 3 ? 'yes' : 'no')]);
    const long: Part = [msg('q0', 80, 90, false, C.grey), news(250), msg('a0', 252, 262, true, C.green, 'news'), msg('q1', 268, 278, false, C.grey), rect('held', 90, sy - 6, 160, 12, { rx: 6, fill: tint(C.amber, 0.25), stroke: 'none' }), text('held-t', 170, sy + 22, 'request held open', { size: 9, fill: C.amber })];
    const ws: Part = [msg('up', 80, 90, false, C.grey, 'Upgrade'), rect('pipe', 96, cy + 14, 290, sy - cy - 28, { rx: 8, fill: tint(C.teal, 0.12), stroke: C.teal, sw: 1.5, dash: '5 4' }),
        msg('w1', 150, 160, true, C.teal), msg('w2', 210, 220, false, C.teal), msg('w3', 270, 280, true, C.teal), msg('w4', 330, 340, true, C.teal), text('ws-t', 230, 196, 'one open connection, both directions', { size: 10, fill: C.teal })];
    const sse: Part = [msg('s0', 80, 90, false, C.grey, 'GET'), msg('e1', 150, 160, true, C.pink), msg('e2', 220, 230, true, C.pink), msg('e3', 290, 300, true, C.pink), text('sse-t', 230, 196, 'server → client events only', { size: 10, fill: C.pink })];
    const frames: Frame[] = [
        frame('Normal HTTP: the client asks, the server answers. For chat, live scores or notifications, the server needs a way to push.', [lanes]),
        frame('Short polling: ask "anything new?" every few seconds. Simple — but most answers are "no", and each one costs a full request.', [lanes, short]),
        frame('Long polling: ask, and the server holds the request open until there is news (or about 30 s pass). The client immediately asks again.', [lanes, long]),
        frame('WebSocket: starts as an HTTP request with an Upgrade header; then the same connection stays open and either side can send at any time.', [lanes, ws]),
        frame('SSE (server-sent events): one HTTP request, and the server keeps sending events down it. One-way, simpler, and the browser reconnects by itself.', [lanes, sse]),
    ];
    const nodes: FNode[] = [
        { id: 'a', x: 8, y: 40, w: 72, label: 'User A', kind: 'client', color: C.cyan },
        { id: 'b', x: 8, y: 170, w: 72, label: 'User B', kind: 'client', color: C.cyan },
        { id: 'g1', x: 130, y: 40, w: 90, label: 'Gateway 1', color: C.blue },
        { id: 'g2', x: 130, y: 170, w: 90, label: 'Gateway 2', color: C.blue },
        { id: 'reg', x: 290, y: 104, w: 100, h: 40, label: 'Registry\n(who is where)', kind: 'store', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'a', to: 'g1' }, { from: 'b', to: 'g2' }, { from: 'g1', to: 'reg' }, { from: 'g1', to: 'g2' }];
    const scale = flow(nodes, edges, [
        { caption: 'At scale, users connect to many gateway servers. A registry (such as Redis) records which gateway holds each user.', badges: { reg: 'B → gw 2' } },
        { caption: 'A sends a message to B over its open connection to gateway 1.', hot: ['a>g1'], packets: [{ id: 'm', label: 'hi B', at: ['a', 'g1', 0.5] }], badges: { reg: 'B → gw 2' } },
        { caption: 'Gateway 1 asks the registry where B is connected: gateway 2.', hot: ['g1>reg'], lit: ['reg'], packets: [{ id: 'm', label: 'hi B', at: 'g1' }], badges: { reg: 'B → gw 2' } },
        { caption: 'It forwards the message to gateway 2, which pushes it down B\'s open connection.', hot: ['g1>g2', 'b>g2'], ok: ['b'], packets: [{ id: 'm', label: 'hi B', at: ['b', 'g2', 0.5] }], badges: { reg: 'B → gw 2' } },
    ]);
    return { title: 'Getting the server to push: polling, long polling, WebSockets, SSE', variants: [{ label: 'Four ways', frames }, { label: 'At scale', frames: scale }] };
};

// ============ sd1-t4 · CDN ============

const cdn = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'u1', x: 8, y: 40, w: 80, label: 'User 1\nin Tokyo', h: 40, kind: 'client', color: C.cyan, size: 10 },
        { id: 'u2', x: 8, y: 170, w: 80, label: 'User 2\nin Tokyo', h: 40, kind: 'client', color: C.cyan, size: 10 },
        { id: 'edge', x: 150, y: 100, w: 96, h: 40, label: 'Edge server\n(Tokyo)', color: C.teal, size: 10 },
        { id: 'origin', x: 300, y: 100, w: 92, h: 40, label: 'Your origin\n(London)', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'u1', to: 'edge' }, { from: 'u2', to: 'edge' }, { from: 'edge', to: 'origin' }];
    const frames = flow(nodes, edges, [
        { caption: 'cdn.example.com points at the CDN. A user\'s request goes to the nearest edge server, found through DNS or anycast routing.', hot: ['u1>edge'], packets: [{ id: 'r', label: 'video.mp4', at: ['u1', 'edge', 0.5] }] },
        { caption: 'Cache miss: the edge doesn\'t have the file yet, so it fetches it from your origin — once — across the world.', bad: ['edge'], hot: ['edge>origin'], packets: [{ id: 'r', label: 'video.mp4', at: ['edge', 'origin', 0.5] }], badges: { edge: 'miss' } },
        { caption: 'It stores a copy and returns it. This first request was slow, but it paid for everyone after it.', ok: ['edge'], hot: ['u1>edge'], packets: [{ id: 'r', label: 'video.mp4', at: ['u1', 'edge', 0.4] }], badges: { edge: 'stored' } },
        { caption: 'Cache hit: the next user in Tokyo gets the file from the edge in a few milliseconds. Your servers never see the request.', ok: ['edge'], dim: ['origin'], hot: ['u2>edge'], packets: [{ id: 'r2', label: 'video.mp4', at: ['u2', 'edge', 0.5] }], badges: { edge: 'hit · ~5 ms' } },
        { caption: 'The copy stays until its TTL runs out. Less latency for users, less load on you, and spikes are absorbed at the edge.', ok: ['edge'], badges: { edge: 'until TTL' } },
    ]);
    return { title: 'A CDN serves copies from somewhere near the user', variants: [{ label: 'Miss, then hit', frames }] };
};

// ============ sd1-t5 · Proxies and API gateways ============

const gateway = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 104, w: 62, label: 'Client', kind: 'client', color: C.cyan },
        { id: 'gw', x: 156, y: 92, w: 92, h: 56, label: 'API\ngateway', color: C.blue },
        { id: 'users', x: 296, y: 30, w: 98, label: 'user service', color: C.violet, size: 10 },
        { id: 'orders', x: 296, y: 103, w: 98, label: 'order service', color: C.violet, size: 10 },
        { id: 'pay', x: 296, y: 176, w: 98, label: 'payment service', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'gw' }, { from: 'gw', to: 'users', label: '/users' }, { from: 'gw', to: 'orders', label: '/orders' }, { from: 'gw', to: 'pay', label: '/payments' }];
    const frames = flow(nodes, edges, [
        { caption: 'Clients send every request to one address, api.example.com, instead of knowing about every service.', hot: ['client>gw'], packets: [{ id: 'r', label: 'GET /orders/7', at: ['client', 'gw', 0.5] }] },
        { caption: 'The gateway handles TLS, then checks the token (who is this?)…', lit: ['gw'], packets: [{ id: 'r', label: 'GET /orders/7', at: 'gw' }], badges: { gw: 'TLS · token ✓' } },
        { caption: '…and the rate limit (are they allowed this many requests?).', lit: ['gw'], packets: [{ id: 'r', label: 'GET /orders/7', at: 'gw' }], badges: { gw: 'rate limit ✓' } },
        { caption: 'It routes by path: /orders/… goes to the order service. (Behind it, a load balancer picks one copy of that service.)', hot: ['gw>orders'], ok: ['orders'], packets: [{ id: 'r', label: 'GET /orders/7', at: ['gw', 'orders', 0.55] }] },
        { caption: 'It waits for the answer, sends it back, and logs the request and how long it took. Business logic stays in the services, not the gateway.', hot: ['client>gw'], packets: [{ id: 'r', label: '200 · 42 ms', at: ['client', 'gw', 0.5] }], badges: { gw: 'logged' } },
    ]);
    return { title: 'One front door that checks, limits and routes every request', variants: [{ label: 'One request', frames }] };
};

export const phase01Animations: Record<string, () => AnimationSpec> = {
    'sd0-t4': buildingBlocks,
    'sd0-t1': hldFramework,
    'sd0-t2': estimation,
    'sd0-t3': lldApproach,
    'sd1-t1': typeUrl,
    'sd1-t2': restApi,
    'sd1-t3': realTime,
    'sd1-t4': cdn,
    'sd1-t5': gateway,
};
