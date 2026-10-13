import { useState, type ReactNode } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    ButtonBase,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    ThemeProvider,
    type Theme,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    TAP,
    TEXT_SIZE_LABELS,
    TextSizeContext,
    px,
    scrollToId,
    stepId,
    useTextSize,
    type LearningResource,
    type LearningStep,
    type TextSize,
    type TextSizes,
} from './learning';
import { ProseText } from './GlossaryText';
import { dropLeadingChars, proseText, type Prose } from './glossaryContext';

// The building blocks the study pages share. Everything here is sized from
// the page's text-size table, so it grows with the Text size control.

/** Gives a study page its text sizes: the context for sx sizes and the theme for Typography. */
export const LearningPageFrame = ({
    t,
    theme,
    children,
}: {
    t: TextSizes;
    theme: (outer: Theme) => Theme;
    children: ReactNode;
}) => (
    <TextSizeContext.Provider value={t}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TextSizeContext.Provider>
);

/** The "TEXT SIZE" toggle in a study page's header. */
export const TextSizeControl = ({
    value,
    onChange,
}: {
    value: TextSize;
    onChange: (size: TextSize | null) => void;
}) => (
    <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: 1 }}>
            TEXT SIZE
        </Typography>
        <ToggleButtonGroup
            exclusive
            size="small"
            value={value}
            onChange={(_, size: TextSize | null) => onChange(size)}
            aria-label="Text size"
        >
            {(Object.keys(TEXT_SIZE_LABELS) as TextSize[]).map(size => (
                <ToggleButton
                    key={size}
                    value={size}
                    sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } }}
                >
                    {TEXT_SIZE_LABELS[size]}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </Box>
);

export const SectionLabel = ({ children, color = 'text.secondary', id }: { children: string; color?: string; id?: string }) => (
    <Typography
        id={id}
        variant="caption"
        sx={{ display: 'block', color, fontWeight: 800, letterSpacing: 1.2, mb: 1.5, mt: 4, scrollMarginTop: 80 }}
    >
        {children}
    </Typography>
);

export const Tag = ({ label, color = 'text.secondary', bgcolor = 'rgba(255,255,255,0.06)' }: { label: string; color?: string; bgcolor?: string }) => {
    const t = useTextSize();
    return (
        <Chip
            size="small"
            label={label}
            sx={{ height: 'auto', py: 0.25, fontSize: px(t.label), fontWeight: 700, color, bgcolor }}
        />
    );
};

/**
 * One resource in a topic's resource step. Numbered in the order to use them;
 * papers are not numbered at all, because they are not part of the order yet.
 *
 * With `allOptional`, the lesson itself is the main resource: nothing is
 * "Start here", every row says Optional, and a `recommended` one is marked
 * as worth it, with the reason under it.
 */
export const TopicResourceRow = <K extends string>({
    resource,
    accent,
    number,
    kindLabels,
    allOptional = false,
}: {
    resource: LearningResource<K>;
    accent: string;
    /** Null for an optional paper. */
    number: number | null;
    kindLabels: Record<K, string>;
    allOptional?: boolean;
}) => {
    const t = useTextSize();
    const optional = number === null;
    const worthIt = allOptional && !optional && Boolean(resource.recommended);
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ opacity: optional ? 0.55 : 1 }}>
            <Typography
                sx={{
                    color: optional ? 'text.secondary' : accent,
                    fontWeight: 800,
                    minWidth: 22,
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {optional ? '·' : number}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: optional ? 'text.secondary' : accent, fontWeight: 800, letterSpacing: 0.8 }}
                    >
                        {optional ? 'PAPER' : kindLabels[resource.kind]}
                    </Typography>
                    {number === 1 && !allOptional && <Tag label="Start here" color="#0b0f14" bgcolor={accent} />}
                    {optional && <Tag label="Optional — skip for now" />}
                    {worthIt && <Tag label={resource.kind === 'watch' ? '★ Worth watching' : '★ Worth it'} color="#0b0f14" bgcolor={accent} />}
                    {allOptional && !optional && !worthIt && <Tag label="Optional" />}
                </Stack>
                {resource.url ? (
                    <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'text.primary', fontWeight: 600, fontSize: px(t.body2), textDecorationColor: accent }}
                    >
                        {resource.title}
                    </Link>
                ) : (
                    <Typography component="span" sx={{ color: 'text.primary', fontWeight: 600, fontSize: px(t.body2) }}>
                        {resource.title}
                    </Typography>
                )}
                <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: px(t.small) }}>
                    {resource.source}
                </Typography>
                {worthIt && (
                    <Typography sx={{ mt: 0.5, color: 'text.primary', fontSize: px(t.small) }}>
                        <Box component="span" sx={{ color: accent, fontWeight: 800 }}>Why: </Box>
                        {resource.recommended}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
};

/** Small squares, one per check: how many this topic has passed, readable at a glance. */
export const CheckDots = ({ passed, total, accent }: { passed: number; total: number; accent: string }) => (
    <Stack direction="row" spacing={0.5} aria-label={`${passed} of ${total} checks passed`}>
        {Array.from({ length: total }, (_, index) => (
            <Box
                key={index}
                sx={{ width: 9, height: 9, borderRadius: 0.5, bgcolor: index < passed ? accent : 'rgba(255,255,255,0.12)' }}
            />
        ))}
    </Stack>
);

/** The steps across the top of an open card. Tapping one jumps to it. */
export const StepBar = ({ topicId, accent, steps }: { topicId: string; accent: string; steps: LearningStep[] }) => {
    const t = useTextSize();
    return (
        <Box
            component="nav"
            aria-label="Steps for this topic"
            sx={{
                display: 'grid',
                // Four steps fit in one row; more wrap onto as many rows as the width needs.
                gridTemplateColumns: steps.length > 4
                    ? { xs: '1fr 1fr', sm: 'repeat(auto-fit, minmax(170px, 1fr))' }
                    : { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 1,
                mb: 1,
            }}
        >
            {steps.map((step, index) => (
                <ButtonBase
                    key={step.title}
                    onClick={() => scrollToId(stepId(topicId, index + 1))}
                    sx={{
                        minHeight: TAP,
                        p: 1.25,
                        borderRadius: 2,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        border: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '&:hover': { borderColor: accent },
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                display: 'grid', placeItems: 'center',
                                bgcolor: `${accent}26`, color: accent, fontWeight: 800, fontSize: px(t.small),
                            }}
                        >
                            {index + 1}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: px(t.small), lineHeight: 1.3 }}>
                                {step.title}
                            </Typography>
                            {step.time && (
                                <Typography sx={{ color: 'text.secondary', fontSize: px(t.label), lineHeight: 1.3 }}>
                                    {step.time}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </ButtonBase>
            ))}
        </Box>
    );
};

/** A closed-by-default panel for reference material, in the page's own style. */
export const ReferencePanel = ({
    title,
    tint,
    border,
    children,
}: {
    title: string;
    tint: string;
    border: string;
    children: ReactNode;
}) => (
    <Accordion
        disableGutters
        slotProps={{ transition: { unmountOnExit: true } }}
        sx={{ bgcolor: tint, border: '1px solid', borderColor: border, borderRadius: 3, '&:before': { display: 'none' } }}
    >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: TAP }}>
            <Typography fontWeight={700} color="text.primary">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2.5, px: { xs: 2, sm: 2.5 } }}>{children}</AccordionDetails>
    </Accordion>
);

