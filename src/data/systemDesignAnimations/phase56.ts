import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, circle, frame, line, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { flow, label, type FEdge, type FNode } from './flow';

// System Design Phase 5 (object-oriented design) and Phase 6 (design
// patterns). Each follows its lesson's own example — and never the example a
// practice question uses.

/** SVG collapses spaces, so code indentation is kept with non-breaking ones. */
const indent = (line_: string) => line_.replace(/^ +/, lead => '\u00a0'.repeat(lead.length));

/** A class drawn UML-style: a name bar, then a few lines of fields and methods. */
const classBox = (id: string, x: number, y: number, w: number, name: string, lines: string[], color: string, o: { on?: string; faded?: boolean; italic?: boolean } = {}): Shape[] => {
    const h = 22 + lines.length * 15 + 6;
    const stroke = o.on ?? color;
    return [
        rect(`${id}-box`, x, y, w, h, { rx: 6, fill: tint(o.on ?? color, o.on ? 0.22 : 0.1), stroke, sw: o.on ? 2.5 : 1.5, opacity: o.faded ? 0.3 : 1 }),
        rect(`${id}-head`, x, y, w, 22, { rx: 6, fill: tint(o.on ?? color, o.on ? 0.55 : 0.35), stroke: 'none', opacity: o.faded ? 0.3 : 1, text: o.italic ? `«${name}»` : name, size: 11, weight: 800 }),
        ...lines.map((l, i) => text(`${id}-l${i}`, x + 8, y + 32 + i * 15, indent(l), { size: 10, fill: o.faded ? C.dim : C.ink, weight: 600, mono: true, anchor: 'start' })),
    ];
};

// ============ sd5-t1 · OOP: the four pillars ============

const fourPillars = (): AnimationSpec => {
    const account = (on?: string) => classBox('acc', 120, 20, 160, 'BankAccount', ['- balance: £50', '+ deposit(amount)', '+ withdraw(amount)', '+ monthly_update()'], C.blue, { on });
    const call = (value: string, color: string, y = 140): Part => [arrow('call-a', 70, y, 118, 70, { stroke: color, sw: 2 }), rect('call', 8, y - 10, 92, 20, { rx: 10, fill: tint(color, 0.5), stroke: color, sw: 1, text: value, size: 10, weight: 700, mono: true })];
    const savings = (on?: string) => classBox('sav', 220, 140, 170, 'SavingsAccount', ['+ add_interest()', '+ monthly_update()'], C.green, { on });
    const current = (on?: string) => classBox('cur', 30, 140, 170, 'CurrentAccount', ['+ monthly_update()'], C.violet, { on });
    const isA: Part = [arrow('isa1', 305, 140, 240, 110, { stroke: C.grey, sw: 1.5 }), arrow('isa2', 115, 140, 160, 110, { stroke: C.grey, sw: 1.5 })];
    const frames: Frame[] = [
        frame('A class groups data and behaviour: a BankAccount holds a balance and has deposit() and withdraw().', [account()]),
        frame('Encapsulation: the balance is private (–). Nobody can set it to −£30 directly. withdraw(80) checks there is enough money first, and refuses.', [account(C.red), call('withdraw(80)', C.red), label('no', 120, 128, 'refused: the balance is only £50', C.red, { size: 11 })]),
        frame('Abstraction: callers only see deposit(), withdraw() and the balance — not how interest, fees or the ledger work inside.', [account(C.amber), call('deposit(20)', C.green)]),
        frame('Inheritance: a SavingsAccount IS a BankAccount that also adds interest. It reuses everything and adds one thing.', [account(), savings(C.green), isA, current()]),
        frame('Polymorphism: code loops over all accounts calling monthly_update(). Each type does the right thing — savings add interest, current accounts take a fee — and the loop never asks which is which.', [account(), savings(C.green), current(C.violet), isA, label('poly', 200, 222, 'for a in accounts: a.monthly_update()', C.amber, { size: 11, anchor: 'middle' })]),
    ];
    return { title: 'The four pillars, on one bank account', variants: [{ label: 'Bank accounts', frames }] };
};

// ============ sd5-t2 · Composition over inheritance ============

const composition = (): AnimationSpec => {
    const flies = ['Wings', 'NoFly', 'Rocket'];
    const sounds = ['Quack', 'Squeak', 'Mute'];
    const explosion = (n: number) => Array.from({ length: n }, (_, i) => rect(`sub${i}`, 20 + (i % 3) * 124, 60 + Math.floor(i / 3) * 44, 116, 34, {
        rx: 6, fill: tint(C.red, 0.18), stroke: C.red, sw: 1.5, text: `${flies[i % 3]}${sounds[Math.floor(i / 3)]}Duck`, size: 9, weight: 700, mono: true,
    }));
    const part = (id: string, x: number, y: number, value: string, color: string, on: boolean) => rect(id, x, y, 72, 26, { rx: 13, fill: tint(color, on ? 0.55 : 0.18), stroke: color, sw: on ? 2.5 : 1.5, text: value, size: 10, weight: 700, mono: true });
    const duck = (fly: string | null, sound: string | null, color: string = C.blue): Part => [
        classBox('duck', 150, 26, 100, 'Duck', ['flyer', 'quacker'], color),
        flies.map((f, i) => part(`f${f}`, 18, 120 + i * 34, f, C.cyan, fly === f)),
        sounds.map((s, i) => part(`s${s}`, 310, 120 + i * 34, s, C.amber, sound === s)),
        fly !== null && line('lf', 150, 64, 90, 133 + flies.indexOf(fly) * 34, { stroke: C.cyan, sw: 2.5 }),
        sound !== null && line('ls', 250, 79, 310, 133 + sounds.indexOf(sound) * 34, { stroke: C.amber, sw: 2.5 }),
    ];
    const frames: Frame[] = [
        frame('With inheritance, every combination of behaviours needs its own subclass: 3 ways to fly × 3 sounds = 9 classes — and every new behaviour multiplies them again.', [explosion(9), label('n', 200, 36, '3 × 3 = 9 subclasses', C.red, { size: 12, anchor: 'middle' })]),
        frame('With composition, a Duck simply HOLDS a flying object and a quacking object. Each behaviour is a small class behind a tiny interface: fly() or quack().', [duck(null, null)]),
        frame('Build a duck by choosing its parts: Duck(Wings(), Quack()). Six small classes cover all nine combinations.', [duck('Wings', 'Quack')]),
        frame('A rubber duck is Duck(NoFly(), Squeak()) — no new subclass needed.', [duck('NoFly', 'Squeak', C.violet)]),
        frame('You can even swap a part while the program runs — strap a Rocket on — and test each part on its own. Inherit only for a true "is-a" with shared behaviour.', [duck('Rocket', 'Squeak', C.violet)]),
    ];
    return { title: 'Composition: build behaviour from parts instead of subclasses', variants: [{ label: 'Ducks', frames }] };
};

