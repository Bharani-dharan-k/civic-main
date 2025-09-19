import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tab,
    Tabs,
    Grid,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Menu,
    Alert,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assignment as TaskIcon,
    People as PeopleIcon,
    Inventory as ResourceIcon,
    AccountBalance as BudgetIcon,
    Business as ProjectIcon,
    Feedback as ComplaintIcon,
    BarChart as ReportIcon,
    Timeline as TimelineIcon,
    Message as MessageIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    MoreVert as MoreIcon,
    TrendingUp,
    TrendingDown,
    Warning,
    CheckCircle,
    Schedule,
    Cancel
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import ReportProgressTracking from '../components/Admin/ReportProgressTracking';

// India Flag Colors
const COLORS = {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navy: '#000080',
    darkGreen: '#0F5132',
    lightSaffron: '#FFB366'
};

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

const DepartmentOfficerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState(null);

    // Data states
    const [dashboardData, setDashboardData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [resources, setResources] = useState([]);
    const [projects, setProjects] = useState([]);
    const [budget, setBudget] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);

    // Form states
    const [formData, setFormData] = useState({});

    // API Helper function
    const apiCall = async (endpoint, method = 'GET', body = null) => {
        try {
            const token = localStorage.getItem('token');
            const url = `${API_BASE_URL}/department-head${endpoint}`;
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error.message);
            setError(`API call failed: ${error.message}`);
            throw error;
        }
    };

    // Load dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/dashboard');
            
            // Process data for charts and additional frontend requirements
            const processedData = {
                ...data,
                taskStatusData: []
            };
            
            // Create task status data for pie chart if overview data exists
            if (data.overview?.tasks) {
                processedData.taskStatusData = [
                    { name: 'Assigned', value: data.overview.tasks.pending || 0 },
                    { name: 'Completed', value: data.overview.tasks.completed || 0 },
                    { name: 'In Progress', value: (data.overview.tasks.total || 0) - (data.overview.tasks.pending || 0) - (data.overview.tasks.completed || 0) }
                ].filter(item => item.value > 0);
            }
            
            setDashboardData(processedData);
            setError(null);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setError(`Failed to load dashboard data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Load tasks
    const loadTasks = async () => {
        try {
            const data = await apiCall('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    // Load staff
    const loadStaff = async () => {
        try {
            const data = await apiCall('/staff');
            setStaff(data);
        } catch (error) {
            console.error('Failed to load staff:', error);
        }
    };

    // Load resources
    const loadResources = async () => {
        try {
            const data = await apiCall('/resources');
            setResources(data);
        } catch (error) {
            console.error('Failed to load resources:', error);
        }
    };

    // Load pending reports for task assignment
    const loadPendingReports = async () => {
        try {
            const data = await apiCall('/pending-reports');
            setPendingReports(data);
        } catch (error) {
            console.error('Failed to load pending reports:', error);
            setPendingReports([]);
        }
    };

    // Load projects
    const loadProjects = async () => {
        try {
            const data = await apiCall('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    };

    // Load budget
    const loadBudget = async () => {
        try {
            const data = await apiCall('/budget');
            setBudget(data);
        } catch (error) {
            console.error('Failed to load budget:', error);
        }
    };

    // Load complaints
    const loadComplaints = async () => {
        try {
            const data = await apiCall('/complaints');
            setComplaints(data);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        }
    };

    // Load data based on active tab
    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        switch (activeTab) {
            case 1:
                loadTasks();
                break;
            case 2:
                loadStaff();
                break;
            case 3:
                loadResources();
                break;
            case 4:
                loadBudget();
                break;
            case 5:
                loadProjects();
                break;
            case 6:
                loadComplaints();
                break;
            default:
                break;
        }
    }, [activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenDialog = (type, item = null) => {
        setDialogType(type);
        setSelectedItem(item);
        setFormData(item || {});
        setOpenDialog(true);
        
        // Load pending reports when opening assign-task dialog
        if (type === 'assign-task') {
            loadPendingReports();
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
        setFormData({});
    };

    const handleFormSubmit = async () => {
        try {
            if (dialogType === 'create-task') {
                await apiCall('/tasks', 'POST', formData);
                loadTasks();
            } else if (dialogType === 'create-staff') {
                await apiCall('/staff', 'POST', formData);
                loadStaff();
            } else if (dialogType === 'assign-task') {
                // Handle task assignment to staff member
                const taskData = {
                    ...formData,
                    assignedTo: selectedItem.user._id || selectedItem.user,
                    department: selectedItem.department
                };
                await apiCall('/tasks', 'POST', taskData);
                loadTasks();
                loadStaff(); // Refresh staff to update task counts
            } else if (dialogType === 'update-task-status') {
                await apiCall(`/tasks/${selectedItem._id}/status`, 'PUT', { status: formData.status });
                loadTasks();
            }
            
            handleCloseDialog();
            setError(null);
        } catch (error) {
            console.error('Form submission failed:', error);
        }
    };

    const handleMenuClick = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    // Status color functions
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return COLORS.green;
            case 'in_progress':
            case 'in-progress':
                return COLORS.saffron;
            case 'assigned':
                return COLORS.navy;
            case 'cancelled':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return '#f44336';
            case 'medium':
                return COLORS.saffron;
            case 'low':
                return COLORS.green;
            default:
                return '#757575';
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Dashboard Overview Component
    const DashboardOverview = () => {
        if (loading || !dashboardData) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 4
                }}>
                    <CircularProgress size={60} style={{ color: COLORS.saffron, mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                        Loading dashboard data...
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 4
                }}>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Box>
            );
        }

        return (
            <Box sx={{ flexGrow: 1 }}>
                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <TaskIcon style={{ color: COLORS.saffron, marginRight: 8, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: COLORS.navy, fontWeight: 'bold' }}>
                                            {dashboardData?.overview?.tasks?.total || 0}
                                        </Typography>
                                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>Total Tasks</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <PeopleIcon style={{ color: COLORS.green, marginRight: 8, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: COLORS.navy, fontWeight: 'bold' }}>
                                            {dashboardData?.overview?.staff?.total || 0}
                                        </Typography>
                                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>Staff Members</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b3 100%)' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <ProjectIcon style={{ color: COLORS.saffron, marginRight: 8, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: COLORS.navy, fontWeight: 'bold' }}>
                                            {dashboardData?.overview?.projects?.active || 0}
                                        </Typography>
                                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>Active Projects</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f8e8 0%, #c8e8c8 100%)' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <BudgetIcon style={{ color: COLORS.green, marginRight: 8, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: COLORS.navy, fontWeight: 'bold' }}>
                                            {formatCurrency(dashboardData?.budget?.totalBudget || 0)}
                                        </Typography>
                                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>Budget Used</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={3}>
                    {/* Task Status Chart */}
                    <Grid xs={12} md={6}>
                        <Card sx={{ 
                            height: '500px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: 3,
                            overflow: 'visible'
                        }}>
                            <CardContent sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                p: 3
                            }}>
                                <Typography variant="h6" sx={{ 
                                    color: COLORS.navy, 
                                    fontWeight: 'bold', 
                                    mb: 3,
                                    textAlign: 'center',
                                    fontSize: '1.1rem'
                                }}>
                                    Task Status Distribution
                                </Typography>
                                <Box sx={{ 
                                    flexGrow: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {(dashboardData.taskStatusData || []).length === 0 ? (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            color: 'text.secondary'
                                        }}>
                                            <Typography variant="body1">No task data available</Typography>
                                        </Box>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={380}>
                                            <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                                <Pie
                                                    data={dashboardData.taskStatusData || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={85}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={false}
                                                    stroke="#fff"
                                                    strokeWidth={3}
                                                >
                                                    {(dashboardData.taskStatusData || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255,255,255,0.98)',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        fontWeight: 'medium',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}
                                                    formatter={(value, name) => [`${value} tasks`, name]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                                {/* Custom Legend */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    mt: 2
                                }}>
                                    {(dashboardData.taskStatusData || []).map((entry, index) => (
                                        <Box key={index} sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            bgcolor: 'rgba(0,0,0,0.04)',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2
                                        }}>
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
                                                bgcolor: getStatusColor(entry.name),
                                                borderRadius: '50%',
                                                mr: 1,
                                                border: '2px solid #fff',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }} />
                                            <Typography variant="body2" sx={{ 
                                                fontWeight: 'medium',
                                                color: COLORS.navy
                                            }}>
                                                {entry.name}: {entry.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Activity */}
                    <Grid xs={12} md={6}>
                        <Card sx={{ 
                            height: '500px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: 3
                        }}>
                            <CardContent sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                p: 3
                            }}>
                                <Typography variant="h6" sx={{ 
                                    color: COLORS.navy, 
                                    fontWeight: 'bold', 
                                    mb: 3,
                                    textAlign: 'center',
                                    fontSize: '1.1rem'
                                }}>
                                    Recent Activities
                                </Typography>
                                <Box sx={{ 
                                    flexGrow: 1,
                                    overflow: 'auto',
                                    pr: 1,
                                    '&::-webkit-scrollbar': {
                                        width: '6px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: '3px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: COLORS.saffron,
                                        borderRadius: '3px'
                                    }
                                }}>
                                    {(dashboardData.recentTasks || []).length === 0 ? (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            height: '100%',
                                            flexDirection: 'column',
                                            color: 'text.secondary'
                                        }}>
                                            <TaskIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                            <Typography variant="body1">No recent activities</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {(dashboardData.recentTasks || []).map((task, index) => (
                                                <Card key={index} sx={{ 
                                                    bgcolor: '#fafafa',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: '#f0f0f0',
                                                        borderColor: COLORS.saffron,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}>  
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: getStatusColor(task.status),
                                                                mt: 1,
                                                                mr: 2,
                                                                flexShrink: 0
                                                            }} />
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ 
                                                                    color: COLORS.navy, 
                                                                    fontWeight: 600, 
                                                                    mb: 1,
                                                                    lineHeight: 1.3
                                                                }}>
                                                                    {task.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ 
                                                                    mb: 0.5,
                                                                    fontSize: '0.85rem'
                                                                }}>
                                                                    👤 {task.assignedTo?.name}
                                                                </Typography>
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    mt: 1
                                                                }}>
                                                                    <Chip 
                                                                        label={task.status}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: getStatusColor(task.status),
                                                                            color: 'white',
                                                                            fontWeight: 'medium',
                                                                            fontSize: '0.75rem',
                                                                            height: '24px'
                                                                        }}
                                                                    />
                                                                    <Typography variant="caption" color="text.secondary" sx={{
                                                                        fontSize: '0.75rem'
                                                                    }}>
                                                                        📅 {new Date(task.deadline).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Task Management Component
    const TaskManagement = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" style={{ color: COLORS.navy }}>Task Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create-task')}
                    style={{ backgroundColor: COLORS.saffron, color: 'white' }}
                >
                    Add New Task
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: COLORS.lightSaffron }}>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Priority</strong></TableCell>
                            <TableCell><strong>Assigned To</strong></TableCell>
                            <TableCell><strong>Deadline</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task._id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={task.status}
                                        size="small"
                                        style={{ backgroundColor: getStatusColor(task.status), color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={task.priority}
                                        size="small"
                                        style={{ backgroundColor: getPriorityColor(task.priority), color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>{task.assignedTo?.name || task.assignedTo}</TableCell>
                                <TableCell>
                                    {task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => handleMenuClick(e, task)}>
                                        <MoreIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // Staff Management Component
    const StaffManagement = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ 
                    color: COLORS.navy,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <PeopleIcon />
                    Municipal Staff Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create-staff')}
                    sx={{ 
                        backgroundColor: COLORS.green, 
                        color: 'white',
                        '&:hover': {
                            backgroundColor: COLORS.navy
                        }
                    }}
                >
                    Add Staff Member
                </Button>
            </Box>

            {staff.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Staff Members Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add staff members to see them listed here with their task assignments and performance metrics.
                    </Typography>
                </Card>
            ) : (
                <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.saffron + '20' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Staff Member
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Role
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Coverage Area
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Attendance
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Tasks Completed
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Contact
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: COLORS.navy }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {staff.map((member) => (
                                    <TableRow 
                                        key={member._id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: COLORS.saffron + '10'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    bgcolor: COLORS.saffron,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {member.user?.name?.charAt(0) || member.name?.charAt(0) || '?'}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {member.user?.name || member.name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {member.employeeId}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {member.position?.toUpperCase() || 'DEPARTMENT HEAD'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {member.department === 'Health Services' ? 'All Wards' : member.coverageArea || 'All Wards'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: member.status === 'active' ? COLORS.green : '#f44336',
                                                    color: 'white',
                                                    fontWeight: 'medium',
                                                    textTransform: 'lowercase'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ 
                                                    width: 80, 
                                                    height: 6, 
                                                    bgcolor: '#e0e0e0', 
                                                    borderRadius: 3,
                                                    overflow: 'hidden'
                                                }}>
                                                    <Box sx={{
                                                        width: `${member.attendancePercentage || 0}%`,
                                                        height: '100%',
                                                        bgcolor: member.attendancePercentage > 80 ? COLORS.green : 
                                                                 member.attendancePercentage > 60 ? COLORS.saffron : '#f44336',
                                                        borderRadius: 3
                                                    }} />
                                                </Box>
                                                <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 30 }}>
                                                    {member.attendancePercentage || 0}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Chip
                                                    label={member.taskStats?.completed || 0}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: COLORS.navy,
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">📞</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleOpenDialog('assign-task', member)}
                                                    sx={{
                                                        color: COLORS.saffron,
                                                        borderColor: COLORS.saffron,
                                                        '&:hover': {
                                                            bgcolor: COLORS.saffron,
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    Assign Task
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}
        </Box>
    );

    // Resource Management Component
    const ResourceManagement = () => (
        <Box>
            <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                Resource Management
            </Typography>

            <Grid container spacing={2}>
                {resources.map((resource) => (
                    <Grid item xs={12} sm={6} md={4} key={resource._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{resource.name}</Typography>
                                <Typography color="textSecondary">Type: {resource.type}</Typography>
                                <Typography color="textSecondary">Quantity: {resource.quantity}</Typography>
                                <Typography color="textSecondary">
                                    Status: <Chip
                                        label={resource.status}
                                        size="small"
                                        color={resource.status === 'available' ? 'success' : 
                                               resource.status === 'maintenance' ? 'warning' : 'error'}
                                    />
                                </Typography>
                                {resource.lastMaintenance && (
                                    <Typography variant="body2" color="textSecondary">
                                        Last Maintenance: {format(new Date(resource.lastMaintenance), 'MMM dd, yyyy')}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // Budget Management Component
    const BudgetManagement = () => {
        if (!budget) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress style={{ color: COLORS.saffron }} />
                </Box>
            );
        }

        return (
            <Box>
                <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                    Budget Management
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Budget Overview</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Total Budget</Typography>
                                        <Typography variant="h5">{formatCurrency(budget.totalBudget)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Allocated</Typography>
                                        <Typography variant="h5">{formatCurrency(budget.allocated)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Spent</Typography>
                                        <Typography variant="h5">{formatCurrency(budget.spent)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Remaining</Typography>
                                        <Typography variant="h5">{formatCurrency(budget.remaining)}</Typography>
                                    </Grid>
                                </Grid>

                                <Box mt={2}>
                                    <Typography variant="body2" color="textSecondary">Budget Utilization</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(budget.spent / budget.totalBudget) * 100}
                                        style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.white }}
                                        sx={{
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: COLORS.saffron
                                            }
                                        }}
                                    />
                                    <Typography variant="caption">
                                        {((budget.spent / budget.totalBudget) * 100).toFixed(1)}% utilized
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                                {budget.categoryBreakdown?.map((category) => (
                                    <Box key={category.name} mb={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2">{category.name}</Typography>
                                            <Typography variant="body2">
                                                {formatCurrency(category.amount)}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(category.spent / category.amount) * 100}
                                            style={{ height: 4, borderRadius: 2 }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Project Management Component
    const ProjectManagement = () => (
        <Box>
            <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                Project Management
            </Typography>

            <Grid container spacing={2}>
                {projects.map((project) => (
                    <Grid item xs={12} md={6} key={project._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{project.name}</Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {project.description}
                                </Typography>
                                
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Status</Typography>
                                        <Chip
                                            label={project.status}
                                            size="small"
                                            style={{ backgroundColor: getStatusColor(project.status), color: 'white' }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Progress</Typography>
                                        <Box display="flex" alignItems="center">
                                            <LinearProgress
                                                variant="determinate"
                                                value={project.progress}
                                                style={{ flexGrow: 1, marginRight: 8 }}
                                            />
                                            <Typography variant="body2">{project.progress}%</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box mt={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        Budget: {formatCurrency(project.budget)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Start Date: {format(new Date(project.startDate), 'MMM dd, yyyy')}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        End Date: {format(new Date(project.endDate), 'MMM dd, yyyy')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // Complaint Handling Component
    const ComplaintHandling = () => (
        <Box>
            <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                Complaint Management
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: COLORS.lightSaffron }}>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Priority</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Submitted Date</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {complaints.map((complaint) => (
                            <TableRow key={complaint._id}>
                                <TableCell>{complaint.reportId || complaint._id.slice(-6)}</TableCell>
                                <TableCell>{complaint.title}</TableCell>
                                <TableCell>{complaint.category}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={complaint.priority}
                                        size="small"
                                        style={{ backgroundColor: getPriorityColor(complaint.priority), color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={complaint.status}
                                        size="small"
                                        style={{ backgroundColor: getStatusColor(complaint.status), color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpenDialog('view-complaint', complaint)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // Reports & Analytics Component
    const ReportsAnalytics = () => (
        <Box>
            <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                Reports & Analytics
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Monthly Task Completion</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData?.monthlyTaskData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="completed" fill={COLORS.green} />
                                    <Bar dataKey="pending" fill={COLORS.saffron} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Budget Trend</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={budget?.trendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="spent" stroke={COLORS.saffron} />
                                    <Line type="monotone" dataKey="allocated" stroke={COLORS.green} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    // Communication Component
    const Communication = () => (
        <Box>
            <Typography variant="h5" gutterBottom style={{ color: COLORS.navy }}>
                Communication Center
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Recent Messages</Typography>
                            <Box maxHeight="400px" overflow="auto">
                                {/* Mock messages - replace with real data */}
                                {[
                                    { id: 1, from: 'Municipal Head', message: 'Budget approval required for street cleaning project', time: '2 hours ago' },
                                    { id: 2, from: 'Team Lead A', message: 'Ward 5 sanitation task completed', time: '4 hours ago' },
                                    { id: 3, from: 'System', message: 'Monthly report due in 3 days', time: '1 day ago' }
                                ].map((msg) => (
                                    <Box key={msg.id} p={2} border={1} borderColor="grey.300" borderRadius={2} mb={1}>
                                        <Typography variant="subtitle2" style={{ color: COLORS.navy }}>
                                            {msg.from}
                                        </Typography>
                                        <Typography variant="body2">{msg.message}</Typography>
                                        <Typography variant="caption" color="textSecondary">{msg.time}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<MessageIcon />}
                                    style={{ borderColor: COLORS.saffron, color: COLORS.saffron }}
                                >
                                    Send Announcement
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<ReportIcon />}
                                    style={{ borderColor: COLORS.green, color: COLORS.green }}
                                >
                                    Generate Report
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<PeopleIcon />}
                                    style={{ borderColor: COLORS.navy, color: COLORS.navy }}
                                >
                                    Staff Meeting
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <DashboardOverview />;
            case 1:
                return <TaskManagement />;
            case 2:
                return <StaffManagement />;
            case 3:
                return <ResourceManagement />;
            case 4:
                return <BudgetManagement />;
            case 5:
                return <ProjectManagement />;
            case 6:
                return <ComplaintHandling />;
            case 7:
                return <ReportsAnalytics />;
            case 8:
                return <ReportProgressTracking />;
            case 9:
                return <Communication />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <Container maxWidth="xl">
            <Box py={4}>
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4,
                    p: 3,
                    background: `linear-gradient(135deg, ${COLORS.saffron} 0%, ${COLORS.navy} 100%)`,
                    borderRadius: 3,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <Box>
                        <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            mb: 1, 
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            fontSize: { xs: '1.8rem', md: '2.5rem' }
                        }}>
                            Department Head Dashboard
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            opacity: 0.95,
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            Health Services Department
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ 
                            mb: 1, 
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                            fontWeight: 'medium'
                        }}>
                            Welcome, {user?.name || 'Department Head'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            opacity: 0.9,
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </Typography>
                    </Box>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Navigation Tabs */}
                <Paper elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            bgcolor: COLORS.lightSaffron,
                            '& .MuiTab-root': {
                                minHeight: 72,
                                fontWeight: 'medium',
                                fontSize: '0.9rem',
                                color: COLORS.navy,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    color: COLORS.navy,
                                    fontWeight: 'bold'
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.2rem',
                                mb: 0.5
                            }
                        }}
                    >
                        <Tab icon={<DashboardIcon />} label="OVERVIEW" />
                        <Tab icon={<TaskIcon />} label="TASKS" />
                        <Tab icon={<PeopleIcon />} label="STAFF" />
                        <Tab icon={<ResourceIcon />} label="RESOURCES" />
                        <Tab icon={<BudgetIcon />} label="BUDGET" />
                        <Tab icon={<ProjectIcon />} label="PROJECTS" />
                        <Tab icon={<ComplaintIcon />} label="COMPLAINTS" />
                        <Tab icon={<ReportIcon />} label="REPORTS" />
                        <Tab icon={<TimelineIcon />} label="REPORT PROGRESS" />
                        <Tab icon={<MessageIcon />} label="COMMUNICATION" />
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                <Box sx={{ 
                    bgcolor: '#fafafa', 
                    borderRadius: 2, 
                    p: 3,
                    minHeight: '500px'
                }}>
                    {renderTabContent()}
                </Box>

                {/* Action Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => { handleOpenDialog('view-task', selectedItem); handleMenuClose(); }}>
                        <ViewIcon fontSize="small" style={{ marginRight: 8 }} />
                        View Details
                    </MenuItem>
                    <MenuItem onClick={() => { handleOpenDialog('edit-task', selectedItem); handleMenuClose(); }}>
                        <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                        Edit Task
                    </MenuItem>
                    <MenuItem onClick={() => { handleOpenDialog('update-task-status', selectedItem); handleMenuClose(); }}>
                        <Schedule fontSize="small" style={{ marginRight: 8 }} />
                        Update Status
                    </MenuItem>
                </Menu>

                {/* Dialog for Forms */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {dialogType === 'create-task' && 'Create New Task'}
                        {dialogType === 'create-staff' && 'Add Staff Member'}
                        {dialogType === 'assign-task' && `Assign Task to ${selectedItem?.user?.name || selectedItem?.name}`}
                        {dialogType === 'update-task-status' && 'Update Task Status'}
                        {dialogType === 'view-task' && 'Task Details'}
                        {dialogType === 'view-staff' && 'Staff Details'}
                        {dialogType === 'view-complaint' && 'Complaint Details'}
                    </DialogTitle>
                    <DialogContent>
                        {dialogType === 'create-task' && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Task Title"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Description"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            value={formData.priority || ''}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <MenuItem value="low">Low</MenuItem>
                                            <MenuItem value="medium">Medium</MenuItem>
                                            <MenuItem value="high">High</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Deadline"
                                        value={formData.deadline || ''}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Assign To (Staff ID or Name)"
                                        value={formData.assignedTo || ''}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {dialogType === 'assign-task' && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ p: 2, bgcolor: COLORS.saffron + '10', borderRadius: 2, mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: COLORS.navy, mb: 1 }}>
                                            Assigning Task to: {selectedItem?.user?.name || selectedItem?.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Department: {selectedItem?.department} • Role: {selectedItem?.position}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Task Title"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Task Description"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        margin="normal"
                                        multiline
                                        rows={3}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            value={formData.priority || 'medium'}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            label="Priority"
                                        >
                                            <MenuItem value="low">Low</MenuItem>
                                            <MenuItem value="medium">Medium</MenuItem>
                                            <MenuItem value="high">High</MenuItem>
                                            <MenuItem value="urgent">Urgent</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Deadline"
                                        type="date"
                                        value={formData.deadline || ''}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Additional Notes (Optional)"
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        margin="normal"
                                        multiline
                                        rows={2}
                                        placeholder="Any specific instructions or which reports this task will address..."
                                    />
                                </Grid>
                                
                                {/* Pending Reports Section */}
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" sx={{ 
                                            color: COLORS.navy, 
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            📋 Pending Reports to Address
                                        </Typography>
                                        
                                        {pendingReports.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                textAlign: 'center', 
                                                py: 2,
                                                fontStyle: 'italic' 
                                            }}>
                                                No pending reports at the moment
                                            </Typography>
                                        ) : (
                                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                {pendingReports.map((report, index) => (
                                                    <Card key={report._id} sx={{ 
                                                        mb: 1, 
                                                        p: 2, 
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': {
                                                            bgcolor: COLORS.saffron + '10',
                                                            borderColor: COLORS.saffron
                                                        }
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ 
                                                                    fontWeight: 600, 
                                                                    color: COLORS.navy,
                                                                    mb: 1
                                                                }}>
                                                                    {report.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    {report.description}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    <Chip 
                                                                        label={report.category} 
                                                                        size="small" 
                                                                        sx={{ bgcolor: COLORS.green, color: 'white' }}
                                                                    />
                                                                    <Chip 
                                                                        label={report.priority} 
                                                                        size="small" 
                                                                        sx={{ 
                                                                            bgcolor: report.priority === 'Critical' || report.priority === 'High' ? '#f44336' : 
                                                                                     report.priority === 'Medium' ? COLORS.saffron : 
                                                                                     '#4caf50',
                                                                            color: 'white'
                                                                        }}
                                                                    />
                                                                    <Chip 
                                                                        label={report.status.charAt(0).toUpperCase() + report.status.slice(1)} 
                                                                        size="small" 
                                                                        sx={{ 
                                                                            bgcolor: report.status === 'submitted' ? COLORS.saffron : 
                                                                                     report.status === 'acknowledged' ? COLORS.navy : 
                                                                                     '#757575',
                                                                            color: 'white'
                                                                        }}
                                                                    />
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        📅 {new Date(report.createdAt).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                                {report.reportedBy && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                        👤 Reported by: {report.reportedBy.name}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                ))}
                                            </Box>
                                        )}
                                        
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            mt: 2, 
                                            display: 'block',
                                            textAlign: 'center',
                                            fontStyle: 'italic'
                                        }}>
                                            💡 These reports can be addressed as part of this task assignment
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        )}

                        {dialogType === 'create-staff' && (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Employee ID"
                                        value={formData.employeeId || ''}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Position"
                                        value={formData.position || ''}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Address"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        margin="normal"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {dialogType === 'update-task-status' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Task Status</InputLabel>
                                <Select
                                    value={formData.status || ''}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="assigned">Assigned</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        {dialogType === 'view-task' && selectedItem && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">{selectedItem.title}</Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {selectedItem.description}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Status</Typography>
                                    <Chip 
                                        label={selectedItem.status} 
                                        sx={{ bgcolor: getStatusColor(selectedItem.status), color: 'white' }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Priority</Typography>
                                    <Chip 
                                        label={selectedItem.priority} 
                                        sx={{ bgcolor: getPriorityColor(selectedItem.priority), color: 'white' }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Assigned To</Typography>
                                    <Typography>{selectedItem.assignedTo}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Deadline</Typography>
                                    <Typography>
                                        {selectedItem.deadline ? format(new Date(selectedItem.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}

                        {dialogType === 'view-staff' && selectedItem && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">{selectedItem.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {selectedItem.position}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                                    <Typography>{selectedItem.employeeId}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Status</Typography>
                                    <Typography>{selectedItem.status}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                                    <Typography>{selectedItem.phone}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Email</Typography>
                                    <Typography>{selectedItem.email}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary">Address</Typography>
                                    <Typography>{selectedItem.address}</Typography>
                                </Grid>
                            </Grid>
                        )}

                        {dialogType === 'view-complaint' && selectedItem && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">{selectedItem.title}</Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {selectedItem.description}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Category</Typography>
                                    <Typography>{selectedItem.category}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Priority</Typography>
                                    <Chip 
                                        label={selectedItem.priority} 
                                        sx={{ bgcolor: getPriorityColor(selectedItem.priority), color: 'white' }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Status</Typography>
                                    <Chip 
                                        label={selectedItem.status} 
                                        sx={{ bgcolor: getStatusColor(selectedItem.status), color: 'white' }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Submitted Date</Typography>
                                    <Typography>
                                        {format(new Date(selectedItem.createdAt), 'MMM dd, yyyy')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary">
                            Cancel
                        </Button>
                        {!dialogType.startsWith('view-') && (
                            <Button 
                                onClick={handleFormSubmit} 
                                style={{ backgroundColor: COLORS.saffron, color: 'white' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={20} /> : 'Save'}
                            </Button>
                        )}
                        {dialogType.startsWith('view-') && (
                            <Button onClick={handleCloseDialog} style={{ backgroundColor: COLORS.navy, color: 'white' }}>
                                Close
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default DepartmentOfficerDashboard;