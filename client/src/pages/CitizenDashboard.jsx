import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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
  ChevronDown
} from 'lucide-react';

// Import services and utilities
import { reportService, userService, notificationService } from '../services/reportService';
import { useTranslation } from '../utils/translations';

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

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  // Navigation items
  const sidebarItems = [
    { id: 'submit', label: t('submit_report'), icon: PlusCircle },
    { id: 'track', label: t('track_status'), icon: MapPin },
    { id: 'leaderboard', label: t('leaderboard'), icon: Trophy },
    { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadCount },
    { id: 'insights', label: t('insights'), icon: BarChart3 },
    { id: 'profile', label: t('profile'), icon: User }
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
        // Set fallback user data if API fails
        setUser({
          _id: 'fallback-user-123',
          name: 'John Doe',
          email: 'john.doe@civic.gov',
          phone: '+1 234-567-8900',
          location: 'New York, NY',
          bio: 'A concerned citizen actively participating in community development.',
          points: 150,
          badges: [],
          role: 'citizen'
        });
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
      toast.error(t('failed_to_load_data'));
      // Set default empty arrays on error
      setComplaints([]);
      setNotifications([]);
      setUnreadCount(0);
      // Ensure user object exists even on error
      if (!user) {
        setUser({
          name: 'Citizen User',
          email: 'citizen@civic.gov',
          points: 0
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
    navigate('/login');
    toast.success(t('logged_out_successfully'));
  };

  // Handle language change
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
    toast.success(t('language_changed'));
  };

  // Submit Complaint Section Component
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
    const [recordingAudio, setRecordingAudio] = useState(false);

    const categories = [
      { value: 'Pothole', label: t('pothole') },
      { value: 'Streetlight', label: t('streetlight') },
      { value: 'Waste', label: t('waste_management') },
      { value: 'Drainage', label: t('drainage') },
      { value: 'Other', label: t('other') }
    ];

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 1) {
        toast.error(t('single_image_only'));
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
        toast.error(t('geolocation_not_supported'));
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
          toast.success(t('location_captured'));
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error(t('location_failed'));
        }
      );
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        toast.error(t('fill_required_fields'));
        return;
      }

      try {
        setSubmitting(true);
        
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('location', formData.location || 'Not specified');
        submitData.append('priority', formData.priority);
        
        // Send longitude and latitude as separate fields as expected by backend
        if (formData.coordinates && formData.coordinates.latitude && formData.coordinates.longitude) {
          submitData.append('longitude', formData.coordinates.longitude);
          submitData.append('latitude', formData.coordinates.latitude);
        } else {
          // Default coordinates (Delhi coordinates) if no GPS location is provided
          submitData.append('longitude', '77.2090');
          submitData.append('latitude', '28.6139');
        }
        
        // Backend expects single 'image' field, so send only the first image
        if (formData.images && formData.images.length > 0) {
          submitData.append('image', formData.images[0]);
        }

        await reportService.createReport(submitData);
        
        toast.success(t('report_submitted_successfully'));
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
        setComplaints(updatedReports);
        
      } catch (error) {
        console.error('Submit error:', error);
        toast.error(t('report_submission_failed'));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('submit_new_report')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('report_title')} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('enter_report_title')}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')} *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">{t('select_category')}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('describe_issue_detail')}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('location')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('enter_location_or_use_gps')}
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  {t('gps')}
                </button>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('priority')}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('attach_images')} ({t('max_5_images')})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">{t('click_to_upload_images')}</span>
                </label>
              </div>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    {t('submit_report')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Track Status Section Component
  const TrackStatusSection = ({ complaints }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Debug: Log the complaints data
    console.log('TrackStatusSection complaints:', complaints);

    const filteredComplaints = complaints.filter(complaint => {
      const matchesSearch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
      const colors = {
        'Submitted': 'bg-blue-100 text-blue-800',
        'Acknowledged': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-orange-100 text-orange-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
      const icons = {
        'Submitted': Clock,
        'Acknowledged': AlertCircle,
        'In Progress': AlertCircle,
        'Resolved': CheckCircle,
        'Rejected': X
      };
      const Icon = icons[status] || Clock;
      return <Icon className="w-4 h-4" />;
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('track_reports')}</h2>
            <span className="text-sm text-gray-600">
              {filteredComplaints.length} {t('reports_found')}
            </span>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('search_reports')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('all_status')}</option>
                <option value="Submitted">{t('submitted')}</option>
                <option value="Acknowledged">{t('acknowledged')}</option>
                <option value="In Progress">{t('in_progress')}</option>
                <option value="Resolved">{t('resolved')}</option>
                <option value="Rejected">{t('rejected')}</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_reports_found')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('try_different_search')}</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <motion.div
                  key={complaint._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{complaint.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        {complaint.location && complaint.location.coordinates && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {`${complaint.location.coordinates[1].toFixed(4)}, ${complaint.location.coordinates[0].toFixed(4)}`}
                          </span>
                        )}
                        <span className="capitalize">{t(complaint.category?.toLowerCase())}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {t(complaint.status)}
                      </span>
                      {complaint.priority && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          complaint.priority === 'high' ? 'bg-red-100 text-red-700' :
                          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t(complaint.priority)} {t('priority')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  {complaint.imageUrl && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <img
                        src={complaint.imageUrl}
                        alt="Report image"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {t('view_details')}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Leaderboard Section Component
  const LeaderboardSection = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('monthly');

    useEffect(() => {
      loadLeaderboard();
    }, [timeframe]);

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Try to load from API first
        try {
          const data = await reportService.getLeaderboard();
          console.log('Leaderboard data received:', data);
          setLeaderboardData(Array.isArray(data) ? data : []);
        } catch (apiError) {
          console.log('API not available, using mock data');
          
          // Fallback to mock data when API is not available
          const mockData = [
            { _id: '1', name: 'Rajesh Kumar', totalReports: 15, resolvedReports: 12, points: 250 },
            { _id: '2', name: 'Priya Singh', totalReports: 12, resolvedReports: 10, points: 200 },
            { _id: '3', name: 'Amit Patel', totalReports: 10, resolvedReports: 8, points: 180 },
            { _id: '4', name: 'Sneha Sharma', totalReports: 8, resolvedReports: 6, points: 150 },
            { _id: '5', name: 'Vikram Joshi', totalReports: 6, resolvedReports: 4, points: 120 },
            { _id: '6', name: 'Meera Reddy', totalReports: 5, resolvedReports: 3, points: 100 },
            { _id: '7', name: 'Arjun Gupta', totalReports: 4, resolvedReports: 2, points: 80 },
            { _id: '8', name: 'Kavya Nair', totalReports: 3, resolvedReports: 1, points: 60 }
          ];
          setLeaderboardData(mockData);
        }
        
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        toast.error(t('failed_to_load_leaderboard') || 'Failed to load leaderboard');
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    const getRankIcon = (rank) => {
      if (rank === 1) return <span className="text-yellow-500 text-lg">🏆</span>;
      if (rank === 2) return <span className="text-gray-400 text-lg">🥈</span>;
      if (rank === 3) return <span className="text-amber-600 text-lg">🥉</span>;
      return <span className="text-gray-600 font-bold">#{rank}</span>;
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('leaderboard')}</h2>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
              <option value="yearly">{t('yearly')}</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_data_available')}</h3>
                </div>
              ) : (
                leaderboardData.map((user, index) => (
                  <motion.div
                    key={user._id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">
                          {user.totalReports || user.reportsCount || 0} {t('reports_submitted')} • {user.resolvedReports || 0} {t('resolved')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-lg text-gray-900">{user.points}</span>
                      </div>
                      <div className="text-sm text-gray-600">{t('points')}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Notifications Section Component
  const NotificationsSection = ({ notifications, setNotifications }) => {
    const markAsRead = async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId);
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    };

    const markAllAsRead = async () => {
      try {
        await notificationService.markAllAsRead();
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('notifications')}</h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {t('mark_all_read')}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_notifications')}</h3>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Profile Section Component
  const ProfileSection = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });

    // Update profileData when user changes
    useEffect(() => {
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || ''
      });
    }, [user]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        console.log('Updating profile with data:', profileData);
        const response = await userService.updateProfile(profileData);
        console.log('Profile update response:', response);
        if (response.success) {
          // Update the user state in parent component
          setUser(response.user);
          setIsEditing(false);
          toast.success(t('profile_updated_successfully'));
        } else {
          toast.error(response.msg || t('profile_update_failed'));
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error(error.msg || t('profile_update_failed'));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('profile')}</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              {isEditing ? t('cancel') : t('edit_profile')}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('full_name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bio')}
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('tell_us_about_yourself')}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? t('saving') : t('save_changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('full_name')}
                  </label>
                  <p className="text-gray-900">{user?.name || t('not_provided')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email')}
                  </label>
                  <p className="text-gray-900">{user?.email || t('not_provided')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')}
                  </label>
                  <p className="text-gray-900">{user?.phone || t('not_provided')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location')}
                  </label>
                  <p className="text-gray-900">{user?.location || t('not_provided')}</p>
                </div>
              </div>
              {user?.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bio')}
                  </label>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
              
              {/* Statistics */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{complaints.length}</p>
                    <p className="text-sm text-gray-600">{t('reports_submitted')}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {complaints.filter(c => c.status === 'resolved').length}
                    </p>
                    <p className="text-sm text-gray-600">{t('reports_resolved')}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{user?.points || 0}</p>
                    <p className="text-sm text-gray-600">{t('points_earned')}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{user?.badges?.length || 0}</p>
                    <p className="text-sm text-gray-600">{t('badges_earned')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Insights Section Component
  const InsightsSection = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
      generateChartData();
    }, [complaints]);

    const generateChartData = () => {
      const submittedCount = complaints.length;
      const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
      const pendingCount = submittedCount - resolvedCount;

      const data = [
        { name: 'Submitted', value: submittedCount, color: '#3B82F6' },
        { name: 'Resolved', value: resolvedCount, color: '#10B981' },
        { name: 'Pending', value: pendingCount, color: '#F59E0B' }
      ];

      setChartData(data);
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('insights')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
              <div className="text-sm text-blue-800">Total Reports</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'Resolved').length}
              </div>
              <div className="text-sm text-green-800">Resolved</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status !== 'Resolved').length}
              </div>
              <div className="text-sm text-yellow-800">Pending</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{user?.points || 0}</div>
              <div className="text-sm text-purple-800">Credit Points</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_dashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">{t('civic_dashboard')}</h1>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Citizen'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'citizen@civic.gov'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false); // Close mobile sidebar after click
                  }}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${
                      activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none rounded-full ${
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

          {/* Sidebar Footer */}
          <div className="px-3 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header with Homepage Theme */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 text-white shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-6">
                  {/* Clean Title and Welcome Message */}
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {t('citizen_dashboard')}
                    </h1>
                    <p className="text-blue-100">
                      {t('welcome_back')}, <span className="font-semibold text-white">{user?.name || 'Citizen'}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stats Overview - Improved Layout */}
              <div className="hidden lg:flex items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{complaints.length}</div>
                    <div className="text-xs text-blue-200 uppercase tracking-wide font-medium">{t('reports')}</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">
                      {complaints.filter(c => c.status === 'resolved').length}
                    </div>
                    <div className="text-xs text-blue-200 uppercase tracking-wide font-medium">{t('resolved')}</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{user?.points || 0}</div>
                    <div className="text-xs text-blue-200 uppercase tracking-wide font-medium">{t('points')}</div>
                  </div>
                </div>
                
                {/* Language Selector */}
                <div className="relative ml-6">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {languages.find(lang => lang.code === currentLanguage)?.flag}
                      <span className="ml-2">
                        {languages.find(lang => lang.code === currentLanguage)?.name}
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border overflow-hidden">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                            currentLanguage === language.code ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Stats and Language - Compact Version */}
              <div className="lg:hidden flex items-center gap-4">
                {/* Mobile Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-white">{complaints.length}</div>
                    <div className="text-xs text-blue-200">{t('reports')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-300">{complaints.filter(c => c.status === 'resolved').length}</div>
                    <div className="text-xs text-blue-200">{t('resolved')}</div>
                  </div>
                </div>
                
                {/* Mobile Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">
                      {languages.find(lang => lang.code === currentLanguage)?.flag}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                            currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Wave */}
          <div className="relative">
            <svg
              className="absolute bottom-0 left-0 w-full h-4 text-gray-50"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,0V46.29C47.79,22.84,103.59,32.58,158.208,36.29C267.26,43.87,378.78,29.1,493.29,36.29C651.29,45.87,818.79,29.1,985.29,36.29C1051.79,39.87,1115.26,43.87,1200,46.29V0Z"
                className="fill-current"
              ></path>
            </svg>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          {activeTab === 'submit' && <SubmitComplaintSection />}
          {activeTab === 'track' && <TrackStatusSection complaints={complaints} />}
          {activeTab === 'leaderboard' && <LeaderboardSection />}
          {activeTab === 'notifications' && <NotificationsSection notifications={notifications} setNotifications={setNotifications} />}
          {activeTab === 'insights' && <InsightsSection />}
          {activeTab === 'profile' && <ProfileSection user={user} />}
        </main>
      </div>
    </div>
  );
};

export default CitizenDashboard;
