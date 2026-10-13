import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import {
    C,
    I2,
    apply,
    arrow,
    axes,
    axisLines,
    bars,
    box,
    chips,
    circle,
    dot,
    fnPath,
    frame,
    gaussian,
    line,
    lineInBox,
    lit,
    matmul,
    path,
    plane,
    planeGrid,
    planeLine,
    planePoly,
    pt,
    px,
    py,
    range,
    rect,
    round,
    seeded,
    text,
    tint,
    toPx,
    vec,
    type Mat2,
    type Part,
} from '../../components/learning/anim/kit';

// Phase 1 · Math. Numbers in captions are either worked out here from the same
// formulas, or were checked by running them (see the lesson notes).

const label = (id: string, x: number, y: number, value: string, color: string = C.ink, o: { size?: number; anchor?: 'start' | 'middle' | 'end'; mono?: boolean } = {}) =>
    text(id, x, y, value, { size: o.size ?? 13, fill: color, weight: 700, anchor: o.anchor ?? 'start', mono: o.mono ?? true });

const matLabel = (value: string, color: string = C.ink) => rect('mat', 8, 8, 8 + value.length * 7.6, 24, { rx: 6, fill: '#0d1117e6', stroke: C.faint, sw: 1, text: value, textColor: color, size: 12, mono: true, weight: 700 });

// ============ f1-t1 · Vectors, span and basis ============

const spanBasis = (): AnimationSpec => {
    const p = plane(170, 150, 26);
    const grid = planeGrid('g', p);
    const tipLabel = (id: string, x: number, y: number, value: string, color: string, dx = 6, dy = -10) => {
        const [cx, cy] = toPx(p, x, y);
        return label(id, cx + dx, cy + dy, value, color, { size: 12 });
    };
    const spanDots = (dirs: [number, number][]) => {
        const out: Shape[] = [];
        let k = 0;
        for (let a = -7; a <= 8; a++) {
            for (let b = -4; b <= 5; b++) {
                const [x, y] = [a * dirs[0][0] + b * dirs[1][0], a * dirs[0][1] + b * dirs[1][1]];
                const [cx, cy] = toPx(p, x, y);
                if (cx < 6 || cx > 394 || cy < 6 || cy > 234) continue;
                out.push(circle(`s${k++}`, cx, cy, 2.6, { fill: C.yellow, opacity: 0.75 }));
            }
        }
        return out;
    };
    const lineDots = Array.from({ length: 25 }, (_, i) => {
        const t = (i - 12) * 0.35;
        const [cx, cy] = toPx(p, t, 2 * t);
        return cy > 4 && cy < 236 ? circle(`s${i}`, cx, cy, 2.6, { fill: C.yellow, opacity: 0.85 }) : null;
    });
    return {
        title: 'Building every point from two arrows',
        variants: [{
            label: 'Span and basis',
            frames: [
                frame('Two arrows: [1, 0] in green and [0, 1] in pink. A vector is an arrow from the origin, and also simply a list of numbers.', [grid, vec('u', p, 1, 0, C.green), vec('v', p, 0, 1, C.pink), tipLabel('ul', 1, 0, '[1, 0]', C.green, 4, 12), tipLabel('vl', 0, 1, '[0, 1]', C.pink, -46, -8)]),
                frame('Scale: 3·[1, 0] = [3, 0]. Multiplying by a number stretches the arrow; a negative number would flip it round.', [grid, vec('u', p, 3, 0, C.green), vec('v', p, 0, 1, C.pink), tipLabel('ul', 3, 0, '3·[1, 0]', C.green, -20, 14), tipLabel('vl', 0, 1, '[0, 1]', C.pink, -46, -8)]),
                frame('Add tip to tail: 3·[1, 0] + 2·[0, 1] = [3, 2]. Scaling some vectors and adding them up is called a linear combination.', [grid, vec('u', p, 3, 0, C.green), vec('v', p, 3, 2, C.pink, { from: [3, 0] }), vec('sum', p, 3, 2, C.yellow), tipLabel('ul', 3, 0, '3·[1, 0]', C.green, -20, 14), tipLabel('vl', 3, 1, '2·[0, 1]', C.pink, 6, 0), tipLabel('sl', 3, 2, '[3, 2]', C.yellow, 6, -8)]),
                frame('Try every pair of weights and the dots fill the whole plane. The span of [1, 0] and [0, 1] is everything, so these two arrows form a basis.', [grid, spanDots([[1, 0], [0, 1]]), vec('u', p, 1, 0, C.green), vec('v', p, 0, 1, C.pink)]),
                frame('Now [1, 2] and [2, 4]. The second is just 2 × the first, so every combination lands on one line. Their span is a line: they are dependent, and not a basis.', [
                    grid, planeLine('ln', p, [-3, -6], [3, 6], { stroke: C.yellow, sw: 1.5, dash: '5 4' }), lineDots,
                    vec('v', p, 2, 4, C.pink, { sw: 5 }), vec('u', p, 1, 2, C.green),
                    tipLabel('ul', 1, 2, '[1, 2]', C.green, 8, 6), tipLabel('vl', 2, 4, '[2, 4]', C.pink, 8, 4),
                ]),
            ],
        }],
    };
};

// ============ f1-t2 · Matrices as transformations ============

const transforms = (): AnimationSpec => {
    const p = plane(200, 132, 26);
    const scene = (m: Mat2, extra: Part[] = [], mat = '') => [
        planeGrid('g', p, m),
        vec('i', p, ...apply(m, 1, 0), C.green),
        vec('j', p, ...apply(m, 0, 1), C.pink),
        extra,
        mat ? matLabel(mat) : null,
    ];
    const stretch: Mat2 = [[2, 0], [0, 1.5]];
    const shear: Mat2 = [[1, 1], [0, 1]];
    const A: Mat2 = [[1, 1], [0, 1]];
    const R: Mat2 = [[0, -1], [1, 0]];
    const square: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const sq = (m: Mat2) => planePoly('sq', p, square, m, { fill: tint(C.yellow, 0.35), stroke: C.yellow, sw: 2 });
    const v = (m: Mat2) => vec('v', p, ...apply(m, 1, 1), C.yellow, { sw: 3 });
    return {
        title: 'A matrix moves the whole grid at once',
        variants: [
            {
                label: 'Stretch',
                frames: [
                    frame('Before: the ordinary grid. Green î = [1, 0], pink ĵ = [0, 1], and a yellow vector [1, 1].', [scene(I2, [v(I2)], 'A = [[2, 0], [0, 1.5]]')]),
                    frame('Apply A. î lands on [2, 0] and ĵ on [0, 1.5]: exactly the two columns of A. Grid lines stay straight, parallel and evenly spaced.', [scene(stretch, [v(stretch)], 'A = [[2, 0], [0, 1.5]]')]),
                    frame('[1, 1] is 1·î + 1·ĵ, so it lands on 1·[2, 0] + 1·[0, 1.5] = [2, 1.5]. Know where the columns go, and you know where everything goes.', [scene(stretch, [vec('vi', p, 2, 0, C.green, { sw: 2, dash: '4 3' }), vec('vj', p, 2, 1.5, C.pink, { sw: 2, dash: '4 3', from: [2, 0] }), v(stretch), label('vl', ...toPx(p, 2.1, 1.7), '[2, 1.5]', C.yellow)], 'A = [[2, 0], [0, 1.5]]')]),
                ],
            },
            {
                label: 'Shear',
                frames: [
                    frame('A shear: [[1, 1], [0, 1]]. Start from the ordinary grid.', [scene(I2, [sq(I2)], 'S = [[1, 1], [0, 1]]')]),
                    frame('î stays at [1, 0]; ĵ tips over to [1, 1]. Every square leans into a parallelogram, but lines stay straight and the origin stays put.', [scene(shear, [sq(shear)], 'S = [[1, 1], [0, 1]]')]),
                ],
            },
            {
                label: 'Order matters',
                frames: [
                    frame('A yellow unit square. R rotates by 90°; S shears (pushes the top sideways). Does the order matter?', [scene(I2, [sq(I2)], 'R first, then S')]),
                    frame('First R: the square turns a quarter-turn anticlockwise.', [scene(R, [sq(R)], 'R first, then S')]),
                    frame('Then S shears it. This combined move is the product S·R (read right to left).', [scene(matmul(A, R), [sq(matmul(A, R))], 'S·R = [[1, -1], [1, 0]]')]),
                    frame('Now the other order. Back to the start…', [scene(I2, [sq(I2)], 'S first, then R')]),
                    frame('First S: the square leans over.', [scene(A, [sq(A)], 'S first, then R')]),
                    frame('Then R turns it. R·S lands in a different place from S·R, so for matrices AB ≠ BA: the order matters.', [scene(matmul(R, A), [sq(matmul(R, A))], 'R·S = [[0, -1], [1, 1]]')]),
                ],
            },
        ],
    };
};

