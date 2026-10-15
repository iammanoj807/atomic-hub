import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Box, Button, Collapse, Paper, Popover, Popper, Stack, Typography, styled } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import type { GlossaryTerm, TextSegment } from '../../utils/glossaryEngine';
import { CYAN, TAP } from './learning';
import {
    GlossaryActionsContext,
    GlossaryTopicContext,
    useGlossaryActions,
    useGlossaryTopic,
    type GlossaryActions,
    type GlossaryOpenHow,
    type PageGlossary,
    type Prose,
} from './glossaryContext';

// Tap-to-explain words. A page wraps itself in GlossaryProvider, which owns
// the one explanation box for the whole page; each underlined word only asks
// it to open. That keeps thousands of words cheap in Revise mode.

/** How long the hover explanation waits before closing, so the mouse can move onto it. */
const HOVER_CLOSE_DELAY = 200;
const POPUP_BG = '#1e2430';

/** "Learn it fully: <topic>", when another topic teaches the word in depth. */
const LearnItFully = ({
    term,
    topicId,
    onLearn,
}: {
    term: GlossaryTerm;
    topicId: string | undefined;
    onLearn: (topicId: string) => void;
}) => {
    const source = useGlossaryActions()?.source;
    const teacher = term.taughtIn && term.taughtIn !== topicId ? source?.findTopic(term.taughtIn) : undefined;
    if (!teacher) return null;
    return (
        <Button
            size="small"
            onClick={() => onLearn(teacher.id)}
            sx={{
                minHeight: TAP,
                px: 1,
                ml: -1,
                textTransform: 'none',
                fontWeight: 700,
                color: CYAN,
                justifyContent: 'flex-start',
                textAlign: 'left',
            }}
        >
            Learn it fully: {teacher.name} →
        </Button>
    );
};

/** A word in bold, its definition, and the "Learn it fully" link. For lists of words. */
export const TermEntry = ({
    term,
    topicId,
    onLearn,
}: {
    term: GlossaryTerm;
    topicId?: string;
    onLearn: (topicId: string) => void;
}) => (
    <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="strong" sx={{ color: 'text.primary', fontWeight: 800 }}>{term.term}</Box>
            {' — '}
            {term.definition}
        </Typography>
        <LearnItFully term={term} topicId={topicId} onLearn={onLearn} />
    </Box>
);

/** What the explanation box shows: the word, its meaning, and where to learn it fully. */
const Explanation = ({
    term,
    topicId,
    onLearn,
}: {
    term: GlossaryTerm;
    topicId: string | undefined;
    onLearn: (topicId: string) => void;
}) => (
    <Box sx={{ p: 2, pb: term.taughtIn && term.taughtIn !== topicId ? 1 : 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.4, mb: 0.5 }}>
            {term.term}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {term.definition}
        </Typography>
        <LearnItFully term={term} topicId={topicId} onLearn={onLearn} />
    </Box>
);

interface Shown {
    anchor: HTMLElement;
    termId: string;
    topicId: string | undefined;
    how: GlossaryOpenHow;
    open: boolean;
}

/**
 * Gives every glossary word inside it somewhere to open. A tap, click, Enter
 * or Space opens a box that keeps focus until closed; on a desktop, hovering
 * a word shows the same box until the mouse leaves both the word and the box.
 */
export const GlossaryProvider = ({
    source,
    openTopic,
    children,
}: {
    source: PageGlossary;
    openTopic: (topicId: string) => void;
    children: ReactNode;
}) => {
    const [shown, setShown] = useState<Shown | null>(null);
    const closeTimer = useRef<number | undefined>(undefined);

    // The page makes a new openTopic each render; reading it through a ref
    // keeps the context value stable, so the words don't all re-render on hover.
    const openTopicRef = useRef(openTopic);
    useEffect(() => {
        openTopicRef.current = openTopic;
    });
    useEffect(() => () => window.clearTimeout(closeTimer.current), []);

    const actions = useMemo<GlossaryActions>(
        () => ({
            source,
            show: (anchor, termId, topicId, how) => {
                window.clearTimeout(closeTimer.current);
                setShown(current =>
                    // A hover never replaces a box opened on purpose.
                    current?.open && current.how === 'press' && how === 'hover'
                        ? current
                        : { anchor, termId, topicId, how, open: true }
                );
            },
            leave: () => {
                window.clearTimeout(closeTimer.current);
                closeTimer.current = window.setTimeout(
                    () => setShown(current => (current?.how === 'hover' ? { ...current, open: false } : current)),
                    HOVER_CLOSE_DELAY
                );
            },
            openTopic: topicId => openTopicRef.current(topicId),
        }),
        [source]
    );

    const close = () => {
        window.clearTimeout(closeTimer.current);
        setShown(current => current && { ...current, open: false });
    };
    // Close first: the word the box points at may disappear when the topic opens.
    const learn = (topicId: string) => {
        close();
        actions.openTopic(topicId);
    };

    const term = shown ? source.getTerm(shown.termId) : undefined;
    const content = term && shown && <Explanation term={term} topicId={shown.topicId} onLearn={learn} />;
    const paperSx = {
        maxWidth: 'min(360px, calc(100vw - 32px))',
        bgcolor: POPUP_BG,
        backgroundImage: 'none',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 2,
    };

    return (
        <GlossaryActionsContext.Provider value={actions}>
            {children}
            <Popover
                open={Boolean(shown?.open && shown.how === 'press')}
                anchorEl={shown?.anchor}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                marginThreshold={16}
                slotProps={{
                    paper: { role: 'dialog', 'aria-label': term ? `What "${term.term}" means` : undefined, sx: paperSx },
                }}
            >
                {content}
            </Popover>
            <Popper
                open={Boolean(shown?.open && shown.how === 'hover')}
                anchorEl={shown?.anchor}
                placement="bottom-start"
                modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
                sx={{ zIndex: theme => theme.zIndex.tooltip }}
                onMouseEnter={() => window.clearTimeout(closeTimer.current)}
                onMouseLeave={actions.leave}
            >
                <Paper elevation={8} sx={paperSx}>
                    {content}
                </Paper>
            </Popper>
        </GlossaryActionsContext.Provider>
    );
};

