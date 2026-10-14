// TEMPORARY preview harness — delete before finishing.
import ReactDOM from 'react-dom/client';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import FoundationsPage from '../components/FoundationsPage';
import '../index.css';
const theme = createTheme({
    palette: { mode: 'dark', primary: { main: '#2979ff' }, secondary: { main: '#00e5ff' }, background: { default: '#0B0E14', paper: '#151921' }, text: { primary: '#d7d2ce', secondary: '#b0bec5' } },
    typography: { fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}><CssBaseline /><Box sx={{ pt: 4, pb: 3, px: { xs: '5%', md: '8%' } }}><FoundationsPage /></Box></ThemeProvider>,
);
