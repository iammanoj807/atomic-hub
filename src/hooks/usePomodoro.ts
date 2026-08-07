import { useState, useEffect, useRef, useCallback } from 'react';

export interface PomodoroState {
    selectedPreset: number;
    totalSeconds: number;
    secondsLeft: number;
    isRunning: boolean;
    isFinished: boolean;
    /** Wall-clock ms when the timer should hit zero. */
    endTime: number | null;
}

/**
 * The global Pomodoro timer.
 *
 * Extracted from TaskContext, which had grown to hold four unrelated features.
 * Still driven from the one provider, so the timer keeps running while you move
 * between pages.
 *
 * Time remaining is derived from `endTime` rather than counted down, so a
 * throttled background tab doesn't lose seconds.
 */
export const usePomodoro = () => {
    const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
        selectedPreset: 0,
        totalSeconds: 25 * 60,
        secondsLeft: 25 * 60,
        isRunning: false,
        isFinished: false,
        endTime: null,
    });

    const [showNotification, setShowNotification] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playNotification = useCallback(() => {
        try {
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            const playBeep = (time: number, freq: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
                osc.start(time);
                osc.stop(time + duration);
            };

            // Ascending three-beep pattern, repeated 4 times to last 8 seconds
            for (let i = 0; i < 4; i++) {
                const startTime = ctx.currentTime + (i * 2); // repeat every 2 seconds
                playBeep(startTime, 660, 0.3);
                playBeep(startTime + 0.35, 880, 0.3);
                playBeep(startTime + 0.7, 1100, 0.5);
            }
        } catch (e) {
            console.log('Audio notification failed:', e);
        }

        setShowNotification(true);
    }, []);

    const closeNotification = useCallback(() => {
        setShowNotification(false);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(e => console.log('Error closing audio context:', e));
            audioContextRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (pomodoroState.isRunning && pomodoroState.endTime && pomodoroState.secondsLeft > 0) {
            intervalRef.current = setInterval(() => {
                const remaining = Math.round((pomodoroState.endTime! - Date.now()) / 1000);

                if (remaining <= 0) {
                    setPomodoroState(prev => ({
                        ...prev,
                        secondsLeft: 0,
                        isRunning: false,
                        isFinished: true,
                        endTime: null
                    }));
                    playNotification();
                } else {
                    setPomodoroState(prev => ({
                        ...prev,
                        secondsLeft: remaining
                    }));
                }
            }, 500);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [pomodoroState.isRunning, pomodoroState.endTime, pomodoroState.secondsLeft, playNotification]);

    return {
        pomodoroState,
        setPomodoroState,
        playNotification,
        showNotification,
        closeNotification,
    };
};
