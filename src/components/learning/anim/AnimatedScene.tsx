import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Box, ButtonBase, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { TAP, px, useTextSize } from '../learning';
import {
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    easeInOut,
    holdFor,
    tweenShapes,
    type AnimationSpec,
    type Shape,
} from './scene';

// Plays an AnimationSpec: the picture, the caption for the current frame, and
// controls to play, pause and step. It starts by itself the first time it
// scrolls into view (unless the reader prefers reduced motion), pauses when it
// leaves the screen, and stops on the last frame.

const TRANSITION_MS = 750;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** An arrowhead at (x2, y2), pointing away from (x1, y1). */
const arrowHead = (x1: number, y1: number, x2: number, y2: number, size: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const spread = Math.PI / 7;
    const a = [x2 - size * Math.cos(angle - spread), y2 - size * Math.sin(angle - spread)];
    const b = [x2 - size * Math.cos(angle + spread), y2 - size * Math.sin(angle + spread)];
    return `${x2},${y2} ${a[0]},${a[1]} ${b[0]},${b[1]}`;
};

const Lines = ({ x, y, value, size }: { x: number; y: number; value: string; size: number }) => {
    const rows = value.split('\n');
    if (rows.length === 1) return <>{value}</>;
    const first = -((rows.length - 1) * 1.15) / 2;
    return (
        <>
            {rows.map((row, index) => (
                <tspan key={index} x={x} y={y} dy={`${first + index * 1.15}em`} style={{ fontSize: size }}>
                    {row}
                </tspan>
            ))}
        </>
    );
};

const Label = ({ x, y, value, size, color, weight, mono }: { x: number; y: number; value: string; size: number; color: string; weight?: number; mono?: boolean }) => (
    <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        style={{ fontSize: size, fontWeight: weight ?? 600, fontFamily: mono ? MONO : 'inherit' }}
    >
        <Lines x={x} y={y} value={value} size={size} />
    </text>
);

const ShapeView = ({ shape }: { shape: Shape }) => {
    const opacity = Math.max(0, Math.min(1, shape.opacity ?? 1));
    if (opacity <= 0.01) return null;
    switch (shape.kind) {
        case 'rect':
            return (
                <g opacity={opacity}>
                    <rect
                        x={shape.x}
                        y={shape.y}
                        width={Math.max(0, shape.w)}
                        height={Math.max(0, shape.h)}
                        rx={shape.rx ?? 0}
                        fill={shape.fill ?? 'none'}
                        stroke={shape.stroke ?? 'none'}
                        strokeWidth={shape.sw ?? 0}
                        strokeDasharray={shape.dash}
                    />
                    {shape.text && (
                        <Label x={shape.x + shape.w / 2} y={shape.y + shape.h / 2} value={shape.text} size={shape.size ?? 13} color={shape.textColor ?? '#e6edf3'} weight={shape.weight} mono={shape.mono} />
                    )}
                </g>
            );
        case 'circle':
            return (
                <g opacity={opacity}>
                    <circle cx={shape.x} cy={shape.y} r={Math.max(0, shape.r)} fill={shape.fill ?? 'none'} stroke={shape.stroke ?? 'none'} strokeWidth={shape.sw ?? 0} strokeDasharray={shape.dash} />
                    {shape.text && (
                        <Label x={shape.x} y={shape.y} value={shape.text} size={shape.size ?? 12} color={shape.textColor ?? '#e6edf3'} weight={shape.weight} mono={shape.mono} />
                    )}
                </g>
            );
        case 'line': {
            const stroke = shape.stroke ?? '#90a4ae';
            const width = shape.sw ?? 2;
            return (
                <g opacity={opacity}>
                    <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={stroke} strokeWidth={width} strokeDasharray={shape.dash} strokeLinecap="round" />
                    {shape.arrow && <polygon points={arrowHead(shape.x1, shape.y1, shape.x2, shape.y2, 6 + width * 1.5)} fill={stroke} />}
                </g>
            );
        }
        case 'path': {
            if (shape.points.length === 0) return null;
            const d = shape.points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + (shape.closed ? ' Z' : '');
            const stroke = shape.stroke ?? '#4dd0e1';
            const width = shape.sw ?? 2.5;
            const n = shape.points.length;
            return (
                <g opacity={opacity}>
                    <path d={d} fill={shape.fill ?? 'none'} stroke={stroke} strokeWidth={width} strokeDasharray={shape.dash} strokeLinejoin="round" strokeLinecap="round" />
                    {shape.arrow && n > 1 && (
                        <polygon points={arrowHead(shape.points[n - 2][0], shape.points[n - 2][1], shape.points[n - 1][0], shape.points[n - 1][1], 6 + width * 1.5)} fill={stroke} />
                    )}
                </g>
            );
        }
        case 'text': {
            const size = shape.size ?? 13;
            return (
                <text
                    x={shape.x}
                    y={shape.y}
                    opacity={opacity}
                    textAnchor={shape.anchor ?? 'middle'}
                    dominantBaseline="central"
                    fill={shape.fill ?? '#e6edf3'}
                    style={{ fontSize: size, fontWeight: shape.weight ?? 500, fontFamily: shape.mono ? MONO : 'inherit' }}
                >
                    <Lines x={shape.x} y={shape.y} value={shape.text} size={size} />
                </text>
            );
        }
    }
};

