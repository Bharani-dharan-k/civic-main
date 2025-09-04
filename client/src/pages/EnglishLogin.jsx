import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function EnglishLogin(){
	const { login } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try{
			await login(form);
			navigate('/');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box minHeight="70vh" display="flex" alignItems="center" justifyContent="center">
			<Paper sx={{ p:3, width: 380 }} component="form" onSubmit={onSubmit}>
				<Typography variant="h5" mb={2}>Login</Typography>
				<Stack gap={2}>
					<TextField label="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
					<TextField type="password" label="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
					<Button type="submit" variant="contained" disabled={loading}>{loading? 'Signing in...' : 'Sign In'}</Button>
				</Stack>
			</Paper>
		</Box>
	);
}