// ============ sd5-t3 · Single Responsibility ============

const srp = (): AnimationSpec => {
    const who = (id: string, x: number, y: number, value: string, color: string) => rect(id, x, y, 84, 20, { rx: 10, fill: tint(color, 0.35), stroke: color, sw: 1, text: value, size: 9, weight: 700, mono: true });
    const big = (on: string | undefined, broken: boolean) => [
        classBox('inv', 100, 30, 200, 'Invoice', ['calculate_totals()', 'save_to_database()', 'send_email()'], C.blue, { on }),
        who('w1', 306, 50, 'finance', C.green), who('w2', 306, 66, 'DB team', C.violet), who('w3', 306, 82, 'marketing', C.amber),
        broken && label('bug', 100, 130, 'calculate_totals() broke ✗', C.red, { size: 12 }),
    ];
    const split = (call: boolean): Part => [
        classBox('a', 8, 110, 124, 'Invoice', ['calculate_totals()'], C.green),
        classBox('b', 138, 110, 124, 'InvoiceRepository', ['save(invoice)'], C.violet),
        classBox('c', 268, 110, 124, 'InvoiceEmailer', ['send(invoice)'], C.amber),
        who('wa', 28, 170, 'finance', C.green), who('wb', 158, 170, 'DB team', C.violet), who('wc', 288, 170, 'marketing', C.amber),
        call && [rect('coord', 120, 30, 160, 30, { rx: 6, fill: tint(C.cyan, 0.25), stroke: C.cyan, sw: 1.5, text: 'finish_invoice()', size: 10, weight: 700, mono: true }),
            arrow('ca', 160, 60, 70, 108, { stroke: C.cyan, sw: 1.5 }), arrow('cb', 200, 60, 200, 108, { stroke: C.cyan, sw: 1.5 }), arrow('cc', 240, 60, 330, 108, { stroke: C.cyan, sw: 1.5 })],
    ];
    const frames: Frame[] = [
        frame('One Invoice class calculates totals, saves itself to the database and emails itself. Three different people ask for changes to it.', [big(undefined, false)]),
        frame('Marketing asks for a new email layout. Editing send_email() in the same class risks breaking the totals — finance\'s code — by accident.', [big(C.red, true)]),
        frame('Split it: one class per reason to change. Invoice calculates, InvoiceRepository saves, InvoiceEmailer sends.', [split(false)]),
        frame('A small coordinating function calls them in order. Now an email change touches only InvoiceEmailer.', [split(true)]),
    ];
    return { title: 'Single responsibility: one class, one reason to change', variants: [{ label: 'Invoice', frames }] };
};

// ============ sd5-t4 · Open/Closed ============

const ocp = (): AnimationSpec => {
    const chain = (lines: string[], on: number | null) => [
        rect('code', 20, 30, 200, 20 + lines.length * 17, { rx: 8, fill: '#161c24ff', stroke: on === null ? C.faint : C.red, sw: on === null ? 1 : 2 }),
        text('code-t', 120, 22, 'PriceCalculator.total()', { size: 10, fill: C.grey, weight: 700, mono: true }),
        ...lines.map((l, i) => text(`cl${i}`, 30, 44 + i * 17, indent(l), { size: 10, fill: i === on ? C.red : C.ink, weight: 600, mono: true, anchor: 'start' })),
    ];
    const ruleBox = (id: string, x: number, value: string, color: string, on = false) => rect(id, x, 150, 84, 30, { rx: 6, fill: tint(color, on ? 0.5 : 0.25), stroke: color, sw: on ? 2.5 : 1.5, text: value, size: 10, weight: 700, mono: true });
    const design = (rules: [string, string][], fresh: string | null): Part => [
        classBox('calc', 20, 26, 170, 'PriceCalculator', ['rules: list', 'for r in rules:', '  price = r.apply(price)'], C.green),
        classBox('iface', 230, 26, 150, 'DiscountRule', ['apply(price)'], C.violet, { italic: true }),
        arrow('uses', 190, 50, 228, 50, { stroke: C.grey, sw: 1.5 }),
        rules.map(([r, color], i) => [ruleBox(`r${r}`, 10 + i * 96, r, color, r === fresh), arrow(`ra${r}`, 52 + i * 96, 148, 290, 82, { stroke: C.dim, sw: 1, dash: '4 3' })]),
    ];
    const frames: Frame[] = [
        frame('A price calculator that switches on the discount type with if/elif. Every new kind of discount means editing this method.', [chain(["if kind == 'sale':", '    price *= 0.9', "elif kind == 'bulk':", '    price -= 5'], null)]),
        frame('Adding a student discount means opening working code and adding another branch — risking the cases that already work.', [chain(["if kind == 'sale':", '    price *= 0.9', "elif kind == 'bulk':", '    price -= 5', "elif kind == 'student':  # edit!"], 4)]),
        frame('Instead, depend on an interface: DiscountRule with apply(price). Each branch becomes its own small class; the calculator just asks every rule it is given.', [design([['Sale', C.cyan], ['Bulk', C.cyan]], null)]),
        frame('A new discount is a new class. The calculator never changes: open for extension, closed for modification.', [design([['Sale', C.cyan], ['Bulk', C.cyan], ['Student', C.green]], 'Student')]),
    ];
    return { title: 'Open/closed: add behaviour by adding classes, not editing old code', variants: [{ label: 'Discount rules', frames }] };
};

