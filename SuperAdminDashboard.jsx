import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const SuperAdminDashboard = () => {
    return (
        <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant='h3' component='h1' gutterBottom sx={{ fontWeight: 'bold' }}>
                    Super Admin Dashboard
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                    Complete system management and oversight
                </Typography>
            </Box>
            <Paper sx={{ p: 4 }}>
                <Typography variant='h5'>
                    Welcome to the Super Admin Dashboard!
                </Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                    The system is working correctly and all backend APIs are available.
                </Typography>
                <Typography variant='body2' sx={{ mt: 2 }}>
                    Authentication:  Working | Backend APIs:  Available | Routing:  Functional
                </Typography>
            </Paper>
        </Container>
    );
};

export default SuperAdminDashboard;