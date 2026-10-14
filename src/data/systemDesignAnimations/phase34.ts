import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, circle, frame, line, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { flow, label, type FEdge, type FNode } from './flow';

// System Design Phase 3 (data) and Phase 4 (distributed systems). Hash
// placements, moved-key counts, Snowflake IDs and posting lists are computed.

/** A small, stable string hash (FNV-1a plus a final mix), so placements look random but never change. */
const fnv = (value: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    // Spread the bits, so similar strings land far apart.
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
};

// ============ sd3-t1 · SQL vs NoSQL ============

const choosingDb = (): AnimationSpec => {
    const card = (id: string, x: number, y: number, title: string, color: string, body: Part, on: boolean): Part => [
        rect(`${id}-card`, x, y, 124, 86, { rx: 9, fill: tint(color, on ? 0.18 : 0.06), stroke: on ? color : C.faint, sw: on ? 2 : 1 }),
        text(`${id}-t`, x + 62, y + 12, title, { size: 10, fill: on ? color : C.dim, weight: 800 }),
        on && body,
    ];
    const mono = (id: string, x: number, y: number, value: string, color: string = C.ink) => text(id, x, y, value, { size: 9, fill: color, weight: 700, mono: true, anchor: 'start' });
    const shapes = (on: number) => [
        card('rel', 8, 30, 'Relational (SQL)', C.green, [mono('r1', 16, 54, 'users ⋈ orders'), mono('r2', 16, 70, 'JOIN, transactions'), mono('r3', 16, 86, 'flexible queries', C.grey)], on === 0 || on === 9),
        card('kv', 138, 30, 'Key-value', C.pink, [mono('k1', 146, 54, 'cart:42 → {…}'), mono('k2', 146, 70, 'one key, one value'), mono('k3', 146, 86, 'very fast lookups', C.grey)], on === 1 || on === 9),
        card('doc', 268, 30, 'Document', C.amber, [mono('d1', 276, 54, '{name, specs: {…}}'), mono('d2', 276, 70, 'fields vary'), mono('d3', 276, 86, 'self-contained', C.grey)], on === 2 || on === 9),
        card('wide', 73, 126, 'Wide-column', C.cyan, [mono('w1', 81, 150, 'chat 9 | t1 t2 t3…'), mono('w2', 81, 166, 'huge write volume'), mono('w3', 81, 182, 'read by one key', C.grey)], on === 3 || on === 9),
        card('graph', 203, 126, 'Graph', C.violet, [circle('g1', 236, 160, 7, { fill: C.violet }), circle('g2', 266, 148, 7, { fill: C.violet }), circle('g3', 290, 172, 7, { fill: C.violet }), line('ge1', 236, 160, 266, 148, { stroke: C.violet, sw: 1.5 }), line('ge2', 266, 148, 290, 172, { stroke: C.violet, sw: 1.5 }), mono('g4', 211, 192, 'friends of friends', C.grey)], on === 4 || on === 9),
    ];
    const frames: Frame[] = [
        frame('Start from the data and its main queries, not from the product names. There are five broad shapes of database.', [shapes(9)]),
        frame('Need joins, transactions and flexible queries over structured data — "a user\'s last 20 orders", "revenue by month"? Start with SQL.', [shapes(0)]),
        frame('One simple lookup by key dominates, and must be extremely fast or enormous — a shopping cart by id? A key-value store.', [shapes(1)]),
        frame('Each record is a self-contained document whose fields vary from one to the next? A document store.', [shapes(2)]),
        frame('Massive writes, always read by one key in order — "all messages in a chat, by time"? A wide-column store.', [shapes(3)]),
        frame('The questions are about relationships — "friends of friends who like X"? A graph database.', [shapes(4)]),
        frame('Real systems mix them. An online shop: orders and payments in PostgreSQL, carts in a key-value store, product search in Elasticsearch, "people also bought" precomputed or in a graph.', [shapes(9)]),
    ];
    return { title: 'Choosing a database: match the store to the data and its queries', variants: [{ label: 'Five shapes', frames }] };
};

// ============ sd3-t2 · ACID transactions ============

const acid = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'tx', x: 8, y: 30, w: 120, h: 40, label: 'transaction', color: C.cyan },
        { id: 'a', x: 150, y: 30, w: 96, label: 'account A', kind: 'store', color: C.blue },
        { id: 'b', x: 296, y: 30, w: 96, label: 'account B', kind: 'store', color: C.blue },
        { id: 'wal', x: 180, y: 140, w: 212, h: 40, label: 'write-ahead log (on disk)', kind: 'store', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'tx', to: 'a' }, { from: 'tx', to: 'wal' }];
    const commit = flow(nodes, edges, [
        { caption: 'Transfer £100 from A to B. BEGIN starts a transaction: from here on it is all or nothing.', badges: { a: '£300', b: '£50' }, lit: ['tx'] },
        { caption: 'Take £100 from A — only if A has it (a rule the database checks: Consistent). Other users can\'t see this yet (Isolated).', badges: { a: '£200 (pending)', b: '£50' }, hot: ['tx>a'], lit: ['a'] },
        { caption: 'Add £100 to B. Each change is also written to a write-ahead log on disk.', badges: { a: '£200 (pending)', b: '£150 (pending)' }, lit: ['b'], hot: ['tx>wal'], packets: [{ id: 'l', label: 'A −100, B +100', at: 'wal' }] },
        { caption: 'COMMIT: the log is saved to disk, and only then is success reported. Both changes become visible together (Atomic), and survive a crash (Durable).', badges: { a: '£200', b: '£150' }, ok: ['a', 'b', 'wal'], packets: [{ id: 'l', label: 'COMMIT', at: 'wal', color: C.green }] },
    ]);
    const crash = flow(nodes, edges, [
        { caption: 'Same transfer. Take £100 from A…', badges: { a: '£200 (pending)', b: '£50' }, lit: ['a'], hot: ['tx>a'] },
        { caption: '…and the server crashes before COMMIT.', bad: ['tx'], badges: { a: '£200 (pending)', b: '£50' } },
        { caption: 'On restart, the database replays its log. This transaction never committed, so every change in it is undone: A is back to £300. No money vanished — Atomic.', ok: ['a'], hot: ['tx>wal'], badges: { a: '£300', b: '£50' }, packets: [{ id: 'l', label: 'no COMMIT → undo', at: 'wal', color: C.red }] },
    ]);
    return { title: 'A transaction: all of it happens, or none of it does', variants: [{ label: 'COMMIT', frames: commit }, { label: 'Crash before COMMIT', frames: crash }] };
};

// ============ sd3-t3 · Database indexing ============

const indexing = (): AnimationSpec => {
    const emails = ['zoe@x.io', 'amy@x.io', 'raj@x.io', 'ben@x.io', 'kim@x.io', 'eve@x.io', 'tom@x.io', 'lia@x.io', 'max@x.io'];
    const target = 'kim@x.io';
    const sorted = [...emails].sort();
    const leaves = [sorted.slice(0, 3), sorted.slice(3, 6), sorted.slice(6)];
    const seps = [leaves[1][0].slice(0, 1), leaves[2][0].slice(0, 1)];
    const rows = (look: (e: string, i: number) => [string, number]) => emails.map((e, i) => {
        const [color, strength] = look(e, i);
        return rect(`row${i}`, 272, 26 + i * 22, 122, 18, { rx: 4, fill: tint(color, strength), stroke: strength > 0.1 ? color : C.faint, sw: 1, text: e, size: 10, weight: 700, mono: true });
    });
    const title = text('tt', 333, 14, 'users table (row order)', { size: 10, fill: C.grey, weight: 700 });
    const tree = (on: 'root' | 'leaf' | 'none'): Part => [
        rect('root', 70, 30, 110, 28, { rx: 7, fill: tint(on === 'root' ? C.amber : C.violet, on === 'root' ? 0.5 : 0.2), stroke: on === 'root' ? C.amber : C.violet, sw: 2, text: `< ${seps[0]} | < ${seps[1]} | rest`, size: 10, weight: 700, mono: true }),
        leaves.map((leaf, k) => {
            const hit = on === 'leaf' && leaf.includes(target);
            return [
                line(`rl${k}`, 100 + k * 25, 58, 10 + k * 86 + 39, 96, { stroke: hit || (on === 'root' && leaf.includes(target)) ? C.amber : C.dim, sw: 2 }),
                rect(`leaf${k}`, 10 + k * 86, 96, 78, 64, { rx: 7, fill: tint(hit ? C.amber : C.cyan, hit ? 0.25 : 0.1), stroke: hit ? C.amber : C.cyan, sw: 1.5 }),
                ...leaf.map((e, j) => text(`le${k}-${j}`, 49 + k * 86, 110 + j * 18, e.replace('@x.io', '@…'), { size: 10, fill: hit && e === target ? C.amber : C.ink, weight: 700, mono: true })),
            ];
        }),
    ];
    const hitRow = emails.indexOf(target);
    // Down out of the middle leaf, under the last leaf, then up to the row.
    const pointer = path('ptr', [[135, 160], [135, 176], [266, 176], [266, 26 + hitRow * 22 + 9], [270, 26 + hitRow * 22 + 9]], { stroke: C.amber, sw: 2, arrow: true });
    const frames: Frame[] = [
        frame(`WHERE email = '${target}' with no index: the database reads every row and checks it — a full table scan.`, [title, rows(() => [C.amber, 0.35]), label('scan', 10, 110, `read all ${emails.length} rows`, C.red, { size: 13 })]),
        frame('CREATE INDEX on email builds a B-tree: the emails, sorted, in a shallow tree. Leaves hold every email with a pointer to its row; the root holds signposts.', [title, rows(() => [C.blue, 0.12]), tree('none')]),
        frame(`Start at the root: "${target}" sorts between the signposts, so take the middle branch. Each step down cuts the search space enormously.`, [title, rows(() => [C.blue, 0.12]), tree('root')]),
        frame('In the leaf, find the email, and follow its pointer to the row. With 100 million rows the tree is only 4–5 levels deep: a handful of reads instead of millions.', [title, rows((e) => (e === target ? [C.green, 0.5] : [C.blue, 0.12])), tree('leaf'), pointer]),
        frame('The cost: every INSERT — and every UPDATE of an email — must also update the tree. Indexes make reads fast and writes slower, and they take space.', [title, rows((e) => (e === target ? [C.green, 0.5] : [C.blue, 0.12])), tree('none'), label('cost', 10, 200, 'each write updates every index', C.amber, { size: 12 })]),
    ];
    return { title: 'An index: a sorted tree that finds a row in a few steps', variants: [{ label: 'Find one email', frames }] };
};

// ============ sd3-t4 · Replication ============

