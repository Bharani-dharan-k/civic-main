import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import {
    Map as MapIcon,
    List as ListIcon,
    FilterList,
    Assignment,
    Update,
    Person,
    LocationOn,
    Priority,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ReportMap from '../components/Admin/ReportMap';
import ReportList from '../components/Admin/ReportList';
import StatCard from '../components/Admin/StatCard';

const WardOfficerDashboard = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [filters, setFilters] = useState({
        category: 'all',
        urgency: 'all',
        status: 'all'
    });
    const [assignDialog, setAssignDialog] = useState({ open: false, report: null });
    const [updateDialog, setUpdateDialog] = useState({ open: false, report: null });
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({});
    const [fieldStaff, setFieldStaff] = useState([]);

    // Mock data - replace with actual API calls
    useEffect(() => {
        loadReports();
        loadStats();
        loadFieldStaff();
    }, [filters]);

    const loadReports = () => {
        // Mock data for ward reports
        const mockReports = [
            {
                id: 1,
                title: 'Pothole on Main Street',
                category: 'pothole',
                urgency: 'high',
                status: 'pending',
                location: { lat: 23.3441, lng: 85.3096 },
                address: 'Main Street, Ward 1',
                reporter: 'John Doe',
                createdAt: '2025-01-15T10:30:00Z',
                description: 'Large pothole causing traffic issues'
            },
            {
                id: 2,
                title: 'Broken Streetlight',
                category: 'streetlight',
                urgency: 'medium',
                status: 'assigned',
                location: { lat: 23.3451, lng: 85.3106 },
                address: 'Park Road, Ward 1',
                reporter: 'Jane Smith',
                assignedTo: 'Field Staff A',
                createdAt: '2025-01-14T15:20:00Z',
                description: 'Streetlight not working since yesterday'
            },
            {
                id: 3,
                title: 'Garbage Overflow',
                category: 'garbage',
                urgency: 'high',
                status: 'in_progress',
                location: { lat: 23.3461, lng: 85.3116 },
                address: 'Market Area, Ward 1',
                reporter: 'Local Shopkeeper',
                assignedTo: 'Field Staff B',
                createdAt: '2025-01-13T08:15:00Z',
                description: 'Garbage bin overflowing, needs immediate attention'
            }
        ];

        // Apply filters
        const filtered = mockReports.filter(report => {
            return (filters.category === 'all' || report.category === filters.category) &&
                   (filters.urgency === 'all' || report.urgency === filters.urgency) &&
                   (filters.status === 'all' || report.status === filters.status);
        });

        setReports(filtered);
    };

    const loadStats = () => {
        setStats({
            total: 45,
            pending: 12,
            assigned: 18,
            in_progress: 10,
            resolved: 5
        });
    };

    const loadFieldStaff = () => {
        setFieldStaff([
            { id: 1, name: 'Field Staff A', status: 'available', activeAssignments: 2 },
            { id: 2, name: 'Field Staff B', status: 'busy', activeAssignments: 5 },
            { id: 3, name: 'Field Staff C', status: 'available', activeAssignments: 1 }
        ]);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleAssignReport = (report) => {
        setAssignDialog({ open: true, report });
    };

    const handleUpdateStatus = (report) => {
        setUpdateDialog({ open: true, report });
    };

    const confirmAssignment = (staffId, priority) => {
        // Mock assignment logic
        console.log(`Assigning report ${assignDialog.report.id} to staff ${staffId} with priority ${priority}`);
        setAssignDialog({ open: false, report: null });
        loadReports(); // Refresh data
    };

    const confirmStatusUpdate = (newStatus, comments) => {
        // Mock status update logic
        console.log(`Updating report ${updateDialog.report.id} to ${newStatus}:`, comments);
        setUpdateDialog({ open: false, report: null });
        loadReports(); // Refresh data
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'error';
            case 'assigned': return 'warning';
            case 'in_progress': return 'info';
            case 'resolved': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Ward Officer Dashboard - {user?.ward}
            </Typography>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Total Reports"
                        value={stats.total}
                        icon={<ListIcon />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon={<Priority />}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Assigned"
                        value={stats.assigned}
                        icon={<AssignmentIcon />}
                        color="#ff5722"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="In Progress"
                        value={stats.in_progress}
                        icon={<Update />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={<Person />}
                        color="#4caf50"
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="pothole">Pothole</MenuItem>
                                    <MenuItem value="streetlight">Street Light</MenuItem>
                                    <MenuItem value="garbage">Garbage</MenuItem>
                                    <MenuItem value="water">Water Supply</MenuItem>
                                    <MenuItem value="drainage">Drainage</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Urgency</InputLabel>
                                <Select
                                    value={filters.urgency}
                                    onChange={(e) => handleFilterChange('urgency', e.target.value)}
                                    label="Urgency"
                                >
                                    <MenuItem value="all">All Urgency</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="assigned">Assigned</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="resolved">Resolved</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* View Toggle */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab icon={<ListIcon />} label="List View" />
                        <Tab icon={<MapIcon />} label="Map View" />
                    </Tabs>
                </Box>

                <CardContent>
                    {tabValue === 0 && (
                        <List>
                            {reports.map((report) => (
                                <ListItem key={report.id} divider>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <LocationOn />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="h6">{report.title}</Typography>
                                                <Chip 
                                                    label={report.urgency} 
                                                    color={getUrgencyColor(report.urgency)}
                                                    size="small"
                                                />
                                                <Chip 
                                                    label={report.status.replace('_', ' ')} 
                                                    color={getStatusColor(report.status)}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {report.address} • Reporter: {report.reporter}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {report.description}
                                                </Typography>
                                                {report.assignedTo && (
                                                    <Typography variant="body2" color="primary">
                                                        Assigned to: {report.assignedTo}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Box display="flex" gap={1}>
                                            {report.status === 'pending' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<Assignment />}
                                                    onClick={() => handleAssignReport(report)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            {report.status !== 'pending' && report.status !== 'resolved' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<Update />}
                                                    onClick={() => handleUpdateStatus(report)}
                                                >
                                                    Update
                                                </Button>
                                            )}
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    {tabValue === 1 && (
                        <Box sx={{ height: '500px', width: '100%' }}>
                            <ReportMap reports={reports} />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Assignment Dialog */}
            <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, report: null })}>
                <DialogTitle>Assign Report to Field Staff</DialogTitle>
                <DialogContent>
                    {assignDialog.report && (
                        <Box sx={{ minWidth: 300, pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {assignDialog.report.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                {assignDialog.report.address}
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                                <InputLabel>Select Field Staff</InputLabel>
                                <Select defaultValue="" label="Select Field Staff">
                                    {fieldStaff.map(staff => (
                                        <MenuItem key={staff.id} value={staff.id}>
                                            {staff.name} ({staff.status}) - {staff.activeAssignments} active
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Priority</InputLabel>
                                <Select defaultValue="medium" label="Priority">
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialog({ open: false, report: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => confirmAssignment(1, 'medium')}>
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={updateDialog.open} onClose={() => setUpdateDialog({ open: false, report: null })}>
                <DialogTitle>Update Report Status</DialogTitle>
                <DialogContent>
                    {updateDialog.report && (
                        <Box sx={{ minWidth: 300, pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {updateDialog.report.title}
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                                <InputLabel>New Status</InputLabel>
                                <Select defaultValue={updateDialog.report.status} label="New Status">
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="resolved">Resolved</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Comments/Notes"
                                placeholder="Add any comments or notes about this update..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialog({ open: false, report: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => confirmStatusUpdate('in_progress', 'Updated by ward officer')}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WardOfficerDashboard;