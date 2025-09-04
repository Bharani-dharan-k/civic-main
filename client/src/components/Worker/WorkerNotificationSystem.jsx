import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Badge,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Alert,
    Fab,
    Drawer,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Notifications,
    Assignment,
    Warning,
    Info,
    CheckCircle,
    Close,
    Settings,
    VolumeUp,
    VolumeOff,
    Schedule,
    LocationOn,
    Emergency,
    Update
} from '@mui/icons-material';

const WorkerNotificationSystem = ({ user, tasks = [] }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationDialog, setNotificationDialog] = useState({ open: false, notification: null });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        enabled: true,
        sound: true,
        newTasks: true,
        taskUpdates: true,
        emergencyAlerts: true,
        reminderTime: 30,
        workingHours: true
    });

    useEffect(() => {
        generateNotifications();
        requestNotificationPermission();
        
        // Simulate real-time notifications
        const interval = setInterval(() => {
            if (Math.random() > 0.9) { // 10% chance every 5 seconds
                addRandomNotification();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [tasks]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    };

    const generateNotifications = () => {
        const newNotifications = [];
        const now = new Date();

        // Task-based notifications
        tasks.forEach(task => {
            if (task.status === 'assigned') {
                newNotifications.push({
                    id: `task-${task.id}`,
                    type: 'new_task',
                    title: 'New Task Assigned',
                    message: `${task.title} has been assigned to you`,
                    priority: task.priority,
                    timestamp: new Date(task.assignedAt),
                    taskId: task.id,
                    location: task.address,
                    read: false,
                    actions: ['view', 'start']
                });
            }

            // Overdue task reminders
            if (task.status === 'assigned' || task.status === 'in_progress') {
                const assignedTime = new Date(task.assignedAt);
                const hoursAgo = (now - assignedTime) / (1000 * 60 * 60);
                
                if (hoursAgo > 4) {
                    newNotifications.push({
                        id: `reminder-${task.id}`,
                        type: 'reminder',
                        title: 'Task Reminder',
                        message: `Don't forget about: ${task.title}`,
                        priority: 'medium',
                        timestamp: now,
                        taskId: task.id,
                        read: false,
                        actions: ['view', 'start']
                    });
                }
            }
        });

        // System notifications
        newNotifications.push({
            id: 'weather-alert',
            type: 'weather',
            title: 'Weather Alert',
            message: 'Rain expected in your area. Consider safety precautions.',
            priority: 'medium',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            read: false,
            actions: ['dismiss']
        });

        newNotifications.push({
            id: 'shift-start',
            type: 'schedule',
            title: 'Shift Starting Soon',
            message: 'Your shift starts in 30 minutes. Don\'t forget to clock in!',
            priority: 'high',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000),
            read: false,
            actions: ['clock_in']
        });

        setNotifications(newNotifications.sort((a, b) => b.timestamp - a.timestamp));
        setUnreadCount(newNotifications.filter(n => !n.read).length);
    };

    const addRandomNotification = () => {
        const randomNotifications = [
            {
                type: 'system',
                title: 'System Update',
                message: 'App updated with new features. Restart recommended.',
                priority: 'low'
            },
            {
                type: 'emergency',
                title: 'Emergency Alert',
                message: 'Emergency situation reported in Ward 3. All available staff respond.',
                priority: 'high'
            },
            {
                type: 'info',
                title: 'Daily Briefing',
                message: 'Daily briefing available. Check for important updates.',
                priority: 'medium'
            }
        ];

        const random = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification = {
            id: `random-${Date.now()}`,
            ...random,
            timestamp: new Date(),
            read: false,
            actions: ['dismiss']
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if enabled
        if (notificationSettings.enabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/logo192.png',
                badge: '/logo192.png'
            });
        }

        // Play sound if enabled
        if (notificationSettings.sound) {
            playNotificationSound();
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(console.error);
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleNotificationAction = (notification, action) => {
        switch (action) {
            case 'view':
                if (notification.taskId) {
                    // Navigate to task details
                    console.log('Navigate to task:', notification.taskId);
                }
                break;
            case 'start':
                if (notification.taskId) {
                    console.log('Start task:', notification.taskId);
                }
                break;
            case 'clock_in':
                console.log('Clock in action');
                break;
            case 'dismiss':
                deleteNotification(notification.id);
                break;
        }
        markAsRead(notification.id);
        setNotificationDialog({ open: false, notification: null });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_task': return <Assignment color="primary" />;
            case 'reminder': return <Schedule color="warning" />;
            case 'emergency': return <Emergency color="error" />;
            case 'weather': return <Warning color="warning" />;
            case 'schedule': return <Schedule color="info" />;
            case 'system': return <Update color="info" />;
            default: return <Info color="info" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getActionButton = (action) => {
        switch (action) {
            case 'view':
                return { label: 'View Task', color: 'primary' };
            case 'start':
                return { label: 'Start Now', color: 'success' };
            case 'clock_in':
                return { label: 'Clock In', color: 'primary' };
            case 'dismiss':
                return { label: 'Dismiss', color: 'default' };
            default:
                return { label: 'OK', color: 'primary' };
        }
    };

    return (
        <Box>
            {/* Notification Bell */}
            <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ position: 'relative' }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            {/* Notifications Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 } }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Notifications ({unreadCount} unread)
                        </Typography>
                        <Box>
                            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                                <Settings />
                            </IconButton>
                            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={markAllAsRead}
                            sx={{ mb: 2 }}
                        >
                            Mark All as Read
                        </Button>
                    )}

                    <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary="No notifications"
                                    secondary="You're all caught up!"
                                />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => (
                                <React.Fragment key={notification.id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: notification.read ? 'transparent' : 'action.hover',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                        onClick={() => setNotificationDialog({ open: true, notification })}
                                    >
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="subtitle2">
                                                        {notification.title}
                                                    </Typography>
                                                    <Chip
                                                        label={notification.priority}
                                                        size="small"
                                                        color={getPriorityColor(notification.priority)}
                                                        sx={{ height: 20 }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {notification.timestamp.toLocaleTimeString()}
                                                    </Typography>
                                                    {notification.location && (
                                                        <Typography variant="caption" display="block" color="textSecondary">
                                                            <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                                                            {notification.location}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Box>
            </Drawer>

            {/* Notification Detail Dialog */}
            <Dialog
                open={notificationDialog.open}
                onClose={() => setNotificationDialog({ open: false, notification: null })}
                maxWidth="sm"
                fullWidth
            >
                {notificationDialog.notification && (
                    <>
                        <DialogTitle>
                            <Box display="flex" alignItems="center" gap={1}>
                                {getNotificationIcon(notificationDialog.notification.type)}
                                <Typography variant="h6">
                                    {notificationDialog.notification.title}
                                </Typography>
                                <Chip
                                    label={notificationDialog.notification.priority}
                                    size="small"
                                    color={getPriorityColor(notificationDialog.notification.priority)}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" paragraph>
                                {notificationDialog.notification.message}
                            </Typography>
                            
                            <Typography variant="caption" color="textSecondary">
                                {notificationDialog.notification.timestamp.toLocaleString()}
                            </Typography>

                            {notificationDialog.notification.location && (
                                <Box display="flex" alignItems="center" mt={1}>
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body2" color="textSecondary" ml={0.5}>
                                        {notificationDialog.notification.location}
                                    </Typography>
                                </Box>
                            )}

                            {notificationDialog.notification.type === 'emergency' && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    This is an emergency notification. Please respond immediately.
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setNotificationDialog({ open: false, notification: null })}
                            >
                                Cancel
                            </Button>
                            {notificationDialog.notification.actions?.map((action, index) => {
                                const actionBtn = getActionButton(action);
                                return (
                                    <Button
                                        key={action}
                                        variant={index === 0 ? "contained" : "outlined"}
                                        color={actionBtn.color}
                                        onClick={() => handleNotificationAction(notificationDialog.notification, action)}
                                    >
                                        {actionBtn.label}
                                    </Button>
                                );
                            })}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default WorkerNotificationSystem;