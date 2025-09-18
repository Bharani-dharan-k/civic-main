import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  // Try both token names for backward compatibility
  const token = localStorage.getItem('citizenToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Report Service
export const reportService = {
  // Create a new report
  createReport: async (formData) => {
    try {
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Submit a simple report (for chatbot)
  submitReport: async (reportData) => {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('category', reportData.category);
      formData.append('address', reportData.address);
      formData.append('longitude', reportData.location?.coordinates?.[0] || 0);
      formData.append('latitude', reportData.location?.coordinates?.[1] || 0);
      
      // Add image if provided
      if (reportData.imageUrl && reportData.imageUrl.startsWith('data:')) {
        // Convert base64 to blob if needed
        const response = await fetch(reportData.imageUrl);
        const blob = await response.blob();
        formData.append('image', blob, 'report-image.png');
      }
      
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all reports
  getAllReports: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/reports${queryParams ? `?${queryParams}` : ''}`);
      // Return the reports array from the server response
      return response.data.reports || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get reports by user
  getUserReports: async () => {
    try {
      const response = await api.get('/reports/user/my-reports');
      return response.data?.reports || response.data || [];
    } catch (error) {
      console.error('getUserReports error:', error);
      return [];
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update report status (admin only)
  updateReportStatus: async (id, status) => {
    try {
      const response = await api.put(`/reports/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add upvote to report
  upvoteReport: async (id) => {
    try {
      const response = await api.post(`/reports/${id}/upvote`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment to report
  addComment: async (id, comment) => {
    try {
      const response = await api.post(`/reports/${id}/comments`, { comment });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get leaderboard data
  getLeaderboard: async () => {
    try {
      const response = await api.get('/reports/leaderboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/reports/dashboardstats');
      return response.data;
    } catch (error) {
      console.error('getDashboardStats error:', error);
      throw error.response?.data || error;
    }
  },

  // Check for duplicate reports near location
  checkDuplicateReports: async (latitude, longitude, radius = 20) => {
    try {
      const response = await api.get('/reports/check-duplicates', {
        params: {
          latitude,
          longitude,
          radius
        }
      });
      return response.data;
    } catch (error) {
      console.error('checkDuplicateReports error:', error);

      // If endpoint doesn't exist (404) or other server errors, return no duplicates
      if (error.response?.status === 404 || error.response?.status >= 500) {
        console.warn('Duplicate check endpoint not available, returning no duplicates');
        return {
          hasDuplicates: false,
          reports: [],
          message: 'Duplicate check service unavailable'
        };
      }

      throw error.response?.data || error;
    }
  },
};

// User Service
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      // Fallback to localStorage if backend is not available
      const storedProfile = localStorage.getItem('mockUserProfile');
      if (storedProfile) {
        const user = JSON.parse(storedProfile);
        return { success: true, user };
      }
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      // Fallback for when backend is not available
      console.log('Backend not available, using local fallback for profile update');
      
      // Simulate successful update
      const updatedUser = {
        _id: 'fallback-user-123',
        name: profileData.name || 'John Doe',
        email: profileData.email || 'john.doe@civic.gov',
        phone: profileData.phone || '+1 234-567-8900',
        location: profileData.location || 'New York, NY',
        bio: profileData.bio || 'A concerned citizen actively participating in community development.',
        points: 150,
        badges: [],
        role: 'citizen'
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('mockUserProfile', JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser
      };
    }
  },

  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await api.get('/auth/leaderboard');
      console.log('Leaderboard API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Leaderboard API error:', error);
      throw error.response?.data || error;
    }
  },
};

// Notification Service
export const notificationService = {
  // Get user notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/auth/notifications');
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/auth/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/auth/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response?.data || error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/auth/notifications');
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
};

export default api;
