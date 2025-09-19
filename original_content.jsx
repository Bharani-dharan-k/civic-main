import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  IconButton,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Badge,
  Container,
  CircularProgress,
  Skeleton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Menu,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as ReportsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  BarChart as AnalyticsIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  WorkOutline as WorkIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Map as MapIcon,
  MarkAsUnread as UnreadIcon,
  DoneAll as ReadAllIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

// Fix for default markers in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icons for different statuses
const createCustomIcon = (status) => {
  const colors = {
    submitted: '#f59e0b',
    acknowledged: '#3b82f6',
    assigned: '#8b5cf6',
    in_progress: '#f97316',
    resolved: '#10b981',
    rejected: '#ef4444',
    closed: '#6b7280'
  };

  const color = colors[status] || '#6b7280';
  
  return new L.DivIcon({
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px; 
          height: 8px; 
          background-color: white; 
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const drawerWidth = 260;

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State for different sections
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    inProgressReports: 0,
    rejectedReports: 0,
    avgResolutionTime: 0,
    topCategories: [],
    totalUsers: 0,
    recentReports: 0,
    reportsByStatus: {},
    reportsByPriority: {},
    reportsByDistrict: {},
    reportsByMunicipality: {},
    usersByRole: {},
  });

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dialog states
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [categoryDialog, setCategoryDialog] = useState({ open: false, category: null, mode: 'create' });
  const [reportDialog, setReportDialog] = useState({ open: false, report: null, mode: 'view' });

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    district: '',
    municipality: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    priority: 'medium',
    color: '#3B82F6',
  });

  // District Head management states
  const [districtHeads, setDistrictHeads] = useState([]);
  const [districtHeadDialog, setDistrictHeadDialog] = useState({ open: false, districtHead: null, mode: 'create' });
  const [districtHeadForm, setDistrictHeadForm] = useState({
    districtName: '',
    email: '',
    password: '',
    showPassword: false,
  });
  const [districts] = useState([
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum',
    'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara',
    'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu',
    'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela-Kharsawan', 'Simdega',
    'West Singhbhum'
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'interactive-map', label: 'Interactive Map', icon: <MapIcon /> },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
    { id: 'district-heads', label: 'District Heads', icon: <AdminIcon /> },
    { id: 'reports', label: 'Report Management', icon: <ReportsIcon /> },
    { id: 'settings', label: 'System Settings', icon: <SettingsIcon /> },
  ];

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAnalytics(),
        loadUsers(),
        loadReports(),
        loadCategories(),
        loadDistrictHeads(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await API.get('/superadmin/analytics');
      const data = response.data.data;
      
      // Transform the new API response format
      const statusData = data.statusDistribution.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {});
      
      const categoryData = data.categoryDistribution.map(item => ({
        name: item.category,
        count: item.count,
        resolutionRate: Math.round(item.resolutionRate || 0)
      })).slice(0, 5); // Top 5 categories
      
      const priorityData = data.priorityDistribution.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {});
      
      setAnalytics({
        totalReports: data.overview.totalReports || 0,
        pendingReports: (statusData.submitted || 0) + (statusData.acknowledged || 0) + (statusData.assigned || 0),
        resolvedReports: statusData.resolved || 0,
        inProgressReports: statusData.in_progress || 0,
        rejectedReports: statusData.rejected || 0,
        avgResolutionTime: data.resolutionTimeStats.averageHours ? 
          Math.round(data.resolutionTimeStats.averageHours / 24 * 10) / 10 : 0, // Convert to days
        topCategories: categoryData,
        totalUsers: data.overview.totalUsers || 0,
        recentReports: data.recentActivity.newReports || 0,
        reportsByStatus: statusData,
        reportsByPriority: priorityData,
        usersByRole: {
          citizen: data.overview.totalCitizens || 0,
          worker: data.overview.totalWorkers || 0,
          admin: data.overview.totalAdmins || 0
        },
        monthlyTrends: data.monthlyTrends || [],
        geographicDistribution: data.geographicDistribution || [],
        userActivityStats: data.userActivityStats || [],
        performanceMetrics: data.performanceMetrics || {},
        resolutionTimeStats: data.resolutionTimeStats || {}
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      showSnackbar('Failed to load analytics data', 'error');
      setAnalytics({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        inProgressReports: 0,
        rejectedReports: 0,
        avgResolutionTime: 0,
        topCategories: [],
        totalUsers: 0,
        recentReports: 0,
        reportsByStatus: {},
        reportsByPriority: {},
        reportsByDistrict: {},
        reportsByMunicipality: {},
        usersByRole: {},
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.get('/superadmin/all-users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Failed to load users data', 'error');
      setUsers([]);
    }
  };

  const loadReports = async () => {
    try {
      const response = await API.get('/superadmin/reports?limit=50'); // Get more reports
      const reportsData = response.data.reports || response.data; // Handle different response structures
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Error loading reports:', error);
      showSnackbar('Failed to load reports data', 'error');
      setReports([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await API.get('/superadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      showSnackbar('Failed to load categories data', 'error');
      setCategories([]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Helper function to get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'submitted':
        return { color: 'info', icon: <AssignmentIcon />, label: 'Submitted', progress: 14 };
      case 'acknowledged':
        return { color: 'primary', icon: <ScheduleIcon />, label: 'Acknowledged', progress: 28 };
      case 'assigned':
        return { color: 'warning', icon: <WorkIcon />, label: 'Assigned', progress: 42 };
      case 'in_progress':
        return { color: 'warning', icon: <WorkIcon />, label: 'In Progress', progress: 70 };
      case 'resolved':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Resolved', progress: 100 };
      case 'rejected':
        return { color: 'error', icon: <CancelIcon />, label: 'Rejected', progress: 0 };
      case 'closed':
        return { color: 'default', icon: <CheckCircleIcon />, label: 'Closed', progress: 100 };
      default:
        return { color: 'default', icon: <AssignmentIcon />, label: 'Unknown', progress: 0 };
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, position: 'relative' }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -15, 
          right: { xs: 10, md: 50 }, 
          width: 70, 
          height: 70, 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='none' stroke='%23000080' stroke-width='1.5'/%3E%3Cg stroke='%23000080' stroke-width='1.5' fill='none'%3E%3C!-- 24 spokes of the Ashoka Chakra --%3E%3Cline x1='50' y1='5' x2='50' y2='95'/%3E%3Cline x1='5' y1='50' x2='95' y2='50'/%3E%3Cline x1='20' y1='20' x2='80' y2='80'/%3E%3Cline x1='20' y1='80' x2='80' y2='20'/%3E%3Cline x1='11' y1='31' x2='89' y2='69'/%3E%3Cline x1='11' y1='69' x2='89' y2='31'/%3E%3Cline x1='31' y1='11' x2='69' y2='89'/%3E%3Cline x1='31' y1='89' x2='69' y2='11'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          zIndex: 1
        }} />
        <Typography 
          variant="h3" 
          fontWeight="800" 
          sx={{ 
            color: '#1a1a1a',
            mb: 1,
            textShadow: '0 2px 8px rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.02em'
          }}
        >
          Super Admin Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#333333',
            fontWeight: 400,
            letterSpacing: '0.01em',
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)'
          }}
        >
          Welcome back, {user?.name || 'Admin'}! Serving भारत with pride and dedication.
        </Typography>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.9), rgba(255, 140, 0, 0.8))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 153, 51, 1), rgba(255, 140, 0, 0.9))',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                  ) : (
                    <Typography variant="h3" sx={{ 
                      color: 'white', 
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      mb: 0.5
                    }}>
                      {analytics.totalReports}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.98)',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                  }}>
                    Total Reports
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 64, 
                  height: 64,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}>
                  <ReportsIcon sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(0,0,0,0.1)' }} />
                  ) : (
                    <Typography variant="h3" sx={{ 
                      color: '#1a1a1a', 
                      fontWeight: 700,
                      textShadow: 'none',
                      mb: 0.5
                    }}>
                      {analytics.pendingReports}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ 
                    color: '#333333',
                    fontWeight: 500,
                    letterSpacing: '0.01em'
                  }}>
                    Pending Reports
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(0, 0, 0, 0.15)', 
                  width: 64, 
                  height: 64,
                  border: '2px solid rgba(0, 0, 0, 0.25)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                }}>
                  <NotificationsIcon sx={{ color: '#333333', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {analytics.totalUsers}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, rgba(19, 136, 8, 0.9), rgba(19, 136, 8, 0.8))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, rgba(19, 136, 8, 1), rgba(19, 136, 8, 0.9))',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                  ) : (
                    <Typography variant="h3" sx={{ 
                      color: 'white', 
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      mb: 0.5
                    }}>
                      {analytics.resolvedReports}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.98)',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                  }}>
                    Resolved Reports
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 64, 
                  height: 64,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}>
                  <AnalyticsIcon sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.15), #ffffff, rgba(19, 136, 8, 0.15))',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setUserForm({ name: '', email: '', password: '', role: '', district: '', municipality: '' });
                    setUserDialog({ open: true, user: null, mode: 'create' });
                  }}
                  fullWidth
                  sx={{ 
                    borderColor: '#FF9933', 
                    color: '#FF9933',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 153, 51, 0.1)', 
                      borderColor: '#FF9933' 
                    }
                  }}
                >
                  Create New Admin User
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCategoryForm({ name: '', description: '', priority: 'medium', color: '#3B82F6' });
                    setCategoryDialog({ open: true, category: null, mode: 'create' });
                  }}
                  fullWidth
                  sx={{ 
                    borderColor: '#138808', 
                    color: '#138808',
                    '&:hover': { 
                      backgroundColor: 'rgba(19, 136, 8, 0.1)', 
                      borderColor: '#138808' 
                    }
                  }}
                >
                  Add Report Category
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => setSelectedPage('analytics')}
                  fullWidth
                  sx={{ 
                    borderColor: '#FF9933', 
                    color: '#FF9933',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 153, 51, 0.1)', 
                      borderColor: '#FF9933' 
                    }
                  }}
                >
                  View System Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Issue Categories
              </Typography>
              <List>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <ListItem key={index}>
                      <Skeleton variant="text" width="100%" height={40} />
                    </ListItem>
                  ))
                ) : (
                  (analytics.topCategories || []).map((category, index) => (
                    <ListItem key={index} divider={index < analytics.topCategories.length - 1}>
                      <ListItemText
                        primary={category.name}
                        secondary={`${category.count} reports`}
                      />
                      <Chip
                        label={category.count}
                        color="primary"
                        size="small"
                      />
                    </ListItem>
                  ))
                )}
                {!loading && analytics.topCategories.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#666666' }} textAlign="center" py={2}>
                    No category data available
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* All Reports Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              All Reports ({reports.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadReports}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box>
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" gap={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                    <Skeleton variant="rectangular" width={100} height={20} />
                  </Box>
                </Card>
              ))}
            </Box>
          ) : reports.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666666' }} textAlign="center" py={4}>
              No reports found
            </Typography>
          ) : (
            <Box>
              {reports.slice(0, 10).map((report) => {
                const statusInfo = getStatusInfo(report.status);
                const priorityColor = getPriorityColor(report.priority);
                
                return (
                  <Card key={report._id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} sm={6} md={4}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: `${statusInfo.color}.main`, width: 40, height: 40 }}>
                              {statusInfo.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {report.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666666' }}>
                                {report.category} • {report.address?.substring(0, 30)}...
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid xs={12} sm={6} md={2}>
                          <Box>
                            <Chip 
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              icon={statusInfo.icon}
                              sx={{ mb: 1 }}
                            />
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={statusInfo.progress}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                                color={statusInfo.color}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {statusInfo.progress}%
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid xs={12} sm={6} md={2}>
                          <Box textAlign="center">
                            <Chip 
                              label={report.priority || 'Medium'}
                              color={priorityColor}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                              Priority
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid xs={12} sm={6} md={2}>
                          <Box textAlign="center">
                            <Typography variant="body2" fontWeight="medium">
                              {report.reportedBy?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid xs={12} sm={6} md={2}>
                          <Box display="flex" justifyContent="flex-end" gap={1}>
                            {report.assignedTo && (
                              <Chip 
                                label={`Worker: ${report.assignedTo}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Additional Progress Details */}
                      {report.status === 'in_progress' && (
                        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="caption" sx={{ color: '#666666' }} gutterBottom>
                            Progress Details:
                          </Typography>
                          <Box display="flex" gap={2} flexWrap="wrap">
                            {report.workerStartedAt && (
                              <Chip 
                                label={`Started: ${new Date(report.workerStartedAt).toLocaleDateString()}`}
                                size="small"
                                color="info"
                              />
                            )}
                            {report.estimatedResolutionTime && (
                              <Chip 
                                label={`Est. ${report.estimatedResolutionTime} days`}
                                size="small"
                                color="warning"
                              />
                            )}
                            {report.workProgressPhotos && report.workProgressPhotos.length > 0 && (
                              <Chip 
                                label={`${report.workProgressPhotos.length} Progress Photos`}
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {reports.length > 10 && (
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedPage('reports')}
                  >
                    View All {reports.length} Reports
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );

  // Analytics Component
  const AnalyticsPage = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'rgba(0, 0, 0, 0.8)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
            System Analytics
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'rgba(0, 0, 0, 0.7)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
            Comprehensive system performance and usage statistics.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.9), rgba(255, 140, 0, 0.8))' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {analytics.totalReports}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Reports
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ReportsIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {analytics.resolvedReports}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Resolved Reports
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {analytics.totalUsers}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {analytics.avgResolutionTime}d
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Avg Resolution Time
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ScheduleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Distribution */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Status Distribution
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.entries(analytics.reportsByStatus || {}).map(([status, count]) => {
                    const statusInfo = getStatusInfo(status);
                    const percentage = analytics.totalReports > 0 ? (count / analytics.totalReports * 100) : 0;
                    
                    return (
                      <Box key={status} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {statusInfo.icon}
                            <Typography variant="body2" fontWeight="medium">
                              {statusInfo.label}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {count} ({Math.round(percentage)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={statusInfo.color}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Distribution
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.entries(analytics.reportsByPriority || {}).map(([priority, count]) => {
                    const priorityColor = getPriorityColor(priority);
                    const percentage = analytics.totalReports > 0 ? (count / analytics.totalReports * 100) : 0;
                    
                    return (
                      <Box key={priority} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip 
                            label={priority || 'Medium'} 
                            color={priorityColor} 
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {count} reports ({Math.round(percentage)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={priorityColor}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories and Geography */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Report Categories
              </Typography>
              {loading ? (
                <Box>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" justify="space-between" mb={1}>
                        <Skeleton variant="text" width={120} />
                        <Skeleton variant="text" width={60} />
                      </Box>
                      <Skeleton variant="rectangular" height={8} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {analytics.topCategories.map((category, index) => {
                    const maxCount = Math.max(...analytics.topCategories.map(c => c.count));
                    const percentage = (category.count / maxCount) * 100;
                    
                    return (
                      <Box key={category.name} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {category.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              {category.count}
                            </Typography>
                            {category.resolutionRate !== undefined && (
                              <Chip
                                label={`${category.resolutionRate}% resolved`}
                                size="small"
                                color={category.resolutionRate > 70 ? 'success' : category.resolutionRate > 40 ? 'warning' : 'error'}
                              />
                            )}
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={index < 2 ? 'primary' : index < 4 ? 'secondary' : 'info'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Geographic Distribution
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : analytics.geographicDistribution?.length > 0 ? (
                <Box>
                  {analytics.geographicDistribution.slice(0, 8).map((location, index) => (
                    <Box key={location.location} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                        {location.location}
                      </Typography>
                      <Chip 
                        label={location.count} 
                        size="small" 
                        color={index < 3 ? 'primary' : 'default'}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No geographic data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Activity and Performance */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Activity by Role
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.entries(analytics.usersByRole || {}).map(([role, count]) => (
                    <Box key={role} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: role === 'citizen' ? 'primary.main' : role === 'worker' ? 'secondary.main' : 'success.main' }}>
                          {role === 'citizen' ? <PeopleIcon /> : role === 'worker' ? <WorkIcon /> : <AdminIcon />}
                        </Avatar>
                        <Typography variant="body2" textTransform="capitalize">
                          {role}s
                        </Typography>
                      </Box>
                      <Chip label={count} color="primary" size="small" />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  <Box mb={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Resolution Rate
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <LinearProgress
                        variant="determinate"
                        value={analytics.performanceMetrics?.overallResolutionRate || 0}
                        sx={{ flex: 1, height: 10, borderRadius: 5 }}
                        color={analytics.performanceMetrics?.overallResolutionRate > 70 ? 'success' : 
                               analytics.performanceMetrics?.overallResolutionRate > 40 ? 'warning' : 'error'}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(analytics.performanceMetrics?.overallResolutionRate || 0)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Resolution Statistics
                    </Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} mt={1}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="success.main">
                          {analytics.resolutionTimeStats?.totalResolved || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Resolved
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" color="warning.main">
                          {analytics.performanceMetrics?.pendingReports || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Still Pending
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  // User Management Component
  const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'rgba(0, 0, 0, 0.8)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
              User Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(0, 0, 0, 0.7)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
              Manage system users and their permissions.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setUserForm({ name: '', email: '', password: '', role: '', district: '', municipality: '' });
              setUserDialog({ open: true, user: null, mode: 'create' });
            }}
          >
            Add New User
          </Button>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3, background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(19, 136, 8, 0.2)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1 }}>
                        <PeopleIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Filter by Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="citizen">Citizens</MenuItem>
                    <MenuItem value="worker">Workers</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                    <MenuItem value="super_admin">Super Admins</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={12} md={5}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Chip 
                    label={`Total: ${users.length}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Filtered: ${filteredUsers.length}`} 
                    color="secondary" 
                  />
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadUsers}
                    disabled={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Skeleton variant="circular" width={48} height={48} />
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                      </Box>
                    </Box>
                    <Box display="flex" gap={1} mb={2}>
                      <Skeleton variant="rectangular" width={60} height={24} />
                      <Skeleton variant="rectangular" width={80} height={24} />
                    </Box>
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Skeleton variant="rectangular" width={32} height={32} />
                      <Skeleton variant="rectangular" width={32} height={32} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={6}>
                <Avatar sx={{ bgcolor: 'grey.100', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || roleFilter !== 'all' ? 'No users match your search' : 'No users found'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search criteria'
                    : 'Create your first user to get started'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers.map((user) => (
              <Grid xs={12} sm={6} md={4} key={user._id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: user.role === 'citizen' ? 'primary.main' : 
                                  user.role === 'worker' ? 'secondary.main' : 
                                  user.role === 'admin' ? 'success.main' : 'error.main'
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip 
                        label={user.role} 
                        size="small"
                        color={user.role === 'citizen' ? 'primary' : 
                               user.role === 'worker' ? 'secondary' : 
                               user.role === 'admin' ? 'success' : 'error'}
                      />
                      {user.district && (
                        <Chip 
                          label={user.district} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                      {user.lastLogin && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditUser(user)}
                        sx={{ bgcolor: 'action.hover' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteUser(user._id)}
                        sx={{ bgcolor: 'error.50', color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  };

  // District Head Management Component
  const DistrictHeadManagement = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          fontWeight="800" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.8)',
            mb: 1,
            textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)',
            letterSpacing: '-0.02em'
          }}
        >
          District Head Management
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.7)',
            fontWeight: 400,
            letterSpacing: '0.01em',
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)',
            mb: 3
          }}
        >
          Manage district heads across different regions.
        </Typography>

        {/* Add New District Head Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDistrictHeadDialog({ open: true, districtHead: null, mode: 'create' })}
          sx={{
            background: 'linear-gradient(45deg, #ff9933 0%, #ff6600 100%)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(255, 153, 51, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff6600 0%, #e55a00 100%)',
              boxShadow: '0 6px 20px rgba(255, 153, 51, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          Add New District Head
        </Button>
      </Box>

      {/* District Heads Table */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(19, 136, 8, 0.3)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        }
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(19, 136, 8, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundImage: 'linear-gradient(90deg, rgba(255, 153, 51, 0.8) 0%, rgba(255, 153, 51, 0.7) 100%)',
                  backdropFilter: 'blur(5px)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                    py: 2.5,
                  }
                }}>
                  <TableCell>District Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {districtHeads.map((districtHead, index) => (
                  <TableRow 
                    key={districtHead._id}
                    sx={{
                      backgroundColor: index % 2 === 0 
                        ? 'rgba(0, 0, 0, 0.02)' 
                        : 'rgba(0, 0, 0, 0.01)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(19, 136, 8, 0.05)',
                        transform: 'scale(1.005)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '& .MuiTableCell-root': {
                        color: 'rgba(0, 0, 0, 0.87)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        py: 2,
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {districtHead.districtName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem' }}>
                      {districtHead.email}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={districtHead.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={districtHead.isActive ? 'success' : 'default'}
                        sx={{
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {new Date(districtHead.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditDistrictHead(districtHead)}
                          title="Edit District Head"
                          sx={{
                            backgroundColor: 'rgba(19, 136, 8, 0.1)',
                            border: '1px solid rgba(19, 136, 8, 0.3)',
                            color: 'rgba(19, 136, 8, 0.8)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(19, 136, 8, 0.2)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteDistrictHead(districtHead._id)}
                          title="Delete District Head"
                          sx={{
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            color: 'rgba(244, 67, 54, 0.8)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {districtHeads.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={5} 
                      align="center" 
                      sx={{ 
                        py: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <AdminIcon sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.5)' }} />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontWeight: 600
                          }}
                        >
                          No district heads found
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.6)',
                            textAlign: 'center'
                          }}
                        >
                          Click "Add New District Head" to create the first district head account
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );

  // Report Management Component
  const ReportManagement = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          fontWeight="800" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.8)',
            mb: 1,
            textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)',
            letterSpacing: '-0.02em'
          }}
        >
          Report Management
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.7)',
            fontWeight: 400,
            letterSpacing: '0.01em',
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
          }}
        >
          Monitor and manage citizen reports across the system.
        </Typography>
      </Box>

      <Card sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(19, 136, 8, 0.3)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        }
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(19, 136, 8, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundImage: 'linear-gradient(90deg, rgba(255, 153, 51, 0.8) 0%, rgba(255, 153, 51, 0.7) 100%)',
                  backdropFilter: 'blur(5px)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                    py: 2.5,
                  }
                }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report, index) => (
                  <TableRow 
                    key={report._id}
                    sx={{
                      backgroundColor: index % 2 === 0 
                        ? 'rgba(0, 0, 0, 0.02)' 
                        : 'rgba(0, 0, 0, 0.01)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(19, 136, 8, 0.05)',
                        transform: 'scale(1.005)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '& .MuiTableCell-root': {
                        color: 'rgba(0, 0, 0, 0.87)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        py: 2,
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.category} 
                        size="small" 
                        sx={{
                          backgroundColor: 'rgba(19, 136, 8, 0.1)',
                          color: 'rgba(19, 136, 8, 0.8)',
                          fontWeight: 500,
                          border: '1px solid rgba(19, 136, 8, 0.3)',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={report.status === 'resolved' ? 'success' : 'warning'}
                        sx={{
                          fontWeight: 600,
                          color: 'white',
                          textTransform: 'capitalize',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReport(report)}
                          title="View Report"
                          sx={{
                            backgroundColor: 'rgba(19, 136, 8, 0.1)',
                            border: '1px solid rgba(19, 136, 8, 0.3)',
                            color: 'rgba(19, 136, 8, 0.8)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(19, 136, 8, 0.2)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditReport(report)}
                          title="Edit Report"
                          sx={{
                            backgroundColor: 'rgba(19, 136, 8, 0.1)',
                            border: '1px solid rgba(19, 136, 8, 0.3)',
                            color: 'rgba(19, 136, 8, 0.8)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(19, 136, 8, 0.2)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={5} 
                      align="center" 
                      sx={{ 
                        py: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ReportsIcon sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.5)' }} />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontWeight: 600
                          }}
                        >
                          No reports found
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.6)',
                            textAlign: 'center'
                          }}
                        >
                          Reports will appear here when citizens submit them
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );

  // System Settings Component
  const SystemSettings = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'rgba(0, 0, 0, 0.8)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
        System Settings
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'rgba(0, 0, 0, 0.7)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
        Configure system-wide settings and preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(19, 136, 8, 0.2)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Category Management</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCategoryForm({ name: '', description: '', priority: 'medium', color: '#3B82F6' });
                    setCategoryDialog({ open: true, category: null, mode: 'create' });
                  }}
                >
                  Add Category
                </Button>
              </Box>
              <List>
                {categories.map((category) => (
                  <ListItem
                    key={category._id}
                    secondaryAction={
                      <Box>
                        <IconButton size="small" onClick={() => handleEditCategory(category)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCategory(category._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={category.name}
                      secondary={category.description}
                    />
                  </ListItem>
                ))}
                {categories.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No categories found
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Send email notifications for new reports"
                  />
                  <Switch />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Auto Assignment"
                    secondary="Automatically assign reports to departments"
                  />
                  <Switch />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Public Dashboard"
                    secondary="Allow public access to dashboard statistics"
                  />
                  <Switch />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  // Interactive Map Component
  const InteractiveMapPage = () => {
    const [mapReports, setMapReports] = useState([]);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapFilters, setMapFilters] = useState({
      status: 'all',
      category: 'all',
      timeRange: 'all'
    });
    const [mapStats, setMapStats] = useState({
      totalReports: 0,
      activeReports: 0,
      resolvedToday: 0,
      avgResolutionTime: 0
    });

    useEffect(() => {
      loadMapData();
    }, []);

    const loadMapData = async () => {
      try {
        setMapLoading(true);
        const [reportsResponse, analyticsResponse] = await Promise.all([
          API.get('/superadmin/reports?limit=100'),
          API.get('/superadmin/analytics')
        ]);

        const reportsData = reportsResponse.data.reports || [];
        const analyticsData = analyticsResponse.data.data;

        // Filter reports with valid coordinates
        const validReports = reportsData.filter(report => 
          report.location && 
          report.location.coordinates && 
          Array.isArray(report.location.coordinates) &&
          report.location.coordinates.length === 2 &&
          !isNaN(report.location.coordinates[0]) &&
          !isNaN(report.location.coordinates[1])
        );

        setMapReports(validReports);
        setMapStats({
          totalReports: analyticsData.overview.totalReports,
          activeReports: analyticsData.performanceMetrics.pendingReports,
          resolvedToday: analyticsData.recentActivity.resolvedReports,
          avgResolutionTime: analyticsData.resolutionTimeStats.averageHours ? 
            Math.round(analyticsData.resolutionTimeStats.averageHours / 24 * 10) / 10 : 0
        });
      } catch (error) {
        console.error('Error loading map data:', error);
        showSnackbar('Failed to load map data', 'error');
      } finally {
        setMapLoading(false);
      }
    };

    // Filter reports based on current filters
    const filteredMapReports = mapReports.filter(report => {
      if (mapFilters.status !== 'all' && report.status !== mapFilters.status) {
        return false;
      }
      if (mapFilters.category !== 'all' && report.category !== mapFilters.category) {
        return false;
      }
      if (mapFilters.timeRange !== 'all') {
        const reportDate = new Date(report.createdAt);
        const now = new Date();
        const daysDiff = (now - reportDate) / (1000 * 60 * 60 * 24);
        
        switch (mapFilters.timeRange) {
          case 'today':
            if (daysDiff > 1) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }
      return true;
    });

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Interactive Map
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Real-time visualization of all system reports on map
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadMapData}
            disabled={mapLoading}
          >
            Refresh Map
          </Button>
        </Box>

        {/* Map Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {mapStats.totalReports}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Total Reports
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <MapIcon sx={{ color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {filteredMapReports.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Visible on Map
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <ViewIcon sx={{ color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {mapStats.activeReports}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Active Reports
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <AssignmentIcon sx={{ color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {mapStats.avgResolutionTime}d
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Avg Resolution
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <ScheduleIcon sx={{ color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Map Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Map Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={mapFilters.status}
                    label="Status"
                    onChange={(e) => setMapFilters({...mapFilters, status: e.target.value})}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="acknowledged">Acknowledged</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={mapFilters.category}
                    label="Category"
                    onChange={(e) => setMapFilters({...mapFilters, category: e.target.value})}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {analytics.topCategories.map(category => (
                      <MenuItem key={category.name} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={mapFilters.timeRange}
                    label="Time Range"
                    onChange={(e) => setMapFilters({...mapFilters, timeRange: e.target.value})}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setMapFilters({ status: 'all', category: 'all', timeRange: 'all' })}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">
                System Reports Map ({filteredMapReports.length} reports)
              </Typography>
              <Chip 
                label={mapLoading ? 'Loading...' : 'Live Data'} 
                color={mapLoading ? 'warning' : 'success'}
                size="small"
              />
            </Box>
            
            {mapLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: '600px', position: 'relative', borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <MapContainer
                  center={[20.5937, 78.9629]} // Center of India
                  zoom={5}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {filteredMapReports.map((report) => {
                    // Parse coordinates
                    let lat, lng;
                    try {
                      if (report.location?.coordinates) {
                        if (typeof report.location.coordinates === 'string') {
                          const coords = report.location.coordinates.split(',').map(c => parseFloat(c.trim()));
                          lat = coords[0];
                          lng = coords[1];
                        } else if (Array.isArray(report.location.coordinates)) {
                          lat = parseFloat(report.location.coordinates[0]);
                          lng = parseFloat(report.location.coordinates[1]);
                        }
                      }
                    } catch (error) {
                      console.warn('Invalid coordinates for report:', report._id);
                      return null;
                    }

                    // Skip if coordinates are invalid
                    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                      return null;
                    }

                    const statusInfo = getStatusInfo(report.status);

                    return (
                      <Marker
                        key={report._id}
                        position={[lat, lng]}
                        icon={createCustomIcon(report.status)}
                      >
                        <Popup maxWidth={300}>
                          <Box sx={{ p: 1, maxWidth: 280 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {report.title || 'Report'}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              {statusInfo.icon}
                              <Chip
                                label={statusInfo.label}
                                color={statusInfo.color}
                                size="small"
                              />
                            </Box>

                            {report.category && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>Category:</strong> {report.category}
                              </Typography>
                            )}

                            {report.priority && (
                              <Box mb={1}>
                                <Chip
                                  label={`${report.priority} Priority`}
                                  color={getPriorityColor(report.priority)}
                                  size="small"
                                />
                              </Box>
                            )}

                            {report.description && (
                              <Typography variant="body2" sx={{ mb: 1, maxHeight: 60, overflow: 'hidden' }}>
                                {report.description.length > 100 ? 
                                  `${report.description.substring(0, 100)}...` : 
                                  report.description
                                }
                              </Typography>
                            )}

                            {report.location?.address && (
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                📍 {report.location.address}
                              </Typography>
                            )}

                            {report.submittedAt && (
                              <Typography variant="caption" color="text.secondary">
                                📅 {format(new Date(report.submittedAt), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                            )}
                          </Box>
                        </Popup>
                      </Marker>
                    );
                  }).filter(Boolean)}
                </MapContainer>

                {/* Map Controls Overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  bgcolor: 'white', 
                  borderRadius: 1, 
                  p: 1,
                  boxShadow: 2,
                  zIndex: 1000
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing {filteredMapReports.filter(r => {
                      if (!r.location?.coordinates) return false;
                      try {
                        let lat, lng;
                        if (typeof r.location.coordinates === 'string') {
                          const coords = r.location.coordinates.split(',').map(c => parseFloat(c.trim()));
                          lat = coords[0];
                          lng = coords[1];
                        } else if (Array.isArray(r.location.coordinates)) {
                          lat = parseFloat(r.location.coordinates[0]);
                          lng = parseFloat(r.location.coordinates[1]);
                        }
                        return lat && lng && !isNaN(lat) && !isNaN(lng);
                      } catch {
                        return false;
                      }
                    }).length} of {filteredMapReports.length} reports
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  };

  // Helper functions
  const handleEditUser = (user) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      district: user.district || '',
      municipality: user.municipality || ''
    });
    setUserDialog({ open: true, user, mode: 'edit' });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await API.delete(`/superadmin/delete-user/${userId}`);
      
      if (response.data.success) {
        showSnackbar('User deleted successfully', 'success');
        await loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryForm(category);
    setCategoryDialog({ open: true, category, mode: 'edit' });
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await API.delete(`/superadmin/categories/${categoryId}`);
      await loadCategories();
      showSnackbar('Category deleted successfully');
    } catch (error) {
      showSnackbar('Error deleting category', 'error');
    }
  };

  const handleSaveUser = async () => {
    try {
      // Validation
      if (!userForm.name || !userForm.email || !userForm.role) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      if (userDialog.mode === 'create' && !userForm.password) {
        showSnackbar('Password is required for new users', 'error');
        return;
      }

      if (userDialog.mode === 'create') {
        const response = await API.post('/superadmin/create-admin', userForm);
        if (response.data.success) {
          showSnackbar('User created successfully', 'success');
        }
      } else {
        const updateData = { ...userForm };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password for updates
        }
        const response = await API.put(`/superadmin/update-user/${userDialog.user._id}`, updateData);
        if (response.data.success) {
          showSnackbar('User updated successfully', 'success');
        }
      }
      
      setUserDialog({ open: false, user: null, mode: 'create' });
      setUserForm({ name: '', email: '', password: '', role: '', district: '', municipality: '' });
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Error saving user';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (categoryDialog.mode === 'create') {
        await API.post('/superadmin/categories', categoryForm);
        showSnackbar('Category created successfully');
      } else {
        await API.put(`/superadmin/categories/${categoryDialog.category._id}`, categoryForm);
        showSnackbar('Category updated successfully');
      }
      setCategoryDialog({ open: false, category: null, mode: 'create' });
      await loadCategories();
    } catch (error) {
      showSnackbar('Error saving category', 'error');
    }
  };

  // District Head management handlers
  const loadDistrictHeads = async () => {
    try {
      const response = await API.get('/superadmin/district-heads');
      if (response.data.success) {
        setDistrictHeads(response.data.data);
      }
    } catch (error) {
      console.error('Error loading district heads:', error);
      showSnackbar('Error loading district heads', 'error');
    }
  };

  const handleEditDistrictHead = (districtHead) => {
    setDistrictHeadForm({
      districtName: districtHead.districtName,
      email: districtHead.email,
      password: '',
      showPassword: false,
    });
    setDistrictHeadDialog({ open: true, districtHead, mode: 'edit' });
  };

  const handleDeleteDistrictHead = async (districtHeadId) => {
    if (!window.confirm('Are you sure you want to delete this district head?')) {
      return;
    }

    try {
      const response = await API.delete(`/superadmin/district-heads/${districtHeadId}`);
      
      if (response.data.success) {
        showSnackbar('District head deleted successfully', 'success');
        await loadDistrictHeads();
      }
    } catch (error) {
      console.error('Error deleting district head:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete district head';
      showSnackbar(errorMessage, 'error');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveDistrictHead = async () => {
    try {
      // Validation
      if (!districtHeadForm.districtName || !districtHeadForm.email) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      if (!validateEmail(districtHeadForm.email)) {
        showSnackbar('Please enter a valid email address', 'error');
        return;
      }

      if (districtHeadDialog.mode === 'create' && !districtHeadForm.password) {
        showSnackbar('Password is required for new district heads', 'error');
        return;
      }

      if (districtHeadForm.password && districtHeadForm.password.length < 6) {
        showSnackbar('Password must be at least 6 characters long', 'error');
        return;
      }

      const districtHeadData = {
        districtName: districtHeadForm.districtName,
        email: districtHeadForm.email,
        role: 'District Head'
      };

      if (districtHeadForm.password) {
        districtHeadData.password = districtHeadForm.password;
      }

      if (districtHeadDialog.mode === 'create') {
        const response = await API.post('/superadmin/district-heads', districtHeadData);
        if (response.data.success) {
          showSnackbar('District head created successfully', 'success');
        }
      } else {
        const response = await API.put(`/superadmin/district-heads/${districtHeadDialog.districtHead._id}`, districtHeadData);
        if (response.data.success) {
          showSnackbar('District head updated successfully', 'success');
        }
      }
      
      setDistrictHeadDialog({ open: false, districtHead: null, mode: 'create' });
      setDistrictHeadForm({ districtName: '', email: '', password: '', showPassword: false });
      await loadDistrictHeads();
    } catch (error) {
      console.error('Error saving district head:', error);
      const errorMessage = error.response?.data?.message || 'Error saving district head';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Notification management functions
  const loadNotifications = async () => {
    try {
      const response = await API.get('/auth/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        const unreadCount = response.data.notifications?.filter(n => !n.isRead).length || 0;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't show error to user as notifications are not critical
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await API.put(`/auth/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await API.put('/auth/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSnackbar('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSnackbar('Error updating notifications', 'error');
    }
  };

  // Report management handlers
  const handleViewReport = (report) => {
    setReportDialog({ open: true, report, mode: 'view' });
  };

  const handleEditReport = (report) => {
    setReportDialog({ open: true, report, mode: 'edit' });
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await API.put(`/superadmin/reports/${reportId}/status`, { status: newStatus });
      await loadReports();
      showSnackbar('Report status updated successfully');
    } catch (error) {
      showSnackbar('Error updating report status', 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await API.delete(`/superadmin/reports/${reportId}`);
      await loadReports();
      showSnackbar('Report deleted successfully');
    } catch (error) {
      showSnackbar('Error deleting report', 'error');
    }
  };

  // Render current page content
  const renderPageContent = () => {
    switch (selectedPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'interactive-map':
        return <InteractiveMapPage />;
      case 'users':
        return <UserManagement />;
      case 'district-heads':
        return <DistrictHeadManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  // Sidebar drawer content
  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'transparent' }}>
      {/* Header */}
      <Box
        sx={{
          p: 4,
          borderBottom: '2px solid rgba(19, 136, 8, 0.3)',
          background: 'linear-gradient(135deg, #FF9933, #FF8C00)',
          backdropFilter: 'blur(5px)',
          color: 'white',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            width: 48, 
            height: 48,
            border: '3px solid #138808',
            color: '#FF9933',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
          }}>
            <AdminIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ lineHeight: 1.2 }}>
              Super Admin
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.875rem', fontWeight: 500 }}>
              {user?.name || 'भारत Dashboard'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ pt: 3, px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedPage === item.id}
              onClick={() => setSelectedPage(item.id)}
              sx={{
                borderRadius: 3,
                mb: 1,
                py: 1.5,
                px: 2,
                backgroundColor: selectedPage === item.id 
                  ? 'rgba(19, 136, 8, 0.1)' 
                  : 'transparent',
                border: selectedPage === item.id 
                  ? '1px solid rgba(19, 136, 8, 0.3)' 
                  : '1px solid transparent',
                boxShadow: selectedPage === item.id 
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: selectedPage === item.id 
                    ? 'rgba(19, 136, 8, 0.15)'
                    : 'rgba(255, 153, 51, 0.08)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(19, 136, 8, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedPage === item.id ? '#138808' : 'rgba(0, 0, 0, 0.7)', 
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontWeight: selectedPage === item.id ? 600 : 400,
                  fontSize: '0.95rem',
                  color: selectedPage === item.id ? '#138808' : 'rgba(0, 0, 0, 0.7)'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="error"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FF9933 0%, rgba(255, 255, 255, 0.9) 50%, #138808 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#FF9933',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderBottom: '2px solid rgba(19, 136, 8, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.id === selectedPage)?.label || 'Dashboard'}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={loadDashboardData}
            disabled={loading}
            title="Refresh Data"
          >
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={handleNotificationClick}
            title="Notifications"
          >
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #FF9933 0%, rgba(255, 255, 255, 0.98) 35%, rgba(255, 255, 255, 0.95) 65%, #138808 100%)',
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #FF9933 0%, rgba(255, 255, 255, 0.98) 35%, rgba(255, 255, 255, 0.95) 65%, #138808 100%)',
              backdropFilter: 'blur(10px)',
              borderRight: '3px solid rgba(19, 136, 8, 0.3)',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
              color: '#333'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='%23000080' stroke-width='0.5'/%3E%3Cg stroke='%23000080' stroke-width='0.5' fill='none'%3E%3C!-- 24 spokes of the Ashoka Chakra --%3E%3Cline x1='100' y1='20' x2='100' y2='180'/%3E%3Cline x1='20' y1='100' x2='180' y2='100'/%3E%3Cline x1='30' y1='30' x2='170' y2='170'/%3E%3Cline x1='30' y1='170' x2='170' y2='30'/%3E%3Cline x1='22' y1='62' x2='178' y2='138'/%3E%3Cline x1='22' y1='138' x2='178' y2='62'/%3E%3Cline x1='62' y1='22' x2='138' y2='178'/%3E%3Cline x1='62' y1='178' x2='138' y2='22'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: 0.03,
            zIndex: 0,
            pointerEvents: 'none'
          },
          pt: { xs: 7, sm: 8 }
        }}
      >
        {renderPageContent()}
      </Box>

      {/* User Dialog */}
      <Dialog 
        open={userDialog.open} 
        onClose={() => setUserDialog({ open: false, user: null, mode: 'create' })} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98))',
            border: '1px solid rgba(19, 136, 8, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #FF9933, #FF8C00)',
          color: 'white',
          fontWeight: 600
        }}>
          {userDialog.mode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Grid>
              {userDialog.mode === 'create' && (
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </Grid>
              )}
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Role"
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <MenuItem value="district_admin">District Admin</MenuItem>
                    <MenuItem value="municipality_admin">Municipality Admin</MenuItem>
                    <MenuItem value="department_head">Department Head</MenuItem>
                    <MenuItem value="field_head">Field Head</MenuItem>
                    <MenuItem value="field_staff">Field Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="District"
                  value={userForm.district}
                  onChange={(e) => setUserForm({ ...userForm, district: e.target.value })}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Municipality"
                  value={userForm.municipality}
                  onChange={(e) => setUserForm({ ...userForm, municipality: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(19, 136, 8, 0.1)' }}>
          <Button 
            onClick={() => setUserDialog({ open: false, user: null, mode: 'create' })}
            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            sx={{ 
              bgcolor: '#138808',
              '&:hover': { bgcolor: '#0e6606' }
            }}
          >
            {userDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog 
        open={categoryDialog.open} 
        onClose={() => setCategoryDialog({ open: false, category: null, mode: 'create' })} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98))',
            border: '1px solid rgba(19, 136, 8, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #FF9933, #FF8C00)',
          color: 'white',
          fontWeight: 600
        }}>
          {categoryDialog.mode === 'create' ? 'Create New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </Grid>
              <Grid xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={categoryForm.priority}
                    label="Priority"
                    onChange={(e) => setCategoryForm({ ...categoryForm, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(19, 136, 8, 0.1)' }}>
          <Button 
            onClick={() => setCategoryDialog({ open: false, category: null, mode: 'create' })}
            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            sx={{ 
              bgcolor: '#138808',
              '&:hover': { bgcolor: '#0e6606' }
            }}
          >
            {categoryDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog 
        open={reportDialog.open} 
        onClose={() => setReportDialog({ open: false, report: null, mode: 'view' })} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.01em'
        }}>
          {reportDialog.mode === 'view' ? '👁️ View Report' : '✏️ Edit Report'}
        </DialogTitle>
        <DialogContent sx={{ p: 4, backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
          {reportDialog.report && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={4}>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={reportDialog.report.title || ''}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={reportDialog.report.category || ''}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={reportDialog.report.status || ''}
                      label="Status"
                      disabled={reportDialog.mode === 'view'}
                      onChange={(e) => handleUpdateReportStatus(reportDialog.report._id, e.target.value)}
                    >
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="acknowledged">Acknowledged</MenuItem>
                      <MenuItem value="assigned">Assigned</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Priority"
                    value={reportDialog.report.priority || 'Medium'}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={reportDialog.report.description || ''}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    multiline
                    rows={4}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={reportDialog.report.location?.address || ''}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Coordinates"
                    value={reportDialog.report.location?.coordinates || ''}
                    InputProps={{ readOnly: reportDialog.mode === 'view' }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Submitted By"
                    value={reportDialog.report.citizenId?.name || reportDialog.report.citizenId || 'N/A'}
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Submitted Date"
                    value={reportDialog.report.createdAt ? new Date(reportDialog.report.createdAt).toLocaleString() : 'N/A'}
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
                {reportDialog.report.assignedTo && (
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Assigned To"
                      value={reportDialog.report.assignedTo?.name || reportDialog.report.assignedTo || 'N/A'}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {reportDialog.mode === 'view' && (
            <Button 
              onClick={() => setReportDialog({ ...reportDialog, mode: 'edit' })} 
              variant="outlined"
            >
              Edit
            </Button>
          )}
          <Button 
            onClick={() => setReportDialog({ open: false, report: null, mode: 'view' })}
          >
            {reportDialog.mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {reportDialog.mode === 'view' && (
            <Button 
              onClick={() => handleDeleteReport(reportDialog.report._id)} 
              color="error"
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* District Head Dialog */}
      <Dialog 
        open={districtHeadDialog.open} 
        onClose={() => setDistrictHeadDialog({ open: false, districtHead: null, mode: 'create' })} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98))',
            border: '1px solid rgba(19, 136, 8, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #FF9933, #FF8C00)',
          color: 'white',
          fontWeight: 600
        }}>
          {districtHeadDialog.mode === 'create' ? 'Create New District Head' : 'Edit District Head'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>District Name</InputLabel>
                  <Select
                    value={districtHeadForm.districtName}
                    label="District Name"
                    onChange={(e) => setDistrictHeadForm({ ...districtHeadForm, districtName: e.target.value })}
                  >
                    {districts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={districtHeadForm.email}
                  onChange={(e) => setDistrictHeadForm({ ...districtHeadForm, email: e.target.value })}
                  helperText="District head will use this email to login"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={districtHeadForm.showPassword ? 'text' : 'password'}
                  value={districtHeadForm.password}
                  onChange={(e) => setDistrictHeadForm({ ...districtHeadForm, password: e.target.value })}
                  helperText={districtHeadDialog.mode === 'create' 
                    ? "Minimum 6 characters required" 
                    : "Leave empty to keep current password"
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setDistrictHeadForm({ 
                          ...districtHeadForm, 
                          showPassword: !districtHeadForm.showPassword 
                        })}
                        edge="end"
                      >
                        {districtHeadForm.showPassword ? <HideIcon /> : <ViewIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(19, 136, 8, 0.1)' }}>
          <Button 
            onClick={() => setDistrictHeadDialog({ open: false, districtHead: null, mode: 'create' })}
            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDistrictHead} 
            variant="contained"
            sx={{ 
              bgcolor: '#138808',
              '&:hover': { bgcolor: '#0e6606' }
            }}
          >
            {districtHeadDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Panel */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 400, 
            maxHeight: 500, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Box>
              <Chip 
                label={`${unreadCount} unread`}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
              <Button 
                size="small" 
                onClick={markAllNotificationsAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications available
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <Box 
                key={notification._id || index}
                sx={{ 
                  p: 2,
                  borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                  backgroundColor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: notification.isRead ? 'rgba(0,0,0,0.02)' : 'rgba(25, 118, 210, 0.08)'
                  }
                }}
                onClick={() => !notification.isRead && markNotificationAsRead(notification._id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {!notification.isRead && (
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: '#1976d2',
                        mt: 1,
                        flexShrink: 0
                      }} 
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: notification.isRead ? 400 : 600,
                        mb: 0.5,
                        wordBreak: 'break-word'
                      }}
                    >
                      {notification.title || 'New Report Submitted'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 0.5, wordBreak: 'break-word' }}
                    >
                      {notification.message || `Report #${notification.reportId || 'N/A'} has been submitted and requires review.`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recent'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminDashboard;