// ============ f1-t3 · Determinants ============

const determinants = (): AnimationSpec => {
    const p = plane(150, 160, 34);
    const square: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const step = (m: Mat2, color: string, det: string, note: string, mat: string): Part[] => [
        planeGrid('g', p, m),
        planePoly('sq', p, square, m, { fill: tint(color, 0.45), stroke: color, sw: 2.5 }),
        vec('i', p, ...apply(m, 1, 0), C.green),
        vec('j', p, ...apply(m, 0, 1), C.pink),
        rect('panel', 262, 14, 128, 74, { rx: 8, fill: '#0d1117e6', stroke: color, sw: 1.5 }),
        label('det', 326, 38, det, color, { anchor: 'middle', size: 16 }),
        label('note', 326, 64, note, C.ink, { anchor: 'middle', size: 11, mono: false }),
        matLabel(mat),
    ];
    return {
        title: 'The determinant: how much area grows, and whether space flips',
        variants: [{
            label: 'Five matrices',
            frames: [
                frame('The unit square has area 1. The determinant of a matrix is the area this square has after the matrix moves it.', [step(I2, C.yellow, 'det = 1', 'area 1', 'I = [[1, 0], [0, 1]]')]),
                frame('[[2, 0], [0, 1.5]] stretches x by 2 and y by 1.5. The square becomes a 2 × 1.5 rectangle: det = 3, so every area triples.', [step([[2, 0], [0, 1.5]], C.cyan, 'det = 3', 'areas × 3', '[[2, 0], [0, 1.5]]')]),
                frame('A shear [[1, 1], [0, 1]] leans the square over. Same base, same height, so the area is still 1: det = 1·1 − 1·0 = 1.', [step([[1, 1], [0, 1]], C.green, 'det = 1', 'leans, same area', '[[1, 1], [0, 1]]')]),
                frame('[[0, 1], [1, 0]] swaps x and y. The area is still 1, but î and ĵ have changed places: space is flipped like a mirror image. det = −1.', [step([[0, 1], [1, 0]], C.pink, 'det = −1', 'flipped over', '[[0, 1], [1, 0]]')]),
                frame('[[1, 2], [0.5, 1]]: both columns lie on the same line, so the square is squashed flat. Area 0, det = 1·1 − 2·0.5 = 0. This matrix can\'t be undone.', [step([[1, 2], [0.5, 1]], C.red, 'det = 0', 'squashed flat', '[[1, 2], [0.5, 1]]')]),
            ],
        }],
    };
};

// ============ f1-t4 · Inverse, rank and solving Ax = b ============

const inverseRank = (): AnimationSpec => {
    const p = plane(110, 196, 22);
    const A: Mat2 = [[2, 1], [1, 3]];
    const bDot = (labelText: string, x: number, y: number, color: string = C.red) => {
        const [cx, cy] = toPx(p, x, y);
        return [circle('b', cx, cy, 7, { fill: 'none', stroke: color, sw: 3 }), label('bl', cx + 10, cy - 10, labelText, color, { size: 12 })];
    };
    const solve: Frame[] = [
        frame('Solve 2x + y = 3 and x + 3y = 5. As a matrix: which vector does A = [[2, 1], [1, 3]] move onto b = [3, 5]?', [planeGrid('g', p, I2), vec('x', p, 0.8, 1.4, C.yellow), label('xl', ...toPx(p, 0.9, 1.6), 'x = [0.8, 1.4]', C.yellow, { size: 12 }), bDot('b = [3, 5]', 3, 5), matLabel('A = [[2, 1], [1, 3]]')]),
        frame('Apply A to the whole grid. The vector x = [0.8, 1.4] lands exactly on b. So x = [0.8, 1.4] is the solution.', [planeGrid('g', p, A), vec('x', p, ...apply(A, 0.8, 1.4), C.yellow), label('xl', ...toPx(p, 3.2, 5.6), 'A·x = [3, 5] ✓', C.yellow, { size: 12 }), bDot('', 3, 5, C.green), matLabel('A = [[2, 1], [1, 3]]')]),
        frame('The inverse A⁻¹ undoes A: it moves the grid back and carries b back to x. That is x = A⁻¹b. In code, np.linalg.solve(A, b) does this.', [planeGrid('g', p, I2), vec('x', p, 0.8, 1.4, C.yellow), label('xl', ...toPx(p, 0.9, 1.6), 'x = A⁻¹b = [0.8, 1.4]', C.yellow, { size: 12 }), bDot('b', 3, 5, C.dim), matLabel('A⁻¹ = (1/5)·[[3, -1], [-1, 2]]')]),
    ];
    const S: Mat2 = [[1, 2], [2, 4]];
    const rank1: Frame[] = [
        frame('Now A = [[1, 2], [2, 4]]. Its second column is 2 × the first. Watch two different vectors: [1, 1] and [3, 0].', [planeGrid('g', p, I2), vec('x1', p, 1, 1, C.cyan), vec('x2', p, 3, 0, C.amber), label('l1', ...toPx(p, 1.1, 1.2), '[1, 1]', C.cyan, { size: 12 }), label('l2', ...toPx(p, 3.1, 0.3), '[3, 0]', C.amber, { size: 12 }), matLabel('A = [[1, 2], [2, 4]]  (rank 1)')]),
        frame('Apply A: the whole plane is squashed onto one line. Both vectors land on the same point, [3, 6].', [planeGrid('g', p, S), vec('x1', p, 3, 6, C.cyan, { sw: 6 }), vec('x2', p, 3, 6, C.amber), label('l1', ...toPx(p, 3.2, 6.2), 'both → [3, 6]', C.ink, { size: 12 }), matLabel('A = [[1, 2], [2, 4]]  (rank 1)')]),
        frame('Given only [3, 6], you can\'t tell which vector it came from, so there is no inverse. And b = [3, 5] is off the line: no x reaches it at all.', [planeGrid('g', p, S), vec('x1', p, 3, 6, C.cyan, { sw: 6 }), vec('x2', p, 3, 6, C.amber), bDot('b = [3, 5]: no solution', 3, 5), matLabel('A = [[1, 2], [2, 4]]  (rank 1)')]),
    ];
    return {
        title: 'Solving Ax = b, and why a squashing matrix has no undo',
        variants: [
            { label: 'Full rank: solve it', frames: solve },
            { label: 'Rank 1: no undo', frames: rank1 },
        ],
    };
};

// ============ f1-t5 · Dot product, projection and orthogonality ============

const dotProduct = (): AnimationSpec => {
    const p = plane(150, 170, 26);
    const grid = planeGrid('g', p);
    const scene = (ax: number, ay: number, caption: string, extra: Part[] = []) => {
        const shadowColor = Math.abs(ax) < 0.01 ? C.grey : ax > 0 ? C.green : C.red;
        const [sx, sy] = toPx(p, ax, 0);
        return frame(caption, [
            grid,
            planeLine('bline', p, [-6, 0], [9, 0], { stroke: C.pink, sw: 1.5, dash: '6 4' }),
            line('drop', ...toPx(p, ax, ay), sx, sy, { stroke: C.grey, sw: 1.5, dash: '4 3' }),
            line('shadow', p.cx, p.cy, sx + 0.001, sy, { stroke: shadowColor, sw: 7, opacity: 0.85 }),
            vec('b', p, 1, 0, C.pink, { sw: 4 }),
            vec('a', p, ax, ay, C.cyan),
            label('al', ...toPx(p, ax + 0.2, ay + 0.3), `a = [${round(ax, 1)}, ${round(ay, 1)}]`, C.cyan, { size: 12 }),
            label('bl', p.cx + 4, p.cy + 18, 'b = [1, 0]', C.pink, { size: 12 }),
            rect('panel', 262, 12, 130, 36, { rx: 8, fill: '#0d1117e6', stroke: shadowColor, sw: 1.5 }),
            label('dot', 327, 30, `a·b = ${round(ax, 1)}`, shadowColor, { anchor: 'middle', size: 15 }),
            extra,
        ]);
    };
    return {
        title: 'The dot product is the length of a shadow',
        variants: [{
            label: 'Turning a',
            frames: [
                scene(3, 4, 'a = [3, 4] and b = [1, 0]. Multiply matching entries and add: 3·1 + 4·0 = 3. Now see what that number means.'),
                scene(3, 4, 'Shine a light straight down onto b\'s line. The shadow of a is its projection, [3, 0]. Because b has length 1, the shadow\'s length is the dot product: 3.'),
                scene(4, 3, 'Turn a closer to b (still length 5) and the shadow grows: a = [4, 3], a·b = 4. The more two vectors point the same way, the bigger the dot product.'),
                scene(0, 5, 'At 90° the shadow disappears: a·b = 0. The vectors are orthogonal (at right angles).', [rect('right', p.cx, p.cy - 14, 14, 14, { fill: 'none', stroke: C.ink, sw: 1.5 })]),
                scene(-3, 4, 'Past 90° the shadow points backwards: a·b = −3. A negative dot product means the vectors point away from each other.'),
            ],
        }],
    };
};