/** The topic a card is about, for every word inside it. */
export const GlossaryTopic = ({ topicId, children }: { topicId: string; children: ReactNode }) => (
    <GlossaryTopicContext.Provider value={topicId}>{children}</GlossaryTopicContext.Provider>
);

// One shared style rather than an sx per word: a card can hold a hundred of them.
const Word = styled('span')({
    cursor: 'help',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationThickness: '1.5px',
    textDecorationColor: 'rgba(255,255,255,0.45)',
    textUnderlineOffset: '0.22em',
    borderRadius: 2,
    '&:hover': { textDecorationColor: CYAN },
    '&:focus-visible': { outline: `2px solid ${CYAN}`, outlineOffset: 2, textDecorationColor: CYAN },
});

const GlossaryWord = ({ text, termId }: { text: string; termId: string }) => {
    const actions = useGlossaryActions();
    const topicId = useGlossaryTopic();
    if (!actions) return <>{text}</>;

    const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        actions.show(event.currentTarget, termId, topicId, 'press');
    };

    return (
        <Word
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`${text}: show what it means`}
            onClick={event => actions.show(event.currentTarget, termId, topicId, 'press')}
            onKeyDown={onKeyDown}
            onPointerEnter={event => {
                if (event.pointerType === 'mouse') actions.show(event.currentTarget, termId, topicId, 'hover');
            }}
            onPointerLeave={event => {
                if (event.pointerType === 'mouse') actions.leave();
            }}
        >
            {text}
        </Word>
    );
};

const InlineCode = styled('code')({
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.88em',
    color: '#ffcc80',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 4,
    padding: '0.05em 0.35em',
    overflowWrap: 'anywhere',
});

/**
 * Text that is not a glossary word. `Backticks` mark inline code (the SQL notes
 * use them for snippets like `WHERE salary > 50000`); it is shown in a code font.
 */
const PlainText = ({ text }: { text: string }) => {
    if (!text.includes('`')) return <>{text}</>;
    // Splitting on a captured group puts the code at the odd positions.
    const parts = text.split(/`([^`]+)`/);
    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? <InlineCode key={index}>{part}</InlineCode> : <Fragment key={index}>{part}</Fragment>
            )}
        </>
    );
};

/** Text with its glossary words underlined; tap one to see what it means. */
export const GlossaryText = ({ segments }: { segments: TextSegment[] }) => (
    <>
        {segments.map((segment, index) =>
            segment.termId ? (
                <GlossaryWord key={index} text={segment.text} termId={segment.termId} />
            ) : (
                <PlainText key={index} text={segment.text} />
            )
        )}
    </>
);

/** Plain text, or text with its glossary words marked. */
export const ProseText = ({ value }: { value: Prose }) =>
    typeof value === 'string' ? <PlainText text={value} /> : <GlossaryText segments={value} />;

/**
 * "New words in this topic": the words this topic is the first to use. They sit
 * behind one button so the lesson starts straight after its definition.
 */
export const NewWordsBox = ({ topicId, accent }: { topicId: string; accent: string }) => {
    const actions = useGlossaryActions();
    const source = actions?.source;
    const words = useMemo(() => source?.newWordsForTopicId(topicId) ?? [], [source, topicId]);
    const [open, setOpen] = useState(false);
    const listId = useId();
    if (words.length === 0) return null;

    return (
        <Box>
            <Button
                variant="outlined"
                onClick={() => setOpen(value => !value)}
                aria-expanded={open}
                aria-controls={listId}
                endIcon={
                    <ExpandMoreRoundedIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                }
                sx={{
                    minHeight: TAP,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: accent,
                    borderColor: `${accent}66`,
                    '&:hover': { borderColor: accent, bgcolor: `${accent}14` },
                    '&:focus': { outline: 'none' },
                    '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
                }}
            >
                New words in this topic ({words.length})
            </Button>
            <Collapse in={open} id={listId}>
                <Box sx={{ mt: 1.25, p: { xs: 1.75, sm: 2 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Underlined words in the lesson can be tapped at any time.
                    </Typography>
                    <Stack spacing={1}>
                        {words.map(term => (
                            <TermEntry key={term.id} term={term} topicId={topicId} onLearn={id => actions?.openTopic(id)} />
                        ))}
                    </Stack>
                </Box>
            </Collapse>
        </Box>
    );
};
