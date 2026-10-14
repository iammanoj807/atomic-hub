import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, circle, frame, line, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { flow, label, type FEdge, type FNode } from './flow';

// System Design Phase 8 (high-level design questions) and Phase 9 (AI/ML
// system design). Codes, rankings, matches and batch schedules are computed.

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = (n: number) => {
    let out = '';
    for (let v = n; v > 0; v = Math.floor(v / 62)) out = BASE62[v % 62] + out;
    return out || '0';
};

// ============ sd8-t1 · URL shortener ============

const urlShortener = (): AnimationSpec => {
    const id = 125_000_042;
    const code = base62(id);
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 100, w: 64, label: 'Client', kind: 'client', color: C.cyan },
        { id: 'lb', x: 96, y: 100, w: 60, label: 'LB', color: C.blue },
        { id: 'api', x: 186, y: 94, w: 86, h: 46, label: 'API\nservers', color: C.blue },
        { id: 'ids', x: 186, y: 14, w: 86, h: 44, label: 'ID-range\nallocator', color: C.violet, size: 10 },
        { id: 'cache', x: 306, y: 40, w: 88, label: 'Redis', kind: 'store', color: C.pink },
        { id: 'db', x: 306, y: 150, w: 88, label: 'links DB', kind: 'store', color: C.green },
        { id: 'q', x: 186, y: 190, w: 86, label: 'analytics', kind: 'queue', color: C.amber, size: 10 },
    ];
    const edges: FEdge[] = [
        { from: 'client', to: 'lb' }, { from: 'lb', to: 'api' }, { from: 'api', to: 'ids' }, { from: 'api', to: 'cache' }, { from: 'api', to: 'db' }, { from: 'api', to: 'q' },
    ];
    const write = flow(nodes, edges, [
        { caption: 'Shorten a URL: POST /urls with the long URL. Many stateless API servers sit behind a load balancer.', hot: ['client>lb', 'lb>api'], packets: [{ id: 'r', label: 'POST long URL', at: 'api' }] },
        { caption: 'Each server reserves a whole RANGE of IDs from the allocator in advance — 125,000,000 to 125,999,999 — so there is no single counter to queue on.', hot: ['api>ids'], lit: ['ids'], badges: { api: 'range 125 M…' } },
        { caption: `It takes the next ID from its own range, ${id.toLocaleString('en-GB')}, and turns it into Base62 (0–9, a–z, A–Z): "${code}". Short, and unique without any check.`, lit: ['api'], badges: { api: `→ ${code}` } },
        { caption: `Store "${code}" → the long URL in the links table, keyed by the code, and reply with the short link.`, hot: ['api>db'], ok: ['db'], packets: [{ id: 'r', label: `${code} → URL`, at: ['api', 'db', 0.55] }] },
    ]);
    const read = flow(nodes, edges, [
        { caption: `Someone opens /${code}. Reads far outnumber writes, so the redirect path must be fast.`, hot: ['client>lb', 'lb>api'], packets: [{ id: 'r', label: `GET /${code}`, at: 'api' }] },
        { caption: 'Check Redis first. Popular codes are almost always there: a hit, and the API replies 301 straight away.', hot: ['api>cache'], ok: ['cache'], packets: [{ id: 'r', label: 'hit', at: ['api', 'cache', 0.55], color: C.green }] },
        { caption: 'On a miss, read the links table, put the result in Redis for next time, then redirect.', hot: ['api>db', 'api>cache'], bad: ['cache'], packets: [{ id: 'r', label: 'miss → DB', at: ['api', 'db', 0.55] }] },
        { caption: 'The click is recorded by dropping an event on a queue, so counting never slows the redirect. When the table outgrows one database, shard it by code.', hot: ['api>q'], packets: [{ id: 'r', label: 'click', at: ['api', 'q', 0.55] }] },
    ]);
    return { title: 'A URL shortener: unique codes on the write path, a cache on the read path', variants: [{ label: 'Write path', frames: write }, { label: 'Read path', frames: read }] };
};

// ============ sd8-t2 · Distributed rate limiter ============

const distributedLimiter = (): AnimationSpec => {
    const limit = 10;
    const nodes: FNode[] = [
        { id: 'c1', x: 6, y: 40, w: 64, label: 'user 7', kind: 'client', color: C.cyan, size: 10 },
        { id: 'c2', x: 6, y: 160, w: 64, label: 'user 7', kind: 'client', color: C.cyan, size: 10 },
        { id: 'g1', x: 110, y: 36, w: 96, h: 42, label: 'gateway 1\n+ limiter', color: C.blue, size: 10 },
        { id: 'g2', x: 110, y: 156, w: 96, h: 42, label: 'gateway 2\n+ limiter', color: C.blue, size: 10 },
        { id: 'redis', x: 250, y: 96, w: 82, h: 42, label: 'Redis\ncounters', kind: 'store', color: C.pink, size: 10 },
        { id: 'svc', x: 344, y: 36, w: 50, label: 'API', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'c1', to: 'g1' }, { from: 'c2', to: 'g2' }, { from: 'g1', to: 'redis' }, { from: 'g2', to: 'redis' }, { from: 'g1', to: 'svc' }];
    const frames = flow(nodes, edges, [
        { caption: `The rule, loaded from a config store and cached in each gateway: ${limit} requests a minute per user. The same user's requests may hit ANY gateway.`, badges: { redis: 'user 7: 8' } },
        { caption: 'A request reaches gateway 1. The limiter checks and updates the user\'s counter in Redis in one atomic step (a Lua script): 8 → 9, under the limit.', hot: ['c1>g1', 'g1>redis'], packets: [{ id: 'r1', label: 'check +1', at: ['g1', 'redis', 0.5] }], badges: { redis: 'user 7: 9' } },
        { caption: 'Allowed: the request goes on to the service.', hot: ['g1>svc'], ok: ['svc'], packets: [{ id: 'r1', label: 'OK', at: ['g1', 'svc', 0.5], color: C.green }], badges: { redis: 'user 7: 9' } },
        { caption: 'Another request lands on gateway 2. It updates the SAME counter: 9 → 10. Still allowed — because the count is shared, two gateways can\'t each allow 10.', hot: ['c2>g2', 'g2>redis'], packets: [{ id: 'r2', label: 'check +1', at: ['g2', 'redis', 0.5] }], badges: { redis: 'user 7: 10' } },
        { caption: 'The next one would make 11. Over the limit: 429 Too Many Requests, with Retry-After. If Redis itself is down, the limiter fails open (or closed) by a rule you chose in advance.', bad: ['g2'], packets: [{ id: 'r2', label: '429', at: ['c2', 'g2', 0.5], color: C.red }], badges: { redis: 'user 7: 10 (full)' } },
    ]);
    return { title: 'A rate limiter shared by every gateway', variants: [{ label: 'One user, two gateways', frames }] };
};

