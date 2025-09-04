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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tab,
    Tabs,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    TrendingUp,
    Assignment,
    CheckCircle,
    Schedule,
    LocationCity,
    Person,
    Analytics,
    TableChart
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import AnalyticsChart from '../components/Admin/AnalyticsChart';
import StatCard from '../components/Admin/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DepartmentOfficerDashboard = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [filters, setFilters] = useState({
        ward: 'all',
        category: 'all',
        timeRange: '30'
    });
    const [reports, setReports] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [reassignDialog, setReassignDialog] = useState({ open: false, report: null });

    useEffect(() => {
        loadReports();
        loadAnalytics();
    }, [filters]);

    const loadReports = () => {
        // Mock data for department reports across wards
        const mockReports = [
            {
                id: 1,
                title: 'Pothole Repair - Main Street',
                category: 'pothole',
                ward: 'Ward 1',
                urgency: 'high',
                status: 'assigned',
                assignedTo: 'Field Staff A',
                assignedOfficer: 'Ward Officer 1',
                createdAt: '2025-01-15T10:30:00Z',
                estimatedCompletion: '2025-01-17T18:00:00Z'
            },
            {
                id: 2,
                title: 'Street Light Installation',
                category: 'streetlight',
                ward: 'Ward 2',
                urgency: 'medium',
                status: 'in_progress',
                assignedTo: 'Field Staff B',
                assignedOfficer: 'Ward Officer 2',
                createdAt: '2025-01-14T15:20:00Z',
                estimatedCompletion: '2025-01-16T17:00:00Z'
            },
            {
                id: 3,
                title: 'Road Maintenance',
                category: 'pothole',
                ward: 'Ward 3',
                urgency: 'low',
                status: 'completed',
                assignedTo: 'Field Staff C',
                assignedOfficer: 'Ward Officer 3',
                createdAt: '2025-01-13T08:15:00Z',
                completedAt: '2025-01-15T16:30:00Z'
            }
        ];

        const filtered = mockReports.filter(report => {
            return (filters.ward === 'all' || report.ward === filters.ward) &&
                   (filters.category === 'all' || report.category === filters.category);
        });

        setReports(filtered);
    };

    const loadAnalytics = () => {
        setAnalytics({
            wardPerformance: [
                { ward: 'Ward 1', completed: 25, pending: 8, avgTime: 3.2 },
                { ward: 'Ward 2', completed: 18, pending: 12, avgTime: 4.1 },
                { ward: 'Ward 3', completed: 22, pending: 6, avgTime: 2.8 },
                { ward: 'Ward 4', completed: 15, pending: 15, avgTime: 5.2 },
                { ward: 'Ward 5', completed: 20, pending: 10, avgTime: 3.8 }
            ],
            trendData: [
                { month: 'Aug', reports: 45, resolved: 38 },
                { month: 'Sep', reports: 52, resolved: 41 },
                { month: 'Oct', reports: 48, resolved: 44 },
                { month: 'Nov', reports: 61, resolved: 52 },
                { month: 'Dec', reports: 58, resolved: 48 },
                { month: 'Jan', reports: 43, resolved: 35 }
            ],
            categoryDistribution: [
                { name: 'Potholes', value: 35, color: '#8884d8' },
                { name: 'Street Lights', value: 25, color: '#82ca9d' },
                { name: 'Garbage', value: 20, color: '#ffc658' },
                { name: 'Water Supply', value: 15, color: '#ff7c7c' },
                { name: 'Others', value: 5, color: '#8dd1e1' }
            ]
        });
    };

    const handleReassign = (report) => {
        setReassignDialog({ open: true, report });
    };

    const confirmReassignment = () => {
        console.log(`Reassigning report ${reassignDialog.report.id}`);
        setReassignDialog({ open: false, report: null });
        loadReports();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'error';
            case 'assigned': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Department Dashboard - {user?.department}
            </Typography>

            {/* Department Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Assigned"
                        value={reports.length}
                        icon={<Assignment />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="In Progress"
                        value={reports.filter(r => r.status === 'in_progress').length}
                        icon={<Schedule />}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed"
                        value={reports.filter(r => r.status === 'completed').length}
                        icon={<CheckCircle />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg Resolution Time"
                        value="3.5 days"
                        icon={<TrendingUp />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Department Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Ward</InputLabel>
                                <Select
                                    value={filters.ward}
                                    onChange={(e) => setFilters(prev => ({ ...prev, ward: e.target.value }))}
                                    label="Ward"
                                >
                                    <MenuItem value="all">All Wards</MenuItem>
                                    <MenuItem value="Ward 1">Ward 1</MenuItem>
                                    <MenuItem value="Ward 2">Ward 2</MenuItem>
                                    <MenuItem value="Ward 3">Ward 3</MenuItem>
                                    <MenuItem value="Ward 4">Ward 4</MenuItem>
                                    <MenuItem value="Ward 5">Ward 5</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="pothole">Pothole</MenuItem>
                                    <MenuItem value="streetlight">Street Light</MenuItem>
                                    <MenuItem value="garbage">Garbage</MenuItem>
                                    <MenuItem value="water">Water Supply</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Time Range</InputLabel>
                                <Select
                                    value={filters.timeRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                    label="Time Range"
                                >
                                    <MenuItem value="7">Last 7 Days</MenuItem>
                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                    <MenuItem value="90">Last 90 Days</MenuItem>
                                    <MenuItem value="365">Last Year</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab icon={<TableChart />} label="Reports Overview" />
                        <Tab icon={<Analytics />} label="Ward Analytics" />
                        <Tab icon={<TrendingUp />} label="Performance Trends" />
                    </Tabs>
                </Box>

                <CardContent>
                    {tabValue === 0 && (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Report</TableCell>
                                        <TableCell>Ward</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Urgency</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Assigned To</TableCell>
                                        <TableCell>Ward Officer</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                <Typography variant="subtitle2">{report.title}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Created: {new Date(report.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={report.ward} color="primary" variant="outlined" size="small" />
                                            </TableCell>
                                            <TableCell>{report.category}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={report.urgency} 
                                                    color={getUrgencyColor(report.urgency)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={report.status.replace('_', ' ')} 
                                                    color={getStatusColor(report.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{report.assignedTo}</TableCell>
                                            <TableCell>{report.assignedOfficer}</TableCell>
                                            <TableCell>
                                                {report.status !== 'completed' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleReassign(report)}
                                                    >
                                                        Reassign
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={8}>
                                <Typography variant="h6" gutterBottom>
                                    Ward Performance Comparison
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.wardPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="ward" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                                        <Bar dataKey="pending" fill="#ff9800" name="Pending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                                <Typography variant="h6" gutterBottom>
                                    Category Distribution
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {analytics.categoryDistribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 2 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Reports vs Resolution Trend
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={analytics.trendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="reports" stroke="#2196f3" name="Reports Received" />
                                        <Line type="monotone" dataKey="resolved" stroke="#4caf50" name="Reports Resolved" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Average Resolution Time by Ward
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.wardPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="ward" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`${value} days`, 'Avg Resolution Time']} />
                                        <Bar dataKey="avgTime" fill="#9c27b0" name="Average Days" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid>
                        </Grid>
                    )}
                </CardContent>
            </Card>

            {/* Reassignment Dialog */}
            <Dialog open={reassignDialog.open} onClose={() => setReassignDialog({ open: false, report: null })}>
                <DialogTitle>Reassign Report</DialogTitle>
                <DialogContent>
                    {reassignDialog.report && (
                        <Box sx={{ minWidth: 400, pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {reassignDialog.report.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Current Assignment: {reassignDialog.report.assignedTo} ({reassignDialog.report.ward})
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                                <InputLabel>Reassign to Ward</InputLabel>
                                <Select defaultValue="" label="Reassign to Ward">
                                    <MenuItem value="Ward 1">Ward 1</MenuItem>
                                    <MenuItem value="Ward 2">Ward 2</MenuItem>
                                    <MenuItem value="Ward 3">Ward 3</MenuItem>
                                    <MenuItem value="Ward 4">Ward 4</MenuItem>
                                    <MenuItem value="Ward 5">Ward 5</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Reassignment Reason"
                                placeholder="Explain the reason for reassignment..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReassignDialog({ open: false, report: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={confirmReassignment}>
                        Reassign
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DepartmentOfficerDashboard;