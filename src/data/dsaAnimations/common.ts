import type { RectShape, Shape } from '../../components/learning/anim/scene';
import { C, arrow, circle, line, rect, text, tint } from '../../components/learning/anim/kit';

export { label, panel } from '../foundationsAnimations/common';

// Pieces the DSA animations share: array cells, pointers under them, a stack,
// and a binary tree laid out from its level-order list.

/** Python's way of printing a value, so results read exactly like the lesson's traces. */
export const py = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(py).join(', ')}]`;
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (typeof value === 'string') return `'${value}'`;
    return String(value);
};

/** One worked example run for real: the frames it drew and the answer it got, printed like Python. */
export interface Run {
    result: string;
}

export interface CellStyle {
    w?: number;
    h?: number;
    gap?: number;
    size?: number;
}

const cellSize = (o: CellStyle) => ({ w: o.w ?? 34, h: o.h ?? 30, gap: o.gap ?? 6, size: o.size ?? 13 });

/** The centre x of cell i in a row that starts at x. */
export const cellX = (x: number, i: number, o: CellStyle = {}) => {
    const { w, gap } = cellSize(o);
    return x + i * (w + gap) + w / 2;
};

/** x where a row of n cells must start to be centred on cx. */
export const rowStart = (cx: number, n: number, o: CellStyle = {}) => {
    const { w, gap } = cellSize(o);
    return cx - (n * w + (n - 1) * gap) / 2;
};

/** How a cell looks: its colour and how strongly it is filled. */
export type Look = [color: string, strength: number];

export const PLAIN: Look = [C.blue, 0.18];
export const DIM: Look = [C.grey, 0.06];

/** A row of array cells. Cell i has the id `${id}${i}`, so it can move or recolour between frames. */
export const cellRow = (id: string, x: number, y: number, values: (string | number)[], look: (i: number) => Look = () => PLAIN, o: CellStyle = {}): RectShape[] => {
    const { w, h, gap, size } = cellSize(o);
    return values.map((value, i) => {
        const [color, strength] = look(i);
        return rect(`${id}${i}`, x + i * (w + gap), y, w, h, {
            rx: 5,
            fill: tint(color, strength),
            stroke: strength <= 0.08 ? C.faint : color,
            sw: 1.5,
            text: String(value),
            textColor: strength <= 0.08 ? C.dim : C.ink,
            size,
            weight: 700,
            mono: true,
        });
    });
};

/** Small index numbers above (or below) a row of cells. */
export const indexRow = (id: string, x: number, y: number, n: number, o: CellStyle = {}): Shape[] =>
    Array.from({ length: n }, (_, i) => text(`${id}${i}`, cellX(x, i, o), y, String(i), { size: 11, fill: C.dim, mono: true }));

/**
 * A named pointer under a cell: an arrow up to the cell's bottom edge (y) and its name.
 * Keep the id between frames and it slides from cell to cell.
 */
export const pointer = (id: string, cx: number, y: number, name: string, color: string, o: { above?: boolean } = {}): Shape[] =>
    o.above
        ? [
            arrow(`${id}-a`, cx, y - 16, cx, y - 3, { stroke: color, sw: 2.5 }),
            text(`${id}-t`, cx, y - 25, name, { size: 12, fill: color, weight: 800, mono: true }),
        ]
        : [
            arrow(`${id}-a`, cx, y + 16, cx, y + 3, { stroke: color, sw: 2.5 }),
            text(`${id}-t`, cx, y + 25, name, { size: 12, fill: color, weight: 800, mono: true }),
        ];

/**
 * A stack drawn as a pile, bottom item at yBottom. Items keep their own ids
 * (pass them), so a push slides in and a pop slides out.
 */
export const pile = (
    title: string,
    x: number,
    yBottom: number,
    items: { id: string; label: string; color: string }[],
    o: { w?: number; h?: number; capacity?: number } = {},
): Shape[] => {
    const { w = 70, h = 24, capacity = 5 } = o;
    const top = yBottom - capacity * (h + 3) - 6;
    return [
        // An open-topped box: the pile only grows upwards.
        line('pile-l', x - 4, top, x - 4, yBottom + 4, { stroke: C.dim, sw: 2 }),
        line('pile-r', x + w + 4, top, x + w + 4, yBottom + 4, { stroke: C.dim, sw: 2 }),
        line('pile-b', x - 4, yBottom + 4, x + w + 4, yBottom + 4, { stroke: C.dim, sw: 2 }),
        text('pile-title', x + w / 2, top - 10, title, { size: 12, fill: C.grey, weight: 700 }),
        ...items.map((item, i) =>
            rect(item.id, x, yBottom - (i + 1) * (h + 3) + 3, w, h, {
                rx: 5, fill: tint(item.color, 0.35), stroke: item.color, sw: 1.5, text: item.label, textColor: C.ink, size: 12, weight: 700, mono: true,
            }),
        ),
    ];
};

// ============ BINARY TREES ============

export interface TreeNode {
    /** Position in the level-order list. */
    index: number;
    value: number;
    x: number;
    y: number;
    depth: number;
    left: TreeNode | null;
    right: TreeNode | null;
    parent: TreeNode | null;
}

/**
 * A binary tree from its level-order list (LeetCode's [3, 9, 20, null, null, 15, 7]),
 * laid out so each level halves the width of the one above.
 */
export const buildTree = (values: (number | null)[], cx: number, top: number, spread: number, levelGap: number): TreeNode | null => {
    if (values.length === 0 || values[0] === null) return null;
    const make = (index: number, value: number, x: number, depth: number, parent: TreeNode | null): TreeNode =>
        ({ index, value, x, y: top + depth * levelGap, depth, left: null, right: null, parent });
    const root = make(0, values[0], cx, 0, null);
    const queue: TreeNode[] = [root];
    let i = 1;
    while (queue.length && i < values.length) {
        const node = queue.shift()!;
        const half = spread / 2 ** (node.depth + 1);
        const left = values[i++];
        if (left !== null && left !== undefined) {
            node.left = make(i - 1, left, node.x - half, node.depth + 1, node);
            queue.push(node.left);
        }
        const right = i < values.length ? values[i++] : null;
        if (right !== null && right !== undefined) {
            node.right = make(i - 1, right, node.x + half, node.depth + 1, node);
            queue.push(node.right);
        }
    }
    return root;
};

export const treeNodes = (root: TreeNode | null): TreeNode[] => {
    const out: TreeNode[] = [];
    const walk = (node: TreeNode | null) => {
        if (!node) return;
        out.push(node);
        walk(node.left);
        walk(node.right);
    };
    walk(root);
    return out;
};

/** The edges, then the nodes, each node coloured by `look`. */
export const drawTree = (id: string, root: TreeNode | null, look: (node: TreeNode) => Look, r = 15): Shape[] => {
    const nodes = treeNodes(root);
    const edges = nodes.filter(n => n.parent).map(n => {
        const p = n.parent!;
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        const ux = (n.x - p.x) / d;
        const uy = (n.y - p.y) / d;
        return line(`${id}-e${n.index}`, p.x + ux * r, p.y + uy * r, n.x - ux * r, n.y - uy * r, { stroke: C.dim, sw: 2 });
    });
    const dots = nodes.map(n => {
        const [color, strength] = look(n);
        return circle(`${id}-n${n.index}`, n.x, n.y, r, { fill: tint(color, strength), stroke: color, sw: 2, text: String(n.value), textColor: C.ink, size: 13, weight: 700, mono: true });
    });
    return [...edges, ...dots];
};