// ============ f1-t6 · Eigenvalues and eigenvectors ============

const eigen = (): AnimationSpec => {
    const p = plane(200, 122, 24);
    const A: Mat2 = [[2, 1], [1, 2]];
    const angles = range(0, 315, 8);
    const isEigen = (deg: number) => deg % 90 === 45;
    const spanLines = [0, 45, 90, 135].map(deg => {
        const r = (deg * Math.PI) / 180;
        return planeLine(`span${deg}`, p, [-9 * Math.cos(r), -9 * Math.sin(r)], [9 * Math.cos(r), 9 * Math.sin(r)], { stroke: isEigen(deg) ? C.yellow : C.grey, sw: 1.2, dash: '5 5', opacity: isEigen(deg) ? 0.8 : 0.45 });
    });
    const arrows = (m: Mat2, highlight: boolean) => angles.map(deg => {
        const r = (deg * Math.PI) / 180;
        const [x, y] = apply(m, 1.5 * Math.cos(r), 1.5 * Math.sin(r));
        const eigenDir = isEigen(deg);
        return vec(`a${deg}`, p, x, y, eigenDir ? C.yellow : C.cyan, { sw: eigenDir && highlight ? 4.5 : 3, opacity: highlight && !eigenDir ? 0.35 : 1 });
    });
    return {
        title: 'Eigenvectors: the directions a matrix only stretches',
        variants: [{
            label: 'A = [[2, 1], [1, 2]]',
            frames: [
                frame('Eight arrows, each on its own dashed line. Watch which ones leave their line when A = [[2, 1], [1, 2]] moves the plane.', [planeGrid('g', p), spanLines, arrows(I2, false), matLabel('A = [[2, 1], [1, 2]]')]),
                frame('Most arrows are knocked off their line: [1, 0] turns into [2, 1]. But two directions stay exactly on their dashed lines.', [planeGrid('g', p, A), spanLines, arrows(A, false), matLabel('A = [[2, 1], [1, 2]]')]),
                frame('Along [1, 1] each arrow is simply stretched 3 times: an eigenvector with eigenvalue λ = 3. Along [1, −1] arrows don\'t change at all: λ = 1.', [
                    planeGrid('g', p, A), spanLines, arrows(A, true), matLabel('A = [[2, 1], [1, 2]]'),
                    label('l3', ...toPx(p, 3.3, 3.6), 'λ = 3', C.yellow, { size: 14 }),
                    label('l1', ...toPx(p, -3.6, 1.8), 'λ = 1', C.yellow, { size: 14 }),
                ]),
                frame('So A is simple in disguise: stretch 3× along [1, 1] and leave [1, −1] alone. Apply it 10 times and the [1, 1] part grows by 3¹⁰ while the rest stays put.', [
                    planeGrid('g', p, A), spanLines.filter((_, i) => i % 2 === 1), arrows(A, true).filter(s => isEigen(Number(s.id.slice(1)))), matLabel('A = [[2, 1], [1, 2]]'),
                    label('l3', ...toPx(p, 3.3, 3.6), 'λ = 3', C.yellow, { size: 14 }),
                    label('l1', ...toPx(p, -3.6, 1.8), 'λ = 1', C.yellow, { size: 14 }),
                ]),
            ],
        }],
    };
};

// ============ f1-t7 · SVD and PCA ============

const pca = (): AnimationSpec => {
    const p = plane(200, 128, 20);
    const rand = seeded(11);
    const angle = (32 * Math.PI) / 180;
    const raw: [number, number][] = Array.from({ length: 40 }, () => {
        const u = gaussian(rand) * 2.3;
        const v = gaussian(rand) * 0.55;
        return [2.0 + u * Math.cos(angle) - v * Math.sin(angle), 0.9 + u * Math.sin(angle) + v * Math.cos(angle)];
    });
    const mean = [raw.reduce((s, q) => s + q[0], 0) / raw.length, raw.reduce((s, q) => s + q[1], 0) / raw.length];
    const centred = raw.map(([x, y]) => [x - mean[0], y - mean[1]] as [number, number]);
    // 2 × 2 covariance and its eigenvectors, in closed form.
    const sxx = centred.reduce((s, q) => s + q[0] * q[0], 0);
    const syy = centred.reduce((s, q) => s + q[1] * q[1], 0);
    const sxy = centred.reduce((s, q) => s + q[0] * q[1], 0);
    const tr = sxx + syy;
    const det = sxx * syy - sxy * sxy;
    const l1 = tr / 2 + Math.sqrt((tr * tr) / 4 - det);
    const l2 = tr - l1;
    const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const share = Math.round((100 * l1) / (l1 + l2));
    const pts = (list: [number, number][], color: string) => list.map(([x, y], i) => dot(`pt${i}`, ...toPx(p, x, y), color, 4.5));
    const dirLine = (id: string, th: number, color: string, len = 8) => planeLine(id, p, [-len * Math.cos(th), -len * Math.sin(th)], [len * Math.cos(th), len * Math.sin(th)], { stroke: color, sw: 2.5 });
    const shadows = (th: number, color: string) => centred.map(([x, y], i) => {
        const d = x * Math.cos(th) + y * Math.sin(th);
        return circle(`sh${i}`, ...toPx(p, d * Math.cos(th), d * Math.sin(th)), 3, { fill: color, opacity: 0.9 });
    });
    const spread = (th: number) => {
        const values = centred.map(([x, y]) => x * Math.cos(th) + y * Math.sin(th));
        return values.reduce((s, v) => s + v * v, 0) / (values.length - 1);
    };
    const bad = theta + (80 * Math.PI) / 180;
    const readout = (value: string, color: string) => [rect('panel', 8, 8, 160, 30, { rx: 8, fill: '#0d1117e6', stroke: color, sw: 1.5 }), label('read', 88, 23, value, color, { anchor: 'middle', size: 12 })];
    const grid = planeGrid('g', p);
    return {
        title: 'PCA: find the direction where the data spreads most',
        variants: [{
            label: 'A 2-D cloud',
            frames: [
                frame('40 data points with 2 features. The cloud is stretched along one diagonal direction, and it sits away from the origin.', [grid, pts(raw, C.cyan)]),
                frame('Step 1: centre it. Subtract the mean of each feature, so the cloud sits around the origin.', [grid, pts(centred, C.cyan), circle('mean', p.cx, p.cy, 6, { fill: 'none', stroke: C.yellow, sw: 2 })]),
                frame(`Try a direction and drop every point onto it (pink shadows). Along this one the shadows bunch up: variance only ${round(spread(bad), 2)}.`, [grid, pts(centred, C.cyan), dirLine('dir', bad, C.pink), shadows(bad, C.pink), readout(`spread: ${round(spread(bad), 2)}`, C.pink)]),
                frame(`The first principal direction is the one where the shadows spread out most: variance ${round(spread(theta), 2)}. It keeps ${share}% of all the variance.`, [grid, pts(centred, C.cyan), dirLine('dir', theta, C.yellow), shadows(theta, C.yellow), readout(`PC1: ${share}% of variance`, C.yellow)]),
                frame(`The second direction is at right angles to the first and holds the remaining ${100 - share}%. SVD finds both at once, ordered by spread.`, [grid, pts(centred, C.cyan), dirLine('dir', theta, C.yellow), dirLine('dir2', theta + Math.PI / 2, C.green, 3), readout(`PC2: ${100 - share}% of variance`, C.green)]),
                frame('Keep PC1 only: every point moves onto the yellow line. Two numbers per point become one, and little information is lost.', [grid, shadows(theta, C.yellow).map((s, i) => ({ ...s, id: `pt${i}`, r: 4.5 })), dirLine('dir', theta, C.yellow), readout(`kept ${share}%, 2-D → 1-D`, C.yellow)]),
            ],
        }],
    };
};

// ============ f1-t8 · Derivatives and the chain rule ============

const derivative = (): AnimationSpec => {
    const a = axes(46, 14, 330, 186, -2.5, 2.5, -1, 6.25);
    const f = (x: number) => x * x;
    const base: Part[] = [axisLines('ax', a, 'x', 'f(x) = x²'), fnPath('curve', a, f, { stroke: C.cyan, sw: 3 })];
    const readout = (value: string, color: string) => [rect('panel', 250, 14, 140, 30, { rx: 8, fill: '#0d1117e6', stroke: color, sw: 1.5 }), label('read', 320, 29, value, color, { anchor: 'middle', size: 12 })];
    const secant = (x0: number, h: number, caption: string) => {
        const slope = (f(x0 + h) - f(x0)) / h;
        return frame(caption, [
            base,
            lineInBox('line', a, slope, f(x0) - slope * x0, { stroke: C.amber, sw: 2.5 }),
            dot('p0', ...pt(a, x0, f(x0)), C.yellow, 6),
            dot('p1', ...pt(a, x0 + h, f(x0 + h)), C.amber, 6),
            readout(`slope ≈ ${round(slope, 2)}`, C.amber),
        ]);
    };
    const tangent = (x0: number, caption: string) => {
        const slope = 2 * x0;
        const color = slope > 0 ? C.green : slope < 0 ? C.pink : C.yellow;
        return frame(caption, [
            base,
            lineInBox('line', a, slope, f(x0) - slope * x0, { stroke: color, sw: 2.5 }),
            dot('p0', ...pt(a, x0, f(x0)), C.yellow, 6),
            dot('p1', ...pt(a, x0, f(x0)), C.yellow, 6, { opacity: 0 }),
            readout(`f′(${x0}) = ${round(slope, 2)}`, color),
        ]);
    };
    const slope: Frame[] = [
        frame('f(x) = x². How fast is it changing at x = 1?', [base, dot('p0', ...pt(a, 1, 1), C.yellow, 6)]),
        secant(1, 1.2, 'Nudge x by h = 1.2 and draw the line through both points. Its slope, (4.84 − 1) / 1.2, is 3.2.'),
        secant(1, 0.6, 'A smaller nudge, h = 0.6: the slope is 2.6.'),
        secant(1, 0.2, 'h = 0.2: slope 2.2. As the nudge shrinks, the slope settles on one number…'),
        tangent(1, '…the derivative, f′(1) = 2 × 1 = 2: the slope of the tangent line that just touches the curve.'),
        tangent(-1.5, 'At x = −1.5 the slope is −3: the curve is going downhill there. The derivative changes from point to point.'),
        tangent(0, 'At x = 0 the slope is 0: flat. The bottom of a valley is always flat, which is how we find minimums.'),
    ];

    // Chain rule: x → u = 3x + 1 → f = u².
    const stage = (id: string, x: number, title: string, value: string, color: string, on: boolean) => {
        const shape = box(id, x, 70, 104, 64, `${title}\n${value}`, color, { size: 13 });
        return on ? lit(shape, color) : shape;
    };
    const links = [arrow('a1', 120, 102, 146, 102, { stroke: C.grey }), arrow('a2', 252, 102, 278, 102, { stroke: C.grey })];
    const rateText = (id: string, x: number, value: string, color: string) => label(id, x, 160, value, color, { anchor: 'middle', size: 12 });
    const chain: Frame[] = [
        frame('A function inside a function: u = 3x + 1, then f = u². At x = 1: u = 4 and f = 16.', [stage('sx', 14, 'x', '1', C.cyan, false), stage('su', 148, 'u = 3x + 1', '4', C.violet, false), stage('sf', 280, 'f = u²', '16', C.pink, false), links]),
        frame('Nudge x by 0.01, to 1.01…', [stage('sx', 14, 'x', '1.01', C.cyan, true), stage('su', 148, 'u = 3x + 1', '4', C.violet, false), stage('sf', 280, 'f = u²', '16', C.pink, false), links, rateText('r0', 66, '+0.01', C.cyan)]),
        frame('…u moves 3 times as much: 4 → 4.03. The inner rate is du/dx = 3.', [stage('sx', 14, 'x', '1.01', C.cyan, false), stage('su', 148, 'u = 3x + 1', '4.03', C.violet, true), stage('sf', 280, 'f = u²', '16', C.pink, false), links, rateText('r0', 66, '+0.01', C.cyan), rateText('r1', 200, '× 3 → +0.03', C.violet)]),
        frame('…and f moves 2u = 8 times as much as u: 16 → 16.24. The outer rate is df/du = 2u = 8.', [stage('sx', 14, 'x', '1.01', C.cyan, false), stage('su', 148, 'u = 3x + 1', '4.03', C.violet, false), stage('sf', 280, 'f = u²', '16.24', C.pink, true), links, rateText('r0', 66, '+0.01', C.cyan), rateText('r1', 200, '× 3 → +0.03', C.violet), rateText('r2', 332, '× 8 → +0.24', C.pink)]),
        frame('Multiply the rates along the chain: df/dx = 8 × 3 = 24. That is the chain rule. Backpropagation is exactly this, repeated through every layer of a network.', [stage('sx', 14, 'x', '1.01', C.cyan, false), stage('su', 148, 'u = 3x + 1', '4.03', C.violet, false), stage('sf', 280, 'f = u²', '16.24', C.pink, false), links, rateText('r0', 66, '+0.01', C.cyan), rateText('r1', 200, '× 3 → +0.03', C.violet), rateText('r2', 332, '× 8 → +0.24', C.pink), label('total', 200, 206, 'df/dx = 8 × 3 = 24', C.yellow, { anchor: 'middle', size: 16 })]),
    ];
    return {
        title: 'The derivative is a slope; the chain rule multiplies rates',
        variants: [
            { label: 'Slope of a curve', frames: slope },
            { label: 'Chain rule', frames: chain },
        ],
    };
};

// ============ f1-t9 · Partial derivatives and gradients ============

const gradient = (): AnimationSpec => {
    const p = plane(200, 124, 34);
    const ring = (c: number, i: number) => path(`ring${i}`, range(0, 2 * Math.PI, 64).map(t => toPx(p, Math.sqrt(c) * Math.cos(t), Math.sqrt(c / 2) * Math.sin(t))), { stroke: i === 2 ? C.cyan : '#2f6f7a', sw: i === 2 ? 2.5 : 1.5, closed: true });
    const rings = [0.5, 2, 4.25, 6.5, 9].map(ring);
    const S = 0.3; // arrow length per unit of gradient
    const at: [number, number] = [1.5, 1];
    const base: Part[] = [planeGrid('g', p, I2, { color: '#1c2630' }), rings, dot('me', ...toPx(p, ...at), C.yellow, 6)];
    const readout = (value: string, color: string) => [rect('panel', 8, 8, 160, 30, { rx: 8, fill: '#0d1117e6', stroke: color, sw: 1.5 }), label('read', 88, 23, value, color, { anchor: 'middle', size: 12 })];
    const gx = vec('gx', p, at[0] + 3 * S, at[1], C.green, { from: at });
    const gy = vec('gy', p, at[0], at[1] + 4 * S, C.pink, { from: at });
    const g = vec('grad', p, at[0] + 3 * S, at[1] + 4 * S, C.yellow, { from: at, sw: 4 });
    const steps: [number, number][] = [at];
    for (let k = 0; k < 6; k++) {
        const [x, y] = steps[steps.length - 1];
        steps.push([x - 0.1 * 2 * x, y - 0.1 * 4 * y]);
    }
    return {
        title: 'The gradient points straight uphill',
        variants: [{
            label: 'f(x, y) = x² + 2y²',
            frames: [
                frame('A bowl seen from above: f(x, y) = x² + 2y². Each ring is a contour, joining points of equal height. You stand at (1.5, 1), height 4.25.', [base, readout('f(1.5, 1) = 4.25', C.cyan)]),
                frame('Step east and hold y still: the height rises at ∂f/∂x = 2x = 3 per unit step.', [base, gx, readout('∂f/∂x = 2x = 3', C.green)]),
                frame('Step north and hold x still: it rises at ∂f/∂y = 4y = 4 per unit step.', [base, gx, gy, readout('∂f/∂y = 4y = 4', C.pink)]),
                frame('Put them together: the gradient [3, 4]. It points straight uphill, at right angles to the ring, and its length √(3² + 4²) = 5 is the steepness.', [base, gx, gy, line('px', ...toPx(p, at[0] + 3 * S, at[1]), ...toPx(p, at[0] + 3 * S, at[1] + 4 * S), { stroke: C.dim, dash: '3 3', sw: 1.2 }), g, readout('∇f = [3, 4]', C.yellow)]),
                frame('Gradient descent steps the other way, −∇f. With learning rate 0.1 you land at (1.2, 0.6), where the height is only 2.16.', [base, g, vec('down', p, 1.2, 0.6, C.green, { from: at, sw: 4 }), dot('next', ...toPx(p, 1.2, 0.6), C.green, 5), readout('f(1.2, 0.6) = 2.16', C.green)]),
                frame('Repeat, and the steps walk down into the bowl, each one at right angles to the ring it starts from, until the gradient is zero at the bottom.', [base, path('trail', steps.map(q => toPx(p, ...q)), { stroke: C.green, sw: 2.5 }), steps.map((q, i) => dot(`st${i}`, ...toPx(p, ...q), C.green, 4)), readout('heading to (0, 0)', C.green)]),
            ],
        }],
    };
};

