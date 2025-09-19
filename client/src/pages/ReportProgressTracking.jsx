import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, Box, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, LinearProgress, Dialog, DialogTitle, DialogContent,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
    TimelineContent, TimelineDot, TimelineOppositeContent,
    Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import {
    Timeline as TimelineIcon, CheckCircle as CheckIcon, 
    Schedule as PendingIcon, Assignment as TaskIcon,
    Person as PersonIcon, CalendarToday as CalendarIcon,
    Priority as PriorityIcon, Category as CategoryIcon,
    Visibility as ViewIcon, Search as SearchIcon,
    FilterList as FilterIcon, Refresh as RefreshIcon
} from '@mui/icons-material';

// India flag colors
const COLORS = {
    saffron: '#FF9933',
    white: '#FFFFFF', 
    green: '#138808',
    navy: '#000080'
};

const ReportProgressTracking = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        category: 'all',
        search: ''
    });

    // API Helper function
    const apiCall = async (endpoint, method = 'GET', body = null) => {
        const token = localStorage.getItem('token');
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (body) {
            config.body = JSON.stringify(body);
        }
        
        const response = await fetch(`http://localhost:5000/api/department-head${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    };

    // Load reports with progress data
    const loadReportProgress = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/report-progress');
            setReports(data);
        } catch (error) {
            console.error('Failed to load report progress:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportProgress();
    }, []);

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'submitted':
                return COLORS.saffron;
            case 'acknowledged':
                return COLORS.navy;
            case 'assigned':
                return '#2196f3';
            case 'in_progress':
            case 'in-progress':
                return '#ff9800';
            case 'completed':
                return COLORS.green;
            case 'resolved':
                return COLORS.green;
            default:
                return '#757575';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return '#f44336';
            case 'high':
                return '#ff5722';
            case 'medium':
                return COLORS.saffron;
            case 'low':
                return COLORS.green;
            default:
                return '#757575';
        }
    };

    // Calculate progress percentage
    const getProgressPercentage = (status) => {
        switch (status?.toLowerCase()) {
            case 'submitted':
                return 20;
            case 'acknowledged':
                return 40;
            case 'assigned':
                return 60;
            case 'in_progress':
            case 'in-progress':
                return 80;
            case 'completed':
            case 'resolved':
                return 100;
            default:
                return 0;
        }
    };

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesStatus = filters.status === 'all' || report.status === filters.status;
        const matchesPriority = filters.priority === 'all' || report.priority === filters.priority;
        const matchesCategory = filters.category === 'all' || report.category === filters.category;
        const matchesSearch = !filters.search || 
            report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            report.description.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });

    // Report Progress Timeline Component
    const ReportTimeline = ({ report }) => {
        const timelineSteps = [
            {
                label: 'Report Submitted',
                status: 'submitted',
                icon: <PersonIcon />,
                time: report.createdAt,
                description: `Submitted by ${report.reportedBy?.name || 'Anonymous'}`
            },
            {
                label: 'Report Acknowledged',
                status: 'acknowledged',
                icon: <CheckIcon />,
                time: report.acknowledgedAt,
                description: 'Report reviewed by department'
            },
            {
                label: 'Task Assigned',
                status: 'assigned',
                icon: <TaskIcon />,
                time: report.assignedAt,
                description: `Assigned to ${report.assignedTo?.name || 'Staff member'}`
            },
            {
                label: 'Work in Progress',
                status: 'in_progress',
                icon: <PendingIcon />,
                time: report.startedAt,
                description: 'Staff working on the issue'
            },
            {
                label: 'Completed',
                status: 'completed',
                icon: <CheckIcon />,
                time: report.completedAt,
                description: 'Issue resolved'
            }
        ];

        return (
            <Timeline position="alternate">
                {timelineSteps.map((step, index) => {
                    const isCompleted = getProgressPercentage(report.status) >= getProgressPercentage(step.status);
                    const isCurrent = report.status === step.status;
                    
                    return (
                        <TimelineItem key={index}>
                            <TimelineOppositeContent
                                sx={{ m: 'auto 0' }}
                                align={index % 2 === 0 ? 'right' : 'left'}
                                variant="body2"
                                color="text.secondary"
                            >
                                {step.time ? new Date(step.time).toLocaleDateString() : 'Pending'}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineConnector />
                                <TimelineDot
                                    color={isCompleted ? 'primary' : isCurrent ? 'secondary' : 'grey'}
                                    sx={{
                                        bgcolor: isCompleted ? COLORS.green : isCurrent ? COLORS.saffron : '#e0e0e0'
                                    }}
                                >
                                    {step.icon}
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                                    {step.label}
                                </Typography>
                                <Typography color="text.secondary">
                                    {step.description}
                                </Typography>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ 
                background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.navy})`,
                color: 'white',
                p: 4,
                borderRadius: 3,
                mb: 4,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    <TimelineIcon sx={{ mr: 2, fontSize: '2rem' }} />
                    Report Progress Tracking
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Monitor citizen report resolution progress from submission to completion
                </Typography>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search reports..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    label="Status"
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="submitted">Submitted</MenuItem>
                                    <MenuItem value="acknowledged">Acknowledged</MenuItem>
                                    <MenuItem value="assigned">Assigned</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={filters.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                    label="Priority"
                                >
                                    <MenuItem value="all">All Priority</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="pothole">Pothole</MenuItem>
                                    <MenuItem value="garbage">Garbage</MenuItem>
                                    <MenuItem value="drainage">Drainage</MenuItem>
                                    <MenuItem value="streetlight">Street Light</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                    <MenuItem value="plumbing">Plumbing</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                variant="contained"
                                onClick={loadReportProgress}
                                startIcon={<RefreshIcon />}
                                sx={{ 
                                    bgcolor: COLORS.green,
                                    '&:hover': { bgcolor: COLORS.navy }
                                }}
                            >
                                Refresh Data
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: COLORS.navy, fontWeight: 'bold' }}>
                        Reports Progress Overview ({filteredReports.length} reports)
                    </Typography>
                    
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <LinearProgress sx={{ mb: 2 }} />
                            <Typography>Loading report progress data...</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: COLORS.saffron + '20' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Report</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Priority</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Progress</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Assigned To</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Days Open</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredReports.map((report) => (
                                        <TableRow 
                                            key={report._id}
                                            sx={{ '&:hover': { bgcolor: COLORS.saffron + '10' } }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {report.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        By: {report.reportedBy?.name || 'Anonymous'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={report.category}
                                                    size="small"
                                                    sx={{ bgcolor: COLORS.green + '20', color: COLORS.green }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={report.priority}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: getPriorityColor(report.priority),
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={report.status}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: getStatusColor(report.status),
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getProgressPercentage(report.status)}
                                                        sx={{ 
                                                            width: 80, 
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: '#e0e0e0',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: getStatusColor(report.status)
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                        {getProgressPercentage(report.status)}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {report.assignedTo?.name ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar 
                                                            sx={{ 
                                                                width: 24, 
                                                                height: 24, 
                                                                bgcolor: COLORS.saffron,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {report.assignedTo.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {report.assignedTo.name}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Not assigned
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {Math.ceil((new Date() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24))} days
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="View Timeline">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setOpenDialog(true);
                                                        }}
                                                        sx={{ 
                                                            color: COLORS.navy,
                                                            '&:hover': { bgcolor: COLORS.saffron + '20' }
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Timeline Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    bgcolor: COLORS.navy, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <TimelineIcon />
                    Report Progress Timeline
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedReport && (
                        <Box sx={{ p: 3 }}>
                            {/* Report Summary */}
                            <Card sx={{ mb: 3, bgcolor: COLORS.saffron + '10' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        {selectedReport.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {selectedReport.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Chip 
                                            label={selectedReport.category} 
                                            icon={<CategoryIcon />}
                                            sx={{ bgcolor: COLORS.green, color: 'white' }}
                                        />
                                        <Chip 
                                            label={selectedReport.priority} 
                                            icon={<PriorityIcon />}
                                            sx={{ bgcolor: getPriorityColor(selectedReport.priority), color: 'white' }}
                                        />
                                        <Chip 
                                            label={`Reported: ${new Date(selectedReport.createdAt).toLocaleDateString()}`} 
                                            icon={<CalendarIcon />}
                                            variant="outlined"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Progress Timeline */}
                            <ReportTimeline report={selectedReport} />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default ReportProgressTracking;