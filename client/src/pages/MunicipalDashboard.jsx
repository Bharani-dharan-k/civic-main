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
    assignTask,
    getInfrastructureStatus,
    getFinanceData,
    getProjectsData,
    getEmergencyAlerts,
    getServiceRequests,
    updateReportStatus,
    getWardData,
    createAnnouncement,
    getAnnouncementStats
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
  const [infrastructureStatus, setInfrastructureStatus] = useState({});
  const [financeData, setFinanceData] = useState({});
  const [projects, setProjects] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
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
    { id: 'staff', label: 'Staff Management', icon: Users, color: 'text-green-600', badge: 0 },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'text-purple-600', badge: 0 },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-yellow-600', badge: 0 },
    { id: 'projects', label: 'Projects', icon: Wrench, color: 'text-indigo-600', badge: projects.filter(p => p.status === 'active').length },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-600', badge: emergencyAlerts.length },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600', badge: 0 }
  ];

  useEffect(() => {
    loadDashboardData();
    loadUrgentAlerts();
  }, [selectedWard]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel for better performance
      const [
        complaintsResponse,
        staffResponse,
        infrastructureResponse,
        financeResponse,
        projectsResponse,
        alertsResponse,
        serviceResponse,
        statsResponse
      ] = await Promise.all([
        getCitizenComplaints({
          // Remove strict filtering to get all reports first
        }),
        getStaffData(),
        getInfrastructureStatus(),
        getFinanceData(),
        getProjectsData(),
        getEmergencyAlerts(),
        getServiceRequests().catch(err => {
          console.log('⚠️ Service requests API error:', err.message);
          return { data: { success: false, data: [] } };
        }),
        getMunicipalStats().catch(err => {
          console.log('⚠️ Municipal stats API error:', err.message);
          return { data: { success: false, data: {} } };
        })
      ]);

      console.log('🔍 API Responses:', {
        complaints: complaintsResponse.data,
        staff: staffResponse.data,
        infrastructure: infrastructureResponse.data,
        service: serviceResponse.data
      });

      // Set citizen complaints from reports
      if (complaintsResponse.data.success) {
        const reports = complaintsResponse.data.reports || complaintsResponse.data.data || [];
        console.log('📊 Raw reports:', reports);

        // Define municipal categories (matching the actual schema enum values)
        const municipalCategories = [
          'pothole', 'streetlight', 'garbage', 'drainage', 'maintenance',
          'electrical', 'plumbing', 'cleaning', 'other'
        ];

        // Filter and format complaints for municipal only
        const filteredReports = reports.filter(report => {
          return municipalCategories.includes(report.category) ||
                 (report.category && report.category.toLowerCase().includes('municipal'));
        });

        console.log('🏛️ Municipal reports:', filteredReports);
        setCitizenComplaints(filteredReports);
      }

      // Set staff data
      if (staffResponse.data.success) {
        setStaffData(staffResponse.data.data || []);
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
        setProjects(projectsResponse.data.data || []);
      }

      // Set emergency alerts
      if (alertsResponse.data.success) {
        setEmergencyAlerts(alertsResponse.data.data || []);
      }

      // Set service requests
      if (serviceResponse.data.success) {
        setServiceRequests(serviceResponse.data.data || []);
      }

      // Set municipal stats
      if (statsResponse.data.success) {
        setMunicipalStats(statsResponse.data.data || {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          staffCount: 0,
          activeProjects: 0,
          budget: 0
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Set fallback data
      setCitizenComplaints([
        {
          _id: '1',
          title: 'Pothole on Main Street',
          category: 'pothole',
          status: 'pending',
          priority: 'high',
          location: 'Main Street, Ward 5',
          createdAt: new Date().toISOString(),
          description: 'Large pothole causing traffic issues'
        },
        {
          _id: '2',
          title: 'Streetlight Not Working',
          category: 'streetlight',
          status: 'in_progress',
          priority: 'medium',
          location: 'Park Avenue, Ward 3',
          createdAt: new Date().toISOString(),
          description: 'Streetlight has been out for 3 days'
        }
      ]);

      setStaffData([
        {
          _id: '1',
          name: 'Rajesh Kumar',
          role: 'field_supervisor',
          department: 'Roads',
          ward: 'Ward 5',
          phone: '+91-9876543210',
          status: 'active'
        },
        {
          _id: '2',
          name: 'Priya Singh',
          role: 'maintenance_engineer',
          department: 'Electrical',
          ward: 'Ward 3',
          phone: '+91-9876543211',
          status: 'active'
        }
      ]);

      setProjects([
        {
          _id: '1',
          name: 'Road Repair Project',
          status: 'active',
          progress: 65,
          budget: 500000,
          deadline: '2024-12-31'
        },
        {
          _id: '2',
          name: 'Street Light Upgrade',
          status: 'active',
          progress: 30,
          budget: 200000,
          deadline: '2024-11-30'
        }
      ]);

      setMunicipalStats({
        totalComplaints: 145,
        resolvedComplaints: 98,
        pendingComplaints: 47,
        staffCount: 25,
        activeProjects: 6,
        budget: 2500000
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          { title: 'Active Staff', value: municipalStats.staffCount || staffData.length, icon: Users, color: 'text-purple-600', bg: 'from-purple-400 to-purple-600' },
          { title: 'Active Projects', value: municipalStats.activeProjects || projects.filter(p => p.status === 'active').length, icon: Wrench, color: 'text-orange-600', bg: 'from-orange-400 to-orange-600' }
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
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="w-4 h-4" />
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

  // Staff Management Component
  const StaffManagement = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h2>
          <p className="text-gray-600">Manage municipal staff and assignments.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

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
                staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {staff.status}
              </span>
              <div className="flex space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Other section components (simplified for now)
  const InfrastructureSection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Infrastructure Management</h2>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600">Infrastructure monitoring and management tools.</p>
      </div>
    </div>
  );

  const FinanceSection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Finance Management</h2>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600">Municipal finance and budget management.</p>
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

  const EmergencySection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Emergency Alerts</h2>
      <div className="space-y-4">
        {emergencyAlerts.map((alert, index) => (
          <div key={index} className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">{alert.title}</h3>
                <p className="text-red-700">{alert.description}</p>
                <p className="text-sm text-red-600 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                alert.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600">Municipal system settings and configuration.</p>
      </div>
    </div>
  );

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
                      <p className="text-sm text-gray-600">Managing Municipal Services</p>
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
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'infrastructure' && <InfrastructureSection />}
          {activeTab === 'finance' && <FinanceSection />}
          {activeTab === 'projects' && <ProjectsSection />}
          {activeTab === 'emergency' && <EmergencySection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
};

export default MunicipalDashboard;