const replication = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 100, w: 70, label: 'Client', kind: 'client', color: C.cyan },
        { id: 'leader', x: 130, y: 94, w: 96, h: 46, label: 'Leader', kind: 'store', color: C.amber },
        { id: 'f1', x: 296, y: 30, w: 98, h: 42, label: 'Follower 1\n(sync)', kind: 'store', color: C.blue, size: 10 },
        { id: 'f2', x: 296, y: 164, w: 98, h: 42, label: 'Follower 2\n(async)', kind: 'store', color: C.blue, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'leader' }, { from: 'leader', to: 'f1' }, { from: 'leader', to: 'f2' }, { from: 'client', to: 'f2', dashed: true }];
    const v = (l: string, a: string, b: string) => ({ leader: l, f1: a, f2: b });
    const write = flow(nodes, edges, [
        { caption: 'All writes go to the leader. A user changes their profile name from "Sam" to "Samir".', hot: ['client>leader'], packets: [{ id: 'w', label: 'name = Samir', at: ['client', 'leader', 0.5] }], badges: v('Sam', 'Sam', 'Sam') },
        { caption: 'The leader saves it and adds it to its replication log. Followers read that log and apply the same changes, in the same order.', lit: ['leader'], hot: ['leader>f1', 'leader>f2'], packets: [{ id: 'w', label: 'log #91', at: ['leader', 'f1', 0.5] }], badges: v('Samir', 'Sam', 'Sam') },
        { caption: 'Follower 1 is synchronous: the leader waits for it to confirm before telling the client "done". Safe — but every write waits.', ok: ['f1'], packets: [{ id: 'w', label: 'done', at: ['client', 'leader', 0.5], color: C.green }], badges: v('Samir', 'Samir', 'Sam') },
        { caption: 'Follower 2 is asynchronous and a little behind. The user refreshes, the read goes to follower 2… and shows the OLD name. That is replication lag.', bad: ['f2'], hot: ['client>f2'], packets: [{ id: 'r', label: 'read name', at: ['client', 'f2', 0.5] }], badges: v('Samir', 'Samir', 'Sam (old)') },
        { caption: 'Fix: "read your own writes" — for a short time after a write, send that user\'s reads to the leader. Follower 2 catches up a moment later anyway.', hot: ['client>leader'], ok: ['leader', 'f2'], packets: [{ id: 'r', label: 'read → leader', at: ['client', 'leader', 0.5], color: C.green }], badges: v('Samir', 'Samir', 'Samir') },
    ]);
    const failover = flow(nodes, edges, [
        { caption: 'The leader dies. The followers notice: its heartbeats stop arriving.', bad: ['leader'], badges: v('down', '#91', '#90') },
        { caption: 'Pick the most up-to-date follower — follower 1 has log entry #91 — and promote it to be the new leader.', bad: ['leader'], lit: ['f1'], badges: v('down', 'new leader', '#90') },
        { caption: 'Writes now go to the new leader, and follower 2 copies from it. The system is back, having lost nothing that was confirmed.', ok: ['f1', 'f2'], dim: ['leader'], badges: v('down', 'leader #91', '#91') },
    ]);
    return { title: 'Replication: copies on several machines, and what lag looks like', variants: [{ label: 'Write and lag', frames: write }, { label: 'Failover', frames: failover }] };
};

// ============ sd3-t5 · Partitioning and sharding ============

const sharding = (): AnimationSpec => {
    const shardCount = 3;
    const users = [42, 17, 8, 23];
    const shardOf = (id: number) => fnv(`user:${id}`) % shardCount;
    const nodes: FNode[] = [
        { id: 'app', x: 8, y: 100, w: 92, h: 40, label: 'App\n(router)', color: C.blue },
        ...[0, 1, 2].map(k => ({ id: `s${k}`, x: 270, y: 26 + k * 74, w: 124, h: 40, label: `shard ${k}`, kind: 'store' as const, color: [C.cyan, C.violet, C.pink][k] })),
    ];
    const edges: FEdge[] = [0, 1, 2].map(k => ({ from: 'app', to: `s${k}` }));
    const counts = new Map<number, number[]>();
    const route = flow(nodes, edges, [
        { caption: `One database can't hold all the writes, so the data is split into shards by a key — user_id. A routing rule picks the shard: hash(user_id) % ${shardCount}.` },
        ...users.map(u => {
            const k = shardOf(u);
            counts.set(k, [...(counts.get(k) ?? []), u]);
            const badges = Object.fromEntries([...counts.entries()].map(([s, ids]) => [`s${s}`, ids.map(i => `#${i}`).join(' ')]));
            return { caption: `User ${u}: hash(${u}) % ${shardCount} = ${k}, so all of user ${u}'s data lives on shard ${k}.`, hot: [`app>s${k}`], lit: [`s${k}`], packets: [{ id: 'q', label: `user ${u}`, at: ['app', `s${k}`, 0.55] as [string, string, number] }], badges, hold: 2600 };
        }),
        { caption: `"Show user 42's profile" goes to exactly one shard — fast. That is why the shard key should match the main query.`, hot: [`app>s${shardOf(42)}`], ok: [`s${shardOf(42)}`], packets: [{ id: 'q', label: 'profile 42', at: ['app', `s${shardOf(42)}`, 0.55] }] },
        { caption: '"Count all users who signed up today" has no single key, so it must ask EVERY shard and merge the answers. Cross-shard queries are slow.', hot: ['app>s0', 'app>s1', 'app>s2'], lit: ['s0', 's1', 's2'], packets: [0, 1, 2].map(k => ({ id: `fan${k}`, label: 'count?', at: ['app', `s${k}`, 0.55] as [string, string, number] })) },
    ]);
    const bars = (counts_: number[], hot: number | null) => counts_.map((c, k) => [
        text(`rk${k}`, 80, 70 + k * 50, ['A–H', 'I–Q', 'R–Z'][k], { size: 12, fill: C.ink, weight: 700, mono: true, anchor: 'end' }),
        rect(`rb${k}`, 90, 58 + k * 50, Math.max(4, c * 2), 24, { rx: 4, fill: tint(k === hot ? C.red : C.cyan, 0.5), stroke: 'none' }),
        text(`rv${k}`, 96 + Math.max(4, c * 2), 70 + k * 50, `${c} writes/s`, { size: 10, fill: C.grey, weight: 700, anchor: 'start' }),
    ]);
    const range: Frame[] = [
        frame('Range sharding instead: names A–H on shard 0, I–Q on shard 1, R–Z on shard 2. Neighbouring keys stay together, so range queries are easy.', [bars([30, 34, 32], null)]),
        frame('But traffic is rarely even. A popular stretch of keys — say, new sign-ups whose ids all sort together — lands on one shard: a hot spot. Hash sharding spreads keys evenly, at the cost of range queries.', [bars([24, 106, 22], 1), label('hot', 90, 206, 'one shard does most of the work', C.red, { size: 12 })]),
    ];
    return { title: 'Sharding: split the data by a key, and route each query', variants: [{ label: 'Hash routing', frames: route }, { label: 'Range: hot spots', frames: range }] };
};

// ============ sd3-t6 · Consistent hashing ============

const consistentHashing = (): AnimationSpec => {
    const RING = 360;
    const servers = [{ name: 'A', at: 0 }, { name: 'B', at: 100 }, { name: 'C', at: 190 }, { name: 'D', at: 280 }];
    const added = { name: 'E', at: 72 };
    const owner = (pos: number, list: { name: string; at: number }[]) => {
        const sorted = [...list].sort((a, b) => a.at - b.at);
        return (sorted.find(s => s.at >= pos) ?? sorted[0]).name;
    };
    // 1,000 keys to measure; 16 of them to draw.
    const keys = Array.from({ length: 1000 }, (_, i) => fnv(`key-${i}`));
    const pos = (h: number) => Math.floor((h / 4294967296) * RING);
    const movedRing = keys.filter(h => owner(pos(h), servers) !== owner(pos(h), [...servers, added])).length / keys.length;
    const movedMod = keys.filter(h => h % 4 !== h % 5).length / keys.length;
    const shown = keys.slice(0, 16);
    const colors: Record<string, string> = { A: C.cyan, B: C.violet, C: C.pink, D: C.amber, E: C.green };
    const cx = 130;
    const cy = 128;
    const r = 90;
    const at = (deg: number, rr = r): [number, number] => [cx + rr * Math.sin((deg * Math.PI) / 180), cy - rr * Math.cos((deg * Math.PI) / 180)];
    const ring = (list: { name: string; at: number }[], movedOnly: boolean): Part => [
        circle('ring', cx, cy, r, { fill: 'none', stroke: C.dim, sw: 2 }),
        shown.map((h, i) => {
            const p = pos(h);
            const before = owner(p, servers);
            const now = owner(p, list);
            const [x, y] = at(p, r - 16);
            const moved = before !== now;
            return circle(`k${i}`, x, y, 5, { fill: colors[now], stroke: movedOnly && moved ? C.ink : C.bg, sw: movedOnly && moved ? 2.5 : 1 });
        }),
        list.map(s => {
            const [x, y] = at(s.at, r + 14);
            return circle(`s${s.name}`, x, y, 12, { fill: tint(colors[s.name], 0.6), stroke: colors[s.name], sw: 2, text: s.name, size: 11, weight: 800 });
        }),
    ];
    const side = (lines: [string, string][], x = 250) => lines.map(([v, color], i) => label(`side${i}`, x, 70 + i * 22, v, color, { size: 11, mono: false }));
    const serverColors = [C.cyan, C.violet, C.pink, C.amber, C.green];
    const grid = (n: number, outlineMoved: boolean) => shown.map((h, i) => {
        const now = h % n;
        const moved = outlineMoved && h % 4 !== now;
        return rect(`g${i}`, 30 + (i % 8) * 44, 40 + Math.floor(i / 8) * 44, 36, 32, {
            rx: 6, fill: tint(serverColors[now], 0.45), stroke: moved ? C.ink : serverColors[now], sw: moved ? 2.5 : 1.5, text: `s${now}`, size: 11, weight: 700, mono: true,
        });
    });
    const gridMoved = shown.filter(h => h % 4 !== h % 5).length;
    const modFrames: Frame[] = [
        frame('The simple way to pick a server: hash(key) % N. With 4 servers, each key gets server 0, 1, 2 or 3 — shown on each key.', [grid(4, false), side([['hash(key) % 4', C.ink]], 30).map(sh => ({ ...sh, y: sh.y + 110 }))]),
        frame(`Add one server and N becomes 5: hash(key) % 5 gives most keys a DIFFERENT server (${gridMoved} of these ${shown.length}, outlined). Measured on 1,000 keys: ${Math.round(movedMod * 100)}% move — for a cache, nearly every entry lost at once.`, [grid(5, true), side([['hash(key) % 5', C.ink], [`${Math.round(movedMod * 100)}% of keys move`, C.red]], 30).map(sh => ({ ...sh, y: sh.y + 110 }))]),
    ];
    const ringFrames: Frame[] = [
        frame('Consistent hashing puts servers AND keys on a ring. Each key belongs to the next server clockwise — its colour shows which.', [ring(servers, false), side([['4 servers on the ring', C.ink]])]),
        frame('Add server E. It only takes the keys between itself and the server before it (A). Outlined keys are the ones that moved; every other key stays put.', [ring([...servers, added], true), side([['add server E', C.green], [`${Math.round(movedRing * 100)}% of keys move`, C.green], ['(roughly 1 in 5)', C.grey]])]),
        frame(`Measured on 1,000 keys: ${Math.round(movedRing * 100)}% move with the ring, against ${Math.round(movedMod * 100)}% with % N. Virtual nodes — each server placed at many points — keep the load even.`, [ring([...servers, added], true), side([[`ring: ${Math.round(movedRing * 100)}% move`, C.green], [`% N: ${Math.round(movedMod * 100)}% move`, C.red]])]),
    ];
    return { title: 'Consistent hashing: adding a server moves only a few keys', variants: [{ label: 'hash % N', frames: modFrames }, { label: 'The ring', frames: ringFrames }] };
};