// ============ f1-t10 · Gradient descent and the learning rate ============

const learningRate = (): AnimationSpec => {
    const a = axes(40, 14, 336, 186, -7.5, 7.5, 0, 56);
    const base: Part[] = [axisLines('ax', a, 'w', 'f(w) = w²'), fnPath('curve', a, w => w * w, { stroke: C.cyan, sw: 2.5, n: 120 }), line('zero', px(a, 0), a.y + a.h, px(a, 0), a.y + a.h + 6, { stroke: C.dim })];
    const readout = (value: string, color: string) => [rect('panel', 262, 12, 132, 30, { rx: 8, fill: '#0d1117e6', stroke: color, sw: 1.5 }), label('read', 328, 27, value, color, { anchor: 'middle', size: 13 })];
    const run = (lr: number, count: number) => {
        const ws = [4];
        for (let k = 0; k < count; k++) ws.push(ws[ws.length - 1] * (1 - 2 * lr));
        return ws;
    };
    const frames = (lr: number, count: number, captions: (w: number, k: number) => string, color: string) => {
        const ws = run(lr, count);
        return ws.map((w, k) => {
            const shown = ws.slice(0, k + 1).filter(v => Math.abs(v) <= 7.5);
            const onChart = Math.abs(w) <= 7.5;
            return frame(captions(w, k), [
                base,
                shown.slice(0, -1).map((v, i) => dot(`trail${i}`, ...pt(a, v, v * v), color, 3.5, { opacity: 0.55 })),
                shown.slice(1).map((v, i) => arrow(`step${i}`, ...pt(a, shown[i], shown[i] * shown[i]), ...pt(a, v, v * v), { stroke: color, sw: 1.8, opacity: 0.8 })),
                onChart && circle('ball', ...pt(a, w, w * w), 8, { fill: C.yellow, stroke: C.bg, sw: 2 }),
                !onChart && label('off', px(a, 0), a.y + 30, 'off the chart!', C.red, { anchor: 'middle', size: 15 }),
                readout(onChart ? `w = ${round(w, 3)}` : `w = ${round(w, 2)}`, color),
            ], k === 0 ? undefined : 2200);
        });
    };
    return {
        title: 'Gradient descent: the step size decides everything',
        variants: [
            {
                label: 'η = 0.1 (good)',
                frames: frames(0.1, 7, (w, k) => [
                    'f(w) = w², starting at w = 4. The slope there is 2w = 8, so downhill is to the left.',
                    'One step: w ← w − 0.1 × 8 = 3.2.',
                    'w = 2.56. The slope is gentler here, so the step is shorter, all by itself.',
                    `w = ${round(w, 3)}. Each step multiplies w by 1 − 2 × 0.1 = 0.8.`,
                    `w = ${round(w, 3)}.`,
                    `w = ${round(w, 3)}.`,
                    `w = ${round(w, 3)}.`,
                    `w = ${round(w, 3)}, gliding smoothly to the bottom. After 50 steps it would be about 0.00006.`,
                ][k], C.green),
            },
            {
                label: 'η = 0.01 (too small)',
                frames: frames(0.01, 6, (w, k) => (k === 0 ? 'Same start, learning rate 0.01: ten times smaller steps.' : k < 6 ? `w = ${round(w, 3)}. Each step only multiplies w by 0.98.` : `w = ${round(w, 3)}: barely moved. It will get there, but it needs hundreds of steps.`), C.amber),
            },
            {
                label: 'η = 0.9 (zig-zag)',
                frames: frames(0.9, 6, (w, k) => (k === 0 ? 'Learning rate 0.9. Now each step multiplies w by 1 − 1.8 = −0.8.' : k < 6 ? `w = ${round(w, 3)}: it jumps across the valley every step, but lands a little lower each time.` : `w = ${round(w, 3)}. It does converge, but it wastes steps bouncing from side to side.`), C.violet),
            },
            {
                label: 'η = 1.1 (explodes)',
                frames: frames(1.1, 4, (w, k) => (k === 0 ? 'Learning rate 1.1: each step multiplies w by 1 − 2.2 = −1.2.' : k < 4 ? `w = ${round(w, 2)}: it overshoots to the other side and lands higher than before.` : `w = ${round(w, 2)}: off the chart. Every step makes it worse; the loss explodes to infinity, then NaN.`), C.red),
            },
        ],
    };
};

// ============ f1-t11 · Random variables and distributions ============

const distributions = (): AnimationSpec => {
    const a = axes(52, 22, 300, 160, 0, 6, 0, 0.4);
    const rand = seeded(5);
    const rolls = Array.from({ length: 6000 }, () => 1 + Math.floor(rand() * 6));
    const dieFrame = (n: number, caption: (mean: number) => string) => {
        const counts = [0, 0, 0, 0, 0, 0];
        rolls.slice(0, n).forEach(r => counts[r - 1]++);
        const shares = counts.map(c => c / n);
        const mean = rolls.slice(0, n).reduce((s, r) => s + r, 0) / n;
        return frame(caption(mean), [
            axisLines('ax', a, '', 'share of rolls'),
            [0.1, 0.2, 0.3].map(v => text(`yt${v}`, a.x - 6, py(a, v), String(v), { size: 11, fill: C.dim, anchor: 'end' })),
            bars('bar', a, shares, [C.cyan, C.green, C.amber, C.pink, C.violet, C.blue], ['1', '2', '3', '4', '5', '6']),
            line('sixth', a.x, py(a, 1 / 6), a.x + a.w, py(a, 1 / 6), { stroke: C.yellow, dash: '6 4', sw: 2 }),
            label('sixl', a.x + a.w + 4, py(a, 1 / 6), '1/6', C.yellow, { size: 12 }),
            label('mean', 360, 30, `average ${round(mean, 2)}`, C.ink, { anchor: 'end', size: 13 }),
            label('n', 360, 50, `${n.toLocaleString('en-GB')} rolls`, C.grey, { anchor: 'end', size: 12, mono: false }),
        ]);
    };
    const die: Frame[] = [
        dieFrame(6, m => `Roll a fair die 6 times. The bars are lumpy and the average is ${round(m, 2)}: with so few rolls, chance dominates.`),
        dieFrame(60, m => `60 rolls: closer to even, average ${round(m, 2)}.`),
        dieFrame(600, m => `600 rolls: every bar is near the dashed line at 1/6, and the average is ${round(m, 2)}.`),
        dieFrame(6000, m => `6,000 rolls: the bars match the distribution (1/6 each), and the average, ${round(m, 2)}, has settled near the expectation of 3.5. You can never roll 3.5; it is the long-run average.`),
    ];

    const g = axes(40, 20, 330, 165, -4, 4, 0, 0.5);
    const grand = seeded(9);
    const samples = Array.from({ length: 5000 }, () => gaussian(grand));
    const binEdges = range(-4, 4, 17);
    const width = binEdges[1] - binEdges[0];
    const density = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    const histFrame = (n: number, caption: string, showCurve: boolean, showSigma = false) => {
        const counts = binEdges.slice(0, -1).map((lo, i) => samples.slice(0, n).filter(s => s >= lo && s < binEdges[i + 1]).length / (n * width));
        const slot = g.w / counts.length;
        return frame(caption, [
            axisLines('ax', g, 'value', 'density'),
            showSigma && rect('sigma', px(g, -1), g.y, px(g, 1) - px(g, -1), g.h, { fill: tint(C.violet, 0.16) }),
            showSigma && label('sigl', px(g, 0), g.y + 10, '68% within ±1σ', C.violet, { anchor: 'middle', size: 12 }),
            counts.map((c, i) => rect(`h${i}`, g.x + i * slot + 1, py(g, Math.min(0.5, c)), slot - 2, g.y + g.h - py(g, Math.min(0.5, c)), { rx: 2, fill: tint(C.cyan, 0.7) })),
            showCurve && fnPath('bell', g, density, { stroke: C.yellow, sw: 3 }),
            [-2, -1, 0, 1, 2].map(v => text(`xt${v}`, px(g, v), g.y + g.h + 14, v === 0 ? 'μ' : `${v > 0 ? '+' : '−'}${Math.abs(v)}σ`, { size: 11, fill: C.dim })),
            label('n', 380, 30, `${n.toLocaleString('en-GB')} samples`, C.grey, { anchor: 'end', size: 12, mono: false }),
        ]);
    };
    const bell: Frame[] = [
        histFrame(50, 'Draw 50 values from a Gaussian (normal) distribution. The histogram is rough.', false),
        histFrame(500, '500 values: a hump appears, centred on the mean μ.', false),
        histFrame(5000, '5,000 values: the histogram traces the bell-shaped density curve (yellow). For continuous values, probability is the area under this curve.', true),
        histFrame(5000, 'About 68% of values fall within one standard deviation σ of the mean, and about 95% within two. σ measures the spread.', true, true),
    ];
    return {
        title: 'A distribution is what many random draws settle into',
        variants: [
            { label: 'Rolling a die', frames: die },
            { label: 'Bell curve', frames: bell },
        ],
    };
};

