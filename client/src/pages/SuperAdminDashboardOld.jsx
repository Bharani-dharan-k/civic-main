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

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dashboard Analytics State
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    avgResolutionTime: 0,
    topCategories: []
  });

  // User Management State
  const [users, setUsers] = useState([]);
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'district_admin',
    district: '',
    municipality: '',
    department: ''
  });

  // Report Management State
  const [reports, setReports] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    district: '',
    municipality: '',
    category: '',
    status: '',
    search: ''
  });

  // System Settings State
  const [categories, setCategories] = useState([]);
  const [categoryDialog, setCategoryDialog] = useState({ open: false, category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', priority: 'medium' });

  const roles = [
    'district_admin',
    'municipality_admin', 
    'department_head',
    'field_head',
    'field_staff'
  ];

  const statuses = ['pending', 'in_progress', 'resolved', 'rejected'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

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
        loadCategories()
      ]);
    } catch (error) {
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
        topCategories: Array.isArray(data.topCategories) ? data.topCategories : []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Keep default state structure on error
      setAnalytics({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        avgResolutionTime: 0,
        topCategories: []
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.get('/superadmin/all-users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]); // Ensure users remains an array even on error
    }
  };

  const loadReports = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(reportFilters).forEach(key => {
        if (reportFilters[key]) {
          params.append(key, reportFilters[key]);
        }
      });
      
      const response = await API.get(`/superadmin/reports?${params.toString()}`);
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]); // Ensure reports remains an array even on error
    }
  };

  const loadCategories = async () => {
    try {
      const response = await API.get('/superadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Ensure categories remains an array even on error
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // User Management Functions
  const handleUserCreate = async () => {
    try {
      await API.post('/superadmin/create-admin', userForm);
      showSnackbar('User created successfully');
      setUserDialog({ open: false, user: null, mode: 'create' });
      setUserForm({ name: '', email: '', password: '', role: 'district_admin', district: '', municipality: '', department: '' });
      loadUsers();
    } catch (error) {
      showSnackbar('Error creating user', 'error');
    }
  };

  const handleUserUpdate = async () => {
    try {
      await API.put(`/superadmin/update-user/${userDialog.user._id}`, userForm);
      showSnackbar('User updated successfully');
      setUserDialog({ open: false, user: null, mode: 'create' });
      loadUsers();
    } catch (error) {
      showSnackbar('Error updating user', 'error');
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/superadmin/delete-user/${userId}`);
        showSnackbar('User deleted successfully');
        loadUsers();
      } catch (error) {
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const openUserDialog = (user = null, mode = 'create') => {
    if (user) {
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'district_admin',
        district: user.district || '',
        municipality: user.municipality || '',
        department: user.department || ''
      });
    }
    setUserDialog({ open: true, user, mode });
  };

  // Report Management Functions
  const handleReportDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await API.delete(`/superadmin/reports/${reportId}`);
        showSnackbar('Report deleted successfully');
        loadReports();
      } catch (error) {
        showSnackbar('Error deleting report', 'error');
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setReportFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (tabValue === 2) { // Reports tab
      loadReports();
    }
  }, [reportFilters, tabValue]);

  // Category Management Functions
  const handleCategoryCreate = async () => {
    try {
      await API.post('/superadmin/categories', categoryForm);
      showSnackbar('Category created successfully');
      setCategoryDialog({ open: false, category: null });
      setCategoryForm({ name: '', description: '', priority: 'medium' });
      loadCategories();
    } catch (error) {
      showSnackbar('Error creating category', 'error');
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await API.delete(`/superadmin/categories/${categoryId}`);
        showSnackbar('Category deleted successfully');
        loadCategories();
      } catch (error) {
        showSnackbar('Error deleting category', 'error');
      }
    }
  };

  // Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <ReportsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{analytics.totalReports}</Typography>
                <Typography color="textSecondary">Total Reports</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{analytics.pendingReports}</Typography>
                <Typography color="textSecondary">Pending Reports</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <DashboardIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{analytics.resolvedReports}</Typography>
                <Typography color="textSecondary">Resolved Reports</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{analytics.avgResolutionTime}d</Typography>
                <Typography color="textSecondary">Avg Resolution Time</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Categories */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Issue Categories</Typography>
            <List>
              {(analytics.topCategories || []).map((category, index) => (
                <ListItem key={index}>
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
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setTabValue(1)}
              >
                Create New Admin
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ViewIcon />}
                onClick={() => setTabValue(2)}
              >
                View All Reports
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<SettingsIcon />}
                onClick={() => setTabValue(3)}
              >
                Manage Categories
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Super Admin Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">Welcome, {user?.name}</Typography>
          <Button variant="outlined" onClick={logout}>Logout</Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<PeopleIcon />} label="User Management" />
          <Tab icon={<ReportsIcon />} label="Report Management" />
          <Tab icon={<SettingsIcon />} label="System Settings" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <AnalyticsDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* User Management */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">User Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openUserDialog()}
          >
            Create Admin
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Municipality</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>{user.district || '-'}</TableCell>
                  <TableCell>{user.municipality || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => openUserDialog(user, 'edit')}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleUserDelete(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Report Management */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Report Management</Typography>
          
          {/* Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Search"
                value={reportFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reportFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="District"
                value={reportFilters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Municipality"
                value={reportFilters.municipality}
                onChange={(e) => handleFilterChange('municipality', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={reportFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category.name}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ height: '56px' }}
                onClick={loadReports}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Municipality</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={report.status === 'resolved' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.district || '-'}</TableCell>
                  <TableCell>{report.municipality || '-'}</TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleReportDelete(report._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* System Settings */}
        <Typography variant="h6" gutterBottom>System Settings</Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Category Management</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCategoryDialog({ open: true, category: null })}
                  >
                    Add Category
                  </Button>
                </Box>
                
                <List>
                  {categories.map((category) => (
                    <ListItem key={category._id}>
                      <ListItemText 
                        primary={category.name}
                        secondary={category.description}
                      />
                      <Chip label={category.priority} size="small" />
                      <IconButton onClick={() => handleCategoryDelete(category._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Configuration</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Auto-prioritize urgent reports"
                      secondary="Automatically set high priority for reports with 'urgent' keyword"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Email notifications"
                      secondary="Send email alerts for new high-priority reports"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* User Dialog */}
      <Dialog 
        open={userDialog.open} 
        onClose={() => setUserDialog({ open: false, user: null, mode: 'create' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userDialog.mode === 'create' ? 'Create New Admin' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </Grid>
            {userDialog.mode === 'create' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="District"
                value={userForm.district}
                onChange={(e) => setUserForm({ ...userForm, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Municipality"
                value={userForm.municipality}
                onChange={(e) => setUserForm({ ...userForm, municipality: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog({ open: false, user: null, mode: 'create' })}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={userDialog.mode === 'create' ? handleUserCreate : handleUserUpdate}
          >
            {userDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog 
        open={categoryDialog.open} 
        onClose={() => setCategoryDialog({ open: false, category: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={categoryForm.priority}
                  onChange={(e) => setCategoryForm({ ...categoryForm, priority: e.target.value })}
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ open: false, category: null })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCategoryCreate}>
            Create Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SuperAdminDashboard;
