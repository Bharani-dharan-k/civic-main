import React, { useState, useEffect } from 'react';
import {
    Box,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Button,
    Divider,
    Paper
} from '@mui/material';
import {
    Notifications,
    Assignment,
    Update,
    CheckCircle,
    Warning,
    Info,
    Clear,
    MarkAsUnread
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const NotificationSystem = () => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            loadNotifications();
            // Set up real-time notification polling
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadNotifications = () => {
        // Mock notifications based on user role
        const mockNotifications = generateMockNotifications(user?.role);
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    const generateMockNotifications = (role) => {
        const baseNotifications = [
            {
                id: 1,
                type: 'assignment',
                title: 'New Task Assigned',
                message: 'You have been assigned a new task: Fix pothole on Main Street',
                timestamp: new Date(Date.now() - 5 * 60000),
                read: false,
                priority: 'high',
                actionUrl: '/tasks/123'
            },
            {
                id: 2,
                type: 'update',
                title: 'Status Update',
                message: 'Report #456 has been updated to "In Progress"',
                timestamp: new Date(Date.now() - 30 * 60000),
                read: false,
                priority: 'medium'
            },
            {
                id: 3,
                type: 'completed',
                title: 'Task Completed',
                message: 'Street light repair on Park Road has been marked as completed',
                timestamp: new Date(Date.now() - 2 * 60 * 60000),
                read: true,
                priority: 'low'
            }
        ];

        switch (role) {
            case 'field_staff':
                return [
                    ...baseNotifications,
                    {
                        id: 4,
                        type: 'urgent',
                        title: 'Urgent Assignment',
                        message: 'Emergency: Water pipe burst on Station Road - Immediate attention required',
                        timestamp: new Date(Date.now() - 10 * 60000),
                        read: false,
                        priority: 'urgent'
                    }
                ];
            
            case 'ward_officer':
                return [
                    ...baseNotifications,
                    {
                        id: 4,
                        type: 'info',
                        title: 'New Citizen Report',
                        message: '3 new reports submitted in your ward today',
                        timestamp: new Date(Date.now() - 15 * 60000),
                        read: false,
                        priority: 'medium'
                    },
                    {
                        id: 5,
                        type: 'warning',
                        title: 'Overdue Task',
                        message: 'Task #789 is overdue by 2 days',
                        timestamp: new Date(Date.now() - 45 * 60000),
                        read: false,
                        priority: 'high'
                    }
                ];
            
            case 'department_officer':
                return [
                    ...baseNotifications,
                    {
                        id: 4,
                        type: 'info',
                        title: 'Weekly Report',
                        message: 'Your department resolved 25 issues this week',
                        timestamp: new Date(Date.now() - 60 * 60000),
                        read: true,
                        priority: 'low'
                    }
                ];
            
            case 'super_admin':
                return [
                    ...baseNotifications,
                    {
                        id: 4,
                        type: 'warning',
                        title: 'System Alert',
                        message: 'High volume of reports detected in Ward 3',
                        timestamp: new Date(Date.now() - 20 * 60000),
                        read: false,
                        priority: 'high'
                    },
                    {
                        id: 5,
                        type: 'info',
                        title: 'New User Registration',
                        message: 'New field staff member has been registered',
                        timestamp: new Date(Date.now() - 90 * 60000),
                        read: true,
                        priority: 'low'
                    }
                ];
            
            default:
                return baseNotifications.slice(0, 2);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = (notificationId) => {
        setNotifications(notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'assignment': return <Assignment />;
            case 'update': return <Update />;
            case 'completed': return <CheckCircle />;
            case 'urgent': return <Warning />;
            case 'warning': return <Warning />;
            case 'info': return <Info />;
            default: return <Notifications />;
        }
    };

    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#d32f2f';
            case 'high': return '#f57c00';
            case 'medium': return '#1976d2';
            case 'low': return '#388e3c';
            default: return '#1976d2';
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (!user) return null;

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{ mr: 1 }}
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    <Notifications />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 480 }
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Notifications ({unreadCount})
                        </Typography>
                        <Box>
                            {unreadCount > 0 && (
                                <Button size="small" onClick={markAllAsRead}>
                                    Mark All Read
                                </Button>
                            )}
                            <IconButton size="small" onClick={clearAll}>
                                <Clear />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <List sx={{ py: 0, maxHeight: 300, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="No notifications"
                                secondary="You're all caught up!"
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    ) : (
                        notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        backgroundColor: notification.read ? 'inherit' : 'action.hover',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.selected' }
                                    }}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: getNotificationColor(notification.priority),
                                                width: 36,
                                                height: 36
                                            }}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle2" component="span">
                                                    {notification.title}
                                                </Typography>
                                                {!notification.read && (
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: 'primary.main'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    {notification.message}
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {formatTime(notification.timestamp)}
                                                    </Typography>
                                                    <Chip
                                                        label={notification.priority}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            fontSize: '0.7rem',
                                                            height: 20,
                                                            borderColor: getNotificationColor(notification.priority),
                                                            color: getNotificationColor(notification.priority)
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    )}
                </List>

                {notifications.length > 0 && (
                    <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                        <Button size="small" fullWidth>
                            View All Notifications
                        </Button>
                    </Box>
                )}
            </Menu>
        </>
    );
};

// Hook to trigger notifications from other components
export const useNotifications = () => {
    const showNotification = (message, type = 'info') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            default:
                toast.info(message);
        }
    };

    return { showNotification };
};

export default NotificationSystem;