// ============ sd3-t7 · Object storage ============

const objectStorage = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'client', x: 6, y: 100, w: 70, label: 'App', kind: 'client', color: C.cyan },
        { id: 'api', x: 150, y: 30, w: 90, label: 'API', color: C.blue },
        { id: 's3', x: 150, y: 170, w: 90, h: 40, label: 'Object\nstorage', kind: 'store', color: C.teal },
        { id: 'db', x: 304, y: 30, w: 90, label: 'Database', kind: 'store', color: C.green },
        { id: 'cdn', x: 304, y: 170, w: 90, label: 'CDN', color: C.teal },
    ];
    const edges: FEdge[] = [{ from: 'client', to: 'api' }, { from: 'api', to: 's3' }, { from: 'client', to: 's3' }, { from: 'api', to: 'db' }, { from: 'cdn', to: 's3' }];
    const frames = flow(nodes, edges, [
        { caption: 'Databases are bad at holding big files. The app asks your API: "I want to upload a profile photo."', hot: ['client>api'], packets: [{ id: 'p', label: 'upload?', at: ['client', 'api', 0.5] }] },
        { caption: 'The API checks the user, then asks object storage for a pre-signed URL: a link that allows ONE upload, to ONE key, for a few minutes.', hot: ['api>s3'], lit: ['api'], packets: [{ id: 'p', label: 'signed URL', at: ['api', 's3', 0.5] }] },
        { caption: 'The app uploads the file straight to that URL. Your servers never touch the bytes.', hot: ['client>s3'], ok: ['s3'], packets: [{ id: 'f', label: 'avatar.jpg', at: ['client', 's3', 0.55] }] },
        { caption: 'The API saves only a small row: users/42/avatar.jpg, the owner, size and time. The database keeps the key; the storage keeps the file.', hot: ['api>db'], ok: ['db'], badges: { db: 'users/42/avatar.jpg' } },
        { caption: 'To show the photo, the app uses a CDN URL for that key (or a short-lived signed link for private files). Fast downloads, and no load on your servers.', hot: ['cdn>s3'], lit: ['cdn'], packets: [{ id: 'f', label: 'avatar.jpg', at: ['cdn', 's3', 0.5] }] },
    ]);
    return { title: 'Big files go to object storage; the database keeps only the key', variants: [{ label: 'Profile photo upload', frames }] };
};

// ============ sd3-t8 · Search: inverted indexes ============

const stem = (word: string) => word.toLowerCase().replace(/ning$/, '').replace(/s$/, '');

const search = (): AnimationSpec => {
    const docs = ['Red Running Shoes', 'Blue Shoes', 'Red Hat'];
    const index = new Map<string, number[]>();
    docs.forEach((d, i) => d.split(' ').map(stem).forEach(w => index.set(w, [...new Set([...(index.get(w) ?? []), i + 1])])));
    const query = 'red shoes';
    const terms = query.split(' ').map(stem);
    const hits = terms.map(t => index.get(t) ?? []).reduce((a, b) => a.filter(x => b.includes(x)));
    const docList = (lit_: number[]) => docs.map((d, i) => rect(`d${i}`, 8, 34 + i * 34, 150, 26, { rx: 6, fill: tint(lit_.includes(i + 1) ? C.green : C.blue, lit_.includes(i + 1) ? 0.45 : 0.15), stroke: lit_.includes(i + 1) ? C.green : C.faint, sw: 1.5, text: `${i + 1}  ${d}`, size: 10, weight: 700, mono: true }));
    const postings = (upTo: number, hot: string[]) => [...index.entries()].slice(0, upTo).map(([w, ids], k) => [
        rect(`w${w}`, 200, 34 + k * 30, 64, 24, { rx: 12, fill: tint(hot.includes(w) ? C.amber : C.violet, hot.includes(w) ? 0.5 : 0.25), stroke: hot.includes(w) ? C.amber : C.violet, sw: 1.5, text: w, size: 11, weight: 700, mono: true }),
        text(`p${w}`, 274, 46 + k * 30, `→ ${ids.join(', ')}`, { size: 11, fill: C.ink, weight: 700, mono: true, anchor: 'start' }),
    ]);
    const n = index.size;
    const frames: Frame[] = [
        frame(`LIKE '%shoe%' would read every row. A search engine does the work in advance. Three product titles:`, [docList([])]),
        frame('Indexing: split each title into words, lowercase them, and reduce them to stems — "Running" → "run", "Shoes" → "shoe".', [docList([]), postings(3, [])]),
        frame('For each word, keep a posting list: the documents it appears in. This is the inverted index — like a cookbook\'s index of ingredients.', [docList([]), postings(n, [])]),
        frame(`Search "${query}": stem the query the same way (${terms.join(', ')}), then look up each word's list — no scan at all.`, [docList([]), postings(n, terms)]),
        frame(`Intersect the lists: documents with both words → ${hits.join(', ')}. Each match is then scored — rare words that are frequent in this document score higher (TF-IDF, BM25).`, [docList(hits), postings(n, terms)]),
    ];
    return { title: 'An inverted index: from each word to the documents that contain it', variants: [{ label: 'Three products', frames }] };
};

