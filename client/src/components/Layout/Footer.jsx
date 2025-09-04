import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: '#138808' }}>
            <Typography variant="body2" sx={{ color: '#000080' }} align="center">
                {'Copyright © '}
                <Link sx={{ color: '#000080' }} href="#">
                    CivicConnect
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#000080' }} align="center">
                A Smart India Hackathon Project
            </Typography>
        </Box>
    );
};

export default Footer;
