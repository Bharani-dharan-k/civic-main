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
import TestDashboardAPI from '../debug/TestDashboardAPI';

// India Flag Colors
const COLORS = {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navy: '#000080',
    darkGreen: '#0F5132',
    lightSaffron: '#FFB366',
    // Additional theme colors
    saffronLight: '#FFB366',
    saffronDark: '#E67300',
    greenLight: '#26A65B',
    greenDark: '#0B4D04',
    border: '#000080'
};

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

const DepartmentOfficerDashboard = () => {
    // Main container style with Indian flag theme
    return (
        <Box sx={styles.container}>
            {/* Enhanced Header with Indian flag theme */}
            <Paper sx={styles.header} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography sx={styles.pageTitle}>
                            Department Head Dashboard
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                sx={{ 
                                    color: COLORS.navy,
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <PeopleIcon sx={{ color: COLORS.saffronDark }} />
                                Welcome, {user?.name || 'Department Head'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        '& .MuiButton-root': {
                            ...styles.button,
                            minWidth: 'auto',
                            py: 1
                        }
                    }}>
                        <Button 
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog('create-task')}
                        >
                            New Task
                        </Button>
                        <Button 
                            startIcon={<Message />}
                            onClick={() => handleOpenDialog('send-message')}
                        >
                            Message
                        </Button>
                    </Box>
                </Box>
                {/* Decorative elements */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '150px',
                    height: '150px',
                    background: `radial-gradient(circle, ${COLORS.saffronLight}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${COLORS.greenLight}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
            </Paper>

            {/* Tabs with Indian theme */}
            <Paper sx={styles.tabs}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: COLORS.saffron
                        }
                    }}
                >
                    <Tab label="Dashboard" sx={styles.tab} icon={<DashboardIcon />} />
                    <Tab label="Tasks" sx={styles.tab} icon={<TaskIcon />} />
                    <Tab label="Staff" sx={styles.tab} icon={<PeopleIcon />} />
                    <Tab label="Resources" sx={styles.tab} icon={<ResourceIcon />} />
                    <Tab label="Budget" sx={styles.tab} icon={<BudgetIcon />} />
                    <Tab label="Projects" sx={styles.tab} icon={<ProjectIcon />} />
                    <Tab label="Complaints" sx={styles.tab} icon={<ComplaintIcon />} />
                </Tabs>
            </Paper>

            {/* Main content */}
            <Box sx={{ p: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {activeTab === 0 && <DashboardOverview />}
                {activeTab === 1 && <TasksSection />}
                {activeTab === 2 && <StaffSection />}
                {activeTab === 3 && <ResourcesSection />}
                {activeTab === 4 && <BudgetSection />}
                {activeTab === 5 && <ProjectsSection />}
                {activeTab === 6 && <ComplaintsSection />}
            </Box>

            {/* Dialogs */}
            {openDialog && (
                <FormDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    type={dialogType}
                    data={formData}
                    onSubmit={handleFormSubmit}
                />
            )}
        </Box>
    );
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState(null);

    // Custom styles for Indian flag theme with enhanced design
    const styles = {
        container: {
            background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}20 100%)`,
            minHeight: '100vh',
            padding: '20px',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(to right, ${COLORS.saffron}, ${COLORS.white}, ${COLORS.green})`
            }
        },
        header: {
            background: `linear-gradient(135deg, ${COLORS.saffron}40 0%, ${COLORS.white} 50%, ${COLORS.green}40 100%)`,
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: `2px solid ${COLORS.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: COLORS.navy
            }
        },
        card: {
            border: `2px solid ${COLORS.border}`,
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
            }
        },
        saffronCard: {
            background: `linear-gradient(135deg, ${COLORS.saffron}40 0%, ${COLORS.saffronLight} 100%)`,
            color: COLORS.navy,
            '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.saffron}50 0%, ${COLORS.saffronLight} 100%)`
            }
        },
        whiteCard: {
            background: COLORS.white,
            color: COLORS.navy,
            '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}10 100%)`
            }
        },
        greenCard: {
            background: `linear-gradient(135deg, ${COLORS.green}90 0%, ${COLORS.greenLight} 100%)`,
            color: COLORS.white,
            '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenLight} 100%)`
            }
        },
        tabs: {
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            marginBottom: '24px',
            border: `2px solid ${COLORS.border}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            '& .MuiTabs-flexContainer': {
                borderBottom: `2px solid ${COLORS.saffronLight}`
            }
        },
        tab: {
            color: COLORS.navy,
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
                color: COLORS.saffron,
                background: `linear-gradient(to bottom, ${COLORS.saffronLight}20 0%, transparent 100%)`
            },
            '&:hover': {
                color: COLORS.saffronDark,
                background: `linear-gradient(to bottom, ${COLORS.saffronLight}10 0%, transparent 100%)`
            }
        },
        button: {
            background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.border} 100%)`,
            color: COLORS.white,
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.saffronDark} 0%, ${COLORS.saffron} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 153, 51, 0.3)'
            }
        },
        chartCard: {
            background: COLORS.white,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: `2px solid ${COLORS.border}`,
            '&:hover': {
                boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
            }
        },
        pageTitle: {
            fontSize: '2.5rem',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.saffronDark} 100%)`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
        }
    };

    // Data states
    const [dashboardData, setDashboardData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [resources, setResources] = useState([]);
    const [projects, setProjects] = useState([]);
    const [budget, setBudget] = useState(null);
    const [complaints, setComplaints] = useState([]);

    // Form states
    const [formData, setFormData] = useState({});

    // API Helper function
    const apiCall = async (endpoint, method = 'GET', body = null) => {
        try {
            const token = localStorage.getItem('token');
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

            const response = await fetch(`${API_BASE_URL}/department-head${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
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
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress style={{ color: COLORS.saffron }} />
                </Box>
            );
        }

        return (
            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                ...styles.card,
                                ...styles.saffronCard
                            }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center">
                                        <TaskIcon style={{ color: COLORS.navy, marginRight: 8 }} />
                                        <Box>
                                            <Typography variant="h4" style={{ color: COLORS.navy }}>
                                                {dashboardData?.overview?.tasks?.total || 0}
                                            </Typography>
                                            <Typography style={{ color: COLORS.navy }}>Total Tasks</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                ...styles.card,
                                ...styles.whiteCard
                            }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center">
                                        <PeopleIcon style={{ color: COLORS.navy, marginRight: 8 }} />
                                        <Box>
                                            <Typography variant="h4" style={{ color: COLORS.navy }}>
                                                {dashboardData?.overview?.staff?.total || 0}
                                            </Typography>
                                            <Typography style={{ color: COLORS.navy }}>Staff Members</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                ...styles.card,
                                ...styles.greenCard
                            }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center">
                                        <ProjectIcon style={{ color: COLORS.white, marginRight: 8 }} />
                                        <Box>
                                            <Typography variant="h4" style={{ color: COLORS.white }}>
                                                {dashboardData?.overview?.projects?.active || 0}
                                            </Typography>
                                            <Typography style={{ color: COLORS.white }}>Active Projects</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                ...styles.card,
                                ...styles.saffronCard
                            }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center">
                                        <BudgetIcon style={{ color: COLORS.navy, marginRight: 8 }} />
                                        <Box>
                                            <Typography variant="h4" style={{ color: COLORS.navy }}>
                                                ₹{dashboardData?.budget?.totalBudget || 0}
                                            </Typography>
                                            <Typography style={{ color: COLORS.navy }}>Budget Used</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Task Status Chart */}
                <Grid item xs={12} md={6}>
                    <Card sx={styles.chartCard}>
                        <CardContent>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: COLORS.navy,
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <BarChart sx={{ color: COLORS.saffronDark }} />
                                    Task Status Distribution
                                </Typography>
                            </Box>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={dashboardData.taskStatusData || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {(dashboardData.taskStatusData || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom style={{ color: COLORS.navy }}>
                                Recent Activities
                            </Typography>
                            <Box maxHeight="300px" overflow="auto">
                                {(dashboardData.recentTasks || []).map((task, index) => (
                                    <Box key={index} display="flex" alignItems="center" mb={1}>
                                        <TaskIcon style={{ color: COLORS.saffron, marginRight: 8, fontSize: 18 }} />
                                        <Box flex={1}>
                                            <Typography variant="body2" style={{ color: COLORS.navy }}>
                                                {task.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Assigned to: {task.assignedTo?.name} - Status: {task.status}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
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
                <Typography variant="h5" style={{ color: COLORS.navy }}>Staff Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create-staff')}
                    style={{ backgroundColor: COLORS.green, color: 'white' }}
                >
                    Add Staff Member
                </Button>
            </Box>

            <Grid container spacing={2}>
                {staff.map((member) => (
                    <Grid item xs={12} sm={6} md={4} key={member._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{member.name}</Typography>
                                <Typography color="textSecondary">{member.position}</Typography>
                                <Typography color="textSecondary">ID: {member.employeeId}</Typography>
                                <Typography color="textSecondary">Phone: {member.phone}</Typography>
                                <Box mt={1}>
                                    <Chip
                                        label={member.status}
                                        size="small"
                                        color={member.status === 'active' ? 'success' : 'default'}
                                    />
                                </Box>
                                <Box mt={2} display="flex" gap={1}>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpenDialog('view-staff', member)}
                                        startIcon={<ViewIcon />}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpenDialog('edit-staff', member)}
                                        startIcon={<EditIcon />}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
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
                return <Communication />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <Container maxWidth="xl">
            <Box py={3}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" style={{ color: COLORS.navy, fontWeight: 'bold' }}>
                        Department Head Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Welcome, {user?.name || 'Department Head'}
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Navigation Tabs */}
                <Paper elevation={2} style={{ marginBottom: 24 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        style={{ backgroundColor: COLORS.lightSaffron }}
                    >
                        <Tab icon={<DashboardIcon />} label="Overview" />
                        <Tab icon={<TaskIcon />} label="Tasks" />
                        <Tab icon={<PeopleIcon />} label="Staff" />
                        <Tab icon={<ResourceIcon />} label="Resources" />
                        <Tab icon={<BudgetIcon />} label="Budget" />
                        <Tab icon={<ProjectIcon />} label="Projects" />
                        <Tab icon={<ComplaintIcon />} label="Complaints" />
                        <Tab icon={<ReportIcon />} label="Reports" />
                        <Tab icon={<MessageIcon />} label="Communication" />
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                <Box>
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
            <TestDashboardAPI />
        </Container>
    );
};

export default DepartmentOfficerDashboard;