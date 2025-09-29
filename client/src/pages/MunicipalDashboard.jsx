import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingUp,
  User,
  LogOut,
  Home,
  Search,
  Filter,
  Eye,
  Menu,
  X,
  CheckCircle,
  Clock,
  Activity,
  AlertTriangle,
  Building,
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Navigation,
  ChevronDown,
  Star,
  Award,
  Zap,
  Target,
  Heart,
  Flame
} from 'lucide-react';

// Import services and utilities
import { useAuth } from '../context/AuthContext';
import {
    getMunicipalStats,
    getCitizenComplaints,
    getMunicipalReports,
    assignWorker,
    getStaffData,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    assignTask,
    getInfrastructureStatus,
    getFinanceData,
    getProjectsData,
    getEmergencyAlerts,
    getServiceRequests,
    updateReportStatus,
    getWardData,
    createAnnouncement,
    getAnnouncementStats,
    getAssignedTasks,
    getTaskStats,
    updateTaskProgress,
    getDepartmentAdmins,
    assignReportToDepartmentAdmin
} from '../services/municipalService';

const MunicipalDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');

  // State for different sections
  const [citizenComplaints, setCitizenComplaints] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [infrastructureStatus, setInfrastructureStatus] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    maintenanceRequests: 0,
    budgetUtilized: 0,
    upcomingProjects: 0,
    facilities: [],
    recentProjects: []
  });
  const [financeData, setFinanceData] = useState({
    totalBudget: 0,
    budgetUsed: 0,
    budgetRemaining: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    departments: [],
    recentTransactions: [],
    monthlyTrends: []
  });
  const [projects, setProjects] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([
    {
      id: 1,
      title: 'Water Pipeline Burst - Sector 15',
      description: 'Major water pipeline burst affecting 500+ households. Emergency repair crews dispatched.',
      priority: 'urgent',
      status: 'active',
      location: 'Sector 15, Block A',
      reportedBy: 'Field Inspector Ram Kumar',
      createdAt: '2024-09-20T08:30:00Z',
      estimatedResolution: '2024-09-20T18:00:00Z',
      affectedPopulation: 520,
      responseTeams: ['Water Dept Emergency', 'Public Works'],
      contact: '+91-9876543210'
    },
    {
      id: 2,
      title: 'Power Outage - Industrial Area',
      description: 'Complete power failure in industrial zone due to transformer malfunction.',
      priority: 'high',
      status: 'in-progress',
      location: 'Industrial Area Phase 2',
      reportedBy: 'Control Room Operator',
      createdAt: '2024-09-20T06:45:00Z',
      estimatedResolution: '2024-09-20T14:00:00Z',
      affectedPopulation: 200,
      responseTeams: ['Electrical Dept', 'Emergency Services'],
      contact: '+91-9876543211'
    },
    {
      id: 3,
      title: 'Road Blockage - Main Highway',
      description: 'Tree fallen on main highway blocking traffic. Alternate routes activated.',
      priority: 'medium',
      status: 'resolved',
      location: 'Main Highway KM 15',
      reportedBy: 'Traffic Police',
      createdAt: '2024-09-19T22:15:00Z',
      estimatedResolution: '2024-09-20T02:00:00Z',
      affectedPopulation: 1000,
      responseTeams: ['Traffic Management', 'Public Works'],
      contact: '+91-9876543212'
    },
    {
      id: 4,
      title: 'Sewage Overflow - Residential Area',
      description: 'Sewage system overflow in residential complex. Health hazard alert issued.',
      priority: 'high',
      status: 'active',
      location: 'Green Valley Apartments',
      reportedBy: 'Health Inspector',
      createdAt: '2024-09-20T10:20:00Z',
      estimatedResolution: '2024-09-20T20:00:00Z',
      affectedPopulation: 150,
      responseTeams: ['Sanitation Dept', 'Health Services'],
      contact: '+91-9876543213'
    },
    {
      id: 5,
      title: 'Street Light Failure - School Zone',
      description: 'Multiple street lights not functioning in school safety zone.',
      priority: 'medium',
      status: 'pending',
      location: 'School Safety Zone Area',
      reportedBy: 'School Principal',
      createdAt: '2024-09-20T07:00:00Z',
      estimatedResolution: '2024-09-21T12:00:00Z',
      affectedPopulation: 300,
      responseTeams: ['Electrical Maintenance'],
      contact: '+91-9876543214'
    }
  ]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [departmentAdmins, setDepartmentAdmins] = useState([]);
  const [assignmentDialog, setAssignmentDialog] = useState({ 
    open: false, 
    report: null, 
    selectedAdmin: '', 
    priority: 'medium', 
    notes: '', 
    deadline: '' 
  });
  const [viewReportDialog, setViewReportDialog] = useState({ 
    open: false, 
    report: null 
  });
  const [editReportDialog, setEditReportDialog] = useState({ 
    open: false, 
    report: null,
    formData: {}
  });
  const [municipalSettings, setMunicipalSettings] = useState({
    general: {
      municipalName: 'New Civic Municipality',
      adminEmail: 'admin@newcivic.gov.in',
      contactNumber: '+91-9876543200',
      address: '123 Municipal Building, Civic Center, New City - 400001',
      website: 'https://newcivic.gov.in',
      timezone: 'Asia/Kolkata',
      language: 'English',
      workingHours: {
        start: '09:00',
        end: '18:00',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      emergencyAlerts: true,
      complaintUpdates: true,
      staffNotifications: true,
      citizenUpdates: true,
      maintenanceReminders: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      loginAttempts: 5,
      accountLockDuration: 15
    },
    system: {
      backupFrequency: 'daily',
      maintenanceWindow: {
        day: 'Sunday',
        time: '02:00-04:00'
      },
      dataRetention: 365,
      apiRateLimit: 1000,
      maxFileSize: 10,
      allowedFileTypes: ['.pdf', '.jpg', '.png', '.doc', '.docx']
    },
    departments: [
      { id: 1, name: 'Health Services', head: 'Dr. Priya Sharma', contact: '+91-9876543220', budget: 25000000 },
      { id: 2, name: 'Public Works', head: 'Eng. Rajesh Kumar', contact: '+91-9876543221', budget: 35000000 },
      { id: 3, name: 'Sanitation', head: 'Mr. Amit Singh', contact: '+91-9876543222', budget: 18000000 },
      { id: 4, name: 'Education', head: 'Mrs. Sunita Verma', contact: '+91-9876543223', budget: 22000000 },
      { id: 5, name: 'Transportation', head: 'Mr. Vikram Reddy', contact: '+91-9876543224', budget: 15000000 }
    ],
    integrations: {
      gisMapping: true,
      weatherService: true,
      paymentGateway: true,
      smsService: true,
      emailService: true,
      cloudStorage: true,
      analyticsService: true
    }
  });
  const [municipalStats, setMunicipalStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    staffCount: 0,
    activeProjects: 0,
    budget: 0
  });

  // Admin user data
  const [adminUser] = useState(user || {
    name: 'Municipal Admin',
    email: 'admin@municipal.gov.in',
    role: 'municipal_admin'
  });

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-orange-600', badge: 0 },
    { id: 'complaints', label: 'Complaints', icon: FileText, color: 'text-blue-600', badge: citizenComplaints.filter(c => c.status === 'pending').length },
    { id: 'tasks', label: 'Assigned Tasks', icon: CheckCircle, color: 'text-indigo-600', badge: assignedTasks.filter(t => t.status === 'assigned').length },
    { id: 'staff', label: 'Staff Management', icon: Users, color: 'text-green-600', badge: staffData.length },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'text-purple-600', badge: 0 },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-yellow-600', badge: 0 },
    { id: 'projects', label: 'Projects', icon: Wrench, color: 'text-indigo-600', badge: Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0 },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-600', badge: emergencyAlerts.length },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600', badge: 0 }
  ];

  useEffect(() => {
    loadDashboardData();
    loadUrgentAlerts();
    loadDepartmentAdmins();
  }, [selectedWard]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Load all data in parallel for better performance
      const [
        reportsResponse,
        staffResponse,
        infrastructureResponse,
        financeResponse,
        projectsResponse,
        alertsResponse,
        serviceResponse,
        statsResponse,
        tasksResponse,
        taskStatsResponse
      ] = await Promise.all([
        getMunicipalReports().catch(err => {
          console.error('❌ Municipal reports API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getStaffData().catch(err => {
          console.error('❌ Staff data API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getInfrastructureStatus().catch(err => {
          console.error('❌ Infrastructure API error:', err);
          return { data: { success: false, data: {}, error: err.message } };
        }),
        getFinanceData().catch(err => {
          console.error('❌ Finance API error:', err);
          return { data: { success: false, data: {}, error: err.message } };
        }),
        getProjectsData().catch(err => {
          console.error('❌ Projects API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getEmergencyAlerts().catch(err => {
          console.error('❌ Emergency alerts API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getServiceRequests().catch(err => {
          console.error('❌ Service requests API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getMunicipalStats().catch(err => {
          console.error('❌ Municipal stats API error:', err);
          return { data: { success: false, data: {}, error: err.message } };
        }),
        getAssignedTasks().catch(err => {
          console.error('❌ Assigned tasks API error:', err);
          return { data: { success: false, data: [], error: err.message } };
        }),
        getTaskStats().catch(err => {
          console.error('❌ Task stats API error:', err);
          return { data: { success: false, data: {}, error: err.message } };
        })
      ]);

      console.log('🔍 API Responses:', {
        reports: reportsResponse.data,
        staff: staffResponse.data,
        infrastructure: infrastructureResponse.data,
        service: serviceResponse.data,
        stats: statsResponse.data,
        tasks: tasksResponse.data,
        taskStats: taskStatsResponse.data
      });

      // Set reports from municipal endpoint
      if (reportsResponse.data.success) {
        const reports = reportsResponse.data.data || [];
        console.log('📊 Municipal reports:', reports);
        setCitizenComplaints(reports);
      }

      // Set staff data
      if (staffResponse.data.success) {
        const staff = staffResponse.data.data || [];
        console.log('👥 Municipal staff:', staff);
        setStaffData(staff);
      }

      // Set infrastructure status
      if (infrastructureResponse.data.success) {
        setInfrastructureStatus(infrastructureResponse.data.data || {});
      }

      // Set finance data
      if (financeResponse.data.success) {
        setFinanceData(financeResponse.data.data || {});
      }

      // Set projects data
      if (projectsResponse.data.success) {
        const projectData = projectsResponse.data.data || {};
        // Backend returns an object with projects array inside
        const projectsArray = projectData.projects || [];
        setProjects(projectsArray);
      }

      // Set emergency alerts
      if (alertsResponse.data.success) {
        const alerts = alertsResponse.data.data || [];
        console.log('🚨 Emergency alerts:', alerts);
        setEmergencyAlerts(alerts);
      }

      // Set service requests
      if (serviceResponse.data.success) {
        const serviceReqs = serviceResponse.data.data || [];
        console.log('🛠️ Service requests:', serviceReqs);
        setServiceRequests(serviceReqs);
      }

      // Set assigned tasks
      if (tasksResponse.data.success) {
        const tasks = tasksResponse.data.data || [];
        console.log('📋 Assigned tasks:', tasks);
        setAssignedTasks(tasks);
      }

      // Set task statistics
      if (taskStatsResponse.data.success) {
        const taskStatsData = taskStatsResponse.data.data || {};
        console.log('📊 Task statistics:', taskStatsData);
        setTaskStats(taskStatsData);
      }

      // Set municipal stats
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data || {};
        console.log('📊 Municipal stats:', stats);
        setMunicipalStats({
          totalComplaints: stats.totalComplaints || 0,
          resolvedComplaints: stats.resolvedComplaints || 0,
          pendingComplaints: stats.pendingComplaints || 0,
          inProgressComplaints: stats.inProgressComplaints || 0,
          staffCount: stats.staffCount || 0,
          activeProjects: stats.activeProjects || 0,
          assignedWard: stats.assignedWard || null,
          municipality: stats.municipality || null,
          budget: stats.budget || 0,
          resolutionRate: stats.resolutionRate || 0
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Minimal fallback for essential functionality
      setMunicipalStats({
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0,
        staffCount: 0,
        activeProjects: 0,
        assignedWard: null,
        municipality: null,
        budget: 0,
        resolutionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUrgentAlerts = async () => {
    try {
      const response = await getEmergencyAlerts();
      if (response.data.success) {
        const alerts = response.data.data || [];
        setEmergencyAlerts(alerts.filter(alert => alert.priority === 'urgent' || alert.priority === 'high'));
      }
    } catch (error) {
      console.error('Error loading urgent alerts:', error);
      // Set fallback emergency alerts
      setEmergencyAlerts([
        {
          _id: '1',
          title: 'Water Pipeline Burst',
          description: 'Major water pipeline burst in Ward 7',
          priority: 'urgent',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const loadDepartmentAdmins = async () => {
    try {
      console.log('👥 Loading department admins...');
      const response = await getDepartmentAdmins();
      if (response.data.success) {
        const admins = response.data.data || [];
        console.log('✅ Department admins loaded:', admins);
        setDepartmentAdmins(admins);
      }
    } catch (error) {
      console.error('❌ Error loading department admins:', error);
      toast.error('Failed to load department admins');
    }
  };

  const handleAssignReport = (report) => {
    console.log('👥 Assign Report Handler Called:', report);
    alert('Assign Report clicked: ' + report.title);
    setAssignmentDialog({
      open: true,
      report: report,
      selectedAdmin: '',
      priority: report.priority || 'medium',
      notes: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    });
  };

  const handleAssignmentSubmit = async () => {
    try {
      const { report, selectedAdmin, priority, notes, deadline } = assignmentDialog;
      
      if (!selectedAdmin) {
        toast.error('Please select a department admin');
        return;
      }

      setLoading(true);
      console.log('📋 Submitting assignment:', {
        reportId: report._id,
        departmentAdminId: selectedAdmin,
        priority,
        notes,
        deadline
      });

      const response = await assignReportToDepartmentAdmin(
        report._id,
        selectedAdmin,
        priority,
        notes,
        deadline ? new Date(deadline).toISOString() : undefined
      );

      if (response.data.success) {
        toast.success('Report assigned to department admin successfully');
        
        // Update the report status in the complaints list
        setCitizenComplaints(prevComplaints =>
          prevComplaints.map(complaint =>
            complaint._id === report._id
              ? { ...complaint, status: 'assigned', assignedTo: selectedAdmin }
              : complaint
          )
        );

        // Close the dialog
        setAssignmentDialog({
          open: false,
          report: null,
          selectedAdmin: '',
          priority: 'medium',
          notes: '',
          deadline: ''
        });

        // Reload dashboard data to get updated stats
        loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Error assigning report:', error);
      toast.error(error.message || 'Failed to assign report');
    } finally {
      setLoading(false);
    }
  };

  // Handle task progress update
  const handleUpdateTaskProgress = async (taskId, status, notes) => {
    try {
      setLoading(true);
      const response = await updateTaskProgress(taskId, status, notes);
      
      if (response.data.success) {
        // Update the task in the list
        setAssignedTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? response.data.data : task
          )
        );
        
        // Reload task stats
        const taskStatsResponse = await getTaskStats();
        if (taskStatsResponse.data.success) {
          setTaskStats(taskStatsResponse.data.data);
        }
        
        toast.success('Task progress updated successfully!');
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      toast.error(error.message || 'Failed to update task progress');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Report View Handler
  const handleViewReport = (report) => {
    console.log('🔍 View Report Handler Called:', report);
    alert('View Report clicked: ' + report.title);
    setViewReportDialog({
      open: true,
      report: report
    });
  };

  // Report Edit Handler
  const handleEditReport = (report) => {
    setEditReportDialog({
      open: true,
      report: report,
      formData: {
        title: report.title || '',
        description: report.description || '',
        priority: report.priority || 'medium',
        status: report.status || 'pending',
        category: report.category || '',
        location: report.address || (report.location?.coordinates ? 
          `${report.location.coordinates[1]}, ${report.location.coordinates[0]}` : '')
      }
    });
  };

  // Handle Edit Report Form Changes
  const handleEditReportFormChange = (field) => (e) => {
    setEditReportDialog(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: e.target.value
      }
    }));
  };

  // Submit Edit Report
  const handleEditReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { report, formData } = editReportDialog;
      
      // Update report via API
      const response = await updateReportStatus(report._id, {
        ...formData,
        updatedBy: user.id
      });
      
      if (response.data.success) {
        // Update the report in the complaints list
        setCitizenComplaints(prevComplaints =>
          prevComplaints.map(complaint =>
            complaint._id === report._id
              ? { ...complaint, ...formData }
              : complaint
          )
        );
        
        // Close the dialog
        setEditReportDialog({
          open: false,
          report: null,
          formData: {}
        });
        
        toast.success('Report updated successfully');
        loadDashboardData(); // Reload to get fresh data
      }
    } catch (error) {
      console.error('❌ Error updating report:', error);
      toast.error(error.message || 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  // Staff management handlers
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role,
      department: staff.department || '',
      password: '' // Leave empty for editing, user can optionally change
    });
    setShowEditStaff(true);
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      return;
    }

    try {
      await deleteStaffMember(staffId);
      toast.success('Staff member deleted successfully!');
      
      // Refresh staff list
      const staffResponse = await getStaffData();
      if (staffResponse.data.success) {
        setStaffData(staffResponse.data.data);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(error.message || 'Failed to delete staff member');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setAddingStaff(true);
    
    try {
      await updateStaffMember(editingStaff._id, staffForm);
      toast.success('Staff member updated successfully!');
      setShowEditStaff(false);
      setEditingStaff(null);
      setStaffForm({ name: '', email: '', phone: '', role: 'field_staff', department: '', password: '' });
      
      // Refresh staff list
      const staffResponse = await getStaffData();
      if (staffResponse.data.success) {
        setStaffData(staffResponse.data.data);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error(error.message || 'Failed to update staff member');
    } finally {
      setAddingStaff(false);
    }
  };

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
                <Building className="w-8 h-8 text-orange-600" />
                Municipal Dashboard
              </h2>
              <p className="text-gray-700 mt-1">Digital India Municipal Management</p>
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
          { title: 'Total Complaints', value: municipalStats.totalComplaints || citizenComplaints.length, icon: FileText, color: 'text-blue-600', bg: 'from-blue-400 to-blue-600' },
          { title: 'Resolved', value: municipalStats.resolvedComplaints || citizenComplaints.filter(c => c.status === 'resolved').length, icon: CheckCircle, color: 'text-green-600', bg: 'from-green-400 to-green-600' },
          { title: 'In Progress', value: municipalStats.inProgressComplaints || citizenComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length, icon: Clock, color: 'text-yellow-600', bg: 'from-yellow-400 to-yellow-600' },
          { title: 'Active Staff', value: municipalStats.staffCount || staffData.length, icon: Users, color: 'text-purple-600', bg: 'from-purple-400 to-purple-600' }
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h3>
            <div className="space-y-3">
              {citizenComplaints.slice(0, 3).map((complaint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{complaint.title}</p>
                    <p className="text-sm text-gray-600">
                      {typeof complaint.location === 'string' ? complaint.location :
                       complaint.address || complaint.location?.address || 'Location not specified'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Staff</h3>
            <div className="space-y-4">
              {staffData.slice(0, 3).map((staff, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {staff.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-600">{staff.department}</p>
                  </div>
                </div>
              ))}
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
                onClick={() => setActiveTab('complaints')}
                className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">View Complaints</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Manage Staff</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">View Projects</span>
                </div>
              </button>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        </div>
      </div>
    </div>
  );

  // Complaints Management Component
  const ComplaintsManagement = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complaints Management</h2>
          <p className="text-gray-600">Monitor and manage citizen complaints across all wards.</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{citizenComplaints.length}</div>
              <div className="text-blue-100">Total Complaints</div>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {citizenComplaints.filter(c => c.status === 'pending').length}
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
                {citizenComplaints.filter(c => c.status === 'in_progress').length}
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
                {citizenComplaints.filter(c => c.status === 'resolved').length}
              </div>
              <div className="text-green-100">Resolved</div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Recent Complaints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {citizenComplaints.slice(0, 10).map((complaint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{complaint.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{complaint.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {typeof complaint.location === 'string' ? complaint.location :
                     complaint.address || complaint.location?.address || 'Location not specified'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      complaint.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.priority || 'medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewReport(complaint)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditReport(complaint)}
                        className="text-green-600 hover:text-green-900" 
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {complaint.status !== 'assigned' && complaint.status !== 'resolved' && (
                        <button 
                          onClick={() => handleAssignReport(complaint)}
                          className="text-purple-600 hover:text-purple-900" 
                          title="Assign to Department Admin"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
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

  // Tasks Management Component
  const TasksManagement = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Tasks</h1>
          <p className="text-gray-600 mt-1">Manage tasks assigned to you by district admin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-indigo-600">{taskStats.totalTasks || 0}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{taskStats.completedTasks || 0}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgressTasks || 0}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tasks...</p>
          </div>
        ) : assignedTasks.length > 0 ? (
          assignedTasks.map((task) => (
            <motion.div
              key={task._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Assigned by: {task.assignedBy?.name}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Department: {task.department}
                    </span>
                  </div>
                  
                  {task.relatedReport && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Related Report:</span> {task.relatedReport.title}
                      </p>
                      <p className="text-sm text-gray-500">{task.relatedReport.address}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-6 flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority.toUpperCase()} PRIORITY
                  </span>
                  
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateTaskProgress(task._id, 'in_progress', 'Started working on this task')}
                          className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700 transition-colors"
                          disabled={task.status === 'in_progress'}
                        >
                          {task.status === 'in_progress' ? 'In Progress' : 'Start Task'}
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateTaskProgress(task._id, 'completed', 'Task completed successfully')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    {/* Assign to Staff Dropdown */}
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">Assign to Staff:</label>
                      <select
                        className="px-2 py-1 border rounded text-xs"
                        defaultValue=""
                        onChange={async (e) => {
                          const staffId = e.target.value;
                          if (!staffId) return;
                          try {
                            await assignTask({ itemId: task._id, staffId });
                            toast.success('Task assigned to staff successfully!');
                            // Optionally refresh tasks
                            getAssignedTasks();
                          } catch (err) {
                            toast.error('Failed to assign task: ' + (err?.message || 'Unknown error'));
                          }
                        }}
                      >
                        <option value="">Select Staff</option>
                        {staffData && staffData.length > 0 ? staffData.map(staff => (
                          <option key={staff._id} value={staff._id}>{staff.name} ({staff.department})</option>
                        )) : <option disabled>No staff available</option>}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {task.notes && task.notes.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Progress Notes:</h4>
                  <div className="space-y-2">
                    {task.notes.slice(-3).map((note, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <p>{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.addedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Assigned</h3>
            <p className="text-gray-600">You don't have any tasks assigned at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Add Staff Modal State
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', role: 'field_staff', department: '', password: '' });

  // Optimized event handlers using useCallback to prevent focus loss
  const handleStaffFormChange = useCallback((field) => {
    return (e) => {
      setStaffForm(prev => ({ ...prev, [field]: e.target.value }));
    };
  }, []);
  const [addingStaff, setAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showEditStaff, setShowEditStaff] = useState(false);

  // Staff Management Component
  const StaffManagement = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h2>
          <p className="text-gray-600">Manage municipal staff and assignments.</p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors"
          onClick={() => setShowAddStaff(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative"
            tabIndex={-1}
            onClick={e => e.stopPropagation()} // Prevent modal close on background click
          >
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setShowAddStaff(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Add Staff Member</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddingStaff(true);
                try {
                  await addStaffMember(staffForm);
                  toast.success('Staff member added!');
                  setShowAddStaff(false);
                  setStaffForm({ name: '', email: '', phone: '', role: 'field_staff', department: '', password: '' });
                  // Refresh staff list
                  const staffResponse = await getStaffData();
                  if (staffResponse.data.success) setStaffData(staffResponse.data.data);
                } catch (err) {
                  toast.error('Failed to add staff: ' + (err?.message || 'Unknown error'));
                } finally {
                  setAddingStaff(false);
                }
              }}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                  value={staffForm.name}
                  onChange={handleStaffFormChange('name')}
                  placeholder="Enter staff member's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  required
                  value={staffForm.email}
                  onChange={handleStaffFormChange('email')}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.phone} 
                  onChange={handleStaffFormChange('phone')}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.password} 
                  onChange={handleStaffFormChange('password')}
                  placeholder="Enter password for staff login"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.role} 
                  onChange={handleStaffFormChange('role')}
                >
                  <option value="field_staff">Field Staff</option>
                  <option value="department_head">Department Head</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={staffForm.department}
                  onChange={handleStaffFormChange('department')}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Health Services">Health Services</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Roads & Transport">Roads & Transport</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg font-semibold mt-2" disabled={addingStaff}>
                {addingStaff ? 'Adding...' : 'Add Staff'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setShowEditStaff(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Staff Member</h3>
            <form onSubmit={handleUpdateStaff} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                  value={staffForm.name}
                  onChange={handleStaffFormChange('name')}
                  placeholder="Enter staff member's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  required
                  value={staffForm.email}
                  onChange={handleStaffFormChange('email')}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.phone} 
                  onChange={handleStaffFormChange('phone')}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.password} 
                  onChange={handleStaffFormChange('password')}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={staffForm.role} 
                  onChange={handleStaffFormChange('role')}
                >
                  <option value="field_staff">Field Staff</option>
                  <option value="department_head">Department Head</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={staffForm.department}
                  onChange={handleStaffFormChange('department')}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Health Services">Health Services</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Roads & Transport">Roads & Transport</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold mt-2" disabled={addingStaff}>
                {addingStaff ? 'Updating...' : 'Update Staff'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffData.map((staff, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {staff.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                <p className="text-sm text-gray-600">{staff.role}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                {staff.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {staff.ward}
              </div>
              {staff.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {staff.phone}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                staff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {staff.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex space-x-2">
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => handleEditStaff(staff)}
                  title="Edit Staff"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => handleDeleteStaff(staff._id, staff.name)}
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Infrastructure Management Component with full functionality
  const InfrastructureSection = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Infrastructure Management</h2>
          <p className="text-gray-600">Monitor and manage municipal infrastructure projects and facilities.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Infrastructure Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{infrastructureStatus.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-green-600">{infrastructureStatus.activeProjects}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Maintenance Requests</p>
              <p className="text-2xl font-bold text-orange-600">{infrastructureStatus.maintenanceRequests}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget Utilized</p>
              <p className="text-2xl font-bold text-purple-600">{infrastructureStatus.budgetUtilized}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Status */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-purple-600" />
          Facilities Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infrastructureStatus.facilities?.map((facility, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">{facility.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{facility.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Operational:</span>
                  <span className="font-medium text-green-600">{facility.operational}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Maintenance:</span>
                  <span className="font-medium text-orange-600">{facility.maintenance}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(facility.operational / facility.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Recent Projects
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {infrastructureStatus.recentProjects?.map((project, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <p className="font-medium">₹{(project.budget / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <span className="text-gray-600">Expected Completion:</span>
                  <p className="font-medium">{new Date(project.expectedCompletion).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Finance Management Component with full functionality
  const FinanceSection = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Finance Management</h2>
          <p className="text-gray-600">Monitor municipal budgets, expenses, and financial performance.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{(financeData.totalBudget / 10000000).toFixed(1)}Cr</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget Used</p>
              <p className="text-2xl font-bold text-orange-600">₹{(financeData.budgetUsed / 10000000).toFixed(1)}Cr</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{(financeData.monthlyRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">₹{(financeData.monthlyExpenses / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Utilization Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-yellow-600" />
          Budget Utilization by Department
        </h3>
        <div className="space-y-4">
          {financeData.departments?.map((dept, index) => {
            const utilizationPercentage = (dept.used / dept.allocated) * 100;
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <span className="text-sm text-gray-600">{utilizationPercentage.toFixed(1)}% utilized</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Allocated:</span>
                    <p className="font-medium">₹{(dept.allocated / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Used:</span>
                    <p className="font-medium text-orange-600">₹{(dept.used / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining:</span>
                    <p className="font-medium text-green-600">₹{(dept.remaining / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      utilizationPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      utilizationPercentage > 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-blue-500'
                    }`}
                    style={{ width: `${utilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trends and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Financial Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financeData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`₹${(value / 1000000).toFixed(1)}M`, '']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {financeData.recentTransactions?.map((transaction, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{transaction.description}</h4>
                  <span className={`font-bold text-sm ${
                    transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'revenue' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{transaction.department}</span>
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectsSection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Projects Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-600">
                Progress: {project.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Budget: ₹{project.budget?.toLocaleString()}</span>
              <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Comprehensive Emergency Management System
  const EmergencySection = () => {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    
    const filteredAlerts = emergencyAlerts.filter(alert => {
      const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || alert.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'active': return 'bg-red-100 text-red-800';
        case 'in-progress': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'urgent': return 'bg-red-500 text-white';
        case 'high': return 'bg-orange-500 text-white';
        case 'medium': return 'bg-yellow-500 text-white';
        case 'low': return 'bg-green-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    };
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Emergency Management</h2>
            <p className="text-gray-600">Monitor and respond to emergency situations across the municipality.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
            <AlertTriangle className="w-4 h-4 mr-2" />
            New Emergency
          </button>
        </div>

        {/* Emergency Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Emergencies</p>
                <p className="text-2xl font-bold text-red-600">{emergencyAlerts.filter(a => a.status === 'active').length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{emergencyAlerts.filter(a => a.status === 'in-progress').length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{emergencyAlerts.filter(a => a.status === 'resolved').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">People Affected</p>
                <p className="text-2xl font-bold text-purple-600">{emergencyAlerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredAlerts.length} of {emergencyAlerts.length} alerts
            </div>
          </div>
        </div>

        {/* Emergency Alerts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAlerts.map((alert, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-6 h-6 mt-1 ${
                    alert.priority === 'urgent' ? 'text-red-600' :
                    alert.priority === 'high' ? 'text-orange-600' :
                    alert.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-gray-700 text-sm mb-2">{alert.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">{alert.location}</p>
                </div>
                <div>
                  <span className="text-gray-600">Affected:</span>
                  <p className="font-medium">{alert.affectedPopulation} people</p>
                </div>
                <div>
                  <span className="text-gray-600">Reported by:</span>
                  <p className="font-medium">{alert.reportedBy}</p>
                </div>
                <div>
                  <span className="text-gray-600">Contact:</span>
                  <p className="font-medium">{alert.contact}</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Reported: {new Date(alert.createdAt).toLocaleString()}</span>
                  <span>ETA: {new Date(alert.estimatedResolution).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="text-sm text-gray-600">Response Teams:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alert.responseTeams.map((team, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedAlert(alert)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedAlert.title}</h3>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-700">Description:</label>
                  <p className="text-gray-600 mt-1">{selectedAlert.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Priority:</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${getPriorityColor(selectedAlert.priority)}`}>
                      {selectedAlert.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status:</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${getStatusColor(selectedAlert.status)}`}>
                      {selectedAlert.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Location:</label>
                  <p className="text-gray-600 mt-1">{selectedAlert.location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Reported by:</label>
                    <p className="text-gray-600 mt-1">{selectedAlert.reportedBy}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Contact:</label>
                    <p className="text-gray-600 mt-1">{selectedAlert.contact}</p>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Affected Population:</label>
                  <p className="text-gray-600 mt-1">{selectedAlert.affectedPopulation} people</p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Response Teams:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAlert.responseTeams.map((team, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Reported Time:</label>
                    <p className="text-gray-600 mt-1">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Expected Resolution:</label>
                    <p className="text-gray-600 mt-1">{new Date(selectedAlert.estimatedResolution).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Mark as Resolved
                </button>
                <button className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                  Update Status
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Assign Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Comprehensive Settings Management System
  const SettingsSection = () => {
    const [activeSettingsTab, setActiveSettingsTab] = useState('general');
    const [settings, setSettings] = useState(municipalSettings);
    const [hasChanges, setHasChanges] = useState(false);
    
    const settingsTabs = [
      { id: 'general', label: 'General', icon: Settings },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'system', label: 'System', icon: Activity },
      { id: 'departments', label: 'Departments', icon: Building },
      { id: 'integrations', label: 'Integrations', icon: RefreshCw }
    ];
    
    const updateSetting = (section, key, value) => {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
      setHasChanges(true);
    };
    
    const updateNestedSetting = (section, parentKey, childKey, value) => {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parentKey]: {
            ...prev[section][parentKey],
            [childKey]: value
          }
        }
      }));
      setHasChanges(true);
    };
    
    const saveSettings = () => {
      // Here you would typically save to backend
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    };
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Municipal Settings</h2>
            <p className="text-gray-600">Configure system settings and municipal parameters.</p>
          </div>
          {hasChanges && (
            <button 
              onClick={saveSettings}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeSettingsTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeSettingsTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Municipality Name</label>
                    <input
                      type="text"
                      value={settings.general.municipalName}
                      onChange={(e) => updateSetting('general', 'municipalName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={settings.general.contactNumber}
                      onChange={(e) => updateSetting('general', 'contactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={settings.general.website}
                      onChange={(e) => updateSetting('general', 'website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={settings.general.address}
                    onChange={(e) => updateSetting('general', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="Asia/Mumbai">Asia/Mumbai</option>
                      <option value="Asia/Delhi">Asia/Delhi</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Regional">Regional Language</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={settings.general.workingHours.start}
                        onChange={(e) => updateNestedSetting('general', 'workingHours', 'start', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="self-center">to</span>
                      <input
                        type="time"
                        value={settings.general.workingHours.end}
                        onChange={(e) => updateNestedSetting('general', 'workingHours', 'end', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSettingsTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {key.includes('email') ? 'Send email notifications' :
                           key.includes('sms') ? 'Send SMS notifications' :
                           key.includes('push') ? 'Send push notifications' :
                           `Enable ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSettingsTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Lock Duration (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.accountLockDuration}
                      onChange={(e) => updateSetting('security', 'accountLockDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                      <input
                        type="number"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {['requireUppercase', 'requireNumbers', 'requireSymbols'].map((policy) => (
                        <div key={policy} className="flex items-center">
                          <input
                            type="checkbox"
                            id={policy}
                            checked={settings.security.passwordPolicy[policy]}
                            onChange={(e) => updateNestedSetting('security', 'passwordPolicy', policy, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={policy} className="ml-2 text-sm text-gray-700">
                            {policy.replace(/([A-Z])/g, ' $1').replace('require', 'Require')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeSettingsTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                    <input
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) => updateSetting('system', 'dataRetention', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (requests/hour)</label>
                    <input
                      type="number"
                      value={settings.system.apiRateLimit}
                      onChange={(e) => updateSetting('system', 'apiRateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={settings.system.maxFileSize}
                      onChange={(e) => updateSetting('system', 'maxFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.system.allowedFileTypes.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Departments */}
            {activeSettingsTab === 'departments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Department Management</h3>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Department
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {settings.departments.map((dept, index) => (
                    <div key={dept.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                          <input
                            type="text"
                            value={dept.name}
                            onChange={(e) => {
                              const updatedDepts = [...settings.departments];
                              updatedDepts[index].name = e.target.value;
                              setSettings(prev => ({ ...prev, departments: updatedDepts }));
                              setHasChanges(true);
                            }}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
                          <input
                            type="text"
                            value={dept.head}
                            onChange={(e) => {
                              const updatedDepts = [...settings.departments];
                              updatedDepts[index].head = e.target.value;
                              setSettings(prev => ({ ...prev, departments: updatedDepts }));
                              setHasChanges(true);
                            }}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                          <input
                            type="tel"
                            value={dept.contact}
                            onChange={(e) => {
                              const updatedDepts = [...settings.departments];
                              updatedDepts[index].contact = e.target.value;
                              setSettings(prev => ({ ...prev, departments: updatedDepts }));
                              setHasChanges(true);
                            }}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeSettingsTab === 'integrations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">External Integrations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(settings.integrations).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {key.includes('gis') ? 'Geographic Information System integration' :
                           key.includes('weather') ? 'Weather data service integration' :
                           key.includes('payment') ? 'Online payment processing' :
                           key.includes('sms') ? 'SMS notification service' :
                           key.includes('email') ? 'Email service integration' :
                           key.includes('cloud') ? 'Cloud storage service' :
                           key.includes('analytics') ? 'Analytics and reporting service' :
                           `${key.replace(/([A-Z])/g, ' $1')} integration`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Active' : 'Inactive'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateSetting('integrations', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Backup System
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Activity className="w-4 h-4 mr-2" />
              System Health Check
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Municipal Dashboard</h2>
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
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Municipal Portal</h1>
                  <p className="text-xs text-gray-600">Digital India</p>
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
                    <Building className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        Welcome, <span className="text-orange-700">{adminUser?.name || 'Municipal Admin'}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {municipalStats.assignedWard 
                          ? `Managing ${municipalStats.assignedWard}, ${municipalStats.municipality || 'Municipality'}`
                          : `Managing ${municipalStats.municipality || 'Municipal Services'}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Overview */}
              <div className="hidden lg:flex items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 mb-2"></div>
                    <div className="text-2xl font-bold text-orange-600">{citizenComplaints.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Complaints</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 mb-2"></div>
                    <div className="text-2xl font-bold text-green-600">{staffData.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Staff</div>
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
          {activeTab === 'complaints' && <ComplaintsManagement />}
          {activeTab === 'tasks' && <TasksManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'infrastructure' && <InfrastructureSection />}
          {activeTab === 'finance' && <FinanceSection />}
          {activeTab === 'projects' && <ProjectsSection />}
          {activeTab === 'emergency' && <EmergencySection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>

      {/* Assignment Dialog */}
      {assignmentDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign to Department Admin</h3>
              <button
                onClick={() => setAssignmentDialog({ ...assignmentDialog, open: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignmentDialog.report && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{assignmentDialog.report.title}</p>
                <p className="text-xs text-gray-600 mt-1">{assignmentDialog.report.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {assignmentDialog.report.address || 
                   (assignmentDialog.report.location?.coordinates ? 
                     `Coordinates: ${assignmentDialog.report.location.coordinates[1]}, ${assignmentDialog.report.location.coordinates[0]}` : 
                     'Location not specified')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department Admin
                </label>
                <select
                  value={assignmentDialog.selectedAdmin}
                  onChange={(e) => setAssignmentDialog({ ...assignmentDialog, selectedAdmin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose department admin...</option>
                  {departmentAdmins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} - {admin.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={assignmentDialog.priority}
                  onChange={(e) => setAssignmentDialog({ ...assignmentDialog, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={assignmentDialog.deadline}
                  onChange={(e) => setAssignmentDialog({ ...assignmentDialog, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  value={assignmentDialog.notes}
                  onChange={(e) => setAssignmentDialog({ ...assignmentDialog, notes: e.target.value })}
                  placeholder="Add any special instructions or notes for the department admin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setAssignmentDialog({ ...assignmentDialog, open: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignmentSubmit}
                disabled={!assignmentDialog.selectedAdmin || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Assign Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Dialog */}
      {viewReportDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
              <button
                onClick={() => setViewReportDialog({ open: false, report: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewReportDialog.report && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewReportDialog.report.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewReportDialog.report.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewReportDialog.report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      viewReportDialog.report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      viewReportDialog.report.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewReportDialog.report.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewReportDialog.report.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      viewReportDialog.report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      viewReportDialog.report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewReportDialog.report.priority || 'medium'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{viewReportDialog.report.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {viewReportDialog.report.address || 
                     (viewReportDialog.report.location?.coordinates ? 
                       `Coordinates: ${viewReportDialog.report.location.coordinates[1]}, ${viewReportDialog.report.location.coordinates[0]}` : 
                       'Location not specified')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewReportDialog.report.user?.name || 'Anonymous'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Reported</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {new Date(viewReportDialog.report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {viewReportDialog.report.images && viewReportDialog.report.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {viewReportDialog.report.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url || image}
                          alt={`Report image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewReportDialog({ open: false, report: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Dialog */}
      {editReportDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Report</h3>
              <button
                onClick={() => setEditReportDialog({ open: false, report: null, formData: {} })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editReportDialog.report && (
              <form onSubmit={handleEditReportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editReportDialog.formData.title}
                      onChange={handleEditReportFormChange('title')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Report title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={editReportDialog.formData.category}
                      onChange={handleEditReportFormChange('category')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Health">Health</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Roads">Roads</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editReportDialog.formData.status}
                      onChange={handleEditReportFormChange('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editReportDialog.formData.priority}
                      onChange={handleEditReportFormChange('priority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editReportDialog.formData.description}
                    onChange={handleEditReportFormChange('description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Report description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editReportDialog.formData.location}
                    onChange={handleEditReportFormChange('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Report location"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditReportDialog({ open: false, report: null, formData: {} })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Update Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalDashboard;