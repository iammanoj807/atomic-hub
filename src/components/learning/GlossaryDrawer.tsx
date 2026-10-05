import { useMemo, useState } from 'react';
import { Box, Drawer, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { GlossaryTerm } from '../../data/systemDesignGlossary';
import { searchGlossary } from '../../utils/glossary';
import { CYAN, TAP } from './learning';
import { TermEntry } from './GlossaryText';

/** The letter a word is filed under: A–Z, or # for words that start with a number. */
const letterOf = (term: GlossaryTerm) => {
    const first = term.term.charAt(0).toUpperCase();
    return /[A-Z]/.test(first) ? first : '#';
};

const byWord = (a: GlossaryTerm, b: GlossaryTerm) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' });

/**
 * Every word on the page, A–Z, with a search box. Full-screen on a phone,
 * a drawer down the right-hand side on anything wider.
 */
export const GlossaryDrawer = ({
    open,
    onClose,
    onOpenTopic,
}: {
    open: boolean;
    onClose: () => void;
    onOpenTopic: (topicId: string) => void;
}) => {
    const [query, setQuery] = useState('');
    const groups = useMemo(() => {
        const result: { letter: string; terms: GlossaryTerm[] }[] = [];
        for (const term of [...searchGlossary(query)].sort(byWord)) {
            const letter = letterOf(term);
            const last = result[result.length - 1];
            if (last?.letter === letter) last.terms.push(term);
            else result.push({ letter, terms: [term] });
        }
        return result;
    }, [query]);
    const count = groups.reduce((sum, group) => sum + group.terms.length, 0);

    // Close first, so the page can scroll to the topic.
    const learn = (topicId: string) => {
        onClose();
        onOpenTopic(topicId);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    'aria-label': 'Glossary',
                    sx: { width: { xs: '100%', sm: 440 }, bgcolor: 'background.paper', backgroundImage: 'none', display: 'flex', flexDirection: 'column' },
                },
            }}
        >
            <Box sx={{ px: 2, pt: 1.5, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3 }}>
                            Glossary
                        </Typography>
                        <Typography variant="caption" color="text.secondary" aria-live="polite">
                            {query.trim() ? `${count} matching` : `${count} words`}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} aria-label="Close glossary" sx={{ width: TAP, height: TAP }}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
                <TextField
                    type="search"
                    fullWidth
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search words or meanings"
                    sx={{ '& .MuiInputBase-root': { minHeight: TAP } }}
                    slotProps={{
                        htmlInput: { 'aria-label': 'Search the glossary' },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 4 }}>
                {groups.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        No words match "{query.trim()}".
                    </Typography>
                ) : (
                    groups.map(group => (
                        <Box key={group.letter} component="section" aria-label={group.letter}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                    py: 1,
                                    mt: 1,
                                    bgcolor: 'background.paper',
                                    color: CYAN,
                                    fontWeight: 800,
                                    letterSpacing: 1.2,
                                }}
                            >
                                {group.letter}
                            </Typography>
                            <Stack spacing={1.25}>
                                {group.terms.map(term => (
                                    <TermEntry key={term.id} term={term} onLearn={learn} />
                                ))}
                            </Stack>
                        </Box>
                    ))
                )}
            </Box>
        </Drawer>
    );
};
