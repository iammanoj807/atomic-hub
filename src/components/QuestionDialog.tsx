import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';

export interface QuestionDialogValues {
    title: string;
    answer: string;
    memoryPoints: string;
    tag: string | null;
}

interface QuestionDialogProps {
    open: boolean;
    heading: string;
    submitLabel: string;
    values: QuestionDialogValues;
    onChange: (values: QuestionDialogValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    /** Question-type toggles only appear for company questions. */
    showTagPicker: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    titleError?: boolean;
    answerError?: boolean;
    /** Add dialog submits on Enter in the title; edit dialog doesn't. */
    submitOnTitleEnter?: boolean;
}

/**
 * The add and edit question dialogs, which were the same 60 lines of form
 * twice over in CategoryPage. One component, two sets of props.
 */
const QuestionDialog = ({
    open,
    heading,
    submitLabel,
    values,
    onChange,
    onClose,
    onSubmit,
    showTagPicker,
    isExpanded,
    onToggleExpanded,
    titleError = false,
    answerError = false,
    submitOnTitleEnter = false,
}: QuestionDialogProps) => {
    const set = <K extends keyof QuestionDialogValues>(key: K, value: QuestionDialogValues[K]) =>
        onChange({ ...values, [key]: value });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={isExpanded ? 'md' : 'sm'}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {heading}
                <IconButton
                    aria-label={isExpanded ? 'Shrink the dialog' : 'Expand the dialog'}
                    onClick={onToggleExpanded}
                    size="small"
                    sx={{ ml: 2 }}
                >
                    {isExpanded ? <CloseFullscreenRoundedIcon fontSize="small" /> : <OpenInFullRoundedIcon fontSize="small" />}
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Question"
                    fullWidth
                    variant="outlined"
                    value={values.title}
                    onChange={(e) => set('title', e.target.value)}
                    error={titleError}
                    helperText={titleError ? 'Question is required' : ''}
                    sx={{ mb: 2 }}
                    onKeyDown={(e) => {
                        if (submitOnTitleEnter && e.key === 'Enter') onSubmit();
                    }}
                />
                <TextField
                    margin="dense"
                    label="Your Answer / Notes"
                    fullWidth
                    multiline
                    minRows={isExpanded ? 15 : 4}
                    maxRows={isExpanded ? 15 : 4}
                    variant="outlined"
                    value={values.answer}
                    onChange={(e) => set('answer', e.target.value)}
                    error={answerError}
                    helperText={answerError ? 'Answer is required' : ''}
                />
                <TextField
                    margin="dense"
                    label="Memory points (one per line)"
                    placeholder={"Profiled first — didn't guess\nTwo causes: joins + no indexes\n40% faster, 8s to under 2s"}
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    variant="outlined"
                    value={values.memoryPoints}
                    onChange={(e) => set('memoryPoints', e.target.value)}
                    helperText="4-6 short bullets. These are what you'll see first."
                    sx={{ mt: 2 }}
                />
                {showTagPicker && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Question Type (optional)
                        </Typography>
                        <ToggleButtonGroup
                            value={values.tag}
                            exclusive
                            onChange={(_, val) => set('tag', val)}
                            size="small"
                            sx={{ flexWrap: 'wrap', gap: 0.5 }}
                        >
                            {['Technical', 'Behavioral'].map(tag => (
                                <ToggleButton
                                    key={tag}
                                    value={tag}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '8px !important',
                                        border: '1px solid rgba(255,255,255,0.12) !important',
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(41, 121, 255, 0.18)',
                                            color: '#64b5f6',
                                            '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.25)' },
                                        },
                                    }}
                                >
                                    {tag}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit} variant="contained">{submitLabel}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionDialog;
