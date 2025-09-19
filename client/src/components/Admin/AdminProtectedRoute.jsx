import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('token');
  
  let adminUser = null;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      adminUser = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing admin user data:', error);
  }
  
  console.log('AdminProtectedRoute check:', { 
    adminToken: !!adminToken, 
    userRole: adminUser?.role,
    requiredRole,
    location: location.pathname 
  });
  
  // Check if admin is authenticated
  if (!adminToken) {
    console.log('No admin token, redirecting to /admin/login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && adminUser?.role !== requiredRole) {
    // For now, allow all admin roles to access dashboard
    // You can implement more granular role restrictions later
    console.log(`Role check: User has ${adminUser?.role}, required ${requiredRole}`);
    
    // Uncomment below to enforce strict role-based access:
    // return <Navigate to="/admin/unauthorized" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
