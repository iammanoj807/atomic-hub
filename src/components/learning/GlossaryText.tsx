import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Box, Button, Paper, Popover, Popper, Stack, Typography, styled } from '@mui/material';
import type { GlossaryTerm } from '../../data/systemDesignGlossary';
import type { SDTopic } from '../../data/systemDesign';
import {
    findSystemDesignTopic,
    getGlossaryTerm,
    newWordsForTopic,
    type TextSegment,
} from '../../utils/glossary';
import { CYAN, TAP } from './learning';
import {
    GlossaryActionsContext,
    GlossaryTopicContext,
    useGlossaryActions,
    useGlossaryTopic,
    type GlossaryActions,
    type GlossaryOpenHow,
    type Prose,
} from './glossaryContext';

// Tap-to-explain words. A page wraps itself in GlossaryProvider, which owns
// the one explanation box for the whole page; each underlined word only asks
// it to open. That keeps thousands of words cheap in Revise mode.

const NEW_WORDS_SHOWN = 6;
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
    const teacher = term.taughtIn && term.taughtIn !== topicId ? findSystemDesignTopic(term.taughtIn) : undefined;
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
export const GlossaryProvider = ({ openTopic, children }: { openTopic: (topicId: string) => void; children: ReactNode }) => {
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
        []
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

    const term = shown ? getGlossaryTerm(shown.termId) : undefined;
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

/** Text with its glossary words underlined; tap one to see what it means. */
export const GlossaryText = ({ segments }: { segments: TextSegment[] }) => (
    <>
        {segments.map((segment, index) =>
            segment.termId ? (
                <GlossaryWord key={index} text={segment.text} termId={segment.termId} />
            ) : (
                <Fragment key={index}>{segment.text}</Fragment>
            )
        )}
    </>
);

/** Plain text, or text with its glossary words marked. */
export const ProseText = ({ value }: { value: Prose }) =>
    typeof value === 'string' ? <>{value}</> : <GlossaryText segments={value} />;

/** "New words in this topic": the words this topic is the first to use. */
export const NewWordsBox = ({ topic, accent }: { topic: SDTopic; accent: string }) => {
    const words = useMemo(() => newWordsForTopic(topic), [topic]);
    const [showAll, setShowAll] = useState(false);
    const actions = useGlossaryActions();
    if (words.length === 0) return null;
    const visible = showAll ? words : words.slice(0, NEW_WORDS_SHOWN);

    return (
        <Box sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 1.2, mb: 0.25 }}>
                NEW WORDS IN THIS TOPIC
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Read these first. Underlined words below can be tapped at any time.
            </Typography>
            <Stack spacing={1}>
                {visible.map(term => (
                    <TermEntry key={term.id} term={term} topicId={topic.id} onLearn={id => actions?.openTopic(id)} />
                ))}
            </Stack>
            {words.length > NEW_WORDS_SHOWN && (
                <Button
                    size="small"
                    onClick={() => setShowAll(value => !value)}
                    aria-expanded={showAll}
                    sx={{ minHeight: TAP, mt: 0.5, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: accent }}
                >
                    {showAll ? 'Show fewer' : `Show all (${words.length})`}
                </Button>
            )}
        </Box>
    );
};
