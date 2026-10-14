import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { registerSW } from 'virtual:pwa-register';

// Offline shell and home-screen install. A new deploy is picked up the next
// time the app opens or comes back to the foreground, and the page reloads
// onto it. iPhone home-screen apps resume rather than restart, so the
// foreground check is what makes a deploy show up there.
registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
        if (!registration) return;
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                registration.update().catch(() => {
                    // Offline: try again next time.
                });
            }
        });
    },
});

// A page still running the previous deploy asks for chunks that deploy
// removed (Mermaid's, when a diagram opens). Reload once onto the current
// deploy instead of leaving the diagram undrawn. The time check stops a
// reload loop if a chunk is genuinely broken; offline, a reload can't help.
window.addEventListener('vite:preloadError', () => {
    if (!navigator.onLine) return;
    const key = 'chunk-reload-at';
    try {
        if (Date.now() - Number(sessionStorage.getItem(key) ?? 0) < 30_000) return;
        sessionStorage.setItem(key, String(Date.now()));
    } catch {
        return; // No storage, so no loop guard: don't risk reloading.
    }
    window.location.reload();
});

// Create a premium theme
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2979ff', // Bright Blue
        },
        secondary: {
            main: '#00e5ff', // Cyan Accent
        },
        background: {
            default: '#0B0E14', // Deep Blue/Black (Design match)
            paper: '#151921', // Card background (Design match)
        },
        text: {
            primary: '#d7d2ce', // Warm light grey (User requested)
            secondary: '#b0bec5',
        }
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 600,
            fontSize: '2.5rem',
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        body1: {
            fontSize: '1.1rem',
            fontWeight: 400,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)
