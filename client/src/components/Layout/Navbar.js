import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Chip } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AccountCircle, Dashboard, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationSystem from '../Common/NotificationSystem';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        handleClose();
    };

    const getDashboardPath = () => {
        switch (user?.role) {
            case 'ward_officer': return '/ward-dashboard';
            case 'department_officer': return '/department-dashboard';
            case 'field_staff': return '/field-dashboard';
            case 'super_admin': return '/admin-dashboard';
            default: return '/';
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'ward_officer': return 'Ward Officer';
            case 'department_officer': return 'Department Officer';
            case 'field_staff': return 'Field Staff';
            case 'super_admin': return 'Super Admin';
            default: return 'User';
        }
    };

    const publicNavItems = [
        { name: 'Citizen Portal', path: '/' },
        { name: 'Login', path: '/login' },
    ];

        return (
            <AppBar position="static" elevation={1} sx={{ backgroundColor: '#FF9933', color: '#000080' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    🏛️ SevaTrack
                </Typography>
                
                {!user ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {publicNavItems.map((item) => (
                            <Button
                                key={item.name}
                                component={RouterLink}
                                to={item.path}
                                color="inherit"
                                sx={{
                                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                    textDecoration: location.pathname === item.path ? 'underline' : 'none'
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                            label={getRoleDisplayName(user.role)}
                            color="secondary"
                            variant="outlined"
                            size="small"
                        />
                        <Button
                            component={RouterLink}
                            to={getDashboardPath()}
                            color="inherit"
                            startIcon={<Dashboard />}
                        >
                            Dashboard
                        </Button>
                        <NotificationSystem />
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>
                                <Box>
                                    <Typography variant="subtitle2">{user.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {user.ward || user.department || 'System Admin'}
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ExitToApp sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;