// ============ sd3-t9 · Unique ID generation ============

const snowflake = (): AnimationSpec => {
    const epochOffset = 1_234_567_890n; // milliseconds since the system's chosen start date
    const machine = 37n;
    const make = (ms: bigint, seq: bigint) => (ms << 22n) | (machine << 12n) | seq;
    const ids = [make(epochOffset, 0n), make(epochOffset, 1n), make(epochOffset, 2n), make(epochOffset + 1n, 0n)];
    const field = (id: string, x: number, w: number, title: string, value: string, color: string, on: boolean) => [
        rect(id, x, 70, w, 40, { rx: 6, fill: tint(color, on ? 0.5 : 0.2), stroke: color, sw: on ? 2.5 : 1.5, text: value, size: 11, weight: 700, mono: true }),
        text(`${id}-t`, x + w / 2, 58, title, { size: 10, fill: color, weight: 700 }),
    ];
    const layout = (ms: string, seq: string, hot: string | null) => [
        field('ts', 10, 220, 'timestamp · 41 bits', ms, C.cyan, hot === 'ts'),
        field('mc', 234, 70, 'machine · 10', String(machine), C.violet, hot === 'mc'),
        field('sq', 308, 84, 'sequence · 12', seq, C.amber, hot === 'sq'),
    ];
    const list = (n: number) => ids.slice(0, n).map((id, i) => text(`id${i}`, 200, 140 + i * 20, id.toString(), { size: 12, fill: i === n - 1 ? C.green : C.ink, weight: 700, mono: true }));
    const frames: Frame[] = [
        frame('One auto-increment counter is a bottleneck at scale. A Snowflake ID is built from three parts in one 64-bit number, so every machine can make IDs on its own.', [layout('ms since start', '0', null)]),
        frame(`The timestamp comes first: milliseconds since a chosen start date (${epochOffset.toLocaleString('en-GB')}). Because it leads, later IDs are bigger, so they sort roughly by time.`, [layout(epochOffset.toString(), '0', 'ts'), list(1)]),
        frame(`Then the machine ID, ${machine}, given out when the machine starts — so two machines can never make the same ID.`, [layout(epochOffset.toString(), '0', 'mc'), list(1)]),
        frame('Another ID in the same millisecond: the sequence goes up by one — 0, 1, 2 … up to 4,095. If it runs out, wait for the next millisecond.', [layout(epochOffset.toString(), '2', 'sq'), list(3)]),
        frame('Next millisecond: the timestamp moves on and the sequence starts again at 0. The new ID is bigger than every earlier one — unique, roughly ordered, and made locally.', [layout((epochOffset + 1n).toString(), '0', 'ts'), list(4)]),
    ];
    return { title: 'Snowflake IDs: time, machine and a counter in one 64-bit number', variants: [{ label: 'Building IDs', frames }] };
};

// ============ sd4-t1 · Monolith vs microservices ============

const microservices = (): AnimationSpec => {
    const modules = ['users', 'catalogue', 'orders', 'payments'];
    const mono: Part = [
        rect('mono', 20, 40, 170, 150, { rx: 12, fill: tint(C.blue, 0.1), stroke: C.blue, sw: 2 }),
        text('mono-t', 105, 30, 'one app (monolith)', { size: 11, fill: C.blue, weight: 700 }),
        modules.map((m, i) => rect(`m${m}`, 34, 52 + i * 32, 142, 26, { rx: 6, fill: tint(C.cyan, 0.25), stroke: C.cyan, sw: 1.5, text: m, size: 11, weight: 700, mono: true })),
        rect('monodb', 230, 92, 110, 44, { rx: 12, fill: tint(C.green, 0.25), stroke: C.green, sw: 2, text: 'one database', size: 11, weight: 700 }),
        line('mono-l', 190, 114, 228, 114, { stroke: C.dim, sw: 2 }),
    ];
    const nodes: FNode[] = [
        { id: 'orders', x: 20, y: 100, w: 104, label: 'order service', color: C.amber, size: 10 },
        { id: 'odb', x: 20, y: 186, w: 104, label: 'orders DB', kind: 'store', color: C.green, size: 10 },
        { id: 'bus', x: 160, y: 100, w: 90, label: 'events', kind: 'queue', color: C.violet },
        { id: 'pay', x: 296, y: 50, w: 98, label: 'payments', color: C.cyan },
        { id: 'note', x: 296, y: 150, w: 98, label: 'notifications', color: C.cyan, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'orders', to: 'odb' }, { from: 'orders', to: 'bus' }, { from: 'bus', to: 'pay' }, { from: 'bus', to: 'note' }];
    const frames: Frame[] = [
        frame('A monolith: one app, deployed as one piece, with one database. Simple to build, test and deploy — a good place to start, if it is well organised inside.', [mono]),
        ...flow(nodes, edges, [
            { caption: 'Split gradually, around business capabilities. Carve out ONE service at a time — orders first — with its own database. Other services may only use its API or its events.', show: ['orders', 'odb'], lit: ['orders'] },
            { caption: 'When an order is placed, the order service publishes "order placed" and moves on. Things that can happen later go through events…', hot: ['orders>bus'], packets: [{ id: 'e', label: 'order placed', at: ['orders', 'bus', 0.6] }] },
            { caption: '…and the payment and notification services react on their own. Each team deploys and scales its service independently.', hot: ['bus>pay', 'bus>note'], ok: ['pay', 'note'], packets: [{ id: 'e', label: 'order placed', at: 'bus' }] },
            { caption: 'The price: a function call is now a network call that can be slow or fail, data is spread across databases, and you need tracing, a gateway and a pipeline per service.', bad: ['pay'], packets: [{ id: 'e', label: 'timeout?', at: ['bus', 'pay', 0.5], color: C.red }] },
        ]),
    ];
    return { title: 'From one app to services — one boundary at a time', variants: [{ label: 'Splitting a shop', frames }] };
};