// ============ sd8-t3 · Notification system ============

const notifications = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'order', x: 6, y: 100, w: 70, label: 'orders', color: C.blue },
        { id: 'notif', x: 100, y: 92, w: 92, h: 50, label: 'notification\nservice', color: C.violet, size: 10 },
        { id: 'qpush', x: 216, y: 26, w: 84, label: 'push · high', kind: 'queue', color: C.amber, size: 9 },
        { id: 'qsms', x: 216, y: 100, w: 84, label: 'SMS', kind: 'queue', color: C.amber, size: 9 },
        { id: 'qmail', x: 216, y: 174, w: 84, label: 'email · low', kind: 'queue', color: C.amber, size: 9 },
        { id: 'apns', x: 320, y: 26, w: 74, label: 'push\nprovider', h: 40, color: C.teal, size: 9 },
        { id: 'sms', x: 320, y: 100, w: 74, label: 'SMS\ngateway', h: 40, color: C.teal, size: 9 },
        { id: 'mail', x: 320, y: 174, w: 74, label: 'email\nservice', h: 40, color: C.teal, size: 9 },
    ];
    const edges: FEdge[] = [
        { from: 'order', to: 'notif' }, { from: 'notif', to: 'qpush' }, { from: 'notif', to: 'qsms' }, { from: 'notif', to: 'qmail' },
        { from: 'qpush', to: 'apns' }, { from: 'qsms', to: 'sms' }, { from: 'qmail', to: 'mail' },
    ];
    const frames = flow(nodes, edges, [
        { caption: '"Order shipped". The order service doesn\'t call any provider itself: it hands one event to the notification service.', hot: ['order>notif'], packets: [{ id: 'e', label: 'shipped', at: ['order', 'notif', 0.5] }] },
        { caption: 'The notification service checks the user\'s preferences (push yes, SMS no), applies per-user rate limits, and fills in the template.', lit: ['notif'], badges: { notif: 'prefs ✓ · template' } },
        { caption: 'It puts the message on a queue per channel and per priority — sign-in codes ahead of marketing — so a flood of emails can\'t delay a passcode.', hot: ['notif>qpush'], packets: [{ id: 'e', label: 'push msg', at: ['notif', 'qpush', 0.6] }] },
        { caption: 'A channel worker sends it to the push provider. The provider is slow and times out — so the worker retries with backoff.', hot: ['qpush>apns'], bad: ['apns'], packets: [{ id: 'e', label: 'retry 2', at: ['qpush', 'apns', 0.5], color: C.red }] },
        { caption: 'Delivered. Every status is written to a delivery log; a message that keeps failing goes to a dead-letter queue. Idempotency keys stop a retry from notifying twice.', ok: ['apns'], packets: [{ id: 'e', label: 'delivered', at: 'apns', color: C.green }] },
    ]);
    return { title: 'Notifications: one service, a queue per channel and priority', variants: [{ label: '"Order shipped"', frames }] };
};

// ============ sd8-t4 · Chat app ============

const chatApp = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'a', x: 6, y: 30, w: 66, label: 'Alice', kind: 'client', color: C.cyan },
        { id: 'g1', x: 100, y: 30, w: 80, label: 'gateway 1', color: C.blue, size: 10 },
        { id: 'chat', x: 160, y: 104, w: 96, h: 42, label: 'chat\nservice', color: C.violet, size: 10 },
        { id: 'store', x: 300, y: 104, w: 94, h: 42, label: 'message\nstore', kind: 'store', color: C.green, size: 10 },
        { id: 'reg', x: 300, y: 26, w: 94, h: 40, label: 'who is where\n(Redis)', kind: 'store', color: C.pink, size: 9 },
        { id: 'g2', x: 100, y: 190, w: 80, label: 'gateway 2', color: C.blue, size: 10 },
        { id: 'b', x: 6, y: 190, w: 66, label: 'Bob', kind: 'client', color: C.cyan },
        { id: 'push', x: 300, y: 190, w: 94, label: 'push service', color: C.teal, size: 9 },
    ];
    const edges: FEdge[] = [
        { from: 'a', to: 'g1' }, { from: 'g1', to: 'chat' }, { from: 'chat', to: 'store' }, { from: 'chat', to: 'reg' }, { from: 'chat', to: 'g2' }, { from: 'b', to: 'g2' }, { from: 'chat', to: 'push' },
    ];
    const online = flow(nodes, edges, [
        { caption: 'Every phone keeps a WebSocket open to a chat gateway. Alice sends Bob a message.', hot: ['a>g1'], packets: [{ id: 'm', label: 'hi Bob', at: ['a', 'g1', 0.5] }], hide: ['push'] },
        { caption: 'The gateway passes it to the chat service, which gives it a time-ordered ID and stores it — the message is safe before anyone is told.', hot: ['g1>chat', 'chat>store'], ok: ['store'], packets: [{ id: 'm', label: 'msg #8812', at: ['chat', 'store', 0.5] }], hide: ['push'] },
        { caption: 'Where is Bob connected? The registry says gateway 2.', hot: ['chat>reg'], lit: ['reg'], badges: { reg: 'Bob → gw 2' }, packets: [{ id: 'm', label: 'msg #8812', at: 'chat' }], hide: ['push'] },
        { caption: 'The chat service pushes the message to gateway 2, which sends it down Bob\'s open connection. A "delivered" receipt travels back the same way.', hot: ['chat>g2', 'b>g2'], ok: ['b'], packets: [{ id: 'm', label: 'hi Bob', at: ['b', 'g2', 0.5] }], hide: ['push'] },
    ]);
    const offline = flow(nodes, edges, [
        { caption: 'Now Bob is offline: the registry has no gateway for him.', dim: ['b', 'g2'], badges: { reg: 'Bob: offline' }, lit: ['reg'] },
        { caption: 'The message is already stored, so nothing is lost. The chat service asks the push service to send a notification to Bob\'s phone.', dim: ['b', 'g2'], hot: ['chat>push'], packets: [{ id: 'm', label: 'notify Bob', at: ['chat', 'push', 0.55] }], badges: { reg: 'Bob: offline' } },
        { caption: 'When Bob opens the app, he reconnects to some gateway and fetches everything newer than the last message he has, from the store.', hot: ['b>g2', 'chat>g2', 'chat>store'], ok: ['b'], packets: [{ id: 'm', label: 'since #8800', at: ['chat', 'store', 0.5] }], badges: { reg: 'Bob → gw 2' } },
    ]);
    return { title: 'Chat: store first, then route to wherever the recipient is connected', variants: [{ label: 'Bob online', frames: online }, { label: 'Bob offline', frames: offline }] };
};

