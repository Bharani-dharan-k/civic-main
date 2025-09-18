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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced header stripe with Indian flag colors */}
      <div className="h-2 bg-gradient-to-r from-orange-600 via-white via-blue-800 to-green-700 shadow-sm"></div>

      {/* Enhanced Google Translate Bar */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white shadow-md border-b-2 border-orange-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Choose Language:</span>

            <div className="relative">
              <div className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 space-x-2 shadow-md hover:shadow-lg transition-shadow">
                <span className="text-sm">🌐</span>
                <span className="text-sm font-medium">{translateLabel}</span>
                <span className="text-xs opacity-90">▾</span>
              </div>
              <div id="google_translate_element_dashboard" className="absolute inset-0 opacity-0" aria-hidden="true"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <span className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm">🇮🇳 Government of India</span>
            <span className="text-gray-500">Digital India</span>
          </div>
        </div>
      </div>

      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white via-orange-50 to-white shadow-lg border-b-4 border-gradient-to-r from-orange-600 via-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                  <AshokaChakra size={24} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-green-600 rounded-full ring-2 ring-white"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {deptInfo.icon} {fieldAdmin.departmentName || deptInfo.name}
                </h1>
                <p className="text-gray-600 text-sm font-medium flex items-center space-x-2">
                  <span>🏛️ Field Administration Portal</span>
                  <span className="text-orange-600">|</span>
                  <span className="text-blue-600">Government Dashboard</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">Welcome back,</p>
                <p className="font-bold text-gray-900 text-lg">{fieldAdmin.name}</p>
                <p className="text-xs text-orange-600 mt-1">Field Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'Assigned to Me', value: stats.assigned, icon: FileText, color: 'orange', bgColor: 'bg-orange-600', lightBg: 'bg-orange-50' },
            { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'blue', bgColor: 'bg-blue-600', lightBg: 'bg-blue-50' },
            { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green', bgColor: 'bg-green-600', lightBg: 'bg-green-50' },
            { title: 'Pending Action', value: stats.pending, icon: AlertTriangle, color: 'red', bgColor: 'bg-red-600', lightBg: 'bg-red-50' }
          ].map((stat, index) => (
            <div
              key={stat.title}
              className={`relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-l-4 border-${stat.color}-600 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-xl ${stat.bgColor} shadow-lg ring-2 ring-white`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900 block">
                    {stat.value}
                  </span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
              <div className={`${stat.lightBg} rounded-lg p-2 -mx-2`}>
                <h3 className="text-gray-800 font-bold text-center">{stat.title}</h3>
              </div>
              {/* Bottom accent stripe */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-b-xl`}></div>
            </div>
          ))}
        </div>

        {/* Enhanced Assigned Issues Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border-t-4 border-gradient-to-r from-orange-600 via-white to-green-600">
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 p-8 border-b-2 border-orange-200 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">My Assigned Issues</h2>
                  <p className="text-gray-600 font-medium">Track and manage your field assignments</p>
                </div>
              </div>
              <button
                onClick={() => loadAssignedIssues(fieldAdmin.department)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh</span>
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
                  className="p-7 hover:bg-gradient-to-r hover:from-orange-50 hover:via-white hover:to-green-50 transition-all duration-200 border-l-4 border-orange-600 hover:border-l-green-600 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-5 h-5 rounded-full ${getPriorityColor(issue.priority)} ring-2 ring-white shadow-md`}></div>
                        <span className="text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full">#{issue._id.slice(-6)}</span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${getStatusColor(issue.status)} shadow-sm`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {issue.priority === 'high' && (
                          <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                            ⚠️ HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{issue.title}</h3>
                      <p className="text-gray-700 mb-4 font-medium leading-relaxed">{issue.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-orange-100 px-3 py-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="font-medium text-gray-700">{issue.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 rounded-lg">
                          <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-gray-700">By: {issue.reportedBy?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          <span className="font-medium text-gray-700">{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3 ml-8">
                      <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md font-medium">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {issue.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(issue._id)}
                          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Start Work</span>
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteWork(issue)}
                          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
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

        {/* Enhanced Professional Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="bg-gradient-to-br from-white via-orange-50 to-white rounded-xl p-8 border-2 border-gray-200 shadow-lg border-t-4 border-gradient-to-r from-orange-600 via-blue-600 to-green-600">
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 rounded-full mb-6 mx-auto w-24"></div>

            <div className="flex items-center justify-center space-x-4 text-gray-800 text-xl font-bold mb-4">
              <AshokaChakra size={28} className="text-blue-600" />
              <span className="text-gray-900 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                SevaTrack Field Administration
              </span>
              <AshokaChakra size={28} className="text-blue-600" />
            </div>

            <div className="space-y-4">
              <p className="text-orange-700 font-bold text-lg">Dedicated to Public Service | जन सेवा के लिए समर्पित</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-bold shadow-md">
                  🇮🇳 Government of India
                </span>
                <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold shadow-md">
                  Digital India Initiative
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mt-4">
                Empowering Citizens | Building Tomorrow | सबका साथ, सबका विकास
              </p>
            </div>

            {/* Decorative bottom border */}
            <div className="h-1 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 rounded-full mt-6 mx-auto w-24"></div>
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