import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, arrow, circle, frame, line, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { label } from './flow';

// System Design Phase 7: low-level design questions. Schedules, balances,
// evictions and fills are worked out by running the design's own algorithm.

// ============ sd7-t1 · Parking lot ============

type Size = 'S' | 'M' | 'L';
const fits: Record<string, Size[]> = { bike: ['S', 'M', 'L'], car: ['M', 'L'], truck: ['L'] };

const parkingLot = (): AnimationSpec => {
    const spots: { id: number; size: Size }[] = [
        { id: 1, size: 'S' }, { id: 2, size: 'S' }, { id: 3, size: 'M' }, { id: 4, size: 'M' }, { id: 5, size: 'M' }, { id: 6, size: 'L' },
    ];
    // The assignment strategy: the smallest free spot the vehicle fits.
    const assign = (vehicle: string, taken: Set<number>) => spots.find(s => !taken.has(s.id) && fits[vehicle].includes(s.size))!.id;
    const taken = new Set<number>([1, 3]);
    const carSpot = assign('car', taken);
    const grid = (busy: Set<number>, hot: number | null, freed: number | null = null): Part => spots.map((s, i) => {
        const on = s.id === hot;
        const color = s.id === freed ? C.green : on ? C.amber : busy.has(s.id) ? C.red : C.blue;
        return rect(`sp${s.id}`, 150 + (i % 3) * 82, 40 + Math.floor(i / 3) * 70, 74, 56, {
            rx: 7, fill: tint(color, on || busy.has(s.id) ? 0.4 : 0.12), stroke: color, sw: on ? 3 : 1.5,
            text: `spot ${s.id}\n${s.size}${busy.has(s.id) ? ' · taken' : ''}`, size: 10, weight: 700, mono: true,
        });
    });
    const free = (busy: Set<number>) => spots.filter(s => !busy.has(s.id)).length;
    const board = (busy: Set<number>, flash = false) => rect('board', 8, 180, 120, 40, { rx: 7, fill: tint(flash ? C.green : C.violet, 0.3), stroke: flash ? C.green : C.violet, sw: 1.5, text: `board: ${free(busy)} free`, size: 11, weight: 700, mono: true });
    const vehicle = (x: number, value: string, color: string = C.cyan) => rect('car', x, 60, 80, 30, { rx: 15, fill: tint(color, 0.5), stroke: color, sw: 2, text: value, size: 11, weight: 700, mono: true });
    const ticket = (on: boolean) => on && rect('ticket', 8, 110, 120, 28, { rx: 6, fill: tint(C.amber, 0.35), stroke: C.amber, sw: 1.5, text: `ticket: spot ${carSpot}`, size: 10, weight: 700, mono: true });
    const after = new Set([...taken, carSpot]);
    const frames: Frame[] = [
        frame('Version 1 of the class design: ParkingLot, Spot, Vehicle, Ticket. Spots come in sizes S, M and L; spots 1 and 3 are already taken.', [grid(taken, null), board(taken)]),
        frame('A car arrives at the gate. The spot-assignment STRATEGY looks for the smallest free spot a car fits: M or L, so not spot 2.', [grid(taken, null), board(taken), vehicle(30, 'car')]),
        frame(`Spot ${carSpot} fits. It is marked taken in ONE atomic step — so a car at another gate can't be given the same spot at the same moment.`, [grid(taken, carSpot), board(taken), vehicle(30, 'car')]),
        frame(`A ticket is issued for spot ${carSpot}. The display board subscribes to spot changes (Observer), so its count updates by itself.`, [grid(after, null), board(after, true), ticket(true)]),
        frame('Exit: scan the ticket. The PRICING strategy works out the fee from the time parked; after payment, the spot is freed and the board updates again.', [grid(taken, null, carSpot), board(taken, true), ticket(true), label('fee', 8, 154, 'fee = pricing(time parked)', C.amber, { size: 10 })]),
    ];
    return { title: 'Parking lot: strategies choose spots and prices; observers keep the boards right', variants: [{ label: 'Entry and exit', frames }] };
};

// ============ sd7-t2 · Elevator (LOOK scheduling) ============

/** LOOK: keep going in the current direction serving stops on the way, then turn around. */
const look = (start: number, goingUp: boolean, stops: number[]) => {
    const up = stops.filter(f => f >= start).sort((a, b) => a - b);
    const down = stops.filter(f => f < start).sort((a, b) => b - a);
    return goingUp ? [...up, ...down] : [...down, ...up.reverse()];
};