// ============ sd5-t5 · Liskov Substitution ============

const lsp = (): AnimationSpec => {
    const unit = 14;
    const shapeRect = (w: number, h: number, color: string, labelText: string) => [
        rect('shape', 230, 40, w * unit, h * unit, { rx: 3, fill: tint(color, 0.35), stroke: color, sw: 2 }),
        text('shape-t', 230 + (w * unit) / 2, 40 + (h * unit) / 2, labelText, { size: 12, fill: C.ink, weight: 800, mono: true }),
    ];
    const codeLines = (result: string, color: string) => [
        rect('code', 10, 30, 196, 104, { rx: 8, fill: '#161c24ff', stroke: C.faint, sw: 1 }),
        ...['s.set_width(5)', 's.set_height(4)', 'assert s.area() == 20'].map((l, i) => text(`c${i}`, 20, 50 + i * 20, l, { size: 11, fill: C.ink, weight: 600, mono: true, anchor: 'start' })),
        text('res', 20, 116, result, { size: 11, fill: color, weight: 800, mono: true, anchor: 'start' }),
    ];
    const frames: Frame[] = [
        frame('Code written for Rectangle relies on a promise: after set_width(5), the width is 5 and the height hasn\'t changed. Then set the height to 4: the area is 20.', [codeLines('area = 20 ✓', C.green), ...shapeRect(5, 4, C.green, '5 × 4')]),
        frame('Square inherits from Rectangle, and keeps its sides equal: set_height(4) ALSO sets the width to 4. The same code now gets 16 — the parent\'s promise is broken.', [codeLines('area = 16 ✗', C.red), ...shapeRect(4, 4, C.red, '4 × 4')]),
        frame('If calling code has to check "is this the special subclass?", Liskov is broken. Square isn\'t a true subtype of a CHANGEABLE Rectangle.', [codeLines('if isinstance(s, Square): …', C.amber), ...shapeRect(4, 4, C.amber, '?')]),
        frame('Fix the hierarchy: Rectangle and Square both implement a Shape interface with area(), and there are no setters that conflict. Every Shape keeps every promise of Shape.', [
            classBox('shape-i', 140, 30, 120, 'Shape', ['area()'], C.violet, { italic: true }),
            classBox('rect', 40, 130, 130, 'Rectangle', ['width, height'], C.green), classBox('sq', 230, 130, 130, 'Square', ['side'], C.green),
            arrow('ia', 105, 128, 170, 80, { stroke: C.grey, sw: 1.5, dash: '4 3' }), arrow('ib', 295, 128, 230, 80, { stroke: C.grey, sw: 1.5, dash: '4 3' }),
        ]),
    ];
    return { title: 'Liskov: a subclass must keep its parent\'s promises', variants: [{ label: 'Rectangle and Square', frames }] };
};

// ============ sd5-t6 · Interface Segregation ============

const isp = (): AnimationSpec => {
    const frames: Frame[] = [
        frame('One big Machine interface: print(), scan() and fax(). Every class that implements it must write all three.', [classBox('m', 130, 30, 140, 'Machine', ['print()', 'scan()', 'fax()'], C.violet, { italic: true })]),
        frame('A basic printer can only print, so it is forced to write empty methods that raise "not supported". A change to fax() still ripples into it.', [
            classBox('m', 130, 20, 140, 'Machine', ['print()', 'scan()', 'fax()'], C.violet, { italic: true }),
            classBox('bp', 130, 130, 140, 'BasicPrinter', ['print() ✓', 'scan()  raise ✗', 'fax()   raise ✗'], C.red, { on: C.red }),
            arrow('a', 200, 128, 200, 98, { stroke: C.grey, sw: 1.5, dash: '4 3' }),
        ]),
        frame('Split the interface by what clients actually need: Printer, Scanner, Fax. Each is small.', [
            classBox('p', 20, 30, 110, 'Printer', ['print()'], C.cyan, { italic: true }), classBox('s', 145, 30, 110, 'Scanner', ['scan()'], C.cyan, { italic: true }), classBox('f', 270, 30, 110, 'Fax', ['fax()'], C.cyan, { italic: true }),
        ]),
        frame('BasicPrinter implements only Printer. An office machine implements all three. Nobody writes methods they don\'t support.', [
            classBox('p', 20, 30, 110, 'Printer', ['print()'], C.cyan, { italic: true }), classBox('s', 145, 30, 110, 'Scanner', ['scan()'], C.cyan, { italic: true }), classBox('f', 270, 30, 110, 'Fax', ['fax()'], C.cyan, { italic: true }),
            classBox('bp', 20, 150, 120, 'BasicPrinter', ['print()'], C.green), classBox('om', 230, 150, 150, 'OfficeMachine', ['print() scan() fax()'], C.green),
            arrow('a1', 75, 148, 75, 74, { stroke: C.grey, sw: 1.5, dash: '4 3' }),
            arrow('a2', 270, 148, 80, 74, { stroke: C.grey, sw: 1.2, dash: '4 3' }), arrow('a3', 300, 148, 200, 74, { stroke: C.grey, sw: 1.2, dash: '4 3' }), arrow('a4', 330, 148, 325, 74, { stroke: C.grey, sw: 1.2, dash: '4 3' }),
        ]),
    ];
    return { title: 'Interface segregation: small interfaces, nothing forced', variants: [{ label: 'Printers', frames }] };
};

// ============ sd5-t7 · Dependency Inversion ============

const dip = (): AnimationSpec => {
    const service = classBox('svc', 130, 20, 140, 'OrderService', ['place(order)'], C.blue);
    const frames: Frame[] = [
        frame('OrderService creates a PostgresRepository inside itself. The high-level business code now depends on a low-level detail.', [service, classBox('pg', 130, 150, 140, 'PostgresRepository', ['save(order)'], C.grey), arrow('dep', 200, 66, 200, 148, { stroke: C.red, sw: 2 }), label('n', 210, 108, 'creates it directly', C.red, { size: 11 })]),
        frame('So you can\'t swap the database, and you can\'t test OrderService without a real database running.', [service, classBox('pg', 130, 150, 140, 'PostgresRepository', ['save(order)'], C.red, { on: C.red }), arrow('dep', 200, 66, 200, 148, { stroke: C.red, sw: 2 }), label('n', 210, 108, 'test needs a database ✗', C.red, { size: 11 })]),
        frame('Invert it: define the interface the business code needs — OrderRepository with save(order). OrderService depends on that; PostgresRepository implements it. Both arrows now point at the abstraction.', [
            service, classBox('iface', 130, 100, 140, 'OrderRepository', ['save(order)'], C.violet, { italic: true }),
            classBox('pg', 40, 180, 150, 'PostgresRepository', ['save(order)'], C.green),
            arrow('dep', 200, 66, 200, 98, { stroke: C.grey, sw: 2 }), arrow('impl', 115, 178, 170, 148, { stroke: C.grey, sw: 1.5, dash: '4 3' }),
        ]),
        frame('The real repository is passed in at start-up. In tests, pass an in-memory one instead — no database needed. OrderService never changed.', [
            service, classBox('iface', 130, 100, 140, 'OrderRepository', ['save(order)'], C.violet, { italic: true }),
            classBox('pg', 20, 180, 150, 'PostgresRepository', ['save(order)'], C.green), classBox('mem', 230, 180, 160, 'InMemoryRepository', ['save(order)'], C.amber, { on: C.amber }),
            arrow('dep', 200, 66, 200, 98, { stroke: C.grey, sw: 2 }), arrow('impl', 95, 178, 170, 148, { stroke: C.grey, sw: 1.5, dash: '4 3' }), arrow('impl2', 300, 178, 240, 148, { stroke: C.amber, sw: 1.5, dash: '4 3' }),
        ]),
    ];
    return { title: 'Dependency inversion: depend on an interface, pass the details in', variants: [{ label: 'Order repository', frames }] };
};

// ============ sd5-t9 · Concurrency: race conditions and locks ============

const concurrency = (): AnimationSpec => {
    const lane = (id: string, y: number, name: string, color: string): Part => [line(`${id}-l`, 70, y, 392, y, { stroke: color, sw: 2 }), text(`${id}-t`, 8, y, name, { size: 12, fill: color, weight: 700, anchor: 'start' })];
    const step = (id: string, x: number, y: number, value: string, color: string): Shape[] => [
        rect(`${id}-bg`, x, y - 11, 92, 22, { rx: 6, fill: C.bg, stroke: 'none' }),
        rect(id, x, y - 11, 92, 22, { rx: 6, fill: tint(color, 0.35), stroke: color, sw: 1.5, text: value, size: 9, weight: 700, mono: true }),
    ];
    const seat = (value: string, color: string) => rect('seat', 110, 196, 190, 28, { rx: 8, fill: tint(color, 0.35), stroke: color, sw: 2, text: `seats_left = ${value}`, size: 11, weight: 700, mono: true });
    const lanes: Part = [lane('a', 70, 'thread A', C.cyan), lane('b', 140, 'thread B', C.violet)];
    const race: Frame[] = [
        frame('One seat left. Two threads sell tickets at the same moment.', [lanes, seat('1', C.blue)]),
        frame('A reads seats_left = 1. B also reads seats_left = 1 — before A has written anything.', [lanes, step('a1', 80, 70, 'read → 1', C.cyan), step('b1', 110, 140, 'read → 1', C.violet), seat('1', C.blue)]),
        frame('A sells the seat and writes 0. B, still believing there is 1 left, sells it too and writes 0. Two tickets for one seat — a lost update.', [lanes, step('a1', 80, 70, 'read → 1', C.cyan), step('b1', 110, 140, 'read → 1', C.violet), step('a2', 190, 70, 'sell, write 0', C.cyan), step('b2', 220, 140, 'sell, write 0', C.red), seat('0 (sold twice!)', C.red)]),
    ];
    const lock: Frame[] = [
        frame('Fix: wrap "read, check, write" in a lock, so only one thread runs that critical section at a time.', [lanes, seat('1', C.blue), rect('lock', 80, 52, 184, 36, { rx: 8, fill: 'none', stroke: C.amber, sw: 2, dash: '5 4' })]),
        frame('A takes the lock, reads 1, sells, writes 0, and releases it. B has to wait.', [lanes, rect('lock', 80, 52, 214, 36, { rx: 8, fill: 'none', stroke: C.amber, sw: 2, dash: '5 4' }), step('a1', 86, 70, 'read → 1', C.cyan), step('a2', 196, 70, 'sell, write 0', C.cyan), step('bw', 86, 140, 'waiting…', C.grey), seat('0', C.green)]),
        frame('Then B gets the lock, reads 0, and refuses. One seat, one ticket.', [lanes, step('a1', 86, 70, 'read → 1', C.cyan), step('a2', 196, 70, 'sell, write 0', C.cyan), step('b1', 300, 140, 'read → 0: no', C.green), seat('0', C.green)]),
        frame('Across many servers a lock inside one program can\'t help. Do it in the database: UPDATE seats SET sold = true WHERE id = 7 AND sold = false — and check exactly one row changed.', [label('sql', 20, 90, 'UPDATE seats SET sold = true', C.cyan, { size: 12 }), label('sql2', 20, 110, 'WHERE id = 7 AND sold = false', C.cyan, { size: 12 }), label('sql3', 20, 140, '→ 1 row changed: you got it', C.green, { size: 12 }), label('sql4', 20, 160, '→ 0 rows changed: someone else did', C.red, { size: 12 })]),
    ];
    return { title: 'A race condition, and how a lock prevents it', variants: [{ label: 'The race', frames: race }, { label: 'With a lock', frames: lock }] };
};