// ============ sd8-t5 · News feed ============

const newsFeed = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'alice', x: 6, y: 30, w: 66, label: 'Alice', kind: 'client', color: C.cyan },
        { id: 'posts', x: 100, y: 30, w: 86, label: 'post store', kind: 'store', color: C.green, size: 10 },
        { id: 'fan', x: 100, y: 120, w: 86, h: 42, label: 'fan-out\nworkers', color: C.violet, size: 10 },
        { id: 'f1', x: 230, y: 70, w: 76, label: 'Bob\'s feed', kind: 'store', color: C.pink, size: 9 },
        { id: 'f2', x: 230, y: 126, w: 76, label: 'Cai\'s feed', kind: 'store', color: C.pink, size: 9 },
        { id: 'f3', x: 230, y: 182, w: 76, label: 'Dev\'s feed', kind: 'store', color: C.pink, size: 9 },
        { id: 'bob', x: 330, y: 70, w: 64, label: 'Bob', kind: 'client', color: C.cyan },
        { id: 'celeb', x: 6, y: 182, w: 76, label: 'celebrity', kind: 'client', color: C.amber, size: 10 },
    ];
    const edges: FEdge[] = [
        { from: 'alice', to: 'posts' }, { from: 'posts', to: 'fan' }, { from: 'fan', to: 'f1' }, { from: 'fan', to: 'f2' }, { from: 'fan', to: 'f3' }, { from: 'bob', to: 'f1' },
        { from: 'celeb', to: 'posts' }, { from: 'bob', to: 'posts', dashed: true },
    ];
    const push = flow(nodes, edges, [
        { caption: 'Fan-out on write: Alice posts. The post is saved once in the post store.', hide: ['celeb'], hot: ['alice>posts'], packets: [{ id: 'p', label: 'post 77', at: ['alice', 'posts', 0.5] }] },
        { caption: 'Workers copy the post\'s ID into each follower\'s ready-made feed list (in Redis). Writing costs one entry per follower.', hide: ['celeb'], hot: ['fan>f1', 'fan>f2', 'fan>f3'], packets: ['f1', 'f2', 'f3'].map(f => ({ id: `p${f}`, label: '77', at: ['fan', f, 0.6] as [string, string, number] })) },
        { caption: 'Reading is then trivial: Bob\'s feed is one list read, already in order. Post content comes from a cache, and photos from a CDN.', hide: ['celeb'], hot: ['bob>f1'], ok: ['f1'], packets: [{ id: 'r', label: 'read feed', at: 'bob' }] },
    ]);
    const hybrid = flow(nodes, edges, [
        { caption: 'The celebrity problem: someone with millions of followers posts. Copying the ID into every feed would mean a huge burst of writes for one post.', lit: ['celeb'], hot: ['celeb>posts'], packets: [{ id: 'c', label: 'post 90', at: ['celeb', 'posts', 0.5] }] },
        { caption: 'Hybrid: push as normal for ordinary users, but DON\'T fan out celebrity posts. They are only saved once.', dim: ['fan', 'f2', 'f3'], ok: ['posts'] },
        { caption: 'When Bob reads, his ready-made feed is merged with the latest posts of the few celebrities he follows, pulled at read time. A ranking service can then reorder the result.', hot: ['bob>f1', 'bob>posts'], ok: ['f1', 'posts'], dim: ['fan', 'f2', 'f3'], packets: [{ id: 'r', label: 'merge', at: 'bob' }] },
    ]);
    return { title: 'A news feed: push to followers\' lists, pull for celebrities', variants: [{ label: 'Fan-out on write', frames: push }, { label: 'Hybrid', frames: hybrid }] };
};

// ============ sd8-t6 · Video streaming ============