// ============ LESSON BLOCKS ============
//
// The parts a topic's lesson is built from (System Design, SQL).

/** A likely interview follow-up and its short answer. */
export interface FollowUpItem {
    q: string;
    a: string;
}

/** A titled part of the lesson in Step 1. */
export const Block = ({ title, children }: { title: string; children: ReactNode }) => (
    <Box>
        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
            {title}
        </Typography>
        {children}
    </Box>
);

export const Bullets = ({
    items,
    marker = 'text.secondary',
    mono = false,
    variant = 'body1',
}: {
    items: Prose[];
    marker?: string;
    mono?: boolean;
    variant?: 'body1' | 'body2';
}) => {
    const t = useTextSize();
    const fontSize = px(mono ? t.code : t[variant]);
    return (
        <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {items.map((item, index) => (
                <Stack key={index} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                    {/* Centred on the first line of text, whatever the text size. */}
                    <Box sx={{ fontSize, width: 6, height: 6, borderRadius: '50%', bgcolor: marker, flexShrink: 0, mt: 'calc(0.85em - 3px)' }} />
                    <Typography
                        variant={variant}
                        sx={{
                            minWidth: 0,
                            overflowWrap: 'anywhere',
                            ...(mono && { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize, lineHeight: 1.7 }),
                        }}
                    >
                        <ProseText value={item} />
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
};

/**
 * A numbered list. The evolution steps already start with "Version 1:",
 * "Version 2:" and so on, so those show as V1, V2 instead of being numbered twice.
 */
export const NumberedSteps = ({ items, accent, variant = 'body1' }: { items: Prose[]; accent: string; variant?: 'body1' | 'body2' }) => (
    <Stack component="ol" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map((item, index) => {
            const version = proseText(item).match(/^Version (\d+):\s*/);
            const marker = version ? `V${version[1]}` : `${index + 1}`;
            const cut = version ? version[0].length : 0;
            const text = typeof item === 'string' ? item.slice(cut) : dropLeadingChars(item, cut);
            return (
                <Stack key={index} component="li" direction="row" spacing={1.5} alignItems="flex-start">
                    <Typography sx={{ color: accent, fontWeight: 800, minWidth: 26, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {marker}
                    </Typography>
                    <Typography variant={variant} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        <ProseText value={text} />
                    </Typography>
                </Stack>
            );
        })}
    </Stack>
);

export const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
    const t = useTextSize();
    return (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SyntaxHighlighter
                language={language ?? 'python'}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '14px 16px', backgroundColor: '#000000', fontSize: px(t.code), lineHeight: 1.55 }}
            >
                {code}
            </SyntaxHighlighter>
        </Box>
    );
};

export const QuoteBox = ({ accent, children }: { accent: string; children: ReactNode }) => (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${accent}14`, borderLeft: '3px solid', borderColor: accent }}>
        {children}
    </Box>
);

/** Each question visible, each answer hidden until asked for, so it can be a self-test. */
export const FollowUps = ({
    topic,
    accent,
    marked,
}: {
    topic: { id: string; followUps: FollowUpItem[] };
    accent: string;
    marked: (section: 'followUps') => Prose[];
}) => {
    const [shown, setShown] = useState<Set<number>>(() => new Set());
    const toggle = (index: number) =>
        setShown(current => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });

    return (
        <Stack spacing={1.5}>
            {topic.followUps.map((followUp, index) => {
                const open = shown.has(index);
                const answerId = `followup-${topic.id}-${index}`;
                return (
                    <Box key={followUp.q} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            <ProseText value={marked('followUps')[2 * index] ?? followUp.q} />
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => toggle(index)}
                            aria-expanded={open}
                            aria-controls={answerId}
                            sx={{ minHeight: TAP, mt: 0.5, px: 1, textTransform: 'none', fontWeight: 700, color: accent }}
                        >
                            {open ? 'Hide answer' : 'Show answer'}
                        </Button>
                        {open && (
                            <Typography id={answerId} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <ProseText value={marked('followUps')[2 * index + 1] ?? followUp.a} />
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Stack>
    );
};