// ============ sd6-t1 · Singleton ============

const singleton = (): AnimationSpec => {
    const lanes: Part = [line('la', 70, 60, 392, 60, { stroke: C.cyan, sw: 2 }), text('lat', 8, 60, 'thread 1', { size: 11, fill: C.cyan, weight: 700, anchor: 'start' }), line('lb', 70, 130, 392, 130, { stroke: C.violet, sw: 2 }), text('lbt', 8, 130, 'thread 2', { size: 11, fill: C.violet, weight: 700, anchor: 'start' })];
    const step = (id: string, x: number, y: number, value: string, color: string): Shape[] => [
        rect(`${id}-bg`, x, y - 11, 124, 22, { rx: 6, fill: C.bg, stroke: 'none' }),
        rect(id, x, y - 11, 124, 22, { rx: 6, fill: tint(color, 0.35), stroke: color, sw: 1.5, text: value, size: 9, weight: 700, mono: true }),
    ];
    const instances = (n: number, color: string) => Array.from({ length: n }, (_, i) => rect(`inst${i}`, 120 + i * 100, 180, 90, 30, { rx: 8, fill: tint(color, 0.4), stroke: color, sw: 2, text: `Config #${i + 1}`, size: 11, weight: 700, mono: true }));
    const frames: Frame[] = [
        frame('A Singleton keeps one hidden instance and hands it out to everyone — a config object, say. get_instance() checks: is there one yet? If not, create it.', [lanes, instances(0, C.green)]),
        frame('Without care, two threads can check at the same moment, both see "none yet"…', [lanes, step('c1', 80, 60, 'none yet? yes', C.cyan), step('c2', 96, 130, 'none yet? yes', C.violet)]),
        frame('…and both create one. Now there are two "single" instances.', [lanes, step('c1', 80, 60, 'none yet? yes', C.cyan), step('c2', 96, 130, 'none yet? yes', C.violet), step('m1', 212, 60, 'create', C.red), step('m2', 228, 130, 'create', C.red), instances(2, C.red)]),
        frame('Fix: wrap creation in a lock, and check again inside it. Thread 1 creates the instance; thread 2 waits, checks again, finds it, and returns the same one.', [lanes, step('c1', 80, 60, 'lock · check · create', C.cyan), step('c2', 216, 130, 'lock · check · reuse', C.green), instances(1, C.green)]),
        frame('The price: it is global state. It hides dependencies and makes tests share one object. Often it is cleaner to create one instance at start-up and pass it in.', [lanes, instances(1, C.amber)]),
    ];
    return { title: 'Singleton: exactly one instance — even with threads', variants: [{ label: 'Two threads', frames }] };
};

// ============ sd6-t2 · Factory ============

const factory = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'svc', x: 6, y: 100, w: 90, label: 'order service', color: C.blue, size: 10 },
        { id: 'fac', x: 140, y: 94, w: 110, h: 46, label: 'NotifierFactory\n{name → class}', color: C.violet, size: 9 },
        { id: 'email', x: 296, y: 20, w: 98, label: 'EmailNotifier', color: C.cyan, size: 9 },
        { id: 'sms', x: 296, y: 72, w: 98, label: 'SmsNotifier', color: C.cyan, size: 9 },
        { id: 'push', x: 296, y: 124, w: 98, label: 'PushNotifier', color: C.cyan, size: 9 },
        { id: 'wa', x: 296, y: 176, w: 98, label: 'WhatsApp…', color: C.green, size: 9 },
    ];
    const edges: FEdge[] = [{ from: 'svc', to: 'fac' }, { from: 'fac', to: 'email' }, { from: 'fac', to: 'sms' }, { from: 'fac', to: 'push' }, { from: 'fac', to: 'wa' }];
    const base = ['svc', 'fac', 'email', 'sms', 'push'];
    const frames = flow(nodes, edges, [
        { caption: 'Every notifier implements one interface: send(message). The decision "which class?" lives in ONE place — a factory holding a dictionary from name to class.', show: base },
        { caption: 'The order service asks the factory for "sms". It never writes SmsNotifier() itself.', show: base, hot: ['svc>fac'], packets: [{ id: 'r', label: "create('sms')", at: 'fac' }] },
        { caption: 'The factory looks "sms" up and returns an SmsNotifier. The service only uses it through the interface: notifier.send("Your order shipped").', show: base, hot: ['fac>sms'], ok: ['sms'], packets: [{ id: 'r', label: 'SmsNotifier', at: ['fac', 'sms', 0.6] }] },
        { caption: 'Adding WhatsApp means one new class and one new dictionary entry. No caller changes at all.', ok: ['wa'], hot: ['fac>wa'], badges: { fac: "+ 'whatsapp'" } },
    ]);
    return { title: 'Factory: one place decides which class to create', variants: [{ label: 'Notifiers', frames }] };
};

// ============ sd6-t3 · Builder ============

const builder = (): AnimationSpec => {
    const fields: [string, string][] = [['url', "'/v1/orders'"], ['method', "'POST'"], ['header', "auth token"], ['body', '{…}'], ['timeout', '5 s']];
    const form = (filled: number, built: boolean, color: string = C.blue) => [
        rect('req', 220, 30, 172, 26 + fields.length * 22, { rx: 8, fill: tint(built ? C.green : color, built ? 0.2 : 0.06), stroke: built ? C.green : color, sw: 2 }),
        text('req-t', 306, 44, built ? 'Request (read-only)' : 'RequestBuilder', { size: 11, fill: built ? C.green : color, weight: 800 }),
        ...fields.map(([k, v], i) => text(`f${i}`, 230, 66 + i * 22, `${k.padEnd(8)}${i < filled ? v : '—'}`, { size: 10, fill: i < filled ? C.ink : C.dim, weight: 700, mono: true, anchor: 'start' })),
    ];
    const chain = (upTo: number) => ['Request.builder()', ...fields.map(([k, v]) => `.${k}(${v.replace(/'/g, '')})`), '.build()'].slice(0, upTo + 1)
        .map((c, i) => text(`ch${i}`, 12, 40 + i * 22, c, { size: 10, fill: i === upTo ? C.amber : C.ink, weight: 700, mono: true, anchor: 'start' }));
    const frames: Frame[] = [
        frame('A request has many optional parts. A constructor with all of them in a row — Request(url, method, None, None, 5…) — is unreadable and easy to get wrong.', [chain(0), form(0, false)]),
        ...fields.map((_, i) => frame(i === 0 ? 'A builder sets each part with a clearly named method, starting from sensible defaults. Each method returns the builder, so the calls chain.' : `.${fields[i][0]}(…) sets one more part.`, [chain(i + 1), form(i + 1, false)], i === 0 ? undefined : 1800)),
        frame('build() checks the combination is valid — the URL is set, the timeout is in range — then returns the finished object, which can be read-only.', [chain(fields.length + 1), form(fields.length, true)]),
    ];
    return { title: 'Builder: set the parts by name, then build once', variants: [{ label: 'An HTTP request', frames }] };
};

