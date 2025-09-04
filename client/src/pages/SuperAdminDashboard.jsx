import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Avatar,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Dashboard,
    People,
    Analytics,
    Map,
    Add,
    Edit,
    Delete,
    Visibility,
    GetApp,
    ExpandMore,
    Security,
    Assessment,
    TrendingUp,
    LocationCity,
    Person,
    Group
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/Admin/StatCard';
import ReportMap from '../components/Admin/ReportMap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'add' });
    const [users, setUsers] = useState([]);
    const [cityStats, setCityStats] = useState({});
    const [analytics, setAnalytics] = useState({});
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        loadUsers();
        loadCityStats();
        loadAnalytics();
        loadAuditLogs();
    }, []);

    const loadUsers = () => {
        // Mock user data
        const mockUsers = [
            { id: 1, name: 'Ward Officer 1', email: 'ward1@civic.com', role: 'ward_officer', ward: 'Ward 1', status: 'active', lastLogin: '2025-01-15T10:30:00Z' },
            { id: 2, name: 'Ward Officer 2', email: 'ward2@civic.com', role: 'ward_officer', ward: 'Ward 2', status: 'active', lastLogin: '2025-01-14T15:20:00Z' },
            { id: 3, name: 'Dept Officer 1', email: 'dept1@civic.com', role: 'department_officer', department: 'Public Works', status: 'active', lastLogin: '2025-01-15T09:00:00Z' },
            { id: 4, name: 'Field Staff A', email: 'field1@civic.com', role: 'field_staff', ward: 'Ward 1', status: 'active', lastLogin: '2025-01-15T11:00:00Z' },
            { id: 5, name: 'Field Staff B', email: 'field2@civic.com', role: 'field_staff', ward: 'Ward 2', status: 'inactive', lastLogin: '2025-01-10T14:30:00Z' }
        ];
        setUsers(mockUsers);
    };

    const loadCityStats = () => {
        setCityStats({
            totalReports: 284,
            activeUsers: 45,
            resolvedReports: 198,
            avgResolutionTime: '3.2 days',
            totalWards: 12,
            activeDepartments: 8
        });
    };

    const loadAnalytics = () => {
        setAnalytics({
            monthlyTrends: [
                { month: 'Aug', reports: 45, resolved: 38, users: 42 },
                { month: 'Sep', reports: 52, resolved: 41, users: 43 },
                { month: 'Oct', reports: 48, resolved: 44, users: 44 },
                { month: 'Nov', reports: 61, resolved: 52, users: 45 },
                { month: 'Dec', reports: 58, resolved: 48, users: 45 },
                { month: 'Jan', reports: 43, resolved: 35, users: 46 }
            ],
            wardPerformance: [
                { ward: 'Ward 1', reports: 35, resolved: 28, efficiency: 80 },
                { ward: 'Ward 2', reports: 42, resolved: 31, efficiency: 74 },
                { ward: 'Ward 3', reports: 28, resolved: 24, efficiency: 86 },
                { ward: 'Ward 4', reports: 38, resolved: 29, efficiency: 76 },
                { ward: 'Ward 5', reports: 25, resolved: 22, efficiency: 88 },
                { ward: 'Ward 6', reports: 31, resolved: 25, efficiency: 81 }
            ],
            categoryBreakdown: [
                { name: 'Potholes', value: 35, color: '#8884d8' },
                { name: 'Street Lights', value: 25, color: '#82ca9d' },
                { name: 'Garbage', value: 20, color: '#ffc658' },
                { name: 'Water Supply', value: 15, color: '#ff7c7c' },
                { name: 'Others', value: 5, color: '#8dd1e1' }
            ],
            heatmapData: [
                { lat: 23.3441, lng: 85.3096, intensity: 8 },
                { lat: 23.3451, lng: 85.3106, intensity: 12 },
                { lat: 23.3461, lng: 85.3116, intensity: 6 },
                { lat: 23.3471, lng: 85.3126, intensity: 15 },
                { lat: 23.3481, lng: 85.3136, intensity: 9 }
            ]
        });
    };

    const loadAuditLogs = () => {
        setAuditLogs([
            { id: 1, user: 'Ward Officer 1', action: 'Assigned task', details: 'Pothole repair to Field Staff A', timestamp: '2025-01-15T10:30:00Z' },
            { id: 2, user: 'Dept Officer 1', action: 'Updated status', details: 'Changed report status to completed', timestamp: '2025-01-15T09:15:00Z' },
            { id: 3, user: 'Field Staff A', action: 'Uploaded photo', details: 'Work completion evidence', timestamp: '2025-01-15T08:45:00Z' },
            { id: 4, user: 'Super Admin', action: 'Created user', details: 'Added new field staff member', timestamp: '2025-01-14T16:20:00Z' }
        ]);
    };

    const handleAddUser = () => {
        setUserDialog({ open: true, user: null, mode: 'add' });
    };

    const handleEditUser = (user) => {
        setUserDialog({ open: true, user, mode: 'edit' });
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const handleSaveUser = (userData) => {
        if (userDialog.mode === 'add') {
            const newUser = { ...userData, id: users.length + 1, status: 'active' };
            setUsers([...users, newUser]);
        } else {
            setUsers(users.map(u => u.id === userData.id ? userData : u));
        }
        setUserDialog({ open: false, user: null, mode: 'add' });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'super_admin': return 'error';
            case 'department_officer': return 'warning';
            case 'ward_officer': return 'info';
            case 'field_staff': return 'success';
            default: return 'default';
        }
    };

    const exportReport = () => {
        // Mock export functionality
        const reportData = {
            generatedAt: new Date().toISOString(),
            stats: cityStats,
            users: users.length,
            summary: 'Monthly civic performance report'
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'civic-performance-report.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Municipal Administration Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={exportReport}
                >
                    Export Report
                </Button>
            </Box>

            {/* City-wide Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Total Reports"
                        value={cityStats.totalReports}
                        icon={<Assessment />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Active Users"
                        value={cityStats.activeUsers}
                        icon={<People />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Resolved"
                        value={cityStats.resolvedReports}
                        icon={<TrendingUp />}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Avg Resolution"
                        value={cityStats.avgResolutionTime}
                        icon={<Analytics />}
                        color="#9c27b0"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Total Wards"
                        value={cityStats.totalWards}
                        icon={<LocationCity />}
                        color="#f44336"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Departments"
                        value={cityStats.activeDepartments}
                        icon={<Group />}
                        color="#607d8b"
                    />
                </Grid>
            </Grid>

            {/* Main Tabs */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab icon={<Dashboard />} label="City Overview" />
                        <Tab icon={<People />} label="User Management" />
                        <Tab icon={<Map />} label="Heatmap" />
                        <Tab icon={<Security />} label="Audit Logs" />
                    </Tabs>
                </Box>

                <CardContent>
                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            {/* Monthly Trends */}
                            <Grid item xs={12} lg={8}>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Performance Trends
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={analytics.monthlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="reports" stackId="1" stroke="#2196f3" fill="#2196f3" />
                                        <Area type="monotone" dataKey="resolved" stackId="1" stroke="#4caf50" fill="#4caf50" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Grid>

                            {/* Category Breakdown */}
                            <Grid item xs={12} lg={4}>
                                <Typography variant="h6" gutterBottom>
                                    Issue Categories
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.categoryBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {analytics.categoryBreakdown?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>

                            {/* Ward Performance */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Ward Performance Comparison
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.wardPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="ward" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="reports" fill="#2196f3" name="Total Reports" />
                                        <Bar dataKey="resolved" fill="#4caf50" name="Resolved" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">
                                    User Management ({users.length} users)
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddUser}
                                >
                                    Add User
                                </Button>
                            </Box>

                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Assignment</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Last Login</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar sx={{ mr: 2 }}>
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">{user.name}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={user.role.replace('_', ' ')} 
                                                        color={getRoleColor(user.role)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {user.ward || user.department || 'City-wide'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={user.status} 
                                                        color={user.status === 'active' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.lastLogin).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {tabValue === 2 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Issue Density Heatmap
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Red areas indicate high issue density, requiring immediate attention
                            </Alert>
                            <Box sx={{ height: '500px', width: '100%' }}>
                                <ReportMap reports={analytics.heatmapData} showHeatmap />
                            </Box>
                        </Box>
                    )}

                    {tabValue === 3 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                System Audit Logs
                            </Typography>
                            <Paper variant="outlined">
                                {auditLogs.map((log, index) => (
                                    <Accordion key={log.id}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box display="flex" alignItems="center" width="100%">
                                                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                                    <Person />
                                                </Avatar>
                                                <Box flexGrow={1}>
                                                    <Typography variant="subtitle2">
                                                        {log.user} - {log.action}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body2">
                                                {log.details}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Paper>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* User Dialog */}
            <Dialog 
                open={userDialog.open} 
                onClose={() => setUserDialog({ open: false, user: null, mode: 'add' })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {userDialog.mode === 'add' ? 'Add New User' : 'Edit User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            defaultValue={userDialog.user?.name || ''}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            defaultValue={userDialog.user?.email || ''}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select 
                                defaultValue={userDialog.user?.role || ''}
                                label="Role"
                            >
                                <MenuItem value="ward_officer">Ward Officer</MenuItem>
                                <MenuItem value="department_officer">Department Officer</MenuItem>
                                <MenuItem value="field_staff">Field Staff</MenuItem>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Ward/Department"
                            defaultValue={userDialog.user?.ward || userDialog.user?.department || ''}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch 
                                    defaultChecked={userDialog.user?.status === 'active'}
                                />
                            }
                            label="Active User"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDialog({ open: false, user: null, mode: 'add' })}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={() => handleSaveUser({ 
                            id: userDialog.user?.id, 
                            name: 'Sample User',
                            email: 'sample@civic.com',
                            role: 'field_staff',
                            status: 'active'
                        })}
                    >
                        {userDialog.mode === 'add' ? 'Add User' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SuperAdminDashboard;