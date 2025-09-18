import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  User,
  Eye,
  PlayCircle,
  RefreshCw,
  LogOut,
  Shield,
  Calendar,
  Languages
} from 'lucide-react';
import AshokaChakra from '../components/Common/AshokaChakra';
import WorkCompletionForm from '../components/FieldAdmin/WorkCompletionForm';
import '../components/Common/GoogleTranslateStyles.css';

const FieldAdminDashboard = () => {
  const navigate = useNavigate();
  const [translateLabel, setTranslateLabel] = useState('English');
  const [fieldAdmin, setFieldAdmin] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const adminData = localStorage.getItem('fieldAdminUser');
    if (adminData) {
      setFieldAdmin(JSON.parse(adminData));
      loadAssignedIssues(JSON.parse(adminData).department);
    } else {
      navigate('/field-admin/login');
    }

    // Check if Google Translate script already exists
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (!existingScript) {
      // Load Google Translate script
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize Google Translate
    window.googleTranslateElementInit2 = () => {
      const translateElement = document.getElementById('google_translate_element_dashboard');
      if (translateElement && !translateElement.hasChildNodes()) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,pa,or,as,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element_dashboard'
        );
        // after widget is created, sync label and attach change listener
        setTimeout(() => {
          const combo = document.querySelector('#google_translate_element_dashboard select.goog-te-combo');
          if (combo) {
            const updateLabel = () => {
              const selected = combo.options[combo.selectedIndex];
              if (selected) setTranslateLabel(selected.text.replace(/\(.*\)/, '').trim() || 'English');
            };
            updateLabel();
            combo.addEventListener('change', updateLabel);
          }
        }, 500);
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      // Clear the translate element
      const translateElement = document.getElementById('google_translate_element_dashboard');
      if (translateElement) {
        translateElement.innerHTML = '';
      }
    };
  }, [navigate]);

  const loadAssignedIssues = async (department) => {
    setLoading(true);
    try {
      // Mock data for demonstration - comprehensive issues for all departments
      const allMockIssues = [
        // PWD Issues
        {
          _id: 'pwd001',
          title: 'Large pothole on Main Street',
          description: 'Deep pothole causing traffic issues and vehicle damage',
          category: 'pwd',
          priority: 'high',
          status: 'assigned',
          address: 'Main Street, Block A, Sector 12',
          reportedBy: { name: 'Rajesh Kumar' },
          createdAt: new Date().toISOString(),
          assignedAt: new Date().toISOString()
        },
        {
          _id: 'pwd002',
          title: 'Damaged pavement near bus stop',
          description: 'Broken concrete slabs causing pedestrian safety issues',
          category: 'pwd',
          priority: 'medium',
          status: 'in_progress',
          address: 'Bus Stop, Commercial Complex',
          reportedBy: { name: 'Sunita Devi' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
          _id: 'pwd003',
          title: 'Road divider damage',
          description: 'Concrete divider broken by heavy vehicle',
          category: 'pwd',
          priority: 'low',
          status: 'assigned',
          address: 'Highway Road, KM 15',
          reportedBy: { name: 'Mohammed Ali' },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          assignedAt: new Date().toISOString()
        },
        // Sanitation Issues
        {
          _id: 'san001',
          title: 'Garbage overflow in residential area',
          description: 'Bins not collected for 3 days, causing health hazard',
          category: 'sanitation',
          priority: 'high',
          status: 'assigned',
          address: 'Green Park, Phase 2, Block C',
          reportedBy: { name: 'Amit Singh' },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          assignedAt: new Date().toISOString()
        },
        {
          _id: 'san002',
          title: 'Illegal dumping near market',
          description: 'Construction waste dumped illegally',
          category: 'sanitation',
          priority: 'medium',
          status: 'in_progress',
          address: 'Vegetable Market, Lane 3',
          reportedBy: { name: 'Geeta Sharma' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedAt: new Date(Date.now() - 43200000).toISOString()
        },
        // Lighting Issues
        {
          _id: 'light001',
          title: 'Broken streetlight near school',
          description: 'Safety concern for children during evening hours',
          category: 'lighting',
          priority: 'high',
          status: 'assigned',
          address: 'Government School Road, Sector 15',
          reportedBy: { name: 'Priya Sharma' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedAt: new Date().toISOString()
        },
        {
          _id: 'light002',
          title: 'Exposed electric wires',
          description: 'Dangerous exposed wires near residential area',
          category: 'lighting',
          priority: 'high',
          status: 'assigned',
          address: 'Residential Colony, Street 7',
          reportedBy: { name: 'Vikash Gupta' },
          createdAt: new Date().toISOString(),
          assignedAt: new Date().toISOString()
        },
        // Water Issues
        {
          _id: 'water001',
          title: 'Water pipeline burst',
          description: 'Major water leakage causing road flooding',
          category: 'water',
          priority: 'high',
          status: 'assigned',
          address: 'Industrial Area, Road 9',
          reportedBy: { name: 'Ramesh Yadav' },
          createdAt: new Date().toISOString(),
          assignedAt: new Date().toISOString()
        },
        {
          _id: 'water002',
          title: 'Open drain overflow',
          description: 'Sewage overflow causing sanitation issues',
          category: 'water',
          priority: 'medium',
          status: 'in_progress',
          address: 'Old City Market Area',
          reportedBy: { name: 'Kamala Devi' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedAt: new Date(Date.now() - 43200000).toISOString()
        },
        // Others Issues
        {
          _id: 'other001',
          title: 'Park maintenance required',
          description: 'Playground equipment needs repair and cleaning',
          category: 'others',
          priority: 'low',
          status: 'assigned',
          address: 'Children Park, Sector 8',
          reportedBy: { name: 'Anita Kumari' },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          assignedAt: new Date().toISOString()
        }
      ];

      // Filter by department
      const departmentMap = {
        pwd: ['pwd'],
        sanitation: ['sanitation'],
        lighting: ['lighting'],
        water: ['water'],
        others: ['others']
      };

      const filteredIssues = allMockIssues.filter(issue =>
        departmentMap[department]?.includes(issue.category)
      );

      setAssignedIssues(filteredIssues);

      // Calculate stats
      const newStats = {
        assigned: filteredIssues.filter(i => i.status === 'assigned').length,
        inProgress: filteredIssues.filter(i => i.status === 'in_progress').length,
        completed: filteredIssues.filter(i => i.status === 'resolved').length,
        pending: filteredIssues.filter(i => i.status === 'assigned').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error loading assigned issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = (issueId) => {
    setAssignedIssues(prev =>
      prev.map(issue =>
        issue._id === issueId
          ? { ...issue, status: 'in_progress', startedAt: new Date().toISOString() }
          : issue
      )
    );
  };

  const handleCompleteWork = (issue) => {
    setSelectedIssue(issue);
    setShowCompletionForm(true);
  };

  const handleCompletionSubmit = (completionData) => {
    // Update the issue status with completion data
    setAssignedIssues(prev =>
      prev.map(issue =>
        issue._id === completionData.issueId
          ? {
              ...issue,
              status: 'resolved',
              completedAt: new Date().toISOString(),
              completionData: completionData
            }
          : issue
      )
    );

    // Update stats
    setStats(prev => ({
      ...prev,
      inProgress: prev.inProgress - 1,
      completed: prev.completed + 1
    }));

    // Close the form
    setShowCompletionForm(false);
    setSelectedIssue(null);

    // Show success message
    alert('Work marked as completed successfully! 🎉');
  };

  const handleCloseCompletionForm = () => {
    setShowCompletionForm(false);
    setSelectedIssue(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('fieldAdminToken');
    localStorage.removeItem('fieldAdminUser');
    navigate('/login');
  };

  const getDepartmentInfo = (deptId) => {
    const departments = {
      pwd: { name: 'Roads & Public Works', icon: '🛣️', color: 'blue' },
      sanitation: { name: 'Sanitation & Waste', icon: '🗑️', color: 'green' },
      lighting: { name: 'Street Lighting', icon: '💡', color: 'yellow' },
      water: { name: 'Water & Drainage', icon: '🚰', color: 'cyan' },
      others: { name: 'Others', icon: '⚙️', color: 'gray' }
    };
    return departments[deptId] || departments.others;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!fieldAdmin) return null;

  const deptInfo = getDepartmentInfo(fieldAdmin.department);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-white via-green-50 to-blue-50">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-blue-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Google Translate Bar */}
      <div className="relative z-20 bg-white shadow-md border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
            <Languages className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Choose Language:</span>

            {/* Custom pill that matches the desired UI. The real Google select is overlaid with opacity 0 to capture clicks. */}
            <div className="relative">
              <div className="flex items-center bg-green-600 text-white rounded-full px-4 py-1.5 space-x-2 shadow-sm">
                <span className="text-sm">🌐</span>
                <span className="text-sm font-medium">{translateLabel}</span>
                <span className="text-xs opacity-90">▾</span>
              </div>
              <div id="google_translate_element_dashboard" className="absolute inset-0 opacity-0" aria-hidden="true"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">🇮🇳 India</span>
            <span>Government Portal</span>
          </div>
        </div>
      </div>

      {/* Enhanced Header with Indian Flag Theme */}
      <div className="relative z-10 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <AshokaChakra size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {deptInfo.icon} {fieldAdmin.departmentName || deptInfo.name}
                </h1>
                <p className="text-gray-600 text-sm font-medium">Field Administration Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Welcome back,</p>
                <p className="font-semibold text-gray-800 text-base">{fieldAdmin.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { title: 'Assigned to Me', value: stats.assigned, icon: FileText, color: 'orange', gradient: 'from-orange-500 to-orange-600' },
            { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
            { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-green-600' },
            { title: 'Pending Action', value: stats.pending, icon: AlertTriangle, color: 'red', gradient: 'from-red-500 to-red-600' }
          ].map((stat, index) => (
            <div
              key={stat.title}
              className="relative bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-600 shadow-md">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-gray-700 font-semibold text-base">{stat.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Assigned Issues */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Assigned Issues</h2>
              <button
                onClick={() => loadAssignedIssues(fieldAdmin.department)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : assignedIssues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">No issues assigned to your department</p>
                <p className="text-sm">New assignments will appear here</p>
              </div>
            ) : (
              assignedIssues.map((issue, index) => (
                <div
                  key={issue._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                        <span className="text-sm font-medium text-gray-600">#{issue._id.slice(-6)}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {issue.priority === 'high' && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{issue.title}</h3>
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{issue.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Reported by: {issue.reportedBy?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-6">
                      <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {issue.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(issue._id)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Start Work</span>
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteWork(issue)}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-16 pb-12">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-md">
            <div className="flex items-center justify-center space-x-4 text-gray-800 text-lg font-semibold mb-3">
              <AshokaChakra size={24} className="text-blue-600" />
              <span className="text-gray-900">
                SevaTrack Field Administration
              </span>
              <AshokaChakra size={24} className="text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-orange-600 font-semibold">Dedicated to Public Service</p>
              <div className="flex items-center justify-center space-x-2 mt-3">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm">Government of India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Completion Form */}
      <WorkCompletionForm
        issue={selectedIssue}
        isOpen={showCompletionForm}
        onClose={handleCloseCompletionForm}
        onSubmit={handleCompletionSubmit}
      />
    </div>
  );
};

export default FieldAdminDashboard;