const ControlButton = ({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) => (
    <Tooltip title={label} arrow>
        <span>
            <IconButton
                aria-label={label}
                onClick={onClick}
                disabled={disabled}
                sx={{
                    width: TAP,
                    height: TAP,
                    p: 0,
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    '&:focus': { outline: 'none' },
                    '&.Mui-focusVisible': { outline: '2px solid rgba(255,255,255,0.6)', outlineOffset: 2 },
                }}
            >
                {children}
            </IconButton>
        </span>
    </Tooltip>
);

interface View {
    index: number;
    /** Progress of the move into `index`, 0 to 1. */
    t: number;
    /** Bumped on every jump, so a new move restarts even to the same frame. */
    seq: number;
}

export const AnimatedScene = ({ spec, accent }: { spec: AnimationSpec; accent: string }) => {
    const t = useTextSize();
    const reduced = useMemo(prefersReducedMotion, []);
    const [variant, setVariant] = useState(0);
    const frames = spec.variants[Math.min(variant, spec.variants.length - 1)].frames;
    const [view, setView] = useState<View>({ index: 0, t: 1, seq: 0 });
    const [playing, setPlaying] = useState(false);
    const fromRef = useRef<Shape[]>(frames[0].shapes);
    const shownRef = useRef<Shape[]>(frames[0].shapes);
    /** Once the reader takes control, it never starts by itself again. */
    const touchedRef = useRef(false);
    const boxRef = useRef<HTMLDivElement>(null);

    const width = spec.width ?? DEFAULT_WIDTH;
    const height = spec.height ?? DEFAULT_HEIGHT;
    const current = frames[Math.min(view.index, frames.length - 1)];
    const settled = view.t >= 1;
    const shown = settled ? current.shapes : tweenShapes(fromRef.current, current.shapes, easeInOut(view.t));
    shownRef.current = shown;
    const atEnd = view.index >= frames.length - 1;

    const go = (index: number) => {
        fromRef.current = shownRef.current;
        setView(v => ({ index: Math.max(0, Math.min(frames.length - 1, index)), t: reduced ? 1 : 0, seq: v.seq + 1 }));
    };

    // The move between two frames.
    useEffect(() => {
        if (view.t >= 1) return;
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / TRANSITION_MS);
            setView(v => ({ ...v, t: progress }));
            if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // Only a new jump (seq) starts a move.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view.seq]);

    // Playing: wait on each frame long enough to read it, then move on.
    useEffect(() => {
        if (!playing || !settled) return;
        if (atEnd) {
            setPlaying(false);
            return;
        }
        const timer = window.setTimeout(() => go(view.index + 1), holdFor(current));
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, settled, view.index, view.seq]);

    // Start the first time it is on screen; pause whenever it leaves.
    useEffect(() => {
        const element = boxRef.current;
        if (!element || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    if (!touchedRef.current && !reduced) {
                        touchedRef.current = true;
                        setPlaying(true);
                    }
                } else if (!entry.isIntersecting) {
                    setPlaying(false);
                }
            },
            { threshold: [0, 0.5] },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [reduced]);

    const takeControl = () => {
        touchedRef.current = true;
    };
    const restart = () => {
        takeControl();
        fromRef.current = frames[0].shapes;
        setView(v => ({ index: 0, t: 1, seq: v.seq + 1 }));
        setPlaying(true);
    };
    const togglePlay = () => {
        takeControl();
        if (atEnd && !playing) restart();
        else setPlaying(p => !p);
    };
    const step = (delta: number) => {
        takeControl();
        setPlaying(false);
        go(view.index + delta);
    };
    const chooseVariant = (next: number | null) => {
        if (next === null || next === variant) return;
        takeControl();
        const nextFrames = spec.variants[next].frames;
        fromRef.current = nextFrames[0].shapes;
        setVariant(next);
        setView(v => ({ index: 0, t: 1, seq: v.seq + 1 }));
        setPlaying(!reduced);
    };

    return (
        <Box
            ref={boxRef}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: `${accent}55`,
                bgcolor: '#0d1117',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1.5, flexWrap: 'wrap' }} useFlexGap>
                <Typography variant="caption" sx={{ color: accent, fontWeight: 800, letterSpacing: 1 }}>
                    ANIMATION
                </Typography>
                <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: px(t.small) }}>{spec.title}</Typography>
            </Stack>

            {spec.variants.length > 1 && (
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={variant}
                    onChange={(_, value: number | null) => chooseVariant(value)}
                    aria-label="Choose a version"
                    sx={{ px: 2, pt: 1.25, flexWrap: 'wrap', gap: 0.75, '& .MuiToggleButtonGroup-grouped': { border: '1px solid rgba(255,255,255,0.15) !important', borderRadius: '999px !important', m: 0 } }}
                >
                    {spec.variants.map((v, index) => (
                        <ToggleButton
                            key={v.label}
                            value={index}
                            sx={{
                                minHeight: 36,
                                px: 1.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: px(t.small),
                                color: 'text.secondary',
                                '&.Mui-selected': { color: '#0b0f14', bgcolor: accent, '&:hover': { bgcolor: accent } },
                            }}
                        >
                            {v.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}

            <Box
                component="svg"
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={spec.title}
                sx={{ display: 'block', width: '100%', maxWidth: 640, height: 'auto', mx: 'auto', my: 1, px: 1, fontFamily: 'inherit' }}
            >
                {shown.map(shape => <ShapeView key={shape.id} shape={shape} />)}
            </Box>

            <Box sx={{ px: 2, pb: 1, minHeight: `${3 * 1.6 * t.body2}px` }}>
                <Typography variant="body2" aria-live="polite" sx={{ color: 'text.primary' }}>
                    <Box component="span" sx={{ color: accent, fontWeight: 800, mr: 1 }}>
                        {view.index + 1}/{frames.length}
                    </Box>
                    {current.caption}
                </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
                <ControlButton label="Back" onClick={() => step(-1)} disabled={view.index === 0}>
                    <NavigateBeforeRoundedIcon />
                </ControlButton>
                <ControlButton label={playing ? 'Pause' : atEnd ? 'Play again' : 'Play'} onClick={togglePlay}>
                    {playing ? <PauseRoundedIcon /> : atEnd ? <ReplayRoundedIcon /> : <PlayArrowRoundedIcon />}
                </ControlButton>
                <ControlButton label="Next" onClick={() => step(1)} disabled={atEnd}>
                    <NavigateNextRoundedIcon />
                </ControlButton>
                {/* One dash per frame: tap one to jump there. */}
                <Stack direction="row" spacing={0.5} sx={{ flex: 1, minWidth: 0, pl: 0.5 }}>
                    {frames.map((_, index) => (
                        <ButtonBase
                            key={index}
                            aria-label={`Go to step ${index + 1}`}
                            onClick={() => {
                                takeControl();
                                setPlaying(false);
                                go(index);
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                height: TAP,
                                display: 'flex',
                                alignItems: 'center',
                                // The global button style adds padding, a background and a focus ring on click.
                                p: 0,
                                border: 'none',
                                borderRadius: 0,
                                bgcolor: 'transparent',
                                '&:focus': { outline: 'none' },
                                '&.Mui-focusVisible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 5,
                                    borderRadius: 3,
                                    bgcolor: index <= view.index ? accent : 'rgba(255,255,255,0.12)',
                                    transition: 'background-color 300ms',
                                }}
                            />
                        </ButtonBase>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};