// ============ sd6-t4 · Adapter ============

const adapter = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'code', x: 6, y: 96, w: 84, h: 42, label: 'your code\npay(pounds)', color: C.blue, size: 10 },
        { id: 'adp', x: 160, y: 90, w: 96, h: 54, label: 'Payment\nAdapter', color: C.amber, size: 10 },
        { id: 'sdk', x: 318, y: 96, w: 76, h: 42, label: 'bank SDK\nmake_payment(\npence, currency)', color: C.violet, size: 8 },
    ];
    const edges: FEdge[] = [{ from: 'code', to: 'adp' }, { from: 'adp', to: 'sdk' }];
    const frames = flow(nodes, edges, [
        { caption: 'Your code expects pay(amount_in_pounds) → True/False. A third-party bank SDK offers make_payment(pence, currency) → "OK" or an error code. They don\'t fit.' },
        { caption: 'An adapter implements YOUR interface and holds the SDK. Your code calls pay(12.50) as usual.', hot: ['code>adp'], packets: [{ id: 'c', label: 'pay(12.50)', at: ['code', 'adp', 0.5] }] },
        { caption: 'The adapter converts the inputs — £12.50 → 1250 pence, currency "GBP" — and calls the SDK.', hot: ['adp>sdk'], lit: ['adp'], packets: [{ id: 'c', label: '1250p GBP', at: ['adp', 'sdk', 0.5] }] },
        { caption: 'It converts the output back: "OK" becomes True. Your code never knew the SDK existed.', hot: ['code>adp'], ok: ['code'], packets: [{ id: 'c', label: 'True', at: 'code', color: C.green }] },
        { caption: 'An error code like "E42" becomes a proper exception — PaymentDeclined — rather than being silently swallowed.', bad: ['code'], packets: [{ id: 'c', label: 'PaymentDeclined', at: 'code', color: C.red }] },
    ]);
    return { title: 'Adapter: translate between the interface you want and the one you have', variants: [{ label: 'A payment SDK', frames }] };
};

// ============ sd6-t5 · Decorator ============

const decorator = (): AnimationSpec => {
    const layer = (id: string, x: number, y: number, w: number, h: number, name: string, color: string, on: boolean) => [
        rect(id, x, y, w, h, { rx: 12, fill: tint(color, on ? 0.25 : 0.08), stroke: color, sw: on ? 2.5 : 1.5 }),
        text(`${id}-t`, x + 10, y + 12, name, { size: 10, fill: color, weight: 800, mono: true, anchor: 'start' }),
    ];
    const stack = (on: string[]) => [
        layer('log', 60, 30, 280, 170, 'Logging', C.violet, on.includes('log')),
        layer('cache', 85, 58, 230, 118, 'Caching', C.amber, on.includes('cache')),
        layer('real', 110, 86, 180, 66, 'RealDataSource', C.cyan, on.includes('real')),
    ];
    const msg = (x: number, y: number, value: string, color: string = C.amber) => rect('msg', x, y, 96, 18, { rx: 9, fill: tint(color, 0.85), stroke: C.bg, sw: 1, text: value, size: 9, weight: 800, textColor: '#0b0f14ff', mono: true });
    const frames: Frame[] = [
        frame('Wrappers, one inside another: Logging(Caching(RealDataSource())). Each implements the same read() and holds the next one in.', [stack([])]),
        frame('A caller calls read(). The outer wrapper, Logging, writes a log line, then calls the object inside it.', [stack(['log']), msg(152, 34, 'read()'), label('note', 60, 220, 'log: read() called', C.violet, { size: 11 })]),
        frame('Caching checks its cache: a miss, so it passes the call inward.', [stack(['log', 'cache']), msg(152, 62, 'read() · miss')]),
        frame('The real object does the work, and the answer travels back out through each wrapper — Caching keeps a copy on the way.', [stack(['real']), msg(152, 112, 'data', C.green)]),
        frame('Call read() again: Caching answers from its copy and never bothers the real object. Callers can\'t tell any wrapper is there — they just call read().', [stack(['log', 'cache']), msg(152, 62, 'hit → data', C.green)]),
    ];
    return { title: 'Decorator: add features by wrapping, one layer each', variants: [{ label: 'Logging(Caching(Real))', frames }] };
};

// ============ sd6-t6 · Facade ============