const elevator = (): AnimationSpec => {
    const floors = 10;
    const start = 3;
    const stops = [8, 1, 5, 6];
    const order = look(start, true, stops);
    const fy = (f: number) => 214 - f * 20;
    const shaft = (at: number, served: number[], current: number | null): Part => [
        rect('shaft', 150, fy(floors - 1) - 10, 60, floors * 20, { rx: 4, fill: tint(C.blue, 0.05), stroke: C.faint, sw: 1.5 }),
        Array.from({ length: floors }, (_, f) => [
            text(`fl${f}`, 140, fy(f), String(f), { size: 10, fill: C.dim, weight: 700, mono: true, anchor: 'end' }),
            stops.includes(f) && circle(`stop${f}`, 226, fy(f), 6, { fill: served.includes(f) ? C.green : f === current ? C.amber : C.pink, stroke: C.bg, sw: 1 }),
        ]),
        rect('car', 156, fy(at) - 9, 48, 18, { rx: 4, fill: tint(C.amber, 0.6), stroke: C.amber, sw: 2, text: 'lift', size: 10, weight: 800 }),
    ];
    const list = (served: number[]) => [
        label('order-t', 250, 40, 'visit order:', C.grey, { size: 11 }),
        label('order', 250, 62, order.map(f => (served.includes(f) ? `✓${f}` : f)).join(' → '), C.ink, { size: 11 }),
    ];
    const frames: Frame[] = [
        frame(`The lift is at floor ${start}, going up. Requested stops: ${stops.join(', ')}. Serving them in the order they were pressed would zig-zag up and down the building.`, [shaft(start, [], null), label('req', 250, 40, `requests: ${stops.join(', ')}`, C.pink, { size: 11 })]),
        frame(`LOOK: keep going in one direction, serving every stop on the way, then turn around — like a lift operator sweeping up and down. Order: ${order.join(' → ')}.`, [shaft(start, [], null), list([])]),
        ...order.map((f, i) => frame(i === order.findIndex(x => x < start)
            ? `No more stops above: turn around and sweep down to floor ${f}.`
            : `Stop at floor ${f}.`, [shaft(f, order.slice(0, i + 1), f), list(order.slice(0, i + 1))], 2200)),
        frame('A controller hands each new hall call to the best lift — idle and near, or already moving towards that floor in the same direction. Each lift\'s state machine keeps the doors shut while moving.', [shaft(order[order.length - 1], order, null), list(order)]),
    ];
    return { title: 'An elevator using LOOK: sweep one way, then the other', variants: [{ label: 'One lift', frames }] };
};

// ============ sd7-t3 · Splitwise ============

type Expense = { payer: string; amount: number; among: string[] };

const settle = (people: string[], expenses: Expense[]) => {
    const balance = Object.fromEntries(people.map(p => [p, 0])) as Record<string, number>;
    expenses.forEach(e => {
        const share = e.amount / e.among.length;
        balance[e.payer] += e.amount;
        e.among.forEach(p => { balance[p] -= share; });
    });
    const net = { ...balance };
    const transfers: [string, string, number][] = [];
    // Repeatedly match the biggest debtor with the biggest creditor.
    for (let guard = 0; guard < 10; guard++) {
        const debtor = people.reduce((a, b) => (net[a] < net[b] ? a : b));
        const creditor = people.reduce((a, b) => (net[a] > net[b] ? a : b));
        if (net[creditor] < 0.005) break;
        const pay = Math.min(-net[debtor], net[creditor]);
        transfers.push([debtor, creditor, pay]);
        net[debtor] += pay;
        net[creditor] -= pay;
    }
    return { balance, transfers };
};

