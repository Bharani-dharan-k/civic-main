import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, color = 'text.primary', icon, compact = false }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                p: compact ? 1.5 : 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: compact ? 'auto' : 120
            }}
        >
            {icon && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Box sx={{ color: color, fontSize: compact ? 24 : 32 }}>
                        {icon}
                    </Box>
                </Box>
            )}
            <Typography 
                variant={compact ? "caption" : "h6"} 
                color="text.secondary" 
                gutterBottom={!compact}
                sx={{ fontSize: compact ? '0.75rem' : undefined }}
            >
                {title}
            </Typography>
            <Typography 
                variant={compact ? "h6" : "h4"} 
                component="p" 
                sx={{ 
                    color: color, 
                    fontWeight: 'bold',
                    fontSize: compact ? '1.25rem' : undefined 
                }}
            >
                {value ?? '0'}
            </Typography>
        </Paper>
    );
};

export default StatCard;