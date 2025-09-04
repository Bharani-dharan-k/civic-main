import React from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

export default function NewWardOfficerDashboard(){
	const { user } = useAuth();
	return (
		<Container sx={{ py: 6 }}>
			<Typography variant="h4" gutterBottom>Dashboard</Typography>
			{user && (
				<Alert severity="info" sx={{ mb: 2 }}>Signed in as {user.name} ({user.role})</Alert>
			)}
			<Box>
				<Typography>Welcome to your dashboard.</Typography>
			</Box>
		</Container>
	);
}
