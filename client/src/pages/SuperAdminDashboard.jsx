import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Trophy,
  TrendingUp,
  User,
  LogOut,
  Home,
  Star,
  Award,
  Search,
  Filter,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Navigation,
  Phone,
  Mail,
  Menu,
  X,
  Globe,
  ChevronDown,
  Map,
  Bot,
  RefreshCw,
  Flag,
  Heart,
  Zap,
  Target,
  Activity,
  Flame,
  CheckCircle,
  Clock
} from 'lucide-react';

// Import services and utilities
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Additional states for real data
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    totalUsers: 0,
    activeUsers: 0,
    departmentPerformance: [],
    recentActivity: []
  });
  
  const [analyticsData, setAnalyticsData] = useState({
    dailyReports: [],
    monthlyTrends: [],
    categoryDistribution: [],
    resolutionTimes: [],
    departmentWorkload: []
  });
  
  const [serviceRequestsData, setServiceRequestsData] = useState({
    pending: [],
    inProgress: [],
    completed: [],
    statistics: {
      avgResolutionTime: 0,
      satisfactionRate: 0,
      totalRequests: 0
    }
  });
  
  const [leaderboardData, setLeaderboardData] = useState({
    topDepartments: [],
    topPerformers: [],
    bestDistricts: []
  });

  // Enhanced navigation items with admin theme
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'users', label: 'User Management', icon: Users, color: 'text-green-600' },
    { id: 'reports', label: 'Reports', icon: FileText, color: 'text-purple-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, color: 'text-red-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-indigo-600' }
  ];

  // API endpoint configuration
  const API_BASE_URL = 'http://localhost:5000/api/admin';

  // Data fetching functions
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
      return null;
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      return [];
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      return [];
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      return null;
    }
  };

  const fetchStaffData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`);
      if (!response.ok) throw new Error('Failed to fetch staff data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.error('Failed to load staff information');
      return [];
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests`);
      if (!response.ok) throw new Error('Failed to fetch service requests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to load service requests');
      return [];
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard data');
      return [];
    }
  };

  // Initialize component
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel
      const [
        stats,
        reportsData,
        notificationsData,
        analyticsData,
        staffData,
        serviceRequests,
        leaderboardData
      ] = await Promise.all([
        fetchStats(),
        fetchReports(),
        fetchNotifications(),
        fetchAnalytics(),
        fetchStaffData(),
        fetchServiceRequests(),
        fetchLeaderboard()
      ]);

      // Set admin user from Auth context
      setAdminUser({
        _id: user?.id,
        name: user?.name || 'Super Admin',
        email: user?.email,
        role: 'super_admin',
        lastLogin: new Date().toISOString()
      });

      // Update state with fetched data
      if (!reportsData || reportsData.length === 0) {
        // Fallback data if API returns empty
        setReports([
          { 
            id: 1, 
            title: 'Road Repair', 
            status: 'resolved', 
            district: 'Ranchi', 
            date: '2024-01-15' 
          },
          { 
            id: 2, 
            title: 'Water Supply Issue', 
            status: 'in_progress', 
            district: 'Dhanbad', 
            date: '2024-01-14' 
          },
          { 
            id: 3, 
            title: 'Street Light', 
            status: 'submitted', 
            district: 'Bokaro', 
            date: '2024-01-13' 
          }
        ]);
      } else {
        setReports(reportsData);
      }

      // Update users data
      if (!staffData || staffData.length === 0) {
        // Fallback data if API returns empty
        setUsers([
          { 
            id: 1, 
            name: 'John Citizen', 
            role: 'citizen', 
            district: 'Ranchi', 
            reports: 5 
          },
          { 
            id: 2, 
            name: 'Worker Singh', 
            role: 'worker', 
            district: 'Dhanbad', 
            reports: 12 
          },
          { 
            id: 3, 
            name: 'Admin Kumar', 
            role: 'admin', 
            district: 'Bokaro', 
            reports: 8 
          }
        ]);
      } else {
        setUsers(staffData);
      }

      // Update notifications
      if (!notificationsData || notificationsData.length === 0) {
        // Fallback data if API returns empty
        const fallbackNotifications = [
          {
            id: 1,
            title: 'New Report Submitted',
            message: 'Road repair request in Ranchi',
            read: false,
            type: 'report',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'User Registered',
            message: 'New citizen registered in Dhanbad',
            read: false,
            type: 'user',
            createdAt: new Date().toISOString()
          }
        ];
        setNotifications(fallbackNotifications);
        setUnreadCount(fallbackNotifications.length);
      } else {
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      }

      // Update other states with real data
      if (stats) {
        setDashboardStats(stats);
      }

      if (analyticsData) {
        setAnalyticsData(analyticsData);
      }

      if (serviceRequests) {
        setServiceRequestsData(serviceRequests);
      }

      if (leaderboardData) {
        setLeaderboardData(leaderboardData);
      }

      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleReportAction = async (reportId, action, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update report');
      
      // Refresh reports data
      const updatedReports = await fetchReports();
      setReports(updatedReports);
      
      toast.success('Report updated successfully');
    } catch (error) {
      console.error(`Error updating report: ${error}`);
      toast.error('Failed to update report');
    }
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/${action}`, {
        method: 'PUT'
      });

      if (!response.ok) throw new Error('Failed to update notification');
      
      // Refresh notifications
      const updatedNotifications = await fetchNotifications();
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      
      toast.success('Notification updated');
    } catch (error) {
      console.error(`Error updating notification: ${error}`);
      toast.error('Failed to update notification');
    }
  };

  const exportAnalytics = async (format = 'csv') => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/export?format=${format}`);
      if (!response.ok) throw new Error('Failed to export analytics');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  const handleStaffAction = async (staffId, action, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${staffId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update staff member');
      
      // Refresh staff data
      const updatedStaff = await fetchStaffData();
      setUsers(updatedStaff);
      
      toast.success('Staff member updated successfully');
    } catch (error) {
      console.error(`Error updating staff member: ${error}`);
      toast.error('Failed to update staff member');
    }
  };

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      await initializeDashboard();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Original data loading function
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
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await API.get('/superadmin/analytics');
      const data = response.data.data;

      const statusData = data.statusDistribution.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {});

      const categoryData = data.categoryDistribution.map(item => ({
        name: item.category,
        count: item.count,
        resolutionRate: Math.round(item.resolutionRate || 0)
      })).slice(0, 5);

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
          Math.round(data.resolutionTimeStats.averageHours / 24 * 10) / 10 : 0,
        topCategories: categoryData,
        totalUsers: data.overview.totalUsers || 0,
        recentReports: data.recentActivity.newReports || 0,
        reportsByStatus: statusData,
        reportsByPriority: priorityData,
        usersByRole: {
          citizen: data.overview.totalCitizens || 0,
          worker: data.overview.totalWorkers || 0,
          admin: data.overview.totalAdmins || 0
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use sample data on error
      setAnalytics({
        totalReports: 45,
        pendingReports: 12,
        resolvedReports: 28,
        inProgressReports: 5,
        rejectedReports: 0,
        avgResolutionTime: 2.3,
        topCategories: [
          { name: 'Road Issues', count: 15 },
          { name: 'Water Supply', count: 12 },
          { name: 'Electricity', count: 8 }
        ],
        totalUsers: 156,
        recentReports: 8,
        reportsByStatus: { submitted: 12, in_progress: 5, resolved: 28 },
        reportsByPriority: { high: 8, medium: 25, low: 12 },
        usersByRole: { citizen: 120, worker: 25, admin: 11 }
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.get('/superadmin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([
        { id: 1, name: 'John Citizen', role: 'citizen', district: 'Ranchi', reports: 5, email: 'john@example.com' },
        { id: 2, name: 'Worker Singh', role: 'worker', district: 'Dhanbad', reports: 12, email: 'worker@example.com' },
        { id: 3, name: 'Admin Kumar', role: 'admin', district: 'Bokaro', reports: 8, email: 'admin@example.com' }
      ]);
    }
  };

  const loadReports = async () => {
    try {
      const response = await API.get('/superadmin/reports');
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([
        { id: 1, title: 'Road Repair Request', status: 'resolved', district: 'Ranchi', date: '2024-01-15', category: 'Infrastructure' },
        { id: 2, title: 'Water Supply Issue', status: 'in_progress', district: 'Dhanbad', date: '2024-01-14', category: 'Utilities' },
        { id: 3, title: 'Street Light Problem', status: 'submitted', district: 'Bokaro', date: '2024-01-13', category: 'Public Safety' }
      ]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await API.get('/superadmin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        { id: 1, name: 'Infrastructure', description: 'Roads, bridges, buildings', priority: 'high' },
        { id: 2, name: 'Utilities', description: 'Water, electricity, gas', priority: 'high' },
        { id: 3, name: 'Public Safety', description: 'Lighting, security', priority: 'medium' }
      ]);
    }
  };

  const loadDistrictHeads = async () => {
    try {
      const response = await API.get('/superadmin/district-heads');
      setDistrictHeads(response.data.data || []);
    } catch (error) {
      console.error('Error loading district heads:', error);
      setDistrictHeads([
        { id: 1, districtName: 'Ranchi', email: 'ranchi.head@gov.in', name: 'Mr. Ranchi Head' },
        { id: 2, districtName: 'Dhanbad', email: 'dhanbad.head@gov.in', name: 'Ms. Dhanbad Head' }
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await API.get('/superadmin/notifications');
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([
        { id: 1, title: 'New Report Submitted', message: 'Road repair request in Ranchi', read: false, type: 'report', createdAt: new Date().toISOString() },
        { id: 2, title: 'User Registered', message: 'New citizen registered in Dhanbad', read: false, type: 'user', createdAt: new Date().toISOString() }
      ]);
      setUnreadCount(2);
    }
  };

  // Add missing state for original functionality
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

  const [categories, setCategories] = useState([]);
  const [districtHeads, setDistrictHeads] = useState([]);
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' });
  const [categoryDialog, setCategoryDialog] = useState({ open: false, category: null, mode: 'create' });
  const [reportDialog, setReportDialog] = useState({ open: false, report: null, mode: 'view' });
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

  // Dashboard Overview Section
  const DashboardOverview = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                Super Admin Dashboard
              </h2>
              <p className="text-gray-700 mt-1">Digital India Platform Management</p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Reports', value: analytics.totalReports, icon: FileText, color: 'text-blue-600', bg: 'from-blue-400 to-blue-600' },
          { title: 'Resolved Reports', value: analytics.resolvedReports, icon: CheckCircle, color: 'text-green-600', bg: 'from-green-400 to-green-600' },
          { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-purple-600', bg: 'from-purple-400 to-purple-600' },
          { title: 'Avg Resolution', value: `${analytics.avgResolutionTime} days`, icon: Clock, color: 'text-orange-600', bg: 'from-orange-400 to-orange-600' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
            <div className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {loading ? (
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {reports.slice(0, 3).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">{report.district}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">{analytics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Reports</span>
                <span className="font-semibold">{analytics.pendingReports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-semibold">94%</span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('users')}
                className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Manage Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium">View Reports</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">View Analytics</span>
                </div>
              </button>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        </div>
      </div>
    </div>
  );

  // Analytics Page Component with restored functionality
  const AnalyticsPage = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">System Analytics</h2>
          <p className="text-gray-600">Comprehensive system performance and usage statistics.</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-16 rounded"></div>
                ) : (
                  analytics.totalReports
                )}
              </div>
              <div className="text-orange-100">Total Reports</div>
            </div>
            <FileText className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-16 rounded"></div>
                ) : (
                  analytics.resolvedReports
                )}
              </div>
              <div className="text-pink-100">Resolved Reports</div>
            </div>
            <CheckCircle className="w-12 h-12 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-16 rounded"></div>
                ) : (
                  analytics.totalUsers
                )}
              </div>
              <div className="text-blue-100">Total Users</div>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-16 rounded"></div>
                ) : (
                  `${analytics.avgResolutionTime}d`
                )}
              </div>
              <div className="text-green-100">Avg Resolution Time</div>
            </div>
            <Clock className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Status and Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Report Status Distribution</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.reportsByStatus || {}).map(([status, count]) => {
                const percentage = analytics.totalReports > 0 ? (count / analytics.totalReports * 100) : 0;
                const statusColors = {
                  pending: 'bg-yellow-500',
                  'in-progress': 'bg-blue-500',
                  resolved: 'bg-green-500',
                  rejected: 'bg-red-500'
                };

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{status}</span>
                      <span className="text-gray-600">{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Priority Distribution</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.reportsByPriority || {}).map(([priority, count]) => {
                const percentage = analytics.totalReports > 0 ? (count / analytics.totalReports * 100) : 0;
                const priorityColors = {
                  low: 'bg-green-500',
                  medium: 'bg-yellow-500',
                  high: 'bg-orange-500',
                  urgent: 'bg-red-500'
                };

                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-white text-sm ${priorityColors[priority] || 'bg-gray-500'}`}>
                        {priority || 'Medium'}
                      </span>
                      <span className="text-gray-600">{count} reports ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${priorityColors[priority] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Categories and Geography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Top Report Categories</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                  </div>
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topCategories?.map((category, index) => {
                const maxCount = Math.max(...analytics.topCategories.map(c => c.count));
                const percentage = (category.count / maxCount) * 100;
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">{category.count}</span>
                        {category.resolutionRate !== undefined && (
                          <span className={`px-2 py-1 rounded text-xs text-white ${
                            category.resolutionRate > 70 ? 'bg-green-500' :
                            category.resolutionRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {category.resolutionRate}% resolved
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Geographic Distribution</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : analytics.geographicDistribution?.length > 0 ? (
            <div className="space-y-3">
              {analytics.geographicDistribution.slice(0, 8).map((location, index) => (
                <div key={location.location} className="flex justify-between items-center py-2">
                  <span className="text-gray-800 truncate" style={{ maxWidth: '70%' }}>
                    {location.location}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm text-white ${
                    index < 3 ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {location.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No geographic data available
            </div>
          )}
        </div>
      </div>

      {/* User Activity and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">User Activity by Role</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics.usersByRole || {}).map(([role, count]) => {
                const roleColors = {
                  citizen: 'bg-blue-500',
                  worker: 'bg-purple-500',
                  admin: 'bg-green-500',
                  super_admin: 'bg-red-500'
                };
                const roleIcons = {
                  citizen: Users,
                  worker: User,
                  admin: Shield
                };
                const IconComponent = roleIcons[role] || User;

                return (
                  <div key={role} className="flex justify-between items-center py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${roleColors[role] || 'bg-gray-500'}`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium capitalize">{role}s</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Overall Resolution Rate</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        (analytics.performanceMetrics?.overallResolutionRate || 0) > 70 ? 'bg-green-500' :
                        (analytics.performanceMetrics?.overallResolutionRate || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analytics.performanceMetrics?.overallResolutionRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold">
                    {Math.round(analytics.performanceMetrics?.overallResolutionRate || 0)}%
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-3">Resolution Statistics</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.resolutionTimeStats?.totalResolved || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.performanceMetrics?.pendingReports || 0}
                    </div>
                    <div className="text-xs text-gray-500">Still Pending</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // User Management Component with restored functionality
  const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    const handleEditUser = (user) => {
      // Handle edit user logic
      console.log('Edit user:', user);
    };

    const handleDeleteUser = (userId) => {
      // Handle delete user logic
      console.log('Delete user:', userId);
    };

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">User Management</h2>
            <p className="text-gray-600">Manage system users and their permissions.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors">
            <Users className="w-4 h-4 mr-2" />
            Add New User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizens</option>
                <option value="worker">Workers</option>
                <option value="admin">Admins</option>
                <option value="super_admin">Super Admins</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Total: {users.length}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Filtered: {filteredUsers.length}
              </span>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-full"></div>
                  <div className="flex-1">
                    <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                </div>
                <div className="flex justify-end gap-2">
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'No users match your search' : 'No users found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Create your first user to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    user.role === 'citizen' ? 'bg-blue-500' :
                    user.role === 'worker' ? 'bg-purple-500' :
                    user.role === 'admin' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs text-white font-medium ${
                    user.role === 'citizen' ? 'bg-blue-500' :
                    user.role === 'worker' ? 'bg-purple-500' :
                    user.role === 'admin' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {user.role}
                  </span>
                  {user.district && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {user.district}
                    </span>
                  )}
                </div>

                <div className="mb-4 text-xs text-gray-500">
                  <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                  {user.lastLogin && (
                    <div>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Report Management Component with restored functionality
  const ReportManagement = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Report Management</h2>
          <p className="text-gray-600">Monitor and manage citizen reports across all districts.</p>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{reports.length}</div>
              <div className="text-blue-100">Total Reports</div>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-yellow-100">Pending</div>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {reports.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-orange-100">In Progress</div>
            </div>
            <Activity className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-green-100">Resolved</div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.slice(0, 10).map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{report.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.district}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      report.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.priority || 'medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // System Settings Component
  const SystemSettings = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
              <input
                type="text"
                defaultValue="Digital India Platform"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Mode</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option value="off">Off</option>
                <option value="on">On</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications Page Component
  const NotificationsPage = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h2>
          <p className="text-gray-600">Manage system notifications and alerts.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors">
          <Bell className="w-4 h-4 mr-2" />
          New Notification
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">System Update</h4>
                  <p className="text-sm text-gray-600">New reports have been submitted and require attention.</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Info
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Page Component
  const ProfilePage = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {adminUser?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{adminUser?.name || 'Super Admin'}</h3>
            <p className="text-gray-600">{adminUser?.email || 'admin@digitalindia.gov.in'}</p>
            <p className="text-sm text-gray-500 mt-2">Super Administrator</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={adminUser?.name || 'Super Admin'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={adminUser?.email || 'admin@digitalindia.gov.in'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value="Super Administrator"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with Indian Theme */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-200
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header with Indian Flag Theme */}
          <div className="px-6 py-6 border-b border-gray-200 bg-white overflow-hidden">
            {/* Indian Flag Border */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 mb-4"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Digital India</h1>
                  <p className="text-xs text-gray-600">Super Admin Portal</p>
                </div>
              </div>
              <button
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Indian Flag Border */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 mt-4"></div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-green-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${
                      activeTab === item.id ? 'text-white' : item.color
                    }`} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Enhanced Sidebar Footer */}
          <div className="px-4 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gray-400 to-blue-500 mb-4"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
              <span>Logout</span>
            </button>

            <div className="h-1 bg-gradient-to-r from-gray-400 to-blue-500 mt-4"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Enhanced Header with Tricolor Theme */}
        <header className="bg-white shadow-xl overflow-hidden">
          {/* Top stripe */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  className="lg:hidden p-3 rounded-xl text-gray-700 hover:bg-white/50 transition-colors"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        Welcome, <span className="text-orange-700">{adminUser?.name || 'Super Admin'}</span>
                      </p>
                      <p className="text-sm text-gray-600">Managing Digital India Platform</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Overview */}
              <div className="hidden lg:flex items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 mb-2"></div>
                    <div className="text-2xl font-bold text-orange-600">{reports.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Reports</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 mb-2"></div>
                    <div className="text-2xl font-bold text-green-600">{users.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Users</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 mb-2"></div>
                    <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                    <div className="text-xs text-gray-600 font-medium">Notifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gradient-to-br from-orange-50/30 via-white to-green-50/30 overflow-auto">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'reports' && <ReportManagement />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
