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

// ... other endpoints