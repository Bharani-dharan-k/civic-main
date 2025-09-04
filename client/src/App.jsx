import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import SevaNavbar from './components/Layout/SevaNavbar';
import SevaFooter from './components/Layout/SevaFooter';
import Homepage from './pages/Homepage';
import IndiaFlagHomepage from './pages/IndiaFlagHomepage';
import EnglishCitizenPortal from './pages/EnglishCitizenPortal';
import EnglishLogin from './pages/EnglishLogin';
import UnifiedLogin from './pages/UnifiedLogin';
import NewWardOfficerDashboard from './pages/NewWardOfficerDashboard';
import CitizenDashboard from './pages/CitizenDashboard.jsx';

// Admin Components
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageIssues from './pages/Admin/ManageIssues';
import DepartmentsManagement from './pages/Admin/DepartmentsManagement';
import Analytics from './pages/Admin/Analytics';
import Settings from './pages/Admin/Settings';
import ReportsManagement from './pages/Admin/ReportsManagement';
import WorkerDashboard from './pages/WorkerDashboard';
import FieldStaffDashboard from './pages/FieldStaffDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <main className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<IndiaFlagHomepage />} />
            <Route path="/citizen-portal" element={<EnglishCitizenPortal />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/old-login" element={<EnglishLogin />} />
            
            {/* Citizen Dashboard Route */}
            <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
            
            {/* Protected Routes */}
            <Route 
              path="/ward-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['ward_officer']}>
                  <NewWardOfficerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/department-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['department_officer']}>
                  <NewWardOfficerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/field-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['field_staff']}>
                  <NewWardOfficerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <NewWardOfficerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Worker Routes */}
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/field-staff-dashboard" element={<FieldStaffDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="reports" element={<ReportsManagement />} />
              <Route path="issues" element={<ManageIssues />} />
              <Route path="departments" element={<DepartmentsManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
                  <p className="text-gray-600 mt-2">You don't have permission to access this page</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;