const videoStreaming = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'up', x: 6, y: 30, w: 70, label: 'uploader', kind: 'client', color: C.cyan, size: 10 },
        { id: 'raw', x: 130, y: 26, w: 86, h: 42, label: 'object\nstorage', kind: 'store', color: C.teal, size: 10 },
        { id: 'q', x: 300, y: 30, w: 80, label: 'queue', kind: 'queue', color: C.amber, size: 10 },
        { id: 'tx', x: 300, y: 104, w: 80, h: 42, label: 'trans-\ncoders', color: C.violet, size: 10 },
        { id: 'cdn', x: 130, y: 186, w: 86, label: 'CDN', color: C.teal },
        { id: 'player', x: 6, y: 186, w: 76, label: 'player', kind: 'client', color: C.cyan },
    ];
    const edges: FEdge[] = [{ from: 'up', to: 'raw' }, { from: 'raw', to: 'q' }, { from: 'q', to: 'tx' }, { from: 'tx', to: 'raw', dashed: true }, { from: 'cdn', to: 'raw' }, { from: 'player', to: 'cdn' }];
    const quality: Part = ['360p', '720p', '1080p'].map((q, i) => rect(`q${q}`, 270, 160 + i * 26, 110, 22, { rx: 5, fill: tint(C.violet, 0.3), stroke: C.violet, sw: 1, text: `${q} segments`, size: 9, weight: 700, mono: true }));
    const frames = flow(nodes, edges, [
        { caption: 'The app gets a pre-signed URL and uploads the video in parts, straight to object storage — never through your servers.', hot: ['up>raw'], packets: [{ id: 'v', label: 'video.mov', at: ['up', 'raw', 0.5] }] },
        { caption: 'An event on a queue triggers transcoding workers.', hot: ['raw>q', 'q>tx'], packets: [{ id: 'v', label: 'new video', at: ['q', 'tx', 0.5] }] },
        { caption: 'They cut the video into short segments of a few seconds, and encode each one at several qualities. A manifest lists every segment for every quality.', lit: ['tx'], extra: [quality], hot: ['tx>raw'] },
        { caption: 'Playback: the player fetches the manifest and segments from a CDN near the viewer, starting at a good quality.', hot: ['player>cdn', 'cdn>raw'], packets: [{ id: 's', label: '1080p seg 1', at: ['player', 'cdn', 0.5] }], extra: [quality] },
        { caption: 'The viewer\'s bandwidth drops. For the NEXT segment the player simply asks for a lower quality — no stall. That is adaptive bitrate. View counts are added up later, in the background.', hot: ['player>cdn'], packets: [{ id: 's', label: '360p seg 2', at: ['player', 'cdn', 0.5], color: C.amber }], extra: [quality] },
    ]);
    return { title: 'Video: upload, transcode into segments, stream from a CDN', variants: [{ label: 'Upload to playback', frames }] };
};

// ============ sd8-t7 · Ride hailing ============

const rideHailing = (): AnimationSpec => {
    const cols = 6;
    const rows = 4;
    const cell = 52;
    const gx = 40;
    const gy = 26;
    const rider: [number, number] = [2, 1];
    const drivers: [string, number, number][] = [['d1', 3.6, 1.4], ['d2', 1.3, 2.2], ['d3', 2.4, 0.6], ['d4', 5.5, 3.5], ['d5', 0.4, 3.3]];
    const cellOf = (x: number, y: number) => [Math.floor(x), Math.floor(y)];
    const near = (d: [string, number, number]) => {
        const [cx, cy] = cellOf(d[1], d[2]);
        return Math.abs(cx - rider[0]) <= 1 && Math.abs(cy - rider[1]) <= 1;
    };
    const rx = rider[0] + 0.5;
    const ry = rider[1] + 0.5;
    const eta = (d: [string, number, number]) => Math.hypot(d[1] - rx, d[2] - ry);
    const ranked = drivers.filter(near).sort((a, b) => eta(a) - eta(b));
    const grid = (searching: boolean): Part => Array.from({ length: rows * cols }, (_, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        const inSearch = searching && Math.abs(c - rider[0]) <= 1 && Math.abs(r - rider[1]) <= 1;
        return rect(`g${k}`, gx + c * cell, gy + r * cell, cell - 2, cell - 2, { rx: 4, fill: tint(inSearch ? C.amber : C.blue, inSearch ? 0.15 : 0.05), stroke: inSearch ? C.amber : C.faint, sw: 1 });
    });
    const dots = (states: Record<string, string>): Part => drivers.map(d => circle(d[0], gx + d[1] * cell, gy + d[2] * cell, 9, {
        fill: tint(states[d[0]] ?? C.cyan, 0.8), stroke: C.bg, sw: 1.5, text: d[0].replace('d', ''), size: 9, weight: 800,
    }));
    const riderDot = circle('rider', gx + rx * cell, gy + ry * cell, 10, { fill: tint(C.pink, 0.9), stroke: C.bg, sw: 1.5, text: 'R', size: 10, weight: 800 });
    const note = (value: string, color: string) => label('note', 10, 232, value, color, { size: 11 });
    const [best, second] = ranked;
    const frames: Frame[] = [
        frame('Drivers send their location every few seconds. Only the LATEST position is kept, in an in-memory geo index that splits the city into cells (geohashes).', [grid(false), dots({})]),
        frame('A rider (R) asks for a car. Instead of measuring the distance to every driver in the city, search only the rider\'s cell and its neighbours.', [grid(true), dots({}), riderDot]),
        frame(`Drivers in those cells are ranked by estimated arrival time: ${ranked.map(d => `driver ${d[0].slice(1)}`).join(', ')}. The rest of the city is never looked at.`, [grid(true), dots(Object.fromEntries(drivers.map(d => [d[0], near(d) ? C.amber : C.grey]))), riderDot]),
        frame(`The trip is offered to driver ${best[0].slice(1)} first, with a timeout. No answer in time…`, [grid(true), dots({ [best[0]]: C.red, ...(second ? { [second[0]]: C.amber } : {}) }), riderDot, note(`offer → driver ${best[0].slice(1)}: no answer`, C.red)]),
        frame(`…so it is offered to driver ${second[0].slice(1)}, who accepts. Their status is set to "on a trip" in one atomic update, so they can't be double-booked. A trip state machine takes over from here.`, [grid(true), dots({ [best[0]]: C.grey, [second[0]]: C.green }), riderDot, note(`driver ${second[0].slice(1)} accepted · locked`, C.green)]),
    ];
    return { title: 'Ride hailing: search nearby cells, offer, lock', variants: [{ label: 'Find a driver', frames }] };
};

// ============ sd8-t8 · Payment system ============

