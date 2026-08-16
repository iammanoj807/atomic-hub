import { Box, Typography, Stack, Chip, Link } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
    RESOURCE_KIND_LABELS,
    RESOURCE_KIND_COLORS,
    type WeekResource,
} from '../../data/studyResources';

/**
 * A week's material: exactly what to watch, read, build and ship.
 *
 * The title and source are shown as the headline rather than the link, because
 * a title stays findable long after a URL has moved.
 */
const ResourceList = ({ resources }: { resources: WeekResource[] }) => (
    <Stack spacing={1.5}>
        {resources.map((resource, index) => {
            const color = RESOURCE_KIND_COLORS[resource.kind];

            return (
                <Box
                    key={`${resource.kind}-${index}`}
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderLeft: '4px solid',
                        borderLeftColor: color,
                    }}
                >
                    <Chip
                        label={RESOURCE_KIND_LABELS[resource.kind]}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color,
                            bgcolor: `${color}1f`,
                            mb: 1,
                        }}
                    />

                    {resource.url ? (
                        <Link
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                color: 'text.primary',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                lineHeight: 1.4,
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            {resource.title}
                            <OpenInNewRoundedIcon sx={{ fontSize: 15, opacity: 0.6 }} />
                        </Link>
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}
                        >
                            {resource.title}
                        </Typography>
                    )}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem', mt: 0.25 }}
                    >
                        {resource.source}
                    </Typography>

                    {resource.detail && (
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.primary', lineHeight: 1.6, mt: 1, opacity: 0.92 }}
                        >
                            {resource.detail}
                        </Typography>
                    )}
                </Box>
            );
        })}
    </Stack>
);

export default ResourceList;
