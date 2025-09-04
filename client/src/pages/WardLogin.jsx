import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box, Alert, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const WardLogin = () => {
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
            const result = await login(formData);
            
            if (!['ward_officer', 'department_officer', 'field_staff'].includes(result.user.role)) {
                toast.error('Access denied. Ward staff credentials required.');
                return;
            }
            
            toast.success(`Welcome ${result.user.name}!`);
            
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
                default:
                    navigate('/');
            }
        } catch (error) {
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const wardCredentials = [
        { role: 'Ward Officer', email: 'ward@civic.com', password: 'password' },
        { role: 'Department Officer', email: 'dept@civic.com', password: 'password' },
        { role: 'Field Staff', email: 'field@civic.com', password: 'password' }
    ];

    const fillDemo = (demoEmail) => {
        setFormData({ email: demoEmail, password: 'password' });
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" 
             sx={{ background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' }}>
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        Ward Staff Login
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Municipal staff access portal
                    </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    🏛️ Ward staff & department officers - Click role to auto-fill
                </Alert>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {wardCredentials.map((demo, index) => (
                        <Chip
                            key={index}
                            label={demo.role}
                            onClick={() => fillDemo(demo.email)}
                            color="primary"
                            variant="outlined"
                            clickable
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                        />
                    ))}
                </Stack>

                <form onSubmit={onSubmit}>
                    <TextField
                        label="Staff Email Address"
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
                        label="Password"
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
                            background: 'linear-gradient(45deg, #74b9ff 30%, #0984e3 90%)',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Staff Login'}
                    </Button>
                </form>
                
                <Box textAlign="center" mt={2}>
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => navigate('/login')}
                        sx={{ color: '#7f8c8d', mr: 2 }}
                    >
                        ← Citizen Login
                    </Button>
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => navigate('/admin-login')}
                        sx={{ color: '#7f8c8d' }}
                    >
                        Admin Portal →
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default WardLogin;