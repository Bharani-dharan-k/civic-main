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

// User Service
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error;
    }
  },

  // Get user stats/dashboard data
  getDashboardStats: async () => {
    try {
      const response = await api.get('/auth/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      // Return fallback stats
      return {
        success: true,
        stats: {
          totalReports: 0,
          resolvedReports: 0,
          pendingReports: 0,
          points: 0,
          badges: []
        }
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error;
    }
  },

  // Get leaderboard data
  getLeaderboard: async () => {
    try {
      const response = await api.get('/auth/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error.response?.data || error;
    }
  }
};

// Notification Service
export const notificationService = {
  // Get user notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data?.notifications || response.data || [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error.response?.data || error;
    }
  }
};

export default userService;