import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Mic,
  Upload,
  Bell,
  Trophy,
  TrendingUp,
  User,
  LogOut,
  Home,
  FileText,
  BarChart3,
  Star,
  Award,
  Users,
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
  MapPinIcon,
  Settings,
  Menu,
  X,
  Globe,
  ChevronDown,
  Map,
  Bot,
  RefreshCw,
  Flag,
  Heart,
  Shield,
  Zap,
  Target,
  Activity,
  Flame
} from 'lucide-react';

// Import the new pages
import InteractiveMapPage from './InteractiveMapPage';
import AIChatbotPage from './AIChatbotPage';

// Import services and utilities
import { reportService, userService, notificationService } from '../services/reportService';
import { useTranslation } from '../utils/translations';
import DuplicateReportModal from '../components/Citizen/DuplicateReportModal';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLanguage } = useTranslation();
  // State management
  const [activeTab, setActiveTab] = useState('submit');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Language options with Indian flag theme
  const languages = [
    { code: 'en', name: 'English', flag: '🇮🇳', nativeName: 'English' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', nativeName: 'தமிழ்' }
  ];

  // Enhanced navigation items with Indian civic theme
  const sidebarItems = [
    { id: 'submit', label: 'Submit Report', icon: PlusCircle, color: 'text-saffron-600' },
    { id: 'track', label: 'Track Status', icon: MapPin, color: 'text-green-600' },
    { id: 'interactive_map', label: 'Interactive Map', icon: Map, color: 'text-blue-600' },
    { id: 'ai_chatbot', label: 'AI Assistant', icon: Bot, color: 'text-purple-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, color: 'text-red-600' },
    { id: 'insights', label: 'Insights', icon: BarChart3, color: 'text-indigo-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-gray-600' }
  ];

  // Initialize component
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Load user profile with fallback
      try {
        console.log('Attempting to load user profile...');
        const userProfile = await userService.getProfile();
        console.log('User profile loaded:', userProfile);
        setUser(userProfile?.user || userProfile);
      } catch (userError) {
        console.log('Failed to load user profile, using fallback data:', userError);
        const storedUser = localStorage.getItem('citizenUser') || localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (parseError) {
            setUser({
              _id: 'fallback-user-123',
              name: 'John Doe',
              email: 'citizen@civic.gov.in',
              phone: '+91 000-000-0000',
              location: 'New Delhi, India',
              bio: 'An active citizen',
              points: 108,
              badges: [],
              role: 'citizen'
            });
          }
        } else {
          setUser({
            _id: 'fallback-user-123',
            name: 'John Doe',
            email: 'citizen@civic.gov.in',
            phone: '+91 000-000-0000',
            location: 'New Delhi, India',
            bio: 'An active citizen',
            points: 108,
            badges: [],
            role: 'citizen'
          });
        }
      }

      // Load user's reports
      try {
        const userReports = await reportService.getUserReports();
        console.log('User reports loaded:', userReports);
        setComplaints(Array.isArray(userReports) ? userReports : []);
      } catch (reportsError) {
        console.error('Failed to load user reports:', reportsError);
        setComplaints([]);
      }

      // Load notifications
      const userNotifications = await notificationService.getNotifications();
      const notificationsArray = Array.isArray(userNotifications) ? userNotifications : [];
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter(n => !n.read).length);

    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      toast.error('Failed to load data');
      setComplaints([]);
      setNotifications([]);
      setUnreadCount(0);
      if (!user) {
        setUser({
          name: 'John Doe',
          email: 'citizen@civic.gov.in',
          points: 108
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('citizenToken');
    localStorage.removeItem('citizenUser');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Handle language change
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
    toast.success('Language changed');
  };

  // Enhanced Submit Complaint Section with Indian Design
  const SubmitComplaintSection = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: '',
      location: '',
      priority: 'medium',
      images: [],
      coordinates: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [duplicateReports, setDuplicateReports] = useState([]);
    const [pendingSubmissionData, setPendingSubmissionData] = useState(null);

    const categories = [
      { value: 'pothole', label: '🕳️ Road & Potholes', color: 'bg-red-50 border-red-200' },
      { value: 'streetlight', label: '💡 Street Lighting', color: 'bg-yellow-50 border-yellow-200' },
      { value: 'garbage', label: '🗑️ Waste Management', color: 'bg-green-50 border-green-200' },
      { value: 'drainage', label: '🌊 Drainage Issues', color: 'bg-blue-50 border-blue-200' },
      { value: 'traffic', label: '🚦 Traffic Management', color: 'bg-orange-50 border-orange-200' },
      { value: 'water', label: '💧 Water Supply', color: 'bg-cyan-50 border-cyan-200' },
      { value: 'electricity', label: '⚡ Electricity', color: 'bg-purple-50 border-purple-200' },
      { value: 'other', label: '📋 Other Issues', color: 'bg-gray-50 border-gray-200' }
    ];

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 1) {
        toast.error('Please upload only one image');
        return;
      }
      if (files.length > 0) {
        setFormData(prev => ({ ...prev, images: [files[0]] }));
      }
    };

    const removeImage = (index) => {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    };

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        toast.error('GPS location not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: { latitude, longitude },
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          toast.success('Location captured successfully');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get location');
        }
      );
    };

    const checkForDuplicates = async (coordinates) => {
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        return null;
      }

      try {
        const response = await reportService.checkDuplicateReports(
          coordinates.latitude,
          coordinates.longitude,
          20 // 20 meter radius
        );

        return response;
      } catch (error) {
        console.error('Error checking duplicates:', error);
        return null;
      }
    };

    const performDirectSubmission = async (submitData) => {
      try {
        await reportService.createReport(submitData);

        toast.success('✅ Report submitted successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          priority: 'medium',
          images: [],
          coordinates: null
        });

        // Refresh complaints list
        const updatedReports = await reportService.getUserReports();
        setComplaints(Array.isArray(updatedReports) ? updatedReports : []);

      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Failed to submit report');
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }

      try {
        setSubmitting(true);

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('address', formData.location || 'Location not specified');
        submitData.append('priority', formData.priority);

        if (formData.coordinates && formData.coordinates.latitude && formData.coordinates.longitude) {
          submitData.append('longitude', formData.coordinates.longitude);
          submitData.append('latitude', formData.coordinates.latitude);
        } else {
          submitData.append('longitude', '77.2090');
          submitData.append('latitude', '28.6139');
        }

        if (formData.images && formData.images.length > 0) {
          submitData.append('image', formData.images[0]);
        }

        // Check for duplicates if GPS coordinates are available
        if (formData.coordinates && formData.coordinates.latitude && formData.coordinates.longitude) {
          const duplicateCheck = await checkForDuplicates(formData.coordinates);

          if (duplicateCheck && duplicateCheck.hasDuplicates && duplicateCheck.reports.length > 0) {
            setPendingSubmissionData(submitData);
            setDuplicateReports(duplicateCheck.reports);
            setIsDuplicateModalOpen(true);
            setSubmitting(false);
            return;
          }
        }

        await performDirectSubmission(submitData);

      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Failed to submit report');
      } finally {
        setSubmitting(false);
      }
    };

    const handleProceedWithSubmission = async () => {
      if (pendingSubmissionData) {
        try {
          setSubmitting(true);
          await performDirectSubmission(pendingSubmissionData);
        } finally {
          setSubmitting(false);
          setIsDuplicateModalOpen(false);
          setPendingSubmissionData(null);
          setDuplicateReports([]);
        }
      }
    };

    const handleCloseDuplicateModal = () => {
      setIsDuplicateModalOpen(false);
      setPendingSubmissionData(null);
      setDuplicateReports([]);
    };

    const handleViewExistingReport = (report) => {
      console.log('Viewing existing report:', report);
      toast.info(`Viewing report: ${report.title}`);
    };

    return (
      <div className="max-w-5xl mx-auto">
        {/* Hero Section with Indian Flag Theme */}
        <div className="relative bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Flag className="w-8 h-8 text-saffron-600" />
                  Digital India Civic Portal
                </h1>
                <p className="text-gray-700 text-lg">Your Voice, Your City, Your Future</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-saffron-100 rounded-full flex items-center justify-center mb-2">
                    <Heart className="w-8 h-8 text-saffron-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Service</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Security</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-saffron-500 to-green-500 rounded-lg flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Submit New Report</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Enhanced Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Issue Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <label
                      key={cat.value}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                        formData.category === cat.value
                          ? 'border-saffron-500 bg-saffron-50 ring-2 ring-saffron-200'
                          : cat.color
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={formData.category === cat.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-lg mb-1">{cat.label.split(' ')[0]}</div>
                        <div className="text-xs font-medium text-gray-700">
                          {cat.label.substring(cat.label.indexOf(' ') + 1)}
                        </div>
                      </div>
                      {formData.category === cat.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-saffron-600" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Report Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Please provide detailed information about the issue..."
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                    placeholder="Address or location details"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-6 py-3 bg-gradient-to-r from-saffron-500 to-green-500 text-white rounded-lg hover:from-saffron-600 hover:to-green-600 flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    GPS
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Low', color: 'bg-green-50 border-green-200 text-green-700' },
                    { value: 'medium', label: 'Medium', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { value: 'high', label: 'High', color: 'bg-red-50 border-red-200 text-red-700' }
                  ].map(priority => (
                    <label
                      key={priority.value}
                      className={`cursor-pointer rounded-lg border-2 p-3 text-center font-medium transition-all ${
                        formData.priority === priority.value
                          ? 'border-saffron-500 bg-saffron-50 ring-2 ring-saffron-200'
                          : priority.color
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {priority.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhanced Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Attach Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-saffron-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-lg font-medium text-gray-700">Upload Photo</span>
                    <span className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative inline-block mr-4">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-saffron-500 to-green-500 text-white py-4 px-8 rounded-lg hover:from-saffron-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold shadow-lg transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-6 h-6" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Duplicate Report Modal */}
            <DuplicateReportModal
              isOpen={isDuplicateModalOpen}
              onClose={handleCloseDuplicateModal}
              duplicateReports={duplicateReports}
              onProceedAnyway={handleProceedWithSubmission}
              onViewExisting={handleViewExistingReport}
              userLocation={formData.coordinates}
            />
          </div>

          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>
      </div>
    );
  };

  // Enhanced Track Status Section
  const TrackStatusSection = ({ complaints }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredComplaints = complaints.filter(complaint => {
      const matchesSearch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
      const colors = {
        'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
        'acknowledged': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'assigned': 'bg-purple-100 text-purple-800 border-purple-200',
        'in_progress': 'bg-orange-100 text-orange-800 border-orange-200',
        'resolved': 'bg-green-100 text-green-800 border-green-200',
        'rejected': 'bg-red-100 text-red-800 border-red-200'
      };
      return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
      const icons = {
        'submitted': Clock,
        'acknowledged': AlertCircle,
        'assigned': User,
        'in_progress': Activity,
        'resolved': CheckCircle,
        'rejected': X
      };
      const Icon = icons[status] || Clock;
      return <Icon className="w-4 h-4" />;
    };

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-saffron-600" />
                  Report Status Tracking
                </h2>
                <p className="text-gray-700 mt-1">Monitor your submitted reports</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-saffron-600">{filteredComplaints.length}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
            </div>
          </div>

          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No reports found</h3>
                  <p className="mt-2 text-gray-500">Try different search terms</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <motion.div
                    key={complaint._id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Indian Flag Border */}
                    <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-saffron-600" />
                            {complaint.title}
                          </h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">{complaint.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                            </span>
                            {complaint.location && complaint.location.coordinates && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Location Set
                              </span>
                            )}
                            <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                              {complaint.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${getStatusColor(complaint.status)}`}>
                            {getStatusIcon(complaint.status)}
                            {complaint.status}
                          </span>
                          {complaint.priority && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              complaint.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                              complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                              {complaint.priority === 'high' ? 'High Priority' :
                               complaint.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Images */}
                      {complaint.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={complaint.imageUrl}
                            alt="Report image"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button className="text-saffron-600 hover:text-saffron-700 text-sm flex items-center gap-2 font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="text-green-600 hover:text-green-700 text-sm flex items-center gap-2 font-medium">
                          <MessageSquare className="w-4 h-4" />
                          Add Comment
                        </button>
                      </div>
                    </div>

                    {/* Indian Flag Border */}
                    <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Indian Flag Border */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>
      </div>
    );
  };

  // Enhanced Leaderboard Section
  const LeaderboardSection = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
      fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);

        // Fetch leaderboard data from backend
        const response = await userService.getLeaderboard();

        if (response && Array.isArray(response.leaderboard)) {
          const processedData = response.leaderboard.map((item, index) => ({
            rank: index + 1,
            name: item.name || 'Anonymous User',
            points: item.points || 0,
            reports: item.totalReports || 0,
            resolved: item.resolvedReports || 0,
            location: item.location || 'Unknown',
            badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐',
            _id: item._id
          }));

          setLeaderboardData(processedData);

          // Find current user's rank
          if (user && user._id) {
            const currentUserIndex = processedData.findIndex(item => item._id === user._id);
            if (currentUserIndex !== -1) {
              setUserRank(currentUserIndex + 1);
            }
          }
        } else {
          console.log('No leaderboard data received, using fallback');
          // Fallback data if backend doesn't return proper structure
          setLeaderboardData([
            { rank: 1, name: 'Top Citizen', points: 150, reports: 5, resolved: 4, location: 'Delhi', badge: '🏆' },
            { rank: 2, name: user?.name || 'You', points: user?.points || 108, reports: complaints.length, resolved: complaints.filter(c => c.status === 'resolved').length, location: user?.location || 'Your City', badge: '🥈' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);

        // Fallback data on error
        setLeaderboardData([
          { rank: 1, name: user?.name || 'You', points: user?.points || 108, reports: complaints.length, resolved: complaints.filter(c => c.status === 'resolved').length, location: user?.location || 'Your City', badge: '🏆' }
        ]);

        toast.error('Failed to load leaderboard data');
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  Civic Champions Leaderboard
                </h2>
                <p className="text-gray-700 mt-1">Top contributors making India better</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{user?.points || 108}</div>
                <div className="text-sm text-gray-600">Your Points</div>
                {userRank && (
                  <div className="mt-2">
                    <div className="text-lg font-bold text-purple-600">#{userRank}</div>
                    <div className="text-xs text-gray-600">Your Rank</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            {loadingLeaderboard ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-medium text-gray-900">Loading Leaderboard...</h3>
                <p className="text-gray-500 mt-2">Fetching top contributors</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No leaderboard data</h3>
                <p className="mt-2 text-gray-500">Be the first to contribute and earn points!</p>
                <button
                  onClick={fetchLeaderboard}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-saffron-500 to-green-500 text-white rounded-lg hover:from-saffron-600 hover:to-green-600 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((leaderUser) => (
                  <motion.div
                    key={leaderUser.rank}
                    className={`relative flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-all ${
                      user && leaderUser._id === user._id ? 'border-saffron-300 bg-gradient-to-r from-saffron-50 to-green-50' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: leaderUser.rank * 0.1 }}
                  >
                    <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600 absolute top-0 left-0 right-0"></div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-saffron-100 to-green-100 rounded-full">
                        <span className="text-2xl">{leaderUser.badge}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Flag className="w-4 h-4 text-saffron-600" />
                          {leaderUser.name}
                          {user && leaderUser._id === user._id && (
                            <span className="text-xs bg-saffron-100 text-saffron-700 px-2 py-1 rounded-full font-medium">You</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{leaderUser.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <div className="text-lg font-bold text-saffron-600">{leaderUser.points}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{leaderUser.reports}</div>
                        <div className="text-xs text-gray-600">Reports</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{leaderUser.resolved}</div>
                        <div className="text-xs text-gray-600">Resolved</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Refresh Button */}
                <div className="text-center pt-4">
                  <button
                    onClick={fetchLeaderboard}
                    className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center gap-2 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Leaderboard
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>
      </div>
    );
  };

  // Enhanced Notifications Section
  const NotificationsSection = () => {
    const [markingRead, setMarkingRead] = useState({});

    const markAsRead = async (notificationId) => {
      setMarkingRead(prev => ({ ...prev, [notificationId]: true }));
      try {
        await notificationService.markAsRead(notificationId);
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      } catch (error) {
        toast.error('Failed to mark as read');
      } finally {
        setMarkingRead(prev => ({ ...prev, [notificationId]: false }));
      }
    };

    const getNotificationIcon = (type) => {
      const icons = {
        'status_update': CheckCircle,
        'assignment': User,
        'message': MessageSquare,
        'system': Bell
      };
      return icons[type] || Bell;
    };

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-red-600" />
                  Notifications
                </h2>
                <p className="text-gray-700 mt-1">Stay updated with your reports</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                  <p className="mt-2 text-gray-500">We'll notify you when there are updates</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <motion.div
                      key={notification._id}
                      className={`p-4 border border-gray-200 rounded-xl ${
                        notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      } hover:shadow-md transition-all overflow-hidden relative`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600 absolute top-0 left-0 right-0"></div>
                      <div className="flex items-start justify-between gap-4 mt-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.read ? 'bg-gray-100' : 'bg-blue-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              notification.read ? 'text-gray-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            } flex items-center gap-2`}>
                              <Flag className="w-4 h-4 text-saffron-600" />
                              {notification.title}
                            </h3>
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            } mt-1`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.createdAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            disabled={markingRead[notification._id]}
                            className="px-3 py-1 bg-gradient-to-r from-saffron-500 to-green-500 text-white text-xs rounded-full hover:from-saffron-600 hover:to-green-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            {markingRead[notification._id] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Mark Read
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>
      </div>
    );
  };

  // Enhanced Insights Section
  const InsightsSection = () => {
    const [analyticsData, setAnalyticsData] = useState({
      statusData: [],
      categoryData: [],
      monthlyTrends: [],
      totalStats: {
        totalReports: 0,
        resolvedReports: 0,
        resolutionRate: 0,
        avgResponseTime: '0 days',
        activeReports: 0
      }
    });
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
      fetchAnalyticsData();
    }, [complaints]);

    const fetchAnalyticsData = async () => {
      try {
        setLoadingAnalytics(true);

        console.log('Fetching analytics data...');
        console.log('Current complaints:', complaints);

        // Always ensure we have data to display, using complaints as primary source
        let statusData = [];
        let categoryData = [];
        let totalStats = {
          totalReports: complaints.length,
          resolvedReports: complaints.filter(c => c.status === 'resolved').length,
          resolutionRate: '0%',
          avgResponseTime: '2.3 days',
          activeReports: complaints.filter(c => c.status === 'in_progress').length
        };

        // Try to fetch from backend first
        try {
          const response = await reportService.getDashboardStats();
          console.log('Backend analytics response:', response);

          if (response && (response.success || response.data || response.statusCounts)) {
            const data = response.data || response;

            // Use backend data if available
            if (data.statusCounts) {
              statusData = [
                { name: 'Submitted', value: data.statusCounts.submitted || 0, color: '#3B82F6' },
                { name: 'Acknowledged', value: data.statusCounts.acknowledged || 0, color: '#8B5CF6' },
                { name: 'In Progress', value: data.statusCounts.in_progress || 0, color: '#F59E0B' },
                { name: 'Resolved', value: data.statusCounts.resolved || 0, color: '#10B981' },
                { name: 'Rejected', value: data.statusCounts.rejected || 0, color: '#EF4444' }
              ];
            }

            if (data.categoryCounts) {
              categoryData = [
                { name: 'Roads', value: data.categoryCounts.pothole || 0 },
                { name: 'Lighting', value: data.categoryCounts.streetlight || 0 },
                { name: 'Waste', value: data.categoryCounts.garbage || 0 },
                { name: 'Drainage', value: data.categoryCounts.drainage || 0 },
                { name: 'Traffic', value: data.categoryCounts.traffic || 0 },
                { name: 'Water', value: data.categoryCounts.water || 0 },
                { name: 'Electricity', value: data.categoryCounts.electricity || 0 },
                { name: 'Other', value: data.categoryCounts.other || 0 }
              ];
            }

            // Update total stats with backend data
            if (data.totalReports !== undefined) totalStats.totalReports = data.totalReports;
            if (data.resolvedReports !== undefined) totalStats.resolvedReports = data.resolvedReports;
            if (data.activeReports !== undefined) totalStats.activeReports = data.activeReports;
            if (data.avgResponseTime) totalStats.avgResponseTime = data.avgResponseTime;
          }
        } catch (backendError) {
          console.log('Backend analytics not available, using local data:', backendError);
        }

        // If backend didn't provide data OR we want to ensure we show something, use local complaints
        if (statusData.length === 0 && complaints.length > 0) {
          console.log('Using local complaints data for analytics');

          statusData = [
            { name: 'Submitted', value: complaints.filter(c => c.status === 'submitted').length, color: '#3B82F6' },
            { name: 'Acknowledged', value: complaints.filter(c => c.status === 'acknowledged').length, color: '#8B5CF6' },
            { name: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, color: '#F59E0B' },
            { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#10B981' },
            { name: 'Rejected', value: complaints.filter(c => c.status === 'rejected').length, color: '#EF4444' }
          ];
        }

        if (categoryData.length === 0 && complaints.length > 0) {
          categoryData = [
            { name: 'Roads', value: complaints.filter(c => c.category === 'pothole').length },
            { name: 'Lighting', value: complaints.filter(c => c.category === 'streetlight').length },
            { name: 'Waste', value: complaints.filter(c => c.category === 'garbage').length },
            { name: 'Drainage', value: complaints.filter(c => c.category === 'drainage').length },
            { name: 'Traffic', value: complaints.filter(c => c.category === 'traffic').length },
            { name: 'Water', value: complaints.filter(c => c.category === 'water').length },
            { name: 'Electricity', value: complaints.filter(c => c.category === 'electricity').length },
            { name: 'Other', value: complaints.filter(c => c.category === 'other').length }
          ];
        }

        // Filter out zero values for cleaner charts
        statusData = statusData.filter(item => item.value > 0);
        categoryData = categoryData.filter(item => item.value > 0);

        // Calculate resolution rate
        const resolutionRate = totalStats.totalReports > 0
          ? Math.round((totalStats.resolvedReports / totalStats.totalReports) * 100)
          : 0;
        totalStats.resolutionRate = `${resolutionRate}%`;

        console.log('Final analytics data:', {
          statusData,
          categoryData,
          totalStats
        });

        setAnalyticsData({
          statusData,
          categoryData,
          monthlyTrends: [], // Can be populated if backend provides this
          totalStats
        });

      } catch (error) {
        console.error('Error in fetchAnalyticsData:', error);

        // Final fallback - always show something if we have complaints
        if (complaints.length > 0) {
          const statusData = [
            { name: 'Submitted', value: complaints.filter(c => c.status === 'submitted').length, color: '#3B82F6' },
            { name: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, color: '#F59E0B' },
            { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#10B981' }
          ].filter(item => item.value > 0);

          const categoryData = [
            { name: 'Roads', value: complaints.filter(c => c.category === 'pothole').length },
            { name: 'Lighting', value: complaints.filter(c => c.category === 'streetlight').length },
            { name: 'Waste', value: complaints.filter(c => c.category === 'garbage').length },
            { name: 'Other', value: complaints.filter(c => !['pothole', 'streetlight', 'garbage'].includes(c.category)).length }
          ].filter(item => item.value > 0);

          const totalReports = complaints.length;
          const resolvedReports = complaints.filter(c => c.status === 'resolved').length;
          const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

          setAnalyticsData({
            statusData,
            categoryData,
            monthlyTrends: [],
            totalStats: {
              totalReports,
              resolvedReports,
              resolutionRate: `${resolutionRate}%`,
              avgResponseTime: '2.3 days',
              activeReports: complaints.filter(c => c.status === 'in_progress').length
            }
          });
        } else {
          // No complaints at all - show demo data for better UX
          console.log('No complaints found, showing demo analytics data');
          setAnalyticsData({
            statusData: [
              { name: 'Submitted', value: 2, color: '#3B82F6' },
              { name: 'In Progress', value: 1, color: '#F59E0B' }
            ],
            categoryData: [
              { name: 'Roads', value: 1 },
              { name: 'Lighting', value: 1 },
              { name: 'Waste', value: 1 }
            ],
            monthlyTrends: [],
            totalStats: {
              totalReports: 3,
              resolvedReports: 0,
              resolutionRate: '0%',
              avgResponseTime: '2.3 days',
              activeReports: 1
            }
          });
        }

        toast.error('Failed to load analytics from backend, using local data');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                  Report Analytics & Insights
                </h2>
                <p className="text-gray-700 mt-1">Track your civic engagement statistics</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {loadingAnalytics ? (
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    analyticsData.totalStats.totalReports
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        {/* Charts Grid */}
        {loadingAnalytics ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
            <div className="p-6">
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-medium text-gray-900">Loading Analytics...</h3>
                <p className="text-gray-500 mt-2">Fetching your report statistics</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          </div>
        ) : analyticsData.totalStats.totalReports === 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
            <div className="p-6">
              <div className="text-center py-16">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Analytics Data</h3>
                <p className="mt-2 text-gray-500">Submit your first report to see analytics</p>
                <button
                  onClick={fetchAnalyticsData}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-saffron-500 to-green-500 text-white rounded-lg hover:from-saffron-600 hover:to-green-600 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Status Distribution */}
              {(analyticsData.statusData.length > 0 || analyticsData.totalStats.totalReports > 0) && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-saffron-600" />
                      Report Status Distribution
                    </h3>
                    <div className="h-64">
                      {analyticsData.statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No status data available yet</p>
                            <p className="text-sm text-gray-400 mt-1">Submit reports to see status distribution</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                </div>
              )}

              {/* Category Distribution */}
              {(analyticsData.categoryData.length > 0 || analyticsData.totalStats.totalReports > 0) && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Reports by Category
                    </h3>
                    <div className="h-64">
                      {analyticsData.categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#F59E0B" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No category data available yet</p>
                            <p className="text-sm text-gray-400 mt-1">Submit reports to see category breakdown</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                </div>
              )}

              {/* Monthly Trends (if available) */}
              {analyticsData.monthlyTrends.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-2">
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Monthly Report Trends
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={3} />
                          <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'Resolution Rate',
                  value: analyticsData.totalStats.resolutionRate,
                  icon: Target,
                  color: 'text-green-600',
                  loading: loadingAnalytics
                },
                {
                  title: 'Active Reports',
                  value: analyticsData.totalStats.activeReports,
                  icon: Activity,
                  color: 'text-orange-600',
                  loading: loadingAnalytics
                },
                {
                  title: 'Avg Response Time',
                  value: analyticsData.totalStats.avgResponseTime,
                  icon: Clock,
                  color: 'text-blue-600',
                  loading: loadingAnalytics
                },
                {
                  title: 'Civic Points',
                  value: user?.points || 108,
                  icon: Star,
                  color: 'text-yellow-600',
                  loading: false // User points don't need analytics loading
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                  <div className="p-6 text-center">
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.loading ? (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Analytics Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchAnalyticsData}
            disabled={loadingAnalytics}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            {loadingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Profile Section
  const ProfileSection = () => {
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
      name: user?.name || 'John Doe',
      email: user?.email || 'citizen@civic.gov.in',
      phone: user?.phone || '+91 000-000-0000',
      bio: user?.bio || 'An active citizen contributing to Digital India',
      location: user?.location || 'New Delhi, India'
    });

    const handleSaveProfile = async () => {
      try {
        await userService.updateProfile(profileData);
        setUser(prev => ({ ...prev, ...profileData }));
        setEditMode(false);
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error('Failed to update profile');
      }
    };

    const achievements = [
      { title: 'First Report', description: 'Submitted your first civic report', icon: '🏅', earned: true },
      { title: 'Problem Solver', description: 'Helped resolve 5 community issues', icon: '🔧', earned: true },
      { title: 'Civic Champion', description: 'Earned 100+ civic engagement points', icon: '🏆', earned: true },
      { title: 'Community Leader', description: 'Top 10 contributor in your area', icon: '👑', earned: false }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="w-8 h-8 text-gray-600" />
                  Citizen Profile
                </h2>
                <p className="text-gray-700 mt-1">Manage your digital identity</p>
              </div>
              <button
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                className="px-6 py-2 bg-gradient-to-r from-saffron-500 to-green-500 text-white rounded-lg hover:from-saffron-600 hover:to-green-600 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-saffron-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.location}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {editMode ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
            </div>
          </div>

          {/* Stats and Achievements */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Your Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Civic Points</span>
                    <span className="font-bold text-saffron-600">{user?.points || 108}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reports</span>
                    <span className="font-bold text-blue-600">{complaints.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved Issues</span>
                    <span className="font-bold text-green-600">{complaints.filter(c => c.status === 'resolved').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community Rank</span>
                    <span className="font-bold text-purple-600">#42</span>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Achievements
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        achievement.earned
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            achievement.earned ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${
                            achievement.earned ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 flex">
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
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600 mb-4"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-saffron-600 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Digital India</h1>
                  <p className="text-xs text-gray-600">Citizen Portal</p>
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
            <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600 mt-4"></div>
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
                      ? 'bg-gradient-to-r from-saffron-500 to-green-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-saffron-50 hover:to-green-50 hover:text-gray-900'
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
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

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
                    <Flag className="w-8 h-8 text-saffron-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        Welcome, <span className="text-saffron-700">{user?.name || 'Citizen'}</span>
                      </p>
                      <p className="text-sm text-gray-600">Building a better India together</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Overview */}
              <div className="hidden lg:flex items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-saffron-400 to-saffron-600 mb-2"></div>
                    <div className="text-2xl font-bold text-saffron-600">{complaints.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Reports</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 mb-2"></div>
                    <div className="text-2xl font-bold text-green-600">
                      {complaints.filter(c => c.status === 'resolved').length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Resolved</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2"></div>
                    <div className="text-2xl font-bold text-yellow-600">{user?.points || 108}</div>
                    <div className="text-xs text-gray-600 font-medium">Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        </header>

        {/* Main Content Area */}
        {activeTab === 'interactive_map' ? (
          <InteractiveMapPage onBack={() => setActiveTab('submit')} />
        ) : activeTab === 'ai_chatbot' ? (
          <AIChatbotPage onBack={() => setActiveTab('submit')} />
        ) : (
          <main className="flex-1 p-6 bg-gradient-to-br from-saffron-50/30 via-white to-green-50/30 overflow-auto">
            {activeTab === 'submit' && <SubmitComplaintSection />}
            {activeTab === 'track' && <TrackStatusSection complaints={complaints} />}
            {activeTab === 'leaderboard' && <LeaderboardSection />}
            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'insights' && <InsightsSection />}
            {activeTab === 'profile' && <ProfileSection />}
          </main>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;