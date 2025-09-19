import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add a request interceptor to include the token in headers
API.interceptors.request.use((req) => {
    // Check multiple possible token keys
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('citizenToken') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('workerToken');
    
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Adding token to request:', token.substring(0, 20) + '...');
    } else {
        console.log('❌ No token found in localStorage');
    }
    return req;
});

// Admin endpoints
export const getDashboardStats = () => API.get('/admin/stats');
export const getLeaderboard = () => API.get('/admin/leaderboard');
export const assignWorker = (reportId, workerId) => API.put(`/admin/reports/${reportId}/assign`, { workerId });
export const getAdminReports = (params) => API.get('/admin/reports', { params });
export const updateReportStatus = (reportId, status, notes) => API.put(`/admin/reports/${reportId}/status`, { status, notes });
export const getAnalytics = () => API.get('/admin/analytics');

// Report endpoints
export const getAllReports = () => API.get('/reports');

// Worker endpoints
export const loginWorker = (email, password) => API.post('/auth/worker/login', { email, password });
export const getWorkerTasks = () => API.get('/worker/tasks');
export const getTaskDetails = (taskId) => API.get(`/worker/tasks/${taskId}`);
export const updateTaskStatus = (taskId, status, notes, location) => API.put(`/worker/tasks/${taskId}/status`, { status, notes, location });
export const uploadTaskPhotos = (taskId, formData) => API.post(`/worker/tasks/${taskId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getWorkerStats = () => API.get('/worker/stats');

// Municipal Dashboard endpoints
export const getMunicipalStats = () => API.get('/admin/stats');
export const getMunicipalReports = (params) => API.get('/admin/reports', { params });
export const getCitizenComplaints = (params) => API.get('/reports', { params });
export const getServiceRequests = (params) => API.get('/admin/service-requests', { params });
export const getStaffData = () => API.get('/admin/staff');
export const getInfrastructureStatus = () => API.get('/admin/infrastructure');
export const getFinanceData = () => API.get('/admin/finance');
export const getProjectsData = () => API.get('/admin/projects');
export const getEmergencyAlerts = () => API.get('/admin/emergency-alerts');
export const getDepartments = () => API.get('/departments');
export const getDepartmentStats = (id) => API.get(`/departments/${id}/stats`);
export const getNotifications = () => API.get('/admin/notifications');

// Municipal CRUD operations
export const createServiceRequest = (data) => API.post('/admin/service-requests', data);
export const updateServiceRequest = (id, data) => API.put(`/admin/service-requests/${id}`, data);
export const deleteServiceRequest = (id) => API.delete(`/admin/service-requests/${id}`);

// Staff Management operations
export const addStaffMember = (data) => API.post('/admin/staff', data);
export const updateStaffMember = (id, data) => API.put(`/admin/staff/${id}`, data);
export const deleteStaffMember = (id) => API.delete(`/admin/staff/${id}`);

// Task Management operations
export const assignTask = (data) => API.post('/admin/tasks', data);
export const getTasks = (params) => API.get('/admin/tasks', { params });

// Project Management operations
export const createProject = (data) => API.post('/admin/projects', data);
export const updateProject = (id, data) => API.put(`/admin/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/admin/projects/${id}`);
export const createEmergencyAlert = (data) => API.post('/admin/emergency-alerts', data);
export const updateEmergencyAlert = (id, data) => API.put(`/admin/emergency-alerts/${id}`, data);
export const deleteEmergencyAlert = (id) => API.delete(`/admin/emergency-alerts/${id}`);

// Communication endpoints
export const sendAnnouncement = (data) => API.post('/admin/announcements', data);
export const getFeedback = () => API.get('/admin/feedback');
export const createSurvey = (data) => API.post('/admin/surveys', data);
export const getSurveys = () => API.get('/admin/surveys');

// Default export for the API instance
export default API;