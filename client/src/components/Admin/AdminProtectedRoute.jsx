import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('AdminProtectedRoute check:', { adminToken: !!adminToken, location: location.pathname });
  
  if (!adminToken) {
    console.log('No admin token, redirecting to /admin/login');
    // Redirect to admin login page, saving the attempted location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
