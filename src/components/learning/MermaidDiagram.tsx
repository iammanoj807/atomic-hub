import { useEffect, useId, useRef, useState } from 'react';
import { Box, Button, Dialog, IconButton, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import { TAP, px, useTextSize } from './learning';

// Mermaid is big, so it is only loaded when the first diagram comes near the
// screen, and it ends up in its own chunks rather than the main bundle.

/** A diagram shrinks to fit, but never below this share of its size: past that its words get too small, so it scrolls sideways instead. */
const MIN_SCALE = 0.7;
/** In the enlarged view a small diagram may grow, but not without limit. */
const MAX_ENLARGE = 1.6;
const DIAGRAM_BG = 'rgba(255,255,255,0.04)';

/**
 * Mermaid's dark theme draws pie slices in near-black browns and charts on a
 * grey block. These use the app's own accents instead. They only touch pie
 * charts and xy charts, so every other kind of diagram keeps the dark theme as it is.
 */
const CHART_TEXT = '#d7d2ce';
const CHART_LINE = 'rgba(255,255,255,0.45)';
const CHART_COLOURS = ['#4dd0e1', '#ffca28', '#66bb6a', '#ff8a65', '#ba68c8', '#4fc3f7', '#aed581', '#f06292'];
const CHART_THEME = {
    ...Object.fromEntries(CHART_COLOURS.map((colour, index) => [`pie${index + 1}`, colour])),
    pieOpacity: '0.9',
    pieStrokeColor: '#151921',
    pieOuterStrokeColor: 'rgba(255,255,255,0.2)',
    pieSectionTextColor: '#0b0f14',
    pieTitleTextColor: '#d7d2ce',
    pieLegendTextColor: '#d7d2ce',
    xyChart: {
        backgroundColor: 'transparent',
        plotColorPalette: CHART_COLOURS.join(', '),
        // Set by hand: on a transparent background Mermaid's own choices come out near-black.
        titleColor: CHART_TEXT,
        xAxisTitleColor: CHART_TEXT,
        xAxisLabelColor: CHART_TEXT,
        xAxisTickColor: CHART_LINE,
        xAxisLineColor: CHART_LINE,
        yAxisTitleColor: CHART_TEXT,
        yAxisLabelColor: CHART_TEXT,
        yAxisTickColor: CHART_LINE,
        yAxisLineColor: CHART_LINE,
    },
};

let initialised = false;
let renderCount = 0;

type Rendered = { code: string; svg: string; width: number } | { code: string; failed: true };

/** The diagram's natural width, from its viewBox. 0 when it can't be read. */
const naturalWidth = (svg: string) => {
    const match = svg.match(/viewBox="[\d.-]+\s+[\d.-]+\s+([\d.]+)/);
    return match ? Math.ceil(Number(match[1])) : 0;
};

/**
 * A Mermaid diagram with a "how to read it" caption. While Mermaid loads it
 * shows a placeholder; if the diagram can't be drawn, it shows the source so
 * nothing is lost. "Tap to enlarge" opens it full-screen.
 */
export const MermaidDiagram = ({ code, caption, title }: { code: string; caption: string; title: string }) => {
    const theme = useTheme();
    const t = useTextSize();
    const fontFamily = theme.typography.fontFamily;
    // Mermaid uses the id in CSS selectors, so only letters and digits.
    const baseId = useId().replace(/[^A-Za-z0-9]/g, '');
    const boxRef = useRef<HTMLDivElement>(null);
    const [nearScreen, setNearScreen] = useState(() => typeof IntersectionObserver === 'undefined');
    const [rendered, setRendered] = useState<Rendered | null>(null);
    const [enlarged, setEnlarged] = useState(false);

    // Revise mode can show every diagram at once: draw each one only as it comes near.
    useEffect(() => {
        if (nearScreen || !boxRef.current) return;
        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    setNearScreen(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px 0px' }
        );
        observer.observe(boxRef.current);
        return () => observer.disconnect();
    }, [nearScreen]);

    useEffect(() => {
        if (!nearScreen) return;
        let cancelled = false;
        // A fresh id every run: StrictMode runs this twice, and the two must not collide.
        renderCount += 1;
        const id = `mermaid${baseId}n${renderCount}`;
        const draw = async () => {
            try {
                const mermaid = (await import('mermaid')).default;
                if (!initialised) {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: 'dark',
                        securityLevel: 'strict',
                        fontFamily,
                        themeVariables: CHART_THEME,
                        suppressErrorRendering: true,
                    });
                    initialised = true;
                }
                const { svg } = await mermaid.render(id, code);
                if (!cancelled) setRendered({ code, svg, width: naturalWidth(svg) });
            } catch {
                // Mermaid can leave its scratch element behind when it fails.
                document.getElementById(`d${id}`)?.remove();
                document.getElementById(id)?.remove();
                if (!cancelled) setRendered({ code, failed: true });
            }
        };
        void draw();
        return () => {
            cancelled = true;
        };
    }, [nearScreen, code, baseId, fontFamily]);

    // A result for different code is out of date: treat it as still loading.
    const current = rendered?.code === code ? rendered : null;
    const svg = current && 'svg' in current ? current : null;
    const failed = current !== null && 'failed' in current;

    return (
        <Box sx={{ minWidth: 0 }}>
            <Box
                ref={boxRef}
                sx={{ borderRadius: 2, bgcolor: DIAGRAM_BG, border: '1px solid rgba(255,255,255,0.08)', p: { xs: 1.5, sm: 2 }, minWidth: 0 }}
            >
                {svg ? (
                    // Wide diagrams scroll sideways in here, never the page.
                    <Box sx={{ overflowX: 'auto', overscrollBehaviorX: 'contain' }}>
                        <Box
                            role="img"
                            aria-label={caption}
                            sx={{
                                '& svg': {
                                    display: 'block',
                                    mx: 'auto',
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: svg.width ? `${svg.width}px` : '100%',
                                    minWidth: svg.width ? `${Math.round(svg.width * MIN_SCALE)}px` : 0,
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: svg.svg }}
                        />
                    </Box>
                ) : failed ? (
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            This diagram couldn't be drawn. Here is its outline instead:
                        </Typography>
                        <Box
                            component="pre"
                            sx={{ m: 0, p: 1.5, borderRadius: 1.5, bgcolor: '#000', overflowX: 'auto', fontSize: px(t.code), lineHeight: 1.55, color: 'text.primary' }}
                        >
                            {code}
                        </Box>
                    </Box>
                ) : (
                    <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} aria-label="Loading diagram" />
                )}
            </Box>

            {svg && (
                <Button
                    size="small"
                    startIcon={<ZoomOutMapRoundedIcon />}
                    onClick={() => setEnlarged(true)}
                    sx={{ minHeight: TAP, mt: 0.5, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                    Tap to enlarge
                </Button>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: svg ? 0 : 1 }}>
                <Box component="em" sx={{ color: 'text.primary', fontWeight: 700 }}>How to read it:</Box> {caption}
            </Typography>

            {svg && (
                <Dialog
                    fullScreen
                    open={enlarged}
                    onClose={() => setEnlarged(false)}
                    aria-labelledby={`${baseId}-title`}
                    slotProps={{ paper: { sx: { bgcolor: 'background.default', backgroundImage: 'none' } } }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <Typography id={`${baseId}-title`} fontWeight={700} color="text.primary" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                            {title}
                        </Typography>
                        <IconButton onClick={() => setEnlarged(false)} aria-label="Close diagram" sx={{ width: TAP, height: TAP }}>
                            <CloseRoundedIcon />
                        </IconButton>
                    </Stack>
                    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        <Box
                            role="img"
                            aria-label={caption}
                            sx={{
                                '& svg': {
                                    display: 'block',
                                    mx: 'auto',
                                    width: '100%',
                                    height: 'auto',
                                    // Mermaid sets its own max-width inline; let it grow a little here.
                                    maxWidth: svg.width ? `${Math.round(svg.width * MAX_ENLARGE)}px !important` : 'none !important',
                                    minWidth: svg.width ? `${svg.width}px` : 0,
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: svg.svg }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 760, mx: 'auto' }}>
                            <Box component="em" sx={{ color: 'text.primary', fontWeight: 700 }}>How to read it:</Box> {caption}
                        </Typography>
                    </Box>
                </Dialog>
            )}
        </Box>
    );
};
