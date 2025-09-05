import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function EnglishCitizenPortal(){
	return (
		<Container sx={{ py: 6 }}>
			<Box textAlign="center">
				<Typography variant="h4" gutterBottom>Citizen Portal</Typography>
				<Typography color="text.secondary">Welcome to SevaTrack</Typography>
			</Box>
		</Container>
	);
}
