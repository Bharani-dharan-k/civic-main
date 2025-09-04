import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box, Alert, Chip, Stack, Tabs, Tab } from '@mui/material';
import { AdminPanelSettings, Build, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('admin');

    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login({ ...formData, userType });
            toast.success(`Welcome ${result.user.name}!`);
            
            // Navigate based on user type
            if (userType === 'worker') {
                navigate('/worker-dashboard');
            } else {
                // Navigate based on user role for admin users
                switch (result.user.role) {
                    case 'ward_officer':
                        navigate('/ward-dashboard');
                        break;
                    case 'department_officer':
                        navigate('/department-dashboard');
                        break;
                    case 'field_staff':
                        navigate('/field-dashboard');
                        break;
                    case 'super_admin':
                        navigate('/admin-dashboard');
                        break;
                    default:
                        navigate('/admin/dashboard');
                }
            }
        } catch (error) {
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const getPlaceholderCredentials = () => {
        switch (userType) {
            case 'admin':
                return { email: 'admin@sevatrack.com', password: '123456' };
            case 'worker':
                return { email: 'worker@sevatrack.com', password: '123456' };
            case 'citizen':
                return { email: 'citizen@example.com', password: 'password' };
            default:
                return { email: '', password: '' };
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" >
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        CivicConnect
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Sign in to manage civic reports
                    </Typography>
                </Box>

                {/* User Type Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                        value={userType} 
                        onChange={(e, newValue) => setUserType(newValue)}
                        centered
                        variant="fullWidth"
                    >
                        <Tab 
                            icon={<AdminPanelSettings />} 
                            label="Admin" 
                            value="admin"
                            sx={{ textTransform: 'none' }}
                        />
                        <Tab 
                            icon={<Build />} 
                            label="Worker" 
                            value="worker"
                            sx={{ textTransform: 'none' }}
                        />
                        <Tab 
                            icon={<Person />} 
                            label="Citizen" 
                            value="citizen"
                            sx={{ textTransform: 'none' }}
                        />
                    </Tabs>
                </Box>

                {/* Sample Credentials Info */}
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Sample Credentials for {userType.charAt(0).toUpperCase() + userType.slice(1)}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        Email: {getPlaceholderCredentials().email}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        Password: {getPlaceholderCredentials().password}
                    </Typography>
                </Box>

                <form onSubmit={onSubmit}>
                    <TextField
                        label="Email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        fullWidth
                        size="small"
                        margin="normal"
                        placeholder={getPlaceholderCredentials().email}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        fullWidth
                        size="small"
                        margin="normal"
                        placeholder={getPlaceholderCredentials().password}
                    />
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? 'Signing in...' : `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
