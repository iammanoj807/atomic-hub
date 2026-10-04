import type { ReactNode } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ButtonBase,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    ThemeProvider,
    type Theme,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
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
 */
export const TopicResourceRow = <K extends string>({
    resource,
    accent,
    number,
    kindLabels,
}: {
    resource: LearningResource<K>;
    accent: string;
    /** Null for an optional paper. */
    number: number | null;
    kindLabels: Record<K, string>;
}) => {
    const t = useTextSize();
    const optional = number === null;
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
                    {number === 1 && <Tag label="Start here" color="#0b0f14" bgcolor={accent} />}
                    {optional && <Tag label="Optional — skip for now" />}
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
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1, mb: 1 }}
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