// ============ sd4-t2 · Sagas and the outbox ============

const sagas = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'orch', x: 8, y: 96, w: 104, h: 44, label: 'checkout\norchestrator', color: C.blue, size: 10 },
        { id: 'stock', x: 290, y: 30, w: 104, label: 'stock', color: C.violet },
        { id: 'pay', x: 290, y: 100, w: 104, label: 'payment', color: C.violet },
        { id: 'ship', x: 290, y: 170, w: 104, label: 'shipping', color: C.violet },
    ];
    const edges: FEdge[] = [{ from: 'orch', to: 'stock' }, { from: 'orch', to: 'pay' }, { from: 'orch', to: 'ship' }];
    const saga = flow(nodes, edges, [
        { caption: 'Across services there is no single ACID transaction. A saga runs the steps one by one, each a local transaction: reserve stock, charge the card, create the shipment.', lit: ['orch'] },
        { caption: 'Step 1: "reserve stock". The stock service reserves it and replies OK.', hot: ['orch>stock'], ok: ['stock'], packets: [{ id: 's', label: 'reserve', at: ['orch', 'stock', 0.6] }] },
        { caption: 'Step 2: "charge the card". The card is declined.', hot: ['orch>pay'], ok: ['stock'], bad: ['pay'], packets: [{ id: 's', label: 'charge', at: ['orch', 'pay', 0.6] }] },
        { caption: 'So the orchestrator runs compensations, in reverse order, for every step that succeeded: "release the stock".', hot: ['orch>stock'], lit: ['stock'], bad: ['pay'], packets: [{ id: 's', label: 'release', at: ['orch', 'stock', 0.6], color: C.amber }] },
        { caption: 'The order is marked FAILED and the user is told. Shipping was never asked. Every service is back in a consistent state — without a global lock.', bad: ['orch'], dim: ['ship'], badges: { orch: 'FAILED' } },
    ]);
    const outNodes: FNode[] = [
        { id: 'svc', x: 8, y: 100, w: 92, label: 'order service', color: C.blue, size: 10 },
        { id: 'db', x: 140, y: 40, w: 120, h: 50, label: 'orders + outbox\n(one transaction)', kind: 'store', color: C.green, size: 10 },
        { id: 'relay', x: 140, y: 160, w: 120, label: 'relay', color: C.amber },
        { id: 'kafka', x: 302, y: 160, w: 92, label: 'Kafka', kind: 'queue', color: C.violet },
    ];
    const outEdges: FEdge[] = [{ from: 'svc', to: 'db' }, { from: 'relay', to: 'db' }, { from: 'relay', to: 'kafka' }];
    const outbox = flow(outNodes, outEdges, [
        { caption: '"Save the order AND publish an event" is two systems — a crash in between loses the event. The outbox pattern fixes that.', lit: ['svc'] },
        { caption: 'In ONE local transaction, the service writes the order row and an "OrderCreated" row into an outbox table. Both are saved, or neither is.', hot: ['svc>db'], ok: ['db'], packets: [{ id: 'e', label: 'order + event', at: ['svc', 'db', 0.6] }] },
        { caption: 'A relay process reads new outbox rows…', hot: ['relay>db'], lit: ['relay'], packets: [{ id: 'e', label: 'OrderCreated', at: ['relay', 'db', 0.5] }] },
        { caption: '…and publishes them to Kafka, retrying until it succeeds, then marks them sent. The event can never be lost — at worst it is sent twice, so consumers must be idempotent.', hot: ['relay>kafka'], ok: ['kafka'], packets: [{ id: 'e', label: 'OrderCreated', at: ['relay', 'kafka', 0.6] }] },
    ]);
    return { title: 'Sagas undo with compensations; the outbox never loses an event', variants: [{ label: 'Orchestrated saga', frames: saga }, { label: 'Outbox', frames: outbox }] };
};

// ============ sd4-t3 · Consensus and Raft ============

