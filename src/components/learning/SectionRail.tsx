import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, ClickAwayListener, Paper, Typography } from '@mui/material';
import { CYAN, currentSection, px, useTextSize } from './learning';

// A thin column of ticks down the left edge of a study page, one per section
// of what is open (a topic, its steps, the titled parts of each step). The
// tick for where you are lights up as you scroll; hover the column (or tap it
// on a phone) to see the names, and pick one to jump there.
//
// Sections mark themselves with data-nav ("topic", "step" or "part") and
// data-nav-label: SectionLabel and Block do it for every page, and each page
// marks its open topic's title.

type Level = 'topic' | 'step' | 'part';

interface Section {
    el: HTMLElement;
    label: string;
    level: Level;
}

/** Where a heading lands after a jump, below the top of the window (as SectionLabel's scrollMarginTop). */
const OFFSET = 80;
/** Fewer sections than this, and there is nothing worth navigating. */
const MIN_SECTIONS = 3;
const RAIL_WIDTH = 22;
const TICK_WIDTH: Record<Level, number> = { topic: 16, step: 12, part: 7 };
const IDLE = 'rgba(255,255,255,0.3)';

const findSections = (): Section[] =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'))
        .filter(el => el.getClientRects().length > 0 && el.dataset.navLabel)
        .map(el => ({ el, label: el.dataset.navLabel!, level: el.dataset.nav as Level }));

const sameSections = (a: Section[], b: Section[]) =>
    a.length === b.length && a.every((section, index) => section.el === b[index].el && section.label === b[index].label);

/** Frames the page must stay still before a jump is checked, and how long to keep correcting it. */
const STILL_FRAMES = 6;
const MAX_JUMP_MS = 3000;

/**
 * Scroll so the element's top sits OFFSET below the top of the window (or to
 * the very top, for null). Diagrams and animations above it can still be
 * growing as they come into view, which moves the target, so once the scroll
 * stops it is checked and corrected. Scrolling yourself cancels it.
 */
const jumpTo = (el: HTMLElement | null) => {
    const offBy = () => (el ? el.getBoundingClientRect().top - OFFSET : -window.scrollY);
    const go = () => window.scrollTo({ top: Math.max(0, window.scrollY + offBy()), behavior: 'smooth' });
    const started = performance.now();
    let cancelled = false;
    let lastY = Number.NaN;
    let still = 0;
    const cancel = () => {
        cancelled = true;
    };
    const stopListening = () => {
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchmove', cancel);
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });
    const check = () => {
        if (cancelled || performance.now() - started > MAX_JUMP_MS) return stopListening();
        still = window.scrollY === lastY ? still + 1 : 0;
        lastY = window.scrollY;
        if (still >= STILL_FRAMES) {
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            if (Math.abs(offBy()) <= 2 || (atBottom && offBy() > 0)) return stopListening();
            go();
            still = 0;
        }
        window.requestAnimationFrame(check);
    };
    go();
    window.requestAnimationFrame(check);
};

