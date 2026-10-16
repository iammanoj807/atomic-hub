import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import ReactPlayer from 'react-player';

const SONG = 'https://youtu.be/5DriU6n_imk';
const PLAYER_CONFIG = { youtube: { start: 0, rel: 0 as const } };

interface BackgroundMusicProps {
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
}

// The music is a hidden YouTube player that the music buttons start and stop.
// Phones only let YouTube start sound from a tap on the player itself, so on
// a touch screen a small player appears to be tapped once. After that the
// music buttons pause and resume it like on a computer.
export default function BackgroundMusic({ isMuted, setIsMuted }: BackgroundMusicProps) {
    const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)', { noSsr: true });
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [cardDue, setCardDue] = useState(false);

    // Before that first tap a phone refuses the start, so don't ask.
    const canStart = !isTouch || hasStarted;
    const needsTap = isTouch && !isMuted && !isPlaying;

    // A resume takes a moment to get going; only ask for a tap if it doesn't.
    useEffect(() => {
        if (!needsTap) return;
        const timer = setTimeout(() => setCardDue(true), hasStarted ? 1500 : 0);
        return () => {
            clearTimeout(timer);
            setCardDue(false);
        };
    }, [needsTap, hasStarted]);
    const showCard = needsTap && cardDue;

    const handlePlay = useCallback(() => setHasStarted(true), []);
    const handlePlaying = useCallback(() => setIsPlaying(true), []);
    const handlePause = useCallback(() => setIsPlaying(false), []);

    // One player throughout, only restyled: rendering it anywhere else would
    // reload it and lose the tap.
    return (
        <Box
            sx={showCard ? {
                position: 'fixed',
                right: 16,
                bottom: 'calc(16px + env(safe-area-inset-bottom))',
                width: 260,
                p: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: (theme) => theme.zIndex.snackbar,
            } : {
                position: 'fixed', bottom: 0, left: 0, width: '1px', height: '1px',
                opacity: 0, pointerEvents: 'none', zIndex: -1,
            }}
        >
            {showCard && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MusicNoteRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography sx={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                        Tap ▶ to start the music
                    </Typography>
                    <IconButton size="small" aria-label="Turn music off" onClick={() => setIsMuted(true)}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
            {/* `playing` pauses and resumes in place. Toggling `autoPlay`
                instead rebuilt the YouTube player, so the song restarted. */}
            <ReactPlayer
                src={SONG}
                playing={!isMuted && canStart}
                loop
                playsInline
                controls
                volume={1}
                width={showCard ? '100%' : '1px'}
                height={showCard ? '133px' : '1px'}
                style={showCard ? { minWidth: 0, minHeight: 0, borderRadius: 8, overflow: 'hidden' } : undefined}
                config={PLAYER_CONFIG}
                onPlay={handlePlay}
                onPlaying={handlePlaying}
                onPause={handlePause}
            />
        </Box>
    );
}
