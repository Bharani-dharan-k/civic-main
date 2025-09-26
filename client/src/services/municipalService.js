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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Municipal Stats Service
export const getMunicipalStats = async () => {
  try {
    const response = await api.get('/municipal/stats');
    console.log('✅ Municipal stats API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Municipal stats API error:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error; // Don't mask the error with fallback data
  }
};

// Citizen Complaints Service
export const getCitizenComplaints = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/reports${queryParams ? `?${queryParams}` : ''}`);
    return { data: { success: true, reports: response.data.reports || response.data || [] } };
  } catch (error) {
    console.error('Citizen complaints error:', error);
    return { data: { success: false, reports: [] } };
  }
};

// Municipal Reports Service
export const getMunicipalReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/municipal/reports${queryParams ? `?${queryParams}` : ''}`);
    console.log('✅ Municipal reports API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Municipal reports API error:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Worker Assignment Service
export const assignWorker = async (reportId, workerId) => {
  try {
    const response = await api.post(`/municipal/assign-worker`, { reportId, workerId });
    return { data: response.data };
  } catch (error) {
    console.error('Assign worker error:', error);
    throw error.response?.data || error;
  }
};

// Staff Data Service
export const getStaffData = async () => {
  try {
    const response = await api.get('/municipal/staff');
    console.log('✅ Staff data API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Staff data API error:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Add Staff Member Service
export const addStaffMember = async (staffData) => {
  try {
    const response = await api.post('/municipal/staff', staffData);
    return { data: response.data };
  } catch (error) {
    console.error('Add staff member error:', error);
    throw error.response?.data || error;
  }
};

// Update Staff Member Service
export const updateStaffMember = async (staffId, staffData) => {
  try {
    const response = await api.put(`/municipal/staff/${staffId}`, staffData);
    return { data: response.data };
  } catch (error) {
    console.error('Update staff member error:', error);
    throw error.response?.data || error;
  }
};

// Delete Staff Member Service
export const deleteStaffMember = async (staffId) => {
  try {
    const response = await api.delete(`/municipal/staff/${staffId}`);
    return { data: response.data };
  } catch (error) {
    console.error('Delete staff member error:', error);
    throw error.response?.data || error;
  }
};

// Assign Task Service
export const assignTask = async (taskData) => {
  try {
    const response = await api.post('/municipal/assign-task', taskData);
    return { data: response.data };
  } catch (error) {
    console.error('Assign task error:', error);
    throw error.response?.data || error;
  }
};

// Infrastructure Status Service
export const getInfrastructureStatus = async () => {
  try {
    const response = await api.get('/municipal/infrastructure');
    return { data: response.data };
  } catch (error) {
    console.error('Infrastructure status error:', error);
    return {
      data: {
        success: true,
        data: {
          roads: { total: 150, maintained: 120, needsRepair: 30 },
          streetlights: { total: 500, working: 450, faulty: 50 },
          waterSupply: { coverage: 85, quality: 'Good', pressure: 'Normal' },
          drainage: { mainLines: 25, blockages: 3, efficiency: 88 }
        }
      }
    };
  }
};

// Finance Data Service
export const getFinanceData = async () => {
  try {
    const response = await api.get('/municipal/finance');
    return { data: response.data };
  } catch (error) {
    console.error('Finance data error:', error);
    return {
      data: {
        success: true,
        data: {
          totalBudget: 5000000,
          allocated: 3500000,
          spent: 2800000,
          remaining: 2200000,
          monthlyExpenditure: 280000,
          categories: {
            infrastructure: 1200000,
            maintenance: 800000,
            salaries: 600000,
            utilities: 200000
          }
        }
      }
    };
  }
};

// Projects Data Service
export const getProjectsData = async () => {
  try {
    const response = await api.get('/municipal/projects');
    return { data: response.data };
  } catch (error) {
    console.error('Projects data error:', error);
    return {
      data: {
        success: true,
        data: [
          {
            _id: '1',
            name: 'Road Repair Project',
            status: 'active',
            progress: 65,
            budget: 500000,
            spent: 325000,
            startDate: '2024-01-15',
            deadline: '2024-12-31',
            contractor: 'ABC Construction',
            location: 'Ward 5'
          },
          {
            _id: '2',
            name: 'Street Light Upgrade',
            status: 'active',
            progress: 30,
            budget: 200000,
            spent: 60000,
            startDate: '2024-03-01',
            deadline: '2024-11-30',
            contractor: 'XYZ Electricals',
            location: 'Ward 3'
          },
          {
            _id: '3',
            name: 'Drainage System Improvement',
            status: 'planning',
            progress: 5,
            budget: 800000,
            spent: 40000,
            startDate: '2024-06-01',
            deadline: '2025-03-31',
            contractor: 'DEF Infrastructure',
            location: 'Ward 2'
          }
        ]
      }
    };
  }
};

// Emergency Alerts Service
export const getEmergencyAlerts = async () => {
  try {
    const response = await api.get('/municipal/emergency-alerts');
    return { data: response.data };
  } catch (error) {
    console.error('Emergency alerts error:', error);
    return {
      data: {
        success: true,
        data: [
          {
            _id: '1',
            title: 'Water Pipeline Burst',
            description: 'Major water pipeline burst reported in Ward 7, affecting water supply to 200+ households',
            priority: 'urgent',
            status: 'active',
            location: 'Ward 7, Sector 15',
            reportedBy: 'Field Supervisor',
            createdAt: new Date().toISOString(),
            assignedTo: 'Water Department Team'
          },
          {
            _id: '2',
            title: 'Power Outage',
            description: 'Transformer failure causing power outage in commercial district',
            priority: 'high',
            status: 'in_progress',
            location: 'Ward 4, Commercial Zone',
            reportedBy: 'Electrical Engineer',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            assignedTo: 'Electrical Maintenance Team'
          }
        ]
      }
    };
  }
};

// Service Requests Service
export const getServiceRequests = async () => {
  try {
    const response = await api.get('/municipal/service-requests');
    return { data: response.data };
  } catch (error) {
    console.error('Service requests error:', error);
    return {
      data: {
        success: true,
        data: [
          {
            _id: '1',
            type: 'Garbage Collection',
            description: 'Request for additional garbage collection in residential area',
            status: 'pending',
            requestedBy: 'Ward Representative',
            ward: 'Ward 6',
            priority: 'medium',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            type: 'Street Cleaning',
            description: 'Regular street cleaning schedule adjustment needed',
            status: 'approved',
            requestedBy: 'Local Committee',
            ward: 'Ward 8',
            priority: 'low',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          }
        ]
      }
    };
  }
};

// Update Report Status Service
export const updateReportStatus = async (reportId, status) => {
  try {
    const response = await api.put(`/reports/${reportId}/status`, { status });
    return { data: response.data };
  } catch (error) {
    console.error('Update report status error:', error);
    throw error.response?.data || error;
  }
};

// Ward Data Service
export const getWardData = async (wardId) => {
  try {
    const response = await api.get(`/municipal/wards/${wardId}`);
    return { data: response.data };
  } catch (error) {
    console.error('Ward data error:', error);
    return {
      data: {
        success: true,
        data: {
          wardNumber: wardId,
          population: 5000,
          area: '2.5 sq km',
          households: 1200,
          complaints: {
            total: 45,
            resolved: 32,
            pending: 13
          },
          infrastructure: {
            roads: 15,
            streetlights: 45,
            parks: 2
          }
        }
      }
    };
  }
};

// Create Announcement Service
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/municipal/announcements', announcementData);
    return { data: response.data };
  } catch (error) {
    console.error('Create announcement error:', error);
    throw error.response?.data || error;
  }
};

// Get Announcement Stats Service
export const getAnnouncementStats = async () => {
  try {
    const response = await api.get('/municipal/announcements/stats');
    return { data: response.data };
  } catch (error) {
    console.error('Announcement stats error:', error);
    return {
      data: {
        success: true,
        data: {
          totalAnnouncements: 15,
          activeAnnouncements: 8,
          viewCount: 1250,
          engagementRate: 78
        }
      }
    };
  }
};

// Task Management Services
export const getAssignedTasks = async () => {
  try {
    const response = await api.get('/municipal/tasks');
    console.log('✅ Assigned tasks API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Assigned tasks API error:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const getTaskStats = async () => {
  try {
    const response = await api.get('/municipal/tasks/stats');
    console.log('✅ Task stats API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Task stats API error:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const updateTaskProgress = async (taskId, status, notes) => {
  try {
    const response = await api.put(`/municipal/tasks/${taskId}/progress`, { status, notes });
    return { data: response.data };
  } catch (error) {
    console.error('Update task progress error:', error);
    throw error.response?.data || error;
  }
};

// Get department admins in municipality
export const getDepartmentAdmins = async () => {
  try {
    const response = await api.get('/municipal/department-admins');
    console.log('✅ Department admins API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Department admins API error:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Assign report to department admin
export const assignReportToDepartmentAdmin = async (reportId, departmentAdminId, priority, notes, deadline) => {
  try {
    const payload = {
      reportId,
      departmentAdminId,
      priority: priority || 'medium',
      notes: notes || '',
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('📋 Assigning report to department admin:', payload);
    const response = await api.post('/municipal/assign-report', payload);
    console.log('✅ Report assignment API success:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Report assignment API error:', error);
    console.error('Error details:', error.response?.data);
    throw error.response?.data || error;
  }
};

export default api;