// ============ f1-t12 · Conditional probability and Bayes' rule ============

const bayes = (): AnimationSpec => {
    const cols = 10;
    const at = (i: number) => ({ x: 34 + (i % cols) * 21, y: 26 + Math.floor(i / cols) * 21 });
    /** The 100 dots; any in `moved` are drawn by `gather` instead, so they slide across. */
    const people = (sick: Set<number>, positive: Set<number>, dimOthers = false, moved: Set<number> = new Set()) => Array.from({ length: 100 }, (_, i) => i).filter(i => !moved.has(i)).map(i => {
        const { x, y } = at(i);
        const isSick = sick.has(i);
        const isPos = positive.has(i);
        return circle(`d${i}`, x, y, 7, {
            fill: isSick ? C.red : '#5c6773',
            stroke: isPos ? C.yellow : C.bg,
            sw: isPos ? 3 : 1,
            opacity: dimOthers && !isPos ? 0.25 : 1,
        });
    });
    const panel = (lines: [string, string][]) => lines.map(([value, color], i) => label(`t${i}`, 248, 40 + i * 24, value, color, { size: 13, mono: false }));
    const sick1 = new Set([44]);
    const false1 = new Set([7, 23, 58, 71, 96]);
    const pos1 = new Set([...sick1, ...false1]);
    const gather = (sick: Set<number>, positives: number[]) => positives.map((i, k) => circle(`d${i}`, 258 + (k % 6) * 21, 150 + Math.floor(k / 6) * 21, 7, { fill: sick.has(i) ? C.red : '#5c6773', stroke: C.yellow, sw: 3 }));
    const rare: Frame[] = [
        frame('1,000 people. Each dot stands for 10 of them.', [people(new Set(), new Set()), panel([['1,000 people', C.ink], ['each dot = 10', C.grey]])]),
        frame('1% are sick: 10 people, the one red dot. The other 990 are healthy.', [people(sick1, new Set()), panel([['sick: 10', C.red], ['healthy: 990', C.grey]])]),
        frame('Test everyone. It catches 99% of the sick (9.9 people) but also raises a false alarm for 5% of the healthy: 49.5 people, about 5 dots.', [people(sick1, pos1), panel([['sick and +: 9.9', C.red], ['healthy but +: 49.5', C.yellow]])]),
        frame('Now look only at the people who tested positive: about 59 of them. Only 9.9 are actually sick.', [people(sick1, pos1, true, pos1), gather(sick1, [44, 7, 23, 58, 71, 96]), panel([['positives: 59.4', C.yellow], ['actually sick: 9.9', C.red]])]),
        frame('So P(sick | positive) = 9.9 / 59.4 ≈ 17%. The test is good, but the disease is rare, and false alarms from the many healthy people swamp the true cases.', [people(sick1, pos1, true, pos1), gather(sick1, [44, 7, 23, 58, 71, 96]), panel([['9.9 / 59.4', C.ink], ['≈ 17% sick', C.yellow]])]),
    ];
    const sick10 = new Set([15, 34, 52, 78, 99]);
    const false10 = new Set([9, 22, 40, 67, 93]);
    const pos10 = new Set([...sick10, ...false10]);
    const common: Frame[] = [
        frame('Same test, but now 5% of people are sick: 50 people, 5 red dots.', [people(sick10, new Set()), panel([['sick: 50', C.red], ['healthy: 950', C.grey]])]),
        frame('Positives: 49.5 of the sick, plus 5% of 950 healthy = 47.5 false alarms.', [people(sick10, pos10), panel([['sick and +: 49.5', C.red], ['healthy but +: 47.5', C.yellow]])]),
        frame('Now P(sick | positive) = 49.5 / 97 ≈ 51%, three times higher. Same test, very different answer: the starting rate (the prior) matters enormously.', [people(sick10, pos10, true, pos10), gather(sick10, [...sick10, ...false10]), panel([['49.5 / 97', C.ink], ['≈ 51% sick', C.yellow]])]),
    ];
    return {
        title: 'Bayes\' rule by counting people',
        variants: [
            { label: '1% are sick', frames: rare },
            { label: '5% are sick', frames: common },
        ],
    };
};

// ============ f1-t13 · Maximum likelihood ============

const mle = (): AnimationSpec => {
    const flips = ['H', 'H', 'T', 'H', 'H', 'H', 'T', 'H', 'T', 'H'];
    const a = axes(50, 58, 320, 140, 0, 1, 0, 0.0025);
    const L = (q: number) => q ** 7 * (1 - q) ** 3;
    const coins = chips('flip', 30, 14, flips, flips.map(f => (f === 'H' ? C.amber : C.blue)), { gap: 6, size: 13 });
    const base: Part[] = [coins, axisLines('ax', a, '', 'likelihood'), [0, 0.5, 1].map(v => text(`xt${v}`, px(a, v), a.y + a.h + 14, String(v), { size: 11, fill: C.dim })), text('xl', px(a, 0.5), a.y + a.h + 30, 'p = chance of heads', { size: 12, fill: C.grey })];
    const probe = (q: number, caption: string, curve = false) => frame(caption, [
        base,
        curve && fnPath('curve', a, L, { stroke: C.cyan, sw: 3 }),
        line('stick', px(a, q), py(a, 0), px(a, q), py(a, L(q)), { stroke: C.yellow, sw: 4 }),
        dot('tip', px(a, q), py(a, L(q)), C.yellow, 6),
        label('val', px(a, q) + (q > 0.6 ? -8 : 8), py(a, L(q)) - 10, `L(${q}) = ${L(q).toFixed(5)}`, C.yellow, { size: 12, anchor: q > 0.6 ? 'end' : 'start' }),
    ]);
    const coin: Frame[] = [
        frame('10 coin flips: 7 heads and 3 tails. Which value of p, the chance of heads, explains this data best?', [base]),
        probe(0.3, 'Try p = 0.3. The chance of exactly this sequence is p⁷(1 − p)³ = 0.00008: tiny. 7 heads would be surprising.'),
        probe(0.5, 'p = 0.5: 0.00098. Better.'),
        probe(0.9, 'p = 0.9: 0.00048. Worse again: with p = 0.9 you would expect more than 7 heads.'),
        probe(0.7, 'Try every p and draw the likelihood curve. It peaks at p = 0.7, the fraction of heads you saw. That is the maximum likelihood estimate.', true),
    ];

    const data = [3.1, 4.4, 4.9, 5.2, 5.6, 6.0, 6.8, 7.2];
    const mu = data.reduce((s, v) => s + v, 0) / data.length;
    const g = axes(30, 30, 340, 150, 0, 10, 0, 0.45);
    const pdf = (x: number, m: number) => Math.exp(-((x - m) ** 2) / 2) / Math.sqrt(2 * Math.PI);
    const logLik = (m: number) => data.reduce((s, v) => s + Math.log(pdf(v, m)), 0);
    const fit = (m: number, caption: string, best = false) => frame(caption, [
        axisLines('ax', g, 'x', ''),
        fnPath('bell', g, x => pdf(x, m), { stroke: best ? C.green : C.violet, sw: 3 }),
        data.map((v, i) => [
            line(`h${i}`, px(g, v), py(g, 0), px(g, v), py(g, pdf(v, m)), { stroke: best ? C.green : C.violet, sw: 2, opacity: 0.7 }),
            dot(`x${i}`, px(g, v), py(g, 0), C.amber, 5),
        ]),
        label('ll', 370, 22, `log-likelihood ${round(logLik(m), 1)}`, best ? C.green : C.violet, { anchor: 'end', size: 12 }),
        label('mu', px(g, m), g.y + g.h + 16, `μ = ${round(m, 2)}`, best ? C.green : C.violet, { anchor: 'middle', size: 12 }),
    ]);
    const gauss: Frame[] = [
        fit(3, 'Eight measurements (orange dots). Model them as a Gaussian with spread 1 and an unknown mean μ. Try μ = 3: most dots sit far out in the tail, where the curve is low.'),
        fit(7, 'μ = 7: better for the right-hand dots, worse for the left. The likelihood multiplies the curve\'s height at every dot.'),
        fit(mu, `The best μ is ${round(mu, 2)}, which is exactly the average of the data. For a Gaussian, maximum likelihood gives the sample mean, and maximising it is the same as minimising squared error.`, true),
    ];
    return {
        title: 'Maximum likelihood: pick what makes your data most probable',
        variants: [
            { label: 'Coin flips', frames: coin },
            { label: 'Gaussian mean', frames: gauss },
        ],
    };
};

// ============ f1-t14 · Statistics ============

const statistics = (): AnimationSpec => {
    const truth = 0.85;
    const n = 200;
    const rand = seeded(21);
    const runs = Array.from({ length: 20 }, () => {
        let right = 0;
        for (let i = 0; i < n; i++) if (rand() < truth) right++;
        const est = right / n;
        const se = Math.sqrt((est * (1 - est)) / n);
        return { est, lo: est - 1.96 * se, hi: est + 1.96 * se };
    });
    const a = axes(40, 30, 330, 180, 0.74, 0.96, 0, 21);
    const misses = runs.filter(r => r.lo > truth || r.hi < truth).length;
    const intervals = (count: number) => runs.slice(0, count).map((r, i) => {
        const miss = r.lo > truth || r.hi < truth;
        return [
            line(`ci${i}`, px(a, r.lo), py(a, 20 - i), px(a, r.hi), py(a, 20 - i), { stroke: miss ? C.red : C.green, sw: 3 }),
            dot(`est${i}`, px(a, r.est), py(a, 20 - i), miss ? C.red : C.green, 4),
        ];
    });
    const base: Part[] = [
        line('xaxis', a.x, a.y + a.h, a.x + a.w, a.y + a.h, { stroke: C.dim }),
        [0.8, 0.85, 0.9].map(v => text(`xt${v}`, px(a, v), a.y + a.h + 14, `${Math.round(v * 100)}%`, { size: 11, fill: C.dim })),
        line('truth', px(a, truth), a.y - 6, px(a, truth), a.y + a.h, { stroke: C.yellow, sw: 2, dash: '6 4' }),
        label('truthl', px(a, truth) + 6, a.y - 12, 'true accuracy (unknown)', C.yellow, { size: 11, mono: false }),
    ];
    const first = runs[0];
    const ci: Frame[] = [
        frame('A model\'s true accuracy is 85%, but in real life you never get to see that. You only see its score on a test set of 200 examples.', [base]),
        frame(`One test set: ${Math.round(first.est * 100)}% correct. Standard error √(p(1 − p)/n) ≈ 2.5%, so the 95% interval is about ±5%: the green bar.`, [base, intervals(1)]),
        frame('A different test set gives a different score and a different interval. Each one is a little off.', [base, intervals(5)]),
        frame(`Twenty test sets: ${20 - misses} of the 20 intervals catch the true value${misses ? ` and ${misses} miss${misses === 1 ? 'es' : ''} (red)` : ''}. That is what "95% confidence" means: the method catches the truth about 95% of the time.`, [base, intervals(20)]),
    ];

    const crand = seeded(4);
    const h = axes(48, 34, 314, 150, 1, 6, 0, 1);
    const means = (k: number) => Array.from({ length: 3000 }, () => {
        let s = 0;
        for (let i = 0; i < k; i++) s += 1 + Math.floor(crand() * 6);
        return s / k;
    });
    const histogram = (k: number, caption: string) => {
        const values = means(k);
        const step = k <= 5 ? 1 / k : 0.25;
        const centres = range(1, 6, Math.round(5 / step) + 1);
        const counts = centres.map(c => values.filter(v => Math.abs(v - c) < step / 2 + 1e-9).length);
        const max = Math.max(...counts);
        const width = Math.max(3, (h.w / (centres.length + 1)) * 0.8);
        return frame(caption, [
            line('xaxis', h.x, h.y + h.h, h.x + h.w, h.y + h.h, { stroke: C.dim }),
            [1, 2, 3, 4, 5, 6].map(v => text(`xt${v}`, px(h, v), h.y + h.h + 14, String(v), { size: 11, fill: C.dim })),
            centres.map((c, i) => rect(`b${i}`, px(h, c) - width / 2, py(h, counts[i] / max), width, h.y + h.h - py(h, counts[i] / max), { rx: 2, fill: tint(C.violet, 0.75) })),
            label('k', 370, 16, k === 1 ? 'one die' : `average of ${k} dice`, C.violet, { anchor: 'end', size: 13 }),
        ]);
    };
    const clt: Frame[] = [
        histogram(1, 'Roll one die 3,000 times: a flat histogram. Every face is equally likely.'),
        histogram(2, 'Now average 2 dice each time. Middle values become more common.'),
        histogram(5, 'Average 5 dice: a hump around 3.5.'),
        histogram(20, 'Average 20 dice: a narrow bell curve. That is the central limit theorem: averages are roughly Gaussian whatever you start from, and they get narrower as you average more.'),
    ];
    return {
        title: 'How much can you trust one number from a sample?',
        variants: [
            { label: 'Confidence intervals', frames: ci },
            { label: 'Central limit theorem', frames: clt },
        ],
    };
};

// ============ f1-t15 · Entropy, cross-entropy and KL divergence ============

