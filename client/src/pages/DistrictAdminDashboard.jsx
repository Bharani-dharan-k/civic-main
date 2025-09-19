import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  CardActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link,
  Menu,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  ChatBubble as ChatIcon,
  Security as SecurityIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Flag as FlagIcon,
  AccountBalance as GovIcon,
  Map as MapIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Send as SendIcon,
  CloudDownload as DownloadIcon,
  LockReset as ResetIcon,
  VpnKey as KeyIcon,
  Shield as ShieldIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const DRAWER_WIDTH = 280;

// India Flag Colors Theme
const INDIA_THEME = {
  saffron: '#FF9933',
  white: '#FFFFFF',
  green: '#138808',
  navy: '#000080',
  ashoka: '#000080',
  gradient: 'linear-gradient(180deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  cardGradient: 'linear-gradient(135deg, rgba(255,153,51,0.1) 0%, rgba(19,136,8,0.1) 100%)',
  headerGradient: 'linear-gradient(135deg, #FF9933 0%, #000080 100%)'
};

// Simple User Management Dialog Component (outside main component)
const UserManagementDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  formData, 
  onFieldChange, 
  isEdit, 
  departments,
  theme 
}) => {
  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus={false}
      disableEnforceFocus={false}
      keepMounted={false}
      aria-labelledby="user-dialog-title"
      aria-describedby="user-dialog-description"
      PaperProps={{
        sx: { 
          borderRadius: 2,
          border: `2px solid ${theme.saffron}30`
        },
        'aria-modal': true,
        role: 'dialog'
      }}
    >
      <DialogTitle 
        id="user-dialog-title"
        sx={{ 
          background: theme.headerGradient,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <PersonAddIcon />
        {isEdit ? 'Edit Department Admin' : 'Add New Department Admin'}
      </DialogTitle>
      
      <DialogContent id="user-dialog-description" sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role || 'department_head'}
                onChange={(e) => onFieldChange('role', e.target.value)}
                label="Role"
              >
                <MenuItem value="department_head">Department Head</MenuItem>
                <MenuItem value="municipality_admin">Municipality Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department || ''}
                onChange={(e) => onFieldChange('department', e.target.value)}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={isEdit ? "New Password (leave empty to keep current)" : "Password"}
              type="password"
              value={formData.password || ''}
              onChange={(e) => onFieldChange('password', e.target.value)}
              variant="outlined"
              required={!isEdit}
              helperText={isEdit ? "Only enter a password if you want to change it" : ""}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: theme.navy,
            color: theme.navy,
            '&:hover': { 
              borderColor: theme.navy,
              backgroundColor: theme.navy + '10' 
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          autoFocus={!isEdit}
          disabled={!formData.name || !formData.email || !formData.department || (!isEdit && !formData.password)}
          sx={{ 
            background: theme.headerGradient,
            '&:hover': { opacity: 0.9 }
          }}
        >
          {isEdit ? 'Update Admin' : 'Create Admin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DistrictAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    newReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    activeMunicipalities: 0,
    totalStaff: 0,
    avgResponseTime: 0
  });
  
  // Reports Data
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    municipality: 'all',
    department: 'all',
    priority: 'all'
  });
  
  // Municipality Data
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  
  // User Management Data
  const [districtUsers, setDistrictUsers] = useState([]);
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'department_head',
    department: '',
    password: ''
  });
  
  // Department list for user creation
  const [departments, setDepartments] = useState([
    'Public Works',
    'Health Services',
    'Water Management', 
    'Sanitation',
    'Transportation',
    'Urban Planning',
    'Education'
  ]);
  
  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    commonIssues: [],
    departmentPerformance: [],
    municipalityPerformance: []
  });
  
  // UI State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
    loadMunicipalities();
    loadDistrictUsers();
    loadNotifications();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, reportFilters]);

  // Handle user dialog form data population
  useEffect(() => {
    if (userDialog.open) {
      const isEdit = userDialog.mode === 'edit';
      if (userDialog.user && isEdit) {
        setUserFormData({
          name: userDialog.user.name || '',
          email: userDialog.user.email || '',
          role: userDialog.user.role || 'department_head',
          department: userDialog.user.department || '',
          password: '' // Don't pre-fill password for edits
        });
      } else if (!isEdit) {
        setUserFormData({
          name: '',
          email: '',
          role: 'department_head',
          department: '',
          password: ''
        });
      }
    }
  }, [userDialog.open, userDialog.mode, userDialog.user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics from backend
      const statsResponse = await API.get('/admin/stats');
      console.log('Dashboard Stats API response:', statsResponse.data);
      
      if (statsResponse.data.success && statsResponse.data.stats) {
        const backendStats = statsResponse.data.stats;
        
        // Map backend data to dashboard stats
        const stats = {
          totalReports: backendStats.totalReports || 0,
          newReports: backendStats.submittedReports || 0,
          inProgressReports: backendStats.inProgressReports || 0,
          resolvedReports: backendStats.resolvedReports || 0,
          rejectedReports: backendStats.rejectedReports || 0,
          activeMunicipalities: backendStats.activeMunicipalities || 0,
          totalStaff: backendStats.totalCitizens || 0,
          avgResponseTime: backendStats.avgResolutionTime ? parseFloat(backendStats.avgResolutionTime.toFixed(1)) : 0
        };
        
        setDashboardStats(stats);
        
        // Set analytics data from backend
        if (backendStats.reportsByCategory) {
          const analyticsData = {
            commonIssues: Array.isArray(backendStats.reportsByCategory) 
              ? backendStats.reportsByCategory.map(cat => ({
                  category: cat._id || 'General',
                  count: cat.count || 0,
                  resolved: cat.resolved || 0,
                  percentage: backendStats.totalReports > 0 ? ((cat.count / backendStats.totalReports) * 100).toFixed(1) : 0
                }))
              : [],
            departmentPerformance: Array.isArray(backendStats.departmentPerformance) 
              ? backendStats.departmentPerformance 
              : [],
            municipalityPerformance: Array.isArray(backendStats.municipalityPerformance) 
              ? backendStats.municipalityPerformance 
              : []
          };
          setAnalyticsData(analyticsData);
        } else {
          // Fallback empty analytics data
          setAnalyticsData({
            commonIssues: [],
            departmentPerformance: [],
            municipalityPerformance: []
          });
        }
      }
      
      // Load reports for this district
      try {
        const reportsResponse = await API.get('/admin/reports');
        console.log('Reports API response:', reportsResponse.data);
        
        // Handle different response structures
        let reportsData = [];
        if (reportsResponse.data.success && Array.isArray(reportsResponse.data.reports)) {
          reportsData = reportsResponse.data.reports;
        } else if (Array.isArray(reportsResponse.data)) {
          reportsData = reportsResponse.data;
        }
        
        // Filter reports for this district if user has district info
        if (user?.district) {
          reportsData = reportsData.filter(report => 
            report.district === user.district || 
            report.address?.includes(user.district) ||
            !report.district // Include reports without district specified
          );
        }
        
        setReports(reportsData);
      } catch (reportsError) {
        console.error('Error loading reports data:', reportsError);
        // Don't fail the entire dashboard if reports fail
        setReports([]);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data on error
      setReports([]);
      setDashboardStats({
        totalReports: 0,
        newReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        activeMunicipalities: 0,
        totalStaff: 0,
        avgResponseTime: 0
      });
      setAnalyticsData({
        commonIssues: [],
        departmentPerformance: [],
        municipalityPerformance: []
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMunicipalities = async () => {
    try {
      // Load departments data which represents municipality-like divisions
      const departmentsResponse = await API.get('/admin/departments');
      console.log('Departments API response:', departmentsResponse.data);
      
      if (departmentsResponse.data.success && Array.isArray(departmentsResponse.data.departments)) {
        const departments = departmentsResponse.data.departments;
        
        // Transform departments data into municipality format for display
        const municipalityData = departments.map((dept, index) => {
          const totalReports = (dept.activeIssues || 0) + (dept.resolvedIssues || 0);
          const resolved = dept.resolvedIssues || 0;
          const pending = dept.activeIssues || 0;
          const performance = totalReports > 0 ? ((resolved / totalReports) * 100).toFixed(1) : 0;
          
          return {
            id: dept._id || index + 1,
            name: dept.name || `Department ${index + 1}`,
            reports: totalReports,
            resolved: resolved,
            pending: pending,
            performance: parseFloat(performance),
            description: dept.description || '',
            head: dept.head || 'Not Assigned',
            contact: dept.contact || 'N/A'
          };
        });
        
        setMunicipalities(municipalityData);
      } else {
        // Fallback to empty array if no data
        console.log('No departments data found, using empty array');
        setMunicipalities([]);
      }
    } catch (error) {
      console.error('Error loading municipalities (departments):', error);
      // Create mock data as fallback for better UX
      const fallbackData = [
        { id: 1, name: 'General Department', reports: 0, resolved: 0, pending: 0, performance: 0, description: 'Fallback data', head: 'N/A', contact: 'N/A' }
      ];
      setMunicipalities(fallbackData);
    }
  };

  const loadDistrictUsers = async () => {
    try {
      // Load district users from backend
      const usersResponse = await API.get('/admin/users');
      console.log('District Users API response:', usersResponse.data);
      
      if (usersResponse.data.success && Array.isArray(usersResponse.data.users)) {
        const users = usersResponse.data.users.map(user => ({
          id: user._id,
          name: user.name || 'Unknown User',
          email: user.email || 'No Email',
          role: user.role || 'department_head',
          status: user.isActive ? 'active' : 'inactive',
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          department: user.department || 'General',
          district: user.district || '',
          municipality: user.municipality || '',
          phone: user.phone || ''
        }));
        setDistrictUsers(users);
      } else {
        setDistrictUsers([]);
      }
    } catch (error) {
      console.error('Error loading district users:', error);
      setDistrictUsers([]);
    }
  };

  const loadNotifications = async () => {
    try {
      // Load real notifications from backend
      const notificationsResponse = await API.get('/admin/notifications');
      console.log('Notifications API response:', notificationsResponse.data);
      
      if (notificationsResponse.data.success && Array.isArray(notificationsResponse.data.notifications)) {
        const notifications = notificationsResponse.data.notifications.map(notification => ({
          id: notification._id,
          title: notification.title || 'Notification',
          message: notification.message || 'No message',
          type: notification.type || 'info',
          read: notification.isRead || false,
          timestamp: new Date(notification.createdAt || Date.now()),
          priority: notification.priority || 'medium'
        }));
        
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
      } else {
        // Fallback to empty notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to empty notifications on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const filterReports = () => {
    if (!Array.isArray(reports)) {
      setFilteredReports([]);
      return;
    }
    
    let filtered = reports;
    
    // Apply filters
    if (reportFilters.status !== 'all') {
      filtered = filtered.filter(report => {
        switch (reportFilters.status) {
          case 'new':
            return report.status === 'submitted' || report.status === 'new';
          case 'in_progress':
            return report.status === 'in_progress' || report.status === 'assigned';
          case 'resolved':
            return report.status === 'resolved' || report.status === 'completed';
          case 'rejected':
            return report.status === 'rejected';
          default:
            return true;
        }
      });
    }
    
    if (reportFilters.municipality !== 'all') {
      filtered = filtered.filter(report => 
        report.municipality === reportFilters.municipality
      );
    }
    
    if (reportFilters.department !== 'all') {
      filtered = filtered.filter(report => 
        report.department === reportFilters.department
      );
    }
    
    if (reportFilters.priority !== 'all') {
      filtered = filtered.filter(report => 
        report.priority === reportFilters.priority
      );
    }
    
    setFilteredReports(filtered);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // User Management Functions
  const handleCreateUser = async (userData) => {
    try {
      const response = await API.post('/admin/users', userData);
      if (response.data.success) {
        // Refresh the user list
        await loadDistrictUsers();
        // Use setTimeout to ensure proper focus management
        setTimeout(() => {
          setUserDialog({ open: false, user: null, mode: 'create' });
        }, 0);
        // You could add a success notification here
        console.log('User created successfully:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // You could add an error notification here
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await API.put(`/admin/users/${userId}`, userData);
      if (response.data.success) {
        // Refresh the user list
        await loadDistrictUsers();
        // Use setTimeout to ensure proper focus management
        setTimeout(() => {
          setUserDialog({ open: false, user: null, mode: 'create' });
        }, 0);
        console.log('User updated successfully:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await API.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          // Refresh the user list
          await loadDistrictUsers();
          console.log('User deleted successfully:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      const response = await API.put(`/admin/users/${userId}/reset-password`, {
        newPassword
      });
      if (response.data.success) {
        console.log('Password reset successfully:', response.data.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setReportDialog(true);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await API.put(`/reports/${reportId}`, { status: newStatus });
      loadDashboardData(); // Refresh data
      setReportDialog(false);
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const assignReport = async (reportId, assigneeId, assigneeType) => {
    try {
      await API.put(`/reports/${reportId}/assign`, { 
        assigneeId, 
        assigneeType 
      });
      loadDashboardData();
      setReportDialog(false);
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
      case 'submitted':
        return INDIA_THEME.saffron;
      case 'in_progress':
      case 'assigned':
        return INDIA_THEME.navy;
      case 'resolved':
      case 'completed':
        return INDIA_THEME.green;
      case 'rejected':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#d32f2f';
      case 'medium':
        return INDIA_THEME.saffron;
      case 'low':
        return INDIA_THEME.green;
      default:
        return '#666';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <DashboardIcon />, color: INDIA_THEME.saffron },
    { id: 'municipalities', label: 'Municipality Management', icon: <BusinessIcon />, color: INDIA_THEME.navy },
    { id: 'reports', label: 'Issue Management', icon: <ReportIcon />, color: INDIA_THEME.green },
    { id: 'users', label: 'User Management', icon: <PeopleIcon />, color: INDIA_THEME.saffron },
    { id: 'communications', label: 'Communications', icon: <ChatIcon />, color: INDIA_THEME.navy },
    { id: 'analytics', label: 'Analytics & Reports', icon: <AssessmentIcon />, color: INDIA_THEME.green },
    { id: 'escalations', label: 'Escalation Handling', icon: <WarningIcon />, color: INDIA_THEME.saffron },
    { id: 'settings', label: 'Settings & Security', icon: <SettingsIcon />, color: INDIA_THEME.navy },
  ];

  // Dashboard Overview Section
  const renderDashboard = () => (
    <Box>
      {/* Header with India Flag Theme - Enhanced */}
      <Box sx={{ 
        background: INDIA_THEME.headerGradient, 
        p: 4, 
        borderRadius: 3, 
        mb: 4,
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '100%',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50px',
          transform: 'rotate(15deg) translateX(50px)',
          opacity: 0.3
        }} />
        
        <Box display="flex" alignItems="center" mb={2} position="relative" zIndex={1}>
          <FlagIcon sx={{ mr: 3, fontSize: 50, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Welcome, {user?.name || 'District Administrator'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              District Administrative Officer - {user?.district || 'District'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9, position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          Government of India | Ministry of Urban Development
        </Typography>
      </Box>

      {/* Enhanced Quick Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${INDIA_THEME.saffron}15 0%, ${INDIA_THEME.saffron}25 100%)`,
            border: `1px solid ${INDIA_THEME.saffron}40`,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(255,153,51,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255,153,51,0.3)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron} sx={{ mb: 1 }}>
                    {dashboardStats.totalReports}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Total Reports
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: INDIA_THEME.saffron, 
                  width: 70, 
                  height: 70,
                  boxShadow: '0 4px 12px rgba(255,153,51,0.3)'
                }}>
                  <ReportIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${INDIA_THEME.navy}15 0%, ${INDIA_THEME.navy}25 100%)`,
            border: `1px solid ${INDIA_THEME.navy}40`,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,32,128,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,32,128,0.3)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.navy} sx={{ mb: 1 }}>
                    {dashboardStats.newReports}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    New Reports
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: INDIA_THEME.navy, 
                  width: 70, 
                  height: 70,
                  boxShadow: '0 4px 12px rgba(0,32,128,0.3)'
                }}>
                  <WarningIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${INDIA_THEME.green}15 0%, ${INDIA_THEME.green}25 100%)`,
            border: `1px solid ${INDIA_THEME.green}40`,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(19,136,8,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(19,136,8,0.3)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.green} sx={{ mb: 1 }}>
                    {dashboardStats.resolvedReports}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Resolved
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: INDIA_THEME.green, 
                  width: 70, 
                  height: 70,
                  boxShadow: '0 4px 12px rgba(19,136,8,0.3)'
                }}>
                  <CheckIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${INDIA_THEME.saffron}15 0%, ${INDIA_THEME.navy}15 100%)`,
            border: `1px solid ${INDIA_THEME.saffron}40`,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(255,153,51,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255,153,51,0.3)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.navy} sx={{ mb: 1 }}>
                    {dashboardStats.avgResponseTime}d
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Avg Response Time
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: INDIA_THEME.navy, 
                  width: 70, 
                  height: 70,
                  boxShadow: '0 4px 12px rgba(0,32,128,0.3)'
                }}>
                  <SpeedIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* District Overview Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Municipality Performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ 
            borderRadius: 3, 
            border: `1px solid ${INDIA_THEME.saffron}30`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <BusinessIcon sx={{ 
                  mr: 2, 
                  fontSize: 28,
                  color: INDIA_THEME.saffron,
                  filter: 'drop-shadow(0 2px 4px rgba(255,153,51,0.3))'
                }} />
                <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                  Municipality Performance
                </Typography>
              </Box>
              {Array.isArray(municipalities) && municipalities.length > 0 ? (
                municipalities.map((municipality, index) => (
                  <Box key={municipality.id} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {municipality.name}
                      </Typography>
                      <Chip 
                        label={`${municipality.performance}%`}
                      color={municipality.performance >= 85 ? 'success' : municipality.performance >= 70 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={municipality.performance} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: municipality.performance >= 85 ? INDIA_THEME.green : 
                                        municipality.performance >= 70 ? INDIA_THEME.saffron : '#d32f2f'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {municipality.resolved}/{municipality.reports} resolved
                  </Typography>
                </Box>
              ))
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="text.secondary">
                    No municipality data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Reports */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ 
            borderRadius: 3, 
            border: `1px solid ${INDIA_THEME.green}30`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <ReportIcon sx={{ 
                  mr: 2, 
                  fontSize: 28,
                  color: INDIA_THEME.green,
                  filter: 'drop-shadow(0 2px 4px rgba(19,136,8,0.3))'
                }} />
                <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                  Recent Reports
                </Typography>
              </Box>
              <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: `${INDIA_THEME.green}10` }}>
                      <TableCell sx={{ fontWeight: 'bold', color: INDIA_THEME.navy }}>Issue</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: INDIA_THEME.navy }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: INDIA_THEME.navy }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: INDIA_THEME.navy }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(reports) && reports.slice(0, 5).map((report, index) => (
                      <TableRow key={report._id || index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {report.title?.slice(0, 30)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${getStatusColor(report.status)}20`,
                              color: getStatusColor(report.status),
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.priority || 'Medium'} 
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: getPriorityColor(report.priority || 'medium'),
                              color: getPriorityColor(report.priority || 'medium')
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewReport(report)}
                              sx={{ color: INDIA_THEME.navy }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!Array.isArray(reports) || reports.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">
                            No reports available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Stats */}
        <Grid size={12}>
          <Card sx={{ 
            borderRadius: 3, 
            border: `1px solid ${INDIA_THEME.navy}30`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={4}>
                <BarChartIcon sx={{ 
                  mr: 2, 
                  fontSize: 28,
                  color: INDIA_THEME.navy,
                  filter: 'drop-shadow(0 2px 4px rgba(0,32,128,0.3))'
                }} />
                <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                  Department Performance Overview
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {Array.isArray(analyticsData.departmentPerformance) && analyticsData.departmentPerformance.length > 0 ? (
                  analyticsData.departmentPerformance.map((dept, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          borderRadius: 2,
                          border: `1px solid ${INDIA_THEME.saffron}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(255,153,51,0.2)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron} sx={{ mb: 1 }}>
                          {dept.performance || 0}%
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color={INDIA_THEME.navy} sx={{ mb: 1 }}>
                          {dept.department || 'Department'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dept.resolved || 0}/{dept.total || 0} resolved
                        </Typography>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="text.secondary">
                        No department performance data available
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Municipality Management Section
  const renderMunicipalities = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy}>
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Municipality Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            background: INDIA_THEME.headerGradient,
            '&:hover': { opacity: 0.9 }
          }}
        >
          Add Municipality Admin
        </Button>
      </Box>

      <Grid container spacing={3}>
        {municipalities.map((municipality) => (
          <Grid size={{ xs: 12, md: 6 }} key={municipality.id}>
            <Card sx={{ 
              border: `2px solid ${INDIA_THEME.saffron}30`,
              borderRadius: 2,
              '&:hover': { boxShadow: 4 }
            }}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                    {municipality.name}
                  </Typography>
                  <Chip 
                    label={`${municipality.performance}% Efficiency`}
                    color={municipality.performance >= 85 ? 'success' : municipality.performance >= 70 ? 'warning' : 'error'}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color={INDIA_THEME.saffron}>
                        {municipality.reports}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Reports
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color={INDIA_THEME.green}>
                        {municipality.resolved}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Resolved
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color={INDIA_THEME.navy}>
                        {municipality.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <LinearProgress 
                  variant="determinate" 
                  value={municipality.performance} 
                  sx={{
                    mt: 2,
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: municipality.performance >= 85 ? INDIA_THEME.green : 
                                      municipality.performance >= 70 ? INDIA_THEME.saffron : '#d32f2f'
                    }
                  }}
                />
              </CardContent>
              <CardActions>
                <Button size="small" sx={{ color: INDIA_THEME.navy }}>
                  View Details
                </Button>
                <Button size="small" sx={{ color: INDIA_THEME.saffron }}>
                  Manage Staff
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Issue/Report Management Section
  const renderReports = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
        <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Issue & Report Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, background: INDIA_THEME.cardGradient }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Municipality</InputLabel>
              <Select
                value={reportFilters.municipality}
                onChange={(e) => setReportFilters({...reportFilters, municipality: e.target.value})}
                label="Municipality"
              >
                <MenuItem value="all">All Municipalities</MenuItem>
                {municipalities.map(m => (
                  <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={reportFilters.department}
                onChange={(e) => setReportFilters({...reportFilters, department: e.target.value})}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="sanitation">Sanitation</MenuItem>
                <MenuItem value="roads">Roads</MenuItem>
                <MenuItem value="electricity">Electricity</MenuItem>
                <MenuItem value="water">Water Supply</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={reportFilters.priority}
                onChange={(e) => setReportFilters({...reportFilters, priority: e.target.value})}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: INDIA_THEME.saffron + '20' }}>
              <TableRow>
                <TableCell><strong>Report ID</strong></TableCell>
                <TableCell><strong>Issue</strong></TableCell>
                <TableCell><strong>Municipality</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredReports) && filteredReports.map((report, index) => (
                <TableRow key={report._id || index} hover>
                  <TableCell>
                    <Chip 
                      label={`#${report._id?.slice(-6) || 'N/A'}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {report.title || 'No title'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.category || 'General'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{report.municipality || 'Not assigned'}</TableCell>
                  <TableCell>{report.department || 'General'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.priority || 'Medium'} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${getPriorityColor(report.priority || 'medium')}20`,
                        color: getPriorityColor(report.priority || 'medium'),
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status || 'New'} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${getStatusColor(report.status || 'new')}20`,
                        color: getStatusColor(report.status || 'new'),
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReport(report)}
                          sx={{ color: INDIA_THEME.navy }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign">
                        <IconButton 
                          size="small"
                          sx={{ color: INDIA_THEME.saffron }}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {(!Array.isArray(filteredReports) || filteredReports.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No reports found matching the selected criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // User Management Section
  const renderUsers = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy}>
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setUserDialog({ open: true, user: null, mode: 'create' })}
          sx={{ 
            background: INDIA_THEME.headerGradient,
            '&:hover': { opacity: 0.9 }
          }}
        >
          Add Department Admin
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: INDIA_THEME.green + '20' }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Last Login</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {districtUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: INDIA_THEME.saffron }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: INDIA_THEME.navy + '20',
                        color: INDIA_THEME.navy,
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status}
                      size="small"
                      color={user.status === 'active' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {user.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          sx={{ color: INDIA_THEME.saffron }}
                          onClick={() => setUserDialog({ open: true, user, mode: 'edit' })}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton 
                          size="small" 
                          sx={{ color: INDIA_THEME.navy }}
                          onClick={() => {
                            const newPassword = prompt('Enter new password for ' + user.name);
                            if (newPassword) {
                              handleResetPassword(user.id, newPassword);
                            }
                          }}
                        >
                          <ResetIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          sx={{ color: 'error.main' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {districtUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      No department admins found. Click "Add Department Admin" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // Simple form field change handler
  const handleFormFieldChange = (field, value) => {
    setUserFormData(prev => ({ ...prev, [field]: value }));
  };

  // Simple dialog submit handler
  const handleDialogSubmit = () => {
    const isEdit = userDialog.mode === 'edit';
    if (isEdit) {
      handleUpdateUser(userDialog.user?.id, userFormData);
    } else {
      handleCreateUser(userFormData);
    }
    // Use setTimeout to ensure proper cleanup
    setTimeout(() => {
      setUserDialog({ open: false, user: null, mode: 'create' });
    }, 0);
  };

  // Simple dialog close handler
  const handleDialogClose = () => {
    // Use setTimeout to ensure proper focus management
    setTimeout(() => {
      setUserDialog({ open: false, user: null, mode: 'create' });
      setUserFormData({
        name: '',
        email: '',
        role: 'department_head',
        department: '',
        password: ''
      });
    }, 0);
  };

  // Analytics Section
  const renderAnalytics = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Analytics & Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Common Issues Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Most Common Issues
              </Typography>
              {analyticsData.commonIssues.map((issue, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="bold">
                      {issue.category}
                    </Typography>
                    <Typography variant="body2" color={INDIA_THEME.saffron}>
                      {issue.count} reports
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(issue.count / (analyticsData.commonIssues[0]?.count || 1)) * 100} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: INDIA_THEME.saffron
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Export Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
                <ExportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Export Reports
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      borderColor: INDIA_THEME.saffron,
                      color: INDIA_THEME.saffron,
                      '&:hover': { 
                        backgroundColor: INDIA_THEME.saffron + '10',
                        borderColor: INDIA_THEME.saffron
                      }
                    }}
                  >
                    Download Excel Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      borderColor: INDIA_THEME.green,
                      color: INDIA_THEME.green,
                      '&:hover': { 
                        backgroundColor: INDIA_THEME.green + '10',
                        borderColor: INDIA_THEME.green
                      }
                    }}
                  >
                    Download PDF Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EmailIcon />}
                    sx={{ 
                      background: INDIA_THEME.headerGradient,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Email Monthly Report
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.navy}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                District Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.saffron + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron}>
                      85%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Resolution Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.green + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.green}>
                      2.4
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Resolution Time (Days)
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.navy + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.navy}>
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Citizen Satisfaction
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.saffron + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron}>
                      24h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Communications Section
  const renderCommunications = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
        <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Communications & Notifications
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                Send Announcement
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your announcement message here..."
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Send To</InputLabel>
                <Select defaultValue="all" label="Send To">
                  <MenuItem value="all">All Municipality Admins</MenuItem>
                  <MenuItem value="department_heads">Department Heads</MenuItem>
                  <MenuItem value="field_staff">Field Staff</MenuItem>
                  <MenuItem value="specific">Specific Municipality</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SendIcon />}
                sx={{ 
                  background: INDIA_THEME.headerGradient,
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Send Announcement
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                Recent Notifications
              </Typography>
              {notifications.map((notification) => (
                <Box key={notification.id} sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="between" alignItems="start">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.message}
                      </Typography>
                    </Box>
                    <Chip 
                      label={notification.type}
                      size="small"
                      color={notification.type === 'alert' ? 'error' : notification.type === 'success' ? 'success' : 'info'}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Escalations Section
  const renderEscalations = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
        <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Escalation Handling
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage cases escalated from Municipality Admins that require district-level intervention.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
              Pending Escalations
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Issue ID</TableCell>
                    <TableCell>Municipality</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No pending escalations
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                Escalation Statistics
              </Typography>
              <Box textAlign="center" mb={2}>
                <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron}>
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Escalations
                </Typography>
              </Box>
              <Box textAlign="center" mb={2}>
                <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.green}>
                  5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved This Month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Settings Section
  const renderSettings = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Settings & Security
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Security Settings
              </Typography>
              <Box mb={3}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Two-Factor Authentication"
                />
              </Box>
              <Box mb={3}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email Notifications"
                />
              </Box>
              <Box mb={3}>
                <FormControlLabel
                  control={<Switch />}
                  label="SMS Notifications"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<KeyIcon />}
                sx={{ 
                  borderColor: INDIA_THEME.navy,
                  color: INDIA_THEME.navy,
                  '&:hover': { 
                    backgroundColor: INDIA_THEME.navy + '10',
                    borderColor: INDIA_THEME.navy
                  }
                }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Audit Logs
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Track administrative actions and system changes
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  borderColor: INDIA_THEME.green,
                  color: INDIA_THEME.green,
                  '&:hover': { 
                    backgroundColor: INDIA_THEME.green + '10',
                    borderColor: INDIA_THEME.green
                  }
                }}
              >
                View Audit Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.navy}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                Profile Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    defaultValue={user?.name || ''}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    defaultValue={user?.email || ''}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="District"
                    defaultValue={user?.district || ''}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="+91 XXXXX XXXXX"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    sx={{ 
                      background: INDIA_THEME.headerGradient,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'municipalities':
        return renderMunicipalities();
      case 'reports':
        return renderReports();
      case 'users':
        return renderUsers();
      case 'communications':
        return renderCommunications();
      case 'analytics':
        return renderAnalytics();
      case 'escalations':
        return renderEscalations();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: INDIA_THEME.gradient }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: INDIA_THEME.navy, mb: 2 }} />
          <Typography variant="h6" color={INDIA_THEME.navy}>
            Loading District Administration Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Government of India | Digital India Initiative
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* India Flag Themed App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1300,
          background: INDIA_THEME.headerGradient,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          height: '72px'
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important' }}>
          <FlagIcon sx={{ mr: 2, fontSize: 30 }} />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap component="div" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              District Administration Portal
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
              Government of India | {user?.district || 'District'} District
            </Typography>
          </Box>

          <Badge badgeContent={unreadCount} color="error">
            <IconButton color="inherit" onClick={() => setNotificationDialog(true)}>
              <NotificationsIcon />
            </IconButton>
          </Badge>

          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: INDIA_THEME.white, color: INDIA_THEME.navy, mr: { xs: 0, sm: 1 } }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 1 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                {user?.name || 'District Admin'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                District Admin
              </Typography>
            </Box>
          </Box>

          <Button 
            color="inherit" 
            onClick={handleLogout} 
            sx={{ ml: { xs: 1, sm: 2 }, borderColor: 'white', minWidth: { xs: 'auto', sm: 'auto' } }}
            variant="outlined"
            startIcon={<LogoutIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
            <LogoutIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer with India Theme */}
      <Drawer
        variant="permanent"
        sx={{
          display: 'block',
          zIndex: 1200,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${INDIA_THEME.saffron}10 0%, ${INDIA_THEME.white} 30%, ${INDIA_THEME.green}10 100%)`,
            borderRight: `3px solid ${INDIA_THEME.saffron}30`,
            position: 'fixed',
            top: '72px',
            left: 0,
            height: 'calc(100vh - 72px)',
            overflowY: 'auto',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          },
        }}
      >
        {/* Government Logo Section */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: `2px solid ${INDIA_THEME.saffron}30` }}>
          <GovIcon sx={{ fontSize: 40, color: INDIA_THEME.navy, mb: 1 }} />
          <Typography variant="body2" fontWeight="bold" color={INDIA_THEME.navy}>
            Bharatiya Prashasan
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Digital Governance Platform
          </Typography>
        </Box>

        <Box sx={{ overflow: 'auto', pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: `${item.color}30`
                      }
                    },
                    '&:hover': {
                      backgroundColor: `${item.color}10`
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === item.id ? item.color : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: activeTab === item.id ? 'bold' : 'normal',
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2, borderColor: INDIA_THEME.saffron + '30' }} />

          {/* Quick Actions */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color={INDIA_THEME.navy} fontWeight="bold" mb={1}>
              Quick Actions
            </Typography>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              sx={{ 
                mb: 1, 
                borderColor: INDIA_THEME.saffron,
                color: INDIA_THEME.saffron,
                '&:hover': { backgroundColor: INDIA_THEME.saffron + '10' }
              }}
            >
              Emergency Alert
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: INDIA_THEME.green,
                color: INDIA_THEME.green,
                '&:hover': { backgroundColor: INDIA_THEME.green + '10' }
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f7fa',
          p: { xs: 3, sm: 4 },
          marginTop: '72px',
          marginLeft: `${DRAWER_WIDTH}px`,
          minHeight: 'calc(100vh - 72px)',
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          transition: 'all 0.3s ease-in-out',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        {/* Breadcrumbs with improved styling */}
        <Box sx={{ 
          mb: 4, 
          p: 2, 
          bgcolor: 'white', 
          borderRadius: 2, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Breadcrumbs 
            sx={{ 
              fontSize: '0.9rem',
              '& .MuiBreadcrumbs-separator': { 
                color: INDIA_THEME.navy,
                mx: 1
              }
            }}
          >
            <Link 
              color="inherit" 
              href="#" 
              onClick={() => setActiveTab('dashboard')}
              sx={{ 
                textDecoration: 'none',
                color: INDIA_THEME.navy,
                '&:hover': { color: INDIA_THEME.saffron }
              }}
            >
              Dashboard
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                textTransform: 'capitalize',
                fontWeight: 600,
                color: INDIA_THEME.saffron
              }}
            >
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </Typography>
          </Breadcrumbs>
        </Box>

        {renderContent()}
      </Box>

      {/* Report Details Dialog */}
      <Dialog 
        open={reportDialog} 
        onClose={() => setReportDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, border: `2px solid ${INDIA_THEME.saffron}30` }
        }}
      >
        {selectedReport && (
          <>
            <DialogTitle sx={{ 
              background: INDIA_THEME.headerGradient, 
              color: 'white',
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Report Details - #{selectedReport._id?.slice(-6) || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedReport.category} | Priority: {selectedReport.priority || 'Medium'}
                </Typography>
              </Box>
              <IconButton onClick={() => setReportDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                    {selectedReport.title}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Category</Typography>
                  <Chip 
                    label={selectedReport.category} 
                    sx={{ 
                      backgroundColor: INDIA_THEME.saffron + '20',
                      color: INDIA_THEME.saffron 
                    }} 
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Current Status</Typography>
                  <Chip 
                    label={selectedReport.status || 'New'} 
                    sx={{ 
                      backgroundColor: `${getStatusColor(selectedReport.status)}20`,
                      color: getStatusColor(selectedReport.status),
                      fontWeight: 'bold'
                    }} 
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Description</Typography>
                  <Typography>{selectedReport.description}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Location</Typography>
                  <Typography>{selectedReport.location || selectedReport.address}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Reported On</Typography>
                  <Typography>
                    {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${INDIA_THEME.saffron}30` }}>
              <Button onClick={() => setReportDialog(false)} sx={{ color: 'text.secondary' }}>
                Close
              </Button>
              {selectedReport.status !== 'resolved' && selectedReport.status !== 'completed' && (
                <>
                  <Button 
                    variant="outlined"
                    sx={{ 
                      borderColor: INDIA_THEME.navy,
                      color: INDIA_THEME.navy,
                      '&:hover': { backgroundColor: INDIA_THEME.navy + '10' }
                    }}
                    onClick={() => updateReportStatus(selectedReport._id, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{ 
                      background: INDIA_THEME.headerGradient,
                      '&:hover': { opacity: 0.9 }
                    }}
                    onClick={() => updateReportStatus(selectedReport._id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* User Management Dialog */}
      <UserManagementDialog
        open={userDialog.open}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        formData={userFormData}
        onFieldChange={handleFormFieldChange}
        isEdit={userDialog.mode === 'edit'}
        departments={departments}
        theme={INDIA_THEME}
      />

      {/* Notifications Dialog */}
      <Dialog
        open={notificationDialog}
        onClose={() => setNotificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: INDIA_THEME.headerGradient, 
          color: 'white',
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <IconButton onClick={() => setNotificationDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <Box key={notification.id} sx={{ 
              p: 2, 
              borderBottom: '1px solid #eee',
              backgroundColor: notification.read ? 'transparent' : INDIA_THEME.saffron + '05'
            }}>
              <Box display="flex" justifyContent="between" alignItems="start">
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.timestamp.toLocaleString()}
                  </Typography>
                </Box>
                <Chip 
                  label={notification.type}
                  size="small"
                  color={
                    notification.type === 'alert' ? 'error' : 
                    notification.type === 'success' ? 'success' : 'info'
                  }
                />
              </Box>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DistrictAdminDashboard;