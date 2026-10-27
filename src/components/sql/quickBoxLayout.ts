// Where the SQL page's quick query box (FloatingSqlBox in SqlParts.tsx) sits
// when open, and the room the page leaves for it. The component lives in the
// .tsx file; the layout lives here.

/** The open box's width in its column on the right, from lg up. Below lg it is a sheet along the bottom. */
export const QUICK_BOX_WIDTH = 'clamp(340px, 30vw, 460px)';
/** The open box's distance from the window's right and bottom edges, from lg up. */
export const QUICK_BOX_EDGE = 24;
/** The gap kept between the box and the page beside it. */
const GAP = 24;

/**
 * Margins that keep a page column clear of the open box, from lg up: the
 * column narrows from the right and its left edge stays where it was.
 * `maxWidth` is the column's own. App's <main> has 8% side padding from md up
 * (App.tsx), which already sits under part of the box, so only the rest is
 * taken from the column.
 */
export const roomForQuickBox = (maxWidth: number) => ({
    width: { lg: 'auto' },
    ml: { lg: `max(0px, calc((100% - ${maxWidth}px) / 2))` },
    mr: { lg: `max(0px, calc(${QUICK_BOX_WIDTH} + ${QUICK_BOX_EDGE + GAP}px - 8vw))` },
});
