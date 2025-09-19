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
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignIcon,
  Comment as CommentIcon,
  PriorityHigh as PriorityHighIcon,
  Person as PersonIcon
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
  municipalityData, // Changed from municipalities to municipalityData
  currentUser, // Add current user prop
  theme 
}) => {
  
  // Debug log - check what data we're receiving
  console.log('🔍 UserManagementDialog Props:');
  console.log('  - municipalityData prop:', municipalityData);
  console.log('  - departments prop:', departments);
  console.log('  - currentUser prop:', currentUser);
  console.log('  - formData.role:', formData.role);
  
  // Filter municipalities based on current user's district
  const filteredMunicipalities = municipalityData.filter(muni => 
    !currentUser?.district || muni.district === currentUser.district
  );
  
  // Use filtered municipalities, fall back to all if none match
  const finalMunicipalities = filteredMunicipalities.length > 0 ? filteredMunicipalities : municipalityData;
  
  // Debug log
  console.log('Municipality filtering:', {
    userDistrict: currentUser?.district,
    totalMunis: municipalityData.length,
    filteredMunis: filteredMunicipalities.length,
    finalMunis: finalMunicipalities.length,
    finalMunicipalitiesData: finalMunicipalities
  });
  
  // Local role change handler
  const handleRoleChange = (newRole) => {
    // Reset role-specific fields when role changes
    if (newRole === 'municipality_admin') {
      onFieldChange('department', ''); // Clear department for municipality admin
    } else if (newRole === 'department_head') {
      onFieldChange('municipality', ''); // Clear municipality for department head  
    }
  };

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
        <Grid container spacing={3} key={formData.role}>
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
                onChange={(e) => {
                  const newRole = e.target.value;
                  onFieldChange('role', newRole);
                  handleRoleChange(newRole); // Use local function
                }}
                label="Role"
              >
                <MenuItem value="department_head">Department Head (requires Department)</MenuItem>
                <MenuItem value="municipality_admin">Municipality Admin (requires Municipality)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Municipality Field - Show for Municipality Admin */}
          {formData.role === 'municipality_admin' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Municipality [FOR MUNI ADMIN ONLY]</InputLabel>
                <Select
                  value={formData.municipality || ''}
                  onChange={(e) => onFieldChange('municipality', e.target.value)}
                  label="Municipality"
                  required
                >
                  {finalMunicipalities.length > 0 ? (
                    finalMunicipalities.map((muni) => (
                      <MenuItem key={muni.id} value={muni.name}>
                        {muni.name} ({muni.district})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No municipalities available for your district</MenuItem>
                  )}
                </Select>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  Showing {finalMunicipalities.length} municipalities for {currentUser?.district || 'your district'}
                </Typography>
              </FormControl>
            </Grid>
          )}
          
          {/* Department Field - Show for Department Head */}
          {formData.role === 'department_head' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department [FOR DEPT HEAD ONLY]</InputLabel>
                <Select
                  value={formData.department || ''}
                  onChange={(e) => onFieldChange('department', e.target.value)}
                  label="Department"
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
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
          disabled={
            !formData.name || 
            !formData.email || 
            (formData.role === 'department_head' && !formData.department) ||
            (formData.role === 'municipality_admin' && !formData.municipality) ||
            (!isEdit && !formData.password)
          }
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

// Municipality Admin Dialog Component
const MunicipalityAdminDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  municipalityData, 
  currentUser, 
  theme 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    municipality: '',
    phone: ''
  });

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.municipality) {
      alert('❌ Please fill in all required fields');
      return;
    }
    
    onSubmit(formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      municipality: '',
      phone: ''
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      email: '',
      password: '',
      municipality: '',
      phone: ''
    });
    onClose();
  };

  // Filter municipalities based on current user's district
  const filteredMunicipalities = municipalityData.filter(muni => 
    !currentUser?.district || muni.district === currentUser.district
  );

  return (
    <Dialog 
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus={false}
      disableEnforceFocus={false}
      keepMounted={false}
      aria-labelledby="municipality-admin-dialog-title"
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
        id="municipality-admin-dialog-title"
        sx={{ 
          background: theme.headerGradient,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <PersonAddIcon />
        Add New Municipality Admin
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Full Name *"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Municipality *</InputLabel>
              <Select
                value={formData.municipality}
                onChange={(e) => handleFieldChange('municipality', e.target.value)}
                label="Municipality"
                required
              >
                {filteredMunicipalities.length > 0 ? (
                  filteredMunicipalities.map((muni) => (
                    <MenuItem key={muni.id} value={muni.name}>
                      {muni.name} ({muni.district})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No municipalities available</MenuItem>
                )}
              </Select>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Showing {filteredMunicipalities.length} municipalities for {currentUser?.district || 'your district'}
              </Typography>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ color: theme.navy, borderColor: theme.navy }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            background: theme.headerGradient,
            '&:hover': { opacity: 0.9 }
          }}
        >
          Create Municipality Admin
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
  
  // Municipality Data - use single data source from backend
  const [municipalityData, setMunicipalityData] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  
  // User Management Data
  const [districtUsers, setDistrictUsers] = useState([]);
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'department_head',
    department: '',
    municipality: '',
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
  
  // Escalations Data
  const [escalationsData, setEscalationsData] = useState({
    escalations: [],
    escalationsByMunicipality: {},
    statistics: {
      totalPending: 0,
      resolvedThisMonth: 0,
      averageResponseTime: 0,
      priorityBreakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    }
  });
  const [loadingEscalations, setLoadingEscalations] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [escalationActionDialog, setEscalationActionDialog] = useState(false);
  const [escalationActionForm, setEscalationActionForm] = useState({
    action: '',
    notes: '',
    priority: '',
    assignTo: '',
    department: ''
  });
  
  // Settings Data
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    district: '',
    phone: '',
    role: '',
    department: '',
    municipality: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    pushNotifications: true,
    weeklyReports: true,
    emergencyAlerts: true
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    sessionTimeout: 30,
    maxFileSize: 10
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState({ open: false, type: '' });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    district: '',
    phone: ''
  });
  
  // UI State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [municipalityAdminDialog, setMunicipalityAdminDialog] = useState({ open: false, admin: null, mode: 'create' });
  const [municipalityAdmins, setMunicipalityAdmins] = useState([]);
  const [selectedMunicipalityAdmin, setSelectedMunicipalityAdmin] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Communications
  const [announcementForm, setAnnouncementForm] = useState({
    message: '',
    sendTo: 'all',
    title: ''
  });
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadMunicipalities();
    loadDistrictUsers();
    loadNotifications();
    loadMunicipalityAdmins();
    loadAnalyticsData();
    loadEscalations();
    loadUserProfile();
    loadNotificationSettings();
    loadSystemSettings();
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
          municipality: userDialog.user.municipality || '',
          password: '' // Don't pre-fill password for edits
        });
      } else if (!isEdit) {
        setUserFormData({
          name: '',
          email: '',
          role: 'department_head',
          department: '',
          municipality: '',
          password: ''
        });
      }
    }
  }, [userDialog]);

  // Helper function to format location for display
  const formatLocation = (location, address) => {
    // If location is a GeoJSON object with coordinates
    if (location && typeof location === 'object' && location.coordinates) {
      const [lng, lat] = location.coordinates;
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    // If location is already a string
    if (typeof location === 'string' && location.trim()) {
      return location;
    }
    // Fallback to address
    if (address && typeof address === 'string') {
      return address;
    }
    return 'Location not specified';
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics from backend - now automatically filtered by district
      const statsResponse = await API.get('/admin/stats');
      console.log('Dashboard Stats API response:', statsResponse.data);
      
      if (statsResponse.data.success && statsResponse.data.stats) {
        const backendStats = statsResponse.data.stats;
        
        // Map backend data to dashboard stats using the exact field names
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
            departmentPerformance: backendStats.departmentPerformance || [],
            municipalityPerformance: backendStats.municipalityPerformance || []
          };
          setAnalyticsData(analyticsData);
        } else {
          // Empty analytics data (no dummy data)
          setAnalyticsData({
            commonIssues: [],
            departmentPerformance: [],
            municipalityPerformance: []
          });
        }
        
        console.log(`✅ Loaded district-specific data for: ${backendStats.district || 'All districts'}`);
      }
      
      // Load reports - now automatically filtered by district on backend
      try {
        const reportsResponse = await API.get('/admin/reports');
        console.log('Reports API response:', reportsResponse.data);
        
        // Handle the new response format
        let reportsData = [];
        if (reportsResponse.data.success && Array.isArray(reportsResponse.data.reports)) {
          reportsData = reportsResponse.data.reports;
        } else if (Array.isArray(reportsResponse.data.data)) {
          reportsData = reportsResponse.data.data;
        } else if (Array.isArray(reportsResponse.data)) {
          reportsData = reportsResponse.data;
        }
        
        // No need for client-side district filtering - backend handles this now
        setReports(reportsData);
        console.log(`✅ Loaded ${reportsData.length} district-specific reports`);
        
      } catch (reportsError) {
        console.error('Error loading reports data:', reportsError);
        setReports([]);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data instead of dummy data
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
      console.log('🔄 Loading municipality data from backend...');
      
      // Load municipalities from backend using the dedicated endpoint
      const municipalityResponse = await API.get('/admin/municipalities');
      console.log('✅ Municipalities endpoint response:', municipalityResponse.data);
      
      if (municipalityResponse.data.success && Array.isArray(municipalityResponse.data.municipalities)) {
        const municipalities = municipalityResponse.data.municipalities;
        
        const municipalityData = municipalities.map((muni) => ({
          id: muni._id,
          name: muni.name,
          district: muni.district,
          reports: muni.totalReports || 0,
          resolved: muni.resolvedReports || 0,
          pending: muni.pendingReports || 0,
          performance: muni.totalReports > 0 ? 
            parseFloat(((muni.resolvedReports || 0) / muni.totalReports * 100).toFixed(1)) : 0,
          head: muni.adminName || 'Not Assigned',
          contact: muni.adminEmail || 'No Contact',
          createdAt: muni.createdAt
        }));
        
        setMunicipalityData(municipalityData);
        console.log(`✅ Loaded ${municipalityData.length} municipalities from backend`);
      } else {
        console.log('⚠️ No municipalities found in response');
        setMunicipalityData([]);
      }
    } catch (error) {
      console.error('❌ Error loading municipality data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMunicipalityData([]);
    }
  };

  const loadDistrictUsers = async () => {
    try {
      // Load district users from backend - should be filtered by district automatically
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
        console.log(`✅ Loaded ${users.length} district users`);
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
        console.log(`✅ Loaded ${notifications.length} notifications (${notifications.filter(n => !n.read).length} unread)`);
      } else {
        // No fallback notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // No fallback notifications on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const loadMunicipalityAdmins = async () => {
    try {
      const response = await API.get('/admin/users');
      if (response.data.success) {
        const municipalityAdmins = response.data.users.filter(
          user => user.role === 'municipality_admin'
        );
        setMunicipalityAdmins(municipalityAdmins);
        console.log(`✅ Loaded ${municipalityAdmins.length} municipality admins`);
      }
    } catch (error) {
      console.error('Error loading municipality admins:', error);
      setMunicipalityAdmins([]);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      console.log('🔄 Loading analytics data from backend...');
      const response = await API.get('/admin/analytics');
      console.log('Analytics API response:', response.data);
      
      if (response.data.success) {
        const backendAnalytics = response.data;
        
        // Map backend analytics data to frontend format
        const analyticsData = {
          commonIssues: backendAnalytics.categoryData || [],
          departmentPerformance: backendAnalytics.departmentPerformance || [],
          municipalityPerformance: [], // We can populate this if needed
          monthlyTrends: backendAnalytics.issuesTrend || [],
          recentStats: backendAnalytics.recentStats || [],
          locationHeatmap: backendAnalytics.locationHeatmap || [],
          // Performance metrics from backend data
          resolutionRate: backendAnalytics.resolutionRate || 0,
          avgResponseTime: backendAnalytics.avgResponseTime || 0,
          totalReports: backendAnalytics.totalReports || 0,
          resolvedReports: backendAnalytics.resolvedReports || 0
        };
        
        setAnalyticsData(analyticsData);
        console.log('✅ Loaded analytics data:', analyticsData);
      } else {
        console.log('⚠️ No analytics data found in response');
        setAnalyticsData({
          commonIssues: [],
          departmentPerformance: [],
          municipalityPerformance: []
        });
      }
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      setAnalyticsData({
        commonIssues: [],
        departmentPerformance: [],
      });
    }
  };

  const loadEscalations = async () => {
    try {
      setLoadingEscalations(true);
      console.log('🔄 Loading escalations data from backend...');
      
      const response = await API.get('/admin/escalations');
      console.log('Escalations API response:', response.data);
      
      if (response.data.success) {
        setEscalationsData(response.data.data);
        console.log('✅ Loaded escalations data:', response.data.data);
      } else {
        console.log('⚠️ No escalations data found in response');
        setEscalationsData({
          escalations: [],
          escalationsByMunicipality: {},
          statistics: {
            totalPending: 0,
            resolvedThisMonth: 0,
            averageResponseTime: 0,
            priorityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error loading escalations data:', error);
      setEscalationsData({
        escalations: [],
        escalationsByMunicipality: {},
        statistics: {
          totalPending: 0,
          resolvedThisMonth: 0,
          averageResponseTime: 0,
          priorityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 }
        }
      });
    } finally {
      setLoadingEscalations(false);
    }
  };

  const handleEscalationAction = async (escalationId, action, formData) => {
    try {
      console.log(`🔄 Performing escalation action: ${action} for ID: ${escalationId}`);
      
      const response = await API.post(`/admin/escalations/${escalationId}/action`, {
        action,
        ...formData
      });
      
      console.log('Escalation action response:', response.data);
      
      if (response.data.success) {
        // Reload escalations data to reflect changes
        await loadEscalations();
        setEscalationActionDialog(false);
        setSelectedEscalation(null);
        setEscalationActionForm({
          action: '',
          notes: '',
          priority: '',
          assignTo: '',
          department: ''
        });
      }
    } catch (error) {
      console.error('❌ Error performing escalation action:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      console.log('🔄 Loading user profile...');
      const response = await API.get('/admin/settings/profile');
      
      if (response.data.success) {
        const profile = response.data.profile;
        setUserProfile(profile);
        setProfileForm({
          name: profile.name || '',
          email: profile.email || '',
          district: profile.district || '',
          phone: profile.phone || ''
        });
        console.log('✅ User profile loaded:', profile);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      console.log('🔄 Loading notification settings...');
      const response = await API.get('/admin/settings/notifications');
      
      if (response.data.success) {
        setNotificationSettings(response.data.settings);
        console.log('✅ Notification settings loaded:', response.data.settings);
      }
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
      // Use defaults if loading fails
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: false,
        pushNotifications: true,
        weeklyReports: true,
        emergencyAlerts: true
      });
    }
  };

  const loadSystemSettings = async () => {
    try {
      console.log('🔄 Loading system settings...');
      const response = await API.get('/admin/settings/system');
      
      if (response.data.success) {
        setSystemSettings(response.data.settings);
        console.log('✅ System settings loaded:', response.data.settings);
      }
    } catch (error) {
      console.error('❌ Error loading system settings:', error);
      // Use defaults if loading fails
      setSystemSettings({
        maintenanceMode: false,
        autoBackup: true,
        sessionTimeout: 30,
        maxFileSize: 10
      });
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setLoadingSettings(true);
      console.log('🔄 Updating user profile...');
      
      const response = await API.put('/admin/settings/profile', profileData);
      
      if (response.data.success) {
        await loadUserProfile(); // Reload fresh data
        setSettingsDialog({ open: false, type: '' });
        console.log('✅ Profile updated successfully');
        return { success: true, message: 'Profile updated successfully' };
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update profile' };
    } finally {
      setLoadingSettings(false);
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      setLoadingSettings(true);
      console.log('🔄 Changing password...');
      
      const response = await API.put('/admin/settings/password', passwordData);
      
      if (response.data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSettingsDialog({ open: false, type: '' });
        console.log('✅ Password changed successfully');
        return { success: true, message: 'Password changed successfully' };
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to change password' };
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateNotificationSettings = async (settings) => {
    try {
      setLoadingSettings(true);
      console.log('🔄 Updating notification settings...');
      
      const response = await API.put('/admin/settings/notifications', settings);
      
      if (response.data.success) {
        setNotificationSettings(settings);
        console.log('✅ Notification settings updated');
        return { success: true, message: 'Notification settings updated' };
      }
    } catch (error) {
      console.error('❌ Error updating notification settings:', error);
      return { success: false, message: 'Failed to update notification settings' };
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleEscalationActionClick = (escalation, action) => {
    setSelectedEscalation(escalation);
    setEscalationActionForm(prev => ({ ...prev, action }));
    setEscalationActionDialog(true);
  };

  const handleSubmitEscalationAction = async () => {
    if (!selectedEscalation) return;
    
    await handleEscalationAction(selectedEscalation._id, escalationActionForm.action, {
      notes: escalationActionForm.notes,
      priority: escalationActionForm.priority,
      assignTo: escalationActionForm.assignTo,
      department: escalationActionForm.department
    });
  };

  const handleNotificationSettingChange = async (setting, value) => {
    const newSettings = { ...notificationSettings, [setting]: value };
    setNotificationSettings(newSettings);
    await updateNotificationSettings(newSettings);
  };

  const handleProfileSave = async () => {
    const result = await updateUserProfile(profileForm);
    if (result && result.success) {
      console.log('Profile updated successfully');
    } else if (result) {
      console.error('Profile update failed:', result.message);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    const result = await changeUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    if (result && result.success) {
      alert('Password changed successfully');
    } else if (result) {
      alert(result.message);
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
      console.log('🔄 Creating user with data:', userData);
      console.log('🔄 User data keys:', Object.keys(userData));
      console.log('🔄 User data values:', Object.values(userData));
      
      // Validate the data before sending
      const requiredFields = ['name', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      if (missingFields.length > 0) {
        alert(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const response = await API.post('/admin/users', userData);
      console.log('✅ Create user response:', response.data);
      
      if (response.data.success) {
        alert(`✅ User created successfully! Email: ${userData.email}`);
        // Refresh the user list
        await loadDistrictUsers();
        // Use setTimeout to ensure proper focus management
        setTimeout(() => {
          setUserDialog({ open: false, user: null, mode: 'create' });
        }, 0);
        console.log('User created successfully:', response.data.message);
      } else {
        alert(`❌ Failed to create user: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Special handling for duplicate email error
        if (errorMessage.includes('already exists')) {
          errorMessage += '\n\n💡 Tip: Try using a different email address or check if this user can already login.';
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Error creating user: ${errorMessage}`);
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

  // Municipality Admin Management Functions
  const handleCreateMunicipalityAdmin = async (adminData) => {
    try {
      console.log('🔄 Creating municipality admin with data:', adminData);
      
      // Validate the data before sending
      const requiredFields = ['name', 'email', 'password', 'municipality'];
      const missingFields = requiredFields.filter(field => !adminData[field]);
      if (missingFields.length > 0) {
        alert(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Add role to the data
      const userData = {
        ...adminData,
        role: 'municipality_admin',
        district: currentUser?.district || 'Bokaro District'
      };
      
      const response = await API.post('/admin/users', userData);
      console.log('✅ Create municipality admin response:', response.data);
      
      if (response.data.success) {
        alert(`✅ Municipality Admin created successfully! Email: ${adminData.email}`);
        // Refresh the municipality data
        await loadMunicipalities();
        // Close the dialog
        setTimeout(() => {
          setMunicipalityAdminDialog({ open: false, admin: null, mode: 'create' });
        }, 0);
        console.log('Municipality admin created successfully:', response.data.message);
      } else {
        alert(`❌ Failed to create municipality admin: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating municipality admin:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Special handling for duplicate email error
        if (errorMessage.includes('already exists')) {
          errorMessage += '\n\n💡 Tip: Try using a different email address or check if this admin already exists.';
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Error creating municipality admin: ${errorMessage}`);
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

  const assignToMunicipalityAdmin = async () => {
    if (!selectedMunicipalityAdmin || !selectedReport) return;
    
    try {
      // Use the admin assignment endpoint which supports different assignee types
      await API.put(`/admin/reports/${selectedReport._id}/assign`, {
        workerId: selectedMunicipalityAdmin, // Use workerId for the admin endpoint
        notes: `Assigned to municipality admin for ${selectedReport.category} issue handling.`
      });
      
      // Update the report status to 'assigned'
      await updateReportStatus(selectedReport._id, 'assigned');
      
      setAssignmentDialog(false);
      setSelectedMunicipalityAdmin('');
      loadDashboardData();
      
      console.log('✅ Report assigned to municipality admin successfully');
    } catch (error) {
      console.error('Error assigning to municipality admin:', error);
    }
  };

  const openAssignmentDialog = (report) => {
    setSelectedReport(report);
    setAssignmentDialog(true);
  };

  const closeAssignmentDialog = () => {
    setAssignmentDialog(false);
    setSelectedMunicipalityAdmin('');
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

  // Municipality Management Functions
  const handleViewMunicipalityDetails = (municipality) => {
    setSelectedMunicipality(municipality);
    // You could open a detailed dialog here if needed
    console.log('Viewing municipality details:', municipality);
    alert(`Municipality: ${municipality.name}\nAdmin: ${municipality.head}\nContact: ${municipality.contact}\nReports: ${municipality.reports}\nResolved: ${municipality.resolved}\nPending: ${municipality.pending}\nPerformance: ${municipality.performance}%`);
  };

  const handleManageMunicipalityStaff = (municipality) => {
    setSelectedMunicipality(municipality);
    // This could navigate to a staff management page or open a staff management dialog
    console.log('Managing staff for municipality:', municipality);
    alert(`Staff management for ${municipality.name} is not yet implemented.\n\nThis feature would allow you to:\n- View municipality staff\n- Add new staff members\n- Edit staff permissions\n- Remove staff members`);
  };

  const handleAddMunicipalityAdmin = () => {
    setMunicipalityAdminDialog({ open: true, admin: null, mode: 'create' });
  };

  // Communications Functions
  const sendAnnouncement = async () => {
    if (!announcementForm.message.trim()) {
      alert('Please enter an announcement message.');
      return;
    }

    try {
      setSendingAnnouncement(true);
      
      const response = await API.post('/admin/announcements', {
        title: announcementForm.title || 'District Admin Announcement',
        message: announcementForm.message,
        sendTo: announcementForm.sendTo,
        priority: 'medium'
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}\n\nSent to ${response.data.recipientCount} recipients.`);
        
        // Reset form
        setAnnouncementForm({
          message: '',
          sendTo: 'all',
          title: ''
        });
        
        // Refresh notifications to show the sent announcement
        await loadNotifications();
      } else {
        alert(`❌ Failed to send announcement: ${response.data.message}`);
      }
      
    } catch (error) {
      console.error('Error sending announcement:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send announcement. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await API.put(`/admin/notifications/${notificationId}/read`);
      if (response.data.success) {
        // Refresh notifications
        await loadNotifications();
        console.log('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await API.put('/admin/notifications/mark-all-read');
      if (response.data.success) {
        await loadNotifications();
        console.log('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Analytics Export Functions
  const exportAnalyticsReport = async (format = 'json', timeRange = '6months') => {
    try {
      console.log(`🔄 Exporting analytics report as ${format} for ${timeRange}...`);
      
      const response = await API.get('/admin/analytics/export', {
        params: { format, timeRange },
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        // Handle JSON download
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sevatrack_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } else {
        // Handle blob download (PDF, CSV, Excel)
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        
        const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
        link.download = `sevatrack_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      alert(`✅ ${format.toUpperCase()} report exported successfully!`);
      
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      alert(`❌ Failed to export ${format.toUpperCase()} report. Please try again.`);
    }
  };

  const emailAnalyticsReport = async () => {
    try {
      // This would be implemented on the backend
      alert('📧 Email functionality will be implemented soon.\n\nFor now, you can download reports and share them manually.');
    } catch (error) {
      console.error('Error emailing report:', error);
      alert('❌ Failed to email report. Please try again.');
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
              {Array.isArray(municipalityData) && municipalityData.length > 0 ? (
                municipalityData.map((municipality, index) => (
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
          onClick={handleAddMunicipalityAdmin}
          sx={{ 
            background: INDIA_THEME.headerGradient,
            '&:hover': { opacity: 0.9 }
          }}
        >
          Add Municipality Admin
        </Button>
      </Box>

      <Grid container spacing={3}>
        {municipalityData.length > 0 ? (
          municipalityData.map((municipality) => (
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
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Administrator:</strong> {municipality.head}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Contact:</strong> {municipality.contact}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>District:</strong> {municipality.district}
                    </Typography>
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
                <Button 
                  size="small" 
                  sx={{ color: INDIA_THEME.navy }}
                  onClick={() => handleViewMunicipalityDetails(municipality)}
                >
                  View Details
                </Button>
                <Button 
                  size="small" 
                  sx={{ color: INDIA_THEME.saffron }}
                  onClick={() => handleManageMunicipalityStaff(municipality)}
                >
                  Manage Staff
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))) : (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center', background: INDIA_THEME.cardGradient }}>
              <BusinessIcon sx={{ fontSize: 64, color: INDIA_THEME.navy, mb: 2 }} />
              <Typography variant="h6" color={INDIA_THEME.navy} gutterBottom>
                No Municipality Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Municipality data is being loaded from the backend. Please check your connection or contact support.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={loadMunicipalities}
                sx={{ color: INDIA_THEME.navy, borderColor: INDIA_THEME.navy }}
              >
                Reload Data
              </Button>
            </Paper>
          </Grid>
        )}
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
                {municipalityData.map(m => (
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
                      <Tooltip title="Assign to Municipality">
                        <IconButton 
                          size="small"
                          onClick={() => openAssignmentDialog(report)}
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
    // Validate required fields based on role
    if (!userFormData.name || !userFormData.email) {
      alert('Please fill in all required fields (Name and Email)');
      return;
    }
    
    if (userFormData.role === 'department_head' && !userFormData.department) {
      alert('Please select a Department for Department Head role');
      return;
    }
    
    if (userFormData.role === 'municipality_admin' && !userFormData.municipality) {
      alert('Please select a Municipality for Municipality Admin role');
      return;
    }
    
    if (!userDialog.mode || userDialog.mode === 'create') {
      if (!userFormData.password) {
        alert('Please enter a password');
        return;
      }
    }
    
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
        municipality: '',
        password: ''
      });
    }, 0);
  };

  // Analytics Section
  const renderAnalytics = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy}>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Analytics & Reports
        </Typography>
        <Button
          variant="outlined"
          onClick={loadAnalyticsData}
          sx={{ color: INDIA_THEME.saffron, borderColor: INDIA_THEME.saffron }}
        >
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Common Issues Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Most Common Issues
              </Typography>
              {analyticsData.commonIssues && analyticsData.commonIssues.length > 0 ? (
                analyticsData.commonIssues.map((issue, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {issue.name || issue.category}
                      </Typography>
                      <Typography variant="body2" color={INDIA_THEME.saffron}>
                        {issue.value || issue.count}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={issue.value || (issue.count / (analyticsData.commonIssues[0]?.count || 1)) * 100} 
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: issue.color || INDIA_THEME.saffron
                        }
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No issue data available. Reports data will appear here once citizens start submitting reports.
                  </Typography>
                </Box>
              )}
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
                    onClick={() => exportAnalyticsReport('csv', '6months')}
                    sx={{ 
                      borderColor: INDIA_THEME.saffron,
                      color: INDIA_THEME.saffron,
                      '&:hover': { 
                        backgroundColor: INDIA_THEME.saffron + '10',
                        borderColor: INDIA_THEME.saffron
                      }
                    }}
                  >
                    Download CSV Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportAnalyticsReport('json', '6months')}
                    sx={{ 
                      borderColor: INDIA_THEME.green,
                      color: INDIA_THEME.green,
                      '&:hover': { 
                        backgroundColor: INDIA_THEME.green + '10',
                        borderColor: INDIA_THEME.green
                      }
                    }}
                  >
                    Download JSON Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={emailAnalyticsReport}
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
                      {analyticsData.resolutionRate || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Resolution Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.green + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.green}>
                      {analyticsData.avgResponseTime || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time (Hours)
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.navy + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.navy}>
                      {analyticsData.totalReports || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box textAlign="center" p={2} sx={{ background: INDIA_THEME.saffron + '10', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.saffron}>
                      {analyticsData.resolvedReports || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolved Reports
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        {analyticsData.departmentPerformance && analyticsData.departmentPerformance.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: `1px solid ${INDIA_THEME.navy}30`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={3}>
                  <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Department Performance
                </Typography>
                <Grid container spacing={2}>
                  {analyticsData.departmentPerformance.map((dept, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Box p={2} sx={{ background: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                          {dept.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Efficiency: {dept.efficiency}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Response Time: {dept.responseTime}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={dept.efficiency} 
                          sx={{
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: dept.efficiency >= 80 ? INDIA_THEME.green : 
                                               dept.efficiency >= 60 ? INDIA_THEME.saffron : '#d32f2f'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
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
                label="Announcement Title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                placeholder="Enter announcement title..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
                placeholder="Type your announcement message here..."
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Send To</InputLabel>
                <Select 
                  value={announcementForm.sendTo} 
                  onChange={(e) => setAnnouncementForm({...announcementForm, sendTo: e.target.value})}
                  label="Send To"
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="municipality_admins">
                    Municipality Admins ({municipalityAdmins.length} users)
                  </MenuItem>
                  <MenuItem value="department_heads">
                    Department Heads ({districtUsers.filter(u => u.role === 'department_head').length} users)
                  </MenuItem>
                  <MenuItem value="citizens">All Citizens</MenuItem>
                  {municipalityData.length > 0 && (
                    <>
                      <MenuItem disabled>─── Specific Municipalities ───</MenuItem>
                      {municipalityData.map((municipality) => (
                        <MenuItem key={municipality.id} value={`municipality_${municipality.id}`}>
                          {municipality.name} Admin
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Select>
              </FormControl>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendAnnouncement}
                disabled={sendingAnnouncement || !announcementForm.message.trim()}
                sx={{ 
                  background: INDIA_THEME.headerGradient,
                  '&:hover': { opacity: 0.9 }
                }}
              >
                {sendingAnnouncement ? 'Sending...' : 'Send Announcement'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy}>
                  Recent Notifications ({notifications.length})
                </Typography>
                {unreadCount > 0 && (
                  <Button 
                    size="small" 
                    onClick={markAllNotificationsAsRead}
                    sx={{ color: INDIA_THEME.saffron }}
                  >
                    Mark All Read ({unreadCount})
                  </Button>
                )}
              </Box>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Box 
                      key={notification.id || notification._id} 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        backgroundColor: notification.read ? '#f5f5f5' : '#e3f2fd', 
                        borderRadius: 1,
                        border: notification.read ? 'none' : `1px solid ${INDIA_THEME.navy}30`
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp ? new Date(notification.timestamp).toLocaleString() :
                             notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 
                             'No date'}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
                          <Chip 
                            label={notification.type || 'info'}
                            size="small"
                            color={notification.type === 'alert' ? 'error' : 
                                   notification.type === 'success' ? 'success' : 
                                   notification.type === 'announcement' ? 'warning' : 'info'}
                          />
                          {!notification.read && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => markNotificationAsRead(notification.id || notification._id)}
                              sx={{ 
                                fontSize: '0.7rem', 
                                padding: '2px 8px',
                                color: INDIA_THEME.navy,
                                borderColor: INDIA_THEME.navy
                              }}
                            >
                              Mark Read
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Escalations Section
  const renderEscalations = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Escalation Handling
        </Typography>
        <Button
          variant="outlined"
          onClick={loadEscalations}
          disabled={loadingEscalations}
          sx={{ color: INDIA_THEME.saffron, borderColor: INDIA_THEME.saffron }}
        >
          {loadingEscalations ? <CircularProgress size={20} /> : 'Refresh Data'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage cases escalated from Municipality Admins that require district-level intervention.
        Reports are automatically escalated based on priority and time thresholds.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
              Pending Escalations ({escalationsData.escalations.length})
            </Typography>
            {loadingEscalations ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Loading escalations...
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Report ID</TableCell>
                      <TableCell>Municipality</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Days Pending</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {escalationsData.escalations.length > 0 ? (
                      escalationsData.escalations.map((escalation) => {
                        const daysPending = Math.ceil((new Date() - new Date(escalation.createdAt)) / (1000 * 60 * 60 * 24));
                        return (
                          <TableRow key={escalation._id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                #{escalation._id.slice(-6)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {escalation.urbanLocalBody || 'Unknown'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={escalation.category} 
                                size="small"
                                sx={{ backgroundColor: INDIA_THEME.saffron + '20', color: INDIA_THEME.navy }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={escalation.priority} 
                                size="small"
                                color={escalation.priority === 'Critical' ? 'error' : 
                                       escalation.priority === 'High' ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                color={daysPending > 10 ? 'error' : daysPending > 5 ? 'warning.main' : 'text.primary'}
                                fontWeight={daysPending > 5 ? 'bold' : 'normal'}
                              >
                                {daysPending} days
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Resolve">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEscalationActionClick(escalation, 'resolve')}
                                    sx={{ color: INDIA_THEME.green }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reassign">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEscalationActionClick(escalation, 'reassign')}
                                    sx={{ color: INDIA_THEME.saffron }}
                                  >
                                    <AssignIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Add Comment">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEscalationActionClick(escalation, 'addComment')}
                                    sx={{ color: INDIA_THEME.navy }}
                                  >
                                    <CommentIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Update Priority">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEscalationActionClick(escalation, 'updatePriority')}
                                    sx={{ color: '#d32f2f' }}
                                  >
                                    <PriorityHighIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No pending escalations
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Great job! All reports are being handled within normal timeframes.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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
                  {escalationsData.statistics.totalPending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Escalations
                </Typography>
              </Box>
              <Box textAlign="center" mb={2}>
                <Typography variant="h3" fontWeight="bold" color={INDIA_THEME.green}>
                  {escalationsData.statistics.resolvedThisMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved This Month
                </Typography>
              </Box>
              
              {/* Priority Breakdown */}
              <Typography variant="subtitle2" fontWeight="bold" color={INDIA_THEME.navy} mt={3} mb={2}>
                Priority Breakdown
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Critical</Typography>
                  <Chip 
                    label={escalationsData.statistics.priorityBreakdown.critical} 
                    size="small" 
                    color="error" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">High</Typography>
                  <Chip 
                    label={escalationsData.statistics.priorityBreakdown.high} 
                    size="small" 
                    color="warning" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Medium</Typography>
                  <Chip 
                    label={escalationsData.statistics.priorityBreakdown.medium} 
                    size="small" 
                    color="default" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Low</Typography>
                  <Chip 
                    label={escalationsData.statistics.priorityBreakdown.low} 
                    size="small" 
                    color="default" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Escalation Action Dialog */}
      <Dialog open={escalationActionDialog} onClose={() => setEscalationActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {escalationActionForm.action === 'resolve' ? 'Resolve Escalation' :
           escalationActionForm.action === 'reassign' ? 'Reassign Escalation' :
           escalationActionForm.action === 'updatePriority' ? 'Update Priority' :
           'Add Comment'}
        </DialogTitle>
        <DialogContent>
          {selectedEscalation && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Report ID: #{selectedEscalation._id.slice(-6)} | Category: {selectedEscalation.category}
              </Typography>
              <Typography variant="body2" mt={1}>
                {selectedEscalation.title}
              </Typography>
            </Box>
          )}

          {escalationActionForm.action === 'reassign' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={escalationActionForm.department}
                  onChange={(e) => setEscalationActionForm(prev => ({ ...prev, department: e.target.value }))}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Assign To (Worker ID)"
                value={escalationActionForm.assignTo}
                onChange={(e) => setEscalationActionForm(prev => ({ ...prev, assignTo: e.target.value }))}
                placeholder="Enter worker employee ID"
              />
            </>
          )}

          {escalationActionForm.action === 'updatePriority' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>New Priority</InputLabel>
              <Select
                value={escalationActionForm.priority}
                onChange={(e) => setEscalationActionForm(prev => ({ ...prev, priority: e.target.value }))}
                label="New Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label={escalationActionForm.action === 'addComment' ? 'Comment' : 'Notes (Optional)'}
            value={escalationActionForm.notes}
            onChange={(e) => setEscalationActionForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={escalationActionForm.action === 'resolve' ? 'Describe how the escalation was resolved...' :
                        escalationActionForm.action === 'reassign' ? 'Reason for reassignment...' :
                        escalationActionForm.action === 'updatePriority' ? 'Reason for priority change...' :
                        'Add your comment...'}
            required={escalationActionForm.action === 'addComment'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalationActionDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitEscalationAction}
            disabled={escalationActionForm.action === 'addComment' && !escalationActionForm.notes.trim()}
            sx={{ 
              background: INDIA_THEME.headerGradient,
              '&:hover': { opacity: 0.9 }
            }}
          >
            {escalationActionForm.action === 'resolve' ? 'Resolve' :
             escalationActionForm.action === 'reassign' ? 'Reassign' :
             escalationActionForm.action === 'updatePriority' ? 'Update' :
             'Add Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Settings Section
  const renderSettings = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color={INDIA_THEME.navy}>
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Settings & Security
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            loadUserProfile();
            loadNotificationSettings();
            loadSystemSettings();
          }}
          disabled={loadingSettings}
          sx={{ color: INDIA_THEME.saffron, borderColor: INDIA_THEME.saffron }}
        >
          {loadingSettings ? <CircularProgress size={20} /> : 'Refresh Settings'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.navy}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Profile Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    variant="outlined"
                    size="small"
                    type="email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="District"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, district: e.target.value }))}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      onClick={() => updateUserProfile(profileForm)}
                      disabled={loadingSettings}
                      sx={{ 
                        background: INDIA_THEME.headerGradient,
                        '&:hover': { opacity: 0.9 }
                      }}
                    >
                      {loadingSettings ? <CircularProgress size={20} /> : 'Update Profile'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setProfileForm({
                          name: userProfile.name || '',
                          email: userProfile.email || '',
                          district: userProfile.district || '',
                          phone: userProfile.phone || ''
                        });
                      }}
                      sx={{ 
                        borderColor: INDIA_THEME.navy,
                        color: INDIA_THEME.navy
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.saffron}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Security Settings
              </Typography>
              <Box mb={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.twoFactorAuth}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, twoFactorAuth: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Box>
              <Box mb={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, emailNotifications: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="Email Notifications"
                />
              </Box>
              <Box mb={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, smsNotifications: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="SMS Notifications"
                />
              </Box>
              <Box mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<KeyIcon />}
                  onClick={() => setSettingsDialog({ open: true, type: 'password' })}
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
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Notification Preferences
              </Typography>
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, pushNotifications: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="Push Notifications"
                />
              </Box>
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, weeklyReports: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="Weekly Reports"
                />
              </Box>
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.emergencyAlerts}
                      onChange={(e) => {
                        const newSettings = { ...notificationSettings, emergencyAlerts: e.target.checked };
                        setNotificationSettings(newSettings);
                        updateNotificationSettings(newSettings);
                      }}
                    />
                  }
                  label="Emergency Alerts"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Emergency alerts cannot be disabled for security reasons
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Logs & System Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: `1px solid ${INDIA_THEME.green}30`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color={INDIA_THEME.navy} mb={2}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Information
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role: {userProfile.role || 'District Admin'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  District: {userProfile.district || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Login: {new Date().toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Account Status: Active
                </Typography>
              </Box>
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
                View Activity Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={settingsDialog.open && settingsDialog.type === 'password'} onClose={() => setSettingsDialog({ open: false, type: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            required
            helperText="Password must be at least 8 characters with uppercase, lowercase, number and special character"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
            error={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
            helperText={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog({ open: false, type: '' })}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={async () => {
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                alert('Passwords do not match');
                return;
              }
              const result = await changeUserPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
              });
              if (result.success) {
                alert('Password changed successfully');
              } else {
                alert(result.message);
              }
            }}
            disabled={loadingSettings || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            sx={{ 
              background: INDIA_THEME.headerGradient,
              '&:hover': { opacity: 0.9 }
            }}
          >
            {loadingSettings ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
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
                <Typography variant="h6" component="div" fontWeight="bold">
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
                
                {/* Report Image */}
                {selectedReport.imageUrl && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>Report Image</Typography>
                    <Box sx={{ 
                      border: `1px solid ${INDIA_THEME.saffron}30`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      maxWidth: '100%'
                    }}>
                      <img 
                        src={selectedReport.imageUrl}
                        alt={selectedReport.title || 'Report image'}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <Box sx={{ 
                        display: 'none', 
                        p: 3, 
                        textAlign: 'center',
                        color: 'text.secondary',
                        backgroundColor: '#f5f5f5'
                      }}>
                        <Typography variant="body2">
                          Image could not be loaded
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Resolution Image if available */}
                {selectedReport.resolutionImageUrl && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>Resolution Image (After)</Typography>
                    <Box sx={{ 
                      border: `1px solid ${INDIA_THEME.green}30`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      maxWidth: '100%'
                    }}>
                      <img 
                        src={selectedReport.resolutionImageUrl}
                        alt="Resolution image"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <Box sx={{ 
                        display: 'none', 
                        p: 3, 
                        textAlign: 'center',
                        color: 'text.secondary',
                        backgroundColor: '#f5f5f5'
                      }}>
                        <Typography variant="body2">
                          Resolution image could not be loaded
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Work Progress Photos if available */}
                {selectedReport.workProgressPhotos && selectedReport.workProgressPhotos.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" mb={2}>Work Progress Photos</Typography>
                    <Grid container spacing={2}>
                      {selectedReport.workProgressPhotos.map((photo, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                          <Box sx={{ 
                            border: `1px solid ${INDIA_THEME.navy}30`,
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={photo.url}
                              alt={`Progress photo ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <Box sx={{ 
                              display: 'flex', 
                              p: 2, 
                              textAlign: 'center',
                              color: 'text.secondary',
                              backgroundColor: '#f5f5f5',
                              height: '200px',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography variant="caption">
                                Image unavailable
                              </Typography>
                            </Box>
                          </Box>
                          {photo.type && (
                            <Chip 
                              label={photo.type} 
                              size="small"
                              sx={{ 
                                mt: 1,
                                backgroundColor: photo.type === 'completion' ? INDIA_THEME.green + '20' : INDIA_THEME.navy + '20',
                                color: photo.type === 'completion' ? INDIA_THEME.green : INDIA_THEME.navy
                              }} 
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Location</Typography>
                  <Typography>{formatLocation(selectedReport.location, selectedReport.address)}</Typography>
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
                    startIcon={<AssignmentIcon />}
                    sx={{ 
                      borderColor: INDIA_THEME.saffron,
                      color: INDIA_THEME.saffron,
                      '&:hover': { backgroundColor: INDIA_THEME.saffron + '10' }
                    }}
                    onClick={() => openAssignmentDialog(selectedReport)}
                  >
                    Assign to Municipality
                  </Button>
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
        municipalityData={municipalityData} // Changed from municipalities to municipalityData
        currentUser={user} // Pass current user for district filtering
        theme={INDIA_THEME}
      />

      {/* Municipality Admin Dialog */}
      <MunicipalityAdminDialog
        open={municipalityAdminDialog.open}
        onClose={() => setMunicipalityAdminDialog({ open: false, admin: null, mode: 'create' })}
        onSubmit={handleCreateMunicipalityAdmin}
        municipalityData={municipalityData}
        currentUser={user}
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
          <Typography variant="h6" component="div" fontWeight="bold">
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

      {/* Municipality Assignment Dialog */}
      <Dialog
        open={assignmentDialog}
        onClose={closeAssignmentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, border: `2px solid ${INDIA_THEME.saffron}30` }
        }}
      >
        <DialogTitle sx={{ 
          background: INDIA_THEME.headerGradient, 
          color: 'white',
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon />
            <Typography variant="h6" component="div" fontWeight="bold">
              Assign to Municipality Admin
            </Typography>
          </Box>
          <IconButton onClick={closeAssignmentDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedReport && (
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Report Details
              </Typography>
              <Typography variant="body1" fontWeight="bold" color={INDIA_THEME.navy}>
                #{selectedReport._id?.slice(-6) || 'N/A'} - {selectedReport.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedReport.category} | {selectedReport.address}
              </Typography>
            </Box>
          )}
          
          <FormControl fullWidth>
            <InputLabel id="municipality-admin-select-label">
              Select Municipality Admin
            </InputLabel>
            <Select
              labelId="municipality-admin-select-label"
              value={selectedMunicipalityAdmin}
              onChange={(e) => setSelectedMunicipalityAdmin(e.target.value)}
              label="Select Municipality Admin"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: INDIA_THEME.saffron },
                  '&.Mui-focused fieldset': { borderColor: INDIA_THEME.saffron }
                }
              }}
            >
              {municipalityAdmins.length === 0 ? (
                <MenuItem disabled>No municipality admins available</MenuItem>
              ) : (
                municipalityAdmins.map((admin) => (
                  <MenuItem key={admin._id} value={admin._id}>
                    <Box>
                      <Typography variant="body1">{admin.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admin.municipality || admin.department || 'General'} | {admin.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          {selectedMunicipalityAdmin && (
            <Alert 
              severity="info" 
              sx={{ mt: 2, borderColor: INDIA_THEME.navy + '30' }}
            >
              This report will be assigned to the selected municipality admin for further action.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${INDIA_THEME.saffron}30` }}>
          <Button onClick={closeAssignmentDialog} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            disabled={!selectedMunicipalityAdmin}
            onClick={assignToMunicipalityAdmin}
            sx={{ 
              background: INDIA_THEME.headerGradient,
              '&:hover': { opacity: 0.9 },
              '&:disabled': { backgroundColor: 'grey.300' }
            }}
          >
            Assign Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DistrictAdminDashboard;