export const SectionRail = () => {
    const t = useTextSize();
    const [sections, setSections] = useState<Section[]>([]);
    const [active, setActive] = useState(-1);
    const [open, setOpen] = useState(false);
    const [place, setPlace] = useState<{ left: number; height: number } | null>(null);
    const known = useRef<Section[]>([]);
    const closeTimer = useRef(0);
    // A mouse can hover to read the names; a finger taps the column to open them.
    const [canHover] = useState(() => window.matchMedia?.('(hover: hover)').matches ?? true);

    // Find the sections, and again whenever the page changes (a topic opens, an answer appears).
    useEffect(() => {
        let timer = 0;
        const scan = () => {
            const found = findSections();
            if (!sameSections(found, known.current)) {
                known.current = found;
                setSections(found);
            }
        };
        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(scan, 150);
        };
        schedule();
        const observer = new MutationObserver(schedule);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-nav', 'data-nav-label'] });
        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
        };
    }, []);

    // Light up the section being read.
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            setActive(currentSection(sections.map(section => section.el.getBoundingClientRect().top), OFFSET + 40, atBottom));
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [sections]);

    // Sit in the page's left margin, next to the sidebar, and move with it when it collapses.
    useEffect(() => {
        const main = document.querySelector('main') ?? document.body;
        const measure = () => {
            const padding = parseFloat(getComputedStyle(main).paddingLeft) || 0;
            setPlace({
                left: Math.max(2, main.getBoundingClientRect().left + (padding - RAIL_WIDTH) / 2),
                height: window.innerHeight,
            });
        };
        const observer = new ResizeObserver(measure);
        observer.observe(main);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    if (sections.length < MIN_SECTIONS || !place) return null;

    const jump = (index: number) => {
        jumpTo(index < 0 ? null : sections[index].el);
        if (!canHover) setOpen(false);
    };
    const show = () => {
        window.clearTimeout(closeTimer.current);
        setOpen(true);
    };
    const hide = () => {
        closeTimer.current = window.setTimeout(() => setOpen(false), 250);
    };
    // Ticks share at most 70% of the window's height.
    const gap = Math.max(5, Math.min(12, (place.height * 0.7) / sections.length));

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box
                component="nav"
                aria-label="Jump to a section"
                onMouseEnter={canHover ? show : undefined}
                onMouseLeave={canHover ? hide : undefined}
                sx={{ position: 'fixed', top: '50%', left: place.left, transform: 'translateY(-50%)', zIndex: 1200, display: 'flex', alignItems: 'center' }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
                    {sections.map((section, index) => {
                        const current = index === active;
                        return (
                            <ButtonBase
                                key={index}
                                aria-label={canHover ? section.label : 'Show the sections'}
                                aria-current={current ? 'location' : undefined}
                                onClick={() => (canHover ? jump(index) : setOpen(isOpen => !isOpen))}
                                onFocus={canHover ? show : undefined}
                                sx={{ width: RAIL_WIDTH, height: gap, justifyContent: 'flex-start', pl: 0.25 }}
                            >
                                <Box
                                    sx={{
                                        height: current ? 3 : 2,
                                        width: TICK_WIDTH[section.level] + (current ? 4 : 0),
                                        borderRadius: 1,
                                        bgcolor: current ? CYAN : IDLE,
                                        transition: 'width 150ms, background-color 150ms',
                                    }}
                                />
                            </ButtonBase>
                        );
                    })}
                </Box>
                {open && (
                    <Paper
                        elevation={8}
                        sx={{
                            ml: 0.5,
                            width: 260,
                            maxWidth: 'calc(100vw - 48px)',
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            p: 1,
                            bgcolor: '#151921',
                            backgroundImage: 'none',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="caption" sx={{ display: 'block', px: 1, pb: 0.5, color: 'text.secondary', fontWeight: 800, letterSpacing: 1 }}>
                            ON THIS PAGE
                        </Typography>
                        {[{ label: 'Top of the page', level: 'topic' as Level }, ...sections].map((section, row) => {
                            const index = row - 1;
                            const current = index === active;
                            return (
                                <ButtonBase
                                    key={row}
                                    onClick={() => jump(index)}
                                    sx={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        minHeight: canHover ? 30 : 40,
                                        px: 1,
                                        pl: section.level === 'part' ? 2.5 : 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        color: current ? CYAN : section.level === 'part' ? 'text.secondary' : 'text.primary',
                                        bgcolor: current ? 'rgba(77,208,225,0.1)' : 'transparent',
                                        fontSize: px(t.small),
                                        fontWeight: section.level === 'topic' ? 800 : section.level === 'step' ? 700 : 400,
                                        lineHeight: 1.35,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                                    }}
                                >
                                    {row === 0 ? `↑ ${section.label}` : section.label}
                                </ButtonBase>
                            );
                        })}
                    </Paper>
                )}
            </Box>
        </ClickAwayListener>
    );
};
