import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box, Alert, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            // Pass userType as 'admin' to use the correct endpoint
            const result = await login({ ...formData, userType: 'admin' });
            
            if (result.user && result.user.role !== 'super_admin') {
                toast.error('Access denied. Admin credentials required.');
                return;
            }
            
            toast.success(`Welcome Admin ${result.user ? result.user.name : 'User'}!`);
            navigate('/admin-dashboard');
        } catch (error) {
            console.error('Admin login error:', error);
            toast.error('Login failed. Please check your admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillAdminDemo = () => {
        setFormData({ email: 'bharani@gmail.com', password: 'bharani5544' });
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" 
             sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Paper sx={{ p: 4, maxWidth: 450, width: '100%', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        Admin Portal
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Secure administrative access
                    </Typography>
                </Box>
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                    🔒 Admin access only - Authorized personnel
                </Alert>
                
                <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
                    <Chip
                        label="Demo Admin"
                        onClick={fillAdminDemo}
                        color="secondary"
                        variant="outlined"
                        clickable
                        size="medium"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Stack>

                <form onSubmit={onSubmit}>
                    <TextField
                        label="Admin Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={onChange}
                        margin="normal"
                        required
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Admin Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={onChange}
                        margin="normal"
                        required
                        fullWidth
                        sx={{ mb: 3 }}
                    />
                    <Button 
                        type="submit" 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        sx={{ 
                            mt: 2, mb: 2, py: 1.5,
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Admin Login'}
                    </Button>
                </form>
                
                <Box textAlign="center" mt={2}>
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => navigate('/login')}
                        sx={{ color: '#7f8c8d' }}
                    >
                        ← Back to Regular Login
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminLogin;