const facade = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'caller', x: 6, y: 100, w: 70, label: 'caller', kind: 'client', color: C.cyan },
        { id: 'fac', x: 110, y: 92, w: 110, h: 50, label: 'CheckoutFacade\nplace_order()', color: C.amber, size: 9 },
        { id: 'inv', x: 280, y: 14, w: 114, label: 'inventory', color: C.violet },
        { id: 'pay', x: 280, y: 68, w: 114, label: 'payment', color: C.violet },
        { id: 'ship', x: 280, y: 122, w: 114, label: 'shipping', color: C.violet },
        { id: 'note', x: 280, y: 176, w: 114, label: 'notifications', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'caller', to: 'fac' }, { from: 'fac', to: 'inv' }, { from: 'fac', to: 'pay' }, { from: 'fac', to: 'ship' }, { from: 'fac', to: 'note' }];
    const steps: [string, string, string][] = [['inv', 'reserve()', 'Reserve the stock'], ['pay', 'charge()', 'charge the card'], ['ship', 'create()', 'create the shipment'], ['note', 'send()', 'send the confirmation']];
    const done: string[] = [];
    const frames = flow(nodes, edges, [
        { caption: 'Placing an order touches four subsystems, in the right order. Without help, every caller would repeat all those steps — and get the order wrong somewhere.' },
        { caption: 'A facade offers ONE method for the common task: place_order(cart).', hot: ['caller>fac'], lit: ['fac'], packets: [{ id: 'c', label: 'place_order()', at: 'fac' }] },
        ...steps.map(([id, call, what]) => {
            done.push(id);
            return { caption: `${what}: the facade calls ${id === 'inv' ? 'inventory' : id === 'pay' ? 'payment' : id === 'ship' ? 'shipping' : 'notifications'}.${call}.`, hot: [`fac>${id}`], ok: [...done], packets: [{ id: 'c', label: call, at: ['fac', id, 0.6] as [string, string, number] }], hold: 2200 };
        }),
        { caption: 'Callers make one call; advanced callers can still use the subsystems directly. Keep the facade thin, or it grows into a "god class".', ok: ['inv', 'pay', 'ship', 'note'], packets: [{ id: 'c', label: 'done', at: ['caller', 'fac', 0.5], color: C.green }] },
    ]);
    return { title: 'Facade: one simple method in front of a busy subsystem', variants: [{ label: 'Checkout', frames }] };
};

// ============ sd6-t7 · Strategy ============

const strategy = (): AnimationSpec => {
    const km = 10;
    const normal = (d: number) => 2.5 + d * 1.2;
    const surge = (d: number) => normal(d) * 1.8;
    const money = (v: number) => `£${v.toFixed(2)}`;
    const nodes: FNode[] = [
        { id: 'ride', x: 20, y: 96, w: 110, h: 46, label: 'Ride\nprice(10 km)', color: C.blue, size: 10 },
        { id: 'normal', x: 260, y: 40, w: 130, h: 40, label: 'NormalPricing', color: C.cyan, size: 10 },
        { id: 'surge', x: 260, y: 150, w: 130, h: 40, label: 'SurgePricing', color: C.amber, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'ride', to: 'normal' }, { from: 'ride', to: 'surge' }];
    const frames = flow(nodes, edges, [
        { caption: 'Instead of an if/elif on the pricing type inside Ride, each pricing rule is its own class with the same method: price(distance_km).' },
        { caption: `Ride holds one strategy and just calls it. Normal pricing for ${km} km: ${money(normal(km))}.`, hot: ['ride>normal'], ok: ['normal'], dim: ['surge'], packets: [{ id: 'p', label: money(normal(km)), at: ['ride', 'normal', 0.5] }] },
        { caption: `Rush hour: swap the strategy at runtime — from configuration, a factory or the clock. Same Ride, same call: ${money(surge(km))}.`, hot: ['ride>surge'], lit: ['surge'], dim: ['normal'], packets: [{ id: 'p', label: money(surge(km)), at: ['ride', 'surge', 0.5] }] },
        { caption: 'A new rule is a new class. Ride never changes, and each strategy can be tested on its own.', ok: ['normal', 'surge'] },
    ]);
    return { title: 'Strategy: swap the algorithm without touching its user', variants: [{ label: 'Ride pricing', frames }] };
};

// ============ sd6-t8 · Observer ============

const observer = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'order', x: 10, y: 96, w: 110, h: 46, label: 'Order\n(subject)', color: C.blue, size: 10 },
        { id: 'email', x: 280, y: 14, w: 110, label: 'email', color: C.cyan },
        { id: 'analytics', x: 280, y: 68, w: 110, label: 'analytics', color: C.cyan },
        { id: 'stock', x: 280, y: 122, w: 110, label: 'stock', color: C.cyan },
        { id: 'loyalty', x: 280, y: 176, w: 110, label: 'loyalty points', color: C.green, size: 10 },
    ];
    const edges: FEdge[] = ['email', 'analytics', 'stock', 'loyalty'].map(to => ({ from: 'order', to }));
    const subs = ['email', 'analytics', 'stock'];
    const frames = flow(nodes, edges, [
        { caption: 'Several parts of the program care when an order is placed. Instead of the order code calling each one, they SUBSCRIBE: the subject keeps a list.', show: ['order', ...subs], badges: { order: '3 subscribers' } },
        { caption: 'The event happens. The subject loops through its list and calls each subscriber with the details: "order 981 placed".', show: ['order', ...subs], hot: subs.map(s => `order>${s}`), packets: subs.map(s => ({ id: `e${s}`, label: '981 placed', at: ['order', s, 0.6] as [string, string, number] })) },
        { caption: 'Each reacts in its own way: send an email, record a metric, reduce the stock. The order code doesn\'t know or care what they do.', show: ['order', ...subs], ok: subs },
        { caption: 'A new reaction — loyalty points — just subscribes itself. The subject never changes. Subscribers can unsubscribe when they no longer care.', ok: ['loyalty'], hot: ['order>loyalty'], badges: { order: '4 subscribers' } },
    ]);
    return { title: 'Observer: publish once, every subscriber reacts', variants: [{ label: 'Order placed', frames }] };
};

// ============ sd6-t9 · Chain of Responsibility ============

const chain = (): AnimationSpec => {
    const nodes: FNode[] = [
        { id: 'req', x: 6, y: 100, w: 70, label: 'expense', kind: 'client', color: C.cyan },
        { id: 'lead', x: 110, y: 96, w: 82, h: 42, label: 'team lead\n≤ £100', color: C.violet, size: 10 },
        { id: 'mgr', x: 214, y: 96, w: 82, h: 42, label: 'manager\n≤ £1,000', color: C.violet, size: 10 },
        { id: 'dir', x: 316, y: 96, w: 78, h: 42, label: 'director\nabove', color: C.violet, size: 10 },
    ];
    const edges: FEdge[] = [{ from: 'req', to: 'lead' }, { from: 'lead', to: 'mgr' }, { from: 'mgr', to: 'dir' }];
    const run = (amount: number) => {
        const limits: [string, number][] = [['lead', 100], ['mgr', 1000], ['dir', Infinity]];
        return limits.findIndex(([, l]) => amount <= l);
    };
    const who = ['lead', 'mgr', 'dir'];
    const names = ['the team lead', 'the manager', 'the director'];
    const trace = (amount: number) => {
        const stop = run(amount);
        return [
            { caption: `An expense of £${amount} goes to the first handler in the chain.`, hot: ['req>lead'], packets: [{ id: `x${amount}`, label: `£${amount}`, at: ['req', 'lead', 0.5] as [string, string, number] }] },
            ...who.slice(0, stop + 1).map((h, i) => (i < stop
                ? { caption: `£${amount} is over ${names[i]}'s limit, so ${names[i]} passes it to the next handler.`, lit: [h], hot: [`${h}>${who[i + 1]}`], packets: [{ id: `x${amount}`, label: `£${amount}`, at: [h, who[i + 1], 0.5] as [string, string, number] }] }
                : { caption: `£${amount} is within ${names[i]}'s limit: approved here. It goes no further.`, ok: [h], packets: [{ id: `x${amount}`, label: `£${amount} ✓`, at: h, color: C.green }] })),
        ];
    };
    const frames = flow(nodes, edges, [
        { caption: 'Each handler decides: deal with the request, or pass it to the next handler it holds. The handlers are independent and can be reordered.' },
        ...trace(60),
        ...trace(700),
        { caption: 'A default handler at the end rejects or logs anything nobody handled. The same shape runs web middleware: authentication → rate limit → validation → handler.', lit: ['dir'] },
    ]);
    return { title: 'Chain of responsibility: pass it along until someone handles it', variants: [{ label: 'Expense approval', frames }] };
};

// ============ sd6-t10 · State ============

const statePattern = (): AnimationSpec => {
    const states: Record<string, [number, number, string]> = { idle: [80, 110, 'Idle'], coin: [230, 60, 'HasCoin'], vend: [230, 170, 'Dispensing'] };
    const diagram = (current: string, hot: string | null, event: string | null, reply: [string, string] | null): Part => [
        path('t1', [[118, 98], [160, 70], [190, 62]], { stroke: hot === 'insert' ? C.amber : C.dim, sw: 2, arrow: true }),
        path('t2', [[262, 86], [262, 130], [262, 140]], { stroke: hot === 'select' ? C.amber : C.dim, sw: 2, arrow: true }),
        path('t3', [[192, 172], [140, 150], [114, 128]], { stroke: hot === 'done' ? C.amber : C.dim, sw: 2, arrow: true }),
        text('t1t', 140, 64, 'insert coin', { size: 9, fill: C.grey, weight: 700, mono: true }),
        text('t2t', 300, 116, 'select', { size: 9, fill: C.grey, weight: 700, mono: true }),
        text('t3t', 128, 176, 'item out', { size: 9, fill: C.grey, weight: 700, mono: true }),
        Object.entries(states).map(([id, [x, y, name]]) => circle(`st-${id}`, x, y, id === 'idle' ? 36 : 34, { fill: tint(id === current ? C.amber : C.violet, id === current ? 0.5 : 0.18), stroke: id === current ? C.amber : C.violet, sw: id === current ? 3 : 1.5, text: name, size: 10, weight: 800 })),
        event !== null && rect('ev', 8, 14, 110, 22, { rx: 11, fill: tint(C.cyan, 0.5), stroke: C.cyan, sw: 1, text: event, size: 10, weight: 700, mono: true }),
        reply && label('reply', 8, 222, reply[0], reply[1], { size: 11 }),
    ];
    const frames: Frame[] = [
        frame('A vending machine reacts to the same button differently depending on its mode. Each mode is a State class that handles every event and decides the next state.', [diagram('idle', null, null, null)]),
        frame('Idle + "select an item": not allowed yet. The Idle state answers with a clear message instead of doing something wrong.', [diagram('idle', null, 'select', ['Idle: insert a coin first', C.red])]),
        frame('Idle + "insert coin": valid. Idle handles it and moves the machine to HasCoin.', [diagram('coin', 'insert', 'insert coin', ['Idle → HasCoin', C.green])]),
        frame('HasCoin + "insert coin" again: this state already holds a coin, so it says so. Same event, different behaviour — no if/elif on a status variable anywhere.', [diagram('coin', null, 'insert coin', ['HasCoin: already have a coin', C.amber])]),
        frame('HasCoin + "select": move to Dispensing, which drops the item and returns the machine to Idle.', [diagram('vend', 'select', 'select', ['HasCoin → Dispensing', C.green])]),
        frame('Back to Idle, ready for the next customer. The machine just forwards every event to its current state object.', [diagram('idle', 'done', null, ['Dispensing → Idle', C.green])]),
    ];
    return { title: 'State: each mode is an object that knows what each event means', variants: [{ label: 'Vending machine', frames }] };
};

export const phase56Animations: Record<string, () => AnimationSpec> = {
    'sd5-t1': fourPillars,
    'sd5-t2': composition,
    'sd5-t3': srp,
    'sd5-t4': ocp,
    'sd5-t5': lsp,
    'sd5-t6': isp,
    'sd5-t7': dip,
    'sd5-t9': concurrency,
    'sd6-t1': singleton,
    'sd6-t2': factory,
    'sd6-t3': builder,
    'sd6-t4': adapter,
    'sd6-t5': decorator,
    'sd6-t6': facade,
    'sd6-t7': strategy,
    'sd6-t8': observer,
    'sd6-t9': chain,
    'sd6-t10': statePattern,
};