const splitwise = (): AnimationSpec => {
    const people = ['Ana', 'Ben', 'Cai', 'Dev'];
    const expenses: Expense[] = [
        { payer: 'Ana', amount: 80, among: people },
        { payer: 'Ben', amount: 30, among: ['Ben', 'Cai', 'Dev'] },
    ];
    const { balance, transfers } = settle(people, expenses);
    const zero = 200;
    const bars = (values: Record<string, number>): Part => people.map((p, i) => {
        const v = values[p];
        const w = Math.abs(v) * 2;
        return [
            text(`n${p}`, 60, 60 + i * 38, p, { size: 12, fill: C.ink, weight: 700, anchor: 'end' }),
            rect(`b${p}`, v >= 0 ? zero : zero - w, 48 + i * 38, Math.max(2, w), 24, { rx: 4, fill: tint(v >= 0 ? C.green : C.red, 0.55), stroke: 'none' }),
            Math.abs(v) < 0.005
                ? text(`v${p}`, zero + 8, 60 + i * 38, '£0', { size: 11, fill: C.grey, weight: 700, mono: true, anchor: 'start' })
                : text(`v${p}`, v > 0 ? zero + w + 6 : zero - w - 6, 60 + i * 38, `${v > 0 ? '+' : '−'}£${Math.abs(v).toFixed(0)}`, { size: 11, fill: v > 0 ? C.green : C.red, weight: 700, mono: true, anchor: v > 0 ? 'start' : 'end' }),
        ];
    });
    const axis = line('zero', zero, 40, zero, 196, { stroke: C.dim, sw: 1.5 });
    const fromExpense = (k: number) => {
        const b = Object.fromEntries(people.map(p => [p, 0])) as Record<string, number>;
        expenses.slice(0, k).forEach(e => {
            b[e.payer] += e.amount;
            e.among.forEach(p => { b[p] -= e.amount / e.among.length; });
        });
        return b;
    };
    const done: Record<string, number> = { ...balance };
    const frames: Frame[] = [
        frame('Keep ONE net balance per person: positive means they are owed money, negative means they owe. Everyone starts at zero.', [axis, bars(fromExpense(0))]),
        frame(`Ana pays £80 for dinner for all four. Split equally, each share is £20: Ana is owed £60, everyone else owes £20.`, [axis, bars(fromExpense(1))]),
        frame('Ben pays £30 for a taxi for himself, Cai and Dev: £10 each. Balances add up — and always sum to zero.', [axis, bars(fromExpense(2))]),
        ...transfers.map(([from, to, amount], i) => {
            done[from] += amount;
            done[to] -= amount;
            return frame(i === 0
                ? `Simplify: match the biggest debtor with the biggest creditor. ${from} pays ${to} £${amount.toFixed(0)}.`
                : `Repeat: ${from} pays ${to} £${amount.toFixed(0)}.`, [axis, bars({ ...done })], 2600);
        }),
        frame(`Everyone is at zero after ${transfers.length} payments, instead of a payment for every expense share.`, [axis, bars(Object.fromEntries(people.map(p => [p, 0])))]),
    ];
    return { title: 'Splitwise: one balance per person, then settle with few payments', variants: [{ label: 'Four friends', frames }] };
};

// ============ sd7-t4 · Vending machine ============

const vending = (): AnimationSpec => {
    const price = 120;
    const coins = [100, 50];
    const paid = coins.reduce((s, c) => s + c, 0);
    const pence = (p: number) => (p >= 100 ? `£${(p / 100).toFixed(2)}` : `${p}p`);
    const names = ['Idle', 'ItemSelected', 'HasMoney', 'Dispensing'];
    const chain = (on: number, cancel = false): Part => [
        names.map((n, i) => rect(`s${n}`, 8 + i * 98, 40, 90, 34, {
            rx: 17, fill: tint(i === on ? (cancel ? C.red : C.amber) : C.violet, i === on ? 0.5 : 0.15), stroke: i === on ? (cancel ? C.red : C.amber) : C.violet, sw: i === on ? 3 : 1.5, text: n, size: 10, weight: 800,
        })),
        [0, 1, 2].map(i => arrow(`a${i}`, 98 + i * 98, 57, 104 + i * 98, 57, { stroke: C.grey, sw: 1.5 })),
    ];
    const panel = (lines: [string, string][]) => lines.map(([v, color], i) => label(`p${i}`, 10, 110 + i * 22, v, color, { size: 12 }));
    const frames: Frame[] = [
        frame('The machine is Idle. Each mode is a state class that knows what each event means.', [chain(0), panel([['waiting', C.grey]])]),
        frame(`Select item B2, price ${pence(price)}: Idle → ItemSelected.`, [chain(1), panel([[`B2 · ${pence(price)}`, C.ink], ['paid: £0.00', C.grey]])]),
        frame(`Insert ${pence(coins[0])}: still short of ${pence(price)}, so it stays in ItemSelected and waits for more.`, [chain(1), panel([[`B2 · ${pence(price)}`, C.ink], [`paid: ${pence(coins[0])}`, C.amber]])]),
        frame(`Insert ${pence(coins[1])}: paid ${pence(paid)} ≥ ${pence(price)} → HasMoney.`, [chain(2), panel([[`B2 · ${pence(price)}`, C.ink], [`paid: ${pence(paid)}`, C.green]])]),
        frame(`Dispensing: drop the item, give ${pence(paid - price)} change, and go back to Idle.`, [chain(3), panel([['item dropped ✓', C.green], [`change: ${pence(paid - price)}`, C.green]])]),
        frame('Cancel while in ItemSelected or HasMoney gives the money back and returns to Idle; an item with no stock left can\'t be selected at all.', [chain(0, true), panel([['cancel → money back → Idle', C.amber]])]),
    ];
    return { title: 'A vending machine as a chain of states', variants: [{ label: 'One purchase', frames }] };
};

