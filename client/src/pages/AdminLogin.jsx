import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box, Alert, Chip, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        role: 'super_admin' 
    });
    const [loading, setLoading] = useState(false);

    const { email, password, role } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            // Pass userType as 'admin' and role for validation
            const result = await login(email, password, 'admin', role);
            
            if (result.success) {
                const userRole = result.user?.role || role;
                toast.success(`Welcome ${userRole.replace('_', ' ')}!`);
                
                // Redirect based on actual user role from backend
                if (userRole === 'super_admin') {
                    console.log('🚀 Redirecting to super admin dashboard');
                    navigate('/super-admin');
                } else if (userRole === 'district_admin') {
                    console.log('🚀 Redirecting to district admin dashboard');
                    navigate('/district-admin');
                } else {
                    console.log('🚀 Redirecting to regular admin dashboard');
                    navigate('/admin/dashboard');
                }
            } else {
                toast.error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            toast.error('Login failed. Please check your admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillAdminDemo = (roleType = 'super_admin') => {
        const demoCredentials = {
            super_admin: {
                email: 'bharani@gmail.com',
                password: 'password',
                role: 'super_admin'
            },
            district_admin: {
                email: 'district1@admin.com',
                password: 'district123',
                role: 'district_admin'
            },
            municipality_admin: {
                email: 'municipality1@admin.com',
                password: 'municipality123',
                role: 'municipality_admin'
            },
            department_head: {
                email: 'department1@admin.com',
                password: 'department123',
                role: 'department_head'
            }
        };
        setFormData(demoCredentials[roleType]);
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
                
                <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip
                        label="Super Admin Demo"
                        onClick={() => fillAdminDemo('super_admin')}
                        color="error"
                        variant="outlined"
                        clickable
                        size="small"
                    />
                    <Chip
                        label="District Admin Demo"
                        onClick={() => fillAdminDemo('district_admin')}
                        color="success"
                        variant="outlined"
                        clickable
                        size="small"
                    />
                    <Chip
                        label="Municipality Demo"
                        onClick={() => fillAdminDemo('municipality_admin')}
                        color="secondary"
                        variant="outlined"
                        clickable
                        size="small"
                    />
                    <Chip
                        label="Department Head Demo"
                        onClick={() => fillAdminDemo('department_head')}
                        color="warning"
                        variant="outlined"
                        clickable
                        size="small"
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
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                        <InputLabel id="role-select-label">Admin Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            name="role"
                            value={role}
                            label="Admin Role"
                            onChange={onChange}
                        >
                            <MenuItem value="super_admin">Super Admin</MenuItem>
                            <MenuItem value="district_admin">District Admin</MenuItem>
                            <MenuItem value="municipality_admin">Municipality Admin</MenuItem>
                            <MenuItem value="department_head">Department Head</MenuItem>
                        </Select>
                    </FormControl>
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
