import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Timer,
  TrendingUp,
  AlertTriangle,
  Users,
  MapPin,
  UserCheck,
  Eye,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentReports()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/dashboardstats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setRecentIssues(data.reports.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent reports:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const dashboardStats = [
    {
      title: 'Total Reports',
      value: stats.total.toString(),
      change: stats.recentReports ? `+${stats.recentReports} this week` : '+0 this week',
      changeType: 'increase',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Pending Assignment',
      value: (stats.submitted + stats.acknowledged).toString(),
      change: 'Need attention',
      changeType: stats.submitted > 0 ? 'increase' : 'decrease',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      title: 'In Progress',
      value: (stats.assigned + stats.inProgress).toString(),
      change: 'Active workers',
      changeType: 'neutral',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Resolved Issues',
      value: stats.resolved.toString(),
      change: `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolution rate`,
      changeType: 'increase',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  // Calculate department breakdown from stats
  const departments = stats.categoryBreakdown ? stats.categoryBreakdown.map(cat => ({
    name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
    activeIssues: cat.count,
    color: getDepartmentColor(cat._id)
  })) : [];

  function getDepartmentColor(category) {
    const colorMap = {
      pothole: 'blue',
      streetlight: 'yellow', 
      garbage: 'green',
      drainage: 'purple',
      maintenance: 'blue',
      electrical: 'yellow',
      plumbing: 'blue',
      cleaning: 'green'
    };
    return colorMap[category] || 'gray';
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with civic issues today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                stat.changeType === 'increase' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentIssues.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p>No reports found. Citizens can submit reports to get started.</p>
              </div>
            ) : (
              recentIssues.map((issue, index) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/reports')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                      <span className="text-sm font-medium text-gray-900">#{issue._id.slice(-6)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {formatStatus(issue.status)}
                      </span>
                      {(issue.status === 'submitted' || issue.status === 'acknowledged') && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Needs Assignment
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="bg-gray-100 px-2 py-1 rounded capitalize">{issue.category}</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{issue.address || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{issue.reportedBy?.name || 'Anonymous'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/admin/reports');
                        }}
                        className="text-orange-600 hover:text-orange-700 text-xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(issue.status === 'submitted' || issue.status === 'acknowledged') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin/reports');
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Department Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Department Status</h2>
          </div>
          <div className="p-6 space-y-4">
            {departments.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No category data available</p>
              </div>
            ) : (
              departments.map((dept, index) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${dept.color}-500`}></div>
                    <span className="font-medium text-gray-900">{dept.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {dept.activeIssues} reports
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Reports</p>
              <p className="text-sm text-gray-600">View and assign citizen reports</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/admin/reports?status=submitted')}
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <UserCheck className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Assign Workers</p>
              <p className="text-sm text-gray-600">Assign reports to field workers</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Generate reports and insights</p>
            </div>
          </button>
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