// ============ sd7-t5 · LRU cache ============

type Op = ['put' | 'get', string];

const runLru = (capacity: number, ops: Op[]) => {
    let order: string[] = []; // most recent first
    return ops.map(([op, key]) => {
        let evicted: string | null = null;
        const hit = order.includes(key);
        // A get that misses changes nothing; everything else moves the key to the front.
        if (op === 'put' || hit) order = [key, ...order.filter(k => k !== key)];
        if (op === 'put' && !hit && order.length > capacity) evicted = order.pop()!;
        return { op, key, hit, evicted, order: [...order] };
    });
};

const lruCache = (): AnimationSpec => {
    const capacity = 3;
    const ops: Op[] = [['put', 'A'], ['put', 'B'], ['put', 'C'], ['get', 'A'], ['put', 'D'], ['get', 'B']];
    const steps = runLru(capacity, ops);
    const nodeX = (i: number) => 110 + i * 92;
    const list = (order: string[], hot: string | null, gone: string | null): Part => [
        text('front', 110, 120, 'most recent', { size: 10, fill: C.green, weight: 700, anchor: 'start' }),
        text('back', 384, 120, 'least recent', { size: 10, fill: C.red, weight: 700, anchor: 'end' }),
        order.map((k, i) => [
            rect(`node${k}`, nodeX(i), 136, 66, 36, { rx: 8, fill: tint(k === hot ? C.amber : C.cyan, k === hot ? 0.55 : 0.25), stroke: k === hot ? C.amber : C.cyan, sw: k === hot ? 2.5 : 1.5, text: k, size: 14, weight: 800, mono: true }),
            i > 0 && line(`link${i}`, nodeX(i - 1) + 66, 154, nodeX(i), 154, { stroke: C.grey, sw: 2 }),
        ]),
        gone !== null && rect(`node${gone}`, 330, 196, 66, 30, { rx: 8, fill: tint(C.red, 0.4), stroke: C.red, sw: 2, text: `${gone} ✗`, size: 13, weight: 800, mono: true, opacity: 0.8 }),
    ];
    const map = (order: string[]) => [
        rect('map', 8, 30, 86, 150, { rx: 8, fill: tint(C.violet, 0.08), stroke: C.violet, sw: 1.5 }),
        text('map-t', 51, 44, 'hash map', { size: 10, fill: C.violet, weight: 700 }),
        ...[...order].sort().map((k, i) => text(`m${k}`, 18, 66 + i * 22, `${k} → node`, { size: 11, fill: C.ink, weight: 700, mono: true, anchor: 'start' })),
    ];
    const frames: Frame[] = [
        frame(`An LRU cache of capacity ${capacity}: a hash map finds any key's node in O(1); a doubly linked list keeps the keys in order of use.`, [map([]), list([], null, null)]),
        ...steps.map(s => {
            const caption = s.op === 'get'
                ? (s.hit ? `get(${s.key}): the map finds it at once; move its node to the front — it is now the most recently used.` : `get(${s.key}): not in the map — it was evicted earlier. A miss.`)
                : s.evicted
                    ? `put(${s.key}): insert at the front. Now there are ${capacity + 1}, one too many — drop the node at the back, ${s.evicted}, the least recently used.`
                    : `put(${s.key}): insert a node at the front, and add it to the map.`;
            return frame(caption, [map(s.order), list(s.order, s.hit || s.op === 'put' ? s.key : null, s.evicted)], 2800);
        }),
    ];
    return { title: 'LRU cache: a hash map plus a doubly linked list, both O(1)', variants: [{ label: 'Capacity 3', frames }] };
};

// ============ sd7-t6 · Order-matching engine ============

type Level = { id: string; price: number; qty: number };

