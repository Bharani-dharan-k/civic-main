import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    PhotoCamera,
    LocationOn,
    Phone,
    Email,
    AccessTime,
    Upload,
    PlayArrow,
    Stop
} from '@mui/icons-material';
import { getWorkerTasks, updateTaskStatus, uploadTaskPhotos, getWorkerStats } from '../api/api';

const WorkerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [photoDialog, setPhotoDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, statsRes] = await Promise.all([
                getWorkerTasks(),
                getWorkerStats()
            ]);
            
            setTasks(tasksRes.data.tasks || []);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            if (!selectedTask || !newStatus) return;

            await updateTaskStatus(selectedTask._id, newStatus, statusNotes);
            
            setStatusDialog(false);
            setSelectedTask(null);
            setNewStatus('');
            setStatusNotes('');
            fetchData(); // Refresh data
            
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update task status.');
        }
    };

    const handleFileUpload = async () => {
        try {
            if (!selectedTask || selectedFiles.length === 0) return;

            setUploading(true);
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('photos', file);
            });

            await uploadTaskPhotos(selectedTask._id, formData);
            
            setPhotoDialog(false);
            setSelectedTask(null);
            setSelectedFiles([]);
            fetchData(); // Refresh data
            
        } catch (error) {
            console.error('Error uploading photos:', error);
            setError('Failed to upload photos.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Acknowledged': return 'info';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'error';
            case 'High': return 'warning';
            case 'Medium': return 'info';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Header */}
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment /> Field Worker Dashboard
            </Typography>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Assigned
                                </Typography>
                                <Typography variant="h4">
                                    {stats.totalAssigned}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    In Progress
                                </Typography>
                                <Typography variant="h4" color="warning.main">
                                    {stats.inProgress}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Completed
                                </Typography>
                                <Typography variant="h4" color="success.main">
                                    {stats.completed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Completion Rate
                                </Typography>
                                <Typography variant="h4" color="primary.main">
                                    {stats.completionRate}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Active Tasks */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                📋 Active Tasks
            </Typography>

            {tasks.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No tasks assigned at the moment
                    </Typography>
                    <Typography color="textSecondary">
                        Check back later for new assignments
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {tasks.map((task) => (
                        <Grid item xs={12} md={6} lg={4} key={task._id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Chip 
                                            label={task.status} 
                                            color={getStatusColor(task.status)}
                                            size="small"
                                        />
                                        <Chip 
                                            label={task.priority} 
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography variant="h6" gutterBottom>
                                        {task.title}
                                    </Typography>

                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        {task.description}
                                    </Typography>

                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <LocationOn fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {task.location?.coordinates ? 
                                                `${task.location.coordinates[1]}, ${task.location.coordinates[0]}` : 
                                                'Location not available'
                                            }
                                        </Typography>
                                    </Box>

                                    {/* Reporter Info */}
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" color="primary">
                                            Reported by:
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                {task.reportedBy?.name?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {task.reportedBy?.name}
                                            </Typography>
                                        </Box>
                                        {task.reportedBy?.phone && (
                                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                                <Phone fontSize="small" />
                                                <Typography variant="body2">
                                                    {task.reportedBy.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Task Image */}
                                    {task.imageUrl && (
                                        <Box mb={2}>
                                            <img 
                                                src={task.imageUrl} 
                                                alt="Task"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Typography variant="caption" color="textSecondary">
                                        <AccessTime fontSize="small" sx={{ mr: 1 }} />
                                        Created: {new Date(task.createdAt).toLocaleDateString()}
                                    </Typography>
                                </CardContent>

                                <CardActions>
                                    <Button
                                        size="small"
                                        startIcon={task.status === 'Acknowledged' ? <PlayArrow /> : <CheckCircle />}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setNewStatus(task.status === 'Acknowledged' ? 'In Progress' : 'Resolved');
                                            setStatusDialog(true);
                                        }}
                                        color="primary"
                                    >
                                        {task.status === 'Acknowledged' ? 'Start Work' : 'Mark Complete'}
                                    </Button>
                                    
                                    <Button
                                        size="small"
                                        startIcon={<PhotoCamera />}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setPhotoDialog(true);
                                        }}
                                    >
                                        Add Photos
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Status Update Dialog */}
            <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="In Progress">Start Work</MenuItem>
                                <MenuItem value="Resolved">Mark Complete</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            placeholder="Add any notes about your progress..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
                    <Button onClick={handleStatusUpdate} variant="contained">
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Photo Upload Dialog */}
            <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Work Photos</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                        />
                        
                        {selectedFiles.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected files: {selectedFiles.length}
                                </Typography>
                                <List>
                                    {selectedFiles.map((file, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                        
                        <Typography variant="body2" color="textSecondary">
                            Upload photos or videos showing your work progress. Maximum 5 files, 10MB each.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPhotoDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleFileUpload} 
                        variant="contained"
                        disabled={selectedFiles.length === 0 || uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
                    >
                        {uploading ? 'Uploading...' : 'Upload Photos'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WorkerDashboard;