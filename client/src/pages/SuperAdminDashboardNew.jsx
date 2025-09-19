import React, { useState, useEffect } from 'react';
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
  BarChart as AnalyticsIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

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
    avgResolutionTime: 0,
    topCategories: [],
    totalUsers: 0,
    activeUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dialog states
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [categoryDialog, setCategoryDialog] = useState({ open: false, category: null, mode: 'create' });

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

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
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
      const data = response.data;
      setAnalytics({
        totalReports: data.totalReports || 0,
        pendingReports: data.pendingReports || 0,
        resolvedReports: data.resolvedReports || 0,
        avgResolutionTime: data.avgResolutionTime || 0,
        topCategories: Array.isArray(data.topCategories) ? data.topCategories : [],
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        avgResolutionTime: 0,
        topCategories: [],
        totalUsers: 0,
        activeUsers: 0,
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.get('/superadmin/all-users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadReports = async () => {
    try {
      const response = await API.get('/superadmin/reports');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await API.get('/superadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
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

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Super Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name || 'Admin'}! Here's your system overview.
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {analytics.totalReports}
                  </Typography>
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
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {analytics.pendingReports}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pending Reports
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <NotificationsIcon sx={{ color: 'white', fontSize: 28 }} />
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
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {analytics.totalUsers}
                  </Typography>
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
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {analytics.resolvedReports}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Resolved Reports
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AnalyticsIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
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
                >
                  Add Report Category
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => setSelectedPage('analytics')}
                  fullWidth
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
                {(analytics.topCategories || []).map((category, index) => (
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
                ))}
                {analytics.topCategories.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No category data available
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  // Analytics Component
  const AnalyticsPage = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        System Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Comprehensive system performance and usage statistics.
      </Typography>

      <Grid container spacing={3}>
        {/* Same metrics cards but in analytics view */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed analytics and reporting metrics will be displayed here.
                This could include charts, graphs, and detailed breakdowns of system usage.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  // User Management Component
  const UserManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage admin users and their permissions.
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

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" />
                    </TableCell>
                    <TableCell>{user.district || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteUser(user._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No users found
                      </Typography>
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Report Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Monitor and manage citizen reports across the system.
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>
                      <Chip label={report.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={report.status === 'resolved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No reports found
                      </Typography>
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        System Settings
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Configure system-wide settings and preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card>
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

  // Helper functions
  const handleEditUser = (user) => {
    setUserForm(user);
    setUserDialog({ open: true, user, mode: 'edit' });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await API.delete(`/superadmin/delete-user/${userId}`);
      await loadUsers();
      showSnackbar('User deleted successfully');
    } catch (error) {
      showSnackbar('Error deleting user', 'error');
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
      if (userDialog.mode === 'create') {
        await API.post('/superadmin/create-admin', userForm);
        showSnackbar('User created successfully');
      } else {
        await API.put(`/superadmin/update-user/${userDialog.user._id}`, userForm);
        showSnackbar('User updated successfully');
      }
      setUserDialog({ open: false, user: null, mode: 'create' });
      await loadUsers();
    } catch (error) {
      showSnackbar('Error saving user', 'error');
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

  // Render current page content
  const renderPageContent = () => {
    switch (selectedPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'users':
        return <UserManagement />;
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
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Super Admin
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {user?.name || 'Administrator'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedPage === item.id}
              onClick={() => setSelectedPage(item.id)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
          <Badge badgeContent={analytics.pendingReports} color="error">
            <NotificationsIcon />
          </Badge>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          pt: { xs: 7, sm: 8 },
        }}
      >
        {renderPageContent()}
      </Box>

      {/* User Dialog */}
      <Dialog open={userDialog.open} onClose={() => setUserDialog({ open: false, user: null, mode: 'create' })} maxWidth="sm" fullWidth>
        <DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setUserDialog({ open: false, user: null, mode: 'create' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            {userDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ open: false, category: null, mode: 'create' })} maxWidth="sm" fullWidth>
        <DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ open: false, category: null, mode: 'create' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {categoryDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

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