const crossEntropy = (): AnimationSpec => {
    const b = axes(30, 40, 160, 150, 0, 3, 0, 1);
    const c = axes(232, 24, 150, 166, 0, 1, 0, 4.6);
    const classes = ['cat', 'dog', 'bird'];
    const scene = (q: number[], caption: string) => {
        const loss = -Math.log(q[1]);
        return frame(caption, [
            axisLines('bx', b, '', ''),
            bars('q', b, q, [C.grey, C.green, C.grey], classes, { showValues: true }),
            label('true', px(b, 1.5), b.y - 26, 'true answer: dog', C.green, { anchor: 'middle', size: 12, mono: false }),
            axisLines('cx', c, '', 'loss = −log p'),
            [0, 1].map(v => text(`ct${v}`, px(c, v), c.y + c.h + 13, String(v), { size: 11, fill: C.dim })),
            text('cxl', px(c, 0.5), c.y + c.h + 13, 'p(dog)', { size: 11, fill: C.grey }),
            fnPath('nlog', c, x => -Math.log(Math.max(1e-6, x)), { from: 0.01, to: 1, stroke: C.pink, sw: 2.5 }),
            line('stick', px(c, q[1]), py(c, 0), px(c, q[1]), py(c, Math.min(4.6, loss)), { stroke: C.yellow, sw: 2, dash: '4 3' }),
            dot('m', px(c, q[1]), py(c, Math.min(4.6, loss)), C.yellow, 6),
            label('lv', px(c, 0.5), 228, `loss = ${round(loss, 3)}`, C.yellow, { anchor: 'middle', size: 14 }),
        ]);
    };
    const ce: Frame[] = [
        scene([0.2, 0.7, 0.1], 'The picture shows a dog. The model gives dog 0.7. Cross-entropy only looks at the probability of the true class: loss = −log 0.7 = 0.357.'),
        scene([0.005, 0.99, 0.005], 'Confident and right: dog 0.99. Loss −log 0.99 ≈ 0.01, almost nothing.'),
        scene([1 / 3, 1 / 3, 1 / 3], 'Unsure: one third each. Loss −log(1/3) ≈ 1.1.'),
        scene([0.9, 0.05, 0.05], 'Confident and wrong: dog only 0.05. Loss −log 0.05 ≈ 3.0. The curve shoots up near 0, so confident mistakes are punished hardest.'),
    ];
    const e = axes(40, 40, 200, 150, 0, 6, 0, 1);
    const entropy = (q: number[]) => -q.reduce((s, v) => s + (v > 0 ? v * Math.log2(v) : 0), 0);
    const ent = (q: number[], labels: string[], caption: string) => frame(caption, [
        axisLines('ex', e, '', ''),
        bars('p', axes(e.x, e.y, (e.w * Math.min(q.length, 6)) / 6, e.h, 0, q.length, 0, 1), q, C.cyan, labels, { showValues: q.length <= 6 }),
        rect('meter', 262, 40, 26, 150, { rx: 4, fill: C.panel, stroke: C.faint, sw: 1 }),
        rect('fill', 262, 190 - (150 * entropy(q)) / 2.6, 26, (150 * entropy(q)) / 2.6, { rx: 4, fill: C.amber }),
        label('ev', 298, 115, `${round(entropy(q), 2)} bit${round(entropy(q), 2) === 1 ? '' : 's'}`, C.amber, { size: 14 }),
        label('el', 275, 205, 'entropy', C.grey, { anchor: 'middle', size: 11, mono: false }),
    ]);
    const entropyFrames: Frame[] = [
        ent([0.7, 0.3], ['H', 'T'], 'A coin that lands heads 70% of the time. You can guess a little better than chance, so the entropy is a bit under the 1-bit maximum: 0.88 bits.'),
        ent([0.99, 0.01], ['H', 'T'], 'Heads 99% of the time: hardly any surprise left, 0.08 bits.'),
        ent([0.25, 0.25, 0.25, 0.25], ['A', 'B', 'C', 'D'], 'Four equally likely outcomes: log₂ 4 = 2 bits, like two fair coin flips.'),
        ent([1, 1, 1, 1, 1, 1, 1, 1].map(v => v / 8), ['1', '2', '3', '4', '5', '6', '7', '8'], 'Eight equally likely outcomes: 3 bits. More equally likely options means more uncertainty.'),
    ];
    return {
        title: 'Cross-entropy: the price of being wrong, and confidently wrong',
        variants: [
            { label: 'Cross-entropy loss', frames: ce },
            { label: 'Entropy', frames: entropyFrames },
        ],
    };
};

// ============ f1-t16 · Convex optimisation ============

const convex = (): AnimationSpec => {
    const descend = (f: (w: number) => number, df: (w: number) => number, starts: number[], lr: number, a: ReturnType<typeof axes>, title: string, color: string[], captions: string[], domain: [number, number] = [a.xMin, a.xMax]) => {
        const paths = starts.map(s => {
            const ws = [s];
            for (let k = 0; k < 200; k++) ws.push(ws[ws.length - 1] - lr * df(ws[ws.length - 1]));
            return ws;
        });
        const at = [0, 2, 6, 200];
        return at.map((k, i) => frame(captions[i], [
            axisLines('ax', a, 'w', title),
            fnPath('curve', a, f, { stroke: C.cyan, sw: 2.5, n: 120, from: domain[0], to: domain[1] }),
            paths.map((ws, j) => circle(`m${j}`, ...pt(a, ws[k], f(ws[k])), 8, { fill: color[j], stroke: C.bg, sw: 2 })),
        ]));
    };
    const bowl = axes(40, 16, 330, 180, -2.4, 2.4, -0.5, 6);
    const wavy = axes(40, 16, 330, 180, -2.2, 2.2, -4.2, 6.5);
    const g = (w: number) => w ** 4 - 3 * w ** 2 + w;
    const dg = (w: number) => 4 * w ** 3 - 6 * w + 1;
    const marbles = [C.amber, C.pink, C.green];
    const convexFrames = descend(w => w * w, w => 2 * w, [-2.2, 0.8, 2.1], 0.1, bowl, 'w²', marbles, [
        'A convex bowl, f(w) = w². Drop three marbles at different places and let gradient descent roll them.',
        'They all head the same way: down.',
        'Closing in on the same bottom.',
        'All three end at w = 0. In a convex function there is only one valley, so the start doesn\'t matter: any minimum you find is the best one.',
    ]);
    const wavyFrames = descend(g, dg, [-2, -0.15, 0.6], 0.02, wavy, 'w⁴ − 3w² + w', marbles, [
        'A non-convex curve, w⁴ − 3w² + w, with two valleys. Same three kinds of start.',
        'Each marble rolls into whichever valley it starts above.',
        'They are splitting up.',
        'Two end in the deep left valley (w ≈ −1.30) and one gets stuck in the shallow right one (w ≈ 1.13). Where you start decides where you finish.',
    ], [-2.05, 1.95]);
    const p = plane(150, 150, 46);
    const value = (x: number, y: number) => x * x + y * y;
    const lag = (x: number, caption: string) => {
        const y = 1 - x;
        const r = Math.sqrt(value(x, y));
        return frame(caption, [
            planeGrid('g', p, I2, { color: '#1c2630' }),
            [0.3, 0.6, 1, 1.5].map((rr, i) => path(`c${i}`, range(0, 2 * Math.PI, 60).map(t => toPx(p, rr * Math.cos(t), rr * Math.sin(t))), { stroke: '#2f6f7a', sw: 1.2, closed: true })),
            path('touch', range(0, 2 * Math.PI, 60).map(t => toPx(p, r * Math.cos(t), r * Math.sin(t))), { stroke: C.cyan, sw: 2.5, closed: true }),
            planeLine('constraint', p, [-3, 4], [4, -3], { stroke: C.pink, sw: 3 }),
            label('cl', ...toPx(p, 2.1, -1.4), 'x + y = 1', C.pink, { size: 12 }),
            vec('gf', p, x + 0.3 * 2 * x, y + 0.3 * 2 * y, C.yellow, { from: [x, y], sw: 3 }),
            vec('gg', p, x + 0.3, y + 0.3, C.pink, { from: [x, y], sw: 2.5, dash: '4 3' }),
            dot('pt', ...toPx(p, x, y), C.yellow, 6),
            rect('panel', 266, 12, 126, 50, { rx: 8, fill: '#0d1117e6', stroke: C.faint, sw: 1 }),
            label('pv', 329, 28, `(${round(x, 2)}, ${round(y, 2)})`, C.yellow, { anchor: 'middle', size: 12 }),
            label('fv', 329, 48, `x² + y² = ${round(value(x, y), 2)}`, C.cyan, { anchor: 'middle', size: 12 }),
        ]);
    };
    const lagrange: Frame[] = [
        lag(-0.6, 'Minimise x² + y² (rings around the origin), but only on the pink line x + y = 1. At (−0.6, 1.6) the value is 2.92.'),
        lag(0, 'Slide along the line: at (0, 1) the value is 1. The yellow arrow (the gradient of x² + y²) still points across the line at an angle, so we can do better.'),
        lag(0.5, 'At (0.5, 0.5) the ring just touches the line, and the yellow gradient lines up with the pink one (the line\'s own gradient). Nowhere lower on the line: value 0.5.'),
        lag(0.5, 'That is the Lagrange condition: ∇f = λ∇g. Solving 2x = λ, 2y = λ, x + y = 1 gives x = y = 0.5 and λ = 1.'),
    ];
    return {
        title: 'Convex bowls have one bottom; constraints touch the rings',
        variants: [
            { label: 'Convex bowl', frames: convexFrames },
            { label: 'Two valleys', frames: wavyFrames },
            { label: 'Lagrange multiplier', frames: lagrange },
        ],
    };
};

export const phase1Animations: Record<string, () => AnimationSpec> = {
    'f1-t1': spanBasis,
    'f1-t2': transforms,
    'f1-t3': determinants,
    'f1-t4': inverseRank,
    'f1-t5': dotProduct,
    'f1-t6': eigen,
    'f1-t7': pca,
    'f1-t8': derivative,
    'f1-t9': gradient,
    'f1-t10': learningRate,
    'f1-t11': distributions,
    'f1-t12': bayes,
    'f1-t13': mle,
    'f1-t14': statistics,
    'f1-t15': crossEntropy,
    'f1-t16': convex,
};