const payments = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 96, w: 66, label: 'checkout', kind: 'client', color: C.cyan, size: 10 },
        { id: 'pay', x: 110, y: 90, w: 92, h: 50, label: 'payment\nservice', color: C.blue, size: 10 },
        { id: 'db', x: 110, y: 186, w: 92, h: 44, label: 'payments +\nledger', kind: 'store', color: C.green, size: 9 },
        { id: 'psp', x: 296, y: 90, w: 98, h: 50, label: 'payment\nprovider', color: C.violet, size: 10 },
        { id: 'orders', x: 296, y: 14, w: 98, label: 'order service', color: C.teal, size: 9 },
        { id: 'recon', x: 296, y: 190, w: 98, label: 'reconciliation', color: C.amber, size: 9 },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'pay' }, { from: 'pay', to: 'db' }, { from: 'pay', to: 'psp' }, { from: 'pay', to: 'orders', dashed: true }, { from: 'recon', to: 'db' }, { from: 'recon', to: 'psp', dashed: true }];
    const frames = flow(nodes, edges, [
        { caption: 'Checkout asks to charge £30, sending an idempotency key, k-91. The payment service creates a PENDING record; a UNIQUE constraint on the key means there can only ever be one.', hot: ['client>pay', 'pay>db'], packets: [{ id: 'r', label: '£30 · k-91', at: 'pay' }], badges: { db: 'k-91 PENDING' } },
        { caption: 'It calls the payment provider, which handles the card details — you never store raw card numbers.', hot: ['pay>psp'], packets: [{ id: 'r', label: 'charge £30', at: ['pay', 'psp', 0.5] }], badges: { db: 'k-91 PENDING' } },
        { caption: 'The call times out. Was the card charged or not? Unknown. Checkout retries — with the SAME key.', bad: ['psp'], hot: ['client>pay'], packets: [{ id: 'r', label: 'retry · k-91', at: 'pay', color: C.red }], badges: { db: 'k-91 PENDING' } },
        { caption: 'The unique key finds the existing payment, so the service does NOT charge again — it returns the current status. No double charge.', hot: ['pay>db'], ok: ['db'], packets: [{ id: 'r', label: 'already k-91', at: ['pay', 'db', 0.5] }], badges: { db: 'k-91 PENDING' } },
        { caption: 'The provider\'s webhook arrives: succeeded. In ONE transaction the status becomes SUCCEEDED and balanced double-entry ledger rows are written. An outbox event tells the order service.', ok: ['psp', 'db'], hot: ['pay>orders'], packets: [{ id: 'w', label: 'succeeded', at: ['pay', 'psp', 0.5], color: C.green }], badges: { db: 'k-91 SUCCEEDED' } },
        { caption: 'Every night a reconciliation job compares your ledger with the provider\'s settlement file, and flags anything that doesn\'t match.', hot: ['recon>db', 'recon>psp'], lit: ['recon'], badges: { db: 'ledger balanced ✓' } },
    ]);
    return { title: 'Payments: idempotency keys, a ledger, and reconciliation', variants: [{ label: 'A timeout, safely', frames }] };
};

// ============ sd8-t9 · Search autocomplete ============

const autocomplete = (): AnimationSpec => {
    const counts: Record<string, number> = { car: 90, cat: 70, cart: 40, cab: 25, dog: 60, door: 30 };
    const words = Object.keys(counts);
    // Build the trie with the top-2 completions stored at every node.
    const nodes = new Map<string, string[]>();
    for (const w of words) for (let i = 1; i <= w.length; i++) nodes.set(w.slice(0, i), []);
    for (const prefix of nodes.keys()) nodes.set(prefix, words.filter(w => w.startsWith(prefix)).sort((a, b) => counts[b] - counts[a]).slice(0, 2));
    const layout: Record<string, [number, number]> = { c: [110, 50], ca: [110, 104], car: [56, 158], cat: [110, 158], cab: [164, 158], cart: [56, 210], d: [290, 50], do: [290, 104], dog: [250, 158], doo: [330, 158], door: [330, 210] };
    const draw = (path_: string[], showTop: boolean): Part => [
        circle('root', 200, 18, 11, { fill: tint(C.grey, 0.3), stroke: C.grey, sw: 1.5, text: '·', size: 10 }),
        Object.entries(layout).map(([p, [x, y]]) => {
            const parent = p.length === 1 ? [200, 18] : layout[p.slice(0, -1)];
            const on = path_.includes(p);
            return [
                line(`e${p}`, parent[0], parent[1] + 11, x, y - 12, { stroke: on ? C.amber : C.dim, sw: on ? 2.5 : 1.5 }),
                circle(`n${p}`, x, y, 12, { fill: tint(on ? C.amber : C.violet, on ? 0.55 : 0.2), stroke: on ? C.amber : C.violet, sw: 1.5, text: p.slice(-1), size: 11, weight: 800, mono: true }),
                showTop && on && p === path_[path_.length - 1] && rect(`top${p}`, x + 16, y - 10, 92, 20, { rx: 6, fill: tint(C.green, 0.4), stroke: C.green, sw: 1, text: `top: ${nodes.get(p)!.join(', ')}`, size: 9, weight: 700, mono: true }),
            ];
        }),
    ];
    const frames: Frame[] = [
        frame('Searches are logged and counted. The serving side is an in-memory trie: each node is a prefix, and each node STORES its top completions, worked out in advance.', [draw([], false)]),
        frame('The user types "c". Walk one step down from the root…', [draw(['c'], true)]),
        frame(`…"ca": one more step. The node already holds the answer — ${nodes.get('ca')!.join(', ')} — so no subtree search is needed at request time.`, [draw(['c', 'ca'], true)]),
        frame('The data pipeline runs offline: count the logged searches every hour or day, rebuild the trie, and swap the new one in. Clients wait for a pause in typing, and common prefixes are cached at the edge.', [draw([], false), label('pipe', 120, 232, 'logs → counts → rebuild → swap', C.cyan, { size: 10 })]),
    ];
    return { title: 'Autocomplete: walk the prefix; the answer is already stored there', variants: [{ label: 'Typing "ca"', frames }] };
};

// ============ sd8-t10 · Leaderboard ============