const matchBuy = (asks: Level[], price: number, qty: number) => {
    const book = asks.map(a => ({ ...a }));
    const fills: { id: string; price: number; qty: number }[] = [];
    let left = qty;
    for (const a of book) {
        if (left === 0 || a.price > price) break;
        const take = Math.min(left, a.qty);
        a.qty -= take;
        left -= take;
        fills.push({ id: a.id, price: a.price, qty: take });
    }
    return { fills, left, after: book.filter(a => a.qty > 0) };
};

const matching = (): AnimationSpec => {
    // Sell orders, cheapest first; at the same price, oldest first (price-time priority).
    const asks: Level[] = [{ id: 's1', price: 101, qty: 5 }, { id: 's2', price: 101, qty: 3 }, { id: 's3', price: 102, qty: 10 }, { id: 's4', price: 104, qty: 4 }];
    const bids: Level[] = [{ id: 'b1', price: 99, qty: 6 }, { id: 'b2', price: 98, qty: 10 }];
    const buy = { price: 102, qty: 20 };
    const { fills, left } = matchBuy(asks, buy.price, buy.qty);
    const row = (id: string, x: number, y: number, l: Level, color: string, on = false, faded = false) => rect(id, x, y, 150, 24, {
        rx: 5, fill: tint(color, on ? 0.55 : faded ? 0.04 : 0.22), stroke: on ? C.amber : faded ? C.faint : color, sw: on ? 2.5 : 1.2, text: `£${l.price}  ×${l.qty}`, size: 11, weight: 700, mono: true, textColor: faded ? C.dim : C.ink,
    });
    const book = (asksNow: Level[], bidsNow: Level[], hot: string | null, filled: Set<string>): Part => [
        text('ask-t', 290, 14, 'sell orders (asks)', { size: 10, fill: C.red, weight: 700 }),
        // Asks drawn cheapest at the bottom, nearest the spread.
        asksNow.map((a, i) => row(a.id, 215, 140 - (i + 1) * 28, a, C.red, a.id === hot, filled.has(a.id))),
        line('spread', 205, 144, 375, 144, { stroke: C.dim, sw: 1, dash: '4 3' }),
        text('bid-t', 290, 233, 'buy orders (bids)', { size: 10, fill: C.green, weight: 700 }),
        bidsNow.map((b, i) => row(b.id, 215, 150 + i * 26, b, C.green, b.id === hot)),
    ];
    const incoming = (qtyLeft: number) => rect('in', 10, 90, 150, 30, { rx: 15, fill: tint(C.cyan, 0.5), stroke: C.cyan, sw: 2, text: `BUY ×${qtyLeft} @ ≤ £${buy.price}`, size: 11, weight: 800, mono: true });
    let remaining = buy.qty;
    const current = asks.map(a => ({ ...a }));
    const filled = new Set<string>();
    const frames: Frame[] = [
        frame('The order book: sell orders above, cheapest nearest the middle; buy orders below. At the same price, the OLDEST order is first in line — price-time priority.', [book(current, bids, null, filled)]),
        frame(`A buy order arrives: ${buy.qty} shares at up to £${buy.price}. It fills against the cheapest sell orders while their price is at or below £${buy.price}.`, [book(current, bids, null, filled), incoming(remaining)]),
    ];
    fills.forEach(f => {
        remaining -= f.qty;
        const lvl = current.find(a => a.id === f.id)!;
        lvl.qty -= f.qty;
        if (lvl.qty === 0) filled.add(f.id);
        frames.push(frame(`Fill ${f.qty} at £${f.price}${f.id === 's2' ? ' — the second £101 order, because it arrived later than the first' : ''}. ${remaining} still to buy.`, [book(current.map(a => ({ ...a })), bids, f.id, new Set(filled)), incoming(remaining)], 2800));
    });
    frames.push(frame(`The next sell order is £104 — above the buy limit — so matching stops. The ${left} left over rests in the book as a new buy order at £${buy.price}.`, [
        book(current.filter(a => !filled.has(a.id)), [{ id: 'bnew', price: buy.price, qty: left }, ...bids], 'bnew', new Set()),
    ]));
    return { title: 'A matching engine fills by best price, then by time', variants: [{ label: 'A large buy order', frames }] };
};

export const phase7Animations: Record<string, () => AnimationSpec> = {
    'sd7-t1': parkingLot,
    'sd7-t2': elevator,
    'sd7-t3': splitwise,
    'sd7-t4': vending,
    'sd7-t5': lruCache,
    'sd7-t6': matching,
};

