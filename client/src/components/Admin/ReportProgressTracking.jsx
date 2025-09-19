import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Chip,
    Avatar,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Timeline as TimelineIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// India Flag Colors
const COLORS = {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navy: '#000080'
};

const ReportProgressTracking = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        fetchReportProgress();
    }, []);

    useEffect(() => {
        filterReports();
    }, [reports, searchQuery, statusFilter, priorityFilter, categoryFilter]);

    const fetchReportProgress = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/department-head/report-progress', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || []);
            } else {
                throw new Error('Failed to fetch report progress');
            }
        } catch (err) {
            console.error('Error fetching report progress:', err);
            setError('Failed to load report progress data');
        } finally {
            setLoading(false);
        }
    };

    const filterReports = () => {
        let filtered = reports;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(report =>
                report.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.citizenName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(report => report.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(report => report.priority === priorityFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(report => report.category === categoryFilter);
        }

        setFilteredReports(filtered);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'submitted': return COLORS.navy;
            case 'acknowledged': return '#FFA500';
            case 'in_progress': return '#2196F3';
            case 'resolved': return COLORS.green;
            case 'closed': return '#9E9E9E';
            default: return COLORS.navy;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#F44336';
            case 'medium': return COLORS.saffron;
            case 'low': return COLORS.green;
            default: return COLORS.navy;
        }
    };

    const getProgressPercentage = (status) => {
        switch (status?.toLowerCase()) {
            case 'submitted': return 20;
            case 'acknowledged': return 40;
            case 'in_progress': return 70;
            case 'resolved': return 100;
            case 'closed': return 100;
            default: return 0;
        }
    };

    const getTimelineIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'submitted': return <AssignmentIcon />;
            case 'acknowledged': return <ScheduleIcon />;
            case 'in_progress': return <TimelineIcon />;
            case 'resolved': return <CheckCircleIcon />;
            case 'closed': return <CheckCircleIcon />;
            default: return <AssignmentIcon />;
        }
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setDetailsOpen(true);
    };

    const renderReportCard = (report) => (
        <Card
            key={report._id}
            sx={{
                mb: 2,
                border: `2px solid ${getStatusColor(report.status)}20`,
                borderRadius: 2,
                '&:hover': {
                    boxShadow: 3,
                    borderColor: getStatusColor(report.status)
                }
            }}
        >
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ color: COLORS.navy, mb: 1 }}>
                            {report.subject}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            <LocationIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {report.location}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {report.citizenName} • {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={report.status}
                                size="small"
                                sx={{
                                    bgcolor: getStatusColor(report.status),
                                    color: 'white',
                                    mb: 1,
                                    mr: 1
                                }}
                            />
                            <Chip
                                label={report.priority}
                                size="small"
                                sx={{
                                    bgcolor: getPriorityColor(report.priority),
                                    color: 'white',
                                    mb: 1
                                }}
                            />
                        </Box>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                Progress: {getProgressPercentage(report.status)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={getProgressPercentage(report.status)}
                                sx={{
                                    height: 6,
                                    borderRadius: 1,
                                    backgroundColor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: getStatusColor(report.status)
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'right' }}>
                            {report.assignedTo && (
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                    Assigned to: {report.assignedTo.name}
                                </Typography>
                            )}
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewDetails(report)}
                                sx={{
                                    borderColor: COLORS.navy,
                                    color: COLORS.navy,
                                    '&:hover': {
                                        borderColor: COLORS.saffron,
                                        bgcolor: `${COLORS.saffron}10`
                                    }
                                }}
                            >
                                View Details
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const renderTimelineView = () => {
        if (filteredReports.length === 0) {
            return (
                <Alert severity="info">
                    No reports found matching your criteria.
                </Alert>
            );
        }

        return (
            <Box>
                {filteredReports.map(report => (
                    <Card key={report._id} sx={{ mb: 2, border: `1px solid ${getStatusColor(report.status)}30` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: getStatusColor(report.status), mr: 2 }}>
                                    {getTimelineIcon(report.status)}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" sx={{ color: COLORS.navy }}>
                                        {report.subject}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')} • {report.location}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip
                                        label={report.status}
                                        size="small"
                                        sx={{ bgcolor: getStatusColor(report.status), color: 'white', mr: 1 }}
                                    />
                                    <Chip
                                        label={report.priority}
                                        size="small"
                                        sx={{ bgcolor: getPriorityColor(report.priority), color: 'white' }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewDetails(report)}
                                        sx={{
                                            ml: 1,
                                            borderColor: COLORS.navy,
                                            color: COLORS.navy,
                                            '&:hover': {
                                                borderColor: COLORS.saffron,
                                                bgcolor: `${COLORS.saffron}10`
                                            }
                                        }}
                                    >
                                        Details
                                    </Button>
                                </Box>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={getProgressPercentage(report.status)}
                                sx={{
                                    height: 6,
                                    borderRadius: 1,
                                    backgroundColor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: getStatusColor(report.status)
                                    }
                                }}
                            />
                            <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                                {getProgressPercentage(report.status)}% Complete
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress sx={{ color: COLORS.saffron }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Typography variant="h4" sx={{ color: COLORS.navy, mb: 3, fontWeight: 'bold' }}>
                Report Progress Tracking
            </Typography>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'grey.400', mr: 1 }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="submitted">Submitted</MenuItem>
                                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={priorityFilter}
                                label="Priority"
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Priority</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                                <MenuItem value="Environment">Environment</MenuItem>
                                <MenuItem value="Public Safety">Public Safety</MenuItem>
                                <MenuItem value="Transportation">Transportation</MenuItem>
                                <MenuItem value="Utilities">Utilities</MenuItem>
                                <MenuItem value="Health">Health</MenuItem>
                                <MenuItem value="Others">Others</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="body1" sx={{ color: COLORS.navy }}>
                            Total Reports: {filteredReports.length}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Reports */}
            <Paper sx={{ p: 3 }}>
                {renderTimelineView()}
            </Paper>

            {/* Report Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: COLORS.navy, color: 'white' }}>
                    Report Details
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedReport && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ color: COLORS.navy, mb: 2 }}>
                                    {selectedReport.subject}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {selectedReport.description}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">Location:</Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>{selectedReport.location}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">Citizen:</Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>{selectedReport.citizenName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">Status:</Typography>
                                <Chip
                                    label={selectedReport.status}
                                    size="small"
                                    sx={{ bgcolor: getStatusColor(selectedReport.status), color: 'white', mt: 0.5 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">Priority:</Typography>
                                <Chip
                                    label={selectedReport.priority}
                                    size="small"
                                    sx={{ bgcolor: getPriorityColor(selectedReport.priority), color: 'white', mt: 0.5 }}
                                />
                            </Grid>
                            {selectedReport.assignedTo && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Assigned To:</Typography>
                                    <Typography variant="body1">{selectedReport.assignedTo.name} ({selectedReport.assignedTo.email})</Typography>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Progress:</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={getProgressPercentage(selectedReport.status)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 1,
                                            backgroundColor: '#f0f0f0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getStatusColor(selectedReport.status)
                                            }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {getProgressPercentage(selectedReport.status)}% Complete
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)} sx={{ color: COLORS.navy }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportProgressTracking;