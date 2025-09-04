import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fab,
    Badge,
    Paper,
    Divider,
    Stack,
    Alert,
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction,
    Switch,
    FormControlLabel,
    LinearProgress,
    Snackbar,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    PlayArrow,
    PhotoCamera,
    LocationOn,
    Schedule,
    Phone,
    Navigation,
    Add as AddIcon,
    Refresh,
    Timeline,
    TaskAlt,
    QrCodeScanner,
    Mic,
    CloudOff,
    CloudDone,
    AccessTime,
    Stop,
    MyLocation,
    Notifications,
    NotificationsOff,
    CameraAlt,
    Videocam,
    Map,
    CalendarToday,
    Timer
} from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
import StatCard from '../components/Admin/StatCard';
import WorkerNotificationSystem from '../components/Worker/WorkerNotificationSystem';
import SmartTaskRouter from '../components/Worker/SmartTaskRouter';

const FieldStaffDashboard = () => {
    // const { user } = useAuth();
    // Mock user for now - in production, get from localStorage or auth context
    const user = JSON.parse(localStorage.getItem('workerUser')) || {
        name: 'Field Worker',
        employeeId: 'FIELD001',
        role: 'worker',
        specialization: 'General Maintenance'
    };
    const [tasks, setTasks] = useState([]);
    const [updateDialog, setUpdateDialog] = useState({ open: false, task: null });
    const [updateStatus, setUpdateStatus] = useState('');
    const [photoUpload, setPhotoUpload] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // New state variables for enhanced features
    const [location, setLocation] = useState(null);
    const [gpsEnabled, setGpsEnabled] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceNote, setVoiceNote] = useState(null);
    const [clockedIn, setClockedIn] = useState(false);
    const [workStartTime, setWorkStartTime] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [qrScanning, setQrScanning] = useState(false);
    const [workingHours, setWorkingHours] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        loadTasks();
        initializeLocation();
        checkOnlineStatus();
        loadWorkStatus();
        
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(loadTasks, 30000);
        
        // Update working hours every minute if clocked in
        const timeInterval = setInterval(() => {
            if (clockedIn && workStartTime) {
                const hours = (Date.now() - workStartTime) / (1000 * 60 * 60);
                setWorkingHours(parseFloat(hours.toFixed(2)));
            }
        }, 60000);
        
        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
        };
    }, [clockedIn, workStartTime]);
    
    // Initialize GPS location
    const initializeLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGpsEnabled(true);
                    showSnackbar('GPS location enabled', 'success');
                },
                (error) => {
                    console.error('GPS error:', error);
                    showSnackbar('GPS access denied', 'warning');
                }
            );
        }
    };
    
    // Check online/offline status
    const checkOnlineStatus = () => {
        const updateOnlineStatus = () => {
            setOfflineMode(!navigator.onLine);
            if (!navigator.onLine) {
                showSnackbar('Working in offline mode', 'info');
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    };
    
    // Load work status from local storage
    const loadWorkStatus = () => {
        const savedStatus = localStorage.getItem('workStatus');
        if (savedStatus) {
            const status = JSON.parse(savedStatus);
            setClockedIn(status.clockedIn);
            setWorkStartTime(status.workStartTime);
        }
    };

    const loadTasks = async () => {
        setRefreshing(true);
        try {
            const employeeId = user?.employeeId || 'FIELD001';
            console.log('Loading tasks for employee:', employeeId);
            
            const response = await fetch(`http://localhost:5000/api/reports/worker/${employeeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Tasks loaded successfully:', data.reports.length);
                setTasks(data.reports);
                showSnackbar(`Loaded ${data.reports.length} tasks`, 'success');
            } else {
                console.error('Failed to load tasks:', data.message);
                // Fallback to mock data if API fails
                setTasks([]);
                showSnackbar('No tasks assigned yet', 'info');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            // Show error message but keep existing tasks
            showSnackbar('Failed to load latest tasks', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    const handleStartTask = async (task) => {
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${task.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'in_progress',
                    notes: `Task started by ${user?.name || 'Field Worker'}`,
                    location: location
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSnackbar('Task started successfully', 'success');
                loadTasks(); // Refresh tasks from server
            } else {
                showSnackbar('Failed to start task', 'error');
            }
        } catch (error) {
            console.error('Error starting task:', error);
            showSnackbar('Network error - task not started', 'error');
        }
    };

    const handleUpdateTask = (task) => {
        setUpdateDialog({ open: true, task });
    };

    const confirmUpdate = async (taskId, updates) => {
        try {
            // Validate status
            if (!updates.status || !['assigned', 'in_progress', 'resolved', 'rejected'].includes(updates.status)) {
                showSnackbar('Invalid status value. Please select a valid status.', 'error');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/reports/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if required
                },
                body: JSON.stringify({
                    status: updates.status,
                    notes: updates.notes || `Task updated by ${user?.name || 'Field Worker'}`,
                    location: location,
                    workerNotes: [{
                        note: updates.notes || `Task marked as ${updates.status} by ${user?.name || 'Field Worker'}`,
                        addedBy: user?.employeeId,
                        location: location
                    }],
                    ...(photoUpload?.preview ? {
                        workProgressPhotos: [{
                            url: photoUpload.preview,
                            uploadedBy: user?.employeeId,
                            type: updates.status === 'resolved' ? 'completion' : 'progress'
                        }]
                    } : {})
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showSnackbar(`Task ${updates.status} successfully`, 'success');
                loadTasks(); // Refresh tasks from server
                setUpdateDialog({ open: false, task: null });
                setPhotoUpload(null);
                setVoiceNote(null);
            } else {
                const errorMsg = data.message || 'Failed to update task';
                console.error('Server error:', data);
                showSnackbar(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showSnackbar(error.message || 'Network error - task not updated', 'error');
        }
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Add GPS coordinates to photo metadata if available
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoUpload({
                    file,
                    preview: e.target.result,
                    location: location,
                    timestamp: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Enhanced media capture with GPS tagging
    const captureMedia = async (type = 'photo') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === 'photo' || type === 'video',
                audio: type === 'video' || type === 'voice'
            });
            
            // In real implementation, handle camera/video capture
            showSnackbar(`${type} capture initiated`, 'info');
        } catch (error) {
            showSnackbar('Media access denied', 'error');
        }
    };
    
    // Voice note recording
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setVoiceNote({
                    blob: audioBlob,
                    url: URL.createObjectURL(audioBlob),
                    timestamp: new Date().toISOString(),
                    location: location
                });
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            showSnackbar('Voice recording started', 'info');
        } catch (error) {
            showSnackbar('Microphone access denied', 'error');
        }
    };
    
    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            showSnackbar('Voice recording completed', 'success');
        }
    };
    
    // Clock in/out functionality
    const handleClockInOut = () => {
        if (!clockedIn) {
            const startTime = Date.now();
            setClockedIn(true);
            setWorkStartTime(startTime);
            localStorage.setItem('workStatus', JSON.stringify({
                clockedIn: true,
                workStartTime: startTime
            }));
            showSnackbar('Clocked in successfully', 'success');
        } else {
            setClockedIn(false);
            setWorkStartTime(null);
            localStorage.setItem('workStatus', JSON.stringify({
                clockedIn: false,
                workStartTime: null
            }));
            showSnackbar(`Clocked out. Total hours: ${workingHours}`, 'success');
            setWorkingHours(0);
        }
    };
    
    // QR Code scanning simulation
    const handleQRScan = () => {
        setQrScanning(true);
        // Simulate QR scan
        setTimeout(() => {
            setQrScanning(false);
            showSnackbar('QR Code scanned successfully', 'success');
        }, 2000);
    };
    
    // Show snackbar notifications
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const getNavigationUrl = (location) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'assigned': return 'info';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'assigned': return <Assignment />;
            case 'in_progress': return <Schedule />;
            case 'resolved': return <CheckCircle />;
            case 'rejected': return <Stop />;
            default: return <Assignment />;
        }
    };

    const assignedTasks = tasks.filter(t => t.status === 'assigned');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'resolved');

    return (
        <Box sx={{ p: 2, pb: 10 }}> {/* Extra padding for mobile FAB */}
            {/* Header with Status Indicators */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5" component="h1">
                        Field Dashboard
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip 
                            icon={gpsEnabled ? <MyLocation /> : <LocationOn />} 
                            label={gpsEnabled ? "GPS Active" : "GPS Disabled"} 
                            size="small" 
                            color={gpsEnabled ? "success" : "default"}
                        />
                        <Chip 
                            icon={offlineMode ? <CloudOff /> : <CloudDone />} 
                            label={offlineMode ? "Offline" : "Online"} 
                            size="small" 
                            color={offlineMode ? "warning" : "success"}
                        />
                        <Chip 
                            icon={clockedIn ? <Timer /> : <AccessTime />} 
                            label={clockedIn ? `${workingHours}h` : "Not Clocked In"} 
                            size="small" 
                            color={clockedIn ? "primary" : "default"}
                        />
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton 
                        onClick={loadTasks} 
                        disabled={refreshing}
                        color="primary"
                    >
                        <Refresh />
                    </IconButton>
                    <WorkerNotificationSystem user={user} tasks={tasks} />
                </Box>
            </Box>

            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Welcome back, {user?.name}
            </Typography>

            {/* Quick Actions Card */}
            <Card sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                color={clockedIn ? "error" : "success"}
                                startIcon={clockedIn ? <Stop /> : <PlayArrow />}
                                onClick={handleClockInOut}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                            >
                                {clockedIn ? 'Clock Out' : 'Clock In'}
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<QrCodeScanner />}
                                onClick={handleQRScan}
                                disabled={qrScanning}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                            >
                                {qrScanning ? 'Scanning...' : 'Scan QR'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                    <StatCard
                        title="Assigned"
                        value={assignedTasks.length}
                        icon={<Assignment />}
                        color="#2196f3"
                        compact
                    />
                </Grid>
                <Grid item xs={3}>
                    <StatCard
                        title="In Progress"
                        value={inProgressTasks.length}
                        icon={<Schedule />}
                        color="#ff9800"
                        compact
                    />
                </Grid>
                <Grid item xs={3}>
                    <StatCard
                        title="Resolved"
                        value={completedTasks.length}
                        icon={<CheckCircle />}
                        color="#4caf50"
                        compact
                    />
                </Grid>
                <Grid item xs={3}>
                    <StatCard
                        title="Hours"
                        value={workingHours}
                        icon={<Timer />}
                        color="#9c27b0"
                        compact
                    />
                </Grid>
            </Grid>

            {/* New Assignments Alert */}
            {assignedTasks.length > 0 && (
                <Alert 
                    severity="info" 
                    sx={{ mb: 2 }}
                    action={
                        <Button 
                            color="inherit" 
                            size="small"
                            onClick={() => document.getElementById('assigned-tasks').scrollIntoView()}
                        >
                            VIEW
                        </Button>
                    }
                >
                    You have {assignedTasks.length} new task{assignedTasks.length > 1 ? 's' : ''} assigned
                </Alert>
            )}

            {/* Smart Task Router */}
            <SmartTaskRouter 
                tasks={tasks} 
                currentLocation={location} 
                user={user}
            />

            {/* Task Sections */}
            
            {/* Assigned Tasks */}
            {assignedTasks.length > 0 && (
                <Card sx={{ mb: 2 }} id="assigned-tasks">
                    <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                            New Assignments ({assignedTasks.length})
                        </Typography>
                        <List dense>
                            {assignedTasks.map((task, index) => (
                                <React.Fragment key={task.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: getPriorityColor(task.priority).main || '#2196f3' }}>
                                                {getStatusIcon(task.status)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                    <Typography variant="subtitle1" component="div">
                                                        {task.title}
                                                    </Typography>
                                                    <Chip 
                                                        label={task.priority} 
                                                        color={getPriorityColor(task.priority)}
                                                        size="small"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                                        {task.address}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Est. Time: {task.estimatedTime}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {task.description}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Stack spacing={1}>
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => window.open(getNavigationUrl(task.location))}
                                                >
                                                    <Navigation />
                                                </IconButton>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<PlayArrow />}
                                                    onClick={() => handleStartTask(task)}
                                                >
                                                    Start
                                                </Button>
                                            </Stack>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < assignedTasks.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6" color="warning.main" gutterBottom>
                            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                            In Progress ({inProgressTasks.length})
                        </Typography>
                        <List dense>
                            {inProgressTasks.map((task, index) => (
                                <React.Fragment key={task.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                                <Schedule />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={
                                                <span>
                                                    <Typography component="span" variant="body2" color="textSecondary" display="block">
                                                        <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                                        {task.address}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="warning.main" display="block">
                                                        Started: {new Date(task.startedAt).toLocaleTimeString()}
                                                    </Typography>
                                                </span>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Stack spacing={1}>
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => window.open(getNavigationUrl(task.location))}
                                                >
                                                    <Navigation />
                                                </IconButton>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<TaskAlt />}
                                                    onClick={() => handleUpdateTask(task)}
                                                >
                                                    Update
                                                </Button>
                                            </Stack>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < inProgressTasks.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* Completed Tasks (Today) */}
            {completedTasks.length > 0 && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Completed Today ({completedTasks.length})
                        </Typography>
                        <List dense>
                            {completedTasks.map((task, index) => (
                                <React.Fragment key={task.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                                <CheckCircle />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                                        {task.address}
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main">
                                                        Completed: {new Date(task.completedAt).toLocaleTimeString()}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Time taken: {task.actualTime}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < completedTasks.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {tasks.length === 0 && !refreshing && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No tasks assigned yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Check back later for new assignments
                    </Typography>
                </Paper>
            )}

            {/* Update Task Dialog */}
            <Dialog 
                open={updateDialog.open} 
                onClose={() => setUpdateDialog({ open: false, task: null })}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    {updateDialog.task && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {updateDialog.task.title}
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Status</InputLabel>
                                <Select 
                                    defaultValue={updateDialog.task.status}
                                    label="Status"
                                >
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Progress Notes"
                                placeholder="Describe what you've done or any issues encountered..."
                                sx={{ mb: 2 }}
                            />

                            {/* Enhanced Media Upload */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Evidence & Documentation
                                </Typography>
                                
                                {/* Media Capture Buttons */}
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={4}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<CameraAlt />}
                                            onClick={() => captureMedia('photo')}
                                        >
                                            Photo
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<Videocam />}
                                            onClick={() => captureMedia('video')}
                                        >
                                            Video
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<Mic />}
                                            color={isRecording ? "error" : "primary"}
                                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                        >
                                            {isRecording ? 'Stop' : 'Voice'}
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* File Upload */}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<PhotoCamera />}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    Choose File
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        hidden
                                        onChange={handlePhotoUpload}
                                    />
                                </Button>

                                {/* Photo Preview */}
                                {photoUpload && (
                                    <Box sx={{ mt: 1 }}>
                                        <img 
                                            src={photoUpload.preview} 
                                            alt="Evidence"
                                            style={{ 
                                                width: '100%', 
                                                maxHeight: '200px', 
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            {photoUpload.location && `GPS: ${photoUpload.location.lat.toFixed(6)}, ${photoUpload.location.lng.toFixed(6)}`}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Voice Note Preview */}
                                {voiceNote && (
                                    <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        <Typography variant="caption" gutterBottom>Voice Note</Typography>
                                        <audio controls src={voiceNote.url} style={{ width: '100%' }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Update Status</InputLabel>
                        <Select
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            label="Update Status"
                        >
                            <MenuItem value="in_progress">Mark In Progress</MenuItem>
                            <MenuItem value="resolved">Mark as Resolved (Completed)</MenuItem>
                            <MenuItem value="rejected">Cannot Complete (Reject)</MenuItem>
                        </Select>
                    </FormControl>
                    <Button onClick={() => setUpdateDialog({ open: false, task: null })}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        color={updateStatus === 'resolved' ? 'success' : 'primary'}
                        onClick={() => confirmUpdate(updateDialog.task.id, {
                            status: updateStatus || 'resolved',
                            completedAt: new Date().toISOString(),
                            notes: 'Updated by field staff'
                        })}
                    >
                        Update Task
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Speed Dial for Quick Actions */}
            <SpeedDial
                ariaLabel="Quick Actions"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                direction="up"
            >
                <SpeedDialAction
                    icon={<Phone />}
                    tooltipTitle="Emergency Call"
                    onClick={() => window.open('tel:+919876543210')}
                />
                <SpeedDialAction
                    icon={<Map />}
                    tooltipTitle="View Map"
                    onClick={() => window.open(`https://www.google.com/maps/@${location?.lat},${location?.lng},15z`)}
                />
                <SpeedDialAction
                    icon={<CameraAlt />}
                    tooltipTitle="Quick Photo"
                    onClick={() => captureMedia('photo')}
                />
                <SpeedDialAction
                    icon={<Mic />}
                    tooltipTitle="Voice Note"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                />
                <SpeedDialAction
                    icon={<QrCodeScanner />}
                    tooltipTitle="Scan QR"
                    onClick={handleQRScan}
                />
            </SpeedDial>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />

            {/* Offline indicator */}
            {offlineMode && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'warning.main',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <CloudOff fontSize="small" />
                    <Typography variant="caption">Working Offline</Typography>
                </Box>
            )}
        </Box>
    );
};

export default FieldStaffDashboard;