const leaderboard = (): AnimationSpec => {
    const start: [string, number][] = [['Zara', 980], ['Omar', 940], ['Lia', 910], ['Kai', 870], ['Noa', 820], ['Eli', 760]];
    const sorted = (list: [string, number][]) => [...list].sort((a, b) => b[1] - a[1]);
    const updated: [string, number][] = start.map(([n, s]) => [n, n === 'Noa' ? s + 140 : s]);
    const board = (list: [string, number][], hot: string | null, top: number) => sorted(list).map(([n, s], i) => rect(`p${n}`, 90, 20 + i * 31, 220, 26, {
        rx: 6, fill: tint(n === hot ? C.amber : i < top ? C.green : C.blue, n === hot ? 0.5 : i < top ? 0.35 : 0.12), stroke: n === hot ? C.amber : i < top ? C.green : C.faint, sw: n === hot ? 2.5 : 1.2,
        text: `#${i + 1} · ${n} · ${s}`, size: 11, weight: 700, mono: true,
    }));
    const rank = sorted(updated).findIndex(([n]) => n === 'Noa') + 1;
    const frames: Frame[] = [
        frame('Scores live in a Redis sorted set: members kept in score order, so finding the top N or anyone\'s rank takes logarithmic time — no sorting on every request.', [board(start, null, 0)]),
        frame('Noa scores 140 points. The game service saves the score durably, then updates the sorted set (ZINCRBY). Noa\'s entry moves up on its own — nothing else is re-sorted.', [board(updated, 'Noa', 0)]),
        frame('Top 3: ZREVRANGE 0 2 reads the first three members straight off the top.', [board(updated, null, 3), label('cmd', 90, 228, 'ZREVRANGE board 0 2', C.green, { size: 11 })]),
        frame(`Noa's rank: ZREVRANK gives ${rank - 1}, counting from 0 — so Noa is #${rank}. Keep a separate set per period (daily, weekly) with an expiry.`, [board(updated, 'Noa', 0), label('cmd', 90, 228, `ZREVRANK board Noa → ${rank - 1}`, C.amber, { size: 11 })]),
    ];
    return { title: 'A leaderboard on a sorted set: updates and ranks in log time', variants: [{ label: 'A score update', frames }] };
};

// ============ sd8-t11 · Distributed cache ============

const distributedCache = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 100, w: 74, label: 'client lib', color: C.cyan, size: 10 },
        { id: 'n1', x: 170, y: 20, w: 90, label: 'node A', kind: 'store', color: C.blue },
        { id: 'n2', x: 170, y: 100, w: 90, label: 'node B', kind: 'store', color: C.blue },
        { id: 'n3', x: 170, y: 180, w: 90, label: 'node C', kind: 'store', color: C.blue },
        { id: 'r2', x: 304, y: 150, w: 90, label: 'B replica', kind: 'store', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'n1' }, { from: 'client', to: 'n2' }, { from: 'client', to: 'n3' }, { from: 'n2', to: 'r2' }, { from: 'client', to: 'r2', dashed: true }];
    const frames = flow(nodes, edges, [
        { caption: 'The client library hashes each key onto a consistent-hash ring (with virtual nodes) to find its node — no central lookup.', lit: ['client'] },
        { caption: 'user:42 hashes to node B. Each node is an in-memory hash table with LRU eviction and TTL expiry.', hot: ['client>n2'], packets: [{ id: 'k', label: 'get user:42', at: ['client', 'n2', 0.55] }], ok: ['n2'] },
        { caption: 'Each shard is copied to a replica, so a node\'s data isn\'t lost with it.', hot: ['n2>r2'], packets: [{ id: 'c', label: 'copy', at: ['n2', 'r2', 0.5] }] },
        { caption: 'Node B dies. Cluster membership (from a config service, or gossip between nodes) marks it down, and its replica takes over its keys.', bad: ['n2'], lit: ['r2'], hot: ['client>r2'], packets: [{ id: 'k', label: 'get user:42', at: ['client', 'r2', 0.6] }] },
        { caption: 'Adding a node moves only a small share of keys — the consistent-hashing property. Very hot keys get extra copies, and a lock stops a stampede of misses all reloading the same key.', ok: ['n1', 'n3', 'r2'], dim: ['n2'] },
    ]);
    return { title: 'A distributed cache: hash to a node, replicate, fail over', variants: [{ label: 'Routing and failover', frames }] };
};

// ============ sd9-t1 · RAG assistant ============

const rag = (): AnimationSpec => {
    const chain = (steps: string[], on: number, y = 40, color: string = C.cyan): Part => steps.map((s, i) => rect(`c${i}`, 8 + (i % 3) * 130, y + Math.floor(i / 3) * 50, 122, 36, {
        rx: 8, fill: tint(i === on ? C.amber : i < on ? C.green : color, i === on ? 0.5 : i < on ? 0.25 : 0.1), stroke: i === on ? C.amber : i < on ? C.green : C.faint, sw: i === on ? 2.5 : 1.2,
        text: s, size: 10, weight: 700,
    }));
    const ingestSteps = ['parse document', 'clean', 'chunk (with overlap)', 'embed each chunk', 'store + permissions', 're-run on change'];
    const ingest: Frame[] = [
        frame('Ingestion runs whenever a document changes. First, parse it — PDF, wiki page, slides — into plain text.', [chain(ingestSteps, 0)]),
        frame('Clean it, then split it into chunks of a few hundred words, overlapping a little so no idea is cut in half.', [chain(ingestSteps, 2)]),
        frame('Turn each chunk into an embedding — a vector of numbers where similar meanings sit close together.', [chain(ingestSteps, 3)]),
        frame('Store the vectors in a vector store, WITH metadata: the source, and who is allowed to see it. When the document changes, the whole pipeline runs again for it.', [chain(ingestSteps, 4)]),
    ];
    const querySteps = ['rewrite question', 'hybrid search', 'filter: permissions', 're-rank', 'prompt + top chunks', 'LLM answers + cites'];
    const query: Frame[] = [
        frame('A question arrives: "How many days of leave do I get?" First rewrite it using the conversation so far, so it stands on its own.', [chain(querySteps, 0, 40, C.violet)]),
        frame('Hybrid retrieval: vector search (meaning) plus keyword search (exact terms), filtered to documents THIS user may see.', [chain(querySteps, 2, 40, C.violet)]),
        frame('A re-ranker scores the candidates more carefully, and the best few chunks go into the prompt.', [chain(querySteps, 4, 40, C.violet)]),
        frame('The LLM streams an answer that cites its sources [1][2]. Retrieved text is checked for prompt injection, every step is traced, and a golden set of questions is re-run to catch regressions.', [chain(querySteps, 6, 40, C.violet), label('ans', 10, 200, '"25 days a year [1], plus bank holidays [2]."', C.green, { size: 11 })]),
    ];
    return { title: 'RAG: index the documents, then retrieve, re-rank and answer with sources', variants: [{ label: 'Ingestion', frames: ingest }, { label: 'Answering', frames: query }] };
};

// ============ sd9-t2 · Recommendation system ============

const recommendations = (): AnimationSpec => {
    const stages: [string, string, number, string][] = [
        ['all items', 'millions', 360, C.grey],
        ['candidates', '~1,000', 250, C.cyan],
        ['ranked', 'scored', 160, C.violet],
        ['shown', '10', 90, C.green],
    ];
    const funnel = (upTo: number): Part => stages.slice(0, upTo + 1).map(([name, n, w, color], i) => rect(`f${i}`, 200 - w / 2, 30 + i * 46, w, 36, {
        rx: 8, fill: tint(color, i === upTo ? 0.45 : 0.2), stroke: color, sw: i === upTo ? 2.5 : 1.2, text: `${name} · ${n}`, size: 11, weight: 800,
    }));
    const frames: Frame[] = [
        frame('Scoring millions of items for every request with a heavy model is far too slow. So recommendations come in stages.', [funnel(0)]),
        frame('Candidate generation: quickly gather about 1,000 items from several cheap sources — embedding similarity (approximate nearest neighbours), "bought together", popular items.', [funnel(1)]),
        frame('Ranking: a richer model scores just those candidates, using user, item and context features from a feature store.', [funnel(2)]),
        frame('Re-ranking applies business rules — variety, freshness, nothing already seen — and the top 10 are shown. Every impression and click is logged to train the next model, and A/B tests measure the real effect.', [funnel(3)]),
    ];
    return { title: 'Recommendations: a cheap wide net, then a careful ranking', variants: [{ label: 'The funnel', frames }] };
};

// ============ sd9-t3 · Fraud detection ============

const fraud = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'txn', x: 6, y: 96, w: 74, h: 42, label: 'payment\n£950', kind: 'client', color: C.cyan, size: 10 },
        { id: 'score', x: 120, y: 92, w: 96, h: 50, label: 'scoring\nservice', color: C.blue, size: 10 },
        { id: 'fs', x: 120, y: 14, w: 96, h: 42, label: 'feature\nstore', kind: 'store', color: C.violet, size: 10 },
        { id: 'stream', x: 260, y: 14, w: 134, h: 42, label: 'stream: counts\nlast 10 min', kind: 'queue', color: C.amber, size: 9 },
        { id: 'decide', x: 260, y: 96, w: 134, h: 42, label: 'rules + model\n→ decision', color: C.pink, size: 10 },
        { id: 'review', x: 260, y: 186, w: 134, label: 'analyst review', color: C.amber, size: 10 },
        { id: 'log', x: 120, y: 186, w: 96, label: 'decision log', kind: 'store', color: C.green, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'txn', to: 'score' }, { from: 'score', to: 'fs' }, { from: 'stream', to: 'fs' }, { from: 'score', to: 'decide' }, { from: 'decide', to: 'review' }, { from: 'score', to: 'log' }];
    const frames = flow(nodes, edges, [
        { caption: 'A £950 card payment must be approved or stopped in milliseconds. It goes to a scoring service.', hot: ['txn>score'], packets: [{ id: 't', label: '£950', at: ['txn', 'score', 0.5] }] },
        { caption: 'Real-time features are fetched from a feature store, kept fresh by a stream processor: 6 payments in the last 10 minutes, 4,000 km from the usual place, a new device.', hot: ['score>fs', 'stream>fs'], lit: ['fs', 'stream'], badges: { stream: '6 in 10 min' } },
        { caption: 'Hand-written rules and an ML model (often gradient-boosted trees) both look at the features. The model scores this one 0.91.', hot: ['score>decide'], lit: ['decide'], badges: { decide: 'score 0.91' } },
        { caption: 'Thresholds turn the score into a decision, tuned by what each mistake costs: above 0.9 block; 0.6–0.9 send to an analyst; below that approve. This one is blocked and queued for review.', bad: ['decide'], hot: ['decide>review'], lit: ['review'], badges: { decide: 'block' } },
        { caption: 'Every decision and its features are logged. Weeks later, chargebacks arrive as the true labels; they are joined to the log to retrain the model, and drift is watched.', hot: ['score>log'], ok: ['log'], badges: { log: '+ labels later' } },
    ]);
    return { title: 'Fraud scoring in real time, and learning from the outcomes', variants: [{ label: 'One payment', frames }] };
};

// ============ sd9-t4 · LLM serving ============

const llmServing = (): AnimationSpec => {
    // Four GPU batch slots; each request needs some number of decoding steps.
    const lengths: [string, number][] = [['A', 3], ['B', 6], ['C', 2], ['D', 5], ['E', 3], ['F', 2]];
    const slots = 4;
    const schedule = (continuous: boolean) => {
        const free = Array.from({ length: slots }, () => 0);
        const placed: { id: string; slot: number; start: number; end: number }[] = [];
        let batchStart = 0;
        lengths.forEach(([id, len], i) => {
            let slot: number;
            let start: number;
            if (continuous) {
                slot = free.indexOf(Math.min(...free));
                start = free[slot];
            } else {
                // Static batching: a new batch starts only when the whole previous batch is done.
                if (i % slots === 0 && i > 0) batchStart = Math.max(...free);
                slot = i % slots;
                start = batchStart;
            }
            free[slot] = start + len;
            placed.push({ id, slot, start, end: start + len });
        });
        return { placed, total: Math.max(...placed.map(p => p.end)) };
    };
    const unit = 26;
    const lanes = (continuous: boolean, upTo: number): Part => {
        const { placed, total } = schedule(continuous);
        return [
            Array.from({ length: slots }, (_, s) => [
                text(`sl${s}`, 50, 52 + s * 36, `slot ${s + 1}`, { size: 10, fill: C.grey, weight: 700, anchor: 'end' }),
                line(`ln${s}`, 58, 52 + s * 36, 380, 52 + s * 36, { stroke: C.faint, sw: 1 }),
            ]),
            placed.slice(0, upTo).map(p => rect(`r${p.id}`, 60 + p.start * unit, 40 + p.slot * 36, p.end * unit - p.start * unit - 3, 24, {
                rx: 5, fill: tint(continuous ? C.green : C.violet, 0.45), stroke: continuous ? C.green : C.violet, sw: 1.5, text: p.id, size: 11, weight: 800, mono: true,
            })),
            upTo >= placed.length && label('tot', 60, 200, `all done after ${total} steps`, continuous ? C.green : C.amber, { size: 12 }),
        ];
    };
    const { total: tStatic } = schedule(false);
    const { total: tCont } = schedule(true);
    const batching: Frame[] = [
        frame('A GPU serves several requests at once, in a batch — here 4 slots. Each answer takes a different number of decoding steps.', [lanes(false, 0)]),
        frame('Static batching: requests A–D start together. Short ones finish early, but their slots sit idle until the LONGEST one is done.', [lanes(false, 4)]),
        frame(`Only then can E and F start. Everything is done after ${tStatic} steps, with a lot of wasted GPU time.`, [lanes(false, 6)]),
        frame(`Continuous batching: the moment any request finishes, a waiting one takes its slot. Same work, done after ${tCont} steps — and short requests aren't stuck behind long ones. A paged KV cache makes the memory side of this work.`, [lanes(true, 6)]),
    ];
    const nodes: FNode[] = [
        { id: 'apps', x: 6, y: 100, w: 64, label: 'teams', kind: 'client', color: C.cyan, size: 10 },
        { id: 'gw', x: 100, y: 94, w: 86, h: 46, label: 'gateway\n+ router', color: C.blue, size: 10 },
        { id: 'small', x: 230, y: 40, w: 100, h: 42, label: 'small model\nGPU pool', color: C.violet, size: 10 },
        { id: 'large', x: 230, y: 150, w: 100, h: 42, label: 'large model\nGPU pool', color: C.violet, size: 10 },
        { id: 'scale', x: 340, y: 96, w: 54, h: 42, label: 'auto-\nscaler', color: C.amber, size: 9 },
    ];
    const edges: FEdge[] = [{ from: 'apps', to: 'gw' }, { from: 'gw', to: 'small' }, { from: 'gw', to: 'large' }, { from: 'scale', to: 'small', dashed: true }, { from: 'scale', to: 'large', dashed: true }];
    const platform = flow(nodes, edges, [
        { caption: 'The gateway authenticates each team, enforces quotas and rate limits, and routes each request to a pool of servers for the right model.', hot: ['apps>gw'], lit: ['gw'], packets: [{ id: 'q', label: 'prompt', at: ['apps', 'gw', 0.5] }] },
        { caption: 'Easy requests can go to a small, cheap model; hard ones to the large model.', hot: ['gw>small'], packets: [{ id: 'q', label: 'easy', at: ['gw', 'small', 0.6] }] },
        { caption: 'Each pool scales on queue length and latency. Responses stream back token by token; repeated system prompts reuse cached work (prefix caching).', hot: ['scale>large'], lit: ['scale', 'large'], badges: { large: '+1 GPU' } },
    ]);
    return { title: 'LLM serving: keep the GPUs busy, route and scale per model', variants: [{ label: 'Continuous batching', frames: batching }, { label: 'The platform', frames: platform }] };
};

// ============ sd9-t5 · ML training and feature pipeline ============

const mlPipeline = (): AnimationSpec => {
    const steps = ['ingest', 'validate data', 'build features', 'train', 'evaluate\nvs current', 'register', 'canary deploy', 'monitor drift'];
    const pipe = (on: number, bad: number | null = null): Part => steps.map((s, i) => rect(`p${i}`, 8 + (i % 4) * 98, 40 + Math.floor(i / 4) * 80, 90, 44, {
        rx: 8, fill: tint(i === bad ? C.red : i === on ? C.amber : i < on ? C.green : C.blue, i === on || i === bad ? 0.5 : i < on ? 0.25 : 0.08),
        stroke: i === bad ? C.red : i === on ? C.amber : i < on ? C.green : C.faint, sw: i === on || i === bad ? 2.5 : 1.2, text: s, size: 10, weight: 700,
    }));
    const frames: Frame[] = [
        frame('An orchestrated pipeline (Airflow, say) replaces "someone copies the model file". It starts by ingesting new data.', [pipe(0)]),
        frame('Validate the data before training on it: missing columns, odd values, a sudden drop in rows. Bad data would stop the pipeline here — not after a bad model ships.', [pipe(1)]),
        frame('Features come from a feature store: one definition per feature, used for training (with point-in-time correct joins) and for serving — so the two never disagree.', [pipe(2)]),
        frame('Train, then evaluate against the model in production. Only a better model is registered.', [pipe(4)]),
        frame('Deploy carefully — a canary takes a small share of traffic first — then monitor data drift, prediction drift and business metrics.', [pipe(7)]),
        frame('When drift is detected (or on a schedule), the whole pipeline runs again: retraining is a loop, not a one-off.', [pipe(8), label('loop', 8, 214, 'drift → retrain → evaluate → deploy', C.amber, { size: 11 })]),
    ];
    return { title: 'An ML pipeline: validate, train, compare, deploy carefully, watch', variants: [{ label: 'One run', frames }] };
};

export const phase89Animations: Record<string, () => AnimationSpec> = {
    'sd8-t1': urlShortener,
    'sd8-t2': distributedLimiter,
    'sd8-t3': notifications,
    'sd8-t4': chatApp,
    'sd8-t5': newsFeed,
    'sd8-t6': videoStreaming,
    'sd8-t7': rideHailing,
    'sd8-t8': payments,
    'sd8-t9': autocomplete,
    'sd8-t10': leaderboard,
    'sd8-t11': distributedCache,
    'sd9-t1': rag,
    'sd9-t2': recommendations,
    'sd9-t3': fraud,
    'sd9-t4': llmServing,
    'sd9-t5': mlPipeline,
};