const raft = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'n1', x: 150, y: 24, w: 100, h: 40, label: 'node 1', kind: 'store', color: C.blue },
        { id: 'n2', x: 20, y: 160, w: 100, h: 40, label: 'node 2', kind: 'store', color: C.blue },
        { id: 'n3', x: 280, y: 160, w: 100, h: 40, label: 'node 3', kind: 'store', color: C.blue },
    ];
    const edges: FEdge[] = [{ from: 'n1', to: 'n2' }, { from: 'n1', to: 'n3' }, { from: 'n2', to: 'n3', plain: true }];
    const frames = flow(nodes, edges, [
        { caption: 'Three nodes must agree on one leader and one order of changes. Every node starts as a follower, waiting to hear from a leader.', badges: { n1: 'follower', n2: 'follower', n3: 'follower' } },
        { caption: 'Node 1 hears nothing for its random timeout (say 150–300 ms), so it becomes a candidate for term 2 and asks the others for their votes.', lit: ['n1'], hot: ['n1>n2', 'n1>n3'], packets: [{ id: 'v2', label: 'vote term 2?', at: ['n1', 'n2', 0.5] }, { id: 'v3', label: 'vote term 2?', at: ['n1', 'n3', 0.5] }], badges: { n1: 'candidate', n2: 'follower', n3: 'follower' } },
        { caption: 'Each node votes once per term. With votes from a majority — 2 of 3, counting its own — node 1 becomes leader and starts sending heartbeats.', ok: ['n1'], hot: ['n1>n2', 'n1>n3'], packets: [{ id: 'v2', label: '♥', at: ['n1', 'n2', 0.5], color: C.green }, { id: 'v3', label: '♥', at: ['n1', 'n3', 0.5], color: C.green }], badges: { n1: 'leader', n2: 'follower', n3: 'follower' } },
        { caption: 'A client write goes to the leader. It adds "x = 5" to its log and sends the entry to the followers.', ok: ['n1'], hot: ['n1>n2', 'n1>n3'], packets: [{ id: 'v2', label: 'x = 5', at: ['n1', 'n2', 0.6] }, { id: 'v3', label: 'x = 5', at: ['n1', 'n3', 0.4] }], badges: { n1: 'log: x=5', n2: 'log: —', n3: 'log: —' } },
        { caption: 'Node 2 stores it. Now a majority (2 of 3) have the entry, so it is COMMITTED and applied, even though node 3 is slow.', ok: ['n1', 'n2'], packets: [{ id: 'v3', label: 'x = 5', at: ['n1', 'n3', 0.8] }], badges: { n1: 'x=5 ✓ committed', n2: 'x=5', n3: 'log: —' } },
        { caption: 'The leader dies. Heartbeats stop, a follower times out, and a new election begins for term 3. With 3 nodes the cluster survives 1 failure — a majority is still possible.', bad: ['n1'], lit: ['n2'], hot: [], badges: { n1: 'down', n2: 'candidate', n3: 'follower' } },
    ]);
    return { title: 'Raft: elect a leader by majority, commit what a majority holds', variants: [{ label: 'Election and a write', frames }] };
};

// ============ sd4-t4 · Security basics ============

const security = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'app', x: 6, y: 100, w: 70, label: 'App', kind: 'client', color: C.cyan },
        { id: 'auth', x: 130, y: 30, w: 100, label: 'auth server', color: C.violet, size: 10 },
        { id: 'gw', x: 130, y: 160, w: 100, label: 'gateway', color: C.blue },
        { id: 'svc', x: 296, y: 160, w: 98, label: 'payments', color: C.blue },
        { id: 'users', x: 296, y: 30, w: 98, label: 'salted hashes', kind: 'store', color: C.green, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'app', to: 'auth' }, { from: 'auth', to: 'users' }, { from: 'app', to: 'gw' }, { from: 'gw', to: 'svc' }];
    const frames = flow(nodes, edges, [
        { caption: 'Log in: the password travels over HTTPS. The server hashes it with the user\'s stored salt and compares with the stored hash — passwords are never stored in plain text.', hot: ['app>auth', 'auth>users'], packets: [{ id: 'p', label: 'password', at: ['app', 'auth', 0.5] }] },
        { caption: 'It matches (and the one-time code is valid), so the server issues a short-lived access token (15 minutes) and a longer-lived refresh token.', ok: ['auth'], packets: [{ id: 'p', label: 'access + refresh', at: ['app', 'auth', 0.5], color: C.green }] },
        { caption: 'Every request carries the access token. The gateway checks its signature and expiry — no database call needed. That is authentication: who are you?', hot: ['app>gw'], lit: ['gw'], packets: [{ id: 'r', label: 'token', at: ['app', 'gw', 0.5] }], badges: { gw: 'signature ✓' } },
        { caption: 'The payments service then checks authorisation: does THIS user own account 123? It checks on the server, every time — never trusting the app.', hot: ['gw>svc'], lit: ['svc'], packets: [{ id: 'r', label: 'move £50', at: ['gw', 'svc', 0.5] }], badges: { svc: 'owns 123? ✓' } },
        { caption: 'After 15 minutes the access token expires; the app swaps the refresh token for a new one. Logging out revokes the refresh token, so the session really ends.', hot: ['app>auth'], packets: [{ id: 'p', label: 'refresh', at: ['app', 'auth', 0.5] }], dim: ['svc'] },
    ]);
    return { title: 'Who are you, and what may you do: login, tokens and checks', variants: [{ label: 'A banking app', frames }] };
};

export const phase34Animations: Record<string, () => AnimationSpec> = {
    'sd3-t1': choosingDb,
    'sd3-t2': acid,
    'sd3-t3': indexing,
    'sd3-t4': replication,
    'sd3-t5': sharding,
    'sd3-t6': consistentHashing,
    'sd3-t7': objectStorage,
    'sd3-t8': search,
    'sd3-t9': snowflake,
    'sd4-t1': microservices,
    'sd4-t2': sagas,
    'sd4-t3': raft,
    'sd4-t4': security,
};
