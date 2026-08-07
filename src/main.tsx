import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

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
