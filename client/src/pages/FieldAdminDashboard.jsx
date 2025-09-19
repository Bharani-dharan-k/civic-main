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

// Indian flag theme colors
const COLORS = {
  saffron: '#FF9933',
  white: '#FFFFFF',
  green: '#138808',
  navy: '#000080',
  chakraBlue: '#000080',
  saffronLight: '#FFB366',
  greenLight: '#26A65B',
  border: '#DDDDDD'
};
import AshokaChakra from '../components/Common/AshokaChakra';
import WorkCompletionForm from '../components/FieldAdmin/WorkCompletionForm';
import '../components/Common/GoogleTranslateStyles.css';

// Enhanced styled components for Indian flag theme
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}10 100%)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(to right, ${COLORS.saffron}, ${COLORS.white}, ${COLORS.green})`
    }
  },
  header: {
    position: 'relative',
    padding: '1.5rem',
    background: `linear-gradient(135deg, ${COLORS.saffron}20 0%, ${COLORS.white} 50%, ${COLORS.green}20 100%)`,
    borderBottom: `2px solid ${COLORS.navy}`,
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: COLORS.navy
    }
  },
  statsCard: {
    background: COLORS.white,
    borderRadius: '12px',
    padding: '1.5rem',
    border: `1px solid ${COLORS.border}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: 'var(--card-accent-color)'
    }
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  primaryButton: {
    background: COLORS.navy,
    color: COLORS.white,
    '&:hover': {
      background: `${COLORS.navy}e6`
    }
  },
  tableHeader: {
    background: `linear-gradient(135deg, ${COLORS.saffron}20 0%, ${COLORS.white} 100%)`,
    borderBottom: `2px solid ${COLORS.border}`
  }
};

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
    <div style={styles.container}>
      {/* Enhanced header with Indian flag colors */}
      <div style={{
        height: '4px',
        background: `linear-gradient(to right, ${COLORS.saffron} 33%, ${COLORS.white} 33% 66%, ${COLORS.green} 66%)`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}></div>

      {/* Enhanced Google Translate Bar with Indian theme */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}10 100%)`,
        borderBottom: `2px solid ${COLORS.saffronLight}`,
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div style={{
              padding: '0.5rem',
              background: `${COLORS.navy}10`,
              borderRadius: '50%',
              border: `2px solid ${COLORS.navy}30`
            }}>
              <Languages className="w-5 h-5" style={{ color: COLORS.navy }} />
            </div>
            <span style={{ 
              color: COLORS.navy,
              fontWeight: 600
            }}>Choose Language:</span>

            <div className="relative">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.chakraBlue} 100%)`,
                color: COLORS.white,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                gap: '0.5rem'
              }}>
                <span>🌐</span>
                <span style={{ fontWeight: 500 }}>{translateLabel}</span>
                <span style={{ opacity: 0.8 }}>▾</span>
              </div>
              <div id="google_translate_element_dashboard" className="absolute inset-0 opacity-0" aria-hidden="true"></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.saffron} 0%, ${COLORS.saffronLight} 100%)`,
              color: COLORS.white,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(255, 153, 51, 0.2)'
            }}>
              🇮🇳 Government of India
            </div>
            <div style={{
              color: COLORS.navy,
              fontSize: '0.875rem',
              fontWeight: 500
            }}>Digital India Initiative</div>
          </div>
        </div>
      </div>

      {/* Enhanced Professional Header with Indian theme */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}10 100%)`,
        borderBottom: `4px solid ${COLORS.navy}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.chakraBlue} 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,128,0.2)',
                  border: `4px solid ${COLORS.white}`
                }}>
                  <AshokaChakra size={24} style={{ color: COLORS.white }} />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  background: `linear-gradient(135deg, ${COLORS.saffron} 0%, ${COLORS.green} 100%)`,
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.white}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}></div>
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontWeight: 700,
                  color: COLORS.navy,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.chakraBlue} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {deptInfo.icon} {fieldAdmin.departmentName || deptInfo.name}
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: COLORS.navy
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    background: `linear-gradient(135deg, ${COLORS.saffronLight}20 0%, ${COLORS.white} 100%)`,
                    borderRadius: '16px',
                    border: `1px solid ${COLORS.saffronLight}`,
                    fontSize: '0.875rem'
                  }}>
                    🏛️ Field Administration Portal
                  </span>
                  <span style={{
                    width: '2px',
                    height: '1rem',
                    background: COLORS.saffron
                  }}></span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    background: `linear-gradient(135deg, ${COLORS.greenLight}20 0%, ${COLORS.white} 100%)`,
                    borderRadius: '16px',
                    border: `1px solid ${COLORS.greenLight}`,
                    fontSize: '0.875rem'
                  }}>
                    Government Dashboard
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div style={{
                padding: '1rem',
                background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.saffronLight}10 100%)`,
                borderRadius: '12px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                textAlign: 'right'
              }}>
                <p style={{ color: COLORS.navy, fontSize: '0.875rem', fontWeight: 500 }}>Welcome back,</p>
                <p style={{ 
                  color: COLORS.navy,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: '0.25rem 0'
                }}>{fieldAdmin.name}</p>
                <p style={{
                  color: COLORS.saffron,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginTop: '0.25rem'
                }}>Field Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  ...styles.button,
                  background: '#000080',
                  color: COLORS.white,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 128, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  border: '2px solid #000080',
                  '&:hover': {
                    background: '#000066',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 128, 0.3)'
                